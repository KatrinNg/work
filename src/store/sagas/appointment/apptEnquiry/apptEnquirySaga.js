import { call, put } from 'redux-saga/effects';
import {maskAxios} from '../../../../services/axiosInstance';
import * as type from '../../../actions/appointment/apptEnquiry/apptEnquiryActionType';
import * as messageType from '../../../actions/message/messageActionType';
import * as commonType from '../../../actions/common/commonActionType';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import _ from 'lodash';
import { print} from '../../../../utilities/printUtilities';
import {alsTakeLatest} from '../../als/alsLogSaga';

function* fetchEnquiryResult(action) {
        let { param } = action;
        let url = '/ana/appointmentEnquiry';
        let { data } = yield call(maskAxios.post, url, param);

        if (data.respCode === 0) {
            let enquiryResult = data.data;
            for (let i = 0; i < enquiryResult.length; i++) {
                if (enquiryResult[i].patientDto) {
                    enquiryResult[i].patientDto = PatientUtil.transferPatientDocumentPair(_.cloneDeep(enquiryResult[i].patientDto));
                }
            }
            yield put({ type: type.LOAD_ENQUIRY_RESULT, result: enquiryResult });
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110320'
                }
            });
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
}

function* getEnquiryResult() {
    yield alsTakeLatest(type.FETCH_ENQUIRY_RESULT, fetchEnquiryResult);
}

function* printApptReport(action) {
    try {
        let { param } = action;
        let url = '/ana/getAppointmentsReport';
        let { data } = yield call(maskAxios.post, url, param);
        //let { data } = yield call(maskAxios.post, '/appointment/getYellowFeverExemptionLetter', action.params);
        if (data.respCode === 0) {
            yield print({ base64: data.data, callback: action.callback });
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        } else if (data.respCode === 100) {
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110319'
                }
            });
        } else if (data.respCode === 101) {
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110320'
                }
            });
        } else {
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            // yield put({
            //     type: type.UPDATE_FIELD,
            //     updateData: { handlingPrint: false }
            // });
        }
    } catch (error) {
        yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        throw error;
        // yield put({
        //     type: type.UPDATE_FIELD,
        //     updateData: { handlingPrint: false }
        // });
    }
}

function* handleApptReportPrinting() {
    yield alsTakeLatest(type.PRINT_APPT_REPORT, printApptReport);
}

export const apptEnquirySaga = [
    // getHolidayList,
    // handleHolidayListPrinting
    handleApptReportPrinting,
    getEnquiryResult
];