import * as ReportConstant from '../constants/report/reportConstant';
import * as userConstants from '../constants/user/userConstants';

export const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    console.log(file);
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export const base64Encode = (str) => {
    let CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let out = '', i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += '==';
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += '=';
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
};

export const getCSVStringFromObj = (obj) => {
    let paramStringMap = [];
    for (const [key, value] of Object.entries(obj)) {
        if(value !== null ){
            let keyValStr = key + '=' + encodeURIComponent(value);
            paramStringMap.push(keyValStr);
        }
    }
    let paramString = paramStringMap.join(',');
    return paramString;
};

export const getSelectAllOption = (labelName) => {
    let label = ReportConstant.SELECT_ALL_LABEL_WITHOUT_STAR;
    return {
        value: ReportConstant.SELECT_ALL_OPTIONS,
        label: labelName ? labelName : label,
        item: {}
    };
};

export const getAdminSite = (uamMapUserSvcDtos, uamMapUserSiteDtos, clinicList, reportAdminType, loginServiceCd) => {
    let result = clinicList.filter(x => x.serviceCd === loginServiceCd)
        .map(x => ({
            value: x.siteId,
            label: x.siteName,
            item: x
        }));

    if (!reportAdminType || ReportConstant.RPT_ADMIN_TYPE.RPT_NAN_ADMIN === reportAdminType) {
        return result;
    }

    const isUserSvcAdmin = Boolean(uamMapUserSvcDtos && uamMapUserSvcDtos.filter(x => x.svcCd === loginServiceCd && x.isAdmin === 1));

    if (ReportConstant.RPT_ADMIN_TYPE.RPT_SVC_ADMIN === reportAdminType) {
        if (isUserSvcAdmin) {
            return result;
        } else {
            return [];
        }
    }

    if (ReportConstant.RPT_ADMIN_TYPE.RPT_SVC_N_SITE_ADMIN === reportAdminType && !isUserSvcAdmin) {
        return [];
    }

    let siteBySiteAdmin = [];
    uamMapUserSiteDtos && uamMapUserSiteDtos.forEach(function (item) {
        if (item && item.isAdmin === 1 ) {
            let adminSite = result.filter(x => x.value === item.siteId);
            if (adminSite && adminSite.length > 0) {
                siteBySiteAdmin.push(adminSite[0]);
            }
        }
    });

    if (ReportConstant.RPT_ADMIN_TYPE.RPT_SITE_ADMIN === reportAdminType
        || (ReportConstant.RPT_ADMIN_TYPE.RPT_SVC_N_SITE_ADMIN && isUserSvcAdmin)) {
        return siteBySiteAdmin;
    }

    return [];
};

// Input clinicCd Array List []
export const filterReportTemplateUsersByServiceCdNClinicCdNRole = (reportTemplateUsers, serviceCd, clinicCds, isDoctorUser, isNurseUser, isDtsUser) => {
    if (serviceCd) {
        reportTemplateUsers = reportTemplateUsers && reportTemplateUsers.filter(user => user.mapSvcDesc && user.mapSvcDesc.toString().includes(serviceCd));
    }
    if (clinicCds) {
        reportTemplateUsers = reportTemplateUsers && reportTemplateUsers.filter(
            function(reportTemplateUser) {
                for (let i = 0; i < clinicCds.length; i++) {
                    let isClinicUser = reportTemplateUser && reportTemplateUser.mapSiteDesc
                            && reportTemplateUser.mapSiteDesc.includes(clinicCds[i]);
                    if (isClinicUser) {
                        return true;
                    }
                }

                return false;
            }
        );
    }

    if (isDoctorUser) {
        return reportTemplateUsers && reportTemplateUsers
            .filter(user => user.mapRoleDesc && user.mapRoleDesc.toString().includes(userConstants.UAM_ROLES.cimsDoctor));
    } else if (isNurseUser) {
        return reportTemplateUsers = reportTemplateUsers && reportTemplateUsers
            .filter(user => user.mapRoleDesc&& user.mapRoleDesc.toString().includes(userConstants.UAM_ROLES.cimsNurse));
    // } else if (isDtsUser) {
    //     return reportTemplateUsers;
    } else {
        return reportTemplateUsers;
    }
};

export const mapUuserByReportUserState = (users) => {
        return users && users.map(x => ({
            value: x.userId,
            label: x.engGivName + ' ' + x.engSurname + ' - ' + x.email,
            item: x
        }));
};

