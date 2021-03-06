const PREFFIX = 'APPOINTMENT_BOOKING_CALENDAR_VIEW';
export const RESET_INFO_ALL = `${PREFFIX}_RESET_INFO_ALL`;
export const APPOINTMENT_BOOK = `${PREFFIX}_APPOINTMENT_BOOK`;
export const LIST_TIMESLOT = `${PREFFIX}_LIST_TIMESLOT`;
export const LIST_APPOINTMENT_HISTORY = `${PREFFIX}_LIST_APPOINTMENT_HISTORY`;
export const STILL_APPOINTMENTS_BOOK_CONFIRM = `${PREFFIX}_STILL_APPOINTMENTS_BOOK_CONFIRM`;
export const REPLACE_OLD_APPOINTMNET_BOOK_CONFIRM = `${PREFFIX}_REPLACE_OLD_APPOINTMNET_BOOK_CONFIRM`;
export const BOOK_CONFIRM = `${PREFFIX}_BOOK_CONFIRM`;
export const BOOK_CONFIRM_WAITING = `${PREFFIX}_BOOK_CONFIRM_WAITING`;
export const UPDATE_STATE = `${PREFFIX}_UPDATE_STATE`;
export const UPDATE_CONTACT_HISTORY_STATE = `${PREFFIX}_UPDATE_CONTACT_HISTORY_STATE`;
export const GET_APPOINTMENT_REPORT = `${PREFFIX}_GET_APPOINTMENT_REPORT`;
export const GET_SPP_APP_SLIP_REPORT = `${PREFFIX}_GET_SPP_APP_SLIP_REPORT`;
export const WALK_IN_ATTENDANCE = `${PREFFIX}_WALK_IN_ATTENDANCE`;
export const BOOK_AND_ATTEND_SUCCEESS = `${{ PREFFIX }}_BOOK_AND_ATTENN_SUCCESS`;
export const LIST_REMARK_CODE = `${PREFFIX}_LIST_REMARK_CODE`;
export const GET_ENCOUNTER_TYPE_LIST_BY_SITE = `${PREFFIX}_GET_ENCOUNTER_TYPE_LIST_BY_SITE`;
export const GET_BOOKING_MAXIMUM_TIMESLOT = `${PREFFIX}_GET_BOOKING_MAXIMUM_TIMESLOT`;

//saga put
export const PUT_LIST_TIMESLOT_DATA = `${PREFFIX}_PUT_LIST_TIMESLOT_DATA`;
export const PUT_TIMESLOT_DATA = `${PREFFIX}_PUT_TIMESLOT_DATA`;
export const PUT_LIST_APPOINTMENT_HISTORY = `${PREFFIX}_PUT_LIST_APPOINTMENT_HISTORY`;

// export const PUT_BOOK_SUCCESS = `${PREFFIX}_PUT_BOOK_SUCCESS`;

export const REDESIGN_PUT_BOOK_SUCCESS = `${PREFFIX}_REDESIGN_PUT_BOOK_SUCCESS`;

export const PUT_BOOK_FAIL = `${PREFFIX}_PUT_BOOK_FAIL`;
export const PUT_LIST_REMARK_CODE = `${PREFFIX}_PUT_LIST_REMARK_CODE`;
export const PUT_DEFAULT_CASETYPECD = `${PREFFIX}_PUT_DEFAULT_CASETYPECD`;
export const PUT_ENCOUNTER_TYPE_LIST_BY_SITE = `${PREFFIX}_PUT_ENCOUNTER_TYPE_LIST_BY_SITE`;

//cancel appointment
export const CANCEL_APPOINTMENT = `${PREFFIX}_CANCEL_APPOINTMENT`;

//delete appointment (new API)
export const DELETE_APPOINTMENT = `${PREFFIX}_DELETE_APPOINTMENT`;

