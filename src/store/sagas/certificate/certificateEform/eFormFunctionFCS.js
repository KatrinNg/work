import { call, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import memoize from 'memoize-one';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import { PatientUtil, CommonUtil, UserUtil } from '../../../../utilities';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import moment from 'moment';
import { contactPersonBasic as contactPersonListBasic } from '../../../../constants/registration/registrationConstants';

const getFormSchema = (obj, searchKey, initResults = []) => {
    const finalResults = initResults;

    obj && Object.keys(obj).forEach(key => {
        const value = obj[key];

        if (value && typeof value === 'object') {
            if (value.input && !value.hidden) {
                finalResults[value[searchKey]] = "";
            }

            getFormSchema(value, searchKey, finalResults);
        }
    });

    return finalResults;
};

const transformDotKeyObj = (input) => {
    const transformOutput = {};

    input && Object.keys(input).forEach(key => {
        _.set(transformOutput, key, input[key]);
    });

    return transformOutput;
};

const getPatientAddress = memoize((type, patientInfo, commonCodeList) => {
    const _addressList = patientInfo.addressList || [];
    const _address = _addressList.find(item => item.addressTypeCd === type);
    if (_address) {
        const region = ContactInformationEnum.REGION.find(item => item.code === _address.region);
        const district = commonCodeList.district && commonCodeList.district.find(item => item.code === _address.districtCd);
        const subDistrict = commonCodeList.sub_district && commonCodeList.sub_district.find(item => item.code === _address.subDistrictCd);
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

/*const setValue = (object, path, value) => {
    path = path.replace(/[[]/gm, '.').replace(/[\]]/gm, ''); //to accept [index]
    const keys = path.split('.'),
        last = keys.pop();

    keys.reduce(function (o, k) {
        return o[k] = o[k] || {};
    }, object)[last] = value;
};*/

const filterEmptyValue = (value) => {
    return value ? value : '';
};

const getAssessment = function* (data) {
    const {
        eFormSchemaData,
        output
    } = data;

    const clinic = yield select(state => state.login.clinic),
        encounterId = yield select(state => state.patient.encounterInfo.encounterId),
        svcCd = clinic.svcCd,
        clinicCd = clinic.clinicCd;
    const assessmentOutput = [];

    if (eFormSchemaData) {
        const {data} = yield call(maskAxios.get, `/assessment/assessment/${encounterId}?serviceCd=${svcCd}&clinicCd=${clinicCd}`);

        if (data.respCode === 0) {
            const assessmentData = data.data;

            // console.log('kl_assessmentData', assessmentData);

            if (assessmentData) {
                assessmentData.assessmentValueDtos.forEach(assessmentValueDto => {
                    const values = [];

                    assessmentValueDto.fieldValueDtos.forEach(fieldValueDto => {
                        values.push(filterEmptyValue(fieldValueDto.assessmentResults[0]));
                    });

                    switch (assessmentValueDto.codeAssessmentCd) {
                        case 'BW':
                            assessmentOutput.bw = values[0];
                            break;
                        case 'BH':
                            assessmentOutput.bh = values[0];
                            break;
                        case 'BP':
                            assessmentOutput.bp = values[0] + (values[0] && values[1] ? '/' : '') + values[1];
                            assessmentOutput.systolicBp = values[0];
                            break;
                        case 'PU':
                            assessmentOutput.p = values[0];
                            break;
                        /*                        case 'BMI':
                                                    assessmentOutput.bmi = values[0];
                                                    break;*/
                        case 'UMI':
                            assessmentOutput.microAlb = values[0];
                            break;
                        case 'URP':
                            if (values[0]) {
                                let urpValue = '';

                                switch (values[0]) {
                                    case '225':
                                        urpValue = '-';
                                        break;
                                    case '226':
                                        urpValue = 'trace';
                                        break;
                                    case '227':
                                        urpValue = '+';
                                        break;
                                    case '228':
                                        urpValue = '++';
                                        break;
                                    case '229':
                                        urpValue = '+++';
                                        break;
                                    default:
                                        break;
                                }

                                assessmentOutput.protein = urpValue;
                                assessmentOutput.urineProtein = urpValue;
                            }
                            break;
                        case 'URA':
                            assessmentOutput.albumin = values[0];
                            break;
                        case 'VA':
                            if (values[3] === '1') {
                                assessmentOutput.vaPhR = values[0];
                                assessmentOutput.vaPhL = values[1];

                                assessmentOutput.vaR = values[4];
                                assessmentOutput.vaL = values[5];
                            } else {
                                assessmentOutput.vaR = values[0];
                                assessmentOutput.vaL = values[1];
                            }
                            break;
                        case 'HSTIX':
                            assessmentOutput.hstixMmol = values[0];
                            assessmentOutput.hstixHrpp = values[1];
                            break;
                        default:
                            break;
                    }
                });

                if (assessmentOutput.bw && assessmentOutput.bh) {
                    assessmentOutput.bmi = (assessmentOutput.bw / (Math.pow(assessmentOutput.bh / 100, 2))).toFixed(1);
                }

                for (const key in output) {
                    if (assessmentOutput[key]) {
                        output[key] = assessmentOutput[key];
                    }
                }
            }
        }
    }

    // console.log('kl_assessmentData_output', output);

    return output;
};

const getOfficeSchoolOthersTel = function* (data) {
    const patientInfo = yield select(state => state.patient.patientInfo);

    let output = "";

    if (patientInfo.phoneList && patientInfo.phoneList.find(item => item.phoneTypeCd === 'O')) {
        output = patientInfo.phoneList.find(item => item.phoneTypeCd === 'O').phoneNo;
    } else if (patientInfo.phoneList && patientInfo.phoneList.find(item => item.phoneTypeCd === 'T')) {
        output = patientInfo.phoneList.find(item => item.phoneTypeCd === 'T').phoneNo;
    }

    return output;
};

const getFamilyMemberTel = function* () {
    const contactPerson = yield select(state => state.certificateEform.contactPerson);

    let output = '';

    if (contactPerson && contactPerson.contactPersonList) {
        output = contactPerson.contactPersonList[0].contactPhoneList[0].phoneNo;
    }

    return output;
};

const getFullGender = (patientInfo) => {
    let output = "";

    switch (patientInfo.genderCd) {
        case"M":
            output = "Male (男)";
            break;
        case"F":
            output = "Female (女)";
            break;
        case"U":
            output = "Unknown (不明)";
            break;
        default:
            output = patientInfo.genderCd;
            break;
    }

    return output;
};

const getFullName = (patientInfo) => {
    let engName = '', chiName = '';

    if(patientInfo.engSurname) {
        engName = patientInfo.engSurname + (patientInfo.engSurname && patientInfo.engGivename ? ' ' : '') + patientInfo.engGivename;
    }

    if(patientInfo.nameChi) {
        chiName = patientInfo.nameChi;
    }

    return `${engName} ${chiName}`;
};

const getPMI = function* (data) {
    const {
        eFormSchemaData,
        output
    } = data;

    if (eFormSchemaData) {
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const commonCodeList = yield select(state => state.common.commonCodeList);

        // console.log('kl_login', login);
        // console.log('kl_patientInfo', patientInfo);
        // console.log('kl_contactPersonList', contactPersonListBasic);

        for (const key in output) {
            switch (key) {
                case 'pmiNo':
                    output[key] = patientInfo.patientKey.toString().padStart(10, '0');
                    break;
                case 'patientName':
                    output[key] = patientInfo.engSurname + (patientInfo.engSurname && patientInfo.engGivename ? ' ' : '') + patientInfo.engGivename;
                    break;
                case 'patientNameChi':
                    output[key] = patientInfo.nameChi;
                    break;
                case 'patientFullName':
                    output[key] = getFullName(patientInfo);
                    break;
                case 'hkid':
                    output[key] = patientInfo.hkid;
                    break;
                case 'age':
                    output[key] = patientInfo.age;
                    break;
                case 'gender':
                    output[key] = patientInfo.genderCd;
                    break;
                case 'fullGender':
                    output[key] = getFullGender(patientInfo);
                    break;
                case 'tel.home':
                    output[key] = (patientInfo.phoneList && patientInfo.phoneList.find(item => item.phoneTypeCd === 'H')) && patientInfo.phoneList.find(item => item.phoneTypeCd === 'H').phoneNo;
                    break;
                case 'tel.mobile':
                    output[key] = (patientInfo.phoneList && patientInfo.phoneList.find(item => item.phoneTypeCd === 'M')) && patientInfo.phoneList.find(item => item.phoneTypeCd === 'M').phoneNo;
                    break;
                case 'tel.office':
                    output[key] = (patientInfo.phoneList && patientInfo.phoneList.find(item => item.phoneTypeCd === 'O')) && patientInfo.phoneList.find(item => item.phoneTypeCd === 'O').phoneNo;
                    break;
                case 'tel.officeSchoolOthers':
                    output[key] = (patientInfo.phoneList && patientInfo.phoneList.find(item => item.phoneTypeCd === 'O')) && patientInfo.phoneList.find(item => item.phoneTypeCd === 'O').phoneNo;
                    break;
                case 'emailAddress':
                    output[key] = patientInfo.emailAddress;
                    break;
                case 'address':
                    output[key] = patientInfo.addressList && getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, patientInfo, commonCodeList);
                    break;
                case 'dob':
                    output[key] = patientInfo.dob;
                    break;
                case 'doctor.name':
                    output[key] = login.loginInfo.loginName;
                    break;
                case 'doctor.tel':
                    output[key] = login.loginInfo.userDto.cntctPhn;
                    break;
                case 'doctor.email':
                    output[key] = login.loginInfo.userDto.email;
                    break;
                case 'doctor.siteName':
                    output[key] = login.clinic.siteName;
                    break;
                case 'doctor.siteType':
                    output[key] = getDoctorSiteType(login.clinic.siteType);
                    break;
                case 'clinic.siteName':
                    output[key] = login.clinic.siteName;
                    break;
                case 'clinic.siteCd':
                    output[key] = login.clinic.siteCd;
                    break;
                case 'clinic.addrEng':
                    output[key] = login.clinic.addrEng;
                    break;
                case 'clinic.addrChi':
                    output[key] = login.clinic.addrChi;
                    break;
                case 'clinic.phoneNo':
                    output[key] = login.clinic.phoneNo;
                    break;
                case 'clinic.nameChi':
                    output[key] = login.clinic.clinicNameChi;
                    break;
                case 'clinic.nameEng':
                    output[key] = login.clinic.clinicName;
                    break;
                case 'clinic.fax':
                    output[key] = login.clinic.fax;
                    break;
                case 'clinic.tel':
                    output[key] = login.clinic.phoneNo;
                    break;
                case 'haveHkid':
                    output[key] = patientInfo.hkid ? 'y' : 'n';
                    break;
                default:
                    break;
            }
        }
    }

    // console.log('kl_bmi_output', output);

    return output;
};

export const mapAssessmentPmi = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});

        output = yield call(getAssessment, {eFormSchemaData, output});

        output = yield call(getPMI, {eFormSchemaData, output});
    }

    return transformDotKeyObj(output);
};

