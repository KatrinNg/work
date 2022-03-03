import * as procedureActionType from '../../../../actions/consultation/dxpx/procedure/procedureActionType';

const INITAL_STATE = {
    //favoriteCategoryListData:[],
    templateList:[],
    saveReturnList:[],
    inputProcedureList:[]
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case procedureActionType.PROCEDURE_LIST_DATA: {
            return { ...state, templateList: action.fillingData.data};
        }
        case procedureActionType.SAVE_PROCEDURE_RESULT: {
            return { ...state, saveReturnList: action.fillingData.data};
        }
        case procedureActionType.INPUT_PROCEDURE_LIST: {
          return {
            ...state,
            inputProcedureList: action.inputProcedureList
          };
        }
        default:
      return state;
    }
};