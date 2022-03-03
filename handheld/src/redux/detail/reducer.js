import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';

const initState = {
    treatment_data: [],
    currentTreatment: null,
    isScanTreatment: false,
    startTreatment: null,
    patientDetail: {},
    bpList: [],
    spList: [],
    patientDetail: {},
    precautionList: []
};

const detail = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_DETAIL:
            const newState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState;
        default:
            return state;
    }
}

export default detail;