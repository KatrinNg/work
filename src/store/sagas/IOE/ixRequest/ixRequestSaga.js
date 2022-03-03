import { take, call, put, select } from 'redux-saga/effects';
import { axios } from '../../../../services/ea3AxiosInstance';
import * as types from '../../../actions/IOE/ixRequest/ixRequestActionType';
import * as commonTypes from '../../../actions/common/commonActionType';
import * as messageTypes from '../../../actions/message/messageActionType';
import { isNull, remove, toNumber } from 'lodash';
import * as utils from '../../../../views/jos/IOE/ixRequest/utils/ixUtils';
// import { COMMON_RESP_MSG_CODE } from '../../../../constants/message/moe/commonRespMsgCodeMapping';
import * as commonConstants from '../../../../constants/common/commonConstants';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';
import { IX_REQUEST_CODE } from '../../../../constants/message/IOECode/ixRequestCode';

// export function* catchError(error) {
//   yield put({
//     type: commonTypes.OPEN_ERROR_MESSAGE,
//     error: 'Service error.',
//     data: error
//   });
// }

// export function* commRespCodeMapping(data) {
//   const showMsg = function* (msgCode) {
//     try {
//       yield put({
//         type: messageTypes.OPEN_COMMON_MESSAGE,
//         payload: {
//           msgCode: msgCode
//         }
//       });
//     } catch (error) {
//       yield call(catchError, error);
//     }
//   };

//   if (data.msgCode) {
//     yield call(showMsg, data.msgCode);
//     return;
//   } else if (data.message) {
//     yield put({
//       type: commonTypes.OPEN_ERROR_MESSAGE,
//       error: data.message
//     });
//     return;
//   }
//   yield call(showMsg, COMMON_RESP_MSG_CODE.COMMON_APPLICATION_ERROR);
// }

