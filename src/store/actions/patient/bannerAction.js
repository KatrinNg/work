import * as actionType from './bannerActionType';

export const getGravidaAndParity = (patientKey, antSvcId) => {
    return {
        type: actionType.GET_GRAVIDA_AND_PARITY,
        patientKey,
        antSvcId
    };
};

export const getAntSvcIdInfoLog = (clcAntId) => {
    return {
        type: actionType.GET_ANT_SVC_ID_INFO_LOG,
        clcAntId
    };
};