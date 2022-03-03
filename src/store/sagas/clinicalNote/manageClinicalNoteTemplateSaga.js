import { take, call, put } from 'redux-saga/effects';
import * as manageClinicalNoteTemplateActionType from '../../actions/clinicalNoteTemplate/manageClinicalNoteTemplateActionType';
import * as commonType from '../../actions/common/commonActionType';
import { axios } from '../../../services/axiosInstance';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';

function* requestFavouriteList() {
  while (true) {
    let { params } = yield take(manageClinicalNoteTemplateActionType.REQUEST_DATA);
    let apiUrl = 'clinical-note/codeList/clinicalNoteTmplType';
    try {
      // let data = yield call(API_requestFavouriteList);
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: manageClinicalNoteTemplateActionType.FILLING_DATA, fillingData: data });
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* requestTemplateList() {
  while (true) {
    let { params, callback } = yield take(manageClinicalNoteTemplateActionType.TEMPLATE_DATA);
    let { clinicalNoteTmplType } = params;
    let apiUrl = `clinical-note/clinicalNoteTemplate/${clinicalNoteTmplType}`;
    try {
      // let data = yield call(API_requestTemplateList,params);
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: manageClinicalNoteTemplateActionType.PUTTEMPLATELIST_DATA, fillingData: data });
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* deleteTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageClinicalNoteTemplateActionType.DELETETEMPLATE_DATA);
    let apiUrl = 'clinical-note/clinicalNoteTemplate/';
    try {
      // let data = yield call(API_deleteTemplateData,params);
      let { data } = yield call(axios.delete, apiUrl, { data: params });
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      if (data.respCode === 0 || data.respCode === 1) {
        yield put({ type: manageClinicalNoteTemplateActionType.DELETETEMPLATE_RESULT, fillingData: data });
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* recordTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageClinicalNoteTemplateActionType.RECORDLIST_DATA);
    let apiUrl = 'clinical-note/clinicalNoteTemplate/reorder';
    try {
      // let data = yield call(API_recordTemplateData,params);
      let { data } = yield call(axios.patch, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: manageClinicalNoteTemplateActionType.RECORDLIST_RESULT, fillingData: data });
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
        // if (data.msgCode !== undefined && data.msgCode !== null) {
        //     callback && callback(data);
        // } else {
        //     yield put({
        //         type: commonType.OPEN_ERROR_MESSAGE,
        //         error: data.errMsg ? data.errMsg : 'Service error',
        //         data: data.data
        //     });
        // }
      }
    } catch (error) {
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* checkTemplateNameData() {
  while (true) {
    let { params, callback } = yield take(manageClinicalNoteTemplateActionType.CHECKTEMPLATENAMEREPEAT_DATA);
    let { insertTemplateDto } = params;
    let { codeClinicalnoteTmplTypeCd, templateName, clinicalnoteTemplateId } = insertTemplateDto;
    let apiUrl = `clinical-note/clinicalNoteTemplate/duplicationChecking?codeClinicalnoteTmplTypeCd=${codeClinicalnoteTmplTypeCd}&templateName=${templateName}&clinicalnoteTemplateId=${clinicalnoteTemplateId}`;
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

function* addTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageClinicalNoteTemplateActionType.ADDTEMPLATE_DATA);
    let apiUrl = 'clinical-note/clinicalNoteTemplate/';
    try {
      // let data = yield call(API_addTemplateData,params);
      let { data } = yield call(axios.post, apiUrl, params);
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      if (data.respCode === 0) {
        yield put({ type: manageClinicalNoteTemplateActionType.ADDTEMPLATE_RESULT, fillingData: data });
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else if (data.respCode === 11) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* editTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageClinicalNoteTemplateActionType.EDITTEMPLATE_DATA);
    let { insertTemplateDto } = params;
    let apiUrl = 'clinical-note/clinicalNoteTemplate/';
    try {
      // let data  = yield call(API_editTemplateData,params);
      let { data } = yield call(axios.put, apiUrl, insertTemplateDto);
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      if (data.respCode === 0) {
        yield put({ type: manageClinicalNoteTemplateActionType.EDITTEMPLATE_RESULT, fillingData: data });
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else if (data.respCode === 11) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const manageClinicalNoteTemplateSaga = [
  requestFavouriteList,
  requestTemplateList,
  deleteTemplateData,
  recordTemplateData,
  addTemplateData,
  editTemplateData,
  checkTemplateNameData
];
