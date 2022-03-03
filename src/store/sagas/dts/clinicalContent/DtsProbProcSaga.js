import { take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as problemProcedureActionType from '../../../actions/dts/clinicalContent/problemProcedureActionType';
import * as messageType from '../../../actions/message/messageActionType';


function* getCommonUsedProbProc() {
    while (true) {
        yield take(problemProcedureActionType.GET_COMMON_USED_PROB_PROC);
        let { data } = yield call(maskAxios.get, '/dts-cc/probProc/cc/probProc/commonUsedProbProc');

        if (data.respCode === 0) {
            //console.log('Info4: ' + JSON.stringify(data));
            yield put({
                type: problemProcedureActionType.UPDATE_STATE,
                updateData: { commonUsedProbProcList: data.data|| [] }
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

function* getQualifier() {
    while (true) {
        let { cncptId, encounterSdt} = yield take(problemProcedureActionType.GET_QUALIFER);
        let { data } = yield call(maskAxios.get, '/dts-cc/probProc/cc/probProc/getQualifier/' + cncptId + '/' + encounterSdt);

        if (data.respCode === 0) {
            //console.log('Info5: ' + JSON.stringify(data));
            yield put({
                type: problemProcedureActionType.UPDATE_QUALIFIER_STATE,
                updateQualifierData: { qualifierList: data.data|| [] }
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

function* getProbProcAddDetails() {
    while (true) {
        let { cncptId} = yield take(problemProcedureActionType.GET_PROB_PROC_ADD_DETAILS);
        let { data } = yield call(maskAxios.get, '/dts-cc/probProc/cc/probProc/getProbProcAddDetails/' + cncptId );

        if (data.respCode === 0) {
            //console.log('Info5: ' + JSON.stringify(data));
            console.log('probProcAddDetails saga', data);
            yield put({
                type: problemProcedureActionType.UPDATE_PROB_PROC_ADD_DETAILS_STATE,
                updateProbProcAddDetailsData: { probProcAddDetails: data.data|| [] }
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

/*
function* updateDentalChart() {
    while (true) {
        let { dentalChart, callback } = yield take(dentalChartType.UPDATE_DENTAL_CHART);
        console.log('updateDentalChart1: ', dentalChart);
        let { data } = yield call(maskAxios.put, '/dts-cc/dentalChart/cc/dentalChart', dentalChart);
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
*/

function* saveProbProc() {
    while (true) {
        let { probProc, callback } = yield take(problemProcedureActionType.SAVE_PROB_PROC);
        //console.log('updateProbProc: ', probProc);
        let { data } = yield call(maskAxios.put, '/dts-cc/probProc/cc/probProc', probProc);
        //console.log('Dicky after save: ', data.respCode);
        //console.log('Dicky after save2: ', data.data);
        if (data.respCode === 0) {
            // yield put({ type: defaultRoomType.SAVE_SUCCESS });
            if (data.data.error == undefined || data.data.error == null){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111112',
                        showSnackbar: true
                    }
                });
            }
            yield put({
                type: problemProcedureActionType.UPDATE_SAVE_STATE,
                updateSaveResultData: { saveResult: data.data|| [] }
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

function* deleteProbProc() {
    while (true) {
        let { termKey, termType, callback } = yield take(problemProcedureActionType.DELETE_PROB_PROC);
        //console.log('updateProbProc: ', probProc);
        let { data } = yield call(maskAxios.put, '/dts-cc/probProc/cc/deleteProbProc/' + termKey + '/' + termType);
        if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111111',
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

export const dtsProbProcSaga = [getCommonUsedProbProc, getQualifier, getProbProcAddDetails, saveProbProc, deleteProbProc];
