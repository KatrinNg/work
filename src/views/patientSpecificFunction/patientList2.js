import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
    Grid,
    Link
} from '@material-ui/core';
import memoize from 'memoize-one';
import FilterPatient from './component/filterPatient';
import CIMSButton from '../../components/Buttons/CIMSButton';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import * as PatientUtilities from '../../utilities/patientUtilities';
import Enum from '../../enums/enum';
import CommonRegex from '../../constants/commonRegex';
import {
    closeIdleTimeDialog
} from '../../store/actions/common/commonAction';
import { openMask, closeMask } from '../../store/actions/mainFrame/mainFrameAction';
import moment from 'moment';
import _ from 'lodash';
import LinkPatient from './component/linkPatient';
import {
    getPatientById,
    updateState as updatePatientState,
    getPatientEncounter,
    getPatientPUC,
    putPatientPUC,
    getLatestPatientEncntrCase
} from '../../store/actions/patient/patientAction';
import {
    searchPatientList,
    updatePatientListAttendanceInfo,
    resetAttendance,
    updatePatientListField,
    getPatientList,
    resetPatientListField,
    resetCondition,
    searchInPatientQueue,
    searchByAppointmentId,
    pucReasonLog,
    pucReasonLogs,
    checkPatientUnderCare,
    checkPatientName,
    printPatientList
} from '../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import { getAppointmentForAttend } from '../../store/actions/attendance/attendanceAction';
import { skipTab } from '../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { AppointmentUtil, CommonUtil, EnctrAndRmUtil, SiteParamsUtil } from '../../utilities';
import accessRightEnum from '../../enums/accessRightEnum';
import * as AppointmentUtilties from '../../utilities/appointmentUtilities';
import * as CaseNoUtil from '../../utilities/caseNoUtilities';
import * as BookingEnum from '../../enums/appointment/booking/bookingEnum';
import { eHRresetAll } from '../../store/actions/EHR/eHRAction';
import * as DateUtilities from '../../utilities/dateUtilities';
import { updateState as updateBookingState, getApptListRpt, getFamilyBooking } from '../../store/actions/appointment/booking/bookingAction';
import PatientSearchGroup from '../compontent/patientSearchGroup';
import PatientUnderCareDialog from './component/patientUnderCareDialog';
import PatientSearchDialog from '../compontent/patientSearchResultDialog';
import { PATIENT_LIST_SEARCH_NEXT_ACTION, ExportTypeOptions } from '../../enums/enum';
import FieldConstant from '../../constants/fieldConstant';
import { auditAction, alsLogAudit } from '../../store/actions/als/logAction';
import * as UserUtilities from '../../utilities/userUtilities';
import {
    patientPhonesBasic
} from '../../constants/registration/registrationConstants';
import SupervisorsApprovalDialog from '../../views/compontent/supervisorsApprovalDialog';
import NewPMISearchResultDialog from '../compontent/newPMISearchResultDialog';
import CreateIcon from '@material-ui/icons/Create';
import CIMSLightToolTip from '../../components/ToolTip/CIMSLightToolTip';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/PDF/CIMSPdfViewer';
import CIMSSelect from '../../components/Select/CIMSSelect';
import CommonMessage from '../../constants/commonMessage';
import { print } from '../../utilities/printUtilities';
import { updateState as updateAnonBookingState } from '../../store/actions/appointment/booking/bookingAnonymousAction';
import FamilyMemberDialog from '../appointment/booking/component/bookForm/familyMember/FamilyMemberDialog';
import { initFamilyMemberInfo } from '../../utilities/attendanceUtilities';
import { getTopPriorityOfSiteParams } from '../../utilities/commonUtilities';
import { getState } from '../../store/util';

const styles = theme => ({
    root: {
        display: 'flex',
        flexFlow: 'column',
        padding: '0px 10px'
    },
    filterRoot: {
        paddingTop: '10px'
    },
    filterForm: {
        minWidth: 180,
        maxWidth: 220
    },
    filterTable: {
        flex: 1
    },
    filterFieldRoot: {
        marginBottom: '15px'
    },
    radioRoot: {
        padding: '5px 12px'
    },
    customTableHeadCell: {
        backgroundColor: '#b8bcb9'
        //fontSize: '13px'
    },
    customTableBodyCell: {
        fontSize: '13px'
    },
    maleRowRoot: {
        background: `linear-gradient(${theme.palette.genderMaleColor.color}, ${theme.palette.genderMaleColor.transparent})`,
        backgroundColor: theme.palette.genderMaleColor.color,
        '&$rowHover': {
            backgroundColor: theme.palette.action.hover
        }
    },
    femaleRowRoot: {
        background: `linear-gradient(${theme.palette.genderFeMaleColor.color},${theme.palette.genderFeMaleColor.transparent})`,
        backgroundColor: theme.palette.genderFeMaleColor.color,
        '&$rowHover': {
            backgroundColor: theme.palette.action.hover
        }
    },
    unknownRowRoot: {
        background: `linear-gradient(${theme.palette.genderUnknownColor.color}, ${theme.palette.genderUnknownColor.transparent})`,
        backgroundColor: theme.palette.genderUnknownColor.color,
        '&$rowHover': {
            backgroundColor: theme.palette.action.hover
        }
    },
    deadRowRoot: {
        background: `linear-gradient(${theme.palette.deadPersonColor.color}, ${theme.palette.deadPersonColor.transparent})`,
        backgroundColor: theme.palette.deadPersonColor.color,
        color: 'white'
    },
    deadBodyRoot: {
        color: theme.palette.deadPersonColor.fontColor
    },
    dialogPaper: {
        width: '80%'
    }
});

class StatusRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;
        let allowReset = false;
        let apptStr = moment(new Date(rowData.appointmentTime)).format(Enum.DATE_FORMAT_EDMY_VALUE);
        let status = rowData.status;
        allowReset = rowData.statusCd === Enum.ATTENDANCE_STATUS.ATTENDED && apptStr === moment().format(Enum.DATE_FORMAT_EDMY_VALUE);
        return (
            allowReset === true ?
                <CIMSLightToolTip
                    title={CommonMessage.RESET_ATTENDANCE_TOOLTIP()}
                >
                    <Link
                        component={'button'}
                        style={{ fontSize: '1rem' }}
                        onClick={() => {
                            this.props.handleStatusClick(rowData);
                        }}
                    >
                        {status}
                    </Link>
                </CIMSLightToolTip>
                :
                <Grid>
                    {/* {rowData.statusCd === Enum.ATTENDANCE_STATUS.ATTENDED || rowData.arrivalTime === '' ? status : 'Arrived'} */}
                    {AppointmentUtil.getAppointmentRecordStatus(rowData.statusCd, rowData.arrivalTime || '')}
                </Grid>
        );
    }
}

class FamilyNoRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { patientKey, pmiGrpName } = this.props.data;
        const patientQueueDtos = getState(state => state.patientSpecFunc?.patientQueueList?.patientQueueDtos) ?? [];
        const patientSpec = patientQueueDtos?.find(item => item.patientKey === patientKey);
        const isChief = patientSpec?.patientDto?.cgsSpecOut?.isChief ?? false;

        return (
            <>
                <span>{pmiGrpName}</span>
                <span style={{ fontSize: '24px' }}>{isChief ? '*' : ''}</span>
            </>
        );
    }
}

class ActionRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let rowData = this.props.data;
        let isFutureAppt = AppointmentUtilties.isFutureAppointment(rowData);
        let isLinkPMI = rowData.patientKey < 0 && !isFutureAppt;
        return (
            <>
                <CIMSButton
                    id={(isLinkPMI ? 'patientlist_linkPmi_' : 'patientlist_select_') + rowData.appointmentId}
                    style={{
                        minHeight: '35px',
                        maxHeight: '35px',
                        minWidth: isLinkPMI ? '45px' : null,
                        maxWidth: isLinkPMI ? '45px' : null

                    }}
                    onClick={e => {
                        if (isLinkPMI) {
                            this.props.handleLinkPMI(e, rowData);
                        }
                        else {
                            if (isFutureAppt)
                                this.props.selectFutureAppointment(rowData);
                            else
                                this.props.selectAppointment(rowData);
                        }
                    }}
                >
                    {isLinkPMI ? 'Link' : 'Select'}
                </CIMSButton>
                {isLinkPMI ?
                    <CIMSButton
                        style={{
                            minHeight: '35px',
                            maxHeight: '35px',
                            minWidth: '35px',
                            maxWidth: '35px'
                        }}
                        onClick={e => {
                            e.preventDefault();
                            this.props.selectFutureAppointment(rowData);
                        }}
                    >
                        <CreateIcon />
                    </CIMSButton> : null}
            </>
        );
    }
}


class PatientListViewer extends Component {
    render() {
        const { id, classes, previewData, openPatientListViewer, exportType } = this.props;
        return (
            <CIMSPromptDialog
                open={openPatientListViewer}
                dialogTitle={'Preview'}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={
                    <CIMSPdfViewer
                        id={`${id}_gumLabel_pdfViewer`}
                        position={'vertical'}
                        previewData={previewData ? previewData : null}
                    />
                }
                dialogActions={
                    <Grid container justify="flex-end" spacing={1}>
                        <Grid item container alignItems="center" xs={2}>
                            <CIMSSelect
                                id={id + '_exportType'}
                                options={ExportTypeOptions}
                                value={exportType}
                                onChange={e => this.props.updateParent({ exportType: e.value })}
                                TextFieldProps={{
                                    label: 'Export Type',
                                    variant: 'outlined',
                                    InputLabelProps: { shrink: true }
                                }}
                                addNullOption={false}
                            />
                        </Grid>
                        <Grid item>
                            <CIMSButton
                                id={id + '_downloadBtn'}
                                disabled={!exportType}
                                onClick={() => {
                                    this.props.auditAction('Calendar View Apptlist View Dialog Download');
                                    this.props.download();
                                }}
                                children="Download"
                            />
                            <CIMSButton
                                id={id + '_print'}
                                disabled={!previewData}
                                onClick={() => {
                                    this.props.auditAction('Calendar View Apptlist View Dialog Print');
                                    const printParam = {
                                        base64: previewData,
                                        callback: () => {
                                            this.props.closePreviewDialog();
                                        }
                                    };
                                    print(printParam);
                                }}
                                children="Print"
                            />
                            <CIMSButton
                                id={id + '_cancel'}
                                onClick={() => {
                                    this.props.auditAction('Calendar View Apptlist View Dialog Cancel');
                                    //this.props.auditAction('Close Preview gum label dialog', null, null, false, 'clinical-doc');
                                    //this.setState({ previewDialogOpen: false });
                                    this.props.closePreviewDialog();
                                }}
                                children="Cancel"
                            />
                        </Grid>
                    </Grid>
                }
            />
        );
    }
}

