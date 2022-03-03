import { axios, maskAxios } from '../../../services/axiosInstance';
import { take, call, put } from 'redux-saga/effects';
import * as commonType from '../../actions/common/commonActionType';
import * as type from '../../actions/gscEnquiry/gscEnquiryActionType';
import * as messageAction from '../../actions/message/messageActionType';
import * as commonConstants from '../../../constants/common/commonConstants';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';

function* getGscEnquiry() {
    while (true) {
        let { params, callback } = yield take(type.GET_GSC_ENQUIRY);
        let apiUrl = '/cgs-consultation/geneticScreening/enquiry';
        try {
            let { data } = yield call(axios.get, apiUrl, params);
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

function* getGscEnquiryReport(){
    while (true) {
        let { params, callback } = yield take(type.GET_GSC_ENQUIRY_REPORT);
        let apiUrl = '/cgs-consultation/antReminderMaintenance';
        try {
            let { data } = yield call(axios.get, apiUrl, params);
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

function* saveGscEnquiry() {
    while (true) {
        let { params, callback } = yield take(type.SAVE_GSC_ENQUIRY);
        let apiUrl = '/cgs-consultation/geneticScreening/enquiry';
        try {
            let { data } = yield call(axios.post, apiUrl, params);
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

function* saveGscEnquiryReport() {
    while (true) {
        let { params, callback } = yield take(type.SAVE_GSC_ENQUIRY_REPORT);
        let apiUrl = '/cgs-consultation/antReminderMaintenance';
        try {
            let { data } = yield call(axios.post, apiUrl, params);
            if (data.respCode === 0) {
                callback && callback(data.data);
            } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
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
function* getGscEnquirySelect() {
    while (true) {
        let { params, callback } = yield take(type.GET_GSC_ENQUIRY_SELECT);
        let apiUrl = '/cgs-consultation/antReminderMaintenance';
        try {
            let { data } = yield call(axios.get, apiUrl, params);
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

function* printChtGspdReport() {
    while (true) {
        let { params, callback } = yield take(type.PRINT_CHT_GSPD_REPORT);
        let apiUrl = `/cgs-consultation/geneticScreening/doc/print/${params.docId}?docType=${params.docType}`;
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

function* getGscEnquirySaveViewLog() {
    while (true) {
        let { params, callback } = yield take(type.GSC_ENQUIRY_SAVE_VIEW_LOG);
        let apiUrl = '/fhs-consultation/antReminderMaintenance';
        try {
            let { data } = yield call(axios.get, apiUrl, { params: params });
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

// Clinical Document start
function* saveClinicalDoc() {
    while (true) {
        let { params, callback } = yield take(type.SAVE_GSC_CLINICAL_DOC);
        let { cgsNeonatalDocDto } = params;
        let apiUrl = `/cgs-consultation/geneticScreening/doc/${cgsNeonatalDocDto.opType}`;
        try {
            let { data } = yield call(axios.post, apiUrl, params);
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
function* getClinicalDoc () {
    while (true) {
        let { params, callback } = yield take(type.GET_CLINICAL_DOC_LOAD);
        let apiUrl = `/cgs-consultation/geneticScreening/doc/${params.docId}?docType=${params.docType}`;
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
// Clinical Document end

// Report Detalis start
function* getLabReportPatientKey() {
    while (true) {
        let { params, callback } = yield take(type.GET_GSC_LAB_REPORT_PATIENTKEY);
        let apiUrl = `/cgs-consultation/geneticScreening/getPatientKey?neonatalScrnId=${params.neonatalScrnId}`;
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

function* saveLabReportCreate () {
    while (true) {
        let { params, callback } = yield take(type.SAVE_GSC_LAB_REPORT_CREATE);
        let apiUrl = `/cgs-consultation/geneticScreening/doc/create?docType=${params.docType}&neonatalScrnId=${params.neonatalScrnId}`;
        if (params.pmi){
            apiUrl = `${apiUrl}&pmi=${params.pmi}`;
        }
        try {
            let { data } = yield call(axios.post, apiUrl);
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
function* saveLabReport () {
    while (true) {
        let { params, callback } = yield take(type.SAVE_GSC_LAB_REPORT);
        let apiUrl = '/cgs-consultation/geneticScreening/saveLabReport';
        try {
            let { data } = yield call(axios.post, apiUrl, params);
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

function* getGscLabReportPdf() {
    while (true) {
      let { params, callback } = yield take(type.GET_GSC_LAB_REPORT_PDF);
      let apiUrl = '/clinical-doc/inDocuments/' + params.cmnInDocIdOthr + '/file';
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

// Report Detalis end
function* getGscReferralLetter() {
    while (true) {
        let { params, callback } = yield take(type.GET_GSC_REFERRAL_LETTER);
        let apiUrl = `/cgs-consultation/gscReferralLetter/initData?docId=${params.docId}&pmi=${params.pmi}`;
        try {
            let { data } = yield call(axios.get, apiUrl, params);
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

function* saveGscReferralLetter() {
    while (true) {
        let { params, callback } = yield take(type.SAVE_GSC_REFERRAL_LETTER);
        let apiUrl = '/cgs-consultation/gscReferralLetter/';
        try {
            let { data } = yield call(axios.post, apiUrl, params);
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

function* getHospitalList() {
    while (true) {
        let { callback } = yield take(type.GET_GSC_HOSPITAL_LIST);
        let apiUrl = '/cgs-consultation/geneticScreening/getHospitalList';
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

function* getScReferralLetterPrintData() {
    while (true) {
        let { params, callback } = yield take(type.GET_GSC_REFERRAL_LETTER_PRINT_DATA);
        let apiUrl = '/cgs-consultation/gscReferralLetter/print';
        try {
            let { data } = yield call(axios.post, apiUrl, params);
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

export const gscEnquirySaga = [
    getGscEnquiry(),
    getGscEnquiryReport(),
    saveGscEnquiry(),
    saveGscEnquiryReport(),
    getGscEnquirySelect(),
    getGscEnquirySaveViewLog(),
    printChtGspdReport(),

    saveClinicalDoc(),
    getClinicalDoc(),
    saveLabReport(),
    getLabReportPatientKey(),
    saveLabReportCreate(),
    getGscLabReportPdf(),
    getGscReferralLetter(),
    saveGscReferralLetter(),
    getHospitalList(),
    getScReferralLetterPrintData()
];