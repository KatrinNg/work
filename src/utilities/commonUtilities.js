import storeConfig from '../store/storeConfig';
import Enum, { EHS_SHARED_COMPONENT_SPA_CONFIG } from '../enums/enum';
import _ from 'lodash';
import moment from 'moment';
import { axios } from '../services/axiosInstance';
import FieldConstant from '../constants/fieldConstant';
import accessRightEnum from '../enums/accessRightEnum';
import CommonRegex from '../constants/commonRegex';
import * as CommonAcType from '../store/actions/common/commonActionType';
import { openCommonMessage } from '../store/actions/message/messageAction';
import { resetAll } from '../store/actions/patient/patientAction';
import { deleteTabs, deleteSubTabs, changeTabsActive, updateTabs, skipTab } from '../store/actions/mainFrame/mainFrameAction';
import { dispatch, getState } from '../store/util';
import doCloseFuncSrc from '../constants/doCloseFuncSrc';
import AlsDesc from '../constants/ALS/alsDesc';
import { EnctrAndRmUtil, UserUtil } from './index';
import { alsLogAudit } from '../store/actions/als/logAction';
import { updateField } from '../store/actions/mainFrame/mainFrameAction';
import { globalEventDistributor } from '../globalEventDistributor';

export function getCurrentLoginSvc() {
    try {
        const state = storeConfig?.store?.getState();
        if(state){
            const serviceCd = state.login.service && state.login.service.serviceCd;
            return serviceCd;
        }else{
            return null;
        }
    } catch (e) {
        return null;
    }
}

// Check String characters size
export function isMaxSizeCharacters(stringChar, maxSize) {
    if (!Number.isInteger(maxSize) || maxSize <= 0) {
        return '';
    }
    let stringCharBlobSize = new Blob([stringChar]).size;
    if (stringCharBlobSize > maxSize) {
        return true;
    }
    return false;
}

export function getClinicListByServiceCode(allClinicList, serviceCd) {
    let result = [];
    result = allClinicList.filter(item => item.serviceCd === serviceCd);
    return result;
}

export function getCaseTypeCd(encounterTypes, encounterTypeCd) {
    let result = '';
    // :. Refactoring User encounterTypeId
    const encounterType = encounterTypes.find(item => item.encounterTypeCd === encounterTypeCd);
    if (encounterType && encounterType.isNewOld && encounterType.isNewOld === 1) {
        result = 'N';
    } else {
        result = 'O';
    }
    return result;
}

export function getCaseTypeCdByRoomEncounter(roomsInEncounter, encounterTypeCd) {
    let result = '';
    // :. Refactoring User encounterTypeId
    const encounterType = roomsInEncounter?.encounterTypeCd === encounterTypeCd;
    if (encounterType && roomsInEncounter?.isNewOld && roomsInEncounter?.isNewOld === 1) {
        result = 'N';
    } else {
        result = 'O';
    }
    return result;
}

export function quotaConfig(quotaConfig) {
    const result = [];
    // :. Day one Only for one quota Config ?
    if (quotaConfig && quotaConfig[0]) {
        if (quotaConfig[0].qt1Name) {
            result.push({
                code: Enum.QUOTA_1,
                engDesc: quotaConfig[0].qt1Name
            });
        }
        if (quotaConfig[0].qt2Name) {
            result.push({
                code: Enum.QUOTA_2,
                engDesc: quotaConfig[0].qt2Name
            });
        }
        if (quotaConfig[0].qt3Name) {
            result.push({
                code: Enum.QUOTA_3,
                engDesc: quotaConfig[0].qt3Name
            });
        }
        if (quotaConfig[0].qt4Name) {
            result.push({
                code: Enum.QUOTA_4,
                engDesc: quotaConfig[0].qt4Name
            });
        }
        if (quotaConfig[0].qt5Name) {
            result.push({
                code: Enum.QUOTA_5,
                engDesc: quotaConfig[0].qt5Name
            });
        }
        if (quotaConfig[0].qt6Name) {
            result.push({
                code: Enum.QUOTA_6,
                engDesc: quotaConfig[0].qt6Name
            });
        }
        if (quotaConfig[0].qt7Name) {
            result.push({
                code: Enum.QUOTA_7,
                engDesc: quotaConfig[0].qt7Name
            });
        }
        if (quotaConfig[0].qt8Name) {
            result.push({
                code: Enum.QUOTA_8,
                engDesc: quotaConfig[0].qt8Name
            });
        }
    }


    return result;
}

export function filterConfig(targetConfigs, where) {
    let topConfig = targetConfigs.filter(
        item => ((item.serviceCd || '') === (where.serviceCd || '')) &&
            ((item.clinicCd || '') === (where.clinicCd || '')) &&
            ((item.encounterCd || '') === (where.encounterCd || '')) &&
            ((item.subEncounterCd || '') === (where.subEncounterCd || ''))
    );
    if (topConfig.length > 0) {
        return topConfig;
    } else if (where.subEncounterCd) {
        delete where.subEncounterCd;
        return filterConfig(targetConfigs, where);
    } else if (where.encounterCd) {
        delete where.encounterCd;
        return filterConfig(targetConfigs, where);
    } else if (where.clinicCd) {
        delete where.clinicCd;
        return filterConfig(targetConfigs, where);
    } else if (where.serviceCd) {
        delete where.serviceCd;
        return filterConfig(targetConfigs, where);
    } else {
        return [];
    }
}

export function getTopPriorityOfSiteParams(list, svcCd, siteId, paramName) {
    let _list = (Array.isArray(list) ? list : list[paramName]) || [];

    let target = null;
    if (!target) {
        target = _list.find(x => (x.svcCd || '') === (svcCd || '') && (x.siteId || '') === (siteId || ''));
    }
    if (!target) {
        target = _list.find(x => (x.svcCd || '') === (svcCd || '') && !x.siteId);
    }
    if (!target) {
        target = _list.find(x => !x.svcCd && !x.siteId);
    }
    if (!target) {
        target = {};
    }
    return target;
}


export function getPriorityConfig(configName, configs, where) {
    let config = {};
    //get default config
    const state = storeConfig.store.getState();
    if (!configs) {
        configs = state.common.clinicConfig;
    }
    if (!where) {
        const serviceCd = state.login.service && state.login.service.serviceCd;
        const clinicCd = state.login.clinic && state.login.clinic.clinicCd;
        if (serviceCd && clinicCd) {
            where = { serviceCd, clinicCd };
        }
    }

    const clinicList = state.common.clinicList?.filter(clinic => clinic.status === 'A') || [];
    let newWhere = {
        svcCd: null,
        siteId: null
    };
    if (where && where.serviceCd) {
        newWhere.svcCd = where.serviceCd;
    }

    if (where && where.serviceCd && where.clinicCd) {
        newWhere.siteId = clinicList.find(cl => cl.clinicCd === where.clinicCd && cl.svcCd === where.serviceCd)?.siteId || null;
    }

    return getTopPriorityOfSiteParams(configs, newWhere.svcCd, newWhere.siteId, configName);
}

export function getCurrentLoginSiteParamsByName(paramsName) {
    const clinicConfig = getState(state => state.common.clinicConfig);
    const svcCd = getState(state => state.login.service.svcCd);
    const siteId = getState(state => state.login.clinic.siteId);
    const siteParams = getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, paramsName);
    return siteParams && siteParams.configValue;
}

export function getDefaultRmConfig(list, svcCd, siteId, encounterTypeCd) {
    const state = storeConfig.store.getState();

    let _list = Array.isArray(list) ? list : [];
    let encounterType = state.common.encounterTypes.find(x => x.svcCd === svcCd && x.encntrTypeCd === encounterTypeCd) || {};
    let target = _list.find(x => x.svcCd === svcCd && x.siteId === siteId && x.encounterTypeId === encounterType.encntrTypeId);
    if (target) {
        target.encntrTypeCd = encounterTypeCd;
    }

    return target || {};
}

