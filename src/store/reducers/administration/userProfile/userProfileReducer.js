import * as administrationType from '../../../actions/administration/administrationActionType';
import ButtonStatusEnum from '../../../../enums/administration/buttonStatusEnum';
import _ from 'lodash';
import { initUserData } from '../../../../constants/administration/administrationConstants';
import moment from 'moment';

const administrationState = {
    status: ButtonStatusEnum.VIEW,
    userSearchList: [],
    userSearchData: _.cloneDeep(initUserData),
    pageCodeList: [],
    userRelatedRoleData: [],
    defaultUserStatus: 'I'
};

export default (state = administrationState, action = {}) => {
    switch (action.type) {
        case administrationType.RESET_ALL: {
            return {...administrationState,userExpiryDate: moment().add(10,'years'),efftDate: moment()};
        }

        case administrationType.CANCEL_EDIT: {
            return {
                ...state,
                status: ButtonStatusEnum.VIEW,
                userSearchData: {..._.cloneDeep(initUserData),userExpiryDate: moment().add(10,'years'),efftDate: moment()}
            };
        }

        case administrationType.EDIT_USER_PROFILE: {
            return {
                ...state,
                status: ButtonStatusEnum.EDIT
            };
        }

        case administrationType.ADD_USER_PROFILE: {
            return {
                ...state,
                status: ButtonStatusEnum.ADD,
                userSearchData:{..._.cloneDeep(initUserData),userExpiryDate: moment().add(10,'years'),efftDate: moment()}
            };
        }

        case administrationType.PUT_USER_LIST: {
            return {
                ...state,
                userSearchList: action.data
            };
        }

        case administrationType.PUT_USER_DATA: {
            return {
                ...state,
                userSearchData: action.data,
                userRelatedRoleData: action.data.userRoleDtos || [],
                status: ButtonStatusEnum.DATA_SELECTED,
                defaultUserStatus:action.data.status
            };
        }

        case administrationType.PUT_SAVE_USER_PROFILE_SUCCESS: {
            return {
                ...state,
                status: ButtonStatusEnum.SEARCH
            };
        }

        case administrationType.PUT_CODE_LIST: {
            return {
                ...state,
                pageCodeList: action.codeList
            };
        }

        case administrationType.UPDATE_STATE: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case administrationType.UPDATE_FIELD: {
            let { name, value } = action;
            let userSearchData = { ...state.userSearchData };
            userSearchData[name] = value;
            return {
                ...state,
                userSearchData
            };
        }

        case administrationType.CLEAR_USER_RELATED_ROLE: {
            return {
                ...state,
                userRelatedRoleData: []
            };
        }
        default:
            return state;
    }
};