import { take, takeLatest, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../services/axiosInstance';
import * as administrationType from '../actions/administration/administrationActionType';
import * as messageType from '../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from './als/alsLogSaga';

function* fetchSearchUser(action) {
    let { data } = yield call(maskAxios.post, '/user/searchUser', action.params, { headers: { 'Authorization': 'Bearer ' + window.sessionStorage.getItem('token') } });
    if (data.respCode === 0) {
        yield put({ type: administrationType.PUT_USER_LIST, data: data.data });
    } else {
        yield put({ type: administrationType.PUT_USER_LIST, data: [] });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* searchUser() {
    yield alsTakeLatest(administrationType.SEARCH_USER, fetchSearchUser);
}

function* getUser() {
    while (true) {
        try{
            let { params } = yield take(administrationType.GET_USER_BY_ID);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/user/getUser', params, { headers: { 'Authorization': 'Bearer ' + window.sessionStorage.getItem('token') } });
            if (data.respCode === 0) {
                yield put({ type: administrationType.PUT_USER_DATA, data: data.data });
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

function* fetchInsertUser(action) {
    try {
        let { data } = yield call(maskAxios.post, '/user/insertUser', action.params, { headers: { 'Authorization': 'Bearer ' + window.sessionStorage.getItem('token') } });
        if (data.respCode === 0) {
            yield put({ type: administrationType.PUT_SAVE_USER_PROFILE_SUCCESS });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110021',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(true); } : null
                    }
                }
            });

            let params = { id: data.data };
            yield put({ type: administrationType.GET_USER_BY_ID, params });
        } else if (data.respCode === 1) {
            //todo parameterException
            if (typeof action.callback === 'function') {
                action.callback(false);
            }
        } else if (data.respCode === 3) {
            //Submission failed
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }
            });
        } else if (data.respCode === 100) {
            //do something
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110312',
                    params: [{ name: 'USER_INFO', value: 'Login Name' }],
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }
            });
        }
        else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110312',
                    params: [{ name: 'USER_INFO', value: 'Email' }],
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }
            });
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }
            });
        }
    } catch (error) {
        if (typeof action.callback === 'function') {
            action.callback(false);
        }
        throw error;
    }
}

function* insertUser() {
    yield alsTakeLatest(administrationType.INSERT_USER_PROFILE, fetchInsertUser);
}

function* fetchUpdateUser(action) {
    try {
        let { data } = yield call(maskAxios.post, '/user/updateUser', action.params, { headers: { 'Authorization': 'Bearer ' + window.sessionStorage.getItem('token') } });
        if (data.respCode === 0) {
            yield put({ type: administrationType.PUT_SAVE_USER_PROFILE_SUCCESS });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(true); } : null
                    }
                }
            });
            let params = { id: data.data.userId };
            yield put({ type: administrationType.GET_USER_BY_ID, params });
        } else if (data.respCode === 1) {
            //todo parameterException
            if (typeof action.callback === 'function') {
                action.callback(false);
            }
        } else if (data.respCode === 3) {
            //Submission failed
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }
            });
        } else if (data.respCode === 100) {
            //do something
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110312',
                    params: [{ name: 'USER_INFO', value: 'Login Name' }],
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }
            });
        }
        else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110312',
                    params: [{ name: 'USER_INFO', value: 'Email' }],
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }
            });
        } else if (data.respCode === 102) {
            //Records not exist!
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110314',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }

            });
        } else if (data.respCode === 103) {
            //no access right to unlock user
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110398',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }

            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031',
                    btnActions: {
                        btn1Click: typeof action.callback === 'function' ? () => { action.callback(false); } : null
                    }
                }

            });
        }
    } catch (error) {
        if (typeof action.callback === 'function') {
            action.callback(false);
        }
        throw error;
    }
}

function* updateUser() {
    yield alsTakeLatest(administrationType.UPDATE_USER_PROFILE, fetchUpdateUser);
}

export const administrationSaga = [
    searchUser,
    getUser,
    insertUser,
    updateUser
];