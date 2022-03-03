import * as upmActionType from './upmActionType';

export const resetAll = () => {
    return {
        type: upmActionType.RESET_ALL
    };
};

export const resetDialogInfo = () => {
    return {
        type: upmActionType.RESET_DIALOGINFO
    };
};

export const updateState = (updateData) => {
    return (dispatch, getState) => {
        dispatch({
            type: upmActionType.UPDATE_STATE,
            updateData
        });
        return Promise.resolve();
    };
};

export const listUpmList = (params) => {
    return {
        type: upmActionType.GET_UPMLIST,
        params
    };
};

export const createUpm = (params, callback = null) => {
    return {
        type: upmActionType.INSERT_UPM,
        params,
        callback
    };
};

export const updateUpm = (unavailPerdId, params, callback = null) => {
    return {
        type: upmActionType.UPDATE_UPM,
        unavailPerdId,
        params,
        callback
    };
};

export const deleteUpm = (id, callback = null) => {
    return {
        type: upmActionType.DELETE_UPM,
        id,
        callback
    };
};

export const getUnavailableReasons = () => {
    return {
        type: upmActionType.GET_UNAVAILABLEREASONS
    };
};