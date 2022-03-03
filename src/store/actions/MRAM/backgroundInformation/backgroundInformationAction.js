import * as backgroundInformationActionType from './backgroundInformationActionType';

// for temporary test
export const saveDraftBackgroundInfo = ({params={},callback}) => {
  return {
      type: backgroundInformationActionType.SAVE_BACKGROUND_INFO_DATA,
      params,
      callback
  };
};

export const saveDraftCarePlanInfo = ({params={},callback}) => {
  return {
      type: backgroundInformationActionType.SAVE_CAREPLAN_INFO_DATA,
      params,
      callback
  };
};
