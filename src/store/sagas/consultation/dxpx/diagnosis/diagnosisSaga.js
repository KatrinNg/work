import { take, call, put, takeLatest } from 'redux-saga/effects';
import { axios } from '../../../../../services/axiosInstance';
import * as problemActionType from '../../../../actions/consultation/dxpx/diagnosis/diagnosisActionType';
import * as commonType from '../../../../actions/common/commonActionType';
// import * as messageTypes from '../../../../actions/message/messageActionType';
// import { isNull } from 'lodash';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import { commonErrorHandler } from '../../../../../utilities/josCommonUtilties';

function* requestTemplateList() {
  while (true) {
    let { callback } = yield take(problemActionType.PROBLEM_REQUEST_DATA);
    let apiUrl = 'diagnosis/diagnosisTemplateGroup/';
    try {
      {
        let { data } = yield call(axios.get, apiUrl);
        if (data.respCode === 0) {
          yield put({ type: problemActionType.PROBLEM_LIST_DATA, fillingData: data });
          callback && callback(data);
        } else {
          yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
          yield call(commonErrorHandler, data, apiUrl);
        }
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* saveEditTemplateList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.SAVE_PROBLEM_TEMPLATE_DATA);
    let apiUrl = 'diagnosis/diagnosisTemplate/';
    try {
      {
        let { data } = yield call(axios.post, apiUrl, params);
        if (data.respCode === 0) {
          callback && callback(data);
        } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          callback && callback(data);
        } else {
          if (data.msgCode !== undefined && data.msgCode !== null) {
            callback && callback(data);
          } else {
            yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
            yield call(commonErrorHandler, data, apiUrl);
          }
        }
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* saveTemplateList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.SAVE_PROBLE_DATA);
    let apiUrl = 'diagnosis/diagnosisTemplateGroup/';
    try {
      {
        let { data } = yield call(axios.post, apiUrl, params);
        yield put({
          type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG
        });
        if (data.respCode === 0) {
          yield put({ type: problemActionType.SAVE_PROBLEM_RESULT, fillingData: data });
          callback && callback(data);
        } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          callback && callback(data);
        } else {
          callback && callback(data);
        }
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* getEditTemplateList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.GET_EDITTEMPLATELIST_DATA);
    const { groupId } = params;
    let apiUrl = `diagnosis/diagnosisTemplate/${groupId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        // yield put({ type: problemActionType.PUT_EDITTEMPLATELIST_DATA, fillingData: data.data});
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

function* getALLDxPxList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.GET_ALL_DXPX_LIST);
    let { patientKey, encounterId } = params;
    let apiUrl = `diagnosis/diagnosisMedicalRecord/${patientKey}/${encounterId}`;
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

// get patient input problem list
function* getInputProblemList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.GET_INPUT_PROBLEM_LIST);
    let { patientKey, encounterId } = params;
    let apiUrl = `diagnosis/diagnosis/${patientKey}/${encounterId}`;
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

function* getCodeDiagnosisStatusList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.GET_PROBLEM_STATUS);
    const { diagnosisTypeCd } = params;
    let apiUrl = `diagnosis/codeList/codeDxpxDiagnosisStatus/${diagnosisTypeCd}`;
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

function* updatePatientProblem() {
  while (true) {
    let { params, callback } = yield take(problemActionType.UPDATE_PATIENT_PROBLEM);
    let { dtos } = params;
    let apiUrl = 'diagnosis/diagnosis/';
    try {
      let { data } = yield call(axios.put, apiUrl, dtos);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data.msgCode);
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
        //     type: commonType.OPEN_ERROR_MESSAGE,
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

function* deletePatientProblem() {
  while (true) {
    let { params, callback } = yield take(problemActionType.DELETE_PATIENT_PROBLEM);
    let { dtos } = params;
    let apiUrl = 'diagnosis/diagnosis/';
    try {
      let { data } = yield call(axios.delete, apiUrl, { data: dtos });
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
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

function* getProblemSearchListNoPagination(action) {
  let { params, callback } = action;
  let apiUrl = 'diagnosis/codeList/codeDxpxTerm/';
  try {
    let { data } = yield call(axios.get, apiUrl, { params: params });
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

function* searchProblemListNoPagination() {
  yield takeLatest(problemActionType.GET_PROBLEM_SEARCH_LIST_NO_PAGINATION, getProblemSearchListNoPagination);
}

function* listCodeDiagnosisTypes() {
  while (true) {
    yield take(problemActionType.GET_DIAGNOSIS_RECORD_TYPE);
    let apiUrl = 'diagnosis/codeList/codeDxpxDiagnosisType/';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({
          type: problemActionType.PUT_DIAGNOSIS_RECORD_TYPE,
          fillingData: data.data
        });
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// fuzzy query problem
function* queryProblemList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.QUERY_PROBLEM_LIST);
    let apiUrl = `diagnosis/codeList/codeDxpxTerm/page/?localTerm=${params.localTerm}&diagnosisText=${unescape(encodeURIComponent(params.diagnosisText))}&diagnosisTypeCd=${params.diagnosisTypeCd}&start=${params.start}&end=${params.end}`;
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

function* getHistoricalRecords() {
  while (true) {
    let { params, callback } = yield take(problemActionType.GET_HISTORICAL_RECORD_LIST);
    let { patientKey, serviceCd, clinicCd, recordType } = params;
    let apiUrl = `diagnosis/diagnosisMedicalRecord/historical?patientKey=${patientKey}&serviceCd=${serviceCd}&clinicCd=${clinicCd}&recordType=${recordType}`;
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

function* savePatient() {
  while (true) {
    let { params, callback } = yield take(problemActionType.SAVE_PATIENT_INFORMATION);
    let apiUrl = 'diagnosis/diagnosisMedicalRecord/diagnosisAndProcedure';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data.msgCode);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

//get chronic problem list
function* getChronicProblemList() {
  while (true) {
    let { params, callback } = yield take(problemActionType.GET_CHRONIC_PROBLEM_LIST);
    let { patientKey } = params;
    let apiUrl = `diagnosis/chronicProblem/${patientKey}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({
          type: problemActionType.CHRONIC_PROBLEM_LIST,
          chronicProblemList: data.data
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

//get CODE_LOCAL_TERM
function* getCodeLocalTerm() {
  while (true) {
    let { params, callback } = yield take(problemActionType.GET_CODE_LOCAL_TERM_STATUS);
    let { serviceCd } = params;
    let apiUrl = `diagnosis/codeList/dxpxTermServiceSetting/${serviceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        const settingList = data.data;
        let valMap = new Map();
        if (settingList && settingList.length > 0) {
          settingList.map(item => {
            if (item.diagnosisTypeCd) {
              valMap.set(`${item.diagnosisTypeCd}`, item);
            }
          });
        }
        callback && callback(valMap);
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

function* addPsoriasis() {
  while (true) {
      let { params, callback } = yield take(problemActionType.ADD_PSORIASIS);
      const { patientKey, encounterId, encounterDate, ehrId_site } = params;
      const apiUrl = `diagnosis/PSO/addPsoriasis/${patientKey}/${encounterId}/${encounterDate}/${ehrId_site}`;
      try {
        let { data } = yield call(axios.post, apiUrl);
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

function* getCurrentDate() {
  while (true) {
    let { callback } = yield take(problemActionType.GET_CURRENT_DATE);
    const apiUrl = 'diagnosis/PSO/getsCurrentTime';
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

export const diagnosisSaga = [
  requestTemplateList,
  saveTemplateList,
  saveEditTemplateList,
  getEditTemplateList,
  getInputProblemList,
  getCodeDiagnosisStatusList,
  updatePatientProblem,
  deletePatientProblem,
  searchProblemListNoPagination,
  listCodeDiagnosisTypes,
  queryProblemList,
  getHistoricalRecords,
  savePatient,
  getChronicProblemList,
  getCodeLocalTerm,
  getALLDxPxList,
  addPsoriasis,
  getCurrentDate
];
