import * as types from '../../actions/appointment/waitingList/waitingListActionType';
import { take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as messageType from '../../actions/message/messageActionType';
import { CommonUtil, EnctrAndRmUtil, SiteParamsUtil } from '../../../utilities';
import * as WaitingListUtil from '../../../utilities/waitingListUtilities';
import {
    patientPhonesBasic
} from '../../../constants/registration/registrationConstants';
import {
    waitDetailBasic
} from '../../../constants/appointment/waitingList/waitingListConstants';
import _ from 'lodash';
import moment from 'moment';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../als/alsLogSaga';
import Enum from '../../../enums/enum';

function* initiPage() {

    try {
        yield take(types.INITI_PAGE);
        yield put(alsStartTrans());

        const codeList = yield select(state => state.common.commonCodeList);
        const clinicList = yield select(state => state.common.clinicList);
        const service = yield select(state => state.login.service);
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + service.serviceCd +'&withRooms=Y');
        let encounterTypeList = [];
        if (data.respCode === 0) {
             encounterTypeList = data.data;
             yield put({
                type: types.UPDATE_FIELD,
                fields: {
                    encounterTypeList: _.cloneDeep(encounterTypeList),
                    docTypeList: _.cloneDeep(codeList.doc_type),
                    clinicList: _.cloneDeep(clinicList.filter(item => item.serviceCd === service.serviceCd))
                }
            });
        }
    } finally {
        yield put(alsEndTrans());
    }
}

