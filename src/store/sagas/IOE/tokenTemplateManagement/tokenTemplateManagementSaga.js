import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/IOE/tokenTemplateManagement/tokenTemplateManagementActionType';
import * as commonTypes from '../../../actions/common/commonActionType';
// import * as messageTypes from '../../../actions/message/messageActionType';
// import { isNull } from 'lodash';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../../constants/common/commonConstants';

//get template list
function* getTokenTemplateList() {
  while (true) {
    let { params, callback } = yield take(types.GET_TOKEN_TMPL_LIST);
    let apiUrl = 'ioe/listReminderTemplate';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: types.TOKEN_TMPL_LIST,
          tokenTemplateList: data.data
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

function* saveReminderTemplateList() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_TOKEN_TMPL_LIST);
    let apiUrl = 'ioe/saveReminderTemplateList';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
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

//get  instruction list
function* getInstructionList() {
  while (true) {
    let { params, callback } = yield take(types.GET_INSTRUCTION_LIST);
    let apiUrl = 'ioe/getReminderInsturcts';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: types.INSTRUCTION_LIST_RESULT,
          instructionListData: data.data
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

//save  instruction list
function* saveInstructionList() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_INSTRUCTION_LIST);
    let apiUrl = 'ioe/saveReminderInsturcts';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: types.SAVE_INSTRUCTION_LIST_RESULT,
          instructionListData: data.data
        });
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else {
        callback && callback(data);
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* getReminderTmplById() {
  while (true) {
    let { params, callback } = yield take(types.GET_TOKEN_TMPL_OBJECT);
    let apiUrl = 'ioe/getReminderTmplById';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
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

function* getReminderInsturctsByName() {
  while (true) {
    let { params, callback } = yield take(types.GET_TOKEN_INSTRUCT_LIST);
    let apiUrl = 'ioe/getReminderInsturctsByName';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
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

function* saveReminderTemplate() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_TOKEN_TEMPLAT);
    let apiUrl = 'ioe/saveReminderTemplate';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else if (data.respCode === 11) {
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

function* getCodeIoeFormItems() {
  while (true) {
    let { params, callback } = yield take(types.GET_TOKEN_FORM_ITEMS);
    let apiUrl = 'ioe/getCodeIoeFormItems';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
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
function* getPrintDialogList() {
  while (true) {
    let { params, callback } = yield take(types.GET_TOKEN_PRINTVIEW_LIST);
    let apiUrl = 'ioe/reminderTemplate/reminderReportForPreview';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
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

export const tokenTemplateManagementSaga = [
  getTokenTemplateList,
  saveReminderTemplateList,
  getPrintDialogList,
  getInstructionList,
  saveInstructionList,
  getReminderTmplById,
  getReminderInsturctsByName,
  saveReminderTemplate,
  getCodeIoeFormItems
];
