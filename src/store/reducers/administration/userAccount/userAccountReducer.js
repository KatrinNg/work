import _ from 'lodash';
import * as uamType from '../../../actions/administration/userAccount/userAccountActionType';
import { PAGE_STATUS } from '../../../../enums/administration/userAccount';
import { initUserData } from '../../../../constants/administration/administrationConstants';
import * as CommonUtilities from '../../../../utilities/commonUtilities';

const initState = {
    pageStatus: PAGE_STATUS.VIEWING,
    uaInfo: {
        currentSelectedUserId: 0,
        currentSelectedUserVersion: '',
        uaList: [],
        steps: ['General Information', 'User Role', 'Clinic(s)'],
        activeStep: 0
    },
    uaGeneral: {
        sourceUser: null,
        userInfo: _.cloneDeep(initUserData),
        supervisorList: null,
        uaServiceList: [],
        otherSvcUaAvailableSvcList: []
    },
    uaUserRole: {
        searchAvailableVal: null,
        searchSelectedVal: null,
        availableUserRoleList: [],
        selectedUserRoleList: [],
        availableIndex: '',
        selectedIndex: '',
        otherSvcSelectedUserRoleList: []
    },
    uaClinics: {
        uaClinicList: [],
        otherSvcUaAvailableSiteList: []
    },
    doCloseCallbackFunc: null,
    changePasscodeDialogInfo: {
        userName: '',
        open: false,
        passCode: '',
        rePassCode: '',
        isAdmin: '',
        version: ''
    },
    staffIDPreviewData:null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case uamType.RESET_ALL: {
            return { ...initState };
        }
        case uamType.UPDATE_STATE: {

            return { ...state, ...action.updateData };
        }
        case uamType.UPDATE_UAMINFO: {
            let uaInfo = { ...state.uaInfo, ...action.updateData };
            return { ...state, uaInfo };
        }
        case uamType.INIT_USER_INFO: {
            let uaGeneral = {
                ...state.uaGeneral,
                sourceUser: action.sourceUser,
                userInfo: action.userInfo,
                uaServiceList: action.uaAvailableSvcList,
                otherSvcUaAvailableSvcList: action.otherSvcUaAvailableSvcList
            };
            let uaClinics = {
                ...state.uaClinics,
                uaClinicList: action.uaAvailableSiteList,
                otherSvcUaAvailableSiteList: action.otherSvcUaAvailableSiteList
            };
            let uaUserRole = {
                ...state.uaUserRole,
                selectedUserRoleList: action.uaAvailableUserRoles,
                otherSvcSelectedUserRoleList: action.otherSvcSelectedUserRoleList
            };
            return { ...state, uaGeneral, uaClinics, uaUserRole, pageStatus: action.pageStatus };
        }
        case uamType.INIT_SUPERVISOR_LIST: {
            const { uaGeneral } = state;
            return {
                ...state,
                uaGeneral: {
                    ...uaGeneral,
                    supervisorList: action.list
                }
            };
        }
        case uamType.INIT_SUGGEST_LOGIN_NAME: {
            const { uaGeneral } = state;
            return {
                ...state,
                uaGeneral: {
                    ...uaGeneral,
                    userInfo: {
                        ...uaGeneral.userInfo,
                        loginName: action.loginName
                    }
                }
            };
        }
        case uamType.RESET_ALL_USER_ROLE: {
            let _selectedUserRoleList = _.cloneDeep(state.uaUserRole.selectedUserRoleList);
            // let sourceRoleList = _.cloneDeep(state.uaGeneral.sourceUser.uamMapUserRoleDtos);
            let allUserRole = action.data;
            let seq = 0;
            allUserRole.forEach(role => {
                role.seq = seq;
                seq++;
            });
            return {
                ...state,
                uaUserRole: {
                    ...state.uaUserRole,
                    availableUserRoleList: allUserRole,
                    selectedUserRoleList: _selectedUserRoleList
                }
            };
        }
        case uamType.LOAD_ALL_USER_ROLE: {
            let _selectedUserRoleList = _.cloneDeep(state.uaUserRole.selectedUserRoleList);
            // let sourceRoleList = _.cloneDeep(state.uaGeneral.sourceUser.uamMapUserRoleDtos);
            let allUserRole = action.data;
            let seq = 0;
            allUserRole.forEach(role => {
                role.seq = seq;
                seq++;
            });

            if (_selectedUserRoleList.length > 0) {
                _selectedUserRoleList.forEach(item => {
                    let selUserRole = allUserRole.find(role => role.roleId === item.roleId);
                    if (selUserRole) {
                        item.seq = selUserRole.seq;
                    }
                    allUserRole = allUserRole.filter(role => role.roleId !== item.roleId);
                });

                _selectedUserRoleList.sort((a, b) => { return a.seq - b.seq; });
            }
            return {
                ...state,
                uaUserRole: {
                    ...state.uaUserRole,
                    availableUserRoleList: allUserRole,
                    selectedUserRoleList: _selectedUserRoleList
                }
            };
        }
        case uamType.PUT_USERLIST: {
            let uaList = CommonUtilities.getCommonUserList(action.data, action.serviceList, action.clinicList);
            let availableUserRoleList = _.cloneDeep(state.uaUserRole.availableUserRoleList);

            return {
                ...state,
                uaInfo: { ...initState.uaInfo, uaList: uaList },
                uaUserRole: { ...state.uaUserRole, availableUserRoleList }
            };
        }
        case uamType.SAVE_SUCCESS: {
            return { ...initState, pageStatus: PAGE_STATUS.VIEWING };
        }
        default:
            return state;

    }
};