import * as type from './mainFrameActionType';

export const updateField = (updateData) => {
    return ({
        type: type.UPDATE_FIELD,
        updateData
    });
};

export const addTabs = (params, isDry) => {
    return {
        type: type.ADD_TABS,
        params,
        isDry
    };
};
export const deleteTabs = (params) => {
    return {
        type: type.DELETE_TABS,
        params
    };
};
export const deleteSubTabs = (params) => {
    return {
        type: type.DELETE_SUB_TABS,
        params
    };
};
export const refreshSubTabs = (params) => {
    return {
        type: type.REFRESH_SUB_TABS,
        params
    };
};
export const cleanSubTabs = () => {
    return {
        type: type.CLEAN_SUB_TABS
    };
};
export const deleteSubTabsByOtherWay = (params) => {
    return {
        type: type.DELETE_SUB_TABS_BY_OTHERWAY,
        params
    };
};
export const deleteTabsByOtherWay = (params) => {
    return {
        type: type.DELETE_TABS_BY_OTHERWAY,
        params
    };
};

export const changeTabsActive = (deep, key) => {
    return {
        type: type.CHANGE_TABS_ACTIVE,
        deep,
        key
    };
};

export const changeEditMode = (params) => {
    return {
        type: type.CHANGE_EDIT_MODE,
        params
    };
};

export const resetAll = () => {
    return {
        type: type.RESET_ALL
    };
};

export const skipTab = (accessRightCd, params, checkExist = false, componentParams) => {
    return {
        type: type.SKIP_TAB,
        accessRightCd,
        params,
        checkExist,
        componentParams
    };
};

export const redirectTab = (sourceAccessId, destAccessId, params) => {
    return {
        type: type.REDIRECT_TAB,
        sourceAccessId,
        destAccessId,
        params
    };
};

export const updateTabLabel = (accessRightCd, newLabel) => {
    return {
        type: type.UPDATE_TAB_LABEL,
        accessRightCd,
        newLabel
    };
};

export const cleanTabParams = (tabName) => {
    return {
        type: type.CLEAN_TAB_PARAMS,
        tabName
    };
};

export const updateTabs = (newObjs) => {
    return {
        type: type.UPDATE_TABS,
        newObjs
    };
};

export const updateCurTab = (name, doCloseFunc) => {
    return {
        type: type.UPDATE_CURRENT_TAB,
        name,
        doCloseFunc
    };
};

// Added by Renny refresh ES when click menu
export const updateRefreshTabFunc = (tabName, refreshTabFunc) => {
    return {
        type: type.UPDATE_REFRESH_TAB_FUNC,
        tabName,
        refreshTabFunc
    };
};
// End added by Renny refresh ES when click menu

// Added by Renny close all subTabs exclude excludeTabs
export const closePatientRelativeTabs = (excludeTabs, callback) => {
    return {
        type: type.CLOSE_PATIENT_RELATIVE_TABS
        , excludeTabs
        , callback
    };
};
// End added by Renny close all subTabs exclude excludeTabs

export const openMask = ({ functionCd }) => {
    return {
        type: type.OPEN_FUNCTION_MASK,
        functionCd
    };
};

export const closeMask = ({ functionCd }) => {
    return {
        type: type.CLOSE_FUNCTION_MASK,
        functionCd
    };
};

export const updateCallEsProblemFun = (callback) => {
    return {
        type: type.UPDATE_CALL_ES_PROBLEM_API,
        callback
    };
};

export const updateCallScnProblemFun = (callback) => {
    return {
        type: type.UPDATE_CALL_SCN_PROBLEM_API,
        callback
    };
};

export const updateEsPrintParams = (callback) => {
    return {
        type: type.UPDATE_ES_PRINT_PARAMS,
        callback
    };
};