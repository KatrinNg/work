import { takeEvery, call, put, select, all } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as actionType from '../../../actions/certificate/certificateEform';
import * as mainFrameAction from '../../../actions/mainFrame/mainFrameAction';
import { print } from '../../../../utilities/printUtilities';
import * as messageType from '../../../actions/message/messageActionType';
import _ from 'lodash';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import { PAGESTATUS } from '../../../../enums/certificate/certEformEnum';
import storeConfig from '../../../storeConfig';
import { alsTakeEvery } from '../../als/alsLogSaga';
import { eFormFunction } from './eFormFunctionUtilities';

function* getContactPerson() {
    yield alsTakeEvery(actionType.GET_CONTACT_PERSON, function* () {
        const patientInfo = yield select(state => state.patient.patientInfo);

        let { data } = yield call(maskAxios.post, '/patient/getPatient', { 'patientKey': patientInfo.patientKey });

        if(data.respCode === 0) {
            yield put(actionType.updateState({contactPerson: _.cloneDeep(data.data)}));
        }
    });
}

function* listEform(svcCd) {
    let {data} = yield call(maskAxios.get, `/clinical-doc/eforms?svcCd=${svcCd}`);
    if (data.respCode === 0) {
        return data.data;
    } else {
        return null;
    }
}

function* listEformResult() {
    yield alsTakeEvery(actionType.LIST_EFORM_RESULT, function* (action) {
        const {params, callback} = action;
        const {svcCd, siteId} = params;
        const patientInfo = yield select(state => state.patient.patientInfo);
        let reqParas = {
            patientKey: patientInfo.patientKey
        };
        if (svcCd !== '*All') {
            reqParas.svcCd = svcCd;
        }
        if (siteId !== '*All') {
            reqParas.siteId = siteId;
        }
        // let {data} = yield call(maskAxios.get, `/clinical-doc/eformResult?svcCd=${params.svcCd}&siteId=${params.siteId}&patientKey=${patientInfo.patientKey}`);
        let {data} = yield call(maskAxios.get, '/clinical-doc/eformResult', {params: reqParas});
        if (data.respCode === 0) {
            yield put(actionType.updateState({eformResult: _.cloneDeep(data.data)}));
            callback && callback(data.data);
        }
    });
}

function* initData() {
    yield alsTakeEvery(actionType.INIT_DATA, function* () {
        const clinic = yield select(state => state.login.clinic);
        let eformParams = yield select(state => state.certificateEform.eformParams);
        // eformParams.svcCd = clinic && clinic.svcCd;
        // eformParams.siteId = clinic && clinic.siteId;
        // eformParams.dateFrom = moment().subtract(1, 'years');
        // eformParams.dateTo = moment();
        eformParams.svcCd = '*All';
        eformParams.siteId = '*All';

        let eform = yield call(listEform, clinic.svcCd);
        const defaultGroup = eform && eform.find(item => !item.parentId);
        const defaultTemp = defaultGroup && eform && eform.find(item => item.parentId === defaultGroup.eformId);

        yield put(actionType.updateState({
            eformParams,
            eformList: _.cloneDeep(eform),
            eformGroupId: defaultGroup && defaultGroup.eformId,
            eformTempId: defaultTemp && defaultTemp.eformId
        }));
    });
}

function* mapEformEtemplate(eformId) {
    const {data} = yield call(maskAxios.get, `/clinical-doc/mapEformEtemplate/${eformId}`);

    if (data.respCode === 0) {
        return data;
    } else if (data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110609'
            }
        });
    } else if (data.respCode === 101) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110610'
            }
        });
    }
    return null;
}

function* createEformTemplate() {
    yield alsTakeEvery(actionType.CREATE_EFORM_TEMPLATE, function* (action) {
        const {eformId, importOutDocId, importData} = action;
        // console.log('createEformTemplate', eformId, importOutDocId, importData);
        let data = yield call(mapEformEtemplate, eformId);

        if (data) {
            let eformTemplate = _.cloneDeep(data.data);

            if (eformTemplate && eformTemplate.clcEtemplateDto && eformTemplate.clcEtemplateDto.formContent) {
                const handleJsonTemplateLiterals = (input, keyValueArr) => {
                    let output = input;

                    keyValueArr.forEach(keyValue => {
                        output = output.replace(keyValue.key, keyValue.value);
                    });
                    return JSON.parse(output);
                };

                const jsonTemplateLiterals = [
                    {
                        key: '${Authorization}',
                        value: 'Bearer ' + window.sessionStorage.getItem('token')
                    }
                ];

                let eformObject = handleJsonTemplateLiterals(eformTemplate.clcEtemplateDto.formContent, jsonTemplateLiterals);

                const updateData = {
                    pageStatus: PAGESTATUS.CERT_ADDING,
                    eformParams: {
                        ...yield select(state => state.certificateEform.eformParams),
                        selected: null
                    },
                    eformTemplate: eformTemplate,
                    eformObject: eformObject,
                    outDocId: null,
                    importOutDocId
                };

                if (importData) {
                    updateData.eformSubmission = importData;
                }
                else {
                    if (eformObject.functionName) {
                        const eFormFunctionData = yield call(eFormFunction[eformObject.functionName], data);

                        updateData.eformSubmission = eFormFunctionData;
                    }
                }

                updateData.eformSubmissionOriginal = _.cloneDeep(updateData.eformSubmission);
                updateData.eformSubmissionSync = true;

                yield put(actionType.updateState(updateData));
            }
        }
    });
}

