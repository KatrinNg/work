import storeConfig from '../store/storeConfig';
import { trim, join, isNull, replace } from 'lodash';
import { put } from 'redux-saga/effects';
import * as commonType from '../store/actions/common/commonActionType';
import * as messageType from '../store/actions/message/messageActionType';
import { COMMON_CODE } from '../constants/message/common/commonCode';
import { COMMON_RESP_MSG_CODE } from '../constants/message/moe/commonRespMsgCodeMapping';
import accessRightEnum from '../enums/accessRightEnum';
import _ from 'lodash';
import moment from 'moment';

let generatePatientCaseDto = (patientDto,infoObj) => {
    if(infoObj && Object.keys(infoObj).length > 0){
      let caseDto={
        caseNo: infoObj.caseNo,
        ownerClinicCd: infoObj.ownerClinicCd,
        regDtm: infoObj.regDtm,
        statusCd: infoObj.statusCd,
        encounterGroupDtos:infoObj.encounterGroupDtos
      };
      patientDto.caseNoInfo=caseDto;
    }
};
export function getOwnClinic() {
  const store = storeConfig.store.getState();
  const login = store && store['login'];
  const common = store && store['common'];
  const {clinic={}}=login;
  const { clinicConfig } = common;
  let current = clinicConfig.DEFAULT_CLINIC_FILTER;
  let currentMap = new Map();
  if(current&&current.length>0){
    current.forEach(element => {
      if (element.siteId===clinic.siteId) {
        currentMap.set('first',element);
      }
      else if(!element.siteId&&_.toUpper(element.svcCd) === _.toUpper(clinic.svcCd)){
        currentMap.set('second',element);
      }else if(!element.siteId&&!element.svcCd){
        currentMap.set('third',element);
      }else{
        currentMap.set('fourth',element);
      }
    });
  }
   let arr = [];
    if(currentMap.has('first')){
      arr.push(_.toUpper(currentMap.get('first').paramValue)=== 'CLINIC'?clinic.clinicCd:'ALL');
    }else if(currentMap.has('second')){
      arr.push(_.toUpper(currentMap.get('second').paramValue)==='CLINIC'?clinic.clinicCd:'ALL');
    }else if(currentMap.has('third')){
      arr.push(_.toUpper(currentMap.get('third').paramValue)==='CLINIC'?clinic.clinicCd:'ALL');
    }else{
      currentMap.has('fourth') ? (arr.push(_.toUpper(currentMap.get('fourth').paramName) === 'CLINIC' ? clinic.clinicCd : 'ALL')) : arr.push(clinic.clinicCd);
    }
    return arr[0];
}

export function checkIsNotCurrentServiceAndClinic(serviceCd,clinicCd) {
    const store = storeConfig.store.getState();
    const login = store && store['login'];
    const {clinic={},service={}}=login;
    let flag=false;
    if(trim(service.serviceCd)!=trim(serviceCd)||trim(clinic.clinicCd)!=trim(clinicCd)){
        flag=true;
    }
    return flag;
}

export function generatePatientDto() {
  const store = storeConfig.store.getState();
  const patientInfo = store && store['patient']['patientInfo'];
  const caseNoInfo = store && store['patient']['caseNoInfo'];
  const docTypeInfo = store && store['common']['commonCodeList']['doc_type'];
  let flag = patientInfo.primaryDocTypeCd === 'ID' || patientInfo.primaryDocTypeCd === 'BC'?false:true;
  let docTypeCdDesc = '';
  if(flag) {
      docTypeInfo.map(item => {
      if(item.code === patientInfo.primaryDocTypeCd){
        docTypeCdDesc = item.otherDesc3;
      }
    });
  }
  let dto = {
    patientKey: patientInfo.patientKey,
    hkId: patientInfo.hkid,
    engSurname: patientInfo.engSurname,
    engGivename: patientInfo.engGivename,
    nameChi: patientInfo.nameChi,
    genderCd: patientInfo.genderCd,
    otherName: null,
    dob: patientInfo.dob,
    docTypeCd: patientInfo.docTypeCd,
    otherDocNo: patientInfo.otherDocNo,
    birthPlaceCd: patientInfo.birthPlaceCd,
    age: patientInfo.age,
    ageUnit: patientInfo.ageUnit,
    primaryDocTypeCd: flag?docTypeCdDesc:patientInfo.primaryDocTypeCd,
    primaryDocNo: patientInfo.primaryDocNo,
    telephone: patientInfo.phoneNo,
    caseNoInfo: {}
  };
  generatePatientCaseDto(dto,caseNoInfo);

  return dto;
}

