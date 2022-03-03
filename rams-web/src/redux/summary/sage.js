

import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import {safeSaga} from '../store';
import api from 'api/call';


function* getSummaryList(action) {
    const { } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.summary.getPatientSummaryList, action.payload);
        const response = res.data.response
        // console.log(response1,'response1')
        if (typeof response.prescription_data === 'string') {
            response.prescription_data = [];
        }
        if (typeof response.treatment_record === 'string') {
            response.treatment_record = [];
        }
        //const { prescription_data } = response;
        yield put({ type: ActionTypes.SET_SUMMARY, payload: {patientSummary: response } });
        
    } catch (error) {
        
    }
}


function* watchSummaryDetail() {
    yield takeLatest(ActionTypes.FETCH_PATIENT_SUMMARY_LIST, safeSaga(getSummaryList));
}

export function* watchers() {
    yield all([
        watchSummaryDetail(),
    ]);
}