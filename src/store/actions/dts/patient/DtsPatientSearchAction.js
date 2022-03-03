import * as dtsPatientSearchActionType from './DtsPatientSearchActionType';

export const setSearchParams = (id, params) => {
    return {
        type: dtsPatientSearchActionType.SET_SEARCH_PARAMS,
        id,
        params
    };
};

export const resetById = (id) => {
    return {
        type: dtsPatientSearchActionType.RESET_BY_ID,
        id
    };
};

export const searchPatient = (id, params) => {
    return {
        type: dtsPatientSearchActionType.SEARCH_PATIENT,
        id,
        params
    };
};

export const setSelectedPatient = (id, patient) => {
    return {
        type: dtsPatientSearchActionType.SET_SELECTED_PATIENT,
        id,
        patient
    };
};

export const setPUCParams = (id, params) => {
    return {
        type: dtsPatientSearchActionType.SET_PUC_PARAMS,
        id,
        params
    };
};