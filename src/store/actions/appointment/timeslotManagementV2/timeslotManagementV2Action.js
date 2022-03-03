import * as type from './timeslotManagementV2ActionType';

export const reset = () => {
    return {
        type: type.RESET
    };
};

export const updateState = (newState) => {
    return {
        type: type.UPDATE_STATE,
        newState
    };
};

export const getTimeslotPlanHdrsV2 = (svcCd, siteId) => {
    return {
        type: type.GET_TIMESLOT_PLAN_HDRS_V2,
        svcCd,
        siteId
    };
};

export const createTimeslotPlanHdrV2 = (param, callback) => {
    return {
        type: type.CREATE_TIMESLOT_PLAN_HDR_V2,
        param,
        callback
    };
};

export const updateTimeslotPlanHdrV2 = (param, callback) => {
    return {
        type: type.UPDATE_TIMESLOT_PLAN_HDR_V2,
        param,
        callback
    };
};

export const deleteTimeslotPlanHdrV2 = (id, callback) => {
    return {
        type: type.DELETE_TIMELSOT_PLAN_HDR_V2,
        id,
        callback
    };
};

export const getTimeslotPlansV2 = (timeslotPlanHdrId) => {
    return {
        type: type.GET_TIMESLOT_PLANS_V2,
        timeslotPlanHdrId
    };
};

export const createTimeslotPlanV2 = (timeslotPlanHdrId, param, callback) => {
    return {
        type: type.CREATE_TIMESLOT_PLAN_V2,
        timeslotPlanHdrId,
        param,
        callback
    };
};

export const getPredefinedTimeslots = (svcCd) => {
    return {
        type: type.GET_PREDEFINED_TIMESLOTS,
        svcCd
    };
};

export const multipleUpdateTimeslotV2 = (param, callback) => {
    return {
        type: type.MULTIPLE_UPDATE_TIMESLOT_V2,
        param,
        callback
    };
};

export const getTimeslots = (param) => {
    return {
        type: type.GET_TIMESLOTS,
        param
    };
};
