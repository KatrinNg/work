import {COMMON_ACTION_TYPE} from '../../../../../constants/common/commonConstants';
import * as constants from '../../../../../constants/IOE/ixRequest/ixRequestConstants';
import _,{ intersection, isNull,union,findIndex,uniq,isEmpty,find, toInteger,cloneDeep } from 'lodash';
import { IX_REQUEST_CODE } from '../../../../../constants/message/IOECode/ixRequestCode';
import storeConfig from '../../../../../store/storeConfig';
import * as commonConstants from '../../../../../constants/common/commonConstants';

//Add 'Cholesterol, LDL' if 'Lipid profile' is not selected in Ix Request
export function checkLipidProfileIsCheck(middlewareObject) {
  let flag = true;
  let targetMap = middlewareObject.testValMap;
  if(targetMap && targetMap.size > 0 && targetMap.has(constants.IX_REQUEST_TEMPLATE_SELECT_BOTH.LipidProfileKey) &&
  targetMap.has(constants.IX_REQUEST_TEMPLATE_SELECT_BOTH.CholesterolLDLKey)){
    if(targetMap.get(constants.IX_REQUEST_TEMPLATE_SELECT_BOTH.LipidProfileKey).isChecked &&
    !targetMap.get(constants.IX_REQUEST_TEMPLATE_SELECT_BOTH.CholesterolLDLKey).isChecked) {
      flag = false;
    }
  }
  return flag;
}

export function validatePanelItem(testItemsMap, specimenItemsMap) {
  const { ixRequest } = storeConfig.store.getState();
  const { codeIoeFormPanelMapping } = ixRequest;

  // filter DELETE
  let specimenItems = [...specimenItemsMap.values()];
  let testItems = [...testItemsMap.values()];

  let specimenItemIds = _(specimenItems)
    .filter(item => item.operationType !== COMMON_ACTION_TYPE.DELETE)
    .map(item => item.codeIoeFormItemId)
    .value();
  let testItemIds = _(testItems)
    .filter(item => item.operationType !== COMMON_ACTION_TYPE.DELETE)
    .map(item => item.codeIoeFormItemId)
    .value();

  let panels = [];
  // specimen just only one
  if (specimenItemIds.length > 0 && testItemIds.length > 0) {
    panels = _(codeIoeFormPanelMapping)
      .filter(panelObj => panelObj.codeIoeFormItemIdSpcmn === specimenItemIds[0])
      .intersectionWith(testItemIds, (panelObj, testId) => panelObj.codeIoeFormItemId === testId)
      .uniqBy(panelObj =>panelObj.panel)
      .value();
  }

  return panels;
}

let generateMasterTestMap = (testItemsMap) => {
  let tempMap = new Map();
  if (testItemsMap.size > 0) {
    for (let items of testItemsMap.values()) {
      items.forEach(item => {
        if (item.ioeMasterTest === constants.TEST_ITEM_MASTER_TEST_FLAG) {
          tempMap.set(item.codeIoeFormItemId,[]);
        } else if (!isNull(item.ioeMasterId)) {
          if (tempMap.has(item.ioeMasterId)) {
            let tempIds = tempMap.get(item.ioeMasterId);
            tempIds.push(item.codeIoeFormItemId);
            tempMap.set(item.ioeMasterId,tempIds);
          } else {
            tempMap.set(item.ioeMasterId,[item.codeIoeFormItemId]);
          }
        }
      });
    }
  }
  return tempMap;
};

let generateValMap = (itemsMap,formId,storageObjMap,disableStorageChecked,orderType) => {
  let valMap = new Map();
  if (itemsMap.size>0) {
    for (let items of itemsMap.values()) {
      items.forEach(item => {
        let obj = {
          codeIoeFormItemId:item.codeIoeFormItemId,
          operationType: null,
          version: null,
          itemVal: null,
          itemVal2: null,
          codeIoeFormId:formId,
          itemIoeType: item.ioeType,
          isChecked: false, //Click box status
          itemName: item.frmItemName,
          frmItemTypeCd: item.frmItemTypeCd,
          frmItemTypeCd2: item.frmItemTypeCd2,
          createdBy:null,
          createdDtm:null,
          updatedBy:null,
          updatedDtm:null,
          ioeRequestId: null, // request id
          ioeRequestItemId:null, // request item id
          nullAble: item.nullAble,
          isActive: item.isActive
        };
        if (storageObjMap.has(item.codeIoeFormItemId)) {
          let valObj = storageObjMap.get(item.codeIoeFormItemId);
          obj.operationType = valObj.operationType;
          obj.version = valObj.version;
          obj.itemVal = valObj.itemVal;
          obj.itemVal2 = valObj.itemVal2;
          obj.isChecked = disableStorageChecked?false:(valObj.operationType === COMMON_ACTION_TYPE.DELETE?false:true);
          obj.createdBy = valObj.createdBy;
          obj.createdDtm = valObj.createdDtm;
          obj.updatedBy = valObj.updatedBy;
          obj.updatedDtm = valObj.updatedDtm;
          obj.ioeRequestId = valObj.ioeRequestId;
          obj.ioeRequestItemId = valObj.ioeRequestItemId;
          obj.nullAble = item.nullAble;
          obj.isActive = item.isActive;
        }
        if (orderType === constants.PRIVILEGES_DOCTOR_TABS[0].value) {
          // Discipline
          valMap.set(item.codeIoeFormItemId,obj);
        } else {
          // Service / Personal / Nurse
          if (storageObjMap.has(item.codeIoeFormItemId)) {
            valMap.set(item.codeIoeFormItemId,obj);
          }
        }
      });
    }
  }
  return valMap;
};

let generateQuestionGroupMap = (itemsMap) => {
  let groupItemMap = new Map();
  if (itemsMap.size>0) {
    for (let [groupName, items] of itemsMap) {
      let obj = {
        ids: [],
        isError: false
      };
      items.forEach(item => {
        if (item.ioeType === constants.ITEM_QUESTION_TYPE.IQU||item.ioeType === constants.ITEM_QUESTION_TYPE.IQS||item.ioeType === constants.ITEM_QUESTION_TYPE.IQUM) {
          obj.ids.push(item.codeIoeFormItemId);
        }
      });
      groupItemMap.set(groupName,obj);
    }
  }
  return groupItemMap;
};

export function initMiddlewareObject(formObj,storageObj=null,disableStorageChecked=false,orderType=constants.PRIVILEGES_DOCTOR_TABS[0].value) {
  let valObj = {
    codeIoeFormId:null,
    formShortName:'',
    selectAll:false,
    testValMap:new Map(),
    specimenValMap:new Map(),
    otherValMap:new Map(),
    questionValMap:new Map(),
    masterTestMap:new Map(),
    questionGroupMap:new Map(),
    panelItems: []
  };
  if (!isNull(formObj)) {
    let {codeIoeFormId,testItemsMap,specimenItemsMap,otherItemsMap,questionItemsMap,formShortName} = formObj;
    let testStorageObjMap = !isNull(storageObj)?storageObj.testItemsMap: new Map();
    let specimenStorageObjMap = !isNull(storageObj)?storageObj.specimenItemsMap: new Map();
    let otherStorageObjMap = !isNull(storageObj)?storageObj.otherItemsMap:new Map();
    let questionStorageObjMap = !isNull(storageObj)?storageObj.questionItemsMap:new Map();

    valObj.codeIoeFormId = codeIoeFormId;
    valObj.formShortName = formShortName;
    valObj.testValMap = generateValMap(testItemsMap,codeIoeFormId,testStorageObjMap,disableStorageChecked,orderType);
    valObj.specimenValMap = generateValMap(specimenItemsMap,codeIoeFormId,specimenStorageObjMap,disableStorageChecked,orderType);
    valObj.otherValMap = generateValMap(otherItemsMap,codeIoeFormId,otherStorageObjMap,disableStorageChecked,constants.PRIVILEGES_DOCTOR_TABS[0].value);
    valObj.questionValMap = generateValMap(questionItemsMap,codeIoeFormId,questionStorageObjMap,disableStorageChecked,constants.PRIVILEGES_DOCTOR_TABS[0].value);
    valObj.masterTestMap = generateMasterTestMap(testItemsMap);
    valObj.questionGroupMap = generateQuestionGroupMap(questionItemsMap);
    valObj.panelItems = !isNull(storageObj)?storageObj.panelItems:[];
  }
  return valObj;
}

let transformValMap2StorageMapForExpress = (itemsMap) => {
  let valMap = new Map();
  if (itemsMap&&itemsMap.size>0) {
    for (let item of itemsMap.values()) {
      if (item.isChecked||!isNull(item.operationType)) {
        valMap.set(item.codeIoeFormItemId,{
          codeIoeFormId: item.codeIoeFormId,
          codeIoeFormItemId:item.codeIoeFormItemId,
          operationType: item.operationType,
          version: item.version,
          itemVal: item.itemVal,
          itemVal2: item.itemVal2,
          itemName: item.frmItemName,
          createdBy: item.createdBy,
          createdDtm: item.createdDtm,
          updatedBy: item.updatedBy,
          updatedDtm: item.updatedDtm,
          itemIoeType: item.ioeType,
          frmItemTypeCd: item.frmItemTypeCd,
          frmItemTypeCd2: item.frmItemTypeCd2,
          ioeRequestId: item.ioeRequestId||null, // request id
          ioeRequestItemId: item.ioeRequestItemId||null // request item id
        });
      }
    }
  }
  return valMap;
};

let transformValMap2StorageMap = (itemsMap) => {
  let valMap = new Map();
  if (itemsMap.size>0) {
    for (let item of itemsMap.values()) {
      if (item.isChecked||!isNull(item.operationType)) {
        valMap.set(item.codeIoeFormItemId,{
          codeIoeFormId: item.codeIoeFormId,
          codeIoeFormItemId:item.codeIoeFormItemId,
          operationType: item.operationType,
          version: item.version,
          itemVal: item.itemVal,
          itemVal2: item.itemVal2,
          itemName: item.itemName,
          createdBy: item.createdBy,
          createdDtm: item.createdDtm,
          updatedBy: item.updatedBy,
          updatedDtm: item.updatedDtm,
          itemIoeType: item.itemIoeType,
          frmItemTypeCd: item.frmItemTypeCd,
          frmItemTypeCd2: item.frmItemTypeCd2,
          ioeRequestId: item.ioeRequestId, // request id
          ioeRequestItemId: item.ioeRequestItemId // request item id
        });
      }
    }
  }
  return valMap;
};

