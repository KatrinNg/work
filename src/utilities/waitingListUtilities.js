
import _ from 'lodash';
import moment from 'moment';
import * as CommonUtil from './commonUtilities';
import * as PatientUtil from './patientUtilities';
import Enum from '../enums/enum';
import {
    waitDetailBasic
} from '../constants/appointment/waitingList/waitingListConstants';
import {
    patientPhonesBasic
} from '../constants/registration/registrationConstants';

import FieldConstant from '../constants/fieldConstant';


function getPatientDto(waitData) {
    let patientDto = null;
    const patientKey = waitData.patientKey;
    if (patientKey > 0) {
        // patientDto = PatientUtil.transferPatientDocumentPair(record.patientDto);
        patientDto = waitData.patientDto;
        let priDocPair = PatientUtil.getPatientPrimaryDoc(patientDto.documentPairList);
        // let preferPhone = patientDto.phoneList ? patientDto.phoneList.find(item => item.phonePriority === 1) : null;
        let firstAvailPhone = patientDto.phoneList ? patientDto.phoneList[0] : null;
        patientDto.priDocTypeCd = priDocPair.docTypeCd;
        patientDto.priDocNo = priDocPair.docNo;
        patientDto.phnTypeCd = firstAvailPhone && firstAvailPhone.phoneTypeCd ? firstAvailPhone.phoneTypeCd : '';
        patientDto.cntctPhn = firstAvailPhone && firstAvailPhone.phoneNo ? firstAvailPhone.phoneNo : '';
        // patientDto.ctryCd = firstAvailPhone && firstAvailPhone.countryCd ? firstAvailPhone.countryCd : '';
        patientDto.areaCd = firstAvailPhone && firstAvailPhone.areaCd ? firstAvailPhone.areaCd : '';
        patientDto.dialingCd = firstAvailPhone && firstAvailPhone.dialingCd ? firstAvailPhone.dialingCd : '';
    } else {
        patientDto = waitData.anonymousPatientDto;
    }

    return patientDto;
}

function getFormatEngName(patientDto) {
    return CommonUtil.getFullName(patientDto.engSurname, patientDto.engGivename);
}

function getFormatDocType(patientDto, docTypeList) {
    let docType = docTypeList.find(item => item.code === patientDto.priDocTypeCd);
    if (!docType) {
        return patientDto.priDocTypeCd;
    } else {
        return docType.engDesc;
    }
}

function getFormatDocNo(patientDto) {
    // let p
    // let docNo=PatientUtil.getHkidFormat
    const isHKIDFormat = PatientUtil.isHKIDFormat(patientDto.priDocTypeCd);
    let docNo = patientDto.priDocNo || '';
    if (isHKIDFormat) {
        docNo = PatientUtil.getHkidFormat(docNo);
    }
    return docNo.trim();
}

function getCntCtPhn(patientDto, countryList) {
    let phone;
    if (patientDto.patientKey > 0) {
        phone = patientDto.phoneList ? patientDto.phoneList[0] : '';
    } else {
        const { dialingCd, areaCd, cntctPhn } = patientDto;
        phone = {
            dialingCd, areaCd, phoneNo: cntctPhn
        };
    }
    let formatPhone = CommonUtil.getFormatPhone(countryList, phone);
    return formatPhone;
}

function getClinic(siteId, clinicList) {
    let clinic = clinicList.find(item => item.siteId === siteId);
    return clinic ? clinic.siteEngName : siteId;
}

function getEncounter(encntrTypeId, encounterTypes) {
    if (encntrTypeId) {
        let encounter = encounterTypes.find(item => item.encntrTypeId === encntrTypeId);
        return encounter && encounter.encntrTypeDesc;
    } else {
        return '';
    }

}

function getStatusDesc(status) {
    let stsObj = Enum.WAITING_LIST_STATUS_LIST.find(item => item.value === status);
    return stsObj.label;
}

