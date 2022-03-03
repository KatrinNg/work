import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import moment from 'moment';
import { Grid, Typography } from '@material-ui/core';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import TimeFieldValidator from '../../../../../components/FormValidator/TimeFieldValidator';
import DateFieldValidator from '../../../../../components/FormValidator/DateFieldValidator';
import CIMSMultiTextField from '../../../../../components/TextField/CIMSMultiTextField';
import OutlinedRadioValidator from '../../../../../components/FormValidator/OutlinedRadioValidator';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import CIMSTable from '../../../../../components/Table/CIMSTable';
import Enum from '../../../../../enums/enum';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import CommonRegex from '../../../../../constants/commonRegex';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import {
    updateContatHistory, listContatHistory, updateContHistState,
    clearContactList, insertContatHistory
} from '../../../../../store/actions/appointment/booking/bookingAction';
import * as PatientUtil from '../../../../../utilities/patientUtilities';
import {auditAction} from '../../../../../store/actions/als/logAction';


class BookingContactHistory extends React.Component {

    state = {
        tableRows: [
            { name: 'contactType', label: 'Type', width: 60 },
            { name: 'contactDesc', label: 'Contact Description', width: 100 },
            { name: 'notificationDtm', label: 'Notification Date/Time', width: 150, customBodyRender: (value) => value && moment(value).format(Enum.DATE_FORMAT_24_HOUR)},
            { name: 'callerName', label: 'Caller Name', width: 100 },
            { name: 'notes', label: 'Notes', width: 150 }
        ],
        tableOptions: {
            rowExpand: true,
            rowsPerPage: 10,
            rowsPerPageOptions: [10],
            onSelectIdName: 'contactHistoryId',
            isRowEditing: (rowData) => {
                const { currentSelectedContactInfo } = this.props.contactHistoryInfo;
                return currentSelectedContactInfo !== null;
            },
            onSelectedRow: (rowId, rowData, selectedData) => {
                const selected = selectedData.length == 0 ? null : selectedData[0];
                if ((this.props.loginName || '').toUpperCase() == (rowData.callerName || '').toUpperCase()) {
                    this.props.updateContHistState({ currentSelectedContact: selected, currentSingleSelectedContactInfo: selected });
                } else {
                    this.props.updateContHistState({ currentSelectedContact: null, currentSingleSelectedContactInfo: selected });
                }
            },
            onRowDoubleClick: (rowData) => {
                if (this.props.contactHistoryInfo.currentSelectedContactInfo) {
                    return;
                }
                if ((this.props.loginName || '').toUpperCase() == (rowData.callerName || '').toUpperCase()) {
                    this.contactHistoryTableRef.setSelected(rowData.contactHistoryId);
                    this.props.updateContHistState({
                        currentSelectedContactInfo: rowData,
                        appointmentId: rowData.appointmentId,
                        callerName: rowData.callerName,
                        NotificationDate: moment(rowData.notificationDtm, Enum.DATE_FORMAT_EYMMMD_VALUE_24_HOUR),
                        NotificationTime: moment(rowData.notificationDtm, Enum.DATE_FORMAT_EYMMMD_VALUE_24_HOUR),
                        contactType: rowData.contactType,
                        note: rowData.notes
                    });
                    if (rowData.contactType == 'Tel') {
                        this.props.updateContHistState({ tel: rowData.contactDesc });
                    } else if (rowData.contactType == 'Fax') {
                        this.props.updateContHistState({ fax: rowData.contactDesc });
                    } else if (rowData.contactType == 'Mail') {
                        this.props.updateContHistState({ email: rowData.contactDesc });
                    }
                }
            }
        }
    }

    componentDidMount() {
        this.initData();
    }

    initData = () => {
        const { loginName, patientInfo } = this.props;
        this.props.updateContHistState({
            callerName: loginName,
            tel: PatientUtil.sortPatientPhone(this.props.patientInfo.phoneList || []).length > 0 ? PatientUtil.sortPatientPhone(this.props.patientInfo.phoneList || [])[0].phoneNo : ''
        });
    }

