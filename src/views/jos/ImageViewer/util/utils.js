import * as commonConstants from '../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../constants/medicalHistories/medicalHistoriesConstants';
import storeConfig from '../../../../store/storeConfig';
import _ from 'lodash';

/**
 * Validate age [0-999]
 * @param value input age
 * @returns false: not in [0-999]
 * @returns true: in [0-999]
 */
export function validateAge(value) {
  let partten = /^([1-9]\d{0,2}|0)$/;
  return partten.test(value);
}

/**
 * Validate 5 digit integer [0-99999]
 * @param value input integer
 * @returns false: not in [0-99999]
 * @returns true: in [0-99999]
 */
export function validate5DigitInteger(value) {
  let partten = /^([1-9]\d{0,4}|0)$/;
  return partten.test(value);
}

/**
 * Validate 8 digit integer [0-99999999]
 * @param value input integer
 * @returns false: not in [0-99999999]
 * @returns true: in [0-99999999]
 */
export function validate8DigitInteger(value) {
  let partten = /^([1-9]\d{0,7}|0)$/;
  return partten.test(value);
}

/**
 * Validate 5 digit number with 2 decimal [0-99999.99]
 * @param value input number
 * @returns false: not in [0-99999.99]
 * @returns true: in [0-99999.99]
 */
export function validate5DigitIntegerWith2Decimal(value) {
  let partten = /^(0|[1-9]|[0-9]\d{0,4})(\.[0-9]{1,2})?$/;
  return partten.test(value);
}

/**
 * Validate 5 digit number with 1 decimal [0-99999.9]
 * @param value input number
 * @returns false: not in [0-99999.9]
 * @returns true: in [0-99999.9]
 */
export function validate5DigitIntegerWith1Decimal(value) {
  let partten = /^(0|[1-9]|[0-9]\d{0,4})(\.[0-9]{1})?$/;
  return partten.test(value);
}

export function identifyOthersObjId(type, viewMode = false) {
  let idFieldName = null;
  switch (type) {
    case medicalConstants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS:
      idFieldName = viewMode ? 'logOccupationalOthersId' : 'occupationalOthersId';
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS:
      idFieldName = viewMode ? 'logSocialOthersId' : 'socialOthersId';
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS:
      idFieldName = viewMode ? 'logFamilyFreeTextId' : 'familyFreeTextId';
      break;
  }
  return idFieldName;
}

