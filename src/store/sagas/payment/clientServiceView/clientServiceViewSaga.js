import { take, takeEvery, takeLatest, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/payment/clientServiceView/clientServiceViewActionType';
import * as messageType from '../../../actions/message/messageActionType';
import * as CSViewUtil from '../../../../utilities/clientServiceViewUtilities';
import { alsStartTrans, alsEndTrans } from '../../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../../als/alsLogSaga';
import { print } from '../../../../utilities/printUtilities';

function* listThsChargeList() {
    while (true) {
        try {
            yield take(types.LIST_THS_CHARGES);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/rcp/thsCharges');
            if (data.respCode === 0) {
                yield put({
                    type: types.PUT_THS_CHARGES,
                    data: data.data
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

function* listRcpCsnHistroy() {
    while (true) {
        try {
            const { patientKey, callback } = yield take(types.LIST_RCP_CSN_HISTORY);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, `/rcp/clientServiceView/${patientKey}`);
            if (data.respCode === 0) {
                const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                let selectedHistoryIdx = data.data.findIndex(item => item.caseNo === caseNoInfo.caseNo);
                yield put({
                    type: types.PUT_RCP_CSN_HISTORY,
                    rcpCsnHistoryList: data.data,
                    selectedHistoryIdx
                });

                let caseNo = 0;

                if (selectedHistoryIdx > -1) {
                    caseNo = data.data[selectedHistoryIdx].caseNo;
                } else {
                    caseNo = caseNoInfo.caseNo;
                }
                yield put({
                    type: types.GET_RCP_CSN_ITEM,
                    params: {
                        caseNo,
                        patientKey
                    },
                    callback
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

function* submitRcpCsnRemark(action) {
    const { params, callback } = action;
    let respData = null;
    if (params.csnId) {
        respData = yield call(maskAxios.put, '/rcp/rcpThsCsnRemark', params);
    } else {
        respData = yield call(maskAxios.post, '/rcp/rcpThsCsnRemark', params);
    }

    if (respData.data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111402',
                showSnackbar: true
            }
        });
        yield put({
            type: types.UPDATE_FIELD,
            updateData: { openRemarkFlag: false }
        });
        callback && callback();
    } else if (respData.data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032'
            }
        });
    } else if (respData.data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110061'
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

function* updateRcpCsnRemark() {
    yield alsTakeEvery(types.UPDATE_RCP_CSN_REMARK, submitRcpCsnRemark);
}


function* submitRcpCsn(action) {
    const { params, callback } = action;
    let { data } = yield call(maskAxios.post, '/rcp/rcpThsCsn', params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110023',
                showSnackbar: true
            }
        });
        callback && callback(data.data);
    } else if (data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032' //111405
                // showSnackbar: true
            }
        });
    } else if (data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110060'
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

function* insertUpdateRcpCsn() {
    yield alsTakeLatest(types.SUBMIT_RCP_SCN, submitRcpCsn);
}

function* getRcpCsnItem() {
    while (true) {
        try {
            const { params, callback } = yield take(types.GET_RCP_CSN_ITEM);
            yield put(alsStartTrans());

            const url = `rcp/clientServiceViewItem?caseNo=${params.caseNo}&patientKey=${params.patientKey}`;
            let { data } = yield call(maskAxios.get, url);
            if (data.respCode === 0) {
                const thsCharges = yield select(state => state.clientSvcView.thsCharges);
                let noteData = CSViewUtil.transferNoteData(data.data, thsCharges);
                yield put({
                    type: types.PUT_RCP_CSN_ITEM,
                    rcpCsnItem: noteData
                });
                yield put({
                    type: types.UPDATE_FIELD,
                    updateData: { isPaidAll: CSViewUtil.checkPaidAll(noteData) }
                });
                if (data.data.fetchError) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            params: [
                                {
                                    name: 'MODULE_STR',
                                    value: data.data.fetchError
                                }
                            ],
                            msgCode: '111404'
                        }
                    });
                }
                callback && callback(noteData);
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

function* printCSV() {
    yield alsTakeLatest(types.PRINT_CSV, function* (action) {
        const { params } = action;
        const { data } = yield call(maskAxios.get, '/rcp/printCSV', { params: params });
        if (data.respCode === 0) {
            yield print({ base64: data.data });
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


export const clientServiceViewSaga = [
    listThsChargeList,
    listRcpCsnHistroy,
    updateRcpCsnRemark,
    insertUpdateRcpCsn,
    getRcpCsnItem,
    printCSV
];