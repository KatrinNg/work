import { call, put, takeLatest } from 'redux-saga/effects';
import { axiosWithoutLoading, maskAxios } from '../../../../services/axiosInstance';
import { DateUtil } from '../../../../utilities';
import * as timeslotManagementV2ActionType from '../../../actions/appointment/timeslotManagementV2/timeslotManagementV2ActionType';
import * as messageType from '../../../actions/message/messageActionType';
import { alsTakeLatest } from '../../als/alsLogSaga';

function* getTimeslotPlanHdrsV2() {
    yield takeLatest(timeslotManagementV2ActionType.GET_TIMESLOT_PLAN_HDRS_V2, function* (action) {
        const { svcCd, siteId } = action;
        console.log(`[timeslotManagementV2Saga] getTimeslotPlanHdrsV2() -> svcCd: ${svcCd}, siteId: ${siteId}`);

        yield put({ type: timeslotManagementV2ActionType.UPDATE_STATE, newState: { loadingTimeslotPlanHdrs: true, timeslotPlanHdrs: [] } });

        try {
            let { data } = yield call(axiosWithoutLoading.get, `/ana/services/${svcCd}/${siteId}/timeslotPlansV2`);
            console.log('[timeslotManagementV2Saga] getTimeslotPlanHdrsV2() -> data: ', data);
            if (data.respCode === 0) {
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingTimeslotPlanHdrs: false,
                        timeslotPlanHdrs: data.data
                    }
                });
            } else {
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingTimeslotPlanHdrs: false,
                        timeslotPlanHdrs: []
                    }
                });
                if (data.respCode === 101) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111204'
                        }
                    });
                } else if (data.respCode === 100) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111203'
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
        } catch (e) {
            console.log(e);
        } finally {
            yield put({
                type: timeslotManagementV2ActionType.UPDATE_STATE,
                newState: { loadingTimeslotPlanHdrs: false }
            });
        }
    });
}

function* createTimeslotPlanHdrV2() {
    yield takeLatest(timeslotManagementV2ActionType.CREATE_TIMESLOT_PLAN_HDR_V2, function* (action) {
        const { param, callback } = action;
        console.log('[timeslotManagementV2Saga] createTimeslotPlanHdrV2() -> param: ', param);

        try {
            let { data } = yield call(maskAxios.post, '/ana/timeslotPlansV2', param);
            console.log('[timeslotManagementV2Saga] createTimeslotPlanHdrV2() -> data: ', data);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130301',
                        params: [{ name: 'MESSAGE', value: 'The Timeslot Plan Header has been successfully created.' }],
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130300',
                        params: [
                            { name: 'HEADER', value: 'Timeslot Management' },
                            { name: 'MESSAGE', value: data.errMsg }
                        ]
                        // ,
                        // showSnackbar: true
                    }
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            //
        }
    });
}

function* updateTimeslotPlanHdrV2() {
    yield takeLatest(timeslotManagementV2ActionType.UPDATE_TIMESLOT_PLAN_HDR_V2, function* (action) {
        const { param, callback } = action;
        console.log('[timeslotManagementV2Saga] updateTimeslotPlanHdrV2() -> param: ', param);

        try {
            let { data } = yield call(maskAxios.put, '/ana/timeslotPlansV2', param);
            console.log('[timeslotManagementV2Saga] updateTimeslotPlanHdrV2() -> data: ', data);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130301',
                        params: [{ name: 'MESSAGE', value: 'The Timeslot Plan Header has been successfully updated.' }],
                        showSnackbar: true
                    }
                });
                callback && callback(data?.data?.tmsltPlanHdrId);
            } else if (data.respCode === 106) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110933'
                        // ,
                        // showSnackbar: true
                    }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130300',
                        params: [
                            { name: 'HEADER', value: 'Timeslot Management' },
                            { name: 'MESSAGE', value: data.errMsg }
                        ]
                        // ,
                        // showSnackbar: true
                    }
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            //
        }
    });
}

