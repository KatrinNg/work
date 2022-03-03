function getEngDesc(list, code) {
    const obj = list.find(x => x.code === code);
    return obj ? obj.engDesc : '';
}

const Enum = {

    //eHR isMatch Enum
    IS_MATCH_STATUS: '1',
    IS_MATCH_IDENTITY_STATUS: '2',
    IS_MATCHJUST_VERIFIED_STATUS: '3',

    // eHR action type
    EHR_UPDATE_ACTION_TYPE: 'UPDATE',

    ACTION_STATUS:[{label:'Screened',value:'S'},{label:'Reviewed',value:'R'},{label:'Explained',value:'E'}],

    // For the appt interval unit
    APPT_INTERVAL_UNIT: [
        {
            code: 'D',
            engDesc: 'day'
        },
        {
            code: 'W',
            engDesc: 'week'
        },
        {
            code: 'M',
            engDesc: 'month'
        },
        {
            code: 'Y',
            engDesc: 'year'
        },
        {
            code: 'H',
            engDesc: 'hour'
        },
        {
            code: 'I',
            engDesc: 'minute'
        }
    ],

    OVERLAPPING_APPT_CONTRO: {
        WARNING: 'Warning',
        BLOCK: 'Block'
    },

    // Quota Type for BE/FE
    QUOTA_1: 'QT1',
    QUOTA_2: 'QT2',
    QUOTA_3: 'QT3',
    QUOTA_4: 'QT4',
    QUOTA_5: 'QT5',
    QUOTA_6: 'QT6',
    QUOTA_7: 'QT7',
    QUOTA_8: 'QT8',

    //phone type
    PHONE_TYPE_MOBILE_PHONE: 'M',
    PHONE_TYPE_HOME_PHONE: 'H',
    PHONE_TYPE_OFFICE_PHONE: 'O',
    PHONE_TYPE_FAX_PHONE: 'F',
    PHONE_TYPE_OTHER_PHONE: 'T',
    PHONE_TYPE_MOBILE_SMS: 'MSMS',

    PHONE_DROPDOWN_LIST: [
        { value: 'M', label: 'Mobile' },
        { value: 'MSMS', label: 'Mobile SMS' },
        { value: 'H', label: 'Home' },
        { value: 'O', label: 'Office' },
        { value: 'F', label: 'Fax' },
        { value: 'T', label: 'Other' }
    ],

    //gender
    GENDER_MALE_VALUE: 'M',
    GENDER_FEMALE_VALUE: 'F',
    GENDER_UNKNOWN_VALUE: 'U',

    //address type
    PATIENT_CORRESPONDENCE_ADDRESS_TYPE: 'C',
    PATIENT_RESIDENTIAL_ADDRESS_TYPE: 'R',
    PATIENT_CONTACT_PERSON_ADDRESS_TYPE: 'CP',
    // PATIENT_OTHER_CONTACT_PERSON_TYPE:'O',

    //language type
    PATIENT_ADDRESS_CHINESE_LANGUAGE: 'C',
    PATIENT_ADDRESS_ENGLISH_LANUAGE: 'E',

    //date format
    DATE_FORMAT_EY_KEY: 'EY',
    DATE_FORMAT_EMY_KEY: 'EMY',
    DATE_FORMAT_EDMY_KEY: 'EDMY',
    DATE_FORMAT_EY_VALUE: 'YYYY',
    DATE_FORMAT_EMY_VALUE: 'MMM-YYYY',
    DATE_FORMAT_EDMY_VALUE: 'DD-MMM-YYYY',
    TIME_FORMAT_24_HOUR_CLOCK: 'HH:mm',
    TIME_FORMAT_12_HOUR_CLOCK: 'hh:mm A',
    TIME_FORMAT_24_HOUR_HMS:'HH:mm:ss',
    TIME_FORMAT_12_H0OUR_HMS:'HH:mm:ss A',
    DATE_FORMAT_24_HOUR: 'DD-MMM-YYYY HH:mm',
    DATE_FORMAT_MMMM_24_HOUR: 'DD-MMMM-YYYY HH:mm',
    DATE_FORMAT_MM_24_HOUR: 'DD-MM-YYYY HH:mm',
    DATE_FORMAT_24: 'DD-MMM-YYYY HH:mm:ss',

    DATE_FORMAT_12_HOUR: 'DD-MMM-YYYY hh:mm A',
    DATE_FORMAT_EYMD_VALUE: 'YYYY-MM-DD',
    DATE_FORMAT_EYMMMD_VALUE_24_HOUR: 'YYYY-MMM-DD HH:mm',
    DATE_FORMAT_EYMD_12_HOUR_CLOCK: 'YYYY-MM-DD HH:mm:ss',
    DATE_FORMAT_EYMD_24_HOUR_CLOCK: 'YYYY-MM-DD HH:mm:ss',
    DATE_FORMAT_FOCUS_DMY_VALUE: 'DD-MM-YYYY',
    DATE_FORMAT_FOCUS_MY_VALUE: 'MM-YYYY',

    DATE_FORMAT_ECS_EDMY_VALUE: 'YYYYMMDD',
    DATE_FORMAT_ECS_EY_VALUE: 'YYYY',
    DATE_FORMAT_MWECS_EDMY_VALUE: 'YYYY-MM-DD',
    DATE_FORMAT_DMY_WITH_WEEK: 'DD-MMM-YYYY ddd',
    DATE_FORMAT_EYMMD_VALUE_24_HOUR: 'YYYY-MM-DD HH:mm',
    DATE_FORMAT_DMY: 'DD-MM-YYYY',

    DATE_DEFAULT_MIN_FORMAT: '1900-01-01',
    DATE_DEFAULT_MAX_FORMAT: '2100-01-01',

    NO_ZERO_DATE_FORMAT_24: 'D-MMM-YYYY HH:mm:ss',
    NO_ZERO_DATE_FORMAT_EDMY_VALUE: 'D-MMM-YYYY',

    PAYMENT_DATE_FORMAT: 'DD-MM-YYYY',
    PAYMENT_DATETIME_FORMAT_24: 'DD-MM-YYYY HH:mm',
    APPOINTMENT_BOOKING_DATE: 'DD-MMM-YYYY (ddd)',

    LANGUAGE_LIST: [
        {
            'code': 'E',
            'engDesc': 'English'
        },
        // {
        //     'code': 'C',
        //     'engDesc': '中文'
        // }
        {
            'code': 'T',
            'engDesc': '中文'
        }
    ],

    //status
    // COMMON_STATUS: [
    // {
    //     code: 'A',
    //     engDesc: 'Active'
    // },
    // {
    //     code: 'S',
    //     engDesc: 'Inactive'
    // },
    // {
    //     code: 'L',
    //     engDesc: 'Locked'
    // }
    // ],

    COMMON_STATUS_ACTIVE: 'A',
    COMMON_STATUS_INACTIVE: 'I',
    COMMON_STATUS_EXPIRED: 'E',
    COMMON_STATUS_DELETED: 'D',
    COMMON_STATUS_PENDING: 'P',
    COMMON_STATUS_LOCKED: 'L',
    //acount status
    COMMON_STATUS: [
        {
            code: 'A',
            engDesc: 'Active'
        },
        {
            code: 'I',
            engDesc: 'Inactive'
        },
        {
            code: 'E',
            engDesc: 'Expired'
        },
        {
            code: 'D',
            engDesc: 'Deleted'
        },
        {
            code: 'P',
            engDesc: 'Pending'
        },
        {
            code: 'L',
            engDesc: 'Locked'
        }
    ],

    COMMON_SALUTATION: [
        {
            code: 'Dr.',
            engDesc: 'Dr.'
        },
        {
            code: 'Mr.',
            engDesc: 'Mr.'
        },
        {
            code: 'Miss',
            engDesc: 'Miss'
        },
        {
            code: 'Mrs.',
            engDesc: 'Mrs.'
        },
        {
            code: 'Ms.',
            engDesc: 'Ms.'
        },
        {
            code: 'Sr.',
            engDesc: 'Sr.'
        }
    ],

    COMMON_YES: 1,
    COMMON_NO: 0,
    COMMON_YES_NO_LIST: [
        {
            code: '1',
            engDesc: 'YES'
        },
        {
            code: '0',
            engDesc: 'NO'
        }
    ],

    ENCTYPE_INTERVAL_UNIT_DAY: 'D',
    ENCTYPE_INTERVAL_UNIT_WEEK: 'W',
    ENCTYPE_INTERVAL_UNIT_HOUR: 'H',
    ENCTYPE_INTERVAL_UNIT_YEAR: 'Y',
    ENCTYPE_INTERVAL_UNIT_MINUTE: 'I',
    ENCTYPE_INTERVAL_UNIT_MONTH: 'M',
    ENCTYPE_INTERVAL_UNIT: [
        {
            code: 'D',
            engDesc: 'Day'
        },
        {
            code: 'W',
            engDesc: 'Week'
        },
        {
            code: 'H',
            engDesc: 'Hour'
        },
        {
            code: 'Y',
            engDesc: 'Year'
        },
        {
            code: 'I',
            engDesc: 'Minute'
        },
        {
            code: 'M',
            engDesc: 'Month'
        }
    ],

    //contact mean
    CONTACT_MEAN_SMS: 'S',
    CONTACT_MEAN_EMAIL: 'E',
    CONTACT_MEAN_POSTALMAIL: 'P',

    CONTACT_MEAN_LIST: [
        {
            'code': 'S',
            'engDesc': 'SMS',
            'spec': 'disable'
        },
        {
            'code': 'E',
            'engDesc': 'Email'
        },
        {
            'code': 'P',
            'engDesc': 'Postal Mail'
        }
        // removed: <CIMST-3341>
        // ,
        // {
        //     'code': 'M',
        //     'engDesc': 'Phone'
        // }
    ],

    // Preferred Notification Means Action of user
    COMM_MEAN_ACTION:'D',

    DTS_CNSNT_STS: [
        {
            code: 'Y',
            label: 'With Consent'
        },
        {
            code: 'N',
            label: 'Without Consent'
        }
    ],

    //appointment booking elapsed period
    ELAPSED_PERIOD_TYPE: [
        {
            code: 'day',
            engDesc: 'Day'
        },
        {
            code: 'week',
            engDesc: 'Week'
        },
        {
            code: 'month',
            engDesc: 'Month'
        }
    ],

    //appointment booking interval type
    INTERVAL_TYPE: [
        {
            code: 'D',
            engDesc: 'Day'
        },
        {
            code: 'W',
            engDesc: 'Week'
        },
        {
            code: 'M',
            engDesc: 'Month'
        }
    ],

    //appointment booking session
    SESSION: [
        {
            code: 'w',
            engDesc: 'Whole day'
        },
        {
            code: 'am',
            engDesc: 'AM'
        },
        {
            code: 'pm',
            engDesc: 'PM'
        }
    ],

    //appointment booking appointment type
    APPOINTMENT_TYPE_PERFIX: [
        {
            code: 'N',
            engDesc: 'New'
        },
        {
            code: 'O',
            engDesc: 'Old'
        }
    ],

    // TODO : code QUOTA_1 ~ QUOTA_3?
    APPOINTMENT_TYPE_SUFFIX: [
        {
            code: 'QT1',
            engDesc: 'Normal'
        },
        {
            code: 'QT2',
            engDesc: 'Force'
        },
        {
            code: 'QT3',
            engDesc: 'Public'
        },
        {
            code: 'U',
            engDesc: 'Urgent'
        }
    ],

    //next patient logic
    NEXT_PATIENT_LOGIC: {
        THS: 'Next Client',
        FCS: 'Next Patient',
        SocHS: 'Next Patient',
        FHS: 'Next Client',
        CAS: 'Next Client',
        CGS: 'Next Patient',
        EHS: 'Next Client',
        SPP: 'Next Patient',
        'TB&C': 'Next Patient',
        DTS: 'Next Patient'
    },

    LANDING_PAGE: {
        ATTENDANCE: 'AL',
        CONSULTATION: 'PQ'
    },

    //Timer Status
    TIMER_STOPPED: 'STOPPED',
    TIMER_RUNNING: 'RUNNING',

    //Config
    CLINIC_CONFIGNAME: {
        AMPM_CUTOFF_TIME: 'AMPM_CUTOFF_TIME',
        EVENING_CUTOFF_TIME: 'EVENING_CUTOFF_TIME',
        QUOTA_TYPE: 'QUOTA_TYPE',
        QUOTA_TYPE_DESC: 'QUOTA_TYPE_DESC',
        DEFAULT_ENCOUNTER_CD: 'DEFAULT_ENCOUNTER_CD',
        DEFAULT_ENCNTR_TYPE_ID: 'DEFAULT_ENCNTR_TYPE_ID',
        ELAPSED_PERIOD: 'ELAPSED_PERIOD',
        LATE_ATTENDANCE_FLAG: 'LATE_ATTENDANCE_FLAG',
        LATE_ATTENDANCE_TIME: 'LATE_ATTENDANCE_TIME',
        BACK_TAKE_ATTENDANCE_DAY: 'BACK_TAKE_ATTENDANCE_DAY',
        ENABLE_CROSS_BOOK_CLINIC: 'ENABLE_CROSS_BOOK_CLINIC',
        PASSWORD_MIN_LENGTH: 'PASSWORD_MIN_LENGTH',
        PASSWORD_MIN_NUMERIC_LENGTH: 'PASSWORD_MIN_NUMERIC_LENGTH',
        PASSWORD_MIN_ALPHANUMERIC_LENGTH: 'PASSWORD_MIN_ALPHANUMERIC_LENGTH',
        PASSWORD_MAX_LENGTH: 'PASSWORD_MAX_LENGTH',
        PASSWORD_REMIND_DAY: 'PASSWORD_REMIND_DAY',
        PASSWORD_EFFECTIVE_DAY: 'PASSWORD_EFFECTIVE_DAY',
        IDLE_TIMEOUT_LOCK_SCREEN: 'IDLE_TIMEOUT_LOCK_SCREEN',
        IDLE_TIMEOUT_LOGOUT: 'IDLE_TIMEOUT_LOGOUT',
        AUTO_PRINT_APPT_SLIP: 'AUTO_PRINT_APPT_SLIP',
        IS_PAT_STATUS_REQ: 'IS_PAT_STATUS_REQ',
        IS_SHOW_FM_CB: 'IS_SHOW_FM_CB',
        IS_SHOW_PENSIONER_CB: 'IS_SHOW_PENSIONER_CB',
        IS_SHOW_SPECIAL_NEEDS: 'IS_SHOW_SPECIAL_NEEDS',
        DEFAULT_SEARCH_TYPE_CD: 'DEFAULT_SEARCH_TYPE_CD',
        ADI_URL: 'ADI_URL',
        USE_CASE_NO: 'USE_CASE_NO',
        PATIENT_LABEL: 'PATIENT_LABEL',
        ATND_CHECK_ID_STS: 'ATND_CHECK_ID_STS',
        PAT_SEARCH_TYPE_DEFAULT: 'PAT_SEARCH_TYPE_DEFAULT',
        // IS_ALLOW_CROSS_CLINIC_WAITING: 'IS_ALLOW_CROSS_CLINIC_WAITING',
        IS_SHARE_ATND_CERT: 'IS_SHARE_ATND_CERT',
        IS_SHARE_RFR_LETTER: 'IS_SHARE_RFR_LETTER',
        IS_SHARE_SICK_LEAVE_CERT: 'IS_SHARE_SICK_LEAVE_CERT',
        IS_SHARE_YELLOW_FEVER_EXEMPTION_LETTER: 'IS_SHARE_YELLOW_FEVER_EXEMPTION_LETTER',
        IS_SHARE_MATERNITY_SICK_LEAVE_CERT: 'IS_SHARE_MATERNITY_SICK_LEAVE_CERT',
        IS_ENABLE_SCANNER: 'IS_ENABLE_SCANNER',
        DYNAMSOFT_SCANNING_LICENSE_KEY: 'DYNAMSOFT_SCANNING_LICENSE_KEY',
        EHR_EHRIS_URL: 'EHR_EHRIS_URL',
        EHR_VIEWER_URL: 'EHR_VIEWER_URL',
        OVERLAPPING_APPT_CONTRO: 'OVERLAPPING_APPT_CONTRO',
        IS_SHARE_GENERAL_LETTER: 'IS_SHARE_GENERAL_LETTER',
        QUOTA_UTILISATION_DISPLAY: 'QUOTA_UTILISATION_DISPLAY',
        IS_NEW_CASE_BOOKING_FLOW: 'IS_NEW_CASE_BOOKING_FLOW',
        IS_SHOW_ASSO_PERS: 'IS_SHOW_ASSO_PERS',
        IS_SHOW_REMARK_TEMPLATE: 'IS_SHOW_REMARK_TEMPLATE',
        UNAVAIL_PERIOD_MGMT_DATE_RANGE_LIMIT:'UNAVAIL_PERIOD_MGMT_DATE_RANGE_LIMIT',
        TMSLT_PLANNING_DATE_RANGE_LIMIT:'TMSLT_PLANNING_DATE_RANGE_LIMIT',
        GEN_TMSLT_DATE_RANGE_LIMIT:'GEN_TMSLT_DATE_RANGE_LIMIT',
        IS_USE_GEST_CALC: 'IS_USE_GEST_CALC',
        IS_ALLOW_WALK_IN_PRINT_APPT_SLIP: 'IS_ALLOW_WALK_IN_PRINT_APPT_SLIP',
        HKID_MASKING_DIGITS:'HKID_MASKING_DIGITS',
        NEW_REG_SEX_DEFAULT: 'NEW_REG_SEX_DEFAULT',
        IS_PRINT_STAFF_ID:'IS_PRINT_STAFF_ID',
        IS_ENABLE_CHINESE_NAME_SEARCH: 'IS_ENABLE_CHINESE_NAME_SEARCH',
        IS_NEW_PMI_SEARCH_RESULT_DIALOG: 'IS_NEW_PMI_SEARCH_RESULT_DIALOG',
        IS_ENABLE_TMSLT_MULTIPLE_UPDATE: 'IS_ENABLE_TMSLT_MULTIPLE_UPDATE',
        IS_ENABLE_UNAVAIL_PERD_MULTIPLE_UPDATE: 'IS_ENABLE_UNAVAIL_PERD_MULTIPLE_UPDATE',
        REFERRAL_LETTER_CLINICAL_NOTE_DISPLAY_SEQ: 'REFERRAL_LETTER_CLINICAL_NOTE_DISPLAY_SEQ',
        PMI_WITH_PROVEN_DOC_DEFAULT:'PMI_WITH_PROVEN_DOC_DEFAULT',
        IS_PMI_GUM_LABEL_PREVIEW:'IS_PMI_GUM_LABEL_PREVIEW',
        IS_SPP_PMI_SMALL_LABEL_PREVIEW:'IS_SPP_PMI_SMALL_LABEL_PREVIEW',
        IS_PMI_SPECIMEN_LABEL_PREVIEW:'IS_PMI_SPECIMEN_LABEL_PREVIEW',
        IS_PMI_CASENO_ALIAS_GEN: 'IS_PMI_CASENO_ALIAS_GEN',
        PMI_CASENO_ALIAS_SHOW: 'PMI_CASENO_ALIAS_SHOW',
        IS_PMI_CASENO_WITH_ENCTR_GRP: 'IS_PMI_CASENO_WITH_ENCTR_GRP',
        IS_ATND_RESET_DISPLAY_CANCEL_STS:'IS_ATND_RESET_DISPLAY_CANCEL_STS',
        IS_ATND_GEN_ENCNTR_CHARGEABLE_CONTROL:'IS_ATND_GEN_ENCNTR_CHARGEABLE_CONTROL',
        FILTER_REPORT_BY_ROLE: 'FILTER_REPORT_BY_ROLE',
        IS_ENABLE_EFORM_ACCESS_CONTROL: 'IS_ENABLE_EFORM_ACCESS_CONTROL',
        ANA_DAYS_OF_WEEK_DEFAULT:'ANA_DAYS_OF_WEEK_DEFAULT',
        CMN_CERT_DH65_PRINT_QUEUE:'CMN_CERT_DH65_PRINT_QUEUE',
        SHS_ANA_WALK_IN_SKIN_RM_CD_DEFAULT: 'SHS_ANA_WALK_IN_SKIN_RM_CD_DEFAULT',
        TIMESLOT_PLAN_MAX_MODIFIABLE_YEARS: 'TIMESLOT_PLAN_MAX_MODIFIABLE_YEARS',
        TIMESLOT_PLAN_MAX_HANDLEABLE_SLOTS: 'TIMESLOT_PLAN_MAX_HANDLEABLE_SLOTS',
        REGISTRATION_USE_IDEAS: 'REGISTRATION_USE_IDEAS',
        PATIENT_LIST_USE_IDEAS: 'PATIENT_LIST_USE_IDEAS',
        USE_CUST_ATND_CERT_SESS: 'USE_CUST_ATND_CERT_SESS',
        CLC_ATND_CERT_RSN_DEFAULT: 'CLC_ATND_CERT_RSN_DEFAULT'
    },

    //waiting List status
    WAITING_LIST_STATUS_LIST: [
        { value: '*All', label: 'ALL' },
        { value: 'D', label: 'Cancelled' },
        { value: 'C', label: 'Completed' },
        { value: 'W', label: 'Waiting' }
    ],

    //attendance cert reason
    ATTENDANCE_CERT_FOR_LIST: [
        { label: 'Allied Health Service', value: 'AH' },
        { label: 'Blood tests', value: 'BT' },
        { label: 'Clinical assessment/study', value: 'CAS' },
        { label: 'Dental Consultation', value: 'DC' },
        { label: 'Drug injection', value: 'DI' },
        { label: 'Medical Consultation', value: 'MC' },
        { label: 'Radiological examination', value: 'RE' },
        { label: 'Specimen collection', value: 'SC' },
        { label: 'Transfusion', value: 'T' },
        { label: 'Vaccination', value: 'V' },
        { label: 'Wound care/dressing', value: 'WCD' },
        { label: 'Others', value: 'O' }
    ],

    //screening info
    PATIENT_SUMMARY_SCREENING_INFO_DELIVERY_MODE: [
        {label: 'Caesarean Section', value: 'CS'},
        {label: 'Forcep', value: 'Forcep'},
        {label: 'NSD', value: 'NSD'},
        {label: 'Vaccum', value: 'Vaccum'}
    ],

    ATTENDANCE_CERT_SESSION_LIST: [
        { label: 'AM', value: 'A' },
        { label: 'PM', value: 'P' },
        { label: 'Evening', value: 'E' },
        { label: 'Whole day', value: 'W' },
        { label: 'Range', value: 'R' },
        { label: 'Not Specified', value: 'N' }
    ],

    //system message severity code
    SYSTEM_MESSAGE_SEVERITY_CODE: {
        DATABASE: 'D',
        WARNING: 'W',
        APPLICATION: 'A',
        INFORMATION: 'I',
        QUESTION: 'Q',
        NETWORK: 'N'
    },

    //system ratio
    SYSTEM_RATIO_ENUM: {
        /**
         * 4:3 screen
         */
        RATIO1: '4:3 screen',
        /**
         * 5:4 screen
         */
        RATIO2: '5:4 scrren',
        /**
         * 16:9 screen
         */
        RATIO3: '16:9 screen'
    },

    //user role type
    USER_ROLE_TYPE: {
        COUNTER: 'C',
        NURSE: 'N',
        DOCTOR: 'D'
    },

    ATTENDANCE_STATUS: {
        ALL: '',
        ATTENDED: 'Y',
        NOT_ATTEND: 'N',
        CANCELLED:'C',
        ARRIVED:'A'
    },


    // ECS_BENEFIT_TYPE: [
    //     { label: 'GS', value: 'GS' },
    //     { label: 'HA', value: 'HA' },
    //     { label: 'Both', value: 'Both' }
    // ],
    // ECS_DIALOG_TYPES: { ecs: 'ecs', ocsss: 'ocsss', mwecs: 'mwecs' },
    // MWECS_ID_TYPE_KEYS: { hkid: 'id', otherDoc: 'od' },
    // MWECS_ID_TYPES: [
    //     {
    //         key: 'id',
    //         value: 'id',
    //         desc: 'HKID/HKBC'
    //     },
    //     {
    //         key: 'od',
    //         value: 'od',
    //         desc: 'Other Document'
    //     }
    // ],
    // MWECS_RESULT_TYPES: [
    //     {
    //         key: 'O',
    //         eligible: true,
    //         desc: 'Eligible by Higher OALA'
    //     },
    //     {
    //         key: 'C',
    //         eligible: true,
    //         desc: 'Eligible by CSSA'
    //     },
    //     {
    //         key: 'N',
    //         eligible: false,
    //         desc: 'Not eligible'
    //     },
    //     {
    //         key: 'E',
    //         eligible: false,
    //         desc: 'System Error'
    //     }
    // ],
    //attendance status list
    ATTENDANCE_STATUS_LIST: [
        { value: 'A', label: 'Arrived' },
        { value: 'Y', label: 'Attended' },
        { value: 'N', label: 'Not Attend' }
    ],

    //document type
    DOC_TYPE: {
        /**Adoption Certificate */
        ADOPTION_CERTIFICATE: 'AD',
        /**Birth Certificate - HK */
        BIRTH_CERTIFICATE_HK: 'BC',
        /**Exemption Certificate */
        EXEMPTION_CERTIFICATE: 'EC',
        /**HKID Card */
        HKID_ID: 'ID',
        /**Travel documents - PRC */
        TRAVEL_DOCUMENTS_PRC: 'OC',
        /**Travel documents - overseas */
        TRAVEL_DOCUMENTS_OVERSEAS: 'OP',
        /**One-way Permit */
        ONE_WAY_PERMIT: 'OW',
        /**Recognizance */
        RECONGIZANCE: 'RE',
        /**Re-entry Permit */
        RE_ENTRY_PERMIT: 'RP',
        /**Two-way Permit */
        TWO_WAY_PERMIT: 'TW',
        /**eHR document */
        EHR_DOCUMENT: 'ED',
        /**Macao ID card*/
        MACAO_ID_CARD: 'MD',
        /**Baby without HKBC */
        BABY_WITHOUT_HKBC: 'BABY',
        /**Mother ID of Baby */
        MOTHER_ID_OF_BABY: 'MIDB'
    },

    CASE_DIALOG_STATUS: {
        CREATE: 'CREATE',
        EDIT: 'EDIT'
    },
    CASE_STATUS: {
        ACTIVE: 'A',
        CLOSE: 'C',
        CANCEL: 'D',
        RECORD_DISPOSAL: 'R'
    },

    CASE_STATUS_LIST: [
        { label: 'Active', value: 'A', promptUpStr: 'Active' },
        { label: 'Close', value: 'C', promptUpStr: 'Closed' },
        { label: 'Cancel', value: 'D', promptUpStr: 'Canceled' },
        { label: 'Record Disposal', value: 'R', promptUpStr: 'Disposaled' }
    ],

    CASE_NO_GEN_ACTION:{
        NOT_GEN:'NOT_GEN',
        EXISTING:'EXISTING',
        GEN_WITH_ALIAS:'GEN_WITH_ALIAS',
        FHS_GEN_CASE:'FHS_GEN_CASE'
    },

    APPOINTMENT_LIST_TYPE: {
        APPOINTMENT_LIST: 'APPOINTMENT_LIST',
        APPOINTMENT_HISTORY: 'APPOINTMENT_HISTORY'
    },

    APPOINTMENT_TYPE: {
        BOOKING: 'Booking',
        TAKE_ATTENDANCE: 'Take Attendance',
        BACK_TAKE_ATTENDANCE: 'Back-take Attendance',
        WALK_IN: 'Walk-in'
    },

    ACCESS_RIGHT_TYPE: {
        FUNCTION: 'function',
        BUTTON: 'button',
        REPORT: 'report',
        CODE_ACCESS: 'code',
        EFORM: 'eform'
    },
    ACCESS_RIGHT_RIGHT_SELECTION: {
        PRIVILEGES_RIGHT :{
            ACCESS_RIGHT_CODE : 'F9999',
            ACCESS_RIGHT_MAP : [{ accessRightCd: 'F9999', accessRightName: 'Privileges' }]
        },
        CODE_ACCESS_RIGHT :{
            ACCESS_RIGHT_CODE : 'C9999',
            ACCESS_RIGHT_MAP : [{ accessRightCd: 'C9999', accessRightName: 'Code Access' }]
        },
        REPORT_RIGHT :{
            ACCESS_RIGHT_CODE : 'R9999',
            ACCESS_RIGHT_MAP : [{ accessRightCd: 'R9999', accessRightName: 'Report' }]
        },
        EFORM_RIGHT: {
            ACCESS_RIGHT_CODE : 'E001',
            ACCESS_RIGHT_MAP : [{ accessRightCd: 'E001', accessRightName: 'E-Form' }]
        }
    },
    //ecs interface related
    ECS_BENEFIT_TYPE: [
        { label: 'GS', value: 'GS' },
        { label: 'HA', value: 'HA' },
        { label: 'Both', value: 'Both' }
    ],
    ECS_DIALOG_TYPES: { ecs: 'ecs', ocsss: 'ocsss', mwecs: 'mwecs' },
    MWECS_ID_TYPE_KEYS: { hkid: 'id', otherDoc: 'od' },
    MWECS_ID_TYPES: [
        {
            key: 'id',
            value: 'id',
            desc: 'HKID/HKBC'
        },
        {
            key: 'od',
            value: 'od',
            desc: 'Other Document'
        }
    ],
    MWECS_RESULT_TYPES: [
        {
            key: 'O',
            eligible: true,
            desc: 'Eligible by Higher OALA (Higher Old Age Living Allowance)'
        },
        {
            key: 'C',
            eligible: true,
            desc: 'Eligible by CSSA (Comprehensive Social Security Assistance)'
        },
        {
            key: 'G',
            eligible: true,
            desc: 'Eligible by Higher OALA (Guangdong Scheme)'
        },
        {
            key: 'F',
            eligible: true,
            desc: 'Eligible by Higher OALA (Fujian Scheme)'
        },
        {
            key: 'N',
            eligible: false,
            desc: 'Not eligible'
        },
        {
            key: 'E',
            eligible: false,
            desc: 'System Error'
        }
    ],
    ECS_CLINIC_CONFIG_KEY: {
        ECS_SERVICE_STATUS: 'ECS_SERVICE_STATUS',
        OCSSS_SERVICE_STATUS: 'OCSSS_SERVICE_STATUS',
        MWECS_SERVICE_STATUS: 'MWECS_SERVICE_STATUS',
        SHOW_ECS_BTN_IN_BOOKING: 'BOOKING_SHOW_ECS_BTN'
    },
    SECTION_TYPE: {
        AM: 'AM',
        PM: 'PM',
        NOTSPECIFY: 'NOTSPECIFY'
    },

    //registration  waiver status
    WAIVER_STATUS: {
        NEVER_USED: 'N',
        USED: 'U',
        INVALID: 'C',
        DELETE: 'D'
    },
    WAIVER_STATUS_CODELIST: [
        { code: 'N', engDesc: 'Never' }, //TEAMCDE4-329: Update
        { code: 'U', engDesc: 'Used' },
        { code: 'C', engDesc: 'Cancel' }, //TEAMCDE4-329: Update
        { code: 'D', engDesc: 'Delete' }
    ],
    CERT_NO_OF_COPY: [
        { value: 1, desc: '1' },
        { value: 2, desc: '2' },
        { value: 3, desc: '3' },
        { value: 4, desc: '4' },
        { value: 5, desc: '5' }
    ],
    SHARE_WITH_LIST: [
        { code: 'A', label: 'All Services' },
        { code: 'S', label: 'This Service Only' },
        { code: 'C', label: 'This Clinic Only' }
    ],

    //patient search type
    PATIENT_SEARCH_TYPE: [
        { code: 'ID', label: 'HKID Card', searchType: 'ID', minLength: 8 },
        { code: 'BC', label: 'HKBC', searchType: 'BC', minLength: 8 },
        { code: 'BWBC', label: 'Baby without HKBC', searchType: 'BABY', minLength: 8 },
        { code: 'PMI', label: 'PMI No.', searchType: 'PMI No.', minLength: 10 },
        { code: 'CASENO', label: 'Case No.', searchType: 'Case No.', minLength: 13 },
        { code: 'DOCNO', label: 'Document No.', searchType: 'Document No.', minLength: 6 },
        { code: 'NAME', label: 'Patient Name', searchType: 'Patient Name', minLength: 4 },
        { code: 'PHONE', label: 'Telephone No.', searchType: 'Telephone No.', minLength: 8 },
        { code: 'EMAIL', label: 'Email', searchType: 'Email', minLength: 5 }
    ],

    // Vaccine Certificate - Vaccine Type
    VACCINE_TYPE: [
        { code: 'YF', label: 'Yellow Fever' },
        { code: 'PO', label: 'Poliomyelitis' }
    ],

    CASE_SELECTOR_STATUS: {
        OPEN: 'OPEN',
        CLOSE: 'CLOSE',
        NO_NEED: 'NO_NEED'
    },

    //appointment type
    APPOINTMENT_TIME_TYPE: {
        CURRENT: 'CURRENT',
        PAST: 'PAST',
        FUTURE: 'FUTURE'
    },

    APPOINTMENT_LABELS: {
        QUOTA_TYPE: 'Quota Type',
        CASE_TYPE: 'Case Type'
    },
    RELATIONSHIP_WITH_ASSOCIATED_PERSON: [
        {
            code: 'S',
            engDesc: 'Spouse'
        },
        {
            code: 'F',
            engDesc: 'Father'
        },
        {
            code: 'M',
            engDesc: 'Mother'
        }
    ],
    AN_SERVICE_ID_LANGUAGE_PREFERRED_MAP:[
        {
            code:'T',
            engDesc:'Traditional Chinese'
        },
        {
            code:'S',
            engDesc:'Simplified Chinese'
        },
        {
            code:'E',
            engDesc:'English'
        }
    ],

    AN_SERVICE_ID_LANGUAGE_PREFERRED:{
        TRADITIONAL_CHINESE:'T',
        SIMPLIFIED_CHINESE:'C',
        ENGLISH:'E'
    },

    WORKSTATION_PARAM_NAME:{
        IS_PMI_GUM_LABEL_PREVIEW:'IS_PMI_GUM_LABEL_PREVIEW',
        IS_PMI_SPECIMEN_LABEL_PREVIEW:'IS_PMI_SPECIMEN_LABEL_PREVIEW',
        IS_SPP_PMI_SMALL_LABEL_PREVIEW:'IS_SPP_PMI_SMALL_LABEL_PREVIEW'
	},
    //statistical report status enum
    STATISTICAL_RPT_STS:{
        PENDING:'Pending',
        Completed:'Completed',
        Failed:'Failed'
    },
    //SPP service default tracing contact history page operation type
    SPP_DLFT_TRC_CNCT_HX_OP_TYPE:{
        LIST:'List',
        ADD:'Add',
        UPDATE:'Update',
        DEL:'Del'
    },

    BASE_ROLE_AHPS: {
        CPY: 'CIMS-CP',
        Dietitian: 'CIMS-DIETITIAN',
        OT: 'CIMS-OT',
        PT: 'CIMS-PT',
        AlliedHealth: 'CIMS-AH'
    }
};

