import _ from 'lodash';
import { initService, initSite, initEnctType,initRoom } from '../constants/administration/administrationConstants';
import Enum from '../enums/enum';
import moment from 'moment';
import { getState } from '../store/util';

export function updateAccessRightsPatientCall(accessRights = [], patientCall = 'Patient') {
    let _accessRights = _.cloneDeep(accessRights);
    for (let i = 0; i < _accessRights.length; i++) {
        _accessRights[i]['accessRightName'] = _accessRights[i]['accessRightName'].replace('%PATIENTCALL%', patientCall);
        if (_accessRights[i]['childCodAccessRightDtos'] && _accessRights[i]['childCodAccessRightDtos'].length > 0) {
            _accessRights[i]['childCodAccessRightDtos'] = updateAccessRightsPatientCall(_accessRights[i]['childCodAccessRightDtos'], patientCall);
        }
    }
    return _accessRights;
}

/**
 * get the user service list
 * @param {Object} userDto login userDto
 */
export function initUserServiceList(userDto, loginSvcCd) {
    let list = [];
    if (userDto && userDto.uamMapUserSvcDtos && userDto.uamMapUserSvcDtos.length > 0) {
        // for (let i = 0; i < userDto.uamMapUserSvcDtos.length; i++) {
        //     const svcDto = userDto.uamMapUserSvcDtos[i];
        //     let newSvc = _.cloneDeep(initService);
        //     newSvc.svcCd = svcDto.svcCd;
        //     newSvc.isAdmin = svcDto.isAdmin;
        //     newSvc.createBy = userDto.loginName;
        //     newSvc.updateBy = userDto.loginName;
        //     newSvc.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        //     newSvc.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        //     list.push(newSvc);
        // }
        const svcDto = userDto.uamMapUserSvcDtos[0];
        let newSvc = _.cloneDeep(initService);
        newSvc.svcCd = loginSvcCd;
        newSvc.createBy = userDto.loginName;
        newSvc.updateBy = userDto.loginName;
        newSvc.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        newSvc.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
        list.push(newSvc);
    }
    return list;
}

export function getNewSite(loginUser) {
    let newSite = _.cloneDeep(initSite);
    newSite.createBy = loginUser.loginName;
    newSite.updateBy = loginUser.loginName;
    newSite.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    newSite.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    newSite.efftDate = moment();
    return newSite;
}

//get init user site list
export function initUserSiteList(userDto) {
    let list = [];
    if (userDto) {
        let newSite = getNewSite(userDto);
        list.push(newSite);
    }
    return list;
}

export function getUserAttainSvcList(user, loginSvcCd) {
    // const loginUserSvcDtos = loginUser.uamMapUserSvcDtos;
    // const uaSvcCds = loginUserSvcDtos.filter(item => item.svcCd).map(item => item.svcCd);
    // return _.cloneDeep(user.uamMapUserSvcDtos || []).filter(item => uaSvcCds.includes(item.svcCd));
    return _.cloneDeep(user.uamMapUserSvcDtos || []).filter(item => item.svcCd === loginSvcCd);
}

export function getUserUnAttainSvcList(user, loginSvcCd) {
    // const loginUserSvcDtos = loginUser.uamMapUserSvcDtos;
    // const uaSvcCds = loginUserSvcDtos.filter(item => item.svcCd).map(item => item.svcCd);
    // return _.cloneDeep(user.uamMapUserSvcDtos || []).filter(item => !uaSvcCds.includes(item.svcCd));
    return _.cloneDeep(user.uamMapUserSvcDtos || []).filter(item => item.svcCd !== loginSvcCd);
}

export function getAvailableSiteList(userSvcList, siteList) {
    const uaSvcCds = userSvcList.filter(item => item.svcCd).map(item => item.svcCd);
    return _.cloneDeep(siteList).filter(item => uaSvcCds.includes(item.svcCd));
}

export function getUserAttainSiteList(user, loginSvcCd, siteList) {
    const userAvailableSiteIds = getAvailableSiteList([{ svcCd: loginSvcCd }], siteList).map(item => item.siteId);
    return _.cloneDeep(user.uamMapUserSiteDtos || []).filter(item => userAvailableSiteIds.includes(item.siteId));
}

export function getUserUnAttainSiteList(user, loginSvcCd, siteList) {
    const loginSiteIds = getAvailableSiteList([{ svcCd: loginSvcCd }], siteList).map(item => item.siteId);
    return _.cloneDeep(user.uamMapUserSiteDtos || []).filter(item => !loginSiteIds.includes(item.siteId));
}

export function getUserAttainUserRoleList(user, loginSvcCd) {
    // const loginUserSvcDtos = loginUser.uamMapUserSvcDtos;
    // const uaSvcCds = loginUserSvcDtos.filter(item => item.svcCd).map(item => item.svcCd);
    // return (user.uamMapUserRoleDtos || []).filter(item => uaSvcCds.includes(item.uamRoleDto && item.uamRoleDto.svcCd));
    return _.cloneDeep(user.uamMapUserRoleDtos || []).filter(item => item.svcCd === loginSvcCd || !item.svcCd);
}

export function getUserUnAttainUserRoleList(user, loginSvcCd) {
    // const loginUserSvcDtos = loginUser.uamMapUserSvcDtos;
    // const uaSvcCds = loginUserSvcDtos.filter(item => item.svcCd).map(item => item.svcCd);
    // return (user.uamMapUserRoleDtos || []).filter(item => !uaSvcCds.includes(item.uamRoleDto && item.uamRoleDto.svcCd));
    return _.cloneDeep(user.uamMapUserRoleDtos || []).filter(item => !(item.svcCd === loginSvcCd || !item.svcCd));
}

export function getStatusList(statusCds) {
    let list = [];
    statusCds.forEach(item => {
        const obj = Enum.COMMON_STATUS.find(i => i.code === item);
        if (obj) {
            list.push(obj);
        }
    });
    return list;

}

export function fetchEnctList(data, clinicList) {
    return data && data
        .filter(item => item.status !== Enum.COMMON_STATUS_DELETED)
        .map(item => {
            const clinic = clinicList.find(i => i.siteId === item.siteId);
            item.siteEngName = clinic && clinic.siteEngName;
            return item;
        });
}

export function initNewEnct() {
    let newEnct = _.cloneDeep(initEnctType);
    const svcCd = getState(state => state.login.service.svcCd);
    newEnct = {
        ...newEnct,
        svcCd: svcCd,
        siteId: -1,
        minInterval: 0,
        minIntervalUnit: Enum.ENCTYPE_INTERVAL_UNIT_DAY,
        maxTmslt: 1,
        drtn: 0,
        apptRmndDay: 0,
        isCharge: 0,
        isInternet: 0,
        status: Enum.COMMON_STATUS_ACTIVE,
        isEhr: 1,
        efftDate: moment(),
        expyDate: null
    };
    return newEnct;
}

export function initExistEnct(data) {
    let existEnct = _.cloneDeep(initEnctType);
    existEnct = {
        ...existEnct,
        ...data,
        siteId: data.siteId || -1
    };
    return existEnct;
}

export function sortedUserRoles(list) {
    return list
        .sort((a, b) => (a.roleName || '').localeCompare((b.roleName || '')))
        .sort((a, b) => (a.svcCd || '').localeCompare((b.svcCd || '')));
}

export function initNewRoom(){
    let newRoom = _.cloneDeep(initRoom);
    const clinic=getState(state => state.login.clinic);
    if(clinic){
        newRoom.siteId=clinic.siteId;
        newRoom.siteEngName=clinic.siteEngName;
    }
    return newRoom;
}