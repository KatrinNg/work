import * as attendanceActionType from './attendanceActionType';

export const resetLocationEncounter = () => {
    return {
        type: attendanceActionType.RESET_LOCATION_ENCOUNTER
    };
};

export const resetAll = () => {
    return {
        type: attendanceActionType.RESET_ALL
    };
};

export const getRoomOfficer = (params) => {
    return {
        type: attendanceActionType.GET_ROOM_OFFICER,
        params
    };
};

export const getCalendarDetailDate = params => {
    return {
        type: attendanceActionType.GET_CALENDAR_DETAIL_DATE,
        params
    };
};
export const setCalendarDetailDate = params => {
    return {
        type: attendanceActionType.SET_CALENDAR_DETAIL_DATE,
        params
    };
};
export const setSelectedClinic = params => {
    return {
        type: attendanceActionType.SET_SELECTED_CLINIC,
        params
    };
};

export const getRoomList = (params, callback = null) => {
    return {
        type: attendanceActionType.GET_ROOM_LIST,
        params,
        callback
    };
};
export const setSelectedRoom = params => {
    return {
        type: attendanceActionType.SET_SELECTED_ROOM,
        params
    };
};

export const setSelectedFilterClinicalStatus = params => {
    return {
        type: attendanceActionType.SET_SELECTED_FILTER_CLINICAL_STATUS,
        params
    };
};

export const setSelectedFilterEncounterTypeCd = (params) => {
    return {
        type:attendanceActionType.SET_SELECTED_FILTER_ENCOUNTER_TYPE_CODE,
        params
    };
};

export const setSelectedFilterInfectionControlDisplay = params => {
    return {
        type: attendanceActionType.SET_SELECTED_FILTER_INFECTION_CONTROL_DISPLAY,
        params
    };
};

export const setSelectedAttendanceStatus = params => {
    return {
        type: attendanceActionType.SET_SELECTED_FILTER_ATTENDANCE_STATUS,
        params
    };
};

export const setSelectedAppointmntTask= (params) => {
    return {
        type:attendanceActionType.SET_SELECTED_APPOINTMENT_TASK,
        params
    };
};

export const setPatientKey= (params) => {
    return {
        type:attendanceActionType.SET_PATIENT_KEY,
        params
    };
};

export const setPatientKeyNAppointment = (params) => {
    return {
        type:attendanceActionType.SET_PATIENT_KEY_N_APPOINTMENT,
        params
    };
};

export const getDailyNote = params => {
    return {
        type: attendanceActionType.GET_DAILY_NOTE,
        params
    };
};

// export const setDailyNote = params => {
//     return {
//         type: attendanceActionType.SET_DAILY_NOTE,
//         params
//     };
// };

export const updateDailyNote = (params) => {
    return {
        type:attendanceActionType.UPDATE_DAILY_NOTE,
        params
    };
};

export const resetAttendanceFilter = () => {
    return {
        type:attendanceActionType.RESET_ATTENDANCE_FILTER
    };
};

export const resetDailyNote = () => {
    return {
        type:attendanceActionType.RESET_DAILY_NOTE
    };
};

export const getDailyView = (params) => {
    return {
        type: attendanceActionType.GET_DAILY_VIEW,
        params
    };
};

export const searchPatientByHkid = (params, maskMode = false) => {
    return {
        type:attendanceActionType.GET_PATIENT_BY_HKID,
        params,
        maskMode
    };
};

export const getPatientByIds = (params, maskMode = false) => {
    return {
        type:attendanceActionType.GET_PATIENT_BY_IDS,
        params,
        maskMode
    };
};

export const getAppoointmentTask = (params, callback = null, maskMode = false) =>{
    return {
        type:attendanceActionType.GET_APPOINTMENT_TASK,
        params,
        callback,
        maskMode
    };
};

export const confirmAttendance = (params, callback = null, maskMode = false) =>{
    return {
        type:attendanceActionType.CONFIRM_ATTENDANCE,
        params,
        callback,
        maskMode
    };
};

export const getServeRoom = (params, callback) => {
    return {
        type: attendanceActionType.GET_SERVE_ROOM,
        params,
        callback
    };
};

// export const getAnaCode = (params, callback) => {
//     return {
//         type: attendanceActionType.GET_ANA_CODE,
//         params,
//         callback
//     };
// };

export const getAttendance = (params, callback = null, maskMode = false) => {
    return {
        type: attendanceActionType.GET_ATTENDANCE,
        params,
        callback,
        maskMode
    };
};

export const setSelectedPatientEcsResult = (params) => {
    return {
        type: attendanceActionType.SET_SELECTED_PATIENT_ECS_RESULT,
        params
    };
};

export const setAttendanceAlertSettings = (params) => {
    return {
        type: attendanceActionType.SET_ATTENDANCE_ALERT_SETTINGS,
        params
    };
};

export const updateArrivalTime = (attendance, arrivalTime, callback) => {
    return {
        type: attendanceActionType.UPDATE_ARRIVAL_TIME,
        params: { attendanceId: attendance.atndId, version: attendance.version, arrivalTime },
        callback
    };
};

export const revokeAttendance = (attendance, callback) => {
    return {
        type: attendanceActionType.REVOKE_ATTENDANCE,
        params: { attendanceId: attendance.atndId, version: attendance.version },
        callback
    };
};