import { take, call, put, takeLatest } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as tagaNoteActionType from '../../actions/tagaNote/tagaNoteActionType';
import * as commonType from '../../actions/common/commonActionType';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';

//Get Select Note
function* listTagaNoteTemplates() {
  while (true) {
    let { templateParams, callback } = yield take(tagaNoteActionType.GET_TEMPLATE_DATA_LIST);
    let params = templateParams;
    let { currentServiceCd, userLogName, taganoteType } = params;
    let apiUrl = `clinical-note/taganoteTemplate/${currentServiceCd}/${userLogName}/${taganoteType}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data.myFavoriteList, data.data.serFavoriteList);
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

// get Note Types
function* getTagaNoteTypes() {
  while (true) {
    let { callback } = yield take(tagaNoteActionType.GET_TAG_A_NOTE_TYPES);
    let apiUrl = 'clinical-note/codeList/codeTaganoteType';
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

//get tag a note  history list
function* tagaNoteHistoryList(action) {
  let { params, callback } = action;
  let { patientKey, showChecked } = params;
  let apiUrl = `clinical-note/taganotes/history?patientKey=${patientKey}&showClinicalNote=${showChecked}`;
  try {
    let { data } = yield call(axios.get, apiUrl);
    if (data.respCode === 0) {
      callback && callback(data.data, data.errMsg);
    } else {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, data, apiUrl);
    }
  } catch (error) {
    yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
    yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
  }
}

function* getTagaNoteHistoryList() {
  yield takeLatest(tagaNoteActionType.GET_TAG_A_NOTE_HISTORY_LIST, tagaNoteHistoryList);
}

//get tag a note  by  note Id
function* getTagaNoteById() {
  while (true) {
    let { params, callback } = yield take(tagaNoteActionType.GET_TAG_A_NOTE_BY_ID);
    let { taganoteId } = params;
    let apiUrl = `clinical-note/taganotes/${taganoteId}/details`;
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

//save new  tag  note
function* saveATagaNote() {
  while (true) {
    let { params, callback } = yield take(tagaNoteActionType.SAVE_A_NEW_TAG_NOTE);
    let apiUrl = 'clinical-note/taganotes/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
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

//save  tag  note AGAIN
function* saveATagaNoteAgain() {
  while (true) {
    let { params, callback } = yield take(tagaNoteActionType.SAVE_A_TAG_NOTE_AGAIN);
    let apiUrl = 'clinical-note/taganotes/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
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

// get Tag a Note Log by Id
function* getNoteLogByTagANoteNoteId() {
  while (true) {
    let { params, callback } = yield take(tagaNoteActionType.GET_NOTE_LOG_BY_TAG_A_NOTE_ID);
    let { taganoteId } = params;
    let apiUrl = `clinical-note/taganotes/${taganoteId}/log`;
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

//save and print  tag  a note
function* saveAndPrintTagaNote() {
  while (true) {
    let { params, callback } = yield take(tagaNoteActionType.SAVE_AND_PRINT_TAG_A_NOTE);
    let apiUrl = 'clinical-note/reportTaganote';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
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

//print  tag  a note
function* printTagaNote() {
  while (true) {
    let { params, callback } = yield take(tagaNoteActionType.PRINT_TAG_A_NOTE);
    let apiUrl = 'clinical-note/taganote';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
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

export const tagaNoteSaga = [
  listTagaNoteTemplates(),
  getTagaNoteTypes(),
  getTagaNoteHistoryList(),
  getTagaNoteById(),
  saveATagaNote(),
  getNoteLogByTagANoteNoteId(),
  saveAndPrintTagaNote(),
  saveATagaNoteAgain(),
  printTagaNote()
];
