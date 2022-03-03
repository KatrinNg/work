import * as mramHistoryActionType from './mramHistoryActionType';

export const requestHistoryService = ({params={},callback}) => {
  return {
      type: mramHistoryActionType.SAVE_MRAM_HISTORY_DATA,
      params,
      callback
  };
};

export const deleteHistoryService = ({params={},callback}) => {
  return {
      type: mramHistoryActionType.DELETE_MRAM_HISTORY_DATA,
      params,
      callback
  };
};