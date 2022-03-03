import * as docActionTypes from '../../../actions/consultation/doc/docActionType';
import { select, takeLatest, call, put } from 'redux-saga/effects';
import { axios } from '../../../../services/axiosInstance';
import * as commonType from '../../../actions/common/commonActionType';
import { alsTakeLatest } from '../../als/alsLogSaga';
import moment from 'moment';
import _ from 'lodash';

/*function* getAllDocType(action) {
function* setInOutDocTypeList(action) {
    const {callback} = action;
    const svcCd = yield select(state => state.login.service.svcCd);

    let {data} = yield call(axios.get, `/clinical-doc/documentTypes/${svcCd}`);
    if (data.respCode === 0) {
        yield put({type: commonType.SAVE_CMN_IN_OUT_DOC_TYPE, data: data.data});

        callback && callback();
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: data.errMsg ? data.errMsg : 'Service error',
            data: data.data
        });
    }
}

function* triggerSetInOutDocTypeList() {
    yield alsTakeLatest(docActionTypes.SET_IN_OUT_DOC_TYPE, setInOutDocTypeList);
}

function* getAllDocType(action) {
    const {callback} = action;
    const svcCd = yield select(state => state.login.service.svcCd);

    let {data} = yield call(axios.get, `/clinical-doc/documentTypes/${svcCd}`);
    if (data.respCode === 0) {
        yield put({type: docActionTypes.SAVE_DOC_TYPE, data: data.data});

        callback && callback();
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: data.errMsg ? data.errMsg : 'Service error',
            data: data.data
        });
    }
}*/

/*function* triggerGetAllDocType() {
    yield alsTakeLatest(docActionTypes.GET_DOC_TYPE, getAllDocType);
}*/

function* getAllDocList(action) {
    const {callback} = action;
    const svcCd = yield select(state => state.login.service.svcCd);
    const patientKey = yield select(state => state.patient.patientInfo.patientKey);

    // let {data} = yield call(axios.get, `/doc-upload/docUpload/${svcCd}/documents/${patientKey}`);
    let {data} = yield call(axios.get, `/doc-upload/docUpload/${patientKey}/documents/history`);
    if (data.respCode === 0) {
        const oriDocList = data.data;
        const docList = [];

        oriDocList.forEach((item1) => {
            if(item1.src === 'O') {
                const docIdInitials = _.filter(oriDocList, {'docIdInitial': item1.docIdInitial});

                if(docIdInitials.length > 1) {
                    let latestItem = docIdInitials.reduce((prev, curr) => {
                        return (moment(prev.createDtm).isAfter(curr.createDtm)) ? prev : curr;
                    });

                    !_.includes(docList, latestItem) && docList.push(latestItem);
                } else {
                    docList.push(item1);
                }
            } else {
                docList.push(item1);
            }
        });

        yield put({type: docActionTypes.SAVE_DOC_LIST, data: docList});

        callback && callback(docList);
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: data.errMsg ? data.errMsg : 'Service error',
            data: data.data
        });
    }
}

function* triggerGetAllDocList() {
    yield alsTakeLatest(docActionTypes.GET_DOC_LIST, getAllDocList);
}

function* getSingleInOutDoc(action) {
    const {docId, isInDoc, callback} = action;

    let {data} = yield call(axios.get, `/doc-upload/docUpload/${isInDoc ? 'inDocuments' : 'outDocuments'}/${docId}/file`);

    if (data.respCode === 0) {
        yield put({type: docActionTypes.SAVE_SINGLE_DOC, data: data.data});

        callback && callback(data);
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: data.errMsg ? data.errMsg : 'Service error',
            data: data.data
        });
    }

    yield put({
        type: commonType.HANDLE_COMMON_CIRCULAR,
        status: 'close'
    });
}

function* triggerGetSingleInOutDoc() {
    yield alsTakeLatest(docActionTypes.GET_SINGLE_DOC, getSingleInOutDoc);
}

function* getSingleInOutDocHistory(action) {
    const {docId, callback} = action;

    let {data} = yield call(axios.get, `/doc-upload/docUpload/outDocuments/${docId}/history`);

    if (data.respCode === 0) {
        yield put({type: docActionTypes.SAVE_SINGLE_DOC_HISTORY, data: data.data});

        callback && callback();
    } else {
        yield put({
            type: commonType.OPEN_ERROR_MESSAGE,
            error: data.errMsg ? data.errMsg : 'Service error',
            data: data.data
        });
    }
}

function* triggerGetSingleInOutDocHistory() {
    yield alsTakeLatest(docActionTypes.GET_SINGLE_DOC_HISTORY, getSingleInOutDocHistory);
}

export const docSaga = [
    // triggerGetAllDocType,
    // triggerSetInOutDocTypeList,
    triggerGetAllDocList,
    triggerGetSingleInOutDoc,
    triggerGetSingleInOutDocHistory
];
