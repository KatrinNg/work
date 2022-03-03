import {axios, maskAxios, axiosWithoutLoading} from '../axiosInstance';
import * as ecsUtil from '../../utilities/ecsUtilities';
import Enum from '../../enums/enum';


const url = {
  checkEcs: '/ana/ecs',
  checkOcsss: '/ana/ocsss',
  checkMwecs: '/ana/mwecs',
  getEcsByPaitentKeyAndCheckDate: '/ana/ecs'

};

export function checkEcs(params) {
  return maskAxios.post(url.checkEcs, params);
}

export function checkOcsss(params) {
  return maskAxios.post(url.checkOcsss, params);
}

export function checkMwecs(params) {
  return maskAxios.post(url.checkMwecs, params);
}

export function getEcsByPaitentKeyAndCheckDate(patientKey, momentCheckDate){
  return axiosWithoutLoading.get(url.checkEcs, {
    params:{
      patientKey: patientKey,
      chkDate: momentCheckDate.format(Enum.DATE_FORMAT_EYMD_VALUE)
    }
  });
}

export function getOcsssByPaitentKeyAndCheckDate(patientKey, momentCheckDate){
  return axiosWithoutLoading.get(url.checkOcsss, {
    params:{
      patientKey: patientKey,
      chkDate: momentCheckDate.format(Enum.DATE_FORMAT_EYMD_VALUE)
    }
  });
}

export function getMwecsByPaitentKeyAndCheckDate(patientKey, momentCheckDate){
  return axiosWithoutLoading.get(url.checkMwecs, {
    params:{
      patientKey: patientKey,
      chkDate: momentCheckDate.format(Enum.DATE_FORMAT_EYMD_VALUE)
    }
  });
}

export function transformEcsResponseDataToReduxState(
  chkEcsId,
  responseData,
  lastCheckedTime,
  isAssoicated,
  hkic
) {
  let ecsResult = responseData.result[0];

  ecsResult.hkId = responseData.hkId;
  ecsResult.dob = responseData.dob || responseData.dbo;
  ecsResult.dobEstd = responseData.dobEstd;
  ecsResult.lastCheckedTime = lastCheckedTime;
  ecsResult.isAssoicated = isAssoicated;
  ecsResult.patientEcsId = -1;
  ecsResult.originalHkid = hkic;
  let resultIndex = ecsUtil.getEligibleIndexFromEcsResult(ecsResult);
  ecsResult.isValid = resultIndex === 1 || resultIndex === 2;
  ecsResult.isInitState = false;

  return {
    chkEcsId,
    ...ecsResult

  };
}

export function transformOcsssResponseDataToReduxState(
  restlChkId,
  responseData,
  lastCheckedTime,
  hkic
) {
  return {
    checkingResult: responseData.checkingResult,
    errorMessage: responseData.errorMessage,
    messageId: responseData.messageId,
    replyDateTime: responseData.replyDateTime,
    originalHkid: hkic,
    patientOcsssId: -1,
    isValid: responseData.checkingResult === 'Y',
    lastCheckedTime: lastCheckedTime,
    isInitState: false,
    restlChkId: restlChkId
  };
}

export function transformMwecsResponseDataToReduxState(
  medWaiverChkId,
  responseData,
  lastCheckedTime,
  idNumber
) {
  let firstElement = responseData[0];

  const defaultIfUndefined = (item, key, defaultVal) => {return item ? item[key] : defaultVal;};
  const result = defaultIfUndefined(firstElement, 'result', '') ;
  const resultType = Enum.MWECS_RESULT_TYPES.find(item => item.key === result);
  return {
    messageId: defaultIfUndefined(firstElement, 'messageId', ''),
    result: result ,
    recipientName: defaultIfUndefined(firstElement, 'recipientName', '') ,
    eligStartDate: defaultIfUndefined(firstElement, 'eligStartDate', '') ,
    eligEndDate: defaultIfUndefined(firstElement, 'eligEndDate', ''),
    swdResponseDt: defaultIfUndefined(firstElement, 'swdResponseDt', ''),
    responseDt: defaultIfUndefined(firstElement, 'responseDt', ''),
    errorCode: defaultIfUndefined(firstElement, 'errorCode', ''),
    errorMessage: defaultIfUndefined(firstElement, 'errorMessage', ''),
    originalDocNo: idNumber,
    patientMwecsId: -1,
    isValid: resultType && resultType.eligible,
    lastCheckedTime: lastCheckedTime,
    isInitState: false,
    medWaiverChkId: medWaiverChkId
  };
}

export function updateEcs(params) {
  return maskAxios.put(url.checkEcs, params);
}