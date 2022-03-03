import * as dentalChartType from './DtsDentalChartActionType';

export const initiPage = () => {
    return {
        type: dentalChartType.INITI_PAGE
    };
};

export const resetAll = () => {
    return {
        type: dentalChartType.RESET_ALL
    };
};

export const updateDentalChart = (dentalChart, callback = null) => {
    return {
        type: dentalChartType.UPDATE_DENTAL_CHART,
        dentalChart,
        callback
    };
};

export const updateState = updateData => {
    return {
        type: dentalChartType.UPDATE_STATE,
        updateData
    };
};

export const resetDialogInfo = () => {
    return {
        type: dentalChartType.RESET_DIALOGINFO
    };
};

export const getDentalChart = (encounterId, encounterSdt)=> {
    return {
        type: dentalChartType.GET_DENTAL_CHART,
        encounterId,
        encounterSdt
    };
};

export const setRemark = (params) => {
    return {
        type:dentalChartType.SET_REMARK,
        params
    };
};

export const setDspTooth = (params) => {
    return {
        type:dentalChartType.SET_DSP_TOOTH,
        params
    };
};


