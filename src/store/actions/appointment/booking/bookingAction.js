import * as bookingActionType from './bookingActionType';

export const resetInfoAll = () => {
    return {
        type: bookingActionType.RESET_INFO_ALL
    };
};

export const getBookingMaximumTimeslot = (encntrTypeId, callBack = null) => {
    return {
        type: bookingActionType.GET_BOOKING_MAXIMUM_TIMESLOT,
        encntrTypeId,
        callBack
    };
};

export const appointmentBook = (params) => {
    return {
        type: bookingActionType.APPOINTMENT_BOOK,
        params
    };
};

export const checkBookingRule = (params, callback) => {
    return {
        type: bookingActionType.CHECK_BOOKING_RULE,
        params,
        callback
    };
};

export const getEncounterTypeListBySite = (serviceCd, siteId, callback) => {
    return {
        type: bookingActionType.GET_ENCOUNTER_TYPE_LIST_BY_SITE,
        serviceCd: serviceCd,
        siteId: siteId,
        callback
    };
};

export const resetReplaceAppointment = () => {
    return {
        type: bookingActionType.RESET_REPLACE_APPOINTMENT
    };
};

export const listTimeSlot = (params) => {
    return {
        type: bookingActionType.LIST_TIMESLOT,
        params
    };
};

export const listAppointmentHistory = (params, callback = null) => {
    return {
        type: bookingActionType.LIST_APPOINTMENT_HISTORY,
        params,
        callback
    };
};

export const replaceOldAppointmnet = (params, callback) => {
    return {
        type: bookingActionType.REPLACE_OLD_APPOINTMNET_BOOK_CONFIRM,
        params,
        callback
    };
};

export const stillAppointmentsBookConfirm = (params, callback) => {
    return {
        type: bookingActionType.STILL_APPOINTMENTS_BOOK_CONFIRM,
        params,
        callback
    };
};

export const bookConfirm = (params, checkBookingRuleParams, callback) => {
    return {
        type: bookingActionType.BOOK_CONFIRM,
        params,
        checkBookingRuleParams,
        callback
    };
};
export const bookConfirmWaiting = (params, checkBookingRuleParams, callback) => {
    return {
        type: bookingActionType.BOOK_CONFIRM_WAITING,
        params,
        checkBookingRuleParams,
        callback
    };
};

export const updateState = (updateData) => {
    return (dispatch, getState) => {
        dispatch({
            type: bookingActionType.UPDATE_STATE,
            updateData
        });
        return Promise.resolve();
    };
};

export const updateContHistState = (updateData) => {
    return {
        type: bookingActionType.UPDATE_CONTACT_HISTORY_STATE,
        updateData
    };
};

export const updateSpecReqState = (updateData) => {
    return {
        type: bookingActionType.UPDATE_SPEC_REQ_STATE,
        updateData
    };
};

export const getAppointmentReport = (params) => {
    return {
        type: bookingActionType.GET_APPOINTMENT_REPORT,
        params
    };
};

export const getSppApptSlipReport = (params) => {
    return {
        type: bookingActionType.GET_SPP_APP_SLIP_REPORT,
        params
    };
};

export const walkInAttendance = (params, bookingData, walkInInfo, callback) => {
    return {
        type: bookingActionType.WALK_IN_ATTENDANCE,
        params,
        bookingData,
        walkInInfo,
        callback
    };
};

export const bookAndAttendSuccess = () => {
    return {
        type: bookingActionType.BOOK_AND_ATTEND_SUCCEESS
    };
};

export const listRemarkCode = () => {
    return {
        type: bookingActionType.LIST_REMARK_CODE
    };
};

export const cancelAppointment = (apptPara) => {
    return {
        type: bookingActionType.CANCEL_APPOINTMENT,
        apptPara
    };
};

export const deleteAppointment = (params, listParams) => {
    return {
        type: bookingActionType.DELETE_APPOINTMENT,
        params,
        listParams
    };
};

export const selectAppointment = (selectedData) => {
    return {
        type: bookingActionType.TRIGGER_SELECT_APPOINTMENT,
        selectedData
    };
};

export const editAppointment = (selectedData) => {
    return {
        type: bookingActionType.EDIT_APPOINTMENT,
        selectedData
    };
};

export const cancelEditAppointment = () => {
    return {
        type: bookingActionType.CANCEL_EDIT_APPOINTMENT
    };
};

export const submitUpdateAppointment = ({ updateApptPara, updateOrBookNew, callback }) => {
    return {
        type: bookingActionType.SUBMIT_UPDATE_APPOINTMENT,
        updateApptPara,
        updateOrBookNew,
        callback
    };
};

export const init_bookingData = (bookData,cartData) => {
    return {
        type: bookingActionType.INIT_BOOKING_DATA,
        bookData,
        cartData
    };
};

