import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';




const initState = {
    errorText: ''
};


export const setGlobal = (data) => ({
    type: ActionTypes.SET_GLOBAL,
    payload: data,
});

export const setErrorText = (data) => ({
    type: ActionTypes.SHOW_ERROR_TIPS,
    payload: data,
});

const reducer = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_GLOBAL:
            const newState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState;
        case ActionTypes.SHOW_ERROR_TIPS:
            const newState1 = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState1;
        default:
            return state;
    }
}

export default reducer;