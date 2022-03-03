import Enum, { GFMIS_ROLE_MAPPING } from '../enums/enum';
import moment from 'moment';
import { getState } from '../store/util';

//get payment date format
export function getPaymentDate(date) {
    return date && moment(date).isValid() ? moment(date).format(Enum.PAYMENT_DATE_FORMAT) : '';
}

//get payment date and time format
export function getPaymentDateTime(date) {
    return date && moment(date).isValid() ? moment(date).format(Enum.PAYMENT_DATETIME_FORMAT_24) : '';
}

//get active gfmis list
export function getGfmisList(list, role) {
    return list && list.filter(x => x.recSts === 'A'
        && x.gfmisRole === role
        && (!x.efftDate || moment(x.efftDate).isSameOrBefore(moment()))
        && (!x.expyDate || moment(x.expyDate).isSameOrAfter(moment())));
}

//get current login user payment role
export function getRoleOfPayment() {
    const loginInfo = getState(state => state.login.loginInfo);
    const userRoles = loginInfo && loginInfo.userDto && loginInfo.userDto.uamMapUserRoleDtos;
    if (userRoles && userRoles.length > 0) {
        const operatorRole = userRoles.findIndex(x => x.uamRoleDto && x.uamRoleDto.roleName === GFMIS_ROLE_MAPPING.RCP_SHROFF_OPERATOR && x.uamRoleDto.status === 'A');
        const supervisorRole = userRoles.findIndex(x => x.uamRoleDto && x.uamRoleDto.roleName === GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR && x.uamRoleDto.status === 'A');
        const administratorRole = userRoles.findIndex(x => x.uamRoleDto && x.uamRoleDto.roleName === GFMIS_ROLE_MAPPING.RCP_SHROFF_ADMIN && x.uamRoleDto.status === 'A');
        if (supervisorRole > -1) {
            return GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR;
        } else if (operatorRole > -1) {
            return GFMIS_ROLE_MAPPING.RCP_SHROFF_OPERATOR;
        } else if (administratorRole > -1) {
            return GFMIS_ROLE_MAPPING.RCP_SHROFF_ADMIN;
        }
    }
    return '';
}

export function convertBase64UrlToBlob(base64, contentType) {
    let bytes = window.atob(base64);
    let ab = new ArrayBuffer(bytes.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], { type: contentType });
}

export function getMaintenanceFilterList(list, status) {
    return list && list.filter(x => !status || (status !== 'A' && x.recSts === status) || (status === 'E' && x.expyDate && moment(x.expyDate).isBefore(moment(), 'days')) || (status === 'A' && x.recSts === status && (!x.expyDate || x.expyDate && moment(x.expyDate).isSameOrAfter(moment(), 'days'))));
}

export function getAmount(value) {
    return Number.isNaN(parseFloat(value)) ? '' : new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}