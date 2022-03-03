import { take, call, put, takeLatest, select } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import * as uploadDocumentActionType from '../../actions/clinicalDoc/clinicalDocActionType';
import * as messageType from '../../actions/message/messageActionType';
import {alsTakeLatest} from '../als/alsLogSaga';

function* postUploadDocument(action) {
    const {
        params,
        callback
    } = action;

    // Upload Document Max Size : 10MB
    if (params.file.size > 1024 * 1000 * 10) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130300',
                params: [
                    {name: 'MESSAGE', value: 'File size limited to 10MB.'}
                ],
                showSnackbar: true
            }
        });
    } else {
        let formData = new FormData();

        formData.append('file', params.file);
        let isScanDoc = params.isScanDoc ? params.isScanDoc : 0;

        let encntrIdUrlParams = '';
        if (params.encntrId){
            encntrIdUrlParams = '&encntrId=' + params.encntrId;
        }

        const urlParams =
            '?patientKey=' + params.patientKey +
            '&siteId=' + params.siteId +
            '&svcCd=' + params.svcCd +
            '&sbmtOcsnIndt=' + params.sbmtOcsnIndt +
            '&sbmtOcsnId=' + params.sbmtOcsnId +
            '&inDocTypeId=' + params.inDocTypeId +
            '&docRemark=' + params.docRemark +
            encntrIdUrlParams +
            // Input isScanDoc is null set 0 (1 = is Scanner Upload ; 0 = not is Scanner Upload )
            '&isScanDoc=' + isScanDoc;

        let {data} = yield call(maskAxios.post, '/doc-upload/docUpload/inDocument' + urlParams, formData);

        if (data.respCode === 0) {
            callback && callback();

            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '130301',
                    params: [
                        {name: 'MESSAGE', value: 'The file has been successfully uploaded.'}
                    ],
                    showSnackbar: true
                }
            });

            yield put({type: uploadDocumentActionType.GET_DOCUMENT_LIST, patientKey: params.patientKey});

            if (params.encntrId) {
                yield put({type: uploadDocumentActionType.GET_ENCNTR_DOCUMENT_LIST, patientKey: params.patientKey, encntrId: params.encntrId});
            }

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

function* uploadDocument() {
    yield alsTakeLatest(uploadDocumentActionType.UPLOAD_DOCUMENT, postUploadDocument);
}

function* getDocumentList(action) {
    let {data} = yield call(maskAxios.get, '/doc-upload/docUpload/' + action.patientKey + '/inDocuments');

    if (data.respCode === 0) {
        yield put({type: uploadDocumentActionType.SAVE_DOCUMENT_LIST, data: data.data.filter(data => data.docSts !== 'C')});
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getInDocList() {
    yield alsTakeLatest(uploadDocumentActionType.GET_DOCUMENT_LIST, getDocumentList);
}

function* getEncntrDocumentList(action) {
    let {data} = yield call(maskAxios.get, '/doc-upload/docUpload/' + action.patientKey + '/' + action.encntrId + '/inDocuments');

    if (data.respCode === 0) {
        yield put({type: uploadDocumentActionType.SAVE_ENCNTR_DOCUMENT_LIST, data: data.data.filter(data => data.docSts !== 'C')});
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getEncntrInDocList() {
    yield alsTakeLatest(uploadDocumentActionType.GET_ENCNTR_DOCUMENT_LIST, getEncntrDocumentList);
}

function* getSingleDocument(action) {
    let {data} = yield call(maskAxios.get, '/doc-upload/docUpload/inDocuments/' + action.inDocId + '/file');

    if (data.respCode === 0) {
        yield put({type: uploadDocumentActionType.SAVE_SINGLE_DOCUMENT, data: data.data});

        if (action.callback()) {
            action.callback();
        }
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* getInSingleDoc() {
    yield alsTakeLatest(uploadDocumentActionType.GET_SINGLE_DOCUMENT, getSingleDocument);
}

function* deleteSingleDocument(action) {
    let {data} = yield call(maskAxios.delete, '/doc-upload/docUpload/inDocuments/' + action.inDocumentDto.inDocId, {data: action.inDocumentDto});

    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    {name: 'MESSAGE', value: 'The file has been successfully deleted.'}
                ],
                showSnackbar: true
            }
        });

        yield put({type: uploadDocumentActionType.GET_DOCUMENT_LIST, patientKey: action.inDocumentDto.patientKey});

        if (action.inDocumentDto.encntrId) {
            yield put({type: uploadDocumentActionType.GET_ENCNTR_DOCUMENT_LIST, patientKey: action.inDocumentDto.patientKey, encntrId: action.inDocumentDto.encntrId});
        }

    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* deleteInSingleDoc() {
    yield alsTakeLatest(uploadDocumentActionType.DELETE_SINGLE_DOCUMENT, deleteSingleDocument);
}

export const clinicalDocSaga = [
    uploadDocument,
    getInDocList,
    getEncntrInDocList,
    getInSingleDoc,
    deleteInSingleDoc
];
