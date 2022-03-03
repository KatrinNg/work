import * as type from './attendanceCertActionType';

export const getAttendanceCert = (params, copies, isFitPage, printQue, callback, isPreview) => {
    return {
        type: type.GET_ATTENDANCE_CERT,
        params,
        copies,
        isFitPage,
        printQue,
        callback,
        isPreview
    };
};

export const updateField = (updateData) => {
    return {
        type: type.UPDATE_FIELD,
        updateData
    };
};

export const resetAll = () => {
    return {
        type: type.RESET_ALL
    };
};


export const listAttendanceCertificates = (params, callback) => {
    return {
        type: type.LIST_ATTENDANCE_CERTIFICATES,
        params,
        callback
    };
};

export const updateAttendanceCertificate = (params, callback) => {
    return {
        type: type.UPDATE_ATTENDANCE_CERTIFICATE,
        params,
        callback
    };
};

export const deleteAttndCert = (params, callback) => {
    return {
        type: type.DELETE_ATTENDANCE_CERTIFICATE,
        params,
        callback
    };
};