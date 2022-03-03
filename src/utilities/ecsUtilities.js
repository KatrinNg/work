import accessRightEnum from '../enums/accessRightEnum';
import * as PatientUtil from './patientUtilities';
import * as commonUtilities from './commonUtilities';
import * as RegUtil from './registrationUtilities';
import Enum from '../enums/enum';
import moment from 'moment';

export const getEcsBtnName = () => 'ECS';
export const getEcsAssoBtnName = () => 'ECS (Assoc.)';
export const getEcsAssocBtnStyle = () => { return { rightPadding: '12px', leftPadding: '12px', margin: '0px', width: '100px' };};
export const getEcsBtnStyle = () => { return {  padding: '0px', margin: '0px', width: '100px'  };};
export const getOcsssBtnName = () => 'OCSSS';
export const getMwecsBtnName = () => 'MWECS';

const defaultDisplayNoneCondition = (docTypeCds, allowEmpty = false, hkid = '') => {

    let containAnyHkidFormat = docTypeCds ? (docTypeCds.find(item => PatientUtil.isHKIDFormat(item)) ? true : docTypeCds.length === 0) : false;
    let isDocTypeIsEmpty = docTypeCds? docTypeCds.length == 0: true;

    let result = !containAnyHkidFormat || !(
        (allowEmpty && isDocTypeIsEmpty) || (allowEmpty || hkid !== ''));

    return result;
};

export const getEligibleIndexFromEcsResult = (ecsStore) => {
    if(ecsStore){
        if(ecsStore.eligiblePerson1 === 'Y' || ecsStore.eligibleStaff1 === 'Y'){
            return 1;
        }
        if(ecsStore.eligiblePerson2 === 'Y' || ecsStore.eligibleStaff2 === 'Y'){
            return 2;
        }
    }
    return 0;
};

export const purifyHkid = (hkidWithBracket) => {
    return hkidWithBracket && hkidWithBracket.replace('(', '').replace(')','');
};


export const getHkidFromPatient = (patient) => {
    if(patient){
        if(patient.primaryDocNo && patient.primaryDocTypeCd === Enum.DOC_TYPE.HKID_ID){
            return patient.primaryDocNo;
        }else if(patient.documentPairList){
            let optionalPatientDocPair = patient.documentPairList.find(item => item.docTypeCd === Enum.DOC_TYPE.HKID_ID);
            if(optionalPatientDocPair){
                return optionalPatientDocPair.docNo;
            }
        }
    }
    return null;
};

export const getProperDocTypeCdForEcs = (patient) => {
    if(patient){
        if(patient.documentPairList){
            let optionalPatientDocPair = patient.documentPairList.find(item => item.docTypeCd === Enum.DOC_TYPE.HKID_ID);
            if(!optionalPatientDocPair){
                optionalPatientDocPair = patient.documentPairList.find(item => PatientUtil.isHKIDFormat(item.docTypeCd));
            }
            if(optionalPatientDocPair){
                return optionalPatientDocPair.docTypeCd;
            }
        }
    }
    return null;
};

export const getProperHkicForEcs =  (patient) => {
    let patientDocType = patient && patient.docTypeCd;
    let result = '';
    if(patient){
        if(patient.documentPairList){
            let hkid = getHkidFromPatient(patient);
            if(hkid){
                result = hkid;
            } else if(PatientUtil.isHKIDFormat(patientDocType)){
                let optionalPatientOtherDocPair = patient.documentPairList.find(item => PatientUtil.isHKIDFormat(item.docTypeCd));
                if(optionalPatientOtherDocPair){
                    result = optionalPatientOtherDocPair.docNo;
                }
            }
        }
    }
    return purifyHkid(result);
};

export const isPatientEcsRelatedFieldChanged = (currentPatientInfo, nextPatientInfo) => {
    return !(purifyHkid(getProperHkicForEcs(currentPatientInfo))) === purifyHkid(getProperHkicForEcs(nextPatientInfo) &&
    currentPatientInfo.engSurname === nextPatientInfo.engSurname &&
    currentPatientInfo.engGivename === nextPatientInfo.engGivename &&
    currentPatientInfo.nameChi === nextPatientInfo.nameChi &&
    currentPatientInfo.genderCd === nextPatientInfo.genderCd &&
    moment(currentPatientInfo.dob).format('YYYY-MM-DD') === moment(nextPatientInfo.dob).format('YYYY-MM-DD'));
};

export const isPatientEcsRelatedFieldChangedByStore = (currentEcsStore, nextPatientInfo) => {
    return !(purifyHkid(currentEcsStore.originalHkid) === purifyHkid(getProperHkicForEcs(nextPatientInfo)));
};


export const isEcsButtonDisplayNone = (docTypeCds, allowEmpty, hkid = '') => {
    return defaultDisplayNoneCondition(docTypeCds, allowEmpty, hkid);
};

export const isOcsssDisplayNone = (docTypeCds, allowEmpty, hkid = '') => {
    return defaultDisplayNoneCondition(docTypeCds, allowEmpty, hkid);
};

export const isEcsEnable = (accessRights, docTypeCds, ecsUserId, locationCode, allowEmpty, interfaceStatus, hkid = '', isAssociated = false) => {
    return interfaceStatus &&
    (
        ecsUserId !== '' && ecsUserId !== null && ecsUserId !== undefined &&
        locationCode !== '' && locationCode !== null && locationCode !== undefined
    ) &&
    (isAssociated || !isEcsButtonDisplayNone(docTypeCds, allowEmpty, hkid));
};

