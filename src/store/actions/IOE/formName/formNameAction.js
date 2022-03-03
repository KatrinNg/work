import * as formNameActionType from './formNameActionType';

export const requestFormName = ({params={},callback}) => {
  return {
    type: formNameActionType.IOE_FORM_NAME_LIST,
    params,
    callback
  };
};

export const requestRequestedBy = ({params={},callback}) => {
  return {
    type: formNameActionType.IOE_REQUESTED_BY,
    params,
    callback
  };
};