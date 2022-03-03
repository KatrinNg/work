import memoize from 'memoize-one';
import moment from 'moment';
import { call, put, select } from 'redux-saga/effects';
import Enum from '../../../../enums/enum';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import { maskAxios } from '../../../../services/axiosInstance';
import { CommonUtil, PatientUtil, UserUtil } from '../../../../utilities';
import * as messageType from '../../../actions/message/messageActionType';
import {getCaseAlias} from '../../../../utilities/caseNoUtilities';

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

const getAnServiceID = (encounterInfo) => {
    let anSvcId = '---';
    if (encounterInfo) {
        anSvcId = getCaseAlias(encounterInfo);
        if (!anSvcId) {
            anSvcId = '---';
        }
    }
    return anSvcId;
    // const clcAntCurrent = patientInfo && patientInfo.antSvcInfo.clcAntCurrent;
    // const antSvcId = clcAntCurrent ? clcAntCurrent.antSvcId || '---' : '---';
    // return antSvcId;
};

//CIMST-2372: Add outputDateFormat to handle different date format for different form element.
const getExpectedDateofConfinement = (patientInfo, outputDateFormat) => {
    const clcAntCurrent = patientInfo && patientInfo.antSvcInfo.clcAntCurrent;
    const wrkEdc = clcAntCurrent ? clcAntCurrent.wrkEdc || '' : '';
    const dateFormatOutput = outputDateFormat ? outputDateFormat : Enum.DATE_FORMAT_DMY;
    const expectedDateofConfinement = wrkEdc ? moment(wrkEdc).format(dateFormatOutput) : null;
    return expectedDateofConfinement;
};

const getSessionOfDate = (date) => {
    if (!date) return '';
    const hour = date.get('hour');
    let val = '';
    if (parseInt(hour) > 11) {
        val = 'PM';
    } else {
        val = 'AM';
    }
    return val;
};

//add new default value in function 20210521 - start
const getGestation = (patientInfo) => {
    const clcAntFullList = patientInfo && patientInfo.antSvcInfo.clcAntFullList[0];
    const gestWeek = clcAntFullList ? clcAntFullList.gestWeek || '' : '';
    const gestation = gestWeek ? `${gestWeek.replace('-','wk')}d` : null;
    return gestation;
};

const getDeliveryHosp = (patientInfo,commonHospitalList) => {
    const clcAntFullList = patientInfo && patientInfo.antSvcInfo.clcAntFullList[0];
    const deliveryHosp = clcAntFullList ? clcAntFullList.deliveryHosp || '' : '';
    const deliveryHospital = deliveryHosp ? deliveryHosp : null;

    let hospitalName;
    commonHospitalList.forEach(element => {
        if (element.cd == deliveryHospital){
            hospitalName = element.name;
        }
        return hospitalName;
    });

    return hospitalName;
};
//add new default value in function 20210521 - end

