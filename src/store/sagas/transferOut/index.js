import { call, put, take } from 'redux-saga/effects';
import * as transferOut from '../../actions/transferOut';
import { maskAxios } from '../../../services/axiosInstance';
import * as messageType from '../../actions/message/messageActionType';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../als/alsLogSaga';


function* getTransferOut() {
    yield alsTakeLatest(transferOut.GET_TRANSFER_OUT, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.get, `/patient/spp/patient/${params.patientKey}/xferouts`, {});
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}

function* insertTransferOut() {
    yield alsTakeEvery(transferOut.INSERT_TRANSFER_OUT, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.post, `/patient/spp/patient/${params.patientKey}/xferout`, params);
        if (data.respCode === 0) {
            callback && callback();
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110021',
                    showSnackbar: true
                }
            });
        }
    });
}

function* updateTransferOut() {
    yield alsTakeEvery(transferOut.UPDATE_TRANSFER_OUT, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.put, `/patient/spp/patient/${params.patientKey}/xferout`, params);
        if (data.respCode === 0) {
            callback && callback();
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });
        }else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        }
    });
}

function* deleteTransferOut() {
    yield alsTakeEvery(transferOut.DELETE_TRANSFER_OUT, function* (action) {
        let { params, callback } = action;
        yield put(alsStartTrans());
        let { data } = yield call(maskAxios.delete, `/patient/spp/patient/${params.patientKey}/xferout`,{data: params});
        if (data.respCode === 0) {
            callback && callback();
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110602',
                    showSnackbar: true
                }
            });
        }else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        }
    });
}

export const transferOutSagas = [
    getTransferOut,
    insertTransferOut,
    updateTransferOut,
    deleteTransferOut
];