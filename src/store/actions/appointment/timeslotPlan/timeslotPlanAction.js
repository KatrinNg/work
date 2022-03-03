import * as timeslotPlanActionType from './timeslotPlanActionType';

export const resetAll = (params) => {
    return {
        type: timeslotPlanActionType.RESET_ALL
    };
};

export const updateState = (updateData) => {
    return {
        type: timeslotPlanActionType.UPDATE_STATE,
        updateData
    };
};

export const listTimeslotPlanHdrBySite = (params) => {
    return {
        type: timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SITE,
        params
    };
};

export const listTimeslotPlanHdrByService = (params) => {
    return {
        type: timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SERVICE,
        params
    };
};

export const getTimeslotPlan = (tmsltPlanHdrId) => {
    return {
        type: timeslotPlanActionType.GET_TIMESLOT_PLAN,
        tmsltPlanHdrId
    };
};

export const getTimeslotPlanWeekday = (tmsltPlanHdrId) => {
    return {
        type: timeslotPlanActionType.GET_TIMESLOT_PLAN_WEEKDAY,
        tmsltPlanHdrId
    };
};

export const getOtherTimeslotPlanWeekday = (tmsltPlanHdrId) => {
    return {
        type: timeslotPlanActionType.GET_OTHER_TIMESLOT_PLAN_WEEKDAY,
        tmsltPlanHdrId
    };
};

export const createTimeslotPlanHdr = (params, listParams) => {
    return {
        type: timeslotPlanActionType.CREATE_TIMESLOT_PLAN_HDR,
        params,
        listParams
    };
};

export const updateTimeslotPlanHdr = (params, listParams) => {
    return {
        type: timeslotPlanActionType.UPDATE_TIMESLOT_PLAN_HDR,
        params,
        listParams
    };
};

export const deleteTimeslotPlanHdr = (groupId, listParams) => {
    return {
        type: timeslotPlanActionType.DELETE_TIMESLOT_PLAN_HDR,
        groupId,
        listParams
    };
};

export const closeTimeslotPlanHdrDialog = () => {
    return {
        type: timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_HDR_DIALOG
    };
};

export const createTimeslotPlan = (groupId, weekday, params, listParams) => {
    return {
        type: timeslotPlanActionType.CREATE_TIMESLOT_PLAN,
        groupId,
        weekday,
        params,
        listParams
    };
};

export const updateTimeslotPlan = (tmsltPlanHdrId, params, listParams) => {
    return {
        type: timeslotPlanActionType.UPDATE_TIMESLOT_PLAN,
        tmsltPlanHdrId,
        params,
        listParams
    };
};

export const closeTimeslotPlanDialog = () => {
    return {
        type: timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_DIALOG
    };
};