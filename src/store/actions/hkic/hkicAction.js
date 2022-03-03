import * as hkicActionType from './hkicActionType';

export const resetAll = () => {
    return {
        type: hkicActionType.DEFAULT
    };
};
export const uploadFile = (address) => {
    return {
        type: hkicActionType.UPLOAD_FILE,
        file: address.file,
        errorMessage: address.errorMessage
    };
};
export const convert = (address) => {
    return {
        type: hkicActionType.CONCERT,
        openLodingDailog: address.openLodingDailog,
        file: address.file
    };
};
export const cancelUpload = () => {
    return {
        type: hkicActionType.CANCEL_UPLOAD,
        openLodingDailog: false
    };
};
export const exit = () => {
    return {
        type: hkicActionType.EXIT,
        openDownloadDailog: false
    };
};

export const uploadFailed = (errMsg) => {
    return {
        type: hkicActionType.UPLOAD_FAILED,
        errorMessage: errMsg
    };
};

export const updateState = (updateData) => {
    return {
        type: hkicActionType.UPDATE_STATE,
        updateData
    };
};