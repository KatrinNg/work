import { call, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as alsLogActionTypes from '../../actions/als/logActionType';
import * as logActions from '../../actions/als/logAction';
import * as transactionActions from '../../actions/als/transactionAction';
import * as messageType from '../../actions/message/messageActionType';
import * as commonActionType from '../../actions/common/commonActionType';
import * as loginActionTypes from '../../actions/login/loginActionType';
import * as forgetPasswordTypes from '../../actions/forgetPassword/forgetPasswordActionType';
import _ from 'lodash';

let messageMapping = null;

const toErrorDesc = (e, generatorName) => `${((e && e.message) || 'Frontend log ALS log error')} (${generatorName})`;

function* auditAction(){
  yield takeEvery(alsLogActionTypes.ALS_LOG_AUDIT_ACTION,
    function* (action){
      let {params} = action;
      if(!params.willCallApi){
        yield put(logActions.alsLogFrontEndAction(params.dest));
      }
    }
  );
}

function* alsLog() {
  yield takeEvery(alsLogActionTypes.ALS_LOG,
    function* (action){
      let {params} = action;
      try {
        const state = yield select();
        let functionCode = null;
        let functionName = null;
        if(state.mainFrame && state.mainFrame.tabsActiveKey){

          functionCode = yield select(state => {
              if(state.mainFrame && state.mainFrame.tabsActiveKey){// get active tab function code
                let activeKey = state.mainFrame.tabsActiveKey;
                if(activeKey === 'patientSpecFunction'){
                  return state.mainFrame.subTabsActiveKey;
                }
                return activeKey;
              }
            return '';
          });
          let accessRight = yield select(state => state.login.accessRights.find(r => r.name === functionCode));

          functionName = accessRight ? accessRight.label: '';
        }

        if(!(params.functionCode === '' || params.functionCode === null || params.functionCode === undefined)){
          functionCode = params.functionCode;
        }

        if(!(params.functionName === '' || params.functionName === null || params.functionName === undefined)){
          functionName = params.functionName;
        }

        let headers = {
          'function-code': functionCode,
          'function-name': functionName
        };

        if(params.pmi){
          headers.pmiNo = params.pmi;
        }

        yield call(
          axios.post, `/${params.dest}/als/customize`, {...params}, {
            headers
          }
        );
      } catch (e) {
        console.error('fail to log ALS log. error message: ' + e && e.message);
      }
    }
  );
}

function* alsLogFrontEndAction() {
  yield takeEvery(alsLogActionTypes.ALS_LOG_FRONT_END_ACTION,
    function* (action){
      let {dest} = action;
      try {
        yield call(
          axios.post, `/${dest}/als`
        );
      } catch (e) {
        yield put(logActions.alsLogInfo({
          desc: toErrorDesc(e, 'alsLogFrontEndAction'),
          functionName: 'ALS'
        }));
      }
    }
  );
}

function* auditError() {
  yield takeEvery(
    alsLogActionTypes.ALS_LOG_AUDIT_ERROR,
    function* (action){

      let {desc, dest, alsTransaction} = action;
      try{
        if(alsTransaction === null || alsTransaction === undefined){
          alsTransaction = yield select(s => s.alsTransaction);
        }
        if(alsTransaction.transactionControl > 0){
          const lastActionHistory = yield select(s => s.alsLogInfo);

          yield put(logActions.alsLogAudit({
            desc: (`${desc}. ${lastActionHistory.lastAction?'Last action: ' + lastActionHistory.lastAction : ''}`).replace('...', '.').replace('..', '.').replace(' . ', '.').replace(' Data: {}.', ''),
            functionName: lastActionHistory.lastFunctionName,
            functionId: lastActionHistory.lastFunctionCode,
            dest: lastActionHistory.lastDest || dest || 'cmn'
          }));
        }
      }catch(e){
        yield put(logActions.alsLogInfo({
          desc: toErrorDesc(e, 'auditError'),
          functionName: 'ALS'
        }));
      }
    }
  );
}

function* watchOpenCommonMessageAndLog() {
  yield takeEvery(messageType.OPEN_COMMON_MESSAGE, function* logger(action) {
    try{
      if(messageMapping === null){
        const messageList = yield select(s => s.message.commonMessageList);
        messageMapping = _.cloneDeep(messageList).reduce(
          (pre, cur) => {
            pre[cur.messageCode] = cur;
            return pre;
          },
          {}
        );
      }
      let payload = action.payload;

      let msg = _.cloneDeep(messageMapping[action.payload.msgCode]);
      if(payload.params && Array.isArray(payload.params)){
        for(let param of payload.params){
          if(!['DOC_NO'].includes(param.name)){
            msg.description = msg.description.replace(`%${param.name}%`, param.value);
          }
        }
      }
      const alsTransaction = yield select(s => s.alsTransaction);

      yield put(logActions.auditError(`${payload.showSnackbar?'Snackbar.':'Open dialog.'} Message: ${(msg && msg.description) || `${action.payload.msgCode}`}`, null, alsTransaction));

    }catch(e){
      yield put(logActions.alsLogInfo({
        desc: toErrorDesc(e, 'watchOpenCommonMessageAndLog'),
        functionName: 'ALS'
      }));
    }
  });
}
function* watchOpenErrorMessageAndLog() {
  yield takeEvery(commonActionType.OPEN_ERROR_MESSAGE, function* logger(action) {
      try{
        const msg = action.error;
        const alsTransaction = yield select(s => s.alsTransaction);

        yield put(logActions.auditError(msg, null, alsTransaction));
      }catch(e){
        yield put(logActions.alsLogInfo({
          desc: toErrorDesc(e, 'watchOpenErrorMessageAndLog'),
          functionName: 'ALS'
        }));
      }
  });
}

const LOGIN_ERROR_TYPE_MAP = {
  [loginActionTypes.IDLE_LOGIN_ERROR]: 'Idle login', [loginActionTypes.LOGIN_ERROR]: 'Login', [forgetPasswordTypes.SEND_FAILURE]:'Forget password'
};

function* watchLoginErrorAndLog() {
  yield takeEvery([loginActionTypes.IDLE_LOGIN_ERROR, loginActionTypes.LOGIN_ERROR, forgetPasswordTypes.SEND_FAILURE], function* logger(action) {
    try{
      const alsTransaction = yield select(s => s.alsTransaction);

      yield put(logActions.auditError(`${LOGIN_ERROR_TYPE_MAP[action.type]} error message: ${action.errMsg}. ${action.data? `Data: ${JSON.stringify(action.data)}`:''}`, null, alsTransaction));

    }catch(e){
      yield put(logActions.alsLogInfo({
        desc: toErrorDesc(e, 'watchLoginErrorAndLog'),
        functionName: 'ALS'
      }));
    }
  });
}

export const alsLogSaga = [
  alsLog,
  alsLogFrontEndAction,
  auditAction,
  watchOpenCommonMessageAndLog,
  watchOpenErrorMessageAndLog,
  auditError,
  watchLoginErrorAndLog
];

export function alsTakeEvery(pattern, worker){
  return takeEvery(pattern,
    function* (action){
      try{
        yield put(transactionActions.alsStartTrans());
        yield worker(action);
      }finally{
        yield put(transactionActions.alsEndTrans());
      }
    }
  );
}

export function alsTakeLatest(pattern, worker){
  return takeLatest(pattern,
    function* (action){
      try{
        yield put(transactionActions.alsStartTrans());
        yield worker(action);
      }finally{
        yield put(transactionActions.alsEndTrans());
      }
    }
  );
}