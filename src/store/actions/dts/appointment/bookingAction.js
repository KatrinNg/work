import * as bookingActionType from './bookingActionType';

export const getAvailableCalendarTimeSlot = (params, callback = null) => {
    return {
        type: bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT,
        params, callback
    };
};

export const getAvailableCalendarTimeSlotForExpress = (params, callback = null) => {
    return {
        type: bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT_EXPRESS,
        params, callback
    };
};

export const getAvailableCalendarDetailMth = (params, maskMode = false) => {
    return {
        type:bookingActionType.GET_CALENDAR_DETAIL_MTH,
        params,
        maskMode
    };
};


export const resetCalendarList = () => {
    return {
        type: bookingActionType.RESET_CALENDAR_LIST
    };
};

export const setCalendarDetailMth = params => {
    return {
        type: bookingActionType.SET_CALENDAR_DETAIL_MTH,
        params
    };
};

export const setAppointmentSearchPanelTabVal = params => {
    return {
        type: bookingActionType.SET_APPOINTMENT_SEARCH_PANEL_TAB_VAL,
        params
    };
};
export const getDailyView = params => {
    return {
        type: bookingActionType.GET_DAILY_VIEW,
        params
    };
};

export const getMultipleDailyViewForExpress = (params, callback = null) => {
    return {
        type: bookingActionType.GET_MULTIPLE_DAILY_VIEW_FOR_EXPRESS,
        params,
        callback
    };
};

// export const insertAppointment = (clinicCd, patientCd, roomCd, isSquuzeIn, isUrgent,
//     appointmentDate, startTime, endTime, specialReason, exemptReason) => {
export const insertAppointment = (params, callback = null) => {
    return {
        type: bookingActionType.INSERT_APPOINTMENT,
        params,
        callback
    };
};

export const insertUrgentAppointment =(params, callback = null) => {
    return {
        type: bookingActionType.INSERT_URGENT_APPOINTMENT,
        params,
        callback
    };
};

export const insertGpUrgentAppointment =(params, callback = null) => {
    return {
        type: bookingActionType.INSERT_GP_URGENT_APPOINTMENT,
        params,
        callback
    };
};

export const reassignUrgentAppointment =(params, callback = null) => {
    return {
        type: bookingActionType.REASSIGN_URGENT_APPOINTMENT,
        params,
        callback
    };
};

export const reassignUrgentAppointmentForGp =(params, callback = null) => {
    return {
        type: bookingActionType.REASSIGN_GP_URGENT_APPOINTMENT,
        params,
        callback
    };
};



export const rescheduleAppointment = (params, callback = null) => {
    return {
        type: bookingActionType.RESCHEDULE_APPOINTMENT,
        params,
        callback
    };
};

export const getPatientAppointment = (params, callback, callbackExtraParms) => {
    return {
        type: bookingActionType.GET_PATIENT_APPOINTMENT,
        params,
        callback,
        callbackExtraParms
    };
};
export const resetLocationEncounter = () => {
    return {
        type: bookingActionType.RESET_LOCATION_ENCOUNTER
    };
};
// export const getCalendarDetailDate = params => {
//     return {
//         type: bookingActionType.GET_CALENDAR_DETAIL_DATE,
//         params
//     };
// };
export const setCalendarDetailDate = params => {
    return {
        type: bookingActionType.SET_CALENDAR_DETAIL_DATE,
        params
    };
};

export const getRoomList = (params, callback = null) => {
    return {
        type: bookingActionType.GET_ROOM_LIST,
        params,
        callback
    };
};

export const getEncounterTypeList = (params, callback = null, searchFor = 'dtsLocationEncounterPanel') => {
    return {
        type: bookingActionType.GET_ENCOUNTER_TYPE_LIST,
        params,
        callback,
        searchFor
    };
};

export const getSessionList = params => {
    return {
        type: bookingActionType.GET_SESSION_LIST,
        params
    };
};

export const setSelectedClinic = params => {
    return {
        type: bookingActionType.SET_SELECTED_CLINIC,
        params
    };
};

export const setSelectedRoom = params => {
    return {
        type: bookingActionType.SET_SELECTED_ROOM,
        params
    };
};

export const setSelectedEncounterType = params => {
    return {
        type: bookingActionType.SET_SELECTED_ENCOUNTER_TYPE,
        params
    };
};

export const setDuration = duration => {
    return {
        type: bookingActionType.SET_DURATION,
        duration
    };
};