export function getPriorityListConfig(configList, name, userRoleType, serviceCd) {
    if (configList && name && userRoleType && serviceCd) {
        let cloneList = _.cloneDeep(configList);
        switch (name) {
            case 'patientlist': {
                if (cloneList.findIndex(item => item.userGroupCd === userRoleType) > -1) {
                    cloneList = cloneList.filter(item => item.userGroupCd === userRoleType);
                } else {
                    cloneList = cloneList.filter(item => !item.userGroupCd);
                }
                break;
            }
            case 'waitinglist': {
                if (cloneList.findIndex(item => item.serviceCd === serviceCd) > -1) {
                    cloneList = cloneList.filter(item => item.serviceCd === serviceCd);
                } else {
                    cloneList = cloneList.filter(item => !item.serviceCd);
                }
                break;
            }
        }
        return cloneList;
    }
    return configList;
}

export function matchSection(currentTime, type, ampmOnly = true) {
    let section = '';
    switch (type) {
        case 'D': {
            return;
        }

        case 'H': {
            let tempHours = currentTime.format('HH');
            //let tempMin=currentTime.format('mm');
            if (ampmOnly) {
                if (tempHours >= 12 && tempHours < 24) {
                    section = 'PM';
                }
                else {
                    section = 'AM';
                }
            } else {
                if (tempHours >= 12 && tempHours < 18) {
                    section = 'PM';
                }
                else if (tempHours >= 18 || tempHours < 6) {
                    section = 'Evening';
                }
                else {
                    section = 'AM';
                }
            }

            return section;
        }


        default: {
            return;
        }

    }
}

export function getPatientCall() {
    const config = JSON.parse(sessionStorage.getItem('clinicConfig'));
    const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo'));
    const service = JSON.parse(sessionStorage.getItem('service'));
    if (loginInfo && config && service) {
        const serviceCd = service['serviceCd'];
        const patientLabel = config['PATIENT_LABEL'];
        const obj = patientLabel && patientLabel.find(item => item.svcCd === serviceCd);
        return obj ? obj.configValue : 'Patient';
    }
    return 'Patient';
}

export function getNameSearchCall() {
    const accessRights = JSON.parse(sessionStorage.getItem('accessRights'));
    if (accessRights.filter(item => item.type === 'button').findIndex(item => item.name === 'B001') !== -1) {
        return '/ ' + getPatientCall() + ' Name';
    }
    return '';
}

//add by David 20200323 return B201,B202...
export function getAccessRightMappingName() {
    let mappingList = [accessRightEnum.ImmuServiceAdmin, accessRightEnum.ImmuFvrPrinter, accessRightEnum.DrugMainAdmin, accessRightEnum.SaamEnquiryMode, accessRightEnum.VaccineOrderEnquiryMode, accessRightEnum.ImmuInjector, accessRightEnum.ImmuChecker];
    const accessRights = JSON.parse(sessionStorage.getItem('accessRights'));
    let rights = [];
    for (let i = 0; i < accessRights.length; i++) {
        if (mappingList.findIndex(item => item === accessRights[i].name) !== -1) {
            rights.push(accessRights[i].name);
        }
    }
    let result = 'DEFAULT';
    if (rights.length > 0) result = rights.join();
    return result;
}

export function containAccessRights(accessRights, accessRightNameTypePairs) {
    let result = true;

    let allAccessRightPairs = accessRights.reduce(
        (obj, item) => {
            obj[item.name] = item;
            return obj;
        }, {}
    );


    for (let pair of accessRightNameTypePairs) {
        let typeNamePair = allAccessRightPairs[pair.name];
        if (typeNamePair === undefined || typeNamePair === null) {
            result = false;
            break;
        }
        if (pair.type !== typeNamePair.type) {
            result = false;
            break;
        }
    }
    return result;
}

// //full screen
// export function fullscreen() {
//     let isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
//     if (!isFullscreen) {
//         let el = document.getElementById('root');
//         (el.requestFullscreen && el.requestFullscreen()) ||
//             (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
//             (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) || (el.msRequestFullscreen && el.msRequestFullscreen());
//     }
// }
// //quit full screen
// export function exitFullscreen() {
//     let isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
//     if (isFullscreen) {
//         (document.exitFullscreen && document.exitFullscreen()) ||
//             (document.mozCancelFullScreen && document.mozCancelFullScreen()) ||
//                 (document.webkitExitFullscreen && document.webkitExitFullscreen());
//     }
// }


/**Irving: we use this func to get the sys ratio */
export function getSystemRatio() {
    //const header = 25;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    if ((screenWidth / 4) === ((screenHeight) / 3)) {
        return Enum.SYSTEM_RATIO_ENUM.RATIO1;
    }

    if ((screenWidth / 5) === ((screenHeight) / 4)) {
        return Enum.SYSTEM_RATIO_ENUM.RATIO2;
    }

    if ((screenWidth / 16) === ((screenHeight) / 9)) {
        return Enum.SYSTEM_RATIO_ENUM.RATIO3;
    }
}

/**Irving :basic resolution is 1280 x 720(16:9 screen).
 *         change basic resolution to 1920 x 1080 in sprint 11.
*/
export function getResizeUnit(ratio) {
    let unit = 1;
    // const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    // const screenHeight = window.innerHeight;

    if (ratio === undefined) {
        //do something,need to list all 16:9 screen
        return unit;
    }
    // if (ratio === Enum.SYSTEM_RATIO_ENUM.RATIO3 || ratio === Enum.SYSTEM_RATIO_ENUM.RATIO2) {
    //     const basicWidth = 1920;
    //     unit = screenWidth / basicWidth;
    // }
    const basicHeight = 1080;
    unit = screenHeight / basicHeight;
    return unit;
}

export const getSiteId = (serviceCd, clinicCd, clinicList) => {
    let result;
    clinicList.filter(item => item.serviceCd === serviceCd && item.clinicCd === clinicCd).forEach(site => {
        result = site.siteId;
    });
    return result;
};

export const getSiteIdBySiteCd = (siteCd) => {
    const clinicList = getState(state => state.common.clinicList);
    const clinic = clinicList && clinicList.find(x => x.siteCd === siteCd);
    return clinic ? clinic.siteId : '';
};

export function findByCd(data, cd, cdName) {
    //     if (!data) {
    //         return;
    //     }
    let result = null;
    let tempResult = null;
    tempResult = data.find(item => item[cdName] === cd);
    if (tempResult !== undefined || result !== null) {
        result = tempResult;
        return result;
    } else {

        data.forEach(right => {
            if (right.childCodAccessRightDtos.length !== 0) {
                tempResult = findByCd(right.childCodAccessRightDtos, cd, cdName);
                if (tempResult !== undefined) {
                    result = tempResult;
                }
            }
            // else {
            //     tempResult = right.find(item => item[cdName]);
            // }
        });

    }
    return result;
}

export function groupAllParent(menuList, group) {
    let parentGp = group;
    menuList.forEach(menu => {
        const childs = menu.childCodAccessRightDtos ? menu.childCodAccessRightDtos.length : 0;
        const menuName = menu.accessRightName;
        if (childs === 0) {
            return;
        }
        else {
            parentGp[menuName] = menu.childCodAccessRightDtos;
            groupAllParent(menu.childCodAccessRightDtos, parentGp);

        }
    });
    return parentGp;
}

export function groupAllChild(menuList, group) {
    let childGp = group;
    menuList.forEach(menu => {
        const childs = menu.childCodAccessRightDtos ? menu.childCodAccessRightDtos.length : 0;
        childGp.push(menu);
        if (childs === 0) {
            return childGp;
        }
        else {
            // enu.childCodAccessRightDtos.forEach(child => {
            //     childGp = groupAllChild(child, childGp);
            // });
            childGp = groupAllChild(menu.childCodAccessRightDtos, childGp);

        }

    });
    return childGp;

}