export default Enum;

export const PATIENT_LIST_SEARCH_NEXT_ACTION = {
    ATTENDANCE: 'attendance',
    SUMMARY: 'summary',
    SELECT: 'select',
    PATIENT_LIST: 'patientList',
    SEARCH_PATIENT: 'searchPatient',
    SEARCH_APPOINTMENT: 'searchAppointment'
};

export const APPT_TYPE_CODE = {
    NORMAL: {
        code: 'N',
        engDesc: 'Normal'
    },
    RE_SCHEDULED: {
        code: 'R',
        engDesc: 'Re-scheduled'
    },
    REPLACED: {
        code: 'P',
        engDesc: 'Replaced'
    },
    DELETED: {
        code: 'D',
        engDesc: 'Deleted'
    },
    WALK_IN: {
        code: 'W',
        engDesc: 'Walk-in'
    }
};

export const SERVICE_CODE = {
    TBC: 'TBC',
    ANT: 'ANT',
    EHS: 'EHS'
};

export const PATIENT_STATUS = {
    GS: 'G',
    DGS: 'S',
    HA: 'H',
    DHA: 'A',
    GENERAL_PUBLIC: 'P',
    OTHERS: 'O'
};

export const FEE_COLLECTION_PAGE = {
    home: 'home',
    dayBegin: 'dayBegin',
    dayEnd: 'dayEnd',
    reports: 'reports',
    txnEnquiry: 'txnEnquiry',
    collectionTotalEnquiry: 'collectionTotalEnquiry',
    collectionJournal: 'collectionJournal',
    cancelTxnAndEditRemarks: 'cancelTxnAndEditRemarks',
    feeCollectionMaintenance: 'feeCollectionMaintenance',
    invalidUsedWaiver: 'invalidUsedWaiver',
    openShroff: 'openShroff',
    closeShroff: 'closeShroff'
};

