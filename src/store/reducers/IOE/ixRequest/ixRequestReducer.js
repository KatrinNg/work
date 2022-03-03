import * as type from '../../../actions/IOE/ixRequest/ixRequestActionType';

const INIT_STATE = {
  frameworkMap:new Map(),
  lab2FormMap:new Map(),
  dropdownMap:new Map(),
  ioeFormMap:new Map(),
  itemMapping:new Map(),
  categoryMap:new Map(),
  expressIoeMap:new Map(),
  labOptions:[],
  searchItemList: [],
  codeIoeFormPanelMapping: [],
  ioeExpressQuickBtnDtoList:[]
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case type.IX_REQUEST_FRAMEWORK_LIST:{
      return{
        ...state,
        frameworkMap:action.frameworkMap,
        lab2FormMap:action.lab2FormMap,
        ioeFormMap:action.ioeFormMap,
        labOptions:action.labOptions
      };
    }
    case type.IX_REQUEST_ITEM_DROPDOWN_LIST:{
      return{
        ...state,
        dropdownMap:action.dropdownMap
      };
    }
    case type.IX_REQUEST_SPECIFIC_ITEM_MAPPING:{
      return{
        ...state,
        itemMapping:action.itemMapping
      };
    }
    case type.IX_ALL_ITEMS_FOR_SEARCH:{
      return{
        ...state,
        searchItemList:action.searchItemList
      };
    }
    case type.ALL_IX_PROFILE_TEMPLATE:{
      return{
        ...state,
        categoryMap:action.categoryMap
      };
    }
    case type.CODE_IOE_FORM_PANEL_MAPPING:{
      return{
        ...state,
        codeIoeFormPanelMapping:action.codeIoeFormPanelMapping
      };
    }
    case type.PUT_LIST_EXPRESS_IOE:{
      return{
        ...state,
        expressIoeMap:action.expressIoeMap,
        ioeExpressQuickBtnDtoList:action.ioeExpressQuickBtnDtoList
      };
    }
    default:
      return state;
  }
};