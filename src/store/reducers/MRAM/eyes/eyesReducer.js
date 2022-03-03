import * as eyesType from '../../../actions/MRAM/eyes/eyesActionType';
import * as eyesConstant from '../../../../constants/MRAM/eyes/eyesConstant';
import { toNumber } from 'lodash';

const INIT_STATE = {
  eyesFieldValMap: new Map()
};

function generateFieldDefaultVal(mramId) {
  let val = '';
  switch (mramId) {
    case '86':
      val = eyesConstant.DL_GRADE_OF_DIABETIC_RETINOPATHY[0].value;
      break;
    case '87':
      val = eyesConstant.DL_GRADE_OF_DIABETIC_RETINOPATHY[0].value;
      break;
    case '88':
      val = eyesConstant.DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[0].value;
      break;
    case '89':
      val = eyesConstant.DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY[0].value;
      break;
    case '96':
      val = eyesConstant.DL_ACCESSED_BY[0].value;
      break;
    case '99':
      val = eyesConstant.DL_DIABETIC_RETINOPATHY_SUMMARY[0].value;
      break;
    default:
      break;
  }
  return val;
}

function generateFieldValMap(valDto) {
  let fieldValMap = new Map();
  //prepare
  for (let [key, value] of eyesConstant.MRAM_EYES_ID_MAP) {
    Object.values(value).forEach(element => {
      let fieldId = `${key}_${element}`;
      let tempObj = valDto!==null?(!!valDto[fieldId]?valDto[fieldId]:null):null;
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
    case eyesType.INIT_MRAM_EYES_FIELD_VALUE:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        eyesFieldValMap: fieldValMap
      };
    }
    default:
      return state;
  }
};