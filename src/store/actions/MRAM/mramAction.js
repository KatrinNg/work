import * as type from './mramActionType';

export const initMramFieldValueList = ({params={},callback}) => {
  return {
    type: type.INIT_MRAM_FIELD_VALUE_LIST,
    params,
    callback
  };
};

export const getMramFieldValueList = ({params={},callback}) => {
  return {
    type: type.GET_MRAM_FIELD_VALUE_LIST,
    params,
    callback
  };
};

export const saveMramFieldValueList = ({params={},callback}) => {
  return {
    type: type.SAVE_MRAM_FIELD_VALUE_LIST,
    params,
    callback
  };
};

export const previewReportPatient = ({params={},callback}) => {
  return {
    type: type.GET_PREVIEW_REPORT_PATIENT_DATA,
    params,
    callback
  };
};

export const previewReportDoctor = ({params={},callback}) => {
  return {
    type: type.GET_PREVIEW_REPORT_DOCTOR_DATA,
    params,
    callback
  };
};

export const checkDuplicatedMramRecordOnSameDay = ({params={},callback}) => {
  return {
    type: type.CHECK_DUPLICATED_MRAM_RECORD_ON_SAME_DAY,
    params,
    callback
  };
};

export const checkMramRecordCreatedWithin6Months = ({params={},callback}) => {
  return {
    type: type.CHECK_MRAM_RECORD_CREATED_WITHIN_6_MONTHS,
    params,
    callback
  };
};

export const checkMramRecordExisted = ({params={},callback}) => {
  return {
    type: type.CHECK_MRAM_RECORD_EXISTED,
    params,
    callback
  };
};