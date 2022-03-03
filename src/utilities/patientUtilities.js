import _ from 'lodash';
import Enum, { EHS_CONSTANT } from '../enums/enum';
import storeConfig from '../store/storeConfig';
import * as caseNoUtilities from './caseNoUtilities';
import * as CommonUtil from './commonUtilities';
import {
    mapPatientQueueList
} from './apiMappers';
import { getSMSMoblieIdx } from './registrationUtilities';
import * as RegUtil from '../utilities/registrationUtilities';
import * as UserUtil from '../utilities/userUtilities';
import * as BookingEnum from '../enums/appointment/booking/bookingEnum';
import ContactInformationEnum from '../enums/registration/contactInformationEnum';
import { dispatch, getState } from '../store/util';
import {
    getPatientEncounter,
    getLatestPatientEncntrCase,
    resetAll
} from '../store/actions/patient/patientAction';
import {
    checkPatientUnderCare
} from '../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import {
    changeTabsActive,
    deleteSubTabs,
    deleteTabs,
    skipTab,
    updateField
} from '../store/actions/mainFrame/mainFrameAction';
import { resetAll as resetAnSvcIdInfo } from '../store/actions/anServiceID/anServiceID';
import accessRightEnum from 'enums/accessRightEnum';
import doCloseFuncSrc from '../constants/doCloseFuncSrc';
import * as moment from 'moment';

export function getCleanHKIC(value) {
    if (value) {
        return value.replace('(', '').replace(')', '').trim();
    }
    return value;
}

export function isHKIDFormat(docTypeCd) {
    // return docTypeCd === Enum.DOC_TYPE.HKID_ID ||
    //     docTypeCd === Enum.DOC_TYPE.BIRTH_CERTIFICATE_HK ||
    //     docTypeCd === Enum.DOC_TYPE.EXEMPTION_CERTIFICATE ||
    //     docTypeCd === Enum.DOC_TYPE.RECONGIZANCE;
    return docTypeCd === Enum.DOC_TYPE.HKID_ID || docTypeCd === Enum.DOC_TYPE.BIRTH_CERTIFICATE_HK;
}

export function getHkidFormat(hkid) {
    if (hkid && hkid.indexOf('(') === -1 && hkid.indexOf(')') === -1) {
        const hkidPre = hkid.substring(0, hkid.length - 1);
        const hkidNum = hkid.substring(hkid.length - 1);
        return hkidPre + '(' + hkidNum + ')';
    }
    return hkid;
}

export function getOtherDocNoFormat(otherDocNo, docTypeCd) {
    if (otherDocNo && docTypeCd) {
        return `${otherDocNo}`;
    }
    return otherDocNo;
}

/**
 * get primary doc dto from documentPairs
 * @method getPatientPrimaryDoc
 * @author Justin Long
 * @param {Array} [documentPairList = []] documentPairList
 * @returns {Object}
 */
export function getPatientPrimaryDoc(documentPairList = []) {
    return documentPairList.find(item => parseInt(item.isPrimary) === 1);
}

/**
 * get additional doc dto from documentPairs
 * @method getPatientAdditionalDoc
 * @author Justin Long
 * @param {Array} [documentPairList = []] documentPairList
 * @returns {Object}
 */
export function getPatientAdditionalDoc(documentPairList = []) {
    return documentPairList.find(item => parseInt(item.isPrimary) !== 1);
}

/**
 * Judge whether a patient is problem
 * @method isProblemPMI
 * @author Justin Long
 * @param {Array} [documentPairList = []] documentPairList
 * @returns {Boolean}
 */
export function isProblemPMI(documentPairList = []) {
    if (documentPairList.length === 0) {
        return false;
    } else {
        let primaryDoc = getPatientPrimaryDoc(documentPairList);
        if (primaryDoc) {
            return parseInt(primaryDoc.isProblem) === 1;
        } else {
            return false;
        }
    }
}

