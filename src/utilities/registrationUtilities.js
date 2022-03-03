import CommonRegex from '../constants/commonRegex';
import RegFieldnameForError from '../enums/registration/regFieldnameForError';
import Enum, { EHS_CONSTANT, SERVICE_CODE } from '../enums/enum';
import ContactInformationEnum from '../enums/registration/contactInformationEnum';
import moment from 'moment';
import {
    patientAddressBasic,
    patientPhonesBasic,
    patientSocialDataBasic,
    patientContactInfoBasic,
    patientBaseInfoBasic,
    paperBasedRecordBasic,
    patientReminderBasic,
    waiverInfoBasic,
    contactPersonBasic,
    patientDocumentPair,
    familyNoTypes
} from '../constants/registration/registrationConstants';
import _ from 'lodash';
import * as PatientUtil from './patientUtilities';
import { dispatch, getState } from '../store/util';
import {getPriorityConfig} from './commonUtilities';
import { patientEhsDto } from '../constants/serviceSpecific/ehsConstants';
import * as yup from 'yup';
import CommonMessage from '../constants/commonMessage';
import { pad } from './familyNoUtilities';
import { openCommonMessage } from '../store/actions/message/messageAction';

export function limitTextFieldMaxLength(value, maxLength) {
    let regex = new RegExp(CommonRegex.VALIDATION_REGEX_POSITIVE_INTEGER);
    if (regex.test(maxLength) && value) {
        let max = parseInt(maxLength);
        if (value.length > max) {
            value = value.slice(0, max);
        }
    }
    return value;
}

export function limitTextFieldTrim(value) {
    if (value) {
        return value.replace(CommonRegex.VALIDATION_REGEX_BLANK_SPACE, '');
    }
    return value;
}

export function IsHKIDbyJS(str) {
    // let strValidChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // basic check length
    if (str.length < 8)
        return false;

    // handling bracket
    if (str.charAt(str.length - 3) === '(' && str.charAt(str.length - 1) === ')')
        str = str.substring(0, str.length - 3) + str.charAt(str.length - 2);

    // convert to upper case
    str = str.toUpperCase();

    // regular expression to check pattern and split
    let hkidPat = /^([A-Z]{1,2})([0-9]{6})([A0-9])$/;
    let matchArray = str.match(hkidPat);

    // not match, return false
    if (matchArray === null)
        return false;

    return true;
}

export function checkIsDateTime(value, format) {
    let regStr = '';
    if (format === Enum.DATE_FORMAT_EY_VALUE) {
        regStr = /^(\d{4})$/;
    } else if (format === Enum.DATE_FORMAT_EMY_VALUE) {
        regStr = /^([a-zA-Z]{3})-(\d{4})$/;
    } else if (format === Enum.DATE_FORMAT_EDMY_VALUE) {
        regStr = /^(\d{2})-([a-zA-Z]{3})-(\d{4})$/;
    } else {
        return false;
    }

    if (!regStr.test(value)) {
        return false;
    }

    try {
        let mo = moment(value);
        return mo._isValid;
    } catch (err) {
        return false;
    }
}

export function getHkidNum(value) {
    if (value)
        value = value.substr(value.length - 1);
    return value;
}

export function hkidFormat(value) {
    if (value) {
        value = value.replace('(', '').replace(')', '');
        return _.toUpper(value.slice(0, value.length - 1) + '(' + value.slice(value.length - 1) + ')');
    }
    return value;
}

export function getTitleByFiledName(fieldName) {
    let value = RegFieldnameForError[fieldName];
    return value || fieldName;
}

export function getDateFormat(edob) {
    switch (edob) {
        case Enum.DATE_FORMAT_EY_KEY: {
            return Enum.DATE_FORMAT_EY_VALUE;
        }
        case Enum.DATE_FORMAT_EMY_KEY: {
            return Enum.DATE_FORMAT_EMY_VALUE;
        }
        case Enum.DATE_FORMAT_EDMY_KEY: {
            return Enum.DATE_FORMAT_EDMY_VALUE;
        }
        default: {
            return Enum.DATE_FORMAT_EDMY_VALUE;
        }
    }
}

export function convertBase64UrlToBlob(base64Url) {
    let arr = base64Url.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bytes = window.atob(base64Url.split(',')[1]);
    let ab = new ArrayBuffer(bytes.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
}

export function getDateByFormat(edob, date) {
    switch (edob) {
        case Enum.DATE_FORMAT_EY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).startOf('year');
        }
        case Enum.DATE_FORMAT_EMY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).startOf('month');
        }
        case Enum.DATE_FORMAT_EDMY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE);
        }
        default: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE);
        }
    }
}

export function getDobDateByFormat(edob, date) {
    switch (edob) {
        case Enum.DATE_FORMAT_EY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).startOf('year').format(Enum.DATE_FORMAT_EY_VALUE);
        }
        case Enum.DATE_FORMAT_EMY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).startOf('month').format(Enum.DATE_FORMAT_EMY_VALUE);
        }
        case Enum.DATE_FORMAT_EDMY_KEY: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE);
        }
        default: {
            return moment(date, Enum.DATE_FORMAT_EYMD_VALUE).format(Enum.DATE_FORMAT_EYMD_VALUE);
        }
    }
}

export function addPatientPhone(type, isPrimary, isSms) {
    let ppb = _.cloneDeep(patientPhonesBasic);
    ppb.phoneTypeCd = type;
    if (isPrimary === true) {
        ppb.phonePriority = 1;
        // ppb.smsPhoneInd = '1';
    }
    if (isSms === true) {
        ppb.smsPhoneInd = '1';
    }
    return ppb;
}

export function addPatinetPhoneByType(typeList, phoneList) {
    let ppList = _.cloneDeep(phoneList);
    typeList && typeList.forEach(type => {
        let newPatientPhone = addPatientPhone(type.phType || '', type.isPri, type.isSms);
        ppList.push(newPatientPhone);
    });
    return ppList;
}

export function addPatientAddress(type) {
    let pab = _.cloneDeep(patientAddressBasic);
    pab.addressTypeCd = type;
    return pab;
}

