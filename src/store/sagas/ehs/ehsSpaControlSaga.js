import { take, takeLatest, takeEvery, put, putResolve, call, select, all } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as patientSpecFuncActionType from '../../actions/patient/patientSpecFunc/patientSpecFuncActionType';
import * as patientActionType from '../../actions/patient/patientActionType';
import { updateState as updatePatientState, getPatientPUC } from '../../actions/patient/patientAction';
import { getPatientPUCFunc } from '../patient/patientSaga';
import { updatePatientListField } from '../../actions/patient/patientSpecFunc/patientSpecFuncAction';
import { getMedicalSummaryVal } from '../../actions/medicalSummary/medicalSummaryAction';
import * as messageType from '../../actions/message/messageActionType';
import * as PatientUtil from '../../../utilities/patientUtilities';
import _ from 'lodash';
import * as anaService from '../../../services/ana/appointmentService';
import { PATIENT_LIST_SEARCH_NEXT_ACTION } from '../../../enums/enum';
import qs from 'qs';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../als/alsLogSaga';
import Enum from '../../../enums/enum';
import { SiteParamsUtil } from '../../../utilities';
import * as types from '../../actions/ehs/ehsSpaControlActionType';

function* searchPatients() {
    yield takeLatest(types.SEARCH_PATIENTS, function* (action) {
        // let { data } = yield call(maskAxios.post, '/patient/searchPatient', action.params);
        const siteParams = yield select((state) => state.common.siteParams);
        const svcCd = yield select((state) => state.login.service.svcCd);
        const siteId = yield select((state) => state.login.clinic.siteId);
        const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, svcCd, siteId);
        let { params, callback } = action;
        let url = '';
        if (isNewPmiSearchResultDialog) {
            url = '/patient/searchPmi?';
        } else {
            url = '/patient/patients?';
        }
        for (let p in params) {
            url += `${p}=${encodeURIComponent(params[p])}&`;
        }
        url = url.substring(0, url.length - 1);
        // let url = `/patient/patients?searchString=${action.params.searchString}`;
        let { data } = yield call(maskAxios.get, url);
        if (data.respCode === 0) {
            yield put({
                type: types.UPDATE_STATE,
                newState: {
                    patientList: data.data.patientDtos,
                    isOpenSearchPmiPopup: true,
                    patientSearchParam: { searchType: params.docType, searchValue: params.searchString }
                }
            });
            // if (data.data.total > 0) {
            //     yield put({ type: types.UPDATE_STATE, data: data.data, countryList: action.countryList });
            //     // yield put({
            //     //     type: types.UPDATE_STATE,
            //     //     fields: { supervisorsApprovalDialogInfo: { staffId: '', open: false, searchString: '' } }
            //     // });
            // }
            // callback && callback(data.data);
            // else {
            //     const storeWaitDetail = yield select((state) => state.waitingList.waitDetail);
            //     let waitDetail = _.cloneDeep(waitDetailBasic);
            //     let contactPhone = _.cloneDeep(patientPhonesBasic);
            //     const patSearchTypeList = yield select((state) => state.common.patSearchTypeList);
            //     let searchTypeObj = patSearchTypeList.find((item) => item.searchTypeCd === params.docType);
            //     waitDetail.siteId = storeWaitDetail.siteId;
            //     if (searchTypeObj && searchTypeObj.isDocType === 1) {
            //         waitDetail.priDocTypeCd = searchTypeObj.searchTypeCd;
            //         waitDetail.priDocNo = params.searchString;
            //     }
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '115550',
            //             showSnackbar: true
            //         }
            //     });
            //     yield put({
            //         type: types.RE,
            //         siteId: storeWaitDetail.siteId,
            //         encntrTypeId: storeWaitDetail.encntrTypeId
            //     });
            //     yield put({
            //         type: types.UPDATE_FIELD,
            //         fields: { waitDetail, contactPhone, handlingSearch: false, autoFocus: true }
            //     });
            // if(data.data.total===0){
            //     callback&&callback();
            // }
            // }
        } else if (data.respCode === 2) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '130702'
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110148',
                    showSnackbar: true
                }
            });
        } else if (data.respCode === 102) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '130703'
                }
            });
        } else {
            yield put({ type: types.UPDATE_STATE, data: null, countryList: action.countryList });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

export const ehsSpaControlSaga = [searchPatients];
