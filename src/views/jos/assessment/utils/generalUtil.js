import { toNumber, trim, isUndefined } from 'lodash';
import { DATA_TYPE } from '../../../../constants/assessment/assessmentConstants';

function integerValCheck(val) {
  let partten = /^(0|[1-9][0-9]*)$/;
  if (!partten.test(val)) {
    return true;
  }
  return false;
}

function doubleValCheck(val) {
  // keep at most two decimal places
  let partten = /^([1-9]\d*|0)(\.[0-9]{1,2})?$/;
  if (!partten.test(val)) {
    return true;
  }
  return false;
}

export function illegalValidation(val,type) {
  switch (type) {
    case DATA_TYPE.INTEGER:
      return val!==''?integerValCheck(val):false;
    case DATA_TYPE.DOUBLE:
      return val!==''?doubleValCheck(val):false;
    default:
      break;
  }
}

export function abnormalCheck(val,assessmentCd,fieldId,fieldNormalRangeMap) {
  let abnormalCheck = false;
  let filedRangeMap = fieldNormalRangeMap.get(assessmentCd);
  if (val!==''&&!isUndefined(filedRangeMap)&&filedRangeMap.has(fieldId)) {
    let rangeObj = filedRangeMap.get(fieldId);
    let lowestVal = toNumber(rangeObj.lowestVal);
    let highestVal = toNumber(rangeObj.highestVal);
    let currentVal = toNumber(val);
    if (currentVal<lowestVal||currentVal>highestVal) {
      abnormalCheck = true;
    }
  }
  return abnormalCheck;
}

export function abnormalDLCheck(val,assessmentCd,fieldId,fieldNormalRangeMap) {
  let abnormalCheck = false;
  let filedRangeMap = fieldNormalRangeMap.get(assessmentCd);
  if (val!==''&&!isUndefined(filedRangeMap)&&filedRangeMap.has(fieldId)) {
    let rangeSet = filedRangeMap.get(fieldId);
    let currentVal = toNumber(val);
    if(typeof rangeSet!=='object'){
      if (rangeSet.has(currentVal)) {
        abnormalCheck = true;
      }
    }
  }
  return abnormalCheck;
}

// CB
// Checked:1
// Unchecked:0
export function abnormalCBCheck(val,assessmentCd,fieldId,fieldNormalRangeMap) {
  let abnormalCheck = false;
  let filedRangeMap = fieldNormalRangeMap.get(assessmentCd);
  if (val!==''&&!isUndefined(filedRangeMap)&&filedRangeMap.has(fieldId)) {
    let rangeSet = filedRangeMap.get(fieldId);
    let currentVal = toNumber(val);
    if (rangeSet.has(currentVal)) {
      abnormalCheck = true;
    }
  }
  return abnormalCheck;
}

// BMI
export function calculateBMI(rowId,outputAssesmentFieldMap,fieldValMap) {
  let val = 0;

  if(fieldValMap.has('BH')&&fieldValMap.has('BW')&&fieldValMap.has('BMI')){
    let actHeight = '';
    let actWeight = '';
    let height = 0;
    let weight = 0;
    for (let value of fieldValMap.get('BH').values()) {
      actHeight = trim(value[rowId].val);
      height = (toNumber(value[rowId].val)||0)/100;
      break;
    }
    for (let value of fieldValMap.get('BW').values()) {
      actWeight = trim(value[rowId].val);
      weight = toNumber(value[rowId].val)||0;
      break;
    }
    if (!illegalValidation(actHeight,DATA_TYPE.DOUBLE)&&!illegalValidation(actWeight,DATA_TYPE.DOUBLE)) {
      val = height === 0 ? 0 : weight / (height * height);

      let vals = fieldValMap.get('BMI').get(outputAssesmentFieldMap.get('BMI'));
      // vals[rowId].val = val.toFixed(1)==='0.0'?'':val.toFixed(1);
      if (!isUndefined(vals)) {
        if (actHeight === ''||actWeight === '') {
          vals[rowId].val = '';
        } else {
          vals[rowId].val = val.toFixed(1);
        }
      }
    }
  }
}

// 1st encounter BMI
export function calculateFBWBMI(rowId,outputAssesmentFieldMap,fieldValMap) {
  let val = 0;

  if(fieldValMap.has('PBH')&&fieldValMap.has('FBW')){
    let actHeight = '';
    let actWeight = '';
    let height = 0;
    let weight = 0;
    for (let value of fieldValMap.get('PBH').values()) {
      actHeight = trim(value[rowId].val);
      height = (toNumber(value[rowId].val)||0)/100;
      break;
    }
    for (let [key, value] of fieldValMap.get('FBW')) {
      if (key !== outputAssesmentFieldMap.get('FBW')) {
        actWeight = trim(value[rowId].val);
        weight = toNumber(value[rowId].val)||0;
        break;
      }
    }
    if (!illegalValidation(actHeight,DATA_TYPE.DOUBLE)&&!illegalValidation(actWeight,DATA_TYPE.DOUBLE)) {
      val = height === 0 ? 0 : weight / (height * height);
      let vals = fieldValMap.get('FBW').get(outputAssesmentFieldMap.get('FBW'));
      // vals[rowId].val = val.toFixed(1)==='0.0'?'':val.toFixed(1);
      if (!isUndefined(vals)) {
        if (actHeight === ''||actWeight === '') {
          vals[rowId].val = '';
        } else {
          vals[rowId].val = val.toFixed(1);
        }
      }
    }
  }
}

// pre encounter BMI
export function calculatePBWBMI(rowId,outputAssesmentFieldMap,fieldValMap) {
  let val = 0;

  if(fieldValMap.has('PBH')&&fieldValMap.has('PBW')){
    let actHeight = '';
    let actWeight = '';
    let height = 0;
    let weight = 0;
    for (let value of fieldValMap.get('PBH').values()) {
      actHeight = trim(value[rowId].val);
      height = (toNumber(value[rowId].val)||0)/100;
      break;
    }
    for (let [key, value] of fieldValMap.get('PBW')) {
      if (key !== outputAssesmentFieldMap.get('PBW')) {
        actWeight = trim(value[rowId].val);
        weight = toNumber(value[rowId].val)||0;
        break;
      }
    }
    if (!illegalValidation(actHeight,DATA_TYPE.DOUBLE)&&!illegalValidation(actWeight,DATA_TYPE.DOUBLE)) {
      val = height === 0 ? 0 : weight / (height * height);
      let vals = fieldValMap.get('PBW').get(outputAssesmentFieldMap.get('PBW'));
      // vals[rowId].val = val.toFixed(1)==='0.0'?'':val.toFixed(1);
      if (!isUndefined(vals)) {
        if (actHeight === ''||actWeight === '') {
          vals[rowId].val = '';
        } else {
          vals[rowId].val = val.toFixed(1);
        }
      }
    }
  }
}