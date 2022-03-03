import { take, call, put } from 'redux-saga/effects';
import * as manageTagaNoteTemplateActionType from '../../actions/tagaNoteTemplate/manageTagaNoteTemplateActionType';
import * as commonType from '../../actions/common/commonActionType';
import { axios } from '../../../services/axiosInstance';
import { commonErrorHandler } from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';
import { useroIsServiceAdminSetting } from '../../../utilities/userUtilities';
import { TAGA_NOTE_TEMPLATE_TYPE } from '../../../constants/clinicalNote/tagaNoteConstants';

function* requestFavouriteList() {
  while (true) {
    let { params } = yield take(manageTagaNoteTemplateActionType.REQUEST_DATA);
    let apiUrl = 'clinical-note/codeList/codeTaganoteTemplateType';
    try {
      {
        let { data } = yield call(axios.get, apiUrl, params);
        if (data.respCode === 0) {
          let favoriteList = [];
          if (!useroIsServiceAdminSetting()) {
            favoriteList = data.data.filter((item) => {
              return item.codeTaganoteTmplTypeCd != TAGA_NOTE_TEMPLATE_TYPE.SERVICE_FAVOURITE;
            });
          } else {
            favoriteList = data.data;
          }
          yield put({ type: manageTagaNoteTemplateActionType.FILLING_DATA, fillingData: favoriteList });
        } else {
          yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
          yield call(commonErrorHandler, data, apiUrl);
        }
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* requestTaganoteTypeList() {
  while (true) {
    let { callback } = yield take(manageTagaNoteTemplateActionType.FETCH_TAGANOTE_TYPE_LIST);
    let apiUrl = 'clinical-note/taganoteTemplate/taganoteTemplateType';
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({ type: manageTagaNoteTemplateActionType.SET_TAGANOTE_TYPE_LIST, fillingData: data });
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

function* requestTemplateList() {
  while (true) {
    let { params, callback } = yield take(manageTagaNoteTemplateActionType.TEMPLATE_DATA);
    let { tagaNoteTmplType } = params;
    let apiUrl = `clinical-note/taganoteTemplate/${tagaNoteTmplType}`;
    try {
      let { data } = yield call(axios.get, apiUrl);
      if (data.respCode === 0) {
        yield put({ type: manageTagaNoteTemplateActionType.PUTTEMPLATELIST_DATA, fillingData: data });
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

function* deleteTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageTagaNoteTemplateActionType.DELETETEMPLATE_DATA);
    let apiUrl = 'clinical-note/taganoteTemplate/';
    try {
      let { data } = yield call(axios.delete, apiUrl, { data: params });
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      if (data.respCode === 0 || data.respCode === 1) {
        yield put({ type: manageTagaNoteTemplateActionType.DELETETEMPLATE_RESULT, fillingData: data });
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

function* recordTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageTagaNoteTemplateActionType.RECORDLIST_DATA);
    let apiUrl = 'clinical-note/taganoteTemplate/reorder';
    try {
      {
        let { data } = yield call(axios.patch, apiUrl, params);
        if (data.respCode === 0) {
          yield put({ type: manageTagaNoteTemplateActionType.RECORDLIST_RESULT, fillingData: data });
          callback && callback(data);
        } else {
          if (data.msgCode !== undefined && data.msgCode !== null) {
            callback && callback(data);
          } else {
            yield call(commonErrorHandler, data, apiUrl);
          }
        }
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* checkTemplateNameData() {
  while (true) {
    let { params, callback } = yield take(manageTagaNoteTemplateActionType.CHECKTEMPLATENAMEREPEAT_DATA);
    let { insertTemplateDto } = params;
    let { codeTaganoteTmplTypeCd, templateName, taganoteTemplateId } = insertTemplateDto;
    let apiUrl = `clinical-note/taganoteTemplate/duplicationChecking?codeTaganoteTmplTypeCd=${codeTaganoteTmplTypeCd}&templateName=${templateName}&taganoteTemplateId=${taganoteTemplateId}`;
    try {
      // let data = yield call(API_addTemplateData,params);
      let { data } = yield call(axios.get, apiUrl);
      callback && callback(data);
    } catch (error) {
      yield put({
        type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG,
        status: 'close'
      });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* addTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageTagaNoteTemplateActionType.ADDTEMPLATE_DATA);
    let apiUrl = 'clinical-note/taganoteTemplate/';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      if (data.respCode === 0) {
        yield put({ type: manageTagaNoteTemplateActionType.ADDTEMPLATE_RESULT, fillingData: data });
        callback && callback(data);
      } else if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
        callback && callback(data);
      } else if (data.respCode === 11) {
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

function* editTemplateData() {
  while (true) {
    let { params, callback } = yield take(manageTagaNoteTemplateActionType.EDITTEMPLATE_DATA);
    let { insertTemplateDto } = params;
    let apiUrl = 'clinical-note/taganoteTemplate/';
    try {
      {
        let { data } = yield call(axios.put, apiUrl, insertTemplateDto);
        yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
        if (data.respCode === 0) {
          yield put({ type: manageTagaNoteTemplateActionType.EDITTEMPLATE_RESULT, fillingData: data });
          callback && callback(data);
        } else if (data.respCode === 11 || data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          callback && callback(data);
        } else {
          yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
          yield call(commonErrorHandler, data, apiUrl);
        }
      }
    } catch (error) {
      yield put({ type: commonType.CLOSE_COMMON_CIRCULAR_DIALOG });
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}
export const manageTagaNoteTemplateSaga = [
  requestFavouriteList(),
  requestTemplateList(),
  requestTaganoteTypeList(),
  deleteTemplateData(),
  recordTemplateData(),
  addTemplateData(),
  editTemplateData(),
  checkTemplateNameData()
];
