import * as turnaroundTimeActionType from '../../../actions/IOE/turnaroundTime/turnaroundTimeActionType';

const INIT_STATE = {
  turnaroundTimeList: []
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case turnaroundTimeActionType.IOE_TURNAROUND_TIME_LIST:{
      return{
        ...state,
        turnaroundTimeList:action.turnaroundTimeList
      };
    }
    default:
      return state;
  }
};