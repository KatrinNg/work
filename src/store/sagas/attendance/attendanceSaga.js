import { take, takeLatest, call, put, select, all } from 'redux-saga/effects';
import { axios, maskAxios } from '../../../services/axiosInstance';
import * as apptService from '../../../services/ana/appointmentService';
import * as attendanceActionTypes from '../../actions/attendance/attendanceActionType';
// import * as commonType from '../../actions/common/commonActionType';
import * as messageType from '../../actions/message/messageActionType';
import _ from 'lodash';

// import * as redesignBookingAction from '../../actions/appointment/booking/redesignBookingAction';
import * as atndAction from '../../actions/attendance/attendanceAction';
import * as atndService from '../../../services/ana/attendanceService';
import { openCommonMessage } from '../../actions/message/messageAction';

import storeConfig from '../../../store/storeConfig';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest} from '../als/alsLogSaga';
import {handleOperationFailed} from '../../../services/ana/attendanceService';
import { AppointmentUtil } from '../../../utilities';
import { UPDATE_FAMILY_ATTN_BOOKING_RESULT } from '../../actions/appointment/booking/bookingActionType';


function* getAppointmentForAttend() {
    while (true) {
        let { appointmentList, appointmentId } = yield take(attendanceActionTypes.ANA_ATND_GET_APPOINTMENT_FOR_TAKE_ATTENDANCE);
        try {
            yield put(alsStartTrans());
            let curAppt = null;
            if (appointmentList && appointmentList.length > 0) {
                let index = appointmentList.findIndex(item => item.appointmentId === appointmentId);
                if (index > -1) {
                    curAppt = _.cloneDeep(appointmentList[index]);
                } else {
                    curAppt = _.cloneDeep(appointmentList[0]);
                }
            }
            yield put({ type: attendanceActionTypes.ANA_ATND_APPOINTMENT_FOR_ATTENDANCE_SUCCESS, currentAppointment: curAppt });
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* markAttendance() {
    while (true) {
        let { params, searchParams, callback } = yield take(attendanceActionTypes.ANA_ATND_MARK_ATTENDANCE);
        try {
            yield put(alsStartTrans());
            const { data } = yield call(
                params?.isFamilyAttend ? atndService.takeFamilyAttendance : atndService.takeAttendance,
                params
            );
            if (data.respCode === 0) {
                let clinicList = yield select(state => state.common.clinicList);
                let encounterTypes = yield select(state => state.common.encounterTypeList);
                let rooms = yield select(state => state.common.rooms);
                let curAppt = yield select(state => state.attendance.currentAppointment);
                const { caseNoInfo, patientInfo } = yield select(state => state.patient);
                let result = atndService.takeAttendanceResponseToConfirmReduxState(
                    params?.isFamilyAttend
                        ? data.data.attendanceTakeVos.find((patient) => patient.attendance.patientKey === patientInfo.patientKey)
                        : data.data,
                    curAppt,
                    clinicList,
                    encounterTypes,
                    rooms
                );

                if(params?.isFamilyAttend) {
                    const { selectedAttnFamilyMember, attnFamilyMemberData } = yield select(state => state.bookingInformation);
                    // Get attend successful patient
                    const successfulList = AppointmentUtil.checkBookingStatus(data.data.responseCodeByPatientKey);
                    // Generate book result
                    const familyBookingResult = AppointmentUtil.familyBookingResultGenerator(attnFamilyMemberData, selectedAttnFamilyMember, patientInfo, data.data.attendanceTakeVos[0], successfulList, params?.isFamilyAttend);
                    yield put({ type: UPDATE_FAMILY_ATTN_BOOKING_RESULT, payload:{ familyBookingResult: familyBookingResult }});
                }

                const paramsCaseNo = params.caseNo;
                result.patientStatusCd = params.patientStatusCd ? params.patientStatusCd : '';
                if (!result.encntrGrpCd) {
                    result.encntrGrpCd = paramsCaseNo ? caseNoInfo && caseNoInfo.encntrGrpCd || '' : '';
                }
                // result.caseDto=data.data.caseDto||null;
                yield put({
                    type: attendanceActionTypes.ANA_ATND_MARK_ATTENDANCE_SUCCESS,
                    data: result
                });
                yield put({
                    type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
                    params: searchParams
                });
                callback && callback(result);
            } else if (data.respCode === 3) {
                yield put(
                    openCommonMessage(
                        {
                            msgCode: '130208',
                            btnActions: {
                                btn1Click: () => {
                                    storeConfig.store.dispatch(
                                        {
                                            type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
                                            params: searchParams
                                        }
                                    );
                                }
                            }
                        }
                    )
                );

            } else if ([100, 101, 102].indexOf(data.respCode) !== -1) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130204'
                    }
                });
            } else{
                handleOperationFailed(data.respCode,'Attendance','taking attendance',data);
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* markAttendanceForPatientSummary() {
    while (true) {
        let { params, searchParams, curSelectedAppt, callback } = yield take(attendanceActionTypes.ANA_ATND_MARK_ATTENDANCE_PATIENT_SUMMARY);
        try{
            yield put(alsStartTrans());
            let { data } = yield call(atndService.takeAttendance, params);

            if (data.respCode === 0) {
                let clinicList = yield select(state => state.common.clinicList);
                let encounterTypes = yield select(state => state.common.encounterTypeList);
                let rooms = yield select(state => state.common.rooms);
                let result = atndService.takeAttendanceResponseToConfirmReduxState(data.data, curSelectedAppt, clinicList, encounterTypes, rooms);
                result.patientStatusCd = params.patientStatusCd ? params.patientStatusCd : '';
                // result.caseDto=data.data.caseDto||null;
                yield put({
                    type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
                    params: searchParams
                });

                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111008',
                        showSnackbar: true
                    }
                });
                callback && callback(result);
            } else if (data.respCode === 3) {
                yield put(
                    openCommonMessage(
                        {
                            msgCode: '130208',
                            btnActions: {
                                btn1Click: () => {
                                    storeConfig.store.dispatch(
                                        {
                                            type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
                                            params: searchParams
                                        }
                                    );
                                }
                            }
                        }
                    )
                );

            } else if ([100, 101, 102].indexOf(data.respCode) !== -1) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130204'
                    }
                });
            } else if (data.respCode === 144) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
            } else if (data.respCode === 145) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
            }else{
                handleOperationFailed(data.respCode,'Attendance','taking attendance',data);
            }
            //  else if (data.respCode === 146) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
            // } else if (data.respCode === 147) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '111242',
            //             params: [
            //                 { name: 'HEADER', value: 'Attendance' },
            //                 { name: 'MODULE_NAME', value: 'taking attendance' }
            //             ]
            //         }
            //     });
            // } else if (data.respCode === 148) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110139'
            //         }
            //     });
            // } else if (data.respCode === 149) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110140'
            //         }
            //     });
            // } else if (data.respCode === 150) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110153' }
            //     });
            // } else {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110031'
            //         }
            //     });
            // }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchApptList(action) {
    let siteId = yield select(state => state.login.clinic.siteId);
    let svcCd = yield select(state => state.login.service.serviceCd);
    let encounterTypes = yield select(state => state.common.encounterTypes);
    let [listRequest, remarkRequest] = yield all([
        call(apptService.listAppointments, action.params),
        call(axios.get, '/ana/remarkTypes', {
            params: {
                siteId, svcCd
            }
        })
    ]);
    let data = listRequest.data;
    let remarkData = remarkRequest.data;
    let anaRemarkTypes = [];
    if (remarkData.respCode == 0) {
        anaRemarkTypes = remarkData.data;
        yield put(atndAction.putAnaAtndPutAnaRemark(anaRemarkTypes));
    }

    if (data.respCode === 0) {
        let clinicList = yield select(state => state.common.clinicList);
        let result = apptService.listAppointmentsToAttendanceReduxState(
            data.data, clinicList, anaRemarkTypes, encounterTypes
        );


        yield put({
            type: attendanceActionTypes.ANA_ATND_PUT_APPOINTMENT_LIST,
            appointmentList: result

            // curAppointmentId: action.curAppointmentId
        });

        if (typeof action.callback === 'function') {
            action.callback(result);
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

function* getApptList() {
    yield alsTakeLatest(attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT, fetchApptList);
}

function* markArrival(action) {
    let { params, searchParams, callback } = action;

    let { data } = yield call(params?.isFamilyArrival ? atndService.markFamilyArrival : atndService.markArrival, params);
    if (data.respCode === 0) {
        const patientKey = yield select(state => state.patient.patientInfo.patientKey);
        let clinicList = yield select(state => state.common.clinicList);
        let encounterTypes = yield select(state => state.common.encounterTypeList);
        let rooms = yield select(state => state.common.rooms);
        let curAppt = yield select(state => state.attendance.currentAppointment);
        let result = atndService.takeAttendanceResponseToConfirmReduxState(
            params?.isFamilyArrival
                ? data.data.attendanceTakeVos.filter((patient) => patient.attendance.patientKey === patientKey)[0]
                : data.data,
            curAppt,
            clinicList,
            encounterTypes,
            rooms
        );
        result.patientStatusCd = params.patientStatusCd ? params.patientStatusCd : '';

        yield put({
            type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
            params: searchParams
        });

        callback && callback(result);
    } else if (data.respCode === 3) {
        yield put(
            openCommonMessage(
                {
                    msgCode: '130208',
                    btnActions: {
                        btn1Click: () => {
                            storeConfig.store.dispatch(
                                {
                                    type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
                                    params: searchParams
                                }
                            );
                        }
                    }
                }
            )
        );

    } else if ([100,101,102].indexOf(data.respCode) !== -1 ) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130204'
            }
        });
    }else{
        handleOperationFailed(data.respCode,'Attendance','marking arrival',data);
    }
}