export function getUserRoleType() {
  const store = storeConfig.store.getState();
  const login = store && store['login'];
  const { loginInfo } = login;
  const { userDto = {} } = loginInfo;
  const { uamMapUserRoleDtos = [] } = userDto;
  let userRoleType;
  for (let index = 0; index < uamMapUserRoleDtos.length; index++) {
    const element = uamMapUserRoleDtos[index];
    if(element.uamRoleDto.isBaseRole == 1) {
      userRoleType = element.uamRoleDto.roleName;
      break;
    }
  }
  return userRoleType;
}

export function reportGeneratePatientDto(patientInfoParams,docTypeInfoParams) {
  const store = storeConfig.store.getState();
  let patientInfo = patientInfoParams ? patientInfoParams : store && store['patient']['patientInfo'];
  let caseNoInfo = docTypeInfoParams ? docTypeInfoParams : store && store['patient']['caseNoInfo'];
  let docTypeInfo = store && store['common']['commonCodeList']['doc_type'];
  let flag = patientInfo.primaryDocTypeCd === 'ID' || patientInfo.primaryDocTypeCd === 'BC' ? false : true;
  let docTypeCdDesc = '';
  if(flag) {
      docTypeInfo.map(item => {
      if(item.code === patientInfo.primaryDocTypeCd){
        docTypeCdDesc = item.otherDesc3;
      }
    });
  }
  let dto = {
    patientKey: patientInfo.patientKey,
    hkId: patientInfo.hkid,
    engSurname: patientInfo.engSurname,
    engGivename: patientInfo.engGivename,
    nameChi: patientInfo.nameChi,
    genderCd: patientInfo.genderCd,
    otherName: null,
    dob: patientInfo.dob,
    docTypeCd: patientInfo.docTypeCd,
    otherDocNo: patientInfo.otherDocNo,
    primaryDocTypeCd: flag?docTypeCdDesc:patientInfo.primaryDocTypeCd,
    primaryDocNo: patientInfo.primaryDocNo,
    birthPlaceCd: patientInfo.birthPlaceCd,
    age: patientInfo.age,
    ageUnit: patientInfo.ageUnit,
    exactDobCd:patientInfo.exactDobCd,
    telephone: patientInfo.phoneNo,
    caseNoInfo: {}
  };
  generatePatientCaseDto(dto,caseNoInfo);

  return dto;
}

class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(type, cb) {
    let cbs = this.listeners[type];
    if (!cbs) {
      cbs = [];
    }
    cbs.push(cb);
    this.listeners[type] = cbs;
    return () => {
      this.remove(type, cb);
    };
  }

  emit(type, ...args) {
    const cbs = this.listeners[type];
    if (Array.isArray(cbs)) {
      for (let i = 0; i < cbs.length; i++) {
        const cb = cbs[i];
        if (typeof cb === 'function') {
          cb(...args);
        }
      }
    }
  }

  remove(type, cb) {
    if (cb) {
      let cbs = this.listeners[type];
      cbs = cbs.filter((eMap) => eMap.cb !== cb);
      this.listeners[type] = cbs;
    } else {
      this.listeners[type] = null;
      delete this.listeners[type];
    }
  }

  delete(type) {
    delete this.listeners[type];
  }

}

export default new EventEmitter();

let handleErrorMessage = (content) => {
  let params = [];
  if (content&&content.length > 0) {
    content.forEach(paramObj => {
      params.push({
        name: paramObj.paramName,
        value: join(paramObj.paramVals, '<br/>')
      });
    });
  }
  return params;
};

