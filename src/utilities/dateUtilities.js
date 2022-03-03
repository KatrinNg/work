import moment from 'moment';
import Enum from '../enums/enum';

export const dateTimeComparator = (date1, date2) => {
    let d1 = moment(date1,'DD-MMM-YYYY HH:mm');
    let d2 = moment(date2,'DD-MMM-YYYY HH:mm');
    return d1.diff(d2,'minutes');
};

export const formatDateComparator = (format)=>{
    const comparator = (date1, date2) => {
        let d1 = moment(date1, format);
        let d2 = moment(date2, format);
        return d1 - d2;
    };
    return comparator;
};

export const dateComparator = (date1, date2) => {
    if (date1 === '' && date2 === '') {
        return 0;
    }
    if (date1 === '') {
        return -1;
    }
    if (date2 === '') {
        return 1;
    }
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    return d1 - d2;
};

export const timeComparator = (time1, time2) => {
    const _time1 = moment(time1 || null);
    const _time2 = moment(time2 || null);
    if (_time1.isValid() && _time2.isValid()) {
        return moment().set({
            hours: _time1.get('hours'),
            minutes: _time1.get('minutes'),
            seconds: '0'
        }).diff(moment().set({
            hours: _time2.get('hours'),
            minutes: _time2.get('minutes'),
            seconds: '0'
        }), 'minutes');
    } else {
        return undefined;
    }
};

export const dateFilter = (filterLocalDateAtMidnight, cellValue) => {
    let nextFilterLocalDateAtMidnight = new Date(filterLocalDateAtMidnight.getTime() + 1000 * 60 * 60 * 24 - 1);
    if (cellValue == null) return 0;
    let dateValue = new Date(cellValue);
    if (dateValue < filterLocalDateAtMidnight) {
        return -1;
    } else if (dateValue > nextFilterLocalDateAtMidnight) {
        return 1;
    } else {
        return 0;
    }
};

export const getFormatDate = (date) => {
    return date ? moment(date).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
};

export const getFormatTime = (date) => {
    return moment(date || null).isValid() ? moment(date).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) : null;
};

export const getParamsDate = (date) => {
    return date ? moment(date).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
};

export const getDateTime = (date, time) => {
    if(moment(date).isValid() && moment(time).isValid()) {
        return moment(date).set({
            hour: moment(time).hour(),
            minute: moment(time).minute(),
            second: moment(time).second()
        });
    } else {
        return null;
    }
};

export const isDateSame = (date1, date2) => {
    if (moment(date1).isValid() && moment(date2).isValid()) {
        return moment(date1).isSame(moment(date2));
    } else {
        return false;
    }
};

export const isSame = (date1, date2, unit) => {
    if (moment(date1).isValid() && moment(date2).isValid()) {
        return moment(date1).isSame(moment(date2), unit);
    } else {
        return date1 === date2; // for the case, both values are invalid but same (eg. both are null)
    }
};

export const isSameDate = (date1, date2) => {
    return isSame(date1, date2, 'date');
};

export const isSameWeek = (date1, date2) => {
    return isSame(date1, date2, 'week');
};

export const isSameMonth = (date1, date2) => {
    return isSame(date1, date2, 'month');
};

export const isDateDiffInRange = (date1, date2, range, mode) => {
    return Math.abs(moment(date1).diff(moment(date2), mode)) < range;
};