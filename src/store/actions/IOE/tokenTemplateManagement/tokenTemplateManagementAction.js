import * as actionType from './tokenTemplateManagementActionType';

export const getTokenTemplateList = ({params={},callback}) => {
  return {
    type: actionType.GET_TOKEN_TMPL_LIST,
    params,
    callback
  };
};

export const saveReminderTemplateList = ({params={},callback}) => {
  return {
    type: actionType.SAVE_TOKEN_TMPL_LIST,
    params,
    callback
  };
};

export const getInstructionList = ({params={},callback}) => {
  return {
    type: actionType.GET_INSTRUCTION_LIST,
    params,
    callback
  };
};

export const saveInstructionList = ({params={},callback}) => {
  return {
    type: actionType.SAVE_INSTRUCTION_LIST,
    params,
    callback
  };
};

export const getReminderTmplById = ({params={},callback}) => {
  return {
    type: actionType.GET_TOKEN_TMPL_OBJECT,
    params,
    callback
  };
};

export const getReminderInsturctsByName = ({params={},callback}) => {
  return {
    type: actionType.GET_TOKEN_INSTRUCT_LIST,
    params,
    callback
  };
};

export const saveReminderTemplate = ({params={},callback}) => {
  return {
    type: actionType.SAVE_TOKEN_TEMPLAT,
    params,
    callback
  };
};

export const getCodeIoeFormItems = ({params={},callback}) => {
  return {
    type: actionType.GET_TOKEN_FORM_ITEMS,
    params,
    callback
  };
};

export const getPrintDialogList = ({ params = {}, callback }) => {
  return {
    type: actionType.GET_TOKEN_PRINTVIEW_LIST,
    params, callback
  };
};