import { call, put, select, takeLatest } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as bannerActionType from '../../actions/patient/bannerActionType';
import * as patientActionType from '../../actions/patient/patientActionType';
import * as messageType from '../../actions/message/messageActionType';
import moment from 'moment';

export function* getGravidaAndParityFunc({ patientKey }) {
    let success = false;
    if (patientKey != null) {
        let { data } = yield call(maskAxios.get, `/fhs-consultation/pastObstetricHistory/getGravidaAndParityByPatientKey/${patientKey}`);
        if (data.respCode === 0) {
            yield put({ type: patientActionType.PUT_PATIENT_BANNER_DATA, data: { gravidaAndParity: data.data } });
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
        yield put({ type: patientActionType.PUT_PATIENT_BANNER_DATA, data: { gravidaAndParity: null } });
    }
}

function* getGravidaAndParity() {
    yield takeLatest(bannerActionType.GET_GRAVIDA_AND_PARITY, function* (action) {
        yield call(getGravidaAndParityFunc, action);
    });
}

export function* getAntSvcIdInfoLogFunc({ clcAntId }) {
    let success = false;
    if (clcAntId) {
        let { data } = yield call(maskAxios.get, '/patient/antCaseInfoLog', { params: { clcAntId } });
        if (data.respCode === 0) {
            let isWrkEdcModified = !!(data.data?.filter(x => moment(x.wrkEdc).isValid()).map(x => moment(x.wrkEdc).format('YYYY-MM-DD')).filter((x, i, a) => a.indexOf(x) === i).length > 1);
            yield put({ type: patientActionType.PUT_PATIENT_BANNER_DATA, data: { isWrkEdcModified } });
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
        yield put({ type: patientActionType.PUT_PATIENT_BANNER_DATA, data: { isWrkEdcModified: false } });
    }
}

function* getAntSvcIdInfoLog() {
    yield takeLatest(bannerActionType.GET_ANT_SVC_ID_INFO_LOG, function* (action) {
        yield call(getAntSvcIdInfoLogFunc, action);
    });
}

export const bannerSaga = [
    getGravidaAndParity,
    getAntSvcIdInfoLog
];