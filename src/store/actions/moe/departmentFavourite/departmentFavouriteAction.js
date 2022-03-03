import * as moeType from './../moeActionType';

export const updateField = (updateData) => {
    return {
        type: moeType.UPDATE_DEPT_FAVOURITE_FIELD,
        updateData
    };
};


export const getDeptFavouriteList=(params)=>{
    return {
        type:moeType.GET_DEPT_FAVOURITE_LIST,
        params
    };
};