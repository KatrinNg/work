import * as logActionTypes from '../../actions/als/logActionType';
import * as logActions from '../../actions/als/logAction';
import {
    ALS_ACTION_HISTORY_SESSION_KEY, ALS_FUNCTION_CODE_SESSION_KEY, ALS_FUNCTION_NAME_SESSION_KEY, ALS_LOCK_SESSION_KEY
} from '../../alsMiddleware/actionToAlsActionDescMiddleware';

const initState = {
  lastAction: '',
  lastFunctionName: '',
  lastFunctionCode: '',
  lastDest: null,
  spaFunc: {},
  types:logActionTypes
};


export default (state = initState, action = {}) => {
  switch (action.type) {
    case logActionTypes.ALS_LOG_AUDIT_ACTION: {
        let {desc, functionName, functionCode} = action.params;
        let alsActionHistory = window.sessionStorage.getItem(ALS_ACTION_HISTORY_SESSION_KEY);
        if(!alsActionHistory){
            alsActionHistory = desc;
        }else{
            alsActionHistory = alsActionHistory + ',' + desc;
        }
        window.sessionStorage.setItem(ALS_ACTION_HISTORY_SESSION_KEY, alsActionHistory);

        let isAlsSessionLocked = window.sessionStorage.getItem(ALS_LOCK_SESSION_KEY) === 'Y';

        if(!isAlsSessionLocked){
            window.sessionStorage.setItem(ALS_LOCK_SESSION_KEY, 'Y');

            if(functionName){
                window.sessionStorage.setItem(ALS_FUNCTION_NAME_SESSION_KEY, functionName);
            }

            if(functionCode){
                window.sessionStorage.setItem(ALS_FUNCTION_CODE_SESSION_KEY, functionCode);
            }
        }

      return {
        lastAction: desc,
        lastFunctionName: functionName,
        lastFunctionCode: functionCode,
        lastDest: action.params.dest
      };
    }
    case logActionTypes.ALS_LOG_CLEAR_HISTORY: {
      sessionStorage.removeItem(ALS_FUNCTION_CODE_SESSION_KEY);
      sessionStorage.removeItem(ALS_FUNCTION_NAME_SESSION_KEY);
      sessionStorage.removeItem(ALS_ACTION_HISTORY_SESSION_KEY);
      return initState;
    }
    default: {
      return {
        ...state,
        spaFunc: {
          alsLogInfo: logActions.alsLogInfo,
          alsLogWarn: logActions.alsLogWarn,
          alsLogAudit: logActions.alsLogAudit,
          alsLogCritical: logActions.alsLogCritical,
          alsLogDebug: logActions.alsLogDebug,
          alsLogTrace: logActions.alsLogTrace,
          auditAction: logActions.auditAction,
          auditError: logActions.auditError
        }
      };
    }
  }
};