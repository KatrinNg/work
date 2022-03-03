import memoize from 'memoize-one';
import moment from 'moment';
import { select } from 'redux-saga/effects';
import Enum from '../../../../enums/enum';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import { PatientUtil } from '../../../../utilities';

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

export const getLoginName = (login, withPos) => {
    let loginName = `${login.loginInfo.userDto.engSurname || ''}${login.loginInfo.userDto.engSurname && login.loginInfo.userDto.engGivName ? ' ' : ''}${login.loginInfo.userDto.engGivName || ''}`;
    let pos = login.loginInfo.userDto.position || '';
    if (pos) {
        pos = ` (${pos})`;
    }
    loginName = `${loginName.toUpperCase()}${withPos ? pos : ''}`;
    return loginName;
};

const getPatientName = (patientInfo) => {
    return `${patientInfo.engSurname || ''}${patientInfo.engSurname && patientInfo.engGivename ? ' ' : ''}${patientInfo.engGivename || ''}`;
};

const getPatientAddress = memoize((type, patientInfo, commonCodeList) => {
    const _addressList = patientInfo.addressList || [];
    const _address = _addressList.find(item => item.addressTypeCd === type);
    function getFreetextDesc(str) {
        return { code: str, engDesc: str, chiDesc: str };
    }
    if (_address) {
        // const region = ContactInformationEnum.REGION.find(item => item.code === _address.region);
        // const district = commonCodeList.district && commonCodeList.district.find(item => item.code === _address.districtCd);
        // const subDistrict = commonCodeList.sub_district && commonCodeList.sub_district.find(item => item.code === _address.subDistrictCd);
        const region = getFreetextDesc(_address.region);
        const district = getFreetextDesc(_address.districtCd);
        const subDistrict = getFreetextDesc(_address.subDistrictCd);
        const addrType = _address.addressLanguageCd;
        let value;
        let addressArr = [];
        switch (_address.addressFormat) {
            case ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS: {
                addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                if (_address.addressLanguageCd === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                    if (addressArr.length > 0) {
                        value = addressArr.join(', ');
                        value = value.toUpperCase();
                    }
                } else {
                    if (addressArr.length > 0) {
                        addressArr = addressArr.reverse();
                        value = addressArr.join('');
                    }
                }
                break;
            }
            case ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS: {
                value = _address.addrTxt || '';
                break;
            }
            case ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS: {
                addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                if (addressArr.length > 0) {
                    if (addrType === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                        value = `Postal Box ${addressArr.join(', ')}`;
                    } else {
                        value = `${ContactInformationEnum.FIELD_CHI_LABEL.CONTACT_POSTOFFICE_BOXNO} ${addressArr.join(', ')}`;
                    }
                    // value = addressArr.join(', ');
                }
                break;
            }
            default: {
                value = '';
                break;
            }
        }
        return value;
    }
    return '';
});

const getPaitentCorrOrResiAddr = memoize((patientInfo, commonCodeList) => {
    let result = '';
    let type = Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE;
    let corAddr = getPatientAddress(type, patientInfo, commonCodeList);
    if (corAddr) {
        result = corAddr;
    } else {
        type = Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE;
        result = getPatientAddress(type, patientInfo, commonCodeList);
    }
    return result;
});

const getDobDateByFormat = (edob, date) => {
    switch (edob) {
        case Enum.DATE_FORMAT_EY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).startOf('year').format(Enum.DATE_FORMAT_EY_VALUE);
        }
        case Enum.DATE_FORMAT_EMY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).startOf('month').format(Enum.DATE_FORMAT_FOCUS_MY_VALUE);
        }
        case Enum.DATE_FORMAT_EDMY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE);
        }
        default: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE);
        }
    }
};

const getDoctorSiteType = (siteType = null) => {
    switch (siteType) {
        case 'C':
            return 'clinic';
        case 'H':
            return 'hospital';
        case 'P':
            return 'privatePractice';
        default:
            return siteType;
    }
};

const getSiteName = (login) => {
    return (login.clinic.siteChiName || '') + '\n' + (login.clinic.siteEngName || '');
};

