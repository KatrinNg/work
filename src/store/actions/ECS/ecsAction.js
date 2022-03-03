import * as ecsActionType from './ecsActionType';
import * as messageAction from '../message/messageAction';

export const refreshServiceStatus = () => {
    return {
        type: ecsActionType.REFRESH_STATUS
    };
};

export const checkEcs = (params, hkic, callback, callbackAction) => {
    return {
        type: ecsActionType.CHECK_ECS,
        hkic,
        params,
        callback,
        callbackAction
    };
};

export const checkOcsss = (params, callback,callbackAction) => {
    return {
        type: ecsActionType.CHECK_OCSSS,
        params,
        callback,
        callbackAction
    };
};

export const checkMwecs = (params, callback, callbackAction) => {
    return {
        type: ecsActionType.CHECK_MWECS,
        params,
        callback,
        callbackAction
    };
};

export const setEcsPatientStatusInRegPage = (ecsPatientStatus) => {
    return {
        type: ecsActionType.SET_REG_ECS_PATIENT_STATUS,
        ecsPatientStatus: ecsPatientStatus
    };
};

export const setOcsssPatientStatusInRegPage = (ocsssPatientStatus) => {
    return {
        type: ecsActionType.SET_REG_OCSSS_PATIENT_STATUS,
        ocsssPatientStatus: ocsssPatientStatus
    };
};

export const setMwecsPatientStatusInRegPage = (mwecsPatientStatus) => {
    return {
        type: ecsActionType.SET_REG_MWECS_PATIENT_STATUS,
        mwecsPatientStatus: mwecsPatientStatus
    };
};

export const setEcsPatientStatusInPatientSummary = (ecsPatientStatus) => {
    return {
        type: ecsActionType.SET_PATIENT_SUMMARY_ECS_PATIENT_STATUS,
        ecsPatientStatus: ecsPatientStatus
    };
};

export const setOcsssPatientStatusInPatientSummary = (ocsssPatientStatus) => {
    return {
        type: ecsActionType.SET_PATIENT_SUMMARY_OCSSS_PATIENT_STATUS,
        ocsssPatientStatus: ocsssPatientStatus
    };
};

export const setMwecsPatientStatusInPatientSummary = (mwecsPatientStatus) => {
    return {
        type: ecsActionType.SET_PATIENT_SUMMARY_MWECS_PATIENT_STATUS,
        mwecsPatientStatus: mwecsPatientStatus
    };
};

export const setEcsPatientStatus = (ecsPatientStatus) => {
    return {
        type: ecsActionType.SET_ECS_PATIENT_STATUS,
        ecsPatientStatus: ecsPatientStatus
    };
};

export const setOcsssPatientStatus = (ocsssPatientStatus) => {
    return {
        type: ecsActionType.SET_OCSSS_PATIENT_STATUS,
        ocsssPatientStatus: ocsssPatientStatus
    };
};

export const setMwecsPatientStatus = (mwecsPatientStatus) => {
    return {
        type: ecsActionType.SET_MWECS_PATIENT_STATUS,
        mwecsPatientStatus: mwecsPatientStatus
    };
};


export const resetEcsPatientStatus = (resetType) => {
    return {
        type: ecsActionType.RESET_ECS_PATIENT_STATUS,
        resetType: resetType
    };
};

export const resetOcsssPatientStatus = (resetType) => {
    return {
        type: ecsActionType.RESET_OCSSS_PATIENT_STATUS,
        resetType: resetType
    };
};

export const resetMwecsPatientStatus = (resetType) => {
    return {
        type: ecsActionType.RESET_MWECS_PATIENT_STATUS,
        resetType:resetType
    };
};

export const resetRegPageResult = () => {
    return {
        type: ecsActionType.SET_REG_PAGE_RESET_FLAG,
        payload: true
    };
};

export const completeRegPageReset = () => {
    return {
        type: ecsActionType.SET_REG_PAGE_RESET_FLAG,
        payload: false
    };
};

export const openOcsssDialog = (params, callback, callbackAction, checkAction) => {
    return {
        type: ecsActionType.OPEN_OCSSS_DIALOG,
        callback: callback,
        params: params,
        callbackAction: callbackAction,
        checkAction:checkAction
    };
};

export const openEcsDialog = (inputParams, callback, callbackAction) => {
    return {
        type: ecsActionType.OPEN_ECS_DIALOG,
        callback: callback,
        inputParams: inputParams,
        callbackAction: callbackAction
    };
};


export const closeEcsDialog = (callback) => {
    return {
        type: ecsActionType.CLOSE_ECS_DIALOG,
        callback: callback
    };
};


export const openMwecsDialog = (params, callback, callbackAction) => {
    return {
        type: ecsActionType.OPEN_MWECS_DIALOG,
        callback: callback,
        params: params,
        callbackAction: callbackAction
    };
};


export const closeMwecsDialog = (callback) => {
    return {
        type: ecsActionType.CLOSE_MWECS_DIALOG,
        callback: callback
    };
};

export const setMwecsOpenDialog = (payload) => {
    return {
        type: ecsActionType.SET_MWECS_OPEN_DIALOG,
        payload: payload
    };
};

export const setMwecsActive = (payload) => {
    return {
        type: ecsActionType.SET_MWECS_ACTIVE,
        payload: payload
    };
};

export const setEcsOpenDialog = (payload) => {
    return {
        type: ecsActionType.SET_ECS_OPEN_DIALOG,
        payload: payload
    };
};

export const setEcsActive = (payload) => {
    return {
        type: ecsActionType.SET_ECS_ACTIVE,
        payload: payload
    };
};

export const setEcsInput = (inputParams) => {
    return {
        type: ecsActionType.SET_ECS_INPUT,
        inputParams: inputParams
    };
};

export const setOcsssInput = (inputParams) => {
    return {
        type: ecsActionType.SET_OCSSS_INPUT,
        inputParams: inputParams
    };
};

export const setMwecsInput = (inputParams) => {
    return {
        type: ecsActionType.SET_MWECS_INPUT,
        inputParams: inputParams
    };
};

export const regPageKeyFieldOnBlur = () => {
    return {
        type: ecsActionType.REG_PAGE_KEY_FIELD_ON_BLUR
    };
};

export const setEcsCheckingResult=(ecsResult)=>{
    return {
        type:ecsActionType.SET_ECS_RESULT,
        ecsResult
    };
};

export const selectTwinsRec=(ecsResult,patientKey,lastCheckedTime,benefitType,callback,callbackAction)=>{
    return {
        type:ecsActionType.SELECT_TWINS_RECORD,
        ecsResult,
        patientKey,
        lastCheckedTime,
        benefitType,
        callback,
        callbackAction
    };
};