import { maskAxios, axios } from '../axiosInstance';
import * as dtsUtilities from '../../utilities/dtsUtilities';
// import moment from 'moment';
// import Enum from '../../enums/enum';

const url = {
    appointment: '/dts-ana/appointments/appointmentList',
    attendances: '/dts-ana/attendances',
    avaliableCalendar: '/dts-ana/appointments/calendarView',
    avaliableCalendarExpress: '/dts-ana/appointments/calendarViewExpressMode',
    multipleDailyViewForExpress: '/dts-ana/clinicSurgery/dailyViewForExpress',
    serveRoom: '/dts-ana/clinicSurgery/{userId}/serveRoom/{date}',
    insertUrgentAppointment: '/dts-ana/appointments/urgentAppointment',
    insertUrgentAppointmentForGp: '/dts-ana/appointments/urgentAppointmentForGp',
    getUrgentRoomList: '/dts-ana/appointments/{clinicId}/urgentRoomList',
    getUrgentRoomListForGp: '/dts-ana/appointments/{clinicId}/urgentRoomListForGp',
    reassignUrgentAppointment: '/dts-ana/appointments/reassignUrgentAppointment',
    reassignUrgentAppointmentForGp: '/dts-ana/appointments/reassignUrgentAppointmentForGp',
    getAnaCode: '/dts-ana/code/ana/list/{category}',
    getContactHistoryList: '/dts-ana/contactHistory/appointment/{appointmentId}',
    changeForm: '/dts-ana/reports/patient/personalInformationSheet',
    getPmiLabel: '/dts-ana/reports/patient/pmiBarcodeLabel',
    getDtsSpecialtyList: '/cmn/services/{svcCd}/specialties',
    // dental Miki sprint 7 2020/08/13 - Start
    getDtsPreloadAllSpecialties: '/cmn/specialties',
    getDtsPreloadAllAnaCode: '/dts-ana/code/ana/list',
    getDtsPreloadAllCncCode: '/dts-ana/code/cnc/list',
    getDtsAnaCodeInCategories: '/dts-ana/code/ana/listin/categoryList',
    getDtsCncCodeInCategories: '/dts-ana/code/cnc/listin/categoryList',
    // dental Miki sprint 7 2020/08/13 - End
    getDefaultRoomList: '/dts-ana/defaultRooms/patients/{patientKey}/defaultRooms',
    putDefaultRoom: '/dts-ana/defaultRooms/patient/defaultRoom',
    deleteDefaultRoom: '/dts-ana/defaultRooms/patient/defaultRoom/{defaultRoomId}',
    getDefaultRoomLogList: '/dts-ana/defaultRooms/patient/defaultRooms/{defaultRoomId}/logs',
    getAddressLabel: '/dts-ana/reports/patient/pmiAddressLabel',
    getPatient: '/patient/getPatient',
    timeslotSearchByEncounter: '/dts-ana/appointments/timeslotByEncounter',
    getDH65Label: '/dts-ana/reports/patient/dh65Label',
    getBookingAlert: '/dts-ana/bookingAlerts',
    getEmptyTimeslot: '/dts-ana/emptyTimeslot',
    // dental Miki sprint 8 2020/08/19 - Start
    getPmiAppointmentLabel: '/dts-ana/reports/patient/pmiAppointmentLabel',
    getAppointmentSlip: '/dts-ana/reports/patient/printAppointmentSlip',
    // dental Miki sprint 8 2020/08/19 - End
    searchAppointmentList: '/dts-ana/appointments/appointmentList',
    rescheduleAppointment: '/dts-ana/appointments',
    getAppointmentByPatient: '/dts-ana/appointments',
    getAppointmentListReport: '/dts-ana/reports/appointment/getAppointmentListReport',
    getReserveListReport: '/dts-ana/reports/appointment/getReserveListReport',
    getRemindAppointmentListReport: '/dts-ana/reports/appointment/getRemindAppointmentListReport',
    updateAppointment: '/dts-ana/appointments/additional',
    getEncounterTypeList: '/dts-ana/clinicSurgery/rooms/encounterTypes',
    insertWaitingList:'/dts-ana/waiting/waitingList',
    appoinmentLog: ({ appointmentId }) => `/dts-ana/log/appointment/${appointmentId}`,
    timeslotLog: ({ timeslotId }) => `/dts-ana/log/timeslot/${timeslotId}`,
    updateArrivalTime: '/dts-ana/attendances/update',
    revokeAttendance: '/dts-ana/attendances/revoke',
    getWaitingList:'/dts-ana/waiting/waitingList',
    updateWaitingList:'/dts-ana/waiting/waitingList/{id}',
    getDisciplines: '/dts-ana/referral/disciplines',
    getReferralList: '/dts-ana/referral',
    getReferralDefaultRoom: '/dts-ana/referral/room',
    getUnvailablePeriodReasonsOfInfectionControl: '/dts-ana/unavailablePeriod/infectionControlReasons',
    getAnaRemarkTypeList:'/dts-ana/code/ana/remarkTypeList'
};

