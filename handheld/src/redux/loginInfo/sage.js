import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import {safeSaga} from '../store';
import api from 'api/call';

function* getHospitalList(action) {
    const { } = action.payload;
    try {
        //yield put({ type: ActionTypes.SET_DETAIL, payload: { isLoading: true } });
        const response = yield call(api.login.getHospitalList, {});
        const {hosp_code} = response.data.response

       // const response = {
       //     "hosp_code":["TPH", "PMH", "UCH"]
       // }

        //const { hosp_code=[] } = response;

        yield put({ type: ActionTypes.SET_LOGIN_ROOM, payload: { hospCode: hosp_code }});

    } catch (error) {

    }
}

function* getRoomList(action) {
    const { callback, login_id, hosp_code = 'TPH', dept = 'OT' } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const response = yield call(api.login.getRoomList, { login_id, hosp_code, dept});
        const result = response.data.response

       /* const response = {
            "room_list":[
                {
                    "room_id":"G037",
                    "room_hosp":"TPH",
                    "status":"ACTIVE"
                },
                {
                    "room_id":"G046",
                    "room_hosp":"TPH",
                    "status":"ACTIVE"
                }
            ]
        }*/
        const { room_list } = result;
        
        yield put({ type: ActionTypes.SET_LOGIN_ROOM, payload: { roomList: room_list}});
        callback(response.data.response)
    } catch (error) {
        
    }
}

function* userLogin(action) {
    const { callback, login_id, password, hosp_code, dept } = action.payload;
    try {
        yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const response = yield call(api.login.userLogin, { login_id, password, hosp_code, dept});

        callback(response.data.response)
    } catch (error) {

    }
}


function* watchPatientDetail() {
    yield takeLatest(ActionTypes.FETCH_LOGININFO_HOSPLIST, safeSaga(getHospitalList));
    yield takeLatest(ActionTypes.FETCH_LOGININFO_ROOMLIST, safeSaga(getRoomList));
    yield takeLatest(ActionTypes.SET_ROOM, safeSaga(userLogin));
}

export function* watchers() {
    yield all([
        watchPatientDetail(),
    ]);
}