import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';
const initState = {
    barcode: null,
    roomInOut: {},
    showScan: false
};

const room = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_ROOM:
            const newState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState;
        case ActionTypes.SET_ROOM_DATA:
            const newState2 = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState2;
        case ActionTypes.SHOW_SCAN:
            const newState3 = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState3;
        default:
            return state;
    }
}

export default room;