export function initSubEncounterList(encounterList) {
    let subEncounterList = [];
    if (encounterList) {
        encounterList.forEach(encounter => {
            // let subEncounter={
            //     ...encounter.subEncounterTypeList
            // };
            encounter.subEncounterTypeList.filter(x => EnctrAndRmUtil.isActiveRoom(x)).forEach(subEncounter => {
                let parentGp = [];
                let idx = subEncounterList.findIndex(item => item.subEncounterTypeCd === subEncounter.subEncounterTypeCd);
                let parent = {
                    clinic: encounter.clinic,
                    description: encounter.description,
                    encounterTypeCd: encounter.encounterTypeCd,
                    existCode: encounter.existCode,
                    service: encounter.service,
                    shortName: encounter.shortName,
                    version: encounter.version
                };
                if (idx === -1) {
                    parentGp.push(parent);
                    subEncounter.parentGp = parentGp;
                    subEncounterList.push(subEncounter);
                }
                else {
                    if (subEncounterList[idx].parentGp.findIndex(item => item.encounterTypeCd === parent.encounterCd) === -1) {
                        subEncounterList[idx].parentGp.push(parent);
                    }

                }
            });
        });
    }

    return subEncounterList;
}

export function changeAllRightsOpenStatus(right, status) {
    const childs = right.childCodAccessRightDtos ? right.childCodAccessRightDtos.length : 0;
    right.open = status;
    if (childs != 0) {
        right.childCodAccessRightDtos.forEach(child => {
            changeAllRightsOpenStatus(child, status);
        });
    }
}

export function isObj(object) {
    return object && typeof (object) == 'object' && Object.prototype.toString.call(object).toLowerCase() == '[object object]';
}

export function getLength(object) {
    let count = 0;
    for (let key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            count++;
        }
    }
    return count;
}

let CompareObj, CompareJSON;
CompareObj = (objA, objB, flag) => {
    for (let key in objA) {
        if (!flag)
            break;
        if (!Object.prototype.hasOwnProperty.call(objB, key)) {
            flag = false;
            break;
        }
        if (!Array.isArray(objA[key])) {
            if (isObj(objA[key])) {
                if (!isObj(objB[key])) {
                    flag = false;
                    break;
                }
                if (!CompareJSON(objA[key], objB[key])) {
                    flag = false;
                    break;
                }
            } else {
                if (objA[key] === 'true' || objA[key] === 'false') {
                    objA[key] = objA[key] === 'true';
                }
                if (objB[key] === 'true' || objB[key] === 'false') {
                    objB[key] = objB[key] === 'true';
                }
                if (objB[key] != objA[key]) {
                    flag = false;
                    break;
                }
            }

            // if(CompareObj(objB[key], objA[key], flag)){
            //     flag = false;
            //     break;
            // }
        } else {
            if (!Array.isArray(objB[key])) {
                flag = false;
                break;
            }
            let oA = objA[key],
                oB = objB[key];
            if (oA.length != oB.length) {
                flag = false;
                break;
            }
            for (let k in oA) {
                if (!flag)
                    break;
                flag = CompareObj(oA[k], oB[k], flag);
            }
        }
    }
    return flag;
};

CompareJSON = (objA, objB) => {
    if (!isObj(objA) || !isObj(objB)) return false;
    if (getLength(objA) != getLength(objB)) return false;
    let tmpObjA = JSON.parse(JSON.stringify(objA));
    let tmpObjB = JSON.parse(JSON.stringify(objB));
    return CompareObj(tmpObjA, tmpObjB, true);
};

export { CompareJSON };

export function getUTF8StringLength(str) {
    if (!str) {
        return 0;
    }
    let byteSize = 0;
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (0 <= charCode && charCode <= 0x7f) {
            byteSize += 1;
        } else if (128 <= charCode && charCode <= 0x7ff) {
            byteSize += 2;
        } else if (2048 <= charCode && charCode <= 0xffff) {
            byteSize += 3;
        } else if (65536 < charCode && charCode <= 0x1fffff) {
            byteSize += 4;
        } else if (0x200000 < charCode && charCode <= 0x3ffffff) {
            byteSize += 5;
        } else if (0x4000000 < charCode && charCode <= 0x7fffffff) {
            byteSize += 6;
        } else {
            return -1;
        }
    }
    return byteSize;
}

export function formatterDecimal(e) {
    let value = e.target.value;
    value = value.replace(/[^\d.]/g, '');
    value = value.replace(/^\./g, '');
    value = value.replace(/\.{2,}/g, '.');
    value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');

    const maxLength = e.target.maxLength || -1;
    let pointLastPos = false;
    if (maxLength !== -1) {
        if (value.length === maxLength && value.indexOf('.') === maxLength - 1) {
            pointLastPos = true;
        }
    }
    const pointCount = value.split('.').length - 1;
    if (new RegExp(CommonRegex.VALIDATION_REGEX_DECIMAL).test(value) || (pointCount === 1 && !pointLastPos) || !value) {
        let index = value.indexOf('.');
        if (index > -1) {
            if (index < 11) {
                let floatValue = value.substring(index);
                if (floatValue.length > 4) {
                    value = value.substring(0, index + 5);
                }

            } else {
                let floatValue = value.substring(index);
                let intVal = value.substring(0, index);

                if (intVal.length > 11) {
                    intVal = intVal.substring(0, 11);
                }
                if (floatValue.length > 4) {
                    floatValue = floatValue.substring(0, 5);
                }
                value = intVal + floatValue;
            }
        } else {
            value = value.substring(0, 11);
        }
        // return value;
    }
    else {
        value = value.substring(0, value.length - 1);
    }
    return value;
}


export function transformToMap(quotaArr) {
    let newQuotaArr = [];
    if (quotaArr && quotaArr[0] && quotaArr[0].indexOf(':') != -1) {
        for (let i = 0; i < quotaArr.length; i++) {
            if (quotaArr[i]) {
                newQuotaArr.push({ code: quotaArr[i].split(':')[0], engDesc: quotaArr[i].split(':')[1] });
            }
        }
    } else {
        if (quotaArr) {
            for (let i = 0; i < quotaArr.length; i++) {
                if (quotaArr[i]) {
                    newQuotaArr.push({ code: quotaArr[i].substring(0, 1), engDesc: quotaArr[i] });
                }
            }
        }
    }
    return newQuotaArr;

}

export function getQuotaDescArray(clinicConfig, where) {
    const defaultQuotaDesc = getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, clinicConfig, where);
    const quotaArr = transformToMap(defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : null);
    return quotaArr;
}

export function getCaseTypeDesc(caseType) {
    switch (_.toUpper(caseType)) {
        case 'N': return 'New';
        case 'O': return 'Old';
    }
}

export function getQuotaTypeDesc(quotaType, clinicConfig, where) {
    const arr = getQuotaDescArray(clinicConfig, where);
    return arr && arr.find(item => item.code === quotaType);
}

/**get service name by service code */
export function getServiceNameByServiceCd(serviceCd, serviceList) {
    if (!serviceCd) {
        return '';
    }

    if (!serviceList || serviceList.length === 0) {
        return serviceCd;
    }

    let service = serviceList.find(item => item.serviceCd === serviceCd);
    if (!service) {
        return serviceCd;
    }

    return `${service.serviceCd} - ${service.serviceName}`;
}

/**get clinic name by clinic code */
export function getClinicNameByClinicCd(clinicCd, serviceCd, clinicList) {
    if (!clinicCd) {
        return '';
    }

    if (!serviceCd) {
        return clinicCd;
    }

    if (!clinicList || clinicList.length === 0) {
        return clinicCd;
    }

    let clinicGp = clinicList.filter(item => item.serviceCd === serviceCd);

    if (!clinicGp || clinicGp.length === 0) {
        return clinicCd;
    }

    let clinic = clinicGp.find(item => item.clinicCd === clinicCd);

    if (!clinic) {
        return clinicCd;
    }

    return clinic.clinicName ? clinic.clinicName : clinicCd;

}

