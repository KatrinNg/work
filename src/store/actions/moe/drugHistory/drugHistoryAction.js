import * as moeType from './../moeActionType';

export const updateField = (updateData) => {
    return {
        type: moeType.UPDATE_DRUG_HISTORY_FIELD,
        updateData
    };
};

export const filterDrugHistory=(params)=>{
    return{
        type:moeType.FILTER_DRUG_HISTORY_PARAMS,
        params
    };
};