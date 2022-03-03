import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';


function* getGroupList(action) {
    const { login_id, dept, start_date, end_date, room_id, hosp_code } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_DETAIL, payload: { isLoading: true } });
        const params = {  login_id, dept, start_date, end_date, room_id, hosp_code }
        const res = yield call(api.group.getTherapeuticGroupList, params);
        const response = res.data.response;
        const { therapeutic_group_dept } = response;
        const groupList = Array.isArray(therapeutic_group_dept)? therapeutic_group_dept : [];
        yield put({ type: ActionTypes.SET_GROUP, payload: { groupList: groupList, isLoading: false } });

    } catch (error) {
    console.log(error)
    }
}

function* getGroupPatientDetail(action) {
    const { login_id, dept, hosp_code, room_id, category, group_name, treatment_date } = action.payload;
    try {
        const params = { login_id, dept, hosp_code, room_id, category, group_name, treatment_date }
        const res = yield call(api.group.getTherapeuticGroupDetail, params);
        const response = res.data.response;
        const { therapeutic_patient_data } = response;
        const groupDetailList = Array.isArray(therapeutic_patient_data)? therapeutic_patient_data : [];

        yield put({ type: ActionTypes.SET_GROUP_DETAIL, payload: { groupDetailList: groupDetailList } });

    } catch (error) {

    }
}

function* handlePatientInGroup(action) {
    const { callback = () => null, requestData } = action.payload;
    try {
        const res = yield call(api.group.setTherapeuticGroup, requestData);
        const response = res.data.response;
        callback(response);

    } catch (error) {

    }
}


function* watchPatientDetail() {
    yield takeLatest(ActionTypes.FETCH_GROUP_LIST, safeSaga(getGroupList));
    yield takeLatest(ActionTypes.FETCH_GROUP_DETAIL, safeSaga(getGroupPatientDetail));
    yield takeLatest(ActionTypes.HANDLE_PATIENT_IN_GROUP, safeSaga(handlePatientInGroup));
}

export function* watchers() {
    yield all([
        watchPatientDetail(),
    ]);
}