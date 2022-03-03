import * as perioChartActionType from './perioChartActionType';

export const setPerioChartCallBack = (params) => {
    return {
        type:perioChartActionType.SET_PERIOCHART_CALLBACK,
        params
    };
};

export const resetPerioChartCallBack = () => {
    return {
        type:perioChartActionType.RESET_PERIOCHART_CALLBACK
    };
};

export const updatePerioChartData_saga = (params) => {
    return {
        type:perioChartActionType.UPDATE_PERIOCHART_DATA_SAGA,
        params
    };
};

export const getPerioChartDataCollectionByPatientKey_saga = (params) => {
    return {
        type:perioChartActionType.GET_PERIOCHART_DATA_COLLECTION_SAGA,
        params
    };
};

export const setPerioChartDataCollection = (params) => {
    return {
        type:perioChartActionType.SET_PERIOCHART_DATA_COLLECTION,
        params
    };
};

export const resetPerioChartDataCollection = () => {
    return {
        type:perioChartActionType.RESET_PERIOCHART_DATA_COLLECTION
    };
};
