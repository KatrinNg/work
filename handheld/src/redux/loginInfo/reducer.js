import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';
import cookie from 'storage/cookie';
const initState = {
    loginRoom: cookie.getCookie('loginRoom') || '',
    dept: "",
    roomList: [],
    loginHosp: '',

};

const loginInfo = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_LOGIN_ROOM:
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

export default loginInfo;