let handleOtherInfoCB = (valObj,basicInfo) => {
  if (!isNull(valObj.version)) {
    if (basicInfo.urgentIsChecked) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  } else if (isNull(valObj.version)&&basicInfo.urgentIsChecked) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    valObj.operationType = null;
  }
};

let handleOtherInfoIB = (valObj,itemVal) => {
  valObj.itemVal = itemVal;
  if (!isNull(valObj.version)) {
    if (!!itemVal) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else if (itemVal === '') {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  } else if (isNull(valObj.version)&&(!!itemVal)) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    valObj.operationType = null;
  }
};

let handleOtherInfoDL = (valObj,itemVal) => {
  valObj.itemVal = itemVal;
  if (!isNull(valObj.version)) {
    valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
  } else if (isNull(valObj.version)&&(!!itemVal)) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    valObj.operationType = null;
  }
};

let transformInfoValMap2StorageMap = (itemsMap,basicInfo,orderType,gbsOrZikaIsExist,remarkLength) => {
  let valMap = new Map();
  if (itemsMap.size>0) {
    for (let item of itemsMap.values()) {
      let tempObj = {
        codeIoeFormId: item.codeIoeFormId,
        codeIoeFormItemId:item.codeIoeFormItemId,
        operationType: item.operationType,
        version: item.version,
        itemVal: item.itemVal,
        itemVal2: item.itemVal2,
        itemName: item.itemName,
        createdBy: item.createdBy,
        createdDtm: item.createdDtm,
        updatedBy: item.updatedBy,
        updatedDtm: item.updatedDtm,
        itemIoeType: item.itemIoeType,
        frmItemTypeCd: item.frmItemTypeCd,
        frmItemTypeCd2: item.frmItemTypeCd2,
        ioeRequestId: item.ioeRequestId, // request id
        ioeRequestItemId: item.ioeRequestItemId // request item id
      };
      if (item.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Urgent) {
        handleOtherInfoCB(tempObj,basicInfo);
      } else if (item.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo) {
        handleOtherInfoIB(tempObj,basicInfo.clinicRefNo);
      } else if (item.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
        let val = basicInfo.infoDiagnosis;
        if (orderType!==constants.PRIVILEGES_DOCTOR_TABS[0].value&&item.itemVal) {
          val = item.itemVal;
        }
        handleOtherInfoIB(tempObj,val);
      } else if (item.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo) {
        handleOtherInfoDL(tempObj,basicInfo.reportTo);
      } else if (item.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Remark&&item.itemName === constants.REMARK_ITEM_NAME) {
        let val = basicInfo.infoRemark;
        if (orderType!==constants.PRIVILEGES_DOCTOR_TABS[0].value&&item.itemVal) {
          val = gbsOrZikaIsExist ? val + '.' + item.itemVal : item.itemVal;
          val = remarkLength && gbsOrZikaIsExist ? val.substring(0,remarkLength-3) + '...' : val;
        }
        handleOtherInfoIB(tempObj,val);
      } else if (item.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Instruction&&item.itemName === constants.INSTRUCTION_ITEM_NAME) {
        let val = basicInfo.infoInstruction;
        if (orderType!==constants.PRIVILEGES_DOCTOR_TABS[0].value&&item.itemVal) {
          val = item.itemVal;
        }
        handleOtherInfoIB(tempObj,val);
      }

      if (!isNull(tempObj.operationType)) {
        valMap.set(item.codeIoeFormItemId,tempObj);
      }
    }
  }
  return valMap;
};

let transformInfoValMap2StorageMapForExpress = (itemsMap,basicInfo,orderType,gbsOrZikaIsExist,remarkLength) => {
  let valMap = new Map();
  if (itemsMap.size>0) {
    for (let item of itemsMap.values()) {
      let tempObj = {
        codeIoeFormId: item.codeIoeFormId,
        codeIoeFormItemId:item.codeIoeFormItemId,
        operationType: item.operationType,
        version: item.version,
        itemVal: item.itemVal,
        itemVal2: item.itemVal2,
        itemName: item.frmItemName,
        createdBy: item.createdBy,
        createdDtm: item.createdDtm,
        updatedBy: item.updatedBy,
        updatedDtm: item.updatedDtm,
        itemIoeType: item.ioeType,
        frmItemTypeCd: item.frmItemTypeCd,
        frmItemTypeCd2: item.frmItemTypeCd2,
        ioeRequestId: item.ioeRequestId ? item.ioeRequestId : null, // request id
        ioeRequestItemId: item.ioeRequestItemId ? item.ioeRequestItemId : null// request item id
      };
      if (item.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Urgent) {
        handleOtherInfoCB(tempObj,basicInfo);
      } else if (item.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo) {
        handleOtherInfoIB(tempObj,basicInfo.clinicRefNo);
      } else if (item.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
        let val = basicInfo.infoDiagnosis;
        if (orderType!==constants.PRIVILEGES_DOCTOR_TABS[0].value&&item.itemVal) {
          val = item.itemVal;
        }
        handleOtherInfoIB(tempObj,val);
      } else if (item.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo) {
        handleOtherInfoDL(tempObj,basicInfo.reportTo);
      } else if (item.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Remark&&item.frmItemName === constants.REMARK_ITEM_NAME) {
        let val = basicInfo.infoRemark;
        if (orderType!==constants.PRIVILEGES_DOCTOR_TABS[0].value&&item.itemVal) {
          val = gbsOrZikaIsExist ? val + '.' + item.itemVal : item.itemVal;
          val = remarkLength && gbsOrZikaIsExist ? val.substring(0,remarkLength-3) + '...' : val;
 		if (orderType===constants.PRIVILEGES_EXPRESS_IOE_TABS[0].value) {
            if(!!item.itemVal){
              val =item.itemVal+basicInfo.infoRemark;
            }
          }        }
        handleOtherInfoIB(tempObj,val);
      } else if (item.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Instruction&&item.frmItemName === constants.INSTRUCTION_ITEM_NAME) {
        let val = basicInfo.infoInstruction;
        if (orderType!==constants.PRIVILEGES_DOCTOR_TABS[0].value&&item.itemVal) {
          val = item.itemVal;
        }
        handleOtherInfoIB(tempObj,val);
      }

      if (!isNull(tempObj.operationType)) {
        valMap.set(item.codeIoeFormItemId,tempObj);
      }
    }
  }
  return valMap;
};

let handleStorageObjOperation = (testItemsMap,specimenItemsMap,otherItemsMap,questionItemsMap) => {
  let operationTypes = [];
  let targetOperation = null;
  if (testItemsMap.size>0) {
    for (let valObj of testItemsMap.values()) {
      if (!isNull(valObj.operationType)) {
        operationTypes.push(valObj.operationType);
      }
    }
  }
  if (specimenItemsMap.size>0) {
    for (let valObj of specimenItemsMap.values()) {
      if (!isNull(valObj.operationType)) {
        operationTypes.push(valObj.operationType);
      }
    }
  }
  if (otherItemsMap.size>0) {
    for (let valObj of otherItemsMap.values()) {
      if (!isNull(valObj.operationType)) {
        operationTypes.push(valObj.operationType);
      }
    }
  }
  if (questionItemsMap.size>0) {
    for (let valObj of questionItemsMap.values()) {
      if (!isNull(valObj.operationType)) {
        operationTypes.push(valObj.operationType);
      }
    }
  }
  operationTypes = uniq(operationTypes);
  if (operationTypes.length > 1) {
    targetOperation = COMMON_ACTION_TYPE.UPDATE;
  } else {
    targetOperation = operationTypes[0];
  }

  return targetOperation;
};

function generatePanelObj(temporaryStorageObj, middlewarePanels) {
  let { testItemsMap, specimenItemsMap } = temporaryStorageObj;
  let panels = validatePanelItem(testItemsMap, specimenItemsMap);
  let currentPanels = panels.map(panelObj => {
    return {
      codeIoeFormId: panelObj.codeIoeFormId,
      codeIoeFormItemId: constants.PANEL_FORM_ITEM_ID,
      itemVal: panelObj.panel,
      itemVal2: null,
      createdBy: null,
      createdDtm: null,
      updatedBy: null,
      updatedDtm: null,
      version: null,
      operationType: COMMON_ACTION_TYPE.INSERT,
      itemIoeType: null, // useless
      ioeRequestId: null, // request id
      ioeRequestItemId: null // request item id
    };
  });

  let intersectionPanelVals = _(currentPanels)
    // .filter(item => item.version !== null)
    .intersectionWith( middlewarePanels, (current,middleware)=> current.itemVal === middleware.itemVal)
    .map(item => item.itemVal)
    .value();
  if (intersectionPanelVals.length > 0) {
    intersectionPanelVals.forEach(value => {
      let middlewareIndex = _.findIndex(middlewarePanels, itemObj => itemObj.itemVal===value);
      let currentIndex = _.findIndex(currentPanels, itemObj => itemObj.itemVal===value);
      currentPanels.splice(currentIndex,1);
      if (middlewarePanels[middlewareIndex].version) {
        middlewarePanels[middlewareIndex].operationType = null;
      } else {
        middlewarePanels[middlewareIndex].operationType = COMMON_ACTION_TYPE.INSERT;
      }

      currentPanels.push(middlewarePanels[middlewareIndex]);
      middlewarePanels.splice(middlewareIndex,1);
    });
  }
  middlewarePanels = _(middlewarePanels)
    .filter(item => item.version !== null)
    .map(itemObj => {return { ...itemObj, operationType: COMMON_ACTION_TYPE.DELETE};})
    .value();
  currentPanels = [...currentPanels, ...middlewarePanels];

  temporaryStorageObj.panelItems = currentPanels;
}

