import * as appointmentSlipFooterActionType from './appointmentSlipFooterActionType';

export const resetAll = () => {
    return {
        type: appointmentSlipFooterActionType.RESET_ALL
    };
};

export const loadEncounterTypeList=(encounterTypeList)=>{
    return{
        type: appointmentSlipFooterActionType.LOAD_ENCOUNTER_TYPE_LIST,
        encounterTypeList
    };
};

export const fetchRemarkDetails=(para)=>{
    return {
        type:appointmentSlipFooterActionType.FETCH_REMARK_DETAILS,
        para:para
    };
};

export const loadRemarkDetails=(remarks)=>{
    return{
        type:appointmentSlipFooterActionType.LOAD_REMARK_DETAILS,
        remarks:remarks
    };
};

export const editRemarkDetails = () => {
    return {
        type: appointmentSlipFooterActionType.EDIT_REMARK_DETAILS
    };
};

export const cancelEdit = () => {
    return {
        type: appointmentSlipFooterActionType.CANCEL_EDIT
    };
};

export const updateField=(name,para)=>{
    return {
        type:appointmentSlipFooterActionType.UPDATE_FIELD,
        name:name,
        para:para
    };
};

export const updateSlipFooter=(para)=>{
    return{
        type:appointmentSlipFooterActionType.UPDATE_SLIP_FOOTER,
        para:para
    };
};

export const reloadRemarkDetails=(remarks)=>{
    return{
        type:appointmentSlipFooterActionType.RELOAD_REMARKS_DETAILS,
        remarks:remarks
    };
};

export const clearRemarkDetails=()=>{
    return {
        type:appointmentSlipFooterActionType.CLEAR_REMARK_DETAILS
    };
};

