import * as ideasActionType from '../../actions/ideas/ideasActionType';

const INITAL_STATE = {
    detectCardResult: null
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case ideasActionType.RESET: {
            return {
                ...INITAL_STATE
            };
        }
        case ideasActionType.GET_SMART_CARD_TOKEN: {
            return {
                ...state
            };
        }
        case ideasActionType.GET_SMART_CARD_TOKEN_V2: {
            return {
                ...state
            };
        }
        case ideasActionType.GET_CARD_TYPE: {
            return {
                ...state
            };
        }
        case ideasActionType.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }
        default:
            return { ...state };
    }
};