export function commonInsertLog(apiName, arCd, arName, desc, url, content) {
  const store = storeConfig.store.getState();
  const patientInfo = store && store['patient']['patientInfo'];
  let patientKey = patientInfo ? patientInfo.patientKey : null;
  let caseList = patientInfo ? patientInfo.caseList : null;
  let params = {
    apiName: apiName,
    arCd: arCd,
    arName: arName,
    caseNo: caseList ? caseList[0].caseNo : null,
    desc: desc,
    patientKey: patientKey ? patientKey : null,
    url: url,
    content: content
  };
  storeConfig.store.dispatch({ type: commonType.INSERT_COMMON_APP_LOG, params });
}

function handleCommonErrorLog(isRespMsgCode, message, apiUrl) {
  const store = storeConfig.store.getState();
  const mainFrame = store && store.mainFrame;
  const { tabs, subTabs, tabsActiveKey, subTabsActiveKey } = mainFrame;

  let arCd = '', arName = '';
  if (tabsActiveKey == accessRightEnum.patientSpec) {
    // sub tab
    let activeSubTab = _.find(subTabs, tab => tab.name === subTabsActiveKey);
    arCd = subTabsActiveKey;
    arName = activeSubTab.label;
  } else {
    // main tab
    let activeTab = _.find(tabs, tab => tab.name === tabsActiveKey);
    arCd = tabsActiveKey;
    arName = activeTab.label;
  }

  // desc
  let desc = `Exception fonud. API: ${apiUrl}, ${isRespMsgCode ? 'Response' : 'Error'} Message: ${message}`;

  //url
  let url = apiUrl!=='' ? apiUrl.split('/')[0] : '';
  url !== '' && commonInsertLog('', arCd, arName, desc, url, '');
}

export function* commonErrorHandler(data, apiUrl='') {
  let msgPayload = {}, isRespMsgCode = false, msg = '';
  if (data.msgCode) {
    let params = handleErrorMessage(data.data);
    if (params.length > 0) {
      msgPayload = { ...msgPayload, msgCode: data.msgCode, params };
    } else {
      msgPayload = { ...msgPayload, msgCode: data.msgCode };
    }
    isRespMsgCode = true;
    msg = JSON.stringify(data);
  } else if (data.message) {
    msgPayload = {
      ...msgPayload,
      msgCode: COMMON_CODE.COMMON_ERROR,
      params: [{ name: 'MSG', value: data.message }]
    };
    msg = data.message;
  } else {
    msgPayload = { ...msgPayload, msgCode: COMMON_RESP_MSG_CODE.COMMON_APPLICATION_ERROR };
    msg = JSON.stringify(msgPayload);
  }

  if (msgPayload.msgCode) {
    yield put({
      type: messageType.OPEN_COMMON_MESSAGE,
      payload: msgPayload
    });
    handleCommonErrorLog(isRespMsgCode, msg, apiUrl);
  }
}

export function getDefalutShowEIN() {
  const store = storeConfig.store.getState();
  const login = store && store['login'];
  const common = store && store['common'];
  const {clinic={}}=login;
  const { clinicConfig } = common;
  let current = clinicConfig.DEFAULT_SHOW_EIN;
  let currentMap = new Map();
  if(current&&current.length>0){
    current.forEach(element => {
      if (element.siteId===clinic.siteId) {
        currentMap.set('first',element);
      }
      else if(!element.siteId&&_.toUpper(element.svcCd) === _.toUpper(clinic.svcCd)){
        currentMap.set('second',element);
      }else if(!element.siteId&&!element.svcCd){
        currentMap.set('third',element);
      }else{
        currentMap.set('fourth',element);
      }
    });
  }
   let arr = [];
    if(currentMap.has('first')){
      arr.push(_.toUpper(currentMap.get('first').paramValue)=== 'Y' ? true : false);
    }else if(currentMap.has('second')){
      arr.push(_.toUpper(currentMap.get('second').paramValue)==='Y'? true : false);
    }else if(currentMap.has('third')){
      arr.push(_.toUpper(currentMap.get('third').paramValue)==='Y' ? true : false);
    }else{
      arr.push(false);
    }
    return arr[0];
}

