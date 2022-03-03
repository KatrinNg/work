import { takeEvery, select, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as enctActionType from '../../../actions/administration/enctManagement';
import * as messageType from '../../../actions/message/messageActionType';
import * as CommonType from '../../../actions/common/commonActionType';
import _ from 'lodash';
import { PAGE_STATUS } from '../../../../enums/administration/enctManagement';
import Enum from '../../../../enums/enum';
import {CommonUtil, AdminUtil, EnctrAndRmUtil} from '../../../../utilities';
import {alsTakeEvery} from '../../als/alsLogSaga';

function* updateState(data) {
    yield put({
        type: enctActionType.UPDATE_STATE,
        updateData: { ...data }
    });
}

function* getEnctList() {
    yield alsTakeEvery(enctActionType.GET_ENCT_LIST, function* () {
        const svcCd = yield select(state => state.login.service && state.login.service.svcCd);
        const clinicList = yield select(state => state.common.clinicList);
        // let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + svcCd + '&withRooms=Y');
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + svcCd + '&withRooms=N');
        if (data.respCode === 0) {
            const _enctList = AdminUtil.fetchEnctList(_.cloneDeep(data.data), clinicList);
            yield put({ type: enctActionType.UPDATE_ENCT_LIST, data: _enctList });
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

function* initEnctInfo(data) {
    let enctSelectedRoom = data.roomDtoList || [];
    yield put({
        type: enctActionType.INIT_ENCT_INFO,
        originalInfo: data,
        changingInfo: AdminUtil.initExistEnct(data),
        enctSelectedRoom
    });
}

function* getEnctById() {
    yield alsTakeEvery(enctActionType.GET_ENCT_BY_ID, function* (action) {
        const { encntrTypeId } = action;
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes/' + encntrTypeId);
        if (data.respCode === 0) {
            yield call(initEnctInfo, _.cloneDeep(data.data));
            yield call(updateState, { pageStatus: PAGE_STATUS.EDITING });
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

function* createEnct() {
    yield alsTakeEvery(enctActionType.CREATE_ENCT, function* () {
        const newEnct = AdminUtil.initNewEnct();
        yield put({
            type: enctActionType.INIT_ENCT_INFO,
            changingInfo: newEnct,
            originalInfo: null,
            enctSelectedRoom: []
        });
        yield call(updateState, { pageStatus: PAGE_STATUS.ADDING });
    });
}

function* initRooms() {
    yield alsTakeEvery(enctActionType.INIT_ROOMS, function* () {
        const service = yield select(state => state.login.service);
        let { data } = yield call(maskAxios.get, '/cmn/services/' + service.svcCd + '/rooms');
        if (data.respCode === 0) {
            const changingInfo = yield select(state => state.enctManagement.enctDetailGeneral.changingInfo);
            const selectedList = yield select(state => state.enctManagement.enctDetailRoom.selectedList);
            let _rooms = data.data.filter(item => EnctrAndRmUtil.isActiveRoom(item) && (changingInfo.siteId === -1 || item.siteId === changingInfo.siteId));

            let _selectedList = selectedList.map(item => {
                return {
                    ...item,
                    displayStr: `[${CommonUtil.getSiteCodeBySiteId(item.siteId)}] ${item.rmDesc}`
                };
            });
            _selectedList=_selectedList.filter(item=>EnctrAndRmUtil.isActiveRoom(item));
            let _availableList = _rooms.filter(item => _selectedList.findIndex(s => s.rmId === item.rmId) === -1).map(item => {
                return {
                    ...item,
                    displayStr: `[${CommonUtil.getSiteCodeBySiteId(item.siteId)}] ${item.rmDesc}`
                };
            });
            yield put({ type: enctActionType.LOAD_ROOMS, availableList: _availableList, selectedList: _selectedList });
        } else {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
        }
    });
}

function* updateCommonEnct() {
    yield put({ type: CommonType.GET_ENCOUNTER_TYPE_LIST, isGetNew: true });
    yield put({ type: CommonType.GET_SVC_ENCTYPES });
}

function* insertEnct() {
    yield alsTakeEvery(enctActionType.INSERT_ENCT, function* (action) {
        let { enctDto } = action;
        let { data } = yield call(maskAxios.post, '/cmn/encounterTypes', enctDto);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110351',
                    showSnackbar: true
                }
            });
            yield call(updateCommonEnct);
            const doCloseCallbackFunc = yield select(state => state.enctManagement.doCloseCallbackFunc);
            if (doCloseCallbackFunc) {
                doCloseCallbackFunc(true);
            }else{
              yield put({ type: enctActionType.RESET_ALL });
            }
        } else if (data.respCode === 100) {
            //Duplicate records with encounter type code
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110353'
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

function* updateEnct() {
    yield alsTakeEvery(enctActionType.UPDATE_ENCT, function* (action) {
        let { enctDto } = action;
        let { data } = yield call(maskAxios.put, '/cmn/encounterTypes', enctDto);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110352',
                    showSnackbar: true
                }
            });

            yield call(updateCommonEnct);
            const doCloseCallbackFunc = yield select(state => state.enctManagement.doCloseCallbackFunc);
            if(doCloseCallbackFunc) {
                doCloseCallbackFunc(true);
            }else{
                yield put({ type: enctActionType.RESET_ALL });
            }
        }  else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        }else if (data.respCode === 100) {
            //Duplicate records with encounter type code
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110353'
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

function* deleteEnct() {
    yield alsTakeEvery(enctActionType.DELETE_ENCT, function* (action) {
        const { encntrTypeIds } = action;
        let { data } = yield call(maskAxios.delete, '/cmn/encounterTypes/' + encntrTypeIds.join(','));
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110347',
                    showSnackbar: true
                }
            });
            yield put({ type: enctActionType.GET_ENCT_LIST });
            const enctList = yield select(state => state.enctManagement.enctList);
            yield call(updateState, {
                enctList: {
                    ...enctList,
                    selected: []
                }
            });
            yield call(updateCommonEnct);
        }  else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        }else if (data.respCode === 100) {
            //can not find
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110354',
                    showSnackbar: true
                }
            });
        } else if (data.respCode === 101) {
            //can not delete the encounter type have rooms
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110355'
                }
            });
        } else if (data.respCode === 102) {
            //can not delete the encounter type have booking
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110356'
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

export const enctManagementSaga = [
    getEnctList,
    createEnct,
    getEnctById,
    initRooms,
    updateEnct,
    insertEnct,
    deleteEnct
];