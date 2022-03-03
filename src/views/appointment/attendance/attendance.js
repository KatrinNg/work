import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
    Typography,
    Grid,
    Box
} from '@material-ui/core';
import AppointmentList from './component/appointmentList';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSTextField from '../../../components/TextField/CIMSTextField';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import Enum from '../../../enums/enum';
import { codeList } from '../../../constants/codeList';
import {
    updateField,
    markAttendance,
    destroyMarkAttendance,
    getAppointmentForAttend,
    listAppointmentList,
    markArrival,
    editAttendance
} from '../../../store/actions/attendance/attendanceAction';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import moment from 'moment';
import { deleteSubTabs, updateCurTab, skipTab} from '../../../store/actions/mainFrame/mainFrameAction';
import { openCaseNoDialog } from '../../../store/actions/caseNo/caseNoAction';
import accessRightEnum from '../../../enums/accessRightEnum';
import EditModeMiddleware from '../../compontent/editModeMiddleware';
import CommonRegex from '../../../constants/commonRegex';
import {
    getPatientAppointment,
    getRedesignPatientAppointment,
    loadEncounterInfo,
    printPatientGumLabel,
    printSPPGumLabel,
    printEHSGumLabel,
    refreshPatient,
    updateLastCheckDate
} from '../../../store/actions/patient/patientAction';

// import AttendSuccessPanel from './component/attendSuccessPanel';
import ConfirmationWindow from '../../compontent/confirmationWindow';
import AttendanceDetail from './component/attendanceDetail';
import * as AppointmentUtilities from '../../../utilities/appointmentUtilities';
import {
    getEncounterTypeList,
    getCodeList
} from '../../../store/actions/common/commonAction';

import { refreshServiceStatus } from '../../../store/actions/ECS/ecsAction';
import * as ecsActionType from '../../../store/actions/ECS/ecsActionType';
import * as attendanceActionType from '../../../store/actions/attendance/attendanceActionType';

import _ from 'lodash';

import * as atndService from '../../../services/ana/attendanceService';
// import MarkArrivalDialog from './component/markArrivalDialog';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import {
    checkPatientSvcExist
} from '../../../store/actions/appointment/booking/bookingAction';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import palette from '../../../theme/palette';
import TransferInDialog from './component/transferInDialog';
import PaymentMsgDialog from './component/paymentMsgDialog';
import { updateAntInfoInOtherPage } from '../../../utilities/anSvcIdUtilities';
import { getIsAtndGenEncntrChargeableControlVal } from '../../../utilities/siteParamsUtilities';
import { attendanceFamilyParamsGenerator, attendancePatientParamsGenerator, showPsoReminder, markArrivalPatientParamsGenerator, markArrivalFamilyParamsGenerator} from '../../../utilities/attendanceUtilities';
import FamilyNumberBtn from '../booking/component/bookForm/familyMember/FamilyNumberBtn';
import { dispatch } from '../../../store/util';
import { REDIRECT_BY_PATIENT_LIST, UPDATE_SELECTED_ATTN_FAMILY_MEMBER } from '../../../store/actions/appointment/booking/bookingActionType';
import { isTempMemberExist } from '../../../utilities/familyNoUtilities';
import ConfirmAtndDialog  from '../../compontent/confirmAtndDialog';
// import PrintGumLabelDialog from '../../registration/component/printGumLabelDialog';
// import CIMSPdfViewer from '../../../components/PDF/CIMSPdfViewer';
// import { print } from '../../../utilities/printUtilities';


const styles = (theme) => ({
    form: {
        width: '100%',
        margin: 0,
        padding: 0,
        flex: 1
        //height: '90%'
    },
    attendanceInfoItem: {
        width: '100%',
        fontSize: '2.5em',
        color: theme.palette.white,
        textAlign: 'center',
        padding: '0px 8px'
    },
    lateApptPanel: {
        // position: 'fixed',
        padding: '5px 10px',
        maxHeight: '10%',
        backgroundColor: theme.palette.primary.main,
        borderRadius: 6,
        flex: 1
    },
    dialogPaper2: {
        minWidth: '50%',
        maxWidth: '50%'
    }
});

const useStyles = makeStyles(theme => ({
    dialogPaper: {
        width: '80%'
    }
}));

function calcLateApptTime(showLateApptConfig, lateApptTimeConfig, apptInfo) {
    if (showLateApptConfig.configValue !== 'Y' || !apptInfo) {
        return;
    }
    let allowLateApptTime = null;
    let lateTimeUnit = (lateApptTimeConfig.configValue || '').substr(-1);
    let lateTime = (lateApptTimeConfig.configValue || '').substr(0, lateApptTimeConfig.configValue.length - 1) || 0;
    let timeUnit = '';

    switch (lateTimeUnit) {
        case 'h': {
            timeUnit = 'hour';
            break;
        }
        case 'm': {
            timeUnit = 'minute';
            break;
        }
        default: {
            timeUnit = 'hour';
            break;
        }
    }
    allowLateApptTime = moment(apptInfo.appointmentTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).add(lateTime, timeUnit).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
    let currentTime = moment().format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
    if (moment().isBefore(moment(allowLateApptTime, Enum.TIME_FORMAT_24_HOUR_CLOCK))) {
        return;
    }

    return {
        hours: moment(currentTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).diff(moment(allowLateApptTime, Enum.TIME_FORMAT_24_HOUR_CLOCK), 'hours'),
        minutes: moment(currentTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).diff(moment(allowLateApptTime, Enum.TIME_FORMAT_24_HOUR_CLOCK), 'minutes')
    };
}

