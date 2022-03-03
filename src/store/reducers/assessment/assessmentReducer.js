import { cloneDeep } from 'lodash';
import * as types from '../../actions/assessment/assessmentActionType';

const INIT_STATE={
  assessmentSettingList:[],
  assessmentSettingCheckedItemList: [],
  fieldDropList:[],
  fieldNormalRangeMap:new Map(),
  patientAssessmentList:[],
  patientAssessmentValMap:new Map(),
  outputAssesmentFieldMap:new Map(),
  cascadeDropMap:new Map(),
  emptyCascadeFieldMap:new Map(),
  resultIdMap:new Map(),
  versionMap:new Map(),
  createdByMap:new Map(),
  createdDtmMap:new Map()
};

export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case types.ASSESSMENT_CHECKED_ITEM_LIST:
      return{
        ...state,
        assessmentSettingCheckedItemList:action.assessmentSettingCheckedItemList
      };
    case types.ASSESSMENT_SETTING_ITEM_LIST:
      return{
        ...state,
        assessmentSettingList:action.assessmentSettingList
      };
    case types.PATIENT_ASSESSMENT_LIST:{
      let patientAssessmentList = cloneDeep(action.patientAssessmentList);
      let outputAssesmentFieldMap = action.outputAssesmentFieldMap;
      if (patientAssessmentList.length>0) {
        patientAssessmentList.forEach(element=>{
          element.fields = [element.fields];
        });
      }
      return{
        ...state,
        patientAssessmentList,
        outputAssesmentFieldMap
      };
    }
    case types.PATIENT_ASSESSMENT_VAL:{
      return{
        ...state,
        patientAssessmentValMap: action.patientAssessmentValMap,
        patientAssessmentList: action.patientAssessmentList,
        resultIdMap: action.resultIdMap,
        versionMap: action.versionMap,
        createdByMap: action.createdByMap,
        createdDtmMap: action.createdDtmMap
      };
    }
    case types.FIELD_DROP_LIST:{
      return{
        ...state,
        fieldDropList: action.fieldDropList,
        cascadeDropMap: action.cascadeDropMap,
        emptyCascadeFieldMap: action.emptyCascadeFieldMap
      };
    }
    case types.FIELD_NORMAL_RANGE_MAP:{
      return{
        ...state,
        fieldNormalRangeMap: action.fieldNormalRangeMap
      };
    }
    default:
      return state;
  }
};