function* searchWaitingList() {
    while (true) {
        try {
            let { params } = yield take(types.SEARCH_WAITING_LIST);
            yield put(alsStartTrans());

            // let { data } = yield call(maskAxios.post, '/appointment/listWaitingList', params);
            let url = '/ana/waitingList?';
            for (let p in params) {
                url += `${p}=${params[p]}&`;
            }
            url = url.substring(0, url.length - 1);
            let { data } = yield call(maskAxios.get, url);
            if (data.respCode === 0) {
                const docTypeList = yield select(state => state.common.commonCodeList.doc_type);
                const clinicList = yield select(state => state.common.clinicList);
                const encounterTypes = yield select(state => state.waitingList.encounterTypeList);
                const countryList = yield select(state => state.patient.countryList);
                let waitList = WaitingListUtil.loadWaitList(data.data, docTypeList, clinicList, encounterTypes, countryList);
                waitList.sort((a, b) => {
                    if (moment(b.departureDtm).isBefore(moment(a.departureDtm))) {
                        return 1;
                    } else if (moment(b.departureDtm).isAfter(moment(a.departureDtm))) {
                        return -1;
                    } else {
                        if (moment(b.createDtm).isBefore(moment(a.createDtm))) {
                            return 1;
                        } else if (moment(b.createDtm).isSame(moment(a.createDtm))) {
                            return 0;
                        } else {
                            return -1;
                        }
                    }
                });
                yield put({ type: types.UPDATE_FIELD, fields: { waitingList: waitList } });
            } else if (data.respCode === 1) {
                //todo parameterException
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111101'
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
        } finally {
            yield put(alsEndTrans());
        }
    }
}
function* getWaiting() {
    while (true) {
        try {
            let { params } = yield take(types.GET_WAITING);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, `/ana/waitingList/${params.waitListId}`);
            if (data.respCode === 0) {
                //Justin 20200921: encounter type inactive or expire
                let respData = _.cloneDeep(data.data);
                const encounterTypeList = yield select(state => state.waitingList.encounterTypeList);
                if (!EnctrAndRmUtil.isActiveEnctrTypeId(respData[0].encntrTypeId, encounterTypeList)) {
                    respData[0].encntrTypeId = '';
                }
                yield put({ type: types.EDIT_WAITING, waiting: respData });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111106'
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

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchSeachPatientList(action) {
    // let { data } = yield call(maskAxios.post, '/patient/searchPatient', action.params);
    const siteParams = yield select(state => state.common.siteParams);
    const svcCd = yield select(state => state.login.service.svcCd);
    const siteId = yield select(state => state.login.clinic.siteId);
    const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, svcCd, siteId);
    let { params } = action;
    let url = '';
    if (isNewPmiSearchResultDialog) {
        url = '/patient/searchPmi?';
    } else {
        url = '/patient/patients?';
    }
    for (let p in params) {
        url += `${p}=${encodeURIComponent(params[p])}&`;
    }
    url = url.substring(0, url.length - 1);
    // let url = `/patient/patients?searchString=${action.params.searchString}`;
    let { data } = yield call(maskAxios.get, url);
    if (data.respCode === 0) {
        if (data.data.total > 0) {
            yield put({ type: types.PUT_SEARCH_PATIENT_LIST, data: data.data, countryList: action.countryList });
            yield put({
                type: types.UPDATE_FIELD,
                fields: { supervisorsApprovalDialogInfo: { staffId: '', open: false, searchString: '' }}
            });
        } else {
            const storeWaitDetail = yield select(state => state.waitingList.waitDetail);
            let waitDetail = _.cloneDeep(waitDetailBasic);
            let contactPhone = _.cloneDeep(patientPhonesBasic);
            const patSearchTypeList = yield select(state => state.common.patSearchTypeList);
            let searchTypeObj = patSearchTypeList.find(item => item.searchTypeCd === params.docType);
            waitDetail.siteId = storeWaitDetail.siteId;
            if (searchTypeObj && searchTypeObj.isDocType === 1) {
                waitDetail.priDocTypeCd = searchTypeObj.searchTypeCd;
                waitDetail.priDocNo = params.searchString;
            }
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '115550',
                    showSnackbar: true
                }
            });
            yield put({
                type: types.RESET_WAIT_DETAIL,
                siteId: storeWaitDetail.siteId,
                encntrTypeId: storeWaitDetail.encntrTypeId
            });
            yield put({
                type: types.UPDATE_FIELD,
                fields: { waitDetail, contactPhone, handlingSearch: false, autoFocus: true }
            });
            // if(data.data.total===0){
            //     callback&&callback();
            // }
        }
    } else if(data.respCode === 2){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130702'
            }
        });
    } else if(data.respCode === 101){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110148',
                showSnackbar: true
            }
        });
    } else if(data.respCode === 102){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130703'
            }
        });
    } else {
        yield put({ type: types.PUT_SEARCH_PATIENT_LIST, data: null, countryList: action.countryList });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* seachPatientList() {
    yield alsTakeLatest(types.SEARCH_PATIENT_LIST, fetchSeachPatientList);
}

function* saveWaiting() {
    while (true) {
        try {
            let { params, callback } = yield take(types.SAVE_WAITING);
            yield put(alsStartTrans());

            if (params.status === 'E') {
                // let { data } = yield call(maskAxios.post, '/appointment/updateWaitingList', params.data);
                let { data } = yield call(maskAxios.put, '/ana/waitingList', params.data);
                if (data.respCode === 0) {
                    yield put({ type: types.SAVE_SUCCESS });
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110023',
                            showSnackbar: true
                            // btnActions: {
                            //     btn1Click: () => {
                            //         callback && callback();
                            //     }
                            // }
                        }
                    });
                    callback && callback();
                } else if (data.respCode === 1) {
                    //todo parameterException
                } else if (data.respCode === 3) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110032'
                        }
                    });
                } else if (data.respCode === 102) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111104',
                            showSnackbar: true,
                            variant: 'warning'
                        }
                    });
                } else if (data.respCode === 101) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111105',
                            showSnackbar: true,
                            variant: 'warning'
                        }
                    });
                } else if (data.respCode === 100) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111103',
                            showSnackbar: true,
                            variant: 'warning'
                        }
                    });
                } else if (data.respCode === 103) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110101',
                            showSnackbar: true,
                            variant: 'warning'
                        }
                    });
                } else if (data.respCode === 104) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111108',
                            showSnackbar: true,
                            variant: 'warning'
                        }
                    });
                } else if (data.respCode === 105) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111107',
                            showSnackbar: true,
                            variant: 'warning'
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
            } else {
                // let { data } = yield call(maskAxios.post, '/appointment/insertWaitingList', params.data);
                let { data } = yield call(maskAxios.post, '/ana/waitingList', params.data);
                if (data.respCode === 0) {
                    yield put({ type: types.SAVE_SUCCESS });
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111112',
                            showSnackbar: true
                            // btnActions: {
                            //     btn1Click: () => {
                            //         callback && callback();
                            //     }
                            // }
                        }
                    });
                    callback && callback();
                } else if (data.respCode === 1) {
                    //todo parameterException
                } else if (data.respCode === 100) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111103',
                            showSnackbar: true,
                            variant: 'warning'
                        }
                    });
                } else if (data.respCode === 101) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111102',
                            showSnackbar: true,
                            variant: 'warning'
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

        } finally {
            yield put(alsEndTrans());
        }
    }
}
function* deleteWaiting() {
    while (true) {
        try {
            let { params, callback } = yield take(types.DELETE_WAITING);
            yield put(alsStartTrans());

            // let { data } = yield call(maskAxios.post, '/appointment/deleteWaitingList', params);
            let { data } = yield call(maskAxios.delete, `/ana/waitingList?waitListId=${params.waitListId}`);
            if (data.respCode === 0) {
                yield put({ type: types.DELETE_SUCCESS });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111111',
                        // btnActions: {
                        //     btn1Click: () => {
                        //         callback && callback();
                        //     }
                        // },
                        showSnackbar: true
                    }
                });
                callback && callback();
            } else if (data.respCode === 1) {
                //todo parameterException
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111103'
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

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getWaitingListAllRoleListConfig() {
    while (true) {
        try {
            let { params } = yield take(types.WAITINGLIST_ALLROLE_LISTCONFIG);
            yield put(alsStartTrans());

            let clinic = yield select(state => state.login.clinic);
            let { data } = yield call(maskAxios.get, '/cmn/services/' + clinic.svcCd + '/listConfigs', { params: { userGroupCd: params.userGroupCd, configName: params.configName } });
            if (data.respCode === 0) {
                yield put({ type: types.UPDATE_FIELD, fields: { waitingListAllRoleListConfig: data.data } });
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


export const waitingListSaga = [
    initiPage,
    searchWaitingList,
    getWaiting,
    seachPatientList,
    saveWaiting,
    deleteWaiting,
    getWaitingListAllRoleListConfig
];