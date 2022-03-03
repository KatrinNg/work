import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';

const initState = {
    groupList: [],
    finishedGroupList: [],
    groupDetailList: []
};

const group = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_GROUP:
            const newState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            console.log(newState)
            return newState;
        case ActionTypes.SET_GROUP_DETAIL:
            const updateGroupDetailListState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return updateGroupDetailListState
        default:
            return state;
    }
}

export default group;