import { call, put, take } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as upmActionType from '../../../actions/administration/unavailablePeriodManagement/upmActionType';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../../als/alsLogSaga';
import { DateUtil } from '../../../../utilities';

function* getUpmList() {
    while (true) {
        try{
            let { params } = yield take(upmActionType.GET_UPMLIST);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/ana/unavailablePeriodsBySvcCdAndSiteId', { params: params });
            if (data.respCode === 0) {
                let upmList = data.data;
                yield put({ type: upmActionType.PUT_UPMLIST, data: upmList });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* createUpm() {
    while (true) {
        try{
            let { params, callback } = yield take(upmActionType.INSERT_UPM);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/ana/unavailablePeriods', params);
            if (data.respCode === 0) {
                callback && callback();
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110503'
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
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* updateUpm() {
    while (true) {
        try{
            let { unavailPerdId, params, callback } = yield take(upmActionType.UPDATE_UPM);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.put, '/ana/unavailablePeriods/' + unavailPerdId, params);
            if (data.respCode === 0) {
                callback && callback();
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110023',
                        showSnackbar: true
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
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* deleteUpm() {
    while (true) {
        try{
            let { id, callback } = yield take(upmActionType.DELETE_UPM);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.delete, '/ana/unavailablePeriods/' + id);
            if (data.respCode === 0) {
                callback && callback();
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110602',
                        showSnackbar: true
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
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* getUnavailableReasons() {
    while (true) {
        try{
            yield take(upmActionType.GET_UNAVAILABLEREASONS);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/ana/unavailableReasons');
            if (data.respCode === 0) {
                yield put({ type: upmActionType.PUT_UNAVAILABLEREASONS, data: data.data });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

export const unavailablePeriodManagementSaga = [
    createUpm,
    updateUpm,
    deleteUpm,
    getUpmList,
    getUnavailableReasons
];