export function* mapEformAssessment(eFormSchemaData) {
    const clinic = yield select(state => state.login.clinic);
    const encounterId = yield select(state => state.patient.encounterInfo.encounterId);
    const svcCd = clinic.svcCd;
    const clinicCd = clinic.clinicCd;

    if (eFormSchemaData) {
        const {
            /*            display,
                        version,
                        scss,*/
            components
        } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);

        const assessmentDataFinal = {}, eFormSubmission = {};

        const { data } = yield call(maskAxios.get, `/assessment/assessment/${encounterId}?serviceCd=${svcCd}&clinicCd=${clinicCd}`);

        if (data.respCode === 0) {
            const assessmentData = data.data;
            const login = yield select(state => state.login);
            const patientInfo = yield select(state => state.patient.patientInfo);
            const commonCodeList = yield select(state => state.common.commonCodeList);

            // assessment
            if (assessmentData) {
                assessmentData.assessmentValueDtos.forEach(assessmentValueDto => {
                    const values = [];

                    assessmentValueDto.fieldValueDtos.forEach(fieldValueDto => {
                        values.push(filterEmptyValue(fieldValueDto.assessmentResults[0]));
                    });

                    switch (assessmentValueDto.codeAssessmentCd) {
                        case 'BW':
                            assessmentDataFinal.bw = values[0];
                            break;
                        case 'BH':
                            assessmentDataFinal.bh = values[0];
                            break;
                        case 'BP':
                            assessmentDataFinal.bp = values[0] + (values[0] && values[1] ? '/' : '') + values[1];
                            break;
                        case 'PU':
                            assessmentDataFinal.p = values[0];
                            break;
                        case 'BMI':
                            assessmentDataFinal.bmi = values[0];
                            break;
                        case 'UMI':
                            assessmentDataFinal.microAlb = values[0];
                            break;
                        case 'URP':
                            assessmentDataFinal.protein = values[0];
                            break;
                        case 'URA':
                            assessmentDataFinal.albumin = values[0];
                            break;
                        case 'VA':
                            if (values[3] === '1') {
                                assessmentDataFinal.vaPhR = values[0];
                                assessmentDataFinal.vaPhL = values[1];

                                assessmentDataFinal.vaR = values[4];
                                assessmentDataFinal.vaL = values[5];
                            } else {
                                assessmentDataFinal.vaR = values[0];
                                assessmentDataFinal.vaL = values[1];
                            }
                            break;
                        case 'HSTIX':
                            assessmentDataFinal.hstixMmol = values[0];
                            assessmentDataFinal.hstixHrpp = values[1];
                            break;
                        default:
                            break;
                    }
                });
            }

            // PMI
            handleGetFormSchema(components, 'key').forEach((value, key) => {
                switch (value) {
                    case 'pmiNo':
                        setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                        break;
                    case 'patientName':
                        setValue(eFormSubmission, value, patientInfo.engSurname + (patientInfo.engSurname && patientInfo.engGivename ? ' ' : '') + patientInfo.engGivename);
                        break;
                    case 'patientNameChi':
                        setValue(eFormSubmission, value, patientInfo.nameChi);
                        break;
                    case 'hkid':
                        setValue(eFormSubmission, value, patientInfo.hkid);
                        break;
                    case 'age':
                        setValue(eFormSubmission, value, patientInfo.age);
                        break;
                    case 'gender':
                        setValue(eFormSubmission, value, patientInfo.genderCd);
                        break;
                    case 'tel.home':
                        setValue(eFormSubmission, value, patientInfo.phoneList && patientInfo.phoneList.find(item => item.phhoneTypeCd === 'H') && patientInfo.phoneList.find(item => item.phhoneTypeCd === 'H').phoneNo);
                        break;
                    case 'tel.mobile':
                        setValue(eFormSubmission, value, patientInfo.phoneList && patientInfo.phoneList.find(item => item.phhoneTypeCd === 'M') && patientInfo.phoneList.find(item => item.phhoneTypeCd === 'M').phoneNo);
                        break;
                    case 'address':
                        setValue(eFormSubmission, value, patientInfo.addressList && getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, patientInfo, commonCodeList));
                        break;
                    case 'dob':
                        setValue(eFormSubmission, value, patientInfo.dob);
                        break;
                    case 'doctor.name':
                        setValue(eFormSubmission, value, login.loginInfo.loginName);
                        break;
                    case 'doctor.tel':
                        setValue(eFormSubmission, value, login.loginInfo.userDto.cntctPhn);
                        break;
                    case 'doctor.siteName':
                        setValue(eFormSubmission, value, login.clinic.siteName);
                        break;
                    case 'doctor.siteType':
                        setValue(eFormSubmission, value, getDoctorSiteType(login.clinic.siteType));
                        break;
                    case 'clinic.siteName':
                        setValue(eFormSubmission, value, login.clinic.siteName);
                        break;
                    case 'clinic.siteCd':
                        setValue(eFormSubmission, value, login.clinic.siteCd);
                        break;
                    case 'clinic.addrEng':
                        setValue(eFormSubmission, value, login.clinic.addrEng);
                        break;
                    case 'clinic.addrChi':
                        setValue(eFormSubmission, value, login.clinic.addrChi);
                        break;
                    case 'clinic.phoneNo':
                        setValue(eFormSubmission, value, login.clinic.phoneNo);
                        break;
                    default:
                        setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                        break;
                }
            });

            return eFormSubmission;
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110609'
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110610'
                }
            });
        }
        return null;
    }
}


