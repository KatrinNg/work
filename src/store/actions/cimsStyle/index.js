const PREFFIX = 'CIMS_STYLE';
export const BATCH_UPDATE_STATE = `${PREFFIX}_BATCH_UPDATE_STATE`;

export const batchUpdateState = (updateData) => {
    return {
        type: BATCH_UPDATE_STATE,
        updateData
    };
};