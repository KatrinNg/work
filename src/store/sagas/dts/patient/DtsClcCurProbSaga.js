import { take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as clcCurProbType from '../../../actions/dts/patient/DtsClcCurProbActionType';
import * as messageType from '../../../actions/message/messageActionType';


function* getClcCurProbList() {
    while (true) {
        let { patientKey } = yield take(clcCurProbType.GET_CLC_CUR_PROB_LIST);
        let { data } = yield call(maskAxios.get, '/dental/clcCurProb/patients/' + patientKey + '/clcCurProb');
        console.log('Info: ' + 1);

        if (data.respCode === 0) {
            console.log('Info2: ', data);
            console.log('Info3: ' + JSON.stringify(data));
            yield put({
                type: clcCurProbType.UPDATE_STATE,
                updateData: { clcCurProbList: data.data || [] }
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
}

function* putClcCurProb() {
    while (true) {
        let { clcCurProb, callback } = yield take(clcCurProbType.PUT_CLC_CUR_PROB);
        console.log("CuProbObj:" + clcCurProb.clcEncntrId);
        let { data } = yield call(maskAxios.put, '/dental/clcCurProb/patient/clcCurProb', clcCurProb);
        if (data.respCode === 0) {
            // yield put({ type: defaultRoomType.SAVE_SUCCESS });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
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

export const dtsClcCurProbSaga = [getClcCurProbList, putClcCurProb];
