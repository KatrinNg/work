import * as type from './vaccineCertActionType';

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

export const saveAndPrintVaccineCert = (params, callback, copies) => {
    return {
        type: type.SAVE_AND_PRINT_CERT,
        params,
        callback,
        copies
    };
};

export const listVaccineCertificates = (params, callback) => {
    return {
        type: type.LIST_VACCINE_CERT,
        params,
        callback
    };
};

export const updateVaccineCertificate = (params,callback) => {
    return {
        type: type.UPDATE_VACCINE_CERT,
        params,
        callback
    };
};