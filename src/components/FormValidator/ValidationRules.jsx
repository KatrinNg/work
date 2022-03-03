import moment from 'moment';
import { CommonUtil, DateUtil } from '../../utilities';

const isExisty = function (value) {
    return value !== null && value !== undefined;
};

const isEmpty = function (value) {
    if (value instanceof Array) {
        return value.length === 0;
    }
    return value === '' || !isExisty(value);
};

const isEmptyTrimed = function (value) {
    if (typeof value === 'string') {
        return value.trim() === '';
    }
    return true;
};

const ValidationRules = {
    matchRegexp: (value, regexp) => {
        const validationRegexp = (regexp instanceof RegExp ? regexp : (new RegExp(regexp)));
        return (isEmpty(value) || validationRegexp.test(value));
    },

    matchErrorRegexp: (value, regexp) => {
        const validationRegexp = (regexp instanceof RegExp ? regexp : (new RegExp(regexp)));
        return (isEmpty(value) || !validationRegexp.test(value));
    },

    // eslint-disable-next-line
    isEmail: value => ValidationRules.matchRegexp(value, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i),

    isEmpty: value => isEmpty(value),

    required: value => !isEmpty(value),

    trim: value => !isEmptyTrimed(value),

    isNumber: value => ValidationRules.matchRegexp(value, /^-?[0-9]\d*(\d+)?$/i),

    isFloat: value => ValidationRules.matchRegexp(value, /^(?:-?[1-9]\d*|-?0)?(?:\.\d+)?$/i),

    isPositive: (value) => {
        if (isExisty(value)) {
            return (ValidationRules.isNumber(value) || ValidationRules.isFloat(value)) && value >= 0;
        }
        return true;
    },

    isPositiveInteger: (value) => {
        if (isExisty(value)) {
            return ValidationRules.isNumber(value) && value >= 0;
        }
        return true;
    },

    isPositiveInt: (value) => {
        if (isExisty(value)) {
            return ValidationRules.isNumber(value) && parseInt(value) > 0;
        }
        return true;
    },

    maxNumber: (value, max) => isEmpty(value) || parseInt(value, 10) <= parseInt(max, 10),

    minNumber: (value, min) => isEmpty(value) || parseInt(value, 10) >= parseInt(min, 10),

    maxFloat: (value, max) => isEmpty(value) || parseFloat(value) <= parseFloat(max),

    minFloat: (value, min) => isEmpty(value) || parseFloat(value) >= parseFloat(min),

    isString: value => !isEmpty(value) || typeof value === 'string' || value instanceof String,
    minStringLength: (value, length) => (isEmpty(value) ? true : ValidationRules.isString(value) && value.length >= length),
    maxStringLength: (value, length) => (isEmpty(value) ? true : ValidationRules.isString(value) && value.length <= length),
    equalStringLength: (value, length) => (isEmpty(value) ? true : ValidationRules.isString(value) && value.length == length),

    // eslint-disable-next-line no-undef
    isFile: value => value instanceof File,
    maxFileSize: (value, max) => ValidationRules.isFile(value) && value.size <= parseInt(max, 10),
    allowedExtensions: (value, fileTypes) => ValidationRules.isFile(value) && fileTypes.split(',').indexOf(value.type) !== -1,

    isRightMoment: (value) => value ? moment(value).isValid() : true,
    maxDate: (value, maxDate) => value && moment(value).isValid() ? moment(value).isSameOrBefore(moment(maxDate), 'day') : true,
    minDate: (value, minDate) => value && moment(value).isValid() ? moment(value).isSameOrAfter(moment(minDate), 'day') : true,
    maxTime: (value, maxTime) => {
        const diff = DateUtil.timeComparator(value, maxTime);
        if (diff === undefined) {
            return true;
        } else {
            return diff <= 0;
        }
    },
    minTime: (value, minTime) => {
        const diff = DateUtil.timeComparator(value, minTime);
        if (diff === undefined) {
            return true;
        } else {
            return diff >= 0;
        }
    },
    isChinese: (value) => CommonUtil.checkChinese(value),
    isHkid: (value) => CommonUtil.checkHKID(value)
};

export default ValidationRules;