class Attendance extends React.Component {
    state = {
        listApptParams: null,
        bookedApptType: {
            caseType: ''
        },
        arrivalDialogOpen: false,
        arrivalDialogTime: null,
        arrivalDialogDiscNum: '',
        editMode: false,
        isGetEncounterTypeNew: true,
        transferInData: null,
        confirmTransferIn: false,
        paymentMsgDialogParams: {
            open: false,
            encounterTypeId: null
        },
        confirmAtndDialogOpen: false,
        ehsConfirmAttendance: false,
        ehsConfirmAtndData: null
    }
    UNSAFE_componentWillMount() {
        let { getCodeList } = this.props;
        let getCodeListParams = [
            codeList.exact_date_of_birth,
            codeList.patient_status
        ];
        getCodeList({
            params: getCodeListParams,
            actionType: [ecsActionType.PUT_GET_CODE_LIST, attendanceActionType.ANA_ATND_PUT_PATIENT_STATUS_LIST]
        });
    }

    componentDidMount() {
        this.props.ensureDidMount();
        this.props.refreshServiceStatus();

        this.listAppointmentList();

        this.initDoClose();

        let params = {
            patientKey: this.props.patientInfo.patientKey,
            svcCd: this.props.serviceCd
        };
        this.props.checkPatientSvcExist(params, (data) => {
            this.props.updateField({ patientSvcExist: data });
        });
    }

