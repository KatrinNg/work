import * as ActionTypes from 'redux/actionTypes';

export const NAME = 'message';

const initState = {
    open: false,
    messageInfo: null,
};

const message = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.MESSAGE_CLEAN:
            return initState;
        case ActionTypes.MESSAGE_OPEN_MSG:
            return { ...state, ...action.payload }
        default:
            return state;
    }
}

export default message;