export function initExpressIoeTemporaryStorageObj(middlewareObj,basicInfo,labId,orderType=constants.PRIVILEGES_EXPRESS_IOE_TABS[0].value,gbsOrZikaIsExist,remarkLength) {
  let obj = {
    clinicCd: basicInfo.requestingUnit,
    codeIoeFormId: middlewareObj.codeIoeFormId,
    codeIoeRequestTypeCd: basicInfo.codeIoeRequestTypeCd,
    requestUser: basicInfo.requestUser,
    encounterId: basicInfo.encounterId,
    patientKey: basicInfo.patientKey,
    serviceCd: basicInfo.serviceCd,
    createdBy: basicInfo.createdBy,
    createdDtm: basicInfo.createdDtm,
    updatedBy: basicInfo.updatedBy,
    updatedDtm: basicInfo.updatedDtm,
    ioeRequestId: basicInfo.ioeRequestId,
    ioeRequestNumber: basicInfo.ioeRequestNumber,
    requestDatetime: basicInfo.requestDatetime,
    version: basicInfo.version,
    operationType: null,
    requestLoginName: basicInfo.requestLoginName,
    // requestUserName: basicInfo.requestUserName, // only display request by
    invldReason:basicInfo.invldReason, // invalid
    isInvld: basicInfo.isInvld, // invalid
    ivgRqstSeqNum: basicInfo.ivgRqstSeqNum, // invalid
    outputFormPrinted: basicInfo.outputFormPrinted, // invalid
    outputFormPrintedBy: basicInfo.outputFormPrintedBy, // invalid
    outputFormPrintedDatetime: basicInfo.outputFormPrintedDatetime, // invalid
    specimenCollectDatetime: basicInfo.specimenCollectDatetime, // invalid
    specimenCollected: basicInfo.specimenCollected, // invalid
    specimenCollectedBy: basicInfo.specimenCollectedBy, // invalid
    specimenLabelPrinted: basicInfo.specimenLabelPrinted, // invalid
    specimenLabelPrintedBy: basicInfo.specimenLabelPrintedBy, // invalid
    specimenLabelPrintedDatetime: basicInfo.specimenLabelPrintedDatetime, // invalid
    labId,
    formShortName: middlewareObj.formShortName,
    testItemsMap: transformValMap2StorageMap(middlewareObj.testValMap),
    specimenItemsMap: transformValMap2StorageMap(middlewareObj.specimenValMap),
    otherItemsMap: transformInfoValMap2StorageMap(middlewareObj.otherValMap,basicInfo,orderType,gbsOrZikaIsExist,remarkLength),
    questionItemsMap: transformValMap2StorageMap(middlewareObj.questionValMap),
    panelItems: []
  };
  obj.operationType = handleStorageObjOperation(obj.testItemsMap,obj.specimenItemsMap,obj.otherItemsMap,obj.questionItemsMap);
  generatePanelObj(obj, middlewareObj.panelItems);
  return obj;
}


export function initTemporaryStorageObjForExpressIoe(middlewareObj,basicInfo,labId,orderType=constants.PRIVILEGES_DOCTOR_TABS[0].value,gbsOrZikaIsExist,remarkLength) {
  let obj = {
    clinicCd: basicInfo.requestingUnit,
    codeIoeFormId: middlewareObj.codeIoeFormId,
    codeIoeRequestTypeCd: basicInfo.codeIoeRequestTypeCd,
    requestUser: basicInfo.requestUser,
    encounterId: basicInfo.encounterId,
    patientKey: basicInfo.patientKey,
    serviceCd: basicInfo.serviceCd,
    createdBy: basicInfo.createdBy,
    createdDtm: basicInfo.createdDtm,
    updatedBy: basicInfo.updatedBy,
    updatedDtm: basicInfo.updatedDtm,
    ioeRequestId: basicInfo.ioeRequestId,
    ioeRequestNumber: basicInfo.ioeRequestNumber,
    requestDatetime: basicInfo.requestDatetime,
    version: basicInfo.version,
    operationType: null,
    requestLoginName: basicInfo.requestLoginName,
    // requestUserName: basicInfo.requestUserName, // only display request by
    invldReason:basicInfo.invldReason, // invalid
    isInvld: basicInfo.isInvld, // invalid
    ivgRqstSeqNum: basicInfo.ivgRqstSeqNum, // invalid
    outputFormPrinted: basicInfo.outputFormPrinted, // invalid
    outputFormPrintedBy: basicInfo.outputFormPrintedBy, // invalid
    outputFormPrintedDatetime: basicInfo.outputFormPrintedDatetime, // invalid
    specimenCollectDatetime: basicInfo.specimenCollectDatetime, // invalid
    specimenCollected: basicInfo.specimenCollected, // invalid
    specimenCollectedBy: basicInfo.specimenCollectedBy, // invalid
    specimenLabelPrinted: basicInfo.specimenLabelPrinted, // invalid
    specimenLabelPrintedBy: basicInfo.specimenLabelPrintedBy, // invalid
    specimenLabelPrintedDatetime: basicInfo.specimenLabelPrintedDatetime, // invalid
    labId,
    formShortName: middlewareObj.formShortName,
    testItemsMap: transformValMap2StorageMapForExpress(middlewareObj.testValMap),
    specimenItemsMap: transformValMap2StorageMapForExpress(middlewareObj.specimenValMap),
    otherItemsMap: transformInfoValMap2StorageMapForExpress(middlewareObj.otherValMap,basicInfo,orderType,gbsOrZikaIsExist,remarkLength),
    questionItemsMap: transformValMap2StorageMapForExpress(middlewareObj.questionValMap),
    ioeRequestScatgryHxDtoItems:middlewareObj.ioeRequestScatgryHxDtoItems,
    panelItems: []
  };
  obj.operationType = handleStorageObjOperation(obj.testItemsMap,obj.specimenItemsMap,obj.otherItemsMap,obj.questionItemsMap);
  generatePanelObj(obj, middlewareObj.panelItems);
  return obj;
}

export function initTemporaryStorageObj(middlewareObj,basicInfo,labId,orderType=constants.PRIVILEGES_DOCTOR_TABS[0].value,gbsOrZikaIsExist,remarkLength) {
  let obj = {
    clinicCd: basicInfo.requestingUnit,
    codeIoeFormId: middlewareObj.codeIoeFormId,
    codeIoeRequestTypeCd: basicInfo.codeIoeRequestTypeCd,
    requestUser: basicInfo.requestUser,
    encounterId: basicInfo.encounterId,
    patientKey: basicInfo.patientKey,
    serviceCd: basicInfo.serviceCd,
    createdBy: basicInfo.createdBy,
    createdDtm: basicInfo.createdDtm,
    updatedBy: basicInfo.updatedBy,
    updatedDtm: basicInfo.updatedDtm,
    ioeRequestId: basicInfo.ioeRequestId,
    ioeRequestNumber: basicInfo.ioeRequestNumber,
    requestDatetime: basicInfo.requestDatetime,
    version: basicInfo.version,
    operationType: null,
    requestLoginName: basicInfo.requestLoginName,
    // requestUserName: basicInfo.requestUserName, // only display request by
    invldReason:basicInfo.invldReason, // invalid
    isInvld: basicInfo.isInvld, // invalid
    ivgRqstSeqNum: basicInfo.ivgRqstSeqNum, // invalid
    outputFormPrinted: basicInfo.outputFormPrinted, // invalid
    outputFormPrintedBy: basicInfo.outputFormPrintedBy, // invalid
    outputFormPrintedDatetime: basicInfo.outputFormPrintedDatetime, // invalid
    specimenCollectDatetime: basicInfo.specimenCollectDatetime, // invalid
    specimenCollected: basicInfo.specimenCollected, // invalid
    specimenCollectedBy: basicInfo.specimenCollectedBy, // invalid
    specimenLabelPrinted: basicInfo.specimenLabelPrinted, // invalid
    specimenLabelPrintedBy: basicInfo.specimenLabelPrintedBy, // invalid
    specimenLabelPrintedDatetime: basicInfo.specimenLabelPrintedDatetime, // invalid
    labId,
    formShortName: middlewareObj.formShortName,
    testItemsMap: transformValMap2StorageMap(middlewareObj.testValMap),
    specimenItemsMap: transformValMap2StorageMap(middlewareObj.specimenValMap),
    otherItemsMap: transformInfoValMap2StorageMap(middlewareObj.otherValMap,basicInfo,orderType,gbsOrZikaIsExist,remarkLength),
    questionItemsMap: transformValMap2StorageMap(middlewareObj.questionValMap),
    panelItems: []
  };
  obj.operationType = handleStorageObjOperation(obj.testItemsMap,obj.specimenItemsMap,obj.otherItemsMap,obj.questionItemsMap);
  generatePanelObj(obj, middlewareObj.panelItems);
  return obj;
}

export function handleClickBoxOperationType(valObj) {
  let { version, isChecked } = valObj;
  if (!isNull(version)) {
    if (isChecked) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  } else if (isNull(version)&&isChecked) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    valObj.operationType = null;
  }
}

export function handleInputBoxOperationType(valObj) {
  let { version,
    // itemVal, itemVal2,
    isChecked } = valObj;
  if (!isNull(version)) {
    if (isChecked) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  } else if (isNull(version)) {
  // } else if (isNull(version)&&(!!itemVal || !!itemVal2)) {
    if (isChecked) {
      valObj.operationType = COMMON_ACTION_TYPE.INSERT;
    } else {
      valObj.operationType = null;
    }
  } else {
    valObj.operationType = null;
  }
}

export function handleDropdownOperationType(valObj) {
  let { version, itemVal, itemVal2 } = valObj;
  if (!isNull(version)) {
    if (itemVal === '' && itemVal2 === '') {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    } else {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    }
  } else if (isNull(version)&&(!!itemVal || !!itemVal2)) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    valObj.operationType = null;
  }
}

export function handleInfoOperationType(valObj) {
  let { version, itemVal } = valObj;
  if (!isNull(version)) {
    if (!!itemVal) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
      valObj.isChecked = true;
    } else if (itemVal === '' || isNull(itemVal)) {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
      valObj.isChecked = false;
    }
  } else if (isNull(version)&&(!!itemVal)) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
    valObj.isChecked = true;
  } else {
    valObj.operationType = null;
    valObj.isChecked = false;
  }
}

