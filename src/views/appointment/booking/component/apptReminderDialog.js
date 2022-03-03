import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    Grid,
    FormControl,
    Tabs,
    Tab,
    Typography,
    Paper
} from '@material-ui/core';
import _ from 'lodash';
import memoioze from 'memoize-one';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CommomTableToolsBar from '../../../compontent/commonTableToolsBar';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { PageStatus } from '../../../../enums/appointment/booking/bookingEnum';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import * as AppointmentUtil from '../../../../utilities/appointmentUtilities';
import * as ApptReminderConstants from '../../../../constants/appointment/appointmentReminder/appointmentReminderConstants';

const sysRatio = CommonUtil.getSystemRatio();
const unit = CommonUtil.getResizeUnit(sysRatio);


const styles = makeStyles(theme => ({
    tabContainer: {
        // width: '100%',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        padding: '8px 0px 0px'
    },
    tabActive: {
        color: theme.palette.white,
        backgroundColor: theme.palette.primary.main
    },
    tab: {
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        borderRight: `1px solid ${theme.palette.grey[300]}`,
        borderLeft: `1px solid ${theme.palette.grey[300]}`

    },
    dialog: {
        width: 1585
    },
    formRoot: {
        width: '100%'
    },
    form_input: {
        width: '100%',
        padding: '8px 0px'
    },
    formLabel: {
        padding: '0px 4px',
        zIndex: 1,
        fontSize: 12,
        transform: 'translate(14px, -6px) scale(1)',
        left: -2
        // background-color: white;
    },
    paperRoot: {
        backgroundColor: theme.palette.dialogBackground,
        padding: 4,
        width: '100%'
    },
    tableContainer: {
        padding: 2
    },
    buttonRoot: {
        margin: 2,
        padding: 0,
        height: 35 * unit
    },
    customTableHeadRow: {
        fontWeight: 400,
        height: 40 * unit
    },
    customTableBodyCell: {
        fontSize: '14px',
        padding: '0px 5px'
    },
    customDialogContent: {
        padding: 8
    }
}));

const ApptReminderDialog = React.forwardRef((props, ref) => {
    const classes = styles();
    const { open, id } = props;
    return (
        <Grid>
            <CIMSPromptDialog
                id={id}
                open={open}
                dialogTitle={'Appointment Reminder'}
                dialogContentText={
                    dialogContent(props, classes)
                }
                classes={{
                    paper: classes.dialog
                }}
                contentRoot={classes.customDialogContent}
                draggable
            />
        </Grid>
    );
});

const onReminderSelect = (reminderRec, props) => {
    if (reminderRec && !reminderRec.remark) {
        reminderRec.remark = '';
    }
    props.updateReminder(reminderRec || null);
};

const handleSendApptInfo = (e, rowData, props) => {
    e.stopPropagation();
    e.preventDefault();
    const { tabValue, reminderType } = props;
    let sendType = 'SMS';
    if (reminderType.length === 2) {
        sendType = tabValue === 0 ? 'SMS' : 'email';
    }
    else {
        if (reminderType === Enum.CONTACT_MEAN_SMS) {
            sendType = 'SMS';
        }
        if (reminderType === Enum.CONTACT_MEAN_EMAIL) {
            sendType = 'email';
        }
    }

    props.openCommonMessage({
        msgCode: '111227',
        params: [
            {
                name: 'TYPE',
                value: sendType
            }
        ],
        btnActions: {
            btn1Click: () => {
                props.sendReminderInfo(rowData);
            }
        }
    });
};

