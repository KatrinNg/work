import * as actionType from '../../actions/saam/saamPatientActionType';
import {
    getSaamPatientSummary
} from '../../actions/saam/saamPatientAction';

const initState = {
    patientSummary: null
    , getSaamPatientSummary
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case actionType.PUT_PATIENT_SUMMARY: {
            return { ...state, patientSummary: action.data };
        }
        case actionType.CLEAR_PATIENT_SUMMARY: {
            return { ...state, patientSummary: null };
        }
        default:
            state.getSaamPatientSummary = getSaamPatientSummary;
            return { ...state };
    }
};