import React from 'react';
import {
    Box,
    Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import AppointmentList from '../attendance/component/appointmentList';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import Enum from '../../../enums/enum';
import { codeList } from '../../../constants/codeList';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import { openCaseNoDialog } from '../../../store/actions/caseNo/caseNoAction';
import {
    getPatientById as getPatientPanelPatientById,
    getRedesignPatientAppointment,
    getPatientEncounter,
    loadEncounterInfo,
    printPatientGumLabel,
    printSPPGumLabel,
    printEHSGumLabel,
    refreshPatient,
    updateLastCheckDate
} from '../../../store/actions/patient/patientAction';
import { getPatientById as getRegPatientById } from '../../../store/actions/registration/registrationAction';
import * as AppointmentUtilities from '../../../utilities/appointmentUtilities';
import moment from 'moment';
import {
    listAppointmentList,
    backTakeAttendance,
    updateField,
    resetAll
} from '../../../store/actions/attendance/backTakeAttendanceAction';
import { getCodeList } from '../../../store/actions/common/commonAction';
import CommonRegex from '../../../constants/commonRegex';
import {
    getEncounterTypeList
} from '../../../store/actions/common/commonAction';
import ConfirmationWindow from '../../compontent/confirmationWindow';
import CIMSMultiTextField from '../../../components/TextField/CIMSMultiTextField';
import { deleteSubTabs, updateCurTab, skipTab, changeTabsActive, updateField as updateMainFrame } from '../../../store/actions/mainFrame/mainFrameAction';
import AccessRightEnum from '../../../enums/accessRightEnum';

import * as backTakeAttendanceAcitonType from '../../../store/actions/attendance/backTakeAttendanceAcitonType';

import AttendanceDetail from '../attendance/component/attendanceDetail';
import { refreshServiceStatus } from '../../../store/actions/ECS/ecsAction';
import * as commonUtil from '../../../utilities/commonUtilities';
import * as atndService from '../../../services/ana/attendanceService';

import Print from '@material-ui/icons/Print';
import MarkArrivalDialog from './markArrivalDialog';

import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import accessRightEnum from '../../../enums/accessRightEnum';
import {
    checkPatientSvcExist
} from '../../../store/actions/appointment/booking/bookingAction';
import { auditAction } from '../../../store/actions/als/logAction';
import palette from '../../../theme/palette';
import TransferInDialog from '../attendance/component/transferInDialog';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import _ from 'lodash';
import { updateAntInfoInOtherPage } from '../../../utilities/anSvcIdUtilities';
import { attendanceFamilyParamsGenerator, showPsoReminder } from '../../../utilities/attendanceUtilities';
import PaymentMsgDialog from '../attendance/component/paymentMsgDialog';
import FamilyNumberBtn from '../booking/component/bookForm/familyMember/FamilyNumberBtn';
import { dispatch } from '../../../store/util';
import { REDIRECT_BY_PATIENT_LIST, UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER } from '../../../store/actions/appointment/booking/bookingActionType';
import { isTempMemberExist } from '../../../utilities/familyNoUtilities';
import ConfirmAtndDialog from '../../compontent/confirmAtndDialog';

const styles = (theme) => ({
    form: {
        width: '100%',
        margin: 0,
        padding: 0,
        flex: 1
        //height: '90%'
    },
    alignRightBtn: {
        position: 'absolute',
        right: 0,
        display: 'inline-block'
    },
    attendanceInfo: {
        height: '100%',
        backgroundColor: theme.palette.primary.main
    },
    attendanceInfoItem: {
        width: '100%',
        fontSize: '2.5em',
        color: theme.palette.white,
        textAlign: 'center',
        padding: '0px 8px'
    },
    apptInfoRow: {
        padding: `${18 * theme.palette.unit}px ${8 * theme.palette.unit}px`
    }
});

class BackTakeAttendance extends React.Component {
    state = {
        listApptParams: null,
        appointmentDateRangeStr: moment().format(Enum.DATE_FORMAT_EDMY_VALUE),
        bookedApptType: {
            caseType: ''
        },
        confirmTransferIn: false,
        transferInData: null,
        paymentMsgDialogParams:{
            open:false,
            encounterTypeId:null
        },
        confirmAtndDialogOpen: false,
        ehsConfirmAttendance: false,
        ehsConfirmAtndData: null
    }

    componentWillMount() {
        this.props.resetAll();
    }

    componentDidMount() {
        let pastApptId = null;
        let pastApptDate = null;
        this.props.ensureDidMount();
        this.props.refreshServiceStatus();
        this.getPatientStatusList();
        let params = {
            patientKey: this.props.patientInfo.patientKey,
            svcCd: this.props.serviceCd
        };
        this.props.checkPatientSvcExist(params, (data) => {
            this.props.updateField({ patientSvcExist: data });
        });

        if (this.props.location.state) {
            const params = this.props.location.state;
            if (params.ledByPastAppt && params.pastApptId) {
                pastApptId = params.pastApptId;
                pastApptDate = params.pastApptDate ? params.pastApptDate : null;
            }
            if (params.redirectFrom === AccessRightEnum.patientSummary) {
                if (params.apptInfo) {
                    pastApptId = params.apptInfo.appointmentId;
                    pastApptDate = params.apptInfo.appointmentDate;
                }
            }
        }
        const { clinic, patientInfo, clinicConfig } = this.props;

        if (atndService.isPatientCanTakeAttendance(clinic, clinicConfig, patientInfo)) {
            let patientLabel = commonUtil.getPatientCall();
            this.props.openCommonMessage({
                msgCode: '130209',
                params: [{ name: 'PATIENT_LABEL', value: patientLabel },
                { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
                ],
                btnActions: {
                    btn1Click: () => {
                        this.props.deleteSubTabs(AccessRightEnum.backTakeAttendacne);
                    }
                }
            });
            return;
        }


        const where = { serviceCd: this.props.serviceCd, siteId: this.props.siteId };
        let notAllowBackTake = AppointmentUtilities.isExpiryAllowBackTakeDate(clinicConfig, where, pastApptDate);
        if (notAllowBackTake) {
            this.props.openCommonMessage({
                msgCode: '130201',
                showSnackbar: true
            });
            this.props.deleteSubTabs(AccessRightEnum.backTakeAttendacne);
        }
        else {
            this.getAppointmentList(pastApptId);
            this.initDoClose();
        }
    }

    checkIsDirty = () => {
        const {
            currentAppointment,
            patientStatus,
            doCloseBackUp,
            isAttend,
            caseIndicator
        } = this.props;
        let isDirty = false;
        let confirmECSEligibility = (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
            (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';
        if (currentAppointment && !isAttend) {
            isDirty = !CommonUtilities.isEqualObj(doCloseBackUp, {
                isNep: currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep || false,
                discNum: currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.discNum || '',
                nepRemark: currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.nepRemark || '',
                patientStatus,
                confirmECSEligibility: confirmECSEligibility,
                caseIndicator
            });
        }
        return isDirty;
    }

    saveFunc = (closeTab) => {
        const {
            currentAppointment,
            isAttend
        } = this.props;
        this.props.updateField({ doCloseCallback: closeTab });
        if (currentAppointment && !isAttend) {
            this.handleAttend();
        }
    }

    initDoClose = () => {
        this.doClose = CommonUtilities.getDoCloseFunc_2(accessRightEnum.backTakeAttendacne, this.checkIsDirty, this.saveFunc);
        this.props.updateCurTab(accessRightEnum.backTakeAttendacne, this.doClose);
    }

    getPatientStatusList = () => {
        let params = [
            codeList.patient_status
        ];
        this.props.getCodeList({
            params,
            actionType: backTakeAttendanceAcitonType.PATIENT_STATUS_LIST
        });
    }

    getAppointmentList = (pastApptId) => {
        const { clinicConfig, serviceCd, siteId, caseIndicator } = this.props;
        const where = { serviceCd: serviceCd, siteId: siteId };
        // const backTakeDay = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.BACK_TAKE_ATTENDANCE_DAY, clinicConfig, where);
        let allowBackTakeDay = AppointmentUtilities.getAllowBackTakeDay(clinicConfig, where);
        let params = {
            allService: false,
            siteIds: siteId,
            withPMIDetls: false,
            withShowObsInfomation: false,
            svcCd: serviceCd,
            patientKey: this.props.patientInfo.patientKey,
            attnStatusCd: 'N',

            startDate: moment().add(allowBackTakeDay, 'day').format(Enum.DATE_FORMAT_EYMD_VALUE),
            endDate: moment().add(-1, 'day').format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        // this.setState({ listApptParams: params });
        const apptDateRangeStr = `${moment(params.startDate).format(Enum.DATE_FORMAT_EDMY_VALUE)} to ${moment(params.endDate).format(Enum.DATE_FORMAT_EDMY_VALUE)}`;

        this.updateListApptParam(params);
        this.setState({ appointmentDateRangeStr: apptDateRangeStr });
        this.props.listAppointmentList({
            params, callBack: (appointmentListData) => {
                const appointmentList = appointmentListData;
                if (pastApptId) {
                    let curAppointment = appointmentList.find(item => item.appointmentId === pastApptId);
                    let patientStatus = curAppointment ? this.getCasePatientStatus(curAppointment) : '';
                    if (curAppointment) {
                        this.getPatientStatusFlag(curAppointment);
                        this.props.updateField({ currentAppointment: curAppointment });
                        this.apptListRef && this.apptListRef.setSelectedAppt(curAppointment.appointmentId);
                    }
                    let isNep = curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.isNep || false;
                    let disNum = curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.disNum || '';
                    let nepRemark = curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.nepRemark || '';
                    let confirmECSEligibility = (curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
                        (curAppointment && curAppointment.attendanceBaseVo && curAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';
                    this.props.updateField({
                        doCloseBackUp: {
                            isNep: isNep,
                            nepRemark: disNum,
                            discNum: nepRemark,
                            patientStatus: patientStatus,
                            confirmECSEligibility: confirmECSEligibility,
                            caseIndicator
                        }
                    });
                }
            }
        });

    }

    getCasePatientStatus = (curAppointment) => {
        const { patientInfo } = this.props;
        let patientStatus = AppointmentUtilities.getPatientStatusCd(curAppointment && curAppointment.caseNo, patientInfo);
        return patientStatus;
    }


    getPatientStatusFlag = (curAppointment) => {
        const { serviceCd, siteId } = this.props;
        let patientStatusFlag = 'N';
        this.props.getEncounterTypeList({
            params: { serviceCd, siteId },
            callback: (encounterList) => {
                patientStatusFlag = AppointmentUtilities.getPatientStatusFlag(encounterList, curAppointment);
                this.props.updateField({ patientStatusFlag: patientStatusFlag });
            }
        });
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
        } else if (name === 'caseIndicator') {
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
        } else {
            attendanceBaseVo = { ...(this.props.currentAppointment && this.props.currentAppointment.attendanceBaseVo), [name]: value };
            let updateData = {
                ...this.props.currentAppointment,
                attendanceBaseVo: attendanceBaseVo
            };
            this.props.updateField({ currentAppointment: updateData });
        }
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
        // const { currentAppointment, serviceCd } = this.props;
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
            const { patientInfo, caseNoInfo, currentAppointment, serviceCd } = this.props;
            CaseNoUtil.handleCaseNoBeforeAttend(patientInfo, currentAppointment, serviceCd, (callbackPara, callbackAction) => {
                if (typeof (callbackPara) !== 'undefined') {
                    if (typeof (callbackPara) === 'string') {
                        if (currentAppointment.encntrTypeCd === 'ENC_TRANS' && serviceCd === 'ANT') {
                            this.transferIn.doTransferIn({ caseNo: callbackPara });
                        } else if (serviceCd === 'EHS') {
                            this.ehsBackTakeAttendance(callbackPara);
                        }  else {
                            this.backTakeAttendance(callbackPara);
                        }
                    }
                    else {
                        if (callbackPara === null && typeof (callbackAction) === 'string') {
                            if (callbackAction === 'fail') {
                                this.props.openCommonMessage({
                                    msgCode: '111015',
                                    params: [{ name: 'HEADER', value: 'Back Take Attendance' }],
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
                                this.ehsBackTakeAttendance(callbackPara);
                            } else {
                                this.backTakeAttendance(callbackPara);
                            }
                        }
                    }
                } else {
                    if (serviceCd === 'EHS') {
                        this.ehsBackTakeAttendance();
                    } else {
                        this.backTakeAttendance();
                    }
                }
            });
        });
    }

    ehsBackTakeAttendance = (callbackPara) =>{
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
                            this.props.updateLastCheckDate({
                                patientKey: patientInfo.patientKey,
                                lastChkDate: moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                                version: patientInfo.patientEhsDto && patientInfo.patientEhsDto.version
                            }, ()=>{
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

    backTakeAttendance = (caseNoVal) => {
        const { currentAppointment, caseNoInfo, patientInfo, patientStatus, siteId, serviceCd, ecsChkId, restlChkId,
            patientSvcExist, caseIndicator, auditAction, selectedDateBackFamilyMember } = this.props;
        let { listApptParams, confirmTransferIn, transferInData } = this.state;
        const { ehsConfirmAttendance, ehsConfirmAtndData } = this.state;
        const isCaseDto=typeof (caseNoVal)==='object';
        //currentAppointment
        auditAction('Back take attendance');

        let params = {
            apptId: currentAppointment.appointmentId,
            discNum: currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.discNum,
            arrivalTime: moment(`${currentAppointment.appointmentDate} ${currentAppointment.appointmentTime}`, Enum.DATE_FORMAT_24_HOUR).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
            isNep: currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep,
            nepRemark: (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep) ? (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.nepRemark) : null,
            isRealtime: false,
            patientKey: patientInfo.patientKey,
            patientStatusCd: patientStatus,
            // caseNo: currentAppointment.caseNo || (caseDto ? null : caseNoInfo.caseNo),
            caseNo: isCaseDto ? null : caseNoVal,
            siteId: siteId,
            svcCd: serviceCd,
            ecsChkId: ecsChkId,
            restlChkId: restlChkId,
            apptVersion: currentAppointment.version,
            atndSrc: 'C',
            //caseDto: caseDto || null
            caseDto: isCaseDto ? caseNoVal : null
        };
        const isNewToSvcSiteParam = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';

        if (isTempMemberExist(selectedDateBackFamilyMember)) return;

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
        if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
            const fetchBackTakeAttnd = () => {
                params = selectedDateBackFamilyMember.length > 0 ? attendanceFamilyParamsGenerator(params, selectedDateBackFamilyMember) : params;
                this.props.backTakeAttendance(params, listApptParams, (result) => {
                    if (currentAppointment.appointmentId) {
                        // this.props.getPatientAppointment(currentAppointment.appointmentId, patientInfo && patientInfo.caseList);
                        this.props.getRedesignPatientAppointment(currentAppointment.appointmentId, AppointmentUtilities.getSiteCdServiceCdParams(serviceCd, siteId), patientInfo && patientInfo.caseList);
                        this.props.loadEncounterInfo(result.encounter);
                        // this.props.getPatientPanelPatientById({
                        //     patientKey: patientInfo.patientKey,
                        //     caseNo: currentAppointment.caseNo || caseNoInfo.caseNo || result.caseDto.caseNo
                        // });
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
                        this.updateListApptParam(listApptParams);
                        this.apptListRef && this.apptListRef.updateCurrentPage(0);
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
                    fetchBackTakeAttnd();
                });
                this.setState({ confirmTransferIn: false, transferInData: null });
            } else {
                fetchBackTakeAttnd();
            }
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    }

    handleRowSelect = (selectedRow) => {
        const { selectedDateBackFamilyMember, isRedirectByPatientList } = this.props;
        if (isRedirectByPatientList) dispatch({ type: REDIRECT_BY_PATIENT_LIST, payload: { isRedirectByPatientList: false } });
        // Empty selected family member
        if (selectedDateBackFamilyMember.length > 0) dispatch({ type: UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER, payload: { selectedData: [] } });
        let patientStatus = selectedRow ? this.getCasePatientStatus(selectedRow) : '';
        let caseIndicator = selectedRow ? this.props.caseIndicator : '';
        this.getPatientStatusFlag(selectedRow);
        let isNep = selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isNep || false;
        let disNum = selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.disNum || '';
        let nepRemark = selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.nepRemark || '';
        let confirmECSEligibility = (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isEcsElig) == true ? 'C' :
            (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isFeeSettled) ? 'P' : '';
        this.props.updateField({
            currentAppointment: selectedRow,
            isAttend: false,
            patientStatus: patientStatus,
            caseIndicator: caseIndicator,
            doCloseBackUp: {
                isNep: isNep,
                nepRemark: nepRemark,
                discNum: disNum,
                patientStatus: patientStatus,
                confirmECSEligibility: confirmECSEligibility,
                caseIndicator: caseIndicator
            }
        });
        // const isAttenConfirmEcsEligibilitySiteParam = CommonUtilities.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, this.props.siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        // let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || 0;
        // if (isAttenConfirmEcsEligibility) {
        //     this.props.updateField({
        //         confirmECSEligibility: (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isEcsElig) == true ? 'C' :
        //             (selectedRow && selectedRow.attendanceBaseVo && selectedRow.attendanceBaseVo.isFeeSettled) ? 'P' : ''
        //     });
        // }
    }

    updateListApptParam = (listApptParams) => {
        this.setState({ listApptParams });
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

    refreshAttendancePage = () => {
        this.getAppointmentList(this.props.currentAppointment.appointmentId);
    }

    confirmTransferIn = (transferInData, transferInInputParams) => {
        this.setState({ confirmTransferIn: true, transferInData });
        this.backTakeAttendance(transferInInputParams.caseNo);
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

    hanldeEHSConfirmAttendance = (ehsConfirmAtndInputParams, ehsConfirmAtndData) => {
        this.setState({ ehsConfirmAttendance: true, ehsConfirmAtndData });
        this.backTakeAttendance(ehsConfirmAtndInputParams.caseNo);
        this.setState({ confirmAtndDialogOpen: false });
    }


    render() {
        const { classes, currentAppointment, patientInfo, caseIndicator,
            appointmentConfirmInfo, appointmentList, clinicConfig,
            patientStatusFlag, patientStatusList, patientStatus, discNum, isNep, nepRemark, markArrivalDialogOpen, patientSvcExist, confirmECSEligibility, serviceCd, dateBackFamilyMemberData, isAttend } = this.props;
            const { paymentMsgDialogParams } = this.state;
            let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };

        const pmiGrpName = patientInfo?.cgsSpecOut?.pmiGrpName || '';

        let bookedApptType = {
            caseType: '',
            bookedQuotaType: ''
        };

        if (currentAppointment) {
            bookedApptType = AppointmentUtilities.getBookedApptType(currentAppointment.caseTypeCd, currentAppointment.appointmentTypeCd, clinicConfig, where);
        }
        const isShowNepMessage = this.props.serviceCd === 'SHS' && currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep && currentAppointment.isCharge === 0;

        return (
            <Grid container spacing={1}>
                <Grid item container xs={6}>
                    <AppointmentList
                        id={'back_take_attendance_appointment_list'}
                        innerRef={ref => this.apptListRef = ref}
                        isAttend={isAttend}
                        // data={currentDayAppointment}
                        patientInfo={patientInfo}
                        appointmentList={appointmentList}
                        rowSelect={this.handleRowSelect}
                        selectIdName={'appointmentId'}
                        listApptParams={this.state.listApptParams}
                        listAppointment={(params) => this.props.listAppointmentList({ params })}
                        updateListApptParam={this.updateListApptParam}
                        appointmentDateRangeStr={this.state.appointmentDateRangeStr}
                        handlePrintGumLabel={this.handlePrintGumLabel}
                        currentAppointment={currentAppointment}
                        nodataMessage={'There is no available appointment for back take attendance.'}
                    />
                </Grid>
                <Grid item container xs={6} style={{ margin: 0, padding: 10, display: 'flex' }} direction={'column'}>
                    <ValidatorForm className={classes.form} ref={r => this.form = r}>
                        <Grid item container xs={12} style={{ position: 'relative', backgroundColor: palette.cimsBackgroundColor }} alignItems="center" justify="flex-end">
                            {isShowNepMessage ? <Grid style={{ color: 'red', fontWeight: 'bold' }}>Payment is required for NEP status.</Grid> : null}
                            {/* NOTE Family Member Button */}
                            {serviceCd === 'CGS'  && pmiGrpName && !isAttend && (
                                    <Box m={1}>
                                        <FamilyNumberBtn isDateBack appointmentId={currentAppointment?.appointmentId} disabled={!currentAppointment || dateBackFamilyMemberData.length < 2 ? true : false} />
                                    </Box>
                                )}
                            {/* {
                                <CIMSButton
                                    id={'btnMarkArrival'}
                                    onClick={() => { this.props.updateField({ markArrivalDialogOpen: true, markArrivalDisNum: (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.discNum) }); }}
                                    disabled={currentAppointment ? currentAppointment.arrivalTime : true}
                                >Mark Arrival</CIMSButton>
                            } */}
                            {!isAttend ?
                                <CIMSButton
                                    id={'back_take_attendance_btn_attend'}
                                    onClick={this.handleAttendClick}
                                    //className={classes.alignRightBtn}
                                    disabled={!currentAppointment}
                                >Attend</CIMSButton>
                                : null
                            }
                        </Grid>
                        {
                            isAttend && currentAppointment === null ?
                                <ConfirmationWindow
                                    id={'back_take_attendance_confirmation'}
                                    type={Enum.APPOINTMENT_TYPE.BACK_TAKE_ATTENDANCE}
                                    patientInfo={patientInfo}
                                    confirmationInfo={appointmentConfirmInfo}
                                    patientStatusList={patientStatusList}
                                    isDateBack
                                />
                                :
                                <AttendanceDetail
                                    id={'back_take_'}
                                    currentAppointment={currentAppointment}
                                    patientStatusList={patientStatusList}
                                    patientStatus={patientStatus}
                                    patientStatusFlag={patientStatusFlag}
                                    discNum={discNum}
                                    isNep={isNep}
                                    nepRemark={nepRemark}
                                    clinicConfig={clinicConfig}
                                    handleChange={this.handleChange}
                                    patientSvcExist={patientSvcExist}
                                    caseIndicator={caseIndicator}
                                // confirmECSEligibility={confirmECSEligibility}
                                />
                        }
                    </ValidatorForm>
                </Grid>
                {
                    markArrivalDialogOpen ?
                        <MarkArrivalDialog
                            id={'markArrivalDialog'}
                            open={this.props.markArrivalDialogOpen}
                            refreshAttendancePage={this.refreshAttendancePage}
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
                            id={'attendance_payment_message_dialog'}
                            paymentMsgDialogParams={paymentMsgDialogParams}
                            handlePaymentMsgDialogOk={this.handlePaymentMsgDialogOk}
                        />
                        : null
                }
                {
                    this.props.serviceCd === 'EHS' && this.state.confirmAtndDialogOpen ?
                        <ConfirmAtndDialog
                            id={'confirm_back_take_attendance'}
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
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        accessRights: state.login.accessRights,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        patientStatusList: state.backTakeAttendance.patientStatusList,
        patientStatus: state.backTakeAttendance.patientStatus,
        patientStatusFlag: state.backTakeAttendance.patientStatusFlag,
        discNum: state.backTakeAttendance.discNum,
        isAttend: state.backTakeAttendance.isAttend,
        patientInfo: state.patient.patientInfo,
        appointmentInfo: state.patient.appointmentInfo,
        caseNoInfo: state.patient.caseNoInfo,
        clinicCd: state.login.clinic.clinicCd,
        clinicConfig: state.common.clinicConfig,
        appointmentList: state.backTakeAttendance.appointmentList,
        currentAppointment: state.backTakeAttendance.currentAppointment,
        appointmentConfirmInfo: state.backTakeAttendance.appointmentConfirmInfo,
        ecsChkId: state.ecs.selectedPatientEcsStatus.chkEcsId,
        restlChkId: state.ecs.selectedPatientOcsssStatus.restlChkId,
        clinic: state.login.clinic,
        isNep: state.backTakeAttendance.isNep,
        nepRemark: state.backTakeAttendance.nepRemark,
        markArrivalDialogOpen: state.backTakeAttendance.markArrivalDialogOpen,
        doCloseBackUp: state.backTakeAttendance.doCloseBackUp,
        doCloseCallback: state.backTakeAttendance.doCloseCallback,
        caseIndicator: state.backTakeAttendance.caseIndicator,
        confirmECSEligibility: state.backTakeAttendance.confirmECSEligibility,
        patientSvcExist: state.backTakeAttendance.patientSvcExist,
        loginUserRoleList: state.common.loginUserRoleList,
        subTabs: state.mainFrame.subTabs,
        dateBackFamilyMemberData:  state.bookingInformation.dateBackFamilyMemberData,
        selectedDateBackFamilyMember:  state.bookingInformation.selectedDateBackFamilyMember,
        isRedirectByPatientList: state.bookingInformation.isRedirectByPatientList
    };
};

const mapDispatchToProps = {
    updateField,
    openCommonMessage,
    openCaseNoDialog,
    getRegPatientById,
    getPatientPanelPatientById,
    getRedesignPatientAppointment,
    getPatientEncounter,
    listAppointmentList,
    backTakeAttendance,
    resetAll,
    getEncounterTypeList,
    deleteSubTabs,
    getCodeList,
    loadEncounterInfo,
    refreshServiceStatus,
    printPatientGumLabel,
    printSPPGumLabel,
    printEHSGumLabel,
    updateCurTab,
    checkPatientSvcExist,
    auditAction,
    refreshPatient,
    skipTab,
    closeCommonMessage,
    changeTabsActive,
    updateMainFrame,
    updateLastCheckDate
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(BackTakeAttendance));