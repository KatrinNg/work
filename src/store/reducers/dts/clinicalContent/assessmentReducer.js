
import * as assessmentActionType from '../../../actions/dts/clinicalContent/assessmentActionType';

const initState = {
    assessmentData: "",
    updateAssessmentResult: "",
    assessmentEncntrData: []
};

export default (state = initState, action = {}) => {

    switch (action.type) {
        case assessmentActionType.ASSESSMENT_DATA: {
            return {
                ...state,
                assessmentData: action.params
            };
        }
        case assessmentActionType.UPDATE_ASSESSMENT_SAGA_RESULT: {
            return {
                ...state,
                updateAssessmentResult: action.params
            };
        }
        case assessmentActionType.ASSESSMENT_ENCNTR_DATA: {
            return {
                ...state,
                assessmentEncntrData: action.params
            };
        }
        default: {
            return state;
        }
    }

};