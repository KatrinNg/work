import * as types from '../actions/login/loginActionType';
import { maskAxios, axios } from '../../services/axiosInstance';
import { take, call, put, all, takeEvery, race, select } from 'redux-saga/effects';
import * as commonType from '../actions/common/commonActionType';
import * as bookingType from '../actions/appointment/booking/bookingActionType';
import * as messageType from '../actions/message/messageActionType';
import * as patientType from '../actions/patient/patientActionType';
import * as clinicalNoteTypes from '../actions/clinicalNote/clinicalNoteActionType';
import * as caseNoType from '../actions/caseNo/caseNoActionType';
import CommonMessage from '../../constants/commonMessage';
import * as CommonUtilities from '../../utilities/commonUtilities';
import { SiteParamsUtil, PaymentUtil } from '../../utilities';
import { putSiteId } from '../actions/login/loginAction';
import { listServiceApi, listClinicApi } from '../sagas/commonSaga';
import { getDtsPreloadAllSpecialties } from '../sagas/dts/preload/dtsPreloadDataSaga';  //DH Miki
import * as dtsPreloadDataActionType from '../actions/dts/preload/DtsPreloadDataActionType'; //DH Miki
import { getServeRoom } from '../actions/dts/appointment/bookingAction'; //DH Edmund
import { connect } from 'react-redux';
import Enum,{ filterRoomsEncounterTypeSvc } from '../../enums/enum';
import moment from 'moment';
import { alsStartTrans, alsEndTrans } from '../actions/als/transactionAction';
import { getState } from '../util';
import { alsLogFrontEndAction } from '../actions/als/logAction';
import { alsTakeLatest, alsTakeEvery } from './als/alsLogSaga';
import * as logActions from '../actions/als/logAction';
import {getIsPMICaseNoAliasGen,getIsPMICaseWithEnctrGrp} from '../../utilities/siteParamsUtilities';
import _ from 'lodash';

function isLoginWithSam(svcCd, siteId) {
    const samSiteParams = getState(state => state.login.samSiteParams);
    let config = CommonUtilities.getTopPriorityOfSiteParams(samSiteParams || [], svcCd, siteId);
    return config && config.paramValue ? parseInt(config.paramValue) === 1 : true;
}