export function getCurrentEncounterDesc(clearHeader) {
  const store = storeConfig.store.getState();
  const common = store && store['common'];
  const patient = store && store['patient'];
  const { encounterTypeList } = common;
  const { encounterInfo } = patient;
  let currentEncounter = _.find(encounterTypeList,item => {
      return item.encntrTypeId === encounterInfo.encntrTypeId;
  });
  let desc;
  if(clearHeader) {
    desc = `${moment(encounterInfo.encounterDate).format('DD-MMM-YYYY')} ${currentEncounter?currentEncounter.description:''}`;
  } else {
    desc = `Encounter Date: ${moment(encounterInfo.encounterDate).format('DD-MMM-YYYY')} ${currentEncounter?currentEncounter.description:''}`;
  }

  return desc;
}

export function getUserHclDrCode() {
  const store = storeConfig.store.getState();
  const login = store && store['login'];
  const { loginInfo } = login;
  const { userDto = {} } = loginInfo;
  let { hclDrCode } = userDto;
  return hclDrCode?hclDrCode:'';
}

export function getUserFullName(passUser) {
  const store = storeConfig.store.getState();
  const login = store && store['login'];
  const { loginInfo } = login;
  const { userDto = {} } = loginInfo;
  const user = passUser?passUser:userDto;
  if(user.salutation){
    return `${user.salutation} ${user.engSurname} ${user.engGivName}`.trim();
  }
  return `${user.engSurname} ${user.engGivName}`.trim();
}

export function commonMessageLog(msgCode, msgBtn, msgDialogName = null, msgName = null, msgValue = null) {
  const store = storeConfig.store.getState();
  const message = store && store['message'];
  const { commonMessageList } = message;
  let result = '';
  if (commonMessageList) {
    let messageVal = commonMessageList.find(item => item.messageCode === msgCode);
    if (msgDialogName) {
      let values = '';
      if (messageVal.cause !== null) {
        values += `cause (${messageVal.cause});`;
      }
      if (messageVal.actionView !== null) {
        values += `action_view (${messageVal.actionView});`;
      }
      let reg = new RegExp(`%${msgName}%`, 'g');
      let tempDesc = !isNull(messageVal.description) ? replace(messageVal.description, reg, msgValue) : messageVal.description;
      result = `${msgDialogName} Action: Click '${msgBtn}' button in message dialog (message code: ${messageVal.messageCode}; message: ${tempDesc};${values})`;
    } else {
      let values = '';
      if (messageVal.cause !== null) {
        values += `cause (${messageVal.cause});`;
      }
      if (messageVal.actionView !== null) {
        values += `action_view (${messageVal.actionView});`;
      }
      let reg = new RegExp(`%${msgName}%`, 'g');
      let tempDesc = !isNull(messageVal.description) ? replace(messageVal.description, reg, msgValue) : messageVal.description;
      result = `Action: Click '${msgBtn}' button in message dialog (message code: ${messageVal.messageCode}; message: ${tempDesc};${values})`;
    }
  }
  return result;
}

export function getServiceListByServiceCdList(serviceCdList) {
  const store = storeConfig.store.getState();
  const serviceList = store && store['common']['serviceList'];
  let defaultOption = [{value:'ALL' , title: 'ALL'}];
  let serviceOptions = [];
  for (let a = 0; a < serviceCdList.length; a++) {
    for (let index = 0; index < serviceList.length; index++) {
      const element = serviceList[index];
      if(serviceCdList[a] == element.serviceCd ) {
        serviceOptions.push({value: element.serviceCd, title: element.serviceName});
      }
    }
  }
  //sort by service full name
  serviceOptions.sort(function(a,b) {
    if(a.title < b.title){
      return -1;
    }
    if(a.title > b.title) {
      return 1;
    }
    return 0;
  });
  serviceOptions = defaultOption.concat(serviceOptions);
  return serviceOptions;
}

export function getClinicListByServiceCd(serviceCd) {
  const store = storeConfig.store.getState();
  let clinicList = store && store['common']['clinicList'];
  let defaultOption = [{value:'ALL' , title: 'ALL'}];
  let tempArray = [];
  for (let index = 0; index < clinicList.length; index++) {
    const element = clinicList[index];
    if(element.serviceCd == serviceCd ) {
      let temp = {value: element.clinicCd, title: element.clinicCd + ' - ' + element.siteName, name: element.clinicName};
      tempArray.push(temp);
    }
  }
  //sort by clinic full name
  tempArray.sort(function(first,second) {
    if(first.name < second.name){
      return -1;
    }
    if(first.name > second.name) {
      return 1;
    }
    return 0;
  });
  tempArray = defaultOption.concat(tempArray);
  return tempArray;
}

