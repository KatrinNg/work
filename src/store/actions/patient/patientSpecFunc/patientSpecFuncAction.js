import * as type from './patientSpecFuncActionType';

export const searchPatientList = (params) => {
    return {
        type: type.SEARCH_PATIENT_LIST,
        params
    };
};

export const updatePatientListField = (fields) => {
    return {
        type: type.UPDATE_PATIENT_LIST_FIELD,
        fields
    };
};
export const getPatientList = (params) => {
    return {
        type: type.GET_PATIENT_LIST,
        params
    };
};
export const resetPatientListField = () => {
    return {
        type: type.RESET_PATIENT_LIST_FIELD
    };
};
export const resetLinkPatient = () => {
    return {
        type: type.RESET_LINK_PATIENT
    };
};

export const searchPatientPrecisely = (params) => {
    return {
        type: type.SEARCH_PATIENT_PRECISELY,
        params
    };
};

export const confirmAnonymousPatient = (params, callback) => {
    return {
        type: type.CONFIRM_ANONYMOUS_PATIENT,
        params,
        callback
    };
};

export const resetCondition = () => {
    return {
        type: type.RESET_CONDITION
    };
};


export const resetAttendance = (attenPara, searchPara) => {
    return {
        type: type.RESET_ATTENDANCE,
        attenPara,
        searchPara
    };
};

export const resetAttendanceSuccess = () => {
    return {
        type: type.RESET_ATTENDANCE_SUCCESS
    };
};

export const updatePatientListAttendanceInfo = (attendanceInfo) => {
    return {
        type: type.UPDATE_PATIENT_LIST_ATTENDANCEINFO,
        attendanceInfo
    };
};

export const searchInPatientQueue = (params, countryList, smartCardCallback) => {
    return {
        type: type.SEARCH_IN_PATIENT_QUEUE,
        params,
        countryList,
        smartCardCallback
    };
};

export const searchByAppointmentId = (params) => {
    return {
        type: type.SEARCH_BY_APPOINTMENT_ID,
        params
    };
};

export const pucReasonLog = (params) => {
    return {
        type: type.PUC_REASON_LOG,
        params
    };
};

export const pucReasonLogs = (params) => {
    return {
        type: type.PUC_REASON_LOGS,
        params
    };
};

export const checkPatientUnderCare = (loadPatientPanel, resetPatientList, selectedPatient, pucOptions = {}) => {
    return {
        type: type.CHECK_PATIENT_UNDER_CARE,
        loadPatientPanel,
        resetPatientList,
        selectedPatient,
        pucOptions
    };
};

export const checkPatientName = (searchString, callback = null) => {
    return {
        type: type.CHECK_PATIENT_NAME,
        searchString,
        callback
    };
};

export const printPatientList = (params, callback) => {
    return {
        type: type.PRINT_PATIENT_LIST,
        params,
        callback
    };
};