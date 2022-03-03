import { axios, maskAxios } from '../../../services/axiosInstance';
import { call, put, putResolve, race, take, takeLatest, takeEvery, all, select } from 'redux-saga/effects';
import * as type from '../../actions/patient/patientActionType';
import { putCgsGeneticInfo, putPsoInfo } from '../../actions/patient/patientAction';
import * as mainFrameActionType from '../../actions/mainFrame/mainFrameActionType';
import * as messageType from '../../actions/message/messageActionType';
import * as PatientUtil from '../../../utilities/patientUtilities';
import * as CommonUtil from '../../../utilities/commonUtilities';
import * as caseNoUtilities from '../../../utilities/caseNoUtilities';
import accessRightEnum from '../../../enums/accessRightEnum';
import { openCommonMessage } from '../../actions/message/messageAction';
import { selectCaseTrigger } from '../../actions/caseNo/caseNoAction';
import * as caseNoType from '../../actions/caseNo/caseNoActionType';
import * as bannerSaga from './bannerSaga';
import { print,getPrinterTray, getPaperSize } from '../../../utilities/printUtilities';
import * as apptService from '../../../services/ana/appointmentService';
import * as encounterService from '../../../services/ana/encounterService';
import moment from 'moment';
import Enum,{PAPER_SIZE_TYPE, PRINTER_TRAY_TYPE} from '../../../enums/enum';
import _ from 'lodash';
import * as AppointmentUtil from '../../../utilities/appointmentUtilities';
import { dispatch } from '../../util';
import {alsStartTrans, alsEndTrans} from '../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../als/alsLogSaga';
import {mapAntSvcInfo} from '../../../utilities/anSvcIdUtilities';
import {SHS_APPOINTMENT_GROUP} from '../../../enums/appointment/booking/bookingEnum';
import * as RegistrationType from '../../actions/registration/registrationActionType';

function* spcCaseInfo(params) {
  return yield call(maskAxios.get, '/patient/spcCaseInfo', { params });
}

function* refreshAnSvcIDInfo() {
  yield alsTakeEvery(type.REFRESH_AN_SERVICE_ID_INFO, function* (action) {
    const patientInfo = yield select(state => state.patient.patientInfo);
    const caseNoInfo = yield select(state => state.patient.caseNoInfo);
    const { params } = action;
    let spcCaseInfoResp = yield call(spcCaseInfo, params);
    if (spcCaseInfoResp.data.respCode === 0) {
      //const antSvcInfo = PatientUtil.getCurAntSvcInfo();
      let alias = '';
      let encntrGrpCd = '';
      if (caseNoInfo) {
        alias = caseNoInfo.alias || '';
        encntrGrpCd = caseNoInfo.encntrGrpCd || '';
      } else {
        alias = patientInfo.caseList && patientInfo.caseList.length === 1 ? patientInfo.caseList[0].alias : '';
        encntrGrpCd = patientInfo.caseList && patientInfo.caseList.length === 1 ? patientInfo.caseList[0].encntrGrpCd : '';
      }
      patientInfo.antSvcInfo = mapAntSvcInfo(spcCaseInfoResp.data.data, alias, encntrGrpCd);
      yield put({
        type: type.UPDATE_STATE,
        updateData: { patientInfo: patientInfo }
      });
    }
  });
}

function* loadPatient() {
  yield alsTakeEvery(type.LOAD_PATIENT, function* (action) {
    const { appointmentId, callBack, caseNoInfo, patientInfo } = action;
    let attendance = null;
    let anaAppointment = yield select(state => state.patient.appointmentInfo);
    let serviceCd = yield select(state => state.login.service.serviceCd);
    // let siteId = yield select(state => state.login.clinic.siteId);
    let encounterTypes = yield select(state => state.common.encounterTypes);

    //update patient appointment
    if (appointmentId) {
      let [anaAppt, atnd] = yield all([
        // call(apptService.getAppointmentById, appointmentId, siteId, serviceCd),
        call(apptService.getAppointmentById, appointmentId, null, serviceCd),
        call(apptService.getAttendance, appointmentId)
      ]);

      let anaApptData = anaAppt && anaAppt.data;
      if (anaApptData.respCode === 0) {
        let clinicList = yield select(state => state.common.clinicList);
        let anaRemarkTypes = yield select(state => state.attendance.anaRemarkTypes);
        anaAppointment = apptService.appointmentToReduxState(anaApptData.data, clinicList, anaRemarkTypes, encounterTypes);
      } else {
        yield put(openCommonMessage({ msgCode: '110031' }));
      }
      let attendanceData = atnd && atnd.data;
      if (attendanceData.respCode === 0) {
        attendance = attendanceData.data;
      } else {
        yield put(openCommonMessage({ msgCode: '110031' }));
      }
    }

    //load patient banner
    let patient = PatientUtil.transferPatientDocumentPair(patientInfo);
    patient = PatientUtil.initPatientPhoneSort(patient);
    if (serviceCd === 'ANT') {
      let spcCaseInfoResp = yield call(spcCaseInfo, { patientKey: patientInfo.patientKey, svcCd: 'ANT' });
      if (spcCaseInfoResp.data.respCode === 0) {
        let alias = '';
        let encntrGrpCd = '';
        if (caseNoInfo) {
          alias = caseNoInfo.alias || '';
          encntrGrpCd = caseNoInfo.encntrGrpCd || '';
        } else {
          alias = patient.caseList && patient.caseList.length === 1 ? patient.caseList[0].alias : '';
          encntrGrpCd = patient.caseList && patient.caseList.length === 1 ? patient.caseList[0].encntrGrpCd : '';
        }
        patient.antSvcInfo = mapAntSvcInfo(spcCaseInfoResp.data.data, alias, encntrGrpCd);
      }
    }
    if (serviceCd === 'SHS') {
      const getEncntrCaseParams = {
        patientKey: patient.patientKey,
        sspecID: SHS_APPOINTMENT_GROUP.SKIN_GRP
      };
      yield put({
        type: type.GET_LATEST_PATIENT_ENCOUNTER_CASE,
        params: getEncntrCaseParams
      });
    }
    yield put({ type: type.PUT_PATIENT_INFO, data: patient, appointmentInfo: anaAppointment, caseNoInfo, attendance });
    callBack && callBack(patient);
  });
}

