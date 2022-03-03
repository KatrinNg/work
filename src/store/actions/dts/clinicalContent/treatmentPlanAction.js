import * as treatmentPlanActionType from './treatmentPlanActionType';

export const setRedirect = params => {
    return {
        type: treatmentPlanActionType.SET_REDIRECT,
        params
    };
};