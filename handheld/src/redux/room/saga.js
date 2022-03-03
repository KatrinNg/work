import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';

function* patientCheckInAndOut(action){
    const { callback, login_id, hosp_code, dept, room_id, case_no } = action.payload;

    try {
        //yield put({ type: ActionTypes.SET_DETAIL, payload: { isLoading: true } });
        const response = yield call(api.room.patientCheckInAndOut, {login_id, hosp_code, dept, room_id, case_no, action:action.payload.action});
    console.log(response,"saga room")
    if(response.status === 200){
        callback(response.data)
    } else{
        console.log(response,"response")
    }

      // yield put({ type: ActionTypes.SET_ROOM_DATA, payload: { roomInOut: response } });
    } catch (error){
        console.log(error)
    }
}
function* getTreatmentRecord(action){
    const { callback, login_id, hosp_code, dept, case_no } = action.payload

    try{
        const response = yield call(api.patientDetail.getTreatmentRecord, {login_id, hosp_code, dept, case_no})

        if(response.status === 200){
            callback(response.data.response)
        }
    } catch(error){
        console.log(error)
    }
}

function* watchRoom() {
    yield takeLatest(ActionTypes.FETCH_ROOM_IN_OUT, safeSaga(patientCheckInAndOut));
    yield takeLatest(ActionTypes.FETCH_ROOM_TREATMENT_RECORD, safeSaga(getTreatmentRecord));
}

export function* watchers() {
    yield all([
        watchRoom(),
    ]);
}