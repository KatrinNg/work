import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {
    Grid,
    FormControlLabel,
    Paper,
    Typography,
    Link,
    Tooltip
} from '@material-ui/core';
import _ from 'lodash';
import { PlaylistAddCheck } from '@material-ui/icons';
import CreateIcon from '@material-ui/icons/Create';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import {
    getAppointmentReport,
    updateState,
    listReminderList,
    editAppointment,
    selectAppointment
} from '../../../../store/actions/appointment/booking/bookingAction';
import { PageStatus as pageStatusEnum,BookMeans } from '../../../../enums/appointment/booking/bookingEnum';
import * as RegUtil from '../../../../utilities/registrationUtilities';
import { openCommonMessage, closeCommonMessage} from '../../../../store/actions/message/messageAction';
import Print from '@material-ui/icons/Print';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import '../../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';
import { CommonUtil, AppointmentUtil, CaseNoUtil, UserUtil } from '../../../../utilities';
import { auditAction } from '../../../../store/actions/als/logAction';
import DeleteApptDialog from './bookDialog/deleteApptDialog';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import { deleteSubTabs, skipTab, updateField as updateMainFrame,changeTabsActive } from '../../../../store/actions/mainFrame/mainFrameAction';
import doCloseFuncSrc from '../../../../constants/doCloseFuncSrc';
import {
    printPatientGumLabel
} from '../../../../store/actions/patient/patientAction';
import TracingMsgDialog from '../../../compontent/tracingMsgDialog';
import LabelButton from '../../../compontent/labelButton';
import {ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC} from '../../../../enums/enum';

const styles = (theme) => ({
    paperRoot: {
        backgroundColor: theme.palette.dialogBackground,
        padding: 4
    },
    iconBtnRoot: {
        marginLeft: 4,
        color: theme.palette.white
    },
    formlabelRoot: {
        marginLeft: 16
    },
    tableGrid: {
        backgroundColor: '#fff'
    },
    timeSlotBackdropRoot: {
        zIndex: 1200
    },
    timeslotModalRoot: {
        backgroundColor: '#fff',
        zIndex: 1201
    },
    confirmedPanel: {
        padding: '16px 18px',
        minHeight: 600 * theme.palette.unit
    },
    confirmedGrid: {
        borderBottom: '1px solid #b8bcb9',
        paddingTop: '10px'
    },
    customTableHeadRow: {
        fontWeight: 400,
        height: 40 * theme.palette.unit
    },
    customTableBodyCell: {
        fontSize: '14px'
    },
    buttonRoot: {
        margin: 2,
        padding: 0,
        height: 35 * theme.palette.unit
    },
    tableTitle: {
        fontWeight: 500,
        color: theme.palette.white
    },
    tableContainer: {
        padding: 2
    },
    gridTitle: {
        padding: '4px 0px'
    },
    contactHistoryIconButton: {
        padding: 4
    },
    dialogPaper2: {
        minWidth: '50%',
        maxWidth: '50%'
    },
    tooltip: {
        wordWrap: 'break-word'
    },
    dfltTraceContent: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block',
        whiteSpace: 'nowrap'
    }
});

