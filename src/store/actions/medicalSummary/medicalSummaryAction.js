import * as MedicalSummaryActionType from './medicalSummaryActionType';

export const getMedicalSummaryDropList = ({params={},callback}) => {
  return {
    type: MedicalSummaryActionType.GET_MEDICAL_DROP_LIST,
    params,
    callback
  };
};

export const getMedicalSummaryVal = ({params={},callback}) => {
  return {
    type: MedicalSummaryActionType.GET_MEDICAL_SUMMARY_VAL,
    params,
    callback
  };
};

export const updateMedicalSummary = ({params={},callback}) => {
  return {
    type: MedicalSummaryActionType.UPDATE_MEDICAL_SUMMARY,
    params,
    callback
  };
};