//edit appointment
export const EDIT_APPOINTMENT = `${PREFFIX}_EDIT_APPOINTMENT`;
export const CANCEL_EDIT_APPOINTMENT = `${PREFFIX}_CANCEL_EDIT_APPOINTMENT`;
export const SUBMIT_UPDATE_APPOINTMENT = `${PREFFIX}_SUBMIT_UPDATE_APPOINTMENT`;
export const BOOK_ANOTHER_APPOINTMENT = `${PREFFIX}_BOOK_ANOTHER_APPOINTMENT`;
export const UPDATE_APPOINTMENT_SUCCESS = `${PREFFIX}_UPDATE_APPOINTMENT_SUCCESS`;
// export const OPEN_CANCEL_EDIT_APPOINTMENT_QUESTION_DIALOG=`${PREFFIX}_OPEN_CANCEL_EDIT_APPOINTMENT_QUESTION_DIALOG`;
// export const CLOSE_CANCEL_EDIT_APPOINTMENT_QUESTION_DIALOG=`${PREFFIX}_CLOSE_CANCEL_EDIT_APPOINTMENT_QUESTION_DIALOG`;
export const PUT_EDIT_APPOINTMENT = `${PREFFIX}_PUT_EDIT_APPOINTMENT`;

// appointment history
export const GET_CONTACT_HISTORY = `${PREFFIX}_GET_CONTACT_HISTORY`;
export const INSERT_CONTACT_HISTORY = `${PREFFIX}_INSERT_CONTACT_HISTORY`;
export const UPDATE_CONTACT_HISTORY = `${PREFFIX}_UPDATE_CONTACT_HISTORY`;
export const PUT_CONTACT_HISTORY = `${PREFFIX}_PUT_CONTACT_HISTORY`;
export const CLEAR_CONTACT_HISTORY = `${PREFFIX}_CLEAR_CONTACT_HISTORY`;

// reset booking form
export const INIT_BOOKING_DATA = `${PREFFIX}_RESET_BOOKING_FORM`;

// special request
export const UPDATE_SPEC_REQ_STATE = `${PREFFIX}_UPDATE_SPEC_REQ_STATE`;
export const LIST_SPECREQ_TYPES = `${PREFFIX}_LIST_SPECREQ_TYPES`;
export const PUT_SPECREQ_TYPES = `${PREFFIX}_PUT_SPECREQ_TYPES`;
export const LIST_SPECREQ = `${PREFFIX}_LIST_SPECREQ`;
export const INSERT_SPECREQ = `${PREFFIX}_INSERT_SPECREQ`;
export const UPDATE_SPECREQ = `${PREFFIX}_UPDATE_SPECREQ`;

//appointment reminder
export const GET_REMINDER_TEMPLATE=`${PREFFIX}_GET_REMINDER_TEMPLATE`;
export const PUT_REMINDER_TEMPLATE=`${PREFFIX}_PUT_REMINDER_TEMPLATE`;
export const SUBMIT_APPOINTMENT_REMINDER=`${PREFFIX}_APPOINTMENT_REMINDER`;
export const LIST_REMINDER_LIST=`${PREFFIX}_LIST_REMINDER_LIST`;
export const PUT_REMINDER_LIST=`${PREFFIX}_PUT_REMINDER_LIST`;
export const DELETE_APPOINTMENT_REMINDER=`${PREFFIX}_DELETE_APPOINTMENT_REMINDER`;
export const SEND_APPOINTMENT_REMINDER=`${PREFFIX}_SEND_APPOINTMENT_REMINDER`;

export const GET_RESCHEDULE_REASONS = `${PREFFIX}_GET_RESCHEDULE_REASONS`;
// Open the Replace Appointment
export const OPEN_REPLACE_APPOINTMENT = `${PREFFIX}_OPEN_REPLACE_APPOINTMENT`;
export const RESET_REPLACE_APPOINTMENT = `${PREFFIX}_RESET_REPLACE_APPOINTMENT`;
// This Check the some rule (e.g : Same Day, Duplicate Booking)
export const CHECK_BOOKING_RULE = `${PREFFIX}_CHECK_BOOKING_RULE`;


export const UPDATE_PMI_DATA = `${PREFFIX}_UPDATE_PMI_DATA`;
export const PUT_ANONYMOUS_APPOINTMENT_PMILINKAGE = `${PREFFIX}_PUT_ANONYMOUS_APPOINTMENT_PMILINKAGE`;