/**
 * Judge whether a patient's primary docType is unique
 * @method isPrimaryDocTypeUnique
 * @author Justin Long
 * @param {Array} [documentPairList = []] documentPairList
 * @param {Array} [docTypeCodeList = []] docTypeCodeList
 * @returns {Boolean}
 */
export function isPrimaryDocTypeUnique(documentPairList = [], docTypeCodeList = []) {
    const primaryDoc = getPatientPrimaryDoc(documentPairList);
    if (primaryDoc) {
        const docType = docTypeCodeList.find(item => item.code === primaryDoc.docTypeCd);
        if (docType) {
            return parseInt(docType.superCode) === 1;
        }
    }
    return false;
}

/**
 * get format document number
 * @method getFormatDocNoByDocumentPair
 * @author Justin Long
 * @param {Object} [documentPair=null] documentPair
 * @returns {String}
 */
export function getFormatDocNoByDocumentPair(documentPair = null) {
    if (documentPair) {
        if (isHKIDFormat(documentPair.docTypeCd)) {
            return getHkidFormat(documentPair.docNo.trim());
        } else {
            return getOtherDocNoFormat(documentPair.docNo, documentPair.docTypeCd);
        }
    }
    return '';
}

/**
 * sort phone by phonePriority and phoneId
 * @method sortPatientPhone
 * @author JustinLong
 * @param {Array} phoneList
 * updated by Irving Wu at 2020-06-12.
 */
export function sortPatientPhone(phoneList = []) {
    // phoneList.sort((a, b) => {
    //     return (a.phoneId || 0) - (b.phoneId || 0);
    // }).sort((a, b) => {
    //     return (b.phonePriority || 0) - (a.phonePriority || 0);
    // });
    let _phoneList = _.cloneDeep(phoneList);
    let result = [];
    let smsMobileIdx = getSMSMoblieIdx(phoneList);
    if (smsMobileIdx > -1) {
        let smsMobile = _phoneList[smsMobileIdx];
        _phoneList.splice(smsMobileIdx, 1);
        let noneSmsMoblieList = CommonUtil.sortByDtm(_phoneList, 'createDtm');
        result = [smsMobile, ...noneSmsMoblieList];
    } else {
        result = CommonUtil.sortByDtm(_phoneList, 'createDtm');
    }
    return result;
}

/**
 * init search result
 * @method getPatientSearchResult
 * @author Justin Long
 * @param {Array} data patientList for searchPatient api
 * @param {Array} countryList countryList from commonData
 * @returns {Array}
 */
export function getPatientSearchResult(data, countryList) {
    let result = [];
    if (!data) return result;
    for (let i = 0; i < data.length; i++) {
        const patient = data[i];
        let temp = _.cloneDeep(data[i]);
        const primaryDoc = getPatientPrimaryDoc(patient.documentPairList);
        const additionalDoc = getPatientAdditionalDoc(patient.documentPairList);
        temp.phoneList = sortPatientPhone(temp.phoneList);
        if (primaryDoc) {
            temp.hkidOrDocno = getFormatDocNoByDocumentPair(primaryDoc);
            temp.docTypeCd=primaryDoc.docTypeCd;
        } else {
            if (additionalDoc) {
                temp.hkidOrDocno = getFormatDocNoByDocumentPair(additionalDoc);
                temp.docTypeCd=additionalDoc.docTypeCd;
            }
        }
        temp.engFullName = CommonUtil.getFullName(patient.engSurname, patient.engGivename);
        const mainPhone = CommonUtil.getPatientMainPhone(patient.phoneList);
        if (mainPhone) {
            temp.phoneAndCountry = CommonUtil.getFormatPhone(countryList, mainPhone);
        } else {
            temp.phoneAndCountry = '';
        }
        result.push(temp);
    }
    return result;
}

/**
 * get patient primary docno or additional docno
 * @method getPatientAnyDocNo
 * @author Justin Long
 * @param {Object} patient
 */
