import * as searchAppointmentActionType from './searchAppointmentActionType';

export const getRoomList = (params) => {
    return {
        type: searchAppointmentActionType.GET_ROOM_LIST,
        params
    };
};

export const getEncounterTypeList = (params) => {
    return {
        type: searchAppointmentActionType.GET_ENCOUNTER_TYPE_LIST,
        params
    };
};

export const resetAll = (params) => {
    return {
        type: searchAppointmentActionType.RESET_ALL,
        params
    };
};

export const resetEncounterTypeList = () => {
    return {
        type: searchAppointmentActionType.RESET_ENCOUNTER_TYPE_LIST
    };
};

export const getAppointmentList = (params, callback = null) => {
    return {
        type: searchAppointmentActionType.GET_APPOINTMENT_LIST,
        params,
        callback
    };
};

export const getAppointmentListReport = (params, callback = null) => {
    return {
        type: searchAppointmentActionType.GET_APPOINTMENT_LIST_REPORT,
        params,
        callback
    };
};

export const setSelectedRoomList = (params) => {
    return {
        type: searchAppointmentActionType.SET_SELECTED_ROOM_LIST,
        params
    };
};

export const setSelectedEncounterTypeList = (params) => {
    return {
        type: searchAppointmentActionType.SET_SELECTED_ENCOUNTER_TYPE_LIST,
        params
    };
};

export const setCalendarDetailStartDate = (params) => {
    return {
        type: searchAppointmentActionType.SET_CALENDAR_DETAIL_START_DATE,
        params
    };
};

export const setCalendarDetailEndDate = (params) => {
    return {
        type: searchAppointmentActionType.SET_CALENDAR_DETAIL_END_DATE,
        params
    };
};
export const setWithinClosePeriod = (params) => {
    return {
        type: searchAppointmentActionType.SET_WITHIN_CLOSE_PERIOD,
        params
    };
};