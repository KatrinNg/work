import React from 'react';
import { Grid, FormLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSRadioCombination from '../../../components/Radio/CIMSRadioCombination';
import CIMSFormLabel from '../../../components/InputLabel/CIMSFormLabel';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import FastTextField from '../../../components/TextField/FastTextField';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import TimeFieldValidator from '../../../components/FormValidator/TimeFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import Enum from '../../../enums/enum';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import { getFormatDHPMINO } from '../../../utilities/patientUtilities';
import { sppDfltCntctHx } from '../../../store/actions/defaulterTracing';
import { openCommonMessage } from '../../../store/actions/message/messageAction';


const styles = makeStyles(() => ({
    paper: {
        width: 1000,
        maxWidth: '80%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    detailPaper: {
        width: 750,
        maxWidth: '80%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    formLabelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    },
    customButton: {
        position: 'unset',
        right: 0,
        width: 'auto',
        zIndex: 999,
        padding: 0
    }
}));




const CnctDetailDialog = (props) => {
    const { id, openCnctDetail, closeCnctDetail, dfltTraceRec, dfltTraceDetailList, opType, selected } = props;
    const formRef = React.useRef(null);
    const classes = styles();
    const [detail, setDetail] = React.useState(() => {
        return {
            isCntctSuccess: '1',
            cntctDate: moment(),
            cntctTime: moment(),
            codSppDfltTrcCntctDetlId: null,
            patientKey: null,
            rmrk: null
        };
    });



    const handleOnChange = (name, value) => {
        let detl = _.cloneDeep(detail);
        detl[name] = value;
        setDetail(detl);
    };

    const combineDateAndTime = () => {
        const dateStr = moment(detail.cntctDate, Enum.DATE_FORMAT_EYMD_VALUE).format(Enum.DATE_FORMAT_EYMD_VALUE);
        const timeStr = moment(detail.cntctTime, Enum.TIME_FORMAT_24_HOUR_HMS).format(Enum.TIME_FORMAT_24_HOUR_HMS);
        return `${dateStr} ${timeStr}`;
    };

    const handleSave = () => {
        let formSubmit = formRef.current && formRef.current.isFormValid(false);
        formSubmit.then(result => {
            if (result) {
                let params = null;
                let detl = _.cloneDeep(detail);
                let cntctTime = combineDateAndTime();
                params = {
                    ...detl,
                    isCntctSuccess: _.parseInt(detl.isCntctSuccess),
                    cntctTime: cntctTime,
                    patientKey: dfltTraceRec.patientKey
                };
                delete params.cntctDate;
                props.sppDfltCntctHx(opType, params, () => {
                    closeCnctDetail(true);
                });
                // }
            } else {
                formRef.current.focusFail();
            }
        });
    };

    React.useEffect(() => {
        if (opType === Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.UPDATE) {
            let detl = {
                ...selected,
                isCntctSuccess: selected.isCntctSuccess ? '1' : '0',
                cntctDate: selected.cntctTime
            };
            setDetail(detl);
        }
    }, [opType]);

    return (
        <Grid container>
            <CIMSPromptDialog
                open={openCnctDetail}
                id={id}
                dialogTitle={'Contact Detail'}
                paperStyl={classes.detailPaper}
                dialogContentText={
                    <Grid container>
                        <Grid item container>
                            <ValidatorForm ref={formRef}>
                                <Grid item container spacing={1}>
                                    <Grid item container>
                                        <CIMSFormLabel
                                            fullWidth
                                            labelText={'Contact'}
                                            className={classes.formLabelContainer}
                                        >
                                            <CIMSRadioCombination
                                                id={`${id}_contact_radio_group`}
                                                row
                                                name={'Contact'}
                                                value={detail.isCntctSuccess}
                                                onChange={e => handleOnChange('isCntctSuccess', e.target.value)}
                                                list={[
                                                    { value: '1', label: 'Success' },
                                                    { value: '0', label: 'Fail' }
                                                ]}
                                            />
                                        </CIMSFormLabel>
                                    </Grid>
                                    <Grid item container>
                                        <SelectFieldValidator
                                            id={`${id}_detail_select`}
                                            options={dfltTraceDetailList && dfltTraceDetailList.map(item => (
                                                { value: item.otherId, label: `${item.engDesc}` }
                                            ))}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Detail</>
                                            }}
                                            value={detail.codSppDfltTrcCntctDetlId}
                                            onChange={(e) => handleOnChange('codSppDfltTrcCntctDetlId', e.value)}
                                        />
                                    </Grid>
                                    <Grid item container>
                                        <FastTextField
                                            id={id + '_detail_remark'}
                                            value={detail.rmrk}
                                            inputProps={{ maxLength: 2000 }}
                                            calActualLength
                                            multiline
                                            rows={'4'}
                                            label={<>Remarks</>}
                                            onBlur={(e) => handleOnChange('rmrk', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item container>
                                        <CIMSFormLabel
                                            fullWidth
                                            labelText={<>Contact Time<RequiredIcon /></>}
                                            className={classes.formLabelContainer}
                                        >
                                            <Grid item container wrap="nowrap" spacing={1}>
                                                <Grid item container xs={7}>
                                                    <DateFieldValidator
                                                        style={{ width: 'inherit' }}
                                                        id={`${id}_contact_date`}
                                                        value={detail.cntctDate}
                                                        placeholder=""
                                                        onChange={e => handleOnChange('cntctDate', e)}
                                                        isRequired
                                                        absoluteMessage
                                                        validators={[ValidatorEnum.required]}
                                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                    />
                                                </Grid>
                                                <Grid item container xs={5}>
                                                    <TimeFieldValidator
                                                        id={`${id}_contact_time`}
                                                        helperText=""
                                                        value={detail.cntctTime}
                                                        placeholder=""
                                                        onChange={e => handleOnChange('cntctTime', e)}
                                                        views={['hours', 'minutes', 'seconds']}
                                                        format={Enum.TIME_FORMAT_24_HOUR_HMS}
                                                        isRequired
                                                        absoluteMessage
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CIMSFormLabel>
                                    </Grid>
                                </Grid>
                            </ValidatorForm>
                        </Grid>
                        <Grid item container justify={'flex-end'}>
                            <CIMSButtonGroup
                                customStyle={{
                                    position: 'unset',
                                    right: 0,
                                    width: 'auto',
                                    zIndex: 999,
                                    padding: 0
                                }}
                                buttonConfig={
                                    [
                                        {
                                            id: `${id}_save_button`,
                                            name: 'Save',
                                            onClick: handleSave
                                        },
                                        {
                                            id: `${id}_cancel_button`,
                                            name: 'Cancel',
                                            onClick: () => closeCnctDetail(false)
                                        }
                                    ]
                                }
                            />
                        </Grid>
                    </Grid>
                }
            />
        </Grid>
    );
};


const CnctHistoryDialog = (props) => {
    const { id, open, dfltTraceRec, onClose, dfltTraceDetailList, sppDfltCntctHx } = props;
    const classes = styles();
    const [opType, setOpType] = React.useState(null);
    const [openCnctDetail, setOpenCnctDetail] = React.useState(false);
    const [cnctHxList, setCnctHxList] = React.useState(null);
    const [selected, setSelected] = React.useState(null);
    const gridRef = React.useRef(null);
    const col =
        [
            {
                field: 'cntctTime', headerName: 'Contact Time', width: 300, maxWidth: 300,
                valueFormatter: (params) => {
                    return moment(params.value).format(Enum.DATE_FORMAT_24);
                }
            },
            {
                field: 'codSppDfltTrcCntctDetlId', headerName: 'Contact Detail', width: 300, maxWidth: 300,
                valueFormatter: (params) => {
                    let cnctDetail = dfltTraceDetailList.find(x => x.otherId === params.value);
                    return cnctDetail ? cnctDetail.engDesc || '' : '';
                }
            },
            {
                field: 'isCntctSuccess', headerName: 'Contact Result', width: 300, maxWidth: 300,
                valueFormatter: (params) => {
                    return params.value ? 'Success' : 'Fail';
                }
            },
            {
                field: 'rmrk', headerName: 'Remark', width: 300, maxWidth: 300, tooltipField: 'rmrk'
            }
        ];

    const listDfltTrcCnctDetailList = () => {
        const { patientKey } = dfltTraceRec;
        props.sppDfltCntctHx(Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.LIST, patientKey, (data) => {
            setCnctHxList(data);
        });
    };

    React.useEffect(() => {
        listDfltTrcCnctDetailList();
    }, []);

    const handleCreateCnctHistory = () => {
        setOpType(Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.ADD);
        setOpenCnctDetail(true);
    };

    const closeCnctDetail = (needRefreshHx) => {
        setOpenCnctDetail(false);
        if (needRefreshHx) {
            listDfltTrcCnctDetailList();
        }
        if (gridRef.current) {
            gridRef.current.grid.api.deselectAll();
        }
        setSelected(null);
    };

    const handleEditCnctHistory = () => {
        setOpType(Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.UPDATE);
        setOpenCnctDetail(true);
    };

    const handleDeleteCnctHistory = () => {
        props.openCommonMessage({
            msgCode: '110073',
            params: [
                {
                    name: 'HEADER',
                    value: 'Delete Contact History Record'
                }
            ],
            btnActions: {
                btn1Click: () => {
                    props.sppDfltCntctHx(Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.DEL, selected.pmiSppDfltCntctHxId, () => {
                        closeCnctDetail(true);
                    });
                }
            }
        });

    };

    let timer = null;

    return (
        <Grid container>
            <CIMSPromptDialog
                open={open}
                id={id}
                paperStyl={classes.paper}
                dialogTitle={`${getFormatDHPMINO(dfltTraceRec.patientKey)} ${dfltTraceRec.engName}`}
                draggable
                dialogContentText={
                    <Grid container>
                        <Grid item container>
                            <CIMSButtonGroup
                                customStyle={{
                                    position: 'unset',
                                    right: 0,
                                    width: 'auto',
                                    zIndex: 999,
                                    padding: 0
                                }}
                                buttonConfig={
                                    [
                                        {
                                            id: `${id}_create_button`,
                                            name: 'Create',
                                            onClick: handleCreateCnctHistory
                                        },
                                        {
                                            id: `${id}_edit_button`,
                                            name: 'Edit',
                                            onClick: handleEditCnctHistory,
                                            disabled: !selected
                                        },
                                        {
                                            id: `${id}_delete_button`,
                                            name: 'Delete',
                                            onClick: handleDeleteCnctHistory,
                                            disabled: !selected
                                        }
                                    ]
                                }
                            />
                        </Grid>
                        <CIMSDataGrid
                            gridTheme="ag-theme-balham"
                            ref={gridRef}
                            divStyle={{
                                width: '100%',
                                height: '600px',
                                display: 'block'
                            }}
                            gridOptions={{
                                columnDefs: col,
                                rowData: cnctHxList,
                                rowSelection: 'single',
                                headerHeight: 46,
                                rowHeight: 46,
                                enableBrowserTooltips: true,
                                getRowNodeId: function (data) {
                                    return data.pmiSppDfltCntctHxId;
                                },
                                onGridReady: params => {
                                    // this.gridApi = params.api;
                                    // this.gridColumnApi = params.columnApi;
                                },
                                onRowClicked: params => {
                                    clearTimeout(timer);
                                    timer = setTimeout(() => {
                                        if (params) {
                                            let selectedRows = params.api.getSelectedRows();
                                            setSelected(selectedRows.length > 0 ? selectedRows[0] : null);
                                        }
                                    }, 200);
                                },
                                onRowDoubleClicked: params => {
                                    clearTimeout(timer);
                                    setSelected(params.data);
                                    handleEditCnctHistory();
                                },
                                suppressRowClickSelection: false
                            }}
                            suppressAutoGridWidth
                        />
                        <Grid item container justify={'flex-end'}>
                            <CIMSButton
                                id={`${id}_close_button`}
                                onClick={onClose}
                                children={'Close'}
                            />
                        </Grid>
                        {
                            openCnctDetail ?
                                <CnctDetailDialog
                                    id={`${id}_contact_detail_dialog`}
                                    openCnctDetail={openCnctDetail}
                                    closeCnctDetail={closeCnctDetail}
                                    dfltTraceRec={dfltTraceRec}
                                    dfltTraceDetailList={dfltTraceDetailList}
                                    opType={opType}
                                    selected={selected}
                                    sppDfltCntctHx={sppDfltCntctHx}
                                />
                                : null
                        }
                    </Grid>
                }
            />
        </Grid>
    );
};

const mapToState = (state) => {
    return {
        dfltTraceDetailList: state.common.commonCodeList.spp_dflt_trc_cntct_detl
    };
};

const dispatch = {
    sppDfltCntctHx,
    openCommonMessage
};


export default connect(mapToState, dispatch)(CnctHistoryDialog);