let setDeletedItemsMap = (itemsMap) => {
  if (itemsMap.size > 0) {
    for (let valObj of itemsMap.values()) {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  }
  return itemsMap;
};

export function handleDeletedStorageObj(deletedStorageObj) {
  let { testItemsMap, specimenItemsMap, otherItemsMap, questionItemsMap } = deletedStorageObj;
  deletedStorageObj.testItemsMap = setDeletedItemsMap(testItemsMap);
  deletedStorageObj.specimenItemsMap = setDeletedItemsMap(specimenItemsMap);
  deletedStorageObj.otherItemsMap = setDeletedItemsMap(otherItemsMap);
  deletedStorageObj.questionItemsMap = setDeletedItemsMap(questionItemsMap);
  deletedStorageObj.operationType = COMMON_ACTION_TYPE.DELETE;
  deletedStorageObj.panelItems.forEach(panelObj => {
    panelObj.operationType = COMMON_ACTION_TYPE.DELETE;
  });
  return deletedStorageObj;
}

export function handleValidateItems(middlewareObject) {
  let {testValMap,specimenValMap} = middlewareObject;
  let msgCode = '';
  //1.test
  if (testValMap.size > 0) {
    let checkedIoeTypeArray = [];
    for (let valObj of testValMap.values()) {
      if (valObj.isChecked) {
        checkedIoeTypeArray.push(valObj.itemIoeType);
      }
    }
    if (checkedIoeTypeArray.length === 0) {
      msgCode = IX_REQUEST_CODE.TEST_NOT_SELECTED;
    } else {
      checkedIoeTypeArray = union(checkedIoeTypeArray);
      if (checkedIoeTypeArray.length === 1) {
        let index = findIndex(checkedIoeTypeArray, type => {
          return type === constants.TEST_ITEM_IOE_TYPE.ITEF;
        });
        if (index!==-1) {
          msgCode = IX_REQUEST_CODE.ONE_MORE_TEST;
        }
      }
    }
  }
  //2.specimen
  if (msgCode === ''&&specimenValMap.size>0) {
    let checkedIoeTypeArray = [];
    for (let valObj of specimenValMap.values()) {
      if (valObj.isChecked) {
        checkedIoeTypeArray.push(valObj.itemIoeType);
      }
    }
    if (checkedIoeTypeArray.length === 0) {
      msgCode = IX_REQUEST_CODE.SPECIMEN_NOT_SELECTED;
    }
  }
   //3.specimen--Test
   for (let obj of specimenValMap.values()) {
    if (obj.nullAble === 'N' && obj.isChecked && (obj.frmItemTypeCd == 'IB' || obj.frmItemTypeCd == 'DL') && ((obj.frmItemTypeCd !== null && (obj.itemVal === null || obj.itemVal === '')) || (obj.frmItemTypeCd2 !== null && (obj.itemVal2 === null || obj.itemVal2 === '')))) {
      msgCode = IX_REQUEST_CODE.SPECIMEN_NOT_SELECTED;
    }
  }
  return msgCode;
}

export function handleValidateTemplateItems(middlewareMapObj) {
  let msgCode = '';
  if (!middlewareMapObj.templateSelectAll) {
    let checkedFlags = [];
    let validate = false;
    //validate order
    if (middlewareMapObj.middlewareMap.size>0) {
      for (let orderObj of middlewareMapObj.middlewareMap.values()) {
        if (orderObj.selectAll) {
          validate = true;
          break;
        } else {
          if (orderObj.specimenValMap.size>0) {
            // validate specimen (0 or 1)
            for (let specimenObj of orderObj.specimenValMap.values()) {
              checkedFlags.push(specimenObj.isChecked);
            }
          }
          if (orderObj.testValMap.size>0) {
            // validate test (n)
            for (let testObj of orderObj.testValMap.values()) {
              checkedFlags.push(testObj.isChecked);
            }
          }
        }
      }
      if (!validate) {
        checkedFlags = uniq(checkedFlags);
        let index = findIndex(checkedFlags,flag => flag === true);
        if (index === -1) {
          msgCode = IX_REQUEST_CODE.TEMPLATE_ITEM_NOT_SELECTED;
        }
      }
    }
  }

  return msgCode;
}

export function handleQuestionItem(id,valMap,idSet) {
  if (idSet.size !== 0) {
    for (let itemId of idSet.keys()) {
      if (id !== itemId) {
        let tempValObj = valMap.get(itemId);
        tempValObj.isChecked = false;
        handleClickBoxOperationType(tempValObj);
      }
    }
  }
}

export function handleSepcimenItem(id,valMap) {
  for (let [itemId, valObj] of valMap) {
    if (itemId!==id) {
      valObj.isChecked = false;
      if (constants.FORM_ITEM_TYPE.CLICK_BOX === valObj.frmItemTypeCd) {
        handleClickBoxOperationType(valObj);
      } else if (constants.FORM_ITEM_TYPE.INPUT_BOX === valObj.frmItemTypeCd) {
        handleInputBoxOperationType(valObj);
      } else if (constants.FORM_ITEM_TYPE.DROP_DOWN_LIST === valObj.frmItemTypeCd) {
        valObj.itemVal = '';
        valObj.itemVal2 = '';
        handleDropdownOperationType(valObj);
      }
      // handleClickBoxOperationType(valObj);
    }
  }
}

export function handleSepcimenNSLItem(id,valMap) {
  for (let [itemId, valObj] of valMap) {
      if (constants.FORM_ITEM_TYPE.CLICK_BOX === valObj.frmItemTypeCd) {
        handleClickBoxOperationType(valObj);
      } else if (constants.FORM_ITEM_TYPE.INPUT_BOX === valObj.frmItemTypeCd) {
        handleInputBoxOperationType(valObj);
      } else if (constants.FORM_ITEM_TYPE.DROP_DOWN_LIST === valObj.frmItemTypeCd) {
        valObj.itemVal = '';
        valObj.itemVal2 = '';
        handleDropdownOperationType(valObj);
      }
      // handleClickBoxOperationType(valObj);
  }
}

export function handleTestItem(id,valMap,masterTestMap,selectedLabId) {
  let currentValObj = valMap.get(id);
  let currentItemIoeType = currentValObj.itemIoeType;
  let checkedFlag = currentValObj.isChecked;
  // handle comment test
  if (checkedFlag) {
    switch (currentItemIoeType) {
      case constants.TEST_ITEM_IOE_TYPE.ITEO:{
        for (let itemValObj of valMap.values()) {
          if (itemValObj.codeIoeFormItemId !== id && itemValObj.itemIoeType !== constants.TEST_ITEM_IOE_TYPE.ITEF) {
            itemValObj.isChecked = false;
            handleClickBoxOperationType(itemValObj);
          }
        }
        break;
      }
      case constants.TEST_ITEM_IOE_TYPE.ITE:{
        for (let itemValObj of valMap.values()) {
          if (itemValObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITEO) {
            itemValObj.isChecked = false;
            handleClickBoxOperationType(itemValObj);
          }
        }
        break;
      }
      default:
        break;
    }
  }
  // handle master test
  if (selectedLabId === constants.LAB_ID.CPLC) {
    // check master item id
    if (masterTestMap.has(id)) {
      let subItemIds = masterTestMap.get(id);
      for (let [itemId, itemValObj] of valMap) {
        let index = findIndex(subItemIds,subItemId => {
          return subItemId === itemId;
        });
        if (index !== -1) {
          itemValObj.isChecked = checkedFlag;
          handleClickBoxOperationType(itemValObj);
        }
      }
    } else {
      // check sub item id
      let targetMasterId = null;
      let targetMasterSubIds = [];
      for (let [masterId, subItemIds] of masterTestMap) {
        let index = findIndex(subItemIds,subItemId => {
          return subItemId === id;
        });
        if (index !== -1) {
          targetMasterId = masterId;
          targetMasterSubIds = subItemIds;
          break;
        }
      }
      if (!isNull(targetMasterId)&&targetMasterSubIds.length > 0) {
        let tempArray = [checkedFlag];
        targetMasterSubIds.forEach(subItemId => {
          tempArray.push(valMap.get(subItemId).isChecked);
        });
        tempArray = union(tempArray);
        if (tempArray.length === 1) {
          valMap.get(targetMasterId).isChecked = tempArray[0];
          handleClickBoxOperationType(valMap.get(targetMasterId));
        } else {
          valMap.get(targetMasterId).isChecked = false;
          handleClickBoxOperationType(valMap.get(targetMasterId));
        }
      }
    }
  }
}

export function resetQuestionStatus(questionValMap) {
  for (let obj of questionValMap.values()) {
    obj.operationType = null;
    obj.version = null;
    obj.itemVal = null;
    obj.itemVal2 = null;
    // obj.codeIoeFormId = null;
    obj.isChecked = false;
  }
}

export function resetQuestionGroupStatus(questionGroupMap) {
  for (let obj of questionGroupMap.values()) {
    obj.isError = false;
  }
}

export function selectAllOrderItemsDisabledFlag(valObj) {
  let testFlag = true;
  let specimenFlag = true;
  if(valObj) {
    if(valObj.testItemsMap.size > 0) {
      for (let obj of valObj.testItemsMap.values()){
        if(obj.isActive == 1){
          testFlag = false;
          break;
        }
      }
    }else{
      testFlag = false;
    }
    if(valObj.specimenItemsMap.size > 0) {
      for (let specimenObj of valObj.specimenItemsMap.values()){
        if(specimenObj.isActive == 1){
          specimenFlag = false;
          break;
        }
      }
    }else{
      specimenFlag = false;
    }
  }else{
    testFlag = false;
    specimenFlag = false;
  }
  return testFlag || specimenFlag;
}

export function handleGelTubOtherInfoDialogDisplay(middlewareObject,itemMapping) {
  let displayFlag = false;
  let ids=[277,283,276,284,281,289,266,282,250,256,251, 249,261,286,262,268,257,280,288,2127,704];
  if (middlewareObject.testValMap&&middlewareObject.testValMap.size !== 0) {
    let testValMap = middlewareObject.testValMap;
    let codeIoeFormItemId=[];
    for (let item of testValMap.values()) {
      for (let id of ids) {
        if (item.isChecked&&parseInt(id)===parseInt(item.codeIoeFormItemId)) {
          displayFlag=true;
          break;
        }
      }
    }
  }
  return displayFlag;
}

export function handleOtherInfoDialogDisplay(middlewareObject,itemMapping) {
  let displayFlag = true;
  let testFlag=false;
  let ids=[277,283,276,284,281,289,266,282,250,256,251, 249,261,286,262,268,257,280,288,2127,704];
  if (middlewareObject.questionValMap&&middlewareObject.questionValMap.size !== 0) {
    let valMap = middlewareObject.questionValMap;
    let onlyIQS = true;
    for (let question of valMap.values()) {
      if (question.itemIoeType !== constants.ITEM_QUESTION_TYPE.IQS) {
        onlyIQS = false;
      }
    }
    if (onlyIQS) {
      // only exist IQS
      let { codeIoeFormId,specimenValMap,testValMap } = middlewareObject;
      if (itemMapping.has(codeIoeFormId)) {
        let itemMap = itemMapping.get(codeIoeFormId);
        let specialIdArray = [];
        for (let specialIdSet of itemMap.values()) {
          specialIdArray = union(specialIdArray,[...specialIdSet]);
        }

        let selectedIdArray = [];
        for (const itemObj of specimenValMap.values()) {
          if (itemObj.isChecked) {
            selectedIdArray.push(itemObj.codeIoeFormItemId);
          }
        }
        for (const valueObj of testValMap.values()) {
          if (valueObj.isChecked) {
            selectedIdArray.push(valueObj.codeIoeFormItemId);
          }
        }
        selectedIdArray = uniq(selectedIdArray);

        // Compare
        let resultArray = intersection(selectedIdArray, specialIdArray);
        if (resultArray.length === 0) {
          displayFlag = false;
        }
      }
    }
    if (middlewareObject.testValMap&&middlewareObject.testValMap.size !== 0&&middlewareObject.codeIoeFormId===100090) {
      let testValMap = middlewareObject.testValMap;
      for (let item of testValMap.values()) {
        for (let id of ids) {
          if (item.isChecked&&parseInt(id)===parseInt(item.codeIoeFormItemId)) {
            testFlag=true;
            break;
          }
        }
      }
      if(displayFlag){
        return testFlag;
      }else{
        return displayFlag;
      }
    }else{
      return displayFlag;
    }
  } else {
    displayFlag = false;
    return displayFlag;
  }
}

export function getBasicInfo(valMap) {
  let tempObj = {
    urgentIsChecked: false,
    reportTo:'',
    clinicRefNo:'',
    infoDiagnosis:'',
    infoRemark:'',
    infoInstruction:''
  };
  for (let valObj of valMap.values()) {
    if (constants.OTHER_ITEM_FIELD_IOE_TYPE.Urgent === valObj.itemIoeType) {
      tempObj.urgentIsChecked = valObj.isChecked;
    } else if (constants.OTHER_ITEM_FIELD_IOE_TYPE.RefNo === valObj.itemIoeType) {
      tempObj.clinicRefNo = valObj.itemVal||'';
    } else if (constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo === valObj.itemIoeType) {
      tempObj.reportTo = valObj.itemVal;
    } else if (constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis === valObj.itemIoeType) {
      tempObj.infoDiagnosis = valObj.itemVal||'';
    } else if (constants.OTHER_ITEM_FIELD_IOE_TYPE.Remark === valObj.itemIoeType&&constants.REMARK_ITEM_NAME === valObj.itemName) {
      tempObj.infoRemark = valObj.itemVal||'';
    } else if (constants.OTHER_ITEM_FIELD_IOE_TYPE.Instruction === valObj.itemIoeType&&constants.INSTRUCTION_ITEM_NAME === valObj.itemName) {
      tempObj.infoInstruction = valObj.itemVal||'';
    }
  }
  return tempObj;
}

export function isDisableSaving(temporaryStorageMap,deletedStorageMap) {
  let allowSaveFlag = false;
  if (temporaryStorageMap.size>0) {
    for (let valObj of temporaryStorageMap.values()) {
      if (!isNull(valObj.operationType)) {
        allowSaveFlag = true;
        break;
      }
    }
  }
  if (deletedStorageMap.size>0) {
    for (let valObj of deletedStorageMap.values()) {
      if (!isNull(valObj.operationType)) {
        allowSaveFlag = true;
        break;
      }
    }
  }
  return allowSaveFlag;
}

export function isDisableSubimt(temporaryStorageMap){
  let allowSaveFlag=true;
  if(temporaryStorageMap.size>0){
    for (let valObj of temporaryStorageMap.values()) {
      if (valObj.specimenCollected !== 1 && valObj.isInvld !== 1 && valObj.isReportReturned !== 'Y') {
        allowSaveFlag = false;
        break;
      }
    }
  }
  return allowSaveFlag;
}

// transform value when loading order
export function transformItemsObj(ixRequestItemMap,formId) {
  let tempObj = {
    testItemsMap: new Map(),
    specimenItemsMap: new Map(),
    otherItemsMap: new Map(),
    questionItemsMap: new Map(),
    panelItems: []
  };
  if (ixRequestItemMap[formId]!==undefined) {
    let orderItems = ixRequestItemMap[formId];
    if (orderItems.length>0) {
      let tempMap = new Map();
      orderItems.forEach(orderItem => {
        let penelItemFlag = false;
        if (orderItem.codeIoeFormItemId === constants.PANEL_FORM_ITEM_ID) {
          // 1. Panel Item
          penelItemFlag = true;
          tempObj.panelItems.push({
            codeIoeFormId: orderItem.codeIoeFormId,
            codeIoeFormItemId: constants.PANEL_FORM_ITEM_ID,
            itemVal: orderItem.itemVal,
            itemVal2: orderItem.itemVal2,
            createdBy: orderItem.createdBy,
            createdDtm: orderItem.createdDtm,
            updatedBy: orderItem.updatedBy,
            updatedDtm: orderItem.updatedDtm,
            version: orderItem.version,
            operationType: orderItem.operationType,
            itemIoeType: null, // useless
            ioeRequestId: orderItem.ioeRequestId, // request id
            ioeRequestItemId: orderItem.ioeRequestItemId // request item id
          });
        } else if (constants.ITEM_CATEGORY_IOE_TYPE.TEST.has(orderItem.itemIoeType)) {
          // 2. Test
          tempMap = tempObj.testItemsMap;
        } else if (constants.ITEM_CATEGORY_IOE_TYPE.SPECIMEN.has(orderItem.itemIoeType)) {
          // 3. Specimen
          tempMap = tempObj.specimenItemsMap;
        } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Urgent) {
          // 4. Other urgent
          tempMap = tempObj.otherItemsMap;
        } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.RefNo) {
          // 5. Other ref.no
          tempMap = tempObj.otherItemsMap;
        } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Diagnosis) {
          // 6. Other diagnosis
          tempMap = tempObj.otherItemsMap;
        } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.ReportTo) {
          // 7. Other report to
          tempMap = tempObj.otherItemsMap;
        } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Remark&&orderItem.itemName === constants.REMARK_ITEM_NAME) {
          // 8. Other remark
          tempMap = tempObj.otherItemsMap;
        } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Instruction&&orderItem.itemName === constants.INSTRUCTION_ITEM_NAME) {
          // 9. Other remark
          tempMap = tempObj.otherItemsMap;
        } else if (constants.ITEM_CATEGORY_IOE_TYPE.QUESTION.has(orderItem.itemIoeType)) {
          // 10. Question
          tempMap = tempObj.questionItemsMap;
        } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OPTION && orderItem.itemName !== constants.REMARK_ITEM_NAME && orderItem.itemName !== constants.INSTRUCTION_ITEM_NAME) {
          // 11. Question optional
          tempMap = tempObj.questionItemsMap;
        }

        if (!penelItemFlag) {
          tempMap.set(orderItem.codeIoeFormItemId,{
            codeIoeFormId: orderItem.codeIoeFormId,
            codeIoeFormItemId:orderItem.codeIoeFormItemId,
            operationType: orderItem.operationType,
            version: orderItem.version,
            itemVal: orderItem.itemIoeType!==constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo&&orderItem.frmItemTypeCd === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST&&!!orderItem.itemVal?toInteger(orderItem.itemVal):orderItem.itemVal,
            itemVal2: orderItem.itemIoeType!==constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo&&orderItem.frmItemTypeCd2 === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST&&!!orderItem.itemVal2?toInteger(orderItem.itemVal2):orderItem.itemVal2,
            itemName: orderItem.itemName,
            createdBy: orderItem.createdBy,
            createdDtm: orderItem.createdDtm,
            updatedBy: orderItem.updatedBy,
            updatedDtm: orderItem.updatedDtm,
            itemIoeType: orderItem.itemIoeType,
            frmItemTypeCd: orderItem.frmItemTypeCd,
            frmItemTypeCd2: orderItem.frmItemTypeCd2,
            ioeRequestId: orderItem.ioeRequestId, // request id
            ioeRequestItemId: orderItem.ioeRequestItemId // request item id
          });
        }
      });
    }
  }
  return tempObj;
}

