import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/IOE/turnaroundTime/turnaroundTimeActionType';
import * as commonTypes from '../../../actions/common/commonActionType';
import * as messageTypes from '../../../actions/message/messageActionType';
import { isNull } from 'lodash';
import * as commonConstants from '../../../../constants/common/commonConstants';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';

// get IOE form drop list
function* getIoeFormDropList() {
  while (true) {
    let { params, callback } = yield take(types.GET_IOE_FORM_DROP_LIST);
    let apiUrl = 'ioe/listCodeIoeForm';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get IOE turnaround time list
function* getIoeTurnaroundTimeList() {
  while (true) {
    let { params, callback } = yield take(types.GET_IOE_TURNAROUND_TIME_LIST);
    let apiUrl = 'ioe/listTurnaroundTime';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
      if (data.respCode === 0) {
        yield put({
          type: types.IOE_TURNAROUND_TIME_LIST,
          turnaroundTimeList: data.data
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

// save/update IOE turnaround time list
function* updateIoeTurnaroundTimeList() {
  while (true) {
    let { params, callback } = yield take(types.UPDATE_IOE_TURNAROUND_TIME_LIST);
    let { dtos } = params;
    let apiUrl = 'ioe/saveTurnaroundTime';
    try {
      let { data } = yield call(axios.post, apiUrl, dtos);
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      if (data.respCode === 0) {
        yield put({
          type: types.GET_IOE_TURNAROUND_TIME_LIST,
          params: {
            serviceCd: params.serviceCd
          }
        });
        callback && callback(data);
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else {
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
      yield put({
        type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const turnaroundTimeSaga = [getIoeFormDropList, getIoeTurnaroundTimeList, updateIoeTurnaroundTimeList];
