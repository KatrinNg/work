import * as type from './referralLetterActionType';

export const resetAll = () => {
    return {
        type: type.RESET_ALL
    };
};

export const updateField = (updateData) => {
    return {
        type: type.UPDATE_FIELD,
        updateData
    };
};

export const getReferralLetter = (params, callback, copies, isPreview) => {
    return {
        type: type.GET_REFERRAL_LETTER_CERT,
        params,
        callback,
        copies,
        isPreview
    };
};

export const listReferralLetters = (params, callback) => {
    return {
        type: type.LIST_REFERRAL_LETTERS,
        params,
        callback
    };
};

export const updateReferralLetter = (params, callback) => {
    return {
        type: type.UPDATE_REFERRAL_LETTER,
        params,
        callback
    };
};

export const deleteRefferalLetter=(params, callback)=>{
    return {
        type: type.DELETE_REFERRAL_LETTER,
        params,
        callback
    };
};

export const getSaamPatientSummary = (callback) => {
    return {
        type: type.GET_SAAM_PATIENT_SUMMARY,
        callback
    };
};

export const getProblemText = (callback) => {
    return {
        type: type.GET_PROBLEM_TEXT,
        callback
    };
};

export const getClinicalNoteText = (callback) => {
    return {
        type: type.GET_CLINICALNOTE_TEXT,
        callback
    };
};

export const getDoseInstruction = (callback) => {
    return {
        type: type.GET_DOSEINSTRUCTION,
        callback
    };
};