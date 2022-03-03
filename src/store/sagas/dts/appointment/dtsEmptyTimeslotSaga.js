import { take, call, put, select } from 'redux-saga/effects';
import moment from 'moment';
import { maskAxios, axios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';

import * as bookingActionType from '../../../actions/dts/appointment/bookingActionType';
import * as emptyTimeslotActionType from '../../../actions/dts/appointment/emptyTimeslotActionType';
import { getUnavailableAppointmentsSuccess, getReserveListSuccess, getReserveList as getReserveListAction}  from '../../../actions/dts/appointment/emptyTimeslotAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as apptService from '../../../../services/ana/appointmentService';
import * as commonService from '../../../../services/dts/commonService';
import * as dentalService from '../../../../services/dts/dentalService';
import Enum from '../../../../enums/enum';

import _ from 'lodash';

const messageAction = (msgCode)=>({type: messageType.OPEN_COMMON_MESSAGE,payload:{msgCode}});

function* getRoomList() {
    while(true){
        let { params, callback } = yield take(emptyTimeslotActionType.GET_ROOM_LIST);

        // console.log('dtsAppointmentAttendaceSaga.js > mockRoomList() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/cmn/sites/'+params.siteId+'/rooms');
        // let { data } = yield call(maskAxios.post, '/dental/mockRoomList', {clinicCd:params.clinicCd});
        if (data.respCode === 0) {
            let roomList = {roomList : data.data};
            yield put({ type: emptyTimeslotActionType.GET_ROOM_LIST_SAGA, roomList: roomList });

            if (callback && typeof callback === 'function'){
                callback();
            }
        } else {
            yield put(messageAction('110031'));
        }

    }
}

function* getEmptyTimeslotList() {
    while(true){
        let { params, callback } = yield take(emptyTimeslotActionType.GET_EMPTY_TIMESLOT_LIST);

        console.log('dtsEmptyTimeslotSaga.js > getEmptyTimeslotList() > '+JSON.stringify(params));

        let { data } = yield call(dentalService.getEmptyTimeslot, params, true);
        //let data = 1;

        if (data.respCode === 0) {
            let emptyTimeslotList = {emptyTimeslotList : data.data};

            yield put({ type: emptyTimeslotActionType.GET_EMPTY_TIMESLOT_LIST_SAGA, emptyTimeslotList: emptyTimeslotList });

            if (callback && typeof callback === 'function'){
                callback();
            }
        } else {
            yield put(messageAction('110031'));
        }

    }
}

function* getUnavailableAppointments() {
    while(true) {
        const {params} = yield take(emptyTimeslotActionType.GET_UNAVAILABLE_APPOINTMENTS);
        const {data} = yield call(maskAxios.get, '/dts-ana/appointments/unavailable', {params});
        if (data.respCode === 0) {
            yield put(getUnavailableAppointmentsSuccess(data.data));
        } else {
            yield put(messageAction('110031'));
        }
    }
}

function* getReserveList() {
    while(true) {
        const {params} = yield take(emptyTimeslotActionType.GET_RESERVE_LIST);
        const {data} = yield call(maskAxios.get, '/dts-ana/appointments/reserved', {params});
        if (data.respCode === 0) {
            yield put(getReserveListSuccess(data.data));
        } else {
            yield put(messageAction('110031'));
        }
    }
}

function* updateReserveList() {
    while(true) {
        yield take(bookingActionType.RESERVE_LIST_UPDATED);
        const roomId = yield select(state => state.dtsEmptyTimeslot.selectedEmptyTimeslot?.surgery.rmId);
        if (roomId) {
            const now = moment();
            const from = now.format('YYYY-MM-DD');
            const to = now.add(3, 'M').format('YYYY-MM-DD');
            yield put(getReserveListAction(roomId, from, to));
        }
    }
}

function* getReserveListReport() {
    while (true) {
        let { params, callback } = yield take(emptyTimeslotActionType.GET_RESERVE_LIST_REPORT);
        console.log(params);
        let printReserveListDto = params.list.map(appointment => ({
            patientName: dtsUtilities.getPatientName(appointment.patientDto) || "",
            pmiNo: ('' + appointment.patientDto.patientKey).padStart(10, '0') ||'',
            gender: appointment.patientDto.genderCd || "",
            priority: appointment.reserve.priority || "",
            remarks: appointment.remarks || "",
            appointmentDate: moment(appointment.appointmentDateTime).format('DD-MM-YYYY') || "",
            time: moment(dtsUtilities.getAppointmentStartTime(appointment)).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) || "",
            duration: dtsUtilities.getAppointmentDuration(appointment) ||"",
            encType: appointment.encounterTypeDescription || "",
            createdOn: moment(appointment.createDtm).format('DD-MM-YYYY') || ""
        }));
        let finalParam={
            clinic: params.site ||"",
            surgery:params.surgery ||"",
            reserveList:printReserveListDto||[]
        };
        
        console.log(printReserveListDto);
        let { data } = yield call(dentalService.getReserveListReport, finalParam);
        //let data = 1;
        if (data.respCode === 0) {
            let reserveListReport = data.data;
            yield put({ 
                type: emptyTimeslotActionType.UPDATE_STATE,
                updateData: {reserveListReport: reserveListReport} 
            });

            // if (callback) {
            //     if (Array.isArray(callback)) {
            //         callback.forEach(item => item());
            //     }
            //     else
            //         callback();
            // }
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
export const dtsEmptyTimeslotSaga = [
    getRoomList,
    getEmptyTimeslotList,
    getUnavailableAppointments,
    getReserveList,
    updateReserveList,
    getReserveListReport
];