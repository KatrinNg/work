import { takeLatest, take, call, put, all, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/certificate/referralLetter/referralLetterActionType';
import { print } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import { alsStartTrans, alsEndTrans } from '../../../actions/als/transactionAction';
import { alsTakeLatest } from '../../als/alsLogSaga';
import Enum from '../../../../enums/enum';
function* fetchReferralLetterCert(action) {
    try {
        const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
        let params = action.params;
        let isPreview = action.isPreview;
        params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'Referral Letter').outDocTypeId;
        const closeTabFunc = yield select(state => state.referralLetter.closeTabFunc);
        // let { data } = yield call(maskAxios.post, '/appointment/getReferralLetter', action.params);

        if (// familyHistory = Histories/Allergies/Adverse Drug Reaction & Alerts
                CommonUtilities.isMaxSizeCharacters(params.familyHistory, 4000)
                // problem = problem
                || CommonUtilities.isMaxSizeCharacters(params.problem, 4000)
                // // commenced = Treatment Commenced
                || CommonUtilities.isMaxSizeCharacters(params.commenced, 4000)
                // // results = Hx/PE/Ix Results
                || CommonUtilities.isMaxSizeCharacters(params.results, 4000)
            ) {
                console.log('isMaxSizeCharacters');
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        params: [
                            {
                                name: 'FIELDNAME',
                                value: 'Histories/Allergies/Adverse Drug Reaction & Alerts or problem or Treatment Commenced or Hx/PE/Ix Results'
                            },
                            {
                                name: 'LEN',
                                value: '4000'
                            }
                        ],
                        msgCode: '115010'
                    }
                });
                yield put({
                    type: type.UPDATE_FIELD,
                    updateData: { handlingPrint: false }
                });
        } else {
            let { data } = yield call(maskAxios.post, '/clinical-doc/referralLetter', params);
            if (data.respCode === 0) {
                if(isPreview){
                    if (closeTabFunc) {
                        closeTabFunc(true);
                    } else {
                        let callback = action.callback;
                        callback && callback(data.data);
                    }
                }else{
                    if (closeTabFunc) {
                        closeTabFunc(true);
                    } else {
                        yield print({ base64: data.data, callback: action.callback, copies: action.copies });
                    }
                }
            } else if (data.respCode === 3) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032'
                    }
                });
                yield put({
                    type: type.UPDATE_FIELD,
                    updateData: { handlingPrint: false }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
                yield put({
                    type: type.UPDATE_FIELD,
                    updateData: { handlingPrint: false }
                });
            }
        }
    } catch (error) {
        yield put({
            type: type.UPDATE_FIELD,
            updateData: { handlingPrint: false }
        });
        throw error;
    }
}

function* getReferralLetterCert() {
    yield alsTakeLatest(type.GET_REFERRAL_LETTER_CERT, fetchReferralLetterCert);
}


function* listReferralLetters() {
    while (true) {

        try {
            let { params, callback } = yield take(type.LIST_REFERRAL_LETTERS);
            yield put(alsStartTrans());

            let url = '/clinical-doc/referralLetter?';
            for (let p in params) {
                url += `${p}=${params[p]}&`;
            }
            url = url.substring(0, url.length - 1);
            // let { data } = yield call(maskAxios.post, '/appointment/listReferralLetters', params);
            let { data } = yield call(maskAxios.get, url);
            if (params.siteId !== '') {
                data.data = (data.data || []).filter(item => item.siteId === params.siteId);
            }
            if (data.respCode === 0) {
                yield put({
                    type: type.PUT_LIST_REFERRAL_LETTERS,
                    data: data.data
                });
                callback && callback(data.data);
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

function* fetchUpdateReferralLetter(action) {
    // let { data } = yield call(maskAxios.post, '/appointment/updateReferralLetter', action.params);
    let { params } = action;
    let url = '/clinical-doc/referralLetter';
    let { data } = yield call(maskAxios.put, url, params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110612',
                showSnackbar: true
            }
        });
        const closeTabFunc = yield select(state => state.referralLetter.closeTabFunc);
        if (closeTabFunc) {
            closeTabFunc(true);
        } else {
            action.callback && action.callback();
        }
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

function* updateReferralLetter() {
    yield alsTakeLatest(type.UPDATE_REFERRAL_LETTER, fetchUpdateReferralLetter);
}

function* fetchDeleteReferralLetter(action) {
    let url = `/clinical-doc/referralLetter/${action.params.id}`;
    let { data } = yield call(maskAxios.delete, url);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110602'
            }
        });
        action.callback && action.callback();
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* deleteReferralLetter() {
    yield alsTakeLatest(type.DELETE_REFERRAL_LETTER, fetchDeleteReferralLetter);
}

function* getSaamPatientSummary() {
    yield alsTakeLatest(type.GET_SAAM_PATIENT_SUMMARY, function* (action) {
        let patientkey = yield select(state => state.patient.patientInfo.patientKey);
        let params = {
            refKey: patientkey
        };
        const clinicConfig = yield select(state => state.common.clinicConfig);
        const svcCd = yield select(state => state.login.service.svcCd);
        const siteId = yield select(state => state.login.clinic.siteId);
        const siteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'SAAM_API_PREFIX');
        let prefix = (siteParam && siteParam.configValue) || '/';
        let { callback } = action;
        let { data } = yield call(maskAxios.post, '/saam' + prefix + 'SAAMService/patient/getPatientSummaryByPatientRefKey', params);
        if (data.respCode === '0') {
            let displayNameList = data.patientAllergyList.map(item => item.displayName);
            let displayName = displayNameList.join('\n');
            let newLetterInfo = yield select(state => state.referralLetter.newLetterInfo);
            yield put({ type: type.UPDATE_FIELD, updateData: { newLetterInfo: { ...newLetterInfo, familyHistory: displayName } } });
            callback && callback({ familyHistory: displayName });
        }
        if (parseInt(data.respCode) >= 0) {
            const pullInitData = yield select(state => state.referralLetter.pullInitData);
            yield put({ type: type.UPDATE_FIELD, updateData: { pullInitData: pullInitData + 1 } });
        }
    });
}

