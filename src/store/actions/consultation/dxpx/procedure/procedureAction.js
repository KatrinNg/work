import * as procedureActionType from './procedureActionType';

export const requestProcedureTemplateList = ({params={},callback}) => {
    return {
        type: procedureActionType.PROCEDURE_REQUEST_DATA,
        params,
        callback
    };
};
export const saveEditTemplateList = ({params={},callback}) => {
    return {
        type: procedureActionType.SAVE_PROCEDURE_TEMPLATE_DATA,
        params,
        callback
    };
};


export const saveTemplateList = ({params={},callback}) => {
	return {
		type: procedureActionType.SAVE_PROCEDURE_DATA,
		params,
		callback
	};
};
export const getEditTemplateList = ({params={},callback}) => {
  return {
      type: procedureActionType.GET_EDITTEMPLATELIST_DATA,
      params,
      callback
  };
};

export const getInputProcedureList = ({params={},callback}) => {
  return {
    type: procedureActionType.GET_INPUT_PROCEDURE_LIST,
    params,
    callback
  };
};

export const getProcedureCodeDiagnosisStatusList = ({params={},callback}) => {
  return {
    type: procedureActionType.GET_PROCEDURE_STATUS,
    params,
    callback
  };
};


export const updatePatientProcedure = ({params={},callback}) => {
  return {
    type: procedureActionType.UPDATE_PATIENT_PROCEDURE,
    params,
    callback
  };
};
export const deletePatientProcedure = ({params={},callback}) => {
  return {
    type: procedureActionType.DELETE_PATIENT_PROCEDURE,
    params,
    callback
  };
};

export const searchProcedureList = ({params={},callback}) => {
  return {
    type: procedureActionType.GET_PROCEDURE_SEARCH_LIST,
    params,
    callback
  };
};

export const queryProcedureList = ({params={},callback}) => {
  return {
    type: procedureActionType.QUERY_PROCEDURE_LIST,
    params,
    callback
  };
};