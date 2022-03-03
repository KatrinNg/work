import { take, call, put, select } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/IOE/serviceProfile/serviceProfileActionType';
import * as commonTypes from '../../../actions/common/commonActionType';
// import * as messageTypes from '../../../actions/message/messageActionType';
import { isNull, isEmpty, remove, keys, findIndex, toInteger } from 'lodash';
import * as ServiceProfileConstants from '../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import * as commonType from '../../../actions/common/commonActionType';
import * as commonConstants from '../../../../constants/common/commonConstants';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';

let generateTestItemsMap = (itemObj) => {
  let tempMap = new Map();
  if (Object.keys(itemObj).length > 0) {
    for (const groupName in itemObj) {
      if (Object.prototype.hasOwnProperty.call(itemObj, groupName)) {
        const items = itemObj[groupName];
        remove(items, (item) => {
          return isNull(item);
        });
        tempMap.set(groupName, items);
      }
    }
  }
  return tempMap;
};

let transformItemsMap = (valObjs) => {
  let testItemsMap = new Map();
  let specimenItemsMap = new Map();
  let infoItemsMap = new Map();

  let valMap = new Map();
  valObjs.forEach((valObj) => {
    if (ServiceProfileConstants.ITEM_CATEGORY_IOE_TYPE_SET.TEST.has(valObj.itemIoeType)) {
      valMap = testItemsMap;
    } else if (ServiceProfileConstants.ITEM_CATEGORY_IOE_TYPE_SET.SPECIMEN.has(valObj.itemIoeType)) {
      valMap = specimenItemsMap;
    } else if (ServiceProfileConstants.ITEM_CATEGORY_IOE_TYPE_SET.INFO.has(valObj.itemIoeType)) {
      valMap = infoItemsMap;
    }

    valMap.set(valObj.codeIoeFormItemId, {
      codeIoeFormItemId: valObj.codeIoeFormItemId,
      testGroup: valObj.testGroup,
      operationType: valObj.operationType,
      version: valObj.version,
      itemVal: valObj.frmItemTypeCd === ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST && !!valObj.itemVal ? toInteger(valObj.itemVal) : valObj.itemVal,
      itemVal2:
        valObj.frmItemTypeCd2 === ServiceProfileConstants.FORM_ITEM_TYPE.DROP_DOWN_LIST && !!valObj.itemVal2 ? toInteger(valObj.itemVal2) : valObj.itemVal2,
      codeIoeFormId: valObj.codeIoeFormId,
      itemName: valObj.itemName,
      createdBy: valObj.createdBy,
      createdDtm: valObj.createdDtm,
      updatedBy: valObj.updatedBy,
      updatedDtm: valObj.updatedDtm,
      frmItemTypeCd: valObj.frmItemTypeCd,
      frmItemTypeCd2: valObj.frmItemTypeCd2,
      ioeTestTemplateId: valObj.ioeTestTemplateId, // template id
      ioeTestTemplateItemId: valObj.ioeTestTemplateItemId // template item id
    });
  });
  return {
    testItemsMap,
    specimenItemsMap,
    infoItemsMap
  };
};

let generateTemporaryStorageMap = (ioeFormMap, lab2FormMap, ioeTestTmplItemMap) => {
  let tempMap = new Map();
  if (!isEmpty(ioeTestTmplItemMap)) {
    for (const testGroup in ioeTestTmplItemMap) {
      if (Object.prototype.hasOwnProperty.call(ioeTestTmplItemMap, testGroup)) {
        let currentFormObj = ioeTestTmplItemMap[testGroup];
        let currentFormIds = keys(currentFormObj);
        let formId = parseInt(currentFormIds[0]);
        let targetLabId = null;
        for (let [labId, formIds] of lab2FormMap) {
          let index = findIndex(formIds, (id) => {
            return id === formId;
          });
          if (index !== -1) {
            targetLabId = labId;
          }
        }
        let tempMapObj = transformItemsMap(currentFormObj[formId]);
        let obj = {
          codeIoeFormId: formId,
          testGroup: parseInt(testGroup),
          labId: targetLabId,
          formShortName: ioeFormMap.get(formId).formShortName,
          testItemsMap: tempMapObj.testItemsMap,
          specimenItemsMap: tempMapObj.specimenItemsMap,
          infoItemsMap: tempMapObj.infoItemsMap
        };
        let timestamp = new Date().valueOf();
        tempMap.set(`${formId}_${timestamp}_${testGroup}`, obj);
      }
    }
  }

  return tempMap;
};

