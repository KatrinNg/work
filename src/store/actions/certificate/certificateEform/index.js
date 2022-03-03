const PREFFIX = 'CERTIFICATE_EFORM';
export const GET_CERT = `${PREFFIX}_GET_CERT`;
export const UPDATE_STATE = `${PREFFIX}_UPDATE_STATE`;
export const RESET_ALL = `${PREFFIX}_RESET_ALL`;
export const INIT_DATA = `${PREFFIX}_INIT_DATA`;
export const DELETE_CERT = `${PREFFIX}_DELETE_CERT`;
export const HANDLE_CLOSE = `${PREFFIX}_HANDLE_CLOSE`;
export const CREATE_EFORM_TEMPLATE = `${PREFFIX}_CREATE_EFORM_TEMPLATE`;
export const CREATE_EFORM_ASSESSMENT = `${PREFFIX}_CREATE_EFORM_ASSESSMENT`;
export const SELECT_EFORM_RESULT = `${PREFFIX}_SELECT_EFORM_RESULT`;
export const LIST_EFORM_RESULT = `${PREFFIX}_LIST_EFORM_RESULT`;
export const SAVE_EFORM_RESULT = `${PREFFIX}_SAVE_EFORM_RESULT`;
export const DELETE_EFORM_RESULT = `${PREFFIX}_DELETE_EFORM_RESULT`;
export const MARK_COMPLETE = `${PREFFIX}_MARK_COMPLETE`;
export const REFRESH_PAGE = `${PREFFIX}_REFRESH_PAGE`;
export const GET_CONTACT_PERSON = `${PREFFIX}_GET_CONTACT_PERSON`;
export const OPEN_DOCUMENT_IMPORT_DIALOG = `${PREFFIX}_OPEN_DOCUMENT_IMPORT_DIALOG`;
export const CLOSE_DOCUMENT_IMPORT_DIALOG = `${PREFFIX}_CLOSE_DOCUMENT_IMPORT_DIALOG`;
export const IMPORT_CIMS1_CLINICAL_DOC = `${PREFFIX}_IMPORT_CIMS1_CLINICAL_DOC`;
export const GET_EFORM_RESULT = `${PREFFIX}_GET_EFORM_RESULT`;
export const FIND_LATEST_DOC = `${PREFFIX}_FIND_LATEST_DOC`;

export const getContactPerson = () => {
    return {
        type: GET_CONTACT_PERSON
    };
};

export const updateState = (updateData) => {
    return {
        type: UPDATE_STATE,
        updateData
    };
};

export const updateStateAsync = (updateData) => dispatch => {
    dispatch({
        type: UPDATE_STATE,
        updateData
    });
    return Promise.resolve();
};

export const resetAll = () => {
    return {
        type: RESET_ALL
    };
};

export const initData = () => {
    return {
        type: INIT_DATA
    };
};

export const getCert = (params, copies, callback) => {
    return {
        type: GET_CERT,
        params,
        copies,
        callback
    };
};

export const deleteCert = (params, callback) => {
    return {
        type: DELETE_CERT,
        params,
        callback
    };
};

export const handleClose = () => {
    return {
        type: HANDLE_CLOSE
    };
};

export const createEformTemplate = (eformId, importOutDocId, importData) => {
    return {
        type: CREATE_EFORM_TEMPLATE,
        eformId,
        importOutDocId,
        importData
    };
};

export const createEformAssessment = (callback = null) => {
    return {
        type: CREATE_EFORM_ASSESSMENT,
        callback
    };
};

export const listEformResult = (params, callback) => {
    return {
        type: LIST_EFORM_RESULT,
        params,
        callback
    };
};

export const saveEformResult = (actType, params, callback = null) => {
    return {
        type: SAVE_EFORM_RESULT,
        actType,
        params,
        callback
    };
};

export const selectEformResult = (resultId, isEdit) => {
    return {
        type: SELECT_EFORM_RESULT,
        resultId,
        isEdit
    };
};

export const deleteEformResult = (resultId, callback) => {
    return {
        type: DELETE_EFORM_RESULT,
        resultId,
        callback
    };
};

export const markComplete = (resultId) => {
    return {
        type: MARK_COMPLETE,
        resultId
    };
};

export const refreshPage = (isRefreshList, callback) => {
    return {
        type: REFRESH_PAGE,
        isRefreshList,
        callback
    };
};

export const openClinicalDocImportDialog = () => {
    return {
        type: OPEN_DOCUMENT_IMPORT_DIALOG
    };
};

export const closeClinicalDocImportDialog = () => {
    return {
        type: CLOSE_DOCUMENT_IMPORT_DIALOG
    };
};

export const importCIMS1ClinicalDoc = (outDocId, outDocTypeId, callback) => {
    return {
        type: IMPORT_CIMS1_CLINICAL_DOC,
        outDocId,
        outDocTypeId,
        callback
    };
};

export const getEformResult = (eformResultId, outDocTypeId, callback) => {
    return {
        type: GET_EFORM_RESULT,
        eformResultId,
        outDocTypeId,
        callback
    };
};

export const findLatestDoc = (patientKey, outDocTypeId, siteId, callback) => {
    return {
        type: FIND_LATEST_DOC,
        patientKey,
        outDocTypeId,
        siteId,
        callback
    };
};
