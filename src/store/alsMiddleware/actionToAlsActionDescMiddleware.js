import loginActionTypeDetails from '../actions/login/loginActionTypeDetails';
import patientSpecFuncActionDetails from '../actions/patient/patientSpecFunc/patientSpecFuncActionTypeDetails';
import {auditAction} from '../actions/als/logAction';

let actionTypeToActionDescMap = {};

export const ALS_ACTION_HISTORY_SESSION_KEY = 'alsSagaActionHistory';
export const ALS_FUNCTION_CODE_SESSION_KEY = 'alsFunctionCodeSessionKey';
export const ALS_FUNCTION_NAME_SESSION_KEY = 'alsFunctionNameSessionKey';
export const ALS_LOCK_SESSION_KEY = 'alsLockSessionKey';

const actionTypeToActionDescMaps = [
    loginActionTypeDetails,
    patientSpecFuncActionDetails
];

function buildActionTypeDetail (desc, functionCode, functionName, forceToUseProvided = false) {
    return {desc, functionCode, functionName, forceToUseProvided};
}

function isFunction(functionToCheck) {
    return functionToCheck && typeof functionToCheck === 'function';
}

function tryExecFunction(strOrFunc, store, action){
    if(isFunction(strOrFunc)){
        return strOrFunc(store, action);
    }
    return strOrFunc;
}

const createAlsMiddleware = (actionTypeToActionDescMaps) => {

    if(actionTypeToActionDescMaps && actionTypeToActionDescMaps.length > 0){
        for(let mapping of actionTypeToActionDescMaps){
            actionTypeToActionDescMap = {...actionTypeToActionDescMap, ...mapping};
        }
    }
    return actionToAlsActionDescMiddleware;
};

const actionToAlsActionDescMiddleware = store => next => action => {

    let detail = null;
    let desc = null;
    let functionCode = null;
    let functionName = null;


    let nextAction = {
        ...action
    };

    if(actionTypeToActionDescMap[action.type]) {
        detail = actionTypeToActionDescMap[action.type];
        desc = tryExecFunction(detail.desc, store, action);
        functionCode = tryExecFunction(detail.functionCode, store, action);
        functionName = tryExecFunction(detail.functionName, store, action);

        store.dispatch(auditAction(desc, functionName, functionCode));
    }


    next(nextAction);
};


export { buildActionTypeDetail,actionTypeToActionDescMaps , createAlsMiddleware };