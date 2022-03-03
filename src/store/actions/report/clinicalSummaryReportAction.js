import * as clinicalSummaryReportActionType from './clinicalSummaryReportActionType';

export const previewReportClinicalSummary = ({params={},callback}) => {
  return {
    type: clinicalSummaryReportActionType.PREVIEW_CLINICAL_SUMMARY_REPORT,
    params,
    callback
  };
};
