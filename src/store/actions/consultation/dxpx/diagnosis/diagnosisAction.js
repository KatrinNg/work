import * as problemType from './diagnosisActionType';

export const requestProblemTemplateList = ({params={},callback}) => {
  return {
      type: problemType.PROBLEM_REQUEST_DATA,
      params,
      callback
  };
};

export const saveEditTemplateList = ({params={},callback}) => {
  return {
      type: problemType.SAVE_PROBLEM_TEMPLATE_DATA,
      params,
      callback
  };
};


export const saveTemplateList = ({params={},callback}) => {
  return {
      type: problemType.SAVE_PROBLE_DATA,
      params,
      callback
  };
};

export const getEditTemplateList = ({params={},callback}) => {
  return {
      type: problemType.GET_EDITTEMPLATELIST_DATA,
      params,
      callback
  };
};

export const getInputProblemList = ({params={},callback}) => {
  return {
    type: problemType.GET_INPUT_PROBLEM_LIST,
    params,
    callback
  };
};

export const getProblemCodeDiagnosisStatusList = ({params={},callback}) => {
  return {
    type: problemType.GET_PROBLEM_STATUS,
    params,
    callback
  };
};

export const updatePatientProblem = ({params={},callback}) => {
  return {
    type: problemType.UPDATE_PATIENT_PROBLEM,
    params,
    callback
  };
};
export const deletePatientProblem = ({params={},callback}) => {
  return {
    type: problemType.DELETE_PATIENT_PROBLEM,
    params,
    callback
  };
};



export const searchProblemListNoPagination = ({params={},callback}) => {
  return {
    type: problemType.GET_PROBLEM_SEARCH_LIST_NO_PAGINATION,
    params,
    callback
  };
};

export const listCodeDiagnosisTypes = ({params={}}) => {
  return {
    type: problemType.GET_DIAGNOSIS_RECORD_TYPE,
    params
  };
};

export const queryProblemList = ({params={},callback}) => {
  return {
    type: problemType.QUERY_PROBLEM_LIST,
    params,
    callback
  };
};

export const getHistoricalRecords = ({params={},callback}) => {
  return {
    type: problemType.GET_HISTORICAL_RECORD_LIST,
    params,
    callback
  };
};

export const savePatient = ({params={},callback}) => {
  return {
    type: problemType.SAVE_PATIENT_INFORMATION,
    params,
    callback
  };
};

export const getChronicProblemList = ({params={},callback}) => {
  return {
    type: problemType.GET_CHRONIC_PROBLEM_LIST,
    params,
    callback
  };
};

export const getCodeLocalTerm = ({params={},callback}) => {
  return {
    type: problemType.GET_CODE_LOCAL_TERM_STATUS,
    params,
    callback
  };
};

export const getALLDxPxList = ({params={},callback}) => {
  return {
    type: problemType.GET_ALL_DXPX_LIST,
    params,
    callback
  };
};

export const addPsoriasis = ({ params={}, callback }) => {
  return {
    type: problemType.ADD_PSORIASIS,
    params,
    callback
  };
};

export const getCurrentDate = ({ callback }) => {
  return {
    type: problemType.GET_CURRENT_DATE,
    callback
  };
};