export const mapPmi = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = yield getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});
    }

    return transformDotKeyObj(output);
};

export const cardiovascularRiskFactorsFollowUpRecord = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});

        output = yield call(getAssessment, {eFormSchemaData, output});

        output = yield call(getPMI, {eFormSchemaData, output});
    }

    output['gender'] = output['gender'] === 'F' ? 0 : output['gender'] === 'M' ? 1 : undefined;

    output['simd'] = 20;

    return transformDotKeyObj(output);
};

export const pureToneAudiometryReferralForm = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = yield getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});
    }

    output['clinic.addrChi'] = '';
    output['clinic.addrEng'] = '';

    return transformDotKeyObj(output);
};

export const hivAidsReportForm = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = yield getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});

        //special case
        output.correspondenceDate = moment().format('YYYY-MM-DD');
    }

    return transformDotKeyObj(output);
};

export const recordOfHealthScreening = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});

        output = yield call(getAssessment, {eFormSchemaData, output});

        //special case
        output.date1 = moment().format('YYYY-MM-DD');
    }

    return transformDotKeyObj(output);
};

export const tuberculosisNotification = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});

        // output = yield call(getAssessment, {eFormSchemaData, output});

        //special case
        output["tel.familyMember"] = yield call(getFamilyMemberTel);

        output["tel.officeSchoolOthers"] = yield call(getOfficeSchoolOthersTel);
    }

    return transformDotKeyObj(output);
};

export const reportToDhOnPoisoningOrCommunicableDiseases = function* (eFormSchemaData) {
    let output = [];

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        output = getFormSchema(components, 'key');

        output = yield call(getPMI, {eFormSchemaData, output});

        // output = yield call(getAssessment, {eFormSchemaData, output});

        //special case
        output["tel.officeSchoolOthers"] = yield call(getOfficeSchoolOthersTel);
    }

    return transformDotKeyObj(output);
};
