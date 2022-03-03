import { takeLatest, take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/certificate/generalLetter/generalLetterActionType';
import { print } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest} from '../../als/alsLogSaga';

function* fetchGetGeneralLetterCert(action) {
    try {
        const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
        let params = action.params;
        let isPreview = action.isPreview;
        params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'General Letter').outDocTypeId;
        const closeTabFunc = yield select(state => state.generalLetter.closeTabFunc);
        let { data } = yield call(maskAxios.post, '/clinical-doc/generalLetter', action.params);
        if (data.respCode === 0) {
            if(isPreview){
                if (closeTabFunc) {
                    closeTabFunc(true);
                } else {
                    let callback = action.callback;
                    callback && callback(data.data);
                }
            }else{
                if (closeTabFunc) {
                    closeTabFunc(true);
                } else {
                    yield print({ base64: data.data, callback: action.callback, copies: action.copies });
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

function* getGeneralLetterCert() {
    yield alsTakeLatest(type.GET_GENERALLETTER_CERT, fetchGetGeneralLetterCert);
}


function* listGeneralLetterCert() {
    while (true) {
        try {
            let { params, callback } = yield take(type.LIST_GENERALLETTER_CERT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/clinical-doc/generalLetter?patientKey='+ params.patientKey + '&from=' + params.from + '&to=' + params.to + '&svcCd=' + params.svcCd + '&siteId=' + params.siteId);
            if (params.siteId !== '') {
                data.data = (data.data || []).filter(item => item.siteId === params.siteId);
            }
            if (data.respCode === 0) {
                yield put({
                    type: type.PUT_LIST_GENERALLETTER_CERT,
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

function* fetchDeleteGeneralLetterCert(action) {
    let { data } = yield call(maskAxios.delete, `/clinical-doc/generalLetter/${action.params}`);
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

function* deleteGeneralLetterCert() {
    yield alsTakeLatest(type.DELETE_GENERALLETTER_CERT, fetchDeleteGeneralLetterCert);
}

function* fetchUpdateGeneralLetterCert(action) {
    let { params } = action;
    let url = '/clinical-doc/generalLetter';
    let { data } = yield call(maskAxios.put, url, params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110612',
                showSnackbar: true
            }
        });
        const closeTabFunc = yield select(state => state.generalLetter.closeTabFunc);
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


function* updateGeneralLetterCert() {
    yield alsTakeLatest(type.UPDATE_GENERALLETTER_CERT, fetchUpdateGeneralLetterCert);
}


export const generalLetterSaga = [
    getGeneralLetterCert,
    listGeneralLetterCert,
    deleteGeneralLetterCert,
    updateGeneralLetterCert
];