export function generateHistoryValObj(type, itemObj = null) {
  const store = storeConfig.store.getState();
  const loginServiceInfo = store && store.login.service;
  const loginClinicInfo = store && store.login.clinic;
  const encounterInfo = store && store.patient.encounterInfo;
  const patientInfo = store && store.patient.patientInfo;

  // common
  let valObj = {
    patientKey: patientInfo.patientKey,
    serviceCd: loginServiceInfo.serviceCd,
    encounterId: encounterInfo.encounterId,
    clinicCd: loginClinicInfo.clinicCd,
    cims1Key: itemObj ? itemObj.cims1Key : null,
    deleteInd: itemObj ? itemObj.deleteInd : null, // for delete status
    createBy: itemObj ? itemObj.createBy : null,
    createDtm: itemObj ? itemObj.createDtm : null,
    updateBy: itemObj ? itemObj.updateBy : null,
    updateDtm: itemObj ? itemObj.updateDtm : null,
    version: itemObj ? itemObj.version : null,
    operationType: itemObj ? (itemObj.operationType ? itemObj.operationType : null) : commonConstants.COMMON_ACTION_TYPE.INSERT
  };
  switch (type) {
    case medicalConstants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE:
      valObj = {
        msPassiveSmkId: itemObj?itemObj.msPassiveSmkId:Math.random(),
        codRlatTypeId: itemObj?itemObj.codRlatTypeId:null,
        codRlatTypeName: itemObj ? itemObj.codRlatTypeName : '',
        smkNum: itemObj ? (itemObj.smkNum !== null ? itemObj.smkNum : '') : '',
        rlat: itemObj ? (itemObj.rlat !== null ? itemObj.rlat : '') : '',
        encounterDate: encounterInfo.encounterDate,
        codRlatTypeIdErrorFlag: false,
        locationErrorFlag: false,
        smkNumErrorFlag: false,
        rlatErrorFlag: false,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY:
      valObj = {
        occupationalHistoryId: itemObj ? itemObj.occupationalHistoryId : Math.random(),
        occupation: itemObj ? itemObj.occupation : '',
        yearFrom: itemObj ? (itemObj.yearFrom ? _.toString(itemObj.yearFrom) : '') : '',
        yearTo: itemObj ? (itemObj.yearTo ? _.toString(itemObj.yearTo) : '') : '',
        remark: itemObj ? (itemObj.remark ? itemObj.remark : '') : '',
        occupationErrorFlag: false,
        yearFromErrorFlag: false,
        yearToErrorFlag: false,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS: {
      let idName = identifyOthersObjId(type);
      valObj = {
        [idName]: itemObj ? itemObj[idName] : Math.random(),
        others: itemObj ? itemObj.others : '',
        othersErrorFlag: false,

        obsRiskFactor: itemObj ? itemObj.obsRiskFactor || medicalConstants.CHECK_BOX_STATUS.UNCHECKED : medicalConstants.CHECK_BOX_STATUS.UNCHECKED,
        clcAntRiskFctrId: itemObj ? itemObj.clcAntRiskFctrId || null : null,
        riskFctrVersion: itemObj ? itemObj.riskFctrVersion || null : null,
        encounterDate: encounterInfo.encounterDate,
        ...valObj
      };
      break;
    }
    case medicalConstants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS: {
      let idName = identifyOthersObjId(type);
      valObj = {
        [idName]: itemObj ? itemObj[idName] : Math.random(),
        others: itemObj ? itemObj.others : '',
        othersErrorFlag: false,
        ...valObj
      };
      break;
    }
    case medicalConstants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING:
      valObj = {
        socialHistoryTypeId: medicalConstants.SOCIAL_HISTORY_TYPE_ID.SMOKING,
        neverFlag: itemObj ? (itemObj.status === 'N' ? true : false) : false,
        socialHistoryDetailsId: itemObj ? itemObj.socialHistoryDetailsId : Math.random(),
        socialHistorySubtypeId: itemObj ? itemObj.socialHistorySubtypeId : null, //type drop down
        status: itemObj ? itemObj.status : null, // status drop down
        ageFrom: itemObj ? (itemObj.ageFrom !== null ? itemObj.ageFrom : '') : '',
        ageTo: itemObj ? (itemObj.ageTo !== null ? itemObj.ageTo : '') : '',
        yearFrom: itemObj ? (itemObj.yrFrom !== null ? _.toString(itemObj.yrFrom) : '') : '', // yrFrom <--> yearFrom
        yearTo: itemObj ? (itemObj.yrTo !== null ? _.toString(itemObj.yrTo) : '') : '', // yrTo <--> yearTo
        amtNum: itemObj ? itemObj.amtNum : null,
        amtTxt: itemObj ? (itemObj.amtTxt !== null ? itemObj.amtTxt : '') : '',
        codeContainerId: itemObj ? itemObj.codeContainerId : null,
        volAmt: itemObj ? (itemObj.volAmt !== null ? itemObj.volAmt : -1) : -1,
        stdUnit: itemObj ? (itemObj.stdUnit !== null ? itemObj.stdUnit : -1) : -1,
        historyVersion: itemObj ? itemObj.historyVersion : null,
        subVersion: itemObj ? itemObj.subVersion : null,
        statusErrorFlag: false,
        socialHistorySubtypeIdErrorFlag: false,
        ageFromErrorFlag: false,
        ageToErrorFlag: false,
        yearFromErrorFlag: false,
        yearToErrorFlag: false,
        amtTxtErrorFlag: false,

        obsRiskFactor: itemObj ? itemObj.obsRiskFactor || medicalConstants.CHECK_BOX_STATUS.UNCHECKED : medicalConstants.CHECK_BOX_STATUS.UNCHECKED,
        clcAntRiskFctrId: itemObj ? itemObj.clcAntRiskFctrId || null : null,
        riskFctrVersion: itemObj ? itemObj.riskFctrVersion || null : null,
        encounterDate: itemObj ? itemObj.encounterDate || encounterInfo.encounterDate : encounterInfo.encounterDate,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE:
      valObj = {
        socialHistoryTypeId: medicalConstants.SOCIAL_HISTORY_TYPE_ID.SUBSTANCE_ABUSE,
        neverFlag: itemObj ? (itemObj.status === 'N' ? true : false) : false,
        socialHistoryDetailsId: itemObj ? itemObj.socialHistoryDetailsId : Math.random(),
        socialHistorySubtypeId: itemObj ? itemObj.socialHistorySubtypeId : null,
        status: itemObj ? itemObj.status : null,
        ageFrom: itemObj ? (itemObj.ageFrom !== null ? itemObj.ageFrom : '') : '',
        ageTo: itemObj ? (itemObj.ageTo !== null ? itemObj.ageTo : '') : '',
        yearFrom: itemObj ? (itemObj.yrFrom !== null ? _.toString(itemObj.yrFrom) : '') : '', // yrFrom <--> yearFrom
        yearTo: itemObj ? (itemObj.yrTo !== null ? _.toString(itemObj.yrTo) : '') : '', // yrTo <--> yearTo
        amtNum: itemObj ? itemObj.amtNum : null,
        amtTxt: itemObj ? (itemObj.amtTxt !== null ? itemObj.amtTxt : '') : '',
        codeContainerId: itemObj ? itemObj.codeContainerId : null,
        volAmt: itemObj ? (itemObj.volAmt !== null ? itemObj.volAmt : -1) : -1,
        stdUnit: itemObj ? (itemObj.stdUnit !== null ? itemObj.stdUnit : -1) : -1,
        historyVersion: itemObj ? itemObj.historyVersion : null,
        subVersion: itemObj ? itemObj.subVersion : null,
        statusErrorFlag: false,
        socialHistorySubtypeIdErrorFlag: false,
        ageFromErrorFlag: false,
        ageToErrorFlag: false,
        yearFromErrorFlag: false,
        yearToErrorFlag: false,
        amtTxtErrorFlag: false,

        obsRiskFactor: itemObj ? itemObj.obsRiskFactor || medicalConstants.CHECK_BOX_STATUS.UNCHECKED : medicalConstants.CHECK_BOX_STATUS.UNCHECKED,
        clcAntRiskFctrId: itemObj ? itemObj.clcAntRiskFctrId || null : null,
        riskFctrVersion: itemObj ? itemObj.riskFctrVersion || null : null,
        encounterDate: itemObj ? itemObj.encounterDate || encounterInfo.encounterDate : encounterInfo.encounterDate,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING:
      valObj = {
        socialHistoryTypeId: medicalConstants.SOCIAL_HISTORY_TYPE_ID.DRINKING,
        neverFlag: itemObj ? (itemObj.status === 'N' ? true : false) : false,
        socialHistoryDetailsId: itemObj ? itemObj.socialHistoryDetailsId : Math.random(),
        socialHistorySubtypeId: itemObj ? itemObj.socialHistorySubtypeId : null,
        status: itemObj ? itemObj.status : null,
        ageFrom: itemObj ? (itemObj.ageFrom !== null ? itemObj.ageFrom : '') : '',
        ageTo: itemObj ? (itemObj.ageTo !== null ? itemObj.ageTo : '') : '',
        yearFrom: itemObj ? (itemObj.yrFrom !== null ? _.toString(itemObj.yrFrom) : '') : '', // yrFrom <--> yearFrom
        yearTo: itemObj ? (itemObj.yrTo !== null ? _.toString(itemObj.yrTo) : '') : '', // yrTo <--> yearTo
        amtNum: itemObj ? itemObj.amtNum : null,
        amtTxt: itemObj ? (itemObj.amtTxt !== null ? itemObj.amtTxt : '') : '',
        codeContainerId: itemObj ? itemObj.codeContainerId : null,
        volAmt: itemObj ? (itemObj.volAmt !== null ? itemObj.volAmt : '') : '',
        stdUnit: itemObj ? (itemObj.stdUnit !== null ? itemObj.stdUnit : '') : '',
        historyVersion: itemObj ? itemObj.historyVersion : null,
        subVersion: itemObj ? itemObj.subVersion : null,
        statusErrorFlag: false,
        socialHistorySubtypeIdErrorFlag: false,
        ageFromErrorFlag: false,
        ageToErrorFlag: false,
        yearFromErrorFlag: false,
        yearToErrorFlag: false,
        amtTxtErrorFlag: false,
        volAmtErrorFlag: false,
        stdUnitErrorFlag: false,

        obsRiskFactor: itemObj ? itemObj.obsRiskFactor || medicalConstants.CHECK_BOX_STATUS.UNCHECKED : medicalConstants.CHECK_BOX_STATUS.UNCHECKED,
        clcAntRiskFctrId: itemObj ? itemObj.clcAntRiskFctrId || null : null,
        riskFctrVersion: itemObj ? itemObj.riskFctrVersion || null : null,
        encounterDate: itemObj ? itemObj.encounterDate || encounterInfo.encounterDate : encounterInfo.encounterDate,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY:
      valObj = {
        pastMedHistoryId: itemObj ? itemObj.pastMedHistoryId : Math.random(),
        pastMedHistoryIndt: itemObj ? itemObj.pastMedHistoryIndt : null,
        codeTermId: itemObj ? itemObj.codeTermId : null,
        pastMedHistoryText: itemObj ? itemObj.pastMedHistoryText : '',
        accident: itemObj ? itemObj.accident : null,
        happenedDate: itemObj ? itemObj.happenedDate : null,
        happenedDateText: itemObj ? itemObj.happenedDateText : '',
        cims1ClcPmedHxIdSrc: itemObj ? itemObj.cims1ClcPmedHxIdSrc : null,
        termCncptId: itemObj ? itemObj.termCncptId : null,
        detailItems: itemObj ? itemObj.detailItems : [],

        obsRiskFactor: itemObj ? itemObj.obsRiskFactor || medicalConstants.CHECK_BOX_STATUS.UNCHECKED : medicalConstants.CHECK_BOX_STATUS.UNCHECKED,
        clcAntRiskFctrId: itemObj ? itemObj.clcAntRiskFctrId || null : null,
        riskFctrVersion: itemObj ? itemObj.riskFctrVersion || null : null,
        encounterDate: itemObj ? itemObj.encounterDate || encounterInfo.encounterDate : encounterInfo.encounterDate,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS:
      valObj = {
        pastMedDetailsId: itemObj ? itemObj.pastMedDetailsId : Math.random(),
        pastMedHistoryId: itemObj ? itemObj.pastMedHistoryId : null,
        details: itemObj ? itemObj.details : '',
        detailsErrorFlag: false,
        cims1ClcPmedHxTxtIdSrc: itemObj ? itemObj.cims1ClcPmedHxTxtIdSrc : null,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP:
      valObj = {
        familyHistoryRltId: itemObj ? itemObj.familyHistoryRltId : Math.random(),
        familyRltIndt: itemObj ? itemObj.familyRltIndt : null, //CODE_MS_FAMILY_RLT_ID
        rltSeq: itemObj ? itemObj.rltSeq : null, //CODE_MS_FAMILY_RLT_ID
        rltText: itemObj ? itemObj.rltText : '', //RLT_DESC
        problemDesc: itemObj ? itemObj.problemDesc : '',
        details: itemObj ? itemObj.details : [],
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM:
      valObj = {
        familyHistoryId: itemObj ? itemObj.familyHistoryId : Math.random(),
        familyHistoryRltId: itemObj ? itemObj.familyHistoryRltId : null,
        codeTermId: itemObj ? itemObj.codeTermId : null,
        termCncptId: itemObj ? itemObj.termCncptId : null,
        probTxt: itemObj ? itemObj.probTxt : '',
        diagDate: itemObj ? itemObj.diagDate : null,
        diagDateTxt: itemObj ? itemObj.diagDateTxt : '',
        detailItems: itemObj ? itemObj.detailItems : [],

        obsRiskFactor: itemObj ? itemObj.obsRiskFactor || medicalConstants.CHECK_BOX_STATUS.UNCHECKED : medicalConstants.CHECK_BOX_STATUS.UNCHECKED,
        clcAntRiskFctrId: itemObj ? itemObj.clcAntRiskFctrId || null : null,
        riskFctrVersion: itemObj ? itemObj.riskFctrVersion || null : null,
        encounterDate: itemObj ? itemObj.encounterDate || encounterInfo.encounterDate : encounterInfo.encounterDate,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL:
      valObj = {
        familyDetailsId: itemObj ? itemObj.familyDetailsId : Math.random(),
        familyHistoryId: itemObj ? itemObj.familyHistoryId : null,
        details: itemObj ? itemObj.details : '',
        cims1ClcRlatProbTxtIdSrc: itemObj ? itemObj.cims1ClcRlatProbTxtIdSrc : null,
        ...valObj
      };
      break;
    case medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS: {
      let idName = identifyOthersObjId(type);
      valObj = {
        [idName]: itemObj ? itemObj[idName] : Math.random(),
        cims1ClcFmlyHxTxtIdSrc: itemObj ? itemObj.cims1ClcFmlyHxTxtIdSrc : null,
        others: itemObj ? itemObj.details : '', //others <---> details
        othersErrorFlag: false,
        ...valObj
      };
      break;
    }
    default:
      break;
  }
  return valObj;
}

export function handleOperationType(valObj) {
  if (valObj.version) {
    valObj.operationType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
  } else {
    valObj.operationType = commonConstants.COMMON_ACTION_TYPE.INSERT;
  }
}

export function transformProblemItem(searchItem = null, editItem = null) {
  let tempObj = {
    codeTermId: searchItem ? searchItem.codeTermId : editItem ? editItem.codeTermId : null,
    pastMedHistoryText: searchItem ? searchItem.termDesc : editItem ? editItem.pastMedHistoryText : null,
    termCncptId: searchItem ? searchItem.termCncptId : editItem ? editItem.termCncptId : null,
    happenedDateText: editItem ? editItem.happenedDateText : '',
    pastMedHistoryId: editItem ? editItem.pastMedHistoryId : null,
    detailItems: editItem ? editItem.detailItems : []
  };
  if (searchItem == null) {
    tempObj = { ...tempObj, ...editItem };
  }
  return tempObj;
}

export function transformFamilyProblemItem(searchItem = null, editItem = null) {
  let tempObj = {
    codeTermId: searchItem ? searchItem.codeTermId : editItem ? editItem.codeTermId : null,
    pastMedHistoryText: searchItem ? searchItem.termDesc : editItem ? editItem.probTxt : null,
    termCncptId: searchItem ? searchItem.termCncptId : editItem ? editItem.termCncptId : null,
    diagDateTxt: editItem ? editItem.diagDateTxt : '',
    familyHistoryId: editItem ? editItem.familyHistoryId : null,
    detailItems: editItem ? editItem.detailItems : []
  };
  if (searchItem == null) {
    tempObj = { ...tempObj, ...editItem };
  }
  return tempObj;
}

export function generateFmailyProblemDesc(problemValObjList = []) {
  let descArray = [];
  if (problemValObjList.length > 0) {
    problemValObjList.forEach((problemItemObj) => {
      if (problemItemObj.operationType !== commonConstants.COMMON_ACTION_TYPE.DELETE) {
        // let text = problemItemObj.codeTermId?`${problemItemObj.probTxt} {${problemItemObj.codeTermId}}`:`${problemItemObj.probTxt}`;
        descArray.push(problemItemObj.probTxt);
      }
    });
  }
  return descArray.length > 0 ? _.toString(descArray) : null;
}

export function handleConvertRelationshipObj(itemObj) {
  let tempProblems = [];
  if (itemObj.details.length > 0) {
    itemObj.details.forEach((problemObj) => {
      let tempDetails = [],
        saveFlag = false,
        problemDeleteFlag = false;
      if (problemObj.operationType) {
        if (problemObj.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
          problemObj.familyHistoryId = null;
        } else if (problemObj.operationType === commonConstants.COMMON_ACTION_TYPE.DELETE) {
          problemDeleteFlag = true;
        }
        problemObj.encounterId=itemObj ? itemObj.encounterId : null;
        problemObj.clinicCd=itemObj ? itemObj.clinicCd : null;
        problemObj.encounterDate=itemObj ? itemObj.encounterDate : null;
        problemObj.serviceCd=itemObj ? itemObj.serviceCd : null;
        saveFlag = true;
      }

      // problem details
      if (problemObj.detailItems.length > 0) {
        problemObj.detailItems.forEach((detailsObj) => {
          if (problemDeleteFlag) {
            // parent deleted
            detailsObj.deleteInd = medicalConstants.DELETED_STATUS.YES;
            delete detailsObj.detailsErrorFlag;
            delete detailsObj.operationType;
            tempDetails.push(detailsObj);
          } else {
            if (detailsObj.operationType) {
              if (detailsObj.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
                detailsObj.familyDetailsId = null;
              }
              detailsObj.encounterId=itemObj ? itemObj.encounterId : null;
              detailsObj.clinicCd=itemObj ? itemObj.clinicCd : null;
              detailsObj.serviceCd=itemObj ? itemObj.serviceCd : null;
              delete detailsObj.detailsErrorFlag;
              delete detailsObj.operationType;
              tempDetails.push(detailsObj);
              saveFlag = true;
            }
          }
        });
      }
      if (saveFlag) {
        problemObj.detailItems = tempDetails;
        delete problemObj.operationType;

        tempProblems.push(problemObj);
      }
    });
  }

  itemObj.details = tempProblems;
}

export function handleSetFamilyDeleteStatus(itemObj) {
  if (itemObj.details.length > 0) {
    let filterProblems = _.filter(itemObj.details, (problemObj) => problemObj.version !== null);
    filterProblems.forEach((filterProblemObj) => {
      let filterDetails = _.filter(filterProblemObj.detailItems, (detailObj) => detailObj.version !== null);
      filterDetails.forEach((filterDetailObj) => {
        filterDetailObj.deleteInd = medicalConstants.DELETED_STATUS.YES;
      });
      filterProblemObj.deleteInd = medicalConstants.DELETED_STATUS.YES;
      filterProblemObj.detailItems = filterDetails;
    });
    itemObj.details = filterProblems;
  }
}

export function handleConvertPastMedicalObj(itemObj) {
  if (itemObj.detailItems.length > 0) {
    let filterDetails = _.filter(itemObj.detailItems, (detailObj) => detailObj.operationType);
    filterDetails.forEach((filterDetailObj) => {
      if (filterDetailObj.operationType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
        filterDetailObj.pastMedDetailsId = null;
      }
      if (filterDetailObj.operationType) {
        filterDetailObj.serviceCd=itemObj ? itemObj.serviceCd : null;
      }
      delete filterDetailObj.detailsErrorFlag;
      delete filterDetailObj.operationType;
    });
    itemObj.detailItems = filterDetails;
  }
}

export function handleSetPastDeleteStatus(itemObj) {
  if (itemObj.detailItems.length > 0) {
    let filterDetails = _.filter(itemObj.detailItems, (detailObj) => detailObj.version !== null);
    filterDetails.forEach((filterDetailObj) => {
      filterDetailObj.deleteInd = medicalConstants.DELETED_STATUS.YES;
    });
    itemObj.deleteInd = medicalConstants.DELETED_STATUS.YES;
    itemObj.detailItems = filterDetails;
  }
}
export function cutOutString(value, maxValue) {
  let countIn = 0;
  let realCount = 0;
  for (let i = 0; i < value.length; i++) {
      const element = value.charCodeAt(i);
      if (element >= 0 && element <= 255) {
      if(countIn + 1 > maxValue) {
          break;
      }else{
          countIn += 1;
          realCount++;
      }
      } else {
          if(countIn + 3 > maxValue) {
              break;
          }else{
              countIn += 3;
              realCount++;
          }
      }
  }
  return value ? value.slice(0, realCount) : value;
}
export function generateDefaultFamilyRelationship(familyHistoryRltList, relationshipList, valMap) {
  let targetRelationships = [...medicalConstants.DEFAULT_FAMILY_HISTORY_RELATIONSHIP_LIST];
  let tempRelationships = [...valMap.get(medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP).values()];
  if (tempRelationships.length > 0) {
    targetRelationships = _(tempRelationships)
      .map((valObj) => valObj.rltText)
      .filter((rltText) => medicalConstants.DEFAULT_FAMILY_HISTORY_RELATIONSHIP_LIST.includes(rltText))
      .xor(medicalConstants.DEFAULT_FAMILY_HISTORY_RELATIONSHIP_LIST)
      .value();
  }

  let filterRelationshipList = relationshipList.filter((item) => targetRelationships.includes(item.rltDesc));
  filterRelationshipList.forEach((tempRltObj) => {
    let tempObj = generateHistoryValObj(medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP);
    tempObj.familyRltIndt = tempRltObj ? tempRltObj.codeMsFamilyRltId : null;
    tempObj.rltSeq = tempRltObj ? tempRltObj.codeMsFamilyRltId : null;
    tempObj.rltText = tempRltObj ? tempRltObj.rltDesc : '';
    valMap.get(medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP).set(tempObj.familyHistoryRltId, tempObj);
    familyHistoryRltList.push(tempObj);
  });
}
