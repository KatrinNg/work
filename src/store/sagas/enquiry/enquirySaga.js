import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as enquiryActionType from '../../actions/IOE/enquiry/enquiryActionType';
import * as commonType from '../../actions/common/commonActionType';
// import * as messageAction from '../../actions/message/messageActionType';
import { commonErrorHandler, getUserFullName } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';
// for temporary test
//get service list
function* requestClinic() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.REQUEST_ENQUIRY_CLINIC);
    let apiUrl = 'common/listClinicList';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({
          type: enquiryActionType.FILLING_ENQUIRY_CLINIC,
          fillingData: data
        });
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

function* getForms() {
  let { params, callback } = yield take(enquiryActionType.getForms);
  let apiUrl = 'ioe/listIoeFormName';
  try {
    let { data } = yield call(axios.post, apiUrl, params);
    if (data.respCode === 0 && data.data) {
      let forms = data.data
        .filter((item) => item.formName !== '---All---')
        .map((item) => {
          return { value: item.codeIoeFormId, title: item.formName };
        });
      yield put({ type: enquiryActionType.setState, payload: { forms } });
      callback && callback(forms);
    } else {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, data, apiUrl);
    }
  } catch (error) {
    yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
    yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
  }
}

function* getPatients() {
  let { params, callback } = yield take(enquiryActionType.getPatients);
  let apiUrl = 'ioe/listPatientByLoginClinicCd';
  try {
    let { data } = yield call(axios.post, apiUrl, params);
    if (data.respCode === 0 && data.data) {
      let patients = data.data.map((item) => {
        return { value: item.patientKey, title: item.fullName };
      });
      yield put({
        type: enquiryActionType.setState,
        payload: { patients }
      });
      callback && callback(patients);
    } else {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, data, apiUrl);
    }
  } catch (error) {
    yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
    yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
  }
}

function* getServices() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.getServices);
    let apiUrl = 'cmn/services';
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0 && data.data) {
        let defaultService = [{ value: ' ', title: 'ALL' }];
        let services = data.data.map((item) => {
          return { value: item.svcCd, title: item.svcCd };
        });
        services = defaultService.concat(services);
        yield put({
          type: enquiryActionType.setState,
          payload: { services }
        });
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

function* getClinics() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.getClinics);
    let { serviceCd } = params;
    let apiUrl = `cmn/sites?svcCd=${serviceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl, params);
      if (data.respCode === 0 && data.data) {
        data.data.unshift({ siteCd: ' ', siteDesc: 'ALL' });
        let clinics = data.data.map((item) => {
          return { value: item.siteCd, title: item.siteDesc };
        });
        yield put({
          type: enquiryActionType.setState,
          payload: { clinics }
        });
        callback && callback(clinics);
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

function* getHistoryList() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.getHistoryList);
    let apiUrl = 'ioe/listLaboratoryRequest';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0 && data) {
        yield put({
          type: enquiryActionType.setState,
          payload: { data }
        });
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        callback && callback(data);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* getRequestedByList() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.UPDATE_IOE_LABORATORY_FOLLOWUP_STATUS);
    let apiUrl = `user/commonRoles/CIMS-DOCTOR/users?userSvcCd=${params.serviceCd}&userSiteId=${params.SiteId}`;
    try {
      // let { data } = yield call(axios.get, '/user/users', params);
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let requestedByList = data.data.map((item) => {
          return { value: item.loginName, lable: getUserFullName(item) + '(' + item.loginName + ')' };
        });
        requestedByList.sort((a, b) => {
          return a.lable.localeCompare(b.lable);
        });
        requestedByList.unshift({ value: 'ALL', lable: 'ALL' });
        yield put({
          type: enquiryActionType.setState,
          payload: { requestedByList }
        });
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* getOrderDetails() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.REQUEST_ORDER_DETAILS);
    let { ioeRequestId } = params;
    let apiUrl = `ioe/getLaboratoryRequestDetailById?ioeRequestId=${ioeRequestId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0 && data.data) {
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

function* saveEnquiryInvalidateReason() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.saveEnquiryInvalidateReason);
    let apiUrl = 'ioe/updateIoeRequestListForIvalidateReason';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0 && data.data) {
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

function* saveRepeatEnquiryList() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.saveRepeatEnquiryList);
    let apiUrl = 'ioe/repeatIoeRequestList';
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

// insert user action log
function* insertEnquiryLog() {
  while (true) {
    let { params, callback } = yield take(enquiryActionType.INSERT_ENQUIRY_LOG);
    try {
      let { data } = yield call(axios.post, '/ioe/auditLogs/', params);
      if (data.respCode === 0) {
        callback && callback(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export const enquirySaga = [
  requestClinic(),
  getForms(),
  getPatients(),
  getServices(),
  getClinics(),
  getHistoryList(),
  getRequestedByList(),
  getOrderDetails(),
  saveEnquiryInvalidateReason(),
  saveRepeatEnquiryList(),
  insertEnquiryLog()
];
