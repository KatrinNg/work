import * as types from './docActionType';

export const updateState = (data, callback = null) => {
    return {
        type: types.UPDATE_STATE,
        data,
        callback: callback
    };
};

/*export const triggerGetAllDocType = (callback) => {
    return {
        type: types.GET_DOC_TYPE,
        callback: callback
    };
};*/

export const triggerSetInOutDocTypeList = (callback) => {
    return {
        type: types.SET_IN_OUT_DOC_TYPE,
        callback: callback
    };
};

export const triggerGetAllDocList = (callback = null) => {
    return {
        type: types.GET_DOC_LIST,
        callback: callback
    };
};

export const triggerGetSingleInOutDoc = (docId, isInDoc, callback = null) => {
    return {
        type: types.GET_SINGLE_DOC,
        docId: docId,
        isInDoc: isInDoc,
        callback: callback
    };
};

export const triggerGetSingleInOutDocHistory = (docId, callback = null) => {
    return {
        type: types.GET_SINGLE_DOC_HISTORY,
        docId: docId,
        callback: callback
    };
};
