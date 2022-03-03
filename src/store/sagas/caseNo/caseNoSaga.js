import { take, takeLatest, call, put,select } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as caseNoActionType from '../../actions/caseNo/caseNoActionType';
import * as messageType from '../../actions/message/messageActionType';
import Enum from '../../../enums/enum';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import _ from 'lodash';
import {alsStartTrans, alsEndTrans} from '../../actions/als/transactionAction';
import {alsTakeLatest,alsTakeEvery} from '../als/alsLogSaga';
import { mapEncounterTypeListNewApi } from '../../../utilities/apiMappers';


function* fetchSaveCaseNo(action) {
    const { caseDialogStatus, params, callback, currentUpdateField } = action;
    switch (caseDialogStatus) {
        case Enum.CASE_DIALOG_STATUS.CREATE: {
            let { data } = yield call(maskAxios.post, '/patient/generateCaseNo', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110038',
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            }
            else if (data.respCode === 1) {
                //todo parameterException
            }
            else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110139'
                    }
                });
            }
            else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110140'
                    }
                });
            }
            else if(data.respCode === 103) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '110153' }
                });
            }
            else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
            break;
        }
        case Enum.CASE_DIALOG_STATUS.EDIT: {
            let { data } = yield call(maskAxios.post, '/patient/updateCaseNo', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110039',
                        params: [
                            //{ name: 'CASE_NO', value: CaseNoUtil.getFormatCaseNo(data.data && data.data.caseNo) },
                            { name: 'CASE_NO', value: CaseNoUtil.getCaseAlias(data.data && data.data.caseNo) },
                            {
                                name: 'CASE_STATUS',
                                value: () => {
                                    // if (data.data && data.data.statusCd === Enum.CASE_STATUS.ACTIVE) {
                                    //     return 'transferred';
                                    // }
                                    // return CaseNoUtil.getCaseNoStatus(data.data && data.data.statusCd);
                                    if (data.data) {
                                        if (currentUpdateField === 'statusCd') {
                                            return CaseNoUtil.getCaseNoStatus(data.data && data.data.statusCd);
                                        }
                                        else {
                                            return 'updated';
                                        }
                                    }
                                }
                            }
                        ],
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            }
            else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110043'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110140'
                    }
                });
            }
            else if (data.respCode === 102) {
                let case_status = '';
                // if (params.statusCd === Enum.CASE_STATUS.ACTIVE) {
                //     case_status = 'transferred';
                // } else {
                //     // case_status = CaseNoUtil.getCaseNoStatus(params.statusCd);
                //     case_status = CaseNoUtil.getCaseNoPromptStr(params.statusCd);
                // }
                if (currentUpdateField === 'statusCd') {
                    case_status = CaseNoUtil.getCaseNoPromptStr(params.statusCd);
                }
                else {
                    case_status = 'transferred';
                }
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110042',
                        params: [{ name: 'CASE_STATUS', value: _.toLower(case_status) }]
                    }
                });
            }
            else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
            break;
        }
    }
}

function* saveCaseNo() {
    yield alsTakeLatest(caseNoActionType.SAVE_CASENO, fetchSaveCaseNo);
}

