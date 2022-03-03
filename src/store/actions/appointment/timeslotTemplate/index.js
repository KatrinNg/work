const PRE = 'TIMESLOT_TEMPLATE';

export const RESET_ALL = `${PRE}_RESET_ALL`;
export const INIT_PAGE = `${PRE}_INIT_PAGE`;
export const UPDATE_STATE = `${PRE}_UPDATE_STATE`;
export const GET_TEMPLATE_LIST = `${PRE}_GET_TEMPLATE_LIST`;
export const UPDATE_TEMPLATE_LIST = `${PRE}_UPDATE_TEMPLATE_LIST`;
export const EDIT_TEMPLATE = `${PRE}_EDIT_TEMPLATE`;
export const SELECT_TEMPLATE = `${PRE}_SELECT_TEMPLATE`;
export const INIT_TEMPLATE_DETAIL = `${PRE}_INIT_TEMPLATE_DETAIL`;
export const COPY_TEMPLATE = `${PRE}_COPY_TEMPLATE`;
export const INSERT_TEMPLATE = `${PRE}_INSERT_TEMPLATE`;
export const UPDATE_TEMPLATE = `${PRE}_UPDATE_TEMPLATE`;
export const DELETE_TEMPLATE = `${PRE}_DELETE_TEMPLATE`;
export const BATCH_CREATE = `${PRE}_BATCH_CREATE`;

export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};

export const updateState = (updateData) => {
    return {
        type: UPDATE_STATE,
        updateData
    };
};

export const getTemplateList = () => {
    return {
        type: GET_TEMPLATE_LIST
    };
};

export const initPage = () => {
    return {
        type: INIT_PAGE
    };
};

export const editTemplate = (tmsltTmplProfileId) => {
    return {
        type: EDIT_TEMPLATE,
        tmsltTmplProfileId
    };
};

export const selectTemplate = (tmsltTmplProfileId) => {
    return {
        type: SELECT_TEMPLATE,
        tmsltTmplProfileId
    };
};

export const initTemplateDetail = () => {
    return {
        type: INIT_TEMPLATE_DETAIL
    };
};

export const copyTemplate = () => {
    return {
        type: COPY_TEMPLATE
    };
};

export const insertTemplate = (tmsltTmp) => {
    return {
        type: INSERT_TEMPLATE,
        tmsltTmp
    };
};

export const updateTemplate = (tmsltTmp) => {
    return {
        type: UPDATE_TEMPLATE,
        tmsltTmp
    };
};

export const deleteTemplate = (tmsltTmp) => {
    return {
        type: DELETE_TEMPLATE,
        tmsltTmp
    };
};

export const batchCreate = () => {
    return {
        type: BATCH_CREATE
    };
};