import { take, call, put } from 'redux-saga/effects';
import { maskAxios, axios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';

import * as searchAppointmentActionType from '../../../actions/dts/appointment/searchAppointmentActionType';
import {getUnavailableAppointmentsSuccess, getReserveListSuccess} from '../../../actions/dts/appointment/emptyTimeslotAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as apptService from '../../../../services/ana/appointmentService';
import * as commonService from '../../../../services/dts/commonService';
import * as dentalService from '../../../../services/dts/dentalService';
import moment from 'moment';
import Enum from '../../../../enums/enum';

import _ from 'lodash';

const messageAction = (msgCode)=>({type: messageType.OPEN_COMMON_MESSAGE,payload:{msgCode}});

function* getRoomList() {
    while(true){
        let { params, callback } = yield take(searchAppointmentActionType.GET_ROOM_LIST);

        console.log('dtsSearchAppointmentSaga.js > getRoomList() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/cmn/sites/'+params.siteId+'/rooms');
        // let { data } = yield call(maskAxios.post, '/dental/mockRoomList', {clinicCd:params.clinicCd});
        if (data.respCode === 0) {
            let roomList = {roomList : data.data};
            yield put({ type: searchAppointmentActionType.GET_ROOM_LIST_SAGA, roomList: roomList });

            if (callback && typeof callback === 'function'){
                callback();
            }
        } else {
            yield put(messageAction('110031'));
        }

    }
}

function* getEncounterTypeList() {
    while(true){
        let { params } = yield take(searchAppointmentActionType.GET_ENCOUNTER_TYPE_LIST);

        console.log('dtsSearchAppointmentSaga.js > getEncounterTypeList() > '+JSON.stringify(params));

        // let { data } = yield call(maskAxios.post, '/dental/mockEncounterTypeList', {roomCd:params.roomCd });
        let { data } = yield call(maskAxios.get, '/cmn/rooms/'+params.rmId+'/encounterTypes');
        if (data.respCode === 0) {
            let encounterTypeList = {encounterTypeList : data.data};
            yield put({ type: searchAppointmentActionType.GET_ENCOUNTER_TYPE_LIST_SAGA, encounterTypeList: encounterTypeList });
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

function* getAppointmentList() {
    while(true){
        let { params, callback } = yield take(searchAppointmentActionType.GET_APPOINTMENT_LIST);

        console.log('dtsSearchAppointmentSaga.js > getAppointmentList() > '+JSON.stringify(params));
        let { data } = yield call(dentalService.searchAppointmentList,
         {
            params:{
                ...params,
                dateFrom: dtsUtilities.formatDateParameter(params.dateFrom),
                dateTo: dtsUtilities.formatDateParameter(params.dateTo)
            }
        });
        //let data = 1;
        if (data.respCode === 0) {
            let appointmentList = {appointmentList : data.data};
            yield put({ type: searchAppointmentActionType.GET_APPOINTMENT_LIST_SAGA, appointmentList: appointmentList });

            if(callback){
                //console.log('reducer callback');
                if(Array.isArray(callback)){
                    callback.forEach(item => item());
                }
                else
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

function* getAppointmentListReport() {
    while(true){
        let { params, callback } = yield take(searchAppointmentActionType.GET_APPOINTMENT_LIST_REPORT);

        //console.log('dtsSearchAppointmentSaga.js > getAppointmentListReport() > '+JSON.stringify(params));
        let printAppointmentDto  = params.appointmentList.map(appointment => ({
            appointmentDate:moment(appointment.appointmentDateTime).format('DD-MM-YYYY'),
            startTime:moment(dtsUtilities.getAppointmentStartTime(appointment)).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
            roomCode:appointment.roomCode,
            patientName:dtsUtilities.getPatientName(appointment.patientDto),
            clientType:appointment.patientDto && appointment.patientDto.patientStatus,
            duration:dtsUtilities.getAppointmentDuration(appointment),
            encounterTypeDescription:appointment.encounterTypeDescription,
            appointmentType:appointment.isUrgentSqueeze && appointment.isUrgentSqueeze == 1 ? 'Urgent Squeeze-In': appointment.isUrgent && appointment.isUrgent == 1 ? 'Urgent' : appointment.isSqueeze && appointment.isSqueeze == 1 ? 'Squeeze-In' : 'Normal',
            specialRequest:appointment.appointmentSpecialRequestVo && appointment.appointmentSpecialRequestVo.remark

        }));
        //console.log('dtsSearchAppointmentSaga.js-filteredParam():'+JSON.stringify(printAppointmentDto ));
        //console.log('dtsSearchAppointmentSaga.js-callback:'+callback);

        let { data } = yield call(dentalService.searchAppointmentListReport, printAppointmentDto );
        //let data = 1;
        if (data.respCode === 0) {
            let appointmentListReport = data.data;
            yield put({ type: searchAppointmentActionType.GET_APPOINTMENT_LIST_REPORT_SAGA, appointmentListReport: appointmentListReport});

            if(callback){
                if(Array.isArray(callback)){
                    callback.forEach(item => item());
                }
                else
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

export const dtsSearchAppointmentSaga = [
    getRoomList,
    getEncounterTypeList,
    getAppointmentList,
    getAppointmentListReport
];