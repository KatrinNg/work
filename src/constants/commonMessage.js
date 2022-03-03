import * as MessageUtil from '../utilities/messageUtilities';
const CommonMessage = {
    VALIDATION_NOTE_REQUIRED: () => MessageUtil.getMessageDescriptionByMsgCode('110001') || 'This field is required!',
    VALIDATION_NOTE_NUMBERFIELD: () => MessageUtil.getMessageDescriptionByMsgCode('110002') || 'This field must be a number!',
    VALIDATION_NOTE_FLOATFIELD: () => MessageUtil.getMessageDescriptionByMsgCode('110003') || 'This field must be a float!',
    VALIDATION_NOTE_POSITIVE_INTEGER: () => MessageUtil.getMessageDescriptionByMsgCode('110004') || 'This field must be a positive integer!',
    VALIDATION_NOTE_ENGLISHFIELD: () => MessageUtil.getMessageDescriptionByMsgCode('110005') || 'This field must fill by english!',
    VALIDATION_NOTE_CHINESEFIELD: () => MessageUtil.getMessageDescriptionByMsgCode('110006') || 'This field must fill by chinese!',
    VALIDATION_NOTE_OVERMAXWIDTH: () => MessageUtil.getMessageDescriptionByMsgCode('110007') || 'This field has been over length!',
    VALIDATION_NOTE_BELOWMINWIDTH: () => MessageUtil.getMessageDescriptionByMsgCode('110008') || 'This field is must be greater than %LENGTH% digits!',
    VALIDATION_NOTE_EMAILFIELD: () => MessageUtil.getMessageDescriptionByMsgCode('110009') || 'Email is invalid!',
    VALIDATION_NOTE_DHEMAIL: () => MessageUtil.getMessageDescriptionByMsgCode('110334') || 'Email address must end with gov.hk or hksarg',
    VALIDATION_NOTE_HAEMAIL: () => MessageUtil.getMessageDescriptionByMsgCode('110371') || 'Email address must end with @ha.org.hk or gov.hk or hksarg',
    VALIDATION_NOTE_HKIDORDOCUMENTNUMBER: () => MessageUtil.getMessageDescriptionByMsgCode('110010') || 'HKIC or documThis field must be a number or english and no spaces.ent number is required.',
    VALIDATION_NOTE_ENGLISH_OR_NUM: () => MessageUtil.getMessageDescriptionByMsgCode('110011') || 'Only English and numbers are allowed.',
    VALIDATION_NOTE_ENGLISH_OR_Number_OR_SPACE: () => MessageUtil.getMessageDescriptionByMsgCode('110025') || 'Only English, spaces, and numbers are allowed.',
    VALIDATION_NOTE_IS_NO_CHINESE: () => MessageUtil.getMessageDescriptionByMsgCode('110012') || 'Chinese characters are not allowed!',
    VALIDATION_NOTE_HKIC_FORMAT_ERROR: (value = 'HKID') => (MessageUtil.getMessageDescriptionByMsgCode('110013') || 'Please enter the correct %DOC_TYPE% format.').replace('%DOC_TYPE%', value),
    VALIDATION_NOTE_SPECIAL_ENGLISH: () => MessageUtil.getMessageDescriptionByMsgCode('110014') || 'This field must be filled by [letter][number][,][-][\'][.][space][`][/][@][(][)][:][*] character.',
    VALIDATION_NOTE_USER_ROLE_NAME: () => MessageUtil.getMessageDescriptionByMsgCode('110070') || 'This field must be filled by [letter][number][,][-][\'][.][space][`][/][@][(][)][:][*][_] character.And [_] character can not be in the front or the back.',
    WARNING_NOTE_SPECIAL_ENGLISH: () => MessageUtil.getMessageDescriptionByMsgCode('110015') || 'It is not recommended to be filled by[@][(][)][:][*][/] characters',
    VALIDATION_NOTE_IS_EXPIRY_DATE: () => MessageUtil.getMessageDescriptionByMsgCode('110017') || 'This date is expiry date.',
    VALIDATION_NOTE_INVALID_PREIOD: () => MessageUtil.getMessageDescriptionByMsgCode('110026') || 'Only can input half or whole period.',
    VALIDATION_NOTE_PHONE_NO: () => MessageUtil.getMessageDescriptionByMsgCode('110027') || 'Incorrect phone number.',
    VALIDATION_NOTE_HK_PHONE_NO: () => MessageUtil.getMessageDescriptionByMsgCode('110028') || 'Hong Kong phone number must be an 8-digit number, and start with 5, 6, 7, 9.',
    VALIDATION_NOTE_PHONE_BELOWMINWIDTH: () => MessageUtil.getMessageDescriptionByMsgCode('110024') || 'Please enter a 8-digit phone number.',  //CIMST-3391 remove validation checking of "Mobile" & "Mobile SMS", except checking 8 digits
    VALIDATION_NOTE_DECIMALFIELD: () => MessageUtil.getMessageDescriptionByMsgCode('110029') || 'This field must be a decimal.Up to 11 positive integers, up to 4 decimal places behind the decimal point.',
    VALIDATION_CODE_VALIDATION: () => MessageUtil.getMessageDescriptionByMsgCode('110030') || 'At least two words, the first one is the letter.',
    FORGET_PASSWORD_DIALOG_SUCCESS_TITLE: () => 'Email Notification', //CIMSPM-206 Update forgot password dialog message
    FORGET_PASSWORD_DIALOG_SUCCESS_CONTENT_TEXT: () => 'Email was sent successfully. Please check the email account of', //CIMSPM-206 Update forgot password dialog message
    FORGET_PASSWORD_DIALOG_FAILURE_TITLE: () => 'Email Notification Failure', //CIMSPM-206 Update forgot password dialog message
    VALIDATION_NOTE_POSITIVE_INTEGER_WITHOUT_ZERO: () => 'This field must be a positive integer and more than 0.',
    VALIDATION_NOTE_POSITIVE_INTEGER_WITH_ZERO: () => 'This field must be a positive integer or 0.',
    LOGIN_INVALID: () => MessageUtil.getMessageDescriptionByMsgCode('110324') || 'User or password is invalid!',
    LOGIN_EXPIRED: () => MessageUtil.getMessageDescriptionByMsgCode('110332') || 'User has expired!',
    LOGIN_LOCKED: () => MessageUtil.getMessageDescriptionByMsgCode('110326') || 'User has locked!',
    LOGIN_TEMPORARY_PASSWORD_EXPIRED: () => MessageUtil.getMessageDescriptionByMsgCode('110325') || 'Temporary Password has Already Expiry!',
    LOGIN_ROLE_INVALID: () => MessageUtil.getMessageDescriptionByMsgCode('110333') || 'User Role is invalid!',
    LOGIN_PASSWORD_NOT_EFFECTIVE: () => MessageUtil.getMessageDescriptionByMsgCode('110399') || 'The password is not effective!',

    FORGET_PASSWORD_NOT_EXISTED: () => MessageUtil.getMessageDescriptionByMsgCode('110327') || 'Records do not exist!',
    FORGET_PASSWORD_EXPIRED: () => MessageUtil.getMessageDescriptionByMsgCode('110328') || 'User has expired!',
    FORGET_PASSWORD_LOCKED: () => MessageUtil.getMessageDescriptionByMsgCode('110329') || 'User has locked!',
    FORGET_PASSWORD_EMAIL_BLANK: () => MessageUtil.getMessageDescriptionByMsgCode('110330') || 'No phone number for this user!',
    FORGET_PASSWORD_PHONE_BLANK: () => MessageUtil.getMessageDescriptionByMsgCode('110331') || 'No email for this user!',
    FORGET_PASSWORD_INITIAL: () => 'User\'s status is initial',
    FORGET_PASSWORD_NOT_ASSIGNED: () => 'Not assigned to the corresponding service',
    FORGET_PASSWORD_VERIFIER_INACTIVE: () => 'Verifier inactive',
    FORGET_PASSWORD_VERIFIER_PASSSWORD_INCORRECT: () => 'Verifier\'s password is not correct',
    FORGET_PASSWORD_NO_RIGHT_ACCESS: () => 'No right to access',
    FORGET_PASSWORD_SAME_NAME: () => 'Login Name and Verifier\'s Login Name cannot be the same',
    FORGET_PASSWORD_NAME_NOT_EXISIT_INVALID: () => 'Your Log-in Name does not exist/is invalid. Please retry.',
    FORGET_PASSWORD_NAME_PASSWORD_INCORRECT: () => 'Incorrect login name / password',
    RETRIEVAL_IVRS_FILE_TYPE: () => MessageUtil.getMessageDescriptionByMsgCode('110132') || 'Invalid file type!',
    RETRIEVAL_IVRS_FILE_SIZE: () => MessageUtil.getMessageDescriptionByMsgCode('110133') || 'Invalid file size!',
    RETRIEVAL_IVRS_FILE_FORMAT: () => MessageUtil.getMessageDescriptionByMsgCode('110152') || 'Invalid file format!',
    VALIDATION_NOTE_IS_SPECIFIC_PHONE: (phoneType, str) => (MessageUtil.getMessageDescriptionByMsgCode('110050') || '%PHONE_TYPE% phone must start with %REPLACE_STR%')
        .replace('%PHONE_TYPE%', phoneType)
        .replace('%REPLACE_STR%', str),
    VALIDATION_NOTE_HAS_SAME_VALUE: () => MessageUtil.getMessageDescriptionByMsgCode('110051') || '%VALUE_A% should be different from %VALUE_B%.',
    NON_LOGIN_USER_REQUIRED:()=>'Approver cannot be the same as login user.',
    LOGIN_USER_INACTIVE:'User is inactive!',
    LOGIN_USER_DELETED:'User has been deleted!',
    LOGIN_USER_NOT_ASSIGNED_SVC_OR_SITE: () => MessageUtil.getMessageDescriptionByMsgCode('110055') || 'User haven\'t assigned current service or site.',
    LOGIN_USER_GENERATE_TOKEN_ERROR: () => MessageUtil.getMessageDescriptionByMsgCode('110056') || 'Generate token error.',
    LOGIN_USER_REDIS_CONFLICT: () => MessageUtil.getMessageDescriptionByMsgCode('110057') || 'The system detected an active session at same/another CIMS work station.',
    VALIDATION_NOTE_BELOWMAXWIDTH: (len) => 'This field is must be less than %LENGTH% digits!'.replace('%LENGTH%', len),
    /** Date validation note */
    VALIDATION_NOTE_INVALID_MOMENT: () => MessageUtil.getMessageDescriptionByMsgCode('110016') || 'Invalid Date Format.',
    VALIDATION_NOTE_MAX_DATE: (maxDate) => `Date should not be greater than ${maxDate}.`,
    VALIDATION_NOTE_MIN_DATE: (minDate) => `Date should not be earlier than ${minDate}.`,
    VALIDATION_NOTE_APPOINTMENT_MIN_DATE: () => 'The earliest date must be greater than Today.',
    VALIDATION_NOTE_EFFECTIVE_MAX_DATE: () => 'Date should not be after Expiry Date.',
    VALIDATION_NOTE_DISABLE_FUTURE: () => 'Date should not be greater than today.',
    VALIDATION_NOTE_DISABLE_PAST: () => 'Date should not be less than today.',
    VALIDATION_NOTE_DATE_MUST_EARLIER: (dateA, dateB) => `${dateA} must be earlier than ${dateB}`,
    VALIDATION_NOTE_DATE_MUST_LATER: (dateA, dateB) => `${dateA} must be later than ${dateB}`,
    VALIDATION_NOTE_DATE_NOT_LATER: (dateA, dateB) => `${dateA} cannot be later than ${dateB}`,
    VALIDATION_NOTE_DATE_NOT_EARLIER: (dateA, dateB) => `${dateA} cannot be earlier than ${dateB}`,
    VALIDATION_NOTE_DATE_MUST_LATER_OR_EQUAL: (dateA, dateB) => `${dateA} must be later or equal to ${dateB}`,
    VALIDATION_NOTE_DATE_MUST_AFTER_OR_EQUAL: (dateA, dateB) => `${dateA} must be after or equal to ${dateB}`,
    VALIDATION_NOTE_DATE_DISABLED_DATE: () => 'You are not allowed to choose this day',
    /** Date validation note */

    /**Patient search input error message start */
    VALIDATION_NOTE_SEARCH_TYPE_BELOW_MINLENGTH: () => MessageUtil.getMessageDescriptionByMsgCode('110048') || '%SEARCH_TYPE% search value is less than %MIN_LENGTH% chars.',
    VALIDATION_NOTE_SEARCH_TYPE_FORMAT_ERROR: () => MessageUtil.getMessageDescriptionByMsgCode('110049') || 'Please enter the correct %SEARCH_TYPE% format.',
    /**Patient search input error message end */

    /** Baby Information calulator */
    VALIDATION_NOTE_BABYINFO_BIRTHORDER: () => 'This field should not be more than Total No. of Birth(s) for this Pregnancy.',
    VALIDATION_NOTE_BABYINFO_MOTHEREPISODENUMOFBIRTH: () => 'This field should not be less than Birth Order.',
    /** Baby Information calulator */

    /** User Account */
    VALIDATION_NOTE_EFFECTIVE_DATE: () => MessageUtil.getMessageDescriptionByMsgCode('110335') || 'Effective date must be later or equal to today, and before or equal to expiry date',
    VALIDATION_NOTE_EXPIRY_DATE: () => MessageUtil.getMessageDescriptionByMsgCode('110336') || 'Expiry date must be after or equal to current date and effective date',
    // VALIDATION_NOTE_LOGIN_NAME: () => MessageUtil.getMessageDescriptionByMsgCode('110337') || 'Login name must contains only alphanumeric charactor',
    VALIDATION_NOTE_LOGIN_NAME: () => MessageUtil.getMessageDescriptionByMsgCode('110337') || 'Invalid Login Name',
    VALIDATION_NOTE_ERROR_LOGIN_NAME: () => MessageUtil.getMessageDescriptionByMsgCode('110338') || 'Add user account failure. Do not use continuing spaces or leading/trailing spaces',
    VALIDATION_NOTE_USER_ENGLISH_NAME: () => MessageUtil.getMessageDescriptionByMsgCode('110345') || 'English surname and given name must contain only alphabet or space.',

    /** Encounter type management */
    ENCTMAN_MINIMUM_INTERVAL: () => MessageUtil.getMessageDescriptionByMsgCode('110349') || 'Minimum time interval to be allowed in between two appointments with this encounter type. Set 0 mean no limitation.',
    ENCTMAN_MAXIMUM_TIMESLOT: () => MessageUtil.getMessageDescriptionByMsgCode('110350') || 'Allow to book max. number of slots in one Appt. Booking.',
    ENCTMAN_MINIMUM_DATE: () => MessageUtil.getMessageDescriptionByMsgCode('110370') || 'Minimum date must be later than effective start date.',

    /** Forget Password Error Message */
    REQUIRE_LOGIN_NAME: () => 'Please input login name',
    REQUIRE_VERIFIER_NAME: () => 'Please input verifier’s login name',
    REQUIRE_VERIFIER_PASSWORD: () => 'Please input verifier’s Password',


    /** sick leave cert period */
    PERIOD_SHOULD_BE_POINT5_TIMES: () => 'Period shoud be 0.5 times and greater than 0.',

    /** Redistribution error message */
    SELECTED_DATE_BEFORE_TODAY: () => 'Selected date cannot be before Today.',

    /**Idle login in token expiry */
    SESSION_HAS_EXPIRED: () => MessageUtil.getMessageDescriptionByMsgCode('110058') || 'Your session has expired.',

    /**Timeslot Management start time and end time */
    START_TIME_EARLIER: () => MessageUtil.getMessageDescriptionByMsgCode('110059') || 'Start Time must be earlier than End Time',

    /**change passcode */
    VALIDATION_PASSCODE_CHARACTORS: () => MessageUtil.getMessageDescriptionByMsgCode('111801') || 'The passcode shall be composed of five characters.',
    VALIDATION_SAME_PASSCODE: () => MessageUtil.getMessageDescriptionByMsgCode('111802') || 'The two passcodes must be the same.',

    /**Gestation Calc Dialog */
    VALIDATION_GEST_DIFF_ERROR: () => 'End gest is less than start gest.',

    VALIDATION_ALIAS_SEQ_ERROR: () => MessageUtil.getMessageDescriptionByMsgCode('110071') || 'Please enter a positive number. (Example format: %FORMAT%)',
    VALIDATION_MAX_NUMBER: (max) => `The maximum input value is ${max}.`,
    VALIDATION_MIN_NUMBER: (min) => `The minimum input value is ${min}.`,

    /**multiple update slots */
    VALIDATION_SESSION_NOT_IN_RANGE: () => 'Session is not in Start time / End time Range',
    VALIDATION_WEEKLY_MUST_CHOOSE_AT_LEAST_ONE: () => 'Weekly must choose at least one option.',
    VALIDATION_SESSION_MAX_DATE_RANGE: (range) => (MessageUtil.getMessageDescriptionByMsgCode('111303') || '').replace('%DATERANGE%', range) || `Please select the date range within ${range} days.`,

    /**max characters warning */
    VALIDATION_MAX_CHARACTERS: (maxLen) => `Not allow to input more than ${maxLen} characters.`,

    /**reset attendance link tooltip */
    RESET_ATTENDANCE_TOOLTIP:()=>MessageUtil.getMessageDescriptionByMsgCode('111016')||'Once reset attendance, “Cancelled” status would be showed in appointment history. ',

    VALIDATION_MAX_WEEK: (max) => `The maximum WEEK value is ${max}.`,
    VALIDATION_MIN_WEEK: (min) => `The minimum WEEK value is ${min}.`,
    VALIDATION_MAX_DAY: (max) => `The maximum DAY value is ${max}.`,
    VALIDATION_MIN_DAY: (min) => `The minimum DAY value is ${min}.`,

    VALIDATION_NUMBER_1_TO_10: () => MessageUtil.getMessageDescriptionByMsgCode('110075') || 'Please enter a value between 1 and 10.',

    TIMESLOT_PLAN_RESET_APPLIED: 'Timeslot Plan Reset Applied (Not Saved).'

};

export default CommonMessage;
