import ax from 'axios';
import Promise from 'babel-polyfill';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// import configureStore from '../store/storeConfig';
import * as sysConfig from '../configs/config';
import storeConfig from '../store/storeConfig';
import { openCommonMessage } from '../store/actions/message/messageAction';
import * as commonAction from '../store/actions/common/commonAction';
import * as commonActionTypes from '../store/actions/common/commonActionType';
import * as loginActionTypes from '../store/actions/login/loginActionType';
import { ALS_LOCK_SESSION_KEY, ALS_ACTION_HISTORY_SESSION_KEY, ALS_FUNCTION_NAME_SESSION_KEY, ALS_FUNCTION_CODE_SESSION_KEY } from '../store/alsMiddleware/actionToAlsActionDescMiddleware';
import { auditError, alsLogWarn, alsLogCritical, alsLogInfo } from '../store/actions/als/logAction';

// To add to window  解决promise 在ie中未定义的问题
if (!window.Promise) {
  window.Promise = Promise;
}

NProgress.configure({
  minimum: 0.1,
  easing: 'ease',
  speed: 800,
  showSpinner: false
});
let needLoadingRequestCount = 0;
export function showFullScreenLoading(showMask) {
  if (showMask) {
    storeConfig.store.dispatch({
      type: commonActionTypes.HANDLE_COMMON_CIRCULAR,
      status: 'open'
    });
  } else {
    if (needLoadingRequestCount === 0) {
      NProgress.start();
    }
    needLoadingRequestCount++;
  }
}

export function tryHideFullScreenLoading(showMask) {
  if (showMask) {
    storeConfig.store.dispatch({
      type: commonActionTypes.HANDLE_COMMON_CIRCULAR,
      status: 'close'
    });
  } else {
    if (needLoadingRequestCount <= 0) return;
    needLoadingRequestCount--;
    if (needLoadingRequestCount === 0) return NProgress.done();
  }
}

const updateHeaderIfNotNullOrNotUndefined = (config, headerKey, headerValue) => {
  if (headerValue !== null && headerValue !== undefined) {
    config.headers[headerKey] = headerValue;
  }
};

const getFunctionCode = (reduxState) => {
  let functionCode = window.sessionStorage.getItem(ALS_FUNCTION_CODE_SESSION_KEY);
  if(functionCode && functionCode !== ''){
    return functionCode;
  }
  if(reduxState.login && reduxState.login.accessRights){
    if(reduxState.mainFrame && reduxState.mainFrame.tabsActiveKey){// get active tab function code
      let activeKey = reduxState.mainFrame.tabsActiveKey;
      if(activeKey === 'patientSpecFunction'){
        return reduxState.mainFrame.subTabsActiveKey;
      }
      return activeKey;
    }
  }
  return null;
};

const getFunctionName = (reduxState, functionCode) => {
  let functionName = window.sessionStorage.getItem(ALS_FUNCTION_NAME_SESSION_KEY);
  if(functionName && functionName !== ''){
    return functionName;
  }
  if(reduxState.login && reduxState.login.accessRights && functionCode){
    let accessRight = reduxState.login.accessRights.find(r => r.name === functionCode);
    return accessRight ? accessRight.label: functionName;
  }
  return null;
};