class AppointmentHistory extends Component {
    constructor(props) {
        super(props);

        const { serviceCd, loginInfo } = this.props;

        const isAttenConfirmEcsEligibilitySiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, serviceCd, this.props.loginSiteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';
        const isCimsCounterBaseRole= UserUtil.hasSpecificRole(loginInfo.userDto, 'CIMS-COUNTER');
        this.state = {
            columnDefs: [
                {
                    field: 'appointmentDate', headerName: 'Appt. Date', minWidth: 124, valueFormatter: params => moment(params.data.appointmentDate).format(Enum.DATE_FORMAT_EDMY_VALUE),
                    comparator: this.dateTimeComparator,
                    height:46
                },
                {
                    field: 'apptTimeRange', headerName: 'Time', minWidth: 124, valueFormatter: (params) => {
                        let startTime = moment(params.data.apptDateTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
                        let endTime = params.data.apptDateEndTime && moment(params.data.apptDateEndTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) || '';
                        if (endTime) {
                            return `${startTime} - ${endTime}`;
                        } else {
                            return startTime;
                        }
                    }
                },
                {
                    field: 'attnStatusCd', headerName: 'Attn.', minWidth: 100,
                    valueFormatter: (params) => {
                        // if (params.value === Enum.ATTENDANCE_STATUS.ATTENDED) {
                        //     return 'Attended';
                        // } else if (params.value === Enum.ATTENDANCE_STATUS.NOT_ATTEND || '') {
                        //     if (params.data.arrivalTime) {
                        //         return 'Arrived';
                        //     } else {
                        //         return '';
                        //     }
                        // }
                        return AppointmentUtil.getAppointmentRecordStatus(params.value, params.data.arrivalTime);
                    }
                },
                {
                    field: 'svcCd', headerName: 'Service', minWidth: 124,
                    valueFormatter: (params) => {
                        if (serviceCd !== params.data.svcCd && isCimsCounterBaseRole) {
                            return 'DH';
                        }
                        return params.value;
                    }
                },
                {
                    field: 'clinicName', headerName: 'Site', minWidth: 216,
                    valueFormatter: (params) => {
                        if (serviceCd !== params.data.svcCd && isCimsCounterBaseRole) {
                            return 'DH Clinic';
                        }
                        return params.value;
                    }
                },
                {
                    field: 'encntrTypeDesc', headerName: 'Encounter Type', minWidth: 170,
                    valueFormatter: (params) => {
                        if (serviceCd !== params.data.svcCd && isCimsCounterBaseRole) {
                            return '--';
                        }
                        return params.value;
                    }
                },
                {
                    field: 'rmDesc', headerName: 'Room', minWidth: 124,
                    valueFormatter: (params) => {
                        if (serviceCd !== params.data.svcCd) {
                            return '--';
                        }
                        return params.value;
                    }
                },
                {
                    field: 'apptTypeCd', headerName: 'Appt. Type', minWidth: 124, valueGetter: (params) => {
                        if(serviceCd !== params.data.svcCd){
                            return '--';
                        }
                        return AppointmentUtil.getAppointmentTypeDesc(params.data.apptTypeCd, params.data.isSqueeze, params.data.isUrgSqueeze);
                    }
                },
                {
                    field: 'qtType', headerName: 'Quota Type', minWidth: 140, width: 140, valueFormatter: (params) => {
                        if (serviceCd !== params.data.svcCd) {
                            return '--';
                        }
                        const { quotaConfig } = this.props;
                        let list = CommonUtil.quotaConfig(quotaConfig);
                        if (!params.data.qtType) {
                            return 'Counter';
                        } else {
                            if (list.length > 0) {
                                let quota = list.filter(item => item.code === params.data.qtType);
                                return quota.length > 0 ? quota[0].engDesc : '';
                            } else {
                                return '';
                            }
                        }

                    }
                },
                {
                    field: 'contactHistory',
                    headerName: 'Contact History',
                    align: 'center',
                    minWidth: 163,
                    cellRenderer: 'contactHistoryRenderer',
                    cellStyle: { justifyContent: 'center', textAlign: 'center', display: 'flex', fontSize: '1.3em' }
                },
                {
                    field: 'reminderStatus',
                    headerName: 'Reminder',
                    align: 'center',
                    minWidth: 120,
                    cellRenderer: 'reminderRenderer'
                },
                {
                    field: 'specialRequest',
                    headerName: 'Spec. Req.',
                    align: 'center',
                    minWidth: 163,
                    cellRenderer: 'specialRequestRenderer'
                },
                {
                    field: 'caseNo',
                    headerName: 'Case No.',
                    minWidth: 146,
                    valueFormatter: params => {
                        if (serviceCd !== params.data.svcCd) {
                            return '--';
                        }
                        //return CaseNoUtil.getFormatCaseNo(params.value);
                        return CaseNoUtil.getCaseAlias(params.data);
                    }
                },
                {
                    field: 'createBy', headerName: 'Created By', minWidth: 146,
                    valueFormatter: (params) => {
                        if (serviceCd !== params.data.svcCd) {
                            return '--';
                        }
                        return params.value;
                    }
                }
            ],
            deleteReasonType: '',
            deleteReasonText: '',
            openTracingMsgDialog: false,
            defaulterTracingCaseCallback: null
        };

        if (isAttenConfirmEcsEligibility === '1') {
            this.state.columnDefs.splice(5, 0, ...[
                {
                    field: 'consult', headerName: 'Consult.', minWidth: 124, height:100,valueGetter: (params) => {
                        const isAttendedAppt=AppointmentUtil.isAttendedAppointment(params.data.attnStatusCd);
                        if (serviceCd !== params.data.svcCd) {
                            return '--';
                        }
                        if (isAttendedAppt === true) {
                            if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isEcsElig == true) {
                                return 'ECS';
                            } else if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isFeeSettled == true) {
                                return 'Paid';
                            }
                        } else if (isAttendedAppt === false) {
                            return 'Unpaid';
                        }
                    }
                },
                {
                    field: 'prescription', headerName: 'Prescription', minWidth: 160, valueGetter: (params) => {
                        const isAttendedAppt=AppointmentUtil.isAttendedAppointment(params.data.attnStatusCd);
                        if (serviceCd !== params.data.svcCd) {
                            return '--';
                        }
                        if (isAttendedAppt === true) {
                            if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isEcsElig == true) {
                                return 'Skip';
                            } else if (params.data.attendanceBaseVo && params.data.attendanceBaseVo.isFeeSettled == true) {
                                return 'Paid';
                            }
                        } else if (isAttendedAppt === false) {
                            return 'Unpaid';
                        }
                    }
                }
            ]);
        }
        if (serviceCd === 'SHS') {
            this.state.columnDefs.splice(5, 0, ...[
                {
                    field: '', headerName: 'Search Criteria', minWidth: 245,
                    valueGetter: (params) => {
                        const appointmentDetlBaseVoList = params.data.appointmentDetlBaseVoList || null;
                        if (appointmentDetlBaseVoList && appointmentDetlBaseVoList.length > 0) {
                            return AppointmentUtil.getAppointmentSearchCriteria(appointmentDetlBaseVoList[0].searchCriteria || '');
                        }
                    },
                    tooltipValueGetter: (params) => params.value,
                    cellRenderer: 'searchCriteriaRenderer'
                }
            ]);
            this.state.columnDefs.splice(13, 0, ...[
                {
                    field: 'dfltTrace', headerName: 'Defaulter Tracing', minWidth: 245,
                    valueGetter: (params) => {
                        const { dftTraceRsnList } = this.props;
                        if (params.data.dfltTraceRsnTypeId) {
                            let rsn = dftTraceRsnList && dftTraceRsnList.find(x => x.otherId === params.data.dfltTraceRsnTypeId);
                            if (rsn) {
                                return rsn.engDesc;
                            } else {
                                return '';
                            }
                        } else {
                            let remark = params.data.dfltTraceRsnRemark || '';
                            if (remark) {
                                let remarkArr = remark.split('\n');
                                let _remarkArr = [];
                                remarkArr.forEach(r => {
                                    if (r) {
                                        _remarkArr.push(r);
                                    }
                                });
                                let _remark = _remarkArr.join('\n');
                                return _remark;
                            } else {
                                return remark;
                            }
                        }
                    },
                    cellRenderer: 'dfltTraceRenderer',
                    tooltipValueGetter: (params) => params.value
                }
            ]);
        }
    }

    componentDidMount() {
        this.getPatientAppointmentHistory(false, false);
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props.patientInfo) !== JSON.stringify(prevProps.patientInfo) && this.props.patientInfo && this.props.patientInfo.patientKey) {
            const { allServiceChecked } = this.props;
            this.getPatientAppointmentHistory(allServiceChecked, false);
        }

        if (this.props.pageStatus !== prevProps.pageStatus) {
            this.gridApi && this.gridApi.refreshCells({ columns: ['contactHistory'], force: true });
            this.gridApi && this.gridApi.refreshCells({ columns: ['reminderStatus'], force: true });
            this.gridApi && this.gridApi.refreshCells({ columns: ['specialRequest'], force: true });
        }

        if (this.props.currentSelectedApptInfo !== prevProps.currentSelectedApptInfo) {
            if (this.props.currentSelectedApptInfo && this.props.currentSelectedApptInfo.appointmentId) {
                const selectedRow = this.gridApi && this.gridApi.getRowNode(this.props.currentSelectedApptInfo.appointmentId);
                selectedRow && selectedRow.setSelected(true);
            } else {
                this.gridApi && this.gridApi.deselectAll();
            }
        }
    }

    contactHistoryRenderer = (params) => {
        let rowData = params.data;
        let { pageStatus, serviceCd } = params.context;
        if (pageStatus === pageStatusEnum.EDIT) {
            return null;
        }
        if (rowData.svcCd !== serviceCd) {
            return null;
        }
        if (serviceCd === 'SPP' && !this.props.isSppEnable) {
            return null;
        }
        return (
            <Link
                id={'bookingInformation_historyGrid_addContactHistoryBtn_' + rowData.appointmentId}
                style={{
                    textDecoration: 'underline'
                    // pointerEvents: rowData.appointmentDate && moment(rowData.appointmentDate).isBefore(moment(), 'day') ? 'none' : 'auto'
                    // color: rowData.appointmentDate && moment(rowData.appointmentDate).isBefore(moment(), 'day') ? 'rgba(0, 0, 0, 0.38)' : '#0579c8'
                }}
                onClick={() => { this.props.openContactHistoryDialog(rowData); }}
            >
                {rowData.hasCntctHists === 'Y' ? <PlaylistAddCheck /> : <CreateIcon style={{ width: '1.3rem' }} />}
            </Link>
        );
    }

    specialRequestRenderer = (params) => {
        let rowData = params.data;
        let { pageStatus, serviceCd } = params.context;
        if (pageStatus === pageStatusEnum.EDIT) {
            return null;
        }
        if (rowData.svcCd !== serviceCd) {
            return null;
        }
        if (serviceCd === 'SPP' && !this.props.isSppEnable) {
            return null;
        }
        let specReqTypeObj = params.data.specialRqstDto ? this.props.specReqTypesList.find(item => params.data.specialRqstDto.specialRqstTypeId === item.specialRqstTypeId) : null;
        return (
            <Tooltip classes={{ tooltip: this.props.classes.tooltip }} title={params.data.specialRqstDto ? params.data.specialRqstDto.remark || '' : 'Add'}>
                <Link
                    id={'bookingInformation_historyGrid_addSpecialRequestBtn_' + rowData.appointmentId}
                    style={{
                        textDecoration: 'underline'
                        //display: 'block',
                        //textOverflow: 'ellipsis',
                        //overflow: 'hidden'
                        // pointerEvents: rowData.appointmentDate && moment(rowData.appointmentDate).isBefore(moment(), 'day') ? 'none' : 'auto',
                        // color: rowData.appointmentDate && moment(rowData.appointmentDate).isBefore(moment(), 'day') ? 'rgba(0, 0, 0, 0.38)' : '#0579c8'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.props.openSpecialRequestDialog(rowData);
                    }}
                >
                    {specReqTypeObj ? specReqTypeObj.specialRqstDesc : <CreateIcon style={{ width: '1.3rem' }} />}
                </Link>
            </Tooltip>
        );
    }

    reminderRenderer = (params) => {
        let rowData = params.data;
        let { pageStatus, serviceCd } = params.context;
        if (pageStatus === pageStatusEnum.EDIT) {
            return null;
        }
        if (rowData.svcCd !== serviceCd) {
            return null;
        }
        if (serviceCd === 'SPP' && !this.props.isSppEnable) {
            return null;
        }
        return (
            <Link
                id={'bookingInformation_historyGrid_reminder_link_' + rowData.appointmentId}
                // style={{ textDecoration: 'underline', pointerEvents: rowData.appointmentDate && moment(rowData.appointmentDate).isBefore(moment(), 'day') ? 'none' : 'auto', color: rowData.appointmentDate && moment(rowData.appointmentDate).isBefore(moment(), 'day') ? 'rgba(0, 0, 0, 0.38)' : '#0579c8' }}
                style={{
                    textDecoration: 'underline'
                }}
                onClick={(e) => {
                    // this.props.updateState({ currentSelectedApptInfo: rowData });
                    e.stopPropagation();
                    e.preventDefault();
                    //this.handleOpenReminderDialog(rowData);
                    this.props.openApptReminderDialog(rowData);
                }}
            >
                {rowData.hasReminder === 'Y' ?
                    <PlaylistAddCheckIcon />
                    :
                    <CreateIcon style={{ width: '1.3rem' }} />
                }

            </Link>
        );
    }

    searchCriteriaRenderer = (params) => {
        const appointmentDetlBaseVoList = params.data.appointmentDetlBaseVoList || null;
        if (appointmentDetlBaseVoList && appointmentDetlBaseVoList.length > 0) {

            const searchCriteria = AppointmentUtil.getAppointmentSearchCriteria(appointmentDetlBaseVoList[0].searchCriteria || '');
            let splitArr = searchCriteria.split('; ');
            return (
                <Grid container>
                    {splitArr.map((data, idx) => {
                        return (
                            <Grid container key={idx}>
                                {`${data.trim()}${idx !== splitArr.length - 1 ? ';' : ''}`}
                            </Grid>
                        );
                    })}
                </Grid>
            );
        } else {
            return null;
        }
    }

    dfltTraceRenderer = (params) => {
        const { dftTraceRsnList, classes } = this.props;
        if (params.data.dfltTraceRsnTypeId) {
            let rsn = dftTraceRsnList && dftTraceRsnList.find(x => x.otherId === params.data.dfltTraceRsnTypeId);
            if (rsn) {
                //return rsn.engDesc;
                return (
                    <Grid container className={classes.dfltTraceContent} style={{ verticalAlign: 'middle' }}>
                        {rsn.engDesc}
                    </Grid>
                );
            } else {
                return '';
            }
        } else {
            if (params.data.dfltTraceRsnRemark) {
                let contentArr = params.data.dfltTraceRsnRemark.split('\n');
                return (
                    <Grid container>
                        {contentArr.map((data, idx) => {
                            return (
                                <Grid container key={idx} className={classes.dfltTraceContent}>
                                    {`${data.trim()}`}
                                </Grid>
                            );
                        })}
                    </Grid>
                );
            } else {
                return null;
            }
        }
    }

    getPatientAppointmentHistory = (allService = false, clearSelect = true) => {
        if (clearSelect) {
            this.clearSelected();
        }
        const { patientInfo, futureApptId } = this.props;
        if (patientInfo && patientInfo.patientKey && patientInfo.patientKey > 0) {
            let params = { allService: allService };
            this.props.listAppointmentHistory(params, () => {
                this.gridApi && this.gridApi.redrawRows();
                if (futureApptId) {
                    const selectedRow = this.gridApi && this.gridApi.getRowNode(futureApptId);
                    if (selectedRow) {
                        // selectedRow.setSelected(true);
                        this.props.editAppointment(selectedRow.data);
                    }
                    this.props.updateState({ futureApptId: null });
                }
                this.gridApi && this.gridApi.refreshCells({ columns: ['contactHistory'], force: true });
                this.gridApi && this.gridApi.refreshCells({ columns: ['reminderStatus'], force: true });
                this.gridApi && this.gridApi.refreshCells({ columns: ['specialRequest'], force: true });
            });
        }
    }

    clearSelected = () => {
        this.props.updateState({ currentSelectedApptInfo: null });
        this.gridApi && this.gridApi.deselectAll();
        this.props.selectAppointment(null);
    }

    handleAllServiceOnChange = (event) => {
        this.props.updateState({ allServiceChecked: event.currentTarget.checked });
        this.getPatientAppointmentHistory(event.currentTarget.checked);
    }

    printReportSingleSlip = (appointment) => {
        const { curApptDetail } = appointment;
        let reportParam = {
            appointmentId: appointment.appointmentId,
            encounterTypeId: curApptDetail.encntrTypeId,
            // clinicCd: appointment.clinicCd,
            // encounterTypeCd: appointment.encounterTypeCd,
            patientKey: appointment.patientKey,
            rmId: curApptDetail.rmId,
            siteId: appointment.siteId,
            // subEncounterTypeCd: appointment.subEncounterTypeCd,
            slipType: 'Single',
            isShowDetail: true
        };
        this.props.getAppointmentReport(reportParam);
    }
    printReportMultipleSlip = () => {
        let reportParam = {
            allService: this.props.allServiceChecked,
            clinicCd: this.props.appointmentList.appointmentDtos[0].clinicCd,
            encounterTypeCd: this.props.appointmentList.appointmentDtos[0].encounterTypeCd,
            patientKey: this.props.patientInfo.patientKey,
            subEncounterTypeCd: this.props.appointmentList.appointmentDtos[0].subEncounterTypeCd,
            slipType: 'Multiple',
            allAppointment: true,
            isShowDetail: true
        };
        this.props.getAppointmentReport(reportParam);
    }

    markCurrentSelectedAppt = (data) => {
        let apptId = data.appointmentId;
        this.setState({ currentSelectedApptId: apptId });
    }

    handleCancelAppointment = (data) => {
        this.props.cancelAppointment(data);
    }

    handleDeleteAppointment = (reasonType, reasonText) => {
        const { serviceCd, patientInfo, allServiceChecked } = this.props;
        if (patientInfo && patientInfo.patientKey && patientInfo.patientKey > 0) {
            let listParams = {
                withPMIDetls: false,
                allService: allServiceChecked,
                withShowObsInfomation: false,
                svcCd: serviceCd,
                patientKey: patientInfo.patientKey
            };
            this.props.auditAction('Confirm Delete Appointment');
            this.props.deleteAppointment(reasonType, reasonText, listParams);
        }
    }

    refreshListAppointment = () => {
        this.getPatientAppointmentHistory();
    }

    handlePrintGumLabel = () => {
        this.props.handlePrintGumLabel();
    }

    handlePrintSPPGumLabel = (selectedCategory) => {
        this.props.handlePrintGumLabel(selectedCategory);
    };

    handlePrintEHSGumLabel = (confirmationForm) => {
        this.props.handlePrintGumLabel(null, confirmationForm);
    };

    handleTracingMsgDialogOk = () => {
        const { defaulterTracingCaseCallback } = this.state;
        defaulterTracingCaseCallback && defaulterTracingCaseCallback();
    }

    dateTimeComparator = (date1, date2) => {
        let d1 = moment(date1, 'YYYY-MM-DD');
        let d2 = moment(date2, 'YYYY-MM-DD');
        return d1.diff(d2, 'day');
    };

    getRowHeight = (params) => {
        let defaultHeight = 46;
        let rowHeight = 46;
        const rsnRsnRemark = params.data.dfltTraceRsnRemark;
        if (rsnRsnRemark) {
            let contentArr = rsnRsnRemark.split('\n');
            rowHeight = 26 * contentArr.length;
        }
        return rowHeight >= defaultHeight ? rowHeight : defaultHeight;
    }

    reRenderRowHeight = (params) => {
        params.api.forEachNode((rowNode) => {
            const height = this.getRowHeight(rowNode);
            rowNode.setRowHeight(height);
        });
        params.api.onRowHeightChanged();
        params.api.refreshCells({ columns: ['dfltTrace'], force: true });
    }

    render() {
        const {
            classes,
            patientInfo,
            appointmentList,
            pageStatus,
            currentSelectedApptInfo,
            isWalkIn = false,
            deleteReasonsList,
            appointmentHistory,
            isFromWaiting,
            isEnableCrossBookClinic,
            siteId,
            serviceCd,
            allServiceChecked,
            caseNoInfo,
            gumLabelPrintReqParams,
            isSppEnable
        } = this.props;

        const { openTracingMsgDialog } = this.state;

        const isCrossService = currentSelectedApptInfo && currentSelectedApptInfo.svcCd !== serviceCd;
        let columnDefs = CaseNoUtil.handleCaseNoSection(this.state.columnDefs, 'field', 'caseNo');
        return (
            <Paper className={classes.paperRoot}>
                <Grid
                    container
                    item
                    justify="space-around"
                    alignItems="center"
                    wrap="nowrap"
                    className={classes.gridTitle}
                >
                    <Grid style={{ flex: 1 }} item container alignItems="flex-end">
                        <Typography className={classes.tableTitle}>Appointment History</Typography>
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            className={classes.formlabelRoot}
                            control={
                                <CIMSCheckBox
                                    checked={allServiceChecked}
                                    onChange={this.handleAllServiceOnChange}
                                    color="primary"
                                    className={classes.iconBtnRoot}
                                    disabled={pageStatus === pageStatusEnum.EDIT}
                                />
                            }
                            label={<Typography className={classes.tableTitle}>All Services</Typography>}
                            disabled={pageStatus !== pageStatusEnum.VIEW}
                        />
                        <CIMSButton
                            id="booking_history_editBtn"
                            classes={{ sizeSmall: classes.buttonRoot }}
                            disabled={
                                isSppEnable?
                                !currentSelectedApptInfo ||
                                moment(currentSelectedApptInfo.apptDateTime).isBefore(moment(), 'day') ||
                                pageStatus !== pageStatusEnum.VIEW ||
                                currentSelectedApptInfo.attnStatusCd === 'Y' ||
                                isFromWaiting ||
                                !(isEnableCrossBookClinic || currentSelectedApptInfo.siteId === siteId) ||
                                isCrossService:true
                            }
                            onClick={() => {
                                this.props.auditAction('Click Edit Button In Appointment History', null, null, false, 'ana');
                                if (this.props.patientInfo && this.props.patientInfo.patientKey && !parseInt(this.props.patientInfo.deadInd)) {
                                    const isOtherEncntrGrpAppt = AppointmentUtil.checkIsOtherEncntrGrpAppt(caseNoInfo, currentSelectedApptInfo,serviceCd,patientInfo);
                                    if (isOtherEncntrGrpAppt) {
                                        this.props.openCommonMessage({
                                            msgCode: '110167',
                                            btnActions: {
                                                btn1Click: () => {
                                                    new Promise((resolve) => {
                                                        this.props.closeCommonMessage();
                                                        resolve();
                                                    }).then(() => {
                                                        // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
                                                        // let isNotCounterRole = CommonUtil.checkingIsNotCounterRole(this.props.loginUserRoleList);
                                                        // if (isNotCounterRole) {
                                                        //     const { subTabs, deleteSubTabs, changeTabsActive } = this.props;
                                                        //     let tabList = _.cloneDeep(subTabs);
                                                        //     let delFunc = (deep, name) => {
                                                        //         if (parseInt(deep) === 2) {
                                                        //             deleteSubTabs(name);
                                                        //         }
                                                        //     };
                                                        //     this.props.updateMainFrame({
                                                        //         curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON
                                                        //     });
                                                        //     CommonUtil.closeAllTabs(tabList, delFunc, changeTabsActive, doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON).then(result => {
                                                        //         if (result) {
                                                        //             this.props.skipTab(AccessRightEnum.patientSummary);
                                                        //         }
                                                        //         this.props.updateMainFrame({
                                                        //             curCloseTabMethodType: null
                                                        //         });
                                                        //     });
                                                        // } else {
                                                        //     this.props.skipTab(AccessRightEnum.patientSummary);
                                                        // }
                                                        this.props.skipTab(AccessRightEnum.patientSummary);
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        const isTrace = currentSelectedApptInfo.isTrace;
                                        if (isTrace === 1) {
                                            const defaulterTracingCaseCallback = () => {
                                                this.props.editAppointment(currentSelectedApptInfo);
                                                this.setState({ openTracingMsgDialog: false, defaulterTracingCaseCallback: null });
                                            };
                                            this.setState({ openTracingMsgDialog: true, defaulterTracingCaseCallback });
                                        } else {
                                            this.props.editAppointment(currentSelectedApptInfo);
                                        }
                                    }

                                } else {
                                    this.props.openCommonMessage({
                                        msgCode: '115571',
                                        variant: 'error'
                                    });
                                }
                            }}
                        >Edit</CIMSButton>
                        <CIMSButton
                            id="booking_history_deleteBtn"
                            classes={{ sizeSmall: classes.buttonRoot }}
                            disabled={
                                isSppEnable?
                                !currentSelectedApptInfo ||
                                moment(currentSelectedApptInfo.apptDateTime).isBefore(moment(), 'day') ||
                                //currentSelectedApptInfo.statusCd !== 'A' ||
                                pageStatus !== pageStatusEnum.VIEW ||
                                currentSelectedApptInfo.attnStatusCd === 'Y' ||
                                isFromWaiting ||
                                !(isEnableCrossBookClinic || currentSelectedApptInfo.siteId === siteId) ||
                                isCrossService:true
                            }
                            onClick={() => {
                                this.props.auditAction('Click Delete Button In Appointment History', null, null, false, 'ana');
                                if (currentSelectedApptInfo.isTrace === 1) {
                                    const defaulterTracingCaseCallback = () => {
                                        this.setState({ deleteReasonDialogOpen: true, defaulterTracingCaseCallback: null, openTracingMsgDialog: null });
                                    };
                                    this.setState({ openTracingMsgDialog: true, defaulterTracingCaseCallback });
                                } else {
                                    this.setState({ deleteReasonDialogOpen: true });
                                }
                                // this.handleCancelAppointment(currentSelectedApptInfo);
                            }}
                        >Delete</CIMSButton>
                        {/* <CIMSButton
                            id={'booking_history_reminderBtn'}
                            classes={{ sizeSmall: classes.buttonRoot }}
                            onClick={() => this.handleOpenReminderDialog(this.props.currentSelectedApptInfo)}
                            disabled={
                                !currentSelectedApptInfo ||
                                pageStatus !== pageStatusEnum.VIEW ||
                                currentSelectedApptInfo.statusCd === 'C'
                            }
                        >Reminder</CIMSButton> */}
                        {/*
                        <CIMSButton
                            id="booking_history_printBtn"
                            classes={{ sizeSmall: classes.buttonRoot }}
                            disabled={pageStatus === pageStatusEnum.EDIT || !currentSelectedApptInfo}
                            onClick={() => this.printReportSingleSlip(currentSelectedApptInfo)}
                        >Print</CIMSButton>
                        <CIMSButton
                            id="booking_history_printAllBtn"
                            classes={{ sizeSmall: classes.buttonRoot }}
                            disabled={!patientInfo || !appointmentList || appointmentList.length <= 0}
                            onClick={this.printReportMultipleSlip}
                        >Print All</CIMSButton>
                        */}
                        <CIMSButton
                            id="booking_history_printBtn"
                            classes={{ sizeSmall: classes.buttonRoot }}
                            disabled={pageStatus === pageStatusEnum.EDIT || !currentSelectedApptInfo || isCrossService}
                            // disabled={disableEdit}
                            onClick={() => {
                                this.props.auditAction('Print Appointment Slip');
                                this.printReportSingleSlip(currentSelectedApptInfo);
                            }}
                        >Print</CIMSButton>
                        <CIMSButton
                            id="booking_history_printAllBtn"
                            classes={{ sizeSmall: classes.buttonRoot }}
                            disabled={!patientInfo || !appointmentList || appointmentList.length <= 0 || appointmentList.filter(x => x.svcCd !== serviceCd) > 0}
                            style={{ display: 'none' }}
                        >Print All</CIMSButton>
                        <LabelButton
                            id={'booking_print_gum_label_button'}
                            handlePrintGumLabel={this.handlePrintGumLabel}
                            handlePrintSPPGumLabel={this.handlePrintSPPGumLabel}
                            handlePrintEHSGumLabel={this.handlePrintEHSGumLabel}
                            svcCd={serviceCd}
                            isShowButton={isWalkIn}
                            classes={{ sizeSmall: classes.buttonRoot }}
                            children={<><Print className={classes.rightIcon} />Label</>}
                            auditAction={this.props.auditAction}
                        />
                    </Grid>
                </Grid>
                <Grid container className={classes.tableGrid} >
                    <Grid
                        item
                        container
                        className={classes.tableContainer}
                    >
                        <div style={{ width: '100%' }} id={'bookingHistoryDataGrid'}>
                            <CIMSDataGrid
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    height: '600px',
                                    display: 'block'
                                }}
                                gridOptions={{
                                    // columnDefs: this.state.columnDefs,
                                    columnDefs: columnDefs,
                                    rowData: appointmentHistory,
                                    // suppressRowClickSelection: pageStatus === pageStatusEnum.EDIT ? true : false,
                                    rowSelection: 'single',
                                    rowDeselection: true,
                                    rowMultiSelectWithClick: pageStatus === pageStatusEnum.EDIT ? false : true,
                                    //rowHeight: 46,
                                    headerHeight: 46,
                                    getRowHeight:this.getRowHeight,
                                    animateRows:true,
                                    onGridReady: params => {
                                        this.gridApi = params.api;
                                        this.gridColumnApi = params.columnApi;
                                    },
                                    onRowDataUpdated:params=>{
                                        this.reRenderRowHeight(params);
                                    },
                                    getRowStyle: params => {
                                        let rowStyle = null;
                                        let apptDate = moment(params.data.apptDateTime).startOf('day');
                                        let now = moment().startOf('day');
                                        let diff = apptDate - now;
                                        if (diff < 0) {
                                            rowStyle = {
                                                backgroundColor: '#e0e0e0'
                                            };
                                        }
                                        return rowStyle;
                                    },
                                    frameworkComponents: {
                                        contactHistoryRenderer: this.contactHistoryRenderer,
                                        reminderRenderer: this.reminderRenderer,
                                        specialRequestRenderer: this.specialRequestRenderer,
                                        searchCriteriaRenderer:this.searchCriteriaRenderer,
                                        dfltTraceRenderer:this.dfltTraceRenderer
                                    },
                                    onRowClicked: () => {
                                        if (this.props.bookingData.qtType !== 'W' && pageStatus !== pageStatusEnum.EDIT) {
                                            let selectedData = this.gridApi.getSelectedRows()[0];

                                            if(selectedData){
                                                this.props.updateState({ currentSelectedApptInfo: selectedData });
                                                this.props.selectAppointment(selectedData);
                                            }else{
                                                this.props.selectAppointment(selectedData);
                                                setTimeout(()=>{
                                                    this.props.updateState({
                                                        currentSelectedApptInfo: selectedData,
                                                        appointmentMode: ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC.indexOf(serviceCd) > -1 ? BookMeans.MULTIPLE : BookMeans.SINGLE
                                                    });
                                                },300);
                                            }
                                            this.props.resetDaysOfWeek();
                                        }
                                    },
                                    onCellFocused: e => {
                                        if (pageStatus !== pageStatusEnum.VIEW ) {
                                            e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                        }
                                        else {
                                            e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                        }
                                    },
                                    // onRowSelected: event => {
                                    //     let selectedData = event.api.getSelectedRows()[0];
                                    //     this.props.updateState({ currentSelectedApptInfo: selectedData });
                                    //     this.props.selectAppointment(selectedData);
                                    // },
                                    onRowDoubleClicked: params => {
                                        if (serviceCd === 'SPP' && !isSppEnable) {
                                            return;
                                        }
                                        let selectedData = params && params.data;
                                        //         !(isEnableCrossBookClinic || currentSelectedApptInfo.siteId === siteId) ||
                                        // isCrossService
                                        const isCrossService = selectedData && selectedData.svcCd !== serviceCd;
                                        if (selectedData && !isCrossService
                                            && (isEnableCrossBookClinic || selectedData.siteId === siteId)
                                            && pageStatus === pageStatusEnum.VIEW
                                            && selectedData.attnStatusCd !== 'Y'
                                            && !moment(selectedData.apptDateTime).isBefore(moment(), 'day')) {
                                            const selectedRow = this.gridApi && this.gridApi.getRowNode(selectedData.appointmentId);
                                            if (selectedRow) {
                                                // selectedRow.setSelected(true);
                                                const isOtherEncntrGrpAppt = AppointmentUtil.checkIsOtherEncntrGrpAppt(caseNoInfo, selectedData,serviceCd,patientInfo);
                                                if (isOtherEncntrGrpAppt) {
                                                    this.props.openCommonMessage({
                                                        msgCode: '110167',
                                                        btnActions: {
                                                            btn1Click: () => {
                                                                new Promise((resolve) => {
                                                                    this.props.closeCommonMessage();
                                                                    resolve();
                                                                }).then(() => {
                                                                    // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
                                                                    // let isNotCounterRole = CommonUtil.checkingIsNotCounterRole(this.props.loginUserRoleList);
                                                                    // if (isNotCounterRole) {
                                                                    //     const { subTabs, deleteSubTabs, changeTabsActive } = this.props;
                                                                    //     let tabList = _.cloneDeep(subTabs);
                                                                    //     let delFunc = (deep, name) => {
                                                                    //         if (parseInt(deep) === 2) {
                                                                    //             deleteSubTabs(name);
                                                                    //         }
                                                                    //     };
                                                                    //     this.props.updateMainFrame({
                                                                    //         curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON
                                                                    //     });
                                                                    //     CommonUtil.closeAllTabs(tabList, delFunc, changeTabsActive, doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON).then(result => {
                                                                    //         if (result) {
                                                                    //             this.props.skipTab(AccessRightEnum.patientSummary);
                                                                    //         }
                                                                    //         this.props.updateMainFrame({
                                                                    //             curCloseTabMethodType: null
                                                                    //         });
                                                                    //     });
                                                                    // } else {
                                                                    //     this.props.skipTab(AccessRightEnum.patientSummary);
                                                                    // }
                                                                    this.props.skipTab(AccessRightEnum.patientSummary);
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    this.props.updateState({ currentSelectedApptInfo: selectedData });
                                                    if (selectedData.isTrace === 1) {
                                                        const defaulterTracingCaseCallback = () => {
                                                            this.props.editAppointment(selectedData);
                                                            this.setState({ defaulterTracingCaseCallback: null, openTracingMsgDialog: false });
                                                        };
                                                        this.setState({ openTracingMsgDialog: true, defaulterTracingCaseCallback });
                                                    } else {
                                                        this.props.editAppointment(selectedData);
                                                    }
                                                }

                                            }
                                        }
                                        this.props.resetDaysOfWeek();
                                    },
                                    getRowNodeId: function (data) {
                                        return data.appointmentId;
                                    },
                                    context: {
                                        pageStatus: this.props.pageStatus,
                                        serviceCd: serviceCd
                                    },
                                    suppressColumnVirtualisation: true,
                                    ensureDomOrder: true,
                                    enableBrowserTooltips: true
                                }}
                                suppressAutoGridWidth
                            />
                        </div>
                    </Grid>
                </Grid>
                <DeleteApptDialog
                    id="booking"
                    open={this.state.deleteReasonDialogOpen}
                    deleteReasonType={this.state.deleteReasonType}
                    deleteReasonsList={deleteReasonsList}
                    deleteReasonText={this.state.deleteReasonText}
                    onChange={(value, name) => {
                        this.setState({ [name]: value });
                    }}
                    onDelete={() => {
                        this.handleDeleteAppointment(this.state.deleteReasonType, this.state.deleteReasonText);
                        this.setState({ deleteReasonDialogOpen: false, deleteReasonType: '', deleteReasonText: '' });
                    }}
                    onCancel={() => {
                        this.props.auditAction('Close Delete Appointment Dialog', null, null, false, 'ana');
                        this.setState({ deleteReasonDialogOpen: false, deleteReasonType: '', deleteReasonText: '' });
                    }}
                />
                {
                    this.props.serviceCd === 'SHS' && openTracingMsgDialog ?
                        <TracingMsgDialog
                            id={'defaulter_tracing_case_message_dialog'}
                            openTracingMsgDialog={openTracingMsgDialog}
                            handleTracingMsgDialogOk={this.handleTracingMsgDialogOk}
                        />
                    :null
                }
            </Paper>
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        appointmentList: state.bookingInformation.appointmentList,
        appointmentHistory: state.bookingInformation.appointmentHistory,
        isFromWaiting: state.bookingInformation.waitingList ? true : false,
        patientInfo: state.patient.patientInfo,
        pageStatus: state.bookingInformation.pageStatus,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        futureAppt: state.bookingInformation.futureAppt,
        futureApptId: state.bookingInformation.futureApptId,
        accessRights: state.login.accessRights,
        appointment: state.patient.appointmentInfo,
        siteId: state.login.clinic.siteId,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        deleteReasonsList: state.common.deleteReasonsList,
        quotaConfig: state.common.quotaConfig,
        specReqTypesList: state.bookingInformation.specReqTypesList,
        service: state.login.service,
        isEnableCrossBookClinic: state.bookingInformation.isEnableCrossBookClinic,
        loginInfo: state.login.loginInfo,
        allServiceChecked: state.bookingInformation.allServiceChecked,
        clinicConfig: state.common.clinicConfig,
        loginSiteId: state.login.clinic.siteId,
        bookingData: state.bookingInformation.bookingData,
        caseNoInfo: state.patient.caseNoInfo,
        subTabs: state.mainFrame.subTabs,
        dftTraceRsnList:state.common.commonCodeList.default_trace_reason,
        gumLabelPrintReqParams: state.patient.gumLabelPrintReqParams
    });
};

const mapDispatchtoProps = {
    printPatientGumLabel,
    getAppointmentReport,
    updateState,
    listReminderList,
    openCommonMessage,
    editAppointment,
    selectAppointment,
    auditAction,
    skipTab,
    updateMainFrame,
    deleteSubTabs,
    changeTabsActive,
    closeCommonMessage
};

export default connect(mapStatetoProps, mapDispatchtoProps, null, { forwardRef: true })(withStyles(styles)(AppointmentHistory));
