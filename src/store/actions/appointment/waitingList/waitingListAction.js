import * as Types from './waitingListActionType';

export const initiPage = () => {
    return {
        type: Types.INITI_PAGE
    };
};
export const updateField = (fields) => {
    return {
        type: Types.UPDATE_FIELD,
        fields
    };
};
export const searchWaitingList = (params, callback) => {
    return {
        type: Types.SEARCH_WAITING_LIST,
        params,
        callback
    };
};
export const cancelSearch = () => {
    return {
        type: Types.CANCEL_SEARCH
    };
};
export const resetAll = () => {
    return {
        type: Types.RESET_ALL
    };
};


export const addWaiting = () => {
    return {
        type: Types.ADD_WAITING
    };
};
// export const editWaiting = (waiting)=>{
//     return{
//         type:Types.EDIT_WAITING,
//         waiting
//     };
// };
export const cancelEditWaiting = () => {
    return {
        type: Types.CANCEL_EDIT_WAITING
    };
};

export const updateWaitingField = (fields) => {
    return {
        type: Types.UPDATE_WAITING_FIELD,
        fields
    };
};

export const getWaiting = (params) => {
    return {
        type: Types.GET_WAITING,
        params
    };
};

export const searchPatientList = (params, countryList = []) => {
    return {
        type: Types.SEARCH_PATIENT_LIST,
        params,
        countryList
    };
};

export const getPatient = (patientKey) => {
    return {
        type: Types.GET_PATIENT_BY_ID,
        patientKey
    };
};
export const saveWaiting = (params, callback) => {
    return {
        type: Types.SAVE_WAITING,
        params,
        callback
    };
};
export const deleteWaiting = (params, callback) => {
    return {
        type: Types.DELETE_WAITING,
        params,
        callback
    };
};

export const resetWaitDetail = (siteId = 0, encntrTypeId = 0) => {
    return {
        type: Types.RESET_WAIT_DETAIL,
        siteId,
        encntrTypeId
    };
};

export const getWaitingListAllRoleListConfig = (params) => {
    return {
        type:Types.WAITINGLIST_ALLROLE_LISTCONFIG,
        params
    };
};




