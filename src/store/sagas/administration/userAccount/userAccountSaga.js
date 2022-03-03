import { take, select, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as uamType from '../../../actions/administration/userAccount/userAccountActionType';
import * as messageType from '../../../actions/message/messageActionType';
import qs from 'qs';
import _ from 'lodash';
import moment from 'moment';
import * as AdminUtil from '../../../../utilities/administrationUtilities';
import { PAGE_STATUS } from '../../../../enums/administration/userAccount';
import Enum from '../../../../enums/enum';
import { initService } from '../../../../constants/administration/administrationConstants';
import { alsStartTrans, alsEndTrans } from '../../../actions/als/transactionAction';
import { alsTakeLatest } from '../../als/alsLogSaga';

function* initUserInfo(data) {
    if (data) {
        const loginUser = yield select(state => state.login.loginInfo.userDto);
        const service = yield select(state => state.login.service);
        const clinicList = yield select(state => state.common.clinicList);
        const isSystemAdmin = yield select(state => state.login.isSystemAdmin);
        const isServiceAdmin = yield select(state => state.login.isServiceAdmin);
        const isClinicalAdmin = yield select(state => state.login.isClinicalAdmin);
        let userInfo = {
            chiFullName: data.chiFullName,
            contactPhone: data.cntctPhn,
            email: data.email,
            engGivenName: data.engGivName,
            engSurname: data.engSurname,
            genderCd: data.genderCd,
            loginName: data.loginName,
            position: data.position,
            salutation: data.salutation,
            status: data.status,
            supervisor: data.supervisor,
            userExpiryDate: data.acctExpyDate ? moment(data.acctExpyDate) : null,
            efftDate: data.acctEfftDate ? moment(data.acctEfftDate) : null,
            userId: data.userId,
            ehruId: data.ehrId,
            ecsUserId: data.ecsUserId,
            doctorCd: data.hclDrCode,
            isAdmin: data.isAdmin,
            passCode: data.passcode,
            sha256Passcode: data.passcode,
            isPassCodeShow: (!data.passcode && isSystemAdmin) ? true : false,
            version: data.version

        };
        let uaAvailableSvcList = [];
        let otherSvcUaAvailableSvcList = [];
        if (!isSystemAdmin) {
            uaAvailableSvcList = AdminUtil.getUserAttainSvcList(data, service.serviceCd);
            otherSvcUaAvailableSvcList = AdminUtil.getUserUnAttainSvcList(data, service.serviceCd);
        } else {
            uaAvailableSvcList = _.cloneDeep(data.uamMapUserSvcDtos || []);
        }
        if (uaAvailableSvcList.length === 0) {
            let newSvc = _.cloneDeep(initService);
            newSvc.createBy = data.loginName;
            newSvc.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
            newSvc.updateBy = data.loginName;
            newSvc.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
            uaAvailableSvcList.push(newSvc);
        }

        let uaAvailableSiteList = [];
        let otherSvcUaAvailableSiteList = [];
        if (!isSystemAdmin) {
            uaAvailableSiteList = AdminUtil.getUserAttainSiteList(data, service.serviceCd, clinicList);
            otherSvcUaAvailableSiteList = AdminUtil.getUserUnAttainSiteList(data, service.serviceCd, clinicList);
        } else {
            uaAvailableSiteList = _.cloneDeep(data.uamMapUserSiteDtos || []);
        }
        if (uaAvailableSiteList.length === 0) {
            uaAvailableSiteList = AdminUtil.initUserSiteList(loginUser);
        }
        data.uamMapUserRoleDtos = data.uamMapUserRoleDtos.map(item => ({
            roleId: item.roleId,
            roleName: item.uamRoleDto && item.uamRoleDto.roleName,
            status: item.status,
            version: item.version,
            userRoleId: item.userRoleId,
            svcCd: item.uamRoleDto && item.uamRoleDto.svcCd,
            efftDate: item.efftDate,
            expyDate: item.expyDate,
            userId: item.userId
        }));
        let uaAvailableUserRoles = [];
        let otherSvcSelectedUserRoleList = [];
        if (!isSystemAdmin) {
            uaAvailableUserRoles = AdminUtil.getUserAttainUserRoleList(data, service.serviceCd);
            otherSvcSelectedUserRoleList = _.cloneDeep(data.uamMapUserRoleDtos || []).filter(item => item.svcCd !== service.serviceCd && item.svcCd);
        } else {
            uaAvailableUserRoles = _.cloneDeep(data.uamMapUserRoleDtos || []);
        }
        let pageStatus = PAGE_STATUS.EDITING;
        if (userInfo.status === Enum.COMMON_STATUS_LOCKED
            || userInfo.status === Enum.COMMON_STATUS_EXPIRED
            || moment(userInfo.acctExpyDate).isBefore(moment(), 'day')) {
            pageStatus = PAGE_STATUS.NONEDITABLE;
        }
        yield put({
            type: uamType.INIT_USER_INFO,
            sourceUser: data,
            userInfo,
            uaAvailableSiteList,
            uaAvailableSvcList,
            uaAvailableUserRoles,
            pageStatus,
            otherSvcSelectedUserRoleList,
            otherSvcUaAvailableSvcList,
            otherSvcUaAvailableSiteList
        });
    }
}

function* getUserById() {
    while (true) {
        try {
            let { userId, callback } = yield take(uamType.GET_UAMINFO);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/user/users/' + userId);
            if (data.respCode === 0) {
                yield call(initUserInfo, _.cloneDeep(data.data));
                callback && callback(data.data);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getUserPasscode() {
    while (true) {
        try {
            let { userId, callback } = yield take(uamType.GET_USERPASSCODE);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/user/users/' + userId);
            if (data.respCode === 0) {
                callback && callback(data.data);
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getSupervisorList() {
    while (true) {
        try {
            let { userSvcCds } = yield take(uamType.GET_SUPERVISOR_LIST);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/user/users', {
                params: { svcCds: userSvcCds, statuses: [Enum.COMMON_STATUS_ACTIVE] },
                paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
            });
            if (data.respCode === 0) {
                const userInfo = yield select(state => state.userAccount.uaGeneral.userInfo);
                const sourceUser = yield select(state => state.userAccount.uaGeneral.sourceUser);
                let supers = _.cloneDeep(data.data || []);
                if (sourceUser) {
                    supers = supers.filter(item => item.userId !== sourceUser.userId);
                }
                if (userInfo && userInfo.supervisor) {
                    if (supers.findIndex(item => item.loginName === userInfo.supervisor) === -1) {
                        supers.unshift({
                            loginName: userInfo.supervisor
                        });
                    }
                }
                yield put({ type: uamType.INIT_SUPERVISOR_LIST, list: supers });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getSuggestLoginName() {
    while (true) {
        try {
            let { surname, givname } = yield take(uamType.GET_SUGGEST_LOGIN_NAME);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/user/users/suggestLoginName', {
                params: {
                    surName: surname,
                    givenName: givname
                }
            });
            if (data.respCode === 0) {
                yield put({ type: uamType.INIT_SUGGEST_LOGIN_NAME, loginName: data.data });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* listAllUserRole() {
    while (true) {
        try {
            let { params } = yield take(uamType.LIST_ALL_USER_ROLE);
            yield put(alsStartTrans());

            let url = 'user/roles?';
            if (params) {
                const { statuses, svcCds } = params;
                if (Array.isArray(statuses)) {
                    statuses.forEach(item => {
                        url += `statuses=${item}&`;
                    });
                }
                if (Array.isArray(svcCds)) {
                    svcCds.forEach(item => {
                        url += `svcCds=${item}&`;
                    });
                }
            }
            url = url.substring(0, url.length - 1);

            let { data } = yield call(maskAxios.get, url);
            if (data.respCode === 0) {
                yield put({
                    type: uamType.RESET_ALL_USER_ROLE,
                    data: data.data
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* insertUser() {
    while (true) {
        try {
            let { userDto } = yield take(uamType.INSERT_USER);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/user/users', userDto);
            if (data.respCode === 0) {
                yield put({ type: uamType.SAVE_SUCCESS });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110341',
                        showSnackbar: true
                    }
                });
                const doCloseCallbackFunc = yield select(state => state.userAccount.doCloseCallbackFunc);
                if (doCloseCallbackFunc) {
                    doCloseCallbackFunc(true);
                }
            } else if (data.respCode === 100) {
                //login name already exist.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110343',
                        showSnackbar: true
                    }
                });
            } else if (data.respCode === 101) {
                // email has been used.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110344',
                        showSnackbar: true
                    }
                });
            } else if (data.respCode === 103) {
                //no access right to unlock user.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110398',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 104) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '110366' }
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getUserList() {
    while (true) {
        try {
            let { params } = yield take(uamType.GET_USERLIST);
            yield put(alsStartTrans());

            let svcCdUrl = '';
            if (params.svcCds && params.svcCds.length > 0) {
                params.svcCds.forEach(element => {
                    svcCdUrl += `&svcCds=${element || ''}`;
                });
            }
            let siteIdUrl = '';
            if (params.siteIds && params.siteIds.length > 0) {
                params.siteIds.forEach(element => {
                    siteIdUrl += `&siteIds=${element || ''}`;
                });
            }
            let loginNameUrl = '';
            if (params.loginNames && params.loginNames.length > 0) {
                params.loginNames.forEach(element => {
                    siteIdUrl += `&loginNames=${element || ''}`;
                });
            }
            let { data } = yield call(maskAxios.get, `/user/users?statuses=!D${svcCdUrl}${siteIdUrl}${loginNameUrl}&isNeedMap=Y`);
            if (data.respCode === 0) {
                yield put({ type: uamType.PUT_USERLIST, data: data.data, serviceList: params.serviceList, clinicList: params.clinicList });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* updateUser() {
    while (true) {
        try {
            let { userDto } = yield take(uamType.UPDATE_USER);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.put, '/user/users', userDto);
            if (data.respCode === 0) {
                yield put({ type: uamType.SAVE_SUCCESS });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110342',
                        showSnackbar: true
                    }
                });
                const doCloseCallbackFunc = yield select(state => state.userAccount.doCloseCallbackFunc);
                if (doCloseCallbackFunc) {
                    doCloseCallbackFunc(true);
                }
            } else if (data.respCode === 3) {
                //user has been modified.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 100) {
                //login name already exist.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110343',
                        showSnackbar: true
                    }
                });
            } else if (data.respCode === 101) {
                // email has been used.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110344',
                        showSnackbar: true
                    }
                });
            } else if (data.respCode === 102) {
                // user has been delete.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110314',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 103) {
                //no access right to unlock user.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110398',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 104) {
                // effective date should be grather than today
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110335',
                        showSnackbar: true,
                        variant: 'warning'
                    }
                });
            } else if (data.respCode === 105) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '110366' }
                });
            } else if (data.respCode === 106) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '110380', showSnackbar: true }
                });
            } else if (data.respCode === 107) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '110381', showSnackbar: true }
                });
            } else if (data.respCode === 108) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: { msgCode: '110382', showSnackbar: true }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* deleteUser() {
    while (true) {
        try {
            let { params, callback } = yield take(uamType.DELETE_USER);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.delete, '/user/users', { data: params });
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110602',
                        showSnackbar: true
                    }
                });
                callback && callback();
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }

    }
}

