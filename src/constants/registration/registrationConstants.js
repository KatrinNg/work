import Enum from '../../enums/enum';
import FieldConstant from '../../constants/fieldConstant';
import ContactInformationEnum from '../../enums/registration/contactInformationEnum';
import RegFieldName from '../../enums/registration/regFieldName';
import { patientEhsDto } from '../serviceSpecific/ehsConstants';

export const contactPersonBasic = {
    block: '',
    building: '',
    contactId: 0,
    displaySeq: 0,
    districtCd: '',
    emailAddress: '',
    engGivename: '',
    engSurname: '',
    otherName: '',
    estate: '',
    floor: '',
    nameChi: '',
    contactPhoneList: [],
    relationshipCd: '',
    region: '',
    room: '',
    subDistrictCd: '',
    streetName: '',
    streetNo: '',
    addressLanguageCd: Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE,
    addressFormat: ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS,
    postOfficeBoxNo: '',
    postOfficeName: '',
    postOfficeRegion: '',
    addrTxt: '',
    remark: '',
    regionCode: '',
    districtCode: '',
    subDistrictCode: ''
};

export const patientBasic = {
    nationality: '',
    birthPlaceCd: '',
    caseList: [],
    ccCode1: '',
    ccCode2: '',
    ccCode3: '',
    ccCode4: '',
    ccCode5: '',
    ccCode6: '',
    communicationMeansCd: '',
    clinicCd: '',
    dob: null,
    docTypeCd: '',
    eduLevelCd: '',
    ehrEnrolmentEndDate: '',
    ehrPatientId: '',
    ehrssInd: '',
    emailAddress: '',
    engGivename: '',
    engSurname: '',
    ethnicityCd: '',
    exactDobCd: Enum.DATE_FORMAT_EDMY_KEY,
    exactDodCd: '',
    genderCd: '',
    govDptCd: '',
    hkid: '',
    maritalStatusCd: '',
    nameChi: '',
    occupationCd: '',
    otherDocNo: '',
    otherName: '',
    addressList: [],
    contactPersonList: [],
    documentPairList: [],
    patientKey: 0,
    phoneList: [],
    preferredLangCd: '',
    rank: '',
    religionCd: '',
    remarks: '',
    translationLangCd: '',
    userId: '',
    version: '',
    communicateLanguageCd: '',
    primaryDocTypeCd: '',
    primaryDocNo: '',
    isCCDS: 0,
    familyNoType: 'NONE',
    pmiGrpId: '',
    pmiGrpName: '',
    isChief: false,
    cgsSpec:{
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
    },
    ehsMbrSts: null,
    isApplyEhsMember: 0,
    patientEhsDto: { ...patientEhsDto }
};

export const patientAddressBasic = {
    addressId: 0,
    addressTypeCd: '',
    addressLanguageCd: Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE,
    block: '',
    building: '',
    buildingCsuId: '',
    region: '',
    districtCd: '',
    estate: '',
    floor: '',
    room: '',
    streetName: '',
    streetNo: '',
    subDistrictCd: '',
    addressFormat: ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS,
    postOfficeBoxNo: '',
    postOfficeName: '',
    postOfficeRegion: '',
    addrTxt: '',
    isDirty: false,
    regionCode: '',
    districtCode: '',
    subDistrictCode: ''
};

export const patientPhonesBasic = {
    areaCd: '',
    // countryCd: FieldConstant.COUNTRY_CODE_DEFAULT_VALUE,
    countryCd:null,
    extPhoneNo: '',
    phoneId: 0,
    phoneNo: '',
    phonePriority: 0,
    phoneTypeCd: Enum.PHONE_TYPE_MOBILE_PHONE,
    smsPhoneInd: '0',
    dialingCd: FieldConstant.DIALING_CODE_DEFAULT_VALUE,
    ext:''
};