export function getPatientAnyDocNo(patient) {
    let hkidOrDocNo = '';
    if (patient) {
        const primaryDoc = getPatientPrimaryDoc(patient.documentPairList);
        const additionalDoc = getPatientAdditionalDoc(patient.documentPairList);
        if (primaryDoc) {
            hkidOrDocNo = getFormatDocNoByDocumentPair(primaryDoc);
        } else {
            if (additionalDoc) {
                hkidOrDocNo = getFormatDocNoByDocumentPair(additionalDoc);
            }
        }
    }
    return hkidOrDocNo;
}

export function filterPatientList(inputData, filterCondition,countryList) {
    let data = _.cloneDeep(inputData);
    let result = {};
    result.patientQueueDtos = [];
    if (data && data.patientQueueDtos) {
        const store = storeConfig.store.getState();
        const clinicList = store && store.common.clinicList;
        let remappedData = mapPatientQueueList(data, clinicList);

        for (let i = 0; i < remappedData.patientQueueDtos.length; i++) {
            let dto = {};
            const queueDto = remappedData.patientQueueDtos[i];
            if (queueDto.patientDto) {
                const patient = queueDto.patientDto;
                dto.name = CommonUtil.getFullName(patient.engSurname, patient.engGivename);
                dto.hkic = getPatientAnyDocNo(patient);
                dto.discNo = patient.discNo || '';
                dto.age = `${patient.age || ''}${patient.ageUnit ? patient.ageUnit[0] || '' : ''}`;
                dto.genderCd = patient.genderCd || '';
                dto.nameChi = patient.nameChi || '';
                dto.docTypeCd = patient.primaryDocTypeCd || '';
                dto.dob = patient.dob ? RegUtil.getDobDateByFormat(patient.exactDobCd, patient.dob) : '';
                dto.engSurname = patient.engSurname || '';
                dto.engGivename = patient.engGivename || '';
                // dto.phoneNo = patient.phoneNo || '';
                dto.phoneNo= patient.phoneNo?CommonUtil.getFormatPhone(countryList,patient.phoneList[0]):'';
                dto.deadInd = patient.deadInd || '';
                dto.exactDobCd = patient.exactDobCd || '';
                dto.pmiGrpName = patient?.cgsSpecOut?.pmiGrpName || '';
            }
            dto.patientKey = queueDto.patientKey || '';// some issues if patientKey == 0
            dto.appointmentId = queueDto.appointmentId || '';
            dto.appointmentTime = `${queueDto.appointmentDate || ''} ${queueDto.appointmentTime || ''}`;
            dto.appointmentDate = queueDto.appointmentDate;
            //dto.arrivalTime = `${queueDto.arrivalDate || ''} ${queueDto.arrivalTime || ''}`;
            dto.arrivalTime = queueDto.attnTime || '';
            dto.encounterType = queueDto.encounterType || '';
            dto.subEncounterType = queueDto.subEncounterType || '';
            dto.status = queueDto.attnStatus || '';
            dto.encounterTypeCd = queueDto.encounterTypeCd || '';
            dto.encounterTypeId = queueDto.appointmentDto.encounterTypeId || '';
            dto.subEncounterTypeCd = queueDto.subEncounterTypeCd || '';
            dto.statusCd = queueDto.attnStatusCd || '';
            dto.remark = queueDto.remark || '';
            dto.version = queueDto.version || '';
            dto.discNo = queueDto.discNumber || '';
            dto.caseNo = queueDto.caseNo || '';
            dto.alias=queueDto.alias||'';
            dto.encntrGrpCd=queueDto.encntrGrpCd||'';
            dto.encounterDto = queueDto.encounterDto || null;
            dto.memo = queueDto.remark || '';
            dto.remarkId = queueDto.remarkId || '';
            dto.apptTime = queueDto.appointmentTime || '';
            dto.isAtndCancel=queueDto.isAtndCancel||'';
            //condition filter
            if (
                (!filterCondition.attnStatusCd || dto.statusCd === filterCondition.attnStatusCd)
                && (!filterCondition.encounterTypeCd || dto.encounterTypeCd === filterCondition.encounterTypeCd)
                && (!filterCondition.subEncounterTypeCd || dto.subEncounterTypeCd === filterCondition.subEncounterTypeCd)
                && (!filterCondition.hkic || dto.hkic === filterCondition.hkic)
            ) {
                result.patientQueueDtos.push(dto);
            }
        }
    }
    return result;
}

