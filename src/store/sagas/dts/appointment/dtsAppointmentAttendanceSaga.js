import { take, call, put } from 'redux-saga/effects';
import { maskAxios, axios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';
import { openCommonMessage } from '../../../actions/message/messageAction';

import * as attendanceActionType from '../../../actions/dts/appointment/attendanceActionType';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as apptService from '../../../../services/ana/appointmentService';
import * as commonService from '../../../../services/dts/commonService';
import * as dentalService from '../../../../services/dts/dentalService';
import * as bookingAction from '../../../actions/dts/appointment/bookingAction';
import * as bookingEnum from '../../../../enums/dts/appointment/bookingEnum';

import NProgress from 'nprogress';

function* getRoomList() {
    while(true){
        let { params, callback } = yield take(attendanceActionType.GET_ROOM_LIST);

        // console.log('dtsAppointmentAttendaceSaga.js > mockRoomList() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/cmn/sites/'+params.siteId+'/rooms');
        // let { data } = yield call(maskAxios.post, '/dental/mockRoomList', {clinicCd:params.clinicCd});
        if (data.respCode === 0) {
            let roomList = {roomList : data.data};
            yield put({ type: attendanceActionType.GET_ROOM_LIST_SAGA, roomList: roomList });

            if (callback && typeof callback === 'function'){
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

function* getDailyNote() {
    while(true){
        let { params } = yield take(attendanceActionType.GET_DAILY_NOTE);
        console.log('dtsAppointmentAttendaceSaga.js > getDailyNote() > '+JSON.stringify(params));
        let { data } = yield call(maskAxios.get, '/dts-ana/clinicSurgery/dailyNote?clinicRoomId='+params.clinicRoomId+'&appointmentDate=' + params.appointmentDate+'T00:00:00%2B08:00');
        if (data.respCode === 0) {
            let dailyNote = data.data;
            yield put({ type: attendanceActionType.GET_DAILY_NOTE_SAGA, dailyNote: dailyNote });
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

function* getRoomOfficer() {
    while(true){
        let { params } = yield take(attendanceActionType.GET_ROOM_OFFICER);

        console.log('dtsAppointmentAttendaceSaga.js > getRoomOfficer() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-ana/clinicSurgery/'+params.roomId+'/roomOfficer/'+dtsUtilities.formatDateParameter(params.date));

        if (data.respCode === 0) {
            let roomOfficer = data.data[0];
            yield put({ type: attendanceActionType.GET_ROOM_OFFICER_SAGA, roomOfficer: roomOfficer });
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
    while(true){
        let { params } = yield take(attendanceActionType.UPDATE_DAILY_NOTE);
        //

        console.log('dtsAppointmentAttendaceSaga.js > updateDailyNote() > '+JSON.stringify(params));

       // let data = {respCode:1};
        let { data } = yield call(maskAxios.put, '/dts-ana/clinicSurgery/dailyNote', params);
        if (data.respCode === 0) {
            yield put({ type: attendanceActionType.GET_DAILY_NOTE, params});
        } else if (data.respCode === 3){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '140002'
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

function* getDailyView() {
    while(true){
        let { params } = yield take(attendanceActionType.GET_DAILY_VIEW);
        //console.log('dtsAppointmentBookingSaga.js > getDailyView() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-ana/clinicSurgery/'+params.rmId+'/dailyViewForAttendance/' + dtsUtilities.formatDateParameter(params.date));
        if (data.respCode === 0){
            let dailyView = { dailyView: data.data };
            yield put({type: attendanceActionType.GET_DAILY_VIEW_SAGA, dailyView: dailyView });
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

function* searchPatientByHkid() {
    while(true){
        let { params, maskMode } = yield take(attendanceActionType.GET_PATIENT_BY_HKID);
        // let { data } = yield call(axios.get, `/patient/patients?docType=${params.docType}&searchString=${params.searchStr}`);
        let { data } = yield call(commonService.getPatient, params, maskMode);
        let patientInfo = data.data.patientDtos;

        //console.log('saga-result:'+JSON.stringify(patientInfo));
        if (data.respCode === 0) {
            if(data.data.total <=0)
                console.log('No patient found');
            else
                yield put({ type: attendanceActionType.GET_PATIENT_BY_HKID_SAGA, patientInfo});
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

function* getPatientByIds(){
    while(true){
        let { params, maskMode } = yield take(attendanceActionType.GET_PATIENT_BY_IDS);

        // console.log('dtsAppointmentAttendanceSaga.js > getPatientByIds() > ' + JSON.stringify(params));
        let {data} = yield call(commonService.listPatientByIds, params, maskMode);
        if (data.respCode === 0){
            let patientInfo = data.data;
            yield put({type: attendanceActionType.GET_PATIENT_BY_IDS_SAGA, patientInfo});
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

function* getAppointmentTask(){
    while(true){
        let { params, callback } = yield take(attendanceActionType.GET_APPOINTMENT_TASK);
        let {data} = yield call(apptService.listAppointments, params);
        if (data.respCode === 0){
            let appointmentTask = {appointmentTask : data.data};
            yield put({type: attendanceActionType.GET_APPOINTMENT_TASK_SAGA, appointmentTask: appointmentTask});

            callback && callback();
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

function* confirmAttendance(){
    while(true){
        let action = yield take(attendanceActionType.CONFIRM_ATTENDANCE);
        let { params, callback, maskMode } = action;

        console.log('dtsAppointmentAttendanceSaga.js > confirmAttendance() > ' + JSON.stringify(params));

        let {data} = yield call(dentalService.confirmAttendance, params, maskMode);
console.log('dtsAppointmentAttendanceSaga.js > confirmAttendance() > returned message data = ' + JSON.stringify(data));
        if (data.respCode === 0){
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
/*
            let confirmResult = {confirmResult : data.data};
            yield put({type: attendanceActionType.CONFIRM_ATTENDANCE_SAGA, confirmResult: confirmResult});

            if(callback){
                if(Array.isArray(callback)){
                    callback.forEach(item => item());
                }
                else
                    callback();
            }
*/
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

function* getServeRoom(){
    while(true){
        let { params, callback } = yield take(attendanceActionType.GET_SERVE_ROOM);

        let { data } = yield call(dentalService.getServeRoom, params);
        if (data.respCode === 0){
            let serveRoom = { serveRoom: data.data };
            yield put({type: attendanceActionType.GET_SERVE_ROOM_SAGA, serveRoom: serveRoom });

			console.log('dtsAppointmentAttendaceSaga.js > getServeRoom() > '+JSON.stringify(serveRoom));

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

function* getAttendance(){
    while(true){
        let { params, callback, maskMode } = yield take(attendanceActionType.GET_ATTENDANCE);
        let { data } = yield call(dentalService.getAttendance, params, maskMode);
        NProgress.remove();
        if (data.respCode === 0){
            let attendanceAlert = {attendanceAlert : data.data};
            yield put({type: attendanceActionType.GET_ATTENDANCE_SAGA, attendanceAlert: attendanceAlert });
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

function* updateArrivalTime(){
    while(true){
        let { params, callback } = yield take(attendanceActionType.UPDATE_ARRIVAL_TIME);
        let { data } = yield call(dentalService.updateArrivalTime, params);
        if (data.respCode === 0){
            callback && callback();
        } else if (data.respCode === 3) {
            yield put(openCommonMessage({ msgCode: '110032' }));
        } else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

function* revokeAttendance(){
    while(true){
        let { params, callback } = yield take(attendanceActionType.REVOKE_ATTENDANCE);
        let { data } = yield call(dentalService.revokeAttendance, params);
        if (data.respCode === 0){
            callback && callback();
        } else if (data.respCode === 3) {
            yield put(openCommonMessage({ msgCode: '110032' }));
        } else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

// function* getAnaCode(){
//     while(true){
//         let { params } = yield take(attendanceActionType.GET_ANA_CODE);
//         console.log('dtsAppointmentAttendanceSaga.js > getAnaCode() > ' + JSON.stringify(params));

//         let { data } = yield call(dentalService.getAnaCode, params);
//         if (data.respCode === 0){
//             let ecsPermitReasonList =data.data;
//             if(params.category == 'DTS ECS PERMIT REASON') {
//                 yield put({type: attendanceActionType.GET_ECS_PERMIT_REASON_LIST_SAGA, ecsPermitReasonList: ecsPermitReasonList });
//             }

//         }else {
//             yield put({
//                 type: messageType.OPEN_COMMON_MESSAGE,
//                 payload: {
//                     msgCode: '110031'
//                 }
//             });
//         }
//     }
// }


export const dtsAppointmentAttendanceSaga = [
    getRoomList,
    getDailyNote,
    updateDailyNote,
    getRoomOfficer,
    searchPatientByHkid,
    getAppointmentTask,
    getPatientByIds,
    confirmAttendance,
    getDailyView,
    searchPatientByHkid,
    getServeRoom,
    // getAnaCode,
    getAttendance,
    updateArrivalTime,
    revokeAttendance
];
