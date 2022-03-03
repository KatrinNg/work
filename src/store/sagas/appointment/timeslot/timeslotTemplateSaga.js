import { take, select, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import _ from 'lodash';
import * as templateActionType from '../../../actions/appointment/timeslotTemplate';
import * as messageType from '../../../actions/message/messageActionType';
import { initTempDetailInfo } from '../../../../constants/appointment/timeslotTemplate/timeslotTemplateConstants';
import * as AppointmentUtil from '../../../../utilities/appointmentUtilities';
import { StatusEnum } from '../../../../enums/appointment/timeslot/timeslotTemplateEnum';
import storeConfig from '../../../storeConfig';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';

async function getTempList(params) {
    let { data } = await maskAxios.get('/ana/timeSlotTemplates', {
        params: params
    });
    if (data.respCode !== 0) {
        storeConfig.store.dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
    return data;
}

async function insertTemp(params) {
    let { data } = await maskAxios.post('/ana/timeSlotTemplates', params);
    if (data.respCode !== 0) {
        storeConfig.store.dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
    return data;
}

async function updateTemp(params) {
    let { data } = await maskAxios.put('/ana/timeSlotTemplates', params);
    if (data.respCode !== 0) {
        storeConfig.store.dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
    return data;
}

async function deleteTemp(params) {
    let { data } = await maskAxios.delete('/ana/timeSlotTemplates', params);
    if (data.respCode !== 0) {
        storeConfig.store.dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
    return data;
}

function* getTemplateList() {
    while (true) {
        try{
            yield take(templateActionType.GET_TEMPLATE_LIST);
            yield put(alsStartTrans());
            const clinic = yield select(state => state.login.clinic);
            const params = {
                svcCd: clinic.svcCd,
                siteId: clinic.siteId
            };
            let data = yield call(getTempList, params);
            if (data.respCode === 0) {
                yield put({ type: templateActionType.UPDATE_TEMPLATE_LIST, data: data.data });
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* initPage() {
    while (true) {

        try{
            yield take(templateActionType.INIT_PAGE);
            yield put(alsStartTrans());

            yield put({ type: templateActionType.RESET_ALL });
            const clinic = yield select(state => state.login.clinic);
            const params = {
                svcCd: clinic.svcCd,
                siteId: clinic.siteId
            };
            let data = yield call(getTempList, params);
            if (data.respCode === 0) {
                const firstRowData = _.cloneDeep(data.data && data.data[0]);
                yield put({ type: templateActionType.UPDATE_TEMPLATE_LIST, data: data.data });
                if(firstRowData){
                    yield put({
                        type: templateActionType.UPDATE_STATE,
                        updateData: {
                            templateListSelected: firstRowData.tmsltTmplProfileId,
                            templateDetailInfo: {
                                templateName: firstRowData.tmsltTmplName,
                                templateDesc: firstRowData.tmsltTmplDesc
                            },
                            templateDetailList: AppointmentUtil.mapTmsltTmpToStore(firstRowData.tmsltTmplList),
                            status: StatusEnum.VIEW
                        }
                    });
                }
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* initTemplateDetail() {
    while (true) {
        try{
            yield take(templateActionType.INIT_TEMPLATE_DETAIL);
            yield put(alsStartTrans());
            const loginUser = yield select(state => state.login.loginInfo);
            yield put({
                type: templateActionType.UPDATE_STATE,
                updateData: {
                    templateListSelected: -1,
                    templateDetailInfo: _.cloneDeep(initTempDetailInfo),
                    templateDetailList: [AppointmentUtil.getInitTmslTmp(loginUser)],
                    status: StatusEnum.NEW
                }
            });

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* selectTemplate() {
    while (true) {

        try{
            const { tmsltTmplProfileId } = yield take(templateActionType.SELECT_TEMPLATE);
            yield put(alsStartTrans());

            const templateList = yield select(state => state.timeslotTemplate.templateList);
            const tempInfo = templateList && templateList.find(item => item.tmsltTmplProfileId === tmsltTmplProfileId);
            if (tempInfo) {
                yield put({
                    type: templateActionType.UPDATE_STATE,
                    updateData: {
                        status: StatusEnum.VIEW,
                        templateDetailInfo: {
                            templateName: tempInfo.tmsltTmplName,
                            templateDesc: tempInfo.tmsltTmplDesc
                        },
                        templateDetailList: AppointmentUtil.mapTmsltTmpToStore(_.cloneDeep(tempInfo.tmsltTmplList))
                    }
                });
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* editTemplate() {
    while (true) {
        try{
            const { tmsltTmplProfileId } = yield take(templateActionType.EDIT_TEMPLATE);
            yield put(alsStartTrans());

            const templateList = yield select(state => state.timeslotTemplate.templateList);
            const tempInfo = templateList && templateList.find(item => item.tmsltTmplProfileId === tmsltTmplProfileId);
            if (tempInfo) {
                yield put({
                    type: templateActionType.UPDATE_STATE,
                    updateData: {
                        status: StatusEnum.EDIT,
                        templateDetailInfo: {
                            templateName: tempInfo.tmsltTmplName,
                            templateDesc: tempInfo.tmsltTmplDesc
                        },
                        templateDetailList: AppointmentUtil.mapTmsltTmpToStore(_.cloneDeep(tempInfo.tmsltTmplList))
                    }
                });
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* copyTemplate() {
    while (true) {
        try{
            yield take(templateActionType.COPY_TEMPLATE);

            yield put(alsStartTrans());
            const templateListSelected = yield select(state => state.timeslotTemplate.templateListSelected);
            const templateList = yield select(state => state.timeslotTemplate.templateList);
            if (templateListSelected > -1) {
                const selectedTemp = templateList.find(item => item.tmsltTmplProfileId === templateListSelected);
                if (selectedTemp) {
                    yield put({
                        type: templateActionType.UPDATE_STATE,
                        updateData: {
                            status: StatusEnum.COPY,
                            templateListSelected: -1,
                            templateDetailInfo: _.cloneDeep(initTempDetailInfo),
                            templateDetailList: AppointmentUtil.mapTmsltTmpToStore(_.cloneDeep(selectedTemp.tmsltTmplList))
                        }
                    });
                }
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* insertTemplate() {
    while (true) {
        try{
            const { tmsltTmp } = yield take(templateActionType.INSERT_TEMPLATE);
            yield put(alsStartTrans());

            let data = yield call(insertTemp, tmsltTmp);
            if (data.respCode === 0) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110702', showSnackbar: true } });
                const doCloseCallback = yield select(state => state.timeslotTemplate.doCloseCallback);
                if (doCloseCallback) {
                    doCloseCallback(true);
                    yield put({
                        type: templateActionType.UPDATE_STATE,
                        updateData: { doCloseCallback: null }
                    });
                } else {
                    const clinic = yield select(state => state.login.clinic);
                    const params = {
                        svcCd: clinic.svcCd,
                        siteId: clinic.siteId
                    };
                    let tempData = yield call(getTempList, params);
                    if (tempData.respCode === 0) {
                        yield put({ type: templateActionType.UPDATE_TEMPLATE_LIST, data: tempData.data });
                        const selectedData = tempData.data.find(item => item.tmsltTmplProfileId === data.data.tmsltTmplProfileId);
                        if (selectedData) {
                            yield put({
                                type: templateActionType.UPDATE_STATE,
                                updateData: {
                                    status: StatusEnum.VIEW,
                                    templateListSelected: selectedData.tmsltTmplProfileId,
                                    templateDetailInfo: {
                                        templateName: selectedData.tmsltTmplName,
                                        templateDesc: selectedData.tmsltTmplDesc
                                    },
                                    templateDetailList: AppointmentUtil.mapTmsltTmpToStore(_.cloneDeep(selectedData.tmsltTmplList))
                                }
                            });
                        }
                    }
                }
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* updateTemplate() {
    while (true) {
        try{
            const { tmsltTmp } = yield take(templateActionType.UPDATE_TEMPLATE);
            yield put(alsStartTrans());

            let data = yield call(updateTemp, tmsltTmp);
            if (data.respCode === 0) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110703', showSnackbar: true } });
                const doCloseCallback = yield select(state => state.timeslotTemplate.doCloseCallback);
                if (doCloseCallback) {
                    doCloseCallback(true);
                    yield put({
                        type: templateActionType.UPDATE_STATE,
                        updateData: { doCloseCallback: null }
                    });
                } else {
                    const clinic = yield select(state => state.login.clinic);
                    const params = {
                        svcCd: clinic.svcCd,
                        siteId: clinic.siteId
                    };
                    let tempData = yield call(getTempList, params);
                    if (tempData.respCode === 0) {
                        yield put({ type: templateActionType.UPDATE_TEMPLATE_LIST, data: tempData.data });
                        const selectedData = tempData.data.find(item => item.tmsltTmplProfileId === data.data.tmsltTmplProfileId);
                        if (selectedData) {
                            yield put({
                                type: templateActionType.UPDATE_STATE,
                                updateData: {
                                    status: StatusEnum.VIEW,
                                    templateListSelected: selectedData.tmsltTmplProfileId,
                                    templateDetailInfo: {
                                        templateName: selectedData.tmsltTmplName,
                                        templateDesc: selectedData.tmsltTmplDesc
                                    },
                                    templateDetailList: AppointmentUtil.mapTmsltTmpToStore(_.cloneDeep(selectedData.tmsltTmplList))
                                }
                            });
                        }
                    }
                }
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* deleteTemplate() {
    while (true) {
        try{
            const { tmsltTmp } = yield take(templateActionType.DELETE_TEMPLATE);
            yield put(alsStartTrans());

            let data = yield call(deleteTemp, { data: tmsltTmp });
            if (data.respCode === 0) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110704', showSnackbar: true } });
                const clinic = yield select(state => state.login.clinic);
                const loginUser = yield select(state => state.login.loginInfo);
                const params = {
                    svcCd: clinic.svcCd,
                    siteId: clinic.siteId
                };
                let tempData = yield call(getTempList, params);
                if (tempData.respCode === 0) {
                    yield put({ type: templateActionType.UPDATE_TEMPLATE_LIST, data: tempData.data });
                    yield put({
                        type: templateActionType.UPDATE_STATE,
                        updateData: {
                            status: StatusEnum.NEW,
                            templateListSelected: -1,
                            templateDetailInfo: _.cloneDeep(initTempDetailInfo),
                            templateDetailList: [AppointmentUtil.getInitTmslTmp(loginUser)]
                        }
                    });
                }
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* batchCreate() {
    while (true) {
        try{
            yield take(templateActionType.BATCH_CREATE);
            yield put(alsStartTrans());

            const batchCreateDialog = yield select(state => state.timeslotTemplate.batchCreateDialog);
            const loginUser = yield select(state => state.login.loginInfo);
            const _tempList = AppointmentUtil.getBatchCreateTempList(batchCreateDialog, loginUser);
            if (_tempList.length > 0) {
                yield put({
                    type: templateActionType.UPDATE_STATE,
                    updateData: {
                        isOpenBatchCreate: false,
                        templateDetailList: _tempList
                    }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110705'
                    }
                });
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

export const timeslotTemplateSagas = [
    // getTimeslotTempalteList,
    // saveTimeslotTemplate,
    // updateTimeslotTemplate,
    // getTimeslotTemplate
    initPage,
    getTemplateList,
    selectTemplate,
    editTemplate,
    initTemplateDetail,
    copyTemplate,
    insertTemplate,
    updateTemplate,
    deleteTemplate,
    batchCreate
];