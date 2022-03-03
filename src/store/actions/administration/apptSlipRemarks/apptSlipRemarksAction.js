import * as types from './apptSlipRemarksActionType';

export const resetAll = () => {
    return {
        type: types.RESET_ALL
    };
};

export const listApptSlipRemarks = (params, callback) => {
    return {
        type: types.LIST_APPTSLIPREMARKS,
        params: params,
        callback
    };
};

export const updateField = (updateData) => {
    return (dispatch, getState) => {
        dispatch({
            type: types.UPDATE_FIELD,
            updateData
        });
        return Promise.resolve();
    };
};

export const submitApptSlipRemarks = (params, callback = null) => {
    return {
        type: types.SUBMIT_APPTSLIPREMARKS,
        params,
        callback
    };
};

export const deleteApptSlipRemarks = (params, callback = null) => {
    return {
        type: types.DELETE_APPTSLIPREMARKS,
        params,
        callback
    };
};

export const getApptSlipReport = (params, callback = null) => {
    return {
        type: types.GET_APPTSLIP_REPORT,
        params,
        callback
    };
};

export const getEncounterTypeListBySite = (params, callback, isNeedCheckValidEnct = true) => {
    return {
        type: types.GET_ENCOUNTER_TYPE_LIST_BY_SITE,
        params,
        callback,
        isNeedCheckValidEnct
    };
};