export function* loadPatientFunc(appointmentId, caseNoInfo, patientInfo) {
  let attendance = null;
  let anaAppointment = yield select(state => state.patient.appointmentInfo);
  let serviceCd = yield select(state => state.login.service.serviceCd);
  // let siteId = yield select(state => state.login.clinic.siteId);
  let encounterTypes = yield select(state => state.common.encounterTypes);


  //update patient appointment
  if (appointmentId) {
    let [anaAppt, atnd] = yield all([
      // call(apptService.getAppointmentById, appointmentId, siteId, serviceCd),
      call(apptService.getAppointmentById, appointmentId, null, serviceCd),
      call(apptService.getAttendance, appointmentId)
    ]);

    let anaApptData = anaAppt && anaAppt.data;
    if (anaApptData.respCode === 0) {
      let clinicList = yield select(state => state.common.clinicList);
      let anaRemarkTypes = yield select(state => state.attendance.anaRemarkTypes);
      anaAppointment = apptService.appointmentToReduxState(anaApptData.data, clinicList, anaRemarkTypes, encounterTypes);
    } else {
      yield put(openCommonMessage({ msgCode: '110031' }));
    }
    let attendanceData = atnd && atnd.data;
    if (attendanceData.respCode === 0) {
      attendance = attendanceData.data;
    } else {
      yield put(openCommonMessage({ msgCode: '110031' }));
    }
  }

  //load patient banner
  let patient = PatientUtil.transferPatientDocumentPair(patientInfo);
  patient = PatientUtil.initPatientPhoneSort(patient);
  let patSearchParam = yield select(state => state.patientSpecFunc.patientSearchParam);
  if (serviceCd === 'ANT') {
    let spcCaseInfoResp = yield call(spcCaseInfo, { patientKey: patientInfo.patientKey, svcCd: 'ANT' });
    if (spcCaseInfoResp.data.respCode === 0) {
      const { searchType, searchValue } = patSearchParam;
      let alias = '';
      let encntrGrpCd = '';
      if (searchType === 'CASENUM') {
        alias = searchValue || '';
      } else {
        if (caseNoInfo) {
          alias = caseNoInfo.alias || '';
          encntrGrpCd = caseNoInfo.encntrGrpCd || '';
        } else {
          alias = patient.caseList && patient.caseList.length === 1 ? patient.caseList[0].alias : '';
          encntrGrpCd = patient.caseList && patient.caseList.length === 1 ? patient.caseList[0].encntrGrpCd : '';
        }
      }
      patient.antSvcInfo = mapAntSvcInfo(spcCaseInfoResp.data.data, alias, encntrGrpCd);
    }
    if (serviceCd === 'SHS') {
      const getEncntrCaseParams = {
        patientKey: patient.patientKey,
        sspecID: SHS_APPOINTMENT_GROUP.SKIN_GRP
      };
      yield put({
        type: type.GET_LATEST_PATIENT_ENCOUNTER_CASE,
        params: getEncntrCaseParams
      });
    }
  }
  yield put({ type: type.PUT_PATIENT_INFO, data: patient, appointmentInfo: anaAppointment, caseNoInfo, attendance });
}