function* listCasePrefix() {
    while (true) {
        try{
            const { serviceCd } = yield take(caseNoActionType.LIST_CASE_PREFIX);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/patient/listCasePrefix?serviceCd=' + serviceCd);
            if (data.respCode === 0) {
                yield put({
                    type: caseNoActionType.PUT_CASE_PREFIX,
                    casePrefixList: data.data
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* listAliasRules() {
    while (true) {
        try {
            const { svcCd,siteId} = yield take(caseNoActionType.LIST_ALIAS_RULES);
            yield put(alsStartTrans());
            let url=`/patient/caseMapAliasRule?svcCd=${svcCd}`;
            if(svcCd==='ANT'){
                url=`${url}&siteId=${siteId}`;
            }
            let { data } = yield call(maskAxios.get, url);
            if (data.respCode === 0) {
                yield put({
                    type: caseNoActionType.PUT_ALIAS_RULES,
                    aliasRules: data.data
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchSaveCaseNoWithAlias(action){
    const { caseDialogStatus, params, callback, currentUpdateField } = action;
    switch (caseDialogStatus) {
        case Enum.CASE_DIALOG_STATUS.CREATE: {
            let { data } = yield call(maskAxios.post, '/patient/saveSpcCase', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110038',
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            }
            else if (data.respCode === 3) {
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
                        msgCode: '110161'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110160'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110158'
                    }
                });
            } else if (data.respCode === 103) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110159'
                    }
                });
            } else if(data.respCode===104){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110140'
                    }
                });
            } else if(data.respCode===105){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110153'
                    }
                });
            }else if(data.respCode===106){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110162'
                    }
                });
            }else if(data.respCode===107){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110165'
                    }
                });
            }else if(data.respCode===108){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110164'
                    }
                });
            }else if(data.respCode===109){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110166'
                    }
                });
            }
            break;
        }
        case Enum.CASE_DIALOG_STATUS.EDIT: {
            let { data } = yield call(maskAxios.put, '/patient/modifySpcCase', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110039',
                        params: [
                            { name: 'CASE_NO', value: CaseNoUtil.getCaseAlias(data.data &&data.data.caseDto) },
                            {
                                name: 'CASE_STATUS',
                                value: () => {
                                    if (data.data) {
                                        if (currentUpdateField === 'statusCd') {
                                            return CaseNoUtil.getCaseNoStatus(data.data && data.data.caseDto.statusCd);
                                        }
                                        else {
                                            return 'updated';
                                        }
                                    }
                                }
                            }
                        ],
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
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
                        msgCode: '110158'
                    }
                });
                // } else if (data.respCode === 101) {
                //     yield put({
                //         type: messageType.OPEN_COMMON_MESSAGE,
                //         payload: {
                //             msgCode: '110159'
                //         }
                //     });
            } else if (data.respCode === 102) {
                //deceased patient.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110159'
                    }
                });
            } else if (data.respCode === 103) {
                //case not existed.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110043'
                    }
                });
            } else if(data.respCode===104){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110140'
                    }
                });
            } else if(data.respCode===105){
                // yield put({
                //     type: messageType.OPEN_COMMON_MESSAGE,
                //     payload: {
                //         msgCode: '110153'
                //     }
                // });
                let case_status = '';
                if (currentUpdateField === 'statusCd') {
                    case_status = CaseNoUtil.getCaseNoPromptStr(params.caseDto.statusCd);
                }
                else {
                    case_status = 'transferred';
                }
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110042',
                        params: [{ name: 'CASE_STATUS', value: _.toLower(case_status) }]
                    }
                });
            }else if(data.respCode===106){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110162'
                    }
                });
            }else if(data.respCode===107){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110165'
                    }
                });
            }else if(data.respCode===108){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110164'
                    }
                });
            }else if(data.respCode===109){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110166'
                    }
                });
            }
        }
    }
}

function* saveCaseNoWithAlias(){
    yield alsTakeLatest(caseNoActionType.SAVE_CASE_NO_WITH_ALIAS, fetchSaveCaseNoWithAlias);
}

function* getEncounterTypesBySiteID(){
    yield alsTakeEvery(caseNoActionType.GET_ENCOUNTER_TYPE_LIST_BY_SITE, function* (action) {
        let { svcCd, siteId, callback } = action;
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + svcCd + '&siteId=' + siteId + '&withRooms=Y');
        if (data.respCode === 0) {
            const clinicList = yield select(state => state.common.clinicList);
            let _encounterTypeList = mapEncounterTypeListNewApi(data.data, svcCd, siteId, clinicList);
            callback&&callback(_encounterTypeList);
        }
    });
}

function* listEncntrGrpList() {
    yield alsTakeLatest(caseNoActionType.LIST_ENCOUNTER_GROUP, function* (action) {
        const { params } = action;
        let { data } = yield call(maskAxios.get, '/patient/pmiCaseEncntrGrp', { params: params });
        if (data.respCode === 0) {
            //callback&&callback(data.data);
            yield put({
                type: caseNoActionType.PUT_ENCOUNTER_GROUP_LIST,
                encntrGrpList: data.data
            });
        }
    });
}

function* listPatientCase() {
    yield alsTakeLatest(caseNoActionType.LIST_PATIENT_CASE, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/patient/listCaseByPatientKey', { params: params });
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}



export const caseNoSaga = [
    saveCaseNo,
    listCasePrefix,
    listAliasRules,
    saveCaseNoWithAlias,
    getEncounterTypesBySiteID,
    listEncntrGrpList,
    listPatientCase
];