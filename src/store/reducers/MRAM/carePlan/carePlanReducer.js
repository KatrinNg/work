import * as type from '../../../actions/MRAM/carePlan/carePlanActionType';
import * as carePlanConstant from '../../../../constants/MRAM/carePlan/carePlanConstant';
import { toNumber } from 'lodash';

const INIT_STATE = {
    carePlanFieldValMap:new Map()
};

function generateFieldDefaultVal(mramId) {
  let val = '';
  switch (mramId) {
    case '193':
      val = carePlanConstant.RISK_LEVEL_CATEGORY[0].value;
      break;
    default:
      break;
  }
  return val;
}

function generateFieldValMap(valDto) {
  let fieldValMap = new Map();
  //prepare
  for (let [key, value] of carePlanConstant.MRAM_CARE_PLAN_ID_MAP) {
    Object.values(value).forEach(element => {
      let fieldId = `${key}_${element}`;
      let tempObj = valDto!==null?valDto[fieldId]:null;
      // handle default value
      let val =!!tempObj?tempObj.value:generateFieldDefaultVal(element);
      fieldValMap.set(fieldId,{
        codeMramId:toNumber(element),
        id:!!tempObj?tempObj.id:null,
        operationType:null,
        version:!!tempObj?tempObj.version:null,
        value:val,
        isError:false
      });
    });
  }
  return fieldValMap;
}


export default (state = INIT_STATE, action = {}) => {
  switch (action.type) {
    case type.INIT_MRAM_CARE_PLAN_FIELD_VALUE:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        carePlanFieldValMap:fieldValMap
      };
    }
    default:
      return state;
  }
};