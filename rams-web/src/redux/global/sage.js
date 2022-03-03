import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import {safeSaga} from '../store';
import api from 'api/call';

function* loginToGetBasicInfo(action) {
    const { cacheKey } = action.payload;
    try {
//         const response = yield call(api.global.getBasicInfo, {cache_key: cacheKey});
//         console.log(response);
        yield put({
                type: ActionTypes.GET_BASIC_INFO,
                payload: {
                    loginInfo: {
                        login_id: "@CMSIT",
                        dept: "OT",
                        hosp_code: "TPH"
                    },
                    isLogin: true
                }
            });
  } catch (error) {
  }
}

function* watchGlobalDetail() {
    yield takeLatest(ActionTypes.FETCH_BASIC_INFO, safeSaga(loginToGetBasicInfo));
   
}


export function* watchers() {
    yield all([
        watchGlobalDetail(),
    ]);
}