/**to get sms mobile index*/
export function getSMSMoblieIdx(phoneList) {
    let _phoneList = _.cloneDeep(phoneList) || [];
    let smsMobileIdx = _phoneList.findIndex(item => parseInt(item.smsPhoneInd) === 1);
    return smsMobileIdx;
}

/**update communication means*/
export function updateCommunicationMeans(selectSMSMobile, communicationMeans) {
    let _communicationMeans = _.cloneDeep(communicationMeans);
    if (selectSMSMobile) {
        if (_communicationMeans.indexOf(Enum.CONTACT_MEAN_SMS) === -1) {
            _communicationMeans += Enum.CONTACT_MEAN_SMS;
        }
    }
    else {
        if (_communicationMeans.indexOf(Enum.CONTACT_MEAN_SMS) > -1) {
            _communicationMeans = _communicationMeans.replace(Enum.CONTACT_MEAN_SMS, '');
        }
    }

    return _communicationMeans;
}

export function initPatientPhone(phoneList = []) {
    let _phoneList = _.cloneDeep(phoneList) || [];
    // if (_phoneList.findIndex(item => item.phonePriority === 1) === -1) {
    //     _phoneList.unshift(addPatientPhone(Enum.PHONE_TYPE_MOBILE_PHONE, true));
    // }
    // _phoneList.forEach(phone => {
    //     if (!phone.areaCd) {
    //         phone.areaCd = '';
    //     }
    // });
    let typeList = [];
    if (_phoneList.length === 0) {
        typeList = [
            {
                phType: Enum.PHONE_TYPE_MOBILE_PHONE,
                isSms: true
            },
            {
                phType: Enum.PHONE_TYPE_HOME_PHONE
            },
            {
                phType: Enum.PHONE_TYPE_OFFICE_PHONE
            },
            {
                phType: Enum.PHONE_TYPE_FAX_PHONE
            },
            {
                phType: Enum.PHONE_TYPE_OTHER_PHONE
            }
        ];

    } else {
        for (let i = _phoneList.length; i < 5; i++) {
            typeList.push({ phType: '' });
        }
    }
    _phoneList = addPatinetPhoneByType(typeList, _phoneList);
    _phoneList.forEach(x => {
        x.areaCd = x.areaCd || '';
    });
    return _phoneList;
}


export function initPatientAddress(patientAddressList) {
    let addressList = [];
    if (patientAddressList && patientAddressList.length > 0) {
        addressList = patientAddressList;
        let corAddress = addressList.find(item => item.addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE);
        let resAddress = addressList.find(item => item.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE);
        if (!corAddress) {
            addressList.push(addPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE));
        }
        if (!resAddress) {
            addressList.push(addPatientAddress(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE));
        }
        addressList.forEach(address => {
            let notEmptyFieldArr = [];
            // for (let name in address) {
            //     if (name !== 'addressId' && name !== 'addressTypeCd' && name !== 'addressLanguageCd' && name !== 'serviceCd' && name !== 'addressFormat' && name !== 'isDirty') {
            //         if (address[name] !== '') {
            //             notEmptyFieldArr.push(address[name]);
            //         }
            //     }
            // }
            for (let name in patientAddressBasic) {
                if (address[name] && name !== 'addressId' && name !== 'addressTypeCd' && name !== 'addressLanguageCd' && name !== 'addressFormat' && name !== 'isDirty') {
                    notEmptyFieldArr.push(address[name]);
                }
            }
            if (notEmptyFieldArr.length > 0) {
                address.isDirty = true;
            }
            else {
                address.isDirty = false;
            }
            const addressDto = converAddressLanguage({
                isChi: address.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE,
                addressDto: address,
                regionList: ContactInformationEnum.REGION,
                districtList: getState(s => s.common.commonCodeList.district) || [],
                subDistrictList: getState(s => s.common.commonCodeList.sub_district) || []
            });
            address.regionCode = addressDto.regionCode;
            address.districtCode = addressDto.districtCode;
            address.subDistrictCode = addressDto.subDistrictCode;
        });
    } else {
        addressList.push(addPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE));
        addressList.push(addPatientAddress(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE));
    }
    return addressList;
}

export function initPatientSocialData(patientById) {
    let patientSocialData = _.cloneDeep(patientSocialDataBasic);
    if (patientById) {
        patientSocialData.ethnicityCd = patientById.ethnicityCd || '';
        patientSocialData.maritalStatusCd = patientById.maritalStatusCd || '';
        patientSocialData.religionCd = patientById.religionCd || '';
        patientSocialData.occupationCd = patientById.occupationCd || '';
        patientSocialData.translationLangCd = patientById.translationLangCd || '';
        patientSocialData.eduLevelCd = patientById.eduLevelCd || '';
        patientSocialData.govDptCd = patientById.govDptCd || '';
        patientSocialData.rank = patientById.rank || '';
        patientSocialData.remarks = patientById.remarks || '';
    }
    return patientSocialData;
}
export function initPatientContactInfo(patientById) {
    let patientContactInfo = _.cloneDeep(patientContactInfoBasic);
    if (patientById) {
        // let phoneList = _.cloneDeep(patientById.phoneList);
        // let smsMobileIdx = getSMSMoblieIdx(phoneList);
        // let communicationMeans = _.cloneDeep(patientById.communicationMeansCd) || '';
        // if (smsMobileIdx > -1) {
        //     communicationMeans = updateCommunicationMeans(true, communicationMeans);
        // }
        // patientContactInfo.communicationMeansCd = patientById.communicationMeansCd || patientContactInfo.communicationMeansCd;
        // patientContactInfo.communicationMeansCd = communicationMeans || patientContactInfo.communicationMeansCd;
        let communicationMeans = _.cloneDeep(patientById.pmiPatientCommMeanList) || [];
        communicationMeans=communicationMeans.filter(commMean=>commMean.status==='A');
        patientContactInfo.pmiPatientCommMeanList = communicationMeans;
        patientContactInfo.emailAddress = patientById.emailAddress || '';
        // patientContactInfo.preferredLangCd = patientById.preferredLangCd || patientContactInfo.preferredLangCd;
        patientContactInfo.commLangCd = patientById.commLangCd || '';
        patientContactInfo.postOfficeBoxNo = patientById.postOfficeBoxNo || '';
        patientContactInfo.postOfficeName = patientById.postOfficeName || '';
        patientContactInfo.postOfficeRegion = patientById.postOfficeRegion || '';
        patientContactInfo.dtsElctrncCommCnsntSts = patientById.dtsElctrncCommCnsntSts || '';
        patientContactInfo.dtsElctrncCommCnsntUpdDtm = patientById.dtsElctrncCommCnsntUpdDtm ?
            moment(patientById.dtsElctrncCommCnsntUpdDtm).format(Enum.DATE_FORMAT_EDMY_VALUE)
            : '';
    }
    return patientContactInfo;
}
export function initPatientBaseInfo(patientById) {
    let patientBaseInfo = _.cloneDeep(patientBaseInfoBasic);
    if (patientById) {
        for (let k in patientBaseInfo) {
            patientBaseInfo[k] = patientById[k];
        }
    }
    if (patientBaseInfo.hkid && !patientBaseInfo.otherDocNo) {
        patientBaseInfo.docTypeCd = '';
    }
    patientBaseInfo.documentPairList = patientById.documentPairList || [];


    const svcCd = getState((state) => state.login.service.svcCd);
    if (svcCd === SERVICE_CODE.EHS) {
        // EHS Specific
        patientBaseInfo = {
            ...patientBaseInfo,
            isApplyEhsMember: PatientUtil.isApplyEhsMember(patientBaseInfo.ehsMbrSts) ? 1 : 0
        };

        // append init patientEhsDto if null or empty
        if (!patientBaseInfo.patientEhsDto || Object.keys(patientBaseInfo?.patientEhsDto)?.length === 0) {
            patientBaseInfo = {
                ...patientBaseInfo,
                patientEhsDto: {...patientEhsDto}
            };
        }
    }

    return patientBaseInfo;
}

