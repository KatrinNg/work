import { takeLatest, take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/certificate/maternity/maternityActionType';
import { print } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest} from '../../als/alsLogSaga';

function* fetchGetMaternityCert(action) {
    try {
        const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
        let params = action.params;
        params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'Maternity Certificate').outDocTypeId;
        const closeTabFunc = yield select(state => state.maternity.closeTabFunc);
        let { data } = yield call(maskAxios.post, '/clinical-doc/maternityCertificate', params);
        if (data.respCode === 0) {
            if (closeTabFunc) {
                closeTabFunc(true);
            } else {
                yield print({ base64: data.data, callback: action.callback, copies: action.copies });
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

function* getMaternityCert() {
    yield alsTakeLatest(type.GET_MATERNITY_CERT, fetchGetMaternityCert);
}


function* listMaternityCert() {
    while (true) {
        try{
            let { params, callback } = yield take(type.LIST_MATERNITY_CERT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, `/clinical-doc/maternityLeaveCertificate?patientKey=${params.patientKey}&svcCd=${params.svcCd}&from=${params.from}&to=${params.to}`);
            if (params.siteId !== '') {
                data.data = (data.data || []).filter(item => item.siteId === params.siteId);
            }
            if (data.respCode === 0) {
                yield put({
                    type: type.PUT_LIST_MATERNITY_CERT,
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

function* fetchDeleteMaternityCert(action) {
    let { data } = yield call(maskAxios.delete, `/clinical-doc/maternityLeaveCertificate/${action.params}`);
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

function* deleteMaternityCert() {
    yield alsTakeLatest(type.DELETE_MATERNITY_CERT, fetchDeleteMaternityCert);
}


function* fetchUpdateMaternityCert(action) {
    // let { data } = yield call(maskAxios.delete, `/clinical-doc/maternityLeaveCertificate/${action.params}`);
    let { params } = action;
    let url = '/clinical-doc/maternityLeaveCertificate';
    let { data } = yield call(maskAxios.put, url, params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110612',
                showSnackbar: true
            }
        });
        const closeTabFunc = yield select(state => state.maternity.closeTabFunc);
        if (closeTabFunc) {
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


function* updateMaternityCert() {
    yield alsTakeLatest(type.UPDATE_MATERNITY_CERT, fetchUpdateMaternityCert);
}


export const maternitySaga = [
    getMaternityCert,
    listMaternityCert,
    deleteMaternityCert,
    updateMaternityCert
];
