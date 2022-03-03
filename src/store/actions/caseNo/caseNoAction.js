import * as CaseNoActionType from './caseNoActionType';

export const openCaseNoDialog = ({ caseDialogStatus, isNoPopup = false, caseNoForm, caseCallBack = null }) => {
    return {
        type: CaseNoActionType.OPEN_CASENO_DIALOG,
        caseDialogStatus,
        isNoPopup,
        caseNoForm,
        caseCallBack
    };
};

export const closeCaseNoDialog = () => {
    return {
        type: CaseNoActionType.CLOSE_CASENO_DIALOG
    };
};

export const updateCaseNoForm = (form) => {
    return {
        type: CaseNoActionType.UPDATE_CASENO_FORM,
        form
    };
};

export const updateState = (updateData) => {
    return {
        type: CaseNoActionType.UPDATE_STATE,
        updateData
    };
};

export const saveCaseNo = (caseDialogStatus, params, callback, currentUpdateField = '') => {
    return {
        type: CaseNoActionType.SAVE_CASENO,
        caseDialogStatus,
        params,
        callback,
        currentUpdateField
    };
};

export const listCasePrefix = (serviceCd = '') => {
    return {
        type: CaseNoActionType.LIST_CASE_PREFIX,
        serviceCd
    };
};

export const getEncounterGroup = () => {
    return {
        type: CaseNoActionType.GET_ENCOUNTER_GROUP
    };
};

export const selectCaseTrigger = ({ trigger, selectCaseList = null, caseSelectCallBack = null }) => {
    return {
        type: CaseNoActionType.SELECT_CASE_TRIGGER,
        trigger,
        selectCaseList,
        caseSelectCallBack
    };
};

export const selectCaseOk = (selectCase) => {
    return {
        type: CaseNoActionType.CASENO_DIALOG_OK,
        selectCase
    };
};

export const selectCaseCancel = () => {
    return {
        type: CaseNoActionType.CASENO_DIALOG_CANCEL
    };
};

export const saveCaseNoWithAlias = (caseDialogStatus, params, callback, currentUpdateField = '') => {
    return {
        type: CaseNoActionType.SAVE_CASE_NO_WITH_ALIAS,
        caseDialogStatus,
        params,
        callback,
        currentUpdateField
    };
};

export const getEncounterTypesBySiteId=(svcCd,siteId,callback)=>{
    return {
        type:CaseNoActionType.GET_ENCOUNTER_TYPE_LIST_BY_SITE,
        svcCd,
        siteId,
        callback
    };
};

export const listEncntrGrpList=(params)=>{
    return {
        type:CaseNoActionType.LIST_ENCOUNTER_GROUP,
        params
    };
};

export const listPatientCase=(params,callback)=>{
    return {
        type:CaseNoActionType.LIST_PATIENT_CASE,
        params,
        callback
    };
};