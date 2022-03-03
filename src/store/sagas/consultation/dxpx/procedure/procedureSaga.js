import { take, call, put, takeLatest } from 'redux-saga/effects';
import { axios } from '../../../../../services/axiosInstance';
import * as procedureActionType from '../../../../actions/consultation/dxpx/procedure/procedureActionType';
import * as commonType from '../../../../actions/common/commonActionType';
import * as messageTypes from '../../../../actions/message/messageActionType';
import { isNull } from 'lodash';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import { commonErrorHandler } from '../../../../../utilities/josCommonUtilties';

function* requestTemplateList() {
  while (true) {
    let { callback } = yield take(procedureActionType.PROCEDURE_REQUEST_DATA);
    let apiUrl = 'diagnosis/procedureTemplateGroup/';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({ type: procedureActionType.PROCEDURE_LIST_DATA, fillingData: data });
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

function* saveEditTemplateList() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.SAVE_PROCEDURE_TEMPLATE_DATA);
    let apiUrl = 'diagnosis/procedureTemplate/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        if (data.msgCode !== undefined && data.msgCode !== null) {
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

function* saveTemplateList() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.SAVE_PROCEDURE_DATA);
    let apiUrl = 'diagnosis/procedureTemplateGroup/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      if (data.respCode === 0) {
        yield put({ type: procedureActionType.SAVE_PROCEDURE_RESULT, fillingData: data });
        callback && callback(data);
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else {
        callback && callback(data);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* getEditTemplateList() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.GET_EDITTEMPLATELIST_DATA);
    const { groupId } = params;
    let apiUrl = `diagnosis/procedureTemplate/${groupId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        // yield put({ type: procedureActionType.PUT_EDITTEMPLATELIST_DATA, fillingData: data.data});
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

// get patient input procedure list
function* getInputProcedureList() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.GET_INPUT_PROCEDURE_LIST);
    let { patientKey, encounterId } = params;
    let apiUrl = `diagnosis/procedure/${patientKey}/${encounterId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({
          type: procedureActionType.INPUT_PROCEDURE_LIST,
          inputProcedureList: data.data
        });
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

function* getCodeDiagnosisStatusList() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.GET_PROCEDURE_STATUS);
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

function* updatePatientProcedure() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.UPDATE_PATIENT_PROCEDURE);
    let { dtos } = params;
    let apiUrl = 'diagnosis/procedure/';
    try {
      let { data } = yield call(axios.put, apiUrl, dtos);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        yield put({
          type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG
        });
        if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          callback && callback(data.msgCode);
        } else {
          yield call(commonErrorHandler, data, apiUrl);
        }
        // else if (!isNull(data.msgCode)) {
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
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}
function* deletePatientProcedure() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.DELETE_PATIENT_PROCEDURE);
    let { dtos } = params;
    let apiUrl = 'diagnosis/procedure/';
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

function* getProcedureSearchList(action) {
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

// fuzzy query procedure
function* queryProcedureList() {
  while (true) {
    let { params, callback } = yield take(procedureActionType.QUERY_PROCEDURE_LIST);
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

function* searchProcedureList() {
  yield takeLatest(procedureActionType.GET_PROCEDURE_SEARCH_LIST, getProcedureSearchList);
}

export const procedureSaga = [
  requestTemplateList,
  saveTemplateList,
  saveEditTemplateList,
  getEditTemplateList,
  getInputProcedureList,
  getCodeDiagnosisStatusList,
  updatePatientProcedure,
  deletePatientProcedure,
  queryProcedureList,
  searchProcedureList
];