// for creating template order obj
let transformTemplateItems = (valObjs) => {
  let tempObj = {
    testItemsMap: new Map(),
    specimenItemsMap: new Map(),
    otherItemsMap: new Map(),
    questionItemsMap: new Map()
  };
  if (valObjs.length>0) {
    let tempMap = new Map();
    valObjs.forEach(orderItem => {
      if (constants.ITEM_CATEGORY_IOE_TYPE.TEST.has(orderItem.itemIoeType)) {
        // 1. Test
        tempMap = tempObj.testItemsMap;
      } else if (constants.ITEM_CATEGORY_IOE_TYPE.SPECIMEN.has(orderItem.itemIoeType)) {
        // 2. Specimen
        tempMap = tempObj.specimenItemsMap;
      } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Urgent) {
        // 3. Other urgent
        tempMap = tempObj.otherItemsMap;
      } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.RefNo) {
        // 4. Other ref.no
        tempMap = tempObj.otherItemsMap;
      } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Diagnosis) {
        // 5. Other diagnosis
        tempMap = tempObj.otherItemsMap;
      } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.ReportTo) {
        // 6. Other report to
        tempMap = tempObj.otherItemsMap;
      } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Remark&&orderItem.itemName === constants.REMARK_ITEM_NAME) {
        // 7. Other remark
        tempMap = tempObj.otherItemsMap;
      } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OTHER.Instruction&&orderItem.itemName === constants.INSTRUCTION_ITEM_NAME) {
        // 8. Other remark
        tempMap = tempObj.otherItemsMap;
      } else if (constants.ITEM_CATEGORY_IOE_TYPE.QUESTION.has(orderItem.itemIoeType)) {
        // 9. Question
        tempMap = tempObj.questionItemsMap;
      } else if (orderItem.itemIoeType === constants.ITEM_CATEGORY_IOE_TYPE.OPTION && orderItem.itemName !== constants.REMARK_ITEM_NAME && orderItem.itemName !== constants.INSTRUCTION_ITEM_NAME) {
        // 10. Question optional
        tempMap = tempObj.questionItemsMap;
      }
      tempMap.set(orderItem.codeIoeFormItemId,{
        codeIoeFormId: orderItem.codeIoeFormId,
        codeIoeFormItemId:orderItem.codeIoeFormItemId,
        operationType: null,
        version: null,
        itemVal: orderItem.itemIoeType!==constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo&&orderItem.frmItemTypeCd === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST&&!!orderItem.itemVal?toInteger(orderItem.itemVal):orderItem.itemVal,
        itemVal2: orderItem.itemIoeType!==constants.OTHER_ITEM_FIELD_IOE_TYPE.ReportTo&&orderItem.frmItemTypeCd2 === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST&&!!orderItem.itemVal2?toInteger(orderItem.itemVal2):orderItem.itemVal2,
        itemName: orderItem.itemName,
        createdBy: null,
        createdDtm: null,
        updatedBy: null,
        updatedDtm: null,
        itemIoeType: orderItem.itemIoeType,
        frmItemTypeCd: orderItem.frmItemTypeCd,
        frmItemTypeCd2: orderItem.frmItemTypeCd2,
        ioeRequestId: null, // request id
        ioeRequestItemId: null, // request item id
        isActive:orderItem.isActive
      });
    });
  }
  return tempObj;
};

