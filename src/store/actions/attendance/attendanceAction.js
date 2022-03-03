import * as attendanceActionTypes from './attendanceActionType';
export const updateField = (updateData) => {
    return ({
        type: attendanceActionTypes.ANA_ATND_UPDATE_FIELD,
        updateData
    });
};

export const resetAll = () => {
    return ({
        type: attendanceActionTypes.ANA_ATND_RESET_ALL
    });
};

export const markAttendance = (params, searchParams, callback) => {
    return ({
        type: attendanceActionTypes.ANA_ATND_MARK_ATTENDANCE,
        params,
        searchParams,
        callback
    });
};

export const markAttendanceForPatientSummary = (params, searchParams, curSelectedAppt, callback) => {
    return ({
        type: attendanceActionTypes.ANA_ATND_MARK_ATTENDANCE_PATIENT_SUMMARY,
        params,
        searchParams,
        curSelectedAppt,
        callback
    });
};

export const destroyMarkAttendance = () => {
    return ({
        type: attendanceActionTypes.ANA_ATND_DESTROY_MARK_ATTENDANCE
    });
};

export const getAppointmentForAttend = (appointmentList, appointmentId) => {
    return ({
        type: attendanceActionTypes.ANA_ATND_GET_APPOINTMENT_FOR_TAKE_ATTENDANCE,
        appointmentList,
        appointmentId
    });
};

export const listAppointmentList = (params,  callback = null) => {
    return {
        type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
        params,
        callback
    };
};
export const putApptList = (appointmentList) => {
    return {
        type: attendanceActionTypes.ANA_ATND_PUT_APPOINTMENT_LIST,
        appointmentList
    };
};

export const putAnaAtndPutAnaRemark = (anaRemarkTypes) => {
    return {
        type: attendanceActionTypes.ANA_ATND_PUT_ANA_REMARK,
        anaRemarkTypes
    };
};

export const markArrival = (params, searchParams, callback) => {
    return {
        type: attendanceActionTypes.ANA_ATND_MARK_ARRIVAL,
        params,
        searchParams,
        callback
    };
};


export const editAttendance = (params, searchParams, callback) => {
    return {
        type: attendanceActionTypes.ANA_ATND_EDIT_ATTENDANCE,
        params,
        searchParams,
        callback
    };
};