export function initPatientContactPerson(patientById, countryList = []) {
    let _contactPersonList = [_.cloneDeep(contactPersonBasic)];
    _contactPersonList[0].contactPhoneList = [addPatientPhone(Enum.PHONE_TYPE_MOBILE_PHONE)];
    if (patientById && patientById.contactPersonList) {
        _contactPersonList = _.cloneDeep(patientById.contactPersonList);
        _contactPersonList.forEach((item) => {
            // item.contactPhoneList && item.contactPhoneList.forEach((element, index) => {
            //     let countryOptionsObj = countryList.find(i => i.countryCd == element.countryCd);
            //     let dialingCd = countryOptionsObj && countryOptionsObj.dialingCd;
            //     element['dialingCd'] = dialingCd;
            // });
            if(item.contactPhoneList) {
                item.contactPhoneList.sort((a, b) => {
                    return a.contactPhoneId - b.contactPhoneId;
                });
            } else {
                item.contactPhoneList = [addPatientPhone(Enum.PHONE_TYPE_MOBILE_PHONE)];
            }
            const addressDto = converAddressLanguage({
                isChi: item.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE,
                addressDto: item,
                regionList: ContactInformationEnum.REGION,
                districtList: getState(s => s.common.commonCodeList.district) || [],
                subDistrictList: getState(s => s.common.commonCodeList.sub_district) || []
            });
            item.regionCode = addressDto.regionCode;
            item.districtCode = addressDto.districtCode;
            item.subDistrictCode = addressDto.subDistrictCode;
        });
    }
    _contactPersonList.sort((a, b) => a.displaySeq - b.displaySeq);
    return _contactPersonList;
}

export function initPatientAssoPerson(patientById) {
    let assoPersonInfo = {};
    assoPersonInfo.assoPerHKID = PatientUtil.getHkidFormat(patientById.assoPersHkid || '');
    assoPersonInfo.assoPerName = patientById.assoPersName || '';
    assoPersonInfo.assoPerReltship = patientById.assoPersRlatSts || '';
    return assoPersonInfo;
}

function tranformatMonth(month) {
    let mon = _.toUpper(month);
    let num = '';
    switch (mon) {
        case 'JAN':
            num = '01';
            break;
        case 'FEB':
            num = '02';
            break;
        case 'MAR':
            num = '03';
            break;
        case 'APR':
            num = '04';
            break;
        case 'MAY':
            num = '05';
            break;
        case 'JUN':
            num = '06';
            break;
        case 'JUL':
            num = '07';
            break;
        case 'AUG':
            num = '08';
            break;
        case 'SEP':
            num = '09';
            break;
        case 'OCT':
            num = '10';
            break;
        case 'NOV':
            num = '11';
            break;
        case 'DEC':
            num = '12';
            break;
        default: break;
    }
    return num;
}

export function tranformatDate(value) {
    if (value) {
        let arr = value.split('-');
        arr[1] = tranformatMonth(arr[1]);
        value = arr.join('-');
    }
    return value;
}

export function replaceIndexChar(string, index, char) {
    string = string || '';
    index = index || [];
    char = char || '';
    string = string.substring(0, index) + char;
    return string;
}

export function trimString(params) {
    if (params) {
        params = params.trim();
    } else {
        params = '';
    }
    return params;
}

const WINDOW_ADI_WINDOW_KEY = 'ADI_WINDOW';
export const closeActiveADIWindow = () => {
    const isADIWindowActive = () => window[WINDOW_ADI_WINDOW_KEY] !== undefined;
    const getActiveADIWindow = () => window[WINDOW_ADI_WINDOW_KEY];
    if (isADIWindowActive()) {
        getActiveADIWindow().close();
        window[WINDOW_ADI_WINDOW_KEY] = undefined;
    }
};

