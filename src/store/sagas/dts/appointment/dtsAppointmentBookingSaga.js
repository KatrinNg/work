import { take, call, put, select, takeLatest } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import moment from 'moment';
import * as messageType from '../../../actions/message/messageActionType';
// import * as commonType from '../../../actions/common/commonActionType';
import * as bookingActionType from '../../../actions/dts/appointment/bookingActionType';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as apptService from '../../../../services/ana/appointmentService';
import * as dentalService from '../../../../services/dts/dentalService';
import * as bookingAction from '../../../actions/dts/appointment/bookingAction';
import { openCommonMessage } from '../../../actions/message/messageAction';
import { updateState } from '../../../actions/patient/patientAction';
import { GD_SPECIALTY_CODE } from '../../../../constants/dts/patient/DtsDefaultRoomConstant';
import * as bookingEnum from '../../../../enums/dts/appointment/bookingEnum';

import _ from 'lodash';

function* updatePatientAppointment(patientKey) {
    yield put({
        type: bookingActionType.GET_PATIENT_APPOINTMENT,
        params: {
            patientKey: patientKey,
            appointmentDateFrom: dtsUtilities.formatDateParameter(moment().subtract(5, 'years').set('hour', 0).set('minute', 0)),
            appointmentDateTo: dtsUtilities.formatDateParameter(moment().add(5, 'years').set('hour', 23).set('minute', 59))
        }
    });
}

