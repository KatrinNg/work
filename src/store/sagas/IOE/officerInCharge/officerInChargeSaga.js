import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as officerInChargeActionType from '../../../actions/IOE/officerInCharge/officerInChargeActionType';
import * as commonType from '../../../actions/common/commonActionType';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';

function* getOfficerDoctorDropdownList() {
  while (true) {
    let { params, callback } = yield take(officerInChargeActionType.GET_OFFICER_DOCTOR_DROPDOWN_LIST);
    let { roleName, userSvcCd, userSiteId } = params;
    let apiUrl = `user/commonRoles/${roleName}/users?userSvcCd=${userSvcCd}&userSiteId=${userSiteId}`;
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

function* saveOfficerDoctorList() {
  while (true) {
    let { params, callback } = yield take(officerInChargeActionType.SAVE_OFFICER_DOCTOR_LIST);
    let apiUrl = 'ioe/saveOfficerInChange';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        yield call(commonErrorHandler, data, apiUrl);
      }
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const officerInChargeSaga = [getOfficerDoctorDropdownList, saveOfficerDoctorList];
