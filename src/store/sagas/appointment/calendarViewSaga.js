import { take, all, call, put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as calendarViewActionType from '../../actions/appointment/calendarView/calendarViewActionType';
import * as messageType from '../../actions/message/messageActionType';
import * as commonType from '../../actions/common/commonActionType';
import _ from 'lodash';
import {alsStartTrans, alsEndTrans} from '../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../als/alsLogSaga';
import { EnctrAndRmUtil, AppointmentUtil, CommonUtil } from '../../../utilities';
import { mapEncounterTypeListNewApi } from '../../../utilities/apiMappers';

function serialize(url, obj) {
    let str = [];
    for (let p in obj)
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    str = str.join('&');
    return url + '?' + str;
}

function* requestDataImpl(action) {
    // while (true) {
        // try{
            // let { dataType, params, fileData } = yield take(calendarViewActionType.REQUEST_DATA);
            let { dataType, params, fileData } = action;
            // yield put(alsStartTrans());

            let index = fileData.index ?? '';
            fileData = {};
            //do not update fileData repeatly
            // fileData = fileData || {};
            switch (dataType) {
                case 'clinicList':
                    {
                        let { data } = yield call(maskAxios.post, '/common/listClinic', params);
                        if (data.respCode === 0) {
                            fileData['clinicListData'] = data.data;
                            yield put({ type: calendarViewActionType.FILLING_DATA, fillingData: fileData });
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                case 'calendarData':
                    {
                        let { data } = yield call(maskAxios.post, '/appointment/searchTimeSlotForCalendar', params);
                        if (data.respCode === 0) {
                            fileData['calendarData'] = data.data;
                            yield put({ type: calendarViewActionType.FILLING_DATA, fillingData: fileData });
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                case 'calendarMonthData':
                    {
                        let url = serialize('ana/Calendar/month', params);
                        let { data } = yield call(maskAxios.get, url);
                        if (data.respCode === 0) {
                            fileData['calendarMonthData'] = data.data;
                            yield put({ type: calendarViewActionType.FILLING_DATA, fillingData: fileData });
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                case 'calendarWeekData':
                    {
                        let url = serialize('ana/Calendar/week', params);
                        let { data } = yield call(maskAxios.get, url);
                        if (data.respCode === 0) {
                            fileData['calendarWeekData'] = data.data;
                            yield put({ type: calendarViewActionType.FILLING_DATA, fillingData: fileData });
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                case 'calendarDayData':
                    {

                        let url = serialize('ana/Calendar/day', params);
                        let { data } = yield call(maskAxios.get, url);
                        if (data.respCode === 0) {
                            // if (index === 2)
                            //     fileData = {};
                            // else
                            //     delete fileData['index'];
                            fileData[`calendarDayData${index}`] = data.data;

                            yield put({ type: calendarViewActionType.FILLING_DATA, fillingData: fileData });
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                default:
                    break;
            }

        // }finally{
        //     yield put(alsEndTrans());
        // }
    // }
}

function* requestData() {
    yield alsTakeLatest(calendarViewActionType.REQUEST_DATA, requestDataImpl);
}

function* updateField() {
    while (true) {
        try{
            let { updateData } = yield take(calendarViewActionType.UPDATE_FIELD);
            yield put(alsStartTrans());

            if (updateData.clinicValue) {
                const encounterTypeList = yield select(state => state.common.encounterTypeList);
                const siteId = CommonUtil.getSiteIdBySiteCd(updateData.clinicValue);
                const filterEncounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, encounterTypeList);
                if (updateData.encounterTypeValue) {
                    let keyAndValue = {};
                    let fillingData = {};
                    fillingData.encounterTypeListData = _.cloneDeep(filterEncounterTypeList);
                    let selectEncounterTypes = filterEncounterTypeList.filter((item) => { return item.encounterTypeCd === updateData.encounterTypeValue; });
                    if (selectEncounterTypes.length > 0) {
                        fillingData.encounterTypeValue = updateData.encounterTypeValue;
                        fillingData.selectEncounterType = { ...selectEncounterTypes[0] };
                        fillingData.subEncounterTypeListData = selectEncounterTypes[0].subEncounterTypeList.map(item => { keyAndValue[item.subEncounterTypeCd] = item; return item; });
                        fillingData.subEncounterTypeListKeyAndValue = keyAndValue;
                        fillingData.subEncounterTypeValue = [];
                    }
                    yield put({ type: calendarViewActionType.FILLING_DATA, fillingData: fillingData });
                } else {
                    yield put({ type: calendarViewActionType.FILLING_DATA, fillingData: { encounterTypeListData: _.cloneDeep(filterEncounterTypeList) } });
                }
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* fetchApptListReport(action) {
    let { params } = action;
    let url = '/ana/roomAppointmentListReport?';
    for (let p in params) {
        url += `${p}=${params[p]}&`;
    }
    url = url.substring(0, url.length - 1);
    let { data } = yield call(maskAxios.get, url);
    if (data.respCode === 0) {
        yield put({
            type: calendarViewActionType.PUT_APP_LIST_REPORT_DATA,
            reportData: data.data
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

function* roomAppointmentList() {
    yield alsTakeLatest(calendarViewActionType.OPEN_PREVIEW_WINDOW, fetchApptListReport);
}

function* getRoomUtilization() {
    yield alsTakeEvery(calendarViewActionType.GET_ROOM_UTILIZATION, function* (action) {
        let { siteId, slotDate } = action;
        let { data } = yield call(maskAxios.get, '/ana/timeslotOverview', { params: { siteId, slotDate } });
        if (data.respCode === 0) {
            yield put({ type: calendarViewActionType.UPDATE_FIELD, updateData: { roomUtilizationData: AppointmentUtil.processRoomUtilizationData(data.data) } });
        }
    });
}

function* getFilterListsImpl(action) {
    const [clinics, encounterTypes, sessions] = yield all([
        call(maskAxios.get, '/cmn/services/' + action.svcCd + '/sites'),
        call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + action.svcCd + '&withRooms=Y'),
        call(maskAxios.get, '/cmn/services/' + action.svcCd + '/sessions')
    ]);

    let clinicList, encounterTypeList, sessionList;

    const clinicsData = clinics.data;
    if (clinicsData && clinicsData.respCode === 0) {
        clinicList = clinicsData.data;
    }

    const encounterTypesData = encounterTypes.data;
    if (encounterTypesData && encounterTypesData.respCode === 0) {
        encounterTypeList = mapEncounterTypeListNewApi(encounterTypesData.data, action.svcCd, null, clinicList);
    }

    const sessionsData = sessions.data;
    if (sessionsData && sessionsData.respCode === 0) {
        sessionList = sessionsData.data;
    }

    if (clinicList && encounterTypeList && sessionList) {
        yield put({
            type: calendarViewActionType.PUT_FILTER_LISTS,
            data: {
                clinicList,
                encounterTypeList,
                sessionList
            }
        });
    }
    else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: 'Get Calendar Filter Lists Failed.',
            data: {
                clinicList,
                encounterTypeList,
                sessionList
            }
        });
    }
}

function* getFilterLists() {
    yield alsTakeLatest(calendarViewActionType.GET_FILTER_LISTS, getFilterListsImpl);
}

export const calendarViewSaga = [
    requestData,
    updateField,
    roomAppointmentList,
    getRoomUtilization,
    getFilterLists
];
