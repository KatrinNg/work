import * as ideasActionType from './ideasActionType';

export const reset = () => {
    return {
        type: ideasActionType.RESET
    };
};
export const getSmartCardToken = (callback, errorCallback) => {
    return {
        type: ideasActionType.GET_SMART_CARD_TOKEN,
        callback,
        errorCallback
    };
};
export const getSmartCardTokenV2 = (callback, errorCallback) => {
    return {
        type: ideasActionType.GET_SMART_CARD_TOKEN_V2,
        callback,
        errorCallback
    };
};
export const getCardType = () => {
    return {
        type: ideasActionType.GET_CARD_TYPE
    };
};

export const updateState = (updateData) => {
    return {
        type: ideasActionType.UPDATE_STATE,
        updateData
    };
};
