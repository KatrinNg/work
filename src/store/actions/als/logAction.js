import * as logActionType from './logActionType';

const DEFAULT_DEST = 'cmn';

const alsLog = (actionType, {
  logType,
  desc,
  content,
  isEncrypt = false,
  dest = DEFAULT_DEST,
  functionName = null,
  functionId = null,
  pmi = null
}) => {
  let params = {
    logType,
    desc,
    content,
    isEncrypt,
    dest,
    functionName,
    functionId,
    pmi
  };

  /*if(params && params.desc){
    let pmiReg = /^([\w\W]+\sPMI:[\s]?)([0-9]{0,10})([.]*)/;
    const found = params.desc.match(pmiReg);

    if(found && found.length > 0){
      params.desc = found[1] + found[2].padStart(10, '0') + found[3];
    }
  }*/

  return {
    type: actionType,
    params
  };
};

export const alsLogInfo = (params) => {
  return alsLog(
    logActionType.ALS_LOG, {
      logType: 'INFO',
      ...params
    }
  );
};

export const alsLogWarn = (params) => {
  return alsLog(
    logActionType.ALS_LOG, {
      logType: 'WARN',
      ...params
    }
  );
};

export const alsLogAudit = (params) => {
  return alsLog(
    logActionType.ALS_LOG, {
      logType: 'AUDIT',
      ...params
    }
  );
};

export const alsLogCritical = (params) => {
  return alsLog(
    logActionType.ALS_LOG, {
      logType: 'CRITICAL',
      ...params
    }
  );
};

export const alsLogDebug = (params) => {
  return alsLog(
    logActionType.ALS_LOG, {
      logType: 'DEBUG',
      ...params
    }
  );
};

export const alsLogTrace = (params) => {
  return alsLog(
    logActionType.ALS_LOG, {
      logType: 'TRACE',
      ...params
    }
  );
};

export const auditAction = (desc, functionName = null, functionCode = null, handleByOriginalApi = true, dest = 'cmn', pmi = null) => {
  return {
    type: logActionType.ALS_LOG_AUDIT_ACTION,
    params: {
      desc,
      functionName,
      functionCode,
      willCallApi: handleByOriginalApi,
      dest,
      pmi
    }
  };
};

export const auditError = (desc, dest = null, alsTransaction = null) => {
  return {
    type: logActionType.ALS_LOG_AUDIT_ERROR,
    desc,
    dest,
    alsTransaction
  };
};

export const alsLogFrontEndAction = (dest = DEFAULT_DEST) => {
  return {
    type: logActionType.ALS_LOG_FRONT_END_ACTION,
    dest
  };
};

export const clearHistory = () => {
  return {
    type: logActionType.ALS_LOG_CLEAR_HISTORY
  };
};