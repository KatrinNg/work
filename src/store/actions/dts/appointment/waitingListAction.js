import * as waitingListActionType from './waitingListActionType';

export const getWaitingList = (params) => {
    return {
        type: waitingListActionType.GET_WAITING_LIST,
        params
    };
};

export const insertWaitingList = (params, callback = null) => {
    return {
        type: waitingListActionType.INSERT_WAITING_LIST,
        params, callback
    };
};

export const getRoomList = (params) => {
    return {
        type: waitingListActionType.GET_ROOM_LIST,
        params
    };
};

export const updateWaitingList = (waitingListId, params, callback = null) => {
    return {
        type: waitingListActionType.UPDATE_WAITING_LIST,
        waitingListId, params, callback
    };
};

export const resetAll = () => {
    return {
        type: waitingListActionType.RESET_ALL
    };
};