export function getServiceByCd(serviceList, serviceCd) {
    if (!serviceList || !Array.isArray(serviceList)) {
        return null;
    }
    return serviceList.find(item => item.serviceCd === serviceCd);
}

// export function getClinicNameByCd(clinicList, clinicCd) {
//     if (!clinicList || !Array.isArray(clinicList)) {
//         return null;
//     }
//     return clinicList.find(item => item.clinicCd === clinicCd);
// }

export function getTimeMoment(time) {
    const timeArr = time.split(':');
    if (timeArr.length === 2) {
        return moment({ hours: timeArr[0], minutes: timeArr[1] });
    } else if (timeArr.length === 3) {
        return moment({ hours: timeArr[0], minutes: timeArr[1], seconds: timeArr[2] });
    }
    return null;
}

export function getHighestPrioritySiteParams(configName, configs, where) {
    return getTopPriorityOfSiteParams(configs, where.serviceCd, where.siteId, configName);
}

export function getHighestPriorityConfig(configName,
    configs,
    where,
    scoreMappings = {
        subEncounterCd: 10000,
        encounterCd: 1000,
        clinicCd: 100,
        serviceCd: 10
    }) {

    let config = {};
    let targetConfigs = configs[configName];
    if (!targetConfigs) {
        return config;
    } else {
        let isMatch = (item, _where, key) => item[key] && _where[key] && item[key] === _where[key];
        let isServiceMatch = (item, _where) => isMatch(item, _where, 'serviceCd');
        let isClinicMatch = (item, _where) => isServiceMatch(item, _where) && isMatch(item, _where, 'clinicCd');
        let isEncounterMatch = (item, _where) => isClinicMatch(item, _where) && isMatch(item, _where, 'encounterCd');
        let isSubEncounterMatch = (item, _where) => isEncounterMatch(item, _where) && isMatch(item, _where, 'subEncounterCd');

        let filterConfigs = targetConfigs
            .filter(
                (item) => {
                    return (!item.clinicCd && !item.serviceCd && !item.encounterCd && !item.subEncounterCd) ||
                        (isServiceMatch(item, where)) ||
                        (isClinicMatch(item, where)) ||
                        (isEncounterMatch(item, where)) ||
                        (isSubEncounterMatch(item, where));
                }
            )
            .map(
                (item) => {
                    let score = 0;
                    for (let scoreMappingKey in scoreMappings) {
                        if (item[scoreMappingKey] &&
                            where[scoreMappingKey] &&
                            item[scoreMappingKey] === where[scoreMappingKey]
                        ) {
                            score += scoreMappings[scoreMappingKey];
                        }
                    }
                    return { ...item, score };
                }
            ).sort((a, b) => b.score - a.score);
        if (filterConfigs && filterConfigs.length > 0) {
            config = filterConfigs[0];
        }
        return config;
    }
}

// start compare JSON for check dirty function
export const isDirty = (origalOrderJson, lastestJson) => {
    return !CompareJSON(origalOrderJson, lastestJson);
};
// end compare JSON for check dirty function

/**
 * get english full name
 * @author Justin Long
 * @param {String} firstName
 * @param {String} secondName
 * @returns {String}
 */
export function getFullName(firstName, secondName, separator = ', ') {
    if (!firstName && secondName) {
        return secondName;
    } else if (!secondName && firstName) {
        return firstName;
    } else if (!firstName && !secondName) {
        return '';
    }
    let arr = [firstName, secondName];
    return arr.join(separator).trim();
}

/**
 * get patient main phone
 * @method getPatientMainPhone
 * @author Justin Long
 * @param {Array} [phoneList=[]] phoneList
 * @returns {Object}
 */
export function getPatientMainPhone(phoneList = []) {
    return phoneList.find(item => parseInt(item.smsPhoneInd) === 1 & parseInt(item.phonePriority) === 1);
}

/**
 * get format phone
 * @method getFormatPhone
 * @author Justin Long
 * @param {Array} countryList
 * @param {Object} phone
 * @returns {String}
 */
export function getFormatPhone(countryList = [], phone = {}) {
    // let { countryCd, areaCd, phoneNo } = _.cloneDeep(phone);
    // if (countryList.length > 0 && countryCd && phoneNo) {
    //     if (countryCd !== FieldConstant.COUNTRY_CODE_DEFAULT_VALUE) {
    //         const country = countryList.find(item => item.countryCd === countryCd);
    //         if (country) {
    //             const strArr = [`+${country.dialingCd}`, areaCd, phoneNo];
    //             phoneNo = strArr.join(' ').trim();
    //         }
    //     }
    // }
    let { dialingCd, areaCd, phoneNo } = _.cloneDeep(phone);
    if (countryList.length > 0 && dialingCd && phoneNo) {
        if (dialingCd !== FieldConstant.DIALING_CODE_DEFAULT_VALUE) {
            const strArr = [`+${dialingCd}`, areaCd, phoneNo];
            phoneNo = strArr.join(' ').trim();
        }
    }
    return phoneNo;
}

/**
 * Get USE_CASE_NO config by default serviceCd and clinicCd,
 * If return true, means must use case no in booking, attendance, etc.,
 * If return false, means not necessary.
 * @author JustinLong
 */
export function isUseCaseNo() {
    const state = storeConfig.store.getState();
    let configs = null;
    if (!configs) {
        configs = state.common.clinicConfig;
    }
    let where = {};
    const svcCd = state.login.service && state.login.service.serviceCd;
    const siteId = state.login.clinic && state.login.clinic.siteId;
    if (svcCd && siteId) {
        where = { serviceCd: svcCd, siteId };
    }

    let useCaseConfig = getHighestPrioritySiteParams(Enum.CLINIC_CONFIGNAME.USE_CASE_NO, configs, where);
    let configVal = useCaseConfig && useCaseConfig.paramValue;
    if (configVal) {
        return configVal !== 'N';
    } else {
        if (state.login.service.serviceCd === 'DTS') {
            return false;
        } else {
            return true;
        }
    }
}

export function loadIpRangeServiceAndClinic(serviceList, siteList, siteIds) {
    let clientServiceList = [];
    let clientSiteList = [];

    if (!siteIds) {
        siteList.forEach(item => {
            if (clientServiceList.findIndex(itemClient => itemClient.svcCd === item.svcCd) === -1) {
                let service = serviceList && serviceList.find(i => i.svcCd === item.svcCd);
                if (service) {
                    clientServiceList.push(service);
                }
            }
            clientSiteList.push(item);
        });
    } else {
        siteIds.forEach(siteId => {
            const site = siteList.find(item => parseInt(item.siteId) === parseInt(siteId));
            if (site) {
                const service = serviceList.find(item => item.svcCd === site.svcCd);
                if (service && clientServiceList.findIndex(item => item.svcCd === service.svcCd) === -1) {
                    clientServiceList.push(service);
                }
                clientSiteList.push(site);
            }
        });
    }



    return { clientServiceList, clientSiteList };
}

/**
 * Delete tab recursively
 * @author JustinLong
 * @param {Array} tabs The tab object of tabs or subTabs
 * @param {Function} delFunc The function of delete tab
 * @param {Function} activeFunc The function of change tab
 */
