import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../services/axiosInstance';
import * as type from '../../actions/medicalHistories/medicalHistoriesActionType';
import * as commonType from '../../actions/common/commonActionType';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';

// get occupational history
function* getOccupationalHistoryList() {
  while (true) {
    let { params, callback } = yield take(type.GET_OCCUPATIONAL_HISTORY_LIST);
    let { patientKey } = params;
    delete params.patientKey;
    let apiUrl = `medical-summary/occupationalHistory/${patientKey}`;
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get occupational log
function* getOccupationalLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_OCCUPATIONAL_LOG_LIST);
    let { patientKey } = params;
    let apiUrl = `medical-summary/occupationalHistory/${patientKey}/occupationalHistoryLog`;
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

// get occupational others log
function* getOccupationalOthersLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_OCCUPATIONAL_OTHERS_LOG_LIST);
    let { patientKey } = params;
    let apiUrl = `medical-summary/occupationalHistory/${patientKey}/occupationalOthersLog`;
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

function* getSocialDropdownList() {
  while (true) {
    let { callback } = yield take(type.GET_SOCIAL_DROPDOWN_LSIT);
    let apiUrl = 'medical-summary/codeMs/getSocialHistoryCode';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        let { container, status, Drinking, Substance, Smoking, PassiveSmkLocation } = data.data;
        let socialHistoryType = {
          smokingId: Smoking.codeSocialHistoryTypeId,
          drinkingId: Drinking.codeSocialHistoryTypeId,
          substanceAbuseId: Substance.codeSocialHistoryTypeId
        };
        yield put({
          type: type.SET_SOCIAL_DROPDOWN_LSIT,
          socialHistoryType
        });

        if (status.length > 0) {
          status.forEach((item) => {
            item.label = item.socialHistoryStatusDescription;
            item.value = item.socialHistoryStatusCd;
          });
        }
        if (container.length > 0) {
          container.forEach((item) => {
            item.label = item.container;
            item.value = item.codeContainerId;
          });
        }
        if (PassiveSmkLocation.length > 0) {
          PassiveSmkLocation.forEach((item) => {
            item.label = item.name;
            item.value = item.codRlatTypeId;
          });
        }
        if (Drinking.contents.length > 0) {
          Drinking.contents.forEach((item) => {
            item.label = `${item.socialHistorySubtypeEngDesc} ${item.socialHistorySubtypeChiDesc}`;
            item.value = item.socialHistorySubtypeId;
          });
        }
        if (Smoking.contents.length > 0) {
          Smoking.contents.forEach((item) => {
            item.label = `${item.socialHistorySubtypeEngDesc} ${item.socialHistorySubtypeChiDesc}`;
            item.value = item.socialHistorySubtypeId;
          });
        }
        if (Substance.contents.length > 0) {
          Substance.contents.forEach((item) => {
            item.label = `${item.socialHistorySubtypeEngDesc} ${item.socialHistorySubtypeChiDesc}`;
            item.value = item.socialHistorySubtypeId;
          });
        }

        let typeOptionMap = new Map();
        typeOptionMap.set(socialHistoryType.smokingId, Smoking.contents);
        typeOptionMap.set(socialHistoryType.drinkingId, Drinking.contents);
        typeOptionMap.set(socialHistoryType.substanceAbuseId, Substance.contents);

        let statusOptions = status;
        let containerOptions = container;
        let passiveOptions = PassiveSmkLocation;
        callback &&
          callback({
            typeOptionMap,
            statusOptions,
            containerOptions,
            passiveOptions
          });
      } else {
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

// get past histroy terminology service list
function* getPastTerminologyServiceList() {
  while (true) {
    let { params, callback } = yield take(type.GET_PAST_TERMINOLOGY_SERVICE_LIST);
    let { serviceCd } = params;
    delete params.serviceCd;
    let apiUrl = `medical-summary/terminologyService/getTerminologyServiceList/${serviceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get family histroy terminology service list
function* getFamilyTerminologyServiceList() {
  while (true) {
    let { params, callback } = yield take(type.GET_FAMILY_TERMINOLOGY_SERVICE_LIST);
    let { serviceCd } = params;
    delete params.serviceCd;
    let apiUrl = `medical-summary/terminologyService/getTerminologyServiceList/${serviceCd}`;
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// fuzzy query problem
function* queryProblemList() {
  while (true) {
    let { params, callback } = yield take(type.FUZZY_QUERY_PROBLEM_LIST);
    let { start, end, diagnosisText } = params;
    let apiUrl = `diagnosis/codeList/codeDxpxTermByG/page/?start=${start}&end=${end}&diagnosisText=${unescape(encodeURIComponent(diagnosisText))}`;
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

// get family relationship list
function* getFamilyRelationshipList() {
  while (true) {
    let { callback } = yield take(type.GET_FAMILY_RELATIONSHIP_LIST);
    let apiUrl = 'medical-summary/codeMs/getMsFamilyRltCode';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        if (data.data.length > 0) {
          data.data.forEach((element) => {
            element.label = element.rltDesc;
            element.value = element.rltCd;
          });
        }
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

// get family history
function* getFamilyHistoryList() {
  while (true) {
    let { params, callback } = yield take(type.GET_FAMILY_HISTORY_LIST);
    let apiUrl = 'medical-summary/familyHistory/getFamilyHistoryList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get family history problem detail log
function* getFamilyHistoryProblemDetailLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_FAMILY_HISTORY_PROBLEM_DETAIL_LOG_LIST);
    let apiUrl = 'medical-summary/familyHistory/getFamilyDetailLogList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get family history others log
function* getFamilyHistoryOthersLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_FAMILY_HISTORY_OTHERS_LOG_LIST);
    let apiUrl = 'medical-summary/familyHistory/getOthersLogList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
      if (data.respCode === 0) {
        if (data.data.length > 0) {
          data.data.forEach((itemObj) => {
            itemObj.others = itemObj.details; // convert details to others
            delete itemObj.details;
          });
        }
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

// get past medical history list
function* getPastHistoryList() {
  while (true) {
    let { params, callback } = yield take(type.GET_PAST_HISTORY_LIST);
    let apiUrl = 'medical-summary/pastMedHistory/getMsPastMedHistoryList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get past medical history problem detail log
function* getPastHistoryProblemDetailLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_PAST_HISTORY_PROBLEM_DETAIL_LOG_LIST);
    let apiUrl = 'medical-summary/pastMedHistory/getMsPastMedDetailsLogList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get social history common log
function* getSocialHistoryCommonLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_SOCIAL_HISTORY_COMMON_LOG_LIST);
    let apiUrl = 'medical-summary/socialHistory/getSocialLogList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get Social History Passive Smoking Information Log
function* getSocialHistoryPassiveSmokingInformationLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_SOCIAL_HISTORY_PASSIVE_SMOKING_INFORMATION_LOG_LIST);
    let apiUrl = 'medical-summary/socialHistory/passiveSmoking/logs';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get social history others log
function* getSocialHistoryOthersLogList() {
  while (true) {
    let { params, callback } = yield take(type.GET_SOCIAL_HISTORY_OTHERS_LOG_LIST);
    let apiUrl = 'medical-summary/socialHistory/getSocialOthersLogList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// get social history list
function* getSocialHistoryList() {
  while (true) {
    let { params, callback } = yield take(type.GET_SOCIAL_HISTORY_LIST);
    let apiUrl = 'medical-summary/socialHistory/getSocialHisotryList';
    try {
      let { data } = yield call(axios.get, apiUrl, { params: params });
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

// save medical history
function* saveMedicalHistory() {
  while (true) {
    let { params, callback } = yield take(type.SAVE_MEDICAL_HISTORY);
    let apiUrl = 'medical-summary/globalSaveMedicalHisoty/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      // let { data } = yield call(axios.post,'/medical-summary/familyHistory/', params);
      // let { data } = yield call(axios.post,'/medical-summary/occupationalHistory/', params);
      // let { data } = yield call(axios.post,'/medical-summary/pastMedHistory/', params);
      // let { data } = yield call(axios.post,'/medical-summary/socialHistory/', params);
      if (data.respCode === 0) {
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
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

export const medicalHistoriesSaga = [
  getOccupationalHistoryList(),
  getOccupationalLogList(),
  getOccupationalOthersLogList(),
  getSocialDropdownList(),
  getPastTerminologyServiceList(),
  queryProblemList(),
  getFamilyRelationshipList(),
  getFamilyTerminologyServiceList(),
  saveMedicalHistory(),
  getFamilyHistoryList(),
  getFamilyHistoryProblemDetailLogList(),
  getFamilyHistoryOthersLogList(),
  getPastHistoryList(),
  getPastHistoryProblemDetailLogList(),
  getSocialHistoryCommonLogList(),
  getSocialHistoryOthersLogList(),
  getSocialHistoryList(),
  getSocialHistoryPassiveSmokingInformationLogList()
];