export const getDailyNote = params => {
    return {
        type: bookingActionType.GET_DAILY_NOTE,
        params
    };
};

// export const setDailyNote = params => {
//     return {
//         type: bookingActionType.SET_DAILY_NOTE,
//         params
//     };
// };

export const updateDailyNote = (params) => {
    return {
        type:bookingActionType.UPDATE_DAILY_NOTE,
        params
    };
};


export const resetDailyNote = () => {
    return {
        type:bookingActionType.RESET_DAILY_NOTE
    };
};

// export const getFilterMode = params => {
//     return {
//         type: bookingActionType.GET_FILTER_MODE,
//         params
//     };
// };

// export const setBookingMode = (params) => {
//     return {
//         type: bookingActionType.SET_BOOKING_MODE,
//         params
//     };
// };

export const setFilterMode = params => {
    return {
        type: bookingActionType.SET_FILTER_MODE,
        params
    };
};

export const getAvailableTimeSlot = (params,callback = null) => {
    return {
        type: bookingActionType.GET_AVAILABLE_TIME_SLOT_LIST,
        params,
        callback
    };
};

export const setSelectedDailyViewTimeslotList = (params, callback = null) => {
    return {
        type: bookingActionType.SET_SELECTED_DAILY_VIEW_TIMESLOT_LIST,
        params,
        callback
    };
};

export const resetSelectedDailyViewTimeslotList = () => {
    return {
        type: bookingActionType.RESET_SELECTED_DAILY_VIEW_TIMESLOT_LIST
    };
};

export const setSqueezeInMode = squeezeInMode => {
    return {
        type: bookingActionType.SET_SQUEEZE_IN_MODE,
        squeezeInMode
    };
};

export const setPageStatus = pageStatus => {
    return {
        type: bookingActionType.SET_PAGE_STATUS,
        pageStatus
    };
};

export const resetAll = () => {
    return {
        type: bookingActionType.RESET_ALL
    };
};

export const resetCalendarDetailDate = () => {
    return {
        type:bookingActionType.RESET_CALENDAR_DETAIL_DATE
    };
};

export const resetAvailableTimeSlotList = () => {
    return {
        type:bookingActionType.RESET_AVAILABLE_TIME_SLOT_LIST
    };
};

export const getUrgentRoomList = (params) => {
    return {
        type:bookingActionType.GET_URGENT_ROOM_LIST,
        params
    };
};

export const getGpUrgentRoomList = (params) => {
    return {
        type:bookingActionType.GET_GP_URGENT_ROOM_LIST,
        params
    };
};

export const setUnavailableGpUrgentRoomList = (params) => {
    return {
        type:bookingActionType.SET_UNAVAILABLE_GP_URGENT_ROOM_LIST,
        params
    };
};

export const resetUrgentRoomList = () => {
    return {
        type:bookingActionType.RESET_URGENT_ROOM_LIST
    };
};

export const resetGpUrgentRoomList = () => {
    return {
        type:bookingActionType.RESET_GP_URGENT_ROOM_LIST
    };
};

export const setSelectedRescheduleAppointment = (params) => {
    return {
        type: bookingActionType.SET_SELECTED_RESCHEDULE_APPOINTMENT,
        params
    };
};

export const restSelectedRescheduleAppointment = () => {
    return {
        type: bookingActionType.RESET_SELECTED_RESCHEDULE_APPOINTMENT
    };
};

export const setSelectedDayTimeslotList = (params) => {
    return {
        type: bookingActionType.SET_SELECTED_DAY_TIMESLOT_LIST,
        params
    };
};

export const getUnavailableReasons = (params) => {
    return {
        type:bookingActionType.GET_UNAVAILABLE_REASONS,
        params
    };
};

export const insertUnavailableTimeslot = (params, callback = null) => {
    return {
        type: bookingActionType.INSERT_UNAVAILABLE_TIMESLOT,
        params,
        callback
    };
};

export const setMultipleBookingMode = (params) => {
    return {
        type: bookingActionType.SET_MULTIPLE_BOOKING_MODE,
        params
    };
};

export const setExpressBookingMode = (params) => {
    return {
        type: bookingActionType.SET_EXPRESS_BOOKING_MODE,
        params
    };
};

export const setExpressEditMode = (params) => {
    return {
        type: bookingActionType.SET_EXPRESS_EDIT_MODE,
        params
    };
};

export const setExpressDateList = (params) => {
    return {
        type: bookingActionType.SET_EXPRESS_DATE_LIST,
        params
    };
};

