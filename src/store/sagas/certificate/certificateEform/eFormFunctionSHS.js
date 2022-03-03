import { takeEvery, call, put, select, all } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import moment from 'moment';
import * as messageType from '../../../actions/message/messageActionType';
import memoize from 'memoize-one';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import { PatientUtil, CommonUtil, UserUtil } from '../../../../utilities';
import Enum from '../../../../enums/enum';

const handleGetFormSchema = (obj, searchKey, initResults = []) => {
    const finalResults = initResults;

    obj && Object.keys(obj).forEach(key => {
        const value = obj[key];

        if (value && typeof value === 'object') {
            if (value.input && !value.hidden) {
                finalResults.push(value[searchKey]);
            }

            handleGetFormSchema(value, searchKey, finalResults);
        }
    });
    return finalResults;
};

const getLoginName = (login, withPos) => {
    let loginName = `${login.loginInfo.userDto.engSurname || ''}${login.loginInfo.userDto.engSurname && login.loginInfo.userDto.engGivName ? ' ' : ''}${login.loginInfo.userDto.engGivName || ''}`;
    let pos = login.loginInfo.userDto.position || '';
    if (pos) {
        pos = ` (${pos})`;
    }
    loginName = `${loginName.toUpperCase()}${withPos ? pos : ''}`;
    return loginName;
};

const setValue = (object, path, value) => {
    path = path.replace(/[[]/gm, '.').replace(/[\]]/gm, ''); //to accept [index]
    const keys = path.split('.'),
        last = keys.pop();

    keys.reduce(function (o, k) {
        return o[k] = o[k] || {};
    }, object)[last] = value;
};

const filterEmptyValue = (value) => {
    return value ? value : '';
};

const readyMaskHkIDOps = (patientInfo, login, eFormSubmission) => {
    const maskDocNo = PatientUtil.handleMaskHKID(patientInfo, login);
    const isHKIDFormat = PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
    if (isHKIDFormat) {
        const source = [
            { label: '---', value: '' },
            { label: maskDocNo, value: maskDocNo },
            { label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo }
        ];
        setValue(eFormSubmission, 'docNoOpts', source);
    } else {
        const source = [{ label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo }];
        setValue(eFormSubmission, 'docNoOpts', source);
    }
};

