import * as RegistrationType from './registrationActionType';

export const resetAll = () => {
    return {
        type: RegistrationType.RESET_ALL
    };
};

export const updatePatientOperateStatus = (status) => {
    return {
        type: RegistrationType.UPDATE_PATIENT_OPERATE_STATUS,
        status
    };
};

export const updatePatient = (params, callback = null) => {
    return {
        type: RegistrationType.UPDATE_PATIENT,
        params: params,
        callback
    };
};

export const registerPatient = (params, callback = null) => {
    return {
        type: RegistrationType.REGISTER_PATIENT,
        params: params,
        callback
    };
};

export const updateState = (updateData) => {
    return (dispatch, getState) => {
        dispatch({
            type: RegistrationType.UPDATE_STATE,
            updateData
        });
        return Promise.resolve();
    };
};

export const getPatientById = (patientKey, callback) => {
    return {
        type: RegistrationType.GET_PATINET_BY_ID,
        patientKey,
        callback
    };
};

// export const updatePatientField = (name, value) => {
//     return {
//         type: RegistrationType.UPDATE_PATIENT_FIELD,
//         name,
//         value
//     };
// };

export const searchPatient = (searchParams, callback) => {
    return {
        type: RegistrationType.SEARCH_PATIENT,
        searchParams,
        callback
    };
};
//find Char By ccCode
export const findCharByCcCode = ({ ccCode, charIndex, updateChiChar = null, ccCodeList = [], resetCalling = null}) => {
    return {
        type: RegistrationType.FIND_CHAR_BY_CC_CODE,
        charIndex,
        ccCode,
        updateChiChar,
        ccCodeList,
        resetCalling
    };
};
//update Chinese name Char
export const updateChiChar = (charIndex, char, ccCodeList) => {
    return {
        type: RegistrationType.UPDATE_CHI_CHAR,
        charIndex,
        char,
        ccCodeList
    };
};
//update babyInfo chinese name
export const updateBybyInfoChiChar = (charIndex, char, ccCodeList) => {
    return {
        type: RegistrationType.UPDATE_BABYINFO_CHI_CHAR,
        charIndex,
        char,
        ccCodeList
    };
};

export const resetBabyInfo = () => {
    return {
        type: RegistrationType.RESET_BABYINFO
    };
};

export const listValidForProblemPMI = (params, callback) => {
    return {
        type: RegistrationType.LIST_VALID_FOR_PROBLEM_PMI,
        params,
        callback
    };
};

export const confirmProblemPatient = ({ patientKeyList, loginName, callback }) => {
    return {
        type: RegistrationType.CONFIRM_PROBLEM_PATIENT,
        patientKeyList,
        loginName,
        callback
    };
};

export const getBabyInfo = (params, callback) => {
    return {
        type: RegistrationType.GET_BABYINFO,
        params,
        callback
    };
};

export const checkAccessRight = (callParams, accessRightCd, callback) => {
    return {
        type: RegistrationType.CHECK_ACCESS_RIGHT,
        callParams,
        accessRightCd,
        callback
    };
};

export const checkAccessRightByStaffId = (stuffId, accessRightCd, callback) => {
    return {
        type: RegistrationType.CHECK_ACCESS_RIGHT_BY_STAFFID,
        stuffId,
        accessRightCd,
        callback
    };
};

export const initMiscellaneous = (patientById) => {
    return {
        type: RegistrationType.INIT_MISCELLANEOUS,
        patientById
    };
};

export const checkValidPMIExist = ({ documentPairList, excludePatient, status, callback }) => {
    return {
        type: RegistrationType.CHECK_VALID_PMI_EXIST,
        documentPairList,
        callback,
        status,
        excludePatient
    };
};

export const createNewPMI = (patient) => {
    return {
        type: RegistrationType.CREATE_NEW_PMI,
        patient
    };
};


export const patientListDoNewPMI = (patient) => {
    return {
        type: RegistrationType.PATIENT_LIST_CREATE_NEW,
        patient
    };
};

export const patientSummaryEditPatient = ({ index, patientKey, pucChecking}) => {
    return {
        type: RegistrationType.PATIENT_SUMMARY_EDIT_PATIENT,
        index,
        patientKey,
        pucChecking
    };
};

export const blockFirstUpdatePhoneListAndRestore = (phoneList) => {
    return{
        type:RegistrationType.REGISTRATION_BLOCK_FIRST_UPDATE_PHONE_LIST_AND_RESTORE,
        phoneList
    };
};

export const searchAssociatedPersonWithHKID = (hkid) => {
    return {
        type: RegistrationType.SEARCH_ASSOCIATED_PERSON_WITH_HKID,
        hkid
    };
};

export const openMode = () => {
    return {
        type: RegistrationType.OPEN_MODE
    };
};

export const getExistClinicalData = (patientKey, callback) => {
    return {
        type: RegistrationType.GET_EXIST_CLINICAL_DATA,
        patientKey,
        callback
    };
};

export const mapPmiWithProvenDocVal=()=>{
    return {
        type:RegistrationType.MAP_PMI_WITH_PROVEN_VALUE
    };
};

// EHS Specific -- by Kk Lam
export const updatePatientEhsDto = (newPatientEhsDto) => {
    return {
        type: RegistrationType.UPDATE_PATIENT_EHS_DTO,
        newPatientEhsDto
    };
};

export const enrollEhsMember = (params, callback = null) => {
    return {
        type: RegistrationType.ENROLL_EHS_MEMBER,
        params: params,
        callback
    };
};


export const updatePatientBaseInfo = (object) => {
    return {
        type: RegistrationType.UPDATE_PATIENT_BASE_INFO,
        payload: object
    };
};

export const checkFamilyNo = (callback) => {
    return {
        type: RegistrationType.CHECK_FAMILY_NO,
        callback
    };
};

export const chiefParentCheckboxHandler = () => {
    return {
        type: RegistrationType.CHIEF_PARENT_CHECKBOX_HANDLER
    };
};

export const updateCgsSpec = (value) => {
    return {
        type: RegistrationType.UPDATE_CGS_SPEC,
        payload: { value: value }
    };
};

export const printRegSummary = (operation, format, registeredPatientList, pdfData, callback=null) => {
    return {
        type: RegistrationType.PRINT_REG_SUMMARY,
        payload: {
            operation: operation,
            typeOfFormat: format || '',
            registeredPatientList: registeredPatientList || [],
            pdfData: pdfData || ''
        },
        callback
    };
};

export const printGumLabel = (serviceCd, siteId, patientKey, base64, callback = null) => {
    return {
        type: RegistrationType.PRINT_GUM_LABEL,
        payload: {
            serviceCd: serviceCd,
            siteId: siteId,
            patientKey: patientKey,
            base64: base64 || ''
        },
        callback
    };
};

export const getPatientGrp = (patientKey, callback = null) => {
    return {
        type: RegistrationType.GET_PATIENT_KEY,
        patientKey: patientKey,
        callback
    };
};

export const pmiSMSCheckingLog = (params) => {
    return {
        type: RegistrationType.PMI_SMS_CHECKING_LOG,
        params
    };
};

export const fetchScreeningInfo = (id, callback) => {
    return {
        type: RegistrationType.FETCH_SCREENING_INFO,
        id,
        callback
    };
};

export const saveScreeningInfo = (payload) => {
    return {
        type: RegistrationType.SAVE_SCREENING_INFO,
        payload
    };
};