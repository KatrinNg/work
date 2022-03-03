import { call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as types from '../../actions/appointment/otherAppointmentDetails/otherAppointmentDetails';
import * as messageType from '../../actions/message/messageActionType';
//import { antenatalInfo } from '../../reducers/anServiceID/anServiceIDReducer';
import { alsTakeLatest } from '../als/alsLogSaga';

function* listOtherAppointmentType() {
    yield alsTakeLatest(types.LIST_OTHER_APPOINTMENT_TYPE, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/cmn/othApptType', { params: params });
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}


function* listOtherAppointmentDetail() {
    yield alsTakeLatest(types.LIST_OTHER_APPOINTMENT_DETAILS, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.get, `/ana/antOthApptDtl/${params}`);
        if (data.respCode === 0) {
            callback && callback(data.data);
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        }
    });
}

function* listOtherAppointmentDetailLog() {
    yield alsTakeLatest(types.LIST_OTHER_APPOINTMENT_DETAILS_LOG, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.get, `/ana/antOthApptDtl/${params}/Log`);
        if (data.respCode === 0) {
            callback && callback(data.data);
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        }
    });
}


function* saveOtherAppointmentDetails() {
    yield alsTakeLatest(types.SAVE_OTHER_APPOINTMENT_DETAILS, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.post, '/ana/antOthApptDtl', params);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111246',
                    showSnackbar: true
                }
            });
            callback && callback();
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110060'
                }
            });
        }
    });
}

export const otherAppointmentDetailsSaga = [
    listOtherAppointmentType,
    saveOtherAppointmentDetails,
    listOtherAppointmentDetail,
    listOtherAppointmentDetailLog
];