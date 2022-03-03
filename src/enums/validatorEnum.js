import CommonRegex from '../constants/commonRegex';

const ValidatorEnum = {
    required: 'required',
    matchRegexp: (regexp) => { return 'matchRegexp:' + regexp; },
    isEmail: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_EMAIL,
    isDHEmail: 'matchRegexp:' + CommonRegex.VALIDATION_DH_EMAIL,
    isHAEmail: 'matchRegexp:' + CommonRegex.VALIDATION_HA_EMAIL,
    isEmpty: 'isEmpty',
    trim: 'trim',
    isEnglish: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_ENGLISH,
    isEnglishOrSpace: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_ENGLISH_OR_SPACE,
    isEnglishOrNumber: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_ENGLISH_OR_NUMBER,
    isEnglishOrNumberOrSpace: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_ENGLISH_OR_NUMBER_OR_SPACES,
    isChinese: 'isChinese',
    isNoChinese: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_NOCHINESE,/* Can only enter single byte*/
    isNumber: 'isNumber',
    phoneNo: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_PHONENO,
    hkPhoneNo: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_HKPHONENO,
    isFloat: 'isFloat',
    isPositive: 'isPositive',
    isPositiveInteger: 'isPositiveInteger',
    isPositiveInt: 'isPositiveInt',
    minNumber: (min) => { return 'minNumber:' + min; },
    maxNumber: (max) => { return 'maxNumber:' + max; },
    minFloat: (min) => { return 'minFloat:' + min; },
    maxFloat: (max) => { return 'maxFloat:' + max; },
    minStringLength: (length) => { return 'minStringLength:' + length; },
    maxStringLength: (length) => { return 'maxStringLength:' + length; },
    equalStringLength: (length) => { return 'equalStringLength:' + length; },
    isString: 'isString',
    maxFileSize: (max) => { return 'maxFileSize:' + max; },
    allowedExtensions: (fileTypes) => { return 'allowedExtensions:' + fileTypes; },
    isDecimal: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_DECIMAL_15_4,
    codeVerification: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_CODEVERIFICATION, /*At least two words, the first one is a letter, and the back can also be a letter or number */
    isSpecialEnglish: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_SPECIAL_ENGLISH,//Match the beginning of the letter, and contain [letter][,][-]['][.][space][`][/][@][(][)][:][*] character
    isEnglishWarningChar: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_SPECIAL_ENGLISH_WARNING,//Match the [@][(][)][:][*] character
    isEnglishWarnningCharWithBabyName: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_SPECIAL_ENGLISH_WARNING_WITH_BABY_NAME,
    isHkid: 'isHkid',
    isExpiryDate: 'isExpiryDate',
    period: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_PERIOD,
    isPositiveIntegerWithoutZero: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_POSITIVE_INTEGER,
    isPositiveIntegerWithZero: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_ZERO_INTEGER,
    isRightMoment: 'isRightMoment',
    maxDate: max => `maxDate:${max}`,
    minDate: min => `minDate:${min}`,
    maxTime: max => `maxTime:${max}`,
    minTime: min => `minTime:${min}`,
    isCommonEnglishInput: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_COMMON_ENGLISH_INPUT,
    isCaseNO: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_IS_CASE_NO,
    // isPhoneSearch: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_IS_PHONE_SEARCH,
    isHKMobilePhone: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_HKPHONENO, //CIMST-3391 remove validation checking of "Mobile" & "Mobile SMS", except checking 8 digits
    hasSameValue: 'hasSameValue',
    cmpValue: 'cmpValue',
    loginName: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_LOGIN_NAME,
    errorLoginName: 'matchErrorRegexp:' + CommonRegex.VALIDATION_REGEX_ERROR_LOGIN_NAME,
    isPeriodValid: 'isPeriodValid',
    isSamePasscode: 'isSamePasscode',
    isSamePasscodeInGeneralInfo:'isSamePasscodeInGeneralInfo',
    userRoleName: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_USER_ROLE_NAME,
    number1To10: 'matchRegexp:' + CommonRegex.VALIDATION_REGEX_1_TO_10
};

export default ValidatorEnum;