export function getDefalutValByCodeIoeSpecificFunctionCd(data,codeIoeSpecificFunctionCd) {
  let flag = false;
  for (const key in data) {
      if(data[key].codeIoeSpecificFunctionCd === codeIoeSpecificFunctionCd) {
        flag = data[key].behavior === 'Y' ? true : false;
        break;
      }
  }
  return flag;
}


export function getDefalutValByFunctionCd(data,codeIoeSpecificFunctionCd) {
  let flag = false;
  for (const key in data) {
      if(data[key].codeIoeSpecificFunctionCd === codeIoeSpecificFunctionCd) {
        flag = data[key].behavior === 'Y' ? false : true;
        break;
      }
  }
  return flag;
}

export function getDefalutValByCheckBoxCd(data,codeIoeSpecificFunctionCd) {
  let flag = false;
  let exist = false;
  for (const key in data) {
      if(data[key].codeIoeSpecificFunctionCd === codeIoeSpecificFunctionCd) {
        flag = data[key].behavior === 'Y' ? false : true;
        exist = true;
        break;
      }
  }
  return exist ? flag : true;
}



export function getDefalutValByOrderType(data,codeIoeSpecificFunctionCd) {
  let flag = false;
  for (const key in data) {
    if(data[key].codeIoeSpecificFunctionCd === codeIoeSpecificFunctionCd) {
        flag = data[key].behavior === 'Y' ? true : false;
        break;
    }
}
  return flag;
}

export function cutOutString(value, maxValue) {
  let countIn = 0;
  let realCount = 0;
  for (let i = 0; i < value.length; i++) {
    const element = value.charCodeAt(i);
    if (element >= 0 && element <= 255) {
      if(countIn + 1 > maxValue) {
        break;
      }else{
        countIn += 1;
        realCount++;
      }
    } else {
      if(countIn + 3 > maxValue) {
        break;
      }else{
        countIn += 3;
        realCount++;
      }
    }
  }
  return value ? value.slice(0, realCount) : value;
}

/***
 * get genderCd
 * @param codSexIdBaby
 * @returns {string|*}
 */
export function getGenderCd(codSexIdBaby){
    let type = {
      404: 'F',
      405: 'M',
      406: 'U'
    };
    if (!codSexIdBaby){
      return '';
    }
    return  type[codSexIdBaby];
}

/***
 *  转换 exactDobCd
 * @param codExactDateIdBabyDob
 * @returns {string}
 */
export const transExactDobCd = (codExactDateIdBabyDob)=>{
  let res = '';
  switch (codExactDateIdBabyDob) {
    case null: case 554:
      res = 'EDMY';
      break;
    case 552:
      res = 'EY';
      break;
    case 553:
      res = 'EMY';
      break;
    default:
      res = 'EDMY';
      break;
  }
  return res;
};

/***
 * 根据 codExactDateIdBabyDob 转换对应类型日期格式
 * @param codExactDateIdBabyDob [codExactDateIdBabyDob]
 * @param exactDobCd [exactDobCd]
 * @param date [babyDob]
 * @returns {string}
 */

export const getDobByDate = ({codExactDateIdBabyDob='',exactDobCd='', date=''}) =>{
  console.log(codExactDateIdBabyDob,exactDobCd,date);
  if (!exactDobCd){
    exactDobCd = transExactDobCd(codExactDateIdBabyDob);
  }
  let formatMap = {
    'EDMY': 'DD-MMM-YYYY',
    'EMY': 'MMM-YYYY',
    'EY': 'YYYY'
  };
  let formatDate = '';
  if (moment(date).isValid()) {
    if(formatMap[exactDobCd]) {
      formatDate = moment(date).format(formatMap[exactDobCd]);
    } else {
      formatDate = moment(date).format('DD-MM-YYYY');
    }
  }
  return formatDate;
};