function* getAvailableCalendarTimeSlot() {
    while (true) {
        let { params,callback } = yield take(bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT);

        // console.log('bookingSaga.js > getAvailableCalendarTimeSlot() > '+JSON.stringify(params));
        let { data } = yield call(dentalService.getAvailableCalendarTmslt, params, true);

        if (data.respCode === 0) {
            let calendarDataGroupList = data.data.calendarDataGroupList;
            yield put({ type: bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT_SAGA, calendarDataGroupList: calendarDataGroupList});
            if(callback){
                callback();
            }
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

function* getAvailableCalendarTimeSlotForExpress() {
    while (true) {
        let { params,callback } = yield take(bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT_EXPRESS);

        // console.log('bookingSaga.js > getAvailableCalendarTimeSlotForExpress() > '+JSON.stringify(params));
        let { data } = yield call(dentalService.getAvailableCalendarTmsltForExpress, params, true);

        if (data.respCode === 0) {
            let calendarDataGroupList = data.data.calendarDataGroupList;
            yield put({ type: bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT_EXPRESS_SAGA, calendarDataGroupList: calendarDataGroupList});
            if(callback){
                callback();
            }
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

function* getAvailableCalendarDetail() {
    while (true) {
        let { params, maskMode } = yield take(bookingActionType.GET_CALENDAR_DETAIL_MTH);
        // console.log('bookingSaga.js > getAvailableCalendarDetail() > '+JSON.stringify(params));
        let { data } = yield call(dentalService.getAvailableCalendarTmslt, params, maskMode);

        if (data.respCode === 0) {
            let calendarDetailMth = data.data.calendarDataGroupList[0];
            yield put({ type: bookingActionType.SET_CALENDAR_DETAIL_MTH, params: calendarDetailMth });
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

function* getPatientAppointment() {
    while (true) {
        let { params, callback, callbackExtraParms } = yield take(bookingActionType.GET_PATIENT_APPOINTMENT);

        //console.log('dtsAppointmentBookingSaga.js > getPatientAppointment() > ' + JSON.stringify(params));
        // let { data } = yield call(maskAxios.post, '/dental/mockSearchAppointment', {
        // let { data } = yield call(maskAxios.get,
        //     '/ana/appointments'
        //     ,{
        //         params:{
        //             svcCd:params.svcCd,
        //             patientKey:params.patientKey,
        //             startDate:params.startDate,
        //             endDate:params.endDate,
        //             allService:params.allService
        //         }
        //     }
        // );
        let { data } = yield call(dentalService.getAppointmentByPatient, params);
        if (data.respCode === 0) {
            let patientAppointmentList = data.data;
            yield put({ type: bookingActionType.GET_PATIENT_APPOINTMENT_SAGA, patientAppointmentList: patientAppointmentList });
            callback && callback(data.data, callbackExtraParms);
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

function* getDailyView() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_DAILY_VIEW);
        // console.log('dtsAppointmentBookingSaga.js > getDailyView() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-ana/clinicSurgery/'+params.rmId+'/dailyView/' + dtsUtilities.formatDateParameter(params.date));
        if (data.respCode === 0){
            let dailyView = data.data;
            yield put({type: bookingActionType.GET_DAILY_VIEW_SAGA, dailyView: dailyView });
        }else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getMultipleDailyViewForExpress() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.GET_MULTIPLE_DAILY_VIEW_FOR_EXPRESS);
        //console.log('dtsAppointmentBookingSaga.js > getMultipleDailyViewForExpress() > ' + JSON.stringify(params));

        let { data } = yield call(dentalService.getMultipleDailyViewForExpress, params, true);
        if (data.respCode === 0) {
            let dailyViewList = data.data;
            yield put({type: bookingActionType.GET_MULTIPLE_DAILY_VIEW_FOR_EXPRESS_SAGA, params:dailyViewList});

            if(callback){
                if(Array.isArray(callback)){
                    callback.forEach(item => item());
                } else callback();
            }
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

function* fetchRoomList(action) {
    // while (true) {
        // let { params, callback } = yield takeLatest(bookingActionType.GET_ROOM_LIST);
        let { params, callback } = action;

        // console.log('dtsAppointmentBookingSaga.js > getRoomList() > '+JSON.stringify(params)+ 'callback = '+(callback != null));

        let { data } = yield call(maskAxios.get, '/cmn/sites/' + params.siteId + '/rooms');
        if (data.respCode === 0) {
            let roomList = data.data;
            yield put({ type: bookingActionType.GET_ROOM_LIST_SAGA, roomList: roomList });

            if(callback){
                callback(roomList);
            }
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    // }
}

function* getRoomList() {
    yield takeLatest(bookingActionType.GET_ROOM_LIST, fetchRoomList);
}

function* getEncounterTypeList() {
    while (true) {
        let {params, callback, searchFor} = yield take(bookingActionType.GET_ENCOUNTER_TYPE_LIST);
        let inputParams = params;

        // let { data } = yield call(maskAxios.post, '/dental/mockEncounterTypeList', {roomCd:params.roomCd });
        // let { data } = yield call(maskAxios.get, '/cmn/rooms/'+params.rmId+'/encounterTypes');
        let { data } = yield call(dentalService.getEncounterTypeList, {
            params: {
                roomIdList: inputParams.roomIdList == null || inputParams.roomIdList.includes('*All') ? null : _.join(inputParams.roomIdList, ','),
                clinicId: inputParams.clinicId
            }
        });

        if (data.respCode === 0) {
            let encounterTypeList = data.data;
            yield put({ type: bookingActionType.GET_ENCOUNTER_TYPE_LIST_SAGA, params: {encounterTypeList: encounterTypeList, searchFor: searchFor}});

            if(callback){
                callback(encounterTypeList);
            }
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

function* getSessionList() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_SESSION_LIST);
        //console.log('dtsAppointmentBookingSaga.js > mockAvailableSessionList() > ' + JSON.stringify(params));

        // let { data } = yield call(maskAxios.post, '/dental/mockAvailableSessionList', {rmId:params.selectedRoomId, enquiryDate:params.selectedDate});
        let { data } = yield call(maskAxios.get, '/cmn/sites/' + params.siteId + '/sessions');
        if (data.respCode === 0) {
            let sessionList = data.data;
            yield put({ type: bookingActionType.GET_SESSION_LIST_SAGA, sessionList: sessionList });
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

function* getDailyNote() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_DAILY_NOTE);
        console.log('dtsAppointmentBookingSaga.js > getDailyNote() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-ana/clinicSurgery/dailyNote', {
            params: {
                clinicRoomId: params.clinicRoomId,
                appointmentDate: dtsUtilities.formatDateParameter(params.appointmentDate)
            }
        });
        if (data.respCode === 0) {
            let dailyNote = data.data;
            yield put({ type: bookingActionType.GET_DAILY_NOTE_SAGA, dailyNote: dailyNote });
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
function* getAvailableTimeSlot() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.GET_AVAILABLE_TIME_SLOT_LIST);

        console.log('bookingSaga.js > getAvailableTimeSlot() > ' + JSON.stringify(params));
        //console.log('timeSlotSage DateFrom: ' + params.dateFrom);

        let { data } = yield call(dentalService.getAvailableDateByEncounter, params, true);

        if (data.respCode === 0) {
            let availableTimeSlotList = data.data;
            params.date = dtsUtilities.formatDateParameter(params.dateFrom);
            //console.log('avilbleTimeSlotList: ' + JSON.stringify(availableTimeSlotList));

            yield put({ type: bookingActionType.GET_AVAILABLE_TIME_SLOT_LIST_SAGA, availableTimeSlotList: availableTimeSlotList});

            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
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

function* insertAppointment() {
    while (true) {
        let action = yield take(bookingActionType.INSERT_APPOINTMENT);
        let { params, callback } = action;
        // console.log('dtsAppointmentBookingSaga.js > insertAppointment() > '+JSON.stringify(params));

        let { data } = yield call(dentalService.confirmAppointmentList, params, true);
console.log('[Insert Appointment] returned message, data = ' + JSON.stringify(data));
        if (data.respCode === 0) {
            let outputGroupVo = data.data;
            let outputVoList = {appointmentList: outputGroupVo.outputVoList};

            // update insert result
            yield put({ type: bookingActionType.INSERT_APPOINTMENT_SAGA, appointmentList: outputVoList });

            yield put(bookingAction.setAppointmentMessageObj({...outputGroupVo, confirmAction: {...action, params: {...params, byPassWarning: true}}}));

            if (outputGroupVo.messageLevel !== bookingEnum.BookingMessageLevelError &&
                outputGroupVo.messageLevel !== bookingEnum.BookingMessageLevelConfirm) {
                if(Array.isArray(callback)){
                    callback.forEach(item => item && item());
                } else callback && callback();
            }
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

function* insertUrgentAppointment() {
    while (true) {
        let action = yield take(bookingActionType.INSERT_URGENT_APPOINTMENT);
        let { params, callback } = action;

        let { data } = yield call(dentalService.insertUrgentAppointment, params, true);
console.log('[Insert Urgent Appointment] returned message, data = ' + JSON.stringify(data));
        if (data.respCode === 0) {
            // update appointment history
            // yield updatePatientAppointment(params.patientKey);
            const outputVo = data.data;
            const appointmentMessageObj = {
                messageLevel: outputVo?.messageVo?.messageLevel,
                outputVoList: [outputVo],
                confirmAction: {...action, params: {...params, byPassWarning: true}}
            };
            yield put(bookingAction.setAppointmentMessageObj(appointmentMessageObj));

            if (outputVo?.messageVo?.messageLevel !== bookingEnum.BookingMessageLevelError && outputVo?.messageVo?.messageLevel !== bookingEnum.BookingMessageLevelConfirm) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item && item());
                } else callback && callback();
            }
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

function* insertUrgentAppointmentForGp() {
    while (true) {
        let action = yield take(bookingActionType.INSERT_GP_URGENT_APPOINTMENT);
        let { params, callback } = action;
        let { data } = yield call(dentalService.insertUrgentAppointmentForGp, params, true);
console.log('[Insert GP Urgent Appointment] returned message, data = ' + JSON.stringify(data));
        if (data.respCode === 0) {
            // update appointment history
            // yield updatePatientAppointment(params.patientKey);
            const outputVo = data.data;
            const appointmentMessageObj = {
                messageLevel: outputVo?.messageVo?.messageLevel,
                outputVoList: [outputVo],
                confirmAction: {...action, params: {...params, byPassWarning: true}}
            };
            yield put(bookingAction.setAppointmentMessageObj(appointmentMessageObj));

            if (outputVo?.messageVo?.messageLevel !== bookingEnum.BookingMessageLevelError && outputVo?.messageVo?.messageLevel !== bookingEnum.BookingMessageLevelConfirm) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item && item());
                } else callback && callback();
            }
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

function* rescheduleAppointment() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.RESCHEDULE_APPOINTMENT);

        let { data } = yield call(dentalService.rescheduleAppointment, params, true);
        if (data.respCode === 0) {
            let lastApptDate = params.apptDate;
            let lastRoomId = params.rmId;
            let appointmentList = { appointmentList: data.data };

            // update insert result
            yield put({ type: bookingActionType.INSERT_APPOINTMENT_SAGA, appointmentList: appointmentList });

            // update day view info
            yield put({ type: bookingActionType.GET_DAILY_VIEW, params: { rmId: lastRoomId, date: lastApptDate } });

            // update appointment history
            yield updatePatientAppointment(params.patientKey);

            // update available calendar list
            // update available calendar detail
            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
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

function* updateDailyNote() {
    while (true) {
        let { params } = yield take(bookingActionType.UPDATE_DAILY_NOTE);
        //

        console.log('dtsAppointmentBookingSaga.js > updateDailyNote() > ' + JSON.stringify(params));

        // let data = {respCode:1};
        let { data } = yield call(maskAxios.put, '/dts-ana/clinicSurgery/dailyNote', params);
        if (data.respCode === 0) {
            yield put({ type: bookingActionType.GET_DAILY_NOTE, params });
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '140001'
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

function* getUrgentRoomList() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_URGENT_ROOM_LIST);

        console.log('dtsAppointmentBookingSaga.js > getUrgentRoomList() > ' + JSON.stringify(params));
        // let { data } = yield call(maskAxios.get, '/dts-ana/appointments/' + params.clinicId + '/urgentRoomList', {
        //     params: { 'fakeCurrentTime, for debug purpose only': params.fakeCurrentTime }
        // });
        let { data } = yield call(dentalService.getUrgentRoomList, params, true);
        if (data.respCode === 0) {
            let urgentRoomList = data.data.urgentAppointmentRoomVoList;
            yield put({ type: bookingActionType.GET_URGENT_ROOM_LIST_SAGA, urgentRoomList: urgentRoomList });
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

function* getUrgentRoomListForGp() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_GP_URGENT_ROOM_LIST);

        console.log('dtsAppointmentBookingSaga.js > getUrgentRoomListForGp() > ' + JSON.stringify(params));
        let { data } = yield call(dentalService.getUrgentRoomListForGp, params, true);
        if (data.respCode === 0) {
            let urgentRoomListForGp = data.data;
            yield put({ type: bookingActionType.GET_GP_URGENT_ROOM_LIST_SAGA, urgentRoomListForGp: urgentRoomListForGp });
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

function* reassignUrgentAppointment() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.REASSIGN_URGENT_APPOINTMENT);

        let { data } = yield call(dentalService.reassignUrgentAppointment, params, true);
        if (data.respCode === 0) {
            // update appointment history
            // yield updatePatientAppointment(params.patientKey);

            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
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

function* reassignUrgentAppointmentForGp() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.REASSIGN_GP_URGENT_APPOINTMENT);

        let { data } = yield call(dentalService.reassignUrgentAppointmentForGp, params, true);
        if (data.respCode === 0) {
            // update appointment history
            // yield updatePatientAppointment(params.patientKey);

            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
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

function* getUnavailableReasons() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_UNAVAILABLE_REASONS);
        // console.log('dtsAppointmentBookingSaga.js > mockRoomList() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/ana/unavailableReasons');
        // let { data } = yield call(maskAxios.post, '/dental/mockRoomList', {clinicCd:params.clinicCd});
        if (data.respCode === 0) {
            let unavailableReasons = { unavailableReasons: data.data };
            yield put({ type: bookingActionType.GET_UNAVAILABLE_REASONS_SAGA, unavailableReasons: unavailableReasons });
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

function* insertUnavailableTimeslot() {
    while (true) {
        let { params, noApiParams, callback } = yield take(bookingActionType.INSERT_UNAVAILABLE_TIMESLOT);

        let { data } = yield call(maskAxios.post, '/ana/unavailablePeriods', params);

        if (data.respCode === 0) {
            callback && callback();
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110503'
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

function* deleteUnavailablePeriod() {
    while (true) {
        let { params } = yield take(bookingActionType.DELETE_UNAVAILABLE_PERIOD);
        //console.log('dtsAppointmentBookingSaga.js > deleteUnavailablePeriod() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.delete, '/ana/unavailablePeriods/' + params.unavailPerdId);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110602',
                    showSnackbar: true
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

function* deleteAppointment() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.DELETE_APPOINTMENT);

        const specialties = yield select(state => state.dtsPreloadData.allSpecialties);
        const GD = specialties.find(specialty => specialty.sspecCd === GD_SPECIALTY_CODE);

        // console.log('[saga] deleteAppointment: ', params, listParams);
        let url = '/dts-ana/appointments?gdSspecCd=' + GD.sspecId;
        let { data } = yield call(maskAxios.delete, url, { data: params });
        if (data.respCode === 0) {
            //yield put({ type: bookingActionType.BOOK_AND_ATTEND_SUCCEESS });
            let result = data.data;
            if (result.defaultRoomVo && result.defaultRoomVo.defaultRoomUpdated) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '140013'
                    }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111213',
                        showSnackbar: true
                    }
                });
            }

            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
        } else if (data.respCode === 1) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111006'
                }
            });
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111218'
                }
            });
        } else if (data.respCode === 102) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111219'
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111205'
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

function* saveToReserveList() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.SAVE_TO_RESERVE_LIST);
        let { reserveListId, ...reserve } = params.reserve;
        let { data } = yield reserveListId ? call(maskAxios.put, '/dts-ana/reserve/' + reserveListId, reserve) : call(maskAxios.post, '/dts-ana/reserve', reserve);
        if (data.respCode === 0) {
            yield put({ type: bookingActionType.RESERVE_LIST_UPDATED });

            const rmId = yield select(state=>state.dtsAppointmentBooking.pageLevelState.selectedRoom?.rmId);
            const date = yield select(state=>state.dtsAppointmentBooking.pageLevelState.calendarDetailDate);
            if (rmId && date) {
                yield put({ type: bookingActionType.GET_DAILY_VIEW, params: { rmId, date: moment(date).format('YYYY-MM-DD') } });
            }
            const patientKey = yield select(state => state.patient?.patientInfo?.patientKey);
            if (patientKey) {
                yield updatePatientAppointment(patientKey);
            }
            callback();
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '140001'
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

function* getBookingAlert() {
    while (true) {
        let { params, callback, maskMode } = yield take(bookingActionType.GET_BOOKING_ALERT);

        // console.log('dtsAppointmentBookingSaga.js > getBookingAlert() > '+JSON.stringify(params));
        let { data } = yield call(dentalService.getBookingAlert, params, maskMode);

        if (data.respCode === 0) {
            let bookingAlert = { bookingAlert: data.data };
            yield put({ type: bookingActionType.GET_BOOKING_ALERT_SAGA, bookingAlert: bookingAlert });

            callback && callback(data.data);
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

function* removeFromReserveList() {
    while (true) {
        let { params } = yield take(bookingActionType.REMOVE_FROM_RESERVE_LIST);

        let { data } = yield call(maskAxios.delete, '/dts-ana/reserve/' + params.reserve.reserveListId);
        if (data.respCode === 0) {
            yield put({ type: bookingActionType.RESERVE_LIST_UPDATED });

            const rmId = yield select(state=>state.dtsAppointmentBooking.pageLevelState.selectedRoom?.rmId);
            const date = yield select(state=>state.dtsAppointmentBooking.pageLevelState.calendarDetailDate);
            if (rmId && date) {
                yield put({ type: bookingActionType.GET_DAILY_VIEW, params: { rmId, date: moment(date).format('YYYY-MM-DD') } });
            }
            const patientKey = yield select(state => state.patient?.patientInfo?.patientKey);
            if (patientKey) {
                yield updatePatientAppointment(patientKey);
            }
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

function* updateAppointment() {
    while (true) {
        let { params, callback, maskMode } = yield take(bookingActionType.UPDATE_APPOINTMENT);
        let { data } = yield call(dentalService.updateAppointment, params, maskMode);
        if (data.respCode === 0) {
            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
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

function* getPmiAppointmentLabel() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.GET_APPOINTMENT_LABEL);
        //console.log("====================== getPmiAppointmentLabel param ======================");
        //console.log(params);

        let appointmentLabelData = {
            appointmentDate: params.appointmentDate || '',
            appointmentTime: params.appointmentTime || '',
            encntrTypeDesc: params.encntrTypeDesc || '',
            rmCd: params.rmCd || '',
            engSurname: params.engSurname || '',
            engGivename: params.engGivename || '',
            otherDocNo: params.otherDocNo || ''
        };
        console.log('getPmiAppointmentLabel:' + appointmentLabelData);
        let { data } = yield call(dentalService.getPmiAppointmentLabel, appointmentLabelData, true);
        //console.log(data);
        if (data.respCode === 0) {
            appointmentLabelData = data.data;
            yield put({
                type: bookingActionType.GET_APPOINTMENT_LABEL_SAGA,
                appointmentLabelData: appointmentLabelData
            });
            if (callback) {
                if (Array.isArray(callback)) {
                    callback.forEach(item => item());
                } else callback();
            }
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

function* getAppointmentLog() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_APPOINTMENT_LOG);
        let { data } = yield call(dentalService.getAppointmentLog, params, true);
        if (data.respCode === 0) {
            yield put(bookingAction.setAppointmentLog(data.data));
        } else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

function* getTimeslotLog() {
    while (true) {
        let { params } = yield take(bookingActionType.GET_TIMESLOT_LOG);
        let { data } = yield call(dentalService.getTimeslotLog, params, true);
        if (data.respCode === 0) {
            yield put(bookingAction.setTimeslotLog(data.data));
        } else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

function* getServeRoom(){
    while(true){
        let { params, callback } = yield take(bookingActionType.GET_SERVE_ROOM);

        let { data } = yield call(dentalService.getServeRoom, params);
        if (data.respCode === 0){
            let serveRoom = { serveRoom: data.data };
            yield put({type: bookingActionType.GET_SERVE_ROOM_SAGA, serveRoom: serveRoom });
            callback && callback(data.data);
        }else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getDisciplines(){
    while(true){
        let { params } = yield take(bookingActionType.GET_DISCIPLINES);
        let { data } = yield call(dentalService.getDisciplines, params);
        if (data.respCode === 0){
            yield put(bookingAction.setDisciplines(data.data));
        }else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

function* getReferralList(){
    while(true){
        let { params, callback } = yield take(bookingActionType.GET_REFERRAL_LIST);
        let { data } = yield call(dentalService.getReferralList, params);
        if (data.respCode === 0){
            yield put(bookingAction.setReferralList(data.data));
            callback && callback();
        }else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

function* getReferralDefaultRoom(){
    while(true){
        let { params } = yield take(bookingActionType.GET_REFERRAL_DEFAULT_ROOM);
        if (!params.patientKey) {
            yield put(updateState({ referralDefaultRoomId: undefined }));
            continue;
        }
        let { data } = yield call(dentalService.getReferralDefaultRoom, params);
        if (data.respCode === 0){
            yield put(updateState({ referralDefaultRoomId: data.data }));
        }else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

export const dtsAppointmentBookingSaga = [
    getAvailableCalendarTimeSlot,
    getAvailableCalendarTimeSlotForExpress,
    getAvailableCalendarDetail,
    getDailyView,
    getMultipleDailyViewForExpress,
    insertAppointment,
    getPatientAppointment,
    getRoomList,
    getEncounterTypeList,
    getSessionList,
    getDailyNote,
    getAvailableTimeSlot,
    updateDailyNote,
    getUrgentRoomList,
    insertUrgentAppointment,
    getUnavailableReasons,
    insertUnavailableTimeslot,
    deleteUnavailablePeriod,
    deleteAppointment,
    saveToReserveList,
    removeFromReserveList,
    getBookingAlert,
    rescheduleAppointment,
    getUrgentRoomListForGp,
    insertUrgentAppointmentForGp,
    reassignUrgentAppointment,
    reassignUrgentAppointmentForGp,
    updateAppointment,
    getPmiAppointmentLabel,
    getAppointmentLog,
    getTimeslotLog,
    getServeRoom,
    getDisciplines,
    getReferralList,
    getReferralDefaultRoom
];
