import { takeLatest, take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/certificate/yellowFever/yellowFeverActionType';
import {PRINTER_TRAY_TYPE} from '../../../../enums/enum';
import { print,getPrinterTray } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest} from '../../als/alsLogSaga';


function* fetchYellowFeverExemptionLetter(action) {
    try {
        const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
        let params = action.params;
        params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'Yellow Fever Exemption Letter').outDocTypeId;
        const closeTabFunc = yield select(state => state.yellowFever.closeTabFunc);
        // let { data } = yield call(maskAxios.post, '/appointment/getYellowFeverExemptionLetter', action.params);
        let { data } = yield call(maskAxios.post, '/clinical-doc/yellowFeverExemptionLetter', params);
        if (data.respCode === 0) {
            if (!closeTabFunc) {
                const tray=getPrinterTray(PRINTER_TRAY_TYPE.YF);
                let reqParams={
                    base64: data.data,
                    callback: action.callback,
                    copies: action.copies
                };
                if(tray){
                    reqParams.printTray=tray;
                }
                // yield print({ base64: data.data, callback: action.callback, copies: action.copies,printTray:tray });
                yield print(reqParams);
            } else {
                closeTabFunc(true);
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

function* getYellowFeverExemptionLetter() {
    yield alsTakeLatest(type.SAVE_AND_PRINT_LETTER, fetchYellowFeverExemptionLetter);
}

function* listYellowFeverExemptCertificates() {
    while (true) {
        try {
            let { params, callback } = yield take(type.LIST_YELLOWFEVER_EXEMPT_CERTIFICATES);
            yield put(alsStartTrans());

            let url = '/clinical-doc/yellowFeverExemptCertificate?';
            for (let p in params) {
                url += `${p}=${params[p]}&`;
            }
            url = url.substring(0, url.length - 1);
            // let { data } = yield call(maskAxios.post, '/appointment/listYellowFeverExemptCertificates', params);
            let { data } = yield call(maskAxios.get, url);
            if (params.siteId !== '') {
                data.data = (data.data || []).filter(item => item.siteId === params.siteId);
            }
            if (data.respCode === 0) {
                yield put({
                    type: type.PUT_LIST_YELLOWFEVER_EXEMPT_CERTIFICATES,
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

function* fetchUpdateYellowFeverExemptCertificate(action) {
    // let { data } = yield call(maskAxios.post, '/appointment/updateYellowFeverExemptCertificate', action.params);
    // let url = `/clinical-doc/yellowFeverExemptCertificate/${action.params.id}`;
    let url = '/clinical-doc/yellowFeverExemptCertificate';
    let { params } = action;
    let { data } = yield call(maskAxios.put, url, params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110612',
                showSnackbar: true
            }
        });
        const closeTabFunc = yield select(state => state.yellowFever.closeTabFunc);
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

function* updateYellowFeverExemptCertificate() {
    yield alsTakeLatest(type.UPDATE_YELLOWFEVER_EXEMPT_CERTIFICATE, fetchUpdateYellowFeverExemptCertificate);
}


function* fetchDeleteYellowFeverExemptCertificate(action) {
    let url = `/clinical-doc/yellowFeverExemptCertificate/${action.params.id}`;
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

function* deleteYellowFeverExemptCertificate() {
    yield alsTakeLatest(type.DELETE_YELLOWFEVER_EXEMPT_CERTIFICATE, fetchDeleteYellowFeverExemptCertificate);
}


export const yellowFeverSaga = [
    getYellowFeverExemptionLetter,
    listYellowFeverExemptCertificates,
    updateYellowFeverExemptCertificate,
    deleteYellowFeverExemptCertificate
];