function closeTabByDoCloseCheck(tabs, delFunc, activeFunc, doCloseSrc) {
    return new Promise((resolve) => {
        if (tabs.length > 0) {
            let curTab = tabs.pop();
            activeFunc(curTab.deep, curTab.name);
            storeConfig.store.dispatch({ type: CommonAcType.HANDLE_COMMON_CIRCULAR, status: 'open' });
            setTimeout(() => {
                storeConfig.store.dispatch({ type: CommonAcType.HANDLE_COMMON_CIRCULAR, status: 'close' });
                storeConfig.store.dispatch(
                    alsLogAudit({
                        desc: `Do close tab. name: ${curTab.name} , deep: ${curTab.deep}`,
                        dest: 'cmn',
                        functionName: 'Next Patient',
                        isEncrypt: false,
                        content: JSON.stringify(curTab)
                    })
                );

                if (typeof curTab.doCloseFunc === 'function') {   // if doCloseFunc is defined, call the doCloseFunc of the current
                    let doCloseParams = { ...curTab.doCloseParams, src: doCloseSrc };
                    curTab.doCloseFunc(
                        // the callback method
                        (canDeleteCurTab) => {
                            if (canDeleteCurTab) {  // close the current tab
                                new Promise(resolve2 => {
                                    delFunc(curTab.deep, curTab.name);
                                    resolve2();
                                }).then(() => { // close the next tab
                                    closeTabByDoCloseCheck(tabs, delFunc, activeFunc, doCloseSrc).then(result => resolve(result));
                                });
                            }
                        }, doCloseParams);
                    //bug fixed for 'Change this encounter' cannot refresh tab
                    //if click Cancel button in dirty check,curCloseTabMethodType should update to null
                    // if (curTab.spaPrefix) { //all project add cancel event to refresh tab when dirty
                    let btnCancel = document.getElementById('cims_message_dialog_btn3');
                    if (btnCancel) btnCancel.onclick = () => {
                        storeConfig.store.dispatch(updateField({ curCloseTabMethodType: null }));
                        btnCancel.onclick = null;
                    };
                    // }
                } else {  // if no doCloseFunc defined, delete the tab
                    new Promise((resolve2) => {
                        delFunc(curTab.deep, curTab.name);
                        resolve2();
                    }).then(() => { // close the next tab
                        closeTabByDoCloseCheck(tabs, delFunc, activeFunc, doCloseSrc).then(result => resolve(result));
                    });
                }
            }, 500);
        } else {
            resolve(true);
        }
    });
}

/**
 * Close all tabs and active close function
 * @author JustinLong
 * @param {Array} tabList The tabs contact tabs and subTabs
 * @param {Function} delFunc delete tabs function
 * @param {Function} activeTabFunc change tab function
 */
export function closeAllTabs(tabList, delFunc, activeTabFunc, doCloseSrc) {
    let tabDict = {};
    tabList.forEach(x => {
        let doCloseParams = { ...x.doCloseParams, src: doCloseSrc };
        tabDict[x.name] = { doCloseParams: doCloseParams };
    });
    dispatch(updateTabs(tabDict));
    return new Promise((resolve) => {
        let tabs = _.cloneDeep(tabList).filter(itemTab => itemTab.name !== accessRightEnum.patientSpec).sort((a, b) => b.deep - a.deep);
        closeTabByDoCloseCheck(tabs, delFunc, activeTabFunc, doCloseSrc).then(result => resolve(result));
    });
}

export function combineSpaPrefixAndPath(spaPrefix, spaPath) {
    return spaPrefix + '-' + spaPath.match('[^/]+(?!.*/)')[0].replace('.js', '');
}

/**
 * get userRole description
 * @param {String} userRoleType
 * @returns user role description
 */
export function getUserRole(userRoleType) {
    let userRole = '';
    switch (userRoleType) {
        case Enum.USER_ROLE_TYPE.COUNTER: userRole = 'COUNTER'; break;
        case Enum.USER_ROLE_TYPE.NURSE: userRole = 'NURSE'; break;
        case Enum.USER_ROLE_TYPE.DOCTOR: userRole = 'DOCTOR'; break;
    }
    return userRole;
}

/**
 * For validator rules, check string is chinese
 * @param {String} value the checking value
 */
export async function checkChinese(value) {
    let result = false;
    if (!value)
        return true;
    let response = await axios.post('/patient/chiNameValidator', { character: value });
    if (response.status === 200) {
        if (response.data.respCode === 0) {
            result = response.data.data;
        }
    }
    return result;
}

/**
 * For validator rules, check string is hkid format
 * @param {String} value the checking value
 */
export async function checkHKID(value) {
    let result = false;
    if (!value)
        return true;
    value = value.replace('(', '').replace(')', '');
    alsLogAudit({
        desc: `[Common Utilities] checkHKID value:`,
        dest: 'cmn',
        functionName: 'Common Utilities',
        isEncrypt: true,
        content: value
    });
    let response = await axios.post('/patient/hkidValidator', { hkid: value });
    if (response.status === 200) {
        if (response.data.respCode === 0) {
            result = response.data.data;
        }
    }
    alsLogAudit({
        desc: `[Common Utilities] checkHKID result: ${response?.status}, resp: ${response?.data?.respCode}`,
        dest: 'cmn',
        functionName: 'Common Utilities',
        isEncrypt: true,
        content: JSON.stringify(response?.data?.data)
    });
    return result;
}

/**
 * get userList for uaManagement table
 * @param {List} dataList the userList data
 */
export function getCommonUserList(dataList = [], serviceList = [], clinicList = []) {
    let userList = [];
    if (dataList && dataList.length > 0) {
        userList = dataList.map((i) => {
            let accountStatus = Enum.COMMON_STATUS.find(element => element.code === i.status);
            let salutation = Enum.COMMON_SALUTATION.find(element => element.code === i.salutation);
            let newItem = {
                chiFullName: i.chiFullName,
                email: i.email,
                engGivenName: i.engGivName,
                engSurname: i.engSurname,
                loginName: i.loginName,
                position: i.position,
                salutation: salutation && salutation.engDesc,
                status: accountStatus && accountStatus.engDesc,
                supervisor: i.supervisor,
                userId: i.userId,
                services: i.mapSvcDesc,
                sites: i.mapSiteDesc,
                roles: i.mapRoleDesc,
                ecsUserId: i.ecsUserId,
                version: i.version,
                uamMapUserRoleDtos: i.uamMapUserRoleDtos,
                uamMapUserSvcDtos: i.uamMapUserSvcDtos,
                uamMapUserSiteDtos: i.uamMapUserSiteDtos,
                isAdmin: i.isAdmin,
                isSvcAdmin: i.isSvcAdmin,
                isSiteAdmin: i.isSiteAdmin
            };
            return newItem;
        });
    }
    return userList;
}

export const getQuotaTypeMappings = (quotaConfig) => {
    return (quotaConfig ? quotaConfig : []).map(q => {
        return {
            [Enum.QUOTA_1]: q.qt1Name,
            [Enum.QUOTA_2]: q.qt2Name,
            [Enum.QUOTA_3]: q.qt3Name,
            [Enum.QUOTA_4]: q.qt4Name,
            [Enum.QUOTA_5]: q.qt5Name,
            [Enum.QUOTA_6]: q.qt6Name,
            [Enum.QUOTA_7]: q.qt7Name,
            [Enum.QUOTA_8]: q.qt8Name,
            ...q
        };
    });
};

export const getQuotaTypeDescByQuotaType = (quotaConfig, quotaType) => {
    if (quotaType) {
        return getQuotaTypeMappings(quotaConfig).map(
            v => v[quotaType]
        ).pop();
    } else {
        return 'Counter';
    }

};
/**
 * List quota name as an array
 * @param {Object} config a quota config
 */
export const getQuotaConfigName = (config) => {
    return Object.keys(config || {})
        .filter(item => /^qt[1-8]Name$/.test(item))
        .map(item => ({
            name: config[item],
            field: item.replace('Name', '')
        }));
};

/**
 * filter quota configs
 */
