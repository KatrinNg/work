import * as uamType from './userAccountActionType';

export const resetAll = () => {
    return {
        type: uamType.RESET_ALL
    };
};

export const updateState = (updateData) => {
    return {
        type: uamType.UPDATE_STATE,
        updateData
    };
};

export const updateUAInfo = (updateData) => {
    return {
        type: uamType.UPDATE_UAMINFO,
        updateData
    };
};

export const getUserInfoById = (userId, callback = null) => {
    return {
        type: uamType.GET_UAMINFO,
        userId,
        callback
    };
};

export const getUserList = (params) => {
    return {
        type: uamType.GET_USERLIST,
        params
    };
};

export const getSupervisorList = (userSvcCds) => {
    return {
        type: uamType.GET_SUPERVISOR_LIST,
        userSvcCds
    };
};

export const getSuggestLoginName = (surname, givname) => {
    return {
        type: uamType.GET_SUGGEST_LOGIN_NAME,
        surname,
        givname
    };
};

export const insertUser = (userDto) => {
    return {
        type: uamType.INSERT_USER,
        userDto
    };
};

export const updateUser = (userDto) => {
    return {
        type: uamType.UPDATE_USER,
        userDto
    };
};

export const listAllUserRole = (params) => {
    return {
        type: uamType.LIST_ALL_USER_ROLE,
        params
    };
};

export const deleteUser = (params, callback) => {
    return {
        type: uamType.DELETE_USER,
        params,
        callback
    };
};

export const submitChangePasscode = (params, callback = null) => {
    return {
        type: uamType.CHANGE_PASSCODE,
        params,
        callback
    };
};

export const getUserPasscode = (userId, callback = null) => {
    return {
        type: uamType.GET_USERPASSCODE,
        userId,
        callback
    };
};

export const resetPassword = (loginName, sendType, callback = null) => {
    return {
        type: uamType.USER_ACCOUNT_RESET_PASSWORD,
        loginName,
        sendType,
        callback
    };
};

export const genAccountStaffId=(userId,loginName,callback)=>{
    return {
        type:uamType.GEN_ACCOUNT_STAFF_ID,
        userId,
        loginName,
        callback
    };
};