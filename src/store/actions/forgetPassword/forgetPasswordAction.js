import * as types from './forgetPasswordActionType';

export const send=(params, callback = null )=>{
    return{
        type:types.SEND,
        params,
        callback
    };
};

export const updateField=(field)=>{
    return{
        type:types.UPDATE_FIELD,
        field
    };
};
export const resetAll=()=>{
    return{
        type:types.RESET_ALL
    };
};