function* deleteTimeslotPlanHdrV2() {
    yield takeLatest(timeslotManagementV2ActionType.DELETE_TIMELSOT_PLAN_HDR_V2, function* (action) {
        const { id, callback } = action;
        console.log('[timeslotManagementV2Saga] deleteTimeslotPlanHdrV2() -> id: ', id);

        try {
            let { data } = yield call(maskAxios.delete, `/ana/timeslotPlansV2/${id}`);
            console.log('[timeslotManagementV2Saga] deleteTimeslotPlanHdrV2() -> data: ', data);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130301',
                        params: [{ name: 'MESSAGE', value: 'The Timeslot Plan Header has been successfully deleted.' }],
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130300',
                        params: [
                            { name: 'HEADER', value: 'Timeslot Management' },
                            { name: 'MESSAGE', value: data.errMsg }
                        ]
                        // ,
                        // showSnackbar: true
                    }
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            //
        }
    });
}

function* getTimeslotPlansV2() {
    yield takeLatest(timeslotManagementV2ActionType.GET_TIMESLOT_PLANS_V2, function* (action) {
        const { timeslotPlanHdrId } = action;
        console.log(`[timeslotManagementV2Saga] getTimeslotPlansV2() -> timeslotPlanHdrId: ${timeslotPlanHdrId}`);

        yield put({ type: timeslotManagementV2ActionType.UPDATE_STATE, newState: { loadingTimeslotPlans: true, timeslotPlans: [] } });

        try {
            let { data } = yield call(axiosWithoutLoading.get, `/ana/timeslotPlansV2/${timeslotPlanHdrId}/weekday`);
            console.log('[timeslotManagementV2Saga] getTimeslotPlansV2() -> data: ', data);
            if (data.respCode === 0) {
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingTimeslotPlans: false,
                        timeslotPlans: data.data
                    }
                });
            } else {
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingTimeslotPlans: false,
                        timeslotPlans: []
                    }
                });
                if (data.respCode === 101) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111204'
                        }
                    });
                } else if (data.respCode === 100) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111203'
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
        } catch (e) {
            console.log(e);
        } finally {
            yield put({
                type: timeslotManagementV2ActionType.UPDATE_STATE,
                newState: { loadingTimeslotPlans: false }
            });
        }
    });
}

function* createTimeslotPlanV2() {
    yield takeLatest(timeslotManagementV2ActionType.CREATE_TIMESLOT_PLAN_V2, function* (action) {
        const { timeslotPlanHdrId, param, callback } = action;
        console.log(`[timeslotManagementV2Saga] createTimeslotPlanV2() -> timeslotPlanHdrId: ${timeslotPlanHdrId}, param: `, param);

        try {
            let { data } = yield call(maskAxios.post, `/ana/timeslotPlansV2/${timeslotPlanHdrId}/timeslot`, param);
            console.log(`[timeslotManagementV2Saga] createTimeslotPlanV2() -> timeslotPlanHdrId: ${timeslotPlanHdrId}, data: `, data);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130301',
                        params: [{ name: 'MESSAGE', value: 'The Timeslot Plan has been successfully created.' }],
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130300',
                        params: [
                            { name: 'HEADER', value: 'Timeslot Management' },
                            { name: 'MESSAGE', value: data.errMsg }
                        ]
                        // ,
                        // showSnackbar: true
                    }
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            //
        }
    });
}

function* getPredefinedTimeslots() {
    yield takeLatest(timeslotManagementV2ActionType.GET_PREDEFINED_TIMESLOTS, function* (action) {
        const { svcCd } = action;
        console.log(`[timeslotManagementV2Saga] getPredefinedTimeslots() -> svcCd: ${svcCd}`);

        yield put({ type: timeslotManagementV2ActionType.UPDATE_STATE, newState: { loadingPredefinedTimeslots: true, predefinedTimeslots: [] } });

        try {
            let { data } = yield call(axiosWithoutLoading.get, `/ana/services/${svcCd}/predefinedTimeSlot`);
            console.log('[timeslotManagementV2Saga] getPredefinedTimeslots() -> data: ', data);
            if (data.respCode === 0) {
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingPredefinedTimeslots: false,
                        predefinedTimeslots: data.data
                    }
                });
            } else {
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingPredefinedTimeslots: false,
                        predefinedTimeslots: []
                    }
                });
                if (data.respCode === 101) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111204'
                        }
                    });
                } else if (data.respCode === 100) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111203'
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
        } catch (e) {
            console.log(e);
        } finally {
            yield put({
                type: timeslotManagementV2ActionType.UPDATE_STATE,
                newState: { loadingPredefinedTimeslots: false }
            });
        }
    });
}

