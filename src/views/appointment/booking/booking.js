import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import AppointmentHistory from './component/appointmentHistory';
import BookingForm from './component/bookingForm';
import BookingConfirmDialog from './component/bookDialog/bookingConfirmDialog';
import SppBookingConfirmDialog from './component/bookDialog/sppBookingConfirmDialog';
import AppointListCartDialog from './component/bookDialog/appointListCartDialog';
import SqueezeInAppointmentDialog from './component/bookDialog/squeezeInAppointmentDialog';
import ReplaceAppointmentDialog from './component/bookDialog/replaceAppointmentDialog';
import OverlappedPeriodAppointmentDialog from './component/bookDialog/overlappedPeriodAppointmentDialog';
import BookingSearchDialog from './component/bookDialog/bookingSearchDialog';
import SppBookingSearchingDialog from './component/bookDialog/sppBookingSearchDialog';
import BookingContactHistory from './component/bookDialog/bookingContactHistory';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import Enum from '../../../enums/enum';
import { caseSts } from '../../../enums/anSvcID/anSvcIDEnum';
import * as appointmentUtilities from '../../../utilities/appointmentUtilities';
import {
    resetInfoAll, appointmentBook, listTimeSlot, stillAppointmentsBookConfirm, replaceOldAppointmnet,
    listAppointmentHistory, bookConfirm, checkBookingRule,
    bookConfirmWaiting, updateState, getAppointmentReport,
    walkInAttendance, listRemarkCode,
    cancelAppointment, deleteAppointment, submitUpdateAppointment,
    listContatHistory, init_bookingData, updateContHistState, updateSpecReqState,
    getReminderTemplate, submitApptReminder, deleteApptReminder, sendApptReminderInfo,
    listSpecReqTypes, listSpecReq, resetReplaceAppointment, getBookingMaximumTimeslot, checkPatientSvcExist,
    listReminderList, checkApptWithEncntrCaseStatus, logShsEncntrCase, sppMultipleBooking, updateAppointmentListCart
} from '../../../store/actions/appointment/booking/bookingAction';
import {
    redesignListRemarkCode
} from '../../../store/actions/appointment/booking/redesignBookingAction';
import {
    getPatientAppointment,
    getRedesignPatientAppointment,
    getPatientById as getPatientPanelPatientById,
    getPatientEncounter,
    printPatientGumLabel,
    printSPPGumLabel,
    printEHSGumLabel,
    refreshPatient,
    updateLastCheckDate
} from '../../../store/actions/patient/patientAction';
import { openCaseNoDialog, selectCaseTrigger } from '../../../store/actions/caseNo/caseNoAction';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import moment from 'moment';
import _ from 'lodash';
import { codeList } from '../../../constants/codeList';
import * as commonUtilities from '../../../utilities/commonUtilities';
import { updateCurTab, deleteSubTabs, skipTab, updateField as updateMainFrame, changeTabsActive } from '../../../store/actions/mainFrame/mainFrameAction';
import ConfirmationWindow from '../../compontent/confirmationWindow';
import { getCodeList, getClcAntGestCalcParams } from '../../../store/actions/common/commonAction';
import * as ecsActionType from '../../../store/actions/ECS/ecsActionType';
import * as attendanceActionType from '../../../store/actions/attendance/attendanceActionType';
import AccessRightEnum from '../../../enums/accessRightEnum';
import { PageStatus as pageStatusEnum, BookMeans, UpdateMeans, PAGE_DIALOG_STATUS, SHS_APPOINTMENT_GROUP } from '../../../enums/appointment/booking/bookingEnum';
import { initBookingData } from '../../../constants/appointment/bookingInformation/bookingInformationConstants';
import ApptReminderDialog from './component/apptReminderDialog';
import BookingSpecialRequest from './component/bookDialog/bookingSpecialRequest';
import RescheduleDialog from './component/bookDialog/rescheduleDialog';
import * as PatientUtil from '../../../utilities/patientUtilities';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import { AppointmentUtil, DateUtil } from '../../../utilities';
import { auditAction } from '../../../store/actions/als/logAction';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import GestationCalcDialog from './component/bookDialog/gestationCalcDialog';
import TransferInDialog from '../attendance/component/transferInDialog';
import * as RegUtil from '../../../utilities/registrationUtilities';
import { updateAntInfoInOtherPage } from '../../../utilities/anSvcIdUtilities';
import { getDaysOfWeekDefault, checkAppEncntrCaseStatusBeforeBook } from '../../../utilities/appointmentUtilities';
import { showPsoReminder } from '../../../utilities/attendanceUtilities';
import PaymentMsgDialog from '../attendance/component/paymentMsgDialog';
import UnexpectedEnctrApprlDialog from './component/bookDialog/unexpectedEnctrApprlDialog';
import { UNEXPECTED_ACTION_TYPE } from '../../../enums/appointment/booking/bookingEnum';
import { ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC } from '../../../enums/enum';
import { dispatch } from '../../../store/util';
import { UPDATE_SELECTED_FAMILY_MEMBER } from '../../../store/actions/appointment/booking/bookingActionType';
import ConfirmAtndDialog from '../../compontent/confirmAtndDialog';