export const getAvailableQuotaConfig = (quotaConfig, svcCd = null, dspType = null) => {
    let config = quotaConfig && quotaConfig.find(item => (!svcCd || svcCd === item.svcCd) && (!dspType || dspType === item.dspType));
    if (!config) {
        config = {
            qt1Name: 'QT1',
            qt2Name: 'QT2',
            qt3Name: 'QT3',
            qt4Name: 'QT4',
            qt5Name: 'QT5',
            qt6Name: 'QT6',
            qt7Name: 'QT7',
            qt8Name: 'QT8'
        };
    }
    return config;
};

/**
 * For double date picker use
 * @param {Object} fromDate moment type, from date
 * @param {Object} toDate moment type, to date
 */
export const isFromDateAfter = (fromDate, toDate) => {
    if (fromDate && toDate && moment(fromDate).isValid() && moment(toDate).isValid()) {
        return moment(fromDate).isAfter(moment(toDate));
    }
    return false;
};

/**
 * For double date picker use
 * @param {Object} fromDate moment type, from date
 * @param {Object} toDate moment type, to date
 */
export const isToDateBefore = (fromDate, toDate) => {
    if (fromDate && toDate && moment(fromDate).isValid() && moment(toDate).isValid()) {
        return moment(toDate).isBefore(moment(fromDate));
    }
    return false;
};

/**
 * get siteCd by siteId, only use after login
 * @param {Number} siteId
 */
export const getSiteCodeBySiteId = (siteId) => {
    const state = storeConfig.store.getState();
    const clinicList = state.common.clinicList;
    if (clinicList) {
        const clinic = clinicList.find(item => item.siteId === siteId);
        return clinic && clinic.siteCd;
    }
    return null;
};

/**sort list by each field's dtm in ascending or descending order.
 * @param {Array} list
 * @param {String} dtmName
 * @param {String} order  asc, desc default use ascending order.
*/
export const sortByDtm = (list, dtmName, order) => {
    list && list.sort((a, b) => {
        if (moment(a[dtmName]).isBefore(moment(b[dtmName]))) {
            if (order === 'desc') {
                return 1;
            } else {
                return -1;
            }
        } else if (moment(a[dtmName]).isSame(moment(b[dtmName]))) {
            return 0;
        } else {
            if (order === 'desc') {
                return -1;
            } else {
                return 1;
            }
        }
    });
    return list;
};

export const getGenderStyle = (genderCd, isDead = false) => {
    let style = {}, className = '';
    switch (genderCd) {
        case Enum.GENDER_MALE_VALUE: {
            style = {
                backgroundColor: '#d1eefc'
            };
            className = 'maleRoot';
            break;
        }
        case Enum.GENDER_FEMALE_VALUE: {
            style = {
                backgroundColor: '#fedeed'
            };
            className = 'femaleRoot';
            break;
        }
        case Enum.GENDER_UNKNOWN_VALUE: {
            style = {
                backgroundColor: '#f8d186'
            };
            className = 'unknownSexRoot';
            break;
        }
    }
    if (isDead) {
        style = {
            backgroundColor: '#404040',
            color: '#fff'
        };
        className = 'deadRoot';
    }
    return { style, className };
};

/**get current login service/site siteParams value */
export function getSiteParamsValueByName(name, svcCd = null, siteId = null) {
    let siteParams = getState(state => state.common.siteParams);
    if (!svcCd) {
        svcCd = getState(state => state.login.service.svcCd);
    }
    if (!siteId) {
        siteId = getState(state => state.login.clinic.siteId);
    }
    if (siteParams && svcCd && siteId) {
        let config = getTopPriorityOfSiteParams(siteParams[name] || [], svcCd, siteId);
        if (config) {
            return config.paramValue;
        }
    }
    return null;
}

/**is current service/site run new case booking flow */
export function isNewCaseBookingFlow() {
    const state = storeConfig.store.getState();
    let configs = state.common.clinicConfig;
    if (!configs) return false;
    let isNewCaseFlow = getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.IS_NEW_CASE_BOOKING_FLOW);
    return isNewCaseFlow !== null ? parseInt(isNewCaseFlow) === 1 : false;
}

/**check is other patient working before open new patient */
export function handleBeforeOpenPatientPanel(patientKey, getPatientFunc) {
    let currentPatient = getState(state => state.patient.patientInfo);
    if (currentPatient && currentPatient.patientKey && currentPatient.patientKey !== patientKey) {
        dispatch(openCommonMessage({
            msgCode: '110154',
            params: [{ name: 'PATIENTCALL', value: getPatientCall() }],
            btnActions: {
                btn1Click: () => {
                    let subTabs = getState(state => state.mainFrame.subTabs);
                    let delFunc = (deep, name) => { dispatch(deleteSubTabs(name)); };
                    let changeTabs = (deep, name) => { dispatch(changeTabsActive(deep, name)); };
                    closeAllTabs(subTabs, delFunc, changeTabs, doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON).then(result => {
                        if (result) {
                            dispatch(resetAll());
                            getPatientFunc();
                        }
                    });
                }
            }
        }));
    } else {
        getPatientFunc();
    }
}

/** CGS family encounter search dialog confirming popup handler */
export function handleNextPatientForFamilyEncounterSearch(patientKey, getPatientFunc, callback) {
    const currentPatient = getState(state => state.patient.patientInfo);

    if (currentPatient && currentPatient.patientKey && currentPatient.patientKey !== patientKey) {
        dispatch(openCommonMessage({
            msgCode: '110178',
            btnActions: {
                btn1Click: () => {
                    const subTabs = getState(state => state.mainFrame.subTabs);
                    const delFunc = (deep, name) => { dispatch(deleteSubTabs(name)); };
                    const changeTabs = (deep, name) => { dispatch(changeTabsActive(deep, name)); };
                    closeAllTabs(subTabs, delFunc, changeTabs, doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON).then(result => {
                        if (result) {
                            dispatch(resetAll());
                            getPatientFunc();
                        }
                    });
                    callback && callback();
                }
            }
        }));
    } else {
        getPatientFunc();
    }
}

/**for validators stime/etime format: HH:mm */
export function isSameTime(stime, etime) {
    if (moment(stime).isValid() && moment(etime).isValid()) {
        if (moment(stime).isSame(moment(etime), 'minutes')) {
            return true;
        }
    }
    return false;
}

/**get accessright label by accessright name */
export function getMenuLabel(accessRightName) {
    const accessRights = getState(state => state.login.accessRights);
    if (accessRights) {
        const menuTab = accessRights.find(item => item.name === accessRightName);
        return menuTab && menuTab.label;
    }
}

/**doClose function: next patient action will do save check */
export function getDoCloseFunc_1(accessRightName, checkDirty, saveFunc, discardFunc, noChangeFunc) {
    const doClose = (callback, doCloseParams) => {
        if (checkDirty()) {
            let menuName = getMenuLabel(accessRightName);
            switch (doCloseParams.src) {
                case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_CALENDAR_VIEW_CHANGE_PATIENT:
                case doCloseFuncSrc.CLOSE_BY_EHS_WAITING_LIST:
                    dispatch(openCommonMessage({
                        msgCode: '110033',
                        params: [{ name: 'PAGENAME', value: menuName }],
                        btnActions: {
                            btn1Click: () => {
                                saveFunc(callback);
                            },
                            btn2Click: () => {
                                if (discardFunc) {
                                    discardFunc(callback);
                                } else {
                                    callback(true);
                                }
                            }
                        }
                    }));
                    break;
                case doCloseFuncSrc.CLOSE_BY_LOGOUT:
                case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                    saveFunc(callback);
                    break;
            }
        } else {
            switch (doCloseParams.src) {
                case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_CALENDAR_VIEW_CHANGE_PATIENT:
                    {
                        if (noChangeFunc) {
                            noChangeFunc(callback);
                        } else {
                            callback(true);
                        }
                        break;
                    }
                case doCloseFuncSrc.CLOSE_BY_LOGOUT:
                case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                    {
                        callback(true);
                        break;
                    }
            }
        }
    };
    return doClose;
}

