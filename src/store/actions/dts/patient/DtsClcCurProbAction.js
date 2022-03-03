import * as clcCurProbType from './DtsClcCurProbActionType';

export const initiPage = () => {
    return {
        type: clcCurProbType.INITI_PAGE
    };
};

export const resetAll = () => {
    return {
        type: clcCurProbType.RESET_ALL
    };
};

export const putClcCurProb = (clcCurProb, callback = null) => {
    return {
        type: clcCurProbType.PUT_CLC_CUR_PROB,
        clcCurProb,
        callback
    };
};

export const updateState = updateData => {
    return {
        type: clcCurProbType.UPDATE_STATE,
        updateData
    };
};

export const resetDialogInfo = () => {
    return {
        type: clcCurProbType.RESET_DIALOGINFO
    };
};

export const getClcCurProbList = patientKey => {
    return {
        type: clcCurProbType.GET_CLC_CUR_PROB_LIST,
        patientKey
    };
};


