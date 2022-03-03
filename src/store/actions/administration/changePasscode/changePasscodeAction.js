import * as changePasscodeActionTypes from './changePasscodeActionType';

export const updateField = (name, value) => {
    return {
        type: changePasscodeActionTypes.UPDATE_FIELD,
        name,
        value
    };
};

export const resetAll = () => {
    return {
        type: changePasscodeActionTypes.RESET_ALL
    };
};

export const updateCancel = () => {
    return {
        type: changePasscodeActionTypes.UPDATE_CANCEL
    };
};


export const updatePasscode = (params, callback = null) => {
    return {
        type: changePasscodeActionTypes.UPDATE_PASSCODE,
        params,
        callback
    };
};