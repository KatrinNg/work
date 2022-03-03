import * as type from '../../../actions/IOE/tokenTemplateManagement/tokenTemplateManagementActionType';

const INIT_STATE = {
    tokenTemplateList:[],
    instructionListData:[]
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case type.TOKEN_TMPL_LIST:{
      return{
        ...state,
        tokenTemplateList:action.tokenTemplateList
      };
    }
    case type.INSTRUCTION_LIST_RESULT:{
      return{
        ...state,
       instructionListData:action.instructionListData
      };
    }
    default:
      return state;
  }
};