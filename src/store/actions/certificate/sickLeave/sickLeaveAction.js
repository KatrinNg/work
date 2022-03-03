import * as type from './sickLeaveActionType';

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

export const getSickLeaveCert = (params, callback, copies, isPreview, isFitPage, printQue) => {
    return {
        type: type.GET_SICK_LEAVE_CERT,
        params,
        callback,
        copies,
        isPreview,
        isFitPage,
        printQue
    };
};

export const listLeaveCertificates = (params, callback) => {
    return {
        type: type.LIST_LEAVE_CERTIFICATES,
        params,
        callback
    };
};

export const updateLeaveCertificate = (params, callback) => {
    return {
        type: type.UPDATE_LEAVE_CERTIFICATE,
        params,
        callback
    };
};


export const deleteLeaveCert = (params, callback) => {
    return {
        type: type.DELETE_LEAVE_CERTIFICATES,
        params,
        callback
    };
};