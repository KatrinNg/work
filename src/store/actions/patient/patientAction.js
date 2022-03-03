import * as type from './patientActionType';

export const getPatientById = ({ patientKey, appointmentId = null, caseNo = null, callBack = null, resetPatientList = null }) => {
    return {
        type: type.GET_PATINET_BY_ID,
        patientKey,
        appointmentId,
        caseNo,
        callBack,
        resetPatientList
    };
};

export const refreshPatient = (params) => {
    return {
        type: type.REFRESH_PATIENT,
        isRefreshCaseNo: params.isRefreshCaseNo,
        isRefreshApptInfo: params.isRefreshApptInfo,
        isRefreshBannerData: !!params.isRefreshBannerData,
        caseNo: params && params.caseNo || null,
        appointmentId: params && params.appointmentId || null,
        callBack: params && params.callBack || null
    };
};

export const getPatientAppointment = (appointmentId, caseList) => {
    return {
        type: type.GET_PATIENT_APPOINTMENT,
        appointmentId,
        caseList
    };
};

export const getRedesignPatientAppointment = (appointmentId, patientAppointmentParams, caseList) => {
    return {
        type: type.GET_REDESIGN_PATIENT_APPOINTMENT,
        appointmentId,
        patientAppointmentParams,
        caseList
    };
};

export const getPatientCaseNo = (caseList, caseNo) => {
    return {
        type: type.GET_PATIENT_CASENO,
        caseList,
        caseNo
    };
};

export const getPatientEncounter = (appointmentId, callback) => {
    return {
        type: type.GET_PATIENT_ENCOUNTER,
        appointmentId,
        callback
    };
};


export const resetAll = () => {
    return {
        type: type.RESET_ALL
    };
};

export const resetPatientPanel = () => {
    return {
        type: type.RESET_PATIENT_PANEL
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

export const listNationalityAndListCountry = () => {
    return {
        type: type.LIST_NATIONALITY_AND_LIST_COUNTRY
    };
};

export const loadEncounterInfo = (encounterInfo) => {
    return {
        type: type.LOAD_PATIENT_ENCOUNTER_INFO,
        encounterInfo
    };
};

export const getLanguageList = () => {
    return {
        type: type.GET_LANGUAGE_LIST
    };
};

export const getEHRUrl = (patientData, isEHRAccessRight, isEHRSSRegistered, eHRViewerUrl, callBack = null) => {
    return {
        type: type.GET_EHR_URL,
        patientData,
        isEHRAccessRight,
        isEHRSSRegistered,
        eHRViewerUrl,
        callBack
    };
};

export const resetEHRUrl = () => {
    return {
        type: type.RESET_EHR_URL
    };
};


export const listMajorKeyHistory = (patientKey) => {
    return {
        type: type.LIST_MAJORKEY_CHANGE_HISTORY,
        patientKey
    };
};

export const printPatientGumLabel = (serviceCd,siteId,patientKey,caseNo,isPreview,callback) => {
    return {
        type: type.GET_PATIENT_GUM_LABEL,
        serviceCd,
        siteId,
        patientKey,
        caseNo,
        isPreview,
        callback
    };
};

export const printSPPGumLabel = (params,isPreview,callback) => {
    return {
        type: type.GET_PATIENT_SPP_GUM_LABEL,
        params,
        isPreview,
        callback
    };
};

export const printEHSGumLabel = (params,isPreview,callback) => {
    return {
        type: type.GET_PATIENT_EHS_GUM_LABEL,
        params,
        isPreview,
        callback
    };
};

export const printPatientSpecimenLabel = (serviceCd,siteId,patientKey,isPreview,callback) => {
    return {
        type: type.GET_PATIENT_SPECIMEN_LABEL,
        serviceCd,
        siteId,
        patientKey,
        isPreview,
        callback
    };
};

export const listAppointmentHistory = (params, callback) => {
    return {
        type: type.LIST_APPOINTMENT_HISTORY,
        params,
        callback
    };
};

export const getPatientBanner = (serviceCd, patientKey, roleName) => {
    return {
        type: type.GET_PATIENT_BANNER,
        serviceCd,
        patientKey,
        roleName
    };
};

export const clearPatientBanner = () => {
    return {
        type: type.CLEAR_PATIENT_BANNER
    };
};

export const getViewLogList = () => {
    return {
        type: type.GET_VIEW_LOG_LIST
    };
};

export const getFamilyEncounterSearchList = (id) => {
    return {
        type: type.GET_FAMILY_ENCOUNTER_SEARCH_LIST,
        id
    };
};

export const getPatientPUC = (callback, patientParams) => {
    return {
        type: type.GET_PATIENT_PUC,
        callback,
        patientParams
    };
};

export const putPatientPUC = (pucChecking) => {
    return {
        type: type.PUT_PATIENT_PUC,
        pucChecking
    };
};

export const  refreshAnSvcIDInfo=(params)=>{
    return {
        type:type.REFRESH_AN_SERVICE_ID_INFO,
        params
    };
};

export const getPatientBannerData = (resolve = ()=>{}, reject = ()=>{}) => {
    return {
        type: type.GET_PATIENT_BANNER_DATA,
        resolve,
        reject
    };
};

export const clearPatientBannerData = () => {
    return {
        type: type.CLEAR_PATIENT_BANNER_DATA
    };
};

export const getPsoInfo = (patientKey) => {
    return {
        type: type.GET_PSO_INFO,
        patientKey
    };
};

export const putPatientPsoInfo = (params) => {
    return {
        type: type.PUT_PATIENT_PSORIASIS_INFO,
        params
    };
};

export const putPsoInfo = (params) => {
    return {
        type: type.PUT_PSO_INFO,
        psoInfo: params
    };
};

export const getLatestPatientEncntrCase = (params, callback) => {
    return {
        type: type.GET_LATEST_PATIENT_ENCOUNTER_CASE,
        params,
        callback
    };
};

export const updatePatientEncntrCase = (params, callback) => {
    return {
        type: type.UPDATE_PATIENT_ENCOUNTER_CASE,
        params,
        callback
    };
};

export const addPsoInfo = (patientKey, encounterId, encounterDate, ehrSiteId, callback) => {
    return {
        type: type.ADD_PSO_INFO,
        patientKey,
        encounterId,
        encounterDate,
        ehrSiteId,
        callback
    };
};

export const getHaveEncounterWithinOneMonth = (params, callback) => {
    return {
        type: type.GET_HAVE_ENCOUNTER_WITHIN_ONE_MONTH,
        params,
        callback
    };
};

export const toggleFamilyEncounterSearchDialog = () => {
    return {
        type: type.TOGGLE_FAMILY_ENCOUNTER_SEARCH_DIALOG
    };
};

export const putCgsGeneticInfo = (geneticInfo = []) => {
    return {
        type: type.PUT_GENETIC_SCREENING_INFO,
        geneticInfo
    };
};

export const updateLastCheckDate = (params, callback) => {
    return {
        type: type.UPDATE_LAST_CHECKDATE,
        params,
        callback
    };
};