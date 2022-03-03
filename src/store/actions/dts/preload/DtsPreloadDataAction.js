import * as dtsPreloadDataActionType from './DtsPreloadDataActionType';

export const getDtsPreloadAllSpecialties = params => {
    return {
        type: dtsPreloadDataActionType.GET_ALL_SPECIALTIES,
        params
    };
};
export const getDtsPreloadAllAnaCode = params => {
    return {
        type: dtsPreloadDataActionType.GET_ALL_ANA_CODE,
        params
    };
};
export const getDtsPreloadAllCncCode = params => {
    return {
        type: dtsPreloadDataActionType.GET_ALL_CNC_CODE,
        params
    };
};

//find Codes in ["category1", "category2",..., "categoryN"]
export const getDtsAnaCodeByCategoryIn = params => {
    return {
        type: dtsPreloadDataActionType.POST_CATEGORIES_ANA,
        params
    };
};
export const getDtsCncCodeByCategoryIn = params => {
    return {
        type: dtsPreloadDataActionType.POST_CATEGORIES_CNC,
        params
    };
};