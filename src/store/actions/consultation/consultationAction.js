import * as type from './consultationActionType';

export const resetAll = () => {
    return {
        type: type.RESET_ALL
    };
};

export const updateState = (updateData) => {
    return {
        type: type.UPDATE_STATE,
        updateData
    };
};

export const getPatientQueue = (params) => {
    return {
        type: type.GET_PATIENT_QUEUE,
        params
    };
};