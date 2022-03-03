import * as procedureSetActionType from './procedureSetActionType';

export const getProcedureCommonSet_saga = () => {
    return {
        type:procedureSetActionType.GET_PROCEDURE_COMMON_SET_SAGA
    };
};

export const getProcedureQualifier_saga = (params) => {
    return {
        type:procedureSetActionType.GET_PROCEDURE_QUALIFIER_SAGA,
        params
    };
};

export const getProcedureSetGroup_saga = (params) => {
    return {
        type:procedureSetActionType.GET_PROCEDURE_SET_GROUP_SAGA,
        params
    };
};

export const updateProcedureQualifier_saga = (params) => {
    return {
        type:procedureSetActionType.UPDATE_PROCEDURE_QUALIFIER_SAGA,
        params
    };
};