export const listContatHistory = (apptId, callback = null) => {
    return {
        type: bookingActionType.GET_CONTACT_HISTORY,
        apptId,
        callback
    };
};

export const insertContatHistory = (params, callback = null) => {
    return {
        type: bookingActionType.INSERT_CONTACT_HISTORY,
        params,
        callback
    };
};

export const updateContatHistory = (params, callback = null) => {
    return {
        type: bookingActionType.UPDATE_CONTACT_HISTORY,
        params,
        callback
    };
};

export const clearContactList = () => {
    return {
        type: bookingActionType.CLEAR_CONTACT_HISTORY
    };
};

export const getReminderTemplate = (siteId, commMeansCd = null, status = null) => {
    return {
        type: bookingActionType.GET_REMINDER_TEMPLATE,
        siteId,
        commMeansCd,
        status
    };
};

export const listReminderList = (apptInfo, callback = null) => {
    return {
        type: bookingActionType.LIST_REMINDER_LIST,
        apptInfo,
        callback
    };
};

export const submitApptReminder = (params, pageAction, callback) => {
    return {
        type: bookingActionType.SUBMIT_APPOINTMENT_REMINDER,
        params,
        // curPageStatus,
        pageAction,
        callback
    };
};

export const deleteApptReminder = (params, callback) => {
    return {
        type: bookingActionType.DELETE_APPOINTMENT_REMINDER,
        params,
        callback
    };
};

export const sendApptReminderInfo = (params, callback) => {
    return {
        type: bookingActionType.SEND_APPOINTMENT_REMINDER,
        params,
        callback
    };
};

export const listSpecReqTypes = (params) => {
    return {
        type: bookingActionType.LIST_SPECREQ_TYPES,
        params
    };
};

export const listSpecReq = (params, callback) => {
    return {
        type: bookingActionType.LIST_SPECREQ,
        params,
        callback
    };
};

export const insertSpecReq = (params, callback) => {
    return {
        type: bookingActionType.INSERT_SPECREQ,
        params,
        callback
    };
};
export const updateSpecReq = (params, callback) => {
    return {
        type: bookingActionType.UPDATE_SPECREQ,
        params,
        callback
    };
};

export const getRescheduleReasons = () => {
    return {
        type: bookingActionType.GET_RESCHEDULE_REASONS
    };
};

export const updatePmiData = (name, value) => {
    return {
        type: bookingActionType.UPDATE_PMI_DATA,
        name,
        value
    };
};

export const anonymousAppointmentPmiLinkage = (params, callback = null) => {
    return {
        type: bookingActionType.PUT_ANONYMOUS_APPOINTMENT_PMILINKAGE,
        params,
        callback
    };
};

export const getRoomUtilization = (params) => {
    return {
        type: bookingActionType.GET_ROOM_UTILIZATION,
        siteId: params.siteId,
        slotDate: params.slotDate
    };
};

export const reAppointment = ({ params, callback }) => {
    return {
        type: bookingActionType.REAPPOINTMENT,
        params,
        callback
    };
};

export const checkPatientSvcExist = (params, callback) => {
    return {
        type: bookingActionType.CHECKPATIENTSVCEXIST,
        params,
        callback
    };
};

export const getSessionList = ({ siteId }) => {
    return {
        type: bookingActionType.GET_SESSION_LIST,
        siteId
    };
};

export const listEncntrCaseRsn = (params, callback) => {
    return {
        type: bookingActionType.LIST_ENCNTR_CASE_RSN,
        params,
        callback
    };
};

export const checkApptWithEncntrCaseStatus = (params, callback) => {
    return {
        type: bookingActionType.CHECK_APPOINTMENT_WITH_ENCOUNTER_CASE,
        params,
        callback
    };
};

export const logShsEncntrCase = (params, callback) => {
    return {
        type: bookingActionType.LOG_SHS_ENCNTR_CASE,
        params,
        callback
    };
};

export const getFamilyMember = () => {
    return {
        type: bookingActionType.GET_FAMILY_MEMBER
    };
};

export const getFamilyBooking = (patient, callback) => {
    return {
        type: bookingActionType.GET_FAMILY_BOOKING,
        patient,
        callback
    };
};

export const getApptListRpt = (params, callback) => {
    return {
        type: bookingActionType.GET_APPT_LIST_RPT,
        params,
        callback
    };
};

export const sppMultipleBooking = (params, callback) => {
    return {
        type: bookingActionType.MULTIPLE_SEARCH_AVAIL_TIME_SLOT,
        params,
        callback
    };
};

export const updateAppointmentListCart=(params,mode,callback)=>{
    return {
        type:bookingActionType.UPDATE_APPOINTMENT_LIST_CART,
        params,
        mode,
        callback
    };
};