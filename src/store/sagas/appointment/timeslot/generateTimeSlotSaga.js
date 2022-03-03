import { call, select, put, takeLatest, take } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import moment from 'moment';
import _ from 'lodash';
import * as generateActionType from '../../../actions/appointment/generateTimeSlot';
import Enum from '../../../../enums/enum';
import * as messageType from '../../../actions/message/messageActionType';
import storeConfig from '../../../storeConfig';
import * as AppointmentUtil from '../../../../utilities/appointmentUtilities';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../../als/alsLogSaga';

async function getTempList(params) {
    let { data } = await maskAxios.get('/ana/timeSlotTemplates', {
        params: params
    });
    if (data.respCode !== 0) {
        storeConfig.store.dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
    return data;
}

function* initPage() {
    while (true) {
        try{
            yield take(generateActionType.INIT_PAGE);
            yield put(alsStartTrans());

            yield put({ type: generateActionType.RESET_ALL });
            const clinic = yield select(state => state.login.clinic);
            let params = {
                svcCd: clinic.svcCd,
                siteId: clinic.siteId
            };
            let data = yield call(getTempList, params);
            if (data.respCode === 0) {
                if (data.data && data.data.length > 0) {
                    data.data.forEach(item => {
                        item.tmsltTmplList = AppointmentUtil.mapTmsltTmpToStore(item.tmsltTmplList);
                    });
                    let defaultTmpslt = data.data[0];
                    yield put({
                        type: generateActionType.UPDATE_STATE, updateData: {
                            selectedTempDto: _.cloneDeep(defaultTmpslt)
                        }
                    });
                }
                yield put({ type: generateActionType.PUT_TEMPLATE_DATA, data: data.data });
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

function* fetchGenerateTimeSlot(action) {
    let { data } = yield call(maskAxios.post, '/ana/generateTimeSlot', action.params);
    if (data.respCode === 0) {
        let msg = '';
        if (data.data.timeRangOverlaps && data.data.timeRangOverlaps.length > 0) {
            msg += 'The following timeslot(s) is overlapped: <br />';
            data.data.timeRangOverlaps.forEach(item => {
                msg += `<b>${moment(item.date || null).format(Enum.DATE_FORMAT_EDMY_VALUE)}</b>&nbsp;&nbsp;&nbsp;Start Time: <b>${item.stime}</b>&nbsp;&nbsp;&nbsp;End Time: <b>${item.etime}</b><br />`;
            });
        }
        if (data.data.totalSuccessNum === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110805',
                    showSnackbar: true
                }
            });
        } else {
            if (data.data.timeRangOverlaps && data.data.timeRangOverlaps.length > 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110806',
                        params: [
                            { name: 'PARAGRAPH', value: msg },
                            { name: 'NUMBER', value: data.data.totalSuccessNum }
                        ]
                    }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110807',
                        params: [
                            { name: 'NUMBER', value: data.data.totalSuccessNum }
                        ],
                        showSnackbar: true
                    }
                });
            }
        }
    } else if (data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110801'
            }
        });
    } else if (data.respCode === 102) {
        let msg = `Start time: <b>${data.data.tmpStartTime}</b>&nbsp;&nbsp;&nbsp;End time: <b>${data.data.tmpEndTime}</b>`;
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110802',
                params: [{ name: 'PARAGRAPH', value: msg }]
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

function* generateTimeSlot() {
    yield alsTakeLatest(generateActionType.GENERATE_TIMESLOT, fetchGenerateTimeSlot);
}

function* updateTemplateList() {
    while (true) {
        try{
            yield take(generateActionType.UPDATE_TEMPLATELIST);
            yield put(alsStartTrans());

            const clinic = yield select(state => state.login.clinic);
            let params = {
                svcCd: clinic.svcCd,
                siteId: clinic.siteId
            };
            let data = yield call(getTempList, params);
            if (data.respCode === 0) {
                if (data.data && data.data.length > 0) {
                    data.data.forEach(item => {
                        item.tmsltTmplList = AppointmentUtil.mapTmsltTmpToStore(item.tmsltTmplList);
                    });
                    const selected = yield select(state => state.generateTimeSlot.selectedTempDto);
                    if (selected) {
                        const selectedDto = data.data.find(item => item.tmsltTmplProfileId === selected.tmsltTmplProfileId);
                        yield put({
                            type: generateActionType.UPDATE_STATE, updateData: {
                                selectedTempDto: _.cloneDeep(selectedDto)
                            }
                        });
                    }
                }
                yield put({ type: generateActionType.PUT_TEMPLATE_DATA, data: data.data });
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

export const generateTimeSlotSaga = [
    initPage,
    generateTimeSlot,
    updateTemplateList
];