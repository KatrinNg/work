import { take, call, put } from 'redux-saga/effects';
import * as assessmentActionType from '../../../actions/dts/clinicalContent/assessmentActionType';
import { maskAxios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';

function* getAssessment_saga() {

    while(true){
        let { params } = yield take(assessmentActionType.GET_ASSESSMENT_SAGA);
        console.log('assessmentSaga.js > getAssessment_saga() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-cc/assessment/data', {
            params:{
                encntrId: params.encntrId
            }
        });

        if (data.respCode === 0) {
            let aData = data.data;
            yield put({ type: assessmentActionType.ASSESSMENT_DATA, params:aData});
            
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

function* getAssessmentEncntrByPatientKey_saga() {

    while(true){
        let { params } = yield take(assessmentActionType.GET_ASSESSMENT_ENCNTR_SAGA);
        console.log('assessmentSaga.js > getAssessmentEncntrIdByPatientKey_saga() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-cc/assessment/data-collection-byPatientKey', {
            params:{
                patientKey: params.patientKey,
                sRow: params.sRow,
                eRow: params.eRow
            }
        });

        if (data.respCode === 0) {
            let pcData = data.data;
            yield put({ type: assessmentActionType.ASSESSMENT_ENCNTR_DATA, params:pcData});
            
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

function* updateAssessment_sage() {

    while(true){
        let { params } = yield take(assessmentActionType.UPDATE_ASSESSMENT_SAGA);
        console.log('assessmentSaga.js > updateAssessment_sage() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.put, '/dts-cc/assessment/data', params.clcDtpDto);

        if (data.respCode === 0) {
            let data = data.data;
            yield put({ type: assessmentActionType.UPDATE_ASSESSMENT_SAGA_RESULT, params:data});
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

export const assessmentSaga = [getAssessment_saga, updateAssessment_sage, getAssessmentEncntrByPatientKey_saga];
