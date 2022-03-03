import { take, select, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/administration/apptSlipRemarks/apptSlipRemarksActionType';
import * as messageType from '../../../actions/message/messageActionType';
import * as sysConfig from '../../../../configs/config';
import { alsStartTrans, alsEndTrans } from '../../../actions/als/transactionAction';
import { alsTakeEvery } from '../../als/alsLogSaga';
import { isServiceAdminSetting, isSystemAdminSetting } from '../../../../utilities/userUtilities';
import { EnctrAndRmUtil } from '../../../../utilities';

const url = '/ana/apptSlipRemark';

function* listApptSlipRemarks() {
    yield alsTakeEvery(types.LIST_APPTSLIPREMARKS, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/ana/apptSlipRemark', { params });
        if (data.respCode === 0) {
            let _apptSlipRemarksList = data.data;
            let siteId = yield select(state => state.login.clinic.siteId);
            if (isSystemAdminSetting() || isServiceAdminSetting()) {
                _apptSlipRemarksList = data.data;
            } else {
                _apptSlipRemarksList = data.data.filter(item => item.siteId === siteId);
            }
            callback && callback(_apptSlipRemarksList);
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }

    });
}

function* submitApptSlipRemark(action) {
    const { params, callback } = action;
    let resp = null;
    let msgCode = '';
    if (params.apptSlipRemarkGroupId !== 0) {
        resp = yield call(maskAxios.put, url, params, { timeout: sysConfig.RequestTimedoutLong });
        msgCode = '110063';
    } else {
        resp = yield call(maskAxios.post, url, params, { timeout: sysConfig.RequestTimedoutLong });
        msgCode = '110062';
    }
    if (resp.data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: msgCode,
                showSnackbar: true
            }
        });
        callback && callback();
    } else if (resp.data.respCode === 100 || resp.data.respCode === 102) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '115802'
            }
        });
    } else if (resp.data.respCode === 3) {
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

function* insertUpdateApptSlipRemark() {
    yield alsTakeEvery(types.SUBMIT_APPTSLIPREMARKS, submitApptSlipRemark);
}

function* deleteApptSlipRemark() {
    while (true) {
        let { params, callback } = yield take(types.DELETE_APPTSLIPREMARKS);
        let { data } = yield call(maskAxios.delete, url, { data: params });
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110068',
                    showSnackbar: true
                }
            });
            callback && callback();
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}


function* getAppointmentReport() {
    while (true) {
        try {
            let { params, callback } = yield take(types.GET_APPTSLIP_REPORT);

            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/ana/apptSlipReport', { params: params });
            if (data.respCode === 0) {
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

function* getEncounterTypeListBySite() {
    yield alsTakeEvery(types.GET_ENCOUNTER_TYPE_LIST_BY_SITE, function* (action) {
        let { params, callback, isNeedCheckValidEnct } = action;
        let { data } = yield call(maskAxios.get, '/cmn/services/' + (params.svcCd || '') + '/encounterTypes?siteId=' + (params.siteId || ''));
        if (data.respCode === 0) {
            let _encounterTypeList =  data.data;
            if(isNeedCheckValidEnct){
                _encounterTypeList = data.data.filter(item => EnctrAndRmUtil.isActiveEnctType(item));
            }
            callback && callback(_encounterTypeList);
        }
    });
}

export const apptSlipRemarksSaga = [
    listApptSlipRemarks,
    insertUpdateApptSlipRemark,
    deleteApptSlipRemark,
    getAppointmentReport,
    getEncounterTypeListBySite
];