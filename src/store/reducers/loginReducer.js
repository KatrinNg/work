import * as types from '../actions/login/loginActionType';
import moment from 'moment';
import _ from 'lodash';
import Enum from '../../enums/enum';
import * as commonUtilities from '../../utilities/commonUtilities';
import { ALS_ACTION_HISTORY_SESSION_KEY, ALS_FUNCTION_NAME_SESSION_KEY, ALS_FUNCTION_CODE_SESSION_KEY } from '../alsMiddleware/actionToAlsActionDescMiddleware';
import { logout } from '../actions/login/loginAction';
import * as UserUtilities from '../../utilities/userUtilities';

const initLoginInfo = {
   expiryTime: 420000,
   loginName: '',
   loginTime: '',
   userRoleType: '',
   token: '',
   ecsUserId: '',
   eHRId: '',
   pwdLastDate: '',
   loginId: '',
   isClinicalUser: false,
   isClinicalBaseRole: false,
   hasClinicalFunction: false,
   hasNonClinicalFunction: false,
   primarySiteId: null
};

const initService = {
   serviceCd: '',
   serviceName: '',
   cdFlag: 'Y'
};

const initClinic = {
   clinicCd: '',
   cdFlag: 'Y',
   clinicName: '',
   serviceCd: '',
   ecsLocCode: ''
};

const INITAL_STATE = {
   loginInfo: _.cloneDeep(initLoginInfo),
   service: _.cloneDeep(initService),
   clinic: _.cloneDeep(initClinic),
   menuList: [],
   accessRights: [],
   noticeList: [],
   contactUs: [],
   isTemporaryLogin: '',
   isLoginSuccess: false,
   errorMessage: '',
   loginForm: {
      svcCd: null,
      siteId: null,
      ipInfo: null,
      serviceAndClinicGp: null,
      loginName: '',
      password: ''
   },
   isSystemAdmin: false,
   isServiceAdmin: false,
   isClinicalAdmin: false,
   samSiteParams: null,
   isNeedForceLogin: false,
   logout: null,
   spaActionType: { ...types }
};

let patientCall = '';

function menuTree(data) {
   if (!data) {
      return [];
   }
   let tempMenu = {
      label: data.accessRightName.replace('%PATIENTCALL%', patientCall),
      name: data.accessRightCd.split('-')[0],
      icon: data.menuIconStr,
      path: data.componentPath,
      componentParams: data.componentParams,
      isClinical: data.isClinical,
      isPatRequired: data.isPatRequired,
      displayOrder: data.displayOrder,
      itemLevel: data.itemLevel,
      spaPrefix: data.spaPrefix //Added by Renny for spa link prefix on 20200324
   };

   if (data.childCodAccessRightDtos.length === 0) {
      tempMenu.child = [];
      return tempMenu;
   }
   else {
      let child = [];
      data.childCodAccessRightDtos.forEach(chilRight => {
         let oneChild = menuTree(chilRight);
         if ((oneChild.path || oneChild.spaPrefix) || oneChild.child && oneChild.child.length > 0) {
            child.push(oneChild);
         }
      });
      tempMenu.child = child;
      return tempMenu;
   }
}

function fetchMenu(data) {
   let menu = [];
   patientCall = commonUtilities.getPatientCall();
   data.forEach(right => {
      if (right.accessRightType === 'function') {
         let topLevel = menuTree(right);
         menu.push(topLevel);
      }
   });
   let availMenu = menu.filter(m => m.child && m.child.length !== 0);
   // return menu;
   return availMenu;
}

function degraded(data, accessRights) {
   data.forEach(right => {
      let tempRight = {
         label: right.accessRightName.replace('%PATIENTCALL%', patientCall),
         name: right.accessRightCd.split('-')[0],
         icon: right.menuIconStr,
         path: right.componentPath,
         componentParams: right.componentParams,
         isClinical: right.isClinical,
         isPatRequired: right.isPatRequired,
         displayOrder: right.displayOrder,
         type: right.accessRightType,
         spaPrefix: right.spaPrefix, //Added by Renny for spa link prefix on 20200521
         hasChildren: right.childCodAccessRightDtos.length > 0
      };
      let sameNameRightExist = accessRights.some(x => x.name === tempRight.name);
      let hasChildren = right.childCodAccessRightDtos.length > 0;
      if (!sameNameRightExist)
         accessRights.push(tempRight);
      if (hasChildren)
         degraded(right.childCodAccessRightDtos, accessRights);
   });
}

