import * as eHRActionType from './eHRActionType';

export const eHRIdentityOpenDialog = () => {
    return {
        type: eHRActionType.OPEN_EHR_IDENTITY_DIALOG
    };
};


export const getEHRIdentity = (EHRIdentityData, eHREhrisUrl, callBack = null) => {
    return {
        type: eHRActionType.GET_EHR_EPMI,
        EHRIdentityData,
        eHREhrisUrl,
        callBack
    };
};

export const getUpdateFromEHRDate = (updateValue) => {
    return {
        type: eHRActionType.GET_FROM_EHR_DATE,
        value: updateValue
    };
};

export const closeEHRIdentityDialog = (callBack = null) => {
    return {
        type: eHRActionType.CLOSE_EHR_IDENTITY_DIALOG,
        callBack
    };
};

export const eHRresetAll = () => {
    return {
        type: eHRActionType.RESET_ALL
    };
};

export const keepEHRState = () => {
    return {
        type: eHRActionType.KEEP_EHR_STATE
    };
};

export const updatePatient = (params, loginName, pcName, ipAddr, callback=null) => {
    return {
        type: eHRActionType.UPDATE_PATIENT,
        params: params,
        loginName: loginName,
        pcName: pcName,
        ipAddr: ipAddr,
        callback
    };
};

export const updateEHRPatientStatus = (params) => {
    return {
        type: eHRActionType.UPDATE_EHR_PATIENT_STATUS,
        params: params
    };
};
