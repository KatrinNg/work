import { getState } from '../store/util';

export const getBaseRole = (userDto) => {
    return userDto?.uamMapUserRoleDtos?.find(x => x.uamRoleDto.isBaseRole === 1)?.uamRoleDto;
};

export const getBaseRoleName = (userDto) => {
    return getBaseRole(userDto)?.roleName;
};

export const isClinicalBaseRole = (userDto) => {
    return !!userDto?.uamMapUserRoleDtos?.find(x => x.uamRoleDto.isBaseRole === 1 && x.uamRoleDto.roleName.indexOf('CIMS-COUNTER') !== 0);
};

export const hasClinicalFunction = (accessRights) => {
    return accessRights?.some(x => x.isClinical === 'Y' && x.type === 'function' && !x.hasChildren);
};

export const hasNonClinicalFunction = (accessRights) => {
    return accessRights?.some(x => x.isClinical === 'N' && x.type === 'function' && !x.hasChildren);
};

export const isClinicalGo = (loginInfo) => {
    const { isClinicalBaseRole, hasClinicalFunction, hasNonClinicalFunction } = loginInfo;
    return ((isClinicalBaseRole && hasNonClinicalFunction) || (!isClinicalBaseRole && hasClinicalFunction));
};

export const isPucHandle = (loginInfo, pucChecking) => {
    const { isClinicalBaseRole, hasClinicalFunction, hasNonClinicalFunction } = loginInfo;
    const pucResult = pucChecking?.pucResult;
    const justificationAction = pucChecking?.justificationAction;
    return (pucResult === 101 || (pucResult === 102 && justificationAction === 'cancel')) && isClinicalGo(loginInfo);
};

export const isPuc102Handle = (loginInfo, pucChecking) => {
    const { isClinicalBaseRole, hasClinicalFunction, hasNonClinicalFunction } = loginInfo;
    const pucResult = pucChecking?.pucResult;
    return (pucResult === 102) && isClinicalGo(loginInfo);
};

export const hasSpecificRole=(userDto,nameStr)=>{
    return userDto?.uamMapUserRoleDtos?.some(x=>x.uamRoleDto.isBaseRole===1&&x.uamRoleDto.roleName.indexOf(nameStr)===0);
};

export const isSystemAdminSetting = () => {
    const isSystemAdmin = getState(state => state.login.isSystemAdmin);
    return isSystemAdmin;
};

export const isServiceAdminSetting=()=>{
    const isSystemAdmin = getState(state => state.login.isSystemAdmin);
    const isServiceAdmin = getState(state => state.login.isServiceAdmin);
    return !isSystemAdmin && isServiceAdmin;
};

export const useroIsServiceAdminSetting=()=>{
    const isServiceAdmin = getState(state => state.login.isServiceAdmin);
    return  isServiceAdmin;
};

export const isClinicalAdminSetting=()=>{
    const isSystemAdmin = getState(state => state.login.isSystemAdmin);
    const isServiceAdmin = getState(state => state.login.isServiceAdmin);
    const isClinicalAdmin = getState(state => state.login.isClinicalAdmin);
    return !isSystemAdmin && !isServiceAdmin && isClinicalAdmin;
};

export const userIsClinicaSetting=()=>{
    const isClinicalAdmin = getState(state => state.login.isClinicalAdmin);
    return isClinicalAdmin;
};

export const currentUserBaseRole = (userDto) => {
    if(userDto) {
        if(hasSpecificRole(userDto, 'CIMS-DOCTOR')) {
            return 'D';
        } else if (hasSpecificRole(userDto, 'CIMS-NURSE')) {
            return 'N';
        } else if (hasSpecificRole(userDto, 'CIMS-COUNTER')) {
            return 'C';
        }
    }
    return '';
};

export const hasAccessRight = (accessRightCd) => getState((state) => state?.login?.accessRights)?.find((accessRight) => accessRight.name === accessRightCd);