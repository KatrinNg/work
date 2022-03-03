import * as types from './noticeBoardActionType';

export const resetAll = () => {
    return {
        type: types.RESET_ALL
    };
};

export const listNotice = () => {
    return {
        type: types.LIST_NOTICE
    };
};

export const updateField = (updateData) => {
    return {
        type: types.UPDATE_FIELD,
        updateData
    };
};

export const submitNotice = (params, file, callback = null) => {
    return {
        type: types.SUBMIT_NOTICE,
        params,
        file,
        callback
    };
};

export const uploadFile = (file, callback = null) => {
    return {
        type: types.UPLOAD_FILE,
        file,
        callback
    };
};

export const deleteNotice = (noticeId, callback = null) => {
    return {
        type: types.DELETE_NOTICE,
        noticeId,
        callback
    };
};

export const downloadFile = (noticeId, callback) => {
    return {
        type: types.DOWNLOAD_FILE,
        noticeId,
        callback
    };
};