export function get_PatientList_TableRow_ByServiceCd(actionRender, statusRender) {
    let caseNoRender = (value) => {
        return caseNoUtilities.getFormatCaseNo(value);
    };
    let rows = [
        { name: 'hkic', label: 'HKIC/Doc No', width: 100 },
        { name: 'caseNo', label: 'Case No', width: 40, customBodyRender: caseNoRender },
        { name: 'name', label: 'Name', width: 80 },
        { name: 'encounterTypeCd', label: 'Encounter', width: 80 },
        { name: 'subEncounterTypeCd', label: 'Sub Encounter', width: 80 },
        { name: 'appointmentTime', label: 'Appointment Time', width: 100 },
        { name: 'attnTime', label: 'Arrival Time', width: 100 },
        { name: 'phoneNo', label: 'Phone', width: 60 },
        { name: 'discNo', label: 'Disc No', width: 40 },
        { name: 'attnStatus', label: 'Attn.', width: 80, customBodyRender: statusRender },
        { name: 'action', label: '', width: 110, align: 'center', customBodyRender: actionRender }
    ];

    const store = storeConfig.store.getState();
    const listConfig = store && store['common']['listConfig'];
    if (listConfig && listConfig.PATIENT_LIST) {
        const list = listConfig.PATIENT_LIST.sort(function (a, b) {
            return a.displayOrder - b.displayOrder;
        });
        rows = [];
        for (let i = 0; i < list.length; i++) {
            let newRow = {
                name: list[i]['labelCd'],
                label: list[i]['labelName'],
                width: list[i]['labelLength'],
                split: list[i]['site'] === '1'
            };
            if (list[i].labelCd === 'status') {
                newRow.customBodyRender = statusRender;
            }
            else if (list[i].labelCd === 'caseNo') {
                newRow.customBodyRender = caseNoRender;
            }
            rows.push(newRow);
        }
        rows.push({ name: 'action', label: '', width: 110, align: 'center', customBodyRender: actionRender });
    }
    return rows;
}

export function getPatientDocumentPair(patientInfo) {
    if (patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.length > 0) {
        const primaryDocPair = patientInfo.documentPairList.find(item => item.isPrimary === 1);
        const additionalDocPair = patientInfo.documentPairList.find(item => item.isPrimary === 0);
        return { primaryDocPair, additionalDocPair };
    }
    return null;
}

export function transferPatientDocumentPair(patientInfo) {
    if (patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.length > 0) {
        //old, will be abandon
        const hkidDto = patientInfo.documentPairList.find(item => item.docTypeCd === Enum.DOC_TYPE.HKID_ID);
        const otherDocDto = patientInfo.documentPairList.find(item => item.docTypeCd !== Enum.DOC_TYPE.HKID_ID);
        patientInfo.hkid = hkidDto && hkidDto.docNo.trim();
        patientInfo.docTypeCd = otherDocDto ? otherDocDto.docTypeCd : '';
        patientInfo.otherDocNo = otherDocDto ? otherDocDto.docNo : '';

        //in sprint 17 document pairs has primary set and additional set.
        const documentPair = getPatientDocumentPair(patientInfo);
        if (documentPair) {
            const { primaryDocPair, additionalDocPair } = documentPair;
            //primary doc. pair transfer
            patientInfo.primaryDocTypeCd = primaryDocPair ? primaryDocPair.docTypeCd : '';
            patientInfo.priIssueCountryCd = primaryDocPair && primaryDocPair.issueCountryCd ? primaryDocPair.issueCountryCd : '';
            patientInfo.primaryDocNo = getFormatDocNoByDocumentPair(primaryDocPair);

            //additional doc. pair transfer
            patientInfo.additionalDocTypeCd = additionalDocPair ? additionalDocPair.docTypeCd : '';
            patientInfo.additionalDocNo = additionalDocPair ? additionalDocPair.docNo : '';
            patientInfo.addlIssueCountryCd = additionalDocPair && additionalDocPair.issueCountryCd ? additionalDocPair.issueCountryCd : '';
        }
    }
    return patientInfo;
}



