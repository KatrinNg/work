import * as backTakeAttendanceActionTypes from './backTakeAttendanceAcitonType';

export const updateField = (updateData) => {
    return ({
        type: backTakeAttendanceActionTypes.UPDATE_FIELD,
        updateData
    });
};

export const resetAll = () => {
    return ({
        type: backTakeAttendanceActionTypes.RESET_ALL
    });
};

export const backTakeAttendance = (params, searchParams, callback) => {
    return ({
        type: backTakeAttendanceActionTypes.BACK_TAKE_ATTENDANCE,
        params,
        searchParams,
        callback
    });
};

export const markArrival = (params, callback) => {
    return ({
        type: backTakeAttendanceActionTypes.ANA_ATND_MARK_ARRIVAL,
        params,
        callback
    });
};
// export const destroyMarkAttendance = () => {
//     return ({
//         type: attendanceActionTypes.DESTROY_MARK_ATTENDANCE
//     });
// };
// export const getAppointmentForAttend = (params) => {
//     return ({
//         type: attendanceActionTypes.GET_APPOINTMENT_FOR_TAKE_ATTENDANCE,
//         params
//     });
// };
// export const resetAttendance = (params, searchParameter) => {
//     return ({
//         type: attendanceActionTypes.RESET_ATTENDANCE,
//         params,
//         searchParameter
//     });
// };
// export const getPatientQueue = (params, searchPatientByInput) => {
//     return {
//         type: attendanceActionTypes.GET_PATIENT_QUEUE,
//         params,
//         searchPatientByInput
//     };
// };
export const listAppointmentList = ({ params, callBack = null }) => {
    return {
        type: backTakeAttendanceActionTypes.LIST_APPOINTMENT,
        params,
        callBack
    };
};
export const loadApptList = (appointmentList) => {
    return {
        type: backTakeAttendanceActionTypes.PUT_APPOINTMENT_LIST,
        appointmentList
    };
};