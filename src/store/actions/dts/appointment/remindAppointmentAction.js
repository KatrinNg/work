import * as remindAppointmentActionType from './remindAppointmentActionType';

export const resetLocationEncounter = () => {
    return {
        type: remindAppointmentActionType.RESET_LOCATION_ENCOUNTER
    };
};

export const resetAll = () => {
    return {
        type: remindAppointmentActionType.RESET_ALL
    };
};

export const getRoomOfficer = (params) => {
    return {
        type: remindAppointmentActionType.GET_ROOM_OFFICER,
        params
    };
};

export const getCalendarDetailDate = (params) => {
return {
    type: remindAppointmentActionType.GET_CALENDAR_DETAIL_DATE1,
    params
};
};
export const setCalendarDetailDate = (params) => {
return {
    type: remindAppointmentActionType.SET_CALENDAR_DETAIL_DATE1,
    params
};
};

export const getCalendarDetailDate1 = (params) => {
    return {
        type: remindAppointmentActionType.GET_CALENDAR_DETAIL_DATE1,
        params
    };
};
export const setCalendarDetailDate1 = (params) => {
    return {
        type: remindAppointmentActionType.SET_CALENDAR_DETAIL_DATE1,
        params
    };
};

export const getCalendarDetailDate2 = (params) => {
    return {
        type: remindAppointmentActionType.GET_CALENDAR_DETAIL_DATE2,
        params
    };
};
export const setCalendarDetailDate2 = (params) => {
    return {
        type: remindAppointmentActionType.SET_CALENDAR_DETAIL_DATE2,
        params
    };
};

export const setSelectedClinic = (params) => {
    return {
        type:remindAppointmentActionType.SET_SELECTED_CLINIC,
        params
    };
};

export const getRoomList = (params) => {
    return {
        type: remindAppointmentActionType.GET_ROOM_LIST,
        params
    };
};

export const setSelectedRoomList = (params) => {
    return {
        type:remindAppointmentActionType.SET_SELECTED_ROOM_LIST,
        params
    };
};

export const getServeRoom = (params, callback) => {
    return {
        type: remindAppointmentActionType.GET_SERVE_ROOM,
        params,
        callback
    };
};

export const getOnlyNeedReminder = (params) => {
    return {
        type: remindAppointmentActionType.GET_ONLY_NEED_REMINDER,
        params
    };
};
export const setOnlyNeedReminder = (params) => {
    return {
        type:remindAppointmentActionType.SET_ONLY_NEED_REMINDER,
        params
    };
};

export const getRemindAppointmentList = (params) => {
    return {
        type: remindAppointmentActionType.GET_REMIND_APPOINTMENT_LIST,
        params
    };
};

/*
    Below for Contact History Dialog
*/
export const getContactHistoryList = (params) => {
    return {
        type: remindAppointmentActionType.GET_CONTACT_HISTORY_LIST,
        params
    };
};

export const getReminderTemplate = (siteId, commMeansCd = null, status = null) => {
    return {
        type: remindAppointmentActionType.GET_REMINDER_TEMPLATE,
        siteId,
        commMeansCd,
        status
    };
};

// export const getContactHistoryTelNotesCode = (params, callback) => {
//     return {
//         type: remindAppointmentActionType.GET_TEL_NOTES_CODE,
//         params,
//         callback
//     };
// };

//export const insertContactHistory = (params, appointmentId, contactType, callback = null) => {
export const insertContactHistory = (params, callback = null) => {
    return {
        type: remindAppointmentActionType.INSERT_CONTACT_HISTORY,
        params,
        //appointmentId,
        //contactType,
        callback
    };
};

export const insertContactHistories = (params, callback = null) => {
    return {
        type: remindAppointmentActionType.INSERT_CONTACT_HISTORIES,
        params,
        callback
    };
};

export const updateContactHistory = (params, callback = null) => {
    return {
        type: remindAppointmentActionType.UPDATE_CONTACT_HISTORY,
        params,
        callback
    };
};

export const deleteContactHistory = (params, callback = null) => {
    return {
        type: remindAppointmentActionType.DELETE_CONTACT_HISTORY,
        params,
        callback
    };
};

export const resetContactHistory = () => {
    return {
        type: remindAppointmentActionType.RESET_CONTACT_HISTORY_DIALOG
    };
};

export const getRemindAppointmentListReport = (params) => {
    return {
        type: remindAppointmentActionType.GET_REMIND_APPOINTMENT_LIST_REPORT,
        params
    };
};

export const resetRemindAppointmentListReport = () => {
    return {
        type: remindAppointmentActionType.RESET_REMIND_APPOINTMENT_LIST_REPORT
    };
};

export const setRemindAppointmentListReport = (updateData) => {
    return {
        type:remindAppointmentActionType.SET_REMIND_APPOINTMENT_LIST_REPORT,
        updateData
    };
};

export const setSelectedRooms = (params) => {
    return {
        type:remindAppointmentActionType.SET_SELECTED_ROOMS,
        params
    };
};
export const setSelectedDateStart = (params) => {
    return {
        type:remindAppointmentActionType.SET_SELECTED_DATE_START,
        params
    };
};
export const setSelectedDateEnd = (params) => {
    return {
        type:remindAppointmentActionType.SET_SELECTED_DATE_END,
        params
    };
};
