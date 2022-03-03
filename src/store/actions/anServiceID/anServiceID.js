
const PRE = 'ANT_SVC_ID_INFO';

export const UPDATE_STATE = `${PRE}_UPDATE_STATE`;
export const RESET_ALL = `${PRE}_RESET_ALL`;
export const GET_DELIVERY_HOSPITAL = `${PRE}_GET_DELIVERY_HOSPITAL`;
export const PUT_DELIVERY_HOSPITAL = `${PRE}_PUT_DELIVERY_HOSPITAL`;
export const GET_CASE_STS_CHANGE_REASONS = `${PRE}_GET_CASE_STS_CHANGE_REASONS`;
export const PUT_CASE_STS_CHANGE_REASONS = `${PRE}_PUT_CASE_STS_CHANGE_REASONS`;
export const SAVE_AN_SERVICE_ID_INFO = `${PRE}_SAVE_AN_SERVICE_ID_INFO`;
export const MODIFY_AN_SERVICE_ID_INFO = `${PRE}_MODIFY_AN_SERVICE_ID_INFO`;
export const LIST_ANT_SVC_ID_INFO_LOG=`${PRE}_LIST_ANT_SVC_ID_INFO_LOG`;


export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};


export const updateState = (updateData) => {
    return {
        type: UPDATE_STATE,
        updateData
    };
};

export const getDeliveryHospital = (params, callback) => {
    return {
        type: GET_DELIVERY_HOSPITAL,
        params,
        callback
    };
};

export const getCaseStsChangeRsns = (params, callback) => {
    return {
        type: GET_CASE_STS_CHANGE_REASONS,
        params,
        callback
    };
};


export const saveAntSvcInfo = (params, callback) => {
    return {
        type: SAVE_AN_SERVICE_ID_INFO,
        params,
        callback
    };
};


export const modifyAnSvcIdInfo = (params, callback) => {
    return {
        type: MODIFY_AN_SERVICE_ID_INFO,
        params,
        callback
    };
};

export const listAntSvcIDInfoLog=(params,callback)=>{
    return {
        type:LIST_ANT_SVC_ID_INFO_LOG,
        params,
        callback
    };
};