export const FEE_MAINTENANCE_PAGE = {
    feeCodeMaintenance: 'feeCodeMaintenance',
    allocationCodeMaintenance: 'allocationCodeMaintenance',
    paymentMethodEnquiry: 'paymentMethodEnquiry',
    gfmisRoleMappingMaintenance: 'gfmisRoleMappingMaintenance',
    machineRecordMappingMaintenance: 'machineRecordMappingMaintenance'
};

export class FEE_CODE_MAINTANCE_WAIVER {
    static list = [
        { code: 'P', engDesc: 'Payment' },
        { code: 'W', engDesc: 'Waiver' }
    ];
    static getEngDesc = (code) => getEngDesc(this.list, code);
}

export class FEE_CODE_MAINTANCE_NEP {
    static list = [
        { code: 'E', engDesc: 'EP' },
        { code: 'N', engDesc: 'NEP' },
        { code: 'O', engDesc: 'Others' },
        { code: 'A', engDesc: 'All' }
    ];
    static getEngDesc = (code) => getEngDesc(this.list, code);
}

export class FEE_CODE_MAINTANCE_FEE_TYPE {
    static list = [
        { code: 'C', engDesc: 'Consultation/Treatment Fee' },
        { code: 'P', engDesc: 'Prescription Fee' },
        { code: 'O', engDesc: 'Others Fee' },
        { code: 'A', engDesc: 'All' }
    ];
    static getEngDesc = (code) => getEngDesc(this.list, code);
}

