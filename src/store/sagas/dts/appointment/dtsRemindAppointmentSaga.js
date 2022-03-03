import { take, call, put, all, select } from 'redux-saga/effects';
import { maskAxios, axios } from '../../../../services/axiosInstance';
import { openCommonMessage } from '../../../actions/message/messageAction';
import * as messageType from '../../../actions/message/messageActionType';

import * as remindAppointmentActionType from '../../../actions/dts/appointment/remindAppointmentActionType';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as apptService from '../../../../services/ana/appointmentService';
import * as commonService from '../../../../services/dts/commonService';
import * as dentalService from '../../../../services/dts/dentalService';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import { contactHistoryType } from '../../../../enums/dts/appointment/contactHistoryTypeEnum';
import _ from 'lodash';


function* getRoomList() {
    while (true) {
        let { params, callback } = yield take(remindAppointmentActionType.GET_ROOM_LIST);

        // console.log('dtsAppointmentAttendaceSaga.js > mockRoomList() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/cmn/sites/' + params.siteId + '/rooms');
        // let { data } = yield call(maskAxios.post, '/dental/mockRoomList', {clinicCd:params.clinicCd});
        if (data.respCode === 0) {
            let roomList = { roomList: data.data };
            yield put({ type: remindAppointmentActionType.GET_ROOM_LIST_SAGA, roomList: roomList });

            if (callback && typeof callback === 'function') {
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

function* getRemindAppointmentList() {
    while (true) {
        let action = yield take(remindAppointmentActionType.GET_REMIND_APPOINTMENT_LIST);
        let inputParams = action.params;
        console.log('dtsRemindAppointmentSaga.js > getRemindAppointmentList() > ' + JSON.stringify(inputParams));

        let { data } =
            yield call(maskAxios.get, '/dts-ana/appointments/patientRemindList',
                {
                    params: {
                        // Pass Clinic ID only if to search for all rooms
                        clinicId: inputParams.rmIdList.includes('*All') ? inputParams.clinicId : null,
                        // Pass Room ID list only if it is NOT all rooms
                        rmIds: inputParams.rmIdList.includes('*All') ? null : _.join(inputParams.rmIdList, ','),
                        apptDateFrom: dtsUtilities.formatDateParameter(inputParams.apptDateFrom),
                        apptDateTo: dtsUtilities.formatDateParameter(inputParams.apptDateTo),
                        pageNo: 1,
                        pageSize: null
                    }
                });

        if (data.respCode === 0) {
            let remindAppointmentList = { remindAppointmentList: data.data };
            yield put({ type: remindAppointmentActionType.GET_REMIND_APPOINTMENT_LIST_SAGA, remindAppointmentList: remindAppointmentList, lastGetRemindAppointmentListAction: action });
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

function* getServeRoom() {
    while (true) {
        let { params, callback } = yield take(remindAppointmentActionType.GET_SERVE_ROOM);

        let { data } = yield call(dentalService.getServeRoom, params);
        if (data.respCode === 0) {
            let serveRoom = { serveRoom: data.data };
            yield put({ type: remindAppointmentActionType.GET_SERVE_ROOM_SAGA, serveRoom: serveRoom });

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

function* getContactHistoryList() {
    while (true) {
        let { params, callback } = yield take(remindAppointmentActionType.GET_CONTACT_HISTORY_LIST);

        let { data } = yield call(dentalService.getContactHistoryList, params);
        if (data.respCode === 0) {
            let contactHistoryList = { contactHistoryList: data.data };
            yield put({ type: remindAppointmentActionType.GET_CONTACT_HISTORY_LIST_SAGA, contactHistoryList: contactHistoryList });

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

function* getReminderTemplate() {
    while (true) {
        let { siteId, commMeansCd, status } = yield take(remindAppointmentActionType.GET_REMINDER_TEMPLATE);
        let url = `ana/apptReminders/remindTemplate?siteId=${siteId}`;
        if (commMeansCd) {
            url += `&commMeansCd${commMeansCd}`;
        }
        if (status) {
            url += `&url${status}`;
        }
        let resp = yield call(maskAxios.get, url);
        if (resp.data.respCode === 0) {
            yield put({
                type: remindAppointmentActionType.GET_REMINDER_TEMPLATE_SAGA,
                reminderTemplate: resp.data.data
            });
        }
    }
}
function* insertContactHistory() {
    while (true) {
        //let { params, appointmentId, contactType, callback } = yield take(remindAppointmentActionType.INSERT_CONTACT_HISTORY);
        let { params, callback } = yield take(remindAppointmentActionType.INSERT_CONTACT_HISTORY);
        //console.log('insertContactHistory params' + JSON.stringify(params));
        if (params.data) {
            let url = '';
            if (params.data.commMeansCd == contactHistoryType.SMS.code || params.data.commMeansCd == contactHistoryType.EMAIL.code) {
                url = `/ana/appointments/${params.appointmentId}/apptReminders`;
            }
            else {
                url = `/ana/appointments/${params.appointmentId}/contactHistories`;
            }
            let { data } = yield call(maskAxios.post, url, params.data);
            //let { data } = yield call(maskAxios.post, `/ana/appointments/${params.appointmentId}/contactHistories`, params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110021',
                        showSnackbar: true
                    }
                });
                callback && callback();
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
}

function* insertContactHistories() {
    while (true) {
        const { params, callback } = yield take(remindAppointmentActionType.INSERT_CONTACT_HISTORIES);
        let url = '/dts-ana/appointments/contactHistories';
        let { data } = yield call(maskAxios.post, url, params);
        if (data.respCode === 0) {
            const lastGetRemindAppointmentListAction = yield select(state => state.dtsRemindAppointment.lastGetRemindAppointmentListAction);
            yield put(lastGetRemindAppointmentListAction);
            yield put(openCommonMessage({ msgCode: '110021', showSnackbar: true }));
            callback && callback();
        } else {
            yield put(openCommonMessage({ msgCode: '110031' }));
        }
    }
}

function* updateContactHistory() {
    while (true) {
        let { params, callback } = yield take(remindAppointmentActionType.UPDATE_CONTACT_HISTORY);
        if (params) {
            let url = '';
            if (params.data.commMeansCd == contactHistoryType.SMS.code || params.data.commMeansCd == contactHistoryType.EMAIL.code) {
                url = `/ana/appointments/${params.appointmentId}/apptReminders/${params.contactHistoryId}`;
            }
            else {
                url = `/ana/appointments/${params.appointmentId}/contactHistories/${params.contactHistoryId}`;
            }
            let { data } = yield call(maskAxios.put, url, params.data);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        //msgCode: data.data.statusCd === 'A' ? '110023' : '110022',
                        msgCode: '110023',
                        showSnackbar: true
                    }
                });
                callback && callback();
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111221'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111222'
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
}


function* deleteContactHistory() {
    while (true) {
        let { params, callback } = yield take(remindAppointmentActionType.DELETE_CONTACT_HISTORY);
        if (params) {
            let url = '';
            if (params.data.contactType == contactHistoryType.TEL.code || params.data.contactType == contactHistoryType.MAIL.code) {
                url = `/ana/appointments/${params.appointmentId}/contactHistories/${params.contactHistoryId}`;
            }
            else {
                url = `/ana/appointments/${params.appointmentId}/apptReminders/${params.contactHistoryId}`;
            }
            let { data } = yield call(maskAxios.delete, url, { data: params.data });
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111228',
                        showSnackbar: true
                    }
                });
                callback && callback();
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
}


// function* getContactHistoryTelNotesCode(){
//     while(true){
//         let { params } = yield take(remindAppointmentActionType.GET_TEL_NOTES_CODE);
//         console.log('dtsRemindAppointmentSaga.js > getContactHistoryTelNotesCode() > ' + JSON.stringify(params));

//         let { data } = yield call(dentalService.getAnaCode, params);
//         if (data.respCode === 0){
//             let contactHistoryTelNotesList =data.data;
//             if(params.category == 'DTS APPT TEL CNTCT HX NOTES') {
//                 yield put({type: remindAppointmentActionType.GET_TEL_NOTES_CODE_SAGA, contactHistoryTelNotesList: contactHistoryTelNotesList });
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

function* getRemindAppointmentListReport() {
    while (true) {
        let { params } = yield take(remindAppointmentActionType.GET_REMIND_APPOINTMENT_LIST_REPORT);
        console.log(params);

        // let printRemindAppointmentListReportDto = {
        //     appointmentDateRange : moment(params.calendarDetailDate1).format('DD-MM-YYYY') + " to " + moment(params.calendarDetailDate2).format('DD-MM-YYYY') ||"",
        //     appointmentListId:"9876543210",
        //     isReminderPatientsNeed: params.isReminderPatientsNeed == true ? "Yes" : "No",
        //     locationName: params.locationName || "",
        //     reminderListByDate: tempSelectedRoomList,
        //     surgeryList: tempSurgeryList
        // };

        let { data } = yield call(dentalService.getRemindAppointmentListReport, params);
        if (data.respCode === 0) {
            let remindAppointmentListReport = data.data;
            yield put({
                type: remindAppointmentActionType.SET_REMIND_APPOINTMENT_LIST_REPORT,
                updateData: {
                    remindAppointmentListReport: remindAppointmentListReport,
                    openDtsPrintRemindAppointmentListReportDialog:true
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
export const dtsRemindAppointmentSaga = [
    getRoomList,
    getRemindAppointmentList,
    getServeRoom,
    getContactHistoryList,
    getReminderTemplate,
    insertContactHistory,
    insertContactHistories,
    updateContactHistory,
    deleteContactHistory,
    // getContactHistoryTelNotesCode
    getRemindAppointmentListReport
];