function* editAttendance(action){
    let { params, searchParams, callback } = action;

    let { data } = yield call(atndService.editAttendance, params.atndId, params);

    if (data.respCode === 0) {
        let clinicList = yield select(state => state.common.clinicList );
        let encounterTypes = yield select(state => state.common.encounterTypeList);
        let rooms = yield select(state => state.common.rooms);
        let curAppt = yield select(state => state.attendance.currentAppointment);
        let result = atndService.takeAttendanceResponseToConfirmReduxState({attendance: data.data}, curAppt, clinicList, encounterTypes, rooms);
        result.patientStatusCd = params.patientStatusCd ? params.patientStatusCd : '';

        yield put({
            type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
            params: searchParams
        });

        callback && callback(result);
    } else if (data.respCode === 3) {
        yield put(
            openCommonMessage(
                {
                    msgCode: '130208',
                    btnActions: {
                        btn1Click: () => {
                            storeConfig.store.dispatch(
                                {
                                    type: attendanceActionTypes.ANA_ATND_LIST_APPOINTMENT,
                                    params: searchParams
                                }
                            );
                        }
                    }
                }
            )
        );

    } else if ([100, 101, 102].indexOf(data.respCode) !== -1) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130204'
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

function* takeLatestMarkArrival(){
    yield alsTakeLatest(attendanceActionTypes.ANA_ATND_MARK_ARRIVAL, markArrival);
}

function* takeLatestEditAttendance(){
    yield alsTakeLatest(attendanceActionTypes.ANA_ATND_EDIT_ATTENDANCE, editAttendance);
}


export const attendanceSaga = [
    markAttendance,
    getAppointmentForAttend,
    getApptList,
    takeLatestMarkArrival,
    takeLatestEditAttendance,
    markAttendanceForPatientSummary
];