function* getProblemText() {
    yield alsTakeLatest(type.GET_PROBLEM_TEXT, function* (action) {
        let patientkey = yield select(state => state.patient.patientInfo.patientKey);
        let encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        let { callback } = action;
        let { data } = yield call(maskAxios.get, `/diagnosis/diagnosis/${patientkey}/${encounterId}`);
        if (data.respCode === 0) {
            let problemTextList = data.data.map(item => item.diagnosisText);
            let diagnosisText = problemTextList.join('\n');
            let newLetterInfo = yield select(state => state.referralLetter.newLetterInfo);
            yield put({ type: type.UPDATE_FIELD, updateData: { newLetterInfo: { ...newLetterInfo, problem: diagnosisText } } });
            callback && callback({ problem: diagnosisText });
        }
        if (parseInt(data.respCode) >= 0) {
            const pullInitData = yield select(state => state.referralLetter.pullInitData);
            yield put({ type: type.UPDATE_FIELD, updateData: { pullInitData: pullInitData + 1 } });
        }
    });
}

function* getClinicalNoteText() {
    yield alsTakeLatest(type.GET_CLINICALNOTE_TEXT, function* (action) {
        let encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        let userRoleTypeCd = yield select(state => state.login.loginInfo.userRoleType);
        let encntrServiceCd = yield select(state => state.patient.encounterInfo.serviceCd);
        let encntrClinicCd = yield select(state => state.patient.encounterInfo.clinicCd);
        let { data } = yield call(maskAxios.get, `/clinical-note/clinicalNote/${encounterId}`,
            {
                params: {
                    encntrServiceCd: encntrServiceCd,
                    userRoleTypeCd: userRoleTypeCd,
                    encntrClinicCd: encntrClinicCd
                }
            });
        let { callback } = action;
        if (data.respCode === 0) {

            /*
             **************************************************************
             * Kk Lam - 2021-02-26
             * Dynamically display clinical note in referral letter
             * Supporting display in specific sequence
             * Can be filtered by service and/or site
             * Clinical notes that need to display are filtered by the typeId
             * Value defined in CMN_SITE_PARAM with the param_name: REFERRAL_LETTER_CLINICAL_NOTE_DISPLAY_SEQ
             * Separated by | character
             **************************************************************
             */
            const serivicecd = yield select(state => state.login.service.serviceCd);
            const clinicCd = yield select(state => state.login.clinic.clinicCd);
            const where = { serviceCd: serivicecd, clinicCd: clinicCd };
            const clinicConfig = yield select(state => state.common.clinicConfig);
            const clinicalNoteDisplaySeq = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.REFERRAL_LETTER_CLINICAL_NOTE_DISPLAY_SEQ, clinicConfig, where).configValue;
            const clinicalNoteDisplaySeqs = clinicalNoteDisplaySeq.split('|');

            const clinicalNotes = [];
            const clinicalnoteTextList = [];
            clinicalNoteDisplaySeqs.forEach(seq => {
                const clinicalNote = data.data.find(item => item.typeId === parseInt(seq, 10));
                if (clinicalNote) {
                    if (clinicalNote.notes.length > 0) {
                        clinicalNotes.push(clinicalNote.notes);
                    }
                }
            });
            clinicalNotes.forEach(element => {
                element.forEach(item => {
                    if (item.isDelete !== 'Y') {
                        item.clinicalnoteText && clinicalnoteTextList.push(item.clinicalnoteText);
                    }
                });
            });

            /***** modified by Kk - 2021-02-24  *****/
            // let clinicalNoteList = data.data.filter(item => item.typeId === 18 || item.typeId === 1);
            // clinicalNoteList = clinicalNoteList.sort((a, b) => a.typeId === 18 ? -1 : 1);
            // clinicalNoteList = clinicalNoteList.map(item => item.notes);
            // clinicalNoteList.forEach(element => {
            //     element.forEach(item => {
            //         if (item.isDelete !== 'Y') {
            //             item.clinicalnoteText && clinicalnoteTextList.push(item.clinicalnoteText);
            //         }
            //     });
            // });

            /***** modified by Kk - 2021-02-23  *****/
            /*
            let clinicalNoteList = data.data.filter(item => item.typeShortDesc === 'CN');
            clinicalNoteList = clinicalNoteList.map(item => item.notes);
            clinicalNoteList.forEach(element => {
                element.forEach(item => {
                    if (item.isDelete !== 'Y') {
                        item.clinicalnoteText && clinicalnoteTextList.push(item.clinicalnoteText);
                    }
                });
            });

            let doctorNoteList = data.data.filter(item => item.typeShortDesc === 'D');
            doctorNoteList = doctorNoteList.map(item => item.notes);
            doctorNoteList.forEach(element => {
                element.forEach(item => {
                    if (item.isDelete !== 'Y') {
                        item.clinicalnoteText && clinicalnoteTextList.push(item.clinicalnoteText);
                    }
                });
            });
            */
            let clinicalnoteText = clinicalnoteTextList && clinicalnoteTextList.join('\n');
            let newLetterInfo = yield select(state => state.referralLetter.newLetterInfo);
            yield put({ type: type.UPDATE_FIELD, updateData: { newLetterInfo: { ...newLetterInfo, result: clinicalnoteText } } });
            callback && callback({ result: clinicalnoteText });
        }
        if (parseInt(data.respCode) >= 0) {
            const pullInitData = yield select(state => state.referralLetter.pullInitData);
            yield put({ type: type.UPDATE_FIELD, updateData: { pullInitData: pullInitData + 1 } });
        }
    });
}