/**doClose function: next patient action will direct discard save */
export function getDoCloseFunc_2(accessRightName, checkDirty, saveFunc, discardFunc, noChangeFunc) {
    const doClose = (callback, doCloseParams) => {
        if (checkDirty()) {
            let menuName = getMenuLabel(accessRightName);
            switch (doCloseParams.src) {
                case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                    dispatch(openCommonMessage({
                        msgCode: '110033',
                        params: [{ name: 'PAGENAME', value: menuName }],
                        btnActions: {
                            btn1Click: () => {
                                saveFunc(callback);
                            },
                            btn2Click: () => {
                                if (discardFunc) {
                                    discardFunc(callback);
                                } else {
                                    callback(true);
                                }
                            }
                        }
                    }));
                    break;
                case doCloseFuncSrc.CLOSE_BY_LOGOUT:
                case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                    callback(true);
                    break;
            }
        } else {
            switch (doCloseParams.src) {
                case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
                case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
                    {
                        if (noChangeFunc) {
                            noChangeFunc(callback);
                        } else {
                            callback(true);
                        }
                    }
                case doCloseFuncSrc.CLOSE_BY_LOGOUT:
                case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                    {
                        callback(true);
                        break;
                    }
            }
        }
    };
    return doClose;
}

export function runDoClose(doCloseFunc, accessRightName) {
    const tabs = getState(state => state.mainFrame.tabs);
    const subTabs = getState(state => state.mainFrame.subTabs);
    const allTabs = _.concat(tabs, subTabs);
    let tabItem = allTabs.find(x => x.name === accessRightName);
    if (tabItem) {
        let doCloseParams = { ...tabItem.doCloseParams, src: tabItem.deep === 1 ? doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON : doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON };
        dispatch(updateTabs({ [accessRightName]: { doCloseParams: doCloseParams } }));
        let colseTabsAction = (success) => {
            if (success) {
                if (tabItem.deep === 1) {
                    dispatch(deleteTabs(accessRightName));
                } else {
                    dispatch(deleteSubTabs(accessRightName));
                }
            }
        };
        doCloseFunc(colseTabsAction, doCloseParams);
    }
}

/**Compare two objects for equality */
export function isEqualObj(obj1, obj2) {
    let isNotEqual = true;
    if (!obj1 && !obj2) {
        return _.toString(obj1) === _.toString(obj2);
    }
    if (obj1 && obj2) {
        if (typeof obj1 === typeof obj2) {
            if (typeof obj1 === 'object' && typeof obj2 === 'object') {
                let obj1Keys = Object.keys(obj1).sort();
                let obj2Keys = Object.keys(obj2).sort();
                if (obj1Keys.length === obj2Keys.length && _.difference(obj1Keys, obj2Keys).length === 0) {
                    for (let key of obj1Keys) {
                        isNotEqual = !isEqualObj(obj1[key], obj2[key]);
                        if (isNotEqual) {
                            break;
                        }
                    }
                }
            } else {
                isNotEqual = (obj1 || null) !== (obj2 || null);
            }
        } else {
            if (typeof obj1 !== 'object' && typeof obj2 !== 'object') {
                isNotEqual = _.toString(obj1) !== _.toString(obj2);
            }
        }
    }
    return !isNotEqual;
}

/**get audit log description */
export function getAuditActionDesc(tabList, activeKey, action, specify = null) {
    let activeTab = tabList.find(item => item.name === activeKey);
    let funcName = activeTab ? activeTab.label : '';
    let alsDesc = '';
    if (!action && specify) {
        alsDesc = `${funcName} ${specify}`;
    } else {
        alsDesc = AlsDesc[action](funcName);
    }
    return alsDesc;
}

/**check is have accessright */
export function isHaveAccessRight(accessRightCd) {
    const list = getState(s => s.login.accessRights);
    const index = list.findIndex(x => x.name === accessRightCd);
    return index > -1;
}

/**get backdate walk in attendance day */
export function getBackdateWalkinDay() {
    let day = 0;
    if (isHaveAccessRight(accessRightEnum.AllowBackdateWalkIn)) {
        const value = getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.BACK_TAKE_ATTENDANCE_DAY);
        if (value) {
            day = parseInt(value);
        }
    }
    return day;
}

/**is Active session */
export function isActiveSession(sess) {
    return sess
        && sess.status === 'A'
        && (!sess.expyDate || moment(sess.expyDate).isSameOrAfter(moment(), 'days'))
        && (!sess.efftDate || moment(sess.efftDate).isSameOrBefore(moment(), 'days'));
}

/**is Active session id */
export function isActiveSessionId(sessId, sessionList) {
    const session = sessionList && sessionList.find(x => x.sessId === sessId);
    return isActiveSession(session) ? true : false;
}

export function getStatusDesc(sts) {
    const status = Enum.COMMON_STATUS.find(x => x.code === sts);
    return status && status.engDesc;
}

//get union string and filter null/undefined/empty value
export function getUnionString(strArr = [], split = ' ') {
    if (strArr) {
        return strArr.filter(x => _.toString(x)).join(split);
    }
    return '';
}

export function forceRefreshCells(rowNodes, cells) {
    let rowNode = rowNodes[0];
    if (rowNode) {
        setTimeout((rowNode) => {
            rowNode.gridApi.refreshCells({
                columns: cells,
                force: true
            });
        }, 100, rowNode);
    }
}

export function initDateRnage(clinicConfig, serviceCd, siteId, dateRangePara) {
    const dateRangeLimit = getTopPriorityOfSiteParams(clinicConfig, serviceCd, siteId, dateRangePara);
    if (dateRangeLimit && dateRangeLimit.configValue && new RegExp(CommonRegex.VALIDATION_REGEX_ZERO_INTEGER).test(dateRangeLimit.configValue)) {
        // this.props.updatePatientListField({ dateRangeLimit: parseInt(dateRangeLimit.configValue) });
        return parseInt(dateRangeLimit.configValue);
    } else {
        return null;
    }
}

/**
 * @description get menu name by accessRight code
 * @author Justin
 * @date 11/12/2020
 * @export
 * @param {*} accessRightCd
 * @returns {*}
 */
export function getMenuNameByCd(accessRightCd) {
    const list = getState(s => s.login.accessRights);
    const menu = list.find(x => x.name === accessRightCd);
    return menu && menu.label || '';
}

export function readySiteOptLbl(clinic) {
    return `${clinic.siteCd} - ${clinic.siteEngName || ''}`;
}


export function filterContentSvc(contentList, svcList) {
    const loginSvcCd = getState(state => state.login.service.svcCd);
    let filterSvc = [];
    if (contentList && contentList.length > 0) {
        contentList.forEach(c => {
            let svc = svcList.find(svc => svc.svcCd === c.svcCd);
            if (svc) {
                if (loginSvcCd === svc.svcCd) {
                    if (filterSvc.findIndex(x => x.svcCd === loginSvcCd) === -1) {
                        filterSvc.push(svc);
                    }
                }
                else {
                    if (filterSvc.findIndex(x => x.svcCd === svc.svcCd) === -1) {
                        filterSvc.push(svc);
                    }
                }
            }
        });
    }
    return filterSvc;
}

export function isSvcOnlyFilterContentSvc(contentList, svcList) {
    const loginSvcCd = getState(state => state.login.service.svcCd);
    let filterSvc = [];
    if (contentList && contentList.length > 0) {
        contentList.forEach(c => {
            let flag = null;
            if(c.isSvcOnly === 1){
                if(c.svcCd === loginSvcCd){
                    flag = c;
                }
            }else{
                flag = c;
            }
            let svc = svcList.find(svc => svc.svcCd === c.svcCd && flag);
            if (svc) {
                if (loginSvcCd === svc.svcCd) {
                    if (filterSvc.findIndex(x => x.svcCd === loginSvcCd) === -1) {
                        filterSvc.push(svc);
                    }
                }
                else {
                    if (filterSvc.findIndex(x => x.svcCd === svc.svcCd) === -1) {
                        filterSvc.push(svc);
                    }
                }
            }
        });
    }
    return filterSvc;
}

