import { take, call, put } from 'redux-saga/effects';
import * as types from '../../actions/message/messageActionType';
import * as messageType from '../../actions/message/messageActionType';
import { maskAxios } from '../../../services/axiosInstance';


function* getMessageListByAppId() {
    let { params } = yield take(messageType.GET_MESSAGE_LIST_BY_APP_ID);
    let {applicationId} = params;
    let { data } = yield call(maskAxios.get, `message/message/${applicationId}`);
    if (data.respCode === 0) {
        yield put({
            type: types.COMMON_MESSAGE_LIST,
            commonMessageList: data.data
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

export const messageSaga = [
    getMessageListByAppId
];