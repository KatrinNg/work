import * as type from './yellowFeverActionType';

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

export const saveAndPrintYellowFeverLetter = (params, callback, copies) => {
    return {
        type: type.SAVE_AND_PRINT_LETTER,
        params,
        callback,
        copies
    };
};

export const listYellowFeverExemptCertificates = (params, callback) => {
    return {
        type: type.LIST_YELLOWFEVER_EXEMPT_CERTIFICATES,
        params,
        callback
    };
};

export const updateYellowFeverExemptCertificate = (params, callback) => {
    return {
        type: type.UPDATE_YELLOWFEVER_EXEMPT_CERTIFICATE,
        params,
        callback
    };
};

export const deleteYellowFeverExemptCertificate = (params, callback) => {
    return {
        type: type.DELETE_YELLOWFEVER_EXEMPT_CERTIFICATE,
        params,
        callback
    };
};