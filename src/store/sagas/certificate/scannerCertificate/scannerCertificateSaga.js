import { call, put, select, take } from 'redux-saga/effects';
import * as scannerCertificateActionType from '../../../actions/certificate/scannerCertificate/scannerCertificateActionType';
import { axios } from '../../../../services/axiosInstance';
import * as commonType from '../../../actions/common/commonActionType';
import {alsTakeLatest} from '../../als/alsLogSaga';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';

function* getAllDocListForScanner(action) {
    const {callback} = action;
    const svcCd = yield select(state => state.login.service.svcCd);
    const patientKey = yield select(state => state.patient.patientInfo.patientKey);

    let {data} = yield call(axios.get, `/doc-upload/docUpload/${svcCd}/documents/${patientKey}`);

    if (data.respCode === 0) {
        // Put the date to Redux
        yield put({type: scannerCertificateActionType.UPDATE_SCANNER_DOC_LIST, data: data.data.filter(data => data.docSts !== 'C' && data.src !== 'O')});

        callback && callback(data.data);
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: data.errMsg ? data.errMsg : 'Service error',
            data: data.data
        });
    }
}

function* triggerGetAllDocListForScanner() {
    yield alsTakeLatest(scannerCertificateActionType.GET_ALL_DOCLIST_FOR_SCANNER, getAllDocListForScanner);
}

function* updateHistoryContainerOpenClose(action) {
    const {open} = action;
    yield put({type: scannerCertificateActionType.PUT_HISTORY_CONTAINER_OPEN_CLOSE, open: open});
}

function* triggerUpdateHistoryContainerOpenClose() {
    yield alsTakeLatest(scannerCertificateActionType.UPDATE_HISTORY_CONTAINER_OPEN_CLOSE, updateHistoryContainerOpenClose);
}

function* triggerCloseScannerHistory() {
    try{
        yield take(scannerCertificateActionType.CLOSE_SCANNER_HISTORY);
        yield put(alsStartTrans());
        yield put({ type: scannerCertificateActionType.CLOSE_SCANNER_HISTORY });
    }finally{
        yield put(alsEndTrans());
    }
}

export const scannerCertificateSaga = [
    triggerCloseScannerHistory,
    triggerGetAllDocListForScanner,
    triggerUpdateHistoryContainerOpenClose
];
