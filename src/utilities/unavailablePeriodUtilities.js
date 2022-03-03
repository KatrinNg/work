import Enum from '../enums/enum';

export function getSiteEngNameById(clinicList, siteId) {
    let activeSiteList = clinicList.filter(item => item.status === Enum.COMMON_STATUS_ACTIVE);
    let siteObj = activeSiteList && activeSiteList.find(item => item.siteId === siteId);
    let siteEngName = siteObj && siteObj.siteEngName;
    return siteEngName ? siteEngName : 'For All Clinic';
}