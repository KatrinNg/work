const PREFFIX = 'TRANSFER_OUT';

export const GET_TRANSFER_OUT = `${PREFFIX}_GET_TRANSFER_OUT`;
export const INSERT_TRANSFER_OUT = `${PREFFIX}_INSERT_TRANSFER_OUT`;
export const UPDATE_TRANSFER_OUT = `${PREFFIX}_UPDATE_TRANSFER_OUT`;
export const DELETE_TRANSFER_OUT = `${PREFFIX}_DELETE_TRANSFER_OUT`;


export const getTransferOut = (params, callback) => {
    return {
        type: GET_TRANSFER_OUT,
        params,
        callback
    };
};

export const insertTransferOut = (params, callback) => {
    return {
        type: INSERT_TRANSFER_OUT,
        params,
        callback
    };
};

export const updateTransferOut = (params, callback) => {
    return {
        type: UPDATE_TRANSFER_OUT,
        params,
        callback
    };
};

export const deleteTransferOut = (params, callback) => {
    return {
        type: DELETE_TRANSFER_OUT,
        params,
        callback
    };
};