const getTableRows = (props, commMeansCd) => {
    let result = [
        {
            minWidth: 60,
            cellRenderer: 'orderNumberRender',
            colId: 'index'
        },
        {
            headerName: 'Date To Be Sent',
            field: 'schDtm',
            colId: 'schDtm',
            valueFormatter: params => {
                return moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE);
            },
            minWidth: 170
        },
        {
            headerName: 'Content',
            field: 'msg',
            colId: 'msg',
            minWidth: 200,
            tooltipField: 'msg'
            // tooltip: params => params.value
        },
        {
            headerName: 'Notes',
            field: 'remark',
            colId: 'remark',
            minWidth: 150,
            tooltipField: 'remark'
        },
        {
            headerName: 'Sent Date / Time',
            field: 'sentDtm',
            colId: 'sentDtm',
            minWidth: 170
        },
        {
            headerName: 'Ad-Hoc',
            field: 'action',
            colId: 'action',
            cellRenderer: 'customAction',
            cellRendererParams: {
                tabValue: props.tabValue,
                reminderType: props.reminderType,
                openCommonMessage: props.openCommonMessage,
                sendReminderInfo: props.sendReminderInfo,
                isPastAppt: props.isPastAppt,
                curPageStatus: props.curPageStatus
            },
            minWidth: 125
        }
    ];

    if (commMeansCd === Enum.CONTACT_MEAN_SMS) {
        result.push({
            headerName: 'Status',
            //field: 'rslt',
            colId: 'status',
            valueGetter: params => {
                const {rslt, status} = params.data;
                if(rslt && status !== 'P'){
                    const rsltList = ApptReminderConstants.reminderResultCd;
                    let rsltDesc = rsltList.find(item => item.value === rslt);
                    if (rsltDesc) {
                        return rsltDesc.name;
                    }
                }else if(status){
                    const statusList = ApptReminderConstants.status;
                    let statusDetail = statusList.find(item => item.value === status);
                    if (statusDetail) {
                        return statusDetail.name;
                    }
                }
                return '';
            },
            minWidth: 100
        });
    }
    return result;
};

const getValidators = () => {
    let validators = [];
    validators.push(ValidatorEnum.required);
    return validators;
};

const getErrorMessage = () => {
    let errorMessage = [];
    errorMessage.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
    return errorMessage;
};

const handleChange = (value, name, props) => {
    const { reminder, reminderTemplate, apptInfo } = props;
    let newReminder = {
        ...reminder,
        [name]: value
    };
    let tmpl = null;

    if (name === 'isEng') {
        moment.locale('en');

        tmpl = reminderTemplate.find(item => item.commMeansCd === reminder.commMeansCd && item.isEng === parseInt(value) && item.status === 'A');
        newReminder.subj = tmpl ? tmpl.tmplSubj : '';
        if (newReminder.isEng === '1') {
            const dtmStr = `${moment(apptInfo.appointmentTime, Enum.TIME_FORMAT_12_HOUR_CLOCK).format(Enum.TIME_FORMAT_12_HOUR_CLOCK)}, ${moment(apptInfo.appointmentDate).format(Enum.DATE_FORMAT_DMY_WITH_WEEK)}`;
            newReminder.msg = tmpl ? tmpl.tmplMsg.replace('{0}', dtmStr) : '';
        }
        else {
            moment.locale('zh-cn', {
                weekdays: [
                    '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
                ],
                meridiem: function (hour, minute) {
                    if (hour > 0 && hour < 11) {
                        return '上午';
                    } else if (hour >= 11 && hour < 13) {
                        return '中午';
                    } else if (hour >= 13 && hour < 19) {
                        return '下午';
                    } else {
                        return '晚上';
                    }
                },
                longDateFormat: {
                    LLLL: 'YYYY年MM月DD日ddddAh時m分'
                }
            });
            const apptDate = AppointmentUtil.combineApptDateAndTime(apptInfo);
            const dtmStr = `${moment(apptDate).locale('zh-cn').format('LLLL')}`;
            newReminder.msg = tmpl ? tmpl.tmplMsg.replace('{0}', dtmStr) : '';
        }
        if (tmpl === undefined) {
            props.openCommonMessage({
                msgCode: '111231'
            });
            newReminder.isEng = '';
        }
    }
    if (name === 'apptRmndTmplId') {
        tmpl = reminderTemplate.find(item => item.apptRmndTmplId === value);
        newReminder.subj = tmpl ? tmpl.tmplSubj : '';
        newReminder.msg = tmpl ? tmpl.tmplMsg : '';
    }

    props.updateReminder(newReminder);

};

