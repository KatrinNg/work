import * as patientActionType from './DtsPatientActionType';

export const resetAll = () => {
    return {
        type: patientActionType.RESET_ALL
    };
};

export const dtsUpdateState = updateData => {
    return {
        type: patientActionType.UPDATE_STATE,
        updateData
    };
};

export const dtsOpenPreviewWindow = params => {
    return {
        type: patientActionType.OPEN_PREVIEW_WINDOW,
        params
    };
};

export const dtsSetAddressLabel = (addressValue, idx, addressIdx) => {
    return {
        type: patientActionType.SET_ADDRESS_LABEL,
        addressValue,
        idx,
        addressIdx
    };
};

export const dtsSearchPatient = (params, idx, callback = null) => {
    return {
        type: patientActionType.SEARCH_PATIENT,
        params,
        idx, 
        callback
    };
};
