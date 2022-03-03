const PREFFIX = 'PATIENT_TRANSFER';

export const GET_PATIENT_TRANSFER = `${PREFFIX}_GET_PATIENT_TRANSFER`;
export const INSERT_PATIENT_TRANSFER = `${PREFFIX}_INSERT_PATIENT_TRANSFER`;
export const UPDATE_PATIENT_TRANSFER = `${PREFFIX}_UPDATE_PATIENT_TRANSFER`;
export const DELETE_PATIENT_TRANSFER = `${PREFFIX}_DELETE_PATIENT_TRANSFER`;


export const getPatientTransferList = (params, callback) => {
    return {
        type: GET_PATIENT_TRANSFER,
        params,
        callback
    };
};

export const insertPatientTransfer = (params, callback) => {
    return {
        type: INSERT_PATIENT_TRANSFER,
        params,
        callback
    };
};

export const updatePatientTransfer = (params, callback) => {
    return {
        type: UPDATE_PATIENT_TRANSFER,
        params,
        callback
    };
};

export const deletePatientTransfer = (params, callback) => {
    return {
        type: DELETE_PATIENT_TRANSFER,
        params,
        callback
    };
};