export const openADISearchDialog = (adiUrl, callback, closingWindow) => {
    closeActiveADIWindow();
    const h = 700;
    const w = 1500;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);

    let newADIWindow = window.open(adiUrl, '',
        'toolbar=no,location=no' +
        'directories=no,status=no,menubar=no,scrollbars=yes,' +
        'resizable=yes,width=' + w + ',height=' + h + ', top=' + top + ', left=' + left);
    if (newADIWindow) {
        let timer = setInterval(() => {
            if (newADIWindow.closed) {
                clearInterval(timer);
                closingWindow();
                window[WINDOW_ADI_WINDOW_KEY] = undefined;
            }
        }, 500);

        window[WINDOW_ADI_WINDOW_KEY] = newADIWindow;

        window.setADIAddress = (status,
            unit, floor, block, building,
            estate, streetNo, streetName, subDistrict, district, region, buildingCsuId,
            northing, easting,
            latitude, longitude
        ) => {
            if (callback) {
                status = trimString(status);
                unit = trimString(unit);
                floor = trimString(floor);
                block = trimString(block);
                building = trimString(building);
                estate = trimString(estate);
                streetNo = trimString(streetNo);
                streetName = trimString(streetName);
                subDistrict = trimString(subDistrict);
                district = trimString(district);
                region = trimString(region);
                buildingCsuId = trimString(buildingCsuId);
                callback({
                    status,
                    unit,
                    floor,
                    block,
                    building,
                    estate,
                    streetNo,
                    streetName,
                    district,
                    subDistrict,
                    region,
                    buildingCsuId
                });
            }
        };
    }
};

export function filterListBySperCode(list, name, value, isSuperCode = false) {
    let newList;
    if (isSuperCode) {
        newList = list.filter(item => item.superCode === value);
    }
    else {
        let target = list.find(item => item[name] === value);
        if (target) {
            newList = list.filter(item => item.superCode === target.superCode);

        }
    }
    return newList ? newList : list;
}

export function initNewPaperBasedRec(serviceCd) {
    let newPaperBasedRecordRec = _.cloneDeep(paperBasedRecordBasic);
    newPaperBasedRecordRec.serviceCd = serviceCd;

    return newPaperBasedRecordRec;
}

export function initNewPatientReminderRec() {
    let newReminderRec = _.cloneDeep(patientReminderBasic);

    return newReminderRec;
}

export function initNewWaiverRec(loginName) {
    let newWaiverRec = _.cloneDeep(waiverInfoBasic);
    // newWaiverRec.startDate = moment();
    // newWaiverRec.endDate = moment();
    // newWaiverRec.issueDate = moment();
    newWaiverRec.checkedBy = loginName;

    return newWaiverRec;
}

/**
 * Clean blank phone when save patient
 * @method getAvailablePhoneList
 * @author Justin Long
 * @param {Array} editPhoneList phoneList after editing
 */
export function getAvailablePhoneList(editPhoneList) {
    let phoneList = null;
    if (editPhoneList) {
        phoneList=editPhoneList.filter(item => item.phoneTypeCd && item.dialingCd && item.phoneNo);
    }
    return phoneList;
}

/**
 * Judge whether the object is in the initial state
 * @method isObjectDirty
 * @author Justin Long
 * @param {Object} object
 * @param {Array} includeFieldNames
 */
export function isObjectDirty(object = {}, includeFieldNames = []) {
    let isDirty = false;
    for (let i = 0; i < includeFieldNames.length; i++) {
        if (object[includeFieldNames[i]] !== ''
            && object[includeFieldNames[i]] !== null
            && object[includeFieldNames[i]] !== undefined) {
            isDirty = true;
            break;
        }
    }
    return isDirty;
}

export function isContactPersonDirty(contactPer) {
    const dirtyField = [
        'block',
        'building',
        'districtCd',
        'emailAddress',
        'engGivename',
        'engSurname',
        'otherName',
        'estate',
        'floor',
        'nameChi',
        'relationshipCd',
        'region',
        'room',
        'subDistrictCd',
        'streetName',
        'streetNo',
        'postOfficeBoxNo',
        'postOfficeName',
        'postOfficeRegion',
        'addrTxt',
        'remark'
    ];
    const phoneDirtyField = [
        'phoneNo',
        'areaCd'
    ];
    let isDirty = isObjectDirty(contactPer, dirtyField);
    if (contactPer.contactPhoneList) {
        for (let i = 0; i < contactPer.contactPhoneList.length; i++) {
            if (isObjectDirty(contactPer.contactPhoneList[i], phoneDirtyField)) {
                isDirty = true;
                break;
            }
        }
    }
    return isDirty;
}

export function genDocPairList(patientInfo, serviceCd) {
    let docPairList = [];
    let primaryDocPair = patientInfo.documentPairList.find(item => item.isPrimary === 1);
    let additionalDocPair = patientInfo.documentPairList.find(item => item.isPrimary === 0);

    const addiDocTypeCd = patientInfo.additionalDocTypeCd || '';
    const addiDocNo = patientInfo.additionalDocNo || '';

    if (!primaryDocPair) {
        primaryDocPair = _.cloneDeep(patientDocumentPair);
        primaryDocPair.patientKey = patientInfo.patientKey;
        primaryDocPair.serviceCd = serviceCd;
        primaryDocPair.isPrimary = 1;
    }
    primaryDocPair.docTypeCd = patientInfo.primaryDocTypeCd;
    if (PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd)) {
        primaryDocPair.docNo = patientInfo.primaryDocNo.replace('(', '').replace(')', '');
    }
    else {
        primaryDocPair.docNo = patientInfo.primaryDocNo;
    }
    primaryDocPair.issueCountryCd = patientInfo.priIssueCountryCd;
    docPairList.push(primaryDocPair);

    if (addiDocTypeCd !== '' && addiDocNo !== '') {
        if (!additionalDocPair) {
            additionalDocPair = _.cloneDeep(patientDocumentPair);
            additionalDocPair.patientKey = patientInfo.patientKey;
            additionalDocPair.serviceCd = serviceCd;
        }

        additionalDocPair.docTypeCd = patientInfo.additionalDocTypeCd;
        additionalDocPair.docNo = patientInfo.additionalDocNo;
        additionalDocPair.issueCountryCd = patientInfo.addlIssueCountryCd;
        docPairList.push(additionalDocPair);
    }

    return docPairList;
}

/**make sure phoneList always has prefer phone*/
export function initPreferPhone(phoneList) {
    let _phoneList = _.cloneDeep(phoneList) || [];
    if ((_phoneList.findIndex(item => item.phonePriority === 1) === -1) && _phoneList.length > 0) {
        _phoneList[0].phonePriority = 1;
    }
    return _phoneList;
}