    handleCotactUpdate = () => {
        let { currentSelectedContactInfo, rowData, callerName, NotificationDate,
            NotificationTime, contactType, tel, fax, email, note
        } = this.props.contactHistoryInfo;
        let params = {
            appointmentId: rowData.appointmentId,
            callerName: callerName,
            contactDesc: contactType == 'Tel' ? tel : contactType == 'Fax' ? fax : email,
            contactHistoryId: currentSelectedContactInfo ? currentSelectedContactInfo.contactHistoryId : 0,
            contactType: contactType,
            notes: note,
            notificationDtm: NotificationDate.set({
                hour: NotificationTime.hour(),
                minute: NotificationTime.minute(),
                second: NotificationTime.second()
            }).format(Enum.DATE_FORMAT_EYMMMD_VALUE_24_HOUR),
            statusCd: 'A',
            version: currentSelectedContactInfo ? currentSelectedContactInfo.version : undefined
        };
        const callback = () => {
            this.props.listContatHistory(rowData.appointmentId, () => {
                this.clearContactListSelected();
            });
        };
        if (currentSelectedContactInfo) {
            this.props.updateContatHistory(params, callback);
        } else {
            this.props.insertContatHistory(params, callback);
        }
    }

    handleContactFieldChange = (name, e) => {
        let stateData = { ...this.props.contactHistoryInfo };
        stateData[name] = e.target.value;
        // let reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        // if (name == 'email' && reg.test(e.target.value)) {
        //     return;
        // }
        this.props.updateContHistState({ ...stateData });
    }

    handleContactDateFieldChange = (name, value) => {
        let stateData = { ...this.props.contactHistoryInfo };
        stateData[name] = value;
        if ((name === 'NotificationDate' || name === 'NotificationTime') && value) {
            if (name === 'NotificationDate' && !this.props.contactHistoryInfo['NotificationTime']) {
                if (moment(value).isAfter(moment(), 'day')) {
                    stateData['NotificationTime'] = moment(value).set({ hours: 0, minute: 0, second: 0 });
                } else if (moment(value).isSame(moment(), 'day')) {
                    stateData['NotificationTime'] = moment().set({ hours: 0, minute: 0, second: 0 });
                }
            }
        }
        this.props.updateContHistState({ ...stateData });
    }

    clearContactListSelected = () => {
        const { patientInfo, loginName } = this.props;
        this.contactHistoryTableRef.clearSelected();
        this.props.updateContHistState({
            callerName: loginName,
            NotificationDate: moment(),
            NotificationTime: moment(),
            tel: PatientUtil.sortPatientPhone(this.props.patientInfo.phoneList || []).length > 0 ? PatientUtil.sortPatientPhone(this.props.patientInfo.phoneList || [])[0].phoneNo : '',
            email: '',
            fax: '',
            note: '',
            contactType: 'Tel',
            currentSelectedContactInfo: null,
            currentSelectedContact: null,
            currentSingleSelectedContactInfo: null
        });
    }

