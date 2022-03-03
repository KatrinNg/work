import { call, put, select, takeEvery } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as redistributionType from '../../actions/appointment/redistribution/redistributionAction';
import { openCommonMessage } from '../../actions/message/messageAction';
import * as AppointmentUtil from '../../../utilities/appointmentUtilities';
import moment from 'moment';
import Enum from '../../../enums/enum';
import _ from 'lodash';
import { getPatientSummary } from '../../../utilities/redistributionUtilities';
import { getState, dispatch } from '../../util';
import {alsStartTrans, alsEndTrans} from '../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../als/alsLogSaga';
import * as apptService from '../../../services/ana/appointmentService';

function* getRoomUtilization() {
    yield alsTakeEvery(redistributionType.GET_ROOM_UTILIZATION, function* (action) {
        let { siteId, slotDate } = action;
        let { data } = yield call(maskAxios.get, '/ana/timeslotOverview', { params: { siteId, slotDate } });
        if (data.respCode === 0) {
            yield put({ type: redistributionType.UPDATE_STATE, updateData: { roomUtilizationData: AppointmentUtil.processRoomUtilizationData(data.data) } });
        }
    });
}

function processData(data, sessionIds, role) {
    let result = [];
    if (data && data.length > 0) {
        data.forEach(item => {
            if (!item.byDate[0].slots || item.byDate[0].slots.length < 1) {
                result.push({ isNoSlot: true, appts: [] });
            } else {
                if (item.byDate[0].slots[0].isWhl) {
                    result.push({ ...item.byDate[0].slots[0], stime: '', etime: '' });
                } else {
                    let selectedSlots = item.byDate[0].slots.filter(item => sessionIds.indexOf(item.sessId) >= 0);
                    selectedSlots.forEach(slot => {
                        let date = item.byDate[0].date;
                        let datetime = moment(date + ' ' + slot.stime, Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                        let _slot = { ...slot };
                        let appts = _slot.appts;
                        for (let i = 0; i < appts.length; i++) {
                            if (_.toUpper(role) === 'TO') {
                                appts[i]['noMove'] = true;
                            }
                            appts[i]['date'] = item.byDate[0].date;
                        }
                        result.push({
                            ..._slot,
                            date: item.byDate[0].date,
                            datetime: datetime
                        });
                    });
                }
            }
        });
    }
    if (result.length === 0) {
        result.push({ isNoSlot: true, appts: [] });
    }
    return result;
}

function* searchApptDetails() {
    yield alsTakeEvery(redistributionType.SEARCH_APPT_DETAILS, function* (action) {
        let svcCd = yield select(state => state.login.service.svcCd);
        let siteId = yield select(state => state.login.clinic.siteId);
        let { criteria, role } = action;
        let { room, session, date } = criteria;
        let { data } = yield call(maskAxios.get, '/ana/Calendar/day', {
            params: {
                viewType: 'D',
                svcCd: svcCd,
                siteId: siteId,
                roomIds: room,
                date: moment(date).format(Enum.DATE_FORMAT_EYMD_VALUE)
            }
        });
        if (data.respCode === 0) {
            let filterData = processData(data.data, [session], role);
            if (_.toUpper(role) === 'FROM') {
                yield put(redistributionType.updateState({
                    fromOriginalData: _.cloneDeep(filterData),
                    fromTargetData: _.cloneDeep(filterData),
                    fromSearchCriteria: _.cloneDeep(criteria),
                    fromSelected: []
                }));
            } else if (_.toUpper(role) === 'TO') {
                yield put(redistributionType.updateState({
                    toOriginalData: _.cloneDeep(filterData),
                    toTargetData: _.cloneDeep(filterData),
                    toSearchCriteria: _.cloneDeep(criteria),
                    toSelected: []
                }));
            }
        }
    });
}

function* confirmRedistribution() {
    yield alsTakeEvery(redistributionType.CONFIRM_REDISTRIBUTION, function* (action) {
        let { params } = action;
        let { data } = yield call(maskAxios.put, '/ana/appointments/redistribution', params);
        if (data.respCode === 0) {
            let failures = data.data.apptRedistributionFailureVoList;
            const refreshApptDetails = () => {
                let fromCriteria = getState(state => state.redistribution.fromSearchCriteria);
                let toCriteria = getState(state => state.redistribution.toSearchCriteria);
                dispatch(redistributionType.searchApptDetails({
                    criteria: fromCriteria,
                    role: 'from'
                }));
                dispatch(redistributionType.searchApptDetails({
                    criteria: toCriteria,
                    role: 'to'
                }));
            };
            if (failures && failures.length > 0) {
                let fromOriginalData = yield select(state => state.redistribution.fromOriginalData);
                let toTargetData = yield select(state => state.redistribution.toTargetData);
                let failureList = [];
                failures.forEach(x => {
                    let originalAppts = _.flatten((fromOriginalData || []).map(i => i.appts)).filter(i => i.apptId === x.appointmentId);
                    let moveToAppts = _.flatten((toTargetData || []).map(i => i.appts)).filter(i => i.apptId === x.appointmentId);
                    if(originalAppts.length > 0 && moveToAppts.length > 0) {
                        let firstAppt = originalAppts[0];
                        let originalAppt = `${originalAppts[0].date} ${originalAppts[0].stime} - ${originalAppts[originalAppts.length - 1].etime}`;
                        let apptMoveTo = `${moveToAppts[0].date} ${moveToAppts[0].stime} - ${moveToAppts[moveToAppts.length - 1].etime}`;
                        failureList.push({
                            patientInfo: getPatientSummary(firstAppt),
                            originalAppt: originalAppt,
                            apptMoveTo: apptMoveTo,
                            failureReason: x.failureReason
                        });
                    }
                });
                yield put(redistributionType.updateState({
                    redistributionFailure: {
                        open: true,
                        failureList: failureList,
                        callback: refreshApptDetails
                    }
                }));
            } else {
                const doCloseCallBack = yield select(state => state.redistribution.doCloseCallBack);
                if (doCloseCallBack) {
                    doCloseCallBack(true);
                } else {
                    refreshApptDetails();
                }
                yield put(openCommonMessage({ msgCode: '111501', showSnackbar: true }));
            }
        }else if(data.respCode === 153) {
            apptService.handleOperationFailed(data.respCode,data);
        }
    });
}

export const redistributionSaga = [
    getRoomUtilization,
    searchApptDetails,
    confirmRedistribution
];
