import { call, put, take } from 'redux-saga/effects';
import * as patientTransferOutType from '../../actions/patientTransferOut';
import { maskAxios } from '../../../services/axiosInstance';
import * as messageType from '../../actions/message/messageActionType';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../als/alsLogSaga';

function* getPatientTransferList() {
    yield alsTakeLatest(patientTransferOutType.GET_PATIENT_TRANSFER, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/patient/pmiRecXfers', { params });
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}

function* insertPatientTransfer() {
    yield alsTakeEvery(patientTransferOutType.INSERT_PATIENT_TRANSFER, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.post, '/patient/pmiRecXfers', params);
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

function* updatePatientTransfer() {
    yield alsTakeEvery(patientTransferOutType.UPDATE_PATIENT_TRANSFER, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.put, '/patient/pmiRecXfers', params);
        if (data.respCode === 0) {
            callback && callback();
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });
        }
    });
}

function* deletePatientTransfer() {
    yield alsTakeEvery(patientTransferOutType.DELETE_PATIENT_TRANSFER, function* (action) {
        let { params, callback } = action;
        yield put(alsStartTrans());
        let { data } = yield call(maskAxios.delete, '/patient/pmiRecXfers/' + params.recXferId);
        if (data.respCode === 0) {
            callback && callback();
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110602',
                    showSnackbar: true
                }
            });
        }
    });
}

export const patientTransferOutSagas = [
    getPatientTransferList,
    insertPatientTransfer,
    updatePatientTransfer,
    deletePatientTransfer
];