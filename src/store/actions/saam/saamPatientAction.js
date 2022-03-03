import * as actionType from './saamPatientActionType';

export const getSaamPatientSummary = (refKey) => {
    return {
        type: actionType.GET_PATIENT_SUMMARY,
        params: {
            refKey
        }
    };
};

export const clearSaamPatientSummary = () => {
    return {
        type: actionType.CLEAR_PATIENT_SUMMARY
    };
};