    checkContactInfoChanges = () => {
        let { currentSelectedContactInfo, NotificationDate,
            NotificationTime, contactType, tel, fax, email, note
        } = this.props.contactHistoryInfo;
        let contactInfoChanged = false;
        if (moment(currentSelectedContactInfo.notificationDtm, 'YYYY-MMM-DD HH:mm').format(Enum.DATE_FORMAT_EYMD_VALUE) != moment(NotificationDate, Enum.DATE_FORMAT_EYMD_VALUE).format(Enum.DATE_FORMAT_EYMD_VALUE)
            || moment(currentSelectedContactInfo.notificationDtm, 'YYYY-MMM-DD HH:mm').format(Enum.TIME_FORMAT_24_HOUR_CLOCK) != moment(NotificationTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
            || (currentSelectedContactInfo.notes || '') != (note || '') || currentSelectedContactInfo.contactType != contactType
        ) {
            contactInfoChanged = true;
        }
        if (currentSelectedContactInfo.contactType == contactType) {
            if (currentSelectedContactInfo.contactType == 'Tel') {
                if (currentSelectedContactInfo.contactDesc != tel) {
                    contactInfoChanged = true;
                }
            } else if (currentSelectedContactInfo.contactType == 'Fax') {
                if (currentSelectedContactInfo.contactDesc != fax) {
                    contactInfoChanged = true;
                }
            } else if (currentSelectedContactInfo.contactType == 'Mail') {
                if (currentSelectedContactInfo.contactDesc != email) {
                    contactInfoChanged = true;
                }
            }
        }
        return contactInfoChanged;
    }

    render() {
        const { classes, contactList } = this.props;
        const { currentSelectedContact, currentSelectedContactInfo, rowData,
            currentSingleSelectedContactInfo, callerName, NotificationDate,
            NotificationTime, contactType, tel, fax, email, note, open, appointmentDate
        } = this.props.contactHistoryInfo;
        const { tableOptions, tableRows } = this.state;
        return (
            <CIMSPromptDialog
                open={open}
                id={'contactHistory'}
                dialogTitle={'Contact History'}
                paperStyl={classes.paper}
                draggable
                dialogContentText={
                    <div>
                        <Grid
                            container
                            item
                            alignItems="center"
                            wrap="nowrap"
                            className={classes.gridTitle}
                            xs={8}
                        >
                            <Grid item container xs={8}>
                                <Typography className={classes.maintitleRoot}>Appointment Date/Time: {' '}</Typography>
                                <Typography className={classes.maintitleRoot} style={{ fontWeight: 'normal' }}>&nbsp;{`${moment(rowData.appointmentDate).format(Enum.DATE_FORMAT_EDMY_VALUE)} ${moment(rowData.appointmentTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}`}</Typography>
                            </Grid>
                            <Grid item container xs={4} justify={'flex-end'}>
                                <CIMSButton
                                    id="booking_contactHistory_dialog_editBtn"
                                    classes={{ sizeSmall: classes.buttonRoot }}
                                    disabled={currentSelectedContact == null || currentSelectedContactInfo != null || appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                    onClick={() => {
                                        if (!currentSingleSelectedContactInfo) {
                                            return;
                                        }
                                        this.props.auditAction('Edit selected in contact history dialog', null, null, false, 'ana');

                                        this.props.updateContHistState({
                                            currentSelectedContactInfo: currentSingleSelectedContactInfo,
                                            appointmentId: currentSingleSelectedContactInfo.appointmentId,
                                            callerName: currentSingleSelectedContactInfo.callerName,
                                            NotificationDate: moment(currentSingleSelectedContactInfo.notificationDtm, Enum.DATE_FORMAT_EYMMMD_VALUE_24_HOUR),
                                            NotificationTime: moment(currentSingleSelectedContactInfo.notificationDtm, Enum.DATE_FORMAT_EYMMMD_VALUE_24_HOUR),
                                            contactType: currentSingleSelectedContactInfo.contactType,
                                            note: currentSingleSelectedContactInfo.notes
                                        });

                                        if (currentSingleSelectedContactInfo.contactType == 'Tel') {
                                            this.props.updateContHistState({ tel: currentSingleSelectedContactInfo.contactDesc });
                                        } else if (currentSingleSelectedContactInfo.contactType == 'Fax') {
                                            this.props.updateContHistState({ fax: currentSingleSelectedContactInfo.contactDesc });
                                        } else if (currentSingleSelectedContactInfo.contactType == 'Mail') {
                                            this.props.updateContHistState({ email: currentSingleSelectedContactInfo.contactDesc });
                                        }
                                        this.props.updateContHistState({ currentSingleSelectedContactInfo: null });
                                    }}
                                >Edit</CIMSButton>
                                <CIMSButton
                                    id="booking_contactHistory_dialog_deleteBtn"
                                    classes={{ sizeSmall: classes.buttonRoot }}
                                    onClick={() => {
                                        if (currentSingleSelectedContactInfo) {
                                            this.props.auditAction('Delete selected in contact history dialog');

                                            let params = {
                                                appointmentId: currentSingleSelectedContactInfo.appointmentId,
                                                callerName: currentSingleSelectedContactInfo.callerName,
                                                contactDesc: currentSingleSelectedContactInfo.contactDesc,
                                                contactHistoryId: currentSingleSelectedContactInfo.contactHistoryId,
                                                contactType: currentSingleSelectedContactInfo.contactType,
                                                notes: currentSingleSelectedContactInfo.notes,
                                                notificationDtm: currentSingleSelectedContactInfo.notificationDtm,
                                                statusCd: 'D',
                                                version: currentSingleSelectedContactInfo.version
                                            };
                                            this.props.updateContatHistory(params, () => {
                                                this.props.listContatHistory(rowData.appointmentId);
                                                this.props.updateContHistState({ currentSingleSelectedContactInfo: null });
                                            });
                                        }
                                    }}
                                    disabled={currentSelectedContact == null || currentSelectedContactInfo != null || appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                >Delete</CIMSButton>
                            </Grid>

                        </Grid>

                        <Grid container spacing={1} className={classes.root}>
                            <Grid item container xs={8}>

                                <Grid container className={classes.marginTop20}>
                                    <CIMSTable
                                        tableMaxHeight={450}
                                        id={'ContactHistory_table'}
                                        innerRef={ref => this.contactHistoryTableRef = ref}
                                        rows={tableRows}
                                        options={tableOptions}
                                        data={contactList}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container direction="column" xs={4}>
                                <ValidatorForm ref="contHistFormRef" onSubmit={this.handleCotactUpdate} >
                                    <Grid item container style={{ marginTop: 5, marginBottom: 20 }}>
                                        <FastTextFieldValidator
                                            id={'booking_select_appointment_booking_contactHistory_callerName'}
                                            value={callerName}
                                            onBlur={e => this.handleContactFieldChange('callerName', e)}
                                            validators={[ValidatorEnum.required]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                            disabled
                                            label={<>Caller Name</>}
                                        />
                                    </Grid>
                                    <Grid item container spacing={1} style={{ marginBottom: 20 }}>
                                        <Grid item container xs={6}>
                                            <DateFieldValidator
                                                label={<>Notification Date<RequiredIcon /></>}
                                                isRequired
                                                style={{ width: 'inherit' }}
                                                id={'booking_select_appointment_booking_contactHistory_notificationDate'}
                                                value={NotificationDate}
                                                placeholder=""
                                                onChange={e => this.handleContactDateFieldChange('NotificationDate', e)}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                msgPosition="bottom"
                                                disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                                disableFuture
                                            />
                                        </Grid>
                                        <Grid item container xs={6} >
                                            <TimeFieldValidator
                                                label={<>Notification Time<RequiredIcon /></>}
                                                isRequired
                                                id={'booking_select_appointment_booking_contactHistory_notificationTime'}
                                                helperText=""
                                                value={NotificationTime}
                                                placeholder=""
                                                onChange={e => this.handleContactDateFieldChange('NotificationTime', e)}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                msgPosition="bottom"
                                                disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                            />
                                        </Grid>
                                    </Grid>
                                    <OutlinedRadioValidator
                                        id={'booking_select_appointment_booking_contactHistory_contactType'}
                                        labelText="Contact Type"
                                        isRequired
                                        value={contactType}
                                        onChange={e => this.handleContactFieldChange('contactType', e)}
                                        list={[{ label: 'Tel', value: 'Tel' }, { label: 'Fax', value: 'Fax' }, { label: 'Mail', value: 'Mail' }]}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        RadioGroupProps={{ className: classes.radioGroup }}
                                        style={{ marginBottom: 20 }}
                                        disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                    />
                                    {
                                        contactType === 'Tel' ?
                                            <Grid item container style={{ marginBottom: 20 }}>
                                                <FastTextFieldValidator
                                                    type="number"
                                                    id={'booking_select_appointment_booking_contactHistory_tel'}
                                                    value={tel}
                                                    onBlur={e => this.handleContactFieldChange('tel', e)}
                                                    validators={[ValidatorEnum.isNumber, ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_NUMBERFIELD(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                    inputProps={{ maxLength: 15 }}
                                                    label={<>Tel<RequiredIcon /></>}
                                                    disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                                /></Grid> : null
                                    }
                                    {
                                        contactType === 'Fax' ? <Grid item container style={{ marginBottom: 20 }}>
                                            <FastTextFieldValidator
                                                type="number"
                                                id={'booking_select_appointment_booking_contactHistory_fax'}
                                                value={fax}
                                                onBlur={e => this.handleContactFieldChange('fax', e)}
                                                validators={[ValidatorEnum.isNumber, ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_NUMBERFIELD(), CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                inputProps={{ maxLength: 15 }}
                                                label={<>Fax<RequiredIcon /></>}
                                                disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                            /></Grid> : null
                                    }
                                    {
                                        contactType === 'Mail' ? <Grid item container style={{ marginBottom: 20 }}>
                                            <FastTextFieldValidator
                                                id={'booking_select_appointment_booking_contactHistory_mail'}
                                                value={email}
                                                onBlur={e => this.handleContactFieldChange('email', e)}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                inputProps={{ maxLength: 400 }}
                                                label={<>Mail Address<RequiredIcon /></>}
                                                disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                                calActualLength
                                            /> </Grid> : null
                                    }

                                    <Grid item container spacing={1} >
                                        <Grid item container>
                                            <FastTextFieldValidator
                                                id={'booking_select_appointment_booking_contactHistory_note'}
                                                fullWidth
                                                value={note}
                                                inputProps={{ maxLength: 500 }}
                                                label="Notes"
                                                calActualLength
                                                multiline
                                                rows="4"
                                                onBlur={e => this.handleContactFieldChange('note', e)}
                                                disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                            />
                                        </Grid>
                                    </Grid>
                                </ValidatorForm>

                            </Grid>

                        </Grid>
                    </div>
                }
                buttonConfig={
                    currentSelectedContactInfo == null ?
                        [
                            {
                                id: 'contactHistory_add',
                                name: 'Add',
                                disabled: appointmentDate && moment(appointmentDate).isBefore(moment(), 'day'),
                                onClick: () => {
                                    this.props.auditAction('Add in contact history dialog');

                                    this.refs.contHistFormRef.submit();
                                }
                            },
                            {
                                id: 'contactHistory_close',
                                name: 'Close',
                                onClick: () => {
                                    this.clearContactListSelected();
                                    this.props.auditAction('Close contact history dialog', null, null, false, 'ana');

                                    this.props.refreshListAppointment();
                                    this.props.updateContHistState({ open: false, appointmentDate: null });
                                    this.props.clearContactList();
                                }
                            }
                        ] : [
                            {
                                id: 'contactHistory_save',
                                name: 'Save',
                                disabled: appointmentDate && moment(appointmentDate).isBefore(moment(), 'day'),
                                onClick: () => {
                                    this.props.auditAction('Save update in contact history dialog');
                                    this.refs.contHistFormRef.submit();
                                }
                            },
                            {
                                id: 'contactHistory_cancel',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Cancel edit in contact history dialog', null, null, false, 'ana');
                                    let contactInfoChanged = this.checkContactInfoChanges();
                                    if (!contactInfoChanged) {
                                        this.clearContactListSelected();
                                        return;
                                    }
                                    this.props.openCommonMessage({
                                        msgCode: '111224',
                                        btnActions: {
                                            btn1Click: () => {
                                                this.clearContactListSelected();
                                            }
                                        }
                                    });
                                }
                            }
                        ]
                }
            />
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        contactHistoryInfo: state.bookingInformation.contactHistoryInfo,
        contactList: state.bookingInformation.contactList,
        patientInfo: state.patient.patientInfo,
        loginName: state.login.loginInfo.loginName
    });
};

const mapDispatchtoProps = {
    openCommonMessage, updateContatHistory, listContatHistory,
    clearContactList, updateContHistState, insertContatHistory,
    auditAction
};

const styles = theme => ({
    root: {
        padding: 4
    },
    maintitleRoot: {
        paddingTop: 6,
        fontSize: '14pt',
        fontWeight: 600
    },
    marginTop20: {
        marginTop: 6
    },
    radioGroup: {
        height: 39,
        marginBottom: 20
    },
    gridTitle: {
        padding: '4px 0px'
    },
    buttonRoot: {
        margin: 2,
        padding: 0,
        height: 35
    },
    paper: {
        minWidth: 300,
        maxWidth: '80%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    }
});


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(BookingContactHistory));