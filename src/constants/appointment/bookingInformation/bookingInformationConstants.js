import FieldConstant from '../../fieldConstant';

export const initBookingData = {
    siteId: null,
    encounterTypeId: null,
    rmId: null,
    rmCd: '',
    clinicCd: '',
    encounterTypeCd: '',
    subEncounterTypeCd: '',
    caseTypeCd: 'N',
    //TODO: will be remove, replace qtType
    appointmentTypeCd: '',
    qtType: '',
    appointmentDate: null,
    appointmentTime: null,
    elapsedPeriod: '',
    elapsedPeriodUnit: '',
    appointmentDateTo: null,
    gestWeekFromWeek: null,
    gestWeekFromDay: null,
    gestWeekToWeek: null,
    gestWeekToDay: null,
    searchLogicCd: 'W',
    sessId: '',
    bookingUnit: '1',
    isSqueeze: null,
    isUrgSqueeze: null,
    encounterTypeList: [],
    subEncounterTypeList: [],
    remarkId: '',
    memo: '',
    multipleAppointmentDate: null,
    multipleNoOfAppointment: '',
    multipleInterval: '',
    multipleIntervalUnit: '',
    patientStatusCd: null,
    forDoctorOnly: '',
    priority: '',
    reschRsnTypeId: null,
    reschRsnRemark: '',
    caseIndicator: '',
    confirmECSEligibility: '',
    discNum: '',
    isNep: false,
    nepRemark: '',
    encntrGrpCd: '',
    sspecFilter: null,
    cgsInpatientCnsltLocCd: null,
    cgsInpatientCnsltLocId: null
};

export const initWalkInAttendanceData = {
    patientStatus: '',
    paymentMeanCD: 'Cash',
    amount: 100,
    discNumber: '',
    mswWaiver: 0
};

export const initAnonymousPersonalInfo = {
    docTypeCd: '',
    docNo: '',
    surname: '',
    givenName: '',
    mobile: {
        smsPhoneInd: '',
        phoneTypeCd: 'M',
        countryCd: null,
        areaCd: '',
        dialingCd: FieldConstant.DIALING_CODE_DEFAULT_VALUE,
        phoneNo: '',
        phoneId: ''
    },
    isHKIDValid: true
};

export const initRplaceAppointmentData = {
    bookingData: {},
    cimsOneReplaceList: {},
    minInterval: '',
    minIntervalUnit: '',
    openReplaceAppointmentDialog: false,
    openSameDayAppointmentDialog: false
};

export const initMultiReplaceApptData = {
    minInterval: '',
    minIntervalUnit: '',
    normalConfirmList: null,
    stillConfirmList: null,
    cimsOneReplaceList: null,
    replaceApptList: null,
    isSameDayAppointment: false,
    isReplaceAppointment: false
};

export const initRescheduleApptData = {
    appointmentInfoBaseVo: null,
    replaceApptList: null,
    cimsOneReplaceList: null,
    isSameDayAppointment: false,
    isReplaceAppointment: false,
    minInterval: '',
    minIntervalUnit: ''
};

export const anonymousDataList = [{ option: 'New Registration' }, { option: 'Anonymous Appoimtment' }];