class PatientList2 extends Component {

    constructor(props) {
        super(props);

        const { listConfig } = props;
        let columnDefs = [];
        let callbacks = {
            handleStatusClick: this.handleStatusClick,
            handleLinkPMI: this.handleLinkPMI,
            selectFutureAppointment: this.selectFutureAppointment,
            selectAppointment: this.selectAppointment
        };
        if (listConfig && listConfig.PATIENT_LIST) {
            const list = listConfig.PATIENT_LIST.sort(function (a, b) {
                return b.site - a.site || a.displayOrder - b.displayOrder;
            });
            let _list = CaseNoUtil.handleCaseNoSection(list, 'labelCd', 'caseNo');
            columnDefs.push({
                headerName: '',
                colId: 'index',
                valueGetter: (params) => params.node.rowIndex + 1,
                minWidth: 55,
                maxWidth: 55,
                pinned: 'left',
                filter: false
            });
            for (let i = 0; i < _list.length; i++) {
                const { labelCd, labelName, labelLength, site } = _list[i];
                let col = {
                    headerName: labelName,
                    minWidth: labelLength,
                    //maxWidth: labelLength,
                    field: labelCd,
                    tooltipField: labelCd,
                    pinned: site === '1' ? 'left' : (site === '2' ? 'right' : null)
                };
                switch (labelCd) {
                    case 'age':
                        break;
                    case 'appointmentTime':
                        col = {
                            ...col,
                            field: 'appointmentTime',
                            minWidth: 170,
                            comparator: DateUtilities.dateComparator,
                            filter: 'agDateColumnFilter',
                            filterParams: {
                                comparator: DateUtilities.dateFilter,
                                browserDatePicker: true
                            }
                        };
                        break;
                    case 'arrivalTime':
                        col = {
                            ...col,
                            field: 'arrivalTime',
                            comparator: DateUtilities.dateComparator,
                            filter: 'agDateColumnFilter',
                            filterParams: {
                                comparator: DateUtilities.dateFilter,
                                browserDatePicker: true
                            }
                        };
                        break;
                    case 'familyNo':
                        col = {
                            ...col,
                            cellRenderer: 'familyNoRenderer'
                        };
                        break;
                    case 'caseNo':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                //return CaseNoUtil.getFormatCaseNo(params.value);
                                return CaseNoUtil.getCaseAlias(params.data);
                            },
                            tooltipField: undefined,
                            tooltip: params => params.valueFormatted
                        };
                        break;
                    case 'discNo':
                        break;
                    case 'encounterTypeCd':
                        col = {
                            ...col,
                            valueGetter: params => {
                                return params.data.encounterType;
                            },
                            tooltipField: undefined,
                            tooltip: params => params.value
                        };
                        break;
                    case 'hkic':
                        break;
                    case 'name':
                        break;
                    case 'nameChi':
                        col = {
                            ...col,
                            cellStyle: params => {
                                let cellStyle = {
                                    ...params.api.gridOptionsWrapper.gridOptions.defaultColDef.cellStyle(params),
                                    fontSize: '18px'
                                };
                                return cellStyle;
                            }
                        };
                        break;
                    case 'phoneNo':
                        break;
                    case 'remark':
                        break;
                    case 'status':
                        col = {
                            ...col,
                            field: 'status',
                            tooltipField: null,
                            minWidth: 100,
                            filterParams: {
                                filterOptions: [
                                    'empty',
                                    {
                                        displayKey: 'attended',
                                        displayName: 'Attended',
                                        test: function (filterValue, cellValue) {
                                            return cellValue === 'attended';
                                        },
                                        hideFilterInput: true
                                    },
                                    {
                                        displayKey: 'notAttend',
                                        displayName: 'Not Attend',
                                        test: function (filterValue, cellValue) {
                                            return cellValue === '';
                                        },
                                        hideFilterInput: true
                                    },
                                    'contains'
                                ],
                                suppressAndOrCondition: true
                            },
                            cellRenderer: 'statusRenderer',
                            cellRendererParams: callbacks
                        };
                        break;
                    case 'subEncounterTypeCd':
                        col = {
                            ...col,
                            valueGetter: params => {
                                return params.data.subEncounterType;
                            },
                            tooltipField: undefined,
                            tooltip: params => params.value
                        };
                        break;
                }
                columnDefs.push(col);
            }
            columnDefs.push({
                headerName: '',
                colId: 'action',
                minWidth: 130,
                maxWidth: 130,
                cellRenderer: 'actionRenderer',
                cellRendererParams: callbacks,
                cellStyle: () => {
                    let cellStyle = {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    };
                    return cellStyle;
                },
                filter: false,
                pinned: 'right'
            });
        }

        this.state = {
            patientList: {},
            columnDefs: columnDefs,
            rowData: [],
            lastRightDate: null,
            openPatientListViewer: false,
            patientListPreviewData: null,
            isOpenFamilyDialog: false,
            exportType: 'PDF'
        };

        this.refGrid = React.createRef();

        this.initDateRange();

        this.loadPatientPanelCallback.bind(this);
        this.resetPatientListCallback.bind(this);
    }

    componentDidMount() {
        this.landing = null;

        let searchParameter = _.cloneDeep(this.props.searchParameter);
        searchParameter.dateFrom = moment();
        searchParameter.dateTo = moment();
        this.getPatientQueueByPage(searchParameter);

        this.handleDefaultAttnStatus();
        // Get medical summary dropdown option list
        this.props.eHRresetAll();
        this.props.closeIdleTimeDialog();

        // this.setState({ rowData: this.props.patientQueueList.patientQueueDtos ? this.props.patientQueueList.patientQueueDtos : [] });



        // if (this.refGrid.current)
        //     this.refGrid.current.grid.api.onFilterChanged();
        // window.test = { ...window.test, refGrid: this.refGrid.current };

        let patSearchParam = this.resetPatSesarchParam();
        this.props.updatePatientListField({ patientSearchParam: patSearchParam });
    }

    shouldComponentUpdate(nextP) {
        if (nextP.tabsActiveKey !== this.props.tabsActiveKey && nextP.tabsActiveKey === accessRightEnum.patientSpec) {
            let searchParameter = _.cloneDeep(this.props.searchParameter);
            searchParameter.dateFrom = moment();
            searchParameter.dateTo = moment();
            this.getPatientQueueByPage(searchParameter);
            // this.resetPatSesarchParam();
            // this.searchGroupRef.autoFocus();
            // return false;
        }
        if (nextP.tabsActiveKey !== this.props.tabsActiveKey) {
            let patSearchParam = this.resetPatSesarchParam();
            this.props.updatePatientListField({ patientSearchParam: patSearchParam });
            // return false;
        }
        return true;
    }

    UNSAFE_componentWillUpdate(nextProps) {
        if ((this.props.searchNextAction !== nextProps.searchNextAction) && nextProps.searchNextAction) {
            const patientList = PatientUtilities.filterPatientList(nextProps.patientQueueList, {});
            switch (nextProps.searchNextAction) {
                // case PATIENT_LIST_SEARCH_NEXT_ACTION.ATTENDANCE: {
                //     if (patientList.patientQueueDtos[0].deadInd === '1') {
                //         this.skipToPatientSummary({ patientKey: patientList.patientQueueDtos[0].patientKey });
                //     } else {
                //         this.getPatientInfo(patientList.patientQueueDtos[0]);
                //         let isPastAppt = AppointmentUtilties.isPastAppointment(patientList.patientQueueDtos[0]);
                //         if (isPastAppt) {
                //             this.leadBackTakeAttendance(patientList.patientQueueDtos[0]);
                //         }
                //         else {
                //             this.leadAttendance(patientList.patientQueueDtos[0]);
                //         }
                //     }
                //     break;
                // }
                // case PATIENT_LIST_SEARCH_NEXT_ACTION.SUMMARY: {
                //     this.skipToPatientSummary({ patientKey: patientList.patientQueueDtos[0].patientKey, appointmentId: patientList.patientQueueDtos[0].appointmentId });
                //     this.handleResetButtonClick();
                //     break;
                // }
                case PATIENT_LIST_SEARCH_NEXT_ACTION.SELECT: {
                    let isFutureAppt = AppointmentUtilties.isFutureAppointment(patientList.patientQueueDtos[0]);
                    if (isFutureAppt) {
                        this.selectFutureAppointment(patientList.patientQueueDtos[0]);
                    }
                    else {
                        this.selectAppointment(patientList.patientQueueDtos[0]);
                    }
                    break;
                }
                case PATIENT_LIST_SEARCH_NEXT_ACTION.SEARCH_PATIENT: {
                    if (nextProps.searchList.length === 1) {
                        const userRoleType = nextProps.userRoleType;
                        if (nextProps.searchList[0].deadInd === '1') {
                            // this.skipToPatientSummary({ patientKey: nextProps.searchList[0].patientKey });
                            this.setLanding({ code: accessRightEnum.patientSummary });
                            this.getPatientInfo({ patientKey: nextProps.searchList[0].patientKey });
                            this.handleRetainDocType();
                        } else {
                            // console.log('[PUC] patient list search');
                            // if (nextProps.login.accessRights.find(item => item.name === accessRightEnum.openESAfterSelectedPatient)) {
                            //     this.skipToEncounterSummary({ patientKey: nextProps.searchList[0].patientKey });
                            // }
                            // //End added by Renny for own privilege open patient summary 20200618
                            // else if (userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
                            //     this.skipToPatientSummary({ patientKey: nextProps.searchList[0].patientKey });
                            //     this.handleResetButtonClick();
                            // } else {
                            this.getPatientInfo({ patientKey: nextProps.searchList[0].patientKey });
                            // }
                            this.props.updatePatientState({ patientList: [] });
                        }
                        //Added by Renny for own privilege open patient summary 20200618
                    } else if (nextProps.searchList.length === 0) {
                        const { patientSearchParam, patSearchTypeList } = this.props;
                        let searchTypeObj = patSearchTypeList.find(item => item.searchTypeCd === patientSearchParam.searchType);
                        this.props.openCommonMessage({
                            msgCode: '110137',
                            btnActions: {
                                btn1Click: () => {
                                    const params = {
                                        searchType: searchTypeObj.isDocType === 1 ? searchTypeObj.searchTypeCd : '',
                                        searchString: searchTypeObj.isDocType === 1 ? patientSearchParam.searchValue : '',
                                        action: 'createNew',
                                        redirectFrom: 'patientList'
                                    };
                                    this.props.skipTab(
                                        accessRightEnum.registration,
                                        params,
                                        true
                                    );
                                    this.handleRetainDocType();
                                    let patSearchParam = this.resetPatSesarchParam();
                                    this.props.updatePatientListField({ patientSearchParam: patSearchParam });
                                },
                                btn2Click: () => {
                                    this.handleRetainDocType();
                                }
                            }
                        });
                    }
                    // } else if (nextProps.searchList.length === 0) {
                    //     this.props.openCommonMessage({
                    //         msgCode: '110137',
                    //         btnActions: {
                    //             btn1Click: () => {
                    //                 setTimeout(() => {
                    //                     this.props.skipTab(accessRightEnum.registration, {}, true);
                    //                     this.handleResetButtonClick();
                    //                 }, 200);
                    //             },
                    //             btn2Click: () => {
                    //                 this.handleResetButtonClick();
                    //             }
                    //         }
                    //     });
                    // }
                    break;
                }
                case PATIENT_LIST_SEARCH_NEXT_ACTION.SEARCH_APPOINTMENT: {
                    this.resetPatSearchValue();
                    if (nextProps.searchAppointment && nextProps.searchAppointment.patientKey > 0) {
                        let today = moment().startOf('day');
                        let appointment = nextProps.searchAppointment;
                        let appointmentDate = moment(appointment.apptDateTime, Enum.DATE_FORMAT_EYMD_VALUE);
                        let appointmentAttended = appointment.attnStatusCd === 'Y';
                        if (appointmentDate.isBefore(today, 'day')) {
                            if (appointmentAttended) {
                                this.gotoSummary();
                                this.getPatientInfo(appointment);
                            }
                            else {
                                let isBackTakeExpired = AppointmentUtilties.isExpiryAllowBackTakeDate(this.props.clinicConfig, { serviceCd: this.props.clinic.serviceCd, siteId: this.props.clinic.siteId }, appointmentDate);
                                if (isBackTakeExpired) {
                                    this.gotoSummary();
                                    this.getPatientInfo(appointment);
                                }
                                else {
                                    this.setLanding({
                                        code: accessRightEnum.backTakeAttendacne,
                                        params: {
                                            ledByPastAppt: true,
                                            pastApptId: appointment.appointmentId,
                                            pastApptDate: appointment.appointmentDate
                                        }
                                    });
                                    this.getPatientInfo(appointment);
                                    // this.props.skipTab(accessRightEnum.backTakeAttendacne, {
                                    //     ledByPastAppt: true,
                                    //     pastApptId: appointment.appointmentId,
                                    //     pastApptDate: appointment.appointmentDate
                                    // });
                                }
                            }
                        }
                        else if (appointmentDate.isAfter(today, 'day')) {
                            this.selectFutureAppointment(appointment);
                        }
                        else {
                            if (appointmentAttended) {
                                this.gotoSummary();
                                this.getPatientInfo(appointment);
                            }
                            else {
                                this.setLanding({
                                    code: accessRightEnum.attendance,
                                    params: {
                                        rowData: appointment
                                    }
                                });
                                this.getPatientInfo(appointment);
                                // this.props.skipTab(accessRightEnum.attendance, { rowData: appointment });
                            }
                        }
                    }
                    else {
                        this.props.openCommonMessage({
                            msgCode: '130500',
                            showSnackbar: false,
                            btnActions: {
                                btn1Click: () => {
                                    this.props.updatePatientListField({ isFocusSearchInput: true });
                                }
                            }
                        });
                    }
                }
            }

            // this.setState({ patientList });

            // let filterCondition = _.cloneDeep(this.props.filterCondition);
            // filterCondition.attnStatusCd = Enum.ATTENDANCE_STATUS.ALL;
            // filterCondition.encounterTypeCd = '';
            // filterCondition.subEncounterTypeCd = '';
            // this.props.updatePatientListField({ searchNextAction: '', filterCondition: filterCondition });
            this.props.updatePatientListField({ searchNextAction: '' });
            // if (nextProps.searchList.length <= 1) {
            //     // this.searchInput.resetSearchBar();
            //     let patSearchParam = this.resetPatSesarchParam();
            //     this.props.updatePatientListField({ patientSearchParam: patSearchParam });
            // }
        } else {
            // if (nextProps.patientQueueList !== this.props.patientQueueList || nextProps.filterCondition !== this.props.filterCondition) {
            //     const patientList = PatientUtilities.filterPatientList(nextProps.patientQueueList, nextProps.filterCondition);
            //     this.setState({ patientList });
            // }
        }

        if (JSON.stringify(nextProps.patientQueueList) !== JSON.stringify(this.props.patientQueueList)
            || JSON.stringify(nextProps.filterCondition) !== JSON.stringify(this.props.filterCondition)) {
            if (this.refGrid.current) {
                let patientQueueList = PatientUtilities.filterPatientList(nextProps.patientQueueList, {}, this.props.countryList);
                this.setState({ rowData: patientQueueList.patientQueueDtos }, () => {
                    this.refGrid.current.grid.api.refreshCells({ columns: ['action'], force: true });
                    this.refGrid.current.grid.api.onFilterChanged();
                });
            }
        }
    }

    componentDidUpdate(prevProps) {
        // if (prevProps.filterCondition !== this.props.filterCondition) {
        //     if (this.refGrid.current)
        //         this.refGrid.current.grid.api.onFilterChanged();
        // }

        if (prevProps.tabsActiveKey === accessRightEnum.patientSpec && this.props.isFocusSearchInput) {
            this.props.updatePatientListField({ isFocusSearchInput: false });
            setTimeout(() => {
                if (this.searchGroupRef) {
                    this.searchGroupRef.autoFocus && this.searchGroupRef.autoFocus();
                }
            }, 50);
        }
    }

    componentWillUnmount() {
        // this.props.updatePatientListField({ isFocusSearchInput: true });
        // this.props.updatePatientListField({
        //     supervisorsApprovalDialogInfo: { staffId: '', open: false }
        // });
        if (this.refGrid.current) {
            this.refGrid.current.grid.api.destroy();
        }
        this.props.resetPatientListField();
    }

    initDateRange = () => {
        const dateRangeLimit = CommonUtil.getTopPriorityOfSiteParams(
            this.props.clinicConfig,
            this.props.service.serviceCd,
            this.props.clinic.siteId,
            'PATIENT_LIST_DATE_RANGE_LIMIT'
        );
        if (dateRangeLimit && dateRangeLimit.configValue && new RegExp(CommonRegex.VALIDATION_REGEX_ZERO_INTEGER).test(dateRangeLimit.configValue)) {
            this.props.updatePatientListField({ dateRangeLimit: parseInt(dateRangeLimit.configValue) });
        }
    }

    resetPatSesarchParam = () => {
        const { svcCd, siteId } = this.props.clinic;
        let target = CommonUtil.getHighestPrioritySiteParams(
            Enum.CLINIC_CONFIGNAME.PAT_SEARCH_TYPE_DEFAULT,
            this.props.clinicConfig,
            { siteId, serviceCd: svcCd }
        );

        let patSearchParam = { searchType: target.paramValue ? target.paramValue : Enum.DOC_TYPE.HKID_ID, searchValue: '' };
        return patSearchParam;
    }

    resetPatSearchValue = () => {
        let patientSearchParam = { ...this.props.patientSearchParam, searchValue: '' };
        this.props.updatePatientListField({ patientSearchParam: patientSearchParam, isFocusSearchInput: true });
    }

    customAction = (value, rowData) => {
        let isFutureAppt = AppointmentUtilties.isFutureAppointment(rowData);
        return (
            (rowData.patientKey < 0 && !isFutureAppt) ?
                <CIMSButton
                    id={'patientlist_linkPmi_' + rowData.appointmentId}
                    style={{ margin: 0, lineHeight: 'unset' }}
                    onClick={e => { this.handleLinkPMI(e, rowData); }}
                >Link PMI</CIMSButton> :
                <CIMSButton
                    id={'patientlist_select_' + rowData.appointmentId}
                    style={{ margin: 0, lineHeight: 'unset' }}
                    onClick={
                        () => {
                            if (isFutureAppt) {
                                this.selectFutureAppointment(rowData);
                            }
                            else {
                                this.selectAppointment(rowData);
                            }
                        }
                    }
                >Select</CIMSButton>
        );
    }

    // NOTE SELECT APPT.
    selectAppointment = (rowData) => {
        let resolved = false;
        const { loginInfo, getFamilyBooking } = this.props;
        this.props.auditAction('Select Appointment', 'Patient List', 'Patient List', false, 'ana');
        if (rowData.deadInd === '1') {
            // this.skipToPatientSummary(rowData);
            this.setLanding({ code: accessRightEnum.patientSummary });
            this.getPatientInfo(rowData);
            resolved = true;
        } else {
            //Added by Renny for own privilege open patient summary 20200618
            // if (this.props.login.accessRights.find(item => item.name === accessRightEnum.openESAfterSelectedPatient)) {
            //     this.skipToEncounterSummary(rowData);
            // }
            //End added by Renny for own privilege open patient summary 20200618
            // else if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
            if (!UserUtilities.isClinicalBaseRole(loginInfo.userDto)) {
                if (rowData.statusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND || rowData.statusCd === Enum.ATTENDANCE_STATUS.CANCELLED) {
                    getFamilyBooking(rowData, (familyBookingExists) => {
                        if (familyBookingExists) this.familyDialogToggle();
                        else {
                            initFamilyMemberInfo();
                            this.notAttendHandler(rowData);
                            resolved = true;
                        }
                    });
                } else if (rowData.statusCd === Enum.ATTENDANCE_STATUS.ATTENDED) {
                    // this.skipToPatientSummary(rowData);
                    this.setLanding({ code: accessRightEnum.patientSummary });
                    this.getPatientInfo(rowData);
                    this.handleRetainDocType();
                }
            }
            /*else if ([Enum.USER_ROLE_TYPE.NURSE, Enum.USER_ROLE_TYPE.DOCTOR].indexOf(this.props.userRoleType) > -1) {
                this.skipToEncounterSummary(rowData); //Added by Renny for nurse and doctor open patient summary 20200520
                // this.getPatientInfo(rowData);
            }*/
            else {
                this.getPatientInfo(rowData);
                resolved = true;
            }
        }
        //Added by Renny for own privilege open patient summary 20200618
        if (!resolved)
            this.gotoLanding();
    }

    notAttendHandler = (rowData) => {
        let isPastAppt = AppointmentUtilties.isPastAppointment(rowData);

        if (isPastAppt) {
            const where = { serviceCd: this.props.serviceCd, siteId: this.props.siteId };
            let notAllowBackTake = AppointmentUtilties.isExpiryAllowBackTakeDate(
                this.props.clinicConfig,
                where,
                rowData.appointmentDate
            );
            if (notAllowBackTake) {
                // this.skipToPatientSummary(rowData);
                this.setLanding({ code: accessRightEnum.patientSummary });
                this.getPatientInfo(rowData);
                this.handleRetainDocType();
            } else {
                this.setLanding({
                    code: accessRightEnum.backTakeAttendacne,
                    params: {
                        ledByPastAppt: true,
                        pastApptId: rowData.appointmentId,
                        pastApptDate: rowData.appointmentDate
                    }
                });
                this.getPatientInfo(rowData);
                // this.leadBackTakeAttendance(rowData);
            }
        } else {
            this.setLanding({
                code: accessRightEnum.attendance,
                params: { rowData }
            });
            this.getPatientInfo(rowData);
            // this.leadAttendance(rowData);
        }
    };

    getPatientQueueByPage(parameter) {
        let params = _.cloneDeep(parameter);

        if (!params.dateFrom) {
            params.dateFrom = moment();
            if (!params.dateTo || moment(params.dateTo).isBefore(moment(params.dateFrom))) {
                params.dateTo = params.dateFrom;
            }
        }

        const userRoleType = this.props.userRoleType;
        params.roleType = userRoleType;

        this.props.updatePatientListField({ searchParameter: params });
        params.dateFrom = moment(params.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE);
        params.dateTo = moment(params.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE);
        this.props.getPatientList(params);
    }

    searchInputOnBlur = (patSearchParam, isSearchable, smartCardData = null) => {
        // this.props.updatePatientState({ patientList: [] });
        // const patSearchParam = _.cloneDeep(this.props.patSearchParam);

        const { searchType, searchString } = patSearchParam;
        const searchParameter = _.cloneDeep(this.props.searchParameter);
        const userRoleType = this.props.userRoleType;
        if (searchString && isSearchable) {
            if (searchType !== 'APPTID') {
                if (searchType === FieldConstant.PATIENT_NAME_TYPE) {
                    this.props.checkPatientName(searchString, (data) => {
                        let hasPatient = data;
                        if (hasPatient) {
                            this.props.updatePatientListField({ supervisorsApprovalDialogInfo: { open: true, staffId: '' } });
                        } else {
                            this.props.openCommonMessage({
                                msgCode: '110137',
                                btnActions: {
                                    btn1Click: () => {
                                        const params = {
                                            action: 'createNew',
                                            redirectFrom: 'patientList'
                                        };
                                        this.props.skipTab(
                                            accessRightEnum.registration,
                                            params,
                                            true
                                        );
                                        this.handleRetainDocType();
                                        let patSearchParam = this.resetPatSesarchParam();
                                        this.props.updatePatientListField({ patientSearchParam: patSearchParam });
                                    },
                                    btn2Click: () => {
                                        this.handleRetainDocType();
                                    }
                                }
                            });
                        }
                    });
                } else {
                    let params = {
                        dateFrom: moment(searchParameter.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                        dateTo: moment(searchParameter.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
                        roleType: userRoleType,
                        searchStr: searchString,
                        docType: searchType
                    };

                    this.props.auditAction('Search Patient By Non-Appointment ID', 'Patient List');

                    const smartCardCallback = () => {
                        this.props.openCommonMessage({
                            msgCode: '110137',
                            btnActions: {
                                btn1Click: () => {
                                    const params = {
                                        action: 'createNew',
                                        redirectFrom: 'patientList',
                                        smartCardData: smartCardData
                                    };
                                    this.props.skipTab(
                                        accessRightEnum.registration,
                                        params,
                                        true
                                    );
                                    this.handleRetainDocType();
                                    let patSearchParam = this.resetPatSesarchParam();
                                    this.props.updatePatientListField({ patientSearchParam: patSearchParam });
                                },
                                btn2Click: () => {
                                    this.handleRetainDocType();
                                }
                            }
                        });
                    };

                    this.props.searchInPatientQueue(params, this.props.countryList, smartCardData ? smartCardCallback : null);
                }
            }
            else {
                let params = {
                    searchStr: searchString,
                    docType: searchType
                };
                this.props.auditAction('Search Patient By Appointment ID', 'Patient List');
                this.props.searchByAppointmentId(params);
            }
        }

    }

    searchInputOnChange = value => {
        const searchParameter = _.cloneDeep(this.props.searchParameter);
        const userRoleType = this.props.userRoleType;
        if (userRoleType && value) {
            let params = {
                dateFrom: moment(searchParameter.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
                dateTo: moment(searchParameter.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
                roleType: userRoleType,
                searchStr: value
            };
            this.props.searchInPatientQueue(params, this.props.countryList);
        }
    }

    handleFilterChange = (name, value) => {
        let filterCondition = _.cloneDeep(this.props.filterCondition);
        filterCondition.hkic = null;
        if (name === 'dateFrom' || name === 'dateTo') {
            let parameter = _.cloneDeep(this.props.searchParameter);
            parameter[name] = value;
            this.props.updatePatientListField({ searchParameter: parameter, filterCondition });
        } else if (name === 'attnStatusCd' || name === 'encounterTypeCd' || name === 'subEncounterTypeCd') {
            let _value = value === '*All' ? '' : value;
            filterCondition[name] = _value;
            this.props.updatePatientListField({ filterCondition });
        } else {
            filterCondition[name] = value;
            if (name === 'encounterTypeCd') {
                filterCondition.subEncounterTypeCd = '';
            }
            this.props.updatePatientListField({ filterCondition });
        }
    }

    handleFilterFocus = (name, value) => {
        if (name === 'dateFrom' || name === 'dateTo') {
            if (value && moment(value).isValid()) {
                this.setState({ lastRightDate: moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE) });
            }
        }
    }

    handleDateOpen = (name, value) => {
        if (value && moment(value).isValid()) {
            this.setState({ lastRightDate: moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE) });
        }
    }

    handleFilterBlur = (name, value) => {
        let filterCondition = _.cloneDeep(this.props.filterCondition);
        filterCondition.hkic = null;
        if (name === 'dateFrom' || name === 'dateTo') {
            let parameter = _.cloneDeep(this.props.searchParameter);
            parameter[name] = value || moment();
            if (name === 'dateFrom' && moment(parameter.dateTo).isBefore(moment(parameter[name]))) {
                parameter.dateTo = parameter[name];
            } else if (name === 'dateTo' && moment(parameter.dateFrom).isAfter(moment(parameter[name]))) {
                parameter.dateFrom = parameter[name];
            }
            // this.props.updatePatientListField({ searchParameter: parameter, filterCondition });
            if (moment(parameter.dateFrom).isValid() && moment(parameter.dateTo).isValid()) {
                if (moment(parameter.dateFrom) >= moment('1900-01-01')) {
                    if (moment(parameter.dateTo).diff(moment(parameter.dateFrom), 'day') < (this.props.dateRangeLimit || 1)) {
                        this.getPatientQueueByPage(parameter);
                    } else {
                        const { dateRangeLimit } = this.props;
                        this.props.updatePatientListField({
                            searchParameter: {
                                ...parameter,
                                [name]: moment(this.state.lastRightDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
                            }
                        });
                        this.setState({ lastRightDate: null });
                        this.props.openCommonMessage({
                            msgCode: '111303',
                            params: [
                                { name: 'HEADER', value: CommonUtil.getMenuNameByCd(accessRightEnum.patientSpec) },
                                { name: 'DATERANGE', value: dateRangeLimit }
                            ]
                        });
                    }
                }
            }
        }
    }

    loadPatientPhone = (selectedAppt) => {
        let contactPhone = _.cloneDeep(patientPhonesBasic);
        // let phone=[];
        // const {phnTypeCd,areaCd,dialingCd,cntctPhn}=selectedAppt;
        contactPhone.phoneTypeCd = selectedAppt.anonymousPatientDto.phnTypeCd;
        contactPhone.areaCd = selectedAppt.anonymousPatientDto.areaCd;
        contactPhone.dialingCd = selectedAppt.anonymousPatientDto.dialingCd || null;
        contactPhone.phoneNo = selectedAppt.anonymousPatientDto.cntctPhn || null;

        // phone.push(contactPhone);
        return contactPhone;
    }

    handleLinkPMI = (e, rowData) => {
        this.props.auditAction('Link PMI', 'Patient List', 'Patient List', false, 'ana');
        let selectedAppt = this.props.patientQueueList.patientQueueDtos.find(item => item.appointmentId === rowData.appointmentId);
        let contactPhone = this.loadPatientPhone(selectedAppt);
        let params = _.cloneDeep(this.props.linkParameter);
        params.hkidOrDoc = (rowData.hkic || '').trim();
        params.engSurname = rowData.engSurname;
        params.engGivename = rowData.engGivename;
        params.docTypeCd = rowData.docTypeCd;
        params.phoneNo = rowData.phoneNo;
        params.patientKey = rowData.patientKey;
        params.appointmentId = rowData.appointmentId;
        params.ctryCd = selectedAppt.anonymousPatientDto.ctryCd || null;
        params.areaCd = selectedAppt.anonymousPatientDto.areaCd;
        params.enCounter = rowData.encounterTypeCd;
        params.room = rowData.subEncounterTypeCd;
        params.apptTime = rowData.appointmentTime;
        params.dialingCd = selectedAppt.anonymousPatientDto.dialingCd || FieldConstant.DIALING_CODE_DEFAULT_VALUE;
        params.contactPhone = contactPhone;
        params.encounterTypeId = rowData.encounterTypeId;

        this.props.updatePatientListField({ linkParameter: params, openLinkPatient: true });
    }

    handleLinkClose = () => {
        this.props.updatePatientListField({ openLinkPatient: false });
    }

    handleLinkChange = (name, value) => {
        let params = _.cloneDeep(this.props.linkParameter);
        params[name] = value;
        this.props.updatePatientListField({ linkParameter: params });
    }


    handleResetButtonClick = () => {
        const { functionCd } = this.props;
        this.props.openMask({ functionCd });
        let searchParameter = _.cloneDeep(this.props.searchParameter);
        const userRoleType = this.props.userRoleType;
        searchParameter.dateFrom = moment();
        searchParameter.dateTo = moment();

        this.handleDefaultAttnStatus();
        let patSearchParam = this.resetPatSesarchParam();
        // this.props.updatePatientListField({ patientSearchParam: patSearchParam });

        this.props.updatePatientListField({ patientSearchParam: patSearchParam, isFocusSearchInput: true });
        this.getPatientQueueByPage(searchParameter);
        this.props.closeMask({ functionCd });

        this.refGrid.current.resetGrid();
    }

    handleRetainDocType = () => {
        const { functionCd } = this.props;
        this.props.openMask({ functionCd });
        let searchParameter = _.cloneDeep(this.props.searchParameter);
        this.resetPatSearchValue();
        this.getPatientQueueByPage(searchParameter);
        this.props.closeMask({ functionCd });

        this.refGrid.current.resetGrid();
    }

    handleStatusClick = (rowData) => {
        this.props.auditAction('Click Reset Attendance Action Link', 'Patient List', 'Patient List', false, 'ana');
        let encounterAndSubEncounter = `${rowData.encounterType} - ${rowData.subEncounterType}`;
        let tempApptDateTimeArr = rowData.appointmentTime.split(' ');
        let apptDateTime = AppointmentUtilties.combineApptDateAndTime({ appointmentDate: tempApptDateTimeArr[0], appointmentTime: tempApptDateTimeArr[1] });
        let params = [
            { name: 'DOC_NO', value: rowData.hkic },
            { name: 'ATTENDANCE_NAME', value: rowData.name },
            // { name: 'CASE_NO', value: CaseNoUtil.getFormatCaseNo(rowData.caseNo) },
            { name: 'ENCOUNTER_AND_SUB_ENCOUNTER', value: encounterAndSubEncounter },
            { name: 'APPOINTMENT_DATE_AND_TIME', value: apptDateTime }
        ];
        const useCaseNo = CommonUtil.isUseCaseNo();
        if (useCaseNo) {
            params.push({
                // name: 'CASE_NO', value: CaseNoUtil.getFormatCaseNo(rowData.caseNo) ? (CaseNoUtil.getFormatCaseNo(rowData.caseNo) + ';') : ''
                name: 'CASE_NO', value: CaseNoUtil.getCaseAlias(rowData) ? (CaseNoUtil.getCaseAlias(rowData) + ';') : ''
            });
        } else {
            params.push({
                name: 'CASE_NO', value: ''
            });
        }
        this.props.updatePatientListAttendanceInfo(rowData);
        this.props.openCommonMessage({
            msgCode: '111002',
            // params: [
            //     { name: 'DOC_NO', value: rowData.hkic },
            //     { name: 'ATTENDANCE_NAME', value: rowData.name },
            //     { name: 'CASE_NO', value: CaseNoUtil.getFormatCaseNo(rowData.caseNo) },
            //     { name: 'ENCOUNTER_AND_SUB_ENCOUNTER', value: encounterAndSubEncounter },
            //     { name: 'APPOINTMENT_DATE_AND_TIME', value: apptDateTime }
            // ],
            params: params,
            btnActions: {
                btn1Click: () => {
                    this.props.auditAction('Confirm Reset Attendance', 'Patient List');
                    this.handleResetAttendance(rowData);
                },
                btn2Click: () => {
                    this.props.auditAction('Cancel Reset Attendance', 'Patient List', 'Patient List', false, 'ana');
                }
            }
        });
    }

    handleResetAttendance = (rowData) => {
        let searchParms = { ...this.props.searchParameter };
        // let tempPatientQueueDto = this.props.patientQueueDto;
        let selectedAppt = this.props.patientQueueList.patientQueueDtos.find(item => item.appointmentId === rowData.appointmentId);
        let resetAttendanceParms = {
            appointmentId: rowData.appointmentId,
            patientKey: rowData.patientKey,
            apptVersion: rowData.version,
            atndId: selectedAppt.attendanceBaseVo && selectedAppt.attendanceBaseVo.atndId
        };
        this.props.resetAttendance(resetAttendanceParms, searchParms);
    }

    searchPatientList = value => {
        const params = { searchString: value };
        this.props.searchPatientList(params);
    }

    loadPatientPanelCallback = (item, pucChecking) => {
        // const { pucChecking } = this.props;
        // console.log('[PUC] loadPatientPanelCallback', pucChecking);
        if (item.appointmentId) {
            this.props.getPatientEncounter(item.appointmentId, item.callback);
        } else {
            item.callback && item.callback();
        }
        if (pucChecking) {
            if (pucChecking.pucResult === 100 || pucChecking.pucResult === 101)
                this.setLanding({ code: accessRightEnum.patientSummary });
            else if (pucChecking.pucResult === 0)
                this.gotoSummary();
        }
        if (this.props.serviceCd === 'SHS') {
            this.props.getLatestPatientEncntrCase({
                patientKey: item.patientKey,
                sspecID: BookingEnum.SHS_APPOINTMENT_GROUP.SKIN_GRP
            });
        }
        this.gotoLanding();
    };

    resetPatientListCallback = () => {
        this.handleRetainDocType();
        this.props.updatePatientListField({ isFocusSearchInput: true });
    };

    resetPatientList = () => {
        this.handleResetButtonClick();
        this.props.updatePatientListField({ isFocusSearchInput: true });
    };

    getPatientInfo = (item, nonCheckPUC) => {
        // console.log('[PUC] getPatientInfo');

        this.props.alsLogAudit({
            desc: `[Patient List]Get patient/customer info in the patient list. PMI: ${item.patientKey}`,
            dest: 'patient',
            functionName: 'Patient List',
            isEncrypt: true
        });

        // const resetPatientList = () => {
        //     this.handleResetButtonClick();
        //     this.props.updatePatientListField({ isFocusSearchInput: true });
        // };
        // const loadPatientPanelCallback = () => {
        //     const { pucChecking } = this.props;
        //     console.log('[PUC] loadPatientPanelCallback', pucChecking);
        //     if (item.appointmentId) {
        //         this.props.getPatientEncounter(item.appointmentId, item.callback);
        //     } else {
        //         item.callback && item.callback();
        //     }
        //     if (pucChecking) {
        //         if (pucChecking.pucResult === 100 || pucChecking.pucResult === 101)
        //         this.setLanding({ code: accessRightEnum.patientSummary });
        //         else if (pucChecking.pucResult === 0)
        //         this.gotoSummary();
        //     }
        //     this.gotoLanding();
        // };
        // const loadPatientPanel = () => {
        //     const { service } = this.props;
        //     this.props.getMedicalSummaryVal({
        //         params: {
        //             patientKey: item.patientKey,
        //             serviceCd: service.serviceCd
        //         }
        //     });
        //     let params = {
        //         patientKey: item.patientKey,
        //         appointmentId: item.appointmentId,
        //         caseNo: item.caseNo,
        //         callBack: loadPatientPanelCallback,
        //         resetPatientList: resetPatientList
        //     };
        //     this.props.getPatientById(params);
        // };
        if (!nonCheckPUC) {
            // this.props.checkPatientUnderCare(loadPatientPanel, resetPatientList, item);
            this.props.checkPatientUnderCare(this.loadPatientPanelCallback, this.resetPatientListCallback, item);
        } else {
            // loadPatientPanel();
            this.props.getPatientPUC(this.loadPatientPanelCallback, item);
        }
    }

    // handleItemSelected = (item) => {
    //     //it only trigger when no appointment filter
    //     if (item.deadInd === '1') {
    //         this.skipToPatientSummary({ patientKey: item.patientKey });
    //     } else {
    //         if (item && item.patientKey > 0) {
    //             //Added by Renny for own privilege open patient summary 20200618
    //             if (this.props.login.accessRights.find(item => item.name === accessRightEnum.openESAfterSelectedPatient)) {
    //                 this.skipToEncounterSummary({ patientKey: item.patientKey });
    //             }
    //             //End added by Renny for own privilege open patient summary 20200618
    //             else if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
    //                 this.skipToPatientSummary({ patientKey: item.patientKey });
    //             } /*else if (this.props.userRoleType === Enum.USER_ROLE_TYPE.DOCTOR || this.props.userRoleType === Enum.USER_ROLE_TYPE.NURSE) {
    //             this.skipToEncounterSummary({ patientKey: item.patientKey }); //Added by Renny for nurse and doctor open patient summary 20200520
    //             // this.getPatientInfo({ patientKey: item.patientKey });
    //         }*/
    //         }
    //     }
    // }

    handlePatientUnderCareDialogSave = (reasons, detail) => {
        const { patientSelected, clinic, pucChecking } = this.props;
        if (patientSelected) {
            this.props.updatePatientState({
                pucChecking: {
                    ...pucChecking,
                    justificationAction: 'access'
                }
            });

            this.gotoSummary();
            this.getPatientInfo({
                ...patientSelected,
                callback: () => {
                    // patientSelected.callback && patientSelected.callback();
                    this.props.pucReasonLogs({
                        pmiPucAccessLogs: reasons.map(reason => ({
                            action: 'ACCESS',
                            caseNo: (patientSelected && patientSelected.caseNo) || null,
                            patientKey: patientSelected.patientKey,
                            siteId: clinic && clinic.siteId,
                            svcCd: clinic && clinic.svcCd,
                            pucReasonCd: reason,
                            pucReasonDetl: detail
                        }))
                    });
                    this.props.openCommonMessage({ msgCode: '111301', showSnackbar: true });
                }
            }, true);
        }
        this.props.updatePatientListField({ patientUnderCareDialogOpen: false, patientUnderCareVersion: null, patientSelected: null });
    }

    handlePatientUnderCareDialogCancel = (reason, detail) => {
        const { patientSelected, clinic, loginInfo, pucChecking } = this.props;
        if (patientSelected) {
            this.props.pucReasonLog({
                action: 'CANCEL',
                caseNo: (patientSelected && patientSelected.caseNo) || null,
                patientKey: patientSelected.patientKey,
                siteId: clinic && clinic.siteId,
                svcCd: clinic && clinic.svcCd,
                pucReasonCd: reason,
                pucReasonDetl: detail
            });
            this.props.updatePatientState({
                pucChecking: {
                    ...pucChecking,
                    justificationAction: 'cancel'
                }
            });

            const pucHandle = UserUtilities.isPuc102Handle(loginInfo, pucChecking);
            if (pucHandle) {
                this.setLanding({ code: accessRightEnum.patientSummary });
                this.getPatientInfo({
                    ...patientSelected,
                    callback: () => {
                        // patientSelected.callback && patientSelected.callback();
                        this.props.openCommonMessage({ msgCode: '111301', showSnackbar: true });
                    }
                }, true);
            }
            else {
                this.handleRetainDocType();
                this.props.updatePatientListField({ isFocusSearchInput: true });
                this.props.putPatientPUC(null);
            }
        }
        this.props.updatePatientListField({ patientUnderCareDialogOpen: false, patientUnderCareVersion: null, patientSelected: null });
    }

    skipToPatientSummary = (patient) => {
        // console.log('[PUC] skipToPatientSummary', patient);
        const callback = () => {
            this.props.skipTab(accessRightEnum.patientSummary);
        };
        this.getPatientInfo({ ...patient, callback });
    }

    skipToEncounterSummary = (patient) => {
        // console.log('[PUC] skipToEncounterSummary', patient);
        const callback = () => {
            this.props.skipTab(accessRightEnum.encounterSummary);
        };
        this.getPatientInfo({ ...patient, callback });
    }

    leadAttendance = (rowData) => {
        if (rowData.statusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND) {
            this.props.skipTab(accessRightEnum.attendance, { rowData });
        }
    }

    leadWalkInAttendance = () => {
        this.props.updateBookingState({ pageStatus: BookingEnum.PageStatus.WALKIN, showMakeAppointmentView: true });
        this.props.skipTab(accessRightEnum.booking);
    }

    leadBackTakeAttendance = (rowData) => {
        if (rowData.statusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND) {
            const params = {
                ledByPastAppt: true,
                pastApptId: rowData.appointmentId,
                pastApptDate: rowData.appointmentDate
            };
            this.props.skipTab(accessRightEnum.backTakeAttendacne, params);
        }
    }

    selectFutureAppointment = (rowData) => {
        let resolved = false;
        this.props.auditAction('Select Appointment', 'Patient List', 'Patient List', false, 'ana');
        let params = {
            futureApptId: rowData.appointmentId,
            futureAppt: rowData,
            redirectFrom: accessRightEnum.patientSpec
        };
        if (rowData.patientKey > 0) {
            // future appt. counter staff -> patient summary
            if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER) {
                // this.skipToPatientSummary({ patientKey: rowData.patientKey });
                this.setLanding({ code: accessRightEnum.patientSummary });
                this.getPatientInfo(rowData);
            } else {
                // future appt. Non-counter Staff
                this.gotoSummary();
                this.getPatientInfo(rowData);
            }
            resolved = true;
            // let selectedAppt = this.props.patientQueueList.patientQueueDtos.filter((item) => { return item.patientKey === rowData.patientKey; });
            let selectedAppt = this.props.patientQueueList.patientQueueDtos.find(item => item.appointmentId === rowData.appointmentId);
            let tempFutureApptInfo = {
                ...params.futureAppt,
                ...(selectedAppt && selectedAppt.appointmentDto),
                appointmentTime: params.futureAppt.apptTime
            };
            params.futureAppt = tempFutureApptInfo;
            // this.props.updateBookingState({ futureApptId: params.futureApptId, futureAppt: params.futureAppt });
            // this.props.skipTab(accessRightEnum.booking, params);
        }
        else {
            if (this.props.anonPatientInfo) {
                this.props.openCommonMessage({
                    // msgCode: '111109',
                    msgCode: '112031',
                    params: [{ name: 'PATIENT_CALL', value: CommonUtil.getPatientCall() }]
                });
            } else {
                let selectedAppt = this.props.patientQueueList.patientQueueDtos.find(item => item.appointmentId === rowData.appointmentId);
                if (selectedAppt) {
                    params.futureAppt = {
                        ...rowData,
                        ...selectedAppt,
                        encntrTypeId: selectedAppt.appointmentDetlBaseVoList[0].encntrTypeId,
                        rmId: selectedAppt.appointmentDetlBaseVoList[0].rmId
                    };
                    if (selectedAppt.patientDto) {
                        params.futureAppt.countryCd = selectedAppt.patientDto.countryCd;
                        if (selectedAppt.patientDto.documentPairList && selectedAppt.patientDto.documentPairList.length > 0) {
                            params.futureAppt.docTypeCd = selectedAppt.patientDto.documentPairList[0].docTypeCd;
                            params.futureAppt.hkidOrDocNo = selectedAppt.patientDto.documentPairList[0].docNo;
                        }
                    }
                    params.appointmentDto = { ...selectedAppt.appointmentDto };

                    this.props.updateAnonBookingState({ redirectParam: params });
                    // this.props.skipTab(accessRightEnum.bookingAnonymous, params);
                    this.setLanding({ code: accessRightEnum.bookingAnonymous, params });
                }
            }
        }
        if (!resolved)
            this.gotoLanding();
    }

    gotoSummary = (patientKey) => {
        // if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER)
        //     this.skipToPatientSummary({ patientKey });
        // else
        //     this.skipToEncounterSummary({ patientKey });

        const { loginInfo, pucChecking } = this.props;
        // console.log('[PUC] gotoSummary, landing', this.landing);
        if (this.landing != null)
            return;

        let dest;
        if (UserUtilities.isPucHandle(loginInfo, pucChecking)) {
            dest = accessRightEnum.patientSummary;
        }
        else {
            // if (this.props.login.accessRights.find(item => item.name === accessRightEnum.openESAfterSelectedPatient)) {
            //     dest = accessRightEnum.encounterSummary;
            // }
            // else {
            if (UserUtilities.isClinicalBaseRole(loginInfo.userDto))
                dest = accessRightEnum.encounterSummary;
            else
                dest = accessRightEnum.patientSummary;
            // }
        }
        // console.log('[PUC] gotoSummary', patientKey, dest);

        if (dest)
            this.setLanding({ code: dest });
    }

    setLanding = (landing, replaceExist = false) => {
        //const {code,param}
        if (this.landing && !replaceExist) {
            // console.log('[PUC] landing exist and not force replace');
            return;
        }
        // console.log('[PUC] set landing', landing);
        this.landing = { ...landing };
    }

    gotoLanding = () => {
        // console.log('[PUC] gotoLanding', this.landing);
        if (this.landing) {
            this.props.skipTab(this.landing.code, this.landing.params);
            this.landing = null;
        }
    }

    isExternalFilterPresent = () => {
        let { attnStatusCd, encounterTypeCd, subEncounterTypeCd } = this.props.filterCondition;
        return attnStatusCd !== '' || encounterTypeCd !== '' || subEncounterTypeCd !== '';
    }

    doesExternalFilterPass = node => {
        let { attnStatusCd, encounterTypeCd, subEncounterTypeCd } = this.props.filterCondition;
        let condition = (encounterTypeCd.trim() == '' || node.data.encounterTypeCd === encounterTypeCd) &&
            (subEncounterTypeCd.trim() == '' || node.data.subEncounterTypeCd === subEncounterTypeCd);
        return PatientUtilities.isAttnStatusRight(node.data.statusCd, node.data.arrivalTime, attnStatusCd) && condition;
    }

    handleCloseDialog = () => {
        let patientList = [];
        // let patSearchParam = this.resetPatSesarchParam();
        this.props.updatePatientListField({
            patientList
            // patientSearchParam: patSearchParam,
            // isFocusSearchInput: true
        });
        this.handleRetainDocType();
    }

    handleSelectPatient = (selectPatient) => {
        const searchNextAction = PATIENT_LIST_SEARCH_NEXT_ACTION.SEARCH_PATIENT;
        this.props.auditAction('Select Patient', 'Patient List', 'Patient List', false, 'ana');
        let patientList = [];
        patientList.push(selectPatient);
        this.props.updatePatientListField({ searchNextAction, patientList });
    }

    getFilterSubEncounterTypeList = memoize((siteId, subEncounterTypeList) => {
        return subEncounterTypeList ? subEncounterTypeList.filter(item => item.clinic == null || item.clinic === siteId).filter(x => EnctrAndRmUtil.isActiveRoom(x)) : [];
    });

    handleApprovalSubmit = () => {
        const { searchType, searchValue } = this.props.patientSearchParam;
        const searchParameter = _.cloneDeep(this.props.searchParameter);
        const userRoleType = this.props.userRoleType;
        let params = {
            dateFrom: moment(searchParameter.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: moment(searchParameter.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE),
            roleType: userRoleType,
            searchStr: searchValue,
            docType: searchType,
            staffId: this.props.supervisorsApprovalDialogInfo.staffId
        };

        this.props.auditAction('Click Confirm In Supervisors Approval Dialog', 'Patient List');
        this.props.searchInPatientQueue(params, this.props.countryList);
    }

    handleApprovalChange = (value) => {
        const { supervisorsApprovalDialogInfo } = this.props;
        this.props.updatePatientListField({ supervisorsApprovalDialogInfo: { ...supervisorsApprovalDialogInfo, staffId: value } });
    }

    handleApprovalCancel = () => {
        this.props.auditAction('Click Cancel In Supervisors Approval Dialog', 'Patient List');
        this.props.updatePatientListField({ supervisorsApprovalDialogInfo: { staffId: '', open: false } });
        this.handleRetainDocType();
    }

    resetApprovalDialog = () => {
        this.props.updatePatientListField({ supervisorsApprovalDialogInfo: { staffId: '', open: false } });
    }

    handleDefaultAttnStatus = () => {
        let defaultAttnStatusCd = CommonUtil.getDefaultAttnStatusCd();
        let filterCondition = _.cloneDeep(this.props.filterCondition);
        filterCondition.encounterTypeCd = '';
        filterCondition.subEncounterTypeCd = '';
        filterCondition.patientKey = '';
        filterCondition.hkic = '';
        filterCondition.attnStatusCd = defaultAttnStatusCd;
        this.props.updatePatientListField({ filterCondition: filterCondition });
    }

    getPatientListParams = () => {
        const { searchParameter, filterCondition, encounterTypeList, roomList, clinic, service } = this.props;
        const encounter = encounterTypeList.find(x => x.encounterTypeCd === filterCondition.encounterTypeCd);
        const subEncounterTypeList = filterCondition.encounterTypeCd === '' ? roomList : this.getFilterSubEncounterTypeList(clinic.siteId, encounter && encounter.subEncounterTypeList);
        const room = subEncounterTypeList.find(x => x.rmCd === filterCondition.subEncounterTypeCd);
        let atndStatus = filterCondition.attnStatusCd;
        if (atndStatus === Enum.ATTENDANCE_STATUS.ATTENDED || atndStatus === Enum.ATTENDANCE_STATUS.ARRIVED) {
            atndStatus = Enum.ATTENDANCE_STATUS.ATTENDED;
        } else if (atndStatus === Enum.ATTENDANCE_STATUS.NOT_ATTEND || atndStatus === Enum.ATTENDANCE_STATUS.CANCELLED) {
            atndStatus = Enum.ATTENDANCE_STATUS.NOT_ATTEND;
        }
        let params = {
            atndStatus: atndStatus,
            svcCd: service.svcCd,
            siteId: clinic.siteId,
            encntrTypeId: encounter ? encounter.encntrTypeId : '',
            roomId: room ? room.rmId : '',
            startDate: searchParameter.dateFrom,
            endDate: searchParameter.dateTo
        };
        return params;
    }

    handlePrintPatientListClick = () => {
        const params = this.getPatientListParams();
        //print action
        this.props.printPatientList(params, (data) => {
            this.setState({ openPatientListViewer: true, patientListPreviewData: data });
        });
    }

    closePreviewDialog = () => {
        this.setState({ patientListPreviewData: null, openPatientListViewer: false });
    }

    isDisablePrintPatientListBtn = () => {
        const { searchParameter, filterCondition } = this.props;
        const { rowData } = this.state;
        const { dateFrom, dateTo } = searchParameter;
        const isSameDate = moment(dateFrom).isSame(moment(dateTo));
        const { attnStatusCd, encounterTypeCd, subEncounterTypeCd } = filterCondition;
        let _rowData = [];
        rowData.forEach(data => {
            let condition = (encounterTypeCd.trim() == '' || data.encounterTypeCd === encounterTypeCd) &&
                (subEncounterTypeCd.trim() == '' || data.subEncounterTypeCd === subEncounterTypeCd);
            let target = PatientUtilities.isAttnStatusRight(data.statusCd, data.arrivalTime, attnStatusCd) && condition;
            if (target) {
                _rowData.push(data);
            }
        });
        return _rowData.length === 0 || !isSameDate;
    }

    familyDialogToggle = () => this.setState({ isOpenFamilyDialog: !this.state.isOpenFamilyDialog });

    render() {
        const {
            classes,
            serviceCd,
            clinic,
            encounterTypeList,
            roomList,
            searchParameter,
            filterCondition,
            patientSearchParam,
            patSearchTypeList,
            clinicConfig,
            siteId
        } = this.props;

        const encounterType = encounterTypeList.find(item => item.encounterTypeCd === filterCondition.encounterTypeCd);
        const subEncounterTypeList = filterCondition.encounterTypeCd === '' ? roomList : this.getFilterSubEncounterTypeList(clinic.siteId, encounterType && encounterType.subEncounterTypeList);
        let filterPatSearchTypeList = patSearchTypeList; // && patSearchTypeList.filter(item => item.searchTypeCd !== 'APPTID');
        const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(this.props.siteParams, this.props.service.svcCd, this.props.clinic.siteId);
        const isAtndGenEncntrChargeableControl = SiteParamsUtil.getIsAtndGenEncntrChargeableControlVal(this.props.siteParams, this.props.service.svcCd, this.props.clinic.siteId);
        const { patientListPreviewData, openPatientListViewer, isOpenFamilyDialog } = this.state;
        const disablePrintPatientListBtn = this.isDisablePrintPatientListBtn();
        const useIdeas = getTopPriorityOfSiteParams(clinicConfig, serviceCd, siteId, Enum.CLINIC_CONFIGNAME.PATIENT_LIST_USE_IDEAS)?.paramValue === '1';
        return (
            <React.Fragment>
                <Grid className={classes.root}>
                    <ValidatorForm ref={'form'} style={{ display: 'contents' }}>
                        <Grid container spacing={1} style={{ marginTop: 10, marginBottom: 10 }}>
                            <Grid item container xs={2}></Grid>
                            <Grid item container xs={12} alignItems="center" justify="space-between">
                                <Grid item xs={8} >
                                    <FilterPatient
                                        searchParameter={searchParameter}
                                        subEncounterTypeList={subEncounterTypeList}
                                        encounterTypeList={encounterTypeList}
                                        statusList={Enum.ATTENDANCE_STATUS_LIST}
                                        filterCondition={filterCondition}
                                        onChange={this.handleFilterChange}
                                        onBlur={this.handleFilterBlur}
                                        onFocus={this.handleFilterFocus}
                                        onOpen={this.handleDateOpen}
                                        isAtndGenEncntrChargeableControl={isAtndGenEncntrChargeableControl}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <PatientSearchGroup
                                        id={'indexPatient_pateint_group'}
                                        innerRef={ref => this.searchGroupRef = ref}
                                        patientSearchParam={patientSearchParam}
                                        docTypeList={filterPatSearchTypeList || []}
                                        optVal={'searchTypeCd'}
                                        optLbl={'dspTitle'}
                                        updateState={this.props.updatePatientListField}
                                        searchInputOnBlur={this.searchInputOnBlur}
                                        allDocType={false}
                                        useIdeas={useIdeas}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                    <Grid container spacing={1} className={classes.filterRoot}>
                        <Grid item xs={12} className={classes.filterTable}>
                            <CIMSDataGrid
                                ref={this.refGrid}
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    height: '69vh',
                                    display: 'block'
                                }}
                                gridOptions={{
                                    columnDefs: this.state.columnDefs,
                                    headerHeight: 48,
                                    enableBrowserTooltips: true,
                                    rowData: this.state.rowData,
                                    frameworkComponents: {
                                        statusRenderer: StatusRenderer,
                                        actionRenderer: ActionRenderer,
                                        familyNoRenderer: FamilyNoRenderer
                                    },
                                    onRowDoubleClicked: params => {
                                        let _rowData = params.data;
                                        let event = params.event;
                                        let isFutureAppt = AppointmentUtilties.isFutureAppointment(_rowData);
                                        if (_rowData.patientKey < 0 && !isFutureAppt) {
                                            this.handleLinkPMI(event, _rowData);
                                        } else {
                                            if (isFutureAppt) {
                                                this.selectFutureAppointment(_rowData);
                                            }
                                            else {
                                                this.selectAppointment(_rowData);
                                            }
                                        }
                                    },
                                    isExternalFilterPresent: this.isExternalFilterPresent,
                                    doesExternalFilterPass: this.doesExternalFilterPass,
                                    getRowStyle: params => {
                                        let rowStyle = null;
                                        if (params.data.deadInd === '1') {
                                            rowStyle = {
                                                color: this.props.theme.palette.common.white,
                                                backgroundColor: this.props.theme.palette.deadPersonColor.color
                                            };
                                        }
                                        else if (params.data.genderCd === Enum.GENDER_MALE_VALUE) {
                                            rowStyle = {
                                                backgroundColor: this.props.theme.palette.genderMaleColor.color
                                            };
                                        }
                                        else if (params.data.genderCd === Enum.GENDER_FEMALE_VALUE) {
                                            rowStyle = {
                                                backgroundColor: this.props.theme.palette.genderFeMaleColor.color
                                            };
                                        }
                                        else if (params.data.genderCd === Enum.GENDER_UNKNOWN_VALUE) {
                                            rowStyle = {
                                                backgroundColor: this.props.theme.palette.genderUnknownColor.color
                                            };
                                        }
                                        return rowStyle;
                                    },
                                    getRowHeight: () => 46,
                                    getRowNodeId: data => data.appointmentId,
                                    postSort: rowNodes => {
                                        let rowNode = rowNodes[0];
                                        if (rowNode) {
                                            setTimeout((rowNode) => {
                                                rowNode.gridApi.refreshCells({
                                                    columns: ['index'],
                                                    force: true
                                                });
                                            }, 100, rowNode);
                                        }
                                    }
                                }}
                            // suppressGoToRow
                            // suppressDisplayTotal
                            />
                        </Grid>
                    </Grid>
                    <Grid style={{ textAlign: 'end' }}>
                        <CIMSButton
                            id={'patient_list_print_patient_list_btn'}
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={(e) => {
                                this.props.auditAction('Print Patient List', 'Patient List');
                                //this.handleResetButtonClick(e);
                                this.handlePrintPatientListClick();
                            }}
                            disabled={disablePrintPatientListBtn}
                        >Print Patient List</CIMSButton>
                        <CIMSButton
                            id={'btn_consultation_reset'}
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={(e) => {
                                this.props.auditAction('Reset search result', 'Patient List');
                                this.handleResetButtonClick(e);
                            }}
                        >Reset</CIMSButton>
                    </Grid>
                    {
                        this.props.openLinkPatient ?
                            <LinkPatient
                                handleClose={() => {
                                    this.props.auditAction('Cancel Link PMI', 'Patient List', 'Patient List', false, 'ana');
                                    this.handleLinkClose();
                                }
                                }
                                linkParameter={this.props.linkParameter}
                                handleChange={this.handleLinkChange}
                                updatePatientListField={this.props.updatePatientListField}
                                getPatientQueue={e => this.getPatientQueueByPage(e)}
                                userRoleType={this.props.userRoleType}
                                selectAppointment={this.selectAppointment}
                                patientList={this.state.patientList}
                            /> : null
                    }
                    {
                        this.props.searchList && this.props.searchList.length > 1 ?
                            isNewPmiSearchResultDialog ?
                                <NewPMISearchResultDialog
                                    id={'patient_search_result_dialog'}
                                    title="Search Result"
                                    results={this.props.searchList || []}
                                    handleCloseDialog={() => {
                                        this.props.auditAction('Cancel Select Patient', 'Patient List', 'Patient List', false, 'ana');
                                        this.handleCloseDialog();
                                    }}
                                    handleSelectPatient={this.handleSelectPatient}
                                />
                                :
                                <PatientSearchDialog
                                    id={'patient_search_result_dialog'}
                                    searchResultList={this.props.searchList || []}
                                    handleCloseDialog={() => {
                                        this.props.auditAction('Cancel Select Patient', 'Patient List', 'Patient List', false, 'ana');
                                        this.handleCloseDialog();
                                    }}
                                    handleSelectPatient={this.handleSelectPatient}
                                />
                            : null
                    }
                    {
                        (this.props.patientUnderCareDialogOpen && this.props.patientUnderCareVersion === null) ?
                            <PatientUnderCareDialog
                                onSave={this.handlePatientUnderCareDialogSave}
                                onCancel={this.handlePatientUnderCareDialogCancel}
                                reasonList={this.props.commonCodeList && this.props.commonCodeList.puc_reason}
                            /> : null
                    }
                    {this.props.supervisorsApprovalDialogInfo.open ?
                        <SupervisorsApprovalDialog
                            title={`Search by ${CommonUtil.getPatientCall()} Name: `}
                            searchString={patientSearchParam.searchValue}
                            confirm={this.handleApprovalSubmit}
                            handleCancel={this.handleApprovalCancel}
                            handleChange={this.handleApprovalChange}
                            resetApprovalDialog={this.resetApprovalDialog}
                            supervisorsApprovalDialogInfo={this.props.supervisorsApprovalDialogInfo}
                        /> : null
                    }
                    {openPatientListViewer === true ?
                        <PatientListViewer
                            id={'patient_list_viewer'}
                            classes={classes}
                            previewData={patientListPreviewData}
                            openPatientListViewer={openPatientListViewer}
                            closePreviewDialog={this.closePreviewDialog}
                            exportType={this.state.exportType}
                            updateParent={(obj, callback) => { this.setState(obj, callback); }}
                            auditAction={this.props.auditAction}
                            download={() => {
                                let callback = (data) => {
                                    let filename = `Patient_List_${moment().format('YYYYMMDDHHmmss')}`;
                                    CommonUtil.downloadByBase64(data, filename, this.state.exportType);
                                };
                                let callParams = this.getPatientListParams();
                                callParams = {
                                    ...callParams,
                                    pnType: this.state.exportType
                                };
                                this.props.getApptListRpt(callParams, callback);
                            }}
                        />
                        : null
                    }
                    <FamilyMemberDialog isOpen={isOpenFamilyDialog} toggle={this.familyDialogToggle} isSelect notAttendHandler={this.notAttendHandler} />
                </Grid>
            </React.Fragment>
        );
    }
}

