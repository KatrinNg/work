import * as actionType from './ixRequestActionType';

export const getIxRequestFrameworkList = ({params={},callback}) => {
  return {
    type: actionType.GET_IX_REQUEST_FRAMEWORK_LIST,
    params,
    callback
  };
};

export const getIxRequestItemDropdownList = ({params={},callback}) => {
  return {
    type: actionType.GET_IX_REQUEST_ITEM_DROPDOWN_LIST,
    params,
    callback
  };
};

export const getIxRequestOrderList = ({params={},callback}) => {
  return {
    type: actionType.GET_IX_REQUEST_ORDER_LIST,
    params,
    callback
  };
};

export const saveIxRequestOrder = ({params={},callback}) => {
  return {
    type: actionType.SAVE_IX_REQUEST_ORDER,
    params,
    callback
  };
};

export const getIxRequestSpecificMapping = ({params={},callback}) => {
  return {
    type: actionType.GET_IX_REQUEST_SPECIFIC_ITEM_MAPPING,
    params,
    callback
  };
};

export const getIxAllItemsForSearch = ({params={},callback}) => {
  return {
    type: actionType.GET_IX_ALL_ITEMS_FOR_SEARCH,
    params,
    callback
  };
};

export const getAllIxProfileTemplate = ({params={},callback}) => {
  return {
    type: actionType.GET_ALL_IX_PROFILE_TEMPLATE,
    params,
    callback
  };
};

export const doAllOperation = ({params={},callback}) => {
  return {
    type: actionType.DO_ALL_OPERATION,
    params,
    callback
  };
};

export const doAllOperationSubmit = ({params={},callback}) => {
  return {
    type: actionType.DO_ALL_OPERATION_SUBMIT,
    params,
    callback
  };
};

export const doAllOperationSave = ({params={},callback}) => {
  return {
    type: actionType.DO_ALL_OPERATION_SAVE,
    params,
    callback
  };
};

export const getServiceSpecificFunctionInfo = ({params={},callback}) => {
  return {
    type: actionType.GET_SERVICE_SPECIFIC_FUNCTION_INFO,
    params,
    callback
  };
};

export const getCodeIoeFormPanelMapping = ({params={},callback}) => {
  return {
    type: actionType.GET_CODE_IOE_FORM_PANEL_MAPPING,
    params,
    callback
  };
};

export const getAntenatalServiceId = ({params={},callback}) => {
  return {
    type: actionType.GET_ANTENATAL_SERVICE_ID,
    params,
    callback
  };
};

export const getListExpressIoe = ({params={},callback}) => {
  return {
    type: actionType.GET_LIST_EXPRESS_IOE,
    params,
    callback
  };
};