// get dialog framework list
function* getServiceProfileFrameworkList() {
  while (true) {
    let { params, callback } = yield take(types.GET_SERVICE_PROFILE_FRAMEWORK_LIST);
    let apiUrl = 'ioe/loadServiceProfileDatas';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        let frameworkMap = new Map();
        let lab2FormMap = new Map();
        let ioeFormMap = new Map();
        let labOptions = [{ label: 'ALL', value: 'All' }]; // default
        // lab
        data.data.forEach((lab) => {
          let { codeIoeCd, codeLabValue, codeIoeFormList = [] } = lab;
          let labObj = {
            codeIoeCd,
            codeLabValue,
            formMap: new Map()
          };
          let tempFormIds = [];
          // form
          codeIoeFormList.forEach((form) => {
            let { codeIoeFormId, formName, formShortName, testItems = null, specimenItems = null, infoItems = null, maxTest } = form;
            let formObj = {
              codeIoeFormId,
              formName,
              formShortName,
              maxTest,
              testItemsMap: !isNull(testItems) ? generateTestItemsMap(testItems) : new Map(),
              specimenItemsMap: !isNull(specimenItems) ? generateTestItemsMap(specimenItems) : new Map(),
              infoItemsMap: !isNull(infoItems) ? generateTestItemsMap(infoItems) : new Map()
            };
            tempFormIds.push(codeIoeFormId);
            labObj.formMap.set(codeIoeFormId, formObj);
            ioeFormMap.set(codeIoeFormId, {
              id: codeIoeFormId,
              formName,
              formShortName,
              labId: codeIoeCd,
              maxTest
            });
          });
          labOptions.push({ label: codeIoeCd, value: codeIoeCd });
          lab2FormMap.set(codeIoeCd, tempFormIds);
          frameworkMap.set(codeIoeCd, labObj);
        });

        yield put({
          type: types.SERVICE_PROFILE_FRAMEWORK_LIST,
          frameworkMap: frameworkMap,
          lab2FormMap: lab2FormMap,
          ioeFormMap: ioeFormMap,
          labOptions: labOptions
        });
        callback && callback(frameworkMap);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get dialog dropdown list
function* getServiceProfildItemDropdownList() {
  while (true) {
    let { params, callback } = yield take(types.GET_SERVICE_PROFILE_DROPDOWN_LIST);
    let apiUrl = 'ioe/loadCodeIoeFormItemDrops';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        let dropdownMap = new Map();
        if (isNull(data.data) !== null && data.data.length > 0) {
          data.data.forEach((form) => {
            let optionMap = new Map();
            for (const subSetId in form.codeIoeFormItemDropMap) {
              if (Object.prototype.hasOwnProperty.call(form.codeIoeFormItemDropMap, subSetId)) {
                optionMap.set(subSetId, form.codeIoeFormItemDropMap[subSetId]);
              }
            }
            dropdownMap.set(form.codeIoeFormItemId, optionMap);
          });
        }
        yield put({
          type: types.SERVICE_PROFILE_DROPDOWN_LIST,
          dropdownMap: dropdownMap
        });
        callback && callback(dropdownMap);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// save/update lab test grouping
function* saveServiceProfileTemplate() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_SERVICE_PROFILE);
    let { innerEditTemplateDto } = params;
    let apiUrl = 'ioe/saveServiceProfile';
    try {
      let { data } = yield call(axios.post, apiUrl, innerEditTemplateDto);
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      if (data.respCode === 0) {
        // yield put({
        //   type:types.GET_SERVICE_PROFILE_LIST,
        //   params:{
        //     favoriteType
        //   }
        // });
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else if (data.respCode === 11) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data);
        // if (!isNull(data.msgCode)) {
        //   yield put({
        //     type: messageTypes.OPEN_COMMON_MESSAGE,
        //     payload:{
        //       msgCode: data.msgCode
        //     }
        //   });
        // } else {
        //   yield put({
        //     type: commonTypes.OPEN_ERROR_MESSAGE,
        //     error: data.message ? data.message : 'Service error'
        //   });
        // }
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get lab test grouping template
function* getServiceProfileTemplate() {
  while (true) {
    let { params, callback } = yield take(types.GET_SERVICE_PROFILE_TEMPLATE);
    let apiUrl = 'ioe/getServiceProfileById';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      if (data.respCode === 0) {
        let { ioeTestTmplItemMap } = data.data;
        let lab2FormMap = yield select((state) => state.serviceProfile.lab2FormMap);
        let ioeFormMap = yield select((state) => state.serviceProfile.ioeFormMap);
        let storageMap = generateTemporaryStorageMap(ioeFormMap, lab2FormMap, ioeTestTmplItemMap);
        data.data.storageMap = storageMap;

        yield put({
          type: types.SERVICE_PROFILE_TEMPLATE,
          serviceProfileTemplate: data.data
        });
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get all items (text & specimen) for search
function* getTemplateAllItemsForSearch() {
  while (true) {
    let { params, callback } = yield take(types.GET_TEMPLATE_ALL_ITEMS_FOR_SEARCH);
    let apiUrl = 'ioe/loadAllItemsForSearch';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: types.TEMPLATE_ALL_ITEMS_FOR_SEARCH,
          searchItemList: data.data
        });
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

//get LabTestGrouping list
function* getServiceProfileList() {
  while (true) {
    let { params, callback } = yield take(types.GET_SERVICE_PROFILE_LIST);
    let apiUrl = 'ioe/listServiceProfileByType';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: types.SET_SERVICE_PROFILE_LIST,
          serviceProfileTemplateList: data.data
        });
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

//save LabTestGrouping list
function* saveServiceProfileList() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_SERVICE_PROFILE_LIST);
    let { dtos } = params;
    let apiUrl = 'ioe/saveServiceProfileList';
    try {
      let { data } = yield call(axios.post, apiUrl, dtos);
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
        // if (!isNull(data.msgCode)) {
        //   yield put({
        //     type: messageTypes.OPEN_COMMON_MESSAGE,
        //     payload: {
        //       msgCode: data.msgCode
        //     }
        //   });
        // } else {
        //   yield put({
        //     type: commonTypes.OPEN_ERROR_MESSAGE,
        //     error: data.message ? data.message : 'Service error'
        //   });
        // }
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* checkTemplateNameData() {
  while (true) {
    let { params, callback } = yield take(types.CHECKTEMPLATENAMEREPEAT_DATA);
    let { codeIoeTestTmplTypeCd, groupName, ioeTestTemplateId } = params;
    let apiUrl = `ioe/duplicationChecking?codeIoeTestTmplTypeCd=${codeIoeTestTmplTypeCd}&groupName=${groupName}&ioeTestTemplateId=${ioeTestTemplateId}`;
    try {
      // let data = yield call(API_addTemplateData,params);
      let { data } = yield call(axios.get, apiUrl);
      callback && callback(data);
    } catch (error) {
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const serviceProfileSaga = [
  getServiceProfileFrameworkList,
  getServiceProfildItemDropdownList,
  saveServiceProfileTemplate,
  getServiceProfileTemplate,
  getTemplateAllItemsForSearch,
  getServiceProfileList,
  saveServiceProfileList,
  checkTemplateNameData
];
