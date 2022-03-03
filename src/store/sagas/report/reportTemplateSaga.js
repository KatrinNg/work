import { take, call, put, select, takeLatest } from 'redux-saga/effects';
import { maskAxios, axios } from '../../../services/axiosInstance';
import * as reportTemplateActionType from '../../actions/report/reportTemplateActionType';
import * as messageType from '../../actions/message/messageActionType';
import _ from 'lodash';
import {alsStartTrans, alsEndTrans} from '../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../als/alsLogSaga';
import * as ReportConstant from '../../../constants/report/reportConstant';
import moment from 'moment';
import {closeWarnSnackbar} from '../../../store/actions/common/commonAction';

function serialize(url, obj) {
  let str = [];
  for (let p in obj)
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
        if(obj[p] !== null){
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    }
    str = str.join('&');
    if(str.length > 0 ){
        return url + '?' +str;
    }
    return url;
}

const getMimeType = (name) =>{
    let r = ReportConstant.mimeTypeList.find(x => x.name ===name);
    return r && r.mimeType ? r.mimeType: '';
};

const getExt = (name) =>{
    let r = ReportConstant.mimeTypeList.find(x => x.name === name);
    return r && r.ext ? r.ext: '';
};

function* reportJob(params, withMask = true) {
    let url = serialize('report/reportJobs', params);
    let resp = null;
    if (withMask) {
        resp = yield maskAxios.get(url, params);
    } else {
        resp = yield axios.get(url, params);
    }
    return resp;
}

