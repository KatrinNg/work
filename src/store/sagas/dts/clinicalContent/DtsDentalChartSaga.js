import { take, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as dentalChartType from '../../../actions/dts/clinicalContent/DtsDentalChartActionType';
import * as messageType from '../../../actions/message/messageActionType';


function* getDentalChart() {
    while (true) {
        let { encounterId, encounterSdt } = yield take(dentalChartType.GET_DENTAL_CHART);
        let { data } = yield call(maskAxios.get, '/dts-cc/dentalChart/cc/' + encounterId + '/dentalChart/' + encounterSdt);
        //let fakeData = {"data":[ {"toothNo": 13, "imageType": "Caries", "abbrev": "PE", "rootAbbrev": "Implant"}, {"toothNo": 12, "imageType": "Extraction", "abbrev": "IT", "rootAbbrev": "Implant"}] };
        
        //console.log('Info: ' + 1);

        if (data.respCode === 0) {
            //console.log('Info2: ', fakeData);
            //console.log('Info3: ' + JSON.stringify(fakeData));
            //console.log('Info4: ' + JSON.stringify(data));
            console.log('Info5: ', data.data.dspTooth);
            console.log('Info5: ', data.data.remark);
            yield put({
                type: dentalChartType.UPDATE_STATE,
                updateData: { dentalChartList: data.data|| [], dentalChartData: {remark: data.data.remark, dspTooth: data.data.dspTooth}}
            });
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

function* updateDentalChart() {
    while (true) {
        let { dentalChart, callback } = yield take(dentalChartType.UPDATE_DENTAL_CHART);
        //console.log('updateDentalChart1: ', dentalChart);
        let { data } = yield call(maskAxios.put, '/dts-cc/dentalChart/cc/dentalChart', dentalChart);
        if (data.respCode === 0) {
            // yield put({ type: defaultRoomType.SAVE_SUCCESS });
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110023',
                    showSnackbar: true
                }
            });
            callback && callback();
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
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

export const dtsDentalChartSaga = [getDentalChart, updateDentalChart];