/**
 * sort patient contactPerson phone by contactPhoneId
 * @method sortContactPersonPhone
 * @author JustinLong
 * @param {Array} phoneList
 */
export function sortContactPersonPhone(phoneList = []) {
    phoneList.sort((a, b) => {
        return (a.contactPhoneId || 0) - (b.contactPhoneId || 0);
    });
    return phoneList;
}

/**
 * init the patient phone and contactperson phone
 * @method initPatientPhoneSort
 * @author JustinLong
 * @param {Object} patient
 * @returns return a sorted phone of patient
 */
export function initPatientPhoneSort(patient) {
    if (patient) {
        if (patient.phoneList) {
            patient.phoneList = sortPatientPhone(patient.phoneList);
        }
        if (patient.contactPersonList) {
            patient.contactPersonList.forEach(item => {
                if (item.contactPhoneList) {
                    item.contactPhoneList = sortContactPersonPhone(item.contactPhoneList);
                }
            });
        }
    }
    return patient;
}

export function getFormatDHPMINO(patientKey, idSts) {
    if (patientKey) {
        if(_.parseInt(patientKey) < 0) return patientKey;
        patientKey = _.toString(patientKey);
        if (patientKey !== '0') {
            patientKey = `0000000000${patientKey}`.slice(-10);
            if (idSts === 'T') {
                patientKey = `T${patientKey}`;
            }
            return patientKey;
        }
        else {
            return patientKey;
        }
    }
    return null;
}

export function getPmiNPatientName(patientKey, idSts, patientEngSurname, patientEngGivename, patientNameChi) {
    if (patientKey == null || idSts == null) {
        return '';
    }
    let displayEngSurname = patientEngSurname != null ? patientEngSurname : '';
    let displayEngGivename = patientEngGivename != null ? patientEngGivename : '';
    let displayChiName = patientNameChi != null ? patientNameChi : '';
    // e.g (PMI - patientEngSurname patientEngGivename patientNameChi )
    const result = getFormatDHPMINO(patientKey, idSts) + ' - ' + displayEngSurname + ' ' + displayEngGivename + ' ' + displayChiName;

    return result;
}

/** searchType is doc type*/
export function searchTypeIsDocType(patSearchTypeCd, searchType) {
    let type = patSearchTypeCd.find(item => item.searchTypeCd === searchType);
    if (type) {
        return type.isDocType === 1;
    } else {
        return false;
    }
}

export function loadPatientAddress(address, region, district, subDistrict, addrFormat, type) {
    let addressArr = [];
    // let addressStr='';
    if (addrFormat === ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS) {
        if (address.room) {
            addressArr.push(address.room);
        }
        if (address.floor) {
            addressArr.push(address.floor);
        }
        if (address.block) {
            addressArr.push(address.block);
        }
        if (address.building) {
            addressArr.push(address.building);
        }
        if (address.estate) {
            addressArr.push(address.estate);
        }
        if (address.streetNo) {
            addressArr.push(address.streetNo);
        }
        if (address.streetName) {
            addressArr.push(address.streetName);
        }
        if (type === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
            if (subDistrict && subDistrict.engDesc) {
                addressArr.push(subDistrict.engDesc);
            }
            if (district && district.engDesc) {
                addressArr.push(district.engDesc);
            }
            if (region && region.engDesc) {
                addressArr.push(region.engDesc);
            }
        } else {
            if (subDistrict && subDistrict.chiDesc) {
                addressArr.push(subDistrict.chiDesc);
            }
            if (district && district.chiDesc) {
                addressArr.push(district.chiDesc);
            }
            if (region && region.chiDesc) {
                addressArr.push(region.chiDesc);
            }
        }
    } else {
        if (address.postOfficeBoxNo) {
            addressArr.push(address.postOfficeBoxNo);
        }
        if (address.postOfficeName) {
            addressArr.push(address.postOfficeName);
        }
        if (address.postOfficeRegion) {
            addressArr.push(address.postOfficeRegion);
        }
    }
    return addressArr;
}

