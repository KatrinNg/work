import { call, put, takeLatest } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as timeslotPlanActionType from '../../../actions/appointment/timeslotPlan/timeslotPlanActionType';
import * as messageType from '../../../actions/message/messageActionType';
import {alsTakeLatest} from '../../als/alsLogSaga';

function* listTimeslotPlanHdrBySiteImpl(action) {
    let { data } = yield call(maskAxios.get, `/ana/sites/${action.params.siteId}/timeslotPlans`);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.PUT_LIST_TIMESLOT_PLAN_HDR, data: data.data });
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({ type: timeslotPlanActionType.PUT_LIST_TIMESLOT_PLAN_HDR, data: [] });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* listTimeslotPlanHdrBySite() {
    yield alsTakeLatest(timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SITE, listTimeslotPlanHdrBySiteImpl);
}

function* listTimeslotPlanHdrByServiceImpl(action) {
    let { data } = yield call(maskAxios.get, `/ana/services/${action.params.serviceCd}/timeslotPlans`);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.PUT_LIST_TIMESLOT_PLAN_HDR, data: data.data });
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({ type: timeslotPlanActionType.PUT_LIST_TIMESLOT_PLAN_HDR, data: [] });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* listTimeslotPlanHdrByService() {
    yield alsTakeLatest(timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SERVICE, listTimeslotPlanHdrByServiceImpl);
}

function* getTimeslotPlanImpl(action) {
    let { data } = yield call(maskAxios.get, '/ana/timeslotPlans/' + action.tmsltPlanHdrId);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.PUT_TIMESLOT_PLAN, data: data.data });
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({ type: timeslotPlanActionType.PUT_TIMESLOT_PLAN, data: null });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getTimeslotPlan() {
    yield alsTakeLatest(timeslotPlanActionType.GET_TIMESLOT_PLAN, getTimeslotPlanImpl);
}

function* getTimeslotPlanWeekdayImpl(action) {
    let { data } = yield call(maskAxios.get, '/ana/timeslotPlans/' + action.tmsltPlanHdrId + '/weekday');
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.PUT_TIMESLOT_PLAN_WEEKDAY, data: data.data });
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({ type: timeslotPlanActionType.PUT_TIMESLOT_PLAN_WEEKDAY, data: null });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getTimeslotPlanWeekday() {
    yield alsTakeLatest(timeslotPlanActionType.GET_TIMESLOT_PLAN_WEEKDAY, getTimeslotPlanWeekdayImpl);
}

function* getOtherTimeslotPlanWeekdayImpl(action) {
    let { data } = yield call(maskAxios.get, '/ana/timeslotPlans/' + action.tmsltPlanHdrId + '/weekday');
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.PUT_OTHER_TIMESLOT_PLAN_WEEKDAY, data: data.data });
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({ type: timeslotPlanActionType.PUT_OTHER_TIMESLOT_PLAN_WEEKDAY, data: null });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getOtherTimeslotPlanWeekday() {
    yield alsTakeLatest(timeslotPlanActionType.GET_OTHER_TIMESLOT_PLAN_WEEKDAY, getOtherTimeslotPlanWeekdayImpl);
}

function* createTimeslotPlanHdrImpl(action) {
    let { data } = yield call(maskAxios.post, '/ana/timeslotPlans', action.params);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SERVICE, params: action.listParams });
        yield put({ type: timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_HDR_DIALOG });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    { name: 'MESSAGE', value: 'The record has been successfully created.' }
                ],
                showSnackbar: true
            }
        });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    { name: 'MESSAGE', value: data.errMsg }
                ],
                showSnackbar: true
            }
        });
    }
}

function* createTimeslotPlanHdr() {
    yield alsTakeLatest(timeslotPlanActionType.CREATE_TIMESLOT_PLAN_HDR, createTimeslotPlanHdrImpl);
}

function* updateTimeslotPlanHdrImpl(action) {
    let { data } = yield call(maskAxios.put, '/ana/timeslotPlans', action.params);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SERVICE, params: action.listParams });
        yield put({ type: timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_HDR_DIALOG });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    { name: 'MESSAGE', value: 'The record has been successfully updated.' }
                ],
                showSnackbar: true
            }
        });
    }else if(data.respCode===106){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110933',
                showSnackbar: true
            }
        });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    { name: 'MESSAGE', value: data.errMsg }
                ],
                showSnackbar: true
            }
        });
    }
}

function* updateTimeslotPlanHdr() {
    yield alsTakeLatest(timeslotPlanActionType.UPDATE_TIMESLOT_PLAN_HDR, updateTimeslotPlanHdrImpl);
}

function* deleteTimeslotPlanHdrImpl(action) {
    let { data } = yield call(maskAxios.delete, '/ana/timeslotPlans/' + action.groupId);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SERVICE, params: action.listParams });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    { name: 'MESSAGE', value: 'Selected record(s) has been successfully deleted.' }
                ],
                showSnackbar: true
            }
        });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    { name: 'MESSAGE', value: data.errMsg }
                ],
                showSnackbar: true
            }
        });
    }
}

function* deleteTimeslotPlanHdr() {
    yield alsTakeLatest(timeslotPlanActionType.DELETE_TIMESLOT_PLAN_HDR, deleteTimeslotPlanHdrImpl);
}

function* createTimeslotPlanImpl(action) {
    let { data } = yield call(maskAxios.post, '/ana/timeslotPlans/' + action.groupId + '/weekday/' + action.weekday, action.params);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SERVICE, params: action.listParams });
        yield put({ type: timeslotPlanActionType.GET_TIMESLOT_PLAN_WEEKDAY, tmsltPlanHdrId: action.tmsltPlanHdrId });
        yield put({ type: timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_DIALOG });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    { name: 'MESSAGE', value: 'The timeslot record has been successfully updated.' }
                ],
                showSnackbar: true
            }
        });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    { name: 'MESSAGE', value: data.errMsg }
                ],
                showSnackbar: true
            }
        });
    }
}

function* createTimeslotPlan() {
    yield alsTakeLatest(timeslotPlanActionType.CREATE_TIMESLOT_PLAN, createTimeslotPlanImpl);
}

function* updateTimeslotPlanImpl(action) {
    let { data } = yield call(maskAxios.put, '/ana/timeslotPlans/' + action.tmsltPlanHdrId + '/weekday', action.params);
    if (data.respCode === 0) {
        yield put({ type: timeslotPlanActionType.LIST_TIMESLOT_PLAN_HDR_BY_SERVICE, params: action.listParams });
        yield put({ type: timeslotPlanActionType.GET_TIMESLOT_PLAN_WEEKDAY, tmsltPlanHdrId: action.tmsltPlanHdrId });
        yield put({ type: timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_DIALOG });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    { name: 'MESSAGE', value: 'The timeslot record has been successfully updated.' }
                ],
                showSnackbar: true
            }
        });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    { name: 'MESSAGE', value: data.errMsg }
                ],
                showSnackbar: true
            }
        });
    }
}

function* updateTimeslotPlan() {
    yield alsTakeLatest(timeslotPlanActionType.UPDATE_TIMESLOT_PLAN, updateTimeslotPlanImpl);
}

export const timeslotPlanSaga = [
    listTimeslotPlanHdrBySite,
    listTimeslotPlanHdrByService,
    getTimeslotPlan,
    getTimeslotPlanWeekday,
    getOtherTimeslotPlanWeekday,
    createTimeslotPlanHdr,
    updateTimeslotPlanHdr,
    deleteTimeslotPlanHdr,
    createTimeslotPlan,
    updateTimeslotPlan
];