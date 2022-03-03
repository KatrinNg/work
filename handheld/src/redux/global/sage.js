import { takeLatest, takeEvery, all, put, call, takeLeading } from 'redux-saga/effects';
import * as ActionTypes from '../actionTypes.js';
import {safeSaga} from '../store';
import api from 'api/call';




function* watchGlobalDetail() {
   
}

export function* watchers() {
    yield all([
        watchGlobalDetail(),
    ]);
}