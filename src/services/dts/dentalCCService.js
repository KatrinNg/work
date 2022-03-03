import { maskAxios, axios } from '../axiosInstance';
import * as dtsUtilities from '../../utilities/dtsUtilities';
// import moment from 'moment';
// import Enum from '../../enums/enum';

const url = {
    updatePractitioner: '/dts-cc/encounter/updatePractioner',
    updateEncounter: '/dts-cc/encounter/updateEncounter',
    getEncounterTypeList: '/dts-ana/clinicSurgery/rooms/encounterTypes',
    getAppointmentByPatient: '/dts-ana/appointments',
    getLatestEncounter: '/dts-cc/encounter/getLatestEncounter',
    insertEncounter: '/dts-ana/encounters',
    medicicalHistorySnapShot: '/dts-cc/medicial-history-snapshot',
    rfi: '/dts-cc/medicial-history-snapshot/rfi'
};

export function updatePractitioner(params, maskMode = true){
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(url.updatePractitioner, params);
}

export function updateEncounter(params, maskMode = true){
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(url.updateEncounter, params);
}

export function getEncounterTypeList(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(url.getEncounterTypeList, params);
}

export function getAppointmentByPatient(params, maskMode) {
    if (maskMode) return maskAxios.get(url.getAppointmentByPatient, { params });
    else return axios.get(url.getAppointmentByPatient, { params });
}
export function getLatestEncounter(params, maskMode) {
    if (maskMode) return maskAxios.get(url.getLatestEncounter, { params });
    else return axios.get(url.getLatestEncounter, { params });
}
export function insertEncounter(params, maskMode = true) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(url.insertEncounter, params);
}

export function getMedicicalHistorySnapShotByEncounter(encounterId, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(`${url.medicicalHistorySnapShot}/encounter/${encounterId}`);
}

export function createMedicicalHistorySnapShot(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(`${url.medicicalHistorySnapShot}`, params);
}

export function updateMedicicalHistorySnapShot(snapshotId, params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.put(`${url.medicicalHistorySnapShot}/${snapshotId}`, params);
}

export function getMedicicalHistoryRfi(patientKey,serviceCd, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.get(`${url.rfi}/${patientKey}/${serviceCd}`);
}

export function createMedicicalHistoryRfi(params, maskMode = false) {
    let currAxios = maskMode ? maskAxios : axios;
    return currAxios.post(`${url.rfi}`, params);
}