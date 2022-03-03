import { take, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as changePasswordActionTypes from '../../../actions/administration/changePassword/changePasswordActionType';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';

function* updatePassword() {
    while (true) {
        try{
            let { params, callback } = yield take(changePasswordActionTypes.UPDATE_PASSWORD);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/user/changePassword', params);
            if (data.respCode === 0) {
                yield put({
                    type: changePasswordActionTypes.UPDATE_PASSWORD_SUCCESS,
                    data: data.data
                });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110301',
                        btnActions: {
                            btn1Click: callback
                        }
                    }
                });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110321'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110322'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110323'
                    }
                });
            } else if (data.respCode === 103) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110395'
                    }
                });
            } else if (data.respCode === 104) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110396'
                    }
                });
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
        }finally{
            yield put(alsEndTrans());
        }
    }
}


export const changePasswordSagas = [
    updatePassword
];