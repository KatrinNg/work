import * as types from './clientServiceViewActionType';

export const resetAll = () => {
    return {
        type: types.RESET_ALL
    };
};

export const updateField = (updateData) => {
    return {
        type: types.UPDATE_FIELD,
        updateData
    };
};

export const listThsCharges = () => {
    return {
        type: types.LIST_THS_CHARGES
    };
};

export const listCsnHistory = (patientKey, callback) => {
    return {
        type: types.LIST_RCP_CSN_HISTORY,
        patientKey,
        callback
    };
};

export const updateRcpCsnRemark = (params, callback = null) => {
    return {
        type: types.UPDATE_RCP_CSN_REMARK,
        params,
        callback
    };
};


export const submitRcpCsn = (params, callback = null) => {
    return {
        type: types.SUBMIT_RCP_SCN,
        params,
        callback
    };
};

export const getRcpCsnItem = (params, callback) => {
    return {
        type: types.GET_RCP_CSN_ITEM,
        params,
        callback
    };
};


export const printCSV = (params) => {
    return {
        type: types.PRINT_CSV,
        params
    };
};