import * as calendarViewActionType from './calendarViewActionType';

export const resetAll = () => {
    return {
        type: calendarViewActionType.RESET_ALL
    };
};

export const requestData = (dataType, params, fileData) => {
    return {
        type: calendarViewActionType.REQUEST_DATA,
        dataType,
        params,
        fileData
    };
};

export const updateField = (updateData) => {
    return {
        type: calendarViewActionType.UPDATE_FIELD,
        updateData
    };
};

export const fillingData = (fileData) => {
    return {
        type: calendarViewActionType.FILLING_DATA,
        ...fileData
    };
};

export const openPreviewWindow = (params) => {
    return {
        type: calendarViewActionType.OPEN_PREVIEW_WINDOW,
        params
    };
};

export const getRoomUtilization = (params) => {
    return {
        type: calendarViewActionType.GET_ROOM_UTILIZATION,
        siteId: params.siteId,
        slotDate: params.slotDate
    };
};

export const getFilterLists = (params) => {
    return {
        type: calendarViewActionType.GET_FILTER_LISTS,
        svcCd: params.svcCd
    };
};