    componentDidUpdate(preProps) {
        if (this.props.openPromptDialog === true) {
            let patientInfo = this.props.patientInfo;
            let idSts = patientInfo ? patientInfo.idSts : 'T';
            if (idSts === 'N') {
                const msgCd = this.props.appointmentInfo && this.props.appointmentInfo.status === Enum.ATTENDANCE_STATUS.ATTENDED ? '130202' : '130203';
                this.props.openCommonMessage({
                    msgCode: msgCd,
                    btnActions: {
                        btn1Click: this.handleNoAppointmentConfirm
                    }
                });
            } else {
                let patientLabel = CommonUtilities.getPatientCall();
                this.props.openCommonMessage({
                    msgCode: '130209',
                    params: [{ name: 'PATIENT_LABEL', value: patientLabel },
                    { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
                    ],
                    btnActions: {
                        btn1Click: this.handleNoAppointmentConfirm
                    }
                });
            }
            this.props.updateField({ openPromptDialog: false });
        }
        const { tabsActiveKey, curCloseTabMethodType, subTabsActiveKey } = this.props;
        if (tabsActiveKey === accessRightEnum.patientSpec && preProps.subTabsActiveKey !== accessRightEnum.attendance && subTabsActiveKey === accessRightEnum.attendance) {
            if (curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
                && curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_LOGOUT) {
                let params = {
                    patientKey: this.props.patientInfo.patientKey,
                    svcCd: this.props.serviceCd
                };
                this.props.checkPatientSvcExist(params, (data) => {
                    this.props.updateField({ patientSvcExist: data });
                });
            }
        }
    }

    componentWillUnmount() {
        this.props.destroyMarkAttendance();
    }

    checkIsDirty = () => {
        const {
            currentAppointment,
            isNep,
            discNum,
            nepRemark,
            patientStatus,
            doCloseBackUp,
            caseIndicator
        } = this.props;
        let isDirty = false;
        let confirmECSEligibility = (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
            (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';
        if (currentAppointment && (this.state.editMode || (currentAppointment.attnStatusCd !== 'Y' && currentAppointment.appointmentDate === moment().format(Enum.DATE_FORMAT_EDMY_VALUE)))) {
            isDirty = !CommonUtilities.isEqualObj(doCloseBackUp, {
                isNep,
                discNum,
                nepRemark,
                patientStatus,
                confirmECSEligibility,
                caseIndicator
            });
        }
        return isDirty;
    }

    saveFunc = (closeTab) => {
        const {
            currentAppointment
        } = this.props;
        this.props.updateField({ doCloseCallback: closeTab });
        if (currentAppointment) {
            if (this.state.editMode) {
                this.handleUpdateClick();
            } else if (currentAppointment.attnStatusCd !== 'Y' && currentAppointment.appointmentDate === moment().format(Enum.DATE_FORMAT_EDMY_VALUE)) {
                this.handleAttend();
            }
        }
    }

    initDoClose = () => {
        this.doClose = CommonUtilities.getDoCloseFunc_2(accessRightEnum.attendance, this.checkIsDirty, this.saveFunc);
        this.props.updateCurTab(accessRightEnum.attendance, this.doClose);
    }

    checkPassInAppt = () => {
        let passInAppt = null;
        if (this.props.location.state) {
            let params = _.cloneDeep(this.props.location.state);
            if (params.redirectFrom === accessRightEnum.patientSummary) {
                if (params.apptInfo) {
                    // this.props.updateField({ appointmentInfo: params.apptInfo });
                    passInAppt = params.apptInfo;
                }
            }
        }
        return passInAppt;
    }

    listAppointmentList = () => {
        const { appointment, siteId, serviceCd, patientInfo, clinic, clinicConfig, doCloseBackUp, caseIndicator } = this.props;
        const passInAppt = this.checkPassInAppt();
        const selectedAppt = passInAppt ? passInAppt : appointment;
        let params = {
            siteIds: siteId,
            withPMIDetls: false,
            allService: false,
            withShowObsInfomation: false,
            svcCd: serviceCd,
            patientKey: patientInfo.patientKey,
            attnStatusCd: '',
            startDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            endDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE)
        };

        this.props.listAppointmentList(params, (appointmentListData) => {
            const appointmentList = appointmentListData;

            const apptTotalNum = appointmentListData.length;
            let curAppointment = appointmentList.find(item => item.appointmentId === selectedAppt.appointmentId);
            let patientStatus = this.props.patientStatus;
            let openPromptDialog = false;

            if (!curAppointment) {
                if (apptTotalNum > 0) {
                    curAppointment = appointmentList[0];
                }
                else {
                    openPromptDialog = true;
                    curAppointment = null;
                }
            }

            if (atndService.isPatientCanTakeAttendance(clinic, clinicConfig, patientInfo)) {
                openPromptDialog = true;
            }

            patientStatus = this.getCasePatientStatus(curAppointment);
            if (apptTotalNum > 0) {
                if (curAppointment) {
                    this.apptListRef && this.apptListRef.setSelectedAppt && this.apptListRef.setSelectedAppt(curAppointment.appointmentId);
                }
            }

            this.getPatientStatusFlag(curAppointment);
            let discNum = (curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.discNum) || '';
            let isNep = (curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.isNep) || false;
            let nepRemark = curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.isNep ? curAppointment.attendanceBaseVo.nepRemark : '';
            let confirmECSEligibility = (curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
                (curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';
            this.props.updateField({
                currentAppointment: curAppointment,
                patientStatus: patientStatus,
                openPromptDialog: openPromptDialog,
                caseIndicator: caseIndicator,
                doCloseBackUp: {
                    discNum: discNum,
                    isNep: isNep,
                    nepRemark: nepRemark,
                    patientStatus: patientStatus,
                    confirmECSEligibility: confirmECSEligibility,
                    caseIndicator: caseIndicator
                }
            });
        });
        this.setState({ listApptParams: params });
    }

    getCasePatientStatus = (curAppointment) => {
        const { patientInfo } = this.props;
        let patientStatus = AppointmentUtilities.getPatientStatusCd(curAppointment && curAppointment.caseNo, patientInfo);
        return patientStatus;
    }

    getPatientStatusFlag = (curAppointment) => {
        const { serviceCd, siteId } = this.props;
        this.props.getEncounterTypeList({
            params: { serviceCd, siteId },
            isGetNew: this.state.isGetEncounterTypeNew,
            callback: (encounterList) => {
                let patientStatusFlag = AppointmentUtilities.getPatientStatusFlag(encounterList, curAppointment);

                this.props.updateField({ patientStatusFlag: patientStatusFlag });
            }
        });

        this.setState({ isGetEncounterTypeNew: false });
    }

    handleChange = (name, value) => {
        let attendanceBaseVo = { ...(this.props.currentAppointment && this.props.currentAppointment.attendanceBaseVo) };
        if (name === 'isNep') {
            if (!value) {
                attendanceBaseVo = { ...(this.props.currentAppointment && this.props.currentAppointment.attendanceBaseVo), [name]: value, nepRemark: '' };
            } else {
                attendanceBaseVo = { ...(this.props.currentAppointment && this.props.currentAppointment.attendanceBaseVo), [name]: value };
            }
            let updateData = {
                ...this.props.currentAppointment,
                attendanceBaseVo: attendanceBaseVo
            };
            this.props.updateField({ currentAppointment: updateData });
        } else if (name === 'patientStatus') {
            this.props.updateField({ patientStatus: value });
        }
        else if (name === 'caseIndicator') {
            this.props.updateField({ caseIndicator: value });
        }
        else if (name === 'confirmECSEligibility') {
            attendanceBaseVo = {
                ...(this.props.currentAppointment && this.props.currentAppointment.attendanceBaseVo),
                isRqrCnsltFee: (value === 'C' ? false : true),
                isPaidCnsltFee: (value === 'C' ? false : true),
                isRqrPrscrbFee: (value === 'C' ? false : true),
                isPaidPrscrbFee: (value === 'C' ? false : true),
                isQueueProcessed: true,
                isEcsElig: (value === 'C' ? true : false),
                isFeeSettled: (value === 'C' ? false : true)
            };
            let updateData = {
                ...this.props.currentAppointment,
                attendanceBaseVo: attendanceBaseVo
            };
            this.props.updateField({ currentAppointment: updateData });
        }
        else {
            attendanceBaseVo = { ...(this.props.currentAppointment && this.props.currentAppointment.attendanceBaseVo), [name]: value };
            let updateData = {
                ...this.props.currentAppointment,
                attendanceBaseVo: attendanceBaseVo
            };
            this.props.updateField({ currentAppointment: updateData });
        }

    }

    formSubmitFunc = (callback) => {
        let formSubmit = this.form.isFormValid(false);
        formSubmit.then(result => {
            if (result) {
                callback();
            } else {
                this.form.focusFail();
            }
        });
    }

    handleAttendClick = () => {
        //const { currentAppointment, serviceCd } = this.props;
        // if (serviceCd === 'ANT') {
        //     if (currentAppointment.encntrTypeCd === 'ENC_TRANS') {
        //         this.transferIn.doTransferIn();
        //     } else {
        //         this.handleAttend();
        //     }
        // } else {
        this.handleAttend();
        // }
    }

    handleAttend = () => {
        this.formSubmitFunc(() => {
            const { patientInfo, currentAppointment, serviceCd } = this.props;
            if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
                CaseNoUtil.handleCaseNoBeforeAttend(patientInfo, currentAppointment, serviceCd, (callbackPara, callbackAction) => {
                    if (typeof (callbackPara) !== 'undefined') {
                        if (typeof (callbackPara) === 'string') {
                            if (currentAppointment.encntrTypeCd === 'ENC_TRANS' && serviceCd === 'ANT') {
                                this.transferIn.doTransferIn({ caseNo: callbackPara });
                            } else if (serviceCd === 'EHS') {
                                this.handleEhsAttendance(callbackPara);
                            } else {
                                this.markAttendance(callbackPara);
                            }
                        }
                        else {
                            if (callbackPara === null && typeof (callbackAction) === 'string') {
                                if (callbackAction === 'fail') {
                                    this.props.openCommonMessage({
                                        msgCode: '111015',
                                        params: [{ name: 'HEADER', value: 'Attendance' }],
                                        btnActions: {
                                            btn1Click: () => {
                                                new Promise((resolve) => {
                                                    this.props.closeCommonMessage();
                                                    resolve();
                                                }).then(() => {
                                                    // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
                                                    // let isNotCounterRole = CommonUtilities.checkingIsNotCounterRole(this.props.loginUserRoleList);
                                                    // if (isNotCounterRole) {
                                                    //     CommonUtilities.closeTabByPatientSpecTabCloseBtn();
                                                    // } else {
                                                    //     this.props.skipTab(accessRightEnum.patientSummary);
                                                    // }
                                                    this.props.skipTab(accessRightEnum.patientSummary);
                                                });
                                            }
                                        }
                                    });
                                } else if (callbackAction === 'no active rule') {
                                    this.props.openCommonMessage({
                                        msgCode: '110166'
                                    });
                                }
                            } else {
                                if (serviceCd === 'EHS') {
                                    this.handleEhsAttendance(callbackPara);
                                } else {
                                    this.markAttendance(callbackPara);
                                }
                            }
                        }
                    } else {
                        if (serviceCd === 'EHS') {
                            this.handleEhsAttendance();
                        } else {
                            this.markAttendance();
                        }
                    }
                });
            } else {
                this.props.openCommonMessage({
                    msgCode: '115571',
                    variant: 'error'
                });
            }
        });
    }

    handleEhsAttendance = (callbackPara) => {
        const { patientInfo, currentAppointment, siteId } = this.props;
        const checkBeforeAtnd = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'EHS_PMI_INFO_CHECK_BEFORE_ATND');
        const enctrCdArr = ((checkBeforeAtnd && checkBeforeAtnd.configValue) || '').split(',');
        if (enctrCdArr.includes(currentAppointment.encntrTypeCd)) {
            if (patientInfo.patientEhsDto && patientInfo.patientEhsDto.lastChkDate && moment().isSame(moment(patientInfo.patientEhsDto.lastChkDate), 'days')) {
                this.setState({confirmAtndDialogOpen:true},()=>{
                    this.confirmAtndRef.doEhsConfirmAtnd({ caseNo: callbackPara });
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
                                        this.confirmAtndRef.doEhsConfirmAtnd({ caseNo: callbackPara });
                                    });
                                }});
                            });
                        },
                        btn2Click: () => {
                            new Promise((resolve) => {
                                this.props.closeCommonMessage();
                                resolve();
                            }).then(() => {
                                this.props.skipTab(accessRightEnum.patientSummary);
                            });
                        }
                    }
                });
            }
        } else {
            this.setState({confirmAtndDialogOpen:true},()=>{
                this.confirmAtndRef.doEhsConfirmAtnd({ caseNo: callbackPara });
            });
        }
    }

    hanldeEHSConfirmAttendance = (ehsConfirmAtndInputParams, ehsConfirmAtndData) => {
        this.setState({ ehsConfirmAttendance: true, ehsConfirmAtndData });
        if (this.state.editMode) {
            this.handleUpdate();
        }else{
            this.markAttendance(ehsConfirmAtndInputParams.caseNo);
        }
        this.setState({ confirmAtndDialogOpen: false });
    }

    // NOTE Make attendance
    markAttendance = (caseNoVal) => {
        const { patientSvcExist, caseIndicator, selectedAttnFamilyMember } = this.props;
        let { listApptParams } = this.state;
        const { currentAppointment, patientInfo, caseNoInfo, siteId, serviceCd } = this.props;
        const { confirmTransferIn, transferInData } = this.state;
        const { ehsConfirmAttendance, ehsConfirmAtndData } = this.state;
        let params = attendancePatientParamsGenerator(this.props, caseNoVal);
        const isNewToSvcSiteParam = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';

        if (isTempMemberExist(selectedAttnFamilyMember)) return;

        if ((isNewToSvc === '1') && !patientSvcExist) {
            params.patientSvcSts = caseIndicator;
        }
        let confirmECSEligibility = (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
            (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';
        if ((isAttenConfirmEcsEligibility === '1')) {
            params.isRqrCnsltFee = confirmECSEligibility === 'C' ? false : true;
            params.isPaidCnsltFee = confirmECSEligibility === 'C' ? false : true;
            params.isRqrPrscrbFee = confirmECSEligibility === 'C' ? false : true;
            params.isPaidPrscrbFee = confirmECSEligibility === 'C' ? false : true;
            params.isQueueProcessed = true;
            params.isEcsElig = confirmECSEligibility === 'C' ? true : false;
            params.isFeeSettled = confirmECSEligibility === 'C' ? false : true;
        }
        if (ehsConfirmAttendance === true) {
            params.waiverCatgryCd = ehsConfirmAtndData.ehsWaiverCategoryCd;
            params.ehsTeamId = ehsConfirmAtndData.team;
            params.ehsMbrSts = patientInfo?.ehsMbrSts;
            this.setState({ ehsConfirmAttendance: false, ehsConfirmAtndData: null });
        }
        listApptParams.page = 1;
        const fetchMarkAttend = () => {
            // Handle family params
            params = selectedAttnFamilyMember.length > 0 ? attendanceFamilyParamsGenerator(params, selectedAttnFamilyMember) : params;
            this.props.markAttendance(params, listApptParams, (result) => {
                if (currentAppointment.appointmentId) {
                    this.props.getRedesignPatientAppointment(currentAppointment.appointmentId, AppointmentUtilities.getSiteCdServiceCdParams(serviceCd, siteId), patientInfo && patientInfo.caseList);
                    // this.props.getPatientAppointment(currentAppointment.appointmentId, patientInfo && patientInfo.caseList);
                    //const caseDto=result.caseDto;
                    let caseNo = '';
                    if (currentAppointment.caseNo) {
                        caseNo = currentAppointment.caseNo;
                    } else if (result.caseDto) {
                        caseNo = result.caseDto.caseNo || '';
                    } else if (result.caseNo) {
                        caseNo = result.caseNo;
                    } else if (caseNoInfo.caseNo) {
                        caseNo = caseNoInfo.caseNo;
                    }
                    this.props.loadEncounterInfo(result.encounter);
                    this.props.refreshPatient({
                        isRefreshCaseNo: true,
                        caseNo: caseNo
                    });
                }

                if (this.props.doCloseCallback) {
                    if (this.props.serviceCd === 'SHS') {
                        this.updateOpenPaymentMsgParams({ open: true, encounterTypeId: result.encounterTypeId });
                    } else {
                        this.props.doCloseCallback(true);
                    }
                } else {
                    if (this.props.serviceCd === 'SHS') {
                        this.updateOpenPaymentMsgParams({ open: true, encounterTypeId: result.encounterTypeId });
                    }
                    this.props.listAppointmentList(listApptParams);
                    this.apptListRef && this.apptListRef.updateCurrentPage && this.apptListRef.updateCurrentPage(0);
                    let params = {
                        patientKey: this.props.patientInfo.patientKey,
                        svcCd: this.props.serviceCd
                    };
                    this.props.checkPatientSvcExist(params, (data) => {
                        this.props.updateField({ patientSvcExist: data });
                    });
                }
            });
        };

        if (confirmTransferIn === true) {
            updateAntInfoInOtherPage(transferInData, () => {
                this.props.refreshPatient({
                    isRefreshCaseNo: true
                });
                fetchMarkAttend();
            });
            this.setState({ confirmTransferIn: false, transferInData: null });
        } else {
            fetchMarkAttend();
        }
    }

    nextPatient = () => {
        this.props.hidden();
    }

    isReadyToAttend = () => {
        let { appointmentInfo } = this.props;
        if (!appointmentInfo || !appointmentInfo.appointmentId || appointmentInfo.status === Enum.ATTENDANCE_STATUS.ATTENDED) {
            this.props.updateField({ openPromptDialog: true });
            return;
        }
        this.props.getAppointmentForAttend(appointmentInfo.appointmentId);
    }

    handleNoAppointmentConfirm = () => {
        this.props.deleteSubTabs(accessRightEnum.attendance);
        this.props.updateField({ openPromptDialog: false });
    }

    handleDiscNumOnChange = (e) => {
        let inputProps = this.refs.discNum.props.inputProps;
        let value = e.target.value;
        let reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        if (reg.test(value)) {
            return;
        }

        if (inputProps.maxLength && value.length > inputProps.maxLength) {
            value = value.slice(0, inputProps.maxLength);
        }

        this.handleChange(e.target.name, value);
    }

    // NOTE ROW CLICK
    handleRowSelect = (selectedRow) => {
        const { selectedAttnFamilyMember, isRedirectByPatientList } = this.props;
        if (isRedirectByPatientList) dispatch({ type: REDIRECT_BY_PATIENT_LIST, payload: { isRedirectByPatientList: false } });
        // Empty selected family member
        if (selectedAttnFamilyMember.length > 0) dispatch({ type: UPDATE_SELECTED_ATTN_FAMILY_MEMBER, payload: { selectedData: [] } });
        let patientStatus = selectedRow ? this.getCasePatientStatus(selectedRow) : '';
        let caseIndicator = selectedRow ? this.props.caseIndicator : '';
        this.getPatientStatusFlag(selectedRow);
        let discNum = (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.discNum) || '';
        let isNep = (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isNep) || false;
        let nepRemark = selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isNep ? selectedRow.attendanceBaseVo.nepRemark : '';
        let confirmECSEligibility = (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isEcsElig) == true ? 'C' :
            (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isFeeSettled) ? 'P' : '';
        let payload = {
            currentAppointment: selectedRow,
            patientStatus: patientStatus,
            doCloseBackUp: {
                discNum: discNum,
                isNep: isNep,
                nepRemark: nepRemark,
                patientStatus: patientStatus,
                confirmECSEligibility: confirmECSEligibility,
                caseIndicator: caseIndicator
            },
            caseIndicator: caseIndicator
        };
        if (selectedRow) {
            payload.isAttend = false;
        }
        this.props.updateField(payload);
    }

    handlePrintGumLabel = (selectedCategory, confirmationForm) => {
        const { serviceCd, siteId, caseNoInfo } = this.props;
        if (serviceCd === 'SPP') {
            let params = {
                siteId: siteId,
                patientKey: this.props.patientInfo.patientKey,
                smcNo: 'KE50000'
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

    handleArrival = () => {
        this.setState({ arrivalDialogOpen: true, arrivalDialogTime: moment(), arrivalDialogDiscNum: this.props.discNum });
    }

    updateListApptParam = (listApptParams) => {
        this.setState({ listApptParams });
    }

    postUpdateAttendanceListAppt = (currentAppointment, patientStatus) => {
        return (appointmentListData) => {

            const appointmentList = appointmentListData;

            const apptTotalNum = appointmentListData.length;
            let curAppointment = appointmentList.find(item => item.appointmentId === currentAppointment.appointmentId);

            if (!curAppointment) {
                if (apptTotalNum > 0) {
                    curAppointment = appointmentList[0];
                }
                else {
                    curAppointment = null;
                }
            }

            if (apptTotalNum > 0) {
                if (curAppointment) {
                    this.apptListRef.setSelectedAppt(curAppointment.appointmentId);

                }
            }

            this.props.updateField({ currentAppointment: curAppointment, patientStatus: patientStatus, isAttend: false });
        };
    }

    handleEditAppointment = (appointment) => {
        this.setState({ editMode: true });
    }

    // NOTE Mark Arrival
    handleMarkArrival = (discNum, arrivalTime) => {

        const atndForm = this.form;
        const that = this;
        const { currentAppointment, caseNoInfo, selectedAttnFamilyMember } = this.props;

        if (isTempMemberExist(selectedAttnFamilyMember)) return;

        // atndForm.walk(atndForm.childs).then(
        //     validationResult => {
        //         if (validationResult === true) {
        let callback = () => {
            const { patientStatus } = that.props;
            let { listApptParams } = that.state;
            let params = markArrivalPatientParamsGenerator(this.props, arrivalTime, discNum);
            // Handle family params
            params = selectedAttnFamilyMember.length > 0 ? markArrivalFamilyParamsGenerator(params, selectedAttnFamilyMember) : params;
            listApptParams.page = 1;
            that.props.markArrival(params, listApptParams, (result) => {
                if (currentAppointment.appointmentId) {
                    this.props.refreshPatient({
                        isRefreshCaseNo: false,
                        caseNo: currentAppointment.caseNo || caseNoInfo.caseNo
                    });
                }
                that.props.listAppointmentList(listApptParams, this.postUpdateAttendanceListAppt(currentAppointment, patientStatus));
                that.apptListRef.updateCurrentPage(0);
                let confirmECSEligibility = (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
                    (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';
                this.props.updateField({
                    doCloseBackUp: {
                        patientStatus: this.props.patientStatus,
                        discNum: this.props.discNum,
                        isNep: this.props.isNep,
                        nepRemark: this.props.nepRemark,
                        confirmECSEligibility: confirmECSEligibility,
                        caseIndicator: this.props.caseIndicator
                    }
                });
            });
        };
        callback();
        // }
        // }
        // );
    }

    handleUpdateClick = () => {
        if (this.props.serviceCd === 'EHS') {
            this.setState({ confirmAtndDialogOpen: true }, () => {
                this.confirmAtndRef.handleOnChange('ehsWaiverCategoryCd', this.props.currentAppointment?.attendanceBaseVo?.waiverCatgryCd, () => {
                    this.confirmAtndRef.handleOnChange('team', this.props.currentAppointment?.attendanceBaseVo?.ehsTeamId || 'null');
                });
            });
        } else {
            this.handleUpdate();
        }
    }

    handleUpdate = () => {
        const atndForm = this.form;
        const that = this;
        const { currentAppointment, discNum, patientInfo, siteId, serviceCd, nepRemark, isNep, caseNoInfo, patientSvcExist, caseIndicator } = this.props;
        const { ehsConfirmAttendance, ehsConfirmAtndData } = this.state;

        // this.props.auditAction(AlsDesc.UPDATE,null,null,false,'ana');
        const currentAttendance = currentAppointment.attendanceBaseVo;
        if (currentAttendance) {
            let { listApptParams } = that.state;
            const { patientStatus } = that.props;
            let params = {
                atndId: currentAttendance.atndId,
                atndVersion: currentAttendance.version,
                discNum: discNum,
                isNep: isNep,
                nepRemark: isNep ? nepRemark : null,
                patientKey: patientInfo.patientKey,
                siteId: siteId,
                svcCd: serviceCd,
                patientStatusCd: patientStatus
            };

            const isAttenConfirmEcsEligibilitySiteParam = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');

            let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';

            let confirmECSEligibility = (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
                (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';

            if ((isAttenConfirmEcsEligibility === '1')) {
                params.isRqrCnsltFee = confirmECSEligibility === 'C' ? false : true;
                params.isPaidCnsltFee = confirmECSEligibility === 'C' ? false : true;
                params.isRqrPrscrbFee = confirmECSEligibility === 'C' ? false : true;
                params.isPaidPrscrbFee = confirmECSEligibility === 'C' ? false : true;
                params.isQueueProcessed = true;
                params.isEcsElig = confirmECSEligibility === 'C' ? true : false;
                params.isFeeSettled = confirmECSEligibility === 'C' ? false : true;
            }
            if (ehsConfirmAttendance === true) {
                params.waiverCatgryCd = ehsConfirmAtndData.ehsWaiverCategoryCd;
                params.ehsTeamId = ehsConfirmAtndData.team;
                params.ehsMbrSts = patientInfo?.ehsMbrSts;
                this.setState({ ehsConfirmAttendance: false, ehsConfirmAtndData: null });
            }
            listApptParams.page = 1;
            this.props.auditAction('Update Attendance');
            that.props.editAttendance(params, listApptParams, (result) => {
                if (currentAppointment.appointmentId) {
                    this.props.refreshPatient({
                        isRefreshCaseNo: false,
                        caseNo: currentAppointment.caseNo || caseNoInfo.caseNo
                    });
                }
                if (this.props.doCloseCallback) {
                    this.props.doCloseCallback(true);
                } else {
                    that.props.listAppointmentList(listApptParams, this.postUpdateAttendanceListAppt(currentAppointment, patientStatus));
                    that.apptListRef.updateCurrentPage(0);
                    let params = {
                        patientKey: this.props.patientInfo.patientKey,
                        svcCd: this.props.serviceCd
                    };
                    this.props.checkPatientSvcExist(params, (data) => {
                        this.props.updateField({ patientSvcExist: data });
                    });
                }
            });
        }

        this.setState({ editMode: false });
    }

    handleCancel = () => {
        this.setState({ editMode: false });
        const { appointmentList, currentAppointment } = this.props;
        this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'ana');
        if (currentAppointment && currentAppointment.appointmentId) {
            const currentAppt = appointmentList.find(x => x.appointmentId === currentAppointment.appointmentId);
            this.handleRowSelect(currentAppt);
        }
    }

    confirmTransferIn = (transferInData,transferInInputParams) => {
        this.setState({ confirmTransferIn: true, transferInData });
        this.markAttendance(transferInInputParams.caseNo);
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
            if (this.props.doCloseCallback) {
                showPsoReminder(this.props.patientInfo, () => {
                    this.props.doCloseCallback(true);
                });
            } else {
                showPsoReminder(this.props.patientInfo);
            }
        });
    }

    render() {
        const { classes, currentAppointment, patientInfo, appointmentConfirmInfo, appointmentList, clinicConfig, patientStatusList, patientStatus, patientStatusFlag, discNum, nepRemark, isNep, auditAction, caseIndicator, patientSvcExist, confirmECSEligibility, serviceCd, attnFamilyMemberData, gumLabelPrintReqParams } = this.props;
        const { paymentMsgDialogParams } = this.state;
        let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        const showLateApptConfig = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.LATE_ATTENDANCE_FLAG, clinicConfig, where);
        const lateApptTimeConfig = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.LATE_ATTENDANCE_TIME, clinicConfig, where);
        const lateApptTime = calcLateApptTime(showLateApptConfig, lateApptTimeConfig, currentAppointment);

        let isSameDayAppt = currentAppointment && (moment(currentAppointment.appointmentDate).isSame(moment().format(Enum.DATE_FORMAT_EDMY_VALUE)));

        const noSelectedCurrentAppointment = (currentAppointment === null || currentAppointment === undefined);
        const showConfirmWindow = this.props.isAttend && noSelectedCurrentAppointment;
        const isAtndGenEncntrChargeableControl = getIsAtndGenEncntrChargeableControlVal(clinicConfig, where.serviceCd, this.props.siteId);
        const isShowNepMessage = this.props.serviceCd === 'SHS' && currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep && currentAppointment.isCharge === 0;

        const pmiGrpName = patientInfo?.cgsSpecOut?.pmiGrpName || '';
        return (
            <>
                <Grid container spacing={1}>
                    <Grid item container xs={6}>
                        <AppointmentList
                            id={'tbAppointmentList'}
                            innerRef={ref => this.apptListRef = ref}
                            isAttend={this.props.isAttend}
                            // data={currentDayAppointment}
                            patientInfo={patientInfo}
                            appointmentList={appointmentList}
                            rowSelect={this.handleRowSelect}
                            selectIdName="appointmentId"
                            listApptParams={this.state.listApptParams}
                            listAppointment={(params) => this.props.listAppointmentList(params)}
                            updateListApptParam={this.updateListApptParam}
                            handleEditAppointment={this.handleEditAppointment}
                            handlePrintGumLabel={this.handlePrintGumLabel}
                            currentAppointment={currentAppointment}
                            editMode={this.state.editMode}
                            isAttendancePage
                        />
                    </Grid>
                    <Grid item container xs={6} style={{ margin: 0, padding: 10, display: 'flex' }} direction={'column'}>
                        <ValidatorForm className={classes.form} ref={ref => { this.form = ref; }} onSubmit={this.handleUpdateClick}>
                            <Grid item container xs={12} style={{ position: 'relative', backgroundColor: palette.cimsBackgroundColor }} alignItems="center" justify="flex-end">
                                {isShowNepMessage ? <Grid style={{ color: 'red', fontWeight: 'bold' }}>Payment is required for NEP status.</Grid> : null}
                                {/* NOTE Family Member Button */}
                                {serviceCd === 'CGS' && !showConfirmWindow && currentAppointment?.attnStatusCd !== 'Y' && !isAtndGenEncntrChargeableControl && pmiGrpName && (
                                        <Box m={1}>
                                            <FamilyNumberBtn isAttend appointmentId={currentAppointment?.appointmentId} disabled={noSelectedCurrentAppointment || attnFamilyMemberData.length < 2 ? true : false} />
                                        </Box>
                                )}
                                {
                                    !showConfirmWindow ?
                                        (currentAppointment?.attnStatusCd !== 'Y' ?
                                            <>
                                                {isAtndGenEncntrChargeableControl === true ?
                                                    null :
                                                    <CIMSButton
                                                        id={'btnArrival'}
                                                        onClick={(e) => {
                                                            auditAction('Click Mark Arrival Button', null, null, false, 'ana');
                                                            this.handleArrival(e);
                                                        }}
                                                        disabled={(currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.arrivalTime) || (noSelectedCurrentAppointment) ? true : false}
                                                    >
                                                        Mark Arrival
                                            </CIMSButton>}
                                                <CIMSButton
                                                    id={'btnAttend'}
                                                    disabled={currentAppointment ? currentAppointment.appointmentDate !== moment().format(Enum.DATE_FORMAT_EDMY_VALUE) : true}
                                                    onClick={(e) => {
                                                        auditAction('Take Attendance');
                                                        this.handleAttendClick(e);
                                                    }}
                                                >
                                                    Attend
                                            </CIMSButton>
                                            </>
                                            :
                                            <>
                                                <CIMSButton
                                                    id={'btnUpdate'}
                                                    onClick={() => { this.form.submit(); }}
                                                    disabled={!this.state.editMode}
                                                >
                                                    Update
                                            </CIMSButton>
                                                <CIMSButton
                                                    id={'btnCancel'}
                                                    onClick={this.handleCancel}
                                                    disabled={!this.state.editMode}
                                                >
                                                    Cancel
                                            </CIMSButton>
                                            </>
                                        ) :
                                        null
                                }

                            </Grid>
                            {
                                showConfirmWindow ?
                                    <ConfirmationWindow
                                        id={'take_attendance_confirmation'}
                                        type={Enum.APPOINTMENT_TYPE.TAKE_ATTENDANCE}
                                        patientInfo={patientInfo}
                                        confirmationInfo={appointmentConfirmInfo}
                                        patientStatusList={patientStatusList}
                                        isAttend
                                    />
                                    :
                                    <AttendanceDetail
                                        editMode={this.state.editMode}
                                        currentAppointment={currentAppointment}
                                        patientStatusList={patientStatusList}
                                        patientStatus={patientStatus}
                                        patientStatusFlag={patientStatusFlag}
                                        discNum={discNum}
                                        nepRemark={nepRemark}
                                        isNep={isNep}
                                        clinicConfig={clinicConfig}
                                        handleChange={this.handleChange}
                                        patientSvcExist={patientSvcExist}
                                        caseIndicator={caseIndicator}
                                    // confirmECSEligibility={confirmECSEligibility}
                                    />
                            }

                        </ValidatorForm>
                        {showLateApptConfig.configValue === 'Y'
                            && !this.props.isAttend
                            && lateApptTime
                            && isSameDayAppt
                            && currentAppointment
                            && currentAppointment.attnStatusCd !== Enum.ATTENDANCE_STATUS.ATTENDED
                            && !currentAppointment.arrivalTime ?
                            <Grid item container direction="column" xs={12} justify="center" className={classes.lateApptPanel} id={'appointment_late_appointment_info_panel'}>
                                <Typography className={classes.attendanceInfoItem}>
                                    {`The ${CommonUtilities.getPatientCall().toLowerCase()} is ${lateApptTime.hours} hrs ${lateApptTime.minutes - (lateApptTime.hours * 60)} mins late`}
                                </Typography>
                            </Grid>
                            : null}
                    </Grid>
                    <EditModeMiddleware componentName={accessRightEnum.attendance} when={!this.props.isAttend} />
                </Grid>
                <CIMSPromptDialog
                    open={this.state.arrivalDialogOpen}
                    id={'attendance_arrivalDialog'}
                    dialogTitle={'Mark Arrival'}
                    classes={{
                        paper: classes.dialogPaper2
                    }}
                    dialogContentText={
                        <Grid container spacing={2}>
                            <Grid item container xs={12}>
                                <Typography>Please confirm the arrival. You can optionally input the disc number</Typography>
                            </Grid>
                            <Grid item container xs={12}>
                                <Typography><span style={{ fontWeight: 800 }}>Time: </span>{this.state.arrivalDialogTime && this.state.arrivalDialogTime.format('HH:mm:ss')}</Typography>
                            </Grid>
                            <Grid item container xs={2}>
                                <CIMSTextField
                                    fullWidth
                                    id={'attendance_arrivalDialog_discNum'}
                                    inputProps={{
                                        spellCheck: false,
                                        maxLength: 5
                                    }}
                                    value={this.state.arrivalDialogDiscNum}
                                    onChange={(e) => {
                                        this.setState({ arrivalDialogDiscNum: e.target.value });
                                    }}
                                    autoComplete="off"
                                    placeholder={'Disc Number'}
                                />
                            </Grid>
                        </Grid>
                    }
                    buttonConfig={
                        [
                            {
                                id: 'attendance_arrivalDialog_confirm',
                                name: 'Confirm Arrival',
                                onClick: () => {
                                    this.setState({ arrivalDialogOpen: false });
                                    this.handleChange('discNum', this.state.arrivalDialogDiscNum);
                                    this.props.auditAction('Confirm Mark Arrival');
                                    this.handleMarkArrival(this.state.arrivalDialogDiscNum, this.state.arrivalDialogTime);
                                }
                            },
                            {
                                id: 'attendance_arrivalDialog_cancel',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Cancel Mark Arrival', null, null, false, 'ana');
                                    this.setState({ arrivalDialogOpen: false });
                                }
                            }
                        ]
                    }
                />
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
                            id={'back_take_attendance_payment_message_dialog'}
                            paymentMsgDialogParams={paymentMsgDialogParams}
                            handlePaymentMsgDialogOk={this.handlePaymentMsgDialogOk}
                        />
                        : null
                }
                {
                    this.props.serviceCd === 'EHS' && this.state.confirmAtndDialogOpen ?
                        <ConfirmAtndDialog
                            id={'confirm_attendance'}
                            innerRef={ref => this.confirmAtndRef = ref}
                            confirmAtndDialogOpen={this.state.confirmAtndDialogOpen}
                            confirm={this.hanldeEHSConfirmAttendance}
                            auditAction={this.props.auditAction}
                            closeConfirmAtndDialog={()=>{
                                this.setState({confirmAtndDialogOpen : false});
                            }}
                            currentRmCd={currentAppointment.rmCd}
                        />
                        : null
                }
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        accessRights: state.login.accessRights,
        serviceCd: state.login.service.serviceCd,
        // patientStatusList: state.attendance.patientStatusList,
        patientStatus: state.attendance.patientStatus,
        discNum: state.attendance.discNum,
        isNep: state.attendance.isNep,
        nepRemark: state.attendance.nepRemark,
        isAttend: state.attendance.isAttend,
        patientInfo: state.patient.patientInfo,
        appointmentConfirmInfo: state.attendance.appointmentConfirmInfo,
        searchParameter: state.attendance.searchParameter,
        appointmentInfo: state.patient.appointmentInfo,
        caseNoInfo: state.patient.caseNoInfo,
        openPromptDialog: state.attendance.openPromptDialog,
        clinicCd: state.login.clinic.clinicCd,
        clinicConfig: state.common.clinicConfig,
        appointmentList: state.attendance.appointmentList,
        currentAppointment: state.attendance.currentAppointment,
        patientStatusFlag: state.attendance.patientStatusFlag,
        appointment: state.patient.appointmentInfo,
        siteId: state.login.clinic.siteId,
        clinic: state.login.clinic,
        ecsChkId: state.ecs.selectedPatientEcsStatus.chkEcsId,
        restlChkId: state.ecs.selectedPatientOcsssStatus.restlChkId,
        patientStatusList: state.common.commonCodeList.patient_status,
        markArrivalDialogOpen: state.attendance.markArrivalDialogOpen,
        doCloseBackUp: state.attendance.doCloseBackUp,
        doCloseCallback: state.attendance.doCloseCallback,
        caseIndicator: state.attendance.caseIndicator,
        confirmECSEligibility: state.attendance.confirmECSEligibility,
        patientSvcExist: state.attendance.patientSvcExist,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        curCloseTabMethodType: state.mainFrame.curCloseTabMethodType,
        loginUserRoleList: state.common.loginUserRoleList,
        subTabs: state.mainFrame.subTabs,
        attnFamilyMemberData:  state.bookingInformation.attnFamilyMemberData,
        selectedAttnFamilyMember:  state.bookingInformation.selectedAttnFamilyMember,
        isRedirectByPatientList: state.bookingInformation.isRedirectByPatientList,
        gumLabelPrintReqParams: state.patient.gumLabelPrintReqParams
    };
};

const mapDispatchToProps = {
    updateField,
    markAttendance,
    destroyMarkAttendance,
    getAppointmentForAttend,
    deleteSubTabs,
    openCommonMessage,
    openCaseNoDialog,
    listAppointmentList,
    getEncounterTypeList,
    getCodeList,
    refreshServiceStatus,
    getPatientAppointment,
    getRedesignPatientAppointment,
    loadEncounterInfo,
    printPatientGumLabel,
    printSPPGumLabel,
    printEHSGumLabel,
    markArrival,
    editAttendance,
    auditAction,
    updateCurTab,
    refreshPatient,
    checkPatientSvcExist,
    skipTab,
    closeCommonMessage,
    updateLastCheckDate
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Attendance));