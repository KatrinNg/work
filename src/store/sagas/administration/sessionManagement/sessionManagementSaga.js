import { select, call, put, takeLatest, all } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as sessionManagementActionType
    from '../../../actions/administration/sessionManagement/sessionManagementActionType';
import * as messageType from '../../../actions/message/messageActionType';
import _ from 'lodash';
import * as commonType from '../../../actions/common/commonActionType';

import {alsTakeLatest} from '../../als/alsLogSaga';

function* getSessionOfService(action) {
    let {data} = yield call(maskAxios.get, 'cmn/services/' + action.svcCd + '/sessions?withoutEfft=Y');
    if (data.respCode === 0) {
        const clinicList = yield select(state => state.common.clinicList);

        let completeData = data.data;

        /*****
         *     modified by Kk Lam - 2021-02-25
         *     prevent getting value from undefined object
         *     filter inactive site
        ******/
        const filteredData = [];
        completeData.forEach(data => {
            clinicList.forEach(clinic => {
                if (clinic.siteId === data.siteId) {
                    data.siteEngName = clinic.siteEngName;
                    filteredData.push(data);
                }
            });
        });

        yield put({
            type: sessionManagementActionType.GET_SESSIONS_OF_SERVICE,
            data: _.sortBy(filteredData, ['siteEngName', 'sessDesc', 'updateDtm'])
        });

        /*
        for (const key in completeData) {
            if (clinicList.find(x => x.siteId === completeData[key].siteId) !== undefined){
                completeData[key].siteEngName = clinicList.find(x => x.siteId === completeData[key].siteId).siteEngName;
            }
        }

        yield put({
            type: sessionManagementActionType.GET_SESSIONS_OF_SERVICE,
            data: _.sortBy(completeData, ['siteEngName', 'sessDesc', 'updateDtm'])
        });
        */
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({type: sessionManagementActionType.GET_SESSIONS_OF_SERVICE, data: []});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* listSessionOfService() {
    yield alsTakeLatest(sessionManagementActionType.LIST_SESSION_OF_SERVICE, getSessionOfService);
}

function* getSessionOfSite(action) {
    let {data} = yield call(maskAxios.get, 'cmn/sites/' + action.siteId + '/sessions?withoutEfft=Y');

    if (data.respCode === 0) {
        const clinicList = yield select(state => state.common.clinicList);

        let completeData = data.data;

        for (const key in completeData) {
            completeData[key].siteEngName = clinicList.find(x => x.siteId === completeData[key].siteId).siteEngName;
        }

        yield put({
            type: sessionManagementActionType.GET_SESSIONS_OF_SITE,
            data: _.sortBy(completeData, ['siteEngName', 'sessDesc', 'updateDtm'])
        });
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({type: sessionManagementActionType.GET_SESSIONS_OF_SITE, data: []});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* listSessionOfSite() {
    yield alsTakeLatest(sessionManagementActionType.LIST_SESSION_OF_SITE, getSessionOfSite);
}

function* getSingleSessionById(action) {
    let {data} = yield call(maskAxios.get, 'cmn/sessions/' + action.sessId);
    if (data.respCode === 0) {
        yield put({type: sessionManagementActionType.GET_SINGLE_SESSIONS_BY_ID, data: data.data});
    } else if (data.respCode === 1) {
        //todo parameterException
    } else {
        yield put({type: sessionManagementActionType.GET_SINGLE_SESSIONS_BY_ID, data: []});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* listSingleSessionById() {
    yield alsTakeLatest(sessionManagementActionType.LIST_SESSION_OF_SINGLE_SESSION, getSingleSessionById);
}

function* postSession(action) {
    let {data} = yield call(maskAxios.post, '/cmn/sites/' + action.siteId + '/sessions', action.params);
    if (data.respCode === 0) {
        yield put({type: sessionManagementActionType.CLOSE_SESSION_MANAGEMENT_DIALOG});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    {name: 'MESSAGE', value: 'The record has been successfully created.'}
                ],
                showSnackbar: true
            }
        });
        yield put({type: sessionManagementActionType.UPDATE_SESSION_CONFIG});
    } else if (data.respCode === 1) {
        //todo parameterException
    } else if (data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032',
                showSnackbar: true
            }
        });
    } else if(data.respCode === 100){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    {name: 'MESSAGE', value: 'This session has been created in selected clinic.'}
                ],
                showSnackbar: true
            }
        });
    }else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    {name: 'MESSAGE', value: data.errMsg}
                ],
                showSnackbar: true
            }
        });
    }
}

function* createSession() {
    yield alsTakeLatest(sessionManagementActionType.CREATE_SESSION, postSession);
}

