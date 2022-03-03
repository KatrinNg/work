import * as sessionManagementActionType from './sessionManagementActionType';

export const updateState = (updateData) => {
    return {
        type: sessionManagementActionType.UPDATE_STATE,
        updateData
    };
};

export const listSessionOfService = (svcCd) => {
    return {
        type: sessionManagementActionType.LIST_SESSION_OF_SERVICE,
        svcCd
    };
};

export const listSessionOfSite = (siteId) => {
    return {
        type: sessionManagementActionType.LIST_SESSION_OF_SITE,
        siteId
    };
};

export const listSingleSessionById = (sessId) => {
    return {
        type: sessionManagementActionType.LIST_SESSION_OF_SINGLE_SESSION,
        sessId
    };
};

export const createSession = (params, siteId, isServiceAdmin) => {
    return {
        type: sessionManagementActionType.CREATE_SESSION,
        params,
        siteId,
        isServiceAdmin
    };
};

export const updateSession = (params, sessId, isServiceAdmin) => {
    return {
        type: sessionManagementActionType.UPDATE_SESSION,
        params,
        sessId,
        isServiceAdmin
    };
};

export const deleteSession = (params,callback) => {
    return {
        type: sessionManagementActionType.DELETE_SESSION,
        params,
        callback
    };
};

export const triggerUpdateSessionConfig = () => {
    return {
        type: sessionManagementActionType.UPDATE_SESSION_CONFIG
    };
};
