import { take, takeEvery, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../services/axiosInstance';
import _ from 'lodash';
import ccpAxios from '../../services/ccpAxiosInstance';
import josCcpAxiosInstance from '../../services/josCcpAxiosInstance';
import * as commonType from '../actions/common/commonActionType';
import * as messageType from '../actions/message/messageActionType';
import { codeList as codeType } from '../../constants/codeList';
import {
    mapEncounterTypeList, mapEncounterTypeListNewApi
} from '../../utilities/apiMappers';
import { alsStartTrans, alsEndTrans } from '../actions/als/transactionAction';
import { alsTakeEvery } from './als/alsLogSaga';

function* putEncounterTypeList(encounterTypeList, params, actionType, callback) {
    const _encounterTypeList = encounterTypeList.filter(item => (!params.serviceCd || item.service === params.serviceCd) && (!params.clinicCd || item.clinic === params.clinicCd));
    if (actionType) {
        if (Array.isArray(actionType)) {
            for (let type of actionType) {
                yield put({ type: type, encounterTypeList: _encounterTypeList });
            }
        } else {
            yield put({ type: actionType, encounterTypeList: _encounterTypeList });
        }
    }
    callback && callback(_encounterTypeList);
}

function* getEncounterTypeList() {
    yield alsTakeEvery(commonType.GET_ENCOUNTER_TYPE_LIST, function* (action) {

        const { params = {}, actionType = '', isGetNew = false, callback = null } = action;
        if (isGetNew) {
            // let { data } = yield call(axios.post, '/appointment/getEncounterTypeList', {});
            const site = yield select(state => state.login.clinic);
            const clinicList = yield select(state => state.common.clinicList);
            let siteId = params.siteId;
            if (!siteId) {
                siteId = site.siteId;
            }
            let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + site.serviceCd + '&siteId=' + siteId + '&withRooms=Y');
            if (data.respCode === 0) {
                const _encounterTypeList = mapEncounterTypeListNewApi(data.data, site.svcCd, site.clinicCd, clinicList);
                yield put({
                    type: commonType.ENCOUNTER_TYPE_LIST,
                    data: _encounterTypeList,
                    // new dependencies
                    loginServiceCd: site.serviceCd,
                    loginClinicCd: site.clinicCd
                });
                yield call(putEncounterTypeList, _.cloneDeep(_encounterTypeList), params, actionType, callback);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } else {
            let encounterTypeList = yield select(state => state.common.encounterTypeList);
            yield call(putEncounterTypeList, _.cloneDeep(encounterTypeList), params, actionType, callback);
        }
    });
}

function* getRoomsEncounterTypeList() {
    yield alsTakeEvery(commonType.GET_ROOMS_ENCOUNTER_TYPE_LIST, function* (action) {
        const { params = {} } = action;
        const site = yield select(state => state.login.clinic);
        let siteId = params.siteId;
        if (!siteId) {
            siteId = site.siteId;
        }
        let { data } = yield call(maskAxios.get, '/cmn/roomsEncounterTypes?svcCd=' + site.serviceCd + '&siteId=' + siteId + '&withEncounterTypes=Y');
        const roomsEncounterTypeList = data?.data.filter((item) => {
            return item.encounterTypeDtoList && item.encounterTypeDtoList.length;
        });
        if (data.respCode === 0) {
            yield put({
                type: commonType.ROOMS_ENCOUNTER_TYPE_LIST,
                data: roomsEncounterTypeList
            });
        }
    });
}

function* getSvcEnctypes() {
    yield alsTakeEvery(commonType.GET_SVC_ENCTYPES, function* () {
        const service = yield select(state => state.login.service);
        const clinic = yield select(state => state.login.clinic);
        let { data } = yield call(maskAxios.get, '/cmn/services/' + service.svcCd + '/encounterTypes?siteId=' + clinic.siteId);
        if (data.respCode === 0) {
            yield put({ type: commonType.SET_ENCOUNTER_TYPES, data: data.data });
        } else {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
        }
    });
}

function* listRooms() {
    yield alsTakeEvery(commonType.LIST_ROOMS, function* () {
        const service = yield select(state => state.login.service);
        let { data } = yield call(maskAxios.get, `/cmn/services/${service.svcCd}/rooms`);
        if (data.respCode === 0) {
            yield put({ type: commonType.SET_ROOMS, data: data.data });
        } else {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
        }
    });
}

export function* listServiceApi(params) {
    // return yield call(maskAxios.post, '/common/listService', params);
    return yield call(maskAxios.get, '/cmn/services', params);
}

function* listService() {
    yield alsTakeEvery(commonType.LIST_SERVICE, function* (action) {
        let { params } = action;
        let { data } = yield call(listServiceApi, params);
        if (data.respCode === 0) {
            yield put({
                type: commonType.PUT_LIST_SERVICE,
                serviceList: data.data
            });
        } else {
            yield put({
                type: commonType.OPEN_ERROR_MESSAGE,
                error: data.errMsg ? data.errMsg : 'Service error'
            });
        }
    });
}

export function* listClinicApi(params) {
    // return yield call(maskAxios.post, '/common/listClinic', params);
    return yield call(maskAxios.get, '/cmn/sites', params);
}

function* listClinic() {
    yield alsTakeEvery(commonType.LIST_CLINIC, function* (action) {
        let { params } = action;
        let { data } = yield call(listClinicApi, params);
        if (data.respCode === 0) {
            yield put({
                type: commonType.PUT_LIST_CLINIC,
                clinicList: data.data
            });
        } else {
            yield put({
                type: commonType.OPEN_ERROR_MESSAGE,
                error: data.errMsg ? data.errMsg : 'Service error'
            });
        }
    });
}

function* print() {
    while (true) {
        try {
            let { params } = yield take(commonType.PRINT_START);
            yield put(alsStartTrans());
            let printSuccess = false;
            let check = yield call(ccpAxios.post, '/ccp/check');
            if (check.data && check.data.status === 'OK') {
                let qs = require('qs');
                let requireParams = {
                    tid: params.taskId,
                    pt: params.printType || 5,
                    url: params.documentUrl || 'http://localhost:17300',
                    docParm: params.documentParameters,
                    b64: params.base64,
                    que: params.printQueue,
                    tc: params.printTray,
                    fp: params.firstPage,
                    lp: params.lastPage,
                    ctr: params.isCenter || false,
                    fit: params.isFitPage || false,
                    shk: params.isShrinkPage || false,
                    ps: params.paperSize,
                    cps: params.copies,
                    ori: Number.isInteger(params.orientation) ? params.orientation : -1,
                    msz: params.mediaSize || 'N/A',
                    os: params.isObjectStream || false,
                    cb: params.callback,
                    ref: params.referer,
                    ver: check.data.agent_version,
                    cbm: params.callbackMode || 1,
                    pm: params.printMode,
                    pdfPw: params.pdfPassword,
                    sc: params.sheetCollate || 1
                };
                let { data } = yield call(ccpAxios.post, '/ccp/prn', qs.stringify(requireParams));
                if (data.success) {
                    printSuccess = true;
                    yield put({
                        type: commonType.PRINT_SUCCESS
                    });
                } else {
                    yield put({
                        type: commonType.PRINT_FAILURE
                    });
                }
            } else {
                yield put({
                    type: commonType.PRINT_FAILURE
                });
            }
            if (typeof params.callback === 'function') {
                params.callback(printSuccess);
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* goPrint() {
    while (true) {
        let { params, goActionCallback } = yield take(commonType.GO_PRINT_START);
        let printSuccess = false;
        try {
            let check = yield call(ccpAxios.post, '/ccp/check', { windowPrint: params.windowPrint });
            if (check.data && check.data.status === 'OK') {
                let qs = require('qs');
                let requireParams = {
                    tid: params.taskId,
                    pt: params.printType || 5,
                    url: params.documentUrl || 'http://localhost:17300',
                    docParm: params.documentParameters,
                    b64: params.base64,
                    que: params.printQueue,
                    tc: params.printTray,
                    fp: params.firstPage,
                    lp: params.lastPage,
                    ctr: params.isCenter || false,
                    fit: params.isFitPage || false,
                    shk: params.isShrinkPage || false,
                    ps: params.paperSize,
                    cps: params.copies,
                    ori: params.orientation || -1,
                    msz: params.mediaSize || 'N/A',
                    os: params.isObjectStream || false,
                    cb: params.callback,
                    ref: params.referer,
                    ver: check.data.agent_version,
                    cbm: params.callbackMode || 1,
                    pm: params.printMode,
                    pdfPw: params.pdfPassword,
                    sc: params.sheetCollate || 1
                };
                let { data } = yield call(ccpAxios.post, '/ccp/prn', qs.stringify(requireParams));
                if (data.success) {
                    printSuccess = true;
                    goActionCallback();
                    // yield put({
                    //     type: commonType.PRINT_SUCCESS
                    // });
                } else {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '115011',
                            params: [
                                {
                                    name: 'MSG',
                                    value: data.message
                                }
                            ]
                        }
                    });
                }
            } else {
                // yield put({
                //     type: commonType.PRINT_FAILURE
                // });
            }
        } catch (error) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '115011',
                    params: [
                        {
                            name: 'MSG',
                            value: error.message
                        }
                    ],
                    btnActions: {
                        btn1Click: () => {
                            if (params.windowPrint && typeof (params.windowPrint) === 'function') {
                                params.windowPrint();
                                goActionCallback();
                            }
                        }
                    }
                }
            });
        }
        if (typeof params.callback === 'function') {
            params.callback(printSuccess);
        }

    }
}

