import * as otherComplicationsType from '../../../actions/MRAM/otherComplications/otherComplicationsActionType';
import * as otherComplicationsConstant from '../../../../constants/MRAM/otherComplications/otherComplicationsConstant';
import { toNumber } from 'lodash';

const INIT_STATE = {
  otherComplicationsFieldValMap: new Map()
};


function generateFieldValMap(valDto) {
  let fieldValMap = new Map();
  //prepare
  for (let [key, value] of otherComplicationsConstant.MRAM_OTHERCOMPLICATIONS_ID_MAP) {
    Object.values(value).forEach(element => {
      let fieldId = `${key}_${element}`;
      let tempObj = valDto!==null?valDto[fieldId]:null;
      // handle default value
      let val =!!tempObj?tempObj.value:'';
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
    case otherComplicationsType.INIT_MRAM_OTHERCOMPLICATIONS_FIELD_VALUE:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        otherComplicationsFieldValMap:fieldValMap
      };
    }
    default:
      return state;
  }
};