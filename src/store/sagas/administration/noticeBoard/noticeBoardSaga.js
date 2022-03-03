import { take, takeEvery, call, put } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as types from '../../../actions/administration/noticeBoard/noticeBoardActionType';
import * as messageType from '../../../actions/message/messageActionType';
import * as sysConfig from '../../../../configs/config';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeEvery} from '../../als/alsLogSaga';

const url = '/cmn/notices';

function* listNotices() {
    while (true) {
        try{
            yield take(types.LIST_NOTICE);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/cmn/notices');
            if (data.respCode === 0) {
                yield put({
                    type: types.PUT_NOTICE_LIST,
                    noticesList: data.data
                });
            } else {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* submitNotice(action) {
    const { params, file, callback } = action;
    let resp = null;
    let msgCode = '';
    let formData = new FormData();
    if (file) {
        formData.append('ucmFile', file);
    }
    let paramsInfo = JSON.stringify(params);
    formData.append('noticeDto', new Blob([paramsInfo], { type: 'application/json' }));
    if (params.noticeId !== 0) {
        resp = yield call(maskAxios.put, url, formData, { timeout: sysConfig.RequestTimedoutLong });
        msgCode = '110063';
    } else {
        // let formData = new FormData();
        // formData.append('ucmFile', file);
        // formData.append('noticeDto', JSON.stringify(params));
        resp = yield call(maskAxios.post, url, formData, { timeout: sysConfig.RequestTimedoutLong });
        msgCode = '110062';
    }
    if (resp.data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: msgCode,
                showSnackbar: true
            }
        });
        callback && callback();
    } else if (resp.data.respCode === 3) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110032'
            }
        });
    } else if (resp.data.respCode === 101) {
        msgCode = '110064';
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: msgCode,
                showSnackbar: true
            }
        });
    } else if (resp.data.resp === 102) {
        msgCode = '110065';
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: msgCode,
                params: [{ name: 'MAXSIZE', value: 10240 }],
                showSnackbar: true
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

function* insertUpdateNotice() {
    yield alsTakeEvery(types.SUBMIT_NOTICE, submitNotice);
}

function* upload(action) {
    const { file, callback } = action;
    const avilFileType = ['.xlsx', '.xls', '.doc', '.docx', '.txt', '.pdf', '.jpg', '.jpeg'];
    let fileType = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
    let payload = {
        msgCode: '',
        showSnackbar: true
    };
    if (avilFileType.findIndex(item => item === fileType) === -1) {
        payload.msgCode = '110064';
        yield put({
            type: types.UPDATE_FIELD,
            updateData: { file: null }
        });
    } else if (file.size > 10485760) {//10485760
        payload.msgCode = '110065';
        payload.params = [{ name: 'MAXSIZE', value: '10240k' }];
        yield put({
            type: types.UPDATE_FIELD,
            updateData: { file: null }
        });
    }
    if (payload.msgCode === '') {
        payload.msgCode = '110066';
        yield put({
            type: types.LOAD_FILE,
            file
        });
        callback && callback();
    }
    yield put({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: payload
    });
}

function* uploadFile() {
    yield alsTakeEvery(types.UPLOAD_FILE, upload);
}


function* deleteNotice() {
    while (true) {
        let { noticeId, callback } = yield take(types.DELETE_NOTICE);
        let { data } = yield call(maskAxios.delete, `${url}/${noticeId}`);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110068',
                    showSnackbar: true
                }
            });
            callback && callback();
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

function* downloadFile() {
    while (true) {
        try{
            let { noticeId, callback } = yield take(types.DOWNLOAD_FILE);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, `/cmn/notices/${noticeId}`);
            if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110069',
                        showSnackbar: true
                    }
                });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110031'
                    }
                });
            } else {
                let { data } = yield call(maskAxios.get, `/cmn/notices/${noticeId}`, { responseType: 'blob' });
                callback && callback(data);
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

export const noticeBoardSaga = [
    listNotices,
    insertUpdateNotice,
    uploadFile,
    deleteNotice,
    downloadFile
];