function* putSession(action) {
    let {data} = yield call(maskAxios.put, '/cmn/sessions/' + action.sessId, action.params);
    if (data.respCode === 0) {
        yield put({type: sessionManagementActionType.CLOSE_SESSION_MANAGEMENT_DIALOG});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    {name: 'MESSAGE', value: 'The record has been successfully updated.'}
                ],
                showSnackbar: true
            }
        });
        yield put({type: sessionManagementActionType.UPDATE_SESSION_CONFIG});
    } else if (data.respCode === 1) {
        //todo parameterException
    } else if (data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032',
                showSnackbar: true
            }
        });
    } else if(data.respCode === 102){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            params: [
                {name: 'MESSAGE', value: 'The record is in using. It cannot be updated.'}
            ],
            payload: {
                msgCode: '130600'
            }
        });
    } else if(data.respCode === 103){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    {name: 'MESSAGE', value: 'This session has been created in selected clinic.'}
                ],
                showSnackbar: true
            }
        });
    } else {
        // yield put({ type: sessionManagementActionType.GET_SINGLE_SESSIONS_BY_ID, data: [] });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* updateSession() {
    yield alsTakeLatest(sessionManagementActionType.UPDATE_SESSION, putSession);
}

function* softdeleteSession(action) {
    let { params,callback } = action;
    let {data} = yield call(maskAxios.delete, '/cmn/sessions/' + params.sessId, {data: params});
    if (data.respCode === 0) {
        yield put({type: sessionManagementActionType.CLOSE_SESSION_MANAGEMENT_DIALOG});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    {name: 'MESSAGE', value: 'The record has been successfully deleted.'}
                ],
                showSnackbar: true
            }
        });
        // yield put({type: sessionManagementActionType.LIST_SESSION_OF_SERVICE, svcCd: action.params.svcCd});
        yield put({type: sessionManagementActionType.UPDATE_SESSION_CONFIG});
        callback && callback(data);
    } else if (data.respCode === 1) {
        //todo parameterException
    } else if (data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032',
                showSnackbar: true
            }
        });
    } else if (data.respCode === 102) {
        yield put({type: sessionManagementActionType.GET_SINGLE_SESSIONS_BY_ID, data: []});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            params: [
                {name: 'MESSAGE', value: 'The record is in using. It cannot be deleted.'}
            ],
            payload: {
                msgCode: '130600'
            }
        });
    } else {
        yield put({type: sessionManagementActionType.GET_SINGLE_SESSIONS_BY_ID, data: []});
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* deleteSession() {
    yield alsTakeLatest(sessionManagementActionType.DELETE_SESSION, softdeleteSession);
}

function* updateSessionConfig() {
    let siteId = yield select(state => state.login.clinic.siteId);
    let svcCd = yield select(state => state.login.service.serviceCd);

    const [sessionsConfig, serviceSessionsConfig] = yield all([
        call(maskAxios.get, '/cmn/sites/' + siteId + '/sessions'),
        call(maskAxios.get, '/cmn/services/' + svcCd + '/sessions')
    ]);

    const sessionsConfigData = sessionsConfig.data;
    if (sessionsConfigData && sessionsConfigData.respCode === 0) {
        let sessionsList = (sessionsConfigData.data || []).filter(item => item.svcCd === svcCd && item.status === 'A');
        sessionsList.sort((a, b) => {
                return a.sessDesc.localeCompare(b.sessDesc);
            }
        );
        yield put({type: commonType.SET_SESSIONS, data: sessionsList});
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: sessionsConfigData.errMsg ? sessionsConfigData.errMsg : 'Get Session Config Failed.',
            data: sessionsConfigData.data
        });
    }

    const serviceSessionsConfigData = serviceSessionsConfig.data;
    if (serviceSessionsConfigData && serviceSessionsConfigData.respCode === 0) {
        let sessionsList = (serviceSessionsConfigData.data || []).filter(item => item.svcCd === svcCd && item.status === 'A');
        sessionsList.sort((a, b) => {
                return a.sessDesc.localeCompare(b.sessDesc);
            }
        );
        yield put({type: commonType.SET_SERVICE_SESSIONS, data: sessionsList});
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: serviceSessionsConfigData.errMsg ? serviceSessionsConfigData.errMsg : 'Get Service Session Config Failed.',
            data: serviceSessionsConfigData.data
        });
    }
}

function* triggerUpdateSessionConfig() {
    yield alsTakeLatest(sessionManagementActionType.UPDATE_SESSION_CONFIG, updateSessionConfig);
}

export const sessionManagementSaga = [
    listSessionOfService,
    listSessionOfSite,
    listSingleSessionById,
    createSession,
    updateSession,
    deleteSession,
    triggerUpdateSessionConfig
];