export function* partnerNotificationRecord(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pmiNo':
                case 'topPmiNo':
                    case 'leftBarcode':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'rightBarcode':
                    setValue(eFormSubmission, value, encounterId.toString());
                    break;
                case 'clinicName':
                    setValue(eFormSubmission, value, login.clinic.siteName);
                    break;
                case 'patientName':
                case 'topPatientName':
                    setValue(eFormSubmission, value, patientInfo.engSurname? patientInfo.engSurname : ''  + (patientInfo.engSurname && patientInfo.engGivename ? ' ' : '') + patientInfo.engGivename? patientInfo.engGivename : '');
                    break;
                case 'chineseName':
                    setValue(eFormSubmission, value, patientInfo.nameChi);
                    break;
                case 'sexAge': {
                    const val = `${patientInfo.genderCd} / ${patientInfo.age || ''}${patientInfo.ageUnit ? patientInfo.ageUnit[0] || '' : ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'part1DoctorNameAndRank':
                case 'part2DoctorNameAndRank': {
                    setValue(eFormSubmission, value, login.loginInfo.userDto.engSurname + (login.loginInfo.userDto.engSurname && login.loginInfo.userDto.engGivename ? ' ' : '  ') + login.loginInfo.loginName);
                    break;
                }
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* consentFormChinese(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'page2RightUpperPatientId':
                case 'rightUpperPatientId':
                    //setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));20210601 Fix Document number instead of PMI
                    const rightUpperPatientId = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, rightUpperPatientId);
                    break;
                case 'page2RightUpperPatientName':
                case 'rightUpperPatientName':
                case 'patientNameEnglish':
                    setValue(eFormSubmission, value, patientInfo.engSurname? (patientInfo.engGivename ? (patientInfo.engSurname + ' ' + patientInfo.engGivename) : patientInfo.engSurname) : '');
                    break;
                case 'page2LeftBarcodePmi':
                case 'leftBarcodePmi':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'page2RightBarcodeEncounterId':
                case 'rightBarcodeEncounterId':
                    setValue(eFormSubmission, value, encounterId.toString());
                    break;
                case 'clinicName':
                    setValue(eFormSubmission, value, login.clinic.siteName);
                    break;
                case 'patientNameChinese':
                    setValue(eFormSubmission, value, patientInfo.nameChi);
                    break;
                case 'sexAge': {
                    const val = `${patientInfo.genderCd} / ${patientInfo.age || ''}${patientInfo.ageUnit ? patientInfo.ageUnit[0] || '' : ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'documentIdNo': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'documentType': {
                    const docTypeItem = commonCodeList.doc_type.find(x => x.code === priDocPair.docTypeCd);
                    const docType = `${docTypeItem && (docTypeItem.chiDesc ? docTypeItem.chiDesc : docTypeItem.engDesc)}`;
                    setValue(eFormSubmission, value, docType);
                    break;
                }
                case 'doctorName': {
                    const doctorName = getLoginName(login, false);
                    setValue(eFormSubmission, value, doctorName);
                    break;
                }
                case 'signDate': {
                    const signDate = moment().format('DD-MMM-YYYY');
                    setValue(eFormSubmission, value, signDate);
                    break;
                }
                case 'patientPhoneNo': {
                    setValue(eFormSubmission, value, patientInfo.phoneNo);
                    break;
                }
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* consentFormEnglish(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'page2RightUpperPatientId':
                case 'rightUpperPatientId':
                    //setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));20210601 Fix Document number instead of PMI
                    const rightUpperPatientId = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, rightUpperPatientId);
                    break;
                case 'page2RightUpperPatientName':
                case 'rightUpperPatientName':
                case 'patientNameEnglish':
                    setValue(eFormSubmission, value, patientInfo.engSurname? (patientInfo.engGivename ? (patientInfo.engSurname + ' ' + patientInfo.engGivename) : patientInfo.engSurname) : '');
                    break;
                case 'page2LeftBarcodePmi':
                case 'leftBarcodePmi':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'page2RightBarcodeEncounterId':
                case 'rightBarcodeEncounterId':
                    setValue(eFormSubmission, value, encounterId.toString());
                    break;
                case 'clinicName':
                    setValue(eFormSubmission, value, login.clinic.siteName);
                    break;
                case 'patientNameChinese':
                    setValue(eFormSubmission, value, patientInfo.nameChi);
                    break;
                case 'sexAge': {
                    const val = `${patientInfo.genderCd} / ${patientInfo.age || ''}${patientInfo.ageUnit ? patientInfo.ageUnit[0] || '' : ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'documentIdNo': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'documentType': {
                    const docTypeItem = commonCodeList.doc_type.find(x => x.code === priDocPair.docTypeCd);
                    const docType = `${docTypeItem && docTypeItem.engDesc}`;
                    setValue(eFormSubmission, value, docType);
                    break;
                }
                case 'doctorName': {
                    const doctorName = getLoginName(login, false);
                    setValue(eFormSubmission, value, doctorName);
                    break;
                }
                case 'signDate': {
                    const signDate = moment().format('DD-MMM-YYYY');
                    setValue(eFormSubmission, value, signDate);
                    break;
                }
                case 'patientPhoneNo': {
                    setValue(eFormSubmission, value, patientInfo.phoneNo);
                    break;
                }
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* examConsent(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'rightUpperPatientId': {
                    const rightUpperPatientId = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, rightUpperPatientId);
                    break;
                }
                case 'patientNameEnglish':
                case 'line3PatientNameEnglish':
                case 'line4PatientNameEnglish':
                case 'rightUpperPatientName':
                    setValue(eFormSubmission, value, patientInfo.engSurname? (patientInfo.engGivename ? (patientInfo.engSurname + ' ' + patientInfo.engGivename) : patientInfo.engSurname) : '');
                    break;
                case 'leftBarcodePmi':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'rightBarcodeEncounterId':
                    setValue(eFormSubmission, value, encounterId.toString());
                    break;
                case 'clinicName':
                    setValue(eFormSubmission, value, login.clinic.siteName);
                    break;
                case 'patientNameChinese':
                case 'line3patientNameChinese':
                case 'line4patientNameChinese':
                    setValue(eFormSubmission, value, patientInfo.nameChi);
                    break;
                case 'line2DocumentIdNo':
                case 'documentIdNo': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'doctorName': {
                    const doctorName = getLoginName(login, false);
                    setValue(eFormSubmission, value, doctorName);
                    break;
                }
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* referralConsultationRequest(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);

        // MedHistory
        const pastMedHistoryParams = {
            patientKey: patientInfo.patientKey
        };
        let { data } = yield call(maskAxios.get, '/medical-summary/pastMedHistory/getMsPastMedHistoryList', { params: pastMedHistoryParams });
        let pastMedHistoryString = '';
        let pastMedHistoryArray = [];
        if (data.respCode === 0) {
            let pastMedHistoryData = data.data;
            pastMedHistoryData.forEach(pastMedHistory => {
                pastMedHistory.detailItems.forEach(detailItem => {
                    filterEmptyValue(detailItem.details)? pastMedHistoryArray.push({ date : detailItem.createDtm, detail : detailItem.details, id : detailItem.pastMedDetailsId}) : '';
                });
            });
        }
        pastMedHistoryArray.sort((a, b) => {
            if(a.date !== b.date) return a.date - b.date;
            else return a.id - b.id;
        });

        pastMedHistoryArray.forEach(pastMedHistory => {
            pastMedHistoryString = pastMedHistoryString? pastMedHistoryString + '; ' + pastMedHistory.detail : pastMedHistory.detail;
        });

        // Treatments String
        const treatmentsParams = {
          episodeNo: encounterId,
          episodeType: 'A',
          hospCode: login.clinic.siteCd,
          patientKey: patientInfo.patientKey
        };
        data = (yield call(maskAxios.post, '/moe/listPatientOrderDetail', treatmentsParams)).data;
        let treatmentsString = '';

        if (data.respCode === 0) {
            let prescriptionDtos = data.data.prescriptionDto;
            prescriptionDtos.forEach(prescriptionDto => {
              let medProfileDtos = prescriptionDto.medProfileDto;
              medProfileDtos.forEach(medProfileDto => {
                treatmentsString = filterEmptyValue(medProfileDto.doseInstruction)? (treatmentsString? treatmentsString + '; ' + medProfileDto.doseInstruction : medProfileDto.doseInstruction) : treatmentsString;
              });
            });
        }

        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'rightUpperPatientId'://20210601 Fix Document number instead of PMI
                case 'page2RightUpperPatientId':
                case 'page3RightUpperPatientId':
                    const rightUpperPatientId = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, rightUpperPatientId);
                    break;
                case 'patientNameEnglish':
                case 'rightUpperPatientName':
                case 'page2PatientNameEnglish':
                case 'page2RightUpperPatientName':
                case 'page3PatientNameEnglish':
                case 'page3RightUpperPatientName':
                    setValue(eFormSubmission, value, patientInfo.engSurname? (patientInfo.engGivename ? (patientInfo.engSurname + ' ' + patientInfo.engGivename) : patientInfo.engSurname) : '');
                    break;
                case 'leftBarcodePmi':
                case 'page2LeftBarcodePmi':
                case 'page3LeftBarcodePmi':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'rightBarcodeEncounterId':
                case 'page2RightBarcodeEncounterId':
                case 'page3RightBarcodeEncounterId':
                    setValue(eFormSubmission, value, encounterId.toString());
                    break;
                case 'clinicNameLabel':
                case 'clinicNameInPatientArea':
                case 'page2ClinicNameInPatientArea':
                case 'page3ClinicNameInPatientArea':
                    setValue(eFormSubmission, value, login.clinic.siteName);
                    break;
                case 'patientNameChinese':
                case 'page2PatientNameChinese':
                case 'page3PatientNameChinese':
                    setValue(eFormSubmission, value, patientInfo.nameChi);
                    break;
                case 'sexAge':
                case 'page2SexAge':
                case 'page3SexAge': {
                    const val = `${patientInfo.genderCd} / ${patientInfo.age || ''}${patientInfo.ageUnit ? patientInfo.ageUnit[0] || '' : ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'documentIdNo':
                case 'page2DocumentIdNo':
                case 'page3DocumentIdNo': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'documentType':
                case 'page2DocumentType':
                case 'page3DocumentType': {
                    const docTypeItem = commonCodeList.doc_type.find(x => x.code === priDocPair.docTypeCd);
                    const docType = `${docTypeItem && docTypeItem.engDesc}`;
                    setValue(eFormSubmission, value, docType);
                    break;
                }
                case 'doctorsFullName':
                case 'doctorFullName': {
                    const doctorFullName = getLoginName(login, false);
                    setValue(eFormSubmission, value, doctorFullName);
                    break;
                }
                case 'date': {
                    const signDate = moment().format('DD/MM/YYYY HH:mm:ss');
                    setValue(eFormSubmission, value, signDate);
                    break;
                }
                case 'drugHistory': {
                    setValue(eFormSubmission, value, pastMedHistoryString);
                    break;
                }
                case 'treatmentsGiven': {
                    setValue(eFormSubmission, value, treatmentsString);
                    break;
                }
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* bodyChartGeneral(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const encounterId = yield select(state => state.patient.encounterInfo.encounterId);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'rightUpperPatientId': {
                    const rightUpperPatientId = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, rightUpperPatientId);
                    break;
                }
                case 'rightUpperPatientName':{
                    setValue(eFormSubmission, value, patientInfo.engSurname? (patientInfo.engGivename ? (patientInfo.engSurname + ' ' + patientInfo.engGivename) : patientInfo.engSurname) : '');
                    break;
                }
                case 'leftBarcodePmi':{
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                }
                case 'rightBarcodeEncounterId':{
                    setValue(eFormSubmission, value, encounterId.toString());
                    break;
                }
                case 'line2DocumentIdNo':
                case 'documentIdNo': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'rightUpperPatientSex': {
                    setValue(eFormSubmission, value, patientInfo.genderCd + '/' + patientInfo.age);
                    break;
                }
                default:{
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}