const validOcsssAndMwecsUser = (ecsUserId, ecsLocId) => {
    return (
        ecsUserId !== '' && ecsUserId !== null && ecsUserId !== undefined &&
        ecsLocId !== '' && ecsLocId !== null && ecsLocId !== undefined
    );
};

export const isOcsssEnable = (accessRights, docTypeCds, interfaceStatus, hkid, ecsUserId, ecsLocId) => {
    return interfaceStatus &&
    !isOcsssDisplayNone(docTypeCds, false, hkid) &&
    validOcsssAndMwecsUser(ecsUserId, ecsLocId);
};


export const isMwecsEnable = (accessRights, interfaceStatus, ecsUserId, ecsLocId) => {
    return interfaceStatus && validOcsssAndMwecsUser(ecsUserId, ecsLocId);
};


export const getEcsParams = (
    isSearchBoth,
    isSelfSearch,
    cimsUser,
    defaultTemplate,
    dob,
    dobEstd,
    hkid,
    locationCode,
    requestID,
    svrOrg,
    patientHkid,
    patientKey,
    atndId
) => {

    const isCompletedDateFormatCode = dobEstd === Enum.DATE_FORMAT_EDMY_KEY ;

    let tempDob = null;
    if(dob instanceof moment){
      tempDob = dob;
    }else {
      tempDob = moment(dob, 'YYYY-MM-DD');
    }
    return {
      'checkBoth': isSearchBoth ? 'Y': 'N',
      'checkType': isSelfSearch ? 'H' : 'N',
      'cimsUser': cimsUser,
      'defaultTemplate': defaultTemplate,
      'dob': isCompletedDateFormatCode ? tempDob.format(Enum.DATE_FORMAT_ECS_EDMY_VALUE) : tempDob.format(Enum.DATE_FORMAT_ECS_EY_VALUE),
      'dobEstd': isCompletedDateFormatCode ? 'Y' : 'N',
      'hkid': hkid,
      'locationCode': locationCode,
      'requestID': requestID,
      'svrOrg': isSearchBoth ? 'GS': svrOrg,
      'patientHkid': patientHkid,
      'patientKey': patientKey,
      'atndId': atndId,
      'ecsLocationCode': locationCode,
      'ecsUserName': cimsUser
    };
};

export const getEcsParamsForDirectCall = (
    cimsUser,
    dob,
    dobEstd,
    hkid,
    locationCode,
    patientKey,
    atndId
) => {
    return getEcsParams(
        true,
        true,
        cimsUser,
        'N',
        dob,
        dobEstd,
        hkid,
        locationCode,
        '',
        'GS',
        hkid,
        patientKey,
        atndId
    );
};

export const getMwecsParamsForDirectCall = (idType ,idNum, patientKey, atndId, ecsUserName, ecsLocationId) => {
    let currentDateStr =  moment().format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
    return {
        hkidFormat: idType === Enum.MWECS_ID_TYPE_KEYS.hkid ? 'Y' : 'N',
        idNumber: purifyHkid(idNum),
        reqEndDate: currentDateStr,
        reqStartDate: currentDateStr,
        patientKey: patientKey,
        atndId: atndId,
        ecsUserName,
        ecsLocationId
    };
};

export const getDetailArray=(ecsStore)=>{
    let result = [];
    if(ecsStore){
      const resultIndex = getEligibleIndexFromEcsResult(ecsStore);
      const getDetailObj = (key, value) => {return {label:key, desc: value};};
      const toValueIfValid = (ecsStore, value) => { return ecsStore.isValid ? value : '-';};
      result.push(getDetailObj('Last Checked Date & Time:' , ecsStore.lastCheckedTime));

      if(ecsStore.isAssoicated){
        result.push(getDetailObj('Associated HKID:' , ecsStore.hkId));
      }

      result.push(getDetailObj('Serving Organisation:' , toValueIfValid(ecsStore, ecsStore[`svrOrg${resultIndex}`])));
      result.push(getDetailObj('Serving Institution:' , toValueIfValid(ecsStore, ecsStore[`svrInt${resultIndex}`])));
      result.push(getDetailObj('Eligible for Medical:' , toValueIfValid(ecsStore, ecsStore[`eligibleMedical${resultIndex}`])));
      result.push(getDetailObj('Eligible for Dental:' , toValueIfValid(ecsStore, ecsStore[`eligibleDental${resultIndex}`])));
      result.push(getDetailObj('Returned Name:' , ecsStore.englishName === '' || ecsStore.translatedName === '' ? '-' : (ecsStore.englishName === '' ?  ecsStore.translatedName : ecsStore.englishName)));
      result.push(getDetailObj('Eligible Staff Indicator:' , toValueIfValid(ecsStore, ecsStore[`eligibleStaff${resultIndex}`])));
      result.push(getDetailObj('In-Service:' , toValueIfValid(ecsStore, ecsStore[`inServe${resultIndex}`])));
    }
   return result;
  };

  export const checkEcsDataIsValid=(ecsStore,benefitType)=>{
    let resultIndex = getEligibleIndexFromEcsResult(ecsStore);
    if(resultIndex===0){
        ecsStore.isValid=false;
    }else{
      if(benefitType==='Both'){
        ecsStore.isValid = true;
      }else{
        ecsStore.isValid=ecsStore[`svrOrg${resultIndex}`]===benefitType;
      }
    }
    return ecsStore;
  };