export function isOverseasDocType(docTypeCd){
    return docTypeCd === Enum.DOC_TYPE.TRAVEL_DOCUMENTS_OVERSEAS;
}

export function isArrivalAppt(statusCd, arrivalTime) {
    return statusCd === 'N' && arrivalTime ? true : false;
}

export function isNotAttendAppt(statusCd, arrivalTime) {
    return statusCd === 'N' && !arrivalTime ? true : false||statusCd==='C';
}

export function isAttendAppt(statusCd) {
    return statusCd === 'Y';
}

/**
 * @description Patient List filter Attendance/Not Attendance/Arrival appointment/Cancelled appointment
 * @author Justin
 * @date 11/12/2020
 * @export
 * @param {*} statusCd
 * @param {*} arrivalTime
 * @param {*} attnStatusCd
 * @returns {}  {boolean}
 * @augments
 */
export function isAttnStatusRight(statusCd, arrivalTime, attnStatusCd) {
    if (attnStatusCd === 'A') {
        // Arrived
        return isArrivalAppt(statusCd, arrivalTime);
    } else if (attnStatusCd === 'N') {
        // Not Attend
        return isNotAttendAppt(statusCd, arrivalTime);
    } else if (attnStatusCd === 'Y') {
        // Attend
        return isAttendAppt(statusCd);
    } else {
        // All
        return true;
    }
}


export function maskHKID(value,digit){
    if (value == null || digit == null) {
        return null;
    }
    // char[] values = value.toCharArray();
    // int length = digit.length() > value.length() ? value.length() : digit.length();
    let values=value.split('');
    if(values.length===8){
        values.unshift(' ');
    }
    const length=digit.length>values.length?values.length:digit.length;
    for (let i = 0; i < length; i++) {
        if ('1' === digit[i]) {
            values[i] = 'X';
            // values.splice(i,1,'X');
        }
    }
    return values.join('').trim();
}

export function handleMaskHKID(patientInfo,login){
    const HKIDFormat=isHKIDFormat(patientInfo.primaryDocTypeCd);
    let priDocNo=_.clone(patientInfo.primaryDocNo);
    const where1 = { serviceCd: login.service.serviceCd, clinicCd: login.clinic.siteId};
    const clinicConfig=getState(state=>state.common.siteParams);
    const config = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.HKID_MASKING_DIGITS, clinicConfig, where1);
    if(HKIDFormat){
        priDocNo=priDocNo.replace('(', '').replace(')', '');
        priDocNo=maskHKID(priDocNo,config.paramValue);
    }
    return priDocNo;
}

export function getCurAntSvcInfo(){
    const patientInfo=getState(state=>state.patient.patientInfo);
    let antSvcInfo=null;
    if(patientInfo){
        antSvcInfo=patientInfo.antSvcInfo||null;
    }
    return antSvcInfo;
}

export const bannerBgColorHandler = (bannerItem) => {
    const { bgColor, functionName } = bannerItem;
    switch (functionName) {
        case 'pso':
            return '#B5EAD7';
        case 'go':
            return '#FF9AA2';
        default:
            return bgColor;
    }
};

export const bannerColorHandler = (displayValue) => {
    switch (displayValue) {
        case 'Reminder':
        case 'PSO':
            return 'error';
        default:
            return null;
    }
};

