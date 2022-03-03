import * as types from '../actions/forgetPassword/forgetPasswordActionType';
import {
    take,
    call,
    put
} from 'redux-saga/effects';
import { maskAxios } from '../../services/axiosInstance';
import { alsStartTrans, alsEndTrans } from '../actions/als/transactionAction';
import * as logActions from '../actions/als/logAction';
import * as messageType from '../actions/message/messageActionType';

// import * as commonTypes from '../actions/common/commonActionType';

function* send() {
    while (true) {
        try {
            let { params, callback } = yield take(types.SEND);
            const { loginName, verifier } = params;
            yield put(alsStartTrans());

            // let { data } = yield call(maskAxios.post, '/user/getTemporaryPassword', params);
            let { data } = yield call(maskAxios.post, '/user/forgotPassword/' + loginName, verifier);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110372',
                        params: [
                            { name: 'LOGIN_NAME', value: loginName }
                        ],
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
                    }
                });
            } else if (data.respCode === 101 || data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110373',
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
                    }
                });
            } else if (data.respCode === 103) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110374',
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
                    }
                });
            } else if (data.respCode === 104||data.respCode === 105) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110376',
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
                    }
                });
            }  else if (data.respCode === 106) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110377',
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
                    }
                });
            } else if (data.respCode === 107) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110378',
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
                    }
                });
            } else if (data.respCode === 108) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110379',
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
                    }
                });
            } else if(data.respCode === 110){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110375',
                        btnActions: {
                            btn1Click: () => { callback && callback(); }
                        }
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
        } catch (error) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put(logActions.auditError(error && error.message));

        } finally {
            yield put(alsEndTrans());
        }
    }
}

export const forgetPasswordSaga = [
    send
];