const getServiceName = (login) => {
    return (login.service.serviceName || '').toUpperCase();
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

const getAnServiceID = (patientInfo) => {
    const clcAntCurrent = patientInfo && patientInfo.antSvcInfo.clcAntCurrent;
    const antSvcId = clcAntCurrent ? clcAntCurrent.antSvcId || '---' : '---';
    return antSvcId;
};

const getExpectedDateofConfinement = (patientInfo) => {
    const clcAntCurrent = patientInfo && patientInfo.antSvcInfo.clcAntCurrent;
    const wrkEdc = clcAntCurrent ? clcAntCurrent.wrkEdc || '' : '';
    const expectedDateofConfinement = wrkEdc ? moment(wrkEdc).format(Enum.DATE_FORMAT_DMY) : null;
    return expectedDateofConfinement;
};

export function* cgsReplyLetter(eFormSchemaData) {
    const eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'clinicNo': {
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                }
                case 'doctype': {
                    const isHKIDFormat = PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
                    if (isHKIDFormat) {
                        setValue(eFormSubmission, value, 'HKID No. (身份證編號) :');
                    } else {
                        setValue(eFormSubmission, value, 'Travel Document No. (旅行簽證編號) :');
                    }
                    break;
                }
                case 'docno': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'patientName': {
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                }
                case 'dob':
                    setValue(eFormSubmission, value, getDobDateByFormat(patientInfo.exactDobCd, patientInfo.dob));
                    break;
                case 'gender': {
                    setValue(eFormSubmission, value, patientInfo.genderCd);
                    break;
                }
                case 'userName': {
                    setValue(eFormSubmission, value, getLoginName(login, false));
                    break;
                }
                case 'printDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                default: {
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}

export function* cgsReferralLetter(eFormSchemaData) {
    const eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'clinicNo': {
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                }
                case 'to': {
                    break;
                }
                case 'patientName': {
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                }
                case 'docno': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'userName': {
                    setValue(eFormSubmission, value, getLoginName(login, false));
                    break;
                }
                case 'printDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                default: {
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}

export function* cgsLetterResultNormal(eFormSchemaData) {
    const eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pmiNo': {
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                }
                case 'printDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'motherName': {
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                }
                case 'address': {
                    let address = '';
                    if (patientInfo.addressList) {
                        if (getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, patientInfo, commonCodeList)) {
                            address = getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, patientInfo, commonCodeList);
                        } else {
                            address = getPatientAddress(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE, patientInfo, commonCodeList);
                        }
                    }
                    setValue(eFormSubmission, value, address);
                    break;
                }
                default: {
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}

export function* CGSConsentFormChinese(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'nameChi': {
                    setValue(eFormSubmission, value, patientInfo.nameChi || '');
                    break;
                }
                case 'docno': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'nameChiAndDocNumber': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    const nameAndDocNumber = [patientInfo.nameChi || '', docNo].join('          ');
                    setValue(eFormSubmission, value, nameAndDocNumber);
                    break;
                }
                case 'familyNo': {
                    const familyNo = (patientInfo && patientInfo.cgsSpecOut && patientInfo.cgsSpecOut.pmiGrpName) || '';
                    setValue(eFormSubmission, value, familyNo);
                    break;
                }
                case ['select7', 'select8', 'select13', 'select10', 'select3', 'select4', 'select5', 'select6', 'select11', 'select12', 'select14'].includes(value) ? value : null : {
                    setValue(eFormSubmission, value, '本人');
                    break;
                }
                case 'select9' : {
                    setValue(eFormSubmission, value, '被');
                    break;
                }
                default: {
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}

export function* CGSConsentFormEnglish(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'patientName': {
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                }
                case 'docno': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'nameAndDocNumber': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    const nameAndDocNumber = [getPatientName(patientInfo), docNo].join('          ');
                    setValue(eFormSubmission, value, nameAndDocNumber);
                    break;
                }
                case 'familyNo': {
                    const familyNo = (patientInfo && patientInfo.cgsSpecOut && patientInfo.cgsSpecOut.pmiGrpName) || '';
                    setValue(eFormSubmission, value, familyNo);
                    break;
                }
                case ['select11'].includes(value) ? value : null : {
                    setValue(eFormSubmission, value, 'I');
                    break;
                }
                case ['select1', 'select9', 'select13', 'select4', 'select3'].includes(value) ? value : null : {
                    setValue(eFormSubmission, value, 'myself');
                    break;
                }
                case ['select7', 'select12', 'select6', 'select5', 'select10'].includes(value) ? value : null : {
                    setValue(eFormSubmission, value, 'my');
                    break;
                }
                case 'select14' : {
                    setValue(eFormSubmission, value, 'to be');
                    break;
                }
                default: {
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}

export function* cgsReportOfGeneticCounselling(eFormSchemaData) {
    const eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        const familyNo = (patientInfo && patientInfo.cgsSpecOut && patientInfo.cgsSpecOut.pmiGrpName) || '';
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'patientKey': {
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                }
                case 'clinicNo': {
                    setValue(eFormSubmission, value, familyNo);
                    break;
                }
                case 'docNo': {
                    const isHKIDFormat = PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
                    if (isHKIDFormat) {
                        setValue(eFormSubmission, value, priDocPair.docNo.trim());
                    } else {
                        setValue(eFormSubmission, value, PatientUtil.getFormatDocNoByDocumentPair(priDocPair));
                    }
                    break;
                }
                case 'docType': {
                    const isHKIDFormat = PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
                    if (isHKIDFormat) {
                        setValue(eFormSubmission, value, 'HKID No. (身份證編號) :');
                    } else {
                        setValue(eFormSubmission, value, 'Travel Document No. (旅行簽證編號) :');
                    }
                    break;
                }
                case 'patientName': {
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                }
                case 'gender': {
                    setValue(eFormSubmission, value, patientInfo.genderCd);
                    break;
                }
                case 'dob': {
                    setValue(eFormSubmission, value, getDobDateByFormat(patientInfo.exactDobCd, patientInfo.dob));
                    break;
                }
                case 'doctorName': {
                    let salutation = login.loginInfo.userDto.salutation;
                    let loginName = getLoginName(login, false);
                    let doctorName = salutation ? salutation + ' ' + loginName : loginName;
                    setValue(eFormSubmission, value, doctorName);
                    break;
                }
                case 'date': {
                    setValue(eFormSubmission, value, moment().format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE));
                    break;
                }
                default: {
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}