export const patientSocialDataBasic = {
    ethnicityCd: '',
    maritalStatusCd: '',
    religionCd: '',
    occupationCd: '',
    translationLangCd: '',
    eduLevelCd: '',
    govDptCd: '',
    rank: '',
    remarks: ''
};

export const patientContactInfoBasic = {
    communicationMeansCd: '',
    emailAddress: '',
    // communicateLangCd: Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE,
    commLangCd: '',
    postOfficeBoxNo: '',
    postOfficeName: '',
    postOfficeRegion: '',
    pmiPatientCommMeanList: [],
    dtsElctrncCommCnsntSts: '',
    dtsElctrncCommCnsntUpdDtm: ''
};

export const patientBaseInfoBasic = {
    // patientKey: 0,
    nationality: '',
    birthPlaceCd: '',
    ccCode1: '',
    ccCode2: '',
    ccCode3: '',
    ccCode4: '',
    ccCode5: '',
    ccCode6: '',
    dob: null,
    docTypeCd: '',
    hkid: '',
    nameChi: '',
    otherDocNo: '',
    otherName: '',
    ehrPatientId: '',
    engGivename: '',
    engSurname: '',
    exactDobCd: Enum.DATE_FORMAT_EDMY_KEY,
    genderCd: '',
    translationLangCd: '',
    communicateLanguageCd: '',
    preferredLangCd: '',
    documentPairList: [],
    primaryDocTypeCd: '',
    primaryDocNo: '',
    priIssueCountryCd: '',
    additionalDocTypeCd: '',
    additionalDocNo: '',
    addlIssueCountryCd: '',
    idSts: '',
    patientSts: '',
    isFm: 0,
    isPnsn: 0,
    tbcPcfbDate: '',
    dtsSpecNeedCatgryId: null,
    dtsSpecNeedScatgryId: null,
    isCCDS: 0,
    familyNoType: 'NONE',
    pmiGrpId: '',
    isChief: false,
    pmiGrpName: '',
    cgsSpec:{
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
    },
    ehsMbrSts: null,
    isApplyEhsMember: 0,
    patientEhsDto: { ...patientEhsDto }
};

export const babyInfoBasic = {
    ccCode1: '',
    ccCode2: '',
    ccCode3: '',
    ccCode4: '',
    ccCode5: '',
    ccCode6: '',
    dob: null,
    nameChi: '',
    exactDobCd: Enum.DATE_FORMAT_EDMY_KEY,
    docNo: '',
    genderCd: '',
    birthOrder: '',
    motherEpisodeNumOfBirth: '',
    engSurname: '',
    engGivename: ''

};

export const patientDocumentPair = {
    docNo: null,
    docTypeCd: null,
    documentPairId: null,
    patientKey: null,
    serviceCd: null
};

export const filterSet = {
    [RegFieldName.CONTACT_REGION]: 0,
    [RegFieldName.CONTACT_DISTRICT]: 0
};

export const paperBasedRecordBasic = {
    id: 0,
    seq: 0,
    serviceCd: '',
    clinicCd: '',
    recId: '',
    isEmpty: true
};

export const patientReminderBasic = {
    id: 0,
    seq: 0,
    scope: 'A',
    remark: '',
    isEmpty: true,
    codMsgTypeId: null
};

export const waiverInfoBasic = {
    id: 0,
    seq: 0,
    waiverTypeCd: '',
    isOneoff: 0,
    waiverNum: '',
    waivePrcnt: '',
    startDate: null,
    endDate: null,
    issueBy: '',
    issueDate: null,
    useSts: 'N',
    checkedBy: '',
    recPos: 0,
    isEmpty: true
};

export const commMeanBasic = {
    commMeanCd: '',
    isPrefCommMean: 0,
    patientCommMeanId: 0,
    // patientKey: 0,
    status: 'A',
    svcCd: ''
};

export const familyNoTypes = {
    NONE: 'NONE',
    NEW: 'NEW',
    EXISTING: 'EXISTING'
};


