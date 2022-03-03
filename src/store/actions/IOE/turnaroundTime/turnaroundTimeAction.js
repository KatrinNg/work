import * as turnaroundTimeActionType from './turnaroundTimeActionType';

export const getIoeFormDropList = ({params={},callback}) => {
  return {
    type: turnaroundTimeActionType.GET_IOE_FORM_DROP_LIST,
    params,
    callback
  };
};

export const getIoeTurnaroundTimeList = ({params={},callback}) => {
  return {
    type: turnaroundTimeActionType.GET_IOE_TURNAROUND_TIME_LIST,
    params,
    callback
  };
};

export const updateIoeTurnaroundTimeList = ({params={},callback}) => {
  return {
    type: turnaroundTimeActionType.UPDATE_IOE_TURNAROUND_TIME_LIST,
    params,
    callback
  };
};