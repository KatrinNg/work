import * as AssessmentActionType from './assessmentActionType';

// Assessment Setting
export const getAssessmentSettingItemList = ({params={},callback}) => {
  return {
    type: AssessmentActionType.GET_ASSESSMENT_SETTING_ITEM_LIST,
    params,
    callback
  };
};

export const getAssessmentCheckedItemList = ({params={},callback}) => {
  return {
    type: AssessmentActionType.GET_ASSESSMENT_CHECKED_ITEM_LIST,
    params,
    callback
  };
};

export const updateAssessmentSetting = ({params,callback}) => {
  return {
    type: AssessmentActionType.UPDATE_ASSESSMENT_SETTING_ITEM_LIST,
    params,
    callback
  };
};

export const getAssessmentFieldMappingList = ({params,callback}) => {
  return {
    type: AssessmentActionType.GET_ASSESSMENT_FIELD_MAPPING_LIST,
    params,
    callback
  };
};

// General Assessment
export const getPatientAssessmentList = ({params={},callback}) => {
  return {
    type: AssessmentActionType.GET_PATIENT_ASSESSMENT_LIST,
    params,
    callback
  };
};

export const updatePatientAssessment = ({params={},callback}) => {
  return {
    type: AssessmentActionType.UPDATE_PATIENT_ASSESSMENT,
    params,
    callback
  };
};

export const getFieldDropList = ({params={},callback}) => {
  return {
    type: AssessmentActionType.GET_FIELD_DROP_LIST,
    params,
    callback
  };
};

export const getFieldNormalRangeList = ({params={},callback}) => {
  return {
    type: AssessmentActionType.GET_FIELD_NORMAL_RANGE_MAP,
    params,
    callback
  };
};

// Assessment ordering Setting
export const getAssessmentOrderingList = ({params={},callback}) => {
    return {
      type: AssessmentActionType.GET_ORDERING_ASSESSMENT_LIST,
      params,
      callback
    };
  };
//Assessment History TableHeadList
export const getAssessmentHistoryTableHeadList = ({ params = {}, callback }) => {
  return {
    type: AssessmentActionType.GET_ASSESSMENT_HISTORY_TABLEHEAD_LIST,
    params,
    callback
  };
};
//Assessment History TableBodyList
export const getAssessmentHistoryTableBodyList = ({ params = {}, callback }) => {
  return {
    type: AssessmentActionType.GET_ASSESSMENT_HISTORY_TABLEBODY_LIST,
    params,
    callback
  };
};

export const saveAssessmentOrderingList = ({params={},callback}) => {
  return {
    type: AssessmentActionType.SAVE_ORDERING_ASSESSMENT_LIST,
    params,
    callback
  };
};

export const insertAssessmentLog = ({params={},callback}) => {
  return {
    type: AssessmentActionType.INSERT_ASSESSMENT_LOG,
    params,
    callback
  };
};