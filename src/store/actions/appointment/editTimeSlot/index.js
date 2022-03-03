const PRE = 'TIMESLOT_MANAGEMENT';

export const RESET_ALL = `${PRE}_RESET_ALL`;
export const UPDATE_STATE = `${PRE}_UPDATE_STATE`;
export const GET_TIMESLOT_LIST = `${PRE}_GET_TIMESLOT_LIST`;
export const PUT_LIST_TIME_SLOT = `${PRE}_PUT_LIST_TIME_SLOT`;
export const INSERT_TIMESLOT = `${PRE}_INSERT_TIMESLOT`;
export const UPDATE_TIMESLOT = `${PRE}_UPDATE_TIMESLOT`;
export const RESET_DIALOGINFO =`${PRE}_RESET_DIALOGINFO`;
export const DELETE_TIMESLOT = `${PRE}_DELETE_TIMESLOT`;
export const MULTI_UPDATE_SAVE = `${PRE}_MULTI_UPDATE_SAVE`;

export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};

export const resetDialogInfo = () => {
    return {
        type: RESET_DIALOGINFO
    };
};

export const updateState = (updateData) => {
    return {
        type: UPDATE_STATE,
        updateData
    };
};

export const listTimeslot = (params, callback) => {
    return {
        type: GET_TIMESLOT_LIST,
        params,
        callback
    };
};

export const insertTimeSlot = (params,callback=null)=>{
    return {
        type: INSERT_TIMESLOT,
        params,
        callback
    };
};

export const updateTimeSlot = (params,callback=null)=>{
    return {
        type: UPDATE_TIMESLOT,
        params,
        callback
    };
};

export const deleteTimeSlot = (id,callback=null)=>{
    return {
        type: DELETE_TIMESLOT,
        id,
        callback
    };
};

export const multiUpdateSave = (funcName, params, callback) => {
    return {
        type: MULTI_UPDATE_SAVE,
        funcName,
        params,
        callback
    };
};