export function loadMiscellaneousActiveData(originList) {
    let activeData = _.cloneDeep(originList);
    let resultList = [];
    activeData.sort((a, b) => { return a.id - b.id; });

    let seq = 0;
    activeData.forEach(paperBasedRec => {
        paperBasedRec.seq = seq;
        paperBasedRec.isEmpty = false;
        seq++;
    });
    resultList = activeData;
    return resultList;
}

export function isPmiPersRemarkActive(reminder, loginServiceCd, loginClinicCd) {
    return reminder.statusCd === 'A'
        && (reminder.scope === Enum.SHARE_WITH_LIST[0].code
        || (reminder.scope === Enum.SHARE_WITH_LIST[1].code && reminder.serviceCd === loginServiceCd)
        || (reminder.scope === Enum.SHARE_WITH_LIST[2].code && reminder.serviceCd === loginServiceCd && reminder.clinicCd === loginClinicCd));
}

export function isPmiPaperBasedActive(item, loginServiceCd) {
    return item.serviceCd === loginServiceCd && item.statusCd === 'A';
}

export function genMiscellaneousData(patientData, loginServiceCd, loginName, loginClinicCd) {
    let paperBasedRecordList = [];
    let reminderList = [];
    let waiverList = [];
    if (loginServiceCd !== '' && loginName !== '') {
        //miscellaneous paper based record;
        const filterPaperBasedList = patientData.pmiPersPaperBasedList && patientData.pmiPersPaperBasedList.filter(x => isPmiPaperBasedActive(x, loginServiceCd));
        if (filterPaperBasedList && filterPaperBasedList.length > 0) {
            paperBasedRecordList = loadMiscellaneousActiveData(filterPaperBasedList);

        } else {
            let newPaperBasedRecordRec = initNewPaperBasedRec(loginServiceCd);
            paperBasedRecordList.push(newPaperBasedRecordRec);
        }
        //miscellaneous patient reminder list

        const filterReminderList = patientData.pmiPersRemarkList && patientData.pmiPersRemarkList.filter(x => isPmiPersRemarkActive(x, loginServiceCd, loginClinicCd));
        if (filterReminderList && filterReminderList.length > 0) {
            reminderList = loadMiscellaneousActiveData(filterReminderList);
        } else {
            let newReminderRec = initNewPatientReminderRec();
            reminderList.push(newReminderRec);
        }

        //miscellaneous waiver list
        if (patientData.pmiPersWaiverList && patientData.pmiPersWaiverList.length > 0) {
            patientData.pmiPersWaiverList.sort((a, b) => { return a.id - b.id; });
            let seq = 0;
            let recPos = 0;
            let activeWaiverList = patientData.pmiPersWaiverList.filter(item => item.useSts !== 'D');
            if (activeWaiverList.length > 0) {
                activeWaiverList.forEach(waiverRec => {
                    waiverRec.startDate = waiverRec.startDate !== null ? moment(waiverRec.startDate, Enum.DATE_FORMAT_EYMD_VALUE) : null;
                    waiverRec.endDate = waiverRec.endDate !== null ? moment(waiverRec.endDate, Enum.DATE_FORMAT_EYMD_VALUE) : null;
                    waiverRec.issueDate = waiverRec.issueDate !== null ? moment(waiverRec.issueDate, Enum.DATE_FORMAT_EYMD_VALUE) : null;
                    waiverRec.seq = seq;
                    waiverRec.checkedBy = waiverRec.createBy; //TEAMCDE4-329 Get create_by for Waiver Checked By in Registration
                    waiverRec.recPos = recPos;
                    waiverRec.isEmpty = false;
                    waiverRec.isReadOnly = (waiverRec.useSts === Enum.WAIVER_STATUS.USED || waiverRec.useSts === Enum.WAIVER_STATUS.INVALID || waiverRec.useSts === Enum.WAIVER_STATUS.DELETE);  //TEAMCDE4-329 To control the record cannot be update by user if it is Used/Cancel/Deleted
                    seq++;
                    recPos++;
                });
            }
            else {
                activeWaiverList.push(initNewWaiverRec(loginName));
            }

            // waiverList = patientById.pmiPersWaiverList;
            waiverList = activeWaiverList;
        }
        else {
            let newWaiverRec = initNewWaiverRec(loginName);
            waiverList.push(newWaiverRec);
        }
    }
    return { paperBasedRecordList: paperBasedRecordList, patientReminderList: reminderList, waiverList: waiverList };
}

/**The relationship of region & district & subDistrict */
export function getDistrictRelationship({ name, code, value, regionList, districtList, subDistrictList, isChi, addressDto }) {
    if(name === 'region') {
        return {
            region: value,
            regionCode: code,
            districtCd: '',
            districtCode: '',
            subDistrictCd: '',
            subDistrictCode: ''
        };
    }
    if (name === 'districtCd') {
        let obj = {
            region: addressDto && addressDto.region,
            regionCode: addressDto && addressDto.regionCode,
            districtCd: value,
            districtCode: code,
            subDistrictCd: '',
            subDistrictCode: ''
        };
        const _district = districtList.find(item => item.code === code);
        if (_district && _district.superCode) {
            const _region = regionList.find(x => x.code === _district.superCode);
            if (_region) {
                obj.region = isChi ? (_region.chiDesc || _region.engDesc) : _region.engDesc;
                obj.regionCode = _region.code;
            }
        }
        return obj;
    }
    if (name === 'subDistrictCd') {
        let obj = {
            region: addressDto && addressDto.region,
            regionCode: addressDto && addressDto.regionCode,
            districtCd: addressDto && addressDto.districtCd,
            districtCode: addressDto && addressDto.districtCode,
            subDistrictCd: value,
            subDistrictCode: code
        };
        const _subDistrict = subDistrictList.find(item => item.code === code);
        if (_subDistrict && _subDistrict.superCode) {
            const _district = districtList.find(item => item.code === _subDistrict.superCode);
            if (_district) {
                obj.districtCd = isChi ? (_district.chiDesc || _district.engDesc) : _district.engDesc;
                obj.districtCode = _district.code;
                if (_district.superCode) {
                    const _region = regionList.find(item => item.code === _district.superCode);
                    if (_region) {
                        obj.region = isChi ? (_region.chiDesc || _region.engDesc) : _region.engDesc;
                        obj.regionCode = _region.code;
                    }
                }
            }
        }
        return obj;
    }
}