// transform template value to storageObj
export function transformTemplateOrderItemsObj(ioeTestTmplItemMap,ioeFormMap) {
  let tempMap = new Map();
  if (!isEmpty(ioeTestTmplItemMap)) {
    for (const testGroup in ioeTestTmplItemMap) {
      if (Object.prototype.hasOwnProperty.call(ioeTestTmplItemMap,testGroup)) {
        let currentOrderObj = ioeTestTmplItemMap[testGroup];
        let currentFormIds = _.keys(currentOrderObj);
        let formId = parseInt(currentFormIds[0]);
        let formObj = ioeFormMap.get(formId);
        let tempMapObj = transformTemplateItems(currentOrderObj[formId]);
        let tempStorageObj = {
          clinicCd: null,
          codeIoeFormId: formId,
          codeIoeRequestTypeCd: null,
          requestUser: null,
          encounterId: null,
          patientKey: null,
          serviceCd: null,

          createdBy: null,
          createdDtm: null,
          updatedBy: null,
          updatedDtm: null,
          ioeRequestId: 0,
          ioeRequestNumber: null,
          requestDatetime: null,
          version: null,
          operationType: null,
          requestLoginName:null,
          // requestUserName: null, // only display request by
          invldReason:null, // invalid
          isInvld: 0, // invalid
          ivgRqstSeqNum: 0, // invalid
          outputFormPrinted: 0, // invalid
          outputFormPrintedBy: null, // invalid
          outputFormPrintedDatetime: null, // invalid
          specimenCollectDatetime: null, // invalid
          specimenCollected: 0, // invalid
          specimenCollectedBy: null, // invalid
          specimenLabelPrinted: 0, // invalid
          specimenLabelPrintedBy: null, // invalid
          specimenLabelPrintedDatetime: null, // invalid

          labId:formObj.labId,
          formShortName: formObj.formShortName,
          testItemsMap: tempMapObj.testItemsMap,
          specimenItemsMap: tempMapObj.specimenItemsMap,
          otherItemsMap: tempMapObj.otherItemsMap,
          questionItemsMap: tempMapObj.questionItemsMap,
          panelItems: []
        };
        tempMap.set(`${formId}_${testGroup}_${Math.random()}`,tempStorageObj);
      }
    }
  }
  return tempMap;
}

let handleTemplateValMapCheck = (value,valMap) => {
  if (valMap.size>0) {
    for (let valObj of valMap.values()) {
      valObj.isChecked = value;
      handleClickBoxOperationType(valObj);
    }
  }
};

// handle template cb
export function handleTemplateTabClickEffect(value,level,middlewareMapObj,orderKey,specimentId,testId) {
  switch (level) {
    case constants.IX_REQUEST_TEMPLATE_CB.LEVEL_1:{
      middlewareMapObj.templateSelectAll = value;
      if (middlewareMapObj.middlewareMap.size>0) {
        for (let valObj of middlewareMapObj.middlewareMap.values()) {
          valObj.selectAll = value;
          handleTemplateValMapCheck(value,valObj.testValMap);
          handleTemplateValMapCheck(value,valObj.specimenValMap);
        }
      }
      break;
    }
    case constants.IX_REQUEST_TEMPLATE_CB.LEVEL_2:{
      let middlewareObject = middlewareMapObj.middlewareMap.get(orderKey);
      middlewareObject.selectAll = value;
      handleTemplateValMapCheck(value,middlewareObject.testValMap);
      handleTemplateValMapCheck(value,middlewareObject.specimenValMap);
      // handle level 1
      let level2 = [];
      for (let valObj of middlewareMapObj.middlewareMap.values()) {
        level2.push(valObj.selectAll);
      }
      level2 = uniq(level2);
      if (level2.length === 1) {
        middlewareMapObj.templateSelectAll = level2[0];
      } else {
        middlewareMapObj.templateSelectAll = false;
      }
      break;
    }
    case constants.IX_REQUEST_TEMPLATE_CB.LEVEL_3:{
      let middlewareObject = middlewareMapObj.middlewareMap.get(orderKey);
      let { masterTestMap } = middlewareObject;

      //handle test
      let testCb = [];
      if (middlewareObject.testValMap.size>0) {
        for (let valObj of middlewareObject.testValMap.values()) {
          if (valObj.codeIoeFormItemId === testId) {
            valObj.isChecked = event.target.checked;
            handleClickBoxOperationType(valObj);
          }
        }

        // check master test
        if (masterTestMap.size > 0) {
          // check master item id
          if (masterTestMap.has(testId)) {
            let subItemIds = masterTestMap.get(testId);
            for (let valObj of middlewareObject.testValMap.values()) {
              let index = findIndex(subItemIds, subItemId => subItemId === valObj.codeIoeFormItemId );
              if (index !== -1) {
                valObj.isChecked = event.target.checked;
                handleClickBoxOperationType(valObj);
              }
            }
          } else {
            // check sub item id
            let targetMasterId = null;
            let targetMasterSubIds = [];
            for (let [masterId, subItemIds] of masterTestMap) {
              let index = findIndex(subItemIds, subItemId => subItemId === testId );
              if (index !== -1) {
                targetMasterId = masterId;
                targetMasterSubIds = subItemIds;
                break;
              }
            }
            if (!isNull(targetMasterId)&&targetMasterSubIds.length > 0&&middlewareObject.testValMap.has(targetMasterId)) {
              let tempArray = [event.target.checked];
              targetMasterSubIds.forEach(subItemId => {
                tempArray.push(middlewareObject.testValMap.get(subItemId).isChecked);
              });
              tempArray = union(tempArray);
              let masterObj = middlewareObject.testValMap.get(targetMasterId);
              if (tempArray.length === 1) {
                masterObj.isChecked = tempArray[0];
                handleClickBoxOperationType(masterObj);
              } else {
                masterObj.isChecked = false;
                handleClickBoxOperationType(masterObj);
              }
            }
          }
        }
      }

      testCb = [...middlewareObject.testValMap.values()].map(testValObj => testValObj.isChecked);
      let testFlag = testCb.some(item => item == true);

       //handle specimen
       let specimenCb = [];
       if (middlewareObject.specimenValMap.size>0) {
         for (let valObj of middlewareObject.specimenValMap.values()) {
           if (valObj.codeIoeFormItemId === specimentId) {
             valObj.isChecked = testFlag ? true : event.target.checked;
             handleClickBoxOperationType(valObj);
           }
           specimenCb.push(valObj.isChecked);
         }
       }

      // handle level 2
      let total = union(specimenCb,testCb);
      if (total.length === 1) {
        middlewareObject.selectAll = total[0];
      } else {
        middlewareObject.selectAll = false;
      }

      // handle level 1
      let level2 = [];
      for (let valObj of middlewareMapObj.middlewareMap.values()) {
        level2.push(valObj.selectAll);
      }
      level2 = uniq(level2);
      if (level2.length === 1) {
        middlewareMapObj.templateSelectAll = level2[0];
      } else {
        middlewareMapObj.templateSelectAll = false;
      }
      break;
    }
    default:
      break;
  }
}


export function orderHasLFTQuestion(middlewareObject) {
  let questionGroupMap = middlewareObject.questionGroupMap;
  let flag = false;
  for (let [key, value] of questionGroupMap) {
    if(key === 'Gel tube') {
      flag = true;
      break;
    }
  }
  return flag;
}

// search the template order with questions
export function handleTemplateOrderWithQuestions(middlewareMapObj,itemMapping,storageMap,gbsIsExist,lftIsExist) {
  let { middlewareMap } = middlewareMapObj;
  let templateOrderTotalKeys =[],
      templateOrderWithQuestionKeys = [],
      templateOrderWithDiagnosisKeys = [],
      templateOrderWithoutDiagnosisKeys = [];

  for (let [orderKey, valObj] of middlewareMap) {
    let selectedFlag = false;
    if(!selectAllOrderItemsDisabledFlag(storageMap ? storageMap.get(orderKey) : null)){
      if (valObj.specimenValMap.size>0) {
        // validate specimen (0 or 1)
        for (let specimenObj of valObj.specimenValMap.values()) {
          if (specimenObj.isChecked) {
            selectedFlag = true;
            break;
          }
        }
      } else {
        // validate test (n)
        for (let testObj of valObj.testValMap.values()) {
          if (testObj.isChecked) {
            selectedFlag = true;
            break;
          }
        }
      }

      if (selectedFlag) {
        //check diagnosis(diagnosis[!],remark,instruction)
        if (valObj.otherValMap.size>0) {
          let notDiagnosisFlag=true;
          for (let otherObj of valObj.otherValMap.values()) {
            if (otherObj.itemIoeType===constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
              notDiagnosisFlag=false;
              if (!!otherObj.itemVal) {
                templateOrderWithDiagnosisKeys.push(orderKey);
              } else {
                templateOrderWithoutDiagnosisKeys.push(orderKey);
              }
              break;
            }
          }
          if(notDiagnosisFlag){
            templateOrderWithoutDiagnosisKeys.push(orderKey);
          }
        }

        let displayFlag = handleOtherInfoDialogDisplay(valObj,itemMapping);
        if (displayFlag && !(valObj.codeIoeFormId === 100012 && gbsIsExist) && !(orderHasLFTQuestion(valObj) && lftIsExist)) {
          templateOrderWithQuestionKeys.push(orderKey);
        }
        // if (displayFlag && !(orderHasLFTQuestion(valObj) && lftIsExist)) {
        //   templateOrderWithQuestionKeys.push(orderKey);
        // }
        templateOrderTotalKeys.push(orderKey);
      }
    }
  }

  return {
    templateOrderTotalKeys,
    templateOrderWithQuestionKeys,
    templateOrderWithDiagnosisKeys,
    templateOrderWithoutDiagnosisKeys
  };
}

