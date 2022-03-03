import { call, put } from 'redux-saga/effects';
import * as defaulterTracingType from '../../actions/defaulterTracing';
import * as messageType from '../../actions/message/messageActionType';
import { maskAxios } from '../../../services/axiosInstance';
import { alsTakeLatest } from '../als/alsLogSaga';
import Enum from '../../../enums/enum';


const sppDfltCntctHxUrl='patient/PmiSppDfltCntctHx';

function* getPatientTransferList() {
    yield alsTakeLatest(defaulterTracingType.GET_DEFAULTER_TRACING_LIST, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.post, '/patient/spp/defaulters', params);
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}

function* sppDfltCntctHx() {
    yield alsTakeLatest(defaulterTracingType.SPP_DFLT_CNTCT_HX, function* (action) {
        const { opType, params, callback } = action;
        if (opType === Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.LIST) {
            //list contact history
            let url = `${sppDfltCntctHxUrl}/${params}`;
            let { data } = yield call(maskAxios.get, url);
            if (data.respCode === 0) {
                callback && callback(data.data);
            }
        }
        else if (opType === Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.ADD) {
            let { data } = yield call(maskAxios.post, sppDfltCntctHxUrl, params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110021',
                        showSnackbar: true
                    }
                });
                callback && callback();
            }
        } else if (opType === Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.UPDATE) {
            let { data } = yield call(maskAxios.put, sppDfltCntctHxUrl, params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110023',
                        showSnackbar: true
                    }
                });
                callback && callback();
            }
        } else if (opType === Enum.SPP_DLFT_TRC_CNCT_HX_OP_TYPE.DEL) {
            let url = `${sppDfltCntctHxUrl}/${params}`;
            let { data } = yield call(maskAxios.delete, url);
            if(data.respCode===0){
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110068',
                        showSnackbar: true
                    }
                });
                callback && callback();
            }
        }
    });
}

function* getSppTeam() {
    yield alsTakeLatest(defaulterTracingType.GET_SPP_TEAM, function* (action) {
        const { callback } = action;
        let { data } = yield call(maskAxios.get, '/cmn/codeLists?codeType=spp_team');
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}



export const defaulterTracingSagas = [
    getPatientTransferList,
    sppDfltCntctHx,
    getSppTeam
];