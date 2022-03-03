import * as dtsPatientSummaryActionType from './DtsPatientSummaryActionType';

export const setRedirect = params => {
    return {
        type: dtsPatientSummaryActionType.SET_REDIRECT,
        params
    };
};

export const getChangeForm = (params, callback) => {
    return {
        type: dtsPatientSummaryActionType.GET_CHANGE_FORM,
        params,
        callback
    };
};

export const dtsGetPmiLabel = params => {
    return {
        type: dtsPatientSummaryActionType.GET_PMI_LABEL,
        params
    };
};

export const dtsUpdateState = updateData => {
    return {
        type: dtsPatientSummaryActionType.UPDATE_STATE,
        updateData
    };
};

export const resetAll = () => {
    return {
        type: dtsPatientSummaryActionType.RESET_ALL
    };
};

export const dtsOpenPreviewWindow = params => {
    return {
        type: dtsPatientSummaryActionType.OPEN_PREVIEW_WINDOW,
        params
    };
};

export const dtsSetAddressLabel = (addressLabel, idx) => {
    return {
        type: dtsPatientSummaryActionType.SET_ADDRESS_LABEL,
        addressLabel,
        idx
    };
};

export const dtsSetAddressLabelList = (params) => {
    return {
        type: dtsPatientSummaryActionType.SET_ADDRESS_LABEL_LIST,
        params
    };
};

export const dtsSearchPatient = (params, idx, callback = null) => {
    return {
        type: dtsPatientSummaryActionType.SEARCH_PATIENT,
        params,
        idx, 
        callback
    };
};

export const dtsGetDH65Label = params => {
    return {
        type: dtsPatientSummaryActionType.GET_DH65_LABEL,
        params
    };
};
// dental Miki sprint 8 2020/08/19 - Start
export const dtsGetAppointmentLabel = (params) => {
    return {
        type: dtsPatientSummaryActionType.GET_APPOINTMENT_LABEL,
        params
    };
};
export const dtsGetAppointmentSlip = (params) => {
    return {
        type: dtsPatientSummaryActionType.GET_APPOINTMENT_SLIP,
        params
    };
};
export const dtsGetEncounterHistory = (params) => {
    return {
        type: dtsPatientSummaryActionType.GET_ENCOUNTER_HISTORY,
        params
    };
};
// dental Miki sprint 8 2020/09/7 - End