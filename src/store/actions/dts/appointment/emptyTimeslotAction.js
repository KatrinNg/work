import * as emptyTimeslotActionType from './emptyTimeslotActionType';

export const getEmptyTimeslotList = (params,callback = null) => {
    return {
        type: emptyTimeslotActionType.GET_EMPTY_TIMESLOT_LIST,
        params,callback
    };
};

export const setSelectedClinic = (params) => {
    return {
        type: emptyTimeslotActionType.SET_SELECTED_CLINIC,
        params
    };
};

export const getRoomList = (params) => {
    return {
        type: emptyTimeslotActionType.GET_ROOM_LIST,
        params
    };
};

export const setSelectedRoomList = (params) => {
    return {
        type: emptyTimeslotActionType.SET_SELECTED_ROOM_LIST,
        params
    };
};

export const setCalendarDetailDate1 = (params) => {
    return {
        type: emptyTimeslotActionType.SET_CALENDAR_DETAIL_DATE1,
        params
    };
};

export const setCalendarDetailDate2 = (params) => {
    return {
        type: emptyTimeslotActionType.SET_CALENDAR_DETAIL_DATE2,
        params
    };
};

export const setSelectedEmptyTimeslotList = (params) => {
    return {
        type: emptyTimeslotActionType.SET_SELECTED_EMPTY_TIMESLOT_LIST,
        params
    };
};

export const resetAll = () => {
    return {
        type: emptyTimeslotActionType.RESET_ALL
    };
};

export const getUnavailableAppointments = (roomId, from, to) => {
    return {
        type: emptyTimeslotActionType.GET_UNAVAILABLE_APPOINTMENTS,
        params: {roomId, from, to}
    };
};

export const getReserveList = (roomId, from, to) => {
    return {
        type: emptyTimeslotActionType.GET_RESERVE_LIST,
        params: {roomId, from, to}
    };
};

export const getUnavailableAppointmentsSuccess = (appointments) => {
    return {
        type: emptyTimeslotActionType.GET_UNAVAILABLE_APPOINTMENTS_SUCCESS,
        params: appointments
    };
};

export const getReserveListSuccess = (appointments) => {
    return {
        type: emptyTimeslotActionType.GET_RESERVE_LIST_SUCCESS,
        params: appointments
    };
};

export const setSelectedEmptyTimeslot = (timeslot) => {
    return {
        type: emptyTimeslotActionType.SET_SELECTED_EMPTY_TIMESLOT,
        params: timeslot
    };
};

export const setSelectedAppointment = (appointment) => {
    return {
        type: emptyTimeslotActionType.SET_SELECTED_APPOINTMENT,
        params: appointment
    };
};

export const setRedirect = params => {
    return {
        type: emptyTimeslotActionType.SET_REDIRECT,
        params
    };
};

export const dtsUpdateState = updateData => {
    return {
        type: emptyTimeslotActionType.UPDATE_STATE,
        updateData
    };
};

export const getReserveListReport = (params, callback = null) => {
    return {
        type: emptyTimeslotActionType.GET_RESERVE_LIST_REPORT,
        params,
        callback
    };
};