export function confirmAppointmentList(params, maskMode) {
    if (maskMode) return maskAxios.post(url.appointment, params);
    else return axios.post(url.appointment, params);
}

export function confirmAttendance(params, maskMode) {
    if (maskMode) return maskAxios.post(url.attendances, params);
    else return axios.post(url.attendances, params);
}

export function getAvailableCalendarTmslt(params, maskMode) {
    if (maskMode) return maskAxios.get(url.avaliableCalendar, { params: params });
    else return axios.get(url.avaliableCalendar, { params: params });
}

export function getAvailableCalendarTmsltForExpress(params, maskMode) {
    if (maskMode) return maskAxios.get(url.avaliableCalendarExpress, { params: params });
    else return axios.get(url.avaliableCalendarExpress, { params: params });
}

export function getAvailableDateByEncounter(params, maskMode) {
    if (maskMode) return maskAxios.get(url.timeslotSearchByEncounter, { params: params });
    else return axios.get(url.timeslotSearchByEncounter, { params: params });
}

export function getMultipleDailyViewForExpress(params, maskMode) {
    if (maskMode) return maskAxios.post(url.multipleDailyViewForExpress, params);
    else return axios.post(url.multipleDailyViewForExpress, params);
}

export function getServeRoom(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.get(url.serveRoom.replace('{userId}', params.userId).replace('{date}', dtsUtilities.formatDateParameter(params.date)));
}

export function insertUrgentAppointment(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.insertUrgentAppointment, params);
}

export function insertUrgentAppointmentForGp(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.insertUrgentAppointmentForGp, params);
}

export function getUrgentRoomList(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getUrgentRoomList.replace('{clinicId}', params.clinicId));
}

export function getUrgentRoomListForGp(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getUrgentRoomListForGp.replace('{clinicId}', params.clinicId));
}

export function reassignUrgentAppointment(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(url.reassignUrgentAppointment, params);
}

export function reassignUrgentAppointmentForGp(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(url.reassignUrgentAppointmentForGp, params);
}

export function getAnaCode(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.get(url.getAnaCode.replace('{category}', params.category));
}

export function getContactHistoryList(params) {
    return maskAxios.get(url.getContactHistoryList.replace('{appointmentId}', params.appointmentId));
}

export function getAttendance(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.get(url.attendances, { params: params });
}

export function getChangeForm(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.post(url.changeForm, params);
}

export function getPmiLabel(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.getPmiLabel, params);
}

export function getDtsSpecialtyList(serviceCd, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getDtsSpecialtyList.replace('{svcCd}', serviceCd));
}
// dental Miki sprint 7 2020/08/13 - Start
export function getDtsPreloadAllSpecialties(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getDtsPreloadAllSpecialties, params);
}
export function getDtsPreloadAllAnaCode(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getDtsPreloadAllAnaCode, params);
}
export function getDtsPreloadAllCncCode(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getDtsPreloadAllCncCode, params);
}
export function getDtsAnaCodeInCategories(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.getDtsAnaCodeInCategories, params);
}
export function getDtsCncCodeInCategories(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.getDtsCncCodeInCategories, params);
}
// dental Miki sprint 7 2020/08/13 - End
export function getDefaultRoomList(patientKey, activeOnly, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getDefaultRoomList.replace('{patientKey}', patientKey), { params: { activeOnly: activeOnly } });
}

