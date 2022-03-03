import { call, put, select, takeLatest } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as actionType from '../../actions/saam/saamPatientActionType';
import * as messageType from '../../actions/message/messageActionType';
import * as CommonUtilities from '../../../utilities/commonUtilities';

function* getSaamPatientSummaryImpl(action) {
    const clinicConfig = yield select(state => state.common.clinicConfig);
    const svcCd = yield select(state => state.login.service.svcCd);
    const siteId = yield select(state => state.login.clinic.siteId);
    const siteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'SAAM_API_PREFIX');
    let prefix = (siteParam && siteParam.configValue) || '/';
    // console.log('API prefix', prefix);
    let { data } = yield call(maskAxios.post, '/saam' + prefix + 'SAAMService/patient/getPatientSummaryByPatientRefKey', action.params);
    if (data.respCode === '0') {
        let { patientAdrList, patientAlertList, patientAllergyList } = data;
        yield put({ type: actionType.PUT_PATIENT_SUMMARY, data: { patientAdrList, patientAlertList, patientAllergyList } });
    } else {
        yield put({ type: actionType.PUT_PATIENT_SUMMARY, data: null });
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getSaamPatientSummary() {
    yield takeLatest(actionType.GET_PATIENT_SUMMARY, getSaamPatientSummaryImpl);
}

export const saamPatientSaga = [
    getSaamPatientSummary
];