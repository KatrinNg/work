import { take, call, put, select, all } from 'redux-saga/effects';
// import { maskAxios } from '../../../../services/axiosInstance';
import * as defaultRoomType from '../../../actions/dts/patient/DtsDefaultRoomActionType';
import * as patientType from '../../../actions/patient/patientActionType';
import * as messageType from '../../../actions/message/messageActionType';
import * as dentalService from '../../../../services/dts/dentalService';
import { GD_SPECIALTY_CODE } from '../../../../constants/dts/patient/DtsDefaultRoomConstant';

function* getDefaultRoomList() {
    while (true) {
        let { patientKey, activeOnly } = yield take(defaultRoomType.GET_DEFAULT_ROOM_LIST);
        let { data } = yield call(dentalService.getDefaultRoomList, patientKey, activeOnly, true);
        // console.info('############################################## getDefaultRoomList1: ' + (yield select(state => state.dtsDefaultRoom.activeOnly)));
        if (data.respCode === 0) {
            yield put({
                type: defaultRoomType.UPDATE_STATE,
                updateData: { defaultRoomList: data.data || [] }
            });
            // console.info('############################################## getDefaultRoomList2: ' + (yield select(state => state.dtsDefaultRoom.activeOnly)));
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getDefaultRoomLogList() {
    while (true) {
        let { defaultRoomId } = yield take(defaultRoomType.GET_DEFAULT_ROOM_LOG_LIST);
        let { data } = yield call(dentalService.getDefaultRoomLogList, defaultRoomId, true);
        if (data.respCode === 0) {
            yield put({
                type: defaultRoomType.UPDATE_STATE,
                updateData: { defaultRoomLogList: data.data || [] }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* putDefaultRoom() {
    while (true) {
        let { defaultRoom, callback } = yield take(defaultRoomType.PUT_DEFAULT_ROOM);
        let service = yield select(state => state.login.service);
        let { data } = yield call(dentalService.putDefaultRoom, defaultRoom, true);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });
            yield put({
                type: defaultRoomType.GET_GD_DEFAULT_ROOM,
                params: {
                    patientKey: defaultRoom.patientKey,
                    serviceCd: service.serviceCd
                }
            });
            callback && callback();
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
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
    }
}
function* deleteDefaultRoom() {
    while (true) {
        let { defaultRoomId, callback } = yield take(defaultRoomType.DELETE_DEFAULT_ROOM);
        let service = yield select(state => state.login.service);
        let patientInfo = yield select(state => state.patient.patientInfo);
        let { data } = yield call(dentalService.deleteDefaultRoom, defaultRoomId, true);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '140003',
                    showSnackbar: true
                }
            });
            yield put({
                type: defaultRoomType.GET_GD_DEFAULT_ROOM,
                params: {
                    patientKey: patientInfo.patientKey,
                    serviceCd: service.serviceCd
                }
            });
            callback && callback();
        } else if (data.respCode === 20000) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '140004'
                },
                showSnackbar: true,
                variant: 'warning'
            });
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                },
                showSnackbar: true,
                variant: 'warning'
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* getGdDefaultRoom() {
    while (true) {
        const { params } = yield take(defaultRoomType.GET_GD_DEFAULT_ROOM);
        const specialties = yield select(state => state.dtsPreloadData.allSpecialties);
        const defaultRooms = yield call(dentalService.getDefaultRoomList, params.patientKey, true, false);
        const defaultRoomsData = defaultRooms.data;
        if (defaultRoomsData && defaultRoomsData.respCode === 0) {
            const GD = specialties.find(specialty => specialty.sspecCd === GD_SPECIALTY_CODE);
            const defaultRoom = defaultRoomsData.data.find(defaultRoom => defaultRoom.specialtyId === GD.sspecId && defaultRoom.isDischarged === 0 && defaultRoom.isReferral === 0);
            if (defaultRoom && defaultRoom.roomId) {
                // console.info('############################################## getGdDefaultRoom1: ' + (yield select(state => state.dtsDefaultRoom.activeOnly)));
                yield put({
                    type: patientType.UPDATE_STATE,
                    updateData: { defaultRoomId: defaultRoom.roomId }
                });
                // console.info('############################################## getGdDefaultRoom2: ' + (yield select(state => state.dtsDefaultRoom.activeOnly)));
            } else {
                yield put({
                    type: patientType.UPDATE_STATE,
                    updateData: { defaultRoomId: null }
                });
            }
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

export const dtsDefaultRoomSaga = [getDefaultRoomList, putDefaultRoom, deleteDefaultRoom, getGdDefaultRoom, getDefaultRoomLogList];
