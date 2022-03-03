import { take, call, put } from 'redux-saga/effects';
import { axios, maskAxios } from '../../../../services/axiosInstance';
import * as laboratoryReportActionType from '../../../actions/IOE/laboratoryReport/laboratoryReportActionType';
import * as commonType from '../../../actions/common/commonActionType';
import * as messageAction from '../../../actions/message/messageActionType';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import * as commonConstants from '../../../../constants/common/commonConstants';
import { IX_REQUEST_CODE } from '../../../../constants/message/IOECode/ixRequestCode';

function* getIoeLaboratoryReportList() {
  while (true) {
    let { params, callback } = yield take(laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_LIST);
    let apiUrl = `ioe/listIoeLaboratoryReportList?requestIds=${params.requestIds}&labNums=${params.labNums}`;
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

function* getIoeLaboratoryReportVersionList() {
  while (true) {
    let { params, callback } = yield take(laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_VERSION_LIST);
    let { ioeRequestId, labNum } = params;
    let apiUrl = `ioe/listIoeReportVersion?ioeRequestId=${ioeRequestId}&labNum=${labNum}`;
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

function* getIoeLaboratoryReportPdf() {
  while (true) {
    let { params, callback } = yield take(laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_PDF);
    let apiUrl = 'clinical-doc/inDocuments/' + params.cmnInDocIdOthr + '/file';
    try {
      //let { data } = yield call(axios.post, '/ioe/reportIoeEnquiry', params);
      let { data } = yield call(maskAxios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        callback && callback(data);
        yield put({
          type: messageAction.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '101615',
            params: [{ name: 'DESCR', value: data.errMsg }],
            showSnackbar: true
          }
        });
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* saveIoeLaboratoryReportComment() {
  while (true) {
    let { params, callback } = yield take(laboratoryReportActionType.SAVE_IOE_LABORATORY_REPORT_COMMENT);
    let apiUrl = 'ioe/saveIoeReportComment';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        // yield put({ type: laboratoryReportActionType.FILLING_FORM_NAME_LIST, fillingData: data});
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

function* getIoeLaboratoryReportCommentList() {
  while (true) {
    let { params, callback } = yield take(laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_COMMMENT_LIST);
    let { reportId } = params;
    let apiUrl = `ioe/labReportComments/${reportId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        // yield put({ type: laboratoryReportActionType.FILLING_FORM_NAME_LIST, fillingData: data});
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

function* getPatientById() {
  while (true) {
    let apiUrl = 'patient/getPatient';
    try {
      let { params } = yield take(laboratoryReportActionType.GET_PATINET_INFOMATION);
      let { data } = yield call(axios.post, apiUrl, { patientKey: params.patientKey });
      if (data.respCode === 0) {
        yield put({ type: laboratoryReportActionType.PUT_PATINET_INFOMATION, fillingData: data.data });
      } else {
        yield put({ type: laboratoryReportActionType.PUT_PATINET_INFOMATION, fillingData: null });
        yield put({
          type: messageAction.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }
    } catch (error) {
      yield put({ type: laboratoryReportActionType.PUT_PATINET_INFOMATION, fillingData: null });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* getPatientByIdToEmpty() {
  while (true) {
    let { params } = yield take(laboratoryReportActionType.PUT_PATINET_INFOMATIONINFO_TO_EMPTY);
    yield put({ type: laboratoryReportActionType.PUT_PATINET_INFOMATION, fillingData: null });
  }
}

function* getPatientByIdClinic() {
  while (true) {
    let { params } = yield take(laboratoryReportActionType.GET_PATINET_INFOMATIONINFO);
    let apiUrl = 'patient/getPatient';
    try {
      let { data } = yield call(axios.post, apiUrl, { patientKey: params });
      if (data.respCode === 0) {
        let patient = PatientUtil.transferPatientDocumentPair(data.data);
        patient = PatientUtil.initPatientPhoneSort(patient);
        let caseInfo = data.data.caseList && data.data.caseList.length > 0 ? data.data.caseList[0] : {};
        yield put({ type: laboratoryReportActionType.PUT_PATINET_INFOMATIONINFO, fillingData: patient, caseListData: caseInfo });
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      } else {
        yield put({ type: laboratoryReportActionType.PUT_PATINET_INFOMATIONINFO, fillingData: null, caseListData: {} });
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield put({
          type: messageAction.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: IX_REQUEST_CODE.INVALID_PARAMETER_CODE,
            params: [{ name: 'parameters', value: 'The patient information is not found.' }]
          }
        });
      }
    } catch (error) {
      yield put({ type: laboratoryReportActionType.PUT_PATINET_INFOMATIONINFO, fillingData: null, caseListData: {} });
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* getRequestDetailById() {
  while (true) {
    let { params, callback } = yield take(laboratoryReportActionType.GET_IOE_LABORATORY_REPORT_DETAIL);
    let { ioeRequestId } = params;
    let apiUrl = `ioe/getRequestDetailById?ioeRequestId=${ioeRequestId}`;
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

function* updateIoeReportFollowUpStatus() {
  while (true) {
    let { params, callback } = yield take(laboratoryReportActionType.UPDATE_IOE_LABORATORY_FOLLOWUP_STATUS);
    let apiUrl = 'ioe/updateIoeReportFollowUpStatus';
    try {
      let { data } = yield call(axios.put, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else if (data.respCode === 3) {
        yield put({
          type: messageAction.OPEN_COMMON_MESSAGE,
          payload: { msgCode: data.msgCode }
        });
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

export const laboratoryReportSaga = [
  getIoeLaboratoryReportList,
  getIoeLaboratoryReportVersionList,
  getIoeLaboratoryReportPdf,
  saveIoeLaboratoryReportComment,
  getIoeLaboratoryReportCommentList,
  getPatientById,
  getPatientByIdClinic,
  getRequestDetailById,
  updateIoeReportFollowUpStatus,
  getPatientByIdToEmpty
];
