import * as Type from '../../actions/imageViewer/imageViewerType';
import { take, call, put } from 'redux-saga/effects';
import {axios} from '../../../services/axiosInstance';
import * as commonType from '../../actions/common/commonActionType';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
function* getRadEaxamData() {
    while (true) {
      let { params, callback } = yield take(Type.GET_RAD_EXAM_DATA);
      let apiUrl = 'imaging/radiologyRecord/radExam';
      try {
        let { data } = yield call(axios.get, apiUrl);
        console.log('data',data);
        if (data.respCode === 100) {
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
  function* saveRadExamData() {
    while (true) {
      let { params, callback } = yield take(Type.SAVE_RAD_EXAM_DATA);
      let apiUrl = 'imaging/radiologyRecord/radExam';
      try {
        let { data } = yield call(axios.get, apiUrl);
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
  function* getRadorderByModalityTypes() {
    while (true) {
      let { params, callback } = yield take(Type.SAVE_RADORDER_BY_MODALITY_TYPES);
      let apiUrl = 'imaging/radiologyRecord/getStudyUrl';
      try {
        let { data } = yield call(axios.post, apiUrl,params);
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
export const imageViewerSaga = [getRadEaxamData, saveRadExamData, getRadorderByModalityTypes ];
