import * as dtsCommonActionType from './dtsCommonActionType';

export const getAnaCode = (params, callback = null) => {
    return {
        type: dtsCommonActionType.GET_ANA_CODE,
        params,
        callback
    };
};