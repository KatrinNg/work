import * as moeType from './moeActionType';

export const doLogin = (params) => {
    return {
        type: moeType.LOGIN,
        params: params
    };
};

export const searchDrug = (params) => {
    return {
        type: moeType.SEARCH_DRUG,
        params
    };
};

export const searchItemCollapse = (item) => {
    return {
        type: moeType.SEARCH_ITEM_COLLAPSE,
        item
    };
};

// export const getDrug = (item, childItem, searchValue) => {
//     return {
//         type: moeType.GET_DRUG,
//         item,
//         childItem,
//         searchValue
//     };
// };

export const getCodeList = (params) => {
    return {
        type: moeType.GET_CODE_LIST,
        params
    };
};

export const deleteDrug = (item) => {
    return {
        type: moeType.DELETE_DRUG,
        item
    };
};

export const resetDrugList = () => {
    return {
        type: moeType.RESET_DRUG_LIST
    };
};

export const updateField = (updateData) => {
    return {
        type: moeType.UPDATE_FIELD,
        updateData
    };
};

export const saveDrug = (codeList, params, orderData, patient, isDeleteOrder, resetDuplicate, callback, orderRemark, isSubmit, spaCallback) => {
    return {
        type: moeType.SAVE_DRUG,
        params: params,
        orderData,
        patient,
        isDeleteOrder,
        resetDuplicate,
        callback,
        orderRemark,
        codeList,
        isSubmit,
        spaCallback
    };
};

export const cancelOrder = (params) => {
    return {
        type: moeType.CANCEL_ORDER,
        params: params
    };
};

export const deleteOrder = (params, callBack) => {
    return {
        //type: moeType.DELETE_DRUG,
        type: moeType.DELETE_ORDER,
        params: params,
        callBack: callBack
    };
};

export const getOrderDrugList = (params) => {
    return {
        type: moeType.GET_ORDER_DRUG_LIST,
        params: params
    };
};
export const confirmDuplicateDrug = (drugList, selectedList) => {
    return {
        type: moeType.CONFIRM_DUPLICATE_DRUG,
        drugList,
        selectedList
    };
};

export const getPdf = (params) => {
    return {
        type: moeType.PRINT_PREVIEW,
        params: params
    };
};

export const printLog = (params) => {
    return {
        type: moeType.PRINT_PRINT_LOG,
        params: params
    };
};

export const getSpecialIntervalText = (params, callBack) => {
    return {
        type: moeType.GET_SPECIAL_INTERVAL_TEXT,
        params: params,
        callBack
    };
};

export const convertDrug = (params) => {
    return {
        type: moeType.CONVERT_DRUG,
        params: params
    };
};

export const getTotalDangerDrug = (params, callBack) => {
    return {
        type: moeType.GET_TOTAL_DANGER_DRUG,
        params: params,
        callBack: callBack
    };
};

export const getAllergyChecking = (params, callBack) => {
    return {
        type: moeType.GET_ALLERGY_CHECKING,
        params: params,
        callBack: callBack
    };
};

// export const getOrder=(params)=>{
//     return{
//         type:moeType.GET_ORDER_DRUG_LIST,
//         params
//     };
// };

export const getMDSEnq = (params) => {
    return {
        type: moeType.GET_MDS_ENQUIRY,
        params: params
    };
};

export const getHlab1502VTM = (resolve, reject) => {
    return {
        type: moeType.GET_HLAB1502_VTM,
        resolve,
        reject
    };
};

export const saveHlab1502Negative = () => {
    return {
        type: moeType.SAVE_HLAB1502_NEGATIVE
    };
};

export const deleteHlabNegative = (params) => {
    return {
        type: moeType.DELETE_HLAB1502_NEGATIVE,
        params
    };
};

export const addNoKnownAllergy = () => {
    return {
        type: moeType.ADD_NO_KNOWN_ALLERGY
    };
};

export const reconfirmAllergy = (/*params*/) => {
    return {
        type: moeType.RECONFIRM_ALLERGY/*,
        params*/
    };
};

export const logout = (callback) => {
    return {
        type: moeType.LOGOUT,
        callback: callback
    };
};