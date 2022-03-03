import * as feetType from '../../../actions/MRAM/feet/feetActionType';
import * as feetConstant from '../../../../constants/MRAM/feet/feetConstant';
import { toNumber } from 'lodash';

const INIT_STATE = {
  feetFieldValMap: new Map()
};

function generateFieldDefaultVal(mramId) {
  let val = '';
  switch (mramId) {
    case '102':
      val = feetConstant.DL_MONOFILAMENT_TEST[0].value;
      break;
    case '103':
      val = feetConstant.DL_MONOFILAMENT_TEST[0].value;
      break;
    case '104':
      val = feetConstant.DL_128HZ_TUNING_FORK[0].value;
      break;
    case '105':
      val = feetConstant.DL_128HZ_TUNING_FORK[0].value;
      break;
    case '110':
      val = 'Not known';
      break;
    case '111':
      val = 'Not known';
      break;
    case '112':
      val = feetConstant.DL_ACHILLES_REFLEXES[0].value;
      break;
    case '113':
      val = feetConstant.DL_ACHILLES_REFLEXES[0].value;
      break;
    default:
      break;
  }
  return val;
}

function generateFieldValMap(valDto) {
  let fieldValMap = new Map();
  //prepare
  for (let [key, value] of feetConstant.MRAM_FEET_ID_MAP) {
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
    case feetType.INIT_MRAM_FEET_FIELD_VALUE:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        feetFieldValMap:fieldValMap
      };
    }
    default:
      return state;
  }
};