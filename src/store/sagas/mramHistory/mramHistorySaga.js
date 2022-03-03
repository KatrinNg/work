import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as mramHistoryActionType from '../../actions/MRAM/mramHistory/mramHistoryActionType';
import * as commonType from '../../actions/common/commonActionType';
import * as commonConstants from '../../../constants/common/commonConstants';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';

// for temporary test
//get service list
function* requestHistoryService() {
  while (true) {
    let { params, callback } = yield take(mramHistoryActionType.SAVE_MRAM_HISTORY_DATA);
    let apiUrl = 'mram/loadMramData';
    try {
      {
        let { data } = yield call(axios.post, apiUrl, params);
        if (data.respCode === 0) {
          // yield put({ type: mramHistoryActionType.SAVE_MRAM_HISTORY_RESULT});
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

function* deleteHistoryService() {
  while (true) {
    let { params, callback } = yield take(mramHistoryActionType.DELETE_MRAM_HISTORY_DATA);
    let apiUrl = 'mram/deleteMram';
    try {
      {
        let { data } = yield call(axios.post, '/mram/deleteMram', params);
        if (data.respCode === 0) {
          // yield put({ type: mramHistoryActionType.SAVE_MRAM_HISTORY_RESULT});
          callback && callback(data);
          // yield put({ type:commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          callback && callback(data);
        } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
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

export const mramHistorySaga = [requestHistoryService, deleteHistoryService];