const genSMSPanel = (classes, props) => {
    const { id, reminder, curPageStatus, apptInfo, isPastAppt, schDTMRef } = props;
    const commonValidator = getValidators();
    const commonErrorMsg = getErrorMessage();
    const apptDtm = AppointmentUtil.combineApptDateAndTime(apptInfo);
    useEffect(() => {
        if (schDTMRef.current) {
            schDTMRef.current.validateCurrent();
        }
    }, [props.open]);
    return (
        <Grid item container>
            <FormControl className={classes.form_input}>
                <DateFieldValidator
                    id={`${id}_smsPanel_notificationDate`}
                    label={<>Notification Date<RequiredIcon /></>}
                    inputVariant={'outlined'}
                    minDate={moment().format(Enum.DATE_FORMAT_EDMY_VALUE)}
                    maxDate={apptDtm}
                    minDateMessage={CommonMessage.VALIDATION_NOTE_DATE_NOT_EARLIER('Notification Date', 'Today')}
                    maxDateMessage={CommonMessage.VALIDATION_NOTE_DATE_NOT_LATER('Notification Date', 'Appointment Date')}
                    validators={
                        (curPageStatus === PageStatus.EDIT) ? [] : isPastAppt ? commonValidator :
                            [
                                ...commonValidator
                            ]
                    }
                    errorMessages={
                        (curPageStatus === PageStatus.EDIT) ? [] : isPastAppt ? commonErrorMsg :
                            [
                                ...commonErrorMsg
                            ]
                    }
                    value={reminder ? reminder.schDtm : null}
                    onChange={e => { handleChange(e, 'schDtm', props); }}
                    disabled={curPageStatus !== PageStatus.ADD || isPastAppt}
                    ref={schDTMRef}
                />
            </FormControl>
            {
                curPageStatus === PageStatus.ADD ?
                    <FormControl className={classes.form_input}>
                        <SelectFieldValidator
                            id={`${id}_smsPanel_language`}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Language<RequiredIcon /></>
                            }}
                            value={reminder ? reminder.isEng : ''}
                            onChange={e => { handleChange(e.value, 'isEng', props); }}
                            options={ApptReminderConstants.language.map((item) => ({ value: item.value, label: item.name }))}
                            validators={commonValidator}
                            errorMessages={commonErrorMsg}
                            isDisabled={curPageStatus !== PageStatus.ADD || isPastAppt}
                        />
                    </FormControl>
                    : null
            }

            <FormControl className={classes.form_input}>
                <FastTextFieldValidator
                    id={`${id}_smsPanel_notes`}
                    variant={'outlined'}
                    value={reminder ? reminder.remark : ''}
                    rows={10}
                    label={'Notes'}
                    onBlur={e => { handleChange(e.target.value, 'remark', props); }}
                    disabled={isPastAppt}
                    inputProps={{ maxLength: 450 }}
                    calActualLength
                    multiline
                />
            </FormControl>
        </Grid>
    );
};