const getAxiosConfig = (config) => {
  if (window.sessionStorage.getItem('token')) {
    config.headers.Authorization = `Bearer ${window.sessionStorage.getItem(
      'token'
    )}`;
    const service = JSON.parse(window.sessionStorage.getItem('service'));
    const clinic = JSON.parse(window.sessionStorage.getItem('clinic'));
    const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'));
    const loginWithSam = JSON.parse(window.sessionStorage.getItem('loginWithSam'));
    config.headers.serviceCode = service && service.serviceCd;
    config.headers.clinicCode = clinic && clinic.clinicCd;
    config.headers.siteId = clinic && clinic.siteId;
    config.headers.correlationId = loginInfo && loginInfo.correlationId;
    config.headers.loginWithSam = loginWithSam;
  }

  let alsActionHistory = window.sessionStorage.getItem(ALS_ACTION_HISTORY_SESSION_KEY);

  if (alsActionHistory) {
    config.headers['frontend-action'] = alsActionHistory;
    window.sessionStorage.removeItem(ALS_ACTION_HISTORY_SESSION_KEY);
  }

  const clientIp = JSON.parse(window.sessionStorage.getItem('clientIp'));
  config.headers.ipAddr = clientIp && clientIp.ipAddr;
  config.headers.wksName = clientIp && clientIp.pcName;
  config.timeout = config.timeout || sysConfig.RequestTimedout;

  const alsTransactionStore = storeConfig.store.getState().alsTransaction;
  const userId = window.sessionStorage.getItem('userId');
  updateHeaderIfNotNullOrNotUndefined(config, 'userId', userId);

  const functionCode = getFunctionCode(storeConfig.store.getState());

  updateHeaderIfNotNullOrNotUndefined(config, 'function-code', functionCode || '');

  const functionName = getFunctionName(storeConfig.store.getState(), functionCode);
  updateHeaderIfNotNullOrNotUndefined(config, 'function-name', functionName || '');

  if(alsTransactionStore.transactionControl > 0){
    const transitionId = alsTransactionStore.transactionId;
    updateHeaderIfNotNullOrNotUndefined(config, 'transactionId', transitionId);
  }

  let isAlsSessionLocked = window.sessionStorage.getItem(ALS_LOCK_SESSION_KEY) === 'Y';
  if (isAlsSessionLocked) {
    window.sessionStorage.removeItem(ALS_LOCK_SESSION_KEY);
    window.sessionStorage.removeItem(ALS_FUNCTION_NAME_SESSION_KEY);
    window.sessionStorage.removeItem(ALS_FUNCTION_CODE_SESSION_KEY);
  }

  const patientReduxStore = storeConfig.store.getState().patient;

  const patientInfo = patientReduxStore.patientInfo;
  if(patientInfo && patientInfo.patientKey){
    config.headers.pmiNo = patientInfo.patientKey;

    const docPairs = patientInfo.documentPairList;
    if(docPairs && docPairs.length && docPairs.length > 0){
      const docPair = docPairs.find(d => d.isPrimary === 1);
      if(docPair){
        config.headers.docNo = docPair.docNo;
        config.headers.docTypeCd = docPair.docTypeCd;
      }
    }
  }

  const caseNoInfo = patientReduxStore.caseNoInfo;
  if(caseNoInfo && caseNoInfo.caseNo){
    config.headers.caseNo = caseNoInfo.caseNo;
  }

  const encounterInfo = patientReduxStore.encounterInfo;
  if(encounterInfo && encounterInfo.encounterId){
    config.headers.encounterId = encounterInfo.encounterId;
  }
  // config.timeout = 200;
  // config.retry = 1;
  return config;
};

const handleResponse = (response) => {
  const { headers, data } = response;

  if (data.respCode === 9999) {
    storeConfig.store.dispatch(openCommonMessage({
      msgCode: '110031'
    }));
  } else if(data.respCode === 1) {
    let str = '';
    if(Array.isArray(data.data)) {
      data.data.forEach(x => {
        str += `[${x}]: Invalid Input.<br />`;
      });
    }
    storeConfig.store.dispatch(openCommonMessage({
      msgCode: '110053',
      params: [{ name: 'STR', value: str }]
    }));
  }
  // else if (data.respCode === 3) {
  //   storeConfig.store.dispatch(openCommonMessage({
  //     msgCode: '110032'
  //   }));
  // }

  if(data.respCode && !isNaN(data.respCode) && parseInt(data.respCode) !== 0 ){
    storeConfig.store.dispatch(auditError(`Response Code: ${data.respCode}. ${data.errMsg && data.errMsg.length > 0?`Error message: ${data.errMsg}.`:''} ${data.data? `Data: ${JSON.stringify(data.data)}.`:''}. API: ${response.config.url}`));
  }
};