function fetchAccessRights(data) {
   let accessRights = [];
   patientCall = commonUtilities.getPatientCall();
   degraded(data, accessRights);
   return accessRights;
}

export default (state = INITAL_STATE, action = {}) => {
   switch (action.type) {
      case types.LOGIN_PRE_SUCCESS: {
         let { loginInfo, service, clinic } = state;

         loginInfo.loginName = action.loginInfo.login_name;
         loginInfo.expiryTime = action.loginInfo.expiry_time;
         loginInfo.userRoleType = action.loginInfo.userRoleType;
         loginInfo.token = action.loginInfo.token;
         loginInfo.ecsUserId = action.loginInfo.ecsUserId;
         loginInfo.eHRId = action.loginInfo.eHRId;
         loginInfo.loginId = action.loginInfo.userDto.userId;//add by David 20200422
         loginInfo.pwdLastDate = action.loginInfo.pwd_last_date;
         loginInfo.correlationId = action.loginInfo.correlationId;
         loginInfo.userDto = action.loginInfo.userDto;
         loginInfo.isClinicalUser = action.loginInfo.isClinicalUser;

         service.serviceCd = action.loginInfo.service_cd;
         clinic.clinicCd = action.loginInfo.clinic_cd;
         clinic.ecsLocCode = action.loginInfo.ecsLocCode;

         window.sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));
         window.sessionStorage.setItem('service', JSON.stringify(service));
         window.sessionStorage.setItem('clinic', JSON.stringify(clinic));
         window.sessionStorage.removeItem('notFirstLoginES');//true: Encounter Summary not first login,do not auto open ANT tabs

         return {
            ...state,
            loginInfo
         };
      }
      case types.LOGIN_SUCCESS: {
         let { loginInfo, service, clinic } = state;
         loginInfo.loginTime = moment().format(Enum.DATE_FORMAT_24);
         loginInfo.loginName = action.loginInfo.login_name;
         loginInfo.expiryTime = action.loginInfo.expiry_time;
         loginInfo.userRoleType = action.loginInfo.userRoleType;
         loginInfo.token = action.loginInfo.token;
         loginInfo.ecsUserId = action.loginInfo.ecsUserId;
         loginInfo.eHRId = action.loginInfo.eHRId;
         loginInfo.loginId = action.loginInfo.userDto.userId;//add by David 20200422
         loginInfo.pwdLastDate = action.loginInfo.pwd_last_date;
         loginInfo.correlationId = action.loginInfo.correlationId;
         loginInfo.userDto = action.loginInfo.userDto;
         loginInfo.isClinicalUser = action.loginInfo.isClinicalUser;

         service.serviceCd = action.loginInfo.service_cd;
         clinic.clinicCd = action.loginInfo.clinic_cd;
         clinic.ecsLocCode = action.loginInfo.ecsLocCode;

         let isTemporaryLogin = action.loginInfo.temporary_login;
         let lastLoginServiceClinc = { svcCd: service.serviceCd, siteId: clinic.siteId };

         // window.sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));
         window.sessionStorage.setItem('service', JSON.stringify(service));
         window.sessionStorage.setItem('clinic', JSON.stringify(clinic));

         window.sessionStorage.setItem('lastLoginServiceClinc', JSON.stringify(lastLoginServiceClinc));

         const menuList = fetchMenu(action.loginInfo.accessRights);
         const accessRights = fetchAccessRights(action.loginInfo.accessRights);
         window.sessionStorage.setItem('menuList', JSON.stringify(menuList));
         window.sessionStorage.setItem('accessRights', JSON.stringify(accessRights));
         let userRankCd = commonUtilities.getAccessRightMappingName();//add by David 20200323
         loginInfo.userRankCd = userRankCd;
         //saam user rank start by Demi
         loginInfo.saamUserRank = 'A';
         if (loginInfo.userRankCd && loginInfo.userRankCd.indexOf('B207') > -1) loginInfo.saamUserRank = 'G';
         //saam user rank start end

         loginInfo.isClinicalBaseRole = UserUtilities.isClinicalBaseRole(action.loginInfo.userDto);
         loginInfo.hasClinicalFunction = UserUtilities.hasClinicalFunction(accessRights);
         loginInfo.hasNonClinicalFunction = UserUtilities.hasNonClinicalFunction(accessRights);
         window.sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));

         let isSystemAdmin = loginInfo.userDto.isAdmin === 1;
         let isServiceAdminIndex = loginInfo.userDto.uamMapUserSvcDtos.findIndex(item => item.svcCd === action.loginInfo.serviceCd && item.isAdmin === 1);
         let isServiceAdmin = isServiceAdminIndex !== -1;
         let isClinicalAdminIndex = loginInfo.userDto.uamMapUserSiteDtos.findIndex(item => item.siteId === action.loginInfo.siteId && item.isAdmin === 1);
         let isClinicalAdmin = isClinicalAdminIndex !== -1;

         let loginForm = { ...state.loginForm, loginName: '', password: '' };
         return {
            ...state,
            loginInfo,
            service,
            clinic,
            menuList,
            accessRights,
            isTemporaryLogin,
            isLoginSuccess: true,
            isSystemAdmin,
            isServiceAdmin,
            isClinicalAdmin,
            loginForm
         };
      }
      case types.LOGIN_ERROR: {
         return {
            ...state,
            errorMessage: action.errMsg,
            isLoginSuccess: false
         };
      }
      case types.CLEAN_LOGIN_INFO: {
         sessionStorage.removeItem('loginInfo');
         sessionStorage.removeItem('service');
         sessionStorage.removeItem('clinic');
         sessionStorage.removeItem('token');
         sessionStorage.removeItem('loginWithSam');
         sessionStorage.removeItem('menuList');
         sessionStorage.removeItem('accessRights');
         sessionStorage.removeItem('clinicConfig');
         sessionStorage.removeItem('listConfig');
         sessionStorage.removeItem('waitingList_tableScale');
         sessionStorage.removeItem('userId');
         sessionStorage.removeItem(ALS_FUNCTION_CODE_SESSION_KEY);
         sessionStorage.removeItem(ALS_FUNCTION_NAME_SESSION_KEY);
         sessionStorage.removeItem(ALS_ACTION_HISTORY_SESSION_KEY);
         return {
            ...state,
            loginInfo: _.cloneDeep(initLoginInfo),
            service: _.cloneDeep(initService),
            clinic: _.cloneDeep(initClinic),
            errorMessage: '',
            menuList: [],
            accessRights: [],
            isTemporaryLogin: ''
         };
      }
      case types.ERROR_MESSAGE: {
         return {
            ...state,
            errorMessage: action.error
         };
      }
      case types.RESET_ERROR_MESSAGE: {
         return {
            ...state,
            errorMessage: ''
         };
      }
      case types.PUT_SERVICE_NOTICE: {
         return {
            ...state,
            noticeList: action.data
         };
      }
      case types.PUT_CONTACT_US: {
         return {
            ...state,
            contactUs: action.data
         };
      }
      case types.UPDATE_LOGIN_FORM: {
         let data = { ...action.data };
         let loginForm = { ...state.loginForm, ...data };
         return {
            ...state,
            loginForm
         };
      }
      case types.UPDATE_STATE: {
         return {
            ...state,
            ...action.data
         };
      }
      case types.PUT_CLIENT_IP: {
         let loginForm = _.cloneDeep(state.loginForm);
         let loginInfo=_.cloneDeep(state.loginInfo);
         loginForm.ipInfo = _.cloneDeep(action.ipInfo);
         loginForm.serviceAndClinicGp = _.cloneDeep(action.serviceAndClinicGp);
         loginForm.svcCd = action.defaultSelected ? action.defaultSelected.svcCd : null;
         loginForm.siteId = action.defaultSelected ? action.defaultSelected.siteId : null;
         loginInfo.primarySiteId = action.ipInfo ? action.ipInfo.primarySiteId || null : null;
         window.sessionStorage.setItem('clientIp', action.ipInfo ? JSON.stringify(action.ipInfo) : null);
         return {
            ...state,
            loginForm,
            loginInfo
         };
      }
      case types.PUT_LOGIN_INFO: {
         let { curLoginServiceAndClinic } = action;
         return {
            ...state,
            service: curLoginServiceAndClinic.service,
            clinic: curLoginServiceAndClinic.clinic
         };
      }
      case types.IDLE_LOGIN_ERROR: {
         return {
            ...state,
            errorMessage: action.errMsg
         };
      }
      case types.UPDATE_ISTEMPORARYLOGIN: {
         return {
            ...state,
            isTemporaryLogin: action.params
         };
      }
      case types.LOGIN_PUT_SITE_ID: {
         return {
            ...state,
            clinic: {
               ...state.clinic,
               siteId: action.siteId
            }
         };
      }
      default:
         state.logout = logout;
         return { ...state };
   }
};