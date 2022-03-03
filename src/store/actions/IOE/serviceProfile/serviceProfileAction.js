import * as actionType from './serviceProfileActionType';

export const getServiceProfileFrameworkList = ({params={},callback}) => {
  return {
    type: actionType.GET_SERVICE_PROFILE_FRAMEWORK_LIST,
    params,
    callback
  };
};

export const getServiceProfildItemDropdownList = ({params={},callback}) => {
  return {
    type: actionType.GET_SERVICE_PROFILE_DROPDOWN_LIST,
    params,
    callback
  };
};

export const saveServiceProfileTemplate = ({params={},callback}) => {
  return {
    type: actionType.SAVE_SERVICE_PROFILE,
    params,
    callback
  };
};

export const getServiceProfileTemplate = ({params={},callback}) => {
  return {
    type: actionType.GET_SERVICE_PROFILE_TEMPLATE,
    params,
    callback
  };
};

export const getTemplateAllItemsForSearch = ({params={},callback}) => {
  return {
    type: actionType.GET_TEMPLATE_ALL_ITEMS_FOR_SEARCH,
    params,
    callback
  };
};

export const getServiceProfileList = ({params={},callback}) => {
  return {
    type: actionType.GET_SERVICE_PROFILE_LIST,
    params,
    callback
  };
};

export const saveServiceProfileList = ({params={},callback}) => {
  return {
    type: actionType.SAVE_SERVICE_PROFILE_LIST,
    params,
    callback
  };
};

export const checkTemplateNameData = ({params={},callback}) => {
    return {
      type: actionType.CHECKTEMPLATENAMEREPEAT_DATA,
      params,
      callback
    };
  };