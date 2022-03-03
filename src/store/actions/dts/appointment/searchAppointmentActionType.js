const PREFFIX = 'DTS_SEARCH_APPOINTMENT_VIEW';

//GET
export const GET_ROOM_LIST = `${PREFFIX}_GET_ROOM_LIST`;
export const GET_ENCOUNTER_TYPE_LIST = `${PREFFIX}_GET_ENCOUNTER_TYPE_LIST`;
export const GET_APPOINTMENT_LIST = `${PREFFIX}_GET_APPOINTMENT_LIST`;
export const GET_APPOINTMENT_LIST_REPORT = `${PREFFIX}_GET_APPOINTMENT_LIST_REPORT`;

//RESET
export const RESET_ALL = `${PREFFIX}_RESET_ALL`;
export const RESET_ENCOUNTER_TYPE_LIST = `${PREFFIX}_RESET_ENCOUNTER_TYPE_LIST`;
export const RESET_APPOINTMENT_LIST_REPORT = `${PREFFIX}_RESET_APPOINTMENT_LIST_REPORT`;

//SAGA
export const GET_ROOM_LIST_SAGA = `${PREFFIX}_GET_ROOM_LIST_SAGA`;
export const GET_ENCOUNTER_TYPE_LIST_SAGA = `${PREFFIX}_GET_ENCOUNTER_TYPE_LIST_SAGA`;
export const GET_APPOINTMENT_LIST_SAGA = `${PREFFIX}_GET_APPOINTMENT_LIST_SAGA`;
export const GET_APPOINTMENT_LIST_REPORT_SAGA = `${PREFFIX}_GET_APPOINTMENT_LIST_REPORT_SAGA`;

//SET
export const SET_SELECTED_ENCOUNTER_TYPE_LIST = `${PREFFIX}_SET_SELECTED_ENCOUNTER_TYPE_LIST`;
export const SET_SELECTED_ROOM_LIST = `${PREFFIX}_SET_SELECTED_ROOM_LIST`;
export const SET_CALENDAR_DETAIL_START_DATE = `${PREFFIX}_SET_CALENDAR_DETAIL_START_DATE`;
export const SET_CALENDAR_DETAIL_END_DATE = `${PREFFIX}_SET_CALENDAR_DETAIL_END_DATE`;
export const SET_WITHIN_CLOSE_PERIOD = `${PREFFIX}_SET_WITHIN_CLOSE_PERIOD`;