const PREFFIX = 'DEFAULTER_TRACING';

export const GET_DEFAULTER_TRACING_LIST = `${PREFFIX}_GET_DEFAULTER_TRACING_LIST`;
export const GET_SPP_TEAM = `${PREFFIX}_GET_SPP_TEAM`;
export const SPP_DFLT_CNTCT_HX=`${PREFFIX}_SPP_DFLT_CNTCT_HX`;


export const getDefaulterTracingList = (params, callback) => {
    return {
        type: GET_DEFAULTER_TRACING_LIST,
        params,
        callback
    };
};

export const getSppTeam = (callback) => {
    return {
        type: GET_SPP_TEAM,
        callback
    };
};

export const sppDfltCntctHx = (opType, params,callback) => {
    return {
        type: SPP_DFLT_CNTCT_HX,
        opType,
        params,
        callback
    };
};