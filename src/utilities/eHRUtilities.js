import accessRightEnum from '../enums/accessRightEnum';
import * as PatientUtil from './patientUtilities';
import * as CommonUtilities from './commonUtilities';
import * as RegUtil from './registrationUtilities';
import Enum from '../enums/enum';
import moment from 'moment';
import { patientBasic } from '../constants/registration/registrationConstants';
import _ from 'lodash';

export const getViewerUrl = () => {
    return 'https://cims-interface-ehr-viewer-svc-cims-dmz-st.cldpaast71.server.ha.org.hk/viewer/patientUrl';
};
export const getEhrIsPmiUrl = () => {
    return 'https://cims-interface-ehr-epmi-svc-cims-dmz-st.cldpaast71.server.ha.org.hk/eHRIS/epmi';
};

export const getEHRPatientStatusUpdateInfo = (ehrNo, isMatchId, patientKey) => {
    let result = {
        actionType: Enum.EHR_UPDATE_ACTION_TYPE,
        ehrNo: ehrNo,
        isMatch: isMatchId,
        patientKey: patientKey
    };
    return result;
};

export const getEHRTabInfo = () => {
    let result = {
        label: 'eHRSS Registered',
        name: accessRightEnum.eHRRegistered,
        path: '/eHR/eHRRegistration',
        isPatRequired: 'Y'
    };
    return result;
};

export const isEHRAccessRight = (accessRights) => {
    let result = false;
    // check ehruId
    if (accessRights && Number.isInteger(accessRights)) {
        result = true;
    }
    // accessRights && accessRights.filter(item => item.type === 'button')
    //         .forEach(right => {
    //     if (right.isPatRequired === 'Y'
    //             && right.name === accessRightEnum.eHRRegistered) {
    //         result = true;
    //     }
    // });
    return result;
};

export const isUserHaveAccess = (accessRights, accessRightEnumCd) => {
    let result = (accessRights && accessRights.findIndex(
        item => item.name === accessRightEnumCd) > -1);
    return result;
};

export const isEHRSSRegistered = (patientInfo) => {
    let result = false;
    if (patientInfo && patientInfo.patientKey && patientInfo.patientEhr
            && patientInfo.patientEhr.ehrNo) {
        result = true;
    }
    return result;
};

export const isIdentityPatient = (patientInfo) => {
    let result = false;
    // Patinet need has eHR No and and the isMatch == '2'
    // FYI :. '2' is a need identity case
    // TODO : use emun isMatch == '2'
    if (patientInfo && patientInfo.patientKey && patientInfo.patientEhr
            && patientInfo.patientEhr.ehrNo && (patientInfo.patientEhr.isMatch === '4')) {
                result = true;
    }
    return result;
};

export const isIdentityPatientInCIMS = (patientInfo) => {
    let result = false;
    // Patinet need has eHR No and and the === '3'
    // TODO : use emun isMatch == '3'
    if (patientInfo && patientInfo.patientKey && patientInfo.patientEhr
            && patientInfo.patientEhr.ehrNo && patientInfo.patientEhr.isMatch === '3') {
                result = true;
    }
    return result;
};

export const getEHRISViewerData = (patientInfo, hkId, documentId, documentType, serviceCd, loginName, loginId, pcName, ipAddr, correlationId, eHRId) => {
    let result = {
        als: {
            clientIp: ipAddr ? ipAddr : '',
            correlationId: correlationId ? correlationId : '',
            userId: loginName ? loginName : '',
            workstationId: pcName ? pcName : ''
        },
        dob: patientInfo.dob ? patientInfo.dob : '' ,
        documentId: documentId ? documentId : '' ,
        documentType: documentType ? documentType : '' ,
        ehrNo: patientInfo.patientEhr && patientInfo.patientEhr.ehrNo ? patientInfo.patientEhr.ehrNo : '' ,
        ehruId: eHRId ? eHRId : '' ,
        givenName: patientInfo.engGivename ? patientInfo.engGivename : '',
        hkId: hkId ? hkId : '' ,
        pmiPersId: patientInfo.patientKey ? patientInfo.patientKey : '' ,
        resolutionHeight: window.screen.height,
        resolutionWidth: window.screen.width,
        serviceId: serviceCd ? serviceCd : '' ,
        sex: patientInfo.genderCd ? patientInfo.genderCd : '' ,
        surname: patientInfo.engSurname ? patientInfo.engSurname : '' ,
        uamUserId: loginId
    };

    return result;
};

export const getPatientHkidPair = (patientInfo) => {
    let result = '';
    patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.filter(
                item => item.patientKey === patientInfo.patientKey
                        && item.docTypeCd === Enum.DOC_TYPE.HKID_ID).forEach(patientInfo => {
        if (patientInfo.docNo) {
            result = patientInfo.docNo;
        }
    });
    return result;
};

