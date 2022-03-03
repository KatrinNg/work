import axios from 'axios';
import Promise from 'babel-polyfill';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import storeConfig from '../store/storeConfig';
import * as commonActionTypes from '../store/actions/common/commonActionType';
import * as loginActionTypes from '../store/actions/login/loginActionType';
import * as messageType from '../store/actions/message/messageActionType';


if (!window.Promise) {
  window.Promise = Promise;
}
let josCcpAxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:17300',
  timeout: 60 * 1000,
  withCredentials: false
});

NProgress.configure({
  minimum: 0.1,
  easing: 'ease',
  speed: 800,
  showSpinner: false
});
let needLoadingRequestCount = 0;
export function showFullScreenLoading() {
  if (needLoadingRequestCount === 0) {
    NProgress.start();
  }
  needLoadingRequestCount++;
}

export function tryHideFullScreenLoading() {
  if (needLoadingRequestCount <= 0) return;
  needLoadingRequestCount--;
  if (needLoadingRequestCount === 0) return NProgress.done();
}

josCcpAxiosInstance.interceptors.request.use(
  config => {
    showFullScreenLoading();
    return config;
  },
  err => {
    return window.Promise.reject(err);
  }
);

josCcpAxiosInstance.interceptors.response.use(
  response => {
    tryHideFullScreenLoading();
    return response;
  },
  err => {
    tryHideFullScreenLoading();
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          err.message = 'Bad Request(400)';
          break;
        case 401:
          err.message = 'Please re-login without authorization(401)';
          setTimeout(() => {
            storeConfig.store.dispatch({ type: commonActionTypes.CLOSE_ERROR_MESSAGE });
            storeConfig.store.dispatch({ type: loginActionTypes.LOGOUT });
          }, 3000);
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
          break;
        case 408:
          err.message = 'Request Timeout(408)';
          break;
        case 500:
          err.message = 'Internal Server Error(500)';
          break;
        case 501:
          err.message = 'Not Implemented(501)';
          break;
        case 502:
          err.message = 'Bad Gateway(502)';
          break;
        case 503:
          err.message = 'Service Unavailable(503)';
          break;
        case 504:
          err.message = 'Gateway Timeout(504)';
          break;
        case 505:
          err.message = 'HTTP Version Not Supported(505)';
          break;
        default:
          err.message = `Connection error(${err.response.status})!`;
      }
    } else {
      err.message = 'CCP Agent Connection failure!';
    }
    storeConfig.store.dispatch({ type: commonActionTypes.CLOSE_COMMON_CIRCULAR_DIALOG });
    storeConfig.store.dispatch({
      type: messageType.OPEN_COMMON_MESSAGE,
      payload: {
        msgCode: '110041',
        params: [{ name: 'CAUSE', value: err.message }]
      }
    });
    return window.Promise.reject(err);
  }
);

export default josCcpAxiosInstance;