export const getOtherDesc = (docTypeCd) => {
    const store = storeConfig.store.getState();
    const docTypeInfo = store && store['common']['commonCodeList']['doc_type'];
    let docTypeCdDesc = '';
    docTypeInfo.map(item => {
        if(item.code === docTypeCd){
          docTypeCdDesc = item.otherDesc3 != undefined && item.otherDesc3 !== null? item.otherDesc3 : docTypeCdDesc;
        }
    });
    return docTypeCdDesc;
};

export const isApplyEhsMember = (ehsMbrSts) => {
    return ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS || ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS_WAITING || ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS_TRANSFER;
};

export const getEhsMemberStatusDesc = (ehsMbrSts, siteId, isFrozen) => {
    const clinicList = getState(state => state.common.clinicList);

    const siteDesc = clinicList?.find((x) => x.siteId === siteId)?.siteDesc;

    if(ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS) {
        return `${isFrozen === 1 ? '(Frozen) ' : ''}Member${siteDesc ? ` at ${siteDesc}` : ''}`;
    } else if (ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS_WAITING) {
        return `${isFrozen === 1 ? '(Frozen) ' : ''}Waiting${siteDesc ? ` at ${siteDesc}` : ''}`;
    } else if (ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS_TRANSFER) {
        return 'Transfer';
    } else if (ehsMbrSts === EHS_CONSTANT.MEMBER_STATUS_CANCEL) {
        return 'Application cancelled';
    } else if (ehsMbrSts === EHS_CONSTANT.NON_MEMBER_STATUS) {
        return 'Non-member';
    } else if (!ehsMbrSts) {
        return 'Unknown';
    }
};

export const hasEhsPhn = (index) => {
    const { patientEhsDto } = getState((state) => state.registration.patientBaseInfo);

    if (patientEhsDto) {
        return patientEhsDto[`phn${index}`] !== '' && patientEhsDto[`phn${index}IsDeleted`] === 0;
    } else {
        return false;
    }
};

export const relationshipDataRecordGenerator = (cgsSpecOut) => {
    const { mothrEngGivName, mothrEngSurname, fthrEngGivName, fthrEngSurname } = cgsSpecOut;

    const mothrDataExist = mothrEngGivName || mothrEngSurname;

    const fthrDataExist = fthrEngGivName || fthrEngSurname;

    if (mothrDataExist && fthrDataExist)
        return [
            {
                name: `${fthrEngSurname?.toUpperCase() || ''} ${fthrEngGivName?.toUpperCase() || ''}`,
                relationship: 'Father'
            },
            {
                name: `${mothrEngSurname?.toUpperCase() || ''} ${mothrEngGivName?.toUpperCase() || ''}`,
                relationship: 'Mother'
            }
        ];
    else if (mothrDataExist)
        return [
            {
                name: `${mothrEngSurname?.toUpperCase() || ''} ${mothrEngGivName?.toUpperCase() || ''}`,
                relationship: 'Mother'
            }
        ];
    else if (fthrDataExist)
        return [
            {
                name: `${fthrEngSurname?.toUpperCase() || ''} ${fthrEngGivName?.toUpperCase() || ''}`,
                relationship: 'Father'
            }
        ];
    else return [];
};

export const isTempPatient = (idSts = '') => {
    return idSts === 'T';
};

export const nextPatient = (isGO = false) => {
    return new Promise((resolve) => {
        const subTabs = getState(state => state.mainFrame.subTabs);
        let tabList = _.cloneDeep(subTabs);
        let delFunc = (deep, name) => {
            if (parseInt(deep) === 2) {
                dispatch(deleteSubTabs(name));
            } else if (parseInt(deep) === 1) {
                dispatch(deleteTabs(name));
            }
        };
        dispatch(updateField({
            curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
        }));
        CommonUtil.closeAllTabs(tabList, delFunc, changeTabsActive, doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON).then(result => {
            if (result) {
                if (isGO) {
                    // this.goAction();
                }
                else {
                    nextPatientCallback();
                }
                resolve(true);
            }
            dispatch(updateField({
                curCloseTabMethodType: null
            }));
        });
    });
};