//multiple appointment confirm/still procceed/replace booking
export const MULTIPLE_BOOKING_CONFIRM = `${PREFFIX}_MULTIPLE_BOOKING_CONFIRM`;

//Room utilization data
export const GET_ROOM_UTILIZATION = `${PREFFIX}_GET_ROOM_UTILIZATION`;

//Select appointment
export const TRIGGER_SELECT_APPOINTMENT = `${PREFFIX}_TRIGGER_SELECT_APPOINTMENT`;

//ReAppointment
export const REAPPOINTMENT = `${PREFFIX}_REAPPOINTMENT`;

//checkPatientSvcExist
export const CHECKPATIENTSVCEXIST = `${PREFFIX}_CHECKPATIENTSVCEXIST`;

//Update session list
export const GET_SESSION_LIST = `${PREFFIX}_GET_SESSION_LIST`;

//SHS encounter case reason
export const LIST_ENCNTR_CASE_RSN = `${PREFFIX}_LIST_ENCNTR_CASE_RSN`;
export const CHECK_APPOINTMENT_WITH_ENCOUNTER_CASE=`${PREFFIX}_CHECK_APPOINTMENT_WITH_ENCOUNTER_CASE`;

//SHS encounter case reason log
export const LOG_SHS_ENCNTR_CASE = `${PREFFIX}_LOG_SHS_ENCNTR_CASE`;

// Family member
export const GET_FAMILY_MEMBER = `${PREFFIX}_GET_FAMILY_MEMBER`;

export const GET_FAMILY_BOOKING = `${PREFFIX}_GET_FAMILY_BOOKING`;

export const UPDATE_FAMILY_MEMBER = `${PREFFIX}_UPDATE_FAMILY_MEMBER`;

export const UPDATE_ATTN_FAMILY_MEMBER = `${PREFFIX}_UPDATE_ATTN_FAMILY_MEMBER`;

export const UPDATE_DATE_BACK_FAMILY_MEMBER = `${PREFFIX}_UPDATE_DATE_BACK_FAMILY_MEMBER`;

export const UPDATE_SELECTED_FAMILY_MEMBER = `${PREFFIX}_UPDATE_SELECTED_FAMILY_MEMBER`;

export const UPDATE_SELECTED_ATTN_FAMILY_MEMBER = `${PREFFIX}_UPDATE_SELECTED_ATTN_FAMILY_MEMBER`;

export const UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER = `${PREFFIX}_UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER`;

export const UPDATE_FAMILY_BOOKING_RESULT = `${PREFFIX}_UPDATE_FAMILY_BOOKING_RESULT`;

export const REDIRECT_BY_PATIENT_LIST = `${PREFFIX}_REDIRECT_BY_PATIENT_LIST`;

export const UPDATE_FAMILY_ATTN_BOOKING_RESULT = `${PREFFIX}_UPDATE_FAMILY_ATTN_BOOKING_RESULT`;

export const UPDATE_FAMILY_DATE_BACK_BOOKING_RESULT = `${PREFFIX}_UPDATE_FAMILY_DATE_BACK_BOOKING_RESULT`;

export const UPDATE_FAMILY_BOOKING_PARAM = `${PREFFIX}_UPDATE_FAMILY_BOOKING_PARAM`;


//get room appt list report
export const GET_APPT_LIST_RPT = `${PREFFIX}_GET_APPT_LIST_RPT`;

// multiple search first avail time slot
export const MULTIPLE_SEARCH_AVAIL_TIME_SLOT=`${PREFFIX}_MULTIPLE_SEARCH_AVAIL_TIME_SLOT`;
export const PUT_MULTIPLE_AVAIL_SLOT_DATA=`${PREFFIX}_PUT_MULTIPLE_AVAIL_SLOT_DATA`;
export const UPDATE_APPOINTMENT_LIST_CART=`${PREFFIX}_UPDATE_APPOINTMENT_LIST_CART`;
export const PUT_APPOINTMENT_LIST_CART=`${PREFFIX}_PUT_APPOINTMENT_LIST_CART`;

//SPP service multiple confirm booking
export const SPP_MULTIPLE_BOOKING_CONFIRM=`${PREFFIX}_SPP_MULTIPLE_BOOKING_CONFIRM`;
