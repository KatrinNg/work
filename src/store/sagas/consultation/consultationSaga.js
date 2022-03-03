import { takeLatest, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as type from '../../actions/consultation/consultationActionType';
import * as messageType from '../../actions/message/messageActionType';


function* fetchGetPatientQueue(action) {
    let { data } = yield call(maskAxios.post, '/appointment/listPatientQueue', action.params);
    if (data.respCode === 0) {
        yield put({ type: type.PUT_PATIENT_QUEUE, data: data.data });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getPatientQueue() {
    yield takeLatest(type.GET_PATIENT_QUEUE, fetchGetPatientQueue);
}

export const consultationSaga = [
    getPatientQueue
];