function* putCodeList(codeList, params, actionType) {
    if (actionType) {
        let codeListDto = {};
        for (let code of params) {
            codeListDto[code] = _.cloneDeep(codeList[code]);
        }
        if (Array.isArray(actionType)) {
            for (let type of actionType) {
                yield put({ type: type, codeList: codeListDto });
            }
        } else {
            yield put({ type: actionType, codeList: codeListDto });
        }
    }
}

function* getCodeList() {
    yield alsTakeEvery(commonType.GET_CODE_LIST, function* (action) {
        const { params = [], actionType = '' } = action;
        let commonCodeList = yield select(state => state.common.commonCodeList);
        let service = yield select(state => state.login.service);
        let isMissing = false;
        if (params.length === 0) {
            isMissing = true;
        } else {
            for (let code of params) {
                if (!commonCodeList[code]) {
                    isMissing = true;
                }
            }
        }

        if (isMissing) {
            let initParams = [
                codeType.gender,
                codeType.exact_date_of_birth,
                codeType.district,
                codeType.sub_district,
                codeType.document_type,
                codeType.edu_level,
                codeType.ethnicity,
                codeType.gov_department,
                codeType.marital_status,
                codeType.occupation,
                codeType.relationship,
                codeType.religion,
                codeType.translation_lang,
                codeType.waiver,
                codeType.patient_status,
                codeType.edu_catgry,
                codeType.hlth_edu_type,
                codeType.puc_reason,
                codeType.default_trace_reason,
                codeType.spp_dflt_trc_cntct_detl
            ];

            let cgsParams = [
                codeType.cgs_rfr_dept,
                codeType.cgs_rfr_inst,
                codeType.cgs_rfr_title,
                codeType.cgs_inpatient_cnslt_loc_cd
            ];

            if(service.svcCd === 'SPP'){
                let sppDropDownData = ['spp_xfer_Out_reason','spp_xfer_out_clinic_detl','spp_xfer_out_hospital_detl','spp_xfer_out_nation'];
                initParams = _.uniq(initParams.concat(sppDropDownData));
            }
            let ehsParams = [
                codeType.ehs_waiver_catgry
            ];

            initParams = _.uniq(initParams.concat(params));

            const site = yield select(state => state.login.clinic);
            if (site.serviceCd === 'CGS') {
                initParams = _.uniq(initParams.concat(cgsParams));
            }

            if(site.serviceCd === 'EHS') {
                initParams = _.uniq(initParams.concat(ehsParams));
            }

            // let { data } = yield call(maskAxios.post, '/common/listCodeList', initParams);
            let { data } = yield call(maskAxios.get, '/cmn/codeLists?codeType=' + initParams.join(','));
            if (data.respCode === 0) {
                if (data.data && data.data.doc_type) {
                    data.data.doc_type = data.data.doc_type.filter(item => item.code !== 'APPTID');
                }
                yield put({ type: commonType.LOAD_CODE_LIST, codeList: data.data });
                yield call(putCodeList, _.cloneDeep(data.data), params, actionType);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } else {
            yield call(putCodeList, commonCodeList, params, actionType);
        }
    });
}

function* getGroupList() {
    while (true) {
        try {
            yield take(commonType.GET_GROUP);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/cmn/group');
            if (data.respCode === 0) {
                yield put({
                    type: commonType.LOAD_GROUP,
                    list: data.data
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

function* getHospitalList() {
    while (true) {
        try {
            yield take(commonType.GET_HOSPITAL);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/cmn/hospital');
            if (data.respCode === 0) {
                yield put({
                    type: commonType.LOAD_HOSPITAL,
                    list: data.data
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

function* getSpecialty() {
    while (true) {
        try {
            yield take(commonType.GET_SPECIALTY);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/cmn/specialty');
            if (data.respCode === 0) {
                yield put({
                    type: commonType.LOAD_SPECIALTY,
                    list: data.data
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

function* getPatientSearchType() {
    yield alsTakeEvery(commonType.GET_PATIENT_SEARCH_TYPE, function* () {
        let { data } = yield call(maskAxios.get, '/cmn/patSearchType');
        if (data.respCode === 0) {
            yield put({ type: commonType.LOAD_PATIENT_SEARCH_TYPE, typeList: data.data });
        }
        else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* josPrint() {
    while (true) {
        let { params } = yield take(commonType.JOS_PRINT_START);
        let printSuccess = false;
        let check = yield call(josCcpAxiosInstance.post, '/ccp/check');
        if (check.data && check.data.status === 'OK') {
            let qs = require('qs');
            let requireParams = {
                tid: params.taskId,
                pt: params.printType || 5,
                url: params.documentUrl || 'http://localhost:17300',
                docParm: params.documentParameters,
                b64: params.base64,
                que: params.printQueue,
                tc: params.printTray,
                fp: params.firstPage,
                lp: params.lastPage,
                ctr: params.isCenter || false,
                fit: params.isFitPage || false,
                shk: params.isShrinkPage || false,
                ps: params.paperSize,
                cps: params.copies,
                ori: params.orientation || -1,
                msz: params.mediaSize || 'N/A',
                os: params.isObjectStream || false,
                cb: params.callback,
                ref: params.referer,
                ver: check.data.agent_version,
                cbm: params.callbackMode || 1,
                pm: params.printMode,
                pdfPw: params.pdfPassword,
                sc: params.sheetCollate || 1
            };
            let { data } = yield call(josCcpAxiosInstance.post, '/ccp/prn', qs.stringify(requireParams));
            if (data.success) {
                printSuccess = true;
                yield put({
                    type: commonType.PRINT_SUCCESS
                });
            } else {
                yield put({
                    type: commonType.PRINT_FAILURE
                });
            }
        } else {
            yield put({
                type: commonType.PRINT_FAILURE
            });
        }
        if (typeof params.callback === 'function') {
            params.callback(printSuccess);
        }
    }
}

function* josPrinterCheck() {
    while (true) {
        let { params } = yield take(commonType.JOS_PRINT_CHECK);
        let printSuccess = false;
        let check = yield call(josCcpAxiosInstance.post, '/ccp/check');
        if (check.data && check.data.status === 'OK') {
            printSuccess = true;
        }
        if (typeof params.callback === 'function') {
            params.callback(printSuccess, params);
        }
    }
}

function* josPrinterStatusCheck() {
    while (true) {
        let { params } = yield take(commonType.JOS_PRINTER_CHECK);
        let printSuccess = false;
        let qs = require('qs');
        let requireParams = {
            que: params.printQueue,
            tc: params.printTray,
            ver: params.ccpVersion || '1.7.5',
            cb: params.callback,
            act: params.action
        };
        let check = yield call(josCcpAxiosInstance.post, '/ccp/helper', qs.stringify(requireParams));
        if (check.data && check.data.isPrintQueueAvailable) {
            printSuccess = true;
        }
        if (typeof params.callback === 'function') {
            params.callback(printSuccess, params);
        }
    }
}

function* listPassport() {
    while (true) {
        try {
            yield take(commonType.LIST_PASSPORT);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/cmn/passports');
            if (data.respCode === 0) {
                yield put({
                    type: commonType.LOAD_PASSPORT_LIST,
                    list: data.data
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

function* listSpecReqTypes() {
    while (true) {
        try {
            let { params } = yield take(commonType.LIST_SPECREQ_TYPES);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/ana/anaSpecialRqstTypes?svcCd=' + params.serviceCd);
            if (data.respCode === 0) {
                yield put({
                    type: commonType.PUT_SPECREQ_TYPES,
                    specReqTypesList: data.data
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

function* getSessionsConfig() {
    while (true) {
        try {
            yield take(commonType.GET_SESSIONS_CONFIG);
            yield put(alsStartTrans());
            const site = yield select(state => state.login.clinic);
            let { data } = yield call(maskAxios.get, '/cmn/services/' + site.serviceCd + '/sessions');
            if (data.respCode === 0) {
                let sessionsList = (data.data || []).filter(item => item.svcCd === site.serviceCd && item.status === 'A');
                yield put({ type: commonType.SET_SESSIONS, data: sessionsList.filter(sess => sess.siteId === site.siteId) });
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

function* getClcAntGestCalcParams() {
    yield alsTakeEvery(commonType.GET_CLC_ANT_GEST_CALC_PARAMS, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/cmn/clcGestCalcParams', {
            params: { siteId: params && params.siteId }
        });
        if (data.respCode === 0) {
            callback(data.data);
        }
    });
}

function* insertCommonAppLog() {
    yield takeEvery(commonType.INSERT_COMMON_APP_LOG, function* (action) {
        let { params, callback } = action;
        try {
            let { data } = yield call(maskAxios.post, `${params.url}/auditLogs/`, params);
            if (data.respCode === 0) {
                callback && callback(data.data);
            }
        } catch (error) {
            console.log(error);
        }
    });
    // while (true) {
    //     let { params, callback } = yield take(commonType.INSERT_COMMON_APP_LOG);
    //     try {
    //         let urlTypeName = params.url;
    //         let { data } = yield call(maskAxios.post, `${urlTypeName}/auditLogs/`, params);
    //         if (data.respCode === 0) {
    //             callback && callback(data.data);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
}

function* getLetterDefaultValue() {
    while (true) {
        let { params, callback } = yield take(commonType.GET_LETTER_DEFAULT_VALUE);
        try {
            let { data } = yield call(maskAxios.get, '/clinical-doc/defaultValue', { params });
            if (data.respCode === 0) {
                callback && callback(data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

function* getCommonServicedList() {
    while (true) {
        let { params, callback } = yield take(commonType.GET_COMMON_SERVICED_LIST);
        try {
            let apiFunctionName = params.apiFunctionName;
            let { data } = yield call(maskAxios.get, `${apiFunctionName}/findServiceList?patientKey=` + parseInt(params.patientKey));
            if (data.respCode === 0) {
                callback && callback(data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

function* getSppSiteAlter() {
    yield alsTakeEvery(commonType.GET_SPP_SITE_ALTER, function* (action) {
        const { callback } = action;
        try {
            let { data } = yield call(maskAxios.get, 'cmn/sppSiteAlter');
            if (data.respCode === 0) {
                callback && callback(data.data);
            }
        } catch (error) {
            console.log(error);
        }
    });
}

function* getEhsTeamSiteList() {
    yield alsTakeEvery(commonType.GET_EHS_TEAM_SITE_LIST, function* (action) {
        try {
            let { data } = yield call(maskAxios.get, 'ehs/ehs-team-site-list');
            if (data.respCode === 0) {
                const clinic = yield select(state => state.login.clinic);
                let ehsTeamSiteList = (data.data || []).filter(item => item.siteId === clinic.siteId && item.status === 'A');
                ehsTeamSiteList.sort((a, b) => { return a.dspSeq - b.dspSeq; });
                yield put({ type: commonType.LOAD_EHS_TEAM_SITE_LIST, ehsTeamSiteList: ehsTeamSiteList });
            }
        } catch (error) {
            console.log(error);
        }
    });
}

export const commonSagas = [
    getEncounterTypeList,
    getRoomsEncounterTypeList,
    getSvcEnctypes,
    listRooms,
    listService,
    listClinic,
    print,
    getCodeList,
    getGroupList,
    getHospitalList,
    getSpecialty,
    getPatientSearchType,
    josPrint,
    listPassport,
    listSpecReqTypes,
    josPrinterCheck,
    getSessionsConfig,
    getClcAntGestCalcParams,
    insertCommonAppLog,
    josPrinterStatusCheck,
    getLetterDefaultValue,
    getCommonServicedList,
    goPrint,
    getSppSiteAlter,
    getEhsTeamSiteList
];
