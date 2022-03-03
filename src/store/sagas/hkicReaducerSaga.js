import * as types from '../actions/hkic/hkicActionType';
import { take, call, put, fork, cancel, cancelled } from 'redux-saga/effects';
import { axios } from '../../services/axiosInstance';
import * as registrationUtilities from '../../utilities/registrationUtilities';
import * as sysConfig from '../../configs/config';
import CommonMessage from '../../constants/commonMessage';
import {alsStartTrans, alsEndTrans} from '../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from './als/alsLogSaga';

function* callService() {
    while (true) {
        try {
            let { file } = yield take(types.CONCERT);
            yield put(alsStartTrans());

            let formData = new FormData();
            formData.append('multipartFile', file);
            // let data=yield call(maskAxios.post,'/patient/retrievalIVRS',formData);
            let { data } = yield call(axios.post, '/patient/retrievalIVRS', formData, { timeout: sysConfig.RequestTimedoutLong });

            if (data.respCode === 0) {
                yield put({ type: types.UPLOAD_SUCCESS, fileName: data.data.fileName, fileBlob: registrationUtilities.convertBase64UrlToBlob(data.data.fileContent) });
            } else if (data.respCode === 100) {
                yield put({ type: types.UPLOAD_FAILED, errorMessage: CommonMessage.RETRIEVAL_IVRS_FILE_TYPE() });
            } else if (data.respCode === 101) {
                yield put({ type: types.UPLOAD_FAILED, errorMessage: CommonMessage.RETRIEVAL_IVRS_FILE_SIZE() });
            } else if (data.respCode === 102) {
                yield put({ type: types.UPLOAD_FAILED, errorMessage: CommonMessage.RETRIEVAL_IVRS_FILE_FORMAT() });
            } else {
                yield put({ type: types.UPLOAD_FAILED, errorMessage: 'Service error' });
            }
        } catch (error) {
            yield put({ type: types.UPLOAD_FAILED, errorMessage: null });
            throw error;
        } finally {
            yield put(alsEndTrans());
            if (yield cancelled())
                yield put({ type: types.CANCEL_UPLOAD });
        }
    }
}


function* convert() {
    while (true) {
        const bgSyncTask = yield fork(callService);
        yield take(types.CANCEL_UPLOAD);
        yield cancel(bgSyncTask);
    }
}


export const hkicSagas = [
    convert
];