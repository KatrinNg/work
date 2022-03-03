import * as ehsSpaControl from './ehsSpaControlActionType';

export const reset = () => {
    return {
        type: ehsSpaControl.RESET
    };
};

export const updateState = (newState) => {
    return {
        type: ehsSpaControl.UPDATE_STATE,
        newState
    };
};

export const searchPatients = (params, callback) => {
    return {
        type: ehsSpaControl.SEARCH_PATIENTS,
        params,
        callback
    };
};

export const closeEhsPmiSearchDialog = () => {
    return {
        type: ehsSpaControl.CLOSE_EHS_PMI_SEARCH_DIALOG
    };
};

export const openEhsPrintApptListDialog = (ehsApptListReportData) => {
    return {
        type: ehsSpaControl.OPEN_EHS_PRINT_APPT_LIST_DIALOG,
        ehsApptListReportData
    };
};

export const closeEhsPrintApptListDialog = () => {
    return {
        type: ehsSpaControl.CLOSE_EHS_PRINT_APPT_LIST_DIALOG
    };
};
