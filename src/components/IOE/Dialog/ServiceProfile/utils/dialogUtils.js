import {COMMON_ACTION_TYPE} from '../../../../../constants/common/commonConstants';
import * as ServiceProfileConstants from '../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import { isNull,union,findIndex,find,cloneDeep,concat } from 'lodash';
import { SERVICE_PROFILE_MAINTENANCE_CODE } from '../../../../../constants/message/IOECode/serviceProfileMaintenanceCode';

let generateMasterTestMap = (testItemsMap) => {
  let tempMap = new Map();
  if (testItemsMap.size > 0) {
    for (let items of testItemsMap.values()) {
      items.forEach(item => {
        if (item.ioeMasterTest === ServiceProfileConstants.TEST_ITEM_MASTER_TEST_FLAG) {
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

let generateValMap = (itemsMap,type,formId,storageObjMap) => {
  let valMap = new Map();
  if (itemsMap.size>0) {
    for (let items of itemsMap.values()) {
      items.forEach(item => {
        let obj = {
          codeIoeFormItemId:item.codeIoeFormItemId,
          testGroup: 0, //default group
          operationType: null,
          version: null,
          itemVal: null,
          itemVal2: null,
          codeIoeFormId:formId,
          ioeType: item.ioeType,
          isChecked: type === ServiceProfileConstants.ITEM_CATEGORY_TYPE.INFO?true:false, //Click box status
          itemName: item.frmItemName,
          createdBy:null,
          createdDtm:null,
          updatedBy:null,
          updatedDtm:null,
          frmItemTypeCd: item.frmItemTypeCd,
          frmItemTypeCd2: item.frmItemTypeCd2,
          ioeTestTemplateId: null, // template id
          ioeTestTemplateItemId:null, // template item id
          nullAble: item.nullAble || 'N'
        };
        if (storageObjMap.has(item.codeIoeFormItemId)) {
          let valObj = storageObjMap.get(item.codeIoeFormItemId);
          obj.testGroup = valObj.testGroup;
          obj.operationType = valObj.operationType;
          obj.version = valObj.version;
          obj.itemVal = valObj.itemVal;
          obj.itemVal2 = valObj.itemVal2;
          obj.isChecked = valObj.operationType!==COMMON_ACTION_TYPE.DELETE?true:false;
          obj.createdBy = valObj.createdBy;
          obj.createdDtm = valObj.createdDtm;
          obj.updatedBy = valObj.updatedBy;
          obj.updatedDtm = valObj.updatedDtm;
          obj.ioeTestTemplateId = valObj.ioeTestTemplateId;
          obj.ioeTestTemplateItemId = valObj.ioeTestTemplateItemId;
          obj.nullAble = item.nullAble;
        }
        valMap.set(item.codeIoeFormItemId,obj);
      });
    }
  }
  return valMap;
};

export function initMiddlewareObject(formObj,storageObj=null) {
  let valObj = {
    codeIoeFormId:null,
    formShortName:'',
    testValMap:new Map(),
    specimenValMap:new Map(),
    infoValMap:new Map(),
    masterTestMap:new Map()
  };
  if (!isNull(formObj)) {
    let {codeIoeFormId,testItemsMap,specimenItemsMap,infoItemsMap,formShortName} = formObj;
    let testStorageObjMap = new Map();
    let specimenStorageObjMap = new Map();
    let infoStorageObjMap = new Map();
    if (!isNull(storageObj)) {
      testStorageObjMap = storageObj.testItemsMap;
      specimenStorageObjMap = storageObj.specimenItemsMap;
      infoStorageObjMap = storageObj.infoItemsMap;
    }
    valObj.codeIoeFormId = codeIoeFormId;
    valObj.formShortName = formShortName;
    valObj.testValMap = generateValMap(testItemsMap,ServiceProfileConstants.ITEM_CATEGORY_TYPE.TEST,codeIoeFormId,testStorageObjMap);
    valObj.specimenValMap = generateValMap(specimenItemsMap,ServiceProfileConstants.ITEM_CATEGORY_TYPE.SPECIMEN,codeIoeFormId,specimenStorageObjMap);
    valObj.infoValMap = generateValMap(infoItemsMap,ServiceProfileConstants.ITEM_CATEGORY_TYPE.INFO,codeIoeFormId,infoStorageObjMap);
    valObj.masterTestMap = generateMasterTestMap(testItemsMap);
  }
  return valObj;
}

let transformValMap2StorageMap = (itemsMap,testGroup) => {
  let valMap = new Map();
  if (itemsMap.size>0) {
    for (let item of itemsMap.values()) {
      if (item.isChecked||!isNull(item.operationType)) {
        valMap.set(item.codeIoeFormItemId,{
          codeIoeFormItemId:item.codeIoeFormItemId,
          testGroup: testGroup,
          operationType: item.operationType,
          version: item.version,
          itemVal: item.itemVal,
          itemVal2: item.itemVal2,
          codeIoeFormId: item.codeIoeFormId,
          itemName: item.itemName,
          createdBy: item.createdBy,
          createdDtm: item.createdDtm,
          updatedBy: item.updatedBy,
          updatedDtm: item.updatedDtm,
          frmItemTypeCd: item.frmItemTypeCd,
          frmItemTypeCd2: item.frmItemTypeCd2,
          ioeTestTemplateId: item.ioeTestTemplateId, // template id
          ioeTestTemplateItemId: item.ioeTestTemplateItemId // template item id
        });
      }
    }
  }
  return valMap;
};

export function initTemporaryStorageObj(middleObj,testGroup,labId) {
  let obj = {
    codeIoeFormId: middleObj.codeIoeFormId,
    testGroup,
    labId,
    formShortName: middleObj.formShortName,
    testItemsMap: transformValMap2StorageMap(middleObj.testValMap,testGroup),
    specimenItemsMap: transformValMap2StorageMap(middleObj.specimenValMap,testGroup),
    infoItemsMap: transformValMap2StorageMap(middleObj.infoValMap,testGroup)
  };
  return obj;
}

export function handleClickBoxOperationType(valObj) {
  let { version, isChecked } = valObj;
  if (!isNull(version)) {
    if (isChecked) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
      valObj.isChecked = false;
    }
  } else if (isNull(version)&&isChecked) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    valObj.operationType = null;
  }
}

export function handleInputBoxOperationType(valObj) {
  let { version, itemVal, itemVal2, isChecked } = valObj;
  if (!isNull(version)) {
    if (isChecked) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  } else if (isNull(version)&&(!!itemVal || !!itemVal2)) {
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
  let { version, itemVal, itemVal2, isChecked } = valObj;
  if (!isNull(version)) {
    valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
  } else if (isNull(version)&&(!!itemVal || !!itemVal2)) {
    if (isChecked) {
      valObj.operationType = COMMON_ACTION_TYPE.INSERT;
    } else {
      valObj.operationType = null;
    }
  } else {
    valObj.operationType = null;
  }
}

export function handleInfoOperationType(valObj) {
  let { version, itemVal } = valObj;
  if (!isNull(version)) {
    if (!!itemVal) {
      valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
    } else if (itemVal === '') {
      valObj.operationType = COMMON_ACTION_TYPE.DELETE;
    }
  } else if (isNull(version)&&(!!itemVal)) {
    valObj.operationType = COMMON_ACTION_TYPE.INSERT;
  } else {
    valObj.operationType = null;
  }
}

let sortItemsMap = (itemsMap,testGroup) => {
  if (itemsMap.size > 0) {
    for (let valObj of itemsMap.values()) {
      valObj.testGroup = testGroup;
      if (!isNull(valObj.version)) {
        valObj.operationType = COMMON_ACTION_TYPE.UPDATE;
      }
    }
  }
  return itemsMap;
};

export function handleOrderDeleted(temporaryStorageMap) {
  if (temporaryStorageMap.size>0) {
    let seq = 1;
    for (let valObj of temporaryStorageMap.values()) {
      if (valObj.testGroup !== seq) {
        valObj.testGroup = seq;
        valObj.testItemsMap = sortItemsMap(valObj.testItemsMap,seq);
        valObj.specimenItemsMap = sortItemsMap(valObj.specimenItemsMap,seq);
        valObj.infoItemsMap = sortItemsMap(valObj.infoItemsMap,seq);
      }
      seq++;
    }
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

export function handledeletedStorageObj(deletedStorageObj) {
  let { testItemsMap, specimenItemsMap, infoItemsMap } = deletedStorageObj;
  deletedStorageObj.testItemsMap = setDeletedItemsMap(testItemsMap);
  deletedStorageObj.specimenItemsMap = setDeletedItemsMap(specimenItemsMap);
  deletedStorageObj.infoItemsMap = setDeletedItemsMap(infoItemsMap);
  return deletedStorageObj;
}

export function handleValidateItemsIncludeTestAndSpecimen(middlewareObject) {
  let {testValMap,specimenValMap} = middlewareObject;
  let msgCode = '';
  if (testValMap.size > 0 && specimenValMap.size>0) {
    let checkedIoeTypeArray = [];
    for (let valObj of testValMap.values()) {
      if (valObj.isChecked) {
        checkedIoeTypeArray.push(valObj.ioeType);
      }
    }

    let checkedIoeSpecimenTypeArray = [];
    for (let valObj of specimenValMap.values()) {
      if (valObj.isChecked) {
        checkedIoeSpecimenTypeArray.push(valObj.ioeType);
      }
    }

    if (checkedIoeTypeArray.length === 0&& checkedIoeSpecimenTypeArray.length>0) {
      msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_TEST_NOT_SELECTED;
    }
    if(checkedIoeTypeArray.length > 0&& checkedIoeSpecimenTypeArray.length===0){
      msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_SPECIMEN_NOT_SELECTED;
    }

  }


  return msgCode;
}

export function handleValidateItems(middlewareObject) {
  let {testValMap,specimenValMap} = middlewareObject;
  let msgCode = '';
  //1.test
  if (testValMap.size > 0) {
    let checkedIoeTypeArray = [];
    for (let valObj of testValMap.values()) {
      if (valObj.isChecked) {
        checkedIoeTypeArray.push(valObj.ioeType);
      }
    }
    if (checkedIoeTypeArray.length === 0) {
      msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_TEST_NOT_SELECTED;
    } else {
      checkedIoeTypeArray = union(checkedIoeTypeArray);
      if (checkedIoeTypeArray.length === 1) {
        let index = findIndex(checkedIoeTypeArray, type => {
          return type === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEF;
        });
        if (index!==-1) {
          msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_TEST_IOE_TYPE;
        }
      }
    }
  }
  //2.specimen
  if (msgCode === ''&&specimenValMap.size>0) {
    let checkedIoeTypeArray = [];
    for (let valObj of specimenValMap.values()) {
      if (valObj.isChecked) {
        checkedIoeTypeArray.push(valObj.ioeType);
      }
    }
    if (checkedIoeTypeArray.length === 0) {
      msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.DIALOG_SPECIMEN_NOT_SELECTED;
    }
  }
  return msgCode;
}

export function handleSepcimenItem(id,valMap) {
  for (let [itemId, valObj] of valMap) {
    if (itemId!==id) {
      valObj.isChecked = false;
      handleClickBoxOperationType(valObj);
    }
  }
}

export function handleTestItem(id,valMap,masterTestMap,selectedLabId) {
  let currentValObj = valMap.get(id);
  let currentItemIoeType = currentValObj.ioeType;
  let checkedFlag = currentValObj.isChecked;
  // handle comment test
  if (checkedFlag) {
    switch (currentItemIoeType) {
      case ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEO:{
        for (let itemValObj of valMap.values()) {
          if (itemValObj.codeIoeFormItemId !== id && itemValObj.ioeType !== ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEF) {
            itemValObj.isChecked = false;
            handleClickBoxOperationType(itemValObj);
          }
        }
        break;
      }
      case ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITE:{
        for (let itemValObj of valMap.values()) {
          if (itemValObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEO) {
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
  if (selectedLabId === ServiceProfileConstants.LAB_ID.CPLC) {
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

export function generateDropdownValue(dropdownMap,valObj,type) {
  let options = dropdownMap.get(valObj.codeIoeFormItemId).get(type);
  let targetOption = find(options,option=>{
    let tempVal = type === ServiceProfileConstants.ITEM_VALUE.TYPE1?valObj.itemVal:valObj.itemVal2;
    return option.codeIoeFormItemDropId === tempVal;
  });
  return !!targetOption?targetOption.value:'';
}

let resetNormalValMap = (valMap,isInfo=false) => {
  for (let obj of valMap.values()) {
    if (!isInfo) {
      obj.isChecked = false;
    }
    obj.operationType = null;
    obj.itemVal = null;
    obj.itemVal2 = null;
    obj.version = null;
    obj.createdBy = null;
    obj.createdDtm = null;
    obj.updatedBy = null;
    obj.updatedDtm = null;
    obj.ioeTestTemplateId = null;
    obj.ioeTestTemplateItemId = null;
  }
};

export function resetMiddlewareObject(middlewareObject) {
  let { testValMap, specimenValMap, infoValMap } = middlewareObject;
  resetNormalValMap(testValMap);
  resetNormalValMap(specimenValMap);
  resetNormalValMap(infoValMap,true);
}

let parseItemObj = (targetObj,itemObj,dropdownMap) => {
  let tempObj = {
    codeIoeFormItemId:itemObj.codeIoeFormItem.codeIoeFormItemId,
    testGroup: itemObj.testGroup,
    itemVal: itemObj.itemVal,
    itemVal2: itemObj.itemVal2,
    codeIoeFormId: itemObj.codeIoeFormId,
    itemName: itemObj.codeIoeFormItem.frmItemName,
    frmItemTypeCd: itemObj.codeIoeFormItem.frmItemTypeCd,
    frmItemTypeCd2: itemObj.codeIoeFormItem.frmItemTypeCd2,
    ioeType:itemObj.codeIoeFormItem.ioeType,
    displayVal:itemObj.codeIoeFormItem.frmItemName||''
  };

  if (tempObj.frmItemTypeCd === ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
    tempObj.itemVal = generateDropdownValue(dropdownMap,tempObj,ServiceProfileConstants.ITEM_VALUE.TYPE1);
  }
  if (tempObj.frmItemTypeCd2 === ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
    tempObj.itemVal2 = generateDropdownValue(dropdownMap,tempObj,ServiceProfileConstants.ITEM_VALUE.TYPE2);
  }
  if (!!tempObj.itemVal&&!!tempObj.itemVal2) {
    tempObj.displayVal = tempObj.displayVal!==''?`${tempObj.displayVal}: ${tempObj.itemVal}, ${tempObj.itemVal2}`:`${tempObj.itemVal}, ${tempObj.itemVal2}`;
  } else if (!isNull(tempObj.itemVal)&&tempObj.itemVal!=='') {
    tempObj.displayVal = tempObj.displayVal!==''?`${tempObj.displayVal}: ${tempObj.itemVal}`:`${tempObj.itemVal}`;
  } else if (!isNull(tempObj.itemVal2)&&tempObj.itemVal2!=='') {
    tempObj.displayVal = tempObj.displayVal!==''?`${tempObj.displayVal}: ${tempObj.itemVal2}`:`${tempObj.itemVal2}`;
  }

  if (ServiceProfileConstants.ITEM_CATEGORY_IOE_TYPE_SET.TEST.has(tempObj.ioeType)) {
    targetObj.testItemsMap.set(tempObj.codeIoeFormItemId,tempObj);
  } else if (ServiceProfileConstants.ITEM_CATEGORY_IOE_TYPE_SET.SPECIMEN.has(tempObj.ioeType)) {
    targetObj.specimenItemsMap.set(tempObj.codeIoeFormItemId,tempObj);
  } else {
    targetObj.infoItemsMap.set(tempObj.codeIoeFormItemId,tempObj);
  }
};

let generateOrderItemContentTooltip = (orderTooltips,targetObj) => {
  let displayVals = [],displayTests = [];
  //handle specimen
  let displaySpecimen = '';
  if (targetObj.specimenItemsMap.size>0) {
    for (let valObj of targetObj.specimenItemsMap.values()) {
      displaySpecimen = valObj.displayVal;
    }
  }

  //handle test
  if (targetObj.testItemsMap.size > 0) {
    for (let valObj of targetObj.testItemsMap.values()) {
      let displayVal = '';
      let displayTest = valObj.displayVal;
      if (displaySpecimen!=='') {
        displayVal = `${displaySpecimen}, ${displayTest}`;
      } else {
        displayVal = `${displayTest}`;
      }
      displayTests.push(displayVal);
    }
  }

  //handle info
  let infoItems = [];
  if (targetObj.infoItemsMap.size>0) {
    for (let valObj of targetObj.infoItemsMap.values()) {
      if (!isNull(valObj.itemVal)&&valObj.itemVal!=='') {
        infoItems.push(valObj.displayVal);
      }
    }
  }

  if (displayTests.length>0) {
    displayVals = cloneDeep(displayTests);
  } else {
    displayVals.push(displaySpecimen);
  }

  if (infoItems.length>0) {
    displayVals = concat(displayVals,infoItems);
  }

  displayVals.forEach(displayVal => {
    orderTooltips.push(displayVal);
  });
};

export function generateListTooltips(templateList,ioeFormMap,dropdownMap) {
  if (templateList.length>0) {
    for (let i = 0; i < templateList.length; i++) {
      let templateTooltipMap = new Map();
      let templateObj = templateList[i];
      let templateOrderItems = templateObj.ioeTestTemplateItems;
      let tempMap = new Map();
      if (templateOrderItems.length>0) {
        templateOrderItems.forEach(itemObj => {
          let targetObj = {
            orderTitle: '',
            specimenItemsMap:new Map(),
            testItemsMap:new Map(),
            infoItemsMap:new Map()
          };
          if (tempMap.has(itemObj.testGroup)) {
            targetObj = tempMap.get(itemObj.testGroup);
          } else {
            let formObj = ioeFormMap.get(itemObj.codeIoeFormId);
            targetObj.orderTitle = `${formObj.labId}, ${formObj.formShortName}`;
          }
          parseItemObj(targetObj,itemObj,dropdownMap);
          tempMap.set(itemObj.testGroup,targetObj);
        });
      }
      //format
      if (tempMap.size>0) {
        for (let [testGroup,orderObj] of tempMap) {
          let orderTooltips = {
            title: orderObj.orderTitle,
            contents:[]
          };
          generateOrderItemContentTooltip(orderTooltips.contents,orderObj);
          templateTooltipMap.set(testGroup,orderTooltips);
        }
      }
      templateObj.templateTooltipMap = templateTooltipMap;
    }
  }
}

export function validateMaxTest(testObj,valMap,ioeFormMap,formId) {
  let msgCode = '';
  if (testObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITE||testObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEO) {
    let sum = 0;
    let proportion = testObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITE?1:99;
    let formObj = ioeFormMap.get(formId);
    let maxTest = formObj.maxTest;
    let typeSet = new Set();
    for (let itemValObj of valMap.values()) {
      if (itemValObj.isChecked) {
        if (itemValObj.ioeType!==ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEF) {
          typeSet.add(itemValObj.ioeType);
        }
        sum+=ServiceProfileConstants.TEST_IOE_TYPE_PROPORTION_MAP.get(itemValObj.ioeType);
      }
    }
    if (sum+proportion>maxTest) {
      if (typeSet.has(ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITE)) {
        if (testObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITE) {
          msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.EXCEEDED_TEST_LIMIT;
        } else if (testObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEO) {
          msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.EXCEEDED_TEST_LIMIT_ITEO;
        }
      } else if (typeSet.has(ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEO)) {
        if (testObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITE) {
          msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.EXCEEDED_TEST_LIMIT_ITEO;
        } else if (testObj.ioeType === ServiceProfileConstants.TEST_ITEM_IOE_TYPE.ITEO) {
          msgCode = SERVICE_PROFILE_MAINTENANCE_CODE.EXCEEDED_TEST_LIMIT_ITEO;
        }
      }
    }
  }
  return msgCode;
}

export function validateInfoValMap(originMap,targetMap) {
  let diagnosisVal = null, remarkVal = null, instructionVal = null;
  for (let valObj of originMap.values()) {
    if (valObj.ioeType === ServiceProfileConstants.INFO_ITEM_FIELD_IOE_TYPE.Diagnosis) {
      diagnosisVal = valObj.itemVal;
    } else if (valObj.ioeType === ServiceProfileConstants.INFO_ITEM_FIELD_IOE_TYPE.Remark&&valObj.itemName === 'Remark') {
      remarkVal = valObj.itemVal;
    } else if (valObj.ioeType === ServiceProfileConstants.INFO_ITEM_FIELD_IOE_TYPE.Instruction&&valObj.itemName === 'Instruction') {
      instructionVal = valObj.itemVal;
    }
  }

  for (let valObj of targetMap.values()) {
    if (valObj.ioeType === ServiceProfileConstants.INFO_ITEM_FIELD_IOE_TYPE.Diagnosis) {
      valObj.itemVal = diagnosisVal;
    } else if (valObj.ioeType === ServiceProfileConstants.INFO_ITEM_FIELD_IOE_TYPE.Remark&&valObj.itemName === 'Remark') {
      valObj.itemVal = remarkVal;
    } else if (valObj.ioeType === ServiceProfileConstants.INFO_ITEM_FIELD_IOE_TYPE.Instruction&&valObj.itemName === 'Instruction') {
      valObj.itemVal = instructionVal;
    }
    handleInfoOperationType(valObj);
  }
}

let compareMiddlewareObjectValMap = (currentValMap,originValMap,infoMode=false) => {
  for (let [formItemId, valObj] of originValMap) {
    let currentValObj = currentValMap.get(formItemId);
    valObj.itemVal = currentValObj.itemVal;
    valObj.itemVal2 = currentValObj.itemVal2;
    valObj.isChecked = currentValObj.isChecked;
    if (infoMode) {
      handleInfoOperationType(valObj);
    } else {
      if (ServiceProfileConstants.FORM_ITEM_TYPE.CLICK_BOX === valObj.frmItemTypeCd) {
        handleClickBoxOperationType(valObj);
      } else if (ServiceProfileConstants.FORM_ITEM_TYPE.INPUT_BOX === valObj.frmItemTypeCd) {
        handleInputBoxOperationType(valObj);
      } else if (ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST === valObj.frmItemTypeCd) {
        handleDropdownOperationType(valObj);
      }
    }
  }
};

export function compareMiddlewareObject(currentObj,originObj) {
  compareMiddlewareObjectValMap(currentObj.testValMap,originObj.testValMap);
  compareMiddlewareObjectValMap(currentObj.specimenValMap,originObj.specimenValMap);
  compareMiddlewareObjectValMap(currentObj.infoValMap,originObj.infoValMap,true);
}

export function checkItemNullAble(middlewareObject) {
  let {specimenValMap,testValMap} = middlewareObject;
  let values = [...testValMap.values(), ...specimenValMap.values()];

  let index = findIndex(values, valueObj => {
    return valueObj.nullAble==='N'&&valueObj.isChecked
    &&(valueObj.frmItemTypeCd === ServiceProfileConstants.FORM_ITEM_TYPE.INPUT_BOX||valueObj.frmItemTypeCd === ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST)
    &&((valueObj.frmItemTypeCd!==null&&(valueObj.itemVal===null||valueObj.itemVal===''))||(valueObj.frmItemTypeCd2!==null&&(valueObj.itemVal2===null||valueObj.itemVal2==='')));
  });

  return index===-1;
}