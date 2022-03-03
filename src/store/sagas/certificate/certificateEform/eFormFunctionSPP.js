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

export function* requestFormLabReport(eFormSchemaData){
    const assessmentDataFinal = {}, eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const appointmentInfo = yield select(state => state.patient.appointmentInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'namePatient':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                    break;
                case 'idKb':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.hkid} RZ(12) / KB0005`);
                break;
                case 'hospitalClinic':
                    setValue(eFormSubmission, value, `${login.clinic.siteEngName || login.clinic.clinicName}`);
                break;
                case 'clinicHospital':
                    setValue(eFormSubmission, value, `${login.clinic.siteEngName || login.clinic.clinicName}`);
                break;
                case 'name':
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                break;
                case 'telNo':
                    setValue(eFormSubmission, value, '21162898');
                break;
                case 'faxNo':
                    setValue(eFormSubmission, value, '21164355');
                break;
                case 'nowDate':
                    setValue(eFormSubmission, value, moment());
                break;
                default:
                    setValue(eFormSubmission, value, '');
                break;
            }
        });
        return eFormSubmission;
    }
}

export function* referralMemo(eFormSchemaData) {
    console.log(eFormSchemaData);
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const TESTVAL = yield select(state => state);
        console.log(TESTVAL);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);

        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'writerFrom':
                    setValue(eFormSubmission, value, getLoginName(login, false));
                    break;
                case 'nowDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'phoneNo': {
                    const val = login.clinic.phoneNo;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'fax': {
                    const val = login.clinic.fax;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'reNameEng':
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                case 'docNo': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'reAge': {
                    const val = `${patientInfo.genderCd} / ${patientInfo.age || ''}${patientInfo.ageUnit ? patientInfo.ageUnit[0] || '' : ''}`;
                    setValue(eFormSubmission, value, val);
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

export function* dhHIV(eFormSchemaData) {
    const  eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'codeNumber':
                    setValue(eFormSubmission, value, 'KB0005');
                break;
                case 'isHkCard':
                    if(sppValue.patientInfo.hkid){
                        setValue(eFormSubmission, value, 'yes');
                    }
                break;
                case 'genderCd':
                    setValue(eFormSubmission, value, sppValue.patientInfo.genderCd);
                break;
                case 'dob':
                    setValue(eFormSubmission, value, sppValue.patientInfo.dob);
                break;
                case 'dldHk':
                    setValue(eFormSubmission, value, '29-09-2005');
                break;
                case 'nameLaboratory':
                    setValue(eFormSubmission, value, 'Department of Health');
                break;
                case 'cde4Cell':
                    setValue(eFormSubmission, value, 300);
                break;
                case 'cde4Date':
                    setValue(eFormSubmission, value, '04-09-2018');
                break;
                case 'nmp':
                    const val = `${login.userDto?.salutation || ''}${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`;
                    setValue(eFormSubmission, value, val);
                break;
                case 'corresAddress':
                    setValue(eFormSubmission, value, `${login.clinic.addrEng || login.clinic.locationEng}`);
                break;
                case 'namePractitioner':
                    setValue(eFormSubmission, value, 'inPublicService');
                break;
                case 'tel':
                    setValue(eFormSubmission, value, '(852) 21162929');
                break;
                case 'fax':
                    setValue(eFormSubmission, value, '(852) 21170809');
                break;
                case 'nowDate':
                    setValue(eFormSubmission, value, moment());
                break;
                default:
                    setValue(eFormSubmission, value, '');
                break;
            }
        });
        return eFormSubmission;
    }
}

export function* consulationRequestReply(eFormSchemaData) {
    const eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'patient':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                break;
                case 'dob':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.dob}`);
                break;
                case 'sexAge':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.genderCd}/${sppValue.patientInfo.age}${sppValue.patientInfo.ageUnit.substring(0,1)}`);
                break;
                case 'referringDoctor':
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                break;
                case 'clinic':
                    setValue(eFormSubmission, value, `${login.clinic.siteEngName || login.clinic.clinicName}`);
                break;
                case 'to':
                    setValue(eFormSubmission, value, 'Consultant,Kowloon Bay Integrated Treatment Centre 8/F,Kowloon Bay Health Centre,9 Kai Yan Street.Kowloon Bay');
                break;
                case 'dearDr':
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                break;
                case 'idNo':
                    setValue(eFormSubmission, value, '(KB0005)');
                break;
                case 'nowDate':
                    setValue(eFormSubmission, value, moment());
                break;
                default:
                    setValue(eFormSubmission, value, '');
                break;
            }
        });
        return eFormSubmission;
    }
}

export function* referralGumClinic(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const userDto = yield select(state => state.login.loginInfo.userDto);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'codeNo':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'hivStage':
                    setValue(eFormSubmission, value, 'C3');
                    break;
                case 'name':
                    setValue(eFormSubmission, value, userDto.engSurname + ' ' + userDto.engGivName);
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment().subtract(0, 'days'));
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function*  appointmentMemo(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'telNo':
                    setValue(eFormSubmission, value, '(852) 21162898');
                    break;
                case 'faxNo':
                    setValue(eFormSubmission, value, '(852) 21164355');
                    break;
                case 'date': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'patientsName': {
                    setValue(eFormSubmission, value, `${patientInfo.engSurname} ${patientInfo.engGivename}`);
                    break;
                }
                case 'referenceNo': {
                    setValue(eFormSubmission, value,'KB0005');
                    break;
                }
                 case 'sexAge': {
                    setValue(eFormSubmission, value, `${patientInfo.genderCd} / ${patientInfo.age}${patientInfo.ageUnit?.substring(0,1)}`);
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

export function* consentFormContraceptive(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'chineseName':
                    setValue(eFormSubmission, value,patientInfo.nameChi || '');
                    break;
                case 'chineseHKIDNo':
                    setValue(eFormSubmission, value,patientInfo.hkid);
                    break;
                case 'Date': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'chineseCodeNo': {
                    setValue(eFormSubmission, value, 'KB0036');
                    break;
                }
                case 'englishName': {
                    setValue(eFormSubmission, value,`${patientInfo.engSurname} ${patientInfo.engGivename}`);
                    break;
                }
                 case 'englishHKIDNo': {
                    setValue(eFormSubmission, value,patientInfo.hkid);
                    break;
                 }
                 case 'englishCodeNo': {
                    setValue(eFormSubmission, value, 'KB0036');
                    break;
                 }
                 case 'nameOfClient': {
                    setValue(eFormSubmission, value, `${patientInfo.engSurname} ${patientInfo.engGivename}`);
                    break;
                 }
                 case 'nameOfWitness': {
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
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

export function* referralPWHLKS(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'fromName':
                    setValue(eFormSubmission, value, login.clinic.siteEngName || login.clinic.clinicName || '');
                    break;
                case 'name':
                    setValue(eFormSubmission, value, `${patientInfo.engSurname} ${patientInfo.engGivename}` || '');
                    break;
                case 'KBNo':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'patientTel':
                    if(patientInfo.phoneList !== undefined){
                        setValue(eFormSubmission, value, `${patientInfo.phoneList[0].phoneNo}`);
                    }
                    break;
                case 'referredBy':
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* referralTCO(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'to':
                    setValue(eFormSubmission, value, 'Tobacco Control Office (TCO)');
                    break;
                case 'fromName':
                    setValue(eFormSubmission, value, '九龍灣健康中心 Kowloon Bay Health Centre');
                    break;
                case 'fax':
                    setValue(eFormSubmission, value, '21560521');
                    break;
                case 'attn':
                    setValue(eFormSubmission, value, 'NO (TCO)');
                    break;
                case 'yourFax':
                    setValue(eFormSubmission, value, '21164355');
                    break;
                case 'yourTel':
                    setValue(eFormSubmission, value, '21162898');
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'clientName':
                    setValue(eFormSubmission, value, `${patientInfo.engSurname} ${patientInfo.engGivename}` || '');
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* referralContraceptiveClinic(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const userDto = yield select(state => state.login.loginInfo.userDto);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'codeNo':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'doctorName':
                    setValue(eFormSubmission, value, `${userDto.engSurname} ${userDto.engGivName}`);
                    break;
                case 'codeNo1':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'codeNo2':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'date1':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'date2':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'doctorName1':
                    setValue(eFormSubmission, value, `${userDto.engSurname} ${userDto.engGivName}`);
                    break;
                case 'doctorName2':
                    setValue(eFormSubmission, value, `${userDto.engSurname} ${userDto.engGivName}`);
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* referralPsychiatric(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const userDto = yield select(state => state.login.loginInfo.userDto);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'codeNo':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'hivStage':
                    setValue(eFormSubmission, value, 'C3');
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'name':
                    setValue(eFormSubmission, value, `${userDto.engSurname} ${userDto.engGivName}`);
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function*  requestFormPhotocopyCN(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'name':
                    setValue(eFormSubmission, value, patientInfo.nameChi || ' ');
                    break;
                case 'hKIDNo':
                    setValue(eFormSubmission, value, patientInfo.hkid);
                    break;
                case 'Date': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'chargePerCopy': {
                    setValue(eFormSubmission, value, '1.2');
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

export function* requestFormPhotocopyEN(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'name':
                    setValue(eFormSubmission, value,`${patientInfo.engSurname} ${patientInfo.engGivename}`);
                    break;
                case 'chargePerCopy':
                    setValue(eFormSubmission, value,'1.2');
                    break;
                    case 'hKIDNo':
                    setValue(eFormSubmission, value, patientInfo.hkid);
                    break;
                case 'Date': {
                    setValue(eFormSubmission, value, moment());
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

export function* requestFormTDM(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'patientNo':
                    setValue(eFormSubmission, value,'KB0005');
                    break;
                case 'DOB':
                    setValue(eFormSubmission, value,patientInfo.dob);
                    break;
                case 'Gender': {
                    setValue(eFormSubmission, value, patientInfo.genderCd);
                    break;
                }
               /* case 'HospitalClinic.': {
                    setValue(eFormSubmission, value, '');
                    break;
                }*/
                case 'nameOfAntiretroviral': {
                    setValue(eFormSubmission, value,'e.g.EFZ');
                    break;
                }
                 case 'PreDoseYN': {
                    setValue(eFormSubmission, value,'N');
                    break;
                 }
                 case 'PostDose': {
                    setValue(eFormSubmission, value, '9');
                    break;
                 }
                 case 'RequestingDoctor': {
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
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

export function* replyMemoTemplate(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const userDto = yield select(state => state.login.loginInfo.userDto);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'tel':
                    setValue(eFormSubmission, value, '21162929');
                    break;
                case 'faxNo':
                    setValue(eFormSubmission, value, '21170809');
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 're':
                    setValue(eFormSubmission, value, patientInfo.engSurname + ' ' +
                        patientInfo.engGivename  + ' '  +
                        patientInfo.genderCd  + ' / '   +
                        patientInfo.age  + ' '  +
                        patientInfo.ageUnit?.substring(0,1)
                    );
                    break;
                case 'dr':
                    setValue(eFormSubmission, value, userDto.engSurname  + ' ' + userDto.engGivName);
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* aELabResultRequestForm(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'to':
                    setValue(eFormSubmission, value, 'A & E Dept / Medical Record Office');
                    break;
                case 'from':
                    setValue(eFormSubmission, value, 'Therapeutic Prevention Clinic');
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'cantact':
                    setValue(eFormSubmission, value, '21162929');
                    break;
                case 'name':
                    setValue(eFormSubmission, value, patientInfo.engSurname + ' ' + patientInfo.engGivename);
                    break;
                case 'sexAge':
                    setValue(eFormSubmission, value, patientInfo.genderCd + '/' + patientInfo.age + patientInfo.ageUnit?.substring(0,1));
                    break;
                case 'reports':
                    setValue(eFormSubmission, value, 'checked');
                    break;
                case 'hkid':
                    setValue(eFormSubmission, value, patientInfo.hkid);
                    break;
                case 'signName1':
                    setValue(eFormSubmission, value, 'M.O. i/c of Therapeutic Preventive Clinic');
                    break;
                case 'signName2':
                    setValue(eFormSubmission, value, 'Dr. Bonnie Wong');
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* iVUQuestionnaire(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'zhCheckedByName':
                    setValue(eFormSubmission, value,`${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                    break;
                case 'zhCheckedByDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'enCheckedByName': {
                    setValue(eFormSubmission, value,`${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                    break;
                }
                case 'enCheckedByDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'zhPatientName': {
                    setValue(eFormSubmission, value,patientInfo.nameChi || '');
                    break;
                }
                 case 'zhPatientDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                 }
                 case 'enPatientName': {
                    setValue(eFormSubmission, value,`${patientInfo.engSurname } ${patientInfo.engGivename}`);
                    break;
                 }
                 case 'enPatientDate': {
                    setValue(eFormSubmission, value, moment());
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

export function* tPCReferralHBV(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'Attn':
                    setValue(eFormSubmission, value,'Consultant I/C A&E');
                    break;
                case 'Re':
                    setValue(eFormSubmission, value,`${patientInfo.engSurname} ${patientInfo.engGivename}`);
                    break;
                case 'OurReference': {
                    setValue(eFormSubmission, value,'KB0005');
                    break;
                }
                case 'Date': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'Dr': {
                    setValue(eFormSubmission, value,`${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                    break;
                }
                case 'IDNo': {
                    setValue(eFormSubmission, value,patientInfo.hkid);
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

export function* clinicalAdmissionForm(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'chineseName':
                    setValue(eFormSubmission, value, patientInfo.nameChi || '');
                    break;
                case 'surname':
                    setValue(eFormSubmission, value, patientInfo.engSurname || '');
                    break;
                case 'othername':
                    setValue(eFormSubmission, value, patientInfo.engGivename || '');
                    break;
                case 'dateOfBirth':
                    setValue(eFormSubmission, value, patientInfo.dob || '');
                    break;
                case 'sex':
                    setValue(eFormSubmission, value, patientInfo.genderCd);
                    break;
                case 'HKID':
                    setValue(eFormSubmission, value, patientInfo.hkid || patientInfo.otherDocNo);
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* consentFormEN(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const userDto = yield select(state => state.login.loginInfo.userDto);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'patientName':
                    setValue(eFormSubmission, value, `${patientInfo.engSurname} ${patientInfo.engGivename}` || '');
                    break;
                case 'age':
                    setValue(eFormSubmission, value, `${patientInfo.age}${patientInfo.ageUnit?.substring(0,1)}`);
                    break;
                case 'HKID':
                    setValue(eFormSubmission, value, `${patientInfo.hkid}`);
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'witnessName':
                    setValue(eFormSubmission, value, `${userDto.engSurname} ${userDto.engGivName}`);
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* consentFormCN(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const userDto = yield select(state => state.login.loginInfo.userDto);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'patientName':
                    setValue(eFormSubmission, value, patientInfo.nameChi || '');
                    break;
                case 'HKID':
                    setValue(eFormSubmission, value, `${patientInfo.hkid}`);
                    break;
                case 'date':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'witnessName':
                    setValue(eFormSubmission, value, `${userDto.engSurname} ${userDto.engGivName}`);
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* medicalReportAppFormCH(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value,key)=>{
            switch (value) {
                case 'to':
                    setValue(eFormSubmission, value,`${login.clinic.siteChiName || login.clinic.clinicNameChi}`);
                    break;
                case 'chineseName':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.nameChi || ''}`);
                break;
                case 'englishName':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                break;
                case 'hkIdNo':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.hkid}`);
                break;
                default:
                    setValue(eFormSubmission, value,'');
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* medicalReportAppFormEN(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value,key)=>{
            switch (value) {
                case 'to':
                    setValue(eFormSubmission, value,`${login.clinic.engDstrct} ${login.clinic.siteEngName}`);
                    break;
                case 'clientName':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                    break;
                case 'hkIdNo':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.hkid}`);
                    break;
                default:
                    setValue(eFormSubmission, value, '');
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* neatsRequestForm(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value,key)=>{
            switch (value) {
                case 'namePatient':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                    break;
                case 'sex':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.genderCd}`);
                    break;
                case 'age':
                    setValue(eFormSubmission, value,`${sppValue.patientInfo.age}${sppValue.patientInfo.ageUnit.substring(0,1)}`);
                    break;
                case 'capitalLetter':
                    setValue(eFormSubmission, value,`${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                break;
                case 'fullName':
                    setValue(eFormSubmission, value,`${login.clinic.siteEngName || login.clinic.clinicName}`);
                break;
                case 'nowDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'contactTelNo':
                    setValue(eFormSubmission, value, '21162929');
                    break;
                default:
                    setValue(eFormSubmission, value, '');
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* aeReply(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value,key)=>{
            switch (value) {
                case 'attn':
                    setValue(eFormSubmission, value, 'Consultant l/C A & E');
                    break;
                case 're':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                    break;
                case 'ourReference':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'repeat':
                    setValue(eFormSubmission, value, 'HBV / HCV / HIV');
                    break;
                case 'antibodiesTestingAt':
                    setValue(eFormSubmission, value, '6 months');
                break;
                case 'dr':
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                break;
                case 'nowDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                default:
                    setValue(eFormSubmission, value, '');
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* patientPartcular(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value,key)=>{
            switch (value) {
                case 'hkId':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.hkid}`);
                    break;
                case 'namePatientEn':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                    break;
                case 'namePatient':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.nameChi || ''}`);
                    break;
                case 'dob':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.dob}`);
                    break;
                case 'sex':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.genderCd}`);
                    break;
                default:
                    setValue(eFormSubmission, value, '');
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* tpcAeReminder(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const sppValue = yield select(state => state.patient);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value,key)=>{
            switch (value) {
                case 'attn':
                    setValue(eFormSubmission, value, 'Consultant l/C');
                    break;
                case 'attn1':
                    setValue(eFormSubmission, value, 'A & E');
                    break;
                case 're':
                    setValue(eFormSubmission, value, `${sppValue.patientInfo.engSurname} ${sppValue.patientInfo.engGivename}`);
                    break;
                case 'ourReference':
                    setValue(eFormSubmission, value, 'KB0005');
                    break;
                case 'dr':
                    setValue(eFormSubmission, value, `${login.loginInfo.userDto.engSurname} ${login.loginInfo.userDto.engGivName}`);
                break;
                case 'nowDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                default:
                    setValue(eFormSubmission, value, '');
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* patientNote(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        return eFormSubmission;
    }
}

export function* patientInstructionCN(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        return eFormSubmission;
    }
}

export function* patientInstructionEN(eFormSchemaData){
    const eFormSubmission = {};
    if(eFormSchemaData){
        return eFormSubmission;
    }
}