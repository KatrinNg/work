import * as assessmentActionType from './assessmentActionType';

export const getAssessment_saga = (params) => {
    return {
        type:assessmentActionType.GET_ASSESSMENT_SAGA,
        params
    };
};

export const updateAssessment_saga = (params) => {
    return {
        type:assessmentActionType.UPDATE_ASSESSMENT_SAGA,
        params
    };
};

export const getAssessmentEncntrByPatientKey_saga = (params) => {
    return {
        type:assessmentActionType.GET_ASSESSMENT_ENCNTR_SAGA,
        params
    };
};
