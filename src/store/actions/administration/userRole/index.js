const PREFFIX = 'USER_ROLE';
export const RESET_ALL = `${PREFFIX}_RESET_ALL`;
export const UPDATE_STATE = `${PREFFIX}_UPDATE_STATE`;
export const SAVE_USER_ROLE = `${PREFFIX}_SAVE_USER_ROLE`;
export const PREVIEW_USER_ROLE_DETAILS = `${PREFFIX}_PREVIEW_USER_ROLE_DETAILS`;
export const SELECT_MENU_LIST = `${PREFFIX}_SELECT_MENU_LIST`;
export const SEARCH_ACCESS_RIGHT = `${PREFFIX}_SEARCH_ACCESS_RIGHT`;
export const GET_ACCESS_RIGHT = `${PREFFIX}_GET_ACCESS_RIGHT`;
export const OPEN_MENU = `${PREFFIX}_OPEN_MENU`;
export const GET_USER_ROLES = `${PREFFIX}_GET_USER_ROLES`;
export const LOAD_USER_ROLES = `${PREFFIX}_LOAD_USER_ROLES`;
export const INIT_ROLE_MEMBER = `${PREFFIX}_INIT_ROLE_MEMBER`;
export const LOAD_USER_MEMBER = `${PREFFIX}_LOAD_USER_MEMBER`;
export const EDIT_USER_ROLE_BY_ID = `${PREFFIX}_EDIT_USER_ROLE_BY_ID`;
export const CREATE_USER_ROLE = `${PREFFIX}_CREATE_USER_ROLE`;
export const DELETE_USER_ROLES = `${PREFFIX}_DELETE_USER_ROLES`;
export const UPDATE_REPLICABLE_ROLE = `${PREFFIX}_UPDATE_REPLICABLE_ROLE`;

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

export const editUserRoleById = (roleId) => {
    return {
        type: EDIT_USER_ROLE_BY_ID,
        roleId
    };
};

export const createUserRole = () => {
    return {
        type: CREATE_USER_ROLE
    };
};

export const deleteUserRoles = (roleIds) => {
    return {
        type: DELETE_USER_ROLES,
        roleIds
    };
};

export const saveUserRole = (params) => {
    return {
        type: SAVE_USER_ROLE,
        params
    };
};

export const selectAccessRight = (accessRights) => {
    return {
        type: SELECT_MENU_LIST,
        accessRights
    };
};
export const searchAccessRight = (params) => {
    return {
        type: SEARCH_ACCESS_RIGHT,
        params
    };
};

export const openMenu = (accessRightCd) => {
    return {
        type: OPEN_MENU,
        accessRightCd
    };
};

export const getUserRoles = () => {
    return {
        type: GET_USER_ROLES
    };
};

export const updateReplicableRole = (value) => {
    return {
        type: UPDATE_REPLICABLE_ROLE,
        value
    };
};