/**Conver address between english and chinese */
export function converAddressLanguage({ isChi, addressDto, regionList, districtList, subDistrictList }) {
    let obj = {
        region: '',
        districtCd: '',
        subDistrictCd: '',
        regionCode: '',
        districtCode: '',
        subDistrictCode: ''
    };
    if(addressDto) {
        obj = {
            region: addressDto.region,
            districtCd: addressDto.districtCd,
            subDistrictCd: addressDto.subDistrictCd,
            regionCode: addressDto.regionCode,
            districtCode: addressDto.districtCode,
            subDistrictCode: addressDto.subDistrictCode
        };
        const currentLangIsChi = addressDto.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE;
        if(addressDto.region) {
            const _region = regionList.find(x => currentLangIsChi ? x.chiDesc === addressDto.region : x.engDesc === addressDto.region);
            if(_region) {
                obj.region = isChi ? (_region.chiDesc || _region.engDesc) : _region.engDesc;
                obj.regionCode = _region.code;
                if(addressDto.districtCd) {
                    const _district = districtList.find(x => (currentLangIsChi ? x.chiDesc === addressDto.districtCd : x.engDesc === addressDto.districtCd) && x.superCode === _region.code);
                    if(_district) {
                        obj.districtCd = isChi ? (_district.chiDesc || _district.engDesc) : _district.engDesc;
                        obj.districtCode = _district.code;
                        if(addressDto.subDistrictCd) {
                            const _subDistrict = subDistrictList.find(x => (currentLangIsChi ? x.chiDesc === addressDto.subDistrictCd : x.engDesc === addressDto.subDistrictCd) && x.superCode === _district.code);
                            if(_subDistrict) {
                                obj.subDistrictCd = isChi ? (_subDistrict.chiDesc || _subDistrict.engDesc) : _subDistrict.engDesc;
                                obj.subDistrictCode = _subDistrict.code;
                            }
                        }
                    }
                }
            }
        }
    }
    return obj;
}

/**
 * @description: when update ccCode, update the patient chinese name
 */
export function setChCode(ccCodeList, patientInfo, ccCodeChiChar) {
    let _patientInfo = _.cloneDeep(patientInfo);
    let _ccCodeChiChar = [...ccCodeChiChar];
    ccCodeList.forEach(item => {
        _patientInfo[`ccCode${item.index + 1}`] = item.code;
        _ccCodeChiChar[item.index] = '';

        for (let i = 5; i > item.index; i--) {
            _patientInfo[`ccCode${i + 1}`] = '';
            _ccCodeChiChar[i] = '';
        }
        _patientInfo.nameChi = _ccCodeChiChar.join('');
    });
    return { patientInfo: _patientInfo, ccCodeChiChar: _ccCodeChiChar };
}

/**
 * @description: when update ccCode, update the patient chinese name
 */
export function setChChineseName(patientInfo, ccCodeChiChar, charIndex, char) {
    let _patientInfo = _.cloneDeep(patientInfo);
    let _ccCodeChiChar = [...ccCodeChiChar];
    if (!char) {
        for (let i = 5; i >= charIndex; i--) {
            _patientInfo[`ccCode${i + 1}`] = '';
            _ccCodeChiChar[i] = '';
        }
    } else {
        _ccCodeChiChar[charIndex] = _patientInfo[`ccCode${charIndex + 1}`] ? char : '';
    }
    _patientInfo.nameChi = _ccCodeChiChar.join('');
    return { patientInfo: _patientInfo, ccCodeChiChar: _ccCodeChiChar };
}

/**
 * @description
 * @author Justin
 * @date 11/12/2020
 * @param {*} primaryDocTypeCd
 * @returns {Boolean}  {boolean}
 */
export function isShowBabyIcon(primaryDocTypeCd) {
    return primaryDocTypeCd === Enum.DOC_TYPE.BABY_WITHOUT_HKBC ||
        primaryDocTypeCd === Enum.DOC_TYPE.MOTHER_ID_OF_BABY ? true : false;
}

export function mapPmiWithProvenDocVal(patientInfo){
    //const login=getState(state=>state.login);

    const service = getState(state => state.login.service);
    const clinic = getState(state => state.login.clinic);
    const where = { serviceCd: service.svcCd, clinicCd: clinic.clinicCd};
    // let where = {};
    // const svcCd = login&&login.service&& login.service.serviceCd;
    // const siteId = login &&login.clinic&& login.clinic.siteId;
    // if (svcCd && siteId) {
    //     where = { serviceCd: svcCd, siteId };
    // }
    const clinicConfig=getState(state=>state.common.clinicConfig);
    const config = getPriorityConfig(Enum.CLINIC_CONFIGNAME.PMI_WITH_PROVEN_DOC_DEFAULT, clinicConfig, where);
    let patInfo=_.cloneDeep(patientInfo);
    if(config){
        if(config.configValue==='Y'){
            patInfo.idSts='N';
        }else if(config.configValue==='N'){
            patInfo.idSts='T';
        }
    }
    return patInfo;
}

export const familyNoTypeList = [
    { label: 'None', value: familyNoTypes.NONE },
    { label: 'NEW', value: familyNoTypes.NEW },
    { label: 'Existing', value: familyNoTypes.EXISTING }
];

export const initialServiceSpecificFormValues = {
    fthrEngSurname: '',
    fthrEngGivName: '',
    fthrChiName: '',
    fthrIdDocNum: '',
    docTypeCdFthr: '',
    mothrEngSurname: '',
    mothrEngGivName: '',
    mothrChiName: '',
    mothrIdDocNum: '',
    docTypeCdMothr: '',
    relationshipCd1: '',
    relationshipCd2: '',
    relationshipCd3: '',
    relationshipCd4: '',
    rlatName1: '',
    rlatName2: '',
    rlatName3: '',
    rlatName4: '',
    rfrName: '',
    rfrTitle: '',
    rfrDept: '',
    rfrHosp: '',
    rfrPhn: '',
    rfrDate: null,
    urgRoutine: '',
    siteId: '',
    frmSts: '',
    iniDate: null
};

export const otherRelatives = [1, 2, 3, 4];