function* refreshPage() {
    yield alsTakeEvery(actionType.REFRESH_PAGE, function* (action) {
        const {isRefreshList, callback} = action;
        const eformParams = yield select(state => state.certificateEform.eformParams);
        yield put(actionType.updateState({
            eformParams: {
                ...eformParams,
                selected: null
            },
            pageStatus: PAGESTATUS.CERT_VIEWING,
            eformObject: null,
            eformTemplate: null,
            eformSubmission: null,
            eformSubmissionOriginal: null,
            eformSubmissionSync: false,
            eformSiteId: null,
            outDocId: null,
            importOutDocId: null
        }));
        if (isRefreshList) {
            yield put({
                type: actionType.LIST_EFORM_RESULT,
                params: {svcCd: eformParams.svcCd, siteId: eformParams.siteId},
                // params:{svcCd:'*All',siteId:'*All'}
                callback: (result) => {
                    callback && callback(result);
                }
            });
        }
    });
}

function* selectEformResult() {
    yield alsTakeEvery(actionType.SELECT_EFORM_RESULT, function* (action) {
        const {resultId, isEdit, callback} = action;
        const eformParams = yield select(state => state.certificateEform.eformParams);
        const eformResult = yield select(state => state.certificateEform.eformResult);
        if (resultId) {
            const selectedData = eformResult.find(x => x.eformResultId === resultId);
            if (selectedData) {
                let data = yield call(mapEformEtemplate, selectedData.clcMapEformEtemplateDto.eformId);
                if (data) {
                    let eformTemplate = _.cloneDeep(data.data);
                    let eformObject = null, eformSubmission = null;
                    if (eformTemplate && eformTemplate.clcEtemplateDto && eformTemplate.clcEtemplateDto.formContent) {
                        eformObject = JSON.parse(eformTemplate.clcEtemplateDto.formContent);
                        eformSubmission = JSON.parse(selectedData.formData);
                        eformSubmission.certifyCaseNo = eformSubmission.certifyCaseNo || '---';
                        eformSubmission.patientCaseNo = eformSubmission.patientCaseNo || '---';
                        eformSubmission.accompanyCaseNo = eformSubmission.accompanyCaseNo || '---';
                        // eformSubmission.dhPmiNumber = yield select(state => state.patient.patientInfo.patientKey.toString());

                        yield put(actionType.updateState({
                            eformParams: {
                                ...eformParams,
                                selected: resultId
                            },
                            pageStatus: isEdit ? PAGESTATUS.CERT_EDITING : PAGESTATUS.CERT_SELECTED,
                            eformTemplate: eformTemplate,
                            eformObject: eformObject,
                            eformSubmission: eformSubmission,
                            eformSubmissionOriginal: eformSubmission,
                            eformSubmissionSync: true,
                            eformSiteId: selectedData.siteId,
                            outDocId: selectedData.outDocId,
                            importOutDocId: null
                        }));
                    }
                }
            }
        } else {
            yield put(actionType.refreshPage());
        }
    });
}

function* addAction(params) {
    let {data} = yield call(maskAxios.post, '/clinical-doc/eformResult', params);
    if (data.respCode === 0) {
        return data.data;
    } else {
        return null;
    }
}

function* updateAction(params) {
    let {data} = yield call(maskAxios.put, '/clinical-doc/eformResult', params);
    if (data.respCode === 0) {
        return data.data;
    } else if (data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110611'
            }
        });
    }
    return null;
}

function* printAction(params) {
    let {data} = yield call(maskAxios.post, '/clinical-doc/eformReport', params);
    if (data.respCode === 0) {
        return data.data;
    } else {
        return null;
    }
}

