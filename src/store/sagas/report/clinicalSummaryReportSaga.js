import { take,call,put } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as types from '../../actions/report/clinicalSummaryReportActionType';
import * as commonTypes from '../../actions/common/commonActionType';

function* previewReportClinicalSummary() {
  while (true) {
    let {params,callback} = yield take(types.PREVIEW_CLINICAL_SUMMARY_REPORT);
    try {
      let { data } = yield call(axios.post, '/ioe/reportClinicalSummary', params);
      if (data.respCode === 0) {
        yield put({
          type:commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
        });
        callback&&callback(data.data.reportData);
      } else {
        yield put({
          type:commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
        });
        callback&&callback(data);

      }
    } catch (error) {
      yield put({
        type: commonTypes.OPEN_ERROR_MESSAGE,
        error: error.message ? error.message : 'Service error',
        data: error
      });
      yield put({
        type:commonTypes.CLOSE_COMMON_CIRCULAR_DIALOG
      });
    }
  }
}

export const clinicalSummaryReportSaga = [
  previewReportClinicalSummary
];