function getCancelDtm(record) {
    if (record.status === 'D') {
        return moment(record.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
    } else {
        return '';
    }
}

function getDepartureDate(departureDtm) {
    if (departureDtm) {
        return moment(departureDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
    } else {
        return null;
    }
}

// function transferCntryList(record){

// }

/**get column display value*/
// export function getFromatColumnValue(record, colName, targetList = null) {
//     const patientDto = getPatientDto(record);

//     if (colName === 'engName') {
//         let engName = getFormatEngName(patientDto);
//         return engName;
//     }
//     if (colName === 'docType') {
//         let docType = getFormatDocType(patientDto, targetList);
//         return docType;
//     }
//     if (colName === 'docNo') {
//         let docNo = getFormatDocNo(patientDto);
//         return docNo;
//     }
//     if (colName === 'phone') {
//         let cntctPhn = getCntCtPhn(patientDto);
//         return cntctPhn;
//     }
//     if (colName === 'clinic') {
//         let clinicName = getClinic(record.siteId, targetList);
//         return clinicName;
//     }
//     if (colName === 'encounter') {
//         let encounter = getEncounter(record.encntrTypeId, targetList);
//         return encounter;
//     }
//     if (colName === 'status') {
//         let stsDec = getStatusDesc(record);
//         return stsDec;
//     }
//     if (colName === 'Cancellation Date') {
//         if (record.status === '2') {
//             return moment(record.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
//         } else {
//             return '';
//         }
//     }

// }

/**transfer response data to waitData and contactPhone*/
export function transferWaitData(waitData) {
    const patientDto = getPatientDto(waitData);
    let _waitData = _.cloneDeep(waitDetailBasic);
    let contactPhone = _.cloneDeep(patientPhonesBasic);
    let patientDtoVer = patientDto.version;
    let waitDataVer = _.cloneDeep(waitData.version);
    // _waitData.waitVer=
    waitData = {
        ...waitData,
        ...patientDto
    };
    for (let f in _waitData) {
        _waitData[f] = waitData[f];
    }
    // let _waitData = {
    //     ...waitData,
    //     ...patientDto
    // };
    contactPhone.phoneTypeCd = patientDto.phnTypeCd || Enum.PHONE_TYPE_MOBILE_PHONE;
    contactPhone.phoneNo = patientDto.cntctPhn;
    contactPhone.areaCd = patientDto.areaCd || '';
    // contactPhone.countryCd = patientDto.ctryCd || FieldConstant.COUNTRY_CODE_DEFAULT_VALUE;
    contactPhone.dialingCd = patientDto.dialingCd;
    _waitData.patientDtoVer = patientDtoVer;
    _waitData.waitDataVer = waitDataVer;
    _waitData.waitListId = waitData.waitListId;
    _waitData.cntryCdList = waitData.cntryCdList ? waitData.cntryCdList.split('|').map(item => +item) : [];
    if (waitData.travelDtm) { _waitData.travelDate = waitData.travelDtm; }
    return { waitDetail: _waitData, contactPhone };
}


export function sortWaitList(list) {
    let waitList = _.cloneDeep(list);
    waitList.sort((a, b) => {
        let momentAStr = moment(a.createDtm).format(Enum.DATE_FORMAT_24_HOUR);
        let momentBStr = moment(b.createDtm).format(Enum.DATE_FORMAT_24_HOUR);
        if (moment(momentAStr).isBefore(moment(momentBStr))) {
            return -1;
        } else if (moment(momentAStr).isAfter(moment(momentBStr))) {
            return 1;
        }
        else {
            // return 0;
            let aPat = getPatientDto(a);
            let bPat = getPatientDto(b);
            if (!aPat.engSurname) {
                return 1;
            }
            if (!bPat.engSurname) {
                return -1;
            }
            else {
                return aPat.engSurname.localeCompare(bPat.engSurname);
            }
        }
    });
    return waitList;
}

export function loadWaitList(list, docTypeList, clinicList, encounterTypes, countryList) {
    let waitList = [];
    // let patientDto = getPatientDto(list);
    list.forEach(el => {
        let waitData = _.cloneDeep(el);
        let patientDto = getPatientDto(el);
        waitData.engFullName = getFormatEngName(patientDto);
        waitData.docType = getFormatDocType(patientDto, docTypeList);
        waitData.docNo = getFormatDocNo(patientDto);
        waitData.phone = getCntCtPhn(patientDto, countryList);
        waitData.clinicDesc = getClinic(el.siteId, clinicList);
        waitData.encntrTypeDesc = getEncounter(el.encntrTypeId, encounterTypes);
        waitData.statusDesc = getStatusDesc(el.status);
        waitData.cancelDtm = getCancelDtm(el);
        waitData.departureDtm = getDepartureDate(el.travelDtm);
        waitList.push(waitData);
    });

    // waitList=sortWaitList(waitList);
    return waitList;
}