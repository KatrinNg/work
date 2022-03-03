import * as type from '../../actions/ECS/ecsActionType';
import * as actions from '../../actions/ECS/ecsAction';
import _ from 'lodash';
import Enums from '../../../enums/enum';
import * as EcsUtilities from '../../../utilities/ecsUtilities';
import * as ecsSelectors from '../../selectors/ecsSelectors';
export const initSelectedPatientEcsStatus = {
    hkId: '',
    dob: '',
    dobEstd: '',
    translatedName: '',
    svrInt1: '',
    svrOrg1: '',
    eligiblePerson1: '',
    eligibleStaff1: '',
    inServe1: '',
    eligibleMedical1: '',
    eligibleDental1: '',
    svrInt2: '',
    svrOrg2: '',
    eligiblePerson2: '',
    eligibleStaff2: '',
    inServe2: '',
    eligibleMedical2: '',
    eligibleDental2: '',
    englishName: '',
    isAssoicated: false,
    originalHkid:'',
    patientEcsId: -1,
    isValid: false,
    lastCheckedTime: '',
    isInitState: true,
    ecsChkId: null,
    ecsShcekingResult:[]
};

export  const initSelectedPatientOcsssStatus = {
    checkingResult: '',
    errorMessage: null,
    messageId: '',
    replyDateTime: '',
    originalHkid: '',
    patientOcsssId: -1,
    isValid: false,
    lastCheckedTime: '',
    isInitState: true,
    restlChkId: null
};

export  const initSelectedPatientMwecsStatus = {
    messageId: '',
    result: '',
    recipientName: null,
    eligStartDate: '',
    eligEndDate: '',
    swdResponseDt: '',
    responseDt: '',
    errorCode: null,
    errorMessage: '',
    originalDocNo:'',
    patientMwecsId: -1,
    isValid: false,
    lastCheckedTime: '',
    isInitState: true,
    medWaiverChkId: null
};

export const initMwecsDialogInput = {
    idType: '',
    idNum: ''
};

export const initEcsDialogInput = {

};

export const initOcsssDialogInput = {

};

const initState = {
    ecsServiceStatus: false,
    ocsssServiceStatus: false,
    mwecsServiceStatus: false,
    shouldRegPageClearResult: false,
    codeList: {},
    regSummaryEcsStatus:_.cloneDeep(initSelectedPatientEcsStatus),
    regSummaryOcsssStatus:_.cloneDeep(initSelectedPatientOcsssStatus),
    regSummaryMwecsStatus:_.cloneDeep(initSelectedPatientMwecsStatus),
    patientSummaryEcsStatus:_.cloneDeep(initSelectedPatientEcsStatus),
    patientSummaryOcsssStatus:_.cloneDeep(initSelectedPatientOcsssStatus),
    patientSummaryMwecsStatus:_.cloneDeep(initSelectedPatientMwecsStatus),
    selectedPatientEcsStatus:_.cloneDeep(initSelectedPatientEcsStatus),
    selectedPatientOcsssStatus:_.cloneDeep(initSelectedPatientOcsssStatus),
    selectedPatientMwecsStatus:_.cloneDeep(initSelectedPatientMwecsStatus),
    mwecsDialogInput: _.cloneDeep(initMwecsDialogInput),
    ecsDialogInput: _.cloneDeep(initEcsDialogInput),
    ocsssDialogInput: _.cloneDeep(initOcsssDialogInput),

    openDialog:null,
    activeComponent:null,

    showEcsBtnInBooking: false,
    ecsCheckingResult:[],
    spaActionType: { ...type },
    spaAction: { ...actions },
    spaUtils: { ...EcsUtilities },
    spaSelectors: { ...ecsSelectors }
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case type.SET_STATUS: {
            return {
                ...state,
                ecsServiceStatus: action.data.ecsServiceStatus,
                ocsssServiceStatus: action.data.ocsssServiceStatus,
                mwecsServiceStatus: action.data.mwecsServiceStatus,
                showEcsBtnInBooking: action.data.showEcsBtnInBooking
            };
        }
        case type.SET_ECS_PATIENT_STATUS: {
            return {
                ...state,
                selectedPatientEcsStatus: action.ecsPatientStatus
            };
        }
        case type.SET_OCSSS_PATIENT_STATUS: {
            return {
                ...state,
                selectedPatientOcsssStatus: action.ocsssPatientStatus
            };
        }
        case type.SET_MWECS_PATIENT_STATUS: {
            return {
                ...state,
                selectedPatientMwecsStatus: action.mwecsPatientStatus
            };
        }
        case type.SET_REG_ECS_PATIENT_STATUS: {
            return {
                ...state,
                regSummaryEcsStatus: action.ecsPatientStatus
            };
        }
        case type.SET_REG_OCSSS_PATIENT_STATUS: {
            return {
                ...state,
                regSummaryOcsssStatus: action.ocsssPatientStatus
            };
        }
        case type.SET_REG_MWECS_PATIENT_STATUS: {
            return {
                ...state,
                regSummaryMwecsStatus: action.mwecsPatientStatus
            };
        }
        case type.SET_PATIENT_SUMMARY_ECS_PATIENT_STATUS: {
            return {
                ...state,
                patientSummaryEcsStatus: action.ecsPatientStatus
            };
        }
        case type.SET_PATIENT_SUMMARY_OCSSS_PATIENT_STATUS: {
            return {
                ...state,
                patientSummaryOcsssStatus: action.ocsssPatientStatus
            };
        }
        case type.SET_PATIENT_SUMMARY_MWECS_PATIENT_STATUS: {
            return {
                ...state,
                patientSummaryMwecsStatus: action.mwecsPatientStatus
            };
        }
        case type.PUT_GET_CODE_LIST: {
            return { ...state, codeList: action.codeList };
        }
        case type.SET_REG_PAGE_RESET_FLAG:{
            return {...state, shouldRegPageClearResult: action.payload};
        }
        case type.SET_ECS_OPEN_DIALOG:{
            return {...state,openDialog: action.payload?Enums.ECS_DIALOG_TYPES.ecs:null};
        }
        case type.SET_ECS_ACTIVE:{
            return {...state,activeComponent:action.payload?Enums.ECS_DIALOG_TYPES.ecs:null};
        }
        case type.SET_MWECS_OPEN_DIALOG:{
            return {...state,openDialog: action.payload?Enums.ECS_DIALOG_TYPES.mwecs:null};
        }
        case type.SET_MWECS_ACTIVE:{
            return {...state,activeComponent:action.payload?Enums.ECS_DIALOG_TYPES.mwecs:null};
        }
        case type.SET_ECS_INPUT:{
            return {...state, ecsDialogInput: action.inputParams};
        }
        case type.SET_OCSSS_INPUT:{
            return {...state, ocsssDialogInput: action.inputParams};
        }
        case type.SET_MWECS_INPUT:{
            return {...state, mwecsDialogInput:action.inputParams};
        }
        case type.SET_ECS_RESULT:{
            return {...state,ecsCheckingResult:action.ecsResult};
        }

        default:
            return state;
    }
};