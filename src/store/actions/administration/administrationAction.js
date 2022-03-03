import * as administrationType from './administrationActionType';

export const resetAll = () => {
    return {
        type: administrationType.RESET_ALL
    };
};

export const cancelEdit = () => {
    return {
        type: administrationType.CANCEL_EDIT
    };
};

export const insertUserProfile = (params, callback) => {
    return {
        type: administrationType.INSERT_USER_PROFILE,
        params,
        callback
    };
};

export const updateUserProfile = (params, callback) => {
    return {
        type: administrationType.UPDATE_USER_PROFILE,
        params,
        callback
    };
};

export const addUserProfile = () => {
    return {
        type: administrationType.ADD_USER_PROFILE
    };
};

export const editUserProfile = () => {
    return {
        type: administrationType.EDIT_USER_PROFILE
    };
};

export const searchUserProfile = (params) => {
    return {
        type: administrationType.SEARCH_USER,
        params
    };
};

export const getUserById = (params) => {
    return {
        type: administrationType.GET_USER_BY_ID,
        params
    };
};

export const updateState = (updateData) => {
    return {
        type: administrationType.UPDATE_STATE,
        updateData
    };
};

export const updateField = (name, value) => {
    return {
        type: administrationType.UPDATE_FIELD,
        name,
        value
    };
};

export const clearUserRelatedRole = () => {
    return {
        type: administrationType.CLEAR_USER_RELATED_ROLE
    };
};