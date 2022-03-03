import * as userRoleType from '../../../actions/administration/userRole';
import { PAGE_STATUS } from '../../../../enums/administration/userRole';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
// import * as AdminUtil from '../../../../utilities/administrationUtilities';

const initState = {
    pageStatus: PAGE_STATUS.VIEWING,
    urList: {
        selected: [],
        userRoles: []
    },
    urDetail: {
        //user role information
        roleId: null,
        svcCd: null,
        roleName: '',
        roleDesc: '',
        status: Enum.COMMON_STATUS_ACTIVE,
        version: null,
        replicableRoleSelect: null,
        replicableRole: [],

        //access right
        allMenuList: [],
        accessRights: [],
        selectedRightCd: ''
    },
    urMember: {
        searchAvailableVal: null,
        searchSelectedVal: null,
        availableList: [],
        selectedList: [],
        availableIndex: '',
        selectedIndex: ''
    },
    doCloseCallbackFunc: null
};


function filterParent(data, state) {
    if (!data) {
        return [];
    }
    if (data.childCodAccessRightDtos.length === 0) {
        return data;
    }
    else {
        let child = [];
        data.open = state;
        data.childCodAccessRightDtos.forEach(childRight => {
            let oneChild = filterParent(childRight, state);
            child.push(oneChild);
        });
        data.childCodAccessRightDtos = child;

        return data;
    }
}

function triggerMenu(data, cd, cdName) {
    let menus = _.cloneDeep(data);
    let index = menus.findIndex(item => item[cdName] === cd);

    if (index > -1) {
        menus[index].open = !menus[index].open;
    }

    menus.forEach((right, i) => {
        if (right.childCodAccessRightDtos && right.childCodAccessRightDtos.length > 0) {
            menus[i].childCodAccessRightDtos = triggerMenu(right.childCodAccessRightDtos, cd, cdName);
        }
    });
    return menus;
}

function getAllMenuList(data, state) {
    let allMenuList = [];

    data.forEach(menu => {
        let tempMenu = filterParent(menu, state);
        allMenuList.push(tempMenu);
    });
    return allMenuList;
}

function resetMenuOpenStatus(data) {
    let tempMenu = getAllMenuList(data, false);
    return tempMenu;
}

export default (state = initState, action = {}) => {
    switch (action.type) {
        case userRoleType.RESET_ALL: {
            return { ...initState };
        }

        case userRoleType.UPDATE_STATE: {
            return { ...state, ...action.updateData };
        }

        case userRoleType.LOAD_USER_ROLES: {
            return {
                ...state,
                urList: {
                    ...state.urList,
                    selected: [],
                    userRoles: action.data
                }
            };
        }

        case userRoleType.PREVIEW_USER_ROLE_DETAILS: {
            const { details, replicableRole } = action;
            return {
                ...state,
                urDetail: {
                    ...state.urDetail,
                    ...details,
                    replicableRole: replicableRole,
                    allMenuList: resetMenuOpenStatus(state.urDetail.allMenuList)
                }
            };
        }

        case userRoleType.LOAD_USER_MEMBER: {
            return {
                ...state,
                urMember: {
                    ...state.urMember,
                    availableList: action.availableList,
                    selectedList: action.selectedList
                }
            };
        }

        case userRoleType.GET_ACCESS_RIGHT: {
            let allMenu = getAllMenuList(action.data, false);
            return {
                ...state,
                urDetail: {
                    ...state.urDetail,
                    allMenuList: allMenu
                }
            };
        }

        case userRoleType.OPEN_MENU: {
            let { allMenuList } = state.urDetail;
            allMenuList = triggerMenu(allMenuList, action.accessRightCd, 'accessRightCd');
            return {
                ...state,
                urDetail: {
                    ...state.urDetail,
                    allMenuList
                }
            };
        }

        case userRoleType.SELECT_MENU_LIST: {
            return {
                ...state,
                urDetail: {
                    ...state.urDetail,
                    accessRights: action.accessRights
                }
            };
        }

        default:
            return state;

    }
};