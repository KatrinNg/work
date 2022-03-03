import * as CTPTypes from './ctpActionType';

export const ctpSummary = (rfrPara, flwupPara, hlthEduRcmdPara, callback = null) => {
    return {
        type: CTPTypes.CTP_SUMAMRY,
        rfrPara,
        flwupPara,
        hlthEduRcmdPara,
        callback
    };
};

export const resetAll = () => {
    return {
        type: CTPTypes.RESET_ALL
    };
};

export const updateField = (updateData) => {
    return {
        type: CTPTypes.UPDATE_FIELD,
        updateData
    };
};

export const ctrlCreateAndUpdateDialog = (status) => {
    return {
        type: CTPTypes.CTRL_CREATE_AND_UPDATE_DIALOG,
        status
    };
};

export const listReferralLetter = (params) => {
    return {
        type: CTPTypes.LIST_REFERRAL_LETTER,
        params
    };
};

export const listFollowUp = (params) => {
    return {
        type: CTPTypes.LIST_FOLLOW_UP,
        params
    };
};

export const listHlthEduRcmd = (params) => {
    return {
        type: CTPTypes.LIST_HLTH_EDU_RCMD,
        params
    };
};

export const previewRfrLetter = (params, callback = null) => {
    return {
        type: CTPTypes.PREVIE_RFR_LETTER,
        params,
        callback
    };
};

export const getTodayEncntrCTP = (encntrId) => {
    return {
        type: CTPTypes.GET_CTP_BY_TODAY_ENCNTR,
        encntrId
    };
};

export const submitTdCTP = (params, hasTdCTP, callback = null) => {
    return {
        type: CTPTypes.SUBMIT_TODAY_CTP_DATA,
        params,
        hasTdCTP,
        callback
    };
};