export function transformStorageInfo(targetObj,storageObj) {
  targetObj.createdBy = storageObj.createdBy;
  targetObj.createdDtm = storageObj.createdDtm;
  targetObj.updatedBy = storageObj.updatedBy;
  targetObj.updatedDtm = storageObj.updatedDtm;
  targetObj.ioeRequestId = storageObj.ioeRequestId;
  targetObj.ioeRequestNumber = storageObj.ioeRequestNumber;
  targetObj.requestDatetime = storageObj.requestDatetime;
  targetObj.version = storageObj.version;
  targetObj.invldReason = storageObj.invldReason;
  targetObj.isInvld = storageObj.isInvld;
  targetObj.ivgRqstSeqNum = storageObj.ivgRqstSeqNum;
  targetObj.outputFormPrinted = storageObj.outputFormPrinted;
  targetObj.outputFormPrintedBy = storageObj.outputFormPrintedBy;
  targetObj.outputFormPrintedDatetime = storageObj.outputFormPrintedDatetime;
  targetObj.specimenCollectDatetime = storageObj.specimenCollectDatetime;
  targetObj.specimenCollected = storageObj.specimenCollected;
  targetObj.specimenCollectedBy = storageObj.specimenCollectedBy;
  targetObj.specimenLabelPrinted = storageObj.specimenLabelPrinted;
  targetObj.specimenLabelPrintedBy = storageObj.specimenLabelPrintedBy;
  targetObj.specimenLabelPrintedDatetime = storageObj.specimenLabelPrintedDatetime;
  // targetObj.requestUser = storageObj.requestUser;
  // targetObj.requestLoginName = storageObj.requestLoginName;
  // targetObj.requestUserName = storageObj.requestUserName;
}

export function generateDropdownValue(dropdownMap,valObj,type) {
  let options = dropdownMap.get(valObj.codeIoeFormItemId).get(type);
  let targetOption = find(options,option=>{
    let tempVal = type === constants.ITEM_VALUE.TYPE1?valObj.itemVal:valObj.itemVal2;
    return (option.codeIoeFormItemDropId+'') === tempVal+'';
  });
  return !!targetOption?targetOption.value:'';
}

let resetNormalValMap = (valMap) => {
  for (let obj of valMap.values()) {
    // if (obj.isChecked) {
    //   obj.operationType = COMMON_ACTION_TYPE.INSERT; // new -> insert
    // } else {
    //   obj.operationType = null;
    // }
    obj.isChecked = false;
    obj.itemVal = null;
    obj.itemVal2 = null;
    obj.operationType = null;
    obj.version = null;
    obj.createdBy = null;
    obj.createdDtm = null;
    obj.updatedBy = null;
    obj.updatedDtm = null;
  }
};

let resetQuestionValMap = (questionValMap) => {
  for (let obj of questionValMap.values()) {
    obj.operationType = null;
    obj.version = null;
    obj.createdBy = null;
    obj.createdDtm = null;
    obj.updatedBy = null;
    obj.updatedDtm = null;
    obj.itemVal = null;
    obj.itemVal2 = null;
    obj.isChecked = false;
  }
};

export function resetMiddlewareObject(middlewareObject) {
  let { testValMap, specimenValMap, otherValMap, questionValMap } = middlewareObject;
  resetNormalValMap(testValMap);
  resetNormalValMap(specimenValMap);
  resetNormalValMap(otherValMap);
  resetQuestionValMap(questionValMap);
}

let resetTemplateOrderValMap = (valMap) => {
  for (let obj of valMap.values()) {
    obj.isChecked=false;
    obj.operationType = null;
  }
};

export function resetTemplateOrderMiddlewareObject(middlewareObject) {
  let { testValMap, specimenValMap, otherValMap, questionValMap } = middlewareObject;
  middlewareObject.selectAll = false;
  resetTemplateOrderValMap(testValMap);
  resetTemplateOrderValMap(specimenValMap);
  resetTemplateOrderValMap(otherValMap);
  resetTemplateOrderValMap(questionValMap);
}

export function validateMaxTest(testObj,valMap,ioeFormMap,formId) {
  let msgCode = '';
  if (testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITE||testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITEO) {
    let sum = 0;
    let proportion = testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITE?1:99;
    let formObj = ioeFormMap.get(formId);
    let maxTest = formObj.maxTest;
    let typeSet = new Set();
    for (let itemValObj of valMap.values()) {
      if (itemValObj.isChecked) {
        if (itemValObj.itemIoeType!==constants.TEST_ITEM_IOE_TYPE.ITEF) {
          typeSet.add(itemValObj.itemIoeType);
        }
        sum+=constants.TEST_IOE_TYPE_PROPORTION_MAP.get(itemValObj.itemIoeType);
      }
    }
    if (sum+proportion>maxTest) {
      if (typeSet.has(constants.TEST_ITEM_IOE_TYPE.ITE)) {
        if (testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITE) {
          msgCode = IX_REQUEST_CODE.EXCEEDED_TEST_LIMIT;
        } else if (testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITEO) {
          msgCode = IX_REQUEST_CODE.EXCEEDED_TEST_LIMIT_ITEO;
        }
      } else if (typeSet.has(constants.TEST_ITEM_IOE_TYPE.ITEO)) {
        if (testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITE || testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITEO) {
          msgCode = IX_REQUEST_CODE.EXCEEDED_TEST_LIMIT_ITEO;
        }
        // else if (testObj.itemIoeType === constants.TEST_ITEM_IOE_TYPE.ITEO) {
        //   msgCode = IX_REQUEST_CODE.EXCEEDED_TEST_LIMIT_ITEO;
        // }
      }
    }
  }
  return msgCode;
}

export function copyQuestionVal(middlewareMap,formGroupKeysMap,filterKeys) {
  let targetIdMap = new Map();
  filterKeys.forEach(key => {
    if(middlewareMap.get(key).iqsIds){
      let idStrs = middlewareMap.get(key).iqsIds.join(',');
      targetIdMap.set(idStrs, key);
    }
  });

  filterKeys.forEach(key => {
    let middlewareObject = middlewareMap.get(key);
    let {codeIoeFormId} = middlewareObject;
    if (formGroupKeysMap.has(codeIoeFormId)) {
      let keys = formGroupKeysMap.get(codeIoeFormId);
      keys.forEach(selectedKey => {
        if (!filterKeys.includes(selectedKey)) {
          let tempMiddlewareObject = middlewareMap.get(selectedKey);
          tempMiddlewareObject.questionValMap = cloneDeep(middlewareObject.questionValMap);
          let iqsFlag = tempMiddlewareObject.iqsIds?true:false;
          if (iqsFlag) {
            let tempIqsStr = tempMiddlewareObject.iqsIds.join(',');
            if (targetIdMap.has(tempIqsStr)) {
              let targetObj = middlewareMap.get(targetIdMap.get(tempIqsStr));
              tempMiddlewareObject.questionValMap = cloneDeep(targetObj.questionValMap);
            }
          } else {
            for (let valObj of tempMiddlewareObject.questionValMap.values()) {
              if (valObj.itemIoeType===constants.ITEM_QUESTION_TYPE.IQS) {
                valObj.itemVal = null;
                valObj.itemVal2 = null;
                valObj.isChecked = false;
              }
            }
          }
        }
      });
    }
  });
}

let compareMiddlewareObjectValMap = (currentValMap,originValMap,questionMode=false) => {
  for (let [formItemId, valObj] of originValMap) {
    let currentValObj = currentValMap.get(formItemId);
    valObj.itemVal = currentValObj.itemVal;
    valObj.itemVal2 = currentValObj.itemVal2;
    valObj.isChecked = currentValObj.isChecked;

    if (questionMode) {
      if (constants.FORM_ITEM_TYPE.CLICK_BOX === valObj.frmItemTypeCd) {
        handleClickBoxOperationType(valObj);
      } else {
        handleInfoOperationType(valObj);
      }
    } else {
      if (constants.FORM_ITEM_TYPE.CLICK_BOX === valObj.frmItemTypeCd) {
        handleClickBoxOperationType(valObj);
      } else if (constants.FORM_ITEM_TYPE.INPUT_BOX === valObj.frmItemTypeCd) {
        handleInputBoxOperationType(valObj);
      } else if (constants.FORM_ITEM_TYPE.DROP_DOWN_LIST === valObj.frmItemTypeCd) {
        handleDropdownOperationType(valObj);
      }
    }
  }
};

export function compareMiddlewareObject(currentObj,originObj,includeQuestion=false) {
  compareMiddlewareObjectValMap(currentObj.testValMap,originObj.testValMap);
  compareMiddlewareObjectValMap(currentObj.specimenValMap,originObj.specimenValMap);
  compareMiddlewareObjectValMap(currentObj.otherValMap,originObj.otherValMap);
  if (includeQuestion) {
    compareMiddlewareObjectValMap(currentObj.questionValMap,originObj.questionValMap,true);
  } else {
    let { questionValMap } = originObj;
    for (let valObj of questionValMap.values()) {
      valObj.isChecked = false;
      valObj.itemVal = null;
      valObj.itemVal2 = null;
      if (constants.FORM_ITEM_TYPE.CLICK_BOX === valObj.frmItemTypeCd) {
        handleClickBoxOperationType(valObj);
      } else {
        handleInfoOperationType(valObj);
      }
    }
  }
}

export function handleIQSItem(displayIQS,middlewareObject) {
  let { questionValMap } = middlewareObject;
  if (!displayIQS) {
    for (let valObj of questionValMap.values()) {
      if (valObj.itemIoeType === constants.ITEM_QUESTION_TYPE.IQS) {
        valObj.itemVal = null;
        handleInfoOperationType(valObj);
      }
    }
  }
}

