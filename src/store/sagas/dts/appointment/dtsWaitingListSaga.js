import { take, call, put } from 'redux-saga/effects';
import { maskAxios, axios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';

import * as waitingListActionType from '../../../actions/dts/appointment/waitingListActionType';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as apptService from '../../../../services/ana/appointmentService';
import * as commonService from '../../../../services/dts/commonService';
import * as dentalService from '../../../../services/dts/dentalService';
import moment from 'moment';
import Enum from '../../../../enums/enum';

import _ from 'lodash';

const messageAction = (msgCode)=>({type: messageType.OPEN_COMMON_MESSAGE,payload:{msgCode}});

function* getWaitingList() {
    while(true){
        let { params, callback } = yield take(waitingListActionType.GET_WAITING_LIST);

        console.log('dtsWaitingListSaga.js > getWaitingList() > '+JSON.stringify(params));

        let { data } = yield call(dentalService.getWaitingList, params);

        if (data.respCode === 0) {
            let waitingList = {waitingList: data.data};
            yield put({ type: waitingListActionType.GET_WAITING_LIST_SAGA, waitingList: waitingList });

            if (callback && typeof callback === 'function'){
                callback();
            }
        } else {
            yield put(messageAction('110031'));
        }

    }
}

function* insertWaitingList() {
    while(true){
        let { params, callback } = yield take(waitingListActionType.INSERT_WAITING_LIST);

        console.log('dtsWaitingListSaga.js > insertWaitingList() > '+JSON.stringify(params));

        let { data } = yield call(dentalService.insertWaitingList,params);
        //let data = 1;
        if (data.respCode === 0) {
            //let waitingList = {waitingList : data.data};
            //yield put({ type: waitingListActionType.INSERT_WAITING_LIST_SAGA, waitingList: waitingList });

            if (callback && typeof callback === 'function'){
                callback();
            }
        } else {
            yield put(messageAction('110031'));
        }

    }
}

function* getRoomList() {
    while(true){
        let { params, callback } = yield take(waitingListActionType.GET_ROOM_LIST);

        console.log('dtsSearchAppointmentSaga.js > getRoomList() > '+JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/cmn/sites/'+params.siteId+'/rooms');
        // let { data } = yield call(maskAxios.post, '/dental/mockRoomList', {clinicCd:params.clinicCd});
        if (data.respCode === 0) {
            let roomList = {roomList : data.data};
            yield put({ type: waitingListActionType.GET_ROOM_LIST_SAGA, roomList: roomList });

            if (callback && typeof callback === 'function'){
                callback();
            }
        } else {
            yield put(messageAction('110031'));
        }

    }
}

function* updateWaitingList() {
    while(true){
        let { waitingListId, params, callback } = yield take(waitingListActionType.UPDATE_WAITING_LIST);

        console.log('dtsWaitingListSaga.js > updateWaitingList() > '+ waitingListId, JSON.stringify(params));

        let { data } = yield call(dentalService.updateWaitingList,waitingListId,params);
        if (data.respCode === 0) {
            if (callback && typeof callback === 'function'){
                callback();
            }
        } else {
            yield put(messageAction('110031'));
        }

    }
}

export const dtsWaitingListSaga = [
    getWaitingList,
    insertWaitingList,
    getRoomList,
    updateWaitingList
];