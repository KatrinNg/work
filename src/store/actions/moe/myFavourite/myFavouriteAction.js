import * as moeType from './../moeActionType';

export const updateField = (updateData) => {
    return {
        type: moeType.UPDATE_MY_FAVOURITE_FIELD,
        updateData
    };
};

export const deleteMyFavourite = (params, isParent, schFavInputVal) => {
    return {
        type: moeType.DELETE_FAVOURITE,
        params,
        isParent,
        schFavInputVal
    };
};

export const addToMyFavourite = (params, drugSet, codeList, isSave, favKeyword, delMultipleSet, callback,isSkipSave) => {
    return {
        type: moeType.ADD_TO_MY_FAVOURITE,
        params,
        drugSet,
        codeList,
        isSave,
        favKeyword,
        delMultipleSet,
        callback,
        isSkipSave
    };
};

export const filterMyFavourite = (params) => {
    return {
        type: moeType.FILTER_MY_FAVOURITE,
        params
    };
};

export const updateMyFavSearchInputVal = (params) => {
    return {
        type: moeType.UPDATE_FAV_SCHINPUTVAL,
        params
    };
};

export const reorderMyFavourite = (orderParams, searchParams, isOrderDetail) => {
    return {
        type: moeType.REORDER_MY_FAV,
        orderParams,
        searchParams,
        isOrderDetail
    };
};