export const referralDataStatusOptions = [
    { value: 'P', label: 'Public' },
    { value: 'G', label: 'Government Servant' },
    { value: 'H', label: 'Hospital Authority Staff' },
    { value: 'N', label: 'Non-eligible Persons' }
];

export const overrideReactSelectBgColor = (comDisabled) => {
    return {
        control: (styles) => ({
            ...styles,
            backgroundColor: comDisabled ? '#e0e0e0' : 'transparent',
            borderColor: 'hsl(0deg 0% 68%)'
        }),
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
        menu: (provided) => ({ ...provided, zIndex: 9999 })
    };
};

export const HKIDFormator = (val) => {
    if (val) {
        const HKID = val.replace('(', '').replace(')', '');
        const len = HKID.length;
        const result = HKID.substr(0, len - 1) + '(' + HKID.substr(len - 1) + ')';
        return result;
    }
};

export const formatHKID=(id)=> {
    const formattedID = id.replaceAll('(', '').replaceAll(')', '');
    const len = formattedID.length;
    return formattedID.substr(0, len - 1) + '(' + formattedID.substr(len - 1) + ')';
};

export const unformatHKID = (id) => {
    return id.replaceAll('(', '').replaceAll(')', '');
};

/**
 *
 * @param {array} patientList
 * @param {number} patientKey
 * @param {array} patientInfo
 * @param {number} pmiGrpId
 * @param {string} pmiGrpName
 * @returns {array}
 */
export const summaryPatientListGenerator = (patientList, patientKey, patientInfo, pmiGrpId, pmiGrpName) => {
    /**
     * If new patient is isChief, check previous reg patient
     * Then if previous reg patient is isChief
     * Set previous reg patient isChief: false
     */
    if (patientInfo.isChief) {
        patientList = patientList.map((data) => {
            if (data.isChief) data.isChief = false;
            return data;
        });
    }
    // Check duplicated patient while update patient, if exists -> remove old info from patientList
    const exists = patientList.filter((patient) => patientKey === patient.pmi);
    if (exists.length > 0) {
        const index = patientList.findIndex((patient) => patientKey === patient.pmi);
        patientList.splice(index, 1);
    }

    patientList.push({
        pmiGrpId: pmiGrpId || patientInfo.pmiGrpId,
        pmiGrpName: pmiGrpName || patientInfo.pmiGrpName,
        pmi: patientKey,
        isChief: patientInfo.isChief,
        primaryDocTypeCd: patientInfo.primaryDocTypeCd,
        primaryDocNo: patientInfo.primaryDocNo,
        engSurname: patientInfo.engSurname,
        engGivename: patientInfo.engGivename,
        allowSingleNameInput: patientInfo.allowSingleNameInput,
        nameChi: patientInfo.nameChi,
        exactDobCd: patientInfo.exactDobCd,
        dob: patientInfo.dob,
        genderCd: patientInfo.genderCd
    });
    return patientList;
};

export const exactDOBHandler = (exactDobCd) => {
    switch (exactDobCd) {
        case 'EMY':
            return 'Exact month, year';
        case 'EY':
            return 'Exact year';
        default:
            return 'Exact day, month, year';
    }
};

export const multiRegSummaryDataGridColumns = [
    {
        field: 'pmi',
        headerName: 'PMI',
        valueGetter: (params) => {
            return pad(params.data.pmi, 10);
        },
        flex: 1.5
    },
    { field: 'isChief', headerName: 'Chief Patient', cellRenderer: 'isChiefColumn', flex: 1 },
    { field: 'primaryDocTypeCd', headerName: 'Doc Type', flex: 1 },
    {
        field: 'primaryDocNo',
        headerName: 'Doc No.',
        flex: 1.5,
        valueFormatter: (params) => {
            if (params.data.primaryDocTypeCd === 'ID') return formatHKID(params.data.primaryDocNo);
            else return params.data.primaryDocNo;
        }
    },
    { field: 'engSurname', headerName: 'Surname', flex: 1 },
    { field: 'engGivename', headerName: 'Firstname', flex: 1 },
    { field: 'allowSingleNameInput', headerName: 'No Firstname', cellRenderer: 'singleNameColumn', flex: 1 },
    { field: 'nameChi', headerName: 'Chinese Name', flex: 1 },
    {
        field: 'exactDobCd',
        headerName: 'Exact Date Month Year',
        flex: 1.5,
        valueFormatter: (params) => {
            return exactDOBHandler(params.data.exactDobCd);
        }
    },
    {
        field: 'dob',
        headerName: 'Date of Birth',
        valueFormatter: (params) => {
            return moment(params.data.dob).format('DD-MM-YYYY');
        },
        flex: 1.5
    },
    { field: 'genderCd', headerName: 'Sex', flex: 1 }
];

export const checkIsValidPhoneNum = (phoneNum) => {
    return phoneNum.length === 8 && [2, 3, 5, 6, 7, 9].some((num) => phoneNum.startsWith(num));
};

export function showPatientFamilyNoExistsDialog(patientInfo, callback) {
    dispatch(
        openCommonMessage({
            msgCode: '131003',
            params: [
                { name: 'patientKey', value: patientInfo.cgsSpec.patientKey },
                { name: 'pmiGrpName', value: patientInfo.cgsSpec.pmiGrpName }
            ],
            btnActions: {
                btn1Click: () => callback && callback(true)
            }
        })
    );
}