function saveSuccessAction({saveMsgCode, eformParams, saveResult, callback}) {
    storeConfig.store.dispatch({
        type: messageType.OPEN_COMMON_MESSAGE,
        payload: {
            msgCode: saveMsgCode,
            showSnackbar: true
        }
    });
    storeConfig.store.dispatch({
        type: actionType.LIST_EFORM_RESULT,
        params: {svcCd: eformParams.svcCd, siteId: eformParams.siteId},
        callback: (result) => {
            storeConfig.store.dispatch({
                type: actionType.SELECT_EFORM_RESULT,
                resultId: saveResult

            });

            callback && callback(result);
        }
    });
}

function printSuccessAction({printResult, copyNum}) {
    print({
        base64: printResult,
        callback: (isSuccess) => {
            if (isSuccess) {
                storeConfig.store.dispatch({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110606',
                        showSnackbar: true
                    }
                });
            }
        },
        copies: copyNum
    });
}

function* saveEformResult() {
    yield alsTakeEvery(actionType.SAVE_EFORM_RESULT, function* (action) {
        const {actType, params, callback} = action;

        const certificateEform = yield select(state => state.certificateEform);
        const patient = yield select(state => state.patient);
        const clinic = yield select(state => state.login.clinic);

        const {
            patientInfo,
            encounterInfo,
            caseNoInfo
        } = patient;

        const {
            pageStatus,
            eformParams,
            eformResult,
            outDocId,
            importOutDocId,
            eformTemplate
        } = certificateEform;

        //pageStatus
        let saveAction = null, saveMsgCode = '';
        let saveParams = {
            formData: JSON.stringify(params.formData),
            patientKey: patientInfo.patientKey,
            siteId: clinic.siteId,
            svcCd: clinic.svcCd,
            encntrId: encounterInfo && encounterInfo.encounterId,
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            eformEtemplateId: eformTemplate.eformEtemplateId,
            crossEncntrAllow: eformTemplate.crossEncntrAllow,
            outDocId,
            importOutDocId,
            outDocTypeId: eformTemplate.eformId,
            fileStream: params.fileStream
        };
        //printParams = _.cloneDeep(saveParams);
        if (pageStatus === PAGESTATUS.CERT_ADDING) {
            saveAction = addAction;
            saveMsgCode = '110604';
        } else if (pageStatus === PAGESTATUS.CERT_EDITING) {
            const eform = eformResult.find(x => x.eformResultId === eformParams.selected);
            saveParams = {
                ...eform,
                formData: JSON.stringify(params.formData),
                crossEncntrAllow: eform.clcMapEformEtemplateDto && eform.clcMapEformEtemplateDto.crossEncntrAllow,
                outDocTypeId: eformTemplate.eformId,
                fileStream: params.fileStream
            };
            saveAction = updateAction;
            saveMsgCode = '110605';
        }

        //call api
        if (actType === 'SAVE') {
            if (saveAction && saveParams) {
                let saveResult = yield call(saveAction, saveParams);
                if (saveResult) {
                    saveSuccessAction({saveMsgCode, eformParams, saveResult, callback});
                }
            }
        } else if (actType === 'SAVE_PRINT') {
            if (saveAction && saveParams) {
                let saveResult = yield call(saveAction, saveParams);

                if (saveResult) {
                    saveSuccessAction({saveMsgCode, eformParams, saveResult, callback});
                }
            }
        } else if (actType === 'PRINT') {
            callback && callback();
        }
    });
}

function* deleteEformResult() {
    yield alsTakeEvery(actionType.DELETE_EFORM_RESULT, function* (action) {
        const {resultId, callback} = action;
        let {data} = yield call(maskAxios.delete, `/clinical-doc/eformResult/${resultId}`);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110607',
                    showSnackbar: true
                }
            });
            yield put(actionType.refreshPage(true, callback));
        }
    });
}

function* markComplete() {
    yield alsTakeEvery(actionType.MARK_COMPLETE, function* (action) {
        const {resultId} = action;
        let {data} = yield call(maskAxios.put, `/clinical-doc/markComplete/${resultId}`);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110608',
                    showSnackbar: true
                }
            });
            const eformParams = yield select(state => state.certificateEform.eformParams);
            yield put({
                type: actionType.LIST_EFORM_RESULT,
                params: {svcCd: eformParams.svcCd, siteId: eformParams.siteId},
                callback: () => {
                    storeConfig.store.dispatch({
                        type: actionType.SELECT_EFORM_RESULT,
                        resultId: data.data
                    });
                }
            });
        }
    });
}

function* handleClose() {
    yield alsTakeEvery(actionType.HANDLE_CLOSE, function* () {
        const pageStatus = yield select(state => state.certificateEform.pageStatus);
        if (pageStatus === PAGESTATUS.CERT_VIEWING) {
            yield put(mainFrameAction.deleteSubTabs({name: AccessRightEnum.certificateEform}));
        } else {
            yield put(actionType.refreshPage(true));
        }
    });
}

