import * as type from '../../../actions/MRAM/riskProfile/riskProfileActionType';
import * as riskProfileConstant from '../../../../constants/MRAM/riskProfile/riskProfileConstants';
import { toNumber } from 'lodash';

const INIT_STATE = {
  riskProfileFieldValMap:''
};

function generateFieldValMap(valDto) {
  let fieldValMap = new Map();
  //prepare
  for (let [key, value] of riskProfileConstant.MRAM_RISKPROFILE_ID_MAP) {
    Object.values(value).forEach(element => {
      let fieldId = `${key}_${element}`;
      let tempObj = valDto!==null?valDto[fieldId]:null;
      // handle default value
      let val =!!tempObj?tempObj.value:'Not known';
      fieldValMap.set(fieldId,{
        codeMramId:toNumber(element),
        id:!!tempObj?tempObj.id:null,
        operationType:valDto===null?'I':null,
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
    case type.SET_RISKPRIFILE_MAP:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        riskProfileFieldValMap:fieldValMap
      };
    }
    // case type.SAVE_MEASUREMENT_AND_LAB_TEST_RESULT:{
    //   return{
    //     ...state,
    //     saveMeasurementAndLabTestList:action.fillingData
    //   };
    // }
    default:
      return state;
  }
};