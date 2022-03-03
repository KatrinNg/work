import * as types from './loginActionType';

export const doLogin = (params, callback = null) => {
    return {
        type: types.DO_LOGIN,
        params: params,
        callback
    };
};

export const updateState = (data) => {
    return {
        type: types.UPDATE_STATE,
        data
    };
};

export const logout = () => {
    return {
        type: types.LOGOUT
    };
};

export const refreshToken = () => {
    return {
        type: types.REFRESH_TOKEN
    };
};

export const resetErrorMsg = () => {
    return {
        type: types.RESET_ERROR_MESSAGE
    };
};

export const getServiceNotice = () => {
    return {
        type: types.GET_SERVICE_NOTICE
    };
};

export const getContactUs = () => {
    return {
        type: types.GET_CONTACT_US
    };
};

export const putLoginInfo = (curLoginServiceAndClinic) => {
    return {
        type: types.PUT_LOGIN_INFO,
        curLoginServiceAndClinic

    };
};

export const updateisTemporaryLogin = (params) => {
    return {
        type: types.UPDATE_ISTEMPORARYLOGIN,
        params
    };
};

export const preLoadData = () => {
    return {
        type: types.PRE_LOAD_DATA
    };
};

export const updateLoginForm = (data) => {
    return {
        type: types.UPDATE_LOGIN_FORM,
        data
    };
};

export const putSiteId = (siteId) => {
    return {
        type: types.LOGIN_PUT_SITE_ID,
        siteId
    };
};