const nextPatientCallback = () => {
    dispatch(resetAll());
    dispatch(resetAnSvcIdInfo());
    // this.handleDefaultAttnStatus();
};

export const switchPatient = async ({ patient, needPUC = true, dest, callback }) => {
    // console.log('[PUC] patient', patient, 'PUC', needPUC);
    const patientInfo = getState(state => state.patient.patientInfo);
    const switchable = !patientInfo || patientInfo.patientKey != patient.patientKey;
    if (switchable) {
        if (patientInfo && patientInfo.patientKey != patient.patientKey) {
            // console.log('[PUC] diff patient', patientInfo.patientKey, patient.patientKey);
            await nextPatient();
        }
        dispatch(checkPatientUnderCare(
            (selectedPatient, pucChecking) => {
                pucPass(selectedPatient, pucChecking, dest, callback);
            },
            () => {
                pucCancel();
            },
            patient,
            { patientUnderCareVersion: 1 }
        ));
    }
    else {
        // same patient
    }
};

export const setLanding = (landing, value, replaceExist = false) => {
    //const {code,param}
    if (landing && !replaceExist) {
        // console.log('[PUC] landing exist and not force replace');
        return landing;
    }
    // console.log('[PUC] set landing', landing);
    landing = { ...value };
    return landing;
};

export const gotoSummary = (landing) => {
    // if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER)
    //     this.skipToPatientSummary({ patientKey });
    // else
    //     this.skipToEncounterSummary({ patientKey });

    const loginInfo = getState(state => state.login.loginInfo);
    const pucChecking = getState(state => state.patient.pucChecking);
    // console.log('[PUC] gotoSummary, landing', this.landing);
    if (landing != null)
        return landing;

    let dest;
    if (UserUtil.isPucHandle(loginInfo, pucChecking)) {
        dest = accessRightEnum.patientSummary;
    }
    else {
        // if (this.props.login.accessRights.find(item => item.name === accessRightEnum.openESAfterSelectedPatient)) {
        //     dest = accessRightEnum.encounterSummary;
        // }
        // else {
        if (UserUtil.isClinicalBaseRole(loginInfo.userDto))
            dest = accessRightEnum.encounterSummary;
        else
            dest = accessRightEnum.patientSummary;
        // }
    }
    // console.log('[PUC] gotoSummary', patientKey, dest);

    if (dest)
        landing = setLanding(landing, { code: dest });

    return landing;
};

export const gotoLanding = (landing) => {
    // console.log('[PUC] gotoLanding', landing);
    if (landing) {
        dispatch(skipTab(landing.code, landing.params));
        // landing = null;
    }
};

const pucPass = (patient, pucChecking, dest = null, callback) => {
    // const { pucChecking } = this.props;
    // console.log('[PUC] pucPass', pucChecking, dest);
    const serviceCd =  getState(state => state.login.service.serviceCd);
    let landing = null;
    if (patient.appointmentId) {
        dispatch(getPatientEncounter(patient.appointmentId, callback));
    } else {
        if (typeof callback === 'function')
            callback();
    }
    if (dest)
        landing = setLanding(landing, { code: dest });
    if (pucChecking) {
        if (pucChecking.pucResult === 100 || pucChecking.pucResult === 101)
            landing = landing || setLanding(landing, { code: accessRightEnum.patientSummary });
        else if (pucChecking.pucResult === 0)
            landing = landing || gotoSummary(landing);
    }
    if (serviceCd === 'SHS') {
        dispatch(getLatestPatientEncntrCase({
            patientKey: patient.patientKey,
            sspecID: BookingEnum.SHS_APPOINTMENT_GROUP.SKIN_GRP
        }));
    }
    gotoLanding(landing);
};

const pucCancel = () => {
    // console.log('[PUC] pucCancel');
    // this.handleRetainDocType();
    // this.props.updatePatientListField({ isFocusSearchInput: true });
};

export const ageCalculator = (dob, format, age) => {
    return moment().diff(moment(dob, format), 'years') >= age;
};