/**
 * @description is calc patient gestation date
 * @author Justin
 * @date 18/12/2020
 */
export function isUseGestCalc() {
    const clinicConfig = getState(state => state.common.clinicConfig);
    const svcCd = getState(state => state.login.service.serviceCd);
    const siteId = getState(state => state.login.clinic.siteId);
    let where = { serviceCd: svcCd, siteId };
    let config = getHighestPrioritySiteParams(Enum.CLINIC_CONFIGNAME.IS_USE_GEST_CALC, clinicConfig, where);
    let configVal = config && config.paramValue;
    return parseInt(configVal) === 1;
}

/**
 * @description get active data
 * @author Justin
 * @date 07/01/2021
 */
export function getActiveData({ list, statusFieldName, expyDateFieldName, efftDateFieldName }) {
    if (!statusFieldName) {
        statusFieldName = 'status';
    }
    if (!expyDateFieldName) {
        expyDateFieldName = 'expyDate';
    }
    if (!efftDateFieldName) {
        efftDateFieldName = 'efftDate';
    }
    return list && list.filter(x => x[statusFieldName] === 'A'
        && (!x[efftDateFieldName] || moment(x[efftDateFieldName]).isSameOrBefore(moment()))
        && (!x[expyDateFieldName] || moment(x[expyDateFieldName]).isSameOrAfter(moment())));
}


export function getWorkStationParam(paramName) {
    const workstationParams = getState(state => state.common.workstationParams);
    const target = workstationParams.find(params => params.paramName === paramName);
    // const siteTraySetting = getSiteParamsValueByName(printType);
    if (target) {
        return target.paramValue;
    } else {
        return null;
    }
}
export function getDefaultAttnStatusCd() {
    const clinicConfig = getState(state => state.common.clinicConfig);
    const svcCd = getState(state => state.login.service.serviceCd);
    const siteId = getState(state => state.login.clinic.siteId);
    const loginInfo = getState(state => state.login.loginInfo);
    const defaultAllStsSiteParam = getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'PATIENT_LIST_DEFAULT_STATUS_ALL');
    const defaultNotAttendStsSiteParam = getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'PATIENT_LIST_DEFAULT_STATUS_NOT_ATTEND');
    let defaultAllStsRoles = defaultAllStsSiteParam.configValue && defaultAllStsSiteParam.configValue.split('|');
    let defaultNotAttendRoles = defaultNotAttendStsSiteParam.configValue && defaultNotAttendStsSiteParam.configValue.split('|');
    let defaultAttnStatusCd = Enum.ATTENDANCE_STATUS.ATTENDED;
    if (defaultAllStsSiteParam.siteId) {
        if (defaultAllStsRoles && defaultAllStsRoles.findIndex(role => UserUtil.hasSpecificRole(loginInfo.userDto, role)) > -1) {
            defaultAttnStatusCd = '';
        }
    } else if (defaultNotAttendStsSiteParam.siteId) {
        if (defaultNotAttendRoles && defaultNotAttendRoles.findIndex(role => UserUtil.hasSpecificRole(loginInfo.userDto, role)) > -1) {
            defaultAttnStatusCd = Enum.ATTENDANCE_STATUS.NOT_ATTEND;
        }
    } else if (defaultAllStsSiteParam.svcCd) {
        if (defaultAllStsRoles && defaultAllStsRoles.findIndex(role => UserUtil.hasSpecificRole(loginInfo.userDto, role)) > -1) {
            defaultAttnStatusCd = '';
        }
    } else if (defaultNotAttendStsSiteParam.svcCd) {
        if (defaultNotAttendRoles && defaultNotAttendRoles.findIndex(role => UserUtil.hasSpecificRole(loginInfo.userDto, role)) > -1) {
            defaultAttnStatusCd = Enum.ATTENDANCE_STATUS.NOT_ATTEND;
        }
    } else if (defaultAllStsRoles && defaultAllStsRoles.findIndex(role => UserUtil.hasSpecificRole(loginInfo.userDto, role)) > -1) {
        defaultAttnStatusCd = '';
    } else if (defaultNotAttendRoles && defaultNotAttendRoles.findIndex(role => UserUtil.hasSpecificRole(loginInfo.userDto, role)) > -1) {
        defaultAttnStatusCd = Enum.ATTENDANCE_STATUS.NOT_ATTEND;
    } else {
        defaultAttnStatusCd = Enum.ATTENDANCE_STATUS.ATTENDED;
    }
    return defaultAttnStatusCd;
}

export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

export function checkingIsNotCounterRole(loginUserRoleList) {
    let cimsCounterRoleList = (loginUserRoleList || []).filter(item => item.uamRoleDto && item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-COUNTER');
    return cimsCounterRoleList.length <= 0;
}

export function closeTabByPatientSpecTabCloseBtn() {
    const subTabs = getState(state => state.mainFrame.subTabs);
    let tabList = _.cloneDeep(subTabs);
    let delFunc = (deep, name) => {
        if (parseInt(deep) === 2) {
            dispatch((deleteSubTabs(name)));
        }
    };
    let activeTabFunc = (deep, name) => {
        dispatch(changeTabsActive(deep, name));
    };

    dispatch(updateField({
        curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON
    }));
    closeAllTabs(tabList, delFunc, activeTabFunc, doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON).then(result => {
        if (result) {
            dispatch(skipTab(accessRightEnum.patientSummary));
        }
        dispatch(updateField({
            curCloseTabMethodType: null
        }));
    });
}

export function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offSet = 0; offSet < byteCharacters.length; offSet += sliceSize) {
        let slice = byteCharacters.slice(offSet, offSet + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

export const windowPrint = (reportBase64, callback) => {
    const blob = b64toBlob(reportBase64, 'application/pdf');
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.src = blobUrl;
    iframe.setAttribute('style', 'position: fixed; left: -9999px;');
    document.body.appendChild(iframe);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    if (callback && typeof (callback) === 'function') callback();
};

export const downloadByBase64 = (reportBase64, filename, exportType, callback) => {
    if (!filename) return;
    if (!exportType) return;
    let type = '';
    switch (exportType) {
        case 'PDF': { type = 'application/pdf'; filename += '.pdf'; break; }
        case 'CSV': { type = 'text/csv,charset=UTF-8'; filename += '.csv'; break; }
        case 'XLSX': { type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; filename += '.xlsx'; break; }
    }

    let byteCharacters = atob(reportBase64);
    let byteArrays = [];
    if (exportType === 'CSV') {
        byteCharacters = '\ufeff' + decodeURIComponent(escape(atob(reportBase64)));
        byteArrays = [byteCharacters];
    } else {
        let sliceSize = 512;
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);
            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
    }
    let blob = new Blob(byteArrays, { type: type });
    const element = document.createElement('a');
    element.setAttribute('href', URL.createObjectURL(blob));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (callback && typeof (callback) === 'function') callback();
};

export const sleep = (duration = 1000) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
};

export function calElementOffsetTop(element) {
    return element?.offsetTop + (element?.offsetParent ? calElementOffsetTop(element?.offsetParent) : 0);
}

export function getEhsSharedComponentsStore() {
    return globalEventDistributor.stores[combineSpaPrefixAndPath(EHS_SHARED_COMPONENT_SPA_CONFIG.spaPrefix, EHS_SHARED_COMPONENT_SPA_CONFIG.spaStorePath)];
}

export function onlyServerSharingDoc(item) {
    const svcCd = getState(state => state.login.service.svcCd);
    let flag = null;
    if(item.isSvcOnly === 1){
        if(item.svcCd === svcCd){
            flag = item;
        }
    }else{
        flag = item;
    }
    return flag;
}
