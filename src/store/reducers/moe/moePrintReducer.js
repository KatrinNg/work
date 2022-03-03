import * as types from '../../actions/moe/moeActionType';

const inital_state = {
   previewData: null
};

export default (state, action) => {
   if (!state) state = inital_state;
   switch (action.type) {
      case types.PRINT_PREVIEW: {
         return {
            ...state,
            previewData: action.data
         };
      }
      case types.PRINT_PRINT_LOG: {
         return {
            ...state,
            printData: action.data
         };
      }
      default:
         return { ...state };
   }
};