import * as manageTagaNoteTemplateActionType from '../../actions/tagaNoteTemplate/manageTagaNoteTemplateActionType';
const INITAL_STATE = {
    favoriteCategoryListData: [],
    templateList: [],
    deleteList: [],
    taganoteTypeList: []
};
export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case manageTagaNoteTemplateActionType.FILLING_DATA: {
            return { ...state, favoriteCategoryListData: action.fillingData };
        }
        case manageTagaNoteTemplateActionType.PUTTEMPLATELIST_DATA: {
            return { ...state, templateList: action.fillingData.data };
        }
        case manageTagaNoteTemplateActionType.DELETETEMPLATE_RESULT: {
            return { ...state, deleteList: action.fillingData.data };
        }
        case manageTagaNoteTemplateActionType.RECORDLIST_RESULT: {
            return { ...state, recordList: action.fillingData.data };
        }
        case manageTagaNoteTemplateActionType.ADDTEMPLATE_RESULT: {
            return { ...state, templateList: action.fillingData.data };
        }
        case manageTagaNoteTemplateActionType.EDITTEMPLATE_RESULT: {
            return { ...state, editlateList: action.fillingData.data };
        }
        case manageTagaNoteTemplateActionType.SET_TAGANOTE_TYPE_LIST: {
            return { ...state,  taganoteTypeList: action.fillingData.data };
        }
        default:
            return state;
    }
};