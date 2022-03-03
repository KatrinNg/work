import { take, takeLatest, call, put, select } from 'redux-saga/effects';
import {axios, maskAxios} from '../../../../services/axiosInstance';
import * as redesignBookingActionType from '../../../actions/appointment/booking/redesignBookingActionType';

import * as messageType from '../../../actions/message/messageActionType';
// import * as patientActionType from '../../../actions/patient/patientActionType';
// import storeConfig from '../../../storeConfig';
import _ from 'lodash';
import * as bookingActionType from '../../../actions/appointment/booking/bookingActionType';
import {
    mapRemarkCodeList
} from '../../../../utilities/apiMappers';
import * as atndAction from '../../../actions/attendance/attendanceAction';
import * as bookingAnonymousActionType from '../../../actions/appointment/booking/bookingAnonymousActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';

function* redesignListRemarkCode() {
    while (true) {
        try{
            let { params } = yield take(redesignBookingActionType.REDESIGN_LIST_REMARK_CODE);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/ana/remarkTypes', params);
            if (data.respCode === 0) {
                yield put({
                    type: redesignBookingActionType.REDESIGN_PUT_LIST_REMARK_CODE,
                    remarkCodeList: data.data
                });
                yield put(atndAction.putAnaAtndPutAnaRemark(data.data));
                yield put({
                    type: bookingActionType.PUT_LIST_REMARK_CODE,
                    remarkCodeList: mapRemarkCodeList(data.data)
                });
                yield put({
                    type: bookingAnonymousActionType.PUT_LIST_REMARK_CODE,
                    remarkCodeList: mapRemarkCodeList(data.data)
                });
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


// function* redesignListAppointment() {
//         let { params, callback } = yield take(redesignBookingActionType.REDESIGN_LIST_APPOINTMENT);
//         try {
//             let { data } = yield call(axios.get, 'ana/appointments', params);
//             if (data.respCode === 0) {

//                 yield put({
//                     // TODO : REDESIGN_PUT_LIST_APPOINTMENT_DATA
//                     type: redesignBookingActionType.REDESIGN_PUT_LIST_APPOINTMENT_DATA,
//                     appointmentList: data.data
//                 });
//                 callback && callback(data.data);
//             } else {
//                 yield put({
//                     type: messageType.OPEN_COMMON_MESSAGE,
//                     payload: {
//                         msgCode: '110031'
//                     }
//                 });
//             }
//         } catch (error) {
//             yield put({ type: commonType.OPEN_WARN_SNACKBAR, message: error.message ? error.message : 'Service error' });
//         }
// }

export const redesignBookingSaga = [
    redesignListRemarkCode()
    // redesignListAppointment()
];