import * as problemProcedureActionType from './problemProcedureActionType';

export const TOGGLE_SMALLTHEME = 'small';
export const TOGGLE_MEDIUMTHEME = 'medium';
export const TOGGLE_LARGETHEME = 'large';
export const TOGGLE_DARKTHEME = 'dark';

export const toggleSmallTheme = () => ({
  type: TOGGLE_SMALLTHEME
});
export const toggleMediumTheme = () => ({
  type: TOGGLE_MEDIUMTHEME
});
export const toggleLargeTheme = () => ({
  type: TOGGLE_LARGETHEME
});

export const toggleDarkTheme = () => ({
  type: TOGGLE_DARKTHEME
});

export const resetAll = () => {
  return {
      type: problemProcedureActionType.RESET_ALL
  };
};

export const getCommonUsedProbProc = ()=> {
  return {
      type: problemProcedureActionType.GET_COMMON_USED_PROB_PROC
  };
};

export const getQualifier = (cncptId, encounterSdt)=> {
  return {
      type: problemProcedureActionType.GET_QUALIFER,
      cncptId,
      encounterSdt
  };
};

export const getProbProcAddDetails = (cncptId, callback = null)=> {
  return {
      type: problemProcedureActionType.GET_PROB_PROC_ADD_DETAILS,
      cncptId
  };
};

export const resetSelectedVal = () => {
  return {
      type: problemProcedureActionType.RESET_SELECTED_VAL
  };
};

export const saveProbProc = (probProc, callback = null) => {
  return {
      type: problemProcedureActionType.SAVE_PROB_PROC,
      probProc,
      callback
  };
};

export const deleteProbProc = (termKey, termType, callback = null) => {
  return {
      type: problemProcedureActionType.DELETE_PROB_PROC,
      termKey,
      termType,
      callback
  };
};