import { take, call, put, all } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as types from '../../actions/MRAM/mramActionType';
import * as eyesTypes from '../../actions/MRAM/eyes/eyesActionType';
import * as feetTypes from '../../actions/MRAM/feet/feetActionType';
import * as measurementAndLabTest from '../../actions/MRAM/measurementAndLabTest/measurementAndLabTestActionType';
import * as otherComplications from '../../actions/MRAM/otherComplications/otherComplicationsActionType';
import * as commonTypes from '../../actions/common/commonActionType';
import * as backgroundInformationType from '../../actions/MRAM/backgroundInformation/backgroundInformationActionType';
import * as carePlanActionType from '../../actions/MRAM/carePlan/carePlanActionType';
import * as dietAssessmentType from '../../actions/MRAM/dietAssessment/dietAssessmentType';
import * as riskProfileActionType from '../../actions/MRAM/riskProfile/riskProfileActionType';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';
import * as messageType from '../../../store/actions/message/messageActionType';
import moment from 'moment';

// init MRAM field value list (New record)
function* initMramFieldValueList() {
  while (true) {
    let { callback } = yield take(types.INIT_MRAM_FIELD_VALUE_LIST);
    try {
      yield all([
        //eyes init
        put({ type: eyesTypes.INIT_MRAM_EYES_FIELD_VALUE, valDto: null }),
        // feet init
        put({ type: feetTypes.INIT_MRAM_FEET_FIELD_VALUE, valDto: null }),
        // measurement/LabTest init
        put({ type: measurementAndLabTest.INIT_MRAM_MEASRUEMENTANDLABTEST_FIELD_VALUE, valDto: null }),
        // otherComplications init
        put({ type: otherComplications.INIT_MRAM_OTHERCOMPLICATIONS_FIELD_VALUE, valDto: null }),
        // backgroundInformation init
        put({ type: backgroundInformationType.INIT_MRAM_BACKGROUND_INFORMATION_FIELD_VALUE, valDto: null }),
        // origin init
        put({ type: types.MRAM_FIELD_VALUE_LIST, mramOriginObj: null }),
        // care plan init
        put({ type: carePlanActionType.INIT_MRAM_CARE_PLAN_FIELD_VALUE, valDto: null }),
        // dietAssessment init
        put({ type: dietAssessmentType.SET_DIETASSESSMENT_MAP, valDto: null }),
        // riskProfile init
        put({ type: riskProfileActionType.SET_RISKPRIFILE_MAP, valDto: null })
      ]);

      callback && callback();
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, '');
    }
  }
}

// get MRAM field value list
function* getMramFieldValueList() {
  while (true) {
    let { params, callback } = yield take(types.GET_MRAM_FIELD_VALUE_LIST);
    let apiUrl = 'mram/loadMramDetails';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        let {
          bkgdInfoDto = null,
          measurementDto = null,
          eyesAssessmentDto = null,
          feetAssessmentDto = null,
          otherComplicationsDto = null,
          dietAssessmentDto = null,
          riskProfileDto = null,
          carePlanDto = null
        } = data.data;
        yield all([
          // origin init
          put({ type: types.MRAM_FIELD_VALUE_LIST, mramOriginObj: data.data }),
          // eyes init
          put({ type: eyesTypes.INIT_MRAM_EYES_FIELD_VALUE, valDto: eyesAssessmentDto }),
          // feet init
          put({ type: feetTypes.INIT_MRAM_FEET_FIELD_VALUE, valDto: feetAssessmentDto }),
          // backgroundInformation init
          put({ type: backgroundInformationType.INIT_MRAM_BACKGROUND_INFORMATION_FIELD_VALUE, valDto: bkgdInfoDto }),
          // care plan init
          put({ type: carePlanActionType.INIT_MRAM_CARE_PLAN_FIELD_VALUE, valDto: carePlanDto }),
          // dietAssessment init
          put({ type: dietAssessmentType.SET_DIETASSESSMENT_MAP, valDto: dietAssessmentDto }),
          // riskProfile init
          put({ type: riskProfileActionType.SET_RISKPRIFILE_MAP, valDto: riskProfileDto }),
          // measurement/LabTest init
          put({ type: measurementAndLabTest.INIT_MRAM_MEASRUEMENTANDLABTEST_FIELD_VALUE, valDto: measurementDto }),
          // otherComplications init
          put({ type: otherComplications.INIT_MRAM_OTHERCOMPLICATIONS_FIELD_VALUE, valDto: otherComplicationsDto })
        ]);

        callback && callback(data.data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
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

// get MRAM field value list
function* saveMramFieldValueList() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_MRAM_FIELD_VALUE_LIST);
    let apiUrl = 'mram/saveAll';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.SAVE_REPEAT_DATE_TIME_CODE) {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: data.msgCode,
            params: [
              {
                name: 'date',
                value: moment(data.data).format('DD-MMM-YYYY')
              }
            ]
          }
        });
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
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

function* previewReportPatient() {
  while (true) {
    let { params, callback } = yield take(types.GET_PREVIEW_REPORT_PATIENT_DATA);
    let apiUrl = 'mram/reportMramPatientReport';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        callback && callback(data.data.reportData);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        callback && callback(data);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* previewReportDoctor() {
  while (true) {
    let { params, callback } = yield take(types.GET_PREVIEW_REPORT_DOCTOR_DATA);
    let apiUrl = 'mram/reportMramReport';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        callback && callback(data.data.reportData);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
        callback && callback(data);
      } else {
        yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
        callback && callback(data);
      }
    } catch (error) {
      yield put({ type: commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* checkDuplicatedMramRecordOnSameDay() {
  while (true) {
    let { params, callback } = yield take(types.CHECK_DUPLICATED_MRAM_RECORD_ON_SAME_DAY);
    let apiUrl = 'mram/checkMramDuplicatedRecord';
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

function* checkMramRecordCreatedWithin6Months() {
  while (true) {
    let { params, callback } = yield take(types.CHECK_MRAM_RECORD_CREATED_WITHIN_6_MONTHS);
    let apiUrl = 'mram/checkMramRecordCreatedWithin6Months';
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

function* checkMramRecordExisted() {
  while (true) {
    let { params, callback } = yield take(types.CHECK_MRAM_RECORD_EXISTED);
    let apiUrl = 'mram/checkMramRecordExisted';
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

export const mramSaga = [
  initMramFieldValueList,
  getMramFieldValueList,
  saveMramFieldValueList,
  previewReportPatient,
  previewReportDoctor,
  checkDuplicatedMramRecordOnSameDay,
  checkMramRecordCreatedWithin6Months,
  checkMramRecordExisted
];