export class GFMIS_ROLE_MAPPING {
    static list = [
        { code: 'P', engDesc: 'Preparer' },
        { code: 'A', engDesc: 'Approver' }
    ];
    static RCP_SHROFF_OPERATOR = 'RCP_SHROFF_OPERATOR';
    static RCP_SHROFF_SUPERVISOR = 'RCP_SHROFF_SUPERVISOR';
    static RCP_SHROFF_ADMIN = 'RCP_SHROFF_ADMIN';
    static getEngDesc = (code) => getEngDesc(this.list, code)
}

export const PRINTER_TRAY_TYPE={
    YF:'PRINTER_TRAY_YF_CERT',
    GUM_LABEL:'PRINTER_TRAY_GUM_LABEL',
    SPECIMEN_LABEL:'PRINTER_SPECIMEN_LABEL',
    VACC:'PRINTER_TRAY_VACC_CERT',
    OTHER:'PRINTER_TRAY_A4'
};

export const SPECIAL_NEEDS_ID = {
    SPECIAL_NEED_CATG: '10376',
    SPECIAL_NEED_SUB_CATG: '10566'
};

export const PAPER_SIZE_TYPE={
    SPECIMEN_LABEL:'PAPER_SPECIMEN_LABEL',
    GUM_LABEL:'PAPER_SIZE_GUM_LABEL',
    VACC:'PAPER_SIZE_VACC_CERT'
};