let generateItemsMap = (itemObj) => {
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


function* getListExpressIoe() {
  while (true) {
    let { params, callback } = yield take(types.GET_LIST_EXPRESS_IOE);
    let {  encounterTypeId,sex,roleName } = params;
    let apiUrl = 'ioe/listExpressIoe?encounterTypeId='+encounterTypeId+'&gender='+sex+'&roleName='+roleName;
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        let expressIoeMap = new Map();
        let {ioeExpressQuickBtnDtoList=[],ioeExpressCategoryDtoList=[]}=data.data;
        ioeExpressCategoryDtoList.forEach((lab) => {
          let { categoryId, categoryName,categoryStyle, items = [] } = lab;
          let labObj = {
            categoryId,
            categoryName,
            categoryStyle,
            formMap: new Map()
          };
          // form
          items.forEach((form) => {
            let {codeIoeRequestScatgryFrmMap=null, codeIoeRequestScatgryId, codeIoeRequestScatgryName, detlLbl= null, isDetl, isDisplayOnly, isSeparateFrm, nurseItem = null } = form;
            let formObj = {
              categoryId,
              categoryName,
              codeIoeRequestScatgryId,
              codeIoeRequestScatgryName,
              detlLbl,
              isDetl,
              isDisplayOnly,
              isSeparateFrm,
              nurseItem,
              codeIoeRequestScatgryFrmMap: !isNull(codeIoeRequestScatgryFrmMap) ? generateItemsMap(codeIoeRequestScatgryFrmMap) : new Map()
            };
            labObj.formMap.set(codeIoeRequestScatgryId, formObj);
          });
          expressIoeMap.set(categoryId, labObj);
        });
        yield put({
          type: types.PUT_LIST_EXPRESS_IOE,
          expressIoeMap: expressIoeMap,
          ioeExpressQuickBtnDtoList: ioeExpressQuickBtnDtoList
        });
        callback && callback({
          expressIoeMap: expressIoeMap,
          ioeExpressQuickBtnDtoList: ioeExpressQuickBtnDtoList
        });
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl
          );
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}


// get framework list
function* getIxRequestFrameworkList() {
  while (true) {
    let { params, callback } = yield take(types.GET_IX_REQUEST_FRAMEWORK_LIST);
    let apiUrl = 'ioe/ixRequest/forms';
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
            let { codeIoeFormId, formName, formShortName, testItems = null, specimenItems = null, otherItems = null, questionItems = null, maxTest } = form;
            let formObj = {
              codeIoeFormId,
              formName,
              formShortName,
              maxTest,
              testItemsMap: !isNull(testItems) ? generateItemsMap(testItems) : new Map(),
              specimenItemsMap: !isNull(specimenItems) ? generateItemsMap(specimenItems) : new Map(),
              otherItemsMap: !isNull(otherItems) ? generateItemsMap(otherItems) : new Map(),
              questionItemsMap: !isNull(questionItems) ? generateItemsMap(questionItems) : new Map()
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
          type: types.IX_REQUEST_FRAMEWORK_LIST,
          frameworkMap: frameworkMap,
          lab2FormMap: lab2FormMap,
          ioeFormMap: ioeFormMap,
          labOptions: labOptions
        });
        callback &&
          callback({
            frameworkMap: frameworkMap,
            lab2FormMap: lab2FormMap,
            ioeFormMap: ioeFormMap,
            labOptions: labOptions
          });
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get dropdown list
function* getIxRequestItemDropdownList() {
  while (true) {
    let { params, callback } = yield take(types.GET_IX_REQUEST_ITEM_DROPDOWN_LIST);
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
          type: types.IX_REQUEST_ITEM_DROPDOWN_LIST,
          dropdownMap: dropdownMap
        });
        callback && callback(dropdownMap);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get order list
function* getIxRequestOrderList() {
  while (true) {
    let { params, callback } = yield take(types.GET_IX_REQUEST_ORDER_LIST);
    let { patientKey, encounterId } = params;
    let apiUrl = `ioe/ixRequest/orders/${patientKey}/${encounterId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let tempStorageMap = new Map();
        if (data.data.length > 0) {
          let ioeFormMap = yield select((state) => state.ixRequest.ioeFormMap);
          data.data.forEach((orderObj) => {
            if(ioeFormMap.has(orderObj.codeIoeFormId)) {
              let tempObj = {
                clinicCd: orderObj.clinicCd,
                codeIoeFormId: orderObj.codeIoeFormId,
                codeIoeRequestTypeCd: orderObj.codeIoeRequestTypeCd,
                requestUser: orderObj.requestUser,
                encounterId: orderObj.encounterId,
                patientKey: orderObj.patientKey,
                serviceCd: orderObj.serviceCd,
                createdBy: orderObj.createdBy,
                createdDtm: orderObj.createdDtm,
                updatedBy: orderObj.updatedBy,
                updatedDtm: orderObj.updatedDtm,
                ioeRequestId: orderObj.ioeRequestId,
                ioeRequestNumber: orderObj.ioeRequestNumber,
                requestDatetime: orderObj.requestDatetime,
                version: orderObj.version,
                operationType: orderObj.operationType,
                requestLoginName: orderObj.requestLoginName,
                // requestUserName: orderObj.requestUserName, // only display request by
                invldReason: orderObj.invldReason, // invalid
                isInvld: orderObj.isInvld, // invalid
                ivgRqstSeqNum: orderObj.ivgRqstSeqNum, // invalid
                outputFormPrinted: orderObj.outputFormPrinted, // invalid
                outputFormPrintedBy: orderObj.outputFormPrintedBy, // invalid
                outputFormPrintedDatetime: orderObj.outputFormPrintedDatetime, // invalid
                specimenCollectDatetime: orderObj.specimenCollectDatetime, // invalid
                specimenCollected: orderObj.specimenCollected, // invalid
                specimenCollectedBy: orderObj.specimenCollectedBy, // invalid
                specimenLabelPrinted: orderObj.specimenLabelPrinted, // invalid
                specimenLabelPrintedBy: orderObj.specimenLabelPrintedBy, // invalid
                specimenLabelPrintedDatetime: orderObj.specimenLabelPrintedDatetime, // invalid

                labId: ioeFormMap.get(orderObj.codeIoeFormId).labId,
                formShortName: ioeFormMap.get(orderObj.codeIoeFormId).formShortName,
                isReportReturned: orderObj.isReportReturned ? orderObj.isReportReturned : 'N'
              };
              let valObj = utils.transformItemsObj(orderObj.ixRequestItemMap, orderObj.codeIoeFormId);
              tempObj.testItemsMap = valObj.testItemsMap;
              tempObj.specimenItemsMap = valObj.specimenItemsMap;
              tempObj.otherItemsMap = valObj.otherItemsMap;
              tempObj.questionItemsMap = valObj.questionItemsMap;
              tempObj.panelItems = valObj.panelItems;
              tempStorageMap.set(`${orderObj.codeIoeFormId}_${Math.random()}`, tempObj);
            }
          });
        }
        callback && callback(tempStorageMap);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get item mapping
function* getIxRequestSpecificMapping() {
  while (true) {
    let { params, callback } = yield take(types.GET_IX_REQUEST_SPECIFIC_ITEM_MAPPING);
    let apiUrl = 'ioe/ixRequest/specificItemMapping';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        let tempMap = new Map();
        if (Object.keys(data.data).length > 0) {
          for (const formId in data.data) {
            if (Object.prototype.hasOwnProperty.call(data.data, formId)) {
              const mappingObj = data.data[formId];
              if (Object.keys(mappingObj).length > 0) {
                let mappingMap = new Map();
                for (const targetQuestionItemId in mappingObj) {
                  mappingMap.set(toNumber(targetQuestionItemId), new Set(mappingObj[targetQuestionItemId]));
                }
                tempMap.set(toNumber(formId), mappingMap);
              }
            }
          }
        }

        yield put({
          type: types.IX_REQUEST_SPECIFIC_ITEM_MAPPING,
          itemMapping: tempMap
        });
        callback && callback(tempMap);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// save/update ix request order
function* saveIxRequestOrder() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_IX_REQUEST_ORDER);
    let { operationType, innerSaveIxRequestDtos } = params;
    let apiUrl = `ioe/ixRequest/operation/${operationType}`;
    try {
      let { data } = yield call(axios.post, apiUrl, innerSaveIxRequestDtos);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
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
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get all items (text & specimen) for search
function* getIxAllItemsForSearch() {
  while (true) {
    let { params, callback } = yield take(types.GET_IX_ALL_ITEMS_FOR_SEARCH);
    let apiUrl = 'ioe/loadAllItemsForSearch';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: types.IX_ALL_ITEMS_FOR_SEARCH,
          searchItemList: data.data
        });
        callback && callback(data.data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get all ix profile template
function* getAllIxProfileTemplate() {
  while (true) {
    let { params, callback } = yield take(types.GET_ALL_IX_PROFILE_TEMPLATE);
    let apiUrl = 'ioe/ixRequest/templates';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        let ioeFormMap = yield select((state) => state.ixRequest.ioeFormMap);
        let categoryMap = new Map();
        if (data.data.length > 0) {
          data.data.forEach((category) => {
            let categoryObj = {
              tmplTypeCd: category.tmplTypeCd,
              templateMap: new Map(),
              clickToAdd: category.clickToAdd
            };

            if (category.tmplList.length > 0) {
              category.tmplList.forEach((template) => {
                let templateObj = {
                  ioeTestTemplateId: template.ioeTestTemplateId,
                  codeIoeTestTmplTypeCd: template.codeIoeTestTmplTypeCd,
                  templateName: template.templateName,
                  storageMap: new Map()
                };
                templateObj.storageMap = utils.transformTemplateOrderItemsObj(template.ioeTestTmplItemMap, ioeFormMap);
                categoryObj.templateMap.set(template.ioeTestTemplateId, templateObj);
              });
            }
            categoryMap.set(category.tmplTypeCd, categoryObj);
          });
        }
        yield put({
          type: types.ALL_IX_PROFILE_TEMPLATE,
          categoryMap: categoryMap
        });
        callback && callback(categoryMap);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// do all operation in ix request and specimen collection
function* doAllOperation() {
  while (true) {
    let { params, callback } = yield take(types.DO_ALL_OPERATION);
    let apiUrl = 'ioe/ixRequest/operation';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode === IX_REQUEST_CODE.SELECTED_ENCOUNTERTIME_TOO_LATER) {
        callback && callback(data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// do all operation submit in ix request and specimen collection and ix Enquiry / ix Enquiry by Clinic
function* doAllOperationSubmit() {
  while (true) {
    let { params, callback } = yield take(types.DO_ALL_OPERATION_SUBMIT);
    let apiUrl = 'ioe/ixRequest/operation';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode === IX_REQUEST_CODE.SELECTED_ENCOUNTERTIME_TOO_LATER) {
        callback && callback(data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// do all operation save in ix request and specimen collection
function* doAllOperationSave() {
  while (true) {
    let { params, callback } = yield take(types.DO_ALL_OPERATION_SAVE);
    let apiUrl = 'ioe/ixRequest/operation';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get service specific function of ioe
function* getServiceSpecificFunctionInfo() {
  while (true) {
    let { params, callback } = yield take(types.GET_SERVICE_SPECIFIC_FUNCTION_INFO);
    let { functionName } = params;
    let apiUrl = `ioe/ixRequest/servicesSpecificFunctionInfo?functionName=${functionName}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get code ioe form panel mapping
function* getCodeIoeFormPanelMapping() {
  while (true) {
    let { callback } = yield take(types.GET_CODE_IOE_FORM_PANEL_MAPPING);
    let apiUrl = 'ioe/ixRequest/codeIoeFormPanelMapping';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({ type: types.CODE_IOE_FORM_PANEL_MAPPING, codeIoeFormPanelMapping: data.data });
        callback && callback(data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
    }
  }
}

function* getAntenatalServiceId() {
  while (true) {
    let { callback, params } = yield take(types.GET_ANTENATAL_SERVICE_ID);
    let { patientKey } = params;
    let apiUrl = 'ioe/ixRequest/antenatalServiceId?patientKey=' + patientKey;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}


// function* getListExpressIoe() {
//   while (true) {
//     let { params, callback } = yield take(types.GET_LIST_EXPRESS_IOE);
//     let {  encounterTypeId,sex,roleName } = params;
//     let apiUrl = 'ioe/listExpressIoe?encounterTypeId='+30000540+'&gender='+sex+'&roleName='+roleName;
//     try {
//       let { data } = yield call(axios.get, apiUrl, params);
//       if (data.respCode === 0) {
//         callback && callback(data.data);
//       } else {
//         yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
//         yield call(commonErrorHandler, data, apiUrl
//           );
//       }
//     } catch (error) {
//       yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
//       yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
//     }
//   }
// }


export const ixRequestSaga = [
  getIxRequestFrameworkList,
  getIxRequestItemDropdownList,
  getIxRequestOrderList,
  getIxRequestSpecificMapping,
  getIxAllItemsForSearch,
  saveIxRequestOrder,
  getAllIxProfileTemplate,
  doAllOperation,
  doAllOperationSubmit,
  doAllOperationSave,
  getServiceSpecificFunctionInfo,
  getCodeIoeFormPanelMapping,
  getAntenatalServiceId,
  getListExpressIoe
];
