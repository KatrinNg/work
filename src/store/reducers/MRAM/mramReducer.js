import * as type from '../../actions/MRAM/mramActionType';

const INIT_STATE = {
  mramOriginObj: null
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case type.MRAM_FIELD_VALUE_LIST:{
      return{
        ...state,
        mramOriginObj:action.mramOriginObj
      };
    }
    default:
      return state;
  }
};