export function validateTestOrSpecimentChecked(middlewareObject) {
  let { testValMap, specimenValMap } = middlewareObject;
  let checkedFlag = false;
  if ( testValMap && testValMap.size > 0) {
    for (let valueObj of testValMap.values()) {
      if (valueObj.isChecked) {
        checkedFlag = true;
      }
    }
  }
  if (specimenValMap && specimenValMap.size > 0) {
    for (let valueObj of specimenValMap.values()) {
      if (valueObj.isChecked) {
        checkedFlag = true;
      }
    }
  }
  return checkedFlag;
}

export function validateTemplateChecked(middlewareMapObj) {
  let {templateSelectAll,middlewareMap} = middlewareMapObj;
  let checkedFlag = false;
  if (templateSelectAll) {
    checkedFlag = true;
  } else {
    if(middlewareMap!=undefined){
      for (let middlewareObject of middlewareMap.values()) {
        let {selectAll} = middlewareObject;
        if (selectAll) {
          checkedFlag = true;
          break;
        } else {
          let tempFlag = validateTestOrSpecimentChecked(middlewareObject);
          if (tempFlag) {
            checkedFlag = true;
            break;
          }
        }
      }
    }
  }
  return checkedFlag;
}


export function validateExpressIoeTemplateChecked(expressIoeMap) {
  let checkedFlag = false;
  for (let expressIoe of expressIoeMap.values()) {
    let {formMap}=expressIoe;
      for (let item of formMap.values()) {
        let {isChecked} = item;
        if (isChecked) {
          checkedFlag = true;
          break;
        }
      }
  }
  return checkedFlag;
}
export function searchFieldLengthFlag(basicInfo,searchFieldLengthObj) {
  let {infoDiagnosis,infoRemark,infoInstruction,clinicRefNo} = basicInfo;
  let checkedFlag = false;
  if(searchFieldLengthObj){
    if(
      (searchFieldLengthObj.refNo && clinicRefNo.length > searchFieldLengthObj.refNo) ||
      (searchFieldLengthObj.diagnosis && infoDiagnosis.length > searchFieldLengthObj.diagnosis) ||
      (searchFieldLengthObj.remark && infoRemark.length > searchFieldLengthObj.remark) ||
      (searchFieldLengthObj.instruction && infoInstruction.length > searchFieldLengthObj.instruction)
    ) {
      checkedFlag=true;
    }
  }
  return checkedFlag;
}

export function fieldInputCheckFlagObj(checkedExpressIoeMap) {
  let flag=false;
  let inputCheckFlagObj={flag,item:{}};
  if (checkedExpressIoeMap.size > 0) {
    let expressIoeList= [...checkedExpressIoeMap.values()];
    for (let index = 0; index < expressIoeList.length; index++) {
      const items = expressIoeList[index];
      let {inputOrderList = [],isDetl } = items;
      if (isDetl > 0) {
        if(inputOrderList.length===0){
          flag=true;
          inputCheckFlagObj={flag,item:items};
          break;
        }
      }
    }
  }
  return inputCheckFlagObj;
}

export function itemNullAbleFlag(middlewareObject) {
  let {specimenValMap,testValMap} = middlewareObject;
  let checkedFlag = true;
  if (testValMap.size > 0) {
    for (let valueObj of testValMap.values()) {
      if (valueObj.nullAble==='N'&&valueObj.isChecked&&(valueObj.frmItemTypeCd=='IB'||valueObj.frmItemTypeCd=='DL')&&((valueObj.frmItemTypeCd!==null&&(valueObj.itemVal===null||valueObj.itemVal===''))||(valueObj.frmItemTypeCd2!==null&&(valueObj.itemVal2===null||valueObj.itemVal2==='')))) {
        return false;
      }
    }
  }
  if (specimenValMap.size > 0) {
    for (let obj of specimenValMap.values()) {
      if (obj.nullAble==='N'&&obj.isChecked&&(obj.frmItemTypeCd=='IB'||obj.frmItemTypeCd=='DL')&&((obj.frmItemTypeCd!==null&&(obj.itemVal===null||obj.itemVal===''))||(obj.frmItemTypeCd2!==null&&(obj.itemVal2===null||obj.itemVal2==='')))) {
        return false;
      }
    }
  }
  return checkedFlag;
}

export function pretreatmentEditIQS(middlewareObject,iqsIds) {
  let { questionValMap } = middlewareObject;
  for (let [itemId, valObj] of questionValMap) {
    if (!iqsIds.has(itemId)&&valObj.itemIoeType === constants.ITEM_QUESTION_TYPE.IQS) {
      valObj.isChecked = false;
      valObj.itemVal = null;
      valObj.itemVal2 = null;
      if (constants.FORM_ITEM_TYPE.CLICK_BOX === valObj.frmItemTypeCd) {
        handleClickBoxOperationType(valObj);
      } else {
        handleInfoOperationType(valObj);
      }
    }
  }
}

export function transformOtherValMap(storageObj,middlewareObject) {
  let { otherValMap } = middlewareObject;
  let { otherItemsMap } = storageObj;
  for (let [itemId, itemObj] of otherValMap) {
    if (itemObj.isChecked) {
      let tempObj = cloneDeep(itemObj);
      delete tempObj.isActive;
      delete tempObj.isChecked;
      delete tempObj.nullAble;
      otherItemsMap.set(itemId, tempObj);
    }
  }
}

export function generateBasicInfoByEdit(storeValObj) {
  return {
    codeIoeRequestTypeCd: storeValObj.codeIoeRequestTypeCd,
    encounterId: storeValObj.encounterId,
    patientKey: storeValObj.patientKey,
    serviceCd: storeValObj.serviceCd,
    createdBy: storeValObj.createdBy,
    createdDtm: storeValObj.createdDtm,
    updatedBy: storeValObj.updatedBy,
    updatedDtm: storeValObj.updatedDtm,
    ioeRequestId: storeValObj.ioeRequestId,
    ioeRequestNumber: storeValObj.ioeRequestNumber,
    requestDatetime: storeValObj.requestDatetime,
    version: storeValObj.version,
    invldReason: storeValObj.invldReason,
    isInvld: storeValObj.isInvld,
    ivgRqstSeqNum: storeValObj.ivgRqstSeqNum,
    outputFormPrinted: storeValObj.outputFormPrinted,
    outputFormPrintedBy: storeValObj.outputFormPrintedBy,
    outputFormPrintedDatetime: storeValObj.outputFormPrintedDatetime,
    specimenCollectDatetime: storeValObj.specimenCollectDatetime,
    specimenCollected: storeValObj.specimenCollected,
    specimenCollectedBy: storeValObj.specimenCollectedBy,
    specimenLabelPrinted: storeValObj.specimenLabelPrinted,
    specimenLabelPrintedBy: storeValObj.specimenLabelPrintedBy,
    specimenLabelPrintedDatetime: storeValObj.specimenLabelPrintedDatetime,

    // urgentIsChecked: false,
    requestedBy: storeValObj.requestUser,  //requestUser
    requestLoginName: storeValObj.requestLoginName,  //requestLoginName
    requestUser: storeValObj.requestUser  //requestUser
    // requestUserName: storeValObj.requestUserName // only display request by
    // requestingUnit:encounterData.clinicCd||'',  //clinicCd
    // reportTo:encounterData.clinicCd||'',
  };
}

export function transformPanelItem2IoeRequestItem(requestItems, panels=[], operationType = null) {
  for (let i = 0; i < panels.length; i++) {
    const panelObj = panels[i];
    if ((isNull(panelObj.version)&&
      (panelObj.operationType === COMMON_ACTION_TYPE.UPDATE||panelObj.operationType === COMMON_ACTION_TYPE.DELETE))||
      (isNull(panelObj.operationType))) {
      continue;
    } else {
      requestItems.push({
        codeIoeFormId: panelObj.codeIoeFormId,
        codeIoeFormItemId: panelObj.codeIoeFormItemId,
        ioeRequestId: panelObj.ioeRequestId,
        ioeRequestItemId: panelObj.ioeRequestItemId,
        itemVal: panelObj.itemVal,
        itemVal2: panelObj.itemVal2,
        operationType:  operationType?operationType:panelObj.operationType,
        createdBy: panelObj.createdBy,
        createdDtm: panelObj.createdDtm,
        updatedBy: panelObj.updatedBy,
        updatedDtm: panelObj.updatedDtm,
        version: panelObj.version
      });
    }
  }
}

export function checkTemplateOrdersLipidProfileIsCheck(middlewareMap) {
  let flag = true;
  let middlewareObjects = [...middlewareMap.values()];
  for (let i = 0; i < middlewareObjects.length; i++) {
    let middlewareObject = middlewareObjects[i];
    if (!checkLipidProfileIsCheck(middlewareObject)) {
      return false;
    }
  }
  return flag;
}

export function getServiceTemplateTabName(data,selectId){
  let tabName = '';
  let targetMap = data.get('S').templateMap;
  tabName = targetMap.size > 0 && targetMap.has(selectId) ? targetMap.get(selectId).templateName : '';
  return tabName === '' ? false : (tabName.toUpperCase() === commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_NAME ? true : false);
}

export function getServiceTemplateTabNameByOrderType(data,infoOrderType,selectId,templateName){
  let tabName = '';
  let targetMap = data.get(infoOrderType).templateMap;
  tabName = targetMap.size > 0 && targetMap.has(selectId) ? targetMap.get(selectId).templateName : '';
  return tabName === '' ? false : (tabName.toUpperCase() === templateName ? true : false);
}

export function getNurseTemplateTabName(data,selectId){
  let tabName = '';
  let targetMap = data.get('N').templateMap;
  tabName = targetMap.size > 0 && targetMap.has(selectId) ? targetMap.get(selectId).templateName : '';
  return tabName === '' ? false : (tabName.toUpperCase() === commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_NAME ? true : false);
}

export function getFOPHasDiagnosis(middlewareMap, orderType) {
  let flag = false;
  for (const [key, value] of middlewareMap) {
    let itemsMap = value.otherValMap;
    if (itemsMap.size>0) {
      for (let item of itemsMap.values()) {
        if(item.itemIoeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
          if (orderType!==constants.PRIVILEGES_DOCTOR_TABS[0].value&&item.itemVal) {
            flag = true;
            break;
          }
        }
      }
    }
  }
  return flag;
}