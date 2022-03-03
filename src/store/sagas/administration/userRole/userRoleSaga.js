import { take, takeLatest, takeEvery, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as userRoleType from '../../../actions/administration/userRole';
import * as messageType from '../../../actions/message/messageActionType';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import * as AdminUtil from '../../../../utilities/administrationUtilities';
import qs from 'qs';
import _ from 'lodash';
import { PAGE_STATUS } from '../../../../enums/administration/userRole';
import Enum from '../../../../enums/enum';
import {alsTakeLatest, alsTakeEvery} from '../../als/alsLogSaga';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';


function* fetchSaveUserRole(action) {
    const { params } = action;
    let { data } = !params.roleId ? yield call(maskAxios.post, '/user/roles', params) : yield call(maskAxios.put, '/user/roles', params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: params.roleId ? '110358' : '110357',
                showSnackbar: true
            }
        });

        const doCloseCallbackFunc = yield select(state => state.userRole.doCloseCallbackFunc);
        if (doCloseCallbackFunc) {
            doCloseCallbackFunc(true);
        }else{
            yield put({ type: userRoleType.RESET_ALL });
        }
    } else if (data.respCode === 1) {
        //todo parameterException
    } else if (data.respCode === 3) {
        //Submission failed
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032'
            }
        });
    } else if (data.respCode === 103) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: { msgCode: '110365' }
        });
    } else if (data.respCode === 102) {
        //Records do not exist!
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110314'
            }
        });
    } else if (data.respCode === 101) {
        //Invalid parameter!
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110315'
            }
        });
    } else if (data.respCode === 100) {
        //Records already exist!
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110313'
            }
        });
    } else if (data.respCode === 104) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110383'
            }
        });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* saveUserRole() {
    yield alsTakeLatest(userRoleType.SAVE_USER_ROLE, fetchSaveUserRole);
}