export const deleteUnavailablePeriod = (params) => {
    return {
        type: bookingActionType.DELETE_UNAVAILABLE_PERIOD,
        params
    };
};

export const deleteAppointment = (params, callback = null) => {
    return {
        type: bookingActionType.DELETE_APPOINTMENT,
        params,
        callback
    };
};

export const setSelectedDeleteAppointment = (params) => {
    return {
        type: bookingActionType.SET_SELECTED_DELETE_APPOINTMENT,
        params
    };
};

export const setEmptyTimeslotDateList = (params, callback = null) => {
    return {
        type: bookingActionType.SET_EMPTY_TIMESLOT_DATE_LIST,
        params,
        callback
    };
};

export const setSelectedCloseTimeslot = (params) => {
    return {
        type: bookingActionType.SET_SELECTED_CLOSE_TIMESLOT,
        params
    };
};

export const resetSelectedCloseTimeslot = () => {
    return {
        type: bookingActionType.RESET_SELECTED_CLOSE_TIMESLOT
    };
};

export const saveToReserveList = (reserve, callback) => {
    return {
        type: bookingActionType.SAVE_TO_RESERVE_LIST,
        params: {reserve},
        callback
    };
};

export const removeFromReserveList = (reserve) => {
    return {
        type: bookingActionType.REMOVE_FROM_RESERVE_LIST,
        params: {reserve}
    };
};

export const getBookingAlert = (params, callback = null, maskMode = false) => {
    return {
        type:bookingActionType.GET_BOOKING_ALERT,
        params,
        callback,
        maskMode
    };
};

export const updateAppointment = (params, callback = null, maskMode = false) => {
    return {
        type: bookingActionType.UPDATE_APPOINTMENT,
        params,
        callback,
        maskMode
    };
};

export const setDailyViewNavigationHistory = (params) => {
    return {
        type:bookingActionType.SET_DAILY_VIEW_NAVIGATION_HISTORY,
        params
    };
};

export const getAppointmentLabel = (params, callback = null) => {
    return {
        type:bookingActionType.GET_APPOINTMENT_LABEL,
        params,
        callback
    };
};

export const getAppointmentLog = appointmentId => {
    return {
        type:bookingActionType.GET_APPOINTMENT_LOG,
        params: { appointmentId }
    };
};


export const setAppointmentLog = appointmentLog => {
    return {
        type:bookingActionType.SET_APPOINTMENT_LOG,
        params: appointmentLog
    };
};


export const getTimeslotLog = timeslotId => {
    return {
        type:bookingActionType.GET_TIMESLOT_LOG,
        params: { timeslotId }
    };
};


export const setTimeslotLog = timeslotLog => {
    return {
        type:bookingActionType.SET_TIMESLOT_LOG,
        params: timeslotLog
    };
};

export const setUtilizationMode = (params) => {
    return {
        type: bookingActionType.SET_UTILIZATION_MODE,
        params
    };
};
export const setAppointmentMessageObj = appointmentMessageObj => {
    return {
        type:bookingActionType.SET_APPOINTMENT_MESSAGE_OBJ,
        params: appointmentMessageObj
    };
};

export const getServeRoom = (params, callback = null) => {
    return {
        type: bookingActionType.GET_SERVE_ROOM,
        params,
        callback
    };
};

export const setIsUpdated = (params, callback = null) => {
    return {
        type: bookingActionType.SET_IS_UPDATED,
        params,
        callback
    };
};

export const getDisciplines = (siteId) => {
    return {
        type: bookingActionType.GET_DISCIPLINES,
        params: { siteId }
    };
};

export const setDisciplines = (disciplines) => {
    return {
        type: bookingActionType.SET_DISCIPLINES,
        params: disciplines
    };
};

export const getReferralList = (siteId, patientKey = null, callback = null) => {
    return {
        type: bookingActionType.GET_REFERRAL_LIST,
        params: { siteId, patientKey },
        callback
    };
};

export const setReferralList = (referralList) => {
    return {
        type: bookingActionType.SET_REFERRAL_LIST,
        params: referralList
    };
};

export const getReferralDefaultRoom = (siteId, patientKey) => {
    return {
        type: bookingActionType.GET_REFERRAL_DEFAULT_ROOM,
        params: { siteId, patientKey }
    };
};

export const setReferralShowAppointmentId = (referralShowAppointmentId) => {
    return {
        type: bookingActionType.SET_REFERRAL_SHOW_APPOINTMENT_ID,
        params: referralShowAppointmentId
    };
};
