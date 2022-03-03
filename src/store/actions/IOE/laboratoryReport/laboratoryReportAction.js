import * as laboratoryReportActionType from './laboratoryReportActionType';

export const getIoeLaboratoryReportList = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_LIST,
    params,
    callback
  };
};

export const getIoeLaboratoryReportVersionList = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_VERSION_LIST,
    params,
    callback
  };
};

export const getIoeLaboratoryReportPdf = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_PDF,
    params,
    callback
  };
};

export const saveIoeLaboratoryReportComment = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.SAVE_IOE_LABORATORY_REPORT_COMMENT,
    params,
    callback
  };
};

export const getIoeLaboratoryReportCommentList = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_COMMMENT_LIST,
    params,
    callback
  };
};

export const getPatientById = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.GET_PATINET_INFOMATION,
    params,
    callback
  };
};

export const getPatientByIdToEmpty = ({params={},callback}) => {
    return {
      type: laboratoryReportActionType.PUT_PATINET_INFOMATIONINFO_TO_EMPTY,
      params,
      callback
    };
  };

export const getPatientByIdClinic = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.GET_PATINET_INFOMATIONINFO,
    params,
    callback
  };
};


export const getRequestDetailById = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_DETAIL,
    params,
    callback
  };
};

export const updateIoeReportFollowUpStatus = ({params={},callback}) => {
  return {
    type: laboratoryReportActionType.UPDATE_IOE_LABORATORY_FOLLOWUP_STATUS,
    params,
    callback
  };
};