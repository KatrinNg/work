import { take, call, put, takeLatest } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as clinicalNoteActionType from '../../actions/clinicalNote/clinicalNoteActionType';
import * as commonType from '../../actions/common/commonActionType';
// import * as messageType from '../../actions/message/messageActionType';
// import { COMMON_RESP_MSG_CODE } from '../../../constants/message/moe/commonRespMsgCodeMapping';
import _ from 'lodash';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';

//get template list
function* listClinicalNoteTemplates() {
  while (true) {
    let { templateParams, callback } = yield take(clinicalNoteActionType.GET_TEMPLATE_DATA_LIST);
    let { typeId } = templateParams;
    let apiUrl = `clinical-note/clinicalNoteTemplate?typeId=${typeId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

//get copy data
function* getCopyData() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.GET_COPY_DATA);
    let { patientKey, encounterId, encounterDate, encounterClinic, serviceCd } = params;
    let apiUrl = `clinical-note/clinicalNote/previousDataCopies/${patientKey}?encounterId=${encounterId}&encounterDate=${encounterDate}&encounterClinicCd=${encounterClinic}&serviceCd=${serviceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get Note history list
function* noteHistoryList(action) {
  let { params, callback } = action;
  let { patientKey, tagNoteCheckedFlag } = params;
  let apiUrl = `clinical-note/clinicalNote/history/${patientKey}?showEIN=${tagNoteCheckedFlag}`;
  try {
    let { data } = yield call(axios.get, apiUrl);
    if (data.respCode === 0) {
      let cascadeMap = new Map(); // service <-> (clinic) encounter
      let noteHistorys = data.data.noteHistorys.map((item) => {
        let encounterTypeObj = _.find(data.data.encounterTypes, { clinicCd: item.clinicCd, id: item.encounterTypeId, serviceCd: item.serviceCd });
        let tempArray = cascadeMap.has(item.serviceCd + ',' + item.clinicCd) ? cascadeMap.get(item.serviceCd + ',' + item.clinicCd) : [];
        if (encounterTypeObj != undefined) {
          tempArray.push({ value: encounterTypeObj.id, title: encounterTypeObj.code });
          tempArray = _.uniqWith(tempArray, _.isEqual);
          cascadeMap.set(item.serviceCd + ',' + item.clinicCd, tempArray);
        }
        if (!item.encounterTypeId) {
          tempArray.push({ value: '<Blank>', title: '<Blank>' });
          tempArray = _.uniqWith(tempArray, _.isEqual);
          cascadeMap.set(item.serviceCd + ',' + item.clinicCd, tempArray);
        }
        return {
          ...item,
          encounterTypeShortName: encounterTypeObj != undefined ? encounterTypeObj.code : item.code,
          encounterTypeDescription: encounterTypeObj != undefined ? encounterTypeObj.desc : item.desc
        };
      });
      let noteTypes = [];
      if (data.data.noteTypes) {
        noteTypes = data.data.noteTypes.map((item) => {
          return { value: item.desc, title: item.desc, code: item.code, shortName: item.relatedVal ? item.relatedVal : '' };
        });
      }

      callback &&
        callback({
          noteHistorys,
          noteTypes,
          cascadeMap,
          errMsg: data.errMsg
        });
    } else {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, data, apiUrl);
    }
  } catch (error) {
    yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
  }
}

function* getNoteHistoryList() {
  yield takeLatest(clinicalNoteActionType.GET_NOTE_HISTORY_LIST, noteHistoryList);
}

// get Note by Encounter
function* getNoteByEncounter() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.GET_NOTE_BY_ENCOUNTER);
    let { encounterId, userRoleTypeCd, selectedServiceCd, selectedClinicCd } = params;
    let apiUrl = `clinical-note/clinicalNote/${encounterId}?encntrClinicCd=${selectedClinicCd}&userRoleTypeCd=${userRoleTypeCd}&encntrServiceCd=${selectedServiceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data, data.errMsg);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get Clinical Note Log by Id
function* getNoteLogByClinicalNoteId() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.GET_NOTE_LOG_BY_CLINICAL_NOTE_ID);
    let apiUrl =
      params.logId === null
        ? `clinical-note/clinicalNote/logs?encntrId=${params.encntrId}&svcCd=${params.svcCd}&typeId=${params.typeId}&noteOwner=${params.noteOwner}`
        : `clinical-note/clinicalNote/logs?encntrId=${params.encntrId}&svcCd=${params.svcCd}&typeId=${params.typeId}&noteOwner=${params.noteOwner}&logId=${params.logId}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }

      // if (params.logId === null) {
      //   let { data } = yield call(
      //     axios.get,
      //     '/clinical-note/clinicalNote/logs?encntrId=' +
      //       params.encntrId +
      //       '&svcCd=' +
      //       params.svcCd +
      //       '&typeId=' +
      //       params.typeId +
      //       '&noteOwner=' +
      //       params.noteOwner
      //   );
      //   if (data.respCode === 0) {
      //     callback && callback(data.data);
      //   } else {
      //     yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
      //   }
      // } else {
      //   let { data } = yield call(
      //     axios.get,
      //     '/clinical-note/clinicalNote/logs?encntrId=' +
      //       params.encntrId +
      //       '&svcCd=' +
      //       params.svcCd +
      //       '&typeId=' +
      //       params.typeId +
      //       '&noteOwner=' +
      //       params.noteOwner +
      //       '&logId=' +
      //       params.logId
      //   );
      //   if (data.respCode === 0) {
      //     callback && callback(data.data);
      //   } else {
      //     yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      //     yield call(commonErrorHandler, data, apiUrl);
      //   }
      // }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// save Clinical Note
