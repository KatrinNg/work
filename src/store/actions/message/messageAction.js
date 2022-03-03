import * as messageType from './messageActionType';

export const getMessageListByAppId = (params) => {
    return {
        type: messageType.GET_MESSAGE_LIST_BY_APP_ID,
        params
    };
};

export const openCommonMessage = (payload = {}) => {
    return {
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: payload
    };
};

export const closeCommonMessage = (params) => {
    return {
        type: messageType.CLOSE_COMMON_MESSAGE,
        params
    };
};

export const cleanCommonMessageDetail = () => {
    return {
        type: messageType.CLEAN_COMMON_MESSAGE_DETAIL
    };
};

export const cleanCommonMessageSnackbarDetail = () => {
    return {
        type: messageType.CLEAN_COMMON_MESSAGE_SNACKBAR_DETAIL
    };
};

export const strCommonMessage = (payload = {}) => {
    return {
        type: messageType.STR_COMMON_MESSAGE,
        payload: payload
    };
};