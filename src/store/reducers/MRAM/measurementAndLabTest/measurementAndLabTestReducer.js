import * as measurementAndLabTestType from '../../../actions/MRAM/measurementAndLabTest/measurementAndLabTestActionType';
import * as measurementAndLabTestConstant from '../../../../constants/MRAM/measurementAndLabTest/measurementAndLabTestConstant';
import { toNumber } from 'lodash';

const INIT_STATE = {
  measurementAndLabTestFieldValMap:new Map()
};

function generateFieldValMap(valDto){
  let fieldValMap=new Map();
  //prepare
  for (let [key, value] of measurementAndLabTestConstant.MRAM_MEASUREMENTANDLABTEST_ID_MAP) {
    Object.values(value).forEach(element => {
      let fieldId = `${key}_${element}`;
      let tempObj = valDto!==null?(!!valDto[fieldId]?valDto[fieldId]:null):null;
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
    case measurementAndLabTestType.INIT_MRAM_MEASRUEMENTANDLABTEST_FIELD_VALUE:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        measurementAndLabTestFieldValMap: fieldValMap
      };
    }
    default:
      return state;
  }
};

