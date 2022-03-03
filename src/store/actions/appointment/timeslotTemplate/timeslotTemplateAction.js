import * as TimeslotTemplateActionTypes from './timeslotTemplateActionType';

export const updateSearchField=(name,value,shortName)=>{
    return{
        type:TimeslotTemplateActionTypes.UPDATE_SEARCH_FIELD,
        name,
        value,
        shortName
    };
};

export const resetAll = () => {
    return {
        type: TimeslotTemplateActionTypes.RESET_ALL
    };
};

export const searchTimslotTemplate=(params)=>{
    return{
        type:TimeslotTemplateActionTypes.SEARCH_TIMESLOT_TEMPLATE,
        params
    };
};

export const openDialog=(isOpen,statusEnum)=>{
    return{
        type:TimeslotTemplateActionTypes.OPEN_DIALOG,
        isOpen,
        statusEnum
    };
};
export const closeDialog=()=>{
    return{
        type:TimeslotTemplateActionTypes.CLOSE_DIALOG
    };
};

export const updateField=(name,value,week)=>{
    return{
        type:TimeslotTemplateActionTypes.UPDATE_FIELD,
        name,
        value,
        week
    };
};

export const saveTemplate=(params,searchParams)=>{
    return{
        type:TimeslotTemplateActionTypes.SAVE_TEMPLATE,
        params,
        searchParams
    };
};

export const updateTemplate=(params,searchParams)=>{
    return{
        type:TimeslotTemplateActionTypes.UPDATE_TEMPLATE,
        params,
        searchParams
    };
};

export const getTimeslotTemplate=(params)=>{
    return{
        type:TimeslotTemplateActionTypes.GET_TIMESLOT_TEMPLATE,
        params
    };
};