const handleError = (err) => {
  let logWarning = false;
  let logCritical = false;
  if (err && err.response) {
    err.originalMsg = err.message;
    switch (err.response.status) {
      case 400:
        err.message = 'Bad Request(400)';
        break;
      case 401:
        err.message = 'Please re-login without authorization(401)';
        if (err.response.config) {
          if (err.response.config.url === '/user/identityAuthentication'
            || err.response.config.url === '/user/loginWithSam'
            || err.response.config.url === '/user/login'
            || err.response.config.url === '/user/logout/') {
            break;
          }
        }
        setTimeout(() => {
          storeConfig.store.dispatch(openCommonMessage({
            msgCode: '110058',
            btnActions: {
              btn1Click: () => {
                storeConfig.store.dispatch({ type: commonActionTypes.CLOSE_ERROR_MESSAGE });
                storeConfig.store.dispatch({ type: loginActionTypes.LOGOUT });
              }
            }
          }));
        }, 1500);
        break;
      case 403:
        err.message = 'Forbidden(403)';
        setTimeout(() => {
          storeConfig.store.dispatch({ type: commonActionTypes.CLOSE_ERROR_MESSAGE });
          storeConfig.store.dispatch({ type: loginActionTypes.LOGOUT });
        }, 3000);
        break;
      case 404:
        err.message = 'Not Found(404)';
        logCritical = true;
        break;
      case 426:
        err.message = 'Upgrade Required(426)';
        logCritical = true;
        break;
      case 408:
        err.message = 'Request Timeout(408)';
        logWarning = true;
        break;
      case 500:
        err.message = 'Internal Server Error(500)';
        logWarning = true;
        break;
      case 501:
        err.message = 'Not Implemented(501)';
        break;
      case 502:
        err.message = 'Bad Gateway(502)';
        logWarning = true;
        break;
      case 503:
        err.message = 'Service Unavailable(503)';
        logWarning = true;
        break;
      case 504:
        err.message = 'Gateway Timeout(504)';
        logWarning = true;
        break;
      case 505:
        err.message = 'HTTP Version Not Supported(505)';
        break;
      default:
        err.message = `Connection error(${err.response.status})!`;
    }
  } else {
    logWarning = true;
    err.message = 'Connection failure!';
  }
  storeConfig.store.dispatch(commonAction.openWarnSnackbar(err.message));
  if(err.response.config.url.indexOf('/als') === -1 || (err.response.config.url.indexOf('/refreshTokenWithSam') >= 0 && err.response.status !== 401) ){
    storeConfig.store.dispatch(auditError(` Error message: ${err.message}. API:${err.response.config.url})`));
    let logAction = alsLogInfo;
    if(logCritical){
      logAction = alsLogCritical;
    }else if(logWarning){
      logAction = alsLogWarn;
    }

    storeConfig.store.dispatch(logAction({
      desc: ` Error message: ${err.message}. API: ${err.response.config.url}. Original error message: ${err.originalMsg}`,
      content: JSON.stringify(err, Object.getOwnPropertyNames(err))
    }));
  }
};

let maskAxios = ax.create({ timeout: sysConfig.RequestTimedout });
maskAxios.interceptors.request.use(
  config => {
    showFullScreenLoading(true);
    return getAxiosConfig(config);
  },
  err => {
    return window.Promise.reject(err);
  }
);

// http response 拦截器
maskAxios.interceptors.response.use(
  response => {
    tryHideFullScreenLoading(true);
    handleResponse(response);
    return response;
  },
  err => {
    tryHideFullScreenLoading(true);
    handleError(err);
    return window.Promise.reject(err);
  }
);

let axios = ax.create({ timeout: sysConfig.RequestTimedout });
axios.interceptors.request.use(
  config => {
    showFullScreenLoading();
    return getAxiosConfig(config);
  },
  err => {
    return window.Promise.reject(err);
  }
);

// http response 拦截器
axios.interceptors.response.use(
  response => {
    tryHideFullScreenLoading();
    handleResponse(response);
    return response;
  },
  err => {
    tryHideFullScreenLoading();
    handleError(err);
    return window.Promise.reject(err);
  }
);

let axiosWithoutLoading = ax.create({ timeout: sysConfig.RequestTimedout });
axiosWithoutLoading.interceptors.request.use(
  config => {
    return getAxiosConfig(config);
  },
  err => {
    return window.Promise.reject(err);
  }
);

axiosWithoutLoading.interceptors.response.use(
  response => {
    handleResponse(response);
    return response;
  },
  err => {
    handleError(err);
    return window.Promise.reject(err);
  }
);


export { axios, maskAxios, axiosWithoutLoading };
