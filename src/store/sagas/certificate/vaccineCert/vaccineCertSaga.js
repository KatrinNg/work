import { takeLatest, take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as type from '../../../actions/certificate/vaccineCert/vaccineCertActionType';
import { PAPER_SIZE_TYPE } from '../../../../enums/enum';
import { print, getPaperSize } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest} from '../../als/alsLogSaga';


function* fetchVaccineCert(action) {
    try {
        const outDocumentTypes = yield select(state => state.common.outDocumentTypes.mySvcList);
        let params = action.params;
        params.outDocTypeId = outDocumentTypes.find(item => item.outDocTypeDesc === 'Vaccination Certificate').outDocTypeId;
        const closeTabFunc = yield select(state => state.vaccineCert.closeTabFunc);
        let { data } = yield call(maskAxios.post, '/clinical-doc/vaccinationCertificate', params);
        if (data.respCode === 0) {
            if (closeTabFunc){
                closeTabFunc(true);
            } else {
                // yield print({ base64: data.data, callback: action.callback, copies: action.copies });
                // const tray = getPrinterTray(PRINTER_TRAY_TYPE.VACC);
                const paperSize = getPaperSize(PAPER_SIZE_TYPE.VACC);
                const reqParams={
                    base64: data.data,
                    callback: action.callback,
                    copies: action.copies,
                    // printTray: tray || null,
                    paperSize: paperSize || -1
                };

                yield print(reqParams);
            }
        } else if(data.respCode === 3){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
            yield put({
                type: type.UPDATE_FIELD,
                updateData: { handlingPrint: false }
            });
        } else{
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put({
                type: type.UPDATE_FIELD,
                updateData: { handlingPrint: false }
            });
        }
    } catch (error) {
        yield put({
            type: type.UPDATE_FIELD,
            updateData: { handlingPrint: false }
        });
        throw error;
    }
}

function* getVaccineCert() {
    yield alsTakeLatest(type.SAVE_AND_PRINT_CERT, fetchVaccineCert);
}

function* listVaccineCertificates() {
    while (true) {
        try {
            let { params, callback } = yield take(type.LIST_VACCINE_CERT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/clinical-doc/vaccinationCertificate?patientKey='+ params.patientKey + '&from=' + params.from + '&to=' + params.to + '&svcCd=' + params.svcCd + '&siteId=' + params.siteId);
            if (params.siteId !== '') {
                data.data = (data.data || []).filter(item => item.siteId === params.siteId);
            }
            if (data.respCode === 0) {
                yield put({
                    type: type.PUT_LIST_VACCINE_CERT,
                    data: data.data
                });
                callback && callback(data.data);
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

function* fetchupdateVaccineCertificate(action) {
    let { data } = yield call(maskAxios.put, '/clinical-doc/vaccinationCertificate', action.params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110612',
                showSnackbar:true
            }
        });
        const closeTabFunc = yield select(state => state.vaccineCert.closeTabFunc);
        if(closeTabFunc){
            closeTabFunc(true);
        } else {
            action.callback && action.callback();
        }
    } else if (data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032'
            }
        });
    }else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* updateVaccineCertificate() {
    yield alsTakeLatest(type.UPDATE_VACCINE_CERT, fetchupdateVaccineCertificate);
}

export const vaccineCertSaga = [
    getVaccineCert,
    listVaccineCertificates,
    updateVaccineCertificate
];
