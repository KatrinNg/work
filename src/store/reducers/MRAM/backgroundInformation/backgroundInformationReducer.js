import * as type from '../../../actions/MRAM/backgroundInformation/backgroundInformationActionType';
import * as backgroundInformationConstant from '../../../../constants/MRAM/backgroundInformation/backgroundInformationConstant';
import { toNumber } from 'lodash';

const INIT_STATE = {
  backgroundInformationFieldValMap:new Map()
};

function generateFieldDefaultVal(mramId) {
  let val = '';
  switch (mramId) {
    case '2':
      val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
    case '13':
      val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
    case '15':
      val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
    case '18':
      val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
    case '20':
      val =backgroundInformationConstant.ALCOHOL[0].value;
      break;
    case '22':
      val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
      case '23':
        val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
      case '28':
        val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
      case '34':
        val = backgroundInformationConstant.ALCOHOL[0].value;
      break;
    default:
      break;
  }
  return val;
}

function generateFieldValMap(valDto) {
  let fieldValMap = new Map();
  //prepare
  for (let [key, value] of backgroundInformationConstant.MRAM_BACKGROUNDINFOMATION_ID_MAP) {
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
    case type.INIT_MRAM_BACKGROUND_INFORMATION_FIELD_VALUE:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        backgroundInformationFieldValMap:fieldValMap
      };
    }
    default:
      return state;
  }
};