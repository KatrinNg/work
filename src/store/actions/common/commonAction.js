import * as CommonActionType from './commonActionType';

export const getEncounterTypeList = ({ params, actionType, isGetNew, callback }) => {
    return {
        type: CommonActionType.GET_ENCOUNTER_TYPE_LIST,
        params,
        actionType,
        isGetNew,
        callback
    };
};

export const getRoomsEncounterTypeList = ({ params, callback }) => {
    return {
        type: CommonActionType.GET_ROOMS_ENCOUNTER_TYPE_LIST,
        params,
        callback
    };
};

export const getCodeList = ({ params, actionType }) => {
    return {
        type: CommonActionType.GET_CODE_LIST,
        params,
        actionType
    };
};

export const listService = (params = {}) => {
    return {
        type: CommonActionType.LIST_SERVICE,
        params
    };
};

export const listClinic = (params = {}) => {
    return {
        type: CommonActionType.LIST_CLINIC,
        params: params
    };
};

export const openErrorMessage = (error, data = null, errorTitle = '') => {
    return {
        type: CommonActionType.OPEN_ERROR_MESSAGE,
        error: error,
        data: data,
        errorTitle
    };
};

export const closeErrorMessage = () => {
    return {
        type: CommonActionType.CLOSE_ERROR_MESSAGE
    };
};

export const openCommonCircular = () => {
    return {
        type: CommonActionType.HANDLE_COMMON_CIRCULAR,
        status: 'open'
    };
};

export const closeCommonCircular = () => {
    return {
        type: CommonActionType.HANDLE_COMMON_CIRCULAR,
        status: 'close'
    };
};

export const updateSearchBarValue = (value, isKeepData = null) => {
    return {
        type: CommonActionType.UPDATE_SEARCHBAR_VALUE,
        value,
        isKeepData
    };
};

export const openPromptDialog = () => {
    return {
        type: CommonActionType.PROMPT_MESSAGE_HANDLE,
        status: 'open'
    };
};

export const closePromptDialog = () => {
    return {
        type: CommonActionType.PROMPT_MESSAGE_HANDLE,
        status: 'close'
    };
};
export const print = (params) => {
    return {
        type: CommonActionType.PRINT_START,
        params
    };
};
export const goPrint = (params,goActionCallback) => {
    return {
        type: CommonActionType.GO_PRINT_START,
        params,
        goActionCallback
    };
};

export const openWarnSnackbar = (message) => {
    return {
        type: CommonActionType.HANDLE_WARN_SNACKBAR,
        message,
        status: 'open'
    };
};

export const closeWarnSnackbar = () => {
    return {
        type: CommonActionType.HANDLE_WARN_SNACKBAR,
        status: 'close'
    };
};

export const openCommonCircularDialog = () => {
    return {
        type: CommonActionType.OPEN_COMMON_CIRCULAR_DIALOG
    };
};

export const closeCommonCircularDialog = () => {
    return {
        type: CommonActionType.CLOSE_COMMON_CIRCULAR_DIALOG
    };
};

export const openIdleTimeDialog = () => {
    return {
        type: CommonActionType.HANDLE_IDLE_DIALOG,
        status: 'open'
    };
};
export const closeIdleTimeDialog = () => {
    return {
        type: CommonActionType.HANDLE_IDLE_DIALOG,
        status: 'close'
    };
};

export const openCleanMask = () => {
    return {
        type: CommonActionType.HANDLE_CLEAN_MASK,
        status: 'open'
    };
};

export const closeCleanMask = () => {
    return {
        type: CommonActionType.HANDLE_CLEAN_MASK,
        status: 'close'
    };
};
export const getGroupList = () => {
    return {
        type: CommonActionType.GET_GROUP
    };
};

export const getHospital = () => {
    return {
        type: CommonActionType.GET_HOSPITAL
    };
};

export const getSpecialty = () => {
    return {
        type: CommonActionType.GET_SPECIALTY
    };
};

export const josPrint = (params) => {
    return {
        type: CommonActionType.JOS_PRINT_START,
        params
    };
};

export const josPrinterCheck = (params) => {
    return {
        type: CommonActionType.JOS_PRINT_CHECK,
        params
    };
};

export const josPrinterStatusCheck = (params) => {
    return {
        type: CommonActionType.JOS_PRINTER_CHECK,
        params
    };
};

export const listPassport = () => {
    return {
        type: CommonActionType.LIST_PASSPORT
    };
};

export const listSpecReqTypes = (params) => {
    return {
        type: CommonActionType.LIST_SPECREQ_TYPES,
        params
    };
};

export const resetCommonCircular = () => {
    return {
        type: CommonActionType.RESET_COMMON_CIRCULAR
    };
};

export const getSessionsConfig = () => {
    return {
        type:CommonActionType.GET_SESSIONS_CONFIG
    };
};

export const getClcAntGestCalcParams = (params, callback) => {
    return {
        type: CommonActionType.GET_CLC_ANT_GEST_CALC_PARAMS,
        params,
        callback
    };
};

export const insertCommonAppLog = ({ params = {}, callback }) => {
    return {
        type: CommonActionType.INSERT_COMMON_APP_LOG,
        params,
        callback
    };
};

export const getLetterDefaultValue = (params,callback)=>{
    return {
        type:CommonActionType.GET_LETTER_DEFAULT_VALUE,
        params,
        callback
    };
};

export const updateState = (updateData) => {
    return {
        type: CommonActionType.UPDATE_STATE,
        updateData
    };
};
// params format: {clinicalDocumentType: 'G6PD',neonatalDocId: 30000120} (clinicalDocumentType pass 'G6PD' or 'CHT', neonatalDocId pass docId)
export const openCommonClinicalDocument = (params) => {
    return {
        type: CommonActionType.OPEN_COMMON_CLINICAL_DOCUMENT,
        params
    };
};

export const closeCommonClinicalDocument = () => {
    return {
        type: CommonActionType.CLOSE_COMMON_CLINICAL_DOCUMENT
    };
};

export const getSppSiteAlter = (callback) => {
    return {
        type: CommonActionType.GET_SPP_SITE_ALTER,
        callback
    };
};