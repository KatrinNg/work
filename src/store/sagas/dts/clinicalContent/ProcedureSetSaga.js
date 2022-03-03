import { take, call, put, select, all } from 'redux-saga/effects';
import * as procedureSetActionType from '../../../actions/dts/clinicalContent/procedureSetActionType';
import { maskAxios } from '../../../../services/axiosInstance';
import * as messageType from '../../../actions/message/messageActionType';

function* getProcedureCommonSet_saga() {

    while(true){
        yield take(procedureSetActionType.GET_PROCEDURE_COMMON_SET_SAGA);
        console.log('procedureSetSaga.js > getProcedureCommonSet_saga() > ' + JSON.stringify());

        let { data } = yield call(maskAxios.get, '/dts-cc/probProc/cc/probProc/getProcCmnSet');

        if (data.respCode === 0) {
            let psData = data.data;
            yield put({ type: procedureSetActionType.PROCEDURE_COMMON_SET, params:psData});
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

function* getProcedureQualifier_saga() {

    while(true){
        let { params } = yield take(procedureSetActionType.GET_PROCEDURE_QUALIFIER_SAGA);
        console.log('procedureSetSaga.js > getProcedureQualifier_saga() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-cc/probProc/cc/probProc/getQualifier/' + params.termCncptId + '/2020-05-20T14%3A48Z');

        if (data.respCode === 0) {
            let psData = data.data;
            yield put({ type: procedureSetActionType.PROCEDURE_QUALIFIER, params:psData});
            
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

function* getProcedureSetGroup_saga() {

    while(true){
        let { params } = yield take(procedureSetActionType.GET_PROCEDURE_SET_GROUP_SAGA);
        console.log('procedureSetSaga.js > getProcedureSetGroup_saga() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-cc/probProc/cc/probProc/getProcSetGroup', {
            params:{
                setId: params.setId
            }
        });

        if (data.respCode === 0) {
            let psData = data.data;
            yield put({ type: procedureSetActionType.PROCEDURE_SET_GROUP, params:psData});
            
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

function* updateProcedureQaulifier_sage() {

    while(true){
        let { params } = yield take(procedureSetActionType.UPDATE_PROCEDURE_QUALIFIER_SAGA);
        console.log('procedureSetSaga.js > getProcedureSetGroup_saga() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-cc/probProc/cc/probProc', {
            params:{
                probProcDto : params.probProcDto
            }
        });

        if (data.respCode === 0) {
            let psData = data.data;
            yield put({ type: procedureSetActionType.UPDATE_PROCEDURE_QUALIFIER_RESULT, params:psData});
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

export const procedureSetSaga = [getProcedureCommonSet_saga, getProcedureQualifier_saga, getProcedureSetGroup_saga, updateProcedureQaulifier_sage];
