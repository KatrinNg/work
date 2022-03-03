import { takeLatest, take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/certificate/attendanceCertificate/attendanceCertActionType';
import { print } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest} from '../../als/alsLogSaga';

function* fetchGetAttendanceCert(action) {
    try {
        const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
        let params = action.params;
        let isPreview = action.isPreview;
        params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'Certificate of Attendance').outDocTypeId;
        const closeTabFunc = yield select(state => state.attendanceCert.closeTabFunc);
        // let { data } = yield call(maskAxios.post, '/appointment/getAttendanceCertificate', action.params);
        let { data } = yield call(maskAxios.post, '/clinical-doc/attendanceCertificate', params);
        if (data.respCode === 0) {
            if(isPreview){
                if (closeTabFunc) {
                    closeTabFunc(true);
                } else {
                    let callback = action.callback;
                    callback && callback(data.data);
                }
            } else {
                if (closeTabFunc) {
                    closeTabFunc(true);
                } else {
                    yield print({
                        base64: data.data,
                        copies: action.copies,
                        isFitPage: action.isFitPage,
                        printQueue: action.printQue,
                        callback: action.callback
                    });
                }
            }
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
            yield put({
                type: type.UPDATE_FIELD,
                updateData: { handlingPrint: false }
            });
        }else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put({
                type: type.UPDATE_FIELD,
                updateData: { handlingPrint: false }
            });
        }
    } catch (error) {
        yield put({
            type: type.UPDATE_FIELD,
            updateData: { handlingPrint: false }
        });
        throw error;
    }
}

function* getAttendanceCert() {
    yield alsTakeLatest(type.GET_ATTENDANCE_CERT, fetchGetAttendanceCert);
}

function* listAttendanceCertificates() {
    while (true) {
        try {
            let { params, callback } = yield take(type.LIST_ATTENDANCE_CERTIFICATES);
            yield put(alsStartTrans());

            // let { data } = yield call(maskAxios.post, '/appointment/listAttendanceCertificates', params);
            let url = '/clinical-doc/attendanceCertificate?';
            for (let p in params) {
                url += `${p}=${params[p]}&`;
            }
            url = url.substring(0, url.length - 1);
            let { data } = yield call(maskAxios.get, url);
            if (params.siteId !== '') {
                data.data = (data.data || []).filter(item => item.siteId === params.siteId);
            }
            if (data.respCode === 0) {
                yield put({
                    type: type.PUT_LIST_ATTENDANCE_CERTIFICATES,
                    data: data.data
                });
                callback && callback(data.data);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchDeleteAttndCert(action) {
    // let { data } = yield call(maskAxios.post, '/appointment/updateAttendanceCertificate', action.params);
    let url = `/clinical-doc/attendanceCertificate/${action.params.id}`;
    let { data } = yield call(maskAxios.delete, url);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110602',
                showSnackbar: true
            }
        });
        action.callback && action.callback();
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* deleteAttndCert() {
    yield alsTakeLatest(type.DELETE_ATTENDANCE_CERTIFICATE, fetchDeleteAttndCert);
}

function* fetchUpdateAttndCert(action) {
    let url = '/clinical-doc/attendanceCertificate';
    let { params } = action;
    let { data } = yield call(maskAxios.put, url, params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110612',
                showSnackbar:true
            }
        });
        const closeTabFunc = yield select(state => state.attendanceCert.closeTabFunc);
        if(closeTabFunc) {
            closeTabFunc(true);
        } else {
            action.callback && action.callback();
        }
    } else if (data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032'
            }
        });
    }else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* updateAttndCert() {
    yield alsTakeLatest(type.UPDATE_ATTENDANCE_CERTIFICATE, fetchUpdateAttndCert);
}

export const attendanceCertSaga = [
    getAttendanceCert,
    listAttendanceCertificates,
    deleteAttndCert,
    updateAttndCert
];
