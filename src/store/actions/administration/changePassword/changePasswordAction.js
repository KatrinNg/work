import * as changePasswordActionTypes from './changePasswordActionType';

export const updateField=(name,value)=>{
    return{
        type:changePasswordActionTypes.UPDATE_FIELD,
        name,
        value
    };
};

export const resetAll=()=>{
    return{
        type:changePasswordActionTypes.RESET_ALL
    };
};

export const updateCancel=()=>{
    return{
        type:changePasswordActionTypes.UPDATE_CANCEL
    };
};

export const updatePassword=(params, callback)=>{
    return{
        type:changePasswordActionTypes.UPDATE_PASSWORD,
        params,
        callback
    };
};