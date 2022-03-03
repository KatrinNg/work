import { select, call, put } from 'redux-saga/effects';
import _ from 'lodash';
import { maskAxios } from '../../../../services/axiosInstance';
import {
    GET_ENCT_LIST, PUT_ENCT_LIST, GET_ROOMS, PUT_ROOMS,
    CREATE_ROOM, GET_ROOM_BY_ID, LOAD_ROOM_DATA, UPDATE_ROOM,
    DELETE_ROOM, RESET_ALL,RESET_ROOM_DATA
} from '../../../actions/administration/roomManagement/roomManagementActions';
import { alsTakeEvery } from '../../als/alsLogSaga';
import * as messageType from '../../../actions/message/messageActionType';
// import { PAGE_STATUS } from '../../../../enums/administration/roomManagement/roomManagementEnum';
import { isActiveEnctType } from '../../../../utilities/enctrAndRoomUtil';
import {GET_ENCOUNTER_TYPE_LIST,GET_SVC_ENCTYPES,LIST_ROOMS,SET_ROOMS} from '../../../actions/common/commonActionType';

function* updateCommonEnct() {
    yield put({ type: GET_ENCOUNTER_TYPE_LIST, isGetNew: true });
    yield put({ type: GET_SVC_ENCTYPES });
}

function* updateCommonRoom(){
    yield put({type:LIST_ROOMS});
}

function* getEnctList() {
    yield alsTakeEvery(GET_ENCT_LIST, function* () {
        const svcCd = yield select(state => state.login.service && state.login.service.svcCd);
        // const pageStatus = yield select(state => state.roomManagement.pageStatus);
        const selSite = yield select(state => state.roomManagement.roomGeneralData.changingInfo.siteId);
        const assignedList = yield select(state => state.roomManagement.assignedList);
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + svcCd + '&withRooms=N');
        if (data.respCode === 0) {
            let _enctList = _.cloneDeep(data.data || []);
            _enctList = _enctList.filter(item => item.siteId === selSite || item.siteId === undefined);
            // if (pageStatus === PAGE_STATUS.ADDING || pageStatus === PAGE_STATUS.EDITING) {
                _enctList = _enctList.filter(item => isActiveEnctType(item));
            // }
            if (assignedList.length > 0) {
                _enctList = _enctList.filter(item => assignedList.findIndex(enct => item.encntrTypeId === enct.encntrTypeId) === -1);
            }
            _enctList = _enctList.map(item => {
                return {
                    ...item,
                    displayStr: `[${item.encntrTypeCd}] ${item.encntrTypeDesc}`
                };
            });
            yield put({ type: PUT_ENCT_LIST, availList: _enctList });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* listRooms() {
    yield alsTakeEvery(GET_ROOMS, function* () {
        const svcCd = yield select(state => state.login.service && state.login.service.svcCd);
        let { data } = yield call(maskAxios.get, `cmn/services/${svcCd}/rooms`);
        if (data.respCode === 0) {
            yield put({ type: PUT_ROOMS, rooms: data.data });
            yield put({ type: SET_ROOMS, data: data.data });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* getRoomById() {
    yield alsTakeEvery(GET_ROOM_BY_ID, function* (action) {
        const { rmId } = action;
        let { data } = yield call(maskAxios.get, `cmn/rooms/${rmId}`);
        if (data.respCode === 0) {
            yield put({ type: LOAD_ROOM_DATA, room: data.data });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* createRoom() {
    yield alsTakeEvery(CREATE_ROOM, function* (action) {
        const { params } = action;
        const siteId = yield select(state => state.roomManagement.roomGeneralData.changingInfo.siteId);
        let { data } = yield call(maskAxios.post, `cmn/sites/${siteId}/rooms`, params);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111701',
                    showSnackbar: true
                }
            });
            // yield put({ type: RESET_ROOM_DATA });
            yield call(updateCommonEnct);
            // yield call(updateCommonRoom);
            const doCloseCallbackFunc = yield select(state => state.roomManagement.doCloseCallbackFunc);
            if (doCloseCallbackFunc) {
                doCloseCallbackFunc(true);
            } else {
                yield put({ type: RESET_ALL });

                // yield put({
                //     type: GET_ROOMS
                // });
            }
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111702'
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111706'
                }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* updateRoom() {
    yield alsTakeEvery(UPDATE_ROOM, function* (action) {
        const { params } = action;
        const siteId = yield select(state => state.roomManagement.roomGeneralData.changingInfo.siteId);
        let { data } = yield call(maskAxios.put, `cmn/sites/${siteId}/rooms`, params);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111703',
                    showSnackbar: true
                }
            });

            // yield put({ type: RESET_ROOM_DATA });
            yield call(updateCommonEnct);
            // yield call(updateCommonRoom);
            const doCloseCallbackFunc = yield select(state => state.roomManagement.doCloseCallbackFunc);
            if (doCloseCallbackFunc) {
                doCloseCallbackFunc(true);
            } else {
                yield put({ type: RESET_ALL });
                // yield put({
                //     type: GET_ROOMS
                // });
            }
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111706'
                }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* deleteRoom() {
    yield alsTakeEvery(DELETE_ROOM, function* (action) {
        const { params } = action;
        const siteId = yield select(state => state.roomManagement.roomGeneralData.changingInfo.siteId);
        let { data } = yield call(maskAxios.delete, `cmn/sites/${siteId}/rooms`, { data: params });
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111704',
                    showSnackbar: true
                }
            });
            // yield put({ type: RESET_ALL });
            yield call(updateCommonEnct);
            // yield call(updateCommonRoom);
            yield put({ type: RESET_ROOM_DATA });

            yield put({
                type: GET_ROOMS
            });
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111707'
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111705'
                }
            });
        } else if (data.respCode === 102) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111705'
                }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

export const roomManagementSaga = [
    getEnctList,
    listRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
];