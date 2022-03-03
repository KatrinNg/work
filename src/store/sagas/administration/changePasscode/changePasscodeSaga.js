import { take, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as changePasscodeActionTypes from '../../../actions/administration/changePasscode/changePasscodeActionType';
import * as messageType from '../../../actions/message/messageActionType';
import { alsStartTrans, alsEndTrans } from '../../../actions/als/transactionAction';

function* updatePasscode() {
    while (true) {
        try {
            let { params, callback } = yield take(changePasscodeActionTypes.UPDATE_PASSCODE);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/user/changePasscode', params);
            if (data.respCode === 0) {
                yield put({
                    type: changePasscodeActionTypes.UPDATE_PASSCODE_SUCCESS,
                    data: data.data
                });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111804'
                    }
                });
                callback && callback();
            } else if (data.respCode === 3) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032'
                    }
                });
            } else if(data.respCode === 100){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111805'
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
        } finally {
            yield put(alsEndTrans());
        }
    }
}


export const changePasscodeSagas = [
    updatePasscode
];