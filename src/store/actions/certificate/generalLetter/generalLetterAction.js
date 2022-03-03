import * as type from './generalLetterActionType';

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

export const getGeneralLetter = (params, callback, copies, isPreview) => {
    return {
        type: type.GET_GENERALLETTER_CERT,
        params,
        callback,
        copies,
        isPreview
    };
};

export const listGeneralLetter = (params, callback) => {
    return {
        type: type.LIST_GENERALLETTER_CERT,
        params,
        callback
    };
};

export const deleteGeneralLetter = (params, callback) => {
    return {
        type: type.DELETE_GENERALLETTER_CERT,
        params,
        callback
    };
};

export const updateGeneralLetter=(params,callback)=>{
    return{
        type:type.UPDATE_GENERALLETTER_CERT,
        params,
        callback
    };
};