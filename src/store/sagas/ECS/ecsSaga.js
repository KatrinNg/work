import { select, take, call, put, race, fork, all } from 'redux-saga/effects';
import * as ecsActionType from '../../actions/ECS/ecsActionType';
import * as registrationType from '../../actions/registration/registrationActionType';
import * as patientActionType from '../../actions/patient/patientActionType';
import * as ecsAction from '../../actions/ECS/ecsAction';
import * as ecsService from '../../../services/ECS/ecsService';
import * as commonAction from '../../actions/common/commonAction';
import { openCommonMessage } from '../../actions/message/messageAction';
import * as EcsUtilities from '../../../utilities/ecsUtilities';
import _ from 'lodash';
import * as ecsReducer from '../../reducers/ECS/ecsReducer';
import * as commonUtilities from '../../../utilities/commonUtilities';
import Enum from '../../../enums/enum';
import moment from 'moment';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import * as logActions from '../../actions/als/logAction';

const getSelectedEcsState = state => state.ecs.selectedPatientEcsStatus;
const getSelectedOcsssState = state => state.ecs.selectedPatientOcsssStatus;
const getSelectedMwecsState = state => state.ecs.selectedPatientMwecsStatus;

const getRegSummaryEcsStatus = state => state.ecs.regSummaryEcsStatus;
const getRegSummaryOcsssStatus = state => state.ecs.regSummaryOcsssStatus;
const getRegSummaryMwecsStatus = state => state.ecs.regSummaryMwecsStatus;

const getPatientSummaryEcsStatus = state => state.ecs.patientSummaryEcsStatus;
const getPatientSummaryOcsssStatus = state => state.ecs.patientSummaryOcsssStatus;
const getPatientSummaryMwecsStatus = state => state.ecs.patientSummaryMwecsStatus;

const getClinicConfig = state => state.common.clinicConfig;
const getClinic = state => state.login.clinic;
const getService = state => state.login.service;

const getRegistrationState = state => state.registration.patientBaseInfo;
const getPateintSummaryState = state => state.registration.patientById;
const getPatientState = state => state.patient.patientInfo;
const ECS_SUCCESS_MSG_CD = '130000';
const ECS_UNAVAILABLE_MSG_CD = '130001';
const ECS_UNKNOWN_MSG_CD = '130099';
const OCSSS_OPEN_MSG_CD = '130010';
const OCSSS_VALID_MSG_CD = '130011';
const OCSSS_INVALID_MSG_CD = '130012';
const OCSSS_UNAVAILABLE_MSG_CD = '130013';
const MWECS_SUCCESS_MSG_CD = '130030';
const MWECS_INVALID_MSG_CD = '130031';
const MWECS_UNAVAILABLE_MSG_CD = '130032';

const TIMEOUT_RESPONSE_CD = 199;

function* syncRegPatientToPatientSummary() {
    let patientEcsInReg = yield select(getRegSummaryEcsStatus);
    let patientOcsssInReg = yield select(getRegSummaryOcsssStatus);
    let patientMwecsInReg = yield select(getRegSummaryMwecsStatus);

    yield put(ecsAction.setEcsPatientStatusInPatientSummary(patientEcsInReg));
    yield put(ecsAction.setOcsssPatientStatusInPatientSummary(patientOcsssInReg));
    yield put(ecsAction.setMwecsPatientStatusInPatientSummary(patientMwecsInReg));
}


function* syncPatientSummaryToRegPatient() {
    let ecsInSum = yield select(getPatientSummaryEcsStatus);
    let ocsssInSum = yield select(getPatientSummaryOcsssStatus);

    yield put(ecsAction.setEcsPatientStatusInRegPage(ecsInSum));
    yield put(ecsAction.setOcsssPatientStatusInRegPage(ocsssInSum));
}

function* syncPatientSummaryToSelectedPateint() {
    let ecsInSum = yield select(getPatientSummaryEcsStatus);
    let ocsssInSum = yield select(getPatientSummaryOcsssStatus);
    let mwecsInSum = yield select(getPatientSummaryMwecsStatus);
    yield put(ecsAction.setEcsPatientStatus(ecsInSum));
    yield put(ecsAction.setOcsssPatientStatus(ocsssInSum));
    yield put(ecsAction.setMwecsPatientStatus(mwecsInSum));
}