function* doLogin() {
    while (true) {
        let { params, callback = null } = yield take(types.DO_LOGIN);
        try {
            yield put(alsStartTrans());

            let callParams = {
                serviceCd: params.serviceCode,
                clinicCd: params.clinicCode,
                siteId: params.siteId,
                loginName: params.loginName,
                password: params.password,
                fromIdleDialog: params.isIdleLogin ? true : false
            };
            window.sessionStorage.setItem('userId', callParams.loginName);


            let loginWithSam = isLoginWithSam(params.serviceCode, params.siteId);
            let respond;
            if (params.isIdleLogin) {

                respond = yield call(maskAxios.post, '/user/identityAuthentication', callParams);
            } else {
                if (loginWithSam) {
                    if (params.forceLogin || params.isIdleLogin) {
                        callParams.forceLogin = 1;
                    } else {
                        callParams.forceLogin = 0;
                    }
                    respond = yield call(maskAxios.post, '/user/loginWithSam', callParams);
                } else {
                    respond = yield call(maskAxios.post, '/user/login', callParams);
                }
            }

            let { data } = respond;
            if (data.respCode === 0) {
                if (!params.isIdleLogin) {
                    //don't use idle token since it is not from SAM3.0
                    window.sessionStorage.setItem('token', data.data.token);

                    //log login successful als log
                    let functionName = 'Login';
                    if (callParams.forceLogin !== 0) {
                        functionName = 'Force Login';
                    }
                    yield put(logActions.alsLogAudit({
                        desc: `[${functionName}] Login success.`,
                        dest: 'user',
                        functionName: `${functionName}`,
                        isEncrypt: false
                    }));
                }
                data.data['ecsLocCode'] = params.ecsLocCode;
                let expyDateSite = data.data.userDto.uamMapUserSiteDtos.find((item) => {
                    return item.siteId === params.siteId && item.expyDate && moment(item.expyDate).isBefore(moment(), 'day');
                });

                if (expyDateSite !== undefined) {
                    yield put({
                        type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                        data: data.data,
                        errMsg: CommonMessage.LOGIN_USER_NOT_ASSIGNED_SVC_OR_SITE()
                    });
                    return;
                }
                let clinic = yield select(state => state.login.clinic);
                yield put({
                    type: types.LOGIN_PRE_SUCCESS,
                    loginInfo: data.data
                });
                if (!params.isIdleLogin) {
                    window.sessionStorage.setItem('token', data.data.token);
                    window.localStorage.removeItem('ehsLabelSetting');
                }
                window.sessionStorage.setItem('loginWithSam', loginWithSam ? 1 : 0);
                data.data['ecsLocCode'] = params.ecsLocCode;
                const userRoleType = data.data.userRoleType || '';
                const ipAddr=yield select(state=>state.login.loginForm.ipInfo.ipAddr);
                //config call
                const [encounterTypes, rooms, clinicConfig, listConfig, quotaConfig, serviceSessionsConfig, deleteReasons, specialRqstTypes, clnDefaultRmConfig, outDocumentTypes, inDocumentTypes, workStationParams, specialties] = yield all([
                    call(maskAxios.get, '/cmn/services/' + data.data.service_cd + '/encounterTypes?siteId=' + clinic.siteId),
                    call(maskAxios.get, '/cmn/services/' + data.data.service_cd + '/rooms'),
                    // call(maskAxios.post, '/common/listClinicConfigMap', {}),
                    call(maskAxios.get, '/cmn/siteParams/map'),
                    // call(maskAxios.post, '/common/listListConfigMap', { serviceCd: data.data.service_cd, userGroupCd: userRoleType })
                    call(maskAxios.get, '/cmn/services/' + data.data.service_cd + '/listConfigs?svcCd=' + data.data.service_cd + '&userGroupCd=' + userRoleType),
                    // This is set the clinic config for (quota type);
                    call(maskAxios.get, '/cmn/services/' + data.data.service_cd + '/quotaDisplaySets'),
                    call(maskAxios.get, '/cmn/services/' + data.data.service_cd + '/sessions'),
                    call(maskAxios.get, '/ana/appointments/deleteReasons?svcCd=' + data.data.service_cd + '&siteId=' + data.data.site_id),
                    call(maskAxios.get, '/ana/anaSpecialRqstTypes?svcCd=' + data.data.service_cd),
                    call(maskAxios.get, '/cmn/services/' + data.data.service_cd + '/clnDefaultRmConfig/rooms'),
                    call(maskAxios.get, '/clinical-doc/outDocumentTypes/'),
                    call(maskAxios.get, '/clinical-doc/inDocumentTypes/'),
                    call(maskAxios.get, `/cmn/workstationParam/${ipAddr}`),
                    call(maskAxios.get, `/cmn/services/${data.data.service_cd}/specialties`)
                ]);

                // dental Miki sprint 7 2020/08/13 - Start
                if (data.data.service_cd == 'DTS') {
                    yield put({ type: dtsPreloadDataActionType.GET_ALL_SPECIALTIES, params: null });
                    yield put({ type: dtsPreloadDataActionType.GET_ALL_ANA_CODE, params: null });
                    yield put({ type: dtsPreloadDataActionType.GET_ALL_CNC_CODE, params: null });
                    yield put({ type: dtsPreloadDataActionType.POST_CATEGORIES_ANA, params: [''] });
                    yield put({ type: dtsPreloadDataActionType.POST_CATEGORIES_CNC, params: ['SPECIAL NEEDS CATEGORY', 'SPECIAL NEEDS SUB-CATEGORY'] });
                    // call(getDtsPreloadAllSpecialties, {});
                    yield put(getServeRoom({userId: data.data.userDto.userId, date: moment()}));
                    yield put({ type: dtsPreloadDataActionType.GET_ALL_REMARK_TYPE, params: null});
                    yield put({ type: dtsPreloadDataActionType.GET_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL, params: null });
                }
                // dental Miki sprint 7 2020/08/13 - End

                // added by Tim sprint 36 2020/12/2 - Start
                if (data.data.service_cd == 'THS') {
                    yield put({ type: patientType.LIST_THS_DESTINATION });
                }
                // added by Tim sprint 36 2020/12/2 - Start

                // Setup the outDocumentTypes
                const outDocumentTypesData = outDocumentTypes.data;
                if (outDocumentTypesData && outDocumentTypesData.respCode === 0) {
                    let outDocumentTypesList = outDocumentTypesData.data ?? [];

                    outDocumentTypesList = _.orderBy(outDocumentTypesList, ['outDocTypeId'], ['asc']);
                    outDocumentTypesList = _.filter(outDocumentTypesList, {'svcCd': data.data.service_cd});
                    outDocumentTypesList = _.uniqBy(outDocumentTypesList, 'outDocTypeDesc');

                    yield put({type: commonType.SET_OUT_DOCUMENT_TYPES, data: {fullList: outDocumentTypesData.data, mySvcList: outDocumentTypesList}});
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: outDocumentTypesData.errMsg ? outDocumentTypesData.errMsg : 'Get Default out document types Failed.',
                        data: outDocumentTypesData.data
                    });
                }

                // Setup the inDocumentTypes
                const inDocumentTypesData = inDocumentTypes.data;
                if (inDocumentTypesData && inDocumentTypesData.respCode === 0) {
                    let inDocumentTypesList = inDocumentTypesData.data ?? [];

                    inDocumentTypesList = _.orderBy(inDocumentTypesList, ['inDocTypeId'], ['asc']);
                    inDocumentTypesList = _.filter(inDocumentTypesList, {'svcCd': data.data.service_cd});
                    inDocumentTypesList = _.uniqBy(inDocumentTypesList, 'inDocTypeDesc');

                    yield put({type: commonType.SET_IN_DOCUMENT_TYPES, data: {fullList: inDocumentTypesData.data, mySvcList: inDocumentTypesList}});
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: outDocumentTypesData.errMsg ? outDocumentTypesData.errMsg : 'Get Default out document types Failed.',
                        data: outDocumentTypesData.data
                    });
                }

                // Setup the clnDefaultRmCnfig
                const clnDefaultRmConfigData = clnDefaultRmConfig.data;
                if (clnDefaultRmConfigData && clnDefaultRmConfigData.respCode === 0) {
                    let sessionsList = (clnDefaultRmConfigData.data || []);
                    yield put({ type: commonType.SET_DEFAULT_ROOM_CONFIG, data: sessionsList });
                } else {
                    yield put({
                        type: commonType.SET_DEFAULT_ROOM_CONFIG,
                        error: clnDefaultRmConfigData.errMsg ? clnDefaultRmConfigData.errMsg : 'Get Default room config Failed.',
                        data: clnDefaultRmConfigData.data
                    });
                }

                // Setup the sessions config of the logged in service
                const serviceSessionsConfigData = serviceSessionsConfig.data;
                if (serviceSessionsConfigData && serviceSessionsConfigData.respCode === 0) {
                    let sessionsList = (serviceSessionsConfigData.data || []).filter(item => item.svcCd === data.data.service_cd && item.status === 'A');
                    sessionsList.sort((a, b) => {
                        return a.sessDesc.localeCompare(b.sessDesc);
                    }
                    );
                    yield put({ type: commonType.SET_SESSIONS, data: sessionsList.filter(sess => sess.siteId === data.data.site_id) });
                    yield put({ type: commonType.SET_SERVICE_SESSIONS, data: sessionsList });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: serviceSessionsConfigData.errMsg ? serviceSessionsConfigData.errMsg : 'Get Service Session Config Failed.',
                        data: serviceSessionsConfigData.data
                    });
                }

                // Setup the quota Config
                const quotaConfigData = quotaConfig.data;
                if (quotaConfigData && quotaConfigData.respCode === 0) {
                    yield put({ type: commonType.SET_QUOTA_TYPES, data: quotaConfigData.data });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: quotaConfigData.errMsg ? quotaConfigData.errMsg : 'Get Quota Config Failed.',
                        data: quotaConfigData.data
                    });
                }

                const encounterTypesData = encounterTypes.data;
                if (encounterTypesData && encounterTypesData.respCode === 0) {
                    yield put({ type: commonType.SET_ENCOUNTER_TYPES, data: encounterTypesData.data });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: encounterTypesData.errMsg ? encounterTypesData.errMsg : 'Get EncounterTypes Failed.',
                        data: encounterTypesData.data
                    });
                }
                const roomsData = rooms.data;
                if (roomsData && roomsData.respCode === 0) {
                    yield put({ type: commonType.SET_ROOMS, data: roomsData.data });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: roomsData.errMsg ? roomsData.errMsg : 'Get Rooms Failed.',
                        data: roomsData.data
                    });
                }
                const clinicConfigData = clinicConfig.data;
                const listConfigData = listConfig.data;
                if (clinicConfigData && clinicConfigData.respCode === 0) {
                    yield put({ type: commonType.UPDATE_CONFIG, clinicConfig: clinicConfigData.data });
                    let where = { serviceCd: data.data.service_cd, clinicCd: data.data.clinic_cd };
                    window.sessionStorage.setItem('quotaTypeArray', JSON.stringify(CommonUtilities.getQuotaDescArray(clinicConfigData.data, where)));
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: clinicConfigData.errMsg ? clinicConfigData.errMsg : 'Get Clinic Config Failed.',
                        data: clinicConfigData.data
                    });
                }

                //get case prefix or alias rules
                if (SiteParamsUtil.getIsPMICaseNoAliasGen(clinicConfigData.data, data.data.service_cd, data.data.site_id)) {
                    yield put({ type: caseNoType.LIST_ALIAS_RULES, svcCd: data.data.service_cd, siteId: data.data.site_id });
                } else {
                    yield put({ type: caseNoType.LIST_CASE_PREFIX, serviceCd: '' });
                }

                if (listConfigData && listConfigData.respCode === 0) {
                    yield put({ type: commonType.UPDATE_LIST_CONFIG, listConfig: listConfigData.data, loginInfo: data.data });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: listConfigData.errMsg ? listConfigData.errMsg : 'Get List Config Failed.',
                        data: listConfigData.data
                    });
                }
                const deleteReasonsData = deleteReasons.data;
                if (deleteReasonsData && deleteReasonsData.respCode === 0) {
                    yield put({ type: commonType.PUT_DELETE_REASONS, deleteReasonsList: deleteReasonsData.data });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: deleteReasonsData.errMsg ? deleteReasonsData.errMsg : 'Get Delete Reasons Failed.',
                        data: deleteReasonsData.data
                    });
                }
                const specialRqstTypesData = specialRqstTypes.data;
                if (specialRqstTypesData && specialRqstTypesData.respCode === 0) {
                    yield put({ type: commonType.PUT_SPECREQ_TYPES, specReqTypesList: specialRqstTypesData.data });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: specialRqstTypesData.errMsg ? specialRqstTypesData.errMsg : 'Get Special Request List Type Failed.',
                        data: specialRqstTypesData.data
                    });
                }

                const workStationParamsData=workStationParams.data;
                if(workStationParamsData&&workStationParamsData.respCode===0){
                    yield put({type:commonType.UPDATE_WORKSTATION_PARAM,workstationParams:workStationParamsData.data});
                }else{
                    // yield put({
                    //     type: commonType.OPEN_ERROR_MESSAGE,
                    //     error: specialRqstTypesData.errMsg ? specialRqstTypesData.errMsg : 'Get Special Request List Type Failed.',
                    //     data: specialRqstTypesData.data
                    // });
                }

                const specialtiesData = specialties.data;
                if (specialtiesData && specialtiesData.respCode === 0) {
                    yield put({ type: commonType.PUT_SPECIALTIES, specialties: specialtiesData.data });
                } else {
                    yield put({
                        type: commonType.OPEN_ERROR_MESSAGE,
                        error: specialtiesData.errMsg ? specialtiesData.errMsg : 'Get Specialties Failed.',
                        data: specialtiesData.data
                    });
                }

                //Base role = CIMS-COUNTER -> Always open Patient Summary
                yield put({ type: commonType.GET_LOGINUSER_ROLE, loginUserRoleList: data.data.userDto.uamMapUserRoleDtos || [] });

                //common codelist
                yield put({ type: commonType.GET_CODE_LIST });
                yield put({ type: commonType.GET_ENCOUNTER_TYPE_LIST, isGetNew: true });
                if(filterRoomsEncounterTypeSvc.indexOf(data.data.service_cd) > -1){
                    yield put({ type: commonType.GET_ROOMS_ENCOUNTER_TYPE_LIST, params:{ siteId: data.data.siteId} });
                }
                yield put({ type: commonType.GET_EHS_TEAM_SITE_LIST });

                yield put({ type: patientType.LIST_NATIONALITY_AND_LIST_COUNTRY });

                yield put({ type: commonType.GET_PATIENT_SEARCH_TYPE });
                //Added by Renny on 20200226 for dynamically loading spa. Begin
                yield put({ type: commonType.UPDATE_SPA_LIST, spaList: data.data.spaAccessRights });
                //Added by Renny on 20200226 for dynamically loading spa. End
                yield put({ type: types.LOGIN_SUCCESS, loginInfo: data.data });

                //get  group list
                yield put({ type: commonType.GET_GROUP });
                //get hospital list
                yield put({ type: commonType.GET_HOSPITAL });
                //get specialty list
                yield put({ type: commonType.GET_SPECIALTY });
                //get passport list
                yield put({ type: commonType.LIST_PASSPORT });
                //encounter group
                const isPmiCaseNoAliasGen= getIsPMICaseNoAliasGen(clinicConfigData.data, data.data.service_cd, data.data.site_id);
                const isPmiCaseWithEnctrGrp= getIsPMICaseWithEnctrGrp(clinicConfigData.data, data.data.service_cd, data.data.site_id);
                if(isPmiCaseNoAliasGen&&isPmiCaseWithEnctrGrp){
                    yield put({type:caseNoType.LIST_ENCOUNTER_GROUP,params:{svcCd:data.data.service_cd,status:'A'}});
                }

                callback && callback();
            } else if (data.respCode === 100) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_INVALID()
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_EXPIRED()
                });
            } else if (data.respCode === 103 || data.respCode === 107) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_LOCKED()
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_TEMPORARY_PASSWORD_EXPIRED()
                });
            } else if (data.respCode === 104) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_ROLE_INVALID()
                });
            } else if (data.respCode === 105) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_PASSWORD_NOT_EFFECTIVE()
                });
            } else if (data.respCode === 106) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_USER_INACTIVE
                });
            } else if (data.respCode === 108) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_USER_DELETED
                });
            } else if (data.respCode === 109) {
                if (params.isIdleLogin) {
                    yield put({
                        type: types.IDLE_LOGIN_ERROR,
                        data: data.data,
                        errMsg: CommonMessage.LOGIN_USER_REDIS_CONFLICT()
                    });
                } else {
                    yield put({
                        type: types.UPDATE_STATE,
                        data: { isNeedForceLogin: true }
                    });
                }
            } else if (data.respCode === 110) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_USER_GENERATE_TOKEN_ERROR()
                });
            } else if (data.respCode === 111) {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: CommonMessage.LOGIN_USER_NOT_ASSIGNED_SVC_OR_SITE()
                });
            } else {
                yield put({
                    type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR,
                    data: data.data,
                    errMsg: data.errMsg ? data.errMsg : 'Login Failed.'
                });
            }
        } catch (error) {
            if (error && error.response && error.response.status === 401 && params.isIdleLogin) {
                yield put({ type: types.IDLE_LOGIN_ERROR, errMsg: CommonMessage.SESSION_HAS_EXPIRED() });
            } else {
                yield put({ type: params.isIdleLogin ? types.IDLE_LOGIN_ERROR : types.LOGIN_ERROR, errMsg: 'Service error.' });
            }
            yield put(logActions.auditError(error && error.message));

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* logoutStep1() {
    yield put({ type: types.UPDATE_STATE, data: { isLoginSuccess: false } });
}

function* logoutStep2() {
    yield put({ type: types.CLEAN_LOGIN_INFO });
}

function* doLoginOut() {
    while (true) {
        yield take(types.LOGOUT);
        yield put(alsStartTrans());
        try {
            let svcCd = yield select(state => state.login.service.svcCd);
            let siteId = yield select(state => state.login.clinic.siteId);
            let loginName = yield select(state => state.login.loginInfo.loginName);
            let loginWithSam = isLoginWithSam(svcCd, siteId);
            let ipAddr = yield select(state => state.login.loginForm.ipInfo.ipAddr);
            let loginInfo = yield select(state => state.login.loginInfo);
            let roleName = PaymentUtil.getRoleOfPayment(loginInfo);
            let macAddr = yield select(state => state.common.spaRcp.rcpMachine?.rcpMachineMacDto?.macAddr);
            if (loginWithSam) {
                let params = {};
                if(macAddr){
                    params = {
                        roleName: roleName,
                        macAddr: macAddr,
                        ipAddr: ipAddr
                    };
                }
                yield call(axios.get, '/user/logout/' + loginName, { params: params });
            } else {
                yield put(alsLogFrontEndAction('user')); //for als log
            }
        } catch (error) {
            yield put(logActions.auditError(error && error.message));
        } finally {
            yield call(logoutStep1);
            yield call(logoutStep2);
            yield put(alsEndTrans());
        }
        // yield call(logoutStep1);
        // yield call(logoutStep2);
    }
}

function* refreshToken() {
    while (true) {
        try {
            yield take(types.REFRESH_TOKEN);
            yield put(alsStartTrans());

            let params = { oldToken: window.sessionStorage.getItem('token') };
            let svcCd = yield select(state => state.login.service.svcCd);
            let siteId = yield select(state => state.login.clinic.siteId);
            let loginName = yield select(state => state.login.loginInfo.loginName);
            let loginWithSam = isLoginWithSam(svcCd, siteId);
            let respond;
            if (loginWithSam) {
                params.loginName = loginName;
                respond = yield call(axios.post, '/user/refreshTokenWithSam', params);
            } else {
                respond = yield call(axios.post, '/user/refreshToken', params);
            }
            let { data } = respond;
            if (data.respCode === 0) {
                let token = '';
                if (loginWithSam) {
                    token = data.data;
                } else {
                    token = data.data.data;
                }
                window.sessionStorage.setItem('token', token);
            } else {
                window.sessionStorage.setItem('token', '');
            }
        } catch (error) {
            window.sessionStorage.setItem('token', '');
            yield put(logActions.auditError(error && error.message));
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getServiceNotice() {
    while (true) {
        try {
            yield take(types.GET_SERVICE_NOTICE);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/cmn/notices?isPeriodLimi=true');
            if (data.respCode === 0) {
                yield put({
                    type: types.PUT_SERVICE_NOTICE,
                    data: data.data
                });
            } else {
                yield put({
                    type: commonType.OPEN_ERROR_MESSAGE,
                    error: data.errorMessage ? data.errorMessage : 'Get service notice error'
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* getContactUs() {
    while (true) {
        try {
            yield take(types.GET_CONTACT_US);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/cmn/siteParams');
            if (data.respCode === 0) {
                const names = ['CONTACT_ADDRESS', 'CONTACT_FAX', 'CONTACT_PHONE', 'CONTACT_EMAIL', 'CONTACT_LOTUS_NOTES', 'CONTACT_REMARK'];
                const filterData = data.data.filter(x => names.includes(x.paramName));
                yield put({
                    type: types.PUT_CONTACT_US,
                    data: filterData
                });
            } else {
                yield put({
                    type: commonType.OPEN_ERROR_MESSAGE,
                    error: data.errMsg ? data.errMsg : 'Get contact us information error'
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

export function* loginRange() {
    return yield call(maskAxios.get, '/user/loginAvailableSites');
}

export function* getSamSiteParams() {
    return yield call(maskAxios.get, '/cmn/siteParams/map', { params: { paramName: 'IS_ENABLE_SAM3' } });
}

function* getErrorMessage(msg) {
    return yield put({
        type: commonType.OPEN_ERROR_MESSAGE,
        error: msg
    });
}

function* preLoadData() {
    yield alsTakeEvery(types.PRE_LOAD_DATA, function* (action) {
        try {
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'open' });
            yield put({ type: messageType.GET_MESSAGE_LIST_BY_APP_ID, params: { applicationId: 1 } });
            const { services, sites, clientIps, samSiteParams } = yield all({
                services: call(listServiceApi, {}),
                sites: call(listClinicApi, {}),
                clientIps: call(loginRange),
                samSiteParams: call(getSamSiteParams)
            });
            let serviceList, clinicList;
            if (services.data.respCode === 0) {
                serviceList = services.data.data;
                yield put({ type: commonType.PUT_LIST_SERVICE, serviceList });
            } else {
                yield call(getErrorMessage, 'Get service list error');
            }

            if (sites.data.respCode === 0) {
                clinicList = sites.data.data;
                yield put({ type: commonType.PUT_LIST_CLINIC, clinicList });
            } else {
                yield call(getErrorMessage, 'Get site list error');
            }

            if (samSiteParams.data.respCode === 0) {
                let samParams = samSiteParams.data && samSiteParams.data.data && samSiteParams.data.data.IS_ENABLE_SAM3;
                yield put({ type: types.UPDATE_STATE, data: { samSiteParams: samParams } });
            } else {
                yield call(getErrorMessage, 'Get sam site params error');
            }

            if (clientIps.data.respCode === 0) {
                const lastLoginServiceClinc = JSON.parse(window.sessionStorage.getItem('lastLoginServiceClinc'));
                const clientData = clientIps.data.data;
                const siteIds = clientData.siteIds || [];
                const showAllServiceFlag = clientData.showAllServiceFlag || 0;
                const ipInfo = { ipAddr: clientData.ipAddr, pcName: clientData.pcName, primarySiteId: clientData.primarySiteId };
                let serviceAndClinicGp = null;
                if (siteIds.length > 0) {
                    serviceAndClinicGp = CommonUtilities.loadIpRangeServiceAndClinic(serviceList, clinicList, siteIds);
                } else {
                    if (parseInt(showAllServiceFlag) !== 0) {
                        serviceAndClinicGp = CommonUtilities.loadIpRangeServiceAndClinic(serviceList, clinicList, null);
                    }
                }

                let defaultSelected = null;
                if (serviceAndClinicGp) {
                    const clientServiceList = serviceAndClinicGp.clientServiceList;
                    const clientSiteList = serviceAndClinicGp.clientSiteList;
                    const primarySiteId = clientData.primarySiteId;
                    if (clientServiceList.length > 0 && clientSiteList.length > 0) {
                        let default_svcCd = clientServiceList[0]['svcCd'];
                        let default_site = clientSiteList.find(item => item.svcCd === default_svcCd);
                        if (primarySiteId) {
                            const primarySite = clientSiteList.find(x => x.siteId === primarySiteId);
                            default_site = primarySite;
                            default_svcCd = primarySite.svcCd;
                            defaultSelected = { svcCd: default_svcCd, siteId: default_site && default_site.siteId };
                        } else {
                            if (lastLoginServiceClinc) {
                                const serviceIndex = clientServiceList.findIndex(item => item.svcCd === lastLoginServiceClinc.svcCd);
                                const clinicIndex = clientSiteList.filter(item => item.svcCd === lastLoginServiceClinc.svcCd).findIndex(item => parseInt(item.siteId) === parseInt(lastLoginServiceClinc.siteId));
                                if (serviceIndex !== -1 && clinicIndex !== -1) {
                                    defaultSelected = { svcCd: lastLoginServiceClinc.svcCd, siteId: lastLoginServiceClinc.siteId };
                                }
                            }
                            defaultSelected = { svcCd: default_svcCd, siteId: default_site && default_site.siteId };
                        }
                    }
                }

                yield put({
                    type: types.PUT_CLIENT_IP,
                    ipInfo,
                    defaultSelected,
                    serviceAndClinicGp
                });
            } else {
                yield call(getErrorMessage, 'Get client ip error');
            }
        } finally {
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        }
    });
}


export const loginSagas = [
    doLogin,
    doLoginOut,
    refreshToken,
    getServiceNotice,
    getContactUs,
    preLoadData
];
