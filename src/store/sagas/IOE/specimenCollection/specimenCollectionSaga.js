import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/IOE/specimenCollection/specimenCollectionActionType';
import * as commonTypes from '../../../actions/common/commonActionType';
// import * as messageTypes from '../../../actions/message/messageActionType';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';

// get IOE specimen collection list
function* getIoeSpecimenCollectionList() {
  while (true) {
    let { params, callback } = yield take(types.GET_IOE_SPECIMEN_COLLECTION_LIST);
    let apiUrl = 'ioe/loadIoeRequestRecords';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        callback && callback(data);
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// save/update IOE specimen collection list
function* saveIoeSpecimenCollectionList() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_IOE_SPECIMEN_COLLECTION_LIST);
    let apiUrl = 'ioe/operateIoeRequests';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        callback && callback(data);
        yield put({
          type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
        });
      }
    } catch (error) {
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get IOE specimen collection reminder template list
function* getIoeSpecimenCollectionTemplsForReport() {
  while (true) {
    let { params, callback } = yield take(types.GET_IOE_SPECIMEN_COLLECTION_TEMPLS_FOR_REPORT);
    let apiUrl = 'ioe/reminderTemplate/reminderTmplsForReport';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0) {
        data.data.unshift({ ioeReminderTemplateId: ' ', templateName: '---Please Select---' });
        callback && callback(data.data);
      } else {
        callback && callback(data);
        yield put({
          type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
        });
      }
    } catch (error) {
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// print IOE specimen collection reminder report
function* printIoeSpecimenCollectionReminderReport() {
  while (true) {
    let { param, callback } = yield take(types.PRINT_IOE_SPECIMEN_COLLECTION_REMINDER_REPORT);
    let apiUrl = 'ioe/reminderTemplate/reminderReport';
    try {
      let { data } = yield call(axios.post, apiUrl, param);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        callback && callback(data);
        yield put({
          type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
        });
      }
    } catch (error) {
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const specimenCollectionSaga = [
  getIoeSpecimenCollectionList,
  saveIoeSpecimenCollectionList,
  getIoeSpecimenCollectionTemplsForReport,
  printIoeSpecimenCollectionReminderReport
];