export const ExportTypeOptions = [
    { value: 'PDF', label: 'PDF' },
    { value: 'CSV', label: 'CSV' },
    { value: 'XLSX', label: 'EXCEL' }
];

export const filterRoomsEncounterTypeSvc = ['EHS'];

export const ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC = ['SPP'];

export const DEFAULTER_TRACING_RANGE = [
    { value: 3, label: '3' },
    { value: 6, label: '6' },
    { value: 9, label: '9' },
    { value: 12, label: '12' },
    { value: 24, label: '24' },
    { value: 36, label: '36' }
];
export const EHS_SHARED_COMPONENT_SPA_CONFIG = {
    accessRightCd: 'EHS_SHARED_COMPONET',
    isPatRequired: 'N',
    spaEntryPath: '/index/spa-ehs/sharedComponentsSingleSpaEntry.js',
    spaCssPath: '/index/spa-ehs/sharedComponentsSingleSpaEntry.css',
    spaStorePath: '/index/spa-ehs/sharedComponentsStore.js',
    spaPrefix: 'spa-ehs'
};

export const EHS_CONSTANT = {
    NON_MEMBER_STATUS: 'N',
    MEMBER_STATUS_WAITING: 'W',
    MEMBER_STATUS: 'M',
    MEMBER_STATUS_CANCEL: 'C',
    MEMBER_STATUS_UNKNOWN: null,
    MEMBER_STATUS_TRANSFER: 'T',
    ROOM_AHPS: {
        CPY: 'AH_CPY',
        Dietitian: 'AH_DT',
        OT: 'AH_OT',
        PT: 'AH_PT',
        AlliedHealth: 'AH'
    },
    IS_SPOUSE_EHC_CLINET_OPTIONS: [
        { label: 'YES', value: 1 },
        { label: 'NO', value: 0 }
    ],
    SMS_CHINESE: 'C',
    SMS_ENGLISH: 'E',
    SMS_NOCONSENT: 'N',
    SMS_REJECTED: 'X',
    SMS_OPTIONS: [
        { label: 'Chinese', value: 'C' },
        { label: 'English', value: 'E' },
        { label: 'No Consent', value: 'N' },
        { label: 'Rejected', value: 'X' }
    ]
};

