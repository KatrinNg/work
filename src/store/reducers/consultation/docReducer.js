import * as types from '../../actions/consultation/doc/docActionType';

const initState = {
    // inOutDocTypeList: [],
    docList: [],
    docHistoryList: [],
    previewData: null
};
export default (state = initState, action = {}) => {
    switch (action.type) {
        case types.UPDATE_STATE: {
            return {
                ...state,
                ...action.data
            };
        }
/*        case types.SAVE_DOC_TYPE: {
            return {
                ...state,
                inOutDocTypeList: action.data
            };
        }*/
        case types.SAVE_DOC_LIST:
            return {
                ...state,
                docList: action.data
            };
        case types.SAVE_SINGLE_DOC:
            return {
                ...state,
                previewData: action.data
            };
        case types.SAVE_SINGLE_DOC_HISTORY:
            return {
                ...state,
                docHistoryList: action.data
            };
        default:
            return state;
    }
};
