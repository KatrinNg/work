import * as type from './maternityActionType';

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

export const getMaternityCert = (params, callback, copies) => {
    return {
        type: type.GET_MATERNITY_CERT,
        params,
        callback,
        copies
    };
};

export const listMaternityCert = (params, callback) => {
    return {
        type: type.LIST_MATERNITY_CERT,
        params,
        callback
    };
};

export const deleteMaternityCert = (params, callback) => {
    return {
        type: type.DELETE_MATERNITY_CERT,
        params,
        callback
    };
};

export const updateMaternityCert = (params, callback) => {
    return {
        type: type.UPDATE_MATERNITY_CERT,
        params,
        callback
    };
};