const genEmailPanel = (classes, props) => {
    const { id, reminder, curPageStatus, apptInfo, reminderTemplate, isPastAppt, schDTMRef } = props;
    const commonValidator = getValidators();
    const commonErrorMsg = getErrorMessage();
    const emailTmpl = reminderTemplate.filter(item => item.commMeansCd === Enum.CONTACT_MEAN_EMAIL);
    const apptDtm = AppointmentUtil.combineApptDateAndTime(apptInfo);

    useEffect(() => {
        if (schDTMRef.current) {
            schDTMRef.current.validateCurrent();
        }
    }, [props.open]);

    return (
        <Grid item container>
            <FormControl className={classes.form_input}>
                <DateFieldValidator
                    id={`${id}_emailPanel_notificationDate`}
                    label={<>Notification Date<RequiredIcon /></>}
                    minDate={moment().format(Enum.DATE_FORMAT_EDMY_VALUE)}
                    maxDate={apptDtm}
                    minDateMessage={CommonMessage.VALIDATION_NOTE_DATE_NOT_EARLIER('Notification Date', 'Today')}
                    maxDateMessage={CommonMessage.VALIDATION_NOTE_DATE_NOT_LATER('Notification Date', 'Appointment Date')}
                    validators={
                        (curPageStatus === PageStatus.EDIT) ? [] : isPastAppt ? commonValidator :
                            [
                                ...commonValidator
                            ]
                    }
                    errorMessages={
                        (curPageStatus === PageStatus.EDIT) ? [] : isPastAppt ? commonErrorMsg :
                            [
                                ...commonErrorMsg
                            ]
                    }
                    inputVariant={'outlined'}
                    value={reminder ? reminder.schDtm : null}
                    onChange={e => { handleChange(e, 'schDtm', props); }}
                    disabled={curPageStatus !== PageStatus.ADD || isPastAppt}
                    ref={schDTMRef}
                />
            </FormControl>
            {
                curPageStatus === PageStatus.ADD ?
                    <FormControl className={classes.form_input}>
                        <SelectFieldValidator
                            id={`${id}_emailPanel_emailTmpl`}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Email Template<RequiredIcon /></>
                            }}
                            value={reminder ? reminder.apptRmndTmplId : ''}
                            options={emailTmpl && emailTmpl.map((item) => ({ value: item.apptRmndTmplId, label: item.name }))}
                            onChange={e => { handleChange(e.value, 'apptRmndTmplId', props); }}
                            validators={commonValidator}
                            errorMessages={commonErrorMsg}
                            isDisabled={curPageStatus !== PageStatus.ADD || isPastAppt}
                        />
                    </FormControl>
                    : null
            }

            <FormControl className={classes.form_input}>
                <FastTextFieldValidator
                    id={`${id}_emailPanel_subject`}
                    value={reminder ? reminder.subj : ''}
                    onChange={e => { handleChange(e.target.value, 'subj', props); }}
                    label={<>Subject<RequiredIcon /></>}
                    variant={'outlined'}
                    validators={commonValidator}
                    errorMessages={commonErrorMsg}
                    disabled={curPageStatus !== PageStatus.ADD || isPastAppt}
                    inputProps={{ maxLength: 100 }}
                    calActualLength
                />
            </FormControl>
            <FormControl className={classes.form_input}>
                <FastTextFieldValidator
                    id={`${id}_emailPanel_content`}
                    value={reminder ? reminder.msg : ''}
                    onChange={e => { handleChange(e.target.value, 'msg', props); }}
                    variant={'outlined'}
                    multiline
                    rows={12}
                    label={<>Content<RequiredIcon /></>}
                    validators={commonValidator}
                    errorMessages={commonErrorMsg}
                    calActualLength
                    inputProps={{ maxLength: 450 }}
                    disabled={curPageStatus !== PageStatus.ADD || isPastAppt}
                />
            </FormControl>
            <FormControl className={classes.form_input}>
                <FastTextFieldValidator
                    id={`${id}_emailPanel_notes`}
                    value={reminder ? reminder.remark : ''}
                    onChange={e => { handleChange(e.target.value, 'remark', props); }}
                    variant={'outlined'}
                    rows={10}
                    label={'Notes'}
                    disabled={isPastAppt}
                    inputProps={{ maxLength: 450 }}
                    calActualLength
                    multiline
                />
            </FormControl>
        </Grid>
    );
};

const ReminderForm = React.forwardRef((props, ref) => {
    const { classes, tabValue, submitReminder, reminderType, apptInfo } = props;
    if (apptInfo) {
        return (
            <ValidatorForm className={classes.formRoot} ref={ref} onSubmit={submitReminder}>
                {
                    reminderType.length === 2 ?
                        tabValue === 0 ?
                            genSMSPanel(classes, props)
                            : genEmailPanel(classes, props)
                        : reminderType === Enum.CONTACT_MEAN_SMS ? genSMSPanel(classes, props) : genEmailPanel(classes, props)

                }
            </ValidatorForm>
        );
    } else {
        return null;
    }

});

const handleEditReminder = (props) => {
    const { curSelectReminder } = props;
    if (!curSelectReminder) {
        curSelectReminder.remark = '';
    }
    props.updateReminder(curSelectReminder);
    props.updateStatus(PageStatus.EDIT);
    props.backupReminder(curSelectReminder);
};

const genTools = (props, ref) => {
    const { id, classes, curPageStatus, isPastAppt, curSelectReminder } = props;
    let tools = [
        {
            id: `${id}_reminder_edit_btn_tool`,
            classes: { sizeSmall: classes.buttonRoot },
            func: () => handleEditReminder(props),
            label: 'Edit',
            type: 'button',
            disabled: curPageStatus === PageStatus.EDIT || !curSelectReminder || isPastAppt
        },
        {
            id: `${id}_reminder_delete_btn_tool`,
            classes: { sizeSmall: classes.buttonRoot },
            label: 'Delete',
            type: 'button',
            func: () => { props.delReminder(curSelectReminder); },
            disabled: curPageStatus === PageStatus.EDIT || !curSelectReminder || isPastAppt || curSelectReminder.apptReminderDtos.length > 0
        }
    ];
    return tools;
};

const genToolBarLbl = memoioze((props) => {
    const { apptInfo } = props;
    let lblArr = [];
    if (apptInfo) {
        const apptDtm = AppointmentUtil.combineApptDateAndTime(apptInfo);
        lblArr.push(`Appointment Date / Time ${apptDtm}`);
    }
    return lblArr;
});



