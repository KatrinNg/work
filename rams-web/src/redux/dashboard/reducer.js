import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';
import moment from 'moment'



const initState = {
    dataList: [],
    lastUpdateTime: moment(new Date()).format('HH:mm:ss'),
    systemDtm: '',
    hotItems: [],
};


const reducer = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_DASHBOARD_LIST:
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