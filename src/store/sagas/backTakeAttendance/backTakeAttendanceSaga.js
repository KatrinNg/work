import { take, takeLatest, call, put, all, select } from 'redux-saga/effects';
import {axios, maskAxios} from '../../../services/axiosInstance';
import * as commonType from '../../actions/common/commonActionType';
import * as backTakeAttendanceActionTypes from '../../actions/attendance/backTakeAttendanceAcitonType';
import * as messageType from '../../actions/message/messageActionType';

import * as atndAction from '../../actions/attendance/attendanceAction';
import * as atndService from '../../../services/ana/attendanceService';
import * as apptService from '../../../services/ana/appointmentService';

import { openCommonMessage } from '../../actions/message/messageAction';
import storeConfig from '../../../store/storeConfig';

import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest } from '../als/alsLogSaga';
import {handleOperationFailed} from '../../../services/ana/attendanceService';
import { UPDATE_FAMILY_DATE_BACK_BOOKING_RESULT } from '../../actions/appointment/booking/bookingActionType';
import { AppointmentUtil } from '../../../utilities';


function* fetchApptList(action) {

    let siteId = yield select(state => state.login.clinic.siteId);
    let svcCd = yield select(state => state.login.service.serviceCd);
    let encounterTypes = yield select(state => state.common.encounterTypes);

    let [listRequest, remarkRequest] = yield all([
        call(apptService.listAppointments, action.params),
        call(maskAxios.get, '/ana/remarkTypes', {
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
            type: backTakeAttendanceActionTypes.PUT_APPOINTMENT_LIST,
            appointmentList: result
        });
        if (typeof action.callBack === 'function') {
            action.callBack(result);
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
    yield alsTakeLatest(backTakeAttendanceActionTypes.LIST_APPOINTMENT, fetchApptList);
}


function* backTakeAttendance() {
    while (true) {
        try {
            let { params, searchParams, callback } = yield take(backTakeAttendanceActionTypes.BACK_TAKE_ATTENDANCE);
            yield put(alsStartTrans());

            let { data } = yield call(params?.isFamilyAttend ? atndService.takeFamilyAttendance : atndService.takeAttendance, params);
            if (data.respCode === 0) {
                const { caseNoInfo, patientInfo } = yield select(state => state.patient);
                let clinicList = yield select(state => state.common.clinicList);
                let encounterTypes = yield select(state => state.common.encounterTypeList);
                let rooms = yield select(state => state.common.rooms);
                let curAppt = yield select(state => state.backTakeAttendance.currentAppointment);
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
                    const { selectedDateBackFamilyMember, dateBackFamilyMemberData } = yield select(state => state.bookingInformation);
                    // Get attend successful patient
                    const successfulList = AppointmentUtil.checkBookingStatus(data.data.responseCodeByPatientKey);
                    // Generate book result
                    const familyBookingResult = AppointmentUtil.familyBookingResultGenerator(dateBackFamilyMemberData, selectedDateBackFamilyMember, patientInfo, data.data.attendanceTakeVos[0], successfulList, params?.isFamilyAttend);
                    yield put({ type: UPDATE_FAMILY_DATE_BACK_BOOKING_RESULT, payload:{ familyBookingResult: familyBookingResult }});
                }

                const paramsCaseNo=params.caseNo;
                result.patientStatusCd = params.patientStatusCd ? params.patientStatusCd : '';
                if (!result.encntrGrpCd) {
                    result.encntrGrpCd = paramsCaseNo ? caseNoInfo && caseNoInfo.encntrGrpCd || '' : '';
                }
                // result.caseDto=data.data.caseDto||null;
                yield put({
                    type: backTakeAttendanceActionTypes.BACK_TAKE_ATTENDANCE_SUCCESS,
                    data: result
                });

                yield put({
                    type: backTakeAttendanceActionTypes.LIST_APPOINTMENT,
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
                                            type: backTakeAttendanceActionTypes.LIST_APPOINTMENT,
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
            }
            // } else if (data.respCode === 144) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
            // } else if (data.respCode === 145) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
            // } else if (data.respCode === 146) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
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
            // } else if (data.respCode === 147) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '111242',
            //             params: [
            //                 { name: 'HEADER', value: 'Back Take Attendance' },
            //                 { name: 'MODULE_NAME', value: 'back-take attendance' }
            //             ]
            //         }
            //     });
            // } else {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110031'
            //         }
            //     });
            // }
            else{
                handleOperationFailed(data.respCode,'Date Back Attendance','taking date back attendance',data);
            }

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* markArrival() {
    while (true) {
        try {
            let { params, callback } = yield take(backTakeAttendanceActionTypes.ANA_ATND_MARK_ARRIVAL);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/ana/attendances/markArrival', params);
            if (data.respCode === 0) {
                yield put(
                    openCommonMessage(
                        {
                            msgCode: '111004',
                            showSnackbar: true
                        }
                    )
                );
                callback && callback();
            } else if (data.respCode === 101) {
                yield put(
                    openCommonMessage(
                        {
                            msgCode: '111006'
                        }
                    )
                );
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111007'
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

        } finally {
            yield put(alsEndTrans());
        }
    }
}


export const backTakeAttendanceSaga = [
    getApptList,
    backTakeAttendance,
    markArrival
];