function* getUserRoles() {
    yield alsTakeEvery(userRoleType.GET_USER_ROLES, function* () {
        const svcCd = yield select(state => state.login.service && state.login.service.svcCd);
        let { data } = yield call(maskAxios.get, `/user/roles?statuses=${Enum.COMMON_STATUS_ACTIVE},${Enum.COMMON_STATUS_INACTIVE}`);
        if (data.respCode === 0) {
            const list = data.data.filter(item => item.svcCd === svcCd || !item.svcCd);
            const sortedList = AdminUtil.sortedUserRoles(list);
            yield put({ type: userRoleType.LOAD_USER_ROLES, data: sortedList });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* initRoleMember() {
    yield alsTakeEvery(userRoleType.INIT_ROLE_MEMBER, function* (action) {
        const { uamUserDtos } = action;
        // const uamMapUserSvcDtos = yield select(state => state.login.loginInfo.userDto.uamMapUserSvcDtos);
        // const svcCd = yield select(state => state.login.service && state.login.service.svcCd);
        // let svcCds = uamMapUserSvcDtos.map(item => item.svcCd);
        // if (isBaseRole === 0) {
        //     svcCds = svcCds.filter(item => item === svcCd);
        // }
        const urDetail=yield select(state=>state.userRole.urDetail);
        let { data } = yield call(maskAxios.get, '/user/users', {
            params: { statuses: ['!D'], svcCds: urDetail.svcCd||'' },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
        });
        if (data.respCode === 0) {
            let selectedList = [], availableList = [];
            if (uamUserDtos && uamUserDtos.length > 0) {
                selectedList = _.cloneDeep(uamUserDtos);
                const userIds = uamUserDtos.map(item => item.userId);
                availableList = data.data.filter(item => !userIds.includes(item.userId));
            } else {
                availableList = data.data;
            }
            let _selectedList = selectedList.map(item => {
                return {
                    ...item,
                    displayStr: `${item.loginName}[${CommonUtil.getFullName(item.engGivName, item.engSurname, ' ')}]`
                };
            });
            let _availableList = availableList.map(item => {
                return {
                    ...item,
                    displayStr: `${item.loginName}[${CommonUtil.getFullName(item.engGivName, item.engSurname, ' ')}]`
                };
            });
            yield put({
                type: userRoleType.LOAD_USER_MEMBER,
                availableList: _availableList,
                selectedList: _selectedList
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* editUserRoleById() {
    yield alsTakeEvery(userRoleType.EDIT_USER_ROLE_BY_ID, function* (action) {
        const { roleId } = action;
        const userRoles = yield select(state => state.userRole.urList.userRoles);
        const { data } = yield call(maskAxios.get, '/user/roles/' + roleId);
        if (data.respCode === 0) {
            yield put({ type: userRoleType.INIT_ROLE_MEMBER, uamUserDtos: data.data.uamUserDtos, isBaseRole: data.data.isBaseRole });
            let details = {
                roleId: data.data.roleId,
                roleName: data.data.roleName,
                svcCd: data.data.svcCd,
                status: data.data.status,
                roleDesc: data.data.roleDesc,
                version: data.data.version,
                accessRights: data.data.codAccessRightDtos || [],
                isBaseRole:data.data.isBaseRole
            };
            yield put({
                type: userRoleType.PREVIEW_USER_ROLE_DETAILS,
                details: details,
                replicableRole: _.cloneDeep(userRoles || []).filter(item => item.roleId !== roleId)
            });
            yield put({ type: userRoleType.UPDATE_STATE, updateData: { pageStatus: PAGE_STATUS.EDITING } });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* createUserRole() {
    yield alsTakeEvery(userRoleType.CREATE_USER_ROLE, function* () {
        const userRoles = yield select(state => state.userRole.urList.userRoles);
        yield put({ type: userRoleType.INIT_ROLE_MEMBER, isBaseRole: 0 });
        const svcCd = yield select(state => state.login.service && state.login.service.svcCd);
        let details = { svcCd: svcCd };
        yield put({
            type: userRoleType.PREVIEW_USER_ROLE_DETAILS,
            details: details,
            replicableRole: _.cloneDeep(userRoles || [])
        });
        yield put({ type: userRoleType.UPDATE_STATE, updateData: { pageStatus: PAGE_STATUS.ADDING } });
    });
}

function* deleteUserRoles() {
    yield alsTakeEvery(userRoleType.DELETE_USER_ROLES, function* (action) {
        const { roleIds } = action;
        let { data } = yield call(maskAxios.delete, '/user/roles/' + roleIds.join(','));
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110359',
                    params: [{ name: 'NUMBER', value: data.data.length }],
                    showSnackbar: true
                }
            });
            yield put({ type: userRoleType.GET_USER_ROLES });
            const urList = yield select(state => state.userRole.urList);
            yield put({
                type: userRoleType.UPDATE_STATE, updateData: {
                    urList: {
                        ...urList,
                        selected: []
                    }
                }
            });
        } else if (data.respCode === 100) {
            //can not find
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110360',
                    showSnackbar: true
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: { msgCode: '110363' }
            });
        } else if (data.respCode === 102) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: { msgCode: '110364' }
            });
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

function* searchAccessRight() {
    const groupAccess = (list, parent, result) => {
        let header = parent ? ((parent.itemLevel !== 0 ? parent.itemHeader + '^' : '') + parent.accessRightName) : null;
        list.filter(x => parent ? (x.itemLevel !== 0 && x.itemHeader === header) : x.itemLevel === 0).forEach(x => {
            x.childCodAccessRightDtos = [];
            if (x.itemLevel === 0)
                result.push(x);
            else
                parent && parent.childCodAccessRightDtos.push(x);
            groupAccess(list, x, result);
        });
    };

    while (true) {
        try{
            let { params } = yield take(userRoleType.SEARCH_ACCESS_RIGHT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/user/listAccessRight', params);
            if (data.respCode === 0) {
                const patientCall = CommonUtil.getPatientCall();
                let accessList = AdminUtil.updateAccessRightsPatientCall(data.data, patientCall);
                let eformRawList = _.cloneDeep(accessList.filter(x => x.accessRightType === 'eform'));
                let eformList = [];
                groupAccess(eformRawList, null, eformList);
                accessList = accessList.filter(x => x.accessRightType !== 'eform');
                accessList.push(...eformList);
                yield put({ type: userRoleType.GET_ACCESS_RIGHT, data: accessList });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* updateReplicableRole() {
    yield alsTakeEvery(userRoleType.UPDATE_REPLICABLE_ROLE, function* (action) {
        const { value } = action;
        const urDetail = yield select(state => state.userRole.urDetail);
        const urMember = yield select(state => state.userRole.urMember);

        if (!value) {
            yield put({
                type: userRoleType.UPDATE_STATE,
                updateData: {
                    urDetail: {
                        ...urDetail,
                        replicableRoleSelect: value,
                        accessRights: []
                    },
                    urMember: {
                        ...urMember,
                        availableList: urMember.availableList.concat(urMember.selectedList),
                        selectedList: []
                    }
                }
            });
        } else {
            let { data } = yield call(maskAxios.get, '/user/roles/' + value);
            if (data.respCode === 0) {
                yield put({ type: userRoleType.INIT_ROLE_MEMBER, uamUserDtos: data.data.uamUserDtos, isBaseRole: 0 });
                yield put({
                    type: userRoleType.UPDATE_STATE,
                    updateData: {
                        urDetail: {
                            ...urDetail,
                            replicableRoleSelect: value,
                            accessRights: data.data.codAccessRightDtos || []
                        }
                    }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        }
    });
}


export const userRoleSaga = [
    saveUserRole,
    getUserRoles,
    editUserRoleById,
    createUserRole,
    deleteUserRoles,
    initRoleMember,
    searchAccessRight,
    updateReplicableRole
];