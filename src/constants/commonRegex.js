const CommonRegex = {
    VALIDATION_REGEX_ENGLISH: '^[A-Za-z]+$',
    // VALIDATION_REGEX_SPECIAL_ENGLISH: '^[A-Za-z][A-Za-z ,\'.`/@:()*-]*$',//Match the beginning of the letter, and contain [letter][,][-]['][.][space][`][/][@][(][)][:][*] character
    VALIDATION_REGEX_SPECIAL_ENGLISH: '^[A-Za-z][A-Za-z0-9 ,\'.`/@:()*-]*$',//Match the beginning of the letter, and contain [letter][number][,][-]['][.][space][`][@][(][)][:][*] character
    VALIDATION_REGEX_USER_ROLE_NAME: '^[A-Za-z][A-Za-z0-9 ,\'.`/@:()*-_]*[A-Za-z0-9]$',
    // VALIDATION_REGEX_SPECIAL_ENGLISH_WARNING: '[@:()*]+',//Match the [@][(][)][:][*] character
    VALIDATION_REGEX_SPECIAL_ENGLISH_WARNING: '[@:()*/]+',//Match the [@][(][)][:][*] character
    VALIDATION_REGEX_SPECIAL_ENGLISH_WARNING_WITH_BABY_NAME: '[@:()*]+',
    VALIDATION_REGEX_ENGLISH_OR_SPACE: '^[A-Za-z ]+$',
    VALIDATION_REGEX_ENGLISH_OR_NUMBER: '^[A-Za-z0-9]+$',
    VALIDATION_REGEX_ENGLISH_OR_NUMBER_OR_SPACES: '^[A-Za-z0-9 ]+$',
    VALIDATION_REGEX_CHINESE: '^[\u4e00-\u9fa5]+$',
    VALIDATION_REGEX_POSITIVE_INTEGER: '^[1-9]+[0-9]*]*$',
    VALIDATION_REGEX_POSITIVE_INTEGER_EMPTY: /^\s*$|^[1-9]+[0-9]*]*$/,
    VALIDATION_REGEX_ZERO_INTEGER: '^([0-9]*)$',
    VALIDATION_REGEX_MAXINUM9999_INTEGER: '^([0-9]{0,3})$',
    VALIDATION_REGEX_BLANK_SPACE: /\s+/g,
    // VALIDATION_REGEX_EMAIL: '^([0-9a-zA-Z]([-.\\w]*[0-9a-zA-Z])?@([0-9a-zA-Z][-\\w]*[0-9a-zA-Z]\\.)+[a-zA-Z]{2,9})$',
    VALIDATION_REGEX_EMAIL: '^([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z0-9]{1,})$',
    VALIDATION_DH_EMAIL: '^(.+.[Gg][Oo][Vv].[Hh][Kk])$|^(.+.[Hh][Kk][Ss][Aa][Rr][Gg])$',
    VALIDATION_HA_EMAIL: '^([A-Za-z0-9._%+-]+@[Hh][Aa].[Oo][Rr][Gg].[Hh][Kk])$|^(.+.[Gg][Oo][Vv].[Hh][Kk])$|^(.+.[Hh][Kk][Ss][Aa][Rr][Gg])$',
    VALIDATION_REGEX_INCLUDE_CHINESE: '.*[\u4e00-\u9fa5]+.*$',
    VALIDATION_REGEX_NOT_NUMBER: /[^0-9]/ig,
    VALIDATION_REGEX_IS_NUMBER: '^[0-9]*$',
    VALIDATION_REGEX_ENGLISH_NUM: '^[A-Za-z0-9]+$',
    VALIDATION_REGEX_PASSWORD: /^(?=.*\d{1,})(?=.*[A-Z]{1,}).{8,20}$/,
    VALIDATION_REGEX_DECIMAL_15_4: '^(([^0][0-9]{0,10}|0)\\.([0-9]{1,4})$)|^(([^0][0-9]{0,10}|0)$)|^(([1-9]+)\\.([0-9]{1,4})$)|^(([1-9]{0,10})$)',

    VALIDATION_REGEX_PERIOD: '^\\d+(.5)?$',
    VALIDATION_REGEX_CODEVERIFICATION: '[a-zA-Z][a-zA-Z0-9]+$',
    VALIDATION_REGEX_PHONENO: '^[1-9][0-9]*$',
    VALIDATION_REGEX_HKPHONENO: '^[1-9][0-9]{7}$',
    VALIDATION_REGEX_NOCHINESE: '^[\u0000-\u00ff]+$',
    VALIDATION_REGEX_COMMON_ENGLISH_INPUT: '^[A-Za-z0-9 ,\'.`/@:()*-]*$',
    VALIDATION_REGEX_IS_CASE_NO: '^([A-Z]{4}|[A-Z]{3} {1})[0-9]{9}$',
    // VALIDATION_REGEX_IS_PHONE_SEARCH: '^[1-9]{1}[0-9]{1,3}[0-9]{0,3}[0-9]*$',
    //VALIDATION_REGEX_IS_HK_MOBILE: '^(5|6|7|9)[0-9]{7}$',    //CIMST-3391 remove validation checking of "Mobile" & "Mobile SMS", except checking 8 digits. Changed to use VALIDATION_REGEX_HKPHONENO
    //LOGIN NAME
    VALIDATION_REGEX_LOGIN_NAME: '(?!.*(__|  ))^[a-zA-Z@][0-9a-zA-Z_ ]*[0-9a-zA-Z]$',
    VALIDATION_REGEX_ERROR_LOGIN_NAME: '\\s{2,}|^\\s(.*)$|^(.*)\\s$',
    VALIDATION_REGEX_POSITIVE_DECIMAL: '^[1-9]?[0-9]*\\.[0-9]*$',
    VALIDATION_REGEX_DECIMAL:'^([1-9][0-9]*|0)$|^(([1-9][0-9]*|0)\\.[0-9]{1,})$',
    VALIDATION_REGEX_1_TO_10:'^(10|[1-9])$'
    // VALIDATION_REGEX_DECIMAL:'^(([1-9][0-9]*|0)\\.?[0-9]*)$'
};

export default CommonRegex;