function* getDoseInstruction() {
    yield alsTakeLatest(type.GET_DOSEINSTRUCTION, function* (action) {
        let patientKey = yield select(state => state.patient.patientInfo.patientKey);
        let encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        let clinicCd = yield select(state => state.login.clinic.clinicCd);
        let userId = yield select(state => state.login.loginInfo.userDto.userId);
        let params = {
            episodeNo: encounterId,
            episodeType: 'A',
            hospCode: clinicCd,
            // loginId: userId,
            patientKey: patientKey
        };
        let { callback } = action;
        let { data } = yield call(maskAxios.post, '/moe/listPatientOrderDetail', params);
        if (data.respCode === 0) {
            let medProfileDtoList = data.data.prescriptionDto.map(item => item.medProfileDto);
            let doseInstructionList = [];
            medProfileDtoList.forEach(element => {
                element.forEach(item => {
                    item.doseInstruction && doseInstructionList.push(item.doseInstruction);
                });
            });
            let doseInstruction = doseInstructionList && doseInstructionList.join('\n');
            let newLetterInfo = yield select(state => state.referralLetter.newLetterInfo);
            yield put({
                type: type.UPDATE_FIELD,
                updateData: {
                    newLetterInfo: {
                        ...newLetterInfo,
                        medications: doseInstruction
                    }
                }
            });
            callback && callback({ medications: doseInstruction });
        }
        if (parseInt(data.respCode) >= 0) {
            const pullInitData = yield select(state => state.referralLetter.pullInitData);
            yield put({ type: type.UPDATE_FIELD, updateData: { pullInitData: pullInitData + 1 } });
        }
    });
}

export const referralLetterSaga = [
    getReferralLetterCert,
    listReferralLetters,
    updateReferralLetter,
    deleteReferralLetter,
    getSaamPatientSummary,
    getProblemText,
    getClinicalNoteText,
    getDoseInstruction
];
