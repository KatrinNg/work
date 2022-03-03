import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';

function* getBatchPatientList(action) {

    const { login_id, hosp_code, dept } = action.payload;

    try {
        const response = yield call(api.batchMode.getBatchPatientList, { login_id, hosp_code, dept });

        if(response.status === 200){
            yield put({ type: ActionTypes.SET_BATCHMODE_DATA, payload: { batchPatientList: response.data.response.patient_requests } });
        }

    } catch (error) {
        console.log(error)
    }
}

function* getRoomList(action) {
    const { login_id, hosp_code, dept } = action.payload;

    try {
         const response = yield call(api.batchMode.getBatchRoomList, { login_id, hosp_code, dept });

         if(response.status === 200){
                yield put({ type: ActionTypes.SET_BATCHMODE_DATA, payload: { batchRoomList: response.data.response.room_list } });
         }

    } catch (error) {
        console.log(error)
    }
}

function* getTherapistList(action){
    const { login_id, hosp_code, dept } = action.payload;

    try {
         const response = yield call(api.batchMode.getTherapistList, { login_id, hosp_code, dept });

         if(response.status === 200){
                yield put({ type: ActionTypes.SET_BATCHMODE_DATA, payload: { batchTherapistList: response.data.response.therapist_list} });
         }

    } catch (error) {
        console.log(error)
    }
}

function* saveBatchPatientList(action) {
    const { callback, login_id, hosp_code, dept, patient_requests } = action.payload;

    try {

        const response = yield call(api.batchMode.saveBatchPatientList, {login_id, hosp_code, dept, patient_requests, action: action.payload.action});
    console.log(response,"response saga")
        if(response.status === 200){
            callback(response)
        }


    } catch (error) {
        console.log(error)
    }

}


function* watchBatchMode() {
    yield takeLatest(ActionTypes.FETCH_BATCHMODE_PATIENT_LIST, safeSaga(getBatchPatientList));
    yield takeLatest(ActionTypes.SAVE_BATCHMODE_PATIENT_LIST, safeSaga(saveBatchPatientList));
    yield takeLatest(ActionTypes.FETCH_BATCHMODE_THERAPIST_LIST, safeSaga(getTherapistList));
    yield takeLatest(ActionTypes.FETCH_BATCHMODE_ROOM_LIST, safeSaga(getRoomList));
}

export function* watchers() {
    yield all([
        watchBatchMode(),
    ]);
}