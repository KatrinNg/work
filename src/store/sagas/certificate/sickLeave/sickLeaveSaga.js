import { takeLatest, take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/certificate/sickLeave/sickLeaveActionType';
import { print } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest} from '../../als/alsLogSaga';

function* fetchSickLeaveCert(action) {
    try {
        const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
        let params = action.params;
        let isPreview = action.isPreview;
        params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'Sick Leave Certificate').outDocTypeId;
        const closeTabFunc = yield select(state => state.sickLeave.closeTabFunc);
        let { data } = yield call(maskAxios.post, '/clinical-doc/leaveCertificate', params);
        if (data.respCode === 0) {
            if (isPreview) {
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
                        callback: action.callback,
                        copies: action.copies,
                        isFitPage: action.isFitPage,
                        printQueue: action.printQue
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
        } else {
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

function* getSickLeaveCert() {
    yield alsTakeLatest(type.GET_SICK_LEAVE_CERT, fetchSickLeaveCert);
}


function* listLeaveCertificates() {
    while (true) {
        try {
            let { params, callback } = yield take(type.LIST_LEAVE_CERTIFICATES);
            yield put(alsStartTrans());

            let url = '/clinical-doc/leaveCertificate?';
            for (let p in params) {
                url += `${p}=${params[p]}&`;
            }
            url = url.substring(0, url.length - 1);
            // let { data } = yield call(maskAxios.get, '/clinical-doc/listLeaveCertificates', params);
            let { data } = yield call(maskAxios.get, url);
            if (params.siteId !== '') {
                data.data = (data.data || []).filter(item => item.siteId === params.siteId);
            }
            if (data.respCode === 0) {
                yield put({
                    type: type.PUT_LIST_LEAVE_CERTIFICATES,
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

function* fetchUpdateLeaveCertificate(action) {
    // let { data } = yield call(maskAxios.post, '/clinical-doc/updateLeaveCertificate', action.params);
    // let url = `/clinical-doc/leaveCertificate/${action.params.id}`;\
    let { params } = action;
    let url = '/clinical-doc/leaveCertificate';
    let { data } = yield call(maskAxios.put, url, params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110612',
                showSnackbar: true
            }
        });
        const closeTabFunc = yield select(state => state.sickLeave.closeTabFunc);
        if(closeTabFunc){
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
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* updateLeaveCertificate() {
    yield alsTakeLatest(type.UPDATE_LEAVE_CERTIFICATE, fetchUpdateLeaveCertificate);
}


function* fetchDeleteSickLeaveCert(action) {
    let url = `/clinical-doc/leaveCertificate/${action.params.id}`;
    let { data } = yield call(maskAxios.delete, url);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110602'
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


function* deleteSickLeaveCert() {
    yield alsTakeLatest(type.DELETE_LEAVE_CERTIFICATES, fetchDeleteSickLeaveCert);
}


export const sickLeaveSaga = [
    getSickLeaveCert,
    listLeaveCertificates,
    updateLeaveCertificate,
    deleteSickLeaveCert
];
