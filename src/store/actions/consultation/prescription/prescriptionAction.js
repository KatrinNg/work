import * as prescriptionActionTypes from './prescriptionActionType';

export const searchDrug=(params)=>{
    return{
        type:prescriptionActionTypes.SEARCH_DRUG,
        params
    };
};

export const searchItemCollapse=(item)=>{
    return{
        type:prescriptionActionTypes.SEARCH_ITEM_COLLAPSE,
        item
    };
};

export const getDrug=(item,childItem,searchValue)=>{
    return{
        type:prescriptionActionTypes.GET_DRUG,
        item,
        childItem,
        searchValue
    };
};

export const getCodeList=(params)=>{
    return{
        type:prescriptionActionTypes.GET_CODE_LIST,
        params
    };
};

export const deleteDrug=(item)=>{
    return{
        type:prescriptionActionTypes.DELETE_DRUG,
        item
    };
};

export const resetDrugList=()=>{
    return{
        type:prescriptionActionTypes.RESET_DRUG_LIST
    };
};
export const updateField=(name,value)=>{
    return{
        type:prescriptionActionTypes.UPDATE_FIELD,
        name,
        value
    };
};