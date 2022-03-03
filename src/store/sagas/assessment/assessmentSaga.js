import { take, call, put, select } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as types from '../../actions/assessment/assessmentActionType';
import * as commonTypes from '../../actions/common/commonActionType';
import * as messageTypes from '../../actions/message/messageActionType';
import { isUndefined, cloneDeep, find, isNull, toNumber } from 'lodash';
// import * as messageType from '../../actions/message/messageActionType';
import * as commonType from '../../actions/common/commonActionType';
// import { COMMON_RESP_MSG_CODE } from '../../../constants/message/moe/commonRespMsgCodeMapping';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';

// get assessment setting list(checkbox items)
function* getAssessmentSettingItemList() {
  while (true) {
    let { params, callback } = yield take(types.GET_ASSESSMENT_SETTING_ITEM_LIST);
    let apiUrl = 'assessment/assessmentSetting/listGroupAssessmentList';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({
          type: types.ASSESSMENT_SETTING_ITEM_LIST,
          assessmentSettingList: data.data
        });
        yield put({
          type: types.GET_ASSESSMENT_CHECKED_ITEM_LIST,
          params,
          callback
        });
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

// get assessment setting value(checked items)
function* getCheckedAssessmentItemList() {
  while (true) {
    let { params, callback } = yield take(types.GET_ASSESSMENT_CHECKED_ITEM_LIST);
    let { serviceCd } = params;
    let apiUrl = `assessment/assessmentSetting?serviceCd=${serviceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let checkedArray = data.data;
        let tempSet = new Set();
        checkedArray.forEach((item) => {
          tempSet.add(item.codeAssessmentCd);
        });
        yield put({
          type: types.ASSESSMENT_CHECKED_ITEM_LIST,
          assessmentSettingCheckedItemList: data.data
        });
        callback && callback(tempSet);
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

// save/update assessment setting value
function* updateAssessmentSettingItemList() {
  while (true) {
    let { params, callback } = yield take(types.UPDATE_ASSESSMENT_SETTING_ITEM_LIST);
    let apiUrl = 'assessment/assessmentSetting/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      if (data.respCode === 0) {
        callback && callback(data.msgCode);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data.msgCode);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
        callback && callback(data.msgCode);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get general assessment items(exclude value)
function* getPatientAssessmentListByServiceCd() {
  while (true) {
    let { params, callback } = yield take(types.GET_PATIENT_ASSESSMENT_LIST);
    let { serviceCd, genderCd } = params;
    let apiUrl = `assessment/assessment/codeAssessmentAndField?serviceCd=${serviceCd}&genderCd=${genderCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let outputAssesmentFieldMap = new Map();
        if (!isNull(data.data)) {
          data.data.forEach((element) => {
            let fieldStructure = element.fields;
            fieldStructure.forEach((field, index) => {
              if (field.codeObjectTypeCd === 'OB') {
                outputAssesmentFieldMap.set(element.codeAssessmentCd, field.codeAssessmentFieldId);
              }
              field.displaySeq = index + 1;
            });
          });
          yield put({
            type: types.PATIENT_ASSESSMENT_LIST,
            patientAssessmentList: data.data,
            outputAssesmentFieldMap
          });
          yield put({
            type: types.GET_PATIENT_ASSESSMENT_VAL,
            params,
            callback
          });
        }
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

// get general assessment items value
function* getPatientAssessmentVal() {
  while (true) {
    let { params, callback } = yield take(types.GET_PATIENT_ASSESSMENT_VAL);
    let { encounterId, clinicCd, serviceCd } = params;
    let apiUrl = `assessment/assessment/${encounterId}?serviceCd=${serviceCd}&clinicCd=${clinicCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let patientAssessmentList = yield select((state) => state.assessment.patientAssessmentList);
        let fieldValMap = new Map();
        let resultIdMap = new Map();
        let versionMap = new Map();
        let createdByMap = new Map();
        let createdDtmMap = new Map();
        let { assessmentValueDtos } = data.data;
        //prepare
        patientAssessmentList.forEach((element) => {
          let fieldStructure = element.fields[0];
          let tempMap = new Map();
          let tempResultIdMap = new Map();
          let tempVersionMap = new Map();
          let tempCreatedByMap = new Map();
          let tempCreatedDtmMap = new Map();
          fieldStructure.forEach((fieldObj) => {
            //add default
            tempMap.set(fieldObj.codeAssessmentFieldId, [{ val: '', isError: false }]);
            tempResultIdMap.set(fieldObj.codeAssessmentFieldId, [null]);
            tempVersionMap.set(fieldObj.codeAssessmentFieldId, [null]);
            tempCreatedByMap.set(fieldObj.codeAssessmentFieldId, [null]);
            tempCreatedDtmMap.set(fieldObj.codeAssessmentFieldId, [null]);
          });
          fieldValMap.set(element.codeAssessmentCd, tempMap);
          resultIdMap.set(element.codeAssessmentCd, tempResultIdMap);
          versionMap.set(element.codeAssessmentCd, tempVersionMap);
          createdByMap.set(element.codeAssessmentCd, tempCreatedByMap);
          createdDtmMap.set(element.codeAssessmentCd, tempCreatedDtmMap);
        });

        if (assessmentValueDtos.length !== 0) {
          assessmentValueDtos.forEach((assessment) => {
            let { codeAssessmentCd, fieldValueDtos } = assessment;
            let tempMap = new Map();
            let tempResultIdMap = new Map();
            let tempVersionMap = new Map();
            let tempCreatedByMap = new Map();
            let tempCreatedDtmMap = new Map();
            fieldValueDtos.forEach((field) => {
              let val =
                !isUndefined(field.assessmentResults) && field.assessmentResults.length > 0
                  ? field.assessmentResults.map((result) => {
                      return {
                        val: isNull(result) ? '' : result,
                        isError: false
                      };
                    })
                  : [{ val: '', isError: false }];
              tempMap.set(field.codeAssessmentFieldId, val);

              // result id
              let tempResultIds = field.resultIds;
              tempResultIdMap.set(field.codeAssessmentFieldId, tempResultIds);

              // version
              let tempVersion = field.version;
              tempVersionMap.set(field.codeAssessmentFieldId, tempVersion);

              // created by
              let tempCreatedBy = field.createdBys;
              tempCreatedByMap.set(field.codeAssessmentFieldId, tempCreatedBy);

              // created dtm
              let tempCreatedDtm = field.createdDtms;
              tempCreatedDtmMap.set(field.codeAssessmentFieldId, tempCreatedDtm);

              if (!isUndefined(field.assessmentResults) && field.assessmentResults.length > 0) {
                if (patientAssessmentList.length > 0) {
                  let tempAssessment = find(patientAssessmentList, (item) => {
                    return item.codeAssessmentCd === codeAssessmentCd;
                  });
                  if (!isUndefined(tempAssessment)) {
                    while (field.assessmentResults.length !== tempAssessment.fields.length) {
                      tempAssessment.fields.push(cloneDeep(tempAssessment.fields[0]));
                    }
                  }
                }
              }
            });
            fieldValMap.set(codeAssessmentCd, tempMap);
            resultIdMap.set(codeAssessmentCd, tempResultIdMap);
            versionMap.set(codeAssessmentCd, tempVersionMap);
            createdByMap.set(codeAssessmentCd, tempCreatedByMap);
            createdDtmMap.set(codeAssessmentCd, tempCreatedDtmMap);
          });
        }
        yield put({
          type: types.PATIENT_ASSESSMENT_VAL,
          patientAssessmentValMap: fieldValMap,
          resultIdMap,
          versionMap,
          createdByMap,
          createdDtmMap,
          patientAssessmentList
        });
        callback && callback();
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

// get field dropdown list
function* getFieldDropList() {
  while (true) {
    let { callback } = yield take(types.GET_FIELD_DROP_LIST);
    let apiUrl = 'assessment/assessment/codeAssessmentDrop';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let cascadeDropMap = new Map();
        let emptyCascadeFieldMap = new Map();
        data.data.forEach((element) => {
          element.subSet.forEach((optionObj, index) => {
            if (!isNull(optionObj.dependedFieldId)) {
              cascadeDropMap.set(optionObj.dependedDropId, {
                fieldId: element.fieldId,
                subSetId: index
              });
              emptyCascadeFieldMap.set(optionObj.dependedFieldId, element.fieldId);
            }
          });
        });
        yield put({
          type: types.FIELD_DROP_LIST,
          fieldDropList: data.data,
          cascadeDropMap,
          emptyCascadeFieldMap
        });
        callback && callback();
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

// get field normal range list
function* getFieldNormalRangeList() {
  while (true) {
    let { params } = yield take(types.GET_FIELD_NORMAL_RANGE_MAP);
    let { serviceCd, genderCd, age, month } = params;
    let apiUrl = `assessment/assessment/assessmentNormalRange?serviceCd=${serviceCd}&genderCd=${genderCd}&age=${age}&month=${month}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let fieldNormalRangeMap = new Map();
        data.data.forEach((element) => {
          let fieldMap = new Map();
          element.fields.forEach((field) => {
            if (fieldMap.has(field.fieldId) && field.lowestVal === field.highestVal) {
              // DL & CB
              let tempSet = fieldMap.get(field.fieldId);
              tempSet.add(field.lowestVal);
              fieldMap.set(field.fieldId, tempSet);
            } else {
              if (field.lowestVal === field.highestVal) {
                // DL & CB
                let tempSet = new Set();
                tempSet.add(field.lowestVal);
                fieldMap.set(field.fieldId, tempSet);
              } else {
                fieldMap.set(field.fieldId, {
                  lowestVal: toNumber(field.lowestVal),
                  highestVal: toNumber(field.highestVal)
                });
              }
            }
          });
          fieldNormalRangeMap.set(element.assessmentCd, fieldMap);
        });
        yield put({
          type: types.FIELD_NORMAL_RANGE_MAP,
          fieldNormalRangeMap
        });
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

// save/update general assessment value
function* updatePatientAssessment() {
  while (true) {
    let { params, callback } = yield take(types.UPDATE_PATIENT_ASSESSMENT);
    let apiUrl = 'assessment/assessment/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: messageTypes.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: data.msgCode,
            showSnackbar: true
          }
        });
        callback && callback();
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data.msgCode);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}
//AssessmentHistory TableHead
function* getAssessmentHistoryTableHeadList() {
  while (true) {
    let { params, callback } = yield take(types.GET_ASSESSMENT_HISTORY_TABLEHEAD_LIST);
    let apiUrl = `assessment/assessmentHistory/header?genderCd=${params.genderCd}&serviceCd=${params.serviceCd}&clinicCd=${params.clinicCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
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
//AssessmentHistory TableBody
function* getAssessmentHistoryTableBodyList() {
  while (true) {
    let { params, callback } = yield take(types.GET_ASSESSMENT_HISTORY_TABLEBODY_LIST);
    let apiUrl = `assessment/assessmentHistory/data?pageNum=${params.pageNum}&pageSize=${params.pageSize}&genderCd=${params.genderCd}&patientKey=${params.patientKey}&serviceCd=${params.serviceCd}&clinicCd=${params.clinicCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data);
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

// get assessment setting list(checkbox items)
function* getAssessmentOrderingList() {
  while (true) {
    let { params, callback } = yield take(types.GET_ORDERING_ASSESSMENT_LIST);
    let { serviceCd } = params;
    let apiUrl = `assessment/assessmentSetting/order?serviceCd=${serviceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
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

// save assessment ordering setting list()
function* saveAssessmentOrderingList() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_ORDERING_ASSESSMENT_LIST);
    let apiUrl = 'assessment/assessmentSetting/updateAssessmentItemOrder';
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

// insert assessment log
function* insertAssessmentLog() {
  while (true) {
    let { params, callback } = yield take(types.INSERT_ASSESSMENT_LOG);
    let { data } = yield call(axios.post, '/assessment/auditLogs/', params);
    if (data.respCode === 0) {
      callback && callback(data.data);
    }
  }
}

// get assessment maintenance mapping list
function* getAssessmentFieldMappingList() {
  while (true) {
    let { params, callback } = yield take(types.GET_ASSESSMENT_FIELD_MAPPING_LIST);
    let apiUrl = 'assessment/assessment/assessmentFieldMap';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
      if (data.respCode === 0) {
        let tempMap = new Map();
        if (data.data.length > 0) {
          data.data.forEach((item) => {
            if (tempMap.has(item.dependedCdId)) {
              tempMap.get(item.dependedCdId).push(item);
            } else {
              tempMap.set(item.dependedCdId, [item]);
            }
          });
        }
        callback && callback(tempMap);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const assessmentSagas = [
  getAssessmentSettingItemList,
  updateAssessmentSettingItemList,
  getCheckedAssessmentItemList,
  getPatientAssessmentListByServiceCd,
  getPatientAssessmentVal,
  getFieldDropList,
  getFieldNormalRangeList,
  updatePatientAssessment,
  getAssessmentHistoryTableHeadList,
  getAssessmentHistoryTableBodyList,
  getAssessmentOrderingList,
  saveAssessmentOrderingList,
  insertAssessmentLog,
  getAssessmentFieldMappingList
];
