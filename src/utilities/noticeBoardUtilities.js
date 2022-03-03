import _ from 'lodash';
import moment from 'moment';
import Enum from '../enums/enum';


export function dtmIsDirty(valA, valB, format = null) {
    let dtmA = moment(valA);
    let dtmB = moment(valB);
    if (!valA || !valB) {
        return true;
    }
    let _format = format;
    if (!format) {
        _format = Enum.DATE_FORMAT_EDMY_VALUE;
    }
    let formatStrA = dtmA.format(_format);
    let formatStrB = dtmB.format(_format);
    return (dtmA.isValid() && dtmB.isValid() && !_.isEqual(formatStrA, formatStrB));
}

export function getMinDtm(dtm, efftDtm) {
    let current = moment().format(Enum.DATE_FORMAT_EDMY_VALUE);
    if (moment(dtm).isBefore(moment(current))) {
        return moment();
    } else {
        return moment(efftDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
    }
}