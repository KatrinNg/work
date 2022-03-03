import _, {toNumber,isUndefined} from 'lodash';
import {COMMON_ACTION_TYPE} from '../../../../constants/common/commonConstants';
import moment from 'moment';
import storeConfig from '../../../../store/storeConfig';


export function DecimalValCheck(val) {
  // keep at most three decimal places
  let partten = /^([0-9]\d*|0)(\.[0-9]{1,3})?$/;
  if (!partten.test(val)) {
    return true;
  }
  return false;
}

export function NaturalValCheck(val) {
  let partten = /^(0|\+?[1-9][0-9]*)$/;
  if (!partten.test(val)) {
    return true;
  }
  return false;
}

export function DoubleValCheck(val) {
  let partten = /^[0-9]+(.[0-9]{1})?$/;
  if (!partten.test(val)) {
    return true;
  }
  return false;
}

export function abnormalCheck(val,rangeValObj) {
  let abnormalCheckFlag = false;
  if (val!==''&&!isUndefined(rangeValObj)) {
    let minVal = toNumber(rangeValObj.minVal);
    let maxVal = toNumber(rangeValObj.maxVal);
    let currentVal = toNumber(val);
    if (currentVal<minVal||currentVal>maxVal) {
      abnormalCheckFlag = true;
    }
  }
  return abnormalCheckFlag;
}

export function handleOperationType(fieldValObj) {
  let { version,value } = fieldValObj;
  if (version!==null) {
    if (value!=='') {
      fieldValObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else {
      fieldValObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  } else if (version === null && (value+'').trim()!== '') {
    fieldValObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    fieldValObj.operationType = null;
  }
}

export function hasRecordAssessmentDateWithin6Months(recordList) {
  let index = _.findIndex(recordList, record => !moment(record.mramAssessmentDtm).add(6, 'months').isSameOrAfter(moment()));
  return index!==-1?true:false;
}

export function yearAbnormalCheck(value) {
    const store = storeConfig.store.getState();
    const patientInfo = store && store['patient']['patientInfo'];
    let errorFlag = false;
    if (value.trim()!=='') {
      if (_.toInteger(value) < 1000) {
        errorFlag = true;
      } else {
        // Patient DOB year ≤ Year of Diagnosis ≤ System date year
        let dobYear = _.toString(moment(patientInfo.dob).year());
        let currentYear = _.toString(moment(new Date()).year());
        errorFlag = !moment(value).isBetween(dobYear, currentYear, null, '[]');
      }
    }
    return errorFlag;
}

export function integerValCheck(value) {
  let errorFlag = true;
  let partten = /^\d+$/;
  if ((partten.test(value) && value.trim() !='') || (value.trim() === '')) {
    errorFlag = false;
  }
  return errorFlag;
}