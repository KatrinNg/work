import Enum from '../enums/enum';
import moment from 'moment';
import memoize from 'memoize-one';
import _ from 'lodash';
import { getState } from '../store/util';

export function getAttendanceCertSessionValue(label) {
    const obj = Enum.ATTENDANCE_CERT_SESSION_LIST.find(item => item.label === label);
    return obj && obj.value;
}

export function getAttendanceCertSessionLabel(value) {
    const obj = Enum.ATTENDANCE_CERT_SESSION_LIST.find(item => item.value === value);
    return obj && obj.label;
}

export function getAttendanceCertForValue(label) {
    const obj = Enum.ATTENDANCE_CERT_FOR_LIST.find(item => item.label === label);
    return obj && obj.value;
}

export function getAttendanceCertForLabel(value) {
    const obj = Enum.ATTENDANCE_CERT_FOR_LIST.find(item => item.value === value);
    return obj && obj.label;
}

export function getShareSvcCertList(certList, sharedSvcList, sortFunc) {
    // let rfrData = Array.isArray(data) ? data : [];
    let sharedList = [];
    if (sharedSvcList.length > 0) {
        sharedSvcList.forEach(svc => {
            let filterResult = (certList || []).filter(item => {
                if (item.svcCd) {
                    return item.svcCd === svc.svcCd;
                } else {
                    return item.serviceCd === svc.svcCd;
                }
            });
            sharedList = Array.concat(sharedList, filterResult);
        });
    }
    sortFunc && sortFunc(sharedList);
    return sharedList;
}

export const getAccessedServices = memoize((serviceList, svcCd, configName) => {
    const clinicConfig = getState(state => state.common.clinicConfig);
    // const serviceList = getState(state => state.common.serviceList);
    if (configName) {
        let targetArr = clinicConfig[configName];
        let accessedServices = [];
        serviceList.forEach(service => {
            if (service.svcCd === svcCd) {
                accessedServices.push(service);
            } else {
                let shareFlag = targetArr.find(item => item.svcCd === service.svcCd);
                if (shareFlag && shareFlag.paramValue === '1') {
                    accessedServices.push(service);
                }
            }
        });
        accessedServices.sort((a, b) => {
            return a.svcName.localeCompare(b.svcName);
        });
        return accessedServices;
    } else {
        let _serviceList = _.cloneDeep(serviceList);
        _serviceList.sort((a, b) => {
            return a.svcName.localeCompare(b.svcName);
        });
        return _serviceList;
    }
});

export function isPastEncounterDate(date) {
    const inputDate = moment(date).format(Enum.DATE_FORMAT_EYMD_VALUE);
    const currentDate = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    return date ? moment(inputDate).isBefore(currentDate) : false;
}

export function getAttendanceCertSessLabelBySiteParams(custAtndCertSessAm, custAtndCertSessPm) {
    let attendanceSectionLabel = '';
    const custAtndCertSessAmArr = custAtndCertSessAm.paramValue && custAtndCertSessAm.paramValue.split('-');
    const custAtndCertSessPmArr = custAtndCertSessPm.paramValue && custAtndCertSessPm.paramValue.split('-');
    const sessAmStart = (custAtndCertSessAmArr && custAtndCertSessAmArr[0] && moment(custAtndCertSessAmArr[0], Enum.TIME_FORMAT_24_HOUR_CLOCK).isValid() && custAtndCertSessAmArr[0]) || '06:00';
    const sessAmEnd = (custAtndCertSessAmArr && custAtndCertSessAmArr[1] && moment(custAtndCertSessAmArr[1], Enum.TIME_FORMAT_24_HOUR_CLOCK).isValid() && custAtndCertSessAmArr[1]) || '13:59';
    const sessPmStart = (custAtndCertSessPmArr && custAtndCertSessPmArr[0] && moment(custAtndCertSessPmArr[0], Enum.TIME_FORMAT_24_HOUR_CLOCK).isValid() && custAtndCertSessPmArr[0]) || '14:00';
    const sessPmEnd = (custAtndCertSessPmArr && custAtndCertSessPmArr[1] && moment(custAtndCertSessPmArr[1], Enum.TIME_FORMAT_24_HOUR_CLOCK).isValid() && custAtndCertSessPmArr[1]) || '23:59';
    if (moment().isSameOrAfter(moment(sessAmStart, Enum.TIME_FORMAT_24_HOUR_CLOCK), 'minutes') &&
        moment().isSameOrBefore(moment(sessAmEnd, Enum.TIME_FORMAT_24_HOUR_CLOCK), 'minutes')
    ) {
        attendanceSectionLabel = 'AM';
    } else if (
        moment().isSameOrAfter(moment(sessPmStart, Enum.TIME_FORMAT_24_HOUR_CLOCK), 'minutes') &&
        moment().isSameOrBefore(moment(sessPmEnd, Enum.TIME_FORMAT_24_HOUR_CLOCK), 'minutes')
    ) {
        attendanceSectionLabel = 'PM';
    }
    else {
        attendanceSectionLabel = '';
    }
    return attendanceSectionLabel;
}