function* saveClinicalNote() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.SAVE_CLINICAL_NOTE);
    let apiUrl = 'clinical-note/clinicalNote/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// save Clinical Note
function* saveAgainClinicalNote() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.SAVE_AGAIN_CLINICAL_NOTE);
    let apiUrl = 'clinical-note/clinicalNote/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else if (data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_CODE || data.msgCode == commonConstants.COMMON_MESSAGE.CONCURRENT_DELETE_CODE) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// insert clinicalNote log
function* insertClinicalNoteLog() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.INSERT_CLINICAL_NOTE_LOG);
    let apiUrl = 'clinical-note/auditLogs/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* concurrentAccessCheckIn() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.ACCESS_CHECK_IN);
    let apiUrl = 'clinical-note/concurrentAccess/' + params.appCode + '/checkin?encounterId=' + params.encounterId;
    try {
      let { data } = yield call(axios.post, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* concurrentAccessCheckOut() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.CURRENT_ACCESS_CHECK_OUT);
    let apiUrl = 'clinical-note/concurrentAccess/' + params.appCode + '/checkout?encounterId=' + params.encounterId;
    try {
      let { data } = yield call(axios.delete, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* conpastAccessCheckOut() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.PAST_ACCESS_CHECK_OUT);
    let apiUrl = 'clinical-note/concurrentAccess/' + params.appCode + '/checkout?encounterId=' + params.encounterId;
    try {
      let { data } = yield call(axios.delete, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* concurrentAccessResetTimeout() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.ACCESS_RESET_TIMEOUT);
    let apiUrl = 'clinical-note/concurrentAccess/' + params.appCode + '/resetTimeout?encounterId=' + params.encounterId;
    try {
      let { data } = yield call(axios.put, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* listNoteTypes() {
  while (true) {
    let { params, callback } = yield take(clinicalNoteActionType.GET_NOTETYPE_LIST);
    let apiUrl = 'clinical-note/clinicalNoteTemplate/listNoteTypes?serviceCd=' + params.serviceCd;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        callback && callback(data.data);
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const clinicalNoteSaga = [
  listClinicalNoteTemplates(),
  saveClinicalNote(),
  getCopyData(),
  getNoteHistoryList(),
  getNoteByEncounter(),
  getNoteLogByClinicalNoteId(),
  insertClinicalNoteLog(),
  concurrentAccessCheckIn(),
  concurrentAccessCheckOut(),
  concurrentAccessResetTimeout(),
  saveAgainClinicalNote(),
  conpastAccessCheckOut(),
  listNoteTypes()
];
