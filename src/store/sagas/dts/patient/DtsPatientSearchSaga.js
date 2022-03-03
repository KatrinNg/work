import { take, takeLatest, takeEvery, put, call, select, all } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as dtsPatientSearchActionType from '../../../actions/dts/patient/DtsPatientSearchActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import * as commonService from '../../../../services/dts/commonService';
import * as messageType from '../../../actions/message/messageActionType';

function* fetchSearchPatient(action) {
    try {
        yield put(alsStartTrans());
        const countryList = yield select(state => state.patient.countryList);

        const {id, params} = action;

        let patientListResult = yield call(commonService.getPatient, params, true);
        let patientList = patientListResult.data;
        if (patientList.respCode === 0){
            if (!patientList.data) {
                throw new Error('Service error');
            }
            let patientListData = patientList.data;
            yield put({ type: dtsPatientSearchActionType.SEARCH_PATIENT_SAGA, id, data: patientListData, countryList });
        } else if (patientList.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110148',
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
    }finally{
        yield put(alsEndTrans());
    }
}

function* searchPatient() {
    yield takeLatest(dtsPatientSearchActionType.SEARCH_PATIENT, fetchSearchPatient);
}


export const dtsPatientSearchSaga = [
    searchPatient
];