function* requestData() {
    yield alsTakeEvery(reportTemplateActionType.REQUEST_DATA, function* (action) {
        let { dataType, params, fileData } = action;
        fileData = fileData || {};
        switch (dataType) {
            case 'userByService':
                {
                    let url = serialize('user/users',params );
                    let { data } = yield call(maskAxios.get, url);
                    if (data.respCode === 0) {
                        fileData['users'] = data.data;
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            case 'userByDtsService':
                {
                    let url = serialize('dts-cc/activeDoUser',params );
                    let { data } = yield call(maskAxios.get, url);
                    if (data.respCode === 0) {
                        fileData['users'] = data.data;
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            case 'reportData':
                {
                    let outDocId = params.outDocId;
                    let url = serialize(`reportJob/${outDocId}/xmlAndPdf`);
                    let { data } = yield call(maskAxios.get, url);
                    if (data.respCode === 0) {
                        fileData['reportData'] = data.data;
                        if (params.openReportPreview) {
                            fileData['openReportPreview'] = true;
                        }
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            case 'reportTemplateList':
                {
                    let url = serialize('report/reportTemplates', params);
                    let { data } = yield call(maskAxios.get, url);
                    if (data.respCode === 0) {
                        fileData['reportTemplateList'] = data.data;
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            case 'reportJobList':
                {
                    // let url = serialize('report/reportJobs', params);
                    // let { data } = yield call(maskAxios.get, url);
                    let { data } = yield call(reportJob, params);
                    if (data.respCode === 0) {
                        fileData['reportJobList'] = data.data;
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            case 'searchIndividualReport':
                {
                    let url = serialize('report/searchIndividualReport');
                    let { data } = yield call(maskAxios.get, url);
                    if (data.respCode === 0) {
                        fileData['individualReportList'] = data.data;
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            case 'reportConfigList':
                {
                    let url = serialize('report/reportConfigs', params);
                    let { data } = yield call(maskAxios.get, url);
                    if (data.respCode === 0) {
                        fileData['reportConfigList'] = data.data;
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            case 'reportConfigParamValList':
                {
                    //let reportConfigId = params.reportConfigId;
                    //let url = serialize(`report/reportConfigParamVals/${reportConfigId}`, params);
                    let url = serialize('report/reportConfigParamVals', params);
                    let { data } = yield call(maskAxios.get, url);
                    if (data.respCode === 0) {
                        fileData['reportConfigParamValList'] = data.data;
                        yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
                case 'reportConfigParamValByIdList':
                    {
                        //let reportConfigId = params.reportConfigId;
                        //let url = serialize(`report/reportConfigParamVals/${reportConfigId}`, params);
                        let url = serialize('report/' + params.reportConfigId + '/reportConfigParamVals');
                        let { data } = yield call(maskAxios.get, url);
                        if (data.respCode === 0) {
                            fileData['selectedReportConfigVals'] = data.data;
                            yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fileData });
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                case 'downloadByType':
                    {
                        let outDocId = params.outDocId;
                        let url = serialize(`reportJob/${outDocId}/xmlAndPdf`);
                        let { data } = yield call(maskAxios.get, url);
                        if (data.respCode === 0) {
                            fileData['reportData'] = data.data;
                        let submitData = {
                            fileOutType: params.fileOutType,
                            b64String: data.data && data.data.xml,
                            fileName: params.fileName
                        };
                        yield put({ type: reportTemplateActionType.POST_DATA, params: submitData, dataType:'convertFromB64Xml'});
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                    case 'batchDownload':
                {
                    //let reportConfigId = params.reportConfigId;
                    //let url = serialize(`report/reportConfigParamVals/${reportConfigId}`, params);
                    let url = serialize('reportJob/batchDownload', params);
                    let { data } = yield call(maskAxios.get, url);

                    let exportType = params && params.exportType;
                    const timeStr = moment().format('YYYY-MM-DD_HHmmss');
                    let fileName = 'report-download-' ;
                    if(exportType != null){
                        fileName += exportType +'-';
                    }
                    fileName += timeStr;
                    if (data.respCode === 0) {

                        const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
                            const byteCharacters = atob(b64Data);
                            const byteArrays = [];

                            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                                const slice = byteCharacters.slice(offset, offset + sliceSize);
                                const byteNumbers = new Array(slice.length);
                                for (let i = 0; i < slice.length; i++) {
                                    byteNumbers[i] = slice.charCodeAt(i);
                                }

                                const byteArray = new Uint8Array(byteNumbers);
                                byteArrays.push(byteArray);
                            }

                            const blob = new Blob(byteArrays, {type: contentType});
                            return blob;
                        };

                        let targetData = data.data;
                        const blob = b64toBlob(targetData,  'octet/stream');
                        const blobUrl = URL.createObjectURL(blob);
                        let ext = '.zip';
                        const link = document.createElement('a');
                        link.download = fileName + ext;
                        link.href = blobUrl;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                    } else {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110031'
                            }
                        });
                    }
                }
                break;
            default:
                break;
        }
    });
}

function* postData() {
    while (true) {
        try{
            let { dataType, params, callback } = yield take(reportTemplateActionType.POST_DATA);
            yield put(alsStartTrans());

            switch (dataType) {
                case 'reportJob':
                    {
                        let { data } = yield call(maskAxios.post, 'report/reportJob', params);
                        if (data.respCode === 0) {
                            callback && callback();
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110021',
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
                    break;
                case 'convertFromB64Xml':
                    {
                        const fileName = params.fileName;
                        const fileOutType = params.fileOutType;
                        let { data } = yield call(maskAxios.post, 'reportJob/convertFromB64Xml', params);
                        if (data.respCode === 0) {
                            let targetData = data.data;
                            let mimeType = getMimeType(fileOutType);
                            let ext = getExt(fileOutType);
                            //const linkSource = `data:application/pdf;base64,${targetData}`;
                            const linkSource = `data:${mimeType};base64,${targetData}`;
                            const downloadLink = document.createElement('a');
                            console.log('----------------------------------------------------');
                            console.log('linkSource', linkSource);
                            console.log(data.length);
                            console.log('----------------------------------------------------');
                            downloadLink.href = linkSource;
                            downloadLink.download = fileName + ext;
                            downloadLink.click();
                        } else {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110031'
                                }
                            });
                        }
                    }
                    break;
                case 'instantReportGen':
                    {
                        try {
                            let { data } = yield call(maskAxios.post, 'reportJob/instantReportGen', params,{timeout:30000});
                            if (data.respCode === 0) {
                                callback && callback(data.data);
                                yield put({
                                    type: messageType.OPEN_COMMON_MESSAGE,
                                    payload: {
                                        msgCode: '110021',
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
                        } catch (err) {
                            if (err.originalMsg.includes('timeout')) {
                                yield put(closeWarnSnackbar());
                                const templateList = yield select(state => state.reportTemplate.reportTemplateList);
                                const template = templateList.find(item => item.reportId === params.reportId);
                                yield put({
                                    type: messageType.OPEN_COMMON_MESSAGE,
                                    payload: {
                                        msgCode: '112103',
                                        params: [{ name: 'REPORT_NAME', value: template ? template.reportName : 'Report' }],
                                        showSnackbar: true
                                    }
                                });
                                callback && callback();
                            }
                        }
                    }
                    break;
                case 'dayEndGen':
                    {
                        let { data } = yield call(maskAxios.post, 'report/reportJob', params);
                        if (data.respCode === 0) {
                            callback && callback();
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110021',
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
                    break;
                case 'reportConfig':
                    {
                        let { data } = yield call(maskAxios.post, 'report/reportConfig', params);
                        if (data.respCode === 0) {
                            callback && callback();
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110021',
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
                    break;
                default:
                    break;
            }
        }
        finally {
            yield put(alsEndTrans());
        }
    }
}

function* putData() {
    while (true) {
        try {
            let { dataType, params, callback } = yield take(reportTemplateActionType.PUT_DATA);
            yield put(alsStartTrans());

            switch (dataType) {
                case 'reportConfig':
                    {
                        let reportConfigId = params.reportConfigId;
                        let { data } = yield call(maskAxios.put, `report/reportConfig/${reportConfigId}`, params);
                        if (data.respCode === 0) {
                            callback && callback();
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110023',
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
                    break;
                default:
                    break;
            }
        }
        finally {
            yield put(alsEndTrans());
        }
    }
}

function* deleteData() {
    while (true) {
        try {
            let { dataType, params, callback } = yield take(reportTemplateActionType.DELETE_DATA);
            yield put(alsStartTrans());

            switch (dataType) {
                case 'reportConfigs':
                    {
                        let url = serialize('report/reportConfigs', params);
                        let { data } = yield call(maskAxios.delete, url);
                        if (data.respCode === 0) {
                            callback && callback();
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '120013',
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
                    break;
                default:
                    break;
            }
        }
        finally {
            yield put(alsEndTrans());
        }
    }
}

function* updateField() {
    while (true) {
        try{
            let { updateData } = yield take(reportTemplateActionType.UPDATE_FIELD);
            yield put(alsStartTrans());

            if (updateData.clinicValue) {
                const encounterTypeList = yield select(state => state.common.encounterTypeList);
                const filterEncounterTypeList = encounterTypeList.filter(item => item.clinic === updateData.clinicValue);
                if (updateData.encounterTypeValue) {
                    let keyAndValue = {};
                    let fillingData = {};
                    fillingData.encounterTypeListData = _.cloneDeep(filterEncounterTypeList);
                    let selectEncounterTypes = filterEncounterTypeList.filter((item) => { return item.encounterTypeCd === updateData.encounterTypeValue; });
                    if (selectEncounterTypes.length > 0) {
                        fillingData.encounterTypeValue = updateData.encounterTypeValue;
                        fillingData.selectEncounterType = { ...selectEncounterTypes[0] };
                        fillingData.subEncounterTypeListData = selectEncounterTypes[0].subEncounterTypeList.map(item => { keyAndValue[item.subEncounterTypeCd] = item; return item; });
                        fillingData.subEncounterTypeListKeyAndValue = keyAndValue;
                        fillingData.subEncounterTypeValue = [];
                    }
                    yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: fillingData });
                } else {
                    yield put({ type: reportTemplateActionType.FILLING_DATA, fillingData: { encounterTypeListData: _.cloneDeep(filterEncounterTypeList) } });
                }
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* fetchReport(action) {
    let { params } = action;
    let url = '/ana/roomAppointmentListReport?';
    for (let p in params) {
        url += `${p}=${params[p]}&`;
    }
    url = url.substring(0, url.length - 1);
    let { data } = yield call(maskAxios.get, url);
    if (data.respCode === 0) {
        yield put({
            type: reportTemplateActionType.PUT_REPORT_TEMPLATE_DATA,
            reportData: data.data
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

function* preOpenPreviewWindow() {
    yield alsTakeLatest(reportTemplateActionType.OPEN_PREVIEW_WINDOW, fetchReport);
}

function* getDynamicFormParameterByApi() {
        yield alsTakeEvery(reportTemplateActionType.GET_DYNAMIC_FORM_PARAMETER_API, function* (action) {
        try {
            let { dataType, params, callback } = action;
            yield put(alsStartTrans());
            switch (dataType) {
                case 'dynamicFormByTemplate':
                    {
                        let { data } = yield call(maskAxios.get, params.api);
                        if (data.respCode === 0) {
                            yield put({
                                type: reportTemplateActionType.PUT_TEMPLATE_DYNAMIC_FORM_PARAMETER,
                                rptTmplParamId: params.rptTmplParamId,
                                parameterData: data.data
                            });
                        } else {
                            callback && callback();
                        }
                    }
                    break;
                // case 'dynamicFormByConfigs':
                //     {
                //         let { data } = yield call(maskAxios.get, params.api);
                //         if (data.respCode === 0) {
                //             yield put({
                //                 type: reportTemplateActionType.PUT_CONFIGS_DYNAMIC_FORM_PARAMETER,
                //                 rptTmplParamId: params.rptTmplParamId,
                //                 parameterData: data.data
                //             });
                //         } else {
                //             callback && callback();
                //         }
                //     }
                //     break;
                default:
                    break;
            }
        }
        finally {
            yield put(alsEndTrans());
        }
    });
}

function* rptJobLongPolling() {
    yield alsTakeEvery(reportTemplateActionType.JOB_LONG_POLLING, function* (action) {
        let { params, callback } = action;
        let resp = yield call(reportJob, params, false);
        if (resp.data.respCode === 0) {
            callback && callback(resp.data.data);
        } else {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
        }
    });
}

export const reportTemplateSaga = [
    requestData,
    postData,
    putData,
    deleteData,
    updateField,
    getDynamicFormParameterByApi,
    preOpenPreviewWindow,
    // reportJob,
    rptJobLongPolling
];
