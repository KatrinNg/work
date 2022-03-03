import axios from 'axios';
import Promise from 'babel-polyfill';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// import configureStore from '../store/storeConfig';
import * as sysConfig from '../configs/config';
import storeConfig from '../store/storeConfig';
import * as commonActionTypes from '../store/actions/common/commonActionType';
import * as loginActionTypes from '../store/actions/login/loginActionType';


let moeAxios = axios.create();


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

moeAxios.interceptors.request.use(
  config => {
    showFullScreenLoading();
    // if (!(config.headers && config.headers.Authorization)) {
    //config.headers.Authorization = 'Moe eyJhbGciOiJSUzI1NiJ9.eyJsb2dpbl9uYW1lIjoiYWRtaW4zIiwidXNlcl9pZCI6IjEzMiIsImNsaW5pY19jZCI6IktGQyIsInNlcnZpY2VfY2QiOiJGQ1MiLCJhY2Nlc3NSaWdodElkcyI6WyIyMCIsIjI0IiwiMjUiLCIyMSIsIjIiLCIxMiIsIjciLCIyMiIsIjE4IiwiMjMiLCIxNiIsIjQiLCI5IiwiMTkiLCIyNiIsIjI3IiwiMTciLCIxNSIsIjYiLCI1IiwiMSIsIjExIiwiMyIsIjEzIiwiMTQiLCIxMCIsIjgiXSwic3ViIjoiMTMyIiwiaWF0IjoxNTYyMzE4MjExLCJleHAiOjE1NjIzMjAwMTF9.QGJQHmltxg37DsMT-oo3BvnGD0ByF9A0PxwlQURzpkz76tCST6sRVm05ttKMi-lFai2Oqos6TT9o2GWxgbnTHRGtHI7NW5CUrBAPSx1yxoWAJuD5WBR_N1zHd7TegKyjVgIwEjsd0QuytCcPZt-Bearer Bearer kFuDNyfW7RgHGKNSKdvb-MAfc_ppjSMAfgGtxQ-C_iAx0L9gXxSSdtBH8yl1w2ezwnXcRsIP7FY8MSxTyKP6R6-XM4xjeLpPxaE9_xr4Gy9j8UZETGGVJBFQbHIgz6n-0mwAs8LcUuiCwYLygQ861W-igTilB0v_xkYd4rJosS2wYgU9WI59OwagQJSJopDyiig';
    config.headers.Authorization = `${window.sessionStorage.getItem('moeToken')}`;
    // }
    // config.headers.Authorization = 'Moe eyJhbGciOiJSUzI1NiJ9.eyJsb2dpbl9uYW1lIjoiYWRtaW4zIiwidXNlcl9pZCI6IjEzMiIsImNsaW5pY19jZCI6IktGQyIsInNlcnZpY2VfY2QiOiJGQ1MiLCJhY2Nlc3NSaWdodElkcyI6WyIyMCIsIjI0IiwiMjUiLCIyMSIsIjIiLCIxMiIsIjciLCIyMiIsIjE4IiwiMjMiLCIxNiIsIjQiLCI5IiwiMTkiLCIyNiIsIjI3IiwiMTciLCIxNSIsIjYiLCI1IiwiMSIsIjExIiwiMyIsIjEzIiwiMTQiLCIxMCIsIjgiXSwic3ViIjoiMTMyIiwiaWF0IjoxNTYyMzE4MjExLCJleHAiOjE1NjIzMjAwMTF9.QGJQHmltxg37DsMT-oo3BvnGD0ByF9A0PxwlQURzpkz76tCST6sRVm05ttKMi-lFai2Oqos6TT9o2GWxgbnTHRGtHI7NW5CUrBAPSx1yxoWAJuD5WBR_N1zHd7TegKyjVgIwEjsd0QuytCcPZt-Bearer Bearer kFuDNyfW7RgHGKNSKdvb-MAfc_ppjSMAfgGtxQ-C_iAx0L9gXxSSdtBH8yl1w2ezwnXcRsIP7FY8MSxTyKP6R6-XM4xjeLpPxaE9_xr4Gy9j8UZETGGVJBFQbHIgz6n-0mwAs8LcUuiCwYLygQ861W-igTilB0v_xkYd4rJosS2wYgU9WI59OwagQJSJopDyiig';
    config.timeout = config.timeout || sysConfig.RequestTimedout;
    // config.timeout = 200;
    // config.retry = 1;
    return config;
  },
  err => {
    return window.Promise.reject(err);
  }
);

// http response 拦截器
moeAxios.interceptors.response.use(
  response => {
    tryHideFullScreenLoading();
    if (response.data && response.config)
      response.data.moeURL = response.config.url;
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
      let config = err.config;

      if (!config || !config.retry) {
        err.message = 'Connection failure!';
      } else {
        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount >= config.retry) {
          err.message = 'Connection failure!';
        } else {
          config.__retryCount += 1;
          return moeAxios(config);
        }
      }
    }
    storeConfig.store.dispatch({
      type: commonActionTypes.OPEN_ERROR_MESSAGE,
      error: err.message
    });
    return window.Promise.reject(err);
  }
);

export default moeAxios;