function* getPatientById() {
  yield alsTakeEvery(type.GET_PATINET_BY_ID, function* (action) {
    try{
      let { patientKey, appointmentId, caseNo, callBack, resetPatientList } = action;
      yield put(alsStartTrans());

      let { data } = yield call(maskAxios.post, '/patient/getPatient', { 'patientKey': patientKey });
      if (data.respCode === 0) {
        let caseNoInfo = null, patientInfo = data.data;

        let service = yield select(state => state.login.service);
        if (service.svcCd === 'SHS') {
          let { data } = yield call(maskAxios.get, `/diagnosis/PSO/patientWithPsoriasis/${patientKey}`);
          if (data.respCode === 0) {
            patientInfo.psoInfo = data.data;
          }
          else {
            yield put({
              type: messageType.OPEN_COMMON_MESSAGE,
              payload: {
                msgCode: '110031'
              }
            });
          }
        }

        //update patient caseNo.
        if (caseNo) {
          const caseList = data.data.caseList || [];
          caseNoInfo = caseList.find(item => item.caseNo === caseNo && item.statusCd === 'A');
          yield put({ type: type.LOAD_PATIENT, appointmentId, callBack, caseNoInfo, patientInfo});
        } else {
          let activeCaseList = (patientInfo.caseList && patientInfo.caseList.filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE)) || [];
          if (activeCaseList.length === 1) {
            yield put({ type: type.LOAD_PATIENT, appointmentId, callBack, caseNoInfo: _.cloneDeep(activeCaseList[0]), patientInfo});
          } else if (activeCaseList.length > 1) {

            yield put(selectCaseTrigger({
              trigger: Enum.CASE_SELECTOR_STATUS.OPEN,
              selectCaseList: activeCaseList,
              caseSelectCallBack: (_caseNoInfo) => {
                if (_caseNoInfo) {
                  dispatch({ type: type.LOAD_PATIENT, appointmentId, callBack, caseNoInfo: _caseNoInfo, patientInfo});
                } else {
                  resetPatientList && resetPatientList();
                }
              }
            }));
          } else {
            yield put({ type: type.LOAD_PATIENT, appointmentId, callBack, caseNoInfo, patientInfo});
          }
        }


      } else if (data.respCode === 100) {
        yield put(openCommonMessage({ msgCode: '110130' }));
      } else {
        yield put(openCommonMessage({ msgCode: '110031' }));
      }

    }finally{
        yield put(alsEndTrans());
    }
  });
}

function* refreshPatient() {
  while (true) {
    let { caseNo, appointmentId, callBack, isRefreshCaseNo, isRefreshApptInfo, isRefreshBannerData } = yield take(type.REFRESH_PATIENT);
    const patientInfo = yield select(state => state.patient.patientInfo);
    const appointmentInfo = yield select(state => state.patient.appointmentInfo);
    const caseNoInfo = yield select(state => state.patient.caseNoInfo);
    let patientKey = patientInfo && patientInfo.patientKey;
    if (patientKey) {
      if (!appointmentId) {
        appointmentId = appointmentInfo && appointmentInfo.appointmentId || null;
      }
      if (!caseNo){
        caseNo = caseNoInfo && caseNoInfo.caseNo || null;
      }
      const _callBack = async () => {
        if (isRefreshBannerData) {
          await new Promise((resolve, reject) => {
            dispatch({type: type.GET_PATIENT_BANNER_DATA, resolve, reject});
          });
        }
        callBack && callBack();
      };
      yield put({
        type: type.GET_PATINET_BY_ID,
        patientKey,
        appointmentId: isRefreshApptInfo ? appointmentId : null,
        caseNo: isRefreshCaseNo ? caseNo : null,
        callBack: _callBack
      });
    }
  }
}

