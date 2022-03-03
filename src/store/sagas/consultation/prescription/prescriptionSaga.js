import * as prescriptionActionTypes from '../../../actions/consultation/prescription/prescriptionActionType';
import {
    take,
    takeLatest,
    call,
    put
} from 'redux-saga/effects';
import axiosMoe from '../../../../services/moeAxiosInstance';
import * as commonType from '../../../actions/common/commonActionType';

function* fetchSearchDrug(action) {
    let { data } = yield call(axiosMoe.post, '/moe/listDrugSuggest', action.params);
    if (data.respCode === 0) {
        yield put({ type: prescriptionActionTypes.SEARCH_DRUG_LIST, data: data.data });
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: data.errMsg ? data.errMsg : 'Service error',
            data: data.data
        });
    }
}

function* searchDrug() {
    yield takeLatest(prescriptionActionTypes.SEARCH_DRUG, fetchSearchDrug);
}

function* getCodeList() {
    while (true) {
        let { params } = yield take(prescriptionActionTypes.GET_CODE_LIST);
        let { data } = yield call(axiosMoe.post, '/moe/listCodeList', params);
        if (data.respCode === 0) {
            yield put({ type: prescriptionActionTypes.CODE_LIST, data: data.data });
        } else {
            yield put({
                type: commonType.OPEN_ERROR_MESSAGE,
                error: data.errMsg ? data.errMsg : 'Service error',
                data: data.data
            });
        }
    }
}

// function* fetchGetGrugByid(action){
//     try{
//         // let {data}=yield call(axios.post,'',action.item.id);
//         // if(data.respCode===0){
//             yield put({ type: prescriptionActionTypes.GRUG_RESPONSE, data: null });
//         // }else{
//         //     yield put({
//         //         type: commonType.OPEN_ERROR_MESSAGE,
//         //         error: data.errMsg ? data.errMsg : 'Service error',
//         //         data: data.data
//         //     });
//         // }
//     }catch(error){
//         console.log(error);
//     }
// }

// function* getGrugByid(){
//     yield takeLatest(prescriptionActionTypes.GET_DRUG,fetchGetGrugByid);
// }

// function* getGrugByid(){
// while(true){
//     try{
//         // let {item}=yield take(prescriptionActionTypes.GET_DRUG);
//         // let { data } = yield call(axios.post, '', { patientKey: item.id });
//         // if (data.respCode === 0) {
//             yield put({ type: prescriptionActionTypes.GRUG_RESPONSE, data: null });
//         // } else {
//         //     yield put({
//         //         type: commonType.OPEN_ERROR_MESSAGE,
//         //         error: data.errMsg ? data.errMsg : 'Service error',
//         //         data: data.data
//         //     });
//         // }
//     }catch(error){
//         console.log(error);
//     }
// }
// }

export const prescriptionSaga = [
    searchDrug,
    // getGrugByid,
    getCodeList
];