const getFilterEncounterList = memoize((clinicCd, encounterTypeList) => {
    return EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(clinicCd, encounterTypeList);
});

const getFilterRoomList = memoize((clinicCd, roomList) => {
    return EnctrAndRmUtil.getActiveRoomList(clinicCd, roomList);
});

const mapStateToProps = (state) => {
    const siteId = state.login.clinic.siteId;
    const encounterTypeList = state.common.encounterTypeList;
    const filterEncounterList = getFilterEncounterList(siteId, encounterTypeList);
    const roomList = state.common.roomList;
    const filterRoomList = getFilterRoomList(siteId, roomList);
    return {
        isFocusSearchInput: state.patientSpecFunc.isFocusSearchInput,
        searchParameter: state.patientSpecFunc.searchParameter,
        filterCondition: state.patientSpecFunc.filterCondition,
        encounterTypeList: _.cloneDeep(filterEncounterList),
        roomList: _.cloneDeep(filterRoomList),
        openLinkPatient: state.patientSpecFunc.openLinkPatient,
        linkParameter: state.patientSpecFunc.linkParameter,
        subTabs: state.mainFrame.subTabs,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        patientInfo: state.patient.patientInfo,
        appointmentInfo: state.patient.appointmentInfo,
        patientQueueList: state.patientSpecFunc.patientQueueList,
        linkPatientStatus: state.patientSpecFunc.linkPatientStatus,
        patientQueueDto: state.patientSpecFunc.patientQueueDto,
        searchList: state.patientSpecFunc.patientList,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
        searchNextAction: state.patientSpecFunc.searchNextAction,
        loginInfo: state.login.loginInfo,
        service: state.login.service,
        clinic: state.login.clinic,
        login: state.login,
        anonPatientInfo: state.bookingAnonymousInformation.anonPatientInfo,
        countryList: state.patient.countryList || [],
        listConfig: state.common.listConfig,
        patientSearchParam: state.patientSpecFunc.patientSearchParam,
        patSearchTypeList: state.common.patSearchTypeList,
        clinicConfig: state.common.clinicConfig,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        commonCodeList: state.common.commonCodeList,
        patientUnderCareDialogOpen: state.patientSpecFunc.patientUnderCareDialogOpen,
        patientUnderCareVersion: state.patientSpecFunc.patientUnderCareVersion,
        patientSelected: state.patientSpecFunc.patientSelected,
        searchAppointment: state.patientSpecFunc.searchAppointment,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        pucChecking: state.patient.pucChecking,
        supervisorsApprovalDialogInfo: state.patientSpecFunc.supervisorsApprovalDialogInfo,
        dateRangeLimit: state.patientSpecFunc.dateRangeLimit,
        siteParams: state.common.siteParams,
        anonBookingData: state.bookingAnonymousInformation.bookingData
    };
};

const mapDispatchToProps = {
    eHRresetAll,
    searchPatientList,
    getPatientById,
    updatePatientListAttendanceInfo,
    resetAttendance,
    openCommonMessage,
    skipTab,
    updatePatientListField,
    getPatientList,
    resetPatientListField,
    resetCondition,
    getAppointmentForAttend,
    searchInPatientQueue,
    searchByAppointmentId,
    updatePatientState,
    getPatientEncounter,
    closeIdleTimeDialog,
    updateBookingState,
    openMask,
    closeMask,
    pucReasonLog,
    pucReasonLogs,
    checkPatientUnderCare,
    getPatientPUC,
    putPatientPUC,
    auditAction,
    alsLogAudit,
    checkPatientName,
    printPatientList,
    updateAnonBookingState,
    getLatestPatientEncntrCase,
    getFamilyBooking,
    getApptListRpt
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withTheme(PatientList2)));