export const getPatientHkicPair = (patientInfo) => {
    let result = {};
    patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.filter(
            item => item.patientKey === patientInfo.patientKey)
                    .forEach(patientInfo => {
        if (patientInfo.docTypeCd
                && PatientUtil.isHKIDFormat(patientInfo.docTypeCd)) {
            result = {
                docNo : patientInfo.docNo,
                docTypeCd : patientInfo.docTypeCd
            };
        }
    });
return result;
};

export const getPatientNonHkicPair = (patientInfo) => {
    let result = {};
    patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.filter(
            item => item.patientKey === patientInfo.patientKey)
                    .forEach(patientInfo => {
        if (patientInfo.docTypeCd
                && !PatientUtil.isHKIDFormat(patientInfo.docTypeCd)) {
            result = {
                docNo : patientInfo.docNo,
                docTypeCd : patientInfo.docTypeCd
            };
        }
    });
return result;
};

export const getDobDateByFormat = (dobCd, dob, format) => {
    let result = RegUtil.getDateByFormat(dobCd, dob).format(format);
    return result;
};

export const getEHRDocumentPairSyntax = (documentNo, documentType) => {
    let result = '';
    if (documentNo && documentType) {
        result = documentNo + ' / ' + documentType;
    }
    return result;
};

export const checkDocumentPairList = (documentPairList, documentNo, documentType) => {
    let result = false;
    if (!documentPairList) {
        result = false;
        return result;
    }
    documentPairList.filter(item => item.docNo === documentNo && item.docTypeCd === documentType).forEach(patientInfo => {
        if (patientInfo){
            result = true;
        }
    });
    return result;
};

export const getEngPatientName = (engSurname, engGivename) => {
    let result = '';
    if (engSurname && engGivename) {
        result = engSurname + ', ' + engGivename;
        return result;
    } else {
        if (engSurname) {
            result = engSurname + ', ';
            return result;
        }
        if (engGivename) {
            result = engGivename;
            return result;
        }
        return result;
    }
};

export const getUpdateEHRData = (existingInfo, newInfo, serviceCd, loginName, password, siteCd, userId) => {
    let result = existingInfo;
    if (newInfo.englishSurname &&
            result.engSurname !== newInfo.englishSurname) {
        result.engSurname = newInfo.englishSurname;
    }
    if (newInfo.englishGivenName
        && result.engGivename !== newInfo.englishGivenName) {
            result.engGivename = newInfo.englishGivenName;
    }
    if (newInfo.sex) {
        result.genderCd = newInfo.sex;
    }
    if (newInfo.dateOfBirth) {
        let dateOfBirth = moment(newInfo.dateOfBirth).format(Enum.DATE_FORMAT_EYMD_VALUE);

        result.dob = dateOfBirth;
        if (newInfo.exactDobFlag) {
            result.exactDobCd = newInfo.exactDobFlag;
        }
    }
    if (checkDocumentPairList(result.documentPairList, newInfo.hkid, Enum.DOC_TYPE.HKID_ID)) {
        result.documentPairList.filter(item => item.docNo === newInfo.hkid
                && item.docTypeCd === Enum.DOC_TYPE.HKID_ID).forEach(patientInfo => {
            patientInfo.docNo = newInfo.hkid;
        });
    } else {
        if (newInfo.hkid) {
            result.documentPairList.push({
                serviceCd: serviceCd,
                documentPairId: '',
                patientKey: result.patientKey,
                docNo : newInfo.hkid,
                docTypeCd : Enum.DOC_TYPE.HKID_ID
            });
        }
    }
    if (checkDocumentPairList(result.documentPairList, newInfo.identityDocumentNo, newInfo.typeOfIdentityDocument)) {
        result.documentPairList.filter(item => item.docNo === newInfo.identityDocumentNo
                && item.docTypeCd === newInfo.typeOfIdentityDocument)
                        .forEach(patientInfo => {
                patientInfo.docNo = newInfo.identityDocumentNo;
        });
    } else {
        if (newInfo.identityDocumentNo && newInfo.typeOfIdentityDocument) {
            result.documentPairList.push({
                serviceCd: serviceCd,
                documentPairId: '',
                patientKey: result.patientKey,
                docNo : newInfo.identityDocumentNo,
                docTypeCd : newInfo.typeOfIdentityDocument
            });
        }
    }

    result['userId'] = userId;
    result['clinicCd'] = siteCd;
    result['loginName'] = loginName;
    result['password'] = password;
    // {
    //     userId : 'admin',
    //     clinicCd : 'A2',
    //     loginName : this.state.loginName,
    //     password : this.state.password
    // }
    return result;
};

