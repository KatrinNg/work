import { take, call, put, select, all } from 'redux-saga/effects';
import * as perioChartActionType from '../../../actions/dts/clinicalContent/perioChartActionType';
import { maskAxios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';

function* getPerioChartDataCollectionByPatientKey_saga() {

    while(true){
        let { params } = yield take(perioChartActionType.GET_PERIOCHART_DATA_COLLECTION_SAGA);
        console.log('dtsPerioChartSaga.js > getPerioChartHistDataByPatientKey() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-cc/perio-chart/data-collection-byPatientKey', {
            params:{
                patientKey: params.patientKey,
                sRow: params.sRow,
                eRow: params.eRow
            }
        });

        if (data.respCode === 0) {
            let pcData = data.data;
            yield put({ type: perioChartActionType.PERIOCHART_DATA_COLLECTION, params:pcData});
            
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

function* updatePerioChartData_saga() {

    while(true){
        let { params } = yield take(perioChartActionType.UPDATE_PERIOCHART_DATA_SAGA);
        console.log('dtsPerioChartSaga.js > updatePerioChartData() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.put, '/dts-cc/perio-chart/data', params);

        if (data.respCode === 0) {
            let pcData = data.data;
            yield put({ type: perioChartActionType.SET_PERIOCHART_CALLBACK, params:true});
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    }
}

export const perioChartSaga = [updatePerioChartData_saga, getPerioChartDataCollectionByPatientKey_saga];
