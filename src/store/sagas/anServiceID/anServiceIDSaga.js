import { take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as anServiceIDActionType from '../../actions/anServiceID/anServiceID';
import * as messageType from '../../actions/message/messageActionType';
//import { antenatalInfo } from '../../reducers/anServiceID/anServiceIDReducer';
import { alsTakeLatest } from '../als/alsLogSaga';

function* getDeliveryHospital() {
    yield alsTakeLatest(anServiceIDActionType.GET_DELIVERY_HOSPITAL, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/cmn/hospitalWithRlat', { params });
        if (data.respCode === 0) {
            // yield put({
            //     type: anServiceIDActionType.PUT_DELIVERY_HOSPITAL,
            //     data: data.data
            // });
            // yield put({
            //     type: patientType.PUT_DELIVERY_HOSPITAL,
            //     data: data.data
            // });
            callback && callback(data.data);
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

function* getCaseStsChangeRsns() {
    yield alsTakeLatest(anServiceIDActionType.GET_CASE_STS_CHANGE_REASONS, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/patient/modifyCaseRsns', { params });
        if (data.respCode === 0) {
            // yield put({
            //     //type: anServiceIDActionType.PUT_CASE_STS_CHANGE_REASONS,
            //     type: patientType.PUT_CASE_STS_CHANGE_REASONS,
            //     data: data.data
            // });
            // yield put({
            //     type: anServiceIDActionType.PUT_CASE_STS_CHANGE_REASONS,
            //     //type:patientType.PUT_CASE_STS_CHANGE_REASONS,
            //     data: data.data
            // });
            callback && callback(data.data);
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



function* saveAnSvcIdInfo() {
    yield alsTakeLatest(anServiceIDActionType.SAVE_AN_SERVICE_ID_INFO, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.post, '/patient/saveSpcCase', params);
        if (data.respCode === 0) {
            //do something.
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110021',
                    showSnackbar: true
                }
            });
            // yield put({
            //     type: anServiceIDActionType.UPDATE_STATE,
            //     updateData: {
            //         anSvcIdDialogSts: false
            //     }
            // });
            // const patientInfo = yield select(state => state.patient.patientInfo);
            // const svcCd = yield select(state => state.login.service.svcCd);
            // yield put({
            //     type: REFRESH_AN_SERVICE_ID_INFO,
            //     params: { patientKey: patientInfo.patientKey, svcCd: svcCd }
            // });
            callback && callback(data.data && data.data.clcAntDto);
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110161'
                }
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110160'
                }
            });
        } else if (data.respCode === 102) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110158'
                }
            });
        } else if (data.respCode === 103) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110159'
                }
            });
        } else if(data.respCode===104){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110140'
                }
            });
        } else if(data.respCode===105){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110153'
                }
            });
        }else if(data.respCode===106){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110162'
                }
            });
        }else if(data.respCode===107){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110165'
                }
            });
        }else if(data.respCode===108){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110164'
                }
            });
        }else if(data.respCode===109){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110166'
                }
            });
        }
    });
}

function* modifyAnSvcIdInfo() {
    yield alsTakeLatest(anServiceIDActionType.MODIFY_AN_SERVICE_ID_INFO, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.put, '/patient/modifySpcCase', params);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });
            // yield put({
            //     type: anServiceIDActionType.UPDATE_STATE,
            //     updateData: {
            //         anSvcIdDialogSts: false
            //     }
            // });
            // const patientInfo = yield select(state => state.patient.patientInfo);
            // const svcCd = yield select(state => state.login.service.svcCd);
            // yield put({
            //     type: REFRESH_AN_SERVICE_ID_INFO,
            //     params: { patientKey: patientInfo.patientKey, svcCd: svcCd }
            // });
            callback && callback();
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        }else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110158'
                }
            });
            // } else if (data.respCode === 101) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110159'
            //         }
            //     });
        } else if (data.respCode === 102) {
            //deceased patient.
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110159'
                }
            });
        } else if (data.respCode === 103) {
            //case not existed.
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110043'
                }
            });
        } else if(data.respCode===104){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110140'
                }
            });
        } else if(data.respCode===105){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110153'
                }
            });
            // yield put({
            //     type: messageType.OPEN_COMMON_MESSAGE,
            //     payload: {
            //         msgCode: '110042',
            //         params: [{ name: 'CASE_STATUS', value: _.toLower(case_status) }]
            //     }
            // });
        }else if(data.respCode===106){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110162'
                }
            });
        }
        else if(data.respCode===107){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110165'
                }
            });
        }else if(data.respCode===108){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110164'
                }
            });
        }else if(data.respCode===109){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110166'
                }
            });
        }
    });
}

function* listAntSvcInfoLog() {
    yield alsTakeLatest(anServiceIDActionType.LIST_ANT_SVC_ID_INFO_LOG, function* (action) {
        let { params, callback } = action;
        let { data } = yield call(maskAxios.get, '/patient/antCaseInfoLog', {params});
        if (data.respCode === 0) {
            // yield put({
            //     type:anServiceIDActionType
            // })
            callback&&callback(data.data);
        }
    });
}

export const anServiceIDSaga = [
    getDeliveryHospital,
    getCaseStsChangeRsns,
    saveAnSvcIdInfo,
    modifyAnSvcIdInfo,
    listAntSvcInfoLog
];