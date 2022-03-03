import * as problemActionType from '../../../../actions/consultation/dxpx/diagnosis/diagnosisActionType';

const INITAL_STATE = {
    templateList:[],
    saveReturnList:[],
    inputProblemList:[],
    recordTypeList:[],
    chronicProblemList:[]
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case problemActionType.PROBLEM_LIST_DATA: {
            return { ...state, templateList: action.fillingData.data};
        }
        case problemActionType.SAVE_PROBLEM_RESULT: {
            return { ...state,saveReturnList:action.fillingData.data};
        }
        case problemActionType.INPUT_PROBLEM_LIST: {
          return {
            ...state,
            inputProblemList:action.inputProblemList
          };
        }
        case problemActionType.PUT_DIAGNOSIS_RECORD_TYPE: {
          return {
            ...state,
            recordTypeList:action.fillingData
          };
        }
        case problemActionType.CHRONIC_PROBLEM_LIST: {
          return {
            ...state,
            chronicProblemList:action.chronicProblemList
          };
        }
        default:
      return state;
    }
};