function* syncSelectedPateintToPatientSummary() {
    let ecsInSelected = yield select(getSelectedEcsState);
    let ocsssInSelected = yield select(getSelectedOcsssState);
    let mwecsInSelected = yield select(getSelectedMwecsState);

    yield put(ecsAction.setEcsPatientStatusInPatientSummary(ecsInSelected));
    yield put(ecsAction.setOcsssPatientStatusInPatientSummary(ocsssInSelected));
    yield put(ecsAction.setMwecsPatientStatusInPatientSummary(mwecsInSelected));
}

function* resetRegPage() {
    while (true) {
        try {
            yield take(registrationType.RESET_ALL);
            yield put(alsStartTrans());

            yield put(ecsAction.resetEcsPatientStatus(ecsActionType.SET_REG_ECS_PATIENT_STATUS));
            yield put(ecsAction.resetOcsssPatientStatus(ecsActionType.SET_REG_OCSSS_PATIENT_STATUS));
            yield put(ecsAction.resetMwecsPatientStatus(ecsActionType.SET_REG_MWECS_PATIENT_STATUS));

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* regPageEnterPatientSummarySyncControl() {
    while (true) {
        try {
            //only run if insert or update patient
            let { updateData } = yield take(registrationType.UPDATE_STATE);
            yield put(alsStartTrans());

            if (updateData.isOpenReview) {
                yield syncRegPatientToPatientSummary();
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* syncPatientLatestActiveResult() {
    while (true) {
        try {
            yield take(patientActionType.PUT_PATIENT_INFO);
            yield put(alsStartTrans());

            let patientInfo = yield select(getPatientState);
            let patientKey = patientInfo ? patientInfo.patientKey : null;
            let patientHkid = patientInfo ? EcsUtilities.getProperHkicForEcs(patientInfo) : null;
            let nowMomentDate = moment();
            if (patientKey) {
                let [ecs, ocsss, mwecs] = yield all([
                    ecsService.getEcsByPaitentKeyAndCheckDate(patientKey, nowMomentDate),
                    ecsService.getOcsssByPaitentKeyAndCheckDate(patientKey, nowMomentDate),
                    ecsService.getMwecsByPaitentKeyAndCheckDate(patientKey, nowMomentDate)
                ]);

                if (ecs.data.respCode === 0) {
                    let ecsResult = ecs.data.data;
                    if (ecsResult) {
                        let newEcsState = ecsService.transformEcsResponseDataToReduxState(ecsResult.ecsChkId, ecsResult.checkingResult.data, ecsResult.lastCheckedTime, ecsResult.isAssociate, ecsResult.checkingResult.hkid);
                        yield put(ecsAction.setEcsPatientStatus(newEcsState));
                    }
                }

                if (ocsss.data.respCode === 0) {
                    let ocsssResult = ocsss.data.data;
                    if (ocsssResult) {
                        let newOcsssState = ecsService.transformOcsssResponseDataToReduxState(ocsssResult.restlChkId, ocsssResult.checkingResult.data, ocsssResult.lastCheckedTime, patientHkid);
                        yield put(ecsAction.setOcsssPatientStatus(newOcsssState));
                    }
                }

                if (mwecs.data.respCode === 0) {
                    let mwecsResult = mwecs.data.data;
                    if (mwecsResult) {
                        let newMwecsState = ecsService.transformMwecsResponseDataToReduxState(mwecsResult.medWaiverChkId, mwecsResult.checkingResult.data, mwecsResult.lastCheckedTime, patientHkid);
                        yield put(ecsAction.setMwecsPatientStatus(newMwecsState));
                    }

                }
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* singleSyncControl(regActionType, patientSummaryActionType, selectedActionType) {

    try {
        let { reg, sum, selected } = yield race(
            {
                reg: take(regActionType),
                sum: take(patientSummaryActionType),
                selected: take(selectedActionType)
            }
        );
        yield put(alsStartTrans());

        if (!reg) {
            let patientSummaryPatient = yield select(getPateintSummaryState);
            let selectedPatient = yield select(getPatientState);
            const patientSummaryAndSelectedOneIsSame = selectedPatient && patientSummaryPatient && patientSummaryPatient.patientKey === selectedPatient.patientKey;
            if (sum) {
                yield syncPatientSummaryToRegPatient();

                if (patientSummaryAndSelectedOneIsSame) {
                    yield syncPatientSummaryToSelectedPateint();
                }
            }

            if (selected) {
                if (patientSummaryAndSelectedOneIsSame) {
                    yield syncSelectedPateintToPatientSummary();
                }
            }
        }
    } finally {
        yield put(alsEndTrans());
    }
}

function* openOcsssDialog() {
    while (true) {
        try {
            let { params, callback, callbackAction, checkAction } = yield take(ecsActionType.OPEN_OCSSS_DIALOG);
            yield put(alsStartTrans());

            let messagePayload = {
                msgCode: OCSSS_OPEN_MSG_CD,
                showSnackbar: false,
                btnActions: {
                    btn1Click: () => {
                        checkAction(
                            params,
                            callback,
                            callbackAction);
                    }
                }
            };
            yield put(openCommonMessage(messagePayload));
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* openCloseMwecsDialog() {
    while (true) {

        try {
            let { open, close } = yield race({
                open: take(ecsActionType.OPEN_MWECS_DIALOG),
                close: take(ecsActionType.CLOSE_MWECS_DIALOG)
            });

            yield put(alsStartTrans());

            let isOpen = true;
            let callback = null;
            if (close) {
                isOpen = false;
                callback = close.callback;
            } else {
                callback = open.callback;
            }

            if (isOpen) {
                yield put(ecsAction.setMwecsInput({ ...open.params, callbackAction: open.callbackAction }));
            }
            yield put(ecsAction.setMwecsActive(isOpen));

            if (callback) {
                callback();
            }

            yield put(ecsAction.setMwecsOpenDialog(isOpen));
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* openCloseEcsDialog() {
    while (true) {

        try {
            let { open, close } = yield race({
                open: take(ecsActionType.OPEN_ECS_DIALOG),
                close: take(ecsActionType.CLOSE_ECS_DIALOG)
            });
            yield put(alsStartTrans());

            let isOpen = true;
            let callback = null;

            if (close) {
                isOpen = false;
                callback = close.callback;
            } else {
                callback = open.callback;
            }

            if (isOpen) {
                let ecsCurrentInput = yield select(state => state.ecs.ecsDialogInput);
                let inputParams = { ...ecsCurrentInput, ...open.inputParams };
                yield put(ecsAction.setEcsInput({ ...inputParams, callbackAction: open.callbackAction, onCloseDialogCallback: yield put(ecsAction.setEcsCheckingResult([]) )} ));
            }

            if (isOpen) {
                yield put(ecsAction.setEcsActive(isOpen));
                if (callback) {
                    callback();
                }
                yield put(ecsAction.setEcsOpenDialog(isOpen));
            } else {
                yield put(ecsAction.setEcsOpenDialog(isOpen));
                if (callback) {
                    callback();
                }
                yield put(ecsAction.setEcsActive(isOpen));
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}


function* handleUnknowError(msgCode, desc) {
    yield put(openCommonMessage({
        msgCode: msgCode,
        showSnackbar: false,
        params: [{ name: 'errorCode', value: msgCode }, { name: 'errorDesc', value: desc }]
    }));
    yield put(logActions.auditError(desc));
}

function* handleKnownError(ecsErrorCode, desc) {
    yield put(openCommonMessage({
        msgCode: ECS_UNKNOWN_MSG_CD,
        showSnackbar: false,
        params: [{ name: 'errorCode', value: ecsErrorCode }, { name: 'errorDesc', value: desc }]
    }));
    yield put(logActions.auditError(desc));
}


function* regPageResetControl() {
    let lastEcsResult = yield select(getRegSummaryEcsStatus);
    let lastOcsssResult = yield select(getRegSummaryOcsssStatus);
    let lastPatientInfo = yield select(getRegistrationState);
    while (true) {
        try {
            let { resetAll, putPatient, checkEcs, checkOcsss, onBlur } = yield race({
                resetAll: take(registrationType.RESET_ALL),
                putPatient: take(registrationType.SELECTED_PATIENT_BY_ID),
                checkEcs: take(ecsActionType.SET_REG_ECS_PATIENT_STATUS),
                checkOcsss: take(ecsActionType.SET_REG_OCSSS_PATIENT_STATUS),
                onBlur: take(ecsActionType.REG_PAGE_KEY_FIELD_ON_BLUR)
            });

            yield put(alsStartTrans());

            if (checkEcs) {
                lastEcsResult = yield select(getRegSummaryEcsStatus);
                lastPatientInfo = yield select(getRegistrationState);
            }

            if (checkOcsss) {

                lastOcsssResult = yield select(getRegSummaryOcsssStatus);
                lastPatientInfo = yield select(getRegistrationState);
            }

            if (putPatient || resetAll || onBlur) {
                lastPatientInfo = yield select(getRegistrationState);
                lastEcsResult = yield select(getRegSummaryEcsStatus);
                lastOcsssResult = yield select(getRegSummaryOcsssStatus);
                if (EcsUtilities.isPatientEcsRelatedFieldChangedByStore(lastEcsResult, lastPatientInfo)) {
                    yield put(ecsAction.resetEcsPatientStatus(ecsActionType.SET_REG_ECS_PATIENT_STATUS));
                }

                if (EcsUtilities.isPatientEcsRelatedFieldChangedByStore(lastOcsssResult, lastPatientInfo)) {
                    yield put(ecsAction.resetOcsssPatientStatus(ecsActionType.SET_REG_OCSSS_PATIENT_STATUS));
                }

                lastEcsResult = yield select(getRegSummaryEcsStatus);
                lastOcsssResult = yield select(getRegSummaryOcsssStatus);
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* resetForSelectedPatient() {
    yield put(ecsAction.resetEcsPatientStatus(ecsActionType.SET_ECS_PATIENT_STATUS));
    yield put(ecsAction.resetOcsssPatientStatus(ecsActionType.SET_OCSSS_PATIENT_STATUS));
    yield put(ecsAction.resetMwecsPatientStatus(ecsActionType.SET_MWECS_PATIENT_STATUS));
}

function* ecsResetControl() {
    while (true) {
        try {
            let { resetType } = yield take(ecsActionType.RESET_ECS_PATIENT_STATUS);
            yield put(alsStartTrans());

            yield put({
                type: resetType,
                ecsPatientStatus: _.cloneDeep(ecsReducer.initSelectedPatientEcsStatus)
            });
            yield put(
                ecsAction.setEcsInput(_.cloneDeep(ecsReducer.initEcsDialogInput))
            );
        } finally {
            yield put(alsEndTrans());
        }

    }
}

function* ocsssResetControl() {
    while (true) {
        try {
            let { resetType } = yield take(ecsActionType.RESET_OCSSS_PATIENT_STATUS);
            yield put(alsStartTrans());

            yield put({
                type: resetType,
                ocsssPatientStatus: _.cloneDeep(ecsReducer.initSelectedPatientOcsssStatus)
            });
            yield put(
                ecsAction.setOcsssInput(_.cloneDeep(ecsReducer.initOcsssDialogInput))
            );
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* mwecsResetControl() {
    while (true) {
        try {
            let { resetType } = yield take(ecsActionType.RESET_MWECS_PATIENT_STATUS);
            yield put(alsStartTrans());

            yield put({
                type: resetType,
                mwecsPatientStatus: _.cloneDeep(ecsReducer.initSelectedPatientMwecsStatus)
            });
            yield put(
                ecsAction.setMwecsInput(_.cloneDeep(ecsReducer.initMwecsDialogInput))
            );

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* patientResetAll() {
    while (true) {
        yield take(patientActionType.RESET_ALL);
        yield resetForSelectedPatient();
    }
}

function* checkEcs() {
    while (true) {

        try {
            let { params, hkic, callback, callbackAction } = yield take(ecsActionType.CHECK_ECS);
            if (params.machineId) {
                yield put(logActions.auditAction(`Machine ${params.machineId} Check Ecs`));
            } else {
                yield put(logActions.auditAction('Check Ecs'));
            }
            yield put(alsStartTrans());
            //yield put(logActions.auditAction('Check ECS'));

            //get current login service code
            const currentService = yield select(getService);
            const svcCd = currentService.serviceCd;
            params.svcCd = svcCd;
            //change asscoicated hkid in input store
            if (params && params.checkType === 'N') {//is assoicated checking
                let ecsCurrentInput = yield select(state => state.ecs.ecsDialogInput);
                let inputParams = { ...ecsCurrentInput, associatedHkic: params.hkid };
                yield put(ecsAction.setEcsInput({ ...inputParams }));
            }


            yield put(commonAction.openCommonCircular());
            let { data } = yield call(ecsService.checkEcs, { ...params, defaultTemplate: 'N' });
            let callbackPara={isSingle:true};
            if (data.respCode === 0) {
                let ecsResp = data.data.checkingResult.data;
                if (ecsResp.result.length === 1) {
                    let newEcsState = ecsService.transformEcsResponseDataToReduxState(data.data.ecsChkId, data.data.checkingResult.data, data.data.lastCheckedTime, data.isAssociate, hkic);

                    if (callbackAction) {
                        yield fork(singleSyncControl, ecsActionType.SET_REG_ECS_PATIENT_STATUS, ecsActionType.SET_PATIENT_SUMMARY_ECS_PATIENT_STATUS, ecsActionType.SET_ECS_PATIENT_STATUS);
                        yield put(
                            callbackAction(newEcsState)
                        );
                    }
                    callbackPara={
                        ...callbackPara,
                        result:newEcsState
                    };
                    callback && callback(callbackPara);
                } else if (ecsResp.result.length > 1) {
                    //multiple case
                    yield put({ type: ecsActionType.SET_ECS_RESULT, ecsResult: ecsResp.result });
                    callbackPara={
                        ...callbackPara,
                        result:ecsResp.result,
                        lastCheckedTime:data.data.lastCheckedTime,
                        isSingle:false
                    };
                    callback && callback(callbackPara);
                    //     let ecsCurrentInput = yield select(state => state.ecs.ecsDialogInput);
                    // let inputParams = {...ecsCurrentInput, ...open.inputParams};
                    //yield put(ecsAction.setEcsInput({ ...inputParams , callbackAction: open.callbackAction}));
                    //     yield put({type:ecsActionType.SET_ECS_INPUT,})
                }

                if (data.data.checkingResult && data.data.checkingResult.success) {
                    yield put(openCommonMessage({
                        msgCode: ECS_SUCCESS_MSG_CD,
                        showSnackbar: true
                    }));
                } else {
                    yield handleUnknowError(ECS_UNKNOWN_MSG_CD, data.errMsg);
                }

            } else if (data.respCode === TIMEOUT_RESPONSE_CD) {
                yield put(openCommonMessage({
                    msgCode: ECS_UNAVAILABLE_MSG_CD,
                    showSnackbar: true
                }));
            } else {
                yield handleUnknowError(ECS_UNKNOWN_MSG_CD, data.errMsg ? 'Error Message: ' + data.errMsg : 'Service is unavailable.');
            }

        } catch (error) {
            yield handleUnknowError(ECS_UNKNOWN_MSG_CD, 'Service is unavailable.' + ' ' + (error ? 'Error Message: ' + error.toString() : ''));
        } finally {
            yield put(alsEndTrans());
            yield put(commonAction.closeCommonCircular());
        }
    }
}

function* checkOcsss() {
    while (true) {
        try {
            let { params, callback, callbackAction } = yield take(ecsActionType.CHECK_OCSSS);
            yield put(alsStartTrans());
            yield put(logActions.auditAction('Check OCSSS'));
            yield put(commonAction.openCommonCircular());

            let { data } = yield call(ecsService.checkOcsss, params);

            if (data.respCode === 0) {
                let newOcsssState = ecsService.transformOcsssResponseDataToReduxState(data.data.restlChkId, data.data.checkingResult.data, data.data.lastCheckedTime, params.hkid);

                if (callbackAction) {
                    yield fork(singleSyncControl, ecsActionType.SET_REG_OCSSS_PATIENT_STATUS, ecsActionType.SET_PATIENT_SUMMARY_OCSSS_PATIENT_STATUS, ecsActionType.SET_OCSSS_PATIENT_STATUS);

                    yield put(
                        callbackAction(newOcsssState)
                    );
                }

                callback && callback(newOcsssState);

                if (newOcsssState.isValid) {

                    yield put(openCommonMessage({
                        msgCode: OCSSS_VALID_MSG_CD,
                        showSnackbar: true
                    }));
                } else if (newOcsssState.checkingResult !== 'E') {
                    yield put(openCommonMessage({
                        msgCode: OCSSS_INVALID_MSG_CD,
                        showSnackbar: true
                    }));
                } else { // === 'E'
                    yield handleKnownError(newOcsssState.checkingResult, newOcsssState.errorMessage);
                }
            } else if (data.respCode === TIMEOUT_RESPONSE_CD) {
                yield put(openCommonMessage({
                    msgCode: OCSSS_UNAVAILABLE_MSG_CD,
                    showSnackbar: true
                }));
            } else {
                yield handleUnknowError(ECS_UNKNOWN_MSG_CD, data.errMsg ? data.errMsg : 'Service is unavailable.');
            }
        } catch (error) {
            yield handleUnknowError(ECS_UNKNOWN_MSG_CD, 'Service is unavailable.' + ' ' + (error ? 'Error Message: ' + error.toString() : ''));
        } finally {
            yield put(alsEndTrans());
            yield put(commonAction.closeCommonCircular());
        }
    }
}

function* checkMwecs() {
    while (true) {
        try {
            let { params, callback, callbackAction } = yield take(ecsActionType.CHECK_MWECS);
            yield put(alsStartTrans());
            if (params.machineId) {
                yield put(logActions.auditAction(`Machine ${params.machineId} Check MWECS`));
            } else {
                yield put(logActions.auditAction('Check MWECS'));
            }
            yield put(commonAction.openCommonCircular());
            let { data } = yield call(ecsService.checkMwecs, params);
            if (data.respCode === 0) {
                let newMwecsState = ecsService.transformMwecsResponseDataToReduxState(data.data.medWaiverChkId, data.data.checkingResult.data, data.data.lastCheckedTime, params.idNumber);


                if (callbackAction) {
                    yield fork(singleSyncControl, ecsActionType.SET_REG_MWECS_PATIENT_STATUS, ecsActionType.SET_PATIENT_SUMMARY_MWECS_PATIENT_STATUS, ecsActionType.SET_MWECS_PATIENT_STATUS);

                    yield put(
                        callbackAction(newMwecsState)
                    );
                }

                callback && callback(newMwecsState);

                if (newMwecsState.isValid) {

                    yield put(openCommonMessage({
                        msgCode: MWECS_SUCCESS_MSG_CD,
                        showSnackbar: true
                    }));
                } else if (newMwecsState.result !== 'E') {
                    yield put(openCommonMessage({
                        msgCode: MWECS_INVALID_MSG_CD,
                        showSnackbar: true
                    }));
                } else { // === 'E'
                    yield handleKnownError(newMwecsState.errorCode, newMwecsState.errorMessage);
                }
            } else if (data.respCode === TIMEOUT_RESPONSE_CD) {
                yield put(openCommonMessage({
                    msgCode: MWECS_UNAVAILABLE_MSG_CD,
                    showSnackbar: true
                }));
            } else {
                yield handleUnknowError(ECS_UNKNOWN_MSG_CD, data.errMsg ? data.errMsg : 'Service is unavailable.');
            }
        } catch (error) {
            yield handleUnknowError(ECS_UNKNOWN_MSG_CD, 'Service is unavailable.' + ' ' + (error ? 'Error Message: ' + error.toString() : ''));
        } finally {
            yield put(alsEndTrans());
            yield put(commonAction.closeCommonCircular());
        }
    }
}

function* refreshEcsServiceStatus() {
    while (true) {
        try {
            yield take(ecsActionType.REFRESH_STATUS);
            yield put(alsStartTrans());

            const clinicConfig = yield select(getClinicConfig);
            const currentClinic = yield select(getClinic);
            const currentService = yield select(getService);

            const siteId = currentClinic.siteId;
            const svcCd = currentService.serviceCd;

            let where = { serviceCd: svcCd, siteId };
            const isActive = configObj => configObj && configObj.paramValue === 'A';
            const isTrue = configObj => configObj && configObj.paramValue === 'Y';


            const ecsState = isActive(commonUtilities.getHighestPrioritySiteParams(Enum.ECS_CLINIC_CONFIG_KEY.ECS_SERVICE_STATUS, clinicConfig, where));
            const ocsssState = isActive(commonUtilities.getHighestPrioritySiteParams(Enum.ECS_CLINIC_CONFIG_KEY.OCSSS_SERVICE_STATUS, clinicConfig, where));
            const mwecsState = isActive(commonUtilities.getHighestPrioritySiteParams(Enum.ECS_CLINIC_CONFIG_KEY.MWECS_SERVICE_STATUS, clinicConfig, where));
            const showEcsBtnInBooking = isTrue(commonUtilities.getHighestPrioritySiteParams(Enum.ECS_CLINIC_CONFIG_KEY.SHOW_ECS_BTN_IN_BOOKING, clinicConfig, where));

            yield put({
                type: ecsActionType.SET_STATUS,
                data: {
                    ecsServiceStatus: ecsState,
                    ocsssServiceStatus: ocsssState,
                    mwecsServiceStatus: mwecsState,
                    showEcsBtnInBooking: showEcsBtnInBooking
                }
            });

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* selectTwinsRec() {
    while (true) {
        try {
            let { ecsResult,patientKey,lastCheckedTime,benefitType,callback,callbackAction } = yield take(ecsActionType.SELECT_TWINS_RECORD);
            yield put(alsStartTrans());
            yield put(logActions.auditAction('Select Twins Record'));
            yield put(commonAction.openCommonCircular());

            yield call(ecsService.updateEcs, { patientKey: patientKey,ecsChkId:ecsResult.ecsChkId});
            // if(data.respCode===0){
            //     //do something.
            // }else{
            //     //else case
            // }
            const ecsData={result:[{...ecsResult}]};
            let patientInfo = yield select(getPatientState);
            //let patientKey = patientInfo ? patientInfo.patientKey : null;
            let patientHkid = patientInfo ? EcsUtilities.getProperHkicForEcs(patientInfo) : null;
            let newEcsState = ecsService.transformEcsResponseDataToReduxState(ecsResult.ecsChkId, ecsData, lastCheckedTime, '', patientHkid);
            newEcsState=EcsUtilities.checkEcsDataIsValid(newEcsState,benefitType);

            if (callbackAction) {
                yield fork(singleSyncControl, ecsActionType.SET_REG_ECS_PATIENT_STATUS, ecsActionType.SET_PATIENT_SUMMARY_ECS_PATIENT_STATUS, ecsActionType.SET_ECS_PATIENT_STATUS);
                yield put(
                    callbackAction(newEcsState)
                );
            }
            callback && callback({ result: newEcsState });
        } catch (error) {
            yield handleUnknowError(ECS_UNKNOWN_MSG_CD, 'Service is unavailable.' + ' ' + (error ? 'Error Message: ' + error.toString() : ''));
        } finally {
            yield put(alsEndTrans());
            yield put(commonAction.closeCommonCircular());
        }
    }
}

export const ecsSaga = [
    resetRegPage,
    regPageEnterPatientSummarySyncControl,
    syncPatientLatestActiveResult,
    regPageEnterPatientSummarySyncControl,
    ecsResetControl,
    ocsssResetControl,
    mwecsResetControl,
    openOcsssDialog,
    openCloseMwecsDialog,
    openCloseEcsDialog,
    regPageResetControl,
    patientResetAll,
    refreshEcsServiceStatus,
    checkEcs,
    checkOcsss,
    checkMwecs,
    selectTwinsRec
];