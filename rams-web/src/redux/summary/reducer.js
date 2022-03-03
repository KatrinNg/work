import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';




const initState = {
    patientSummary: {}
};


const reducer = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_SUMMARY:
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

export default reducer;