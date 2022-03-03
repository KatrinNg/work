

import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import { isString } from 'utility/utils.js';
import api from 'api/call';
import moment from 'moment'

function* getDashBoardList(action) {
    const { dept } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.dashboard.getDashBoardList, action.payload);
        const response = res.data.response
      
        let { room_data = [], system_dtm } = response;
        if (Array.isArray(room_data)) {
            const params = {
                login_id:"@CMSIT",
                hosp_code:"TPH",
                case_no: room_data.map(i => i.case_no)
            }
            const finalResult = yield call(api.dashboard.getDashBoardPatientInfo, params);
            const infoData = finalResult.data.response;
            const { evital_record = [] } = infoData;
            room_data.forEach(i => {
                const currentInfo = evital_record.find(v => v.case_no === i.case_no);
                i.spo2 = currentInfo ? currentInfo.spo2 : '';
                i.pulse = currentInfo ? currentInfo.pulse : '';
            })
            yield put({ type: ActionTypes.SET_DASHBOARD_LIST, payload: {dataList: room_data,systemDtm: system_dtm, lastUpdateTime: moment(new Date()).format('HH:mm:ss') } });
        } else {
            yield put({ type: ActionTypes.SET_DASHBOARD_LIST, payload: {dataList: [], lastUpdateTime: moment(new Date()).format('HH:mm:ss') } });
        }

    } catch (error) {
        
    }
}

function* getHotTimesList(action) {
    const { dept } = action.payload;
    try {
        // yield put({ type: ActionTypes.SET_GLOBAL, payload: { isLoading: true } });
        const res = yield call(api.dashboard.getHotTimesList, action.payload);
        const response1 = res.data.response
        
        const { hot_items } = response1;
        if (Array.isArray(hot_items)) {
            yield put({ type: ActionTypes.SET_DASHBOARD_LIST, payload: {hotItems: hot_items } });
        } else {
            yield put({ type: ActionTypes.SET_DASHBOARD_LIST, payload: {hotItems: [] } });
        }
        
    } catch (error) {
        
    }
}


function* watchSummaryDetail() {
    yield takeLatest(ActionTypes.FETCH_DASHBOARD_LIST, safeSaga(getDashBoardList));
    yield takeLatest(ActionTypes.FETCH_HOTITEMS_LIST, safeSaga(getHotTimesList));
}

export function* watchers() {
    yield all([
        watchSummaryDetail(),
    ]);
}