export const structuredRegistrationScreeningInfoData = (rawData) => {
    const modeOfDelivery = rawData.docItems.find((item) => item.formItemId === 2022)?.itemVal;
    const gravida = rawData.docItems.find((item) => item.formItemId === 2023)?.itemVal;
    const attendedHealthTalkItemVal = rawData.docItems.find((item) => item.formItemId === 2024)?.itemVal;
    const thyroidDiseaseHistoryItemVal = rawData.docItems.find((item) => item.formItemId === 2025)?.itemVal;
    const remarks = rawData.docItems.find((item) => item.formItemId === 2126)?.itemVal;
    function getCheckBoxValues(itemVal) {
        if(itemVal) {
            const itemValArray = itemVal.split('-').filter(item => item);
            const optionsString = itemValArray[0];
            const checkboxOptions = [];

            for (let i=0; i<optionsString.length; i++) {
                if (optionsString[i] === '1' && i===0) {
                    checkboxOptions.push('mother');
                } else if (optionsString[i] === '2' && i===1) {
                    checkboxOptions.push('father');
                } else if (optionsString[i] === '3' && i===2) {
                    checkboxOptions.push('other');
                }
            }

            return {
                checkboxOptions,
                otherInput: itemValArray[1] ?? ''
            };
        }

        return {
            checkboxOptions: [],
            otherInput: ''
        };
    };

    const data = {
        docId: rawData.docId,
        patientKey: rawData.patientKey,
        msgCode: rawData.msgCode,
        modeOfDelivery: modeOfDelivery ?? '',
        gravida: gravida ?? '',
        attendedHealthTalk: getCheckBoxValues(attendedHealthTalkItemVal),
        thyroidDiseaseHistory: getCheckBoxValues(thyroidDiseaseHistoryItemVal),
        remarks: remarks ?? '',
        docItems: rawData.docItems
    };

    return data;
};

export const structuredRegistrationScreeningInfoPayload = (docId, patientKey, docItems, values) => {
    function getFormattedItemVal(checkBoxValues, otherInput) {
        const result = [0, 0, 0];

        for (const item of checkBoxValues) {
            if (item === 'mother') {
                result[0] = 1;
            } else if (item === 'father') {
                result[1] = 2;
            } else if (item === 'other') {
                result[2] = 3;
            }
        }

        const isAllZero = result.every(num => num === 0);

        if (isAllZero) return '';
        if (otherInput) return result.join('') + '-' + otherInput;
        return result.join('');
    }

    const user = getState(state => state.login.loginInfo.loginName);
    const docItemsClone = [...docItems];
    const formItemIdList = [2022, 2023, 2024, 2025, 2126];
    const newItemLookUp = {
        2022: {
            docId,
            patientKey,
            formItemId: 2022,
            itemVal: values?.deliveryMode?.value ?? '',
            opType: 'I',
            createBy: user
        },
        2023: {
            docId,
            patientKey,
            formItemId: 2023,
            itemVal: values?.gravida ?? '',
            opType: 'I',
            createBy: user
        },
        2024: {
            docId,
            patientKey,
            formItemId: 2024,
            itemVal: getFormattedItemVal(values?.attendHealthTalkMembers, values?.attendHealthTalkOtherInput) ?? '',
            opType: 'I',
            createBy: user
        },
        2025: {
            docId,
            patientKey,
            formItemId: 2025,
            itemVal: getFormattedItemVal(values?.thyroidDiseaseHistory, values?.thyroidDiseaseHistoryInput) ?? '',
            opType: 'I',
            createBy: user
        },
        2126: {
            docId,
            patientKey,
            formItemId: 2126,
            itemVal: values?.remarks ?? '',
            opType: 'I',
            createBy: user
        }
    };

    docItemsClone.forEach((item) => {
        if (item.formItemId === 2023) {
            item.itemVal = values?.gravida ?? '';
        } else if (item.formItemId === 2022) {
            item.itemVal = values?.deliveryMode?.value ?? '';
        } else if (item.formItemId === 2024) {
            item.itemVal = getFormattedItemVal(values?.attendHealthTalkMembers, values?.attendHealthTalkOtherInput) ?? '';
        } else if (item.formItemId === 2025) {
            item.itemVal = getFormattedItemVal(values?.thyroidDiseaseHistory, values?.thyroidDiseaseHistoryInput) ?? '';
        } else if (item.formItemId === 2126) {
            item.itemVal = values?.remarks ?? '';
        }
        item.opType = 'U';
        item.updateBy = user;
    });

    const newItemFormItemIds = formItemIdList.filter(id => (docItemsClone.findIndex(item => item.formItemId === id) === -1));
    newItemFormItemIds.forEach((id) => {
        const newItem = newItemLookUp[id];
        docItemsClone.push(newItem);
    });

    const payload = {
        docId,
        patientKey,
        docItems: docItemsClone
    };
    return payload;
};


export const registeredPatientListSampleData = [
    {
        pmiGrpId: 30000361,
        pmiGrpName: 'CG10361',
        pmi: 9002126289,
        isChief: false,
        primaryDocTypeCd: 'ID',
        primaryDocNo: 'X0245602',
        engSurname: 'AA',
        engGivename: 'AA',
        allowSingleNameInput: false,
        nameChi: '',
        exactDobCd: 'EMY',
        dob: '2021-09-01',
        genderCd: 'F'
    },
    {
        pmiGrpId: '',
        pmiGrpName: 'CG10361',
        pmi: 960212775,
        isChief: true,
        primaryDocTypeCd: 'ID',
        primaryDocNo: 'M7608743',
        engSurname: 'BB',
        engGivename: 'BB',
        allowSingleNameInput: false,
        nameChi: '',
        exactDobCd: 'EDMY',
        dob: '2021-09-10',
        genderCd: 'F'
    },
    {
        pmiGrpId: '',
        pmiGrpName: 'CG10361',
        pmi: 902212777,
        isChief: false,
        primaryDocTypeCd: 'ID',
        primaryDocNo: 'X5102192',
        engSurname: 'CC',
        engGivename: 'CC',
        allowSingleNameInput: false,
        nameChi: '',
        exactDobCd: 'EDMY',
        dob: '2021-09-10',
        genderCd: 'F'
    }
];

export const checkIfHasAddress = (address) => {
    if (address.addressFormat === 'L') {
        return address.block?.length > 0 || address.building?.length > 0 || address.buildingCsuId?.length > 0 || address.region?.length > 0 || address.districtCd?.length > 0 || address.estate?.length > 0 || address.floor?.length > 0 || address.room?.length > 0 || address.streetName?.length > 0 || address.streetNo?.length > 0 || address.subDistrictCd?.length > 0;
    } else if (address.addressFormat === 'F') {
        return address.addrTxt?.length > 0;
    } else if (address.addressFormat === 'P') {
        return address.postOfficeBoxNo?.length > 0 || address.postOfficeName?.length > 0 || address.postOfficeRegion?.length > 0;
    } else {
        return false;
    }
};
