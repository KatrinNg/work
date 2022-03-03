import * as type from '../../../actions/IOE/serviceProfile/serviceProfileActionType';

const INIT_STATE = {
  serviceProfileTemplateList:[],
  frameworkMap:new Map(),
  lab2FormMap:new Map(),
  dropdownMap:new Map(),
  ioeFormMap:new Map(),
  labOptions:[],
  searchItemList:[],
  serviceProfileTemplate: {}
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case type.SERVICE_PROFILE_FRAMEWORK_LIST:{
      return{
        ...state,
        frameworkMap:action.frameworkMap,
        lab2FormMap:action.lab2FormMap,
        ioeFormMap:action.ioeFormMap,
        labOptions:action.labOptions
      };
    }
    case type.SERVICE_PROFILE_DROPDOWN_LIST:{
      return{
        ...state,
        dropdownMap:action.dropdownMap
      };
    }
    case type.SERVICE_PROFILE_TEMPLATE:{
      return{
        ...state,
        serviceProfileTemplate:action.serviceProfileTemplate
      };
    }
    case type.TEMPLATE_ALL_ITEMS_FOR_SEARCH:{
      return{
        ...state,
        searchItemList:action.searchItemList
      };
    }
    case type.SET_SERVICE_PROFILE_LIST:{
      return{
        ...state,
        serviceProfileTemplateList:action.serviceProfileTemplateList
      };
    }
    default:
      return state;
  }
};