
import { take, call, put } from 'redux-saga/effects';
import axiosMoe from '../../../services/moeAxiosInstance';
import * as moeActionTypes from '../../actions/moe/moeActionType';
import * as moeSaga from './moeSaga';

function* moePreview() {
    while (true) {
        let { params } = yield take(moeActionTypes.PRINT_PREVIEW);
        yield call(moeSaga.commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/printPrescription', params);
            if (data.respCode === 0) {
                if (typeof params.callback === 'function') {
                    params.callback(data.data);
                }
                yield put({
                    type: moeActionTypes.PRINT_PREVIEW,
                    data: data.data
                });
            } else {
                yield call(moeSaga.commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         if (typeof params.callback === 'function') {
            //             params.callback(data.data);
            //         }
            //         yield put({
            //             type: moeActionTypes.PRINT_PREVIEW,
            //             data: data.data
            //         });
            //         break;
            //     }
            //     default: {
            //         yield call(moeSaga.commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* moePrintLog() {
    while (true) {
        let { params } = yield take(moeActionTypes.PRINT_PRINT_LOG);
        yield call(moeSaga.commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/logPrintPrescription', params.previewData);
            if (data.respCode === 0) {
                if (typeof params.callback === 'function') {
                    params.callback(data.data);
                }
                yield put({
                    type: moeActionTypes.PRINT_PRINT_LOG,
                    data: data.data
                });
            } else {
                yield call(moeSaga.commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         if (typeof params.callback === 'function') {
            //             params.callback(data.data);
            //         }
            //         yield put({
            //             type: moeActionTypes.PRINT_PRINT_LOG,
            //             data: data.data
            //         });
            //         break;
            //     }
            //     default: {
            //         yield call(moeSaga.commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

export const moePrintSaga = [
    moePreview,
    moePrintLog
];