import { take, takeLatest, takeEvery, put, putResolve, call, select, all } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as patientSpecFuncActionType from '../../actions/patient/patientSpecFunc/patientSpecFuncActionType';
import * as patientActionType from '../../actions/patient/patientActionType';
import { updateState as updatePatientState, getPatientPUC } from '../../actions/patient/patientAction';
import { getPatientPUCFunc } from '../../sagas/patient/patientSaga';
import { updatePatientListField } from '../../actions/patient/patientSpecFunc/patientSpecFuncAction';
import { getMedicalSummaryVal } from '../../actions/medicalSummary/medicalSummaryAction';
import * as messageType from '../../actions/message/messageActionType';
import * as PatientUtil from '../../../utilities/patientUtilities';
import _ from 'lodash';
import * as anaService from '../../../services/ana/appointmentService';
import { PATIENT_LIST_SEARCH_NEXT_ACTION } from '../../../enums/enum';
import qs from 'qs';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../als/alsLogSaga';
import Enum from '../../../enums/enum';
import { SiteParamsUtil } from '../../../utilities';


function* getPatientList() {
    while (true) {
        try {
            let { params } = yield take(patientSpecFuncActionType.GET_PATIENT_LIST);
            yield put(alsStartTrans());

            const site = yield select(state => state.login.clinic);
            let { data } = yield call(maskAxios.get, '/ana/appointments/patientQueue?svcCd=' + (site ? site.svcCd : '') + '&siteIds=' + (site ? site.siteId : '') + '&startDate=' + params.dateFrom + '&endDate=' + params.dateTo);

            if (data.respCode === 0) {
                let patientQueueList = data.data;
                let patientQueueDtos = patientQueueList.patientQueueDtos;
                for (let i = 0; i < patientQueueDtos.length; i++) {
                    if (patientQueueDtos[i].patientDto) {
                        patientQueueDtos[i].patientDto = PatientUtil.transferPatientDocumentPair(_.cloneDeep(patientQueueDtos[i].patientDto));
                    }
                }
                const clinicList = yield select(state => state.common.clinicList);
                yield put({
                    type: patientSpecFuncActionType.UPDATE_PATIENT_LIST_FIELD,
                    fields: {
                        patientQueueList: patientQueueList
                    },
                    clinicList
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
    let { params } = action;
    let url = '/patient/patients?';
    for (let p in params) {
        url += `${p}=${encodeURIComponent(params[p])}&`;
    }
    url = url.substring(0, url.length - 1);
    let { data } = yield call(maskAxios.get, url);
    if (data.respCode === 0) {
        yield put({ type: patientSpecFuncActionType.PUT_SEARCH_PATIENT_LIST, data: data.data });
    } else {
        yield put({ type: patientSpecFuncActionType.PUT_SEARCH_PATIENT_LIST, data: null });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* seachPatientList() {
    yield alsTakeLatest(patientSpecFuncActionType.SEARCH_PATIENT_LIST, fetchSeachPatientList);
}

function* fetchSeachPatientPrecisely(action) {
    const siteParams = yield select(state => state.common.siteParams);
    const svcCd = yield select(state => state.login.service.svcCd);
    const siteId = yield select(state => state.login.clinic.siteId);
    const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, svcCd, siteId);
    const { params } = action;
    let data;
    if (isNewPmiSearchResultDialog) {
        let url = '/patient/searchPmi?';
        let _params = {
            surname: params.surname || '',
            givenName: params.givenName || '',
            phoneTypeCd: params.phoneTypeCd || '',
            dialingCd: params.dialingCd || '',
            areaCd: params.areaCd || '',
            phoneNo: params.phoneNo || '',
            docType: params.documentType || '',
            searchString: params.documentNo || ''
        };
        delete _params.documentNo;
        delete _params.documentType;
        for (let p in _params) {
            url += `${p}=${encodeURIComponent(_params[p])}&`;
        }
        url = url.substring(0, url.length - 1);
        let resp = yield call(maskAxios.get, url);
        data = resp.data;
    } else {
        let resp = yield call(maskAxios.post, '/patient/searchPatientPrecisely', params);
        data = resp.data;
    }
    if (data.respCode === 0) {
        yield put({ type: patientSpecFuncActionType.PUT_PATIENT_PRECISELY, data: isNewPmiSearchResultDialog ? data.data.patientDtos : data.data });
    } else {
        yield put({ type: patientSpecFuncActionType.PUT_PATIENT_PRECISELY, data: [] });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* seachPatientPrecisely() {
    yield alsTakeLatest(patientSpecFuncActionType.SEARCH_PATIENT_PRECISELY, fetchSeachPatientPrecisely);
}

function* fetchConfirmAnonymousPatient(action) {
    let { data } = yield call(maskAxios.put, '/ana/anonymousAppointments/pmiLinkage', action.params);
    if (data.respCode === 0) {
        yield put({ type: patientSpecFuncActionType.PUT_CONFIRM_ANONYMOUS_PATIENT, data: action.params.patientKey, status: 'success' });
        action.callback && action.callback(data.data);
    } else if (data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111202'
            }
        });
    } else if (data.respCode === 146) {
        yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
    } else if (data.respCode === 148) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110139'
            }
        });
    } else if (data.respCode === 149) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110140'
            }
        });
    } else if (data.respCode === 150) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: { msgCode: '110153' }
        });
    } else if (data.respCode === 151) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: { msgCode: '110204' }
        });
    } else if (data.respCode === 152) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: { msgCode: '110205' }
        });
    } else {
        yield put({ type: patientSpecFuncActionType.PUT_CONFIRM_ANONYMOUS_PATIENT, data: null, status: 'fail' });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* confirmAnonymousPatient() {
    yield alsTakeLatest(patientSpecFuncActionType.CONFIRM_ANONYMOUS_PATIENT, fetchConfirmAnonymousPatient);
}

function* resetAttendance() {
    while (true) {
        try {
            let { attenPara, searchPara } = yield take(patientSpecFuncActionType.RESET_ATTENDANCE);
            yield put(alsStartTrans());

            let { data } = yield call(anaService.resetAttendanceByAppointmentId,
                attenPara.appointmentId,
                {
                    patientKey: attenPara.patientKey,
                    apptVersion: attenPara.apptVersion,
                    atndId: attenPara.atndId
                }
            );
            if (data.respCode === 0) {
                yield put({
                    type: patientSpecFuncActionType.GET_PATIENT_LIST,
                    params: searchPara
                });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111001'
                    }
                });
            } else if (data.respCode === 100) {
                //appt not existed
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '111003' }
                });
            } else if (data.respCode === 111) {
                //encounter not existed
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '111010' }
                });
            } else if (data.respCode === 112) {
                //encounter has cancelled
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '111011' }
                });
            } else if (data.respCode === 113) {
                //encounter has closed
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '111012' }
                });
            } else if (data.respCode === 114) {
                //encounter is used
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '111013' }
                });
            } else if (data.respCode === 130) {
                //attendance not found
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '111014' }
                });
            } else if (data.respCode === 131) {
                //attendance is cancelled
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '111009' }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchSearchInPatientQueue(action) {
    const login = yield select(state => state.login);
    const clinicList = yield select(state => state.common.clinicList);
    const filterCondition = yield select(state => state.patientSpecFunc.filterCondition);
    const siteParams = yield select(state => state.common.siteParams);
    const service = login.service;
    const clinic = login.clinic;
    const userRoleType = login.loginInfo.userRoleType;
    const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, service.svcCd, clinic.siteId);

    let patientSearchSrc = '';
    let [patientQueueListResult, patientListResult] = [null, null];

    if (isNewPmiSearchResultDialog) {
        patientSearchSrc = `/patient/searchPmi?docType=${action.params.docType}&searchString=${encodeURIComponent(action.params.searchStr)}`;
    } else {
        patientSearchSrc = `/patient/patients?docType=${action.params.docType}&searchString=${encodeURIComponent(action.params.searchStr)}`;
    }
    // let { data } = yield call(axios.post, '/appointment/listPatientQueue', action.params);
    [patientQueueListResult, patientListResult] = yield all([
        call(maskAxios.get, '/ana/appointments/patientQueue?svcCd=' + service.serviceCd + '&siteIds=' + clinic.siteId + '&startDate=' + action.params.dateFrom + '&endDate=' + action.params.dateTo + '&searchStr=' + encodeURIComponent(action.params.searchStr)),
        // call(maskAxios.post, '/patient/searchPatient', { searchString: action.params.searchStr, pageSize: 1000000000 })
        // call(maskAxios.get, `/patient/patients?searchString=${action.params.searchStr}&pageSize=1000000000`)
        call(maskAxios.get, patientSearchSrc)
    ]);

    if (action.params.staffId) {
        if (isNewPmiSearchResultDialog) {
            patientSearchSrc = `/patient/searchPmi?docType=${action.params.docType}&searchString=${encodeURIComponent(action.params.searchStr)}&staffId=${action.params.staffId}`;
        } else {
            patientSearchSrc = `/patient/patients?docType=${action.params.docType}&searchString=${encodeURIComponent(action.params.searchStr)}&staffId=${action.params.staffId}`;
        }
        [patientQueueListResult, patientListResult] = yield all([
            call(maskAxios.get, '/ana/appointments/patientQueue?svcCd=' + service.serviceCd + '&siteIds=' + clinic.siteId + '&startDate=' + action.params.dateFrom + '&endDate=' + action.params.dateTo + '&searchStr=' + encodeURIComponent(action.params.searchStr)),
            // call(maskAxios.post, '/patient/searchPatient', { searchString: action.params.searchStr, pageSize: 1000000000 })
            // call(maskAxios.get, `/patient/patients?searchString=${action.params.searchStr}&pageSize=1000000000`)
            call(maskAxios.get, patientSearchSrc)
        ]);
    }
    let patientQueueList = patientQueueListResult.data;
    let patientList = patientListResult.data;
    // window.test = {
    //     ...window.test, ...{
    //         patientQueueList,
    //         patientList
    //     }
    // };

    if (patientQueueList.respCode === 0 && patientList.respCode === 0) {
        if (!patientQueueList.data || !patientList.data) {
            throw new Error('Service error');
        }
        let patientQueueListData = patientQueueList.data;
        let patientListData = patientList.data;
        let patientQueueDtos = patientQueueListData.patientQueueDtos.filter(x =>
            patientListData.patientDtos.some(y => y.patientKey === x.patientKey) &&
            PatientUtil.isAttnStatusRight(x.attnStatusCd, x.arrivalTime, filterCondition.attnStatusCd) &&
            (filterCondition.encounterTypeCd.trim() === '' || x.encntrTypeCd === filterCondition.encounterTypeCd) &&
            (filterCondition.subEncounterTypeCd.trim() === '' || x.rmCd === filterCondition.subEncounterTypeCd)
        );

        for (let i = 0; i < patientQueueDtos.length; i++) {
            if (patientQueueDtos[i].patientDto) {
                patientQueueDtos[i].patientDto = PatientUtil.transferPatientDocumentPair(_.cloneDeep(patientQueueDtos[i].patientDto));
            }
        }

        patientQueueListData = { totalNum: patientQueueDtos.length, patientQueueDtos };

        if (patientQueueDtos.length === 0) {
            patientQueueListData.nextActionPage = PATIENT_LIST_SEARCH_NEXT_ACTION.SEARCH_PATIENT;
        } else if (patientQueueDtos.length === 1 && patientQueueDtos[0].patientKey > 0) {
            patientQueueListData.nextActionPage = PATIENT_LIST_SEARCH_NEXT_ACTION.SELECT;
        } else {
            patientQueueListData.nextActionPage = PATIENT_LIST_SEARCH_NEXT_ACTION.PATIENT_LIST;
        }

        if (patientQueueListData.nextActionPage === PATIENT_LIST_SEARCH_NEXT_ACTION.SEARCH_PATIENT) {
            if (action.smartCardCallback && patientListData?.patientDtos?.length === 0) {
                action.smartCardCallback();
                return;
            }
            yield put({ type: patientSpecFuncActionType.PUT_SEARCH_PATIENT_LIST, data: patientListData, countryList: action.countryList });
            yield put({ type: patientSpecFuncActionType.PUT_SEARCH_IN_PATIENT_QUEUE, data: patientQueueListData });
        } else {
            yield put({ type: patientSpecFuncActionType.PUT_SEARCH_IN_PATIENT_QUEUE, data: patientQueueListData, countryList: action.countryList, clinicList });
        }
        yield put({
            type: patientSpecFuncActionType.UPDATE_PATIENT_LIST_FIELD, fields: { supervisorsApprovalDialogInfo: { staffId: '', open: false } }
        });
    } else if (patientList.respCode === 101) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110148',
                showSnackbar: true
            }
        });
    } else if (patientList.respCode === 2) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130702'
            }
        });
    } else if (patientList.respCode === 102) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130703'
            }
        });
    } else {
        yield put({ type: patientSpecFuncActionType.PUT_SEARCH_IN_PATIENT_QUEUE, data: patientQueueList, countryList: action.countryList });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* searchInPatientQueue() {
    yield alsTakeLatest(patientSpecFuncActionType.SEARCH_IN_PATIENT_QUEUE, fetchSearchInPatientQueue);
}

function* fetchSearchByAppointmentId(action) {
    const login = yield select(state => state.login);
    const clinicList = yield select(state => state.common.clinicList);
    const service = login.service;
    const clinic = login.clinic;
    let appointment = null;
    if (action.params && action.params.searchStr && action.params.searchStr !== null && action.params.searchStr.length <= 10) {
        let appointmentResponse = yield call(maskAxios.get, `/ana/appointments/${action.params.searchStr}?serviceCd=${service.serviceCd}&siteId=${clinic.siteId}`);
        let appointmentResponseBody = appointmentResponse.data;
        if (appointmentResponseBody.respCode === 0) {
            if (!appointmentResponseBody.data)
                throw new Error('Service error');

            appointment = appointmentResponseBody.data;
            let { appointmentId, patientKey } = appointment;


            // let patientResponse = yield call(maskAxios.post, `/patient/getPatient`, { patientKey });
            // let patientResponseBody = patientResponse.data;
            // if (patientResponseBody.respCode === 0) {
            //     let patient = patientResponseBody.data;

            //     appointment.patientDto = patient;
            // }
        }
    }
    yield put({
        type: patientSpecFuncActionType.UPDATE_PATIENT_LIST_FIELD, fields: {
            searchNextAction: PATIENT_LIST_SEARCH_NEXT_ACTION.SEARCH_APPOINTMENT,
            searchAppointment: appointment
        }
    });
}

function* searchByAppointmentId() {
    yield alsTakeLatest(patientSpecFuncActionType.SEARCH_BY_APPOINTMENT_ID, fetchSearchByAppointmentId);
}

function* pucReasonLog() {
    yield alsTakeEvery(patientSpecFuncActionType.PUC_REASON_LOG, function* (action) {
        const { params } = action;
        yield call(maskAxios.post, '/patient/pucReasonLog', params);
    });
}

function* pucReasonLogs() {
    yield alsTakeEvery(patientSpecFuncActionType.PUC_REASON_LOGS, function* (action) {
        const { params } = action;
        yield call(maskAxios.post, '/patient/pucReasonLogs', params);
    });
}

function* checkPatientUnderCare() {
    yield alsTakeEvery(patientSpecFuncActionType.CHECK_PATIENT_UNDER_CARE, function* (action) {
        const { loadPatientPanel, resetPatientList, selectedPatient, pucOptions } = action;
        const clinic = yield select(state => state.login.clinic);
        const loginUser = yield select(state => state.login.loginInfo.userDto);
        const { isClinicalBaseRole, hasClinicalFunction, hasNonClinicalFunction } = yield select(state => state.login.loginInfo);
        if (selectedPatient) {
            let { data } = yield call(maskAxios.get, '/patient/patients/checkPmiSelected', {
                params: {
                    patientKey: selectedPatient.patientKey,
                    svcCd: clinic.svcCd,
                    siteId: clinic.siteId,
                    userId: loginUser.userId
                },
                paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
            });
            if (data.respCode === 0) {
                let pucChecking = {
                    patientOfAssignedCln: data.data.patientOfAssignedCln,
                    patientOfAssignedSvc: data.data.patientOfAssignedSvc,
                    patientOfLogonCln: data.data.patientOfLogonCln,
                    patientOfLogonSvc: data.data.patientOfLogonSvc,
                    pucWithinPeriod: data.data.pucWithinPeriod,
                    isRequirePUCNotification: data.data.isRequirePUCNotification,
                    pucResult: data.data.selectedResult,
                    justificationAction: null
                };

                if (data.data.selectedResult === 0) {
                    // yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111301', showSnackbar: true } });
                    // yield put(updatePatientState({ pucChecking }));
                    // loadPatientPanel && loadPatientPanel();
                    yield call(pucSuccess, { selectedPatient, pucChecking, callbacks: { success: loadPatientPanel, failed: resetPatientList }, pucOptions });
                } else if (data.data.selectedResult === 100) {
                    //not clinical user
                    // yield put(updatePatientState({ pucChecking }));
                    // loadPatientPanel && loadPatientPanel();
                    yield call(pucSuccess, { selectedPatient, pucChecking, callbacks: { success: loadPatientPanel, failed: resetPatientList }, pucOptions });
                } else if (data.data.selectedResult === 101) {
                    //not access
                    if ((isClinicalBaseRole && hasNonClinicalFunction) || (!isClinicalBaseRole && hasClinicalFunction)) {
                        // yield put(updatePatientState({ pucChecking }));
                        // loadPatientPanel && loadPatientPanel();
                        yield call(pucSuccess, { selectedPatient, pucChecking, callbacks: { success: loadPatientPanel, failed: resetPatientList }, pucOptions });
                    }
                    else {
                        yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111302' } });
                        // resetPatientList && resetPatientList();
                        yield call(pucFailed, { selectedPatient, callback: resetPatientList, pucOptions });
                    }
                } else if (data.data.selectedResult === 102) {
                    //justification
                    // yield put(updatePatientState({ pucChecking }));
                    // justificationAction ? yield put(justificationAction) : yield put(updatePatientListField({ patientUnderCareDialogOpen: true, patientSelected: selectedPatient }));
                    yield call(pucJustification, { selectedPatient, pucChecking, pucOptions });
                }
            } else if (data.respCode === 100) {
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111403' } });
            }
        }
    });
}

function* pucSuccess(pucParams) {
    const svcCd = yield select(state => state.login.service.svcCd);
    const { selectedPatient, pucChecking, callbacks } = pucParams;
    const { patientKey, appointmentId, caseNo } = selectedPatient;

    // yield put(updatePatientState({ pucChecking }));

    // get patient action, another action to load patient info

    // Remove API call as other team's decision
    // yield put(getMedicalSummaryVal({
    //     params: {
    //         patientKey: patientKey,
    //         serviceCd: svcCd
    //     }
    // }));

    let result = yield call(getPatientPUCFunc, { patientKey, appointmentId, caseNo });


    if (result) {
        // yield putResolve(test({ pucChecking }));
        yield put({ type: patientActionType.PUT_PATIENT_PUC, pucChecking });
        yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111301', showSnackbar: true } });
        if (svcCd === 'DTS') {
            // DTS custom action
            // yield put({ type: 'DTS-.....', payload: {/*..........*/} });
        }
        else {
            // Other service implemetation
            callbacks && callbacks.success && callbacks.success(selectedPatient, pucChecking);
        }
    }
    else
        yield call(pucFailed, { selectedPatient, callback: callbacks?.failed });
}

function* pucFailed(pucParams) {
    const svcCd = yield select(state => state.login.service.svcCd);
    const { selectedPatient, pucChecking, callback } = pucParams;

    if (svcCd === 'DTS') {
        // DTS custom action
        // yield put({ type: 'DTS-.....', payload: {/*..........*/} });
    }
    else {
        // Other service implemetation
        callback && callback();
    }
}

function* pucJustification(pucParams) {
    const svcCd = yield select(state => state.login.service.svcCd);
    const { selectedPatient, pucChecking, pucOptions } = pucParams;

    yield put({ type: patientActionType.PUT_PATIENT_PUC, pucChecking });
    if (svcCd === 'DTS') {
        // DTS custom action
        // yield put({ type: 'DTS-.....', payload: {/*..........*/} });
    }
    else {
        // Other service implemetation
        yield put(updatePatientListField({ patientUnderCareDialogOpen: true, patientUnderCareVersion: pucOptions.patientUnderCareVersion ?? null, patientSelected: selectedPatient }));
    }
}

function* checkPatientName() {
    yield alsTakeEvery(patientSpecFuncActionType.CHECK_PATIENT_NAME, function* (action) {

        const { searchString, callback } = action;
        let { data } = yield call(maskAxios.get, '/patient/patients/nameChecking?patientName=' + encodeURIComponent(searchString));
        if (data.respCode === 0) {
            callback && callback(data.data);
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

function* printPatientList() {
    yield alsTakeEvery(patientSpecFuncActionType.PRINT_PATIENT_LIST, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/ana/apptListRpt', { params: params });
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}


export const patientSpecFuncSaga = [
    getPatientList,
    seachPatientList,
    seachPatientPrecisely,
    confirmAnonymousPatient,
    resetAttendance,
    searchInPatientQueue,
    searchByAppointmentId,
    pucReasonLog,
    pucReasonLogs,
    checkPatientUnderCare,
    checkPatientName,
    printPatientList
];
