import * as type from '../../../actions/MRAM/dietAssessment/dietAssessmentType';
import * as dietAssessmentConstant from '../../../../constants/MRAM/dietAssessment/dietAssessmentConstants';
import { toNumber } from 'lodash';

const INIT_STATE = {
    dietAssessmentFieldValMap: new Map()
};


function generateFieldValMap(valDto) {
  let fieldValMap = new Map();
  //prepare
  for (let [key, value] of dietAssessmentConstant.MRAM_DIETASSESSMENT_ID_MAP) {
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
    case type.SET_DIETASSESSMENT_MAP:{
      let { valDto = null } = action;
      let fieldValMap = generateFieldValMap(valDto);
      return{
        ...state,
        dietAssessmentFieldValMap:fieldValMap
      };
    }
    default:
      return state;
  }
};