export function* defaulterTracingLetter(eFormSchemaData) {
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        // let eFormSubmission=readyFormData(components);
        const assessmentDataFinal = {}, eFormSubmission = {};
        const params = {
            siteId: login.clinic.siteId,
            antSlipTmplType: 'C'
        };

        const { data } = yield call(maskAxios.get, '/ana/anaAntSlipTmpl', { params: params });
        if (data.respCode === 0) {
            let reVisitSessList = data.data;
            let reVisitSess = '';
            if (reVisitSessList.length > 0) {
                reVisitSess = reVisitSessList[0].tmplCntnt;
            }
            handleGetFormSchema(components, 'key').forEach((value, key) => {
                switch (value) {
                    case 'pmiNo':
                        setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                        break;
                    case 'nameChi':
                        setValue(eFormSubmission, value, patientInfo.nameChi || '');
                        break;
                    case 'nameEng':
                        setValue(eFormSubmission, value, getPatientName(patientInfo));
                        break;
                    case 'officePhoneChi':
                        setValue(eFormSubmission, value, login.clinic.phn || '');
                        break;
                    case 'officePhoneEng':
                        setValue(eFormSubmission, value, login.clinic.phn || '');
                        break;
                    case 'reVisitSess':
                        setValue(eFormSubmission, value, reVisitSess);
                        break;
                    case 'hospitalNameChi':
                        setValue(eFormSubmission, value, login.clinic.siteChiName || '');
                        break;
                    case 'hospitalNameEng':
                        setValue(eFormSubmission, value, login.clinic.siteEngName || '');
                        break;
                    case 'reportDate':
                        setValue(eFormSubmission, value, moment());
                        break;
                    case 'printDate':
                        setValue(eFormSubmission, value, moment());
                        break;
                    case 'deliverName': {
                        setValue(eFormSubmission, value, login.clinic.siteEngName);
                        break;
                    }
                    case 'deliverAddress':
                        setValue(eFormSubmission, value, login.clinic.addrEng);
                        break;
                    case 'honorificTitle': {
                        setValue(eFormSubmission, value, `${getPatientName(patientInfo)} ${patientInfo.nameChi || ''}`);
                        break;
                    }
                    case 'resAddress': {
                        // let address = '';
                        // if (patientInfo.addressList) {
                        //     const addressDto = patientInfo.addressList.find(x => x.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE);
                        //     if (addressDto && addressDto.addressLanguageCd === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                        //         address = getPatientAddress(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE, patientInfo, commonCodeList);
                        //     }
                        // }
                        let address = getPaitentCorrOrResiAddr(patientInfo, commonCodeList);
                        setValue(eFormSubmission, value, address);
                        break;
                    }
                    default:
                        setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                        break;
                }
            });
            return eFormSubmission;
        } else {
            return null;
        }
    }
}

