import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as formNameActionType from '../../../actions/IOE/formName/formNameActionType';
import * as commonType from '../../../actions/common/commonActionType';
// import * as commonType from '../../../actions/common/commonActionType';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';
// for temporary test
//get service list
function* requestFormName() {
  while (true) {
    let { params, callback } = yield take(formNameActionType.IOE_FORM_NAME_LIST);
    let apiUrl = 'ioe/listIoeFormName';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: formNameActionType.FILLING_FORM_NAME_LIST, fillingData: data });
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

function* requestRequestedBy() {
  while (true) {
    let { params, callback } = yield take(formNameActionType.IOE_REQUESTED_BY);
    let apiUrl = 'ioe/listPatientByLoginClinicCd';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: formNameActionType.FILLING_REQUESTED_BY, fillingData: data });
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

export const formNameSaga = [requestFormName, requestRequestedBy];