function* listNationalityAndListCountry() {
  while (true) {
    try{
      yield take(type.LIST_NATIONALITY_AND_LIST_COUNTRY);
      yield put(alsStartTrans());

      const [nationalityCall, countryCall] = yield all([
        // call(maskAxios.get, '/common/listNationality'),
        // call(maskAxios.get, '/common/listCountry')
        call(maskAxios.get, '/cmn/nationalities'),
        call(maskAxios.get, '/cmn/countries')
      ]);
      const nationality = nationalityCall.data;
      const country = countryCall.data;
      if (nationality.respCode === 0 && country.respCode === 0) {
        yield put({
          type: type.LOAD_NATIONALITY_LIST_AND_COUNTRY_LIST,
          countryList: country.data,
          nationalityList: nationality.data
        });
      } else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }
    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* listThsDestination(){
  while (true) {
      try {
          yield take(type.LIST_THS_DESTINATION);
          yield put(alsStartTrans);

          let { data } = yield call(maskAxios.get, '/ana/ThsDestination');
          if (data.respCode === 0) {
            yield put({
              type: type.LOAD_THS_DESTINATION,
              destinationList: data.data
            });
          } else {
              yield put({
                  type: messageType.OPEN_COMMON_MESSAGE,
                  payload: {
                      msgCode: '110031'
                  }
              });
          }

      } finally {
          yield put(alsEndTrans());
      }
  }
}


function* getLanguageList() {
  while (true) {
    try{
      yield take(type.GET_LANGUAGE_LIST);
      yield put(alsStartTrans());

      let { data } = yield call(maskAxios.get, '/cmn/preferredLanguages');
      if (data.respCode === 0) {
        yield put({
          type: type.PUT_LANGUAGE_LIST,
          languageData: data.data
        });
      } else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }
    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getPatientAppointment() {
  while (true) {
    try{
      const { appointmentId, caseList } = yield take(type.GET_PATIENT_APPOINTMENT);
      yield put(alsStartTrans());

      let { data } = yield call(maskAxios.get, `/appointment/getAppointment/${appointmentId}`);
      if (data.respCode === 0) {
        yield put({ type: type.UPDATE_PATIENT_APPOINTMENT, appointmentInfo: data.data });
        if (caseList) {
          let caseDto = caseList.find(item => item.caseNo === data.data.caseNo);
          yield put({ type: type.UPDATE_PATIENT_CASENO, caseNoInfo: caseDto });
        }
      } else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getRedesignPatientAppointment() {
  while (true) {
    try{
      const { appointmentId, caseList, patientAppointmentParams } = yield take(type.GET_REDESIGN_PATIENT_APPOINTMENT);
      yield put(alsStartTrans());

      let { data } = yield call(axios.get, `/ana/appointments/${appointmentId}`, patientAppointmentParams);
      if (data.respCode === 0) {
        let dateMap = data.data;
        // TODO :. Delete this for next Var
        dateMap.state = dateMap.apptTypeCd;
        dateMap.appointmentDate = moment(dateMap.apptDateTime).format(Enum.DATE_FORMAT_EYMD_VALUE);
        dateMap.appointmentTime = moment(dateMap.apptDateTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
        yield put({ type: type.UPDATE_PATIENT_APPOINTMENT, appointmentInfo: dateMap });
        // TODO : Case List
        // if (caseList) {
        //   let caseDto = caseList.find(item => item.caseNo === data.data.caseNo);
        //   yield put({ type: type.UPDATE_PATIENT_CASENO, caseNoInfo: caseDto });
        // }
      } else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getPatientCaseNo() {
  while (true) {
    try{
      const { caseList, caseNo } = yield take(type.GET_PATIENT_CASENO);
      yield put(alsStartTrans());

      if (caseList) {
        let caseDto = caseList.find(item => item.caseNo === caseNo);
        yield put({ type: type.UPDATE_PATIENT_CASENO, caseNoInfo: caseDto });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getEHRUrl() {
  while (true) {
    try {
      let { patientData, isEHRAccessRight, isEHRSSRegistered, eHRViewerUrl, callBack } = yield take(type.GET_EHR_URL);
      yield put(alsStartTrans());
      // if (!isEHRSSRegistered) {


      //     yield put({
      //         type: type.PUT_EHR_URL,
      //         data: [],
      //         eHRUrl: 'https://ppimig.ha.org.hk/'
      //     });
      // } else
      // Check eHR Access Right Logic (:. eHR ID is a Nunber and NOT NULL and not 0 )
      // if (isEHRAccessRight) {
        // '/ehris/viewer/patientUrl',
        // 'https://cims-interface-ehr-viewer-svc-cims-dh-dhp-dev-2.cldpaast71.server.ha.org.hk/viewer/patientUrl',
        let { data } = yield call(
          axios.post,
          eHRViewerUrl,
          // eHRUtilities.getViewerUrl(),
          patientData
        );
        if (data.code === 0) {
          if (data.data.url && data.data.ticket) {
            yield put({
              type: type.PUT_EHR_URL,
              data: data,
              eHRUrl: data.data.url + '?' + data.data.ticket
            });
            callBack && callBack(data);
          } else {
            // Invalid JSON Format or API data error
            yield put({ type: mainFrameActionType.DELETE_SUB_TABS, params: accessRightEnum.eHRRegistered });
            yield put(openCommonMessage({
              msgCode: '130102',
              params: [{ name: 'statusCode', value: data.data.status }, { name: 'statusDesc', value: data.data.statusDescription }]
            }));
          }
        } else {
          // data.code
          yield put({ type: mainFrameActionType.DELETE_SUB_TABS, params: accessRightEnum.eHRRegistered });
          yield put(openCommonMessage({
            msgCode: '130103',
            params: [{ name: 'dataCode', value: data.code ? data.code : 'Unknown Code' }]
          }));
        }
      // } else {
      //   // EHRAccess Right Error
      //   yield put({ type: mainFrameActionType.DELETE_SUB_TABS, params: accessRightEnum.eHRRegistered });
      //   yield put(openCommonMessage({ msgCode: '130101' }));
      // }
    } catch (error) {
      // eHR API error
      yield put(openCommonMessage({ msgCode: '130100' }));
      yield put({ type: mainFrameActionType.DELETE_SUB_TABS, params: accessRightEnum.eHRRegistered });
      throw error;
    } finally{
      yield put(alsEndTrans());
    }
  }
}

function* getPatientEncounter() {
  while (true) {
    try{
      const { appointmentId, callback } = yield take(type.GET_PATIENT_ENCOUNTER);
      yield put(alsStartTrans());

      let { data } = yield call(apptService.getEncounters, [appointmentId]);
      if (data.respCode === 0) {
        let effectiveData = (data.data || []).filter(x => x.encntrSts !== 'D');
        if (effectiveData && effectiveData.length > 0) {
          let site = yield select(s => s.login.clinic);
          yield put({ type: type.LOAD_PATIENT_ENCOUNTER_INFO, encounterInfo: encounterService.encounterToReduxStore(effectiveData[0], site) });
        }
      } else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }
      if (typeof callback === 'function') {
        callback();
      }
    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* listMajorKeyHistory() {
  while (true) {
    try{
      let { patientKey } = yield take(type.LIST_MAJORKEY_CHANGE_HISTORY);
      yield put(alsStartTrans());

      let { data } = yield call(maskAxios.get, `/patient/listMajorKeyHistory/${patientKey}`);
      if (data.respCode === 0) {
        yield put({ type: type.PUT_MAJORKEY_CHANGE_HISTORY, data: data.data });
      }
    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getPatientGumLabel() {
  while (true) {
    try{
      let {serviceCd, siteId, patientKey, caseNo, isPreview,callback } = yield take(type.GET_PATIENT_GUM_LABEL);
      yield put(alsStartTrans());
      let { data } = yield call(maskAxios.get, `patient/getPatientGumLabel/${serviceCd}/${siteId}/${patientKey}/${caseNo||''}`);
      if (data.respCode === 0) {
        // const tray=getPrinterTray(PRINTER_TRAY_TYPE.GUM_LABEL);
        const paperSize = getPaperSize(PAPER_SIZE_TYPE.GUM_LABEL);
        const reqParams = {
            base64: data.data,
            orientation: 1,
            paperSize: paperSize || -1
            // printTray: tray || null,
        };

        if(isPreview){
          yield put({
            type:type.UPDATE_STATE,
            updateData:{gumLabelPrintReqParams:reqParams}
          });
          callback&&callback();
        }else{
          yield print(reqParams);
        }
      }
      else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getPatientSPPGumLabel() {
  while (true) {
    try{
      let { params, isPreview,callback } = yield take(type.GET_PATIENT_SPP_GUM_LABEL);
      yield put(alsStartTrans());
      let { data } = yield call(maskAxios.get, 'patient/sppGumLabel', { params });
      if (data.respCode === 0) {
        const paperSize = getPaperSize(PAPER_SIZE_TYPE.GUM_LABEL);
        const reqParams = {
            base64: data.data,
            orientation: 1,
            paperSize: paperSize || -1
        };

        if(isPreview){
          yield put({
            type:type.UPDATE_STATE,
            updateData:{gumLabelPrintReqParams:reqParams}
          });
          callback&&callback();
        }else{
          yield print(reqParams);
        }
      }
      else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getPatientEHSGumLabel() {
  while (true) {
    try{
      let { params, isPreview,callback } = yield take(type.GET_PATIENT_EHS_GUM_LABEL);
      yield put(alsStartTrans());
      let { data } = yield call(maskAxios.get, 'patient/ehsGumLabel', { params });
      if (data.respCode === 0) {
        const paperSize = getPaperSize(PAPER_SIZE_TYPE.GUM_LABEL);
        const reqParams = {
            base64: data.data,
            orientation: 1,
            paperSize: paperSize || -1
        };

        if(isPreview){
          yield put({
            type:type.UPDATE_STATE,
            updateData:{gumLabelPrintReqParams:reqParams}
          });
          callback&&callback();
        }else{
          yield print(reqParams);
        }
      }
      else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}


function* getPatientSpecimenLabel() {
  while (true) {
    try{
      let {serviceCd, siteId, patientKey, isPreview,callback } = yield take(type.GET_PATIENT_SPECIMEN_LABEL);
      yield put(alsStartTrans());
      let { data } = yield call(maskAxios.get, `patient/getSocHSSpecimenlabel/${serviceCd}/${siteId}/${patientKey}`);
      if (data.respCode === 0) {
        const tray=getPrinterTray(PRINTER_TRAY_TYPE.SPECIMEN_LABEL);
        // const paperSize = getPaperSize(PAPER_SIZE_TYPE.SPECIMEN_LABEL);
        const reqParams = {
            base64: data.data,
            orientation: 1
            // paperSize: paperSize || -1
            // printTray: tray || null,
        };
        if(tray){
          reqParams.printTray=tray;
        }
        if(isPreview){
          yield put({
            type:type.UPDATE_STATE,
            updateData:{gumLabelPrintReqParams:reqParams}
          });
          callback&&callback();
        }else{
          yield print(reqParams);
        }
      }
      else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* listAppointmentHistory() {
  while (true) {
    try{
      let { params, callback } = yield take(type.LIST_APPOINTMENT_HISTORY);
      yield put(alsStartTrans());

      let service = yield select(state => state.login.service);
      let patientInfo = yield select(state => state.patient.patientInfo);
      let _params = {
        withPMIDetls: false,
        allService: false,
        withShowObsInfomation: false,
        svcCd: service.svcCd,
        patientKey: patientInfo.patientKey,
        ...params
      };
      let { data } = yield call(apptService.listAppointments, _params);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({
          type: messageType.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: '110031'
          }
        });
      }

    }finally{
        yield put(alsEndTrans());
    }
  }
}

function* getPatientBanner() {
  yield alsTakeLatest(type.GET_PATIENT_BANNER, function* (action) {
    let { data } = yield call(maskAxios.get, '/patient/services/' + action.serviceCd + '/patients/' + action.patientKey + '/role/' + action.roleName + '/patientBanners');
    if (data.respCode === 0) {
      yield put({ type: type.PUT_PATIENT_BANNER, data: data.data });
    }
    else {
      yield put({
        type: type.PUT_PATIENT_BANNER,
        data: [{
          bannerType: 'PATIENT',
          indexNo: 0,
          display: 'PMI: ',
          functionName: 'showPmi',
          fontColor: '#000000',
          bgColor: '#CCCCCC'
        }]
      });
      // yield put({ type: type.PUT_PATIENT_BANNER, data: [] });
      // yield put({
      //     type: messageType.OPEN_COMMON_MESSAGE,
      //     payload: {
      //         msgCode: '110031'
      //     }
      // });
    }
  });
}

function* getViewLogList() {
  yield alsTakeEvery(type.GET_VIEW_LOG_LIST, function* () {
    const service = yield select(state => state.login.service);
    const patientInfo = yield select(state => state.patient.patientInfo);
    const patientSummaryViewLog = yield select(state => state.patient.patientSummaryViewLog);
    let params = {
      withPMIDetls: false,
      withShowCancelAppointment: true,
      patientKey: patientInfo.patientKey,
      svcCd: service.svcCd
    };
    let { data } = yield call(maskAxios.get, `/ana/appointments/apptViewLog/${params.svcCd}/${params.patientKey}`);
    if (data.respCode === 0) {
      // let process_data = AppointmentUtil.processPatientSummaryViewLog(data.data);
      let process_data = data.data.map((item, index) => ({
        rowId: index + 1,
        ...item
      }));
      yield put({
        type: type.UPDATE_STATE,
        updateData: {
          patientSummaryViewLog: {
            ...patientSummaryViewLog,
            apptList: process_data
          }
        }
      });
    } else {
      yield put({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
          msgCode: '110031'
        }
      });
    }
  });
}

function* getPatientPUC() {
  yield alsTakeLatest(type.GET_PATIENT_PUC, function*(action) {
    yield call(getPatientPUCFunc, action.patientParams);
    const pucChecking = yield select(state => state.patient.pucChecking);
    action.callback && action.callback(action.patientParams, pucChecking);
  });
}

export function* getPatientPUCFunc({ patientKey, appointmentId, caseNo }) {
  try {


    let { data } = yield call(maskAxios.post, '/patient/getPatient', { 'patientKey': patientKey });
    if (data.respCode === 0) {
      let caseNoInfo = null, patientInfo = data.data;
      let callBack = null;
      let resetPatientList = null;

      //update patient caseNo.
      if (caseNo) {

        const caseList = data.data.caseList || [];
        caseNoInfo = caseList.find(item => item.caseNo === caseNo && item.statusCd === 'A');
        yield call(loadPatientFunc, appointmentId, caseNoInfo, patientInfo);
        return true;
      } else {
        let activeCaseList = (patientInfo.caseList && patientInfo.caseList.filter(item => item.statusCd === Enum.CASE_STATUS.ACTIVE)) || [];
        let patSearchParam=yield select(state=>state.patientSpecFunc.patientSearchParam);
        const {searchType,searchValue}=patSearchParam;
        if (activeCaseList.length === 1) {
          yield call(loadPatientFunc, appointmentId, _.cloneDeep(activeCaseList[0]), patientInfo);
          return true;
        } else if (activeCaseList.length > 1) {
          if(searchType==='CASENUM'){
            let searchAlias=activeCaseList.find(x=>x.alias===searchValue);
            yield call(loadPatientFunc, appointmentId, searchAlias||null, patientInfo);
            return true;
          }else{
            yield put(selectCaseTrigger({
              trigger: Enum.CASE_SELECTOR_STATUS.OPEN,
              selectCaseList: activeCaseList
            // caseSelectCallBack: (_caseNoInfo) => {
            //   if (_caseNoInfo) {
            //     dispatch({ type: type.LOAD_PATIENT, appointmentId, callBack, caseNoInfo: _caseNoInfo, patientInfo });
            //   } else {
            //     resetPatientList && resetPatientList();
            //   }
            // }
            }));
            const { ok } = yield race({
              ok: take(caseNoType.CASENO_DIALOG_OK),
              cancel: take(caseNoType.CASENO_DIALOG_CANCEL)
            });
            if (!!ok) {
              const { selectCase } = ok;

              yield call(loadPatientFunc, appointmentId, selectCase, patientInfo);
              return true;
            }
            else {
            // cancel to select a case

              return false;
            }
          }
        } else {

          yield call(loadPatientFunc, appointmentId, caseNoInfo, patientInfo);
          return true;
        }
      }
    } else if (data.respCode === 100) {
      yield put(openCommonMessage({ msgCode: '110130' }));
    } else {
      yield put(openCommonMessage({ msgCode: '110031' }));
    }

  }
  catch (err) {
      console.log(err);
      throw err;
  }
  return false;
}

function* getPsoInfoFunc({ patientKey }) {
  let success = false;
  if (patientKey != null) {
    let { data } = yield call(maskAxios.get, `/diagnosis/PSO/patientWithPsoriasis/${patientKey}`);
    if (data.respCode === 0) {
      yield put(putPsoInfo(data.data));
      success = true;
    }
    else {
      yield put({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
          msgCode: '110031'
        }
      });
    }
  }

  if (!success) {
    yield put(putPsoInfo(null));
  }
}

function* getPsoInfo() {
  yield takeLatest(type.GET_PSO_INFO, function* (action) {
    yield call(getPsoInfoFunc, action);
  });
}

function* addPsoInfoFunc({ patientKey, encounterId, encounterDate, ehrSiteId, callback }) {
  let success = false;
  if (patientKey != null && encounterId && encounterDate && ehrSiteId) {
    let { data } = yield call(maskAxios.post, `/diagnosis/PSO/addPsoriasis/${patientKey}/${encounterId}/${encounterDate}/${ehrSiteId}`);
    if (data.respCode === 0) {
      yield put(putPsoInfo(data.data));
      success = true;
    }
    else {
      yield put({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
          msgCode: '110031'
        }
      });
    }
  }

  if (!success) {
    yield put(putPsoInfo(null));
  }

  callback && callback();
}

function* addPsoInfo() {
  yield takeLatest(type.ADD_PSO_INFO, function* (action) {
    yield call(addPsoInfoFunc, action);
  });
}

function* getGeneticInfo(patientKey) {
  let success = false;
  if (patientKey != null) {
    console.log('patientKey',patientKey);
    let { data } = yield call(maskAxios.get, `/cgs-consultation/geneticScreening/docByPmi/?pmi=${patientKey}`);
    if (data.respCode === 0) {
      yield put(putCgsGeneticInfo(data.data));

      let docId = '';
      if (data.data.length > 0) {
        docId = data.data.find(item => item.docType === 'CHT')?.docId ?? '';
      }

      yield put({
        type: RegistrationType.UPDATE_DOCUMENT_ID,
        payload: docId ?? ''
      });

      success = true;
    }
    else {
      yield put({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
          msgCode: '110031'
        }
      });
    }
  }

  if (!success) {
    yield put(putCgsGeneticInfo());
  }
}

function* getPatientBannerDataFunc() {
  let service = yield select(state => state.login.service);
  let patient = yield select(state => state.patient);
  let patientInfo = patient.patientInfo;
  // let caseNoInfo = patient.caseNoInfo;
  if (service.svcCd === 'ANT') {
    let patientKey = patientInfo?.patientKey ?? null;
    // let antSvcId = caseNoInfo?.alias;
    yield call(bannerSaga.getGravidaAndParityFunc, { patientKey });

    let antSvcInfo = PatientUtil.getCurAntSvcInfo();
    let clcAntId = antSvcInfo?.clcAntCurrent?.clcAntId;
    yield call(bannerSaga.getAntSvcIdInfoLogFunc, { clcAntId });
  }

  if (service.svcCd === 'SHS') {
    let patientKey = patientInfo?.patientKey ?? null;
    yield call(getPsoInfoFunc, { patientKey });
  }

  if (service.svcCd === 'CGS') {
    const patientKey = patientInfo?.patientKey || null;
    yield call(getGeneticInfo, patientKey);
  }
}

function* getPatientBannerData() {
  yield alsTakeEvery(type.GET_PATIENT_BANNER_DATA, function* (action) {
    const { resolve, reject } = action;
    try {
      yield call(getPatientBannerDataFunc);
      yield call(resolve);
    }
    catch (err) {
      yield call(reject, err);
    }
  });
}

function* getLatestPatientEncntrCase() {
  yield alsTakeEvery(type.GET_LATEST_PATIENT_ENCOUNTER_CASE, function* (action) {
    const { params, callback } = action;
    let { data } = yield call(maskAxios.get, 'ana/Encounter/encounterCase', { params: params });
    if (data.respCode === 0) {
      let skinLatestEncounterInfo = data.data;
      let shsInfo = {
        skinLatestEncounterInfo
      };
      yield put({
        type: type.PUT_LATEST_PATIENT_ENCOUNTER_CASE,
        shsInfo
      });
      callback && callback(data.data);
    }
  });
}


function* updatePatientEncntrCase() {
  yield alsTakeEvery(type.UPDATE_PATIENT_ENCOUNTER_CASE, function* (action) {
    const { params, callback } = action;
    let { data } = yield call(maskAxios.put, 'ana/Encounter/encounterCase', params);
    if (data.respCode === 0) {
      const getEncntrCaseParams = {
        patientKey: params.patientKey,
        sspecID: params.sspecId
      };
      let action = 'Close';
      if (params.isClose === false) {
        action = 'Reopen';
      }
      yield put(openCommonMessage({
        msgCode: '110176',
        showSnackbar: true,
        params: [{ name: 'ACTION', value: action }]
      }));
      yield put({
        type: type.GET_LATEST_PATIENT_ENCOUNTER_CASE,
        params: getEncntrCaseParams,
        callback: callback
      });
    } else if (data.respCode === 100) {
      //login in user not existed.
      yield put(openCommonMessage({ msgCode: '110170' }));
    } else if (data.respCode === 101) {
      //approver id is required.
      yield put(openCommonMessage({ msgCode: '110171' }));
    } else if (data.respCode === 102) {
      //approver not existed.
      yield put(openCommonMessage({ msgCode: '110172' }));
    } else if (data.respCode === 103) {
      //approver is same as login user.
      yield put(openCommonMessage({ msgCode: '110173' }));
    } else if (data.respCode === 104) {
      //is not skin case approver.
      yield put(openCommonMessage({ msgCode: '110174' }));
    } else if (data.respCode === 105) {
      //has future appointment.110169
      if (params.isClose === false) {//has future appointment for reopen case.116032
        yield put(openCommonMessage({ msgCode: '116032' }));
      } else {
        yield put(openCommonMessage({ msgCode: '110169' }));
	  }
    } else if (data.respCode === 106) {
      //is update/reopen by others.
      const getEncntrCaseParams = {
        patientKey: params.patientKey,
        sspecID: params.sspecId
      };
      yield put(openCommonMessage({
        msgCode: '110175',
        btnActions: {
          btn1Click: () => {
            dispatch(
              {
                type: type.GET_LATEST_PATIENT_ENCOUNTER_CASE,
                params: getEncntrCaseParams,
                callback: callback
              }
            );
          }
        }
      }));
    } else if (data.respCode === 107) {
      //latest case is deleted or does not exist.
      yield put(openCommonMessage({ msgCode: '110177' }));
    }
  });
}

function* getHaveEncounterWithinOneMonth() {
  yield alsTakeEvery(type.GET_HAVE_ENCOUNTER_WITHIN_ONE_MONTH, function* (action) {
    const { params, callback } = action;
    const { siteId, patientKey, startDate, endDate} = params;
    let { data } = yield call(maskAxios.get, `rcp/attnEncntrTypes?siteId=${siteId}&patientKey=${patientKey}&startDate=${startDate}&endDate=${endDate}`);
    if (data.respCode === 0) {
      callback && callback(data.data);
    }
  });
}

function* getFamilyEncounterSearchListAsync() {
  yield alsTakeEvery(type.GET_FAMILY_ENCOUNTER_SEARCH_LIST, function* (action) {
    const serviceCd = yield select(state => state.login.service.serviceCd);
    const { id } = action;
    const encounterId = id ? id : yield select((state) => state.patient.encounterInfo.encounterId);

    if (serviceCd === 'CGS') {
      const { data } = yield call(maskAxios.get, `/ana/cgs/encounter/${encounterId}/encounters`);
      if (data.respCode === 0 && data.data.length > 0) {
          const familyEncounterSearchList = data.data.map(el => ({
            ...el,
            dob: moment(new Date(el.dob)).format('DD-MMM-YYYY'),
            encounterStartDate: moment(new Date(el.thisEncntrSdt)).format('DD-MMM-YYYY'),
            encounterStartTime: moment(new Date(el.thisEncntrSdt)).format('HH:mm')
          }));

          yield put({
            type: type.UPDATE_FAMILY_ENCOUNTER_SEARCH_LIST,
            payload: { familyEncounterSearchList }
          });
      } else {
        yield put({
            type: type.UPDATE_FAMILY_ENCOUNTER_SEARCH_LIST,
            payload: { familyEncounterSearchList: [] }
        });
      }
    }
  });
}

function* toggleFamilyEncounterSearchDialog() {
  yield alsTakeEvery(type.TOGGLE_FAMILY_ENCOUNTER_SEARCH_DIALOG, function* (action) {
    const serviceCd = yield select(state => state.login.service.serviceCd);

    if (serviceCd === 'CGS') {
      yield put({ type: type.UPDATE_FAMILY_ENCOUNTER_SEARCH_DIALOG });

      const isOpen = yield select(state => state.patient.isFamilyEncounterSearchDialogOpen);

      if (!isOpen) {
        yield put({
          type: type.UPDATE_STATE,
          updateData: { familyEncounterSearchList: [] }
        });
      }
    }
  });
}

function* updateLastCheckDate() {
  yield alsTakeEvery(type.UPDATE_LAST_CHECKDATE, function* (action) {
    const { params, callback } = action;
    let { data } = yield call(maskAxios.put, 'patient/ehs/lastCheckDate', params);
    if (data.respCode === 0) {
      callback && callback();
    }else{
      yield put({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
          msgCode: '110031'
        }
      });
    }
  });
}

export const patientSaga = [
  loadPatient,
  getPatientById,
  listNationalityAndListCountry,
  getLanguageList,
  getPatientAppointment,
  getPatientCaseNo,
  getEHRUrl,
  getPatientEncounter,
  listMajorKeyHistory,
  getPatientGumLabel,
  getPatientSpecimenLabel,
  listAppointmentHistory,
  getPatientBanner,
  getRedesignPatientAppointment,
  getViewLogList,
  refreshPatient,
  listThsDestination,
  getPatientPUC,
  refreshAnSvcIDInfo,
  getPatientBannerData,
  getLatestPatientEncntrCase,
  updatePatientEncntrCase,
  getPsoInfo,
  addPsoInfo,
  getPatientSPPGumLabel,
  getPatientEHSGumLabel,
  getHaveEncounterWithinOneMonth,
  getFamilyEncounterSearchListAsync,
  toggleFamilyEncounterSearchDialog,
  updateLastCheckDate
];