function* changePasscode() {
    while (true) {
        try {
            let { params, callback } = yield take(uamType.CHANGE_PASSCODE);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/user/changePasscode', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111804',
                        showSnackbar: true
                    }
                });
                callback && callback();
            } else if (data.respCode === 3) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032'
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
        } finally {
            yield put(alsEndTrans());
        }

    }
}

function* resetPassword(){
    yield alsTakeLatest(uamType.USER_ACCOUNT_RESET_PASSWORD, function*(action){
        let {loginName, sendType, callback} = action;
        let {data} = yield call(maskAxios.post, 'user/getTemporaryPassword', {
            loginId: loginName,
            sendType: sendType
        });

        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '130800',
                    params: [
                        { name: 'LOGIN_NAME', value: loginName }
                    ]
                }
            });
            callback && callback();
        } else if (data.respCode === 101) {//USER_EXPIRED
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '130801'
                }
            });
        } else if (data.respCode === 102) {//LOCKED
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '130802'
                }
            });
        } else if (data.respCode === 103) {//EMAIL_BLANK
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '130803',
                    params: [
                        { name: 'LOGIN_NAME', value: loginName }
                    ]
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

    });
}

function* genAccountStaffID(){
    yield alsTakeLatest(uamType.GEN_ACCOUNT_STAFF_ID, function*(action){
        const {userId,loginName,callback}=action;
        let {data}=yield call(maskAxios.get,`/user/genStaffIdCard?userId=${userId}&loginName=${loginName}`);
        if(data.respCode===0){
            //yield print({ base64: data.data});
            yield put({
                type:uamType.UPDATE_STATE,
                updateData:{staffIDPreviewData:data.data}
            });
            callback&&callback();
        }
    });
}

export const userAccountSaga = [
    getUserById,
    getSupervisorList,
    getSuggestLoginName,
    insertUser,
    updateUser,
    getUserList,
    listAllUserRole,
    deleteUser,
    changePasscode,
    getUserPasscode,
    resetPassword,
    genAccountStaffID
];