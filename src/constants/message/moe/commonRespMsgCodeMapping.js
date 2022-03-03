export const COMMON_RESP_MSG_CODE = {
    COMMON_APPLICATION_ERROR: '115030',//An application error has occurred and an error log is being generated.
    COMMON_SUCCESS: '115000',//Success
    COMMON_TOKEN_EXPIRE_ERROR: '115001',//Token has expired, please log in again.
    COMMON_TOKEN_INVALID_ERROR: '115002',//User or password is invalid!
    COMMON_PARAMETER_ERROR: '115003',//Invalid parameter!
    COMMON_VERSION_ERROR: '115004',//Updated by others.
    COMMON_SYSTEM_ERROR: '115005',//System error.
    COMMON_RESOURCE_ACCESS_DENIED_ERROR: '115006',//Resource access denied.
    COMMON_RECORDS_CONCURRENT_ERRORS: '115007',//Server Busy, Please Try Again Later.
    COMMON_RECORDS_NOT_EXISTED: '115008',//Records not existed.
    COMMON_NOT_ATTEND_PATIENT:'115009'//Please attend the patient first.
};

export const COMMON_RESP_MSG_CODE_MAPPING = {
    '1': COMMON_RESP_MSG_CODE.COMMON_TOKEN_EXPIRE_ERROR,
    '2': COMMON_RESP_MSG_CODE.COMMON_TOKEN_INVALID_ERROR,
    '3': COMMON_RESP_MSG_CODE.COMMON_PARAMETER_ERROR,
    '4': COMMON_RESP_MSG_CODE.COMMON_VERSION_ERROR,
    '5': COMMON_RESP_MSG_CODE.COMMON_SYSTEM_ERROR,
    '6': COMMON_RESP_MSG_CODE.COMMON_RESOURCE_ACCESS_DENIED_ERROR,
    '7': COMMON_RESP_MSG_CODE.COMMON_RECORDS_CONCURRENT_ERRORS,
    '8': COMMON_RESP_MSG_CODE.COMMON_RECORDS_NOT_EXISTED,
    '30': COMMON_RESP_MSG_CODE.COMMON_APPLICATION_ERROR
};

// export const API_RESP_MSG_CODE_MAPPING = [
//     { 'URL': '/moe/patientSummary', 'RespCode': '31', 'MessageCode': '115131' },
//     { 'URL': '/moe/patientSummary', 'RespCode': '32', 'MessageCode': '115132' }
// ];

export const API_RESP_MSG_CODE_MAPPING = {
    '/moe/login': {
        '45': '115545'
    },
    '/moe/listDrugHistory': {
        '54': '115554'
    },
    '/moe/updateOrder': {
        '36': '115536',
        '37': '115537',
        '38': '115538',
        '45': '115545',
        '46': '115546'
    },
    '/moe/deleteOrder': {
        '45': '115545'
    },
    '/moe/getMaxDosage': {
        '44': '115544'
    },
    '/moe/listMDSEnquiries': {
        '33': '115533',
        '34': '115534'
    },
    '/moe/patientSummary': {
        '55': '115555',
        '56': '115556'
    },
    '/moe/patientAllergy': {
        '49': '115549',
        '50': '115550',
        '51': '115551'
    },
    '/moe/bulkUpdatePatientAllergy': {
        '55': '115555',
        '56': '115556'
    },
    '/moe/updateMyFavourites': {
        '39': '115539',
        '40': '115540'
    },
    '/deptFavMaint/moe/deleteFavouriteList': {
        '39': '115339',
        '40': '115340'
    },
    '/deptFavMaint/moe/listMyFavourite': {
        '42': '115342'
    },
    '/deptFavMaint/moe/deleteMyFavourites': {
        '39': '115339',
        '40': '115340'
    },
    '/deptFavMaint/moe/orderMyFavourites ': {
        '39': '115339',
        '40': '115340',
        '43': '115343'
    }
};

export const MOE_MSG_CODE = {
    MOE_ADD_TO_MY_FAV_SUCCESS: '115535',//Add to my favourite successful.
    MY_FAV_DELETE_DRUG_SET: '115557',
    MY_FAV_DELETE_DRUG_SET_WITHOUT_ITEM: '115558',
    CHECK_NO_ITEM_FOR_PRESCRIPTION: '115559',
    MY_FAV_DUPLICATED_DRUG_SET_NAME: '115543',
    MOE_UNSAVED_RECORD: '115560',
    DELETE_MOE_ORDER: '115561',
    DELETE_PRESCRIPTION_ITEM: '115562',
    DELETE_MOE_WITHOUT_ITEM: '115563',
    MOE_SAVE_ORDER_SUCCESS: '115547',//Order save successful.
    MOE_ADD_SET_TO_ORDER_FAILED: '115546',//%DRUGS% is suspended by the Pharmacy Department.You may contact the pharmacy for their available alternatives.
    AMEND_DOSE: '115564',
    GREATHER_THAN_MAX_DOSAGE: '115565',
    NO_ALLERGY_REMINDER: '115566',
    ALLERGY_RE_CONFIRM_NKDA: '115567',
    ALLERGY_RE_CONFIRM: '115568'
};