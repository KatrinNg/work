import * as reportTemplateActionType from './reportTemplateActionType';

export const resetAll = () => {
    return {
        type: reportTemplateActionType.RESET_ALL
    };
};

export const requestData = (dataType, params, fileData) => {
    return {
        type: reportTemplateActionType.REQUEST_DATA,
        dataType,
        params,
        fileData
    };
};

export const postData = (dataType, params, callback) => {
    return {
        type: reportTemplateActionType.POST_DATA,
        dataType,
        params,
        callback
    };
};

export const putData = (dataType, params, callback) => {
    return {
        type: reportTemplateActionType.PUT_DATA,
        dataType,
        params,
        callback
    };
};

export const deleteData = (dataType, params, callback) => {
    return {
        type: reportTemplateActionType.DELETE_DATA,
        dataType,
        params,
        callback
    };
};

export const updateField = (updateData) => {
    return {
        type: reportTemplateActionType.UPDATE_FIELD,
        updateData
    };
};

export const fillingData = (fileData) => {
    return {
        type: reportTemplateActionType.FILLING_DATA,
        ...fileData
    };
};

export const openPreviewWindow = (params) => {
    return {
        type: reportTemplateActionType.OPEN_PREVIEW_WINDOW,
        params
    };
};

export const getDynamicFormParameterByApi = (dataType, params, callback) => {
    return {
        type: reportTemplateActionType.GET_DYNAMIC_FORM_PARAMETER_API,
        dataType,
        params,
        callback
    };
};

export const jobLogPolling = (params, callback) => {
    return {
        type: reportTemplateActionType.JOB_LONG_POLLING,
        params,
        callback
    };
};

