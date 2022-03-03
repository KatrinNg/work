import * as editTimeSlotType from './editTimeSlotActionType';

export const resetAll = () => {
    return {
        type: editTimeSlotType.RESET_ALL
    };
};

export const initCodeList = (encounterTypeList) => {
    return {
        type: editTimeSlotType.INIT_CODE_LIST,
        encounterTypeList
    };
};

export const updateState = (updateData) => {
    return {
        type: editTimeSlotType.UPDATE_STATE,
        updateData
    };
};

export const listTimeslot = (params) => {
    return {
        type: editTimeSlotType.LIST_TIME_SLOT,
        params
    };
};

export const insertTimeSlot = (params, searchParams) => {
    return {
        type: editTimeSlotType.INSERT_TIME_SLOT,
        params,
        searchParams
    };
};

export const updateTimeSlot = (params, searchParams) => {
    return {
        type: editTimeSlotType.UPDATE_TIME_SLOT,
        params,
        searchParams
    };
};

export const deleteTimeSlot = (params, searchParams) => {
    return {
        type: editTimeSlotType.DELETE_TIME_SLOT,
        params,
        searchParams
    };
};

export const multipleUpdate = (params, searchParams, callback) => {
    return {
        type: editTimeSlotType.MULTIPLE_UPDATE,
        params,
        searchParams,
        callback
    };
};