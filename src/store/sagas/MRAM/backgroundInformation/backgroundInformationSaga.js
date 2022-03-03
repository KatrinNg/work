import { take, call, put } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/MRAM/backgroundInformation/backgroundInformationActionType';
// import * as commonTypes from '../../../actions/common/commonActionType';
// import * as backgroundInformationConstant from '../../../../constants/MRAM/backgroundInformation/backgroundInformationConstant';
import { commonErrorHandler } from '../../../../utilities/josCommonUtilties';

// function generateFieldDefaultVal(mramId) {
//   let val = '';
//   switch (mramId) {
//     case '2':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '13':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '15':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '18':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '20':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '22':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '23':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '28':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     case '34':
//       val = backgroundInformationConstant.ALCOHOL[0].value;
//       break;
//     default:
//       break;
//   }
//   return val;
// }

// function generateFieldValMap() {
//   let backgroundInfoFieldValMap = new Map();
//   //prepare
//   for (let [key, value] of backgroundInformationConstant.MRAM_BACKGROUNDINFOMATION_ID_MAP) {
//     Object.values(value).forEach((element) => {
//       // handle default value
//       let val = generateFieldDefaultVal(element);
//       let fieldId = `${key}_${element}`;
//       backgroundInfoFieldValMap.set(fieldId, {
//         operationType: null,
//         version: null,
//         value: val
//       });
//     });
//   }
//   return backgroundInfoFieldValMap;
// }

function* saveBackgroundInformation() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_BACKGROUND_INFO_DATA);
    let apiUrl = 'mram/SaveMramBkgdInfo';
    try {
      let { data } = yield call(axios.post, apiUrl, params);
      if (data.respCode === 0) {
        yield put({ type: types.SAVE_BACKGROUND_INFO_RESULT, fillingData: data });
        callback && callback(data.data);
      } else {
        yield call(commonErrorHandler, data, apiUrl);
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

function* saveDraftCarePlanInfo() {
  while (true) {
    let { params, callback } = yield take(types.SAVE_CAREPLAN_INFO_DATA);
    let apiUrl = 'mram/saveMramCarePlan';
    try {
      {
        let { data } = yield call(axios.post, '/mram/saveMramCarePlan', params);
        if (data.respCode === 0) {
          yield put({ type: types.SAVE_CAREPLAN_INFO_RESULT, fillingData: data });
          callback && callback(data.data);
        } else {
          yield call(commonErrorHandler, data, apiUrl);
        }
      }
    } catch (error) {
      yield call(commonErrorHandler, { message: error.message ? error.message : 'Service error' }, apiUrl);
    }
  }
}

export const backgroundInformationSaga = [saveBackgroundInformation, saveDraftCarePlanInfo];
