import { take, call, put } from 'redux-saga/effects';
import axiosMoe from '../../../../services/moeAxiosInstance';
import * as moeActionTypes from '../../../actions/moe/moeActionType';
// import * as commonTypes from '../../../actions/common/commonActionType';
import * as drugHistoryUtilities from '../../../../utilities/moe/drugHistoryUtilities';
import * as moeSaga from '../moeSaga';

function* getDrugHistoryList() {
    while (true) {
        let { params } = yield take(moeActionTypes.FILTER_DRUG_HISTORY_PARAMS);
        yield call(moeSaga.commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/listDrugHistory', params);
            if (data.respCode === 0) {
                let updateDrugHistoryData = {};
                updateDrugHistoryData.drugHistoryList = drugHistoryUtilities.getDrugHistoryListForUI(data.data);
                yield put({ type: moeActionTypes.UPDATE_DRUG_HISTORY_FIELD, updateData: updateDrugHistoryData });
            } else {
                yield call(moeSaga.commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         let updateDrugHistoryData = {};
            //         updateDrugHistoryData.drugHistoryList = drugHistoryUtilities.getDrugHistoryListForUI(data.data);
            //         yield put({ type: moeActionTypes.UPDATE_DRUG_HISTORY_FIELD, updateData: updateDrugHistoryData });
            //         break;
            //     }
            //     default: {
            //         yield call(moeSaga.commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

export const drugHistorySaga = [
    getDrugHistoryList
];