const ReminderHistory = React.forwardRef((props, ref) => {
    const { id, classes, reminderList, reminderListBk, tabValue, reminderType, curSelectReminder, curPageStatus } = props;

    const isSms = tabValue === 0;
    // const tRows = getTableRows(props, isSms ? Enum.CONTACT_MEAN_SMS : Enum.CONTACT_MEAN_EMAIL);
    const tools = genTools(props);
    const labelArr = genToolBarLbl(props);

    const historyGridRef = React.createRef();

    let curReminderList;
    if (reminderType.length === 2) {
        if (tabValue === 0) {
            curReminderList = reminderList.filter(item => item.commMeansCd === Enum.CONTACT_MEAN_SMS);
        }
        else {
            curReminderList = reminderList.filter(item => item.commMeansCd === Enum.CONTACT_MEAN_EMAIL);
        }
    }
    else {
        curReminderList = reminderList.filter(item => item.commMeansCd === reminderType);
    }

    const setRowId = (data) => {
        return data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    };

    const rowData = setRowId(curReminderList);
    const tRows = getTableRows(props, isSms ? Enum.CONTACT_MEAN_SMS : Enum.CONTACT_MEAN_EMAIL);

    React.useEffect(() => {
        if (rowData) {
            console.log(rowData);
            historyGridRef.current.grid.api.redrawRows();
        }
    }, [reminderListBk]);

    const orderNumberRender = (props) => {
        const { rowIndex } = props;
        return rowIndex + 1;
    };

    const customAction = (props) => {
        const { data, isPastAppt, curPageStatus } = props;
        return (
            <Grid container style={{ paddingBottom: 3 }}>
                <CIMSButton
                    id={`${props.id}_Ad_Hoc_Button_${rowData.apptRmndId}`}
                    style={{ margin: 0, lineHeight: 'unset' }}
                    disabled={data.apptReminderDtos.length > 0 || isPastAppt || curPageStatus === PageStatus.EDIT}
                    onClick={(e) => handleSendApptInfo(e, data, props)}
                >Send
            </CIMSButton>
            </Grid>
        );
    };

    const suppressEnter = (params) => {
        const KEY_ENTER = [37, 38, 39, 40];
        const event = params.event;
        const key = event.which;
        const suppress = KEY_ENTER.includes(key);
        return suppress;
    };

    return (
        <Paper className={classes.paperRoot}>
            <CommomTableToolsBar
                id={`${id}_reminder_history_toolsBar`}
                tools={tools}
                labelArr={labelArr}
            />
            <Grid container className={classes.tableContainer}>
                <CIMSDataGrid
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '63vh',
                        display: 'block'
                    }}
                    gridOptions={{
                        columnDefs: tRows,
                        rowData: rowData,
                        rowSelection: 'single',
                        enableBrowserTooltips: true,
                        // suppressRowClickSelection: false,
                        onGridReady: params => {
                            ApptReminderDialog.gridApi = params.api;
                            ApptReminderDialog.colApi = params.api;
                        },
                        headerHeight: 50,
                        getRowHeight: () => 50,
                        getRowNodeId: item => item.rowId.toString(),
                        onRowSelected: params => {
                            // const { data } = params;
                            let row = params.api.getSelectedRows()[0];
                            if ((row && !curSelectReminder) || (row && curSelectReminder.apptRmndId !== row.apptRmndId)) {
                                props.updateSelectReminder(row);
                            } else {
                                let reminder = null;
                                if (row) {
                                    reminder = row;
                                }
                                props.updateSelectReminder(reminder);
                            }

                        },
                        onRowDoubleClicked: params => {
                            if (props.isPastAppt) {
                                return;
                            }
                            const { data } = params;
                            onReminderSelect(data, props);
                            props.updateStatus(PageStatus.EDIT);
                            props.backupReminder(data);
                        },
                        onCellFocused: e => {
                            if (curPageStatus !== PageStatus.ADD) {
                                e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                            }
                            else {
                                e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                            }
                        },
                        frameworkComponents: {
                            customAction: customAction,
                            orderNumberRender: orderNumberRender
                        },
                        suppressColumnVirtualisation: true,
                        ensureDomOrder: true,
                        suppressKeyboardEvent: suppressEnter,
                        postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                    }}
                    // ref={ref}
                    ref={historyGridRef}
                />
            </Grid>
        </Paper>
    );
});



