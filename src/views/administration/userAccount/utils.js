import { PAGE_STATUS } from '../../../enums/administration/userAccount';
import { GFMIS_ROLE_MAPPING } from '../../../enums/enum';
import _ from 'lodash';
import memoize from 'memoize-one';

export const isSelfEditing = memoize((loginId, userId, pageStatus) => {
    if(loginId && userId && _.toString(loginId) === _.toString(userId) && pageStatus === PAGE_STATUS.EDITING) {
        return true;
    } else {
        return false;
    }
});

export const isSelectedConflictShroffRole = (selectedList) => {
    let role1Index = selectedList && selectedList.findIndex(x => _.toUpper(x.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_OPERATOR);
    let role2Index = selectedList && selectedList.findIndex(x => _.toUpper(x.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR);
    let role3Index = selectedList && selectedList.findIndex(x => _.toUpper(x.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_ADMIN);
    return role1Index > -1 && role2Index > -1 && role3Index > -1;
};

export const isExistConflictShroffRole = (selectedList) => {
    return selectedList && selectedList.some(x =>
        _.toUpper(x.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_OPERATOR ||
        _.toUpper(x.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR ||
        _.toUpper(x.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_ADMIN);
};