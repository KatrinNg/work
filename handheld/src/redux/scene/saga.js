import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import { safeSaga } from '../store';
import api from 'api/call';


function* getSceneData(action) {
    const { callback = () => {},login_id,room_id,hosp_code,dept } = action.payload;
    try {
            const res = yield call(api.scene.getSceneData,{login_id,room_id,hosp_code,dept})
            const response = res.data.response;
            callback(response);
            yield put({ type: ActionTypes.SET_SCENE_DATA, payload: { sceneData: response } });

    } catch (error) {
        console.log(error);
    }
}

function* watchScene() {
    yield takeLatest(ActionTypes.FETCH_SCENE_DATA, safeSaga(getSceneData));
}

export function* watchers() {
    yield all([
        watchScene(),
    ]);
}