const styles = theme => ({
    maintitleRoot: {
        paddingTop: 6,
        fontSize: '14pt',
        fontWeight: 600
    }
});
class Booking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            failSearchExactTime: false,
            failSearchReason: '',
            patientStatusFlag: 'N',
            isAutoPrintSlip: false,
            bookType: 'Book',
            caseDto: null,
            gestationCalcOpen: false,
            gestCalcParams: null,
            gestStartDate: null,
            gestEndDate: null,
            wkStart: null,
            wkEnd: null,
            dayStart: null,
            dayEnd: null,
            confirmTransferIn: false,
            transferInData: null,
            searchCriteria: [],
            daysOfWeekValArr: [1, 1, 1, 1, 1, 1, 1],
            lmp: null,
            paymentMsgDialogParams: {
                open: false,
                encounterTypeId: null
            },
            approvalDialogParams: {
                isOpen: false,
                staffId: '',
                rsnCd: null,
                rsnTxt: ''
            },
            appointListCartDialogOpen: false,
            multipleSlotIdx: null,
            multipleSlotData: null,
            successCount: 0,
            totalCount: 0,
            confirmAtndDialogOpen: false,
            ehsConfirmAttendance: false,
            ehsConfirmAtndData: null
        };

        this.isUseCaseNo = commonUtilities.isUseCaseNo();

        this.isUseGestCalc = commonUtilities.isUseGestCalc();

        //handle pass in parameters
        this.initPassInParameters();
    }

    componentDidMount() {
        //init all dropdownlist code listc
        this.initCodeList();

        //init default config
        this.loadDefaultConfig();

        //doclose function
        this.initDoClose();

        //check if have a valid case no.
        // this.checkValidCaseNo();
        let params = {
            patientKey: this.props.patientInfo.patientKey,
            svcCd: this.props.serviceCd
        };
        this.props.checkPatientSvcExist(params, (data) => {
            this.props.updateState({ patientSvcExist: data });
        });
        this.resetDaysOfWeek();

        this.getLmp();

        this.initPassInParameters();
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (this.isUseGestCalc && this.state.gestEndDate) {
            const currBookingData = this.props.bookingData;
            const prevBookingData = prevProps.bookingData;
            if (currBookingData.encounterTypeCd !== 'ENC_NEW'
                || currBookingData.siteId !== prevBookingData.siteId
                || currBookingData.qtType === 'W'
                || this.props.appointmentMode !== prevProps.appointmentMode
                || (this.props.pageStatus === pageStatusEnum.EDIT && prevProps.pageStatus === pageStatusEnum.VIEW)
                || (this.props.pageStatus === pageStatusEnum.VIEW && prevProps.pageStatus === pageStatusEnum.EDIT)
                || this.props.pageStatus === pageStatusEnum.CONFIRMED) {
                this.setState({ gestStartDate: null, gestEndDate: null });
            }
        }
        return null;
    }

    componentDidUpdate(preProps) {
        const { pageStatus, confirmData, appointmentInfo, serviceCd, siteId, tabsActiveKey, curCloseTabMethodType, subTabsActiveKey, appointmentMode, currentSelectedApptInfo } = this.props;
        if (pageStatus === pageStatusEnum.CONFIRMED && confirmData && (!appointmentInfo || !appointmentInfo.appointmentId)) {
            // this.props.getRedesignPatientAppointment(confirmData.appointmentId, appointmentUtilities.getSiteCdServiceCdParams(serviceCd, siteId));
            //cause if booking other siteId appointment
            //fyi: sprint 58 overleap and duplicate appointment do not have appointment id.
            if (confirmData.appointmentId) {
                this.props.getRedesignPatientAppointment(confirmData.appointmentId, appointmentUtilities.getSiteCdServiceCdParams(serviceCd, null));
            }
        }
        if (tabsActiveKey === AccessRightEnum.patientSpec && preProps.subTabsActiveKey !== AccessRightEnum.booking && subTabsActiveKey === AccessRightEnum.booking) {
            if (curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
                && curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_LOGOUT) {
                let params = {
                    patientKey: this.props.patientInfo.patientKey,
                    svcCd: this.props.serviceCd
                };
                this.props.checkPatientSvcExist(params, (data) => {
                    this.props.updateState({ patientSvcExist: data });
                });
            }
        }
        if (preProps.serviceCd !== this.props.serviceCd || preProps.patientInfo !== this.props.patientInfo) {
            this.getLmp();
        }
        // Reset selected family member when appt. mode is multiple
        if (appointmentMode === BookMeans.MULTIPLE || currentSelectedApptInfo?.appointmentId !== preProps.currentSelectedApptInfo?.appointmentId)
            dispatch({ type: UPDATE_SELECTED_FAMILY_MEMBER, payload: { selectedData: [] } });
    }

    componentWillUnmount() {
        this.props.resetInfoAll();
    }

    initPassInParameters = (cartData) => {
        const { location } = this.props;
        let bookData = _.cloneDeep(initBookingData);
        let updateField = {};
        if (location.state) {
            let params = _.cloneDeep(location.state);
            if (params.redirectFrom === AccessRightEnum.patientSpec) {
                if (params.futureApptId) {
                    updateField.futureApptId = params.futureApptId;
                }
            } else if (params.redirectFrom === AccessRightEnum.patientSummary) {
                if (params.action === 'edit' && params.apptInfo) {
                    updateField.futureApptId = params.apptInfo.appointmentId;
                } else if (params.action === 'walkIn') {
                    bookData = _.cloneDeep(this.props.bookingData);
                    bookData.appointmentDate = moment();
                    bookData.appointmentTime = moment();
                    bookData.elapsedPeriod = 1;
                    bookData.elapsedPeriodUnit = 'week';
                    this.props.updateState({ pageStatus: pageStatusEnum.WALKIN });
                    bookData['caseTypeCd'] = '';
                    if (this.props.serviceCd === 'CGS' && params.encounterTypeCd){
                        bookData.encounterTypeId = params.encounterTypeId;
                        bookData.encounterTypeCd = params.encounterTypeCd;
                        bookData.cgsInpatientCnsltLocCd = params.cgsInpatientCnsltLocCd;
                        bookData.cgsInpatientCnsltLocId = params.cgsInpatientCnsltLocId;
                    }
                } else if (params.action === 'walkInWithFilter') {
                    bookData = _.cloneDeep(this.props.bookingData);
                    bookData.appointmentDate = moment();
                    bookData.appointmentTime = moment();
                    bookData.elapsedPeriod = 1;
                    bookData.elapsedPeriodUnit = 'week';
                    bookData.sspecFilter = params.sspecFilter;
                    this.props.updateState({ pageStatus: pageStatusEnum.WALKIN });
                    bookData['caseTypeCd'] = '';
                } else if (params.action === 'backdateWalkIn') {
                    bookData = _.cloneDeep(this.props.bookingData);
                    bookData.appointmentDate = moment();
                    bookData.appointmentTime = moment();
                    bookData.elapsedPeriod = 1;
                    bookData.elapsedPeriodUnit = 'week';
                    bookData['caseTypeCd'] = '';
                    const backday = commonUtilities.getBackdateWalkinDay();
                    this.props.updateState({ pageStatus: pageStatusEnum.WALKIN, backdateWalkInDay: backday });
                    if (this.props.serviceCd === 'CGS' && params.encounterTypeCd){
                        bookData.encounterTypeId = params.encounterTypeId;
                        bookData.encounterTypeCd = params.encounterTypeCd;
                        bookData.cgsInpatientCnsltLocCd = params.cgsInpatientCnsltLocCd;
                        bookData.cgsInpatientCnsltLocId = params.cgsInpatientCnsltLocId;
                    }
                }
            } else if (params.redirectFrom === AccessRightEnum.waitingList) {
                bookData = appointmentUtilities.loadWaitListPassedData(bookData, params, this.props.encounterTypes, this.props.destinationList);
                updateField.showMakeAppointmentView = true;
                updateField.waitingList = {
                    version: params.version,
                    waitListId: params.waitListId
                };
            } else if (params.redirectFrom === AccessRightEnum.calendarView) {
                bookData = { ...bookData, ...params.bookData };
            } else if (params.redirectFrom === AccessRightEnum.EhsWaitingList) {
                if (params.redirectParam) {
                    bookData = { ...bookData, ...params.redirectParam };
                }
            }
        }
        this.props.updateState(updateField);
        this.props.init_bookingData(bookData, cartData);
    }

    initCodeList = () => {
        let getCodeListParams = [
            codeList.exact_date_of_birth,
            codeList.patient_status
        ];
        this.props.getCodeList({
            params: getCodeListParams,
            actionType: [ecsActionType.PUT_GET_CODE_LIST, attendanceActionType.ANA_ATND_PUT_PATIENT_STATUS_LIST]
        });

        // TODO
        const { clinicCd, clinicList } = this.props;
        let redesignListRemarkCodeParams = {
            params: {
                svcCd: this.props.serviceCd,
                siteId: commonUtilities.getSiteId(this.props.serviceCd, clinicCd, clinicList)
            }
        };
        this.props.redesignListRemarkCode(redesignListRemarkCodeParams);
        // this.props.listRemarkCode();
        this.props.listSpecReqTypes({ serviceCd: this.props.serviceCd });
        //get gest calc params
        if (this.isUseGestCalc) {
            this.props.getClcAntGestCalcParams(null, (data) => {
                const gestCalConfigs = (data || []).find(x => x.siteId === this.props.siteId);
                this.setState({
                    gestCalcParams: data,
                    wkStart: gestCalConfigs && gestCalConfigs.wkStart,
                    wkEnd: gestCalConfigs && gestCalConfigs.wkEnd,
                    dayStart: gestCalConfigs && gestCalConfigs.dayStart,
                    dayEnd: gestCalConfigs && gestCalConfigs.dayEnd
                });
            });
        }
    }

    loadDefaultConfig = () => {
        const { serviceCd, clinicCd, clinicConfig } = this.props;
        let where = { serviceCd, clinicCd };
        const autoPrintSlipConfig = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.AUTO_PRINT_APPT_SLIP, clinicConfig, where);
        const crossBookConfig = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.ENABLE_CROSS_BOOK_CLINIC, clinicConfig, where);
        // const defaultEncounterConfig = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.DEFAULT_ENCOUNTER_CD, clinicConfig, where);
        const defaultEncntrTypeId = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.DEFAULT_ENCNTR_TYPE_ID, clinicConfig, where);
        const isShowRemarkTemplate = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_REMARK_TEMPLATE, clinicConfig, where);
        this.props.updateState({
            isEnableCrossBookClinic: crossBookConfig.configValue === 'Y',
            // defaultEncounterCd: defaultEncounterConfig.configValue,
            defaultEncntrTypeId: defaultEncntrTypeId.configValue,
            isShowRemarkTemplate: isShowRemarkTemplate && isShowRemarkTemplate.configValue ? _.toString(isShowRemarkTemplate.configValue) !== '0' : true
        });
    }

    // checkValidCaseNo = () => {
    //     if (this.isUseCaseNo) {
    //         const { caseNoInfo } = this.props;
    //         if (!caseNoInfo || !caseNoInfo.caseNo) {
    //             this.props.openCommonMessage({
    //                 msgCode: '111223',
    //                 btnActions: {
    //                     btn1Click: () => { this.props.deleteSubTabs(AccessRightEnum.booking); }
    //                 }
    //             });
    //         }
    //     }
    // }

    checkIsDirty = () => {
        const {
            pageStatus,
            walkInAttendanceInfo,
            walkInAttendanceInfoBackUp,
            currentSelectedApptInfo
        } = this.props;
        let bookingData = _.cloneDeep(this.props.bookingData);
        let bookingDataBackup = _.cloneDeep(this.props.bookingDataBackup);
        bookingData = {
            ...bookingData,
            appointmentDate: bookingData.appointmentDate && moment(bookingData.appointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            appointmentTime: bookingData.appointmentTime && moment(bookingData.appointmentTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
            multipleAppointmentDate: bookingData.multipleAppointmentDate && moment(bookingData.multipleAppointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        bookingDataBackup = {
            ...bookingDataBackup,
            appointmentDate: bookingDataBackup.appointmentDate && moment(bookingDataBackup.appointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            appointmentTime: bookingDataBackup.appointmentTime && moment(bookingDataBackup.appointmentTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
            multipleAppointmentDate: bookingDataBackup.multipleAppointmentDate && moment(bookingDataBackup.multipleAppointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        let isDirty = false;
        if (pageStatus === pageStatusEnum.VIEW) {
            if (!currentSelectedApptInfo) {
                let compareKeys = [
                    'siteId',
                    'encounterTypeId',
                    'rmId',
                    'qtType',
                    'appointmentDate',
                    'appointmentTime',
                    'elapsedPeriod',
                    'elapsedPeriodUnit',
                    'multipleAppointmentDate',
                    'multipleNoOfAppointment',
                    'multipleInterval',
                    'multipleIntervalUnit',
                    'sessId',
                    'bookingUnit',
                    'forDoctorOnly',
                    'priority',
                    'remarkId',
                    'memo',
                    'patientStatusCd'
                ];
                let compareObj1 = _.pick(bookingData, compareKeys);
                let compareObj2 = _.pick(bookingDataBackup, compareKeys);
                isDirty = !commonUtilities.isEqualObj(compareObj1, compareObj2);
            }
        } else if (pageStatus === pageStatusEnum.WALKIN) {
            let compareKeys = [
                'siteId',
                'encounterTypeId',
                'rmId',
                'confirmECSEligibility',
                'caseIndicator'
            ];
            let compareObj1 = _.pick(bookingData, compareKeys);
            let compareObj2 = _.pick(bookingDataBackup, compareKeys);
            isDirty = !commonUtilities.isEqualObj(compareObj1, compareObj2) || !commonUtilities.isEqualObj(walkInAttendanceInfo, walkInAttendanceInfoBackUp);
        } else if (pageStatus === pageStatusEnum.EDIT) {
            let compareKeys = [
                'siteId',
                'encounterTypeId',
                'rmId',
                'qtType',
                'appointmentDate',
                'appointmentTime',
                'elapsedPeriod',
                'elapsedPeriodUnit',
                'sessId',
                'bookingUnit',
                'forDoctorOnly',
                'priority',
                'remarkId',
                'memo',
                'patientStatusCd'
            ];
            let compareObj1 = _.pick(bookingData, compareKeys);
            let compareObj2 = _.pick(bookingDataBackup, compareKeys);
            isDirty = !commonUtilities.isEqualObj(compareObj1, compareObj2);
        }
        return isDirty;
    }

    saveFunc = (callbackFunc) => {
        const {
            pageStatus,
            serviceCd,
            appointmentMode
        } = this.props;
        this.props.updateState({ doCloseCallbackFunc: callbackFunc || null });
        if (serviceCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE) {
            this.handleBookClick('sppBook');
        } else if (pageStatus === pageStatusEnum.VIEW || pageStatus === pageStatusEnum.WALKIN) {
            this.handleBookClick('Book');
        } else if (pageStatus === pageStatusEnum.EDIT) {
            this.handleUpdateAppointment();
        }
    }

    initDoClose = () => {
        this.doClose = commonUtilities.getDoCloseFunc_2(AccessRightEnum.booking, this.checkIsDirty, this.saveFunc);
        this.props.updateCurTab(AccessRightEnum.booking, this.doClose);
    }

    formSubmitFunc = (callback) => {
        let formSubmit = this.refs.bookingInformationForm.isFormValid(false);
        formSubmit.then(result => {
            if (result) {
                callback && callback();
            } else {
                this.refs.bookingInformationForm.focusFail();
            }
        });
    }

    getLmp = () => {
        const { serviceCd, patientInfo } = this.props;
        let _wrkEdc = serviceCd === 'ANT' && patientInfo?.antSvcInfo?.clcAntCurrent?.sts === caseSts.ACTIVE ? moment(patientInfo?.antSvcInfo?.clcAntCurrent?.wrkEdc).startOf('day') : null;
        let _lmp = _wrkEdc?.isValid?.() ? _wrkEdc.clone().add(-40, 'week').startOf('day') : null;
        // console.log('[ANT] lmp', _lmp);
        this.setState({ lmp: _lmp });
    }

    handleBookClick = (type, cartData) => {
        const { appointmentListCart, serviceCd, appointmentMode, bookingData, defaultCaseTypeCd, encounterTypeList, patientInfo, currentSelectedApptInfo } = this.props;
        this.setState({
            bookType: type
        });
        if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
            this.updateSearchCriteria();
            if (type === 'Book' || type === 'AttendAndPrint') {
                if (serviceCd === 'SHS') {
                    const bookingFunc = () => {
                        this.formSubmitFunc(() => {
                            //should call check api here
                            const encounter = encounterTypeList.find(x => x.encntrTypeId === bookingData.encounterTypeId);
                            const noOfAppt = parseInt(bookingData.multipleNoOfAppointment || '0');
                            if (appointmentMode === BookMeans.MULTIPLE && encounter && encounter.isNewOld === 1 && noOfAppt > 1) {
                                this.props.openCommonMessage({ msgCode: '110201' });
                            } else {
                                const params = {
                                    patientKey: patientInfo.patientKey,
                                    encntrTypeId: bookingData.encounterTypeId
                                    //excludeApptId:currentSelectedApptInfo?currentSelectedApptInfo.appointmentId:''
                                };
                                if (currentSelectedApptInfo) {
                                    params.excludeApptId = currentSelectedApptInfo.appointmentId;
                                }
                                let currentAppt = currentSelectedApptInfo;
                                let newAppt = _.cloneDeep(bookingData);
                                if (!(params.excludeApptId) || (params.excludeApptId && currentAppt.encntrTypeId !== newAppt.encounterTypeId)) {
                                    //reschedule and encounter changed
                                    this.props.checkApptWithEncntrCaseStatus(params, (action) => {
                                        if (action === UNEXPECTED_ACTION_TYPE.APPROVAL) {
                                            this.setState({
                                                approvalDialogParams: {
                                                    ...this.state.approvalDialogParams,
                                                    isOpen: true
                                                }
                                            });
                                        } else if (action === UNEXPECTED_ACTION_TYPE.BLOCK) {
                                            this.props.openCommonMessage({ msgCode: '110201' });
                                        } else {
                                            this.searchTimeSlot(type === 'AttendAndPrint');
                                        }
                                    });
                                } else {
                                    this.searchTimeSlot(type === 'AttendAndPrint');
                                }
                            }
                        });
                    };
                    this.resetApprovalDialogParams(() => {
                        checkAppEncntrCaseStatusBeforeBook(bookingFunc);
                    });
                } else {
                    this.formSubmitFunc(() => { this.searchTimeSlot(type === 'AttendAndPrint'); });
                }
            }
            if (type === 'NewCaseBook') {
                this.formSubmitFunc(this.handleNewCaseNoBook);
            }
            if (type === 'sppBook') {
                if (serviceCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE) {
                    let params = appointmentUtilities.handleBookingDataToParams(_.cloneDeep(bookingData), defaultCaseTypeCd, appointmentMode === BookMeans.MULTIPLE, encounterTypeList);
                    if (params && params.encounterTypeId && params.rmId && params.apptStartDate && params.apptStartDate !== 'Invalid date' && params.numOfBooking && params.intervalVal && params.bookingUnit) {
                        this.handleAddAndBook();
                    } else {
                        if (this.checkIsDirty() && appointmentListCart && appointmentListCart.length) {
                            this.props.openCommonMessage({
                                msgCode: '111245',
                                btnActions: {
                                    btn1Click: () => {
                                        this.handleDiscard();
                                    },
                                    btn2Click: () => { }
                                }
                            });
                        } else if (!this.checkIsDirty()) {
                            this.searchTimeSlot(type === 'AttendAndPrint');
                        } else {
                            this.formSubmitFunc(this.handleAddButton());
                        }
                    }
                }
            }
            if (type === 'sppDialogBook') {
                if (this.props.serviceCd === 'SPP' && this.props.appointmentMode === BookMeans.MULTIPLE) {
                    this.searchTimeSlot(type === 'AttendAndPrint', cartData);
                }
            }
            if (type === 'Add') {
                this.formSubmitFunc(this.handleAddButton);
            }
            if (type === 'DETAIL') {
                this.setState({
                    appointListCartDialogOpen: true
                });
            }
            // if (type === 'AttendAndPrint') {
            //     this.formSubmitFunc(() => {
            //         this.searchTimeSlot(true);
            //     });
            // }
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    }

    handleAddAndBook = (e) => {
        this.handleAddButton(e, 'Book');
    }

    handleDiscard = () => {
        this.initPassInParameters();
        if (this.props.appointmentListCart && this.props.appointmentListCart.length) {
            this.handleBookClick('sppDialogBook');
        }
    }

    handleAddButton = (e, action) => {
        const { defaultCaseTypeCd, appointmentMode, encounterTypeList, bookingData, updateAppointmentListCart } = this.props;
        let params = appointmentUtilities.handleBookingDataToParams(_.cloneDeep(bookingData), defaultCaseTypeCd, appointmentMode === BookMeans.MULTIPLE, encounterTypeList);
        params.encntrGrpCd = bookingData.encntrGrpCd;
        params.patientStatusCd = bookingData.patientStatusCd;
        if (!params || !params.encounterTypeId || !params.rmId || !params.apptStartDate || params.apptStartDate === 'Invalid date' || !params.numOfBooking || !params.intervalVal || !params.bookingUnit) return;
        this.props.getBookingMaximumTimeslot(this.props.bookingData.encounterTypeId, (data) => {
            if (parseInt(params.bookingUnit) > data.data.maxTmslt) {
                this.props.openCommonMessage({
                    msgCode: '110369'
                });
            } else {
                updateAppointmentListCart(params, 'Add', (cartData) => {
                    this.initPassInParameters(cartData);
                    if (action === 'Book') {
                        this.handleBookClick('sppDialogBook', cartData);
                    }
                });
            }
        });
    }

    filterAppointmentListCartDataToParams = (data) => {
        return data.map((item) => {
            item.sessId = (item.sessId === '*All' ? null : item.sessId);
            return item;
        });
    }

    searchTimeSlot = (isAttendAndPrint = false, cartData) => {
        const { defaultCaseTypeCd, appointmentMode, pageStatus, encounterTypeList, serviceCd, bookingData, patientInfo } = this.props;
        let params = appointmentUtilities.handleBookingDataToParams(_.cloneDeep(bookingData), defaultCaseTypeCd, appointmentMode === BookMeans.MULTIPLE, encounterTypeList);
        if (serviceCd !== 'SPP' && appointmentMode !== BookMeans.MULTIPLE) {
            if (!params) return;
        } else {

            // console.log(this.checkIsDirty());
        }
        if (pageStatus === pageStatusEnum.WALKIN) {
            // if (serviceCd === 'ANT') {
            //     if (bookingData.encounterTypeCd === 'ENC_TRANS') {
            //         this.transferIn.doTransferIn(isAttendAndPrint);
            //     } else {
            //         this.handleWalkIn(isAttendAndPrint);
            //     }
            // } else {
            this.handleWalkIn(isAttendAndPrint);
            // }
        } else {
            if (serviceCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE) {
                const { appointmentListCart } = this.props;
                this.props.auditAction('Book New Appointment');
                let paramsData = this.filterAppointmentListCartDataToParams(cartData ? cartData : appointmentListCart);
                this.props.sppMultipleBooking(paramsData, (data) => {
                    this.setState({ multipleSlotData: data });
                });
            } else {
                this.props.getBookingMaximumTimeslot(this.props.bookingData.encounterTypeId, (data) => {
                    if (parseInt(this.props.bookingData.bookingUnit) > data.data.maxTmslt) {
                        this.props.openCommonMessage({
                            msgCode: '110369'
                        });
                    } else {
                        if (params) {
                            if (serviceCd === 'SHS') {
                                const daysOfWeek = this.state.daysOfWeekValArr.join('');
                                // const daysOfWeekDefault = getDaysOfWeekDefault();
                                // if (daysOfWeek !== daysOfWeekDefault) {
                                params.daysOfWeek = daysOfWeek;
                                // }
                            }
                            params.patientKey = this.props.patientInfo.patientKey;
                            this.props.auditAction('Book New Appointment');
                            this.props.appointmentBook(params);
                            this.props.updateState({ bookWithNewCase: false });

                        }
                    }
                });
            }
        }
    }

    handleWalkIn = (isAttendAndPrint) => {
        //Case No handle
        const { patientInfo, caseNoInfo, bookingData, serviceCd, clinicCd } = this.props;
        let idSts = patientInfo ? patientInfo.idSts : 'T';
        let patientLabel = commonUtilities.getPatientCall();
        if (idSts !== 'N') {
            this.props.openCommonMessage({
                msgCode: '130209',
                params: [{ name: 'PATIENT_LABEL', value: patientLabel },
                { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
                ]
            });
        } else {
            // CaseNoUtil.handleCaseNoBeforeBook(caseNoInfo && caseNoInfo.caseNo, patientInfo, (callbackPara,callbackAction) => {
            const _caseNoInfo = JSON.stringify(caseNoInfo) === '{}' ? null : caseNoInfo;
            let caseNo = '';
            const isPMICaseNoAliasGen = CaseNoUtil.pmiCaseNoAliasGenSiteVal();
            const isPmiCaseWithEnctrGrp = CaseNoUtil.pmiCaseWithEnctrGrpVal();
            if (isPMICaseNoAliasGen === true) {
                if (isPmiCaseWithEnctrGrp === true) {
                    if (caseNoInfo.encntrGrpCd && caseNoInfo.encntrGrpCd === bookingData.encntrGrpCd) {
                        caseNo = _caseNoInfo.caseNo;
                    }
                }
            } else {
                caseNo = _caseNoInfo && _caseNoInfo.caseNo || '';
            }
            const _bookingData = { ...bookingData, caseNo: caseNo, siteCd: clinicCd };
            CaseNoUtil.handleCaseNoBeforeAttend(patientInfo, _bookingData, serviceCd, (callbackPara, callbackAction) => {
                if (typeof (callbackPara) !== 'undefined') {
                    if (typeof (callbackPara) === 'string') {
                        if (bookingData.encounterTypeCd === 'ENC_TRANS' && serviceCd === 'ANT') {
                            this.transferIn.doTransferIn({ isAttendAndPrint, caseNo: callbackPara });
                        } else if (serviceCd === 'EHS') {
                            this.hanldeEHSBookAndAttend(callbackPara, isAttendAndPrint);
                        } else {
                            this.handleBookAndAttend(callbackPara, isAttendAndPrint);
                        }
                    }
                    else {
                        if (callbackPara === null && typeof (callbackAction) === 'string') {
                            if (callbackAction === 'fail') {
                                this.props.openCommonMessage({
                                    msgCode: '111015',
                                    params: [{ name: 'HEADER', value: 'Walk In Attendance' }],
                                    btnActions: {
                                        btn1Click: () => {
                                            new Promise((resolve) => {
                                                this.props.closeCommonMessage();
                                                resolve();
                                            }).then(() => {
                                                // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
                                                // let isNotCounterRole = commonUtilities.checkingIsNotCounterRole(this.props.loginUserRoleList);
                                                // if (isNotCounterRole) {
                                                //     commonUtilities.closeTabByPatientSpecTabCloseBtn();
                                                // } else {
                                                //     this.props.skipTab(AccessRightEnum.patientSummary);
                                                // }
                                                this.props.skipTab(AccessRightEnum.patientSummary);
                                            });
                                        }
                                    }
                                });
                            } else if (callbackAction === 'no active rule') {
                                this.props.openCommonMessage({
                                    msgCode: '110166'
                                });
                            }
                        } else if (serviceCd === 'EHS') {
                            this.hanldeEHSBookAndAttend(callbackPara, isAttendAndPrint);
                        } else {
                            this.handleBookAndAttend(callbackPara, isAttendAndPrint);
                        }
                    }
                } else if (serviceCd === 'EHS') {
                    this.hanldeEHSBookAndAttend(null, isAttendAndPrint);
                } else {
                    this.handleBookAndAttend(null, isAttendAndPrint);
                }
            });
        }
    }

    handleNewCaseNoBook = () => {
        const { defaultCaseTypeCd, appointmentMode, encounterTypeList } = this.props;
        let params = appointmentUtilities.handleBookingDataToParams(_.cloneDeep(this.props.bookingData), defaultCaseTypeCd, appointmentMode === BookMeans.MULTIPLE, encounterTypeList);
        if (params) {
            const { patientInfo } = this.props;
            params.patientKey = patientInfo.patientKey;
            this.props.auditAction('Book New Case Appointment');
            this.props.appointmentBook(params);
            this.props.updateState({ bookWithNewCase: true });
        }
    }

    refreshPatientPanel = ({ patientKey, appointmentId, caseNo, callBack }) => {
        let params = {
            patientKey,
            appointmentId,
            caseNo,
            callBack
        };
        this.props.getPatientPanelPatientById(params);
    }

    //isAutoPrintSlip logic
    confirmCallback = (apptInfo) => {
        //SHS encounter case reason log
        this.fetchLogShsEncntrCaseDto(apptInfo);

        const { patientInfo, caseNoInfo, bookingData, doCloseCallbackFunc, serviceCd, appointmentListCart } = this.props;
        if (doCloseCallbackFunc) {
            doCloseCallbackFunc(true);
            this.props.updateState({ doCloseCallbackFunc: null });
        } else {
            if (this.state.isAutoPrintSlip) {
                if (this.props.appointmentMode === BookMeans.MULTIPLE) {
                    if (serviceCd === 'SPP') {
                        const resultDto = apptInfo.multipleConfirmApptDtos;
                        let apptList = [];
                        let apptIds = [];
                        resultDto.forEach(result => {
                            if (result.bookSuccess) {
                                apptList = [
                                    ...apptList,
                                    ...result.confirmResultList
                                ];
                                apptIds = [
                                    ...apptIds,
                                    apptList.map(item => item.apptId)
                                ];
                            }
                        });
                        let reportParam = {
                            encounterTypeId: appointmentListCart[0].encounterTypeId,
                            siteId: appointmentListCart[0].siteId,
                            rmId: appointmentListCart[0].rmId,
                            patientKey: patientInfo.patientKey,
                            slipType: 'Multiple',
                            allAppointment: false,
                            appointmentIds: apptIds.join(','),
                            isShowDetail: true
                        };
                        this.props.getAppointmentReport(reportParam);
                    } else {
                        const apptList = apptInfo.confirmResultList;
                        if (apptList && apptList.length > 0) {
                            let apptIds = apptList.map(item => item.apptId);
                            let reportParam = {
                                encounterTypeId: bookingData.encounterTypeId,
                                siteId: bookingData.siteId,
                                rmId: bookingData.rmId,
                                patientKey: patientInfo.patientKey,
                                slipType: 'Multiple',
                                allAppointment: false,
                                appointmentIds: apptIds.join(','),
                                isShowDetail: true
                            };
                            this.props.getAppointmentReport(reportParam);
                        }
                    }
                } else if (this.props.appointmentMode === BookMeans.SINGLE) {
                    const apptId = appointmentUtilities.apptIdHandler(apptInfo, patientInfo.patientKey);
                    if (apptId) {
                        let reportParam = {
                            appointmentId: apptId,
                            siteId: bookingData.siteId,
                            rmId: bookingData.rmId,
                            patientKey: patientInfo.patientKey,
                            encounterTypeId: bookingData.encounterTypeId,
                            slipType: 'Single',
                            isShowDetail: true
                        };
                        this.props.getAppointmentReport(reportParam);
                    }
                }
            }
        }

        //update patient status
        const newCaseNo = apptInfo.caseDto ? apptInfo.caseDto.caseNo : '';
        const caseNo = newCaseNo ? newCaseNo : caseNoInfo && caseNoInfo.caseNo;
        this.refreshPatientPanel({
            patientKey: patientInfo.patientKey,
            caseNo: caseNo
        });
        this.resetDaysOfWeek();
        if (serviceCd === 'SPP' && this.props.appointmentMode === BookMeans.MULTIPLE) {
            this.setState({
                successCount: apptInfo.successCount || 0,
                totalCount: apptInfo.totalCount || 0
            });
            this.props.updateState({ appointmentListCart: [], bookTimeSlotData: [] });
        }
    };

    fetchLogShsEncntrCaseDto = (apptInfo) => {
        const { approvalDialogParams } = this.state;
        const { bookingData, patientInfo, appointmentMode } = this.props;
        if (approvalDialogParams.staffId) {
            const encounterDto = bookingData.encounterTypeList.find(x => x.encntrTypeId === bookingData.encounterTypeId);
            if (encounterDto && apptInfo) {
                let apptIds = [];
                if (appointmentMode === BookMeans.MULTIPLE) {
                    apptIds = apptInfo.confirmResultList && apptInfo.confirmResultList.map(x => x.apptId);
                } else {
                    apptIds = [apptInfo.apptId];
                }
                this.props.logShsEncntrCase({
                    'actionType': 'A',
                    'approvalRsnCd': approvalDialogParams.rsnCd,
                    'approvalRsnTxt': approvalDialogParams.rsnTxt,
                    'approverId': approvalDialogParams.staffId,
                    'apptIds': apptIds,
                    'isNewOldEncntrType': encounterDto.isNewOld,
                    'patientKey': patientInfo.patientKey,
                    'sspecId': encounterDto.sspecId
                });
            }
            this.resetApprovalDialogParams();
        }
    }

    //Currently only for single booking
    reBookConfirm = () => {
        const { currentSelectedApptInfo, bookTimeSlotData, bookSqueezeInTimeSlotData, bookingData, appointmentHistory } = this.props;
        let readyTimeSlots = bookSqueezeInTimeSlotData ? bookSqueezeInTimeSlotData : bookTimeSlotData;
        let apptDateTime = moment(moment(readyTimeSlots[0].list[0].slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE) + ' ' + readyTimeSlots[0].list[0].startTime + ':00').format();
        const selected_apptInfo = appointmentHistory.find(item => item.appointmentId === currentSelectedApptInfo.appointmentId);
        const selected_apptInfo_baseVo = selected_apptInfo.appointmentDetlBaseVoList.find(item => item.isObs === 0);
        // const selected_apptInfo_baseVo_mapTimeslot = selected_apptInfo_baseVo.mapAppointmentTimeSlotVosList.find(i => i.apptDetlId == selected_apptInfo_baseVo.apptDetlId);
        let updateApptPara = {
            appointmentId: selected_apptInfo.appointmentId,
            caseNo: selected_apptInfo.caseNo,
            patientKey: selected_apptInfo.patientKey,
            //siteId: selected_apptInfo.siteId,
            siteId: bookingData.siteId,
            //encntrTypeCd: selected_apptInfo.encntrTypeCd,
            encntrTypeCd: bookingData.encounterTypeCd,
            //rmCd: selected_apptInfo.rmCd,
            rmCd: bookingData.rmCd,
            isTrace: selected_apptInfo.isTrace,
            attnStatusCd: selected_apptInfo.attnStatusCd,
            //apptTypeCd: selected_apptInfo.apptTypeCd,'
            apptTypeCd: bookingData.qtType,
            firstOfferApptDtm: selected_apptInfo.firstOfferApptDtm,
            version: selected_apptInfo.version,
            apptDateTime: apptDateTime,
            apptDateEndTime: null,
            isSqueeze: readyTimeSlots[0].isSqueeze ? 1 : 0,
            isUrgSqueeze: readyTimeSlots[0].isUrgentSqueeze ? 1 : 0,
            bookingUnit: bookingData.bookingUnit,
            reschRsnTypeId: bookingData.reschRsnTypeId,
            reschRsnRemark: bookingData.reschRsnRemark,
            memo: bookingData.memo || '',
            forDoctorOnly: bookingData.forDoctorOnly || '',
            priority: bookingData.priority || '',
            patientStatusCd: bookingData.patientStatusCd,
            appointmentDetlBaseVoList: [{
                ...selected_apptInfo_baseVo,
                sessId: bookingData.sessId,
                encntrTypeId: bookingData.encounterTypeId,
                rmId: bookingData.rmId,
                memo: bookingData.memo || '',
                mapAppointmentTimeSlotVosList: []
            }]
        };
        readyTimeSlots[0].list.forEach(x => {
            let sdtmString = x.slotDate + ' ' + x.startTime + ':00';
            let edtmString = x.slotDate + ' ' + x.endTime + ':00';
            let sdtm = moment(new Date(sdtmString)).format();
            let edtm = moment(new Date(edtmString)).format();
            updateApptPara.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.push({
                qtType: bookingData.qtType,
                sdtm: sdtm,
                edtm: edtm,
                tmsltId: x.slotId
            });
        });
        if (this.props.serviceCd === 'SHS') {
            const { searchCriteria } = this.state;
            const searchCriteriaStr = appointmentUtilities.readySearchCriteriaStr(searchCriteria);
            updateApptPara.searchCriteria = searchCriteriaStr;
            updateApptPara.isTrace = bookingData.isTrace || 0;
            updateApptPara.dfltTraceRsnTypeId = bookingData.dfltTraceRsnTypeId || '';
            updateApptPara.dfltTraceRsnRemark = bookingData.dfltTraceRsnRemark || '';
            updateApptPara.isDfltTracePriority = bookingData.isDfltTracePriority || 0;
        }
        this.props.auditAction('Confirm Reschedule Appointment');
        this.props.submitUpdateAppointment({
            updateApptPara,
            updateOrBookNew: UpdateMeans.BOOKNEW,
            callback: this.confirmCallback
        });
    }

    checkingBeforeConfirm = () => {
        const { patientInfo } = this.props;
        //no patient
        if (!patientInfo || !patientInfo.patientKey) {
            this.props.openCommonMessage({
                msgCode: '110205',
                params: [{ name: 'PATIENT_CALL', value: commonUtilities.getPatientCall() }]
            });
            return false;
        }
        //dead patient
        if (parseInt(patientInfo.deadInd)) {
            this.props.openCommonMessage({
                msgCode: '110206',
                params: [{ name: 'PATIENT_CALL', value: commonUtilities.getPatientCall() }]
            });
            return false;
        }
        return true;
    }

    checkCaseNo = (callback) => {
        const { patientInfo, caseNoInfo, waitingList, bookWithNewCase, pageStatus } = this.props;
        if (waitingList) {
            callback();
            return;
        }
        if (pageStatus === pageStatusEnum.EDIT) {
            callback();
            return;
        }
        //new case booking and case no handle
        if (commonUtilities.isNewCaseBookingFlow() && this.isUseCaseNo) {
            if (bookWithNewCase) {
                CaseNoUtil.handleNewCaseNoBeforeBook(patientInfo, (callbackPara) => {
                    if (callbackPara) {
                        if (typeof (callbackPara) === 'string') {
                            this.refreshPatientPanel({
                                patientKey: patientInfo.patientKey,
                                caseNo: callbackPara,
                                callBack: () => {
                                    callback();
                                }
                            });
                        } else {
                            callback(callbackPara);
                        }
                    }
                });
                return;
            }
            // else {
            //     CaseNoUtil.handleCaseNoBeforeBook(caseNoInfo && caseNoInfo.caseNo, patientInfo, (caseNo) => {
            //         if (caseNo) {
            //             this.refreshPatientPanel({
            //                 patientKey: patientInfo.patientKey,
            //                 caseNo: caseNo,
            //                 callBack: () => {
            //                     callback();
            //                 }
            //             });
            //         } else {
            //             callback();
            //         }
            //     });
            // }
            // return;
        }
        callback();
    }

    getConfirmParams = ({ bookTimeSlot, bookingData, caseNoInfo, patientInfo, caseDto }) => {
        let params;
        const { bookType, searchCriteria } = this.state;
        if (bookTimeSlot) {
            // TODO : Set time zone offset specified Back end send the Date format or input send the String ?
            let sdtmString = bookTimeSlot.slotDate + ' ' + bookTimeSlot.list[0].startTime + ':00';
            let edtmString = bookTimeSlot.slotDate + ' ' + bookTimeSlot.list[0].endTime + ':00';
            // Set the appt Date and Time FYI :. Time Slot Date Time
            let apptDate = moment(moment(bookTimeSlot.list[0].slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE) + ' ' + bookTimeSlot.list[0].startTime + ':00').format();
            let sdtm = moment(new Date(sdtmString)).format();
            let edtm = moment(new Date(edtmString)).format();
            let bookTimeSlotParams = [];
            for (let a = 0; a < bookTimeSlot.list.length; a++) {
                bookTimeSlotParams[a] = bookTimeSlot.list[a].slotId;
            }
            let _caseNoInfo = _.cloneDeep(caseNoInfo);
            const isOtherEncntrGrpAppt = appointmentUtilities.checkIsOtherEncntrGrpAppt(_caseNoInfo, bookingData, this.props.serviceCd, patientInfo);
            if (isOtherEncntrGrpAppt) {
                _caseNoInfo = {};
            }

            params = {
                apptDate: apptDate,
                //endDateTime
                edtm: edtm,
                encntrTypeId: bookingData.encounterTypeId,
                isObs: 0,
                isSqueeze: bookTimeSlot.isSqueeze || 0,
                isUrgSqueeze: bookTimeSlot.isUrgentSqueeze || 0,
                memo: bookTimeSlot.memo || '',
                // TODO : Not need input ; API not do any action;
                patientKey: patientInfo.patientKey === '0' ? '' : patientInfo.patientKey,
                // qtId: appointmentUtilities.getQuotaByCaseTypeCd(bookingData.appointmentTypeCd, bookingData.caseTypeCd),
                qtId: bookingData.qtType,
                remarkTypeId: bookTimeSlot.remarkId || 0,
                rmId: bookingData.rmId,
                sdtm: sdtm,
                seq: 0,
                sessId: bookTimeSlot.list[0].sessId,
                siteId: bookingData.siteId,
                // Fyi :. list for one slot.
                tmsltIdList: bookTimeSlotParams,
                caseNo: bookType === 'NewCaseBook' ? '' : _caseNoInfo.caseNo || '',
                patientStatusCd: bookingData.patientStatusCd,
                forDoctorOnly: bookingData.forDoctorOnly || '',
                priority: bookingData.priority || '',
                caseDto: caseDto || null
            };
            if (this.props.serviceCd === 'SHS') {
                const searchCriteriaStr = appointmentUtilities.readySearchCriteriaStr(searchCriteria);
                params.searchCriteria = searchCriteriaStr;
                params = {
                    ...params,
                    isTrace: bookingData.isTrace || 0,
                    dfltTraceRsnTypeId: bookingData.dfltTraceRsnTypeId || '',
                    dfltTraceRsnRemark: bookingData.dfltTraceRsnRemark || '',
                    isDfltTracePriority: bookingData.isDfltTracePriority || 0
                };
            }

            if (this.props.serviceCd === 'SPP') {
                params.idx = bookTimeSlot.idx;
            }
        }
        return params;
    }

    handReplaceOldAppointmnet = () => {
        if (!this.checkingBeforeConfirm()) return;
        // hand ODC Logic handleBookConfirm
        const {
            caseNoInfo,
            bookingData,
            replaceAppointmentData,
            patientInfo,
            appointmentMode,
            pageStatus,
            isFamilyReplace
        } = this.props;

        const { caseDto } = this.state;

        if (appointmentMode === BookMeans.MULTIPLE) {
            this.props.replaceOldAppointmnet(null, this.confirmCallback);
            return;
        }

        if (pageStatus === pageStatusEnum.EDIT) {
            this.props.replaceOldAppointmnet(null, this.confirmCallback);
            return;
        }

        if(!isFamilyReplace){
        let replaceableAppointmentDtoList = [];
        replaceAppointmentData.bookingData.forEach(bookingData => {
            let replaceableAppointmentDto = {
                apptId: bookingData.appointmentId,
                version: bookingData.version
            };
            replaceableAppointmentDtoList.push(replaceableAppointmentDto);
        });

        // TODO:. ROCKY for if bookTimeSlotData to exact Data time and  ----> isSqueeze need cloneDeep
        let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ?
            _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);
        let params = [];
        for (let i = 0; i < bookTimeSlotList.length; i++) {
            // TODO : Get SlotList Appt Date AND sdtm AND edtm
            let newObj = [
                {
                    confirmAppointmentDto: this.getConfirmParams({
                        bookTimeSlot: bookTimeSlotList[i],
                        bookingData,
                        patientInfo,
                        caseNoInfo,
                        caseDto
                    }),
                    replaceableAppointmentDtoList: replaceableAppointmentDtoList
                }
            ];
            params.push(newObj);
        }

        let submitParams = {
            params
        };

        this.props.replaceOldAppointmnet(submitParams, this.confirmCallback);
        }
        else this.props.replaceOldAppointmnet([], this.confirmCallback);

        this.props.resetReplaceAppointment();
    }

    handStillAppointments = () => {
        if (!this.checkingBeforeConfirm()) return;
        // hand ODC Logic handleBookConfirm
        const {
            caseNoInfo,
            bookingData,
            appointmentMode,
            multipleReplaceApptData,
            patientInfo,
            openReplaceAppointmentDialog,
            pageStatus,
            rescheduleApptData
        } = this.props;

        const { caseDto } = this.state;

        if (appointmentMode === BookMeans.MULTIPLE) {
            if (multipleReplaceApptData.isReplaceAppointment && !openReplaceAppointmentDialog) {
                this.props.updateState({ openReplaceAppointmentDialog: true, openSameDayAppointmentDialog: false });
            } else {
                this.props.stillAppointmentsBookConfirm(null, this.confirmCallback);
            }
            return;
        }

        if (pageStatus === pageStatusEnum.EDIT) {
            if (rescheduleApptData.isReplaceAppointment && !openReplaceAppointmentDialog) {
                this.props.updateState({ openReplaceAppointmentDialog: true, openSameDayAppointmentDialog: false });
            } else {
                this.props.stillAppointmentsBookConfirm(null, this.confirmCallback);
            }
            return;
        }

        // TODO:. ROCKY for if bookTimeSlotData to exact Data time and  ----> isSqueeze need cloneDeep
        let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ?
            _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);
        let params = [];

        for (let i = 0; i < bookTimeSlotList.length; i++) {
            // TODO : Get SlotList Appt Date AND sdtm AND edtm
            let newObj = this.getConfirmParams({
                bookTimeSlot: bookTimeSlotList[i],
                bookingData,
                patientInfo,
                caseNoInfo,
                caseDto
            });
            params.push(newObj);
        }

        let submitParams = {
            params
        };

        this.props.stillAppointmentsBookConfirm(submitParams, this.confirmCallback);
        this.props.resetReplaceAppointment();
    }

    // NOTE handleBookConfirm
    handleBookConfirm = (bookTimeSlotList, isAutoPrintSlip) => {
        if (!bookTimeSlotList) return;
        if (!this.checkingBeforeConfirm()) return;
        this.setState({ isAutoPrintSlip }, () => {
            this.checkCaseNo((caseDto) => {
                const { caseNoInfo, pageStatus, bookingData, patientInfo } = this.props;
                let checkBookingRuleParams = [];
                let params = [];
                for (let i = 0; i < bookTimeSlotList.length; i++) {
                    let newObj = this.getConfirmParams({
                        bookTimeSlot: bookTimeSlotList[i],
                        bookingData,
                        patientInfo,
                        caseNoInfo,
                        caseDto
                    });
                    // Checking the More one Appt ??
                    let checkBookingRule = {
                        svcCd: this.props.serviceCd,
                        siteId: bookingData.siteId,
                        encounterTypeId: bookingData.encounterTypeId,
                        patientKey: patientInfo.patientKey,
                        tmsltIdList: newObj.tmsltIdList
                    };

                    checkBookingRuleParams.push(checkBookingRule);
                    params.push(newObj);
                }

                let submitParams = {};
                if (this.props.appointmentMode === BookMeans.MULTIPLE) {
                    submitParams = { params };
                } else {
                    submitParams = { params: params[0] };
                }

                if (this.props.waitingList) {
                    let waitingParams = {
                        confirmAppointmentDto: submitParams.params,
                        ...this.props.waitingList
                    };
                    this.props.auditAction('Confirm Waiting Booking');
                    this.props.bookConfirmWaiting(waitingParams, this.confirmCallback);
                } else {
                    if (pageStatus === pageStatusEnum.EDIT) {
                        this.props.updateState({ pageDialogStatus: PAGE_DIALOG_STATUS.RESCHEDULE });
                    } else {
                        this.props.auditAction('Confirm Booking');
                        if (caseDto) {
                            this.setState({ caseDto });
                        }
                        this.props.bookConfirm(submitParams, checkBookingRuleParams, this.confirmCallback);
                    }
                }
            });
        });
    }

    handleSppBookConfirm = (bookTimeSlotList, isAutoPrintSlip) => {
        if (!bookTimeSlotList) return;
        if (!this.checkingBeforeConfirm()) return;
        this.setState({ isAutoPrintSlip }, () => {
            this.checkCaseNo((caseDto) => {
                const { caseNoInfo, pageStatus, appointmentListCart, patientInfo } = this.props;
                let checkBookingRuleParams = [];
                let params = [];
                for (let i = 0; i < bookTimeSlotList.length; i++) {
                    let bookingData = appointmentListCart.find(x => x.idx === bookTimeSlotList[i].idx);
                    bookingData.qtType = bookingData.qtId;
                    let newObj = this.getConfirmParams({
                        bookTimeSlot: bookTimeSlotList[i],
                        bookingData,
                        patientInfo,
                        caseNoInfo,
                        caseDto
                    });
                    // Checking the More one Appt ??
                    let checkBookingRule = {
                        svcCd: this.props.serviceCd,
                        siteId: bookingData.siteId,
                        encounterTypeId: bookingData.encounterTypeId,
                        patientKey: patientInfo.patientKey,
                        tmsltIdList: newObj.tmsltIdList
                    };

                    checkBookingRuleParams.push(checkBookingRule);
                    params.push(newObj);
                }

                let submitParams = {};
                if (this.props.appointmentMode === BookMeans.MULTIPLE) {
                    const { multipleSlotData } = this.state;
                    let multipleConfirmData = [];
                    multipleSlotData.forEach(s => {
                        let grp = [];
                        for (let i = 0; i < params.length; i++) {
                            const { idx } = s;
                            if (params[i].idx === idx) {
                                //delete params[i].idx;
                                grp.push(params[i]);
                            }
                        }
                        multipleConfirmData.push(grp);
                    });

                    submitParams = { params: multipleConfirmData };
                } else {
                    submitParams = { params: params[0] };
                }
                if (pageStatus === pageStatusEnum.EDIT) {
                    this.props.updateState({ pageDialogStatus: PAGE_DIALOG_STATUS.RESCHEDULE });
                } else {
                    this.props.auditAction('Confirm Booking');
                    if (caseDto) {
                        this.setState({ caseDto });
                    }
                    this.props.bookConfirm(submitParams, checkBookingRuleParams, this.confirmCallback);
                }
            });
        });
    }

    handleBookSearch = (multipleSlotIdx) => {
        this.props.updateState({ pageDialogStatus: PAGE_DIALOG_STATUS.SEARCHING });
        if (typeof (multipleSlotIdx) === 'number' && multipleSlotIdx > -1) {
            this.setState({ multipleSlotIdx });
        }
    }

    handleBookCancel = () => {
        this.setState({ caseDto: null });
        if (this.props.pageStatus === pageStatusEnum.EDIT) {
            this.props.updateState({ pageStatus: pageStatusEnum.EDIT });
        } else {
            this.props.updateState({ pageStatus: pageStatusEnum.VIEW });
        }
        this.props.updateState({ pageDialogStatus: PAGE_DIALOG_STATUS.NONE, bookConfirmSelected: -1 });
    }

    handleSqueezeInCancel = () => {
        this.setState({ caseDto: null });
        if (this.props.pageStatus === pageStatusEnum.EDIT) {
            this.props.updateState({ pageDialogStatus: PAGE_DIALOG_STATUS.NONE, bookConfirmSelected: -1 });
        } else {
            this.props.updateState({ pageStatus: pageStatusEnum.VIEW });
            this.props.updateState({ pageDialogStatus: PAGE_DIALOG_STATUS.NONE, bookConfirmSelected: -1 });
        }
    }

    hanldeEHSBookAndAttend = (caseNoVal, isAttendAndPrint = false) => {
        const { patientInfo, bookingData, siteId } = this.props;
        const checkBeforeAtnd = commonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'EHS_PMI_INFO_CHECK_BEFORE_ATND');
        const enctrCdArr = ((checkBeforeAtnd && checkBeforeAtnd.configValue) || '').split(',');
        if (enctrCdArr.includes(bookingData.encounterTypeCd)) {
            if (patientInfo.patientEhsDto && patientInfo.patientEhsDto.lastChkDate && moment().isSame(moment(patientInfo.patientEhsDto.lastChkDate), 'days')) {
                this.setState({confirmAtndDialogOpen:true},()=>{
                    this.confirmAtndRef.doEhsConfirmAtnd({ isAttendAndPrint, caseNo: caseNoVal });
                });
            } else {
                this.props.openCommonMessage({
                    msgCode: '111018',
                    btnActions: {
                        btn1Click: () => {
                            this.props.updateLastCheckDate( {
                                patientKey: patientInfo.patientKey,
                                lastChkDate: moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                                version: patientInfo.patientEhsDto && patientInfo.patientEhsDto.version
                            } ,()=>{
                                this.props.refreshPatient({isRefreshCaseNo: true, callBack: ()=>{
                                    this.setState({confirmAtndDialogOpen:true},()=>{
                                        this.confirmAtndRef.doEhsConfirmAtnd({ isAttendAndPrint, caseNo: caseNoVal });
                                    });
                                }});
                            });
                        },
                        btn2Click: () => {
                            new Promise((resolve) => {
                                this.props.closeCommonMessage();
                                resolve();
                            }).then(() => {
                                this.props.skipTab(AccessRightEnum.patientSummary);
                            });
                        }
                    }
                });
            }
        } else {
            this.setState({confirmAtndDialogOpen:true},()=>{
                this.confirmAtndRef.doEhsConfirmAtnd({ isAttendAndPrint, caseNo: caseNoVal });
            });
        }
    }

    handleBookAndAttend = (caseNoVal, isAttendAndPrint = false) => {
        let { bookingData, patientInfo, walkInAttendanceInfo, caseNoInfo, defaultCaseTypeCd, serviceCd, siteId, patientSvcExist, doCloseCallbackFunc } = this.props;
        const { confirmTransferIn, transferInData } = this.state;
        const { ehsConfirmAttendance, ehsConfirmAtndData } = this.state;
        const isCaseDto = typeof (caseNoVal) === 'object';

        let reqDto = {
            walkInDateTime: moment(bookingData.appointmentDate).set({
                hour: moment(bookingData.appointmentTime).hour(),
                minute: moment(bookingData.appointmentTime).minute()
            }).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
            encntrTypeId: bookingData.encounterTypeId,
            isObs: 0,
            patientKey: patientInfo.patientKey,
            rmId: bookingData.rmId,
            seq: 0,
            // discNum: walkInAttendanceInfo.discNumber,
            siteId: bookingData.siteId,
            //caseNo: bookingData.caseNo || (caseDto ? null : caseNoInfo.caseNo),
            caseNo: isCaseDto ? null : caseNoVal,
            patientStatusCd: bookingData.patientStatusCd,
            chnlCd: 'COUNTER',
            discNum: bookingData.discNum,
            isNep: bookingData.isNep,
            nepRemark: bookingData.nepRemark,
            //caseDto: caseDto || null
            caseDto: isCaseDto ? caseNoVal : null,
            cgsInpatientCnsltLocCd: bookingData.cgsInpatientCnsltLocCd,
            cgsInpatientCnsltLocId: bookingData.cgsInpatientCnsltLocId
            /*
            amount: walkInAttendanceInfo.amount,
            paymentMeanCD: walkInAttendanceInfo.paymentMeanCD*/
        };
        const isNewToSvcSiteParam = commonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = commonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';

        if ((isNewToSvc === '1') && !patientSvcExist) {
            reqDto.patientSvcSts = bookingData.caseIndicator;
        }
        if ((isAttenConfirmEcsEligibility === '1')) {
            reqDto.isRqrCnsltFee = bookingData.confirmECSEligibility === 'C' ? false : true;
            reqDto.isPaidCnsltFee = bookingData.confirmECSEligibility === 'C' ? false : true;
            reqDto.isRqrPrscrbFee = bookingData.confirmECSEligibility === 'C' ? false : true;
            reqDto.isPaidPrscrbFee = bookingData.confirmECSEligibility === 'C' ? false : true;
            reqDto.isQueueProcessed = true;
            reqDto.isEcsElig = bookingData.confirmECSEligibility === 'C' ? true : false;
            reqDto.isFeeSettled = bookingData.confirmECSEligibility === 'C' ? false : true;
        }

        if (this.props.serviceCd === 'SHS') {
            const { searchCriteria } = this.state;
            const searchCriteriaStr = appointmentUtilities.readySearchCriteriaStr(searchCriteria);
            reqDto.searchCriteria = searchCriteriaStr;
        }
        if (ehsConfirmAttendance === true) {
            reqDto.waiverCatgryCd = ehsConfirmAtndData.ehsWaiverCategoryCd;
            reqDto.ehsTeamId = ehsConfirmAtndData.team;
            reqDto.ehsMbrSts = patientInfo?.ehsMbrSts;
            this.setState({ ehsConfirmAttendance: false, ehsConfirmAtndData: null });
        }

        this.props.auditAction('Walk In Attendance');
        const fetchWalkIn = () => {
            this.props.walkInAttendance(reqDto, bookingData, walkInAttendanceInfo, (apptData) => {
                if (doCloseCallbackFunc) {
                    if (this.props.serviceCd === 'SHS') {
                        this.updateOpenPaymentMsgParams({ open: true, encounterTypeId: bookingData.encounterTypeId });
                    } else {
                        this.props.doCloseCallback(true);
                        this.props.updateState({ doCloseCallbackFunc: null });
                    }
                } else {
                    if (apptData.appointmentId) {
                        if (this.props.serviceCd === 'SHS') {
                            this.updateOpenPaymentMsgParams({ open: true, encounterTypeId: bookingData.encounterTypeId });
                        }
                        if (isAttendAndPrint) {
                            let reportParam = {
                                appointmentId: apptData.appointmentId,
                                siteId: bookingData.siteId,
                                rmId: bookingData.rmId,
                                patientKey: patientInfo.patientKey,
                                encounterTypeId: bookingData.encounterTypeId,
                                slipType: 'Single',
                                isShowDetail: true
                            };
                            this.props.getAppointmentReport(reportParam);
                        }
                        // this.props.getPatientAppointment(appointmentId, patientInfo && patientInfo.caseList);
                        this.props.getRedesignPatientAppointment(apptData.appointmentId, appointmentUtilities.getSiteCdServiceCdParams(serviceCd, siteId), patientInfo && patientInfo.caseList);
                        this.props.getPatientEncounter(apptData.appointmentId);
                        this.props.updateState({ allServiceChecked: false });
                        //update patient status
                        //const caseNo = apptData.caseDto ? apptData.caseDto.caseNo : (caseNoInfo && caseNoInfo.caseNo ? caseNoInfo.caseNo : '');
                        let caseNo = '';
                        if (reqDto.caseNo) {
                            caseNo = reqDto.caseNo;
                        } else if (apptData.caseDto) {
                            caseNo = apptData.caseDto.caseNo || '';
                        } else if (apptData.caseNo) {
                            caseNo = apptData.caseNo;
                        } else if (caseNoInfo.caseNo) {
                            caseNo = caseNoInfo.caseNo;
                        }
                        this.refreshPatientPanel({
                            patientKey: patientInfo.patientKey,
                            caseNo: caseNo
                        });
                        this.refreshApptHistory();
                        let params = {
                            patientKey: this.props.patientInfo.patientKey,
                            svcCd: this.props.serviceCd
                        };
                        this.props.checkPatientSvcExist(params, (data) => {
                            this.props.updateState({ patientSvcExist: data });
                        });
                    }
                }
                //SHS encounter case reason log
                let apptInfo = { ...apptData, apptId: apptData.appointmentId };
                this.fetchLogShsEncntrCaseDto(apptInfo);
            });
        };
        if (confirmTransferIn === true) {
            updateAntInfoInOtherPage(transferInData, () => {
                this.props.refreshPatient({
                    isRefreshCaseNo: true
                });
                fetchWalkIn();
            });
            this.setState({ confirmTransferIn: false, transferInData: null });
        } else {
            fetchWalkIn();
        }
    }

    cancelAppointment = (data) => {
        let apptInfo = data;
        let cancelApptPara = {
            appointmentId: apptInfo.appointmentId,
            version: apptInfo.version
        };
        this.setState({ caseDto: null });
        this.props.cancelAppointment(cancelApptPara);
        this.props.updateState({ currentSelectedApptInfo: null });
    }

    handleCancelAppointment = (data) => {
        this.props.openCommonMessage({
            msgCode: '111211',
            btnActions: {
                btn1Click: () => { this.cancelAppointment(data); }
            }
        });
    }

    handleDeleteAppointment = (reasonType, reasonText, listParams) => {
        let currentAppt = this.props.currentSelectedApptInfo;

        this.props.deleteAppointment({
            apptId: currentAppt.appointmentId,
            delRsnRemark: reasonText,
            delRsnTypeId: reasonType,
            version: currentAppt.version
        }, listParams);
    }

    checkUpdateOrBookNew = () => {
        let currentAppt = this.props.currentSelectedApptInfo;
        let newAppt = _.cloneDeep(this.props.bookingData);
        let tempUpdateOrBookNew = '';

        //if elapsed Period and elapsedPeriodUnit edited
        if (newAppt.elapsedPeriod && newAppt.elapsedPeriodUnit && !newAppt.appointmentDate && !newAppt.appointmentTime) {
            newAppt.appointmentDate = appointmentUtilities.getElapsedAppointmentDate(newAppt.elapsedPeriod, newAppt.elapsedPeriodUnit);
            newAppt.appointmentTime = moment().set({ hours: 0, minute: 0, second: 0 });
        }

        //non-timeslot information edit
        if ((currentAppt.forDoctorOnly || '') !== (newAppt.forDoctorOnly || '')
            || (currentAppt.priority || '') !== (newAppt.priority || '')
            || (currentAppt.memo || '') !== (newAppt.memo || '')
            || (currentAppt.patientStatusCd || '') !== (newAppt.patientStatusCd || '')) {
            tempUpdateOrBookNew = UpdateMeans.UPDATE;
        }

        if (currentAppt.svcCd === 'SHS') {
            const daysOfWeek = this.state.daysOfWeekValArr.join('');
            const daysOfWeekDefault = getDaysOfWeekDefault();
            if ((currentAppt.isTrace || 0) !== (newAppt.isTrace || 0)
                || (currentAppt.dfltTraceRsnTypeId || '') !== (newAppt.dfltTraceRsnTypeId || '')
                || (currentAppt.dfltTraceRsnRemark || '') !== (newAppt.dfltTraceRsnRemark || '')
                || (currentAppt.isDfltTracePriority || 0) !== (newAppt.isDfltTracePriority || 0)) {
                tempUpdateOrBookNew = UpdateMeans.UPDATE;
            }

            if (daysOfWeek !== daysOfWeekDefault) {
                tempUpdateOrBookNew = UpdateMeans.BOOKNEW;
            }
        }

        //timeslot related information edit
        if (currentAppt.encntrTypeId !== newAppt.encounterTypeId
            || currentAppt.rmId !== newAppt.rmId
            || currentAppt.qtType !== newAppt.qtType
            || !moment(currentAppt.appointmentDate).isSame(moment(newAppt.appointmentDate), 'day')
            || currentAppt.appointmentTime !== moment(newAppt.appointmentTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
            || currentAppt.sessId !== newAppt.sessId
            || parseInt(currentAppt.bookingUnit) !== parseInt(newAppt.bookingUnit)) {
            tempUpdateOrBookNew = UpdateMeans.BOOKNEW;
        }

        return tempUpdateOrBookNew;
    }

    handleUpdateAppointment = () => {
        const {
            currentSelectedApptInfo,
            bookingData,
            patientInfo,
            doCloseCallbackFunc
        } = this.props;
        let updateApptPara = {};

        let updateOrBookNew = this.checkUpdateOrBookNew();
        if (updateOrBookNew === UpdateMeans.BOOKNEW) {
            this.handleBookClick('Book');
        } else if (updateOrBookNew === UpdateMeans.UPDATE) {
            const formPromise = this.refs.bookingInformationForm.isFormValid(false);
            // eslint-disable-next-line
            formPromise.then(result => {
                if (result) {
                    updateApptPara = {
                        apptId: currentSelectedApptInfo.appointmentId,
                        forDoctorOnly: bookingData.forDoctorOnly,
                        priority: bookingData.priority,
                        memo: bookingData.memo,
                        patientKey: patientInfo.patientKey,
                        version: currentSelectedApptInfo.version,
                        apptSlipRemark: null,
                        dfltTraceRsnRemark: null,
                        isTrace: 0,
                        trnsltSts: null,
                        patientStatusCd: bookingData.patientStatusCd
                    };
                    if (currentSelectedApptInfo.svcCd === 'SHS') {
                        updateApptPara = {
                            ...updateApptPara,
                            isTrace: bookingData.isTrace || 0,
                            dfltTraceRsnTypeId: bookingData.dfltTraceRsnTypeId || '',
                            dfltTraceRsnRemark: bookingData.dfltTraceRsnRemark || '',
                            isDfltTracePriority: bookingData.isDfltTracePriority || 0
                        };
                    }
                    this.props.auditAction('Update Appointment');
                    this.props.submitUpdateAppointment({
                        updateApptPara,
                        updateOrBookNew,
                        callback: () => {
                            this.appointmentHistoryRef.clearSelected();
                            if (doCloseCallbackFunc) {
                                doCloseCallbackFunc(true);
                                this.props.updateState({ doCloseCallbackFunc: null });
                            }
                        }
                    });
                }
            });
        }
    }

    handleCancelUpdateAppt = () => {
        this.appointmentHistoryRef.clearSelected();
    }

    handleNextBooking = () => {
        this.props.auditAction('Click Next Booking Button', null, null, false, 'ana');
        this.props.init_bookingData();
        this.props.updateState({
            confirmData: [],
            bookTimeSlotData: null,
            appointmentMode: ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC.indexOf(this.props.serviceCd) > -1 ? BookMeans.MULTIPLE : BookMeans.SINGLE,
            pageStatus: pageStatusEnum.VIEW,
            currentSelectedApptInfo: null
        });
        this.appointmentHistoryRef.clearSelected();
        this.setState({ caseDto: null });
    }

    openContactHistoryDialog = (rowData) => {
        this.props.auditAction('Open contact history dialog', null, null, false, 'ana');
        this.props.updateContHistState({
            open: true,
            rowData: rowData,
            callerName: this.props.loginName,
            NotificationDate: moment(),
            NotificationTime: moment(),
            tel: PatientUtil.sortPatientPhone(this.props.patientInfo.phoneList || []).length > 0 ? PatientUtil.sortPatientPhone(this.props.patientInfo.phoneList || [])[0].phoneNo : '',
            email: '',
            fax: '',
            note: '',
            contactType: 'Tel',
            appointmentDate: rowData.appointmentDate
        });
        this.props.listContatHistory(rowData.appointmentId);
    }

    openSpecialRequestDialog = (rowData) => {
        this.props.auditAction('Open special request dialog', null, null, false, 'ana');
        this.props.updateSpecReqState({ open: true, appointmentDate: rowData.appointmentDate });
        this.props.listSpecReq({ appointmentId: rowData.appointmentId }, (data) => {
            if (data.length === 0) {
                this.props.updateSpecReqState({
                    appointmentId: rowData.appointmentId,
                    type: '',
                    notes: '',
                    isInsert: true
                });
            } else {
                this.props.updateSpecReqState({
                    appointmentId: data[0].apptId,
                    type: data[0].specialRqstTypeId,
                    notes: data[0].remark,
                    isInsert: false,
                    specialRqstId: data[0].specialRqstId,
                    version: data[0].version
                });
            }
        });

    }

    openApptReminderDialog = (rowData) => {

        const { patientInfo, serviceCd } = this.props;
        const phoneList = patientInfo.phoneList || [];
        const emailAddress = patientInfo.emailAddress || null;
        const smsMobileIdx = RegUtil.getSMSMoblieIdx(phoneList);
        // const { pmiPatientCommMeanList } = patientInfo;
        const commMeanList = patientInfo.pmiPatientCommMeanList || [];
        const hasSmsMean = (commMeanList.findIndex(item => item.commMeanCd === Enum.CONTACT_MEAN_SMS)) > -1;
        const hasEmailMean = (commMeanList.findIndex(item => item.commMeanCd === Enum.CONTACT_MEAN_EMAIL)) > -1;
        let msgCode = '';
        // if (serviceCd === 'DTS') {
        //     if (commMeanList.length === 0) {
        //         msgCode = '111225';
        //     } else {
        //         if (!hasSmsMean && !hasEmailMean) {
        //             msgCode = '111225';
        //             // else {
        //             //
        //             // }
        //         } else {
        //             if (patientInfo.dtsElctrncCommCnsntSts !== 'Y') {
        //                 msgCode = '111229';
        //             }
        //         }
        //     }
        // } else {
        if (commMeanList.length === 0) {
            msgCode = '111225';
        } else {
            if ((smsMobileIdx === -1 || !hasSmsMean) && (!emailAddress)) {
                // this.props.openCommonMessage({ msgCode: '110296' });
                msgCode = '111225';
            }
        }
        // }
        if (msgCode) {
            this.props.openCommonMessage({ msgCode: msgCode });
        }
        else {
            let tabVal = 0;
            let type = '';
            if (serviceCd === 'DTS') {
                if (smsMobileIdx > -1 && hasSmsMean) {
                    tabVal = 1;
                    type += Enum.CONTACT_MEAN_SMS;
                }
                if (hasEmailMean) {
                    type += Enum.CONTACT_MEAN_EMAIL;
                }
            } else {
                if (smsMobileIdx > -1 && hasSmsMean) {
                    tabVal = 1;
                    type += Enum.CONTACT_MEAN_SMS;
                }
                if (emailAddress) {
                    type += Enum.CONTACT_MEAN_EMAIL;
                }
            }


            let apptReminderInfo = {
                ...this.props.apptReminderInfo,
                //openApptReminder: true,
                reminderTabVal: tabVal,
                reminderType: type,
                rowData: rowData
            };
            //apptReminderInfo.openApptReminder=true;


            const callback = () => {
                this.props.auditAction('Open appointment reminder dialog', null, null, false, 'ana');
                this.props.updateState({ openApptReminder: true, reminderTabVal: tabVal, reminderType: type, apptReminderInfo });
            };

            this.props.listReminderList(rowData, callback);
        }
    }

    handlePrintGumLabel = (selectedCategory, confirmationForm) => {
        const { serviceCd, siteId, caseNoInfo } = this.props;
        if (serviceCd === 'SPP') {
            let params = {
                siteId: siteId,
                patientKey: this.props.patientInfo.patientKey,
                smcNo: 'KB4000'
            };
            if (!selectedCategory) {
                params.labelType = 'SMALL';
            } else {
                params.isPrintChiName = selectedCategory && selectedCategory.isPrintChiName ? 1 : 0;
                params.isPrintTeam = selectedCategory && selectedCategory.isPrintTeam ? 1 : 0;
                params.isPrintPmiBar = selectedCategory && selectedCategory.isPrintPmiBar ? 1 : 0;
            }
            this.props.printSPPGumLabel(params);
        } else if (serviceCd === 'EHS') {
            let params = {
                siteId: siteId,
                patientKey: this.props.patientInfo.patientKey,
                topMargin: confirmationForm.topMarginAdjustment,
                labelStyle: confirmationForm.size
            };
            if (confirmationForm.size === 33) {
                params = {
                    ...params,
                    labFormNum: confirmationForm.labelFormLabel,
                    redBookNum: confirmationForm.redBookLabel,
                    covMedNum: confirmationForm.coverofTheMedicalRecord,
                    corMedNum: confirmationForm.cornerOfTheMedicalRecord
                };
            }
            this.props.printEHSGumLabel(params);
        } else {
            this.props.printPatientGumLabel(serviceCd, siteId, this.props.patientInfo.patientKey, caseNoInfo.caseNo);
        }
    }

    refreshApptHistory = () => {
        if (this.appointmentHistoryRef) {
            this.appointmentHistoryRef.refreshListAppointment();
        }
    }

    handleSearchDialogSave = (copyBookingTimeSlot) => {
        const { serviceCd, appointmentMode } = this.props;
        const { multipleSlotData, multipleSlotIdx } = this.state;
        let bookTimeSlot = _.cloneDeep(copyBookingTimeSlot);
        if (bookTimeSlot.findIndex(x => x.isSqueeze) > -1) {
            this.props.updateState({
                bookSqueezeInTimeSlotData: bookTimeSlot,
                pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED,
                bookConfirmSelected: -1
            });
        } else {
            this.props.updateState({
                bookTimeSlotData: bookTimeSlot,
                bookSqueezeInTimeSlotData: null,
                pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED,
                bookConfirmSelected: -1
            });
        }
        if (serviceCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE) {
            let grpSlot = _.cloneDeep(multipleSlotData[multipleSlotIdx].normal);
            let _grpSlot = [];
            grpSlot.forEach(slot => {
                for (let i = 0; i < bookTimeSlot.length; i++) {
                    if (slot.ord === bookTimeSlot[i].ord) {
                        slot = bookTimeSlot[i];
                    }
                }
                _grpSlot.push(slot);
            });
            multipleSlotData[multipleSlotIdx].normal = _grpSlot;
            this.setState({ multipleSlotData });
        }
    }

    handleSearchDialogCancel = () => {
        if (this.props.bookSqueezeInTimeSlotData && !this.props.isMultiple) {
            this.props.updateState({ timeSlotList: [], pageDialogStatus: PAGE_DIALOG_STATUS.SQUEEZEIN, bookConfirmSelected: -1 });
        } else {
            this.props.updateState({ timeSlotList: [], pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED, bookConfirmSelected: -1 });
        }
    }

    confirmTransferIn = (transferInData, transferInInputParams) => {
        this.setState({ confirmTransferIn: true, transferInData });
        this.handleBookAndAttend(transferInInputParams.caseNo, transferInInputParams.isAttendAndPrint);
    }

    updateSearchCriteria = () => {
        const { appointmentMode, bookingData, serviceCd } = this.props;
        //let searchCriteria = this.state.searchCriteria
        if (serviceCd === 'SHS') {
            let criteria = [];
            if (appointmentMode === BookMeans.SINGLE) {
                if (bookingData.appointmentDate) {
                    criteria.push({ label: 'Exact Date: ', value: moment(bookingData.appointmentDate).format(Enum.DATE_FORMAT_EDMY_VALUE) });
                } else if (bookingData.elapsedPeriod && bookingData.elapsedPeriodUnit) {
                    criteria.push({ label: 'Period Later: ', value: `${bookingData.elapsedPeriod} ${bookingData.elapsedPeriodUnit}(s)` });
                }
            } else if (appointmentMode === BookMeans.MULTIPLE) {
                const intervalUnit = Enum.INTERVAL_TYPE.find(x => x.code === bookingData.multipleIntervalUnit);
                criteria.push({ label: 'Exact Date: ', value: moment(bookingData.multipleAppointmentDate).format(Enum.DATE_FORMAT_EDMY_VALUE) });
                criteria.push({ label: 'Interval: ', value: `${bookingData.multipleInterval} ${intervalUnit.engDesc.toLowerCase()}(s)` });
            }
            this.setState({ searchCriteria: criteria });
        }
    }

    updateDaysOfWeek = (daysOfWeekValArr) => {
        this.setState({ daysOfWeekValArr: daysOfWeekValArr });
    }

    resetDaysOfWeek = () => {
        const daysOfWeekDefault = getDaysOfWeekDefault();
        let _daysOfWeekValArr = [1, 1, 1, 1, 1, 1, 1];
        daysOfWeekDefault.split('').forEach((x, idx) => {
            _daysOfWeekValArr[idx] = parseInt(x);
        });
        this.setState({ daysOfWeekValArr: _daysOfWeekValArr });
    }

    updateOpenPaymentMsgParams = (params) => {
        let paymentMsgDialogParams = _.cloneDeep(this.state.paymentMsgDialogParams);
        for (let name in params) {
            paymentMsgDialogParams[name] = params[name];
        }
        this.setState({ paymentMsgDialogParams });
    }

    handlePaymentMsgDialogOk = () => {
        let paymentMsgDialogParams = _.cloneDeep(this.state.paymentMsgDialogParams);
        paymentMsgDialogParams.open = false;
        this.setState({ paymentMsgDialogParams }, () => {
            if (this.props.doCloseCallbackFunc) {
                showPsoReminder(this.props.patientInfo, () => {
                    this.props.doCloseCallbackFunc(true);
                    this.props.updateState({ doCloseCallbackFunc: null });
                });
            } else {
                showPsoReminder(this.props.patientInfo);
            }
        });
    }


    handleUpdateApprovalDialogParams = (name, value) => {
        let params = _.cloneDeep(this.state.approvalDialogParams);
        params[name] = value;
        if (name === 'rsnCd') {
            params = {
                ...params,
                rsnTxt: ''
            };
        } else if (name === 'rsnTxt') {
            params = {
                ...params,
                rsnCd: ''
            };
        }
        this.setState({
            approvalDialogParams: params
        });
    }

    resetApprovalDialogParams = (callback) => {
        this.setState({
            approvalDialogParams: {
                isOpen: false,
                staffId: '',
                rsnCd: null,
                rsnTxt: ''
            }
        }, () => { callback && callback(); });
    }

    handleCartCancel = () => {
        this.setState({
            appointListCartDialogOpen: false
        });
    }

    hanldeEHSConfirmAttendance = (ehsConfirmAtndInputParams, ehsConfirmAtndData) => {
        this.setState({ ehsConfirmAttendance: true, ehsConfirmAtndData });
        this.handleBookAndAttend(ehsConfirmAtndInputParams.caseNo, ehsConfirmAtndInputParams.isAttendAndPrint);
        this.setState({ confirmAtndDialogOpen: false });
    }

    render() {
        const {
            classes,
            serviceCd,
            appointmentMode,
            replaceAppointmentData,
            multipleReplaceApptData,
            rescheduleApptData,
            openReplaceAppointmentDialog,
            openSameDayAppointmentDialog,
            bookingData,
            confirmData,
            bookTimeSlotData,
            bookSqueezeInTimeSlotData,
            patientInfo,
            pageStatus,
            openApptReminder,
            currentSelectedApptInfo,
            reminderTabVal,
            reminderTemplate,
            reminderList,
            reminderListBk,
            siteId,
            reminderType,
            encounterTypes,
            pageDialogStatus,
            initDataFinished,
            isShowRemarkTemplate,
            appointmentListCart
        } = this.props;

        let remark = '';
        if (bookTimeSlotData && bookTimeSlotData.length > 0 && bookTimeSlotData[0].remarkId) {
            remark = this.props.remarkCodeList.find(item => item.remarkId === bookTimeSlotData[0].remarkId);
        }

        const gestCalConfigs = (this.state.gestCalcParams || []).find(x => x.siteId === bookingData.siteId);
        const { paymentMsgDialogParams, approvalDialogParams, bookType, multipleSlotData, multipleSlotIdx, confirmAtndDialogOpen } = this.state;
        const isSppEnable = serviceCd === 'SPP' ? patientInfo && patientInfo.sppSpecOut && patientInfo.sppSpecOut.isSppEnable : true;

        return (
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    {
                        initDataFinished ?
                            <AppointmentHistory
                                innerRef={ref => this.appointmentHistoryRef = ref}
                                listAppointmentHistory={(...args) => {
                                    this.props.listAppointmentHistory(...args);
                                }}
                                cancelAppointment={this.handleCancelAppointment}
                                deleteAppointment={this.handleDeleteAppointment}
                                openContactHistoryDialog={this.openContactHistoryDialog}
                                openSpecialRequestDialog={this.openSpecialRequestDialog}
                                openApptReminderDialog={this.openApptReminderDialog}
                                isWalkIn={confirmData ? confirmData.isWalkIn : false}
                                handlePrintGumLabel={this.handlePrintGumLabel}
                                resetDaysOfWeek={this.resetDaysOfWeek}
                                isSppEnable={isSppEnable}
                            /> : null
                    }
                </Grid>
                <Grid item container xs={6}>
                    {
                        pageStatus === pageStatusEnum.CONFIRMED ?
                            <ConfirmationWindow
                                id={'booking_confirmation'}
                                patientInfo={patientInfo}
                                confirmationInfo={{ ...confirmData, remark: remark ? remark.description : '', appointmentMode: this.props.appointmentMode, multipleNoOfAppointment: bookingData.multipleNoOfAppointment }}
                                nextBooking={this.handleNextBooking}
                                successCount={this.state.successCount}
                                totalCount={this.state.totalCount}
                            />
                            :
                            <ValidatorForm ref="bookingInformationForm" style={{ width: '100%' }}>
                                <BookingForm
                                    innerRef={ref => this.bookingFormRef = ref}
                                    getPatientStatusFlag={this.getPatientStatusFlag}
                                    classes={{
                                        maintitleRoot: classes.maintitleRoot
                                    }}
                                    handleBookClick={this.handleBookClick}
                                    handleUpdateAppointment={this.handleUpdateAppointment}
                                    handleCancelUpdateAppt={this.handleCancelUpdateAppt}
                                    handleFormReset={() => { this.refs.bookingInformationForm.resetValidations(); }}
                                    handleGestationCalc={() => { this.setState({ gestationCalcOpen: true }); }}
                                    isUseGestCalc={this.isUseGestCalc}
                                    daysOfWeekValArr={this.state.daysOfWeekValArr}
                                    updateDaysOfWeek={this.updateDaysOfWeek}
                                    resetDaysOfWeek={this.resetDaysOfWeek}
                                    isSppEnable={isSppEnable}
                                    checkIsDirty={this.checkIsDirty}
                                />
                            </ValidatorForm>
                    }
                </Grid>
                {
                    serviceCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE ?
                        <>
                            <SppBookingConfirmDialog
                                id="appointment_booking"
                                open={pageDialogStatus === PAGE_DIALOG_STATUS.SELECTED}
                                bookTimeSlotData={bookTimeSlotData}
                                isShowRemarkTemplate={isShowRemarkTemplate}
                                remarkCodeList={this.props.remarkCodeList}
                                bookingData={bookingData}
                                handleBookCancel={this.handleBookCancel}
                                handleBookSearch={this.handleBookSearch}
                                handleBookConfirm={this.handleSppBookConfirm}
                                updateState={this.props.updateState}
                            />
                            {
                                this.state.appointListCartDialogOpen ? (
                                    <AppointListCartDialog
                                        id="appointment_list_cart"
                                        open={this.state.appointListCartDialogOpen}
                                        appointmentListCart={appointmentListCart}
                                        handleCartCancel={this.handleCartCancel}
                                        handleBookClick={this.handleBookClick}
                                    />
                                ) : null
                            }

                        </>
                        :
                        <BookingConfirmDialog
                            id="appointment_booking"
                            open={pageDialogStatus === PAGE_DIALOG_STATUS.SELECTED}
                            bookTimeSlotData={bookTimeSlotData}
                            bookSqueezeInTimeSlotData={bookSqueezeInTimeSlotData}
                            bookingData={bookingData}
                            handleBookConfirm={this.handleBookConfirm}
                            handleBookSearch={this.handleBookSearch}
                            handleBookCancel={this.handleBookCancel}
                            updateState={this.props.updateState}
                            remarkCodeList={this.props.remarkCodeList}
                            bookConfirmSelected={this.props.bookConfirmSelected}
                            isShowRemarkTemplate={isShowRemarkTemplate}
                            isShowGestMessage={serviceCd === 'ANT' && appointmentMode !== BookMeans.MULTIPLE}
                            // gestCalcDto={{
                            //     startDate: DateUtil.getFormatDate(this.state.gestStartDate),
                            //     endDate: DateUtil.getFormatDate(this.state.gestEndDate),
                            //     wkStart: this.state.wkStart,
                            //     wkEnd: this.state.wkEnd,
                            //     dayStart: this.state.dayStart,
                            //     dayEnd: this.state.dayEnd
                            // }}
                            searchCriteria={this.state.searchCriteria}
                        />
                }
                <SqueezeInAppointmentDialog
                    id={'appointment_booking'}
                    openSqueezeInAppointmentDialog={pageDialogStatus === PAGE_DIALOG_STATUS.SQUEEZEIN}
                    bookingData={bookingData}
                    bookSqueezeInTimeSlotData={this.props.bookSqueezeInTimeSlotData}
                    updateState={this.props.updateState}
                    handleBookConfirm={this.handleBookConfirm}
                    handleBookSearch={this.handleBookSearch}
                    handleBookCancel={this.handleSqueezeInCancel}
                />
                <ReplaceAppointmentDialog
                    id="appointment_booking"
                    openReplaceAppointmentDialog={openReplaceAppointmentDialog}
                    handStillAppointments={this.handStillAppointments}
                    handReplaceOldAppointmnet={this.handReplaceOldAppointmnet}
                    updateState={this.props.updateState}
                    inputPatientInfo={PatientUtil.getPmiNPatientName(
                        patientInfo.patientKey, patientInfo.idSts, patientInfo.engSurname,
                        patientInfo.engGivename, patientInfo.nameChi)
                    }
                    isNewReplaceList={this.props.appointmentMode === BookMeans.MULTIPLE || pageStatus === pageStatusEnum.EDIT}
                    replaceAppointmentData={pageStatus === pageStatusEnum.EDIT ? rescheduleApptData
                        : this.props.appointmentMode === BookMeans.MULTIPLE ? multipleReplaceApptData : replaceAppointmentData}
                    resetReplaceAppointment={this.props.resetReplaceAppointment}
                />
                <OverlappedPeriodAppointmentDialog
                    id="appointment_booking"
                    openSameDayAppointmentDialog={openSameDayAppointmentDialog}
                    handStillAppointments={this.handStillAppointments}
                    updateState={this.props.updateState}
                    resetReplaceAppointment={this.props.resetReplaceAppointment}
                />
                {
                    pageDialogStatus === PAGE_DIALOG_STATUS.SEARCHING ?
                        serviceCd === 'SPP' && appointmentMode === BookMeans.MULTIPLE ?
                            <SppBookingSearchingDialog
                                id="appointment_booking"
                                open
                                updateState={this.props.updateState}
                                listTimeSlot={this.props.listTimeSlot}
                                bookConfirmSelected={this.props.bookConfirmSelected}
                                bookingData={bookingData}
                                bookingTimeSlot={bookTimeSlotData}
                                bookSqueezeInTimeSlotData={bookSqueezeInTimeSlotData}
                                defaultCaseTypeCd={this.props.defaultCaseTypeCd}
                                timeSlotList={this.props.timeSlotList}
                                isMultiple={this.props.appointmentMode === BookMeans.MULTIPLE}
                                handleSave={this.handleSearchDialogSave}
                                handleCancel={this.handleSearchDialogCancel}
                                multipleSlotIdx={multipleSlotIdx}
                                multipleSlotData={multipleSlotData}
                            />
                            :
                            <BookingSearchDialog
                                id="appointment_booking"
                                open
                                updateState={this.props.updateState}
                                listTimeSlot={this.props.listTimeSlot}
                                bookConfirmSelected={this.props.bookConfirmSelected}
                                bookingData={bookingData}
                                bookingTimeSlot={bookTimeSlotData}
                                bookSqueezeInTimeSlotData={bookSqueezeInTimeSlotData}
                                defaultCaseTypeCd={this.props.defaultCaseTypeCd}
                                timeSlotList={this.props.timeSlotList}
                                isMultiple={this.props.appointmentMode === BookMeans.MULTIPLE}
                                handleSave={this.handleSearchDialogSave}
                                handleCancel={this.handleSearchDialogCancel}
                            />
                        : <></>
                }
                <ApptReminderDialog
                    id={'appointment_reminder_dialog'}
                    open={openApptReminder}
                    updateState={this.props.updateState}
                    encounterTypes={encounterTypes}
                    patientInfo={patientInfo}
                    apptInfo={this.props.apptReminderInfo.rowData}
                    reminderTabVal={reminderTabVal}
                    reminderType={reminderType}
                    reminderTemplate={reminderTemplate}
                    reminderList={reminderList}
                    reminderListBk={reminderListBk}
                    siteId={this.props.apptReminderInfo.rowData.siteId}
                    currentSelectedApptInfo={this.props.apptReminderInfo.rowData}
                    getReminderTemplate={this.props.getReminderTemplate}
                    submitApptReminder={this.props.submitApptReminder}
                    deleteApptReminder={this.props.deleteApptReminder}
                    sendApptReminderInfo={this.props.sendApptReminderInfo}
                    openCommonMessage={this.props.openCommonMessage}
                    refreshApptHistory={this.refreshApptHistory}
                    auditAction={this.props.auditAction}
                />

                <BookingContactHistory
                    refreshListAppointment={this.refreshApptHistory}
                />
                <BookingSpecialRequest
                    refreshListAppointment={this.refreshApptHistory}
                />
                <RescheduleDialog
                    bookConfirm={this.reBookConfirm}
                />
                {
                    this.state.gestationCalcOpen ?
                        <GestationCalcDialog
                            calcConfig={gestCalConfigs}
                            handleConfirm={(gcForm) => {
                                this.setState({ gestationCalcOpen: false });
                                if (moment(gcForm.gestStartDate).isValid() && moment(gcForm.gestEndDate).isValid()) {
                                    let startDate = gcForm.gestStartDate;
                                    let endDate = gcForm.gestEndDate;
                                    if (moment(startDate).isBefore(moment(), 'days')) {
                                        startDate = moment();
                                    }
                                    if (moment(endDate).isBefore(moment(), 'days')) {
                                        endDate = moment();
                                    }
                                    let startGestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(this.state.lmp, startDate);
                                    let endGestWeek = AppointmentUtil.getGestWeekByLmpAndApptDate(this.state.lmp, endDate);
                                    this.props.updateState({
                                        bookingData: {
                                            ...bookingData,
                                            appointmentDate: startDate,
                                            appointmentTime: moment(startDate).set({ hour: 0, minute: 0, second: 0 }),
                                            ...(serviceCd === 'ANT' && {
                                                appointmentDateTo: endDate,
                                                ...(startGestWeek && {
                                                    gestWeekFromWeek: startGestWeek.week, gestWeekFromDay: startGestWeek.day
                                                }),
                                                ...(endGestWeek && {
                                                    gestWeekToWeek: endGestWeek.week, gestWeekToDay: endGestWeek.day
                                                })
                                            })
                                        }
                                    }).then(() => {
                                        this.setState({
                                            gestStartDate: gcForm.gestStartDate,
                                            gestEndDate: gcForm.gestEndDate,
                                            wkStart: gcForm.gestWeekStart,
                                            wkEnd: gcForm.gestWeekEnd,
                                            dayStart: gcForm.gestDayStart,
                                            dayEnd: gcForm.gestDayEnd
                                        });
                                    });
                                }
                            }}
                            handleClose={() => {
                                this.setState({ gestationCalcOpen: false });
                            }}
                        /> : null
                }
                {/**Transfer In */}
                {
                    this.props.serviceCd === 'ANT' && patientInfo.genderCd === Enum.GENDER_FEMALE_VALUE ?
                        <TransferInDialog
                            innerRef={ref => this.transferIn = ref}
                            confirm={this.confirmTransferIn}
                            auditAction={this.props.auditAction}
                        />
                        : null
                }
                {
                    this.props.serviceCd === 'SHS' && paymentMsgDialogParams.open ?
                        <PaymentMsgDialog
                            id={'walk_in_attendance_payment_message_dialog'}
                            paymentMsgDialogParams={paymentMsgDialogParams}
                            handlePaymentMsgDialogOk={this.handlePaymentMsgDialogOk}
                        />
                        : null
                }
                {
                    serviceCd === 'SHS' ?
                        approvalDialogParams.isOpen ?
                            <UnexpectedEnctrApprlDialog
                                appointment={bookingData}
                                approvalDialogParams={approvalDialogParams}
                                confirmCallback={() => this.searchTimeSlot(bookType === 'AttendAndPrint')}
                                handleUpdateApprovalDialogParams={this.handleUpdateApprovalDialogParams}
                                encounterTypes={encounterTypes}
                            /> : null
                        : null
                }
                {
                    serviceCd === 'EHS' && confirmAtndDialogOpen ?
                        <ConfirmAtndDialog
                            id={'confirm_walk_in_attendance'}
                            innerRef={ref => this.confirmAtndRef = ref}
                            confirmAtndDialogOpen={confirmAtndDialogOpen}
                            confirm={this.hanldeEHSConfirmAttendance}
                            auditAction={this.props.auditAction}
                            closeConfirmAtndDialog={() => {
                                this.setState({ confirmAtndDialogOpen: false });
                            }}
                            currentRmCd={bookingData.rmCd}
                        />
                        : null
                }
            </Grid>
        );
    }
}

const mapStatetoProps = (state) => {
    return ({
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        clinicCd: state.login.clinic.clinicCd,
        clinicList: state.common.clinicList,
        encounterTypeList: state.common.encounterTypeList,
        encounterTypes: state.common.encounterTypes,
        timeSlotList: state.bookingInformation.timeSlotList,
        bookConfirmSelected: state.bookingInformation.bookConfirmSelected,
        bookingData: state.bookingInformation.bookingData,
        prefilledData: state.bookingInformation.prefilledData,
        bookTimeSlotData: state.bookingInformation.bookTimeSlotData,
        bookSqueezeInTimeSlotData: state.bookingInformation.bookSqueezeInTimeSlotData,
        patientInfo: state.patient.patientInfo,
        appointmentInfo: state.patient.appointmentInfo,
        caseNoInfo: state.patient.caseNoInfo,
        appointmentList: state.bookingInformation.appointmentList,
        // patientStatusList: state.attendance.patientStatusList,
        walkInAttendanceInfo: state.bookingInformation.walkInAttendanceInfo,
        walkInAttendanceInfoBackUp: state.bookingInformation.walkInAttendanceInfoBackUp,
        clinicConfig: state.common.clinicConfig,
        waitingList: state.bookingInformation.waitingList,
        remarkCodeList: state.bookingInformation.remarkCodeList,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        pageStatus: state.bookingInformation.pageStatus,
        confirmData: state.bookingInformation.confirmData,
        updateOrBookNew: state.bookingInformation.updateOrBookNew,
        loginName: state.login.loginInfo.loginName,
        appointmentMode: state.bookingInformation.appointmentMode,
        defaultCaseTypeCd: state.bookingInformation.defaultCaseTypeCd,
        futureAppt: state.bookingInformation.futureAppt,
        futureApptId: state.bookingInformation.futureApptId,
        openApptReminder: state.bookingInformation.openApptReminder,
        reminderTabVal: state.bookingInformation.reminderTabVal,
        reminderType: state.bookingInformation.reminderType,
        reminderTemplate: state.bookingInformation.reminderTemplate,
        reminderList: state.bookingInformation.reminderList,
        reminderListBk: state.bookingInformation.reminderListBk,
        pageDialogStatus: state.bookingInformation.pageDialogStatus,
        appointmentHistory: state.bookingInformation.appointmentHistory,
        replaceAppointmentData: state.bookingInformation.replaceAppointmentData,
        multipleReplaceApptData: state.bookingInformation.multipleReplaceApptData,
        rescheduleApptData: state.bookingInformation.rescheduleApptData,
        openSameDayAppointmentDialog: state.bookingInformation.openSameDayAppointmentDialog,
        openReplaceAppointmentDialog: state.bookingInformation.openReplaceAppointmentDialog,
        patientStatusList: state.common.commonCodeList.patient_status,
        countryList: state.patient.countryList || [],
        bookWithNewCase: state.bookingInformation.bookWithNewCase,
        bookingDataBackup: state.bookingInformation.bookingDataBackup,
        doCloseCallbackFunc: state.bookingInformation.doCloseCallbackFunc,
        patientSvcExist: state.bookingInformation.patientSvcExist,
        initDataFinished: state.bookingInformation.initDataFinished,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        curCloseTabMethodType: state.mainFrame.curCloseTabMethodType,
        destinationList: state.patient.destinationList,
        isShowRemarkTemplate: state.bookingInformation.isShowRemarkTemplate,
        apptReminderInfo: state.bookingInformation.apptReminderInfo,
        loginUserRoleList: state.common.loginUserRoleList,
        subTabs: state.mainFrame.subTabs,
        appointmentListCart: state.bookingInformation.appointmentListCart,
        isFamilyReplace: state.bookingInformation.isFamilyReplace
    });
};

const mapDispatchtoProps = {
    resetInfoAll, appointmentBook, listTimeSlot, listAppointmentHistory,
    bookConfirm, checkBookingRule, bookConfirmWaiting, updateState,
    getAppointmentReport, walkInAttendance,
    listRemarkCode, redesignListRemarkCode, cancelAppointment, deleteAppointment,
    submitUpdateAppointment, openCommonMessage, openCaseNoDialog,
    getPatientAppointment, getRedesignPatientAppointment, getPatientEncounter, updateCurTab,
    deleteSubTabs, selectCaseTrigger, getPatientPanelPatientById,
    listContatHistory, getCodeList,
    updateContHistState, init_bookingData, updateSpecReqState,
    getReminderTemplate, submitApptReminder, deleteApptReminder, sendApptReminderInfo,
    listSpecReqTypes, listSpecReq, printPatientGumLabel, printSPPGumLabel, printEHSGumLabel, stillAppointmentsBookConfirm,
    resetReplaceAppointment, replaceOldAppointmnet, getBookingMaximumTimeslot, auditAction, checkPatientSvcExist,
    getClcAntGestCalcParams, listReminderList, skipTab, closeCommonMessage, refreshPatient, updateMainFrame, changeTabsActive,
    checkApptWithEncntrCaseStatus, logShsEncntrCase, sppMultipleBooking, updateAppointmentListCart, updateLastCheckDate
};

export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(Booking));
