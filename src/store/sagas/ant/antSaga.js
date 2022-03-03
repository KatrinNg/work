import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as type from '../../actions/ant/antActionType';
import * as commonType from '../../actions/common/commonActionType';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';

function* getAnServiceId() {
  while (true) {
    let { params, callback } = yield take(type.GET_AN_SERVICEID);
    let apiUrl = 'fhs-consultation/anServiceId';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

export const antSaga = [
  getAnServiceId()
];
