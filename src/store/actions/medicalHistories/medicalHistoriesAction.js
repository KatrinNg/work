import * as actionType from './medicalHistoriesActionType';

export const getOccupationalHistoryList = ({params={},callback}) => {
  return {
    type: actionType.GET_OCCUPATIONAL_HISTORY_LIST,
    params,
    callback
  };
};

export const getOccupationalLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_OCCUPATIONAL_LOG_LIST,
    params,
    callback
  };
};

export const getOccupationalOthersLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_OCCUPATIONAL_OTHERS_LOG_LIST,
    params,
    callback
  };
};

export const getSocialDropdownList = ({params={},callback}) => {
  return {
    type: actionType.GET_SOCIAL_DROPDOWN_LSIT,
    params,
    callback
  };
};

export const getPastTerminologyServiceList = ({params={},callback}) => {
  return {
    type: actionType.GET_PAST_TERMINOLOGY_SERVICE_LIST,
    params,
    callback
  };
};

export const getFamilyTerminologyServiceList = ({params={},callback}) => {
  return {
    type: actionType.GET_FAMILY_TERMINOLOGY_SERVICE_LIST,
    params,
    callback
  };
};

export const queryProblemList = ({params={},callback}) => {
  return {
    type: actionType.FUZZY_QUERY_PROBLEM_LIST,
    params,
    callback
  };
};

export const getFamilyRelationshipList = ({params={},callback}) => {
  return {
    type: actionType.GET_FAMILY_RELATIONSHIP_LIST,
    params,
    callback
  };
};

export const saveMedicalHistory = ({params={},callback}) => {
  return {
    type: actionType.SAVE_MEDICAL_HISTORY,
    params,
    callback
  };
};

export const getFamilyHistoryList = ({params={},callback}) => {
  return {
    type: actionType.GET_FAMILY_HISTORY_LIST,
    params,
    callback
  };
};

export const getFamilyHistoryProblemDetailLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_FAMILY_HISTORY_PROBLEM_DETAIL_LOG_LIST,
    params,
    callback
  };
};

export const getFamilyHistoryOthersLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_FAMILY_HISTORY_OTHERS_LOG_LIST,
    params,
    callback
  };
};

export const getPastHistoryList = ({params={},callback}) => {
  return {
    type: actionType.GET_PAST_HISTORY_LIST,
    params,
    callback
  };
};

export const getPastHistoryProblemDetailLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_PAST_HISTORY_PROBLEM_DETAIL_LOG_LIST,
    params,
    callback
  };
};

export const getSocialHistoryCommonLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_SOCIAL_HISTORY_COMMON_LOG_LIST,
    params,
    callback
  };
};

export const getSocialHistoryOthersLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_SOCIAL_HISTORY_OTHERS_LOG_LIST,
    params,
    callback
  };
};

export const getSocialHistoryList = ({params={},callback}) => {
  return {
    type: actionType.GET_SOCIAL_HISTORY_LIST,
    params,
    callback
  };
};

export const getSocialHistoryPassiveSmokingInformationLogList = ({params={},callback}) => {
  return {
    type: actionType.GET_SOCIAL_HISTORY_PASSIVE_SMOKING_INFORMATION_LOG_LIST,
    params,
    callback
  };
};

export const saveFamilyHistory = ({params={},callback}) => {
  return {
    type: actionType.SAVE_FAMILY_HISTORY,
    params,
    callback
  };
};

export const saveSocialHistory = ({params={},callback}) => {
  return {
    type: actionType.SAVE_SOCIAL_HISTORY,
    params,
    callback
  };
};

export const savePastMedicalHistory = ({params={},callback}) => {
  return {
    type: actionType.SAVE_PAST_MEDICAL_HISTORY,
    params,
    callback
  };
};

export const resetActiveTab = (activeTab = null) => {
  return {
      type: actionType.SAVE_MEDICAL_HISTORY_ACTIVE_TAB,
      activeTab
  };
};