function* multipleUpdateTimeslotV2() {
    yield takeLatest(timeslotManagementV2ActionType.MULTIPLE_UPDATE_TIMESLOT_V2, function* (action) {
        const { param, callback } = action;
        console.log('[timeslotManagementV2Saga] multipleUpdateTimeslotV2() -> param: ', param);

        try {
            let { data } = yield call(maskAxios.post, '/ana/timeslotPlansV2/multipleUpdate', param);
            console.log('[timeslotManagementV2Saga] multipleUpdateTimeslotV2() -> data: ', data);
            // if (data.respCode === 0) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '130301',
            //             params: [{ name: 'MESSAGE', value: 'The Timeslot Plan has been successfully updated.' }],
            //             showSnackbar: true
            //         }
            //     });
            //     callback && callback(data.data);
            // } else {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '130300',
            //             params: [{ name: 'MESSAGE', value: data.errMsg }],
            //             showSnackbar: true
            //         }
            //     });
            // }

            if (data.respCode === 0) {
                let msg = '';
                if (data.data.overlapTimeRanges && data.data.overlapTimeRanges.length > 0) {
                    msg += 'The following timeslot(s) is overlapped: <br />';
                    data.data.overlapTimeRanges.forEach((item) => {
                        msg += `<b>${DateUtil.getFormatDate(item.date)}</b>&nbsp;&nbsp;&nbsp;Start Time: <b>${item.stime}</b>&nbsp;&nbsp;&nbsp;End Time: <b>${
                            item.etime
                        }</b><br />`;
                    });
                }
                if (data.data.sessNotMatchTimeRanges && data.data.sessNotMatchTimeRanges.length > 0) {
                    msg += 'The following start/end time is session not match time ranges: <br />';
                    data.data.sessNotMatchTimeRanges.forEach((item) => {
                        msg += `Start Time: <b>${item.stime}</b>&nbsp;&nbsp;&nbsp;End Time: <b>${item.etime}</b><br />`;
                    });
                }
                if (data.data.bookedTimeRanges && data.data.bookedTimeRanges.length > 0) {
                    msg += 'The following timeslot(s) had been booked: <br />';
                    data.data.bookedTimeRanges.forEach((item) => {
                        msg += `<b>${DateUtil.getFormatDate(item.date)}</b>&nbsp;&nbsp;&nbsp;Start Time: <b>${item.stime}</b>&nbsp;&nbsp;&nbsp;End Time: <b>${
                            item.etime
                        }</b><br />`;
                    });
                }
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110808',
                        params: [
                            { name: 'FUNC_NAME', value: 'Timeslot' },
                            { name: 'PARAGRAPH', value: msg },
                            { name: 'INSERT_NUM', value: data.data.insertNum || 0 },
                            { name: 'UPDATE_NUM', value: data.data.updateNum || 0 },
                            { name: 'DELETE_NUM', value: data.data.deleteNum || 0 }
                        ],
                        btnActions: {
                            btn1Click: () => {
                                callback && callback();
                            }
                        }
                    }
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            //
        }
    });
}

function* getTimeslots() {
    yield takeLatest(timeslotManagementV2ActionType.GET_TIMESLOTS, function* (action) {
        const { param } = action;
        console.log('[timeslotManagementV2Saga] getTimeslots() -> param: ', param);

        yield put({ type: timeslotManagementV2ActionType.UPDATE_STATE, newState: { loadingTimeslotPlans: true, timeslotPlans: [] } });

        try {
            let { data } = yield call(axiosWithoutLoading.get, '/ana/timeslots', { params: param });
            console.log('[timeslotManagementV2Saga] getTimeslotPlansV2() -> data: ', data);
            if (data.respCode === 0) {
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingTimeslotPlans: false,
                        timeslotPlans: data.data
                    }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
                yield put({
                    type: timeslotManagementV2ActionType.UPDATE_STATE,
                    newState: {
                        loadingTimeslotPlans: false,
                        timeslotPlans: []
                    }
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            // yield put(alsEndTrans());
            yield put({
                type: timeslotManagementV2ActionType.UPDATE_STATE,
                newState: { loadingTimeslotPlans: false }
            });
        }
    });
}

export const timeslotManagementV2Saga = [
    getTimeslotPlanHdrsV2,
    createTimeslotPlanHdrV2,
    updateTimeslotPlanHdrV2,
    deleteTimeslotPlanHdrV2,
    getTimeslotPlansV2,
    createTimeslotPlanV2,
    getPredefinedTimeslots,
    multipleUpdateTimeslotV2,
    getTimeslots
];
