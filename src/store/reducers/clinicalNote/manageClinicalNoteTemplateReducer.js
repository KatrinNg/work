import * as manageClinicalNoteTemplateActionType from '../../actions/clinicalNoteTemplate/manageClinicalNoteTemplateActionType';

const INITAL_STATE = {
    favoriteCategoryListData:[],
    templateList:[],
    deleteList:[]
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case manageClinicalNoteTemplateActionType.FILLING_DATA: {
            return { ...state, favoriteCategoryListData: action.fillingData.data};
        }
        case manageClinicalNoteTemplateActionType.PUTTEMPLATELIST_DATA: {
            return { ...state, templateList: action.fillingData.data};
        }
        case manageClinicalNoteTemplateActionType.DELETETEMPLATE_RESULT: {
            return { ...state, deleteList: action.fillingData.data};
        }
        case manageClinicalNoteTemplateActionType.RECORDLIST_RESULT: {
            return { ...state, recordList: action.fillingData.data};
        }
        case manageClinicalNoteTemplateActionType.ADDTEMPLATE_RESULT: {
            return { ...state, templateList: action.fillingData.data};
        }
        case manageClinicalNoteTemplateActionType.EDITTEMPLATE_RESULT: {
            return { ...state, editlateList: action.fillingData.data};
        }
        default:
      return state;
    }
};