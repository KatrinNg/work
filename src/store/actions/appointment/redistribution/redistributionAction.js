const PREFFIX = 'REDISTRIBUTION';
export const GET_ROOM_UTILIZATION = `${PREFFIX}_GET_ROOM_UTILIZATION`;
export const SEARCH_APPT_DETAILS = `${PREFFIX}_SEARCH_APPT_DETAILS`;
export const UPDATE_STATE = `${PREFFIX}_UPDATE_STATE`;
export const RESET_ALL = `${PREFFIX}_RESET_ALL`;
export const RESET_APPT_DETAILS = `${PREFFIX}_RESET_APPT_DETAILS`;
export const CONFIRM_REDISTRIBUTION = `${PREFFIX}_CONFIRM_REDISTRIBUTION`;

export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};

export const resetApptDetails = () => {
    return {
        type: RESET_APPT_DETAILS
    };
};

export const updateState = (updateData) => {
    return {
        type: UPDATE_STATE,
        updateData
    };
};

export const getRoomUtilization = (params) => {
    return {
        type: GET_ROOM_UTILIZATION,
        siteId: params.siteId,
        slotDate: params.slotDate
    };
};

export const searchApptDetails = (params) => {
    return {
        type: SEARCH_APPT_DETAILS,
        role: params.role,
        criteria: params.criteria
    };
};

export const confirmRedistribution = (params) => {
    return {
        type: CONFIRM_REDISTRIBUTION,
        params
    };
};