export function* confinementLetter(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const encounterInfo = yield select(state => state.patient.encounterInfo);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pmiNo':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'madamName': {
                    const patName = getPatientName(patientInfo);
                    const val = `${patientInfo.nameChi || ''}\n${patName}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'anServiceID': {
                    const val = getAnServiceID(encounterInfo);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'confinementDate': {   //CIMST-2372: Default EDC date and allow user to edit
                    setValue(eFormSubmission, value, getExpectedDateofConfinement(patientInfo, 'YYYY-MM-DD'));
                    break;
                }
                case 'doctorName':
                    setValue(eFormSubmission, value, getLoginName(login, false));
                    break;
                case 'siteName': {
                    const val = getSiteName(login);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'printDate1': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'printBy':
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* antenatalReferralLetter(eFormSchemaData) {
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        const commonHospitalList = yield select(state => state.common.hospital);
        // let eFormSubmission=readyFormData(components);
        const assessmentDataFinal = {}, eFormSubmission = {};
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        const {antSvcId} = patientInfo.antSvcInfo.clcAntCurrent;
        // return eFormSubmission;
        // const maskDocNo = PatientUtil.handleMaskHKID(patientInfo, login);
        // const isHKIDFormat=PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
        // if(isHKIDFormat){
        //     const source = [
        //     { label: '---', value: '' },
        //     { label: maskDocNo, value: maskDocNo },
        //     { label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo }
        // ];
        // setValue(eFormSubmission, 'docNoOpts', source);
        // }else{
        //     const source=[{ label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo }];
        //     setValue(eFormSubmission, 'docNoOpts', source);
        // }
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pminobarcode':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;

                //add new default value in function 20210521 - start
                case 'to': {
                    const to = `${getDeliveryHosp(patientInfo,commonHospitalList)}, A&E`;
                    setValue(eFormSubmission, value, to);
                    break;
                }
                //add new default value in function 20210521 - end
                case 'from':
                    setValue(eFormSubmission, value, login.clinic.siteEngName);
                    break;
                case 'toDepartment': {
                    break;
                }
                case 'otherRefNo': {
                    break;
                }
                case 'name':
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                case 'dateOfBirth': {
                    // const val = moment(patientInfo.dob);
                    setValue(eFormSubmission, value, getDobDateByFormat(patientInfo.exactDobCd, patientInfo.dob));
                    break;
                }
                case 'doctype': {
                    const docType = commonCodeList.doc_type.find(x => x.code === priDocPair.docTypeCd);
                    const val = `${docType && docType.engDesc}: `;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'docno': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'gender': {
                    const val = `${patientInfo.genderCd || ''}/ `;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'age': {
                    const val = `${patientInfo.age || ''}${patientInfo.ageUnit ? patientInfo.ageUnit[0] || '' : ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'g': {
                    break;
                }
                case 'p': {
                    break;
                }
                case 'lmp1': {
                    break;
                }
                //add new default value in function 20210521 - start
                case 'edc': {
                    setValue(eFormSubmission, value, getExpectedDateofConfinement(patientInfo));
                    break;
                }
                case 'gestation': {
                    setValue(eFormSubmission, value, getGestation(patientInfo));
                    break;
                }
                case 'anServiceNo': {
                    const val = antSvcId; //getAnServiceID(encounterInfo);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'siteEngAddress': {
                    setValue(eFormSubmission, value, login.clinic.addrEng);
                    break;
                }
                case 'phoneNo': {
                    setValue(eFormSubmission, value, login.clinic.phoneNo || '');
                    break;
                }
                case 'faxNo': {
                    setValue(eFormSubmission, value, login.clinic.fax || '');
                    break;
                }
                case 'hospitalNameChi': {
                    setValue(eFormSubmission, value, login.clinic.siteChiName || '');
                    break;
                }
                case 'nameChi': {
                    setValue(eFormSubmission, value, patientInfo.nameChi || '');
                    break;
                }
                case 'deliveryHospital': {
                    setValue(eFormSubmission, value, getDeliveryHosp(patientInfo,commonHospitalList));
                    break;
                }
                //add new default value in function 20210521 - end
                case 'refer':
                    break;
                case 'problem':
                    break;
                case 'doctorsName':
                    setValue(eFormSubmission, value, getLoginName(login, false));
                    break;
                case 'date': {
                    break;
                }
                case 'replyto':
                    setValue(eFormSubmission, value, login.clinic.siteEngName);
                    break;
                case 'replyname': {
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                }
                case 'dfhPmiNo':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'diagnosis': {
                    break;
                }
                case 'printedBy':
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                case 'printDate':
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

export function* certificateOfAttendance(eFormSchemaData) {
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const appointmentInfo = yield select(state => state.patient.appointmentInfo);
        const encounterInfo = yield select(state => state.patient.encounterInfo);
        const assessmentDataFinal = {}, eFormSubmission = {};
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pmiNo':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'certifyName':
                case 'patientName':
                    setValue(eFormSubmission, value, `${patientInfo.nameChi ? patientInfo.nameChi + ' ' : ''}${CommonUtil.getFullName(patientInfo.engSurname, patientInfo.engGivename, ' ')}`);
                    break;
                case 'accompanyName':
                    setValue(eFormSubmission, value, '');
                    break;
                case 'certifyCaseNo': {
                    const val = getAnServiceID(encounterInfo);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'patientCaseNo': {
                    const val=getAnServiceID(encounterInfo);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'accompanyCaseNo':
                    setValue(eFormSubmission, value, '---');
                    break;
                case 'servicesObtained':
                    setValue(eFormSubmission, value, {antenatalService:true});
                    break;
                case 'dateOfAttendance':{
                    const attnDate = moment(encounterInfo.encounterDate);
                    setValue(eFormSubmission, value, attnDate);
                    break;
                }
                case 'sessionOfAttendance': {
                    const attnDate = moment(encounterInfo.encounterDate);
                    let val = getSessionOfDate(attnDate);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'certificateDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'clinicName': {
                    setValue(eFormSubmission, value, getSiteName(login));
                    break;
                }
                case 'doctorName':
                    setValue(eFormSubmission, value, getLoginName(login, false));
                    break;
                case 'printedBy':
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                case 'printDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'attendedReason':
                    setValue(eFormSubmission, value, 'inPerson');
                    break;
                case 'userRole':
                    setValue(eFormSubmission, value, UserUtil.currentUserBaseRole(login.loginInfo && login.loginInfo.userDto));
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}

export function* sickLeaveLetter(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const appointmentInfo = yield select(state => state.patient.appointmentInfo);
        const encounterInfo = yield select(state => state.patient.encounterInfo);
        // const maskDocNo = PatientUtil.handleMaskHKID(patientInfo, login);
        // const isHKIDFormat=PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
        // if(isHKIDFormat){
        //     const source = [
        //     { label: '  ', value: '' },
        //     { label: maskDocNo, value: maskDocNo },
        //     { label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo }
        // ];
        // setValue(eFormSubmission, 'docNoOpts', source);
        // }else{
        //     const source=[{ label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo }];
        //     setValue(eFormSubmission, 'docNoOpts', source);
        // }
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pmiNo':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'siteEngName':
                    setValue(eFormSubmission, value, login.clinic.siteEngName || '');
                    break;
                case 'siteChiName':
                    setValue(eFormSubmission, value, login.clinic.siteChiName || '');
                    break;
                case 'issueDate':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'madamName': {
                    const patName = getPatientName(patientInfo);
                    const val = `${patName}\n${patientInfo.nameChi || ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'docNo': {
                    // const maskDocNo = PatientUtil.handleMaskHKID(patientInfo, login);
                    // const source = [
                    //     { label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo },
                    //     { label: maskDocNo, value: maskDocNo }
                    // ];
                    // setValue(eFormSubmission, value, patientInfo.primaryDocNo);
                    break;
                }
                case 'anServiceID': {
                    const val = getAnServiceID(encounterInfo);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'attnDate': {
                    // const val = moment(appointmentInfo.appointmentDate);
                    const val = moment(encounterInfo.encounterDate);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'attnSess': {
                    // const val = appointmentInfo.sessDesc;
                    const attnDate = moment(encounterInfo.encounterDate);
                    let val = getSessionOfDate(attnDate);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'leaveFrom':
                    setValue(eFormSubmission, value, moment());
                    break;
                case 'leaveFromSess': {
                    break;
                }
                case 'leaveTo': {
                    break;
                }
                case 'leaveToSess': {
                    break;
                }
                case 'loginName':
                    setValue(eFormSubmission, value, getLoginName(login, false));
                    break;
                case 'printBy':
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                case 'printDate': {
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

export function* InformingHBsAg(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pmiNo':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'engName':
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                case 'chiName':
                    setValue(eFormSubmission, value, patientInfo.nameChi || '');
                    break;
                case 'siteNameChi':{
                    setValue(eFormSubmission, value, login.clinic.siteChiName || '');
                    break;
                }
                case 'siteName':{
                    setValue(eFormSubmission, value, login.clinic.siteEngName || '');
                    break;
                }
                case 'antDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'printedBy': {
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                }
                case 'printDate':{
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'backName': {
                    setValue(eFormSubmission, value, `${getPatientName(patientInfo)} ${patientInfo.nameChi || ''}`);
                    break;
                }
                case 'addr': {
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
            }
        });
        return eFormSubmission;
    }
}

export function* InformingRubella(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        readyMaskHkIDOps(patientInfo, login, eFormSubmission);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pmiNo':
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                case 'engName':
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                case 'chiName':
                    setValue(eFormSubmission, value, patientInfo.nameChi || '');
                    break;
                // case 'siteNameChi': {
                //     setValue(eFormSubmission, value, login.clinic.siteChiName || '');
                //     break;
                // }
                // case 'siteName':{
                //     setValue(eFormSubmission, value, login.clinic.siteEngName || '');
                //     break;
                // }
                case 'siteName': {
                    setValue(eFormSubmission, value, getSiteName(login));
                    break;
                }
                case 'antDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'printedBy': {
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                }
                case 'printDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'backName': {
                    setValue(eFormSubmission, value, `${getPatientName(patientInfo)} ${patientInfo.nameChi || ''}`);
                    break;
                }
                case 'addr': {
                    // let address = '';
                    // if (patientInfo.addressList) {
                    //     if (getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, patientInfo, commonCodeList)) {
                    //         address = getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, patientInfo, commonCodeList);
                    //     } else {
                    //         address = getPatientAddress(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE, patientInfo, commonCodeList);
                    //     }
                    // }
                    let address = getPaitentCorrOrResiAddr(patientInfo, commonCodeList);
                    setValue(eFormSubmission, value, address);
                    break;
                }
            }
        });
        return eFormSubmission;
    }
}

export function* smokingCessationHotline(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const countryList = yield select(state => state.patient.countryList);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'patientName': {
                    const patName = getPatientName(patientInfo);
                    const val = `${patName} ${patientInfo.nameChi || ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'phn1': {
                    // const maskDocNo = PatientUtil.handleMaskHKID(patientInfo, login);
                    // const source = [
                    //     { label: patientInfo.primaryDocNo, value: patientInfo.primaryDocNo },
                    //     { label: maskDocNo, value: maskDocNo }
                    // ];
                    // setValue(eFormSubmission, value, patientInfo.primaryDocNo);
                    const phone = patientInfo.phoneList && patientInfo.phoneList.length > 0 ? patientInfo.phoneList[0] : null;
                    let reuslt = phone ? CommonUtil.getFormatPhone(countryList, phone) : '';
                    setValue(eFormSubmission, value, reuslt);
                    break;
                }
                case 'phn2': {
                    const phone = patientInfo.phoneList && patientInfo.phoneList.length > 1 ? patientInfo.phoneList[1] : null;
                    let reuslt = phone ? CommonUtil.getFormatPhone(countryList, phone) : '';
                    setValue(eFormSubmission, value, reuslt);
                    break;
                }
                case 'hosp': {
                    const val = login.clinic.siteEngName || '';
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'cnctPerson': {
                    const val = getLoginName(login, false);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'title': {
                    const pos = login.loginInfo.userDto.position || '';
                    setValue(eFormSubmission, value, pos);
                    break;
                }
                case 'cnctPhn': {
                    const val = login.clinic.fax || '';
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'printDate': {
                    setValue(eFormSubmission, value, moment());
                    break;
                }
                case 'printedBy':
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                default:
                    setValue(eFormSubmission, value, assessmentDataFinal[value] ?? null);
                    break;
            }
        });
        return eFormSubmission;
    }
}
export function* referralToIFSC(eFormSchemaData) {
    const assessmentDataFinal = {}, eFormSubmission = {};
    if (eFormSchemaData) {
        const { components } = JSON.parse(eFormSchemaData.data.clcEtemplateDto.formContent);
        const login = yield select(state => state.login);
        const patientInfo = yield select(state => state.patient.patientInfo);
        const priDocPair = PatientUtil.getPatientPrimaryDoc(patientInfo.documentPairList);
        const commonCodeList = yield select(state => state.common.commonCodeList);
        const encounterInfo = yield select(state => state.patient.encounterInfo);
        handleGetFormSchema(components, 'key').forEach((value, key) => {
            switch (value) {
                case 'pminobarcode': {
                    setValue(eFormSubmission, value, patientInfo.patientKey.toString().padStart(10, '0'));
                    break;
                }
                case 'patientName': {
                    setValue(eFormSubmission, value, getPatientName(patientInfo));
                    break;
                }
                case 'siteName': {
                    setValue(eFormSubmission, value, login.clinic.siteName);
                    break;
                }
                case 'chiName': {
                    setValue(eFormSubmission, value, patientInfo.nameChi || '');
                    break;
                }
                case 'gender': {
                    const val = `${patientInfo.genderCd || ''}/ `;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'age': {
                    const val = `${patientInfo.age || ''}${patientInfo.ageUnit ? patientInfo.ageUnit[0] || '' : ''}`;
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'docno': {
                    const docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);
                    setValue(eFormSubmission, value, docNo);
                    break;
                }
                case 'anServiceID': {
                    const val = getAnServiceID(encounterInfo);
                    setValue(eFormSubmission, value, val);
                    break;
                }
                case 'addr': {
                    let address = getPaitentCorrOrResiAddr(patientInfo, commonCodeList);
                    setValue(eFormSubmission, value, address);
                    break;
                }
                case 'sitePhoneNo': {
                    setValue(eFormSubmission, value, login.clinic.phoneNo);
                    break;
                }
                case 'patientPhoneNo': {
                    const val = patientInfo.phoneList && patientInfo.phoneList.length > 0 ? patientInfo.phoneList[0].phoneNo : null;
                    setValue(eFormSubmission, value, val);
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
                case 'printedBy': {
                    setValue(eFormSubmission, value, getLoginName(login, true));
                    break;
                }
                case 'serviceName': {
                    setValue(eFormSubmission, value, getServiceName(login));
                    break;
                }
                case 'wrkEdc': {
                    setValue(eFormSubmission, value, getExpectedDateofConfinement(patientInfo));
                    break;
                }
                case 'nodeAboveNamed': {
                    setValue(eFormSubmission, value, 'Y');
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