const dialogContent = (props, classes) => {
    const theme = useTheme();
    const {
        id,
        updateState,
        apptInfo,
        reminderTemplate,
        reminderList,
        reminderListBk,
        reminderType,
        encounterTypes,
        currentSelectedApptInfo
    } = props;

    const reminderRef = React.createRef();
    const historyRef = React.createRef();
    const schDTMRef = React.createRef();

    const [tabValue, setTabValue] = useState(0);

    const [reminderRec, setReminderRec] = useState(() => {
        return ApptReminderConstants.initReminderRec;
    });

    const [curPageStatus, setCurPageStatus] = useState(PageStatus.ADD);

    const [reminderRecBK, setReminderRecBK] = useState(() => {
        return ApptReminderConstants.initReminderRec;
    });

    const [curSelectReminder, setCurSelectReminder] = useState(() => {
        return null;
    });
    const getReminderDay = () => {
        if (currentSelectedApptInfo) {
            const enct = encounterTypes.find(item => item.encntrTypeCd === currentSelectedApptInfo.encntrTypeCd);
            // return enct ? -enct.apptRmndDay : -1;
            if (enct) {
                if (enct.apptRmndDay === 0) {
                    return 0;
                } else {
                    return -enct.apptRmndDay;
                }
            } else {
                return -1;
            }
        }
        return -1;
    };

    const initReminder = () => {
        let newReminder = _.cloneDeep(ApptReminderConstants.initReminderRec);
        const emailTmpl = reminderTemplate.filter(item => item.commMeansCd === Enum.CONTACT_MEAN_EMAIL);

        if (reminderType.length === 2) {
            if (tabValue === 0) {
                newReminder.commMeansCd = Enum.CONTACT_MEAN_SMS;
            }
            else {
                newReminder.commMeansCd = Enum.CONTACT_MEAN_EMAIL;
                if (emailTmpl.length === 1) {
                    newReminder.apptRmndTmplId = emailTmpl[0].apptRmndTmplId;
                    newReminder.subj = emailTmpl[0].tmplSubj;
                    newReminder.msg = emailTmpl[0].tmplMsg;
                }
            }
        }
        else {
            newReminder.commMeansCd = reminderType;
            if (reminderType === Enum.CONTACT_MEAN_EMAIL) {
                if (emailTmpl.length === 1) {
                    newReminder.apptRmndTmplId = emailTmpl[0].apptRmndTmplId;
                    newReminder.subj = emailTmpl[0].tmplSubj;
                    newReminder.msg = emailTmpl[0].tmplMsg;
                }
            }
            else {
                newReminder.commMeansCd = Enum.CONTACT_MEAN_SMS;
            }
        }

        const apptRmndDay = getReminderDay();
        newReminder.schDtm = apptInfo ? moment(apptInfo.appointmentDate || null).add('day', apptRmndDay) : moment();
        setReminderRec(newReminder);
        setCurPageStatus(PageStatus.ADD);
        setReminderRecBK(newReminder);
        setCurSelectReminder(null);
        ApptReminderDialog.gridApi && ApptReminderDialog.gridApi.deselectAll();
    };

    useEffect(() => {
        if(props.siteId){
            props.getReminderTemplate(props.siteId, null, null);
        }
    }, [props.siteId]);

    useEffect(() => {
        initReminder();
    }, [props.open,props.reminderTemplate.length]);

    const resetDialog = () => {
        ApptReminderDialog.gridApi && ApptReminderDialog.gridApi.deselectAll();
        reminderRef.current.resetValidations();
        initReminder();
    };

    const closeDialog = () => {
        updateState({ openApptReminder: false });
        setTabValue(0);
        const newReminder = _.cloneDeep(ApptReminderConstants.initReminderRec);
        setReminderRec(newReminder);
        setCurPageStatus(PageStatus.ADD);
        setReminderRecBK(newReminder);
        setCurSelectReminder(null);
        props.refreshApptHistory();
    };

    const checkReminderInfoChanged = () => {
        let isChanged = false;
        if (!apptInfo) {
            return false;
        }
        if (curPageStatus === PageStatus.ADD) {
            const apptRmndDay = getReminderDay();
            const notificationDTM = moment(apptInfo.appointmentDate).add('day', apptRmndDay).format(Enum.DATE_FORMAT_EDMY_VALUE);
            const schDTM = moment(reminderRec.schDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
            if (reminderRec.subj !== reminderRecBK.subj ||
                reminderRec.msg != reminderRecBK.msg ||
                reminderRec.remark != reminderRecBK.remark ||
                !(moment(schDTM).isSame(moment(notificationDTM)))) {
                isChanged = true;
            }
        }
        if (curPageStatus === PageStatus.EDIT) {
            if (reminderRec.remark !== reminderRecBK.remark) {
                isChanged = true;
            }
        }
        return isChanged;
    };

    const getSaveBtnLabel = (curPageStatus) => curPageStatus === PageStatus.ADD ? 'Add' : 'Save';
    const getCancelBtnLabel = (curPageStatus) => curPageStatus === PageStatus.ADD ? (checkReminderInfoChanged() ? 'Cancel' : 'Close') : 'Cancel';

    const handleOnClose = () => {
        props.auditAction(`${getCancelBtnLabel(curPageStatus)} in appointment history`, null, null, false, 'ana');

        if (checkReminderInfoChanged()) {
            props.openCommonMessage({
                msgCode: '111226',
                btnActions: {
                    btn1Click: () => {
                        if (curPageStatus === PageStatus.EDIT) {
                            resetDialog();
                        }
                        else {
                            closeDialog();
                        }
                    }
                }
            });
        }
        else {
            if (curPageStatus === PageStatus.EDIT) {
                resetDialog();
            }
            else {
                closeDialog();
            }

        }
    };
    const handleSave = () => {
        props.auditAction(`${getSaveBtnLabel(curPageStatus)} in appointment history`, null, null, false, 'ana');
        ApptReminderDialog.gridApi && ApptReminderDialog.gridApi.deselectAll();
        reminderRef.current.submit();
    };
    const loadSubmitParams = (passInReminder = null) => {
        let _reminder = null;
        if (passInReminder) {
            _reminder = {
                ...passInReminder,
                schDtm: moment(passInReminder.schDtm).format(Enum.DATE_FORMAT_EYMD_VALUE)
            };
        }
        else {
            _reminder = {
                ...reminderRec,
                schDtm: moment(reminderRec.schDtm).format(Enum.DATE_FORMAT_EYMD_VALUE)
            };
        }

        delete _reminder.isEng;
        delete _reminder.apptRmndTmplId;
        const callback = () => {
            initReminder();
        };
        let params = {
            apptId: apptInfo.appointmentId,
            reminder: _reminder
        };
        if (curPageStatus === PageStatus.EDIT) {
            params.apptRmndId = reminderRec.apptRmndId;
        }

        return { params, callback };
    };
    const submitReminder = () => {
        let submitParams = loadSubmitParams();

        props.submitApptReminder(submitParams.params, curPageStatus, submitParams.callback);
    };

    const delReminder = (reminder) => {
        let submitParams = loadSubmitParams(reminder);
        let _params = _.cloneDeep(submitParams.params);
        _params.apptRmndId = submitParams.params.reminder.apptRmndId;
        props.deleteApptReminder(_params, submitParams.callback);
    };

    const sendReminderInfo = (reminder) => {
        // if (histroyRef.current) {
        //     histroyRef.current.clearSelected();
        // }
        // histroyRef.current.clearSelected();
        props.auditAction(`Send ac-hoc appointment reminder (type code: ${reminder.commMeansCd})`);
        ApptReminderDialog.gridApi && ApptReminderDialog.gridApi.deselectAll();
        let submitParams = loadSubmitParams(reminder);
        let _params = _.cloneDeep(submitParams.params);
        _params.apptRmndId = submitParams.params.reminder.apptRmndId;
        props.sendApptReminderInfo(_params, submitParams.callback);
    };

    const updateReminderRec = (reminder) => {
        setReminderRec(reminder);
    };

    const backupReminder = (reminder) => {
        setReminderRecBK(reminder);
    };

    const updateStatus = (status) => {
        setCurPageStatus(status);
    };

    const updateSelectReminder = (reminder) => {
        setCurSelectReminder(reminder);
    };

    const changeTabValue = (e, value) => {
        if (curPageStatus === PageStatus.EDIT) {
            return;
        }
        setTabValue(value);
        // setReminderRec(null);
        // initReminder();
        let newReminder = _.cloneDeep(ApptReminderConstants.initReminderRec);
        if (value === 1) {
            const emailTmpl = reminderTemplate.filter(item => item.commMeansCd === Enum.CONTACT_MEAN_EMAIL);
            newReminder.commMeansCd = Enum.CONTACT_MEAN_EMAIL;
            if (emailTmpl.length === 1) {
                newReminder.apptRmndTmplId = emailTmpl[0].apptRmndTmplId;
                newReminder.subj = emailTmpl[0].tmplSubj;
                newReminder.msg = emailTmpl[0].tmplMsg;
            }
        }
        else {
            newReminder.commMeansCd = Enum.CONTACT_MEAN_SMS;
        }
        setReminderRec(newReminder);
        setReminderRecBK(newReminder);
        setCurSelectReminder(null);

        ApptReminderDialog.gridApi && ApptReminderDialog.gridApi.deselectAll();
        ApptReminderDialog.gridApi.redrawRows();
        ApptReminderDialog.gridApi.setFilterModel(null);
        ApptReminderDialog.gridApi.setSortModel(null);
        ApptReminderDialog.gridApi.ensureIndexVisible(0, 'top');
    };

    const isPastAppt = AppointmentUtil.isPastAppointment(apptInfo);




    return (
        <Grid container>
            <Grid item container xs={12} className={classes.tabContainer}>
                <Tabs
                    value={tabValue}
                    onChange={changeTabValue}
                    indicatorColor={'primary'}
                >
                    {
                        reminderType.indexOf(Enum.CONTACT_MEAN_SMS) > -1 ?
                            <Tab
                                id={`${id}_smsPanel`}
                                className={(tabValue === 0 || reminderType === Enum.CONTACT_MEAN_SMS) ? classes.tabActive : classes.tab}
                                label={
                                    <Typography style={{ fontSize: 16, textTransform: 'none' }}>SMS</Typography>
                                }
                            />
                            : null
                    }
                    {
                        reminderType.indexOf(Enum.CONTACT_MEAN_EMAIL) > -1 ?
                            <Tab
                                id={`${id}_emailPanel`}
                                className={(tabValue === 1 || reminderType === Enum.CONTACT_MEAN_EMAIL) ? classes.tabActive : classes.tab}
                                label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>E-mail</Typography>}
                            />
                            : null
                    }
                </Tabs>
            </Grid>
            <Grid item container xs={12} spacing={2} style={{ padding: theme.spacing(1) }}>
                <Grid item container xs={8}>
                    <ReminderHistory
                        id={id}
                        apptInfo={apptInfo}
                        classes={classes}
                        ref={historyRef}
                        curPageStatus={curPageStatus}
                        reminder={reminderRec}
                        tabValue={tabValue}
                        reminderList={reminderList}
                        reminderListBk={reminderListBk}
                        updateReminder={updateReminderRec}
                        updateStatus={updateStatus}
                        delReminder={delReminder}
                        sendReminderInfo={sendReminderInfo}
                        backupReminder={backupReminder}
                        updateSelectReminder={updateSelectReminder}
                        isPastAppt={isPastAppt}
                        openCommonMessage={props.openCommonMessage}
                        reminderType={reminderType}
                        reminderTemplate={reminderTemplate}
                        curSelectReminder={curSelectReminder}
                    />
                </Grid>
                <Grid item container xs={4}>
                    <ReminderForm
                        id={id}
                        classes={classes}
                        ref={reminderRef}
                        schDTMRef={schDTMRef}
                        tabValue={tabValue}
                        curPageStatus={curPageStatus}
                        reminder={reminderRec}
                        apptInfo={apptInfo}
                        reminderTemplate={reminderTemplate}
                        isPastAppt={isPastAppt}
                        reminderType={reminderType}
                        submitReminder={submitReminder}
                        updateReminder={updateReminderRec}
                        openCommonMessage={props.openCommonMessage}
                        getReminderDay={getReminderDay}
                    />
                </Grid>
            </Grid>
            <Grid item container xs={12} wrap="nowrap" justify="flex-end" style={{ padding: '0px 16px' }}>
                <CIMSButton
                    id={`${id}_saveBtn`}
                    onClick={handleSave}
                    disabled={curPageStatus !== PageStatus.EDIT && curPageStatus !== PageStatus.ADD || isPastAppt}
                >{getSaveBtnLabel(curPageStatus)}</CIMSButton>
                <CIMSButton
                    id={`${id}_cancelBtn`}
                    onClick={handleOnClose}
                >
                    {getCancelBtnLabel(curPageStatus)}
                </CIMSButton>
            </Grid>
        </Grid>
    );
};



export default ApptReminderDialog;