function* importCIMS1ClinicalDoc() {
    yield alsTakeEvery(actionType.IMPORT_CIMS1_CLINICAL_DOC, function* (action) {
        const { outDocId, outDocTypeId, callback } = action;
        let outDocData = yield call(importCIMS1ClinicalDocImpl, outDocId);
        if (outDocData) {
            yield put({
                type: actionType.CREATE_EFORM_TEMPLATE,
                eformId: outDocTypeId,
                importOutDocId: outDocId,
                importData: outDocData
            });
            yield put({
                type: actionType.CLOSE_DOCUMENT_IMPORT_DIALOG
            });
        }
        else {
            console.log('Cannot fetch CIMS1 clinical doc');
        }
    });
}

function* importCIMS1ClinicalDocImpl(outDocId) {
    // const certificateEform = yield select(state => state.certificateEform);
    let url = `/clinical-doc/convertCimsOneForm/outDoc/${outDocId}`;
    if (url) {
        try {
            let {data} = yield call(maskAxios.get, url);
            if (data.respCode === 0) {
                let outDocData = JSON.parse(data.data);
                return outDocData;
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    return null;
}

function* getEformResult() {
    yield alsTakeEvery(actionType.IMPORT_CIMS1_CLINICAL_DOC, function* (action) {
        const { eformResultId, outDocTypeId, callback } = action;
        let eformResultData = yield call(getEformResultImpl, eformResultId);
        if (eformResultData) {
            yield put({
                type: actionType.CREATE_EFORM_TEMPLATE,
                eformId: outDocTypeId,
                importData: eformResultData
            });
        }
        else {
            console.log('Cannot fetch CIMS2 clinical doc');
        }
    });
}

function* getEformResultImpl(eformResultId) {
    let url = `/clinical-doc/eformResult/${eformResultId}`;
    if (url) {
        try {
            let {data} = yield call(maskAxios.get, url);
            if (data.respCode === 0) {
                let eformResultData = JSON.parse(data.data.formData);
                return eformResultData;
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    return null;
}

function carryExist(respData) {
    return new Promise((resolve, reject) => {
        storeConfig.store.dispatch({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: respData.sourceFrom === 'CIMS1' ? '130901' : '130902',
                params: [
                    {
                        name: 'MSG',
                        value: respData.createDtm
                    }
                ],
                btnActions: {
                    btn1Click: () => resolve(true),
                    btn2Click: () => resolve(false)
                }
            }
        });
    });
}

function* findLatestDoc() {
    yield alsTakeEvery(actionType.FIND_LATEST_DOC, function* (action) {
        const { patientKey, outDocTypeId, siteId, callback } = action;
        const certificateEform = yield select(state => state.certificateEform);
        let url = `/clinical-doc/findLatestDoc/${patientKey}/${outDocTypeId}/${siteId}/eformResult`;
        if (url) {
            let {data} = yield call(maskAxios.get, url);
            // console.log('[CLC] findLatestDoc', data);

            let importOutDocId = null;
            let importData = null;

            if (data.respCode === 0) {
                let respData = data.data;

                if (respData) {
                    let result = yield call(carryExist, respData);
                    // console.log('[CLC] findLatestDoc carryExist', result);

                    if (result) {
                        // console.log('[CLC] Carry', respData.sourceFrom);

                        if (respData.sourceFrom === 'CIMS1') {
                            importData = yield call(importCIMS1ClinicalDocImpl, respData.docReferenceId);
                            importOutDocId = respData.docReferenceId;
                            if (importData) {
                                // console.log('[CLC] findLatestDoc CIMS1', importData);
                            }
                            else {
                                // console.log('[CLC] Cannot fetch CIMS1 clinical doc');
                            }
                        }
                        else if (respData.sourceFrom === 'CIMS2') {
                            importData = yield call(getEformResultImpl, respData.docReferenceId);
                            if (importData) {
                                // console.log('[CLC] findLatestDoc CIMS2', importData);
                            }
                            else {
                                // console.log('[CLC] Cannot fetch CIMS2 clinical doc');
                            }
                        }
                    }
                    else {
                        // console.log('[CLC] Not carry');
                    }
                }
                else {
                    // console.log('[CLC] Not found');
                }
            }
            else {
                // console.log('[CLC] Error');
            }

            yield put({
                type: actionType.CREATE_EFORM_TEMPLATE,
                eformId: outDocTypeId,
                importOutDocId,
                importData
            });

            // callback && callback(respData);
        }
    });
}

export const certificateEformSaga = [
    getContactPerson,
    listEformResult,
    initData,
    handleClose,
    createEformTemplate,
    selectEformResult,
    saveEformResult,
    deleteEformResult,
    markComplete,
    refreshPage,
    importCIMS1ClinicalDoc,
    findLatestDoc
];