export function getDefaultRoomLogList(defaultRoomId, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getDefaultRoomLogList.replace('{defaultRoomId}', defaultRoomId));
}

export function putDefaultRoom(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(url.putDefaultRoom, params);
}

export function deleteDefaultRoom(defaultRoomId, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.delete(url.deleteDefaultRoom.replace('{defaultRoomId}', defaultRoomId));
}

export function getAddressLabel(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.post(url.getAddressLabel, params);
}

export function getPatient(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.post(url.getPatient, params);
}

export function getDH65Label(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.post(url.getDH65Label, params);
}

export function getBookingAlert(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.get(url.getBookingAlert, { params: params });
}

export function getEmptyTimeslot(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.get(url.getEmptyTimeslot, { params: params });
}
// dental Miki sprint 8 2020/08/19 - START
export function getPmiAppointmentLabel(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.post(url.getPmiAppointmentLabel, params);
}
export function getAppointmentSlip(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;

    return currAxios.post(url.getAppointmentSlip, params);
}
// dental Miki sprint 8 2020/08/19 - END
export function searchAppointmentList(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    //console.log('dentalService-searchAppointmentList: ' + JSON.stringify(params));

    return currAxios.get(url.searchAppointmentList, params);
}

export function searchAppointmentListReport(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    //console.log('dentalService-searchAppointmentListReport: ' + JSON.stringify(params));
    return currAxios.post(url.getAppointmentListReport, params);
}

export function getReserveListReport(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.getReserveListReport, params);
}

export function getRemindAppointmentListReport(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.getRemindAppointmentListReport, params);
}

export function rescheduleAppointment(params, maskMode) {
    if (maskMode) return maskAxios.put(url.rescheduleAppointment, params);
    else return axios.put(url.rescheduleAppointment, params);
}

export function getEncounterTypeList(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getEncounterTypeList, params);
}

export function getAppointmentByPatient(params, maskMode) {
    if (maskMode) return maskAxios.get(url.getAppointmentByPatient, { params });
    else return axios.get(url.getAppointmentByPatient, { params });
}

export function updateAppointment(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(url.updateAppointment, params);
}

export function insertWaitingList(params, maskMode = true){
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.insertWaitingList, params);
}

export function getAppointmentLog(params, maskMode = true) {
    return (maskMode ? maskAxios : axios).get(url.appoinmentLog(params));
}

export function getTimeslotLog(params, maskMode = true) {
    return (maskMode ? maskAxios : axios).get(url.timeslotLog(params));
}

export function updateArrivalTime(params, maskMode = true) {
    return (maskMode ? maskAxios : axios).post(url.updateArrivalTime, params);
}

export function revokeAttendance(params, maskMode = true) {
    return (maskMode ? maskAxios : axios).post(url.revokeAttendance, params);
}

export function getWaitingList(params, maskMode = true){
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getWaitingList, params);
}

export function updateWaitingList(waitingListId, params, maskMode = true){
    console.log('dentalService:',waitingListId, params);
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(url.updateWaitingList.replace('{id}', waitingListId), params);
}

export function getDisciplines(params, maskMode = true) {
    return (maskMode ? maskAxios : axios).get(url.getDisciplines, { params });
}

export function getReferralList(params, maskMode = true) {
    return (maskMode ? maskAxios : axios).get(url.getReferralList, { params });
}

export function getReferralDefaultRoom(params, maskMode = true) {
    return (maskMode ? maskAxios : axios).get(url.getReferralDefaultRoom, { params });
}

export function getUnvailablePeriodReasonsOfInfectionControl(params, maskMode = false) {
    return (maskMode ? maskAxios : axios).get(url.getUnvailablePeriodReasonsOfInfectionControl, { params });
}

export function getAnaRemarkTypeList(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getAnaRemarkTypeList, params);
}