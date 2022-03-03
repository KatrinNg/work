import { axios } from '../../../services/axiosInstance';
import { take, call, put } from 'redux-saga/effects';
import * as commonType from '../../actions/common/commonActionType';
import * as type from '../../actions/viewNeonatalLog/ViewNeonatalLogActionType';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';

function* getViewNeonatalLogLoadDrop() {
    while (true) {
        let { params, callback } = yield take(type.GET_VIEW_NEONTAL_LOG_LOAD_DROP);
        let apiUrl = '/cgs-consultation/geneticScreening/viewLogOptionTable';
        try {
            let { data } = yield call(axios.get, apiUrl, { params });
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
function* getViewNeonatalLogSearch() {
    while (true) {
        let { params, callback } = yield take(type.GET_VIEW_NEONTAL_LOG_LOAD_SEARCH);
        let apiUrl = '/cgs-consultation/geneticScreening/viewLogSummary';
        try {
            let { data } = yield call(axios.get, apiUrl, { params: params });
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

export const viewNeonatalLogSaga = [
    getViewNeonatalLogLoadDrop(),
    getViewNeonatalLogSearch()
  ];