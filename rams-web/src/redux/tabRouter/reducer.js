import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';


const initState = {
    curTabs: ['/'], // current tabs array
    reloadPath: 'null', //The tab path that needs to be refreshed
};

const tabRouter = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_CURTABS:
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

export default tabRouter;