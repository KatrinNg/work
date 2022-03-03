import * as type from './bookingAnonymousActionType';

export const resetInfoAll = () => {
    return {
        type: type.RESET_INFO_ALL
    };
};

export const appointmentBook = (params) => {
    return {
        type: type.APPOINTMENT_BOOK,
        params
    };
};

export const resetReplaceAppointment = () => {
    return {
        type: type.RESET_REPLACE_APPOINTMENT
    };
};

// reset Squeeze & UrgSqueeze for Booking
export const resetSqueeze = () => {
    return {
        type:type.RESET_SQUEEZE
    };
};

// Set the Urg Squeeze for Booking
export const putUrgSqueeze = () => {
    return {
        type:type.PUT_URG_SQUEEZE
    };
};

// Set the Squeeze for Booking
export const putSqueeze = () => {
    return {
        type:type.PUT_SQUEEZE
    };
};


export const listTimeSlot = (params) => {
    return {
        type: type.LIST_TIMESLOT,
        params
    };
};

export const initAnonBookingData = (passData) => {
    return {
        type: type.INIT_ANON_BOOKING_DATA,
        passData
    };
};

export const replaceOldAppointmnet = (params, callback) => {
    return {
        type: type.REPLACE_OLD_APPOINTMNET_BOOK_CONFIRM,
        params,
        callback
    };
};

export const stillAppointmentsBookConfirm = (params, callback) => {
    return {
        type: type.STILL_APPOINTMENTS_BOOK_CONFIRM,
        params,
        callback
    };
};
export const bookAnonymousConfirm = (params, checkBookingRuleParams, callback) => {
    return {
        type: type.BOOK_CONFIRM,
        params,
        checkBookingRuleParams,
        callback
    };
};

export const bookConfirmWaiting = (params, checkBookingRuleParams,callback) => {
    return {
        type: type.BOOK_CONFIRM_WAITING,
        params,
        checkBookingRuleParams,
        callback
    };
};

export const updateState = (updateData) => {
    return (dispatch, getState) => {
        dispatch({
            type: type.UPDATE_STATE,
            updateData
        });
        return Promise.resolve();
    };
};


export const getAppointmentReport = (params) => {
    return {
        type: type.GET_APPOINTMENT_REPORT,
        params
    };
};

export const updateAnonymousAppointment = (params, callback = null) => {
    return {
        type: type.UPDATE_ANONYMOUS_APPOINTMENT,
        params,
        callback
    };
};

export const cancelAndConfirmAnonymousAppointment = (params, callback = null) => {
    return {
        type: type.CANCEL_CONFIRM_ANONYMOUS_APPOINTMENT,
        params,
        callback
    };
};

export const searchPatientList = (params, countryList = [],callback=null) => {
    return {
        type: type.SEARCH_PATIENT_LIST,
        params,
        countryList,
        callback
    };
};

export const updateField = (fields) => {
    return {
        type: type.UPDATE_FIELD,
        fields
    };
};


//re anonymous appointment
export const reAnonymousAppointment=(params,callback)=>{
    return {
        type:type.RE_ANONYMOUS_APPOINTMNET,
        params,
        callback
    };
};

export const deleteAnonymousAppointment = (params, callback = null) => {
    return {
        type: type.DELETE_ANONYMOUS_APPOINTMENT,
        params,
        callback
    };
};

export const resetAnonymousBookingData = () => {
    return {
        type: type.PUT_BOOK_SUCCESS
    };
};

export const getEncounterTypeListBySite = (serviceCd, siteId, callback) => {
    return {
        type: type.GET_ENCOUNTER_TYPE_LIST_BY_SITE,
        serviceCd: serviceCd,
        siteId: siteId,
        callback
    };
};

export const getSessionList = (siteId, callback) =>{
    return {
        type: type.GET_ANONYMOUS_SESSIONSLIST,
        siteId: siteId,
        callback
    };
};