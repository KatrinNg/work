import { take, takeLatest, call, put } from 'redux-saga/effects';
import axiosMoe from '../../../services/moeAxiosInstance';
import * as moeActionTypes from '../../actions/moe/moeActionType';
import * as commonTypes from '../../actions/common/commonActionType';
import * as prescriptionUtilities from '../../../utilities/prescriptionUtilities';
import * as drugHistoryUtilities from '../../../utilities/moe/drugHistoryUtilities';
import {
    defaultTypeVal as defaultDrugHistoryTypeVal,
    defaultPeriodVal as defaultDrugHistoryPeriodVal
} from '../../../enums/moe/drugHistoryEnum';
import { MOE_MSG_CODE } from '../../../constants/message/moe/commonRespMsgCodeMapping';
import * as moeUtilities from '../../../utilities/moe/moeUtilities';
import * as configs from '../../../configs/config';
import * as messageType from '../../actions/message/messageActionType';
import storeConfig from '../../../store/storeConfig';
import * as CommonActionType from '../../actions/common/commonActionType';
// import DAC_CODE from '../../../constants/message/moe/dacCode';
import {
    COMMON_RESP_MSG_CODE,
    COMMON_RESP_MSG_CODE_MAPPING,
    API_RESP_MSG_CODE_MAPPING
} from '../../../constants/message/moe/commonRespMsgCodeMapping';



export function* catchError(error) {
    console.log(error);
    yield put({
        type: commonTypes.OPEN_ERROR_MESSAGE,
        error: 'Service error.',
        data: error
    });
}

function* closeLoading() {
    yield put({
        type: CommonActionType.HANDLE_COMMON_CIRCULAR,
        status: 'close'
    });
}

function* openLoading() {
    yield put({
        type: CommonActionType.HANDLE_COMMON_CIRCULAR,
        status: 'open'
    });
}

export function* commonSaga(func, reject = () => { }) {
    try {
        yield call(openLoading);
        yield call(func);
    } catch (error) {
        yield call(catchError, error);
        reject();
    } finally {
        yield call(closeLoading);
    }
}

export function* commRespCodeMapping(data) {
    const showMsg = function* (msgCode) {
        try {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: msgCode,
                    params: [
                        {
                            name: 'CAUSE',
                            value: data.errMsg === '404' ? 'NOT FOUND' : data.errMsg
                        }
                    ]
                }
            });
        } catch (error) {
            yield call(catchError, error);
        }
    };
    if (!data || !data.respCode) {
        yield call(showMsg, COMMON_RESP_MSG_CODE.COMMON_APPLICATION_ERROR);
        return;
    }

    for (let key in COMMON_RESP_MSG_CODE_MAPPING) {
        if (key == data.respCode) {
            yield call(showMsg, COMMON_RESP_MSG_CODE_MAPPING[key]);
            return;
        }
    }

    for (let key in API_RESP_MSG_CODE_MAPPING) {
        if (key == data.moeURL) {
            const value = API_RESP_MSG_CODE_MAPPING[key];
            for (let respCodeKey in value) {
                if (respCodeKey == data.respCode) {
                    yield call(showMsg, value[respCodeKey]);
                    return;
                }
            }
        }
    }
    yield call(showMsg, COMMON_RESP_MSG_CODE.COMMON_APPLICATION_ERROR);
}


export function* callDeptFavourit(params) {
    let { data } = yield call(axiosMoe.post, '/moe/listMyFavourite', params);
    if (data.respCode === 0) {
        let updateData = {};
        updateData.orginalDeptFavouriteList = data.data;
        updateData.deptFavouriteList = prescriptionUtilities.getDeptFavouriteList(data.data);
        yield put({
            type: moeActionTypes.UPDATE_DEPT_FAVOURITE_FIELD,
            updateData: updateData
        });
    } else {
        yield call(commRespCodeMapping, data);
    }
    // switch (data.respCode) {
    //     case 0: {
    //         let updateData = {};
    //         updateData.orginalDeptFavouriteList = data.data;
    //         updateData.deptFavouriteList = prescriptionUtilities.getDeptFavouriteList(data.data);
    //         yield put({
    //             type: moeActionTypes.UPDATE_DEPT_FAVOURITE_FIELD,
    //             updateData: updateData
    //         });
    //         break;
    //     }
    //     default: {
    //         yield call(commRespCodeMapping, data);
    //         break;
    //     }
    // }
}
function* getDeptFavouriteList() {
    while (true) {
        let { params } = yield take(moeActionTypes.GET_DEPT_FAVOURITE_LIST);
        // yield call(commonSaga, function* () {
        //     yield call(openLoading);
        //     yield call(callMyFavourit, params);
        // });
        try {
            // yield call(openLoading);
            yield call(callDeptFavourit, params);
            // let { data } = yield call(axiosMoe.post, '/moe/listMyFavourite', action.params);
            // if (data.respCode === 0) {
            //     let updateData = {};
            //     updateData.orginalDeptFavouriteList = data.data;
            //     updateData.deptFavouriteList = prescriptionUtilities.getMyFavouriteList(data.data);
            //     yield put({
            //         type: moeActionTypes.UPDATE_DEPT_FAVOURITE_FIELD,
            //         updateData: updateData
            //     });
            // } else {
            //     yield put({
            //         type: commonTypes.OPEN_ERROR_MESSAGE,
            //         error: data.errMsg ? 'Fail to get department favourite list.' : 'Service error',
            //         data: data.data
            //     });
            // }
        } catch (error) {
            yield call(catchError, error);
        }
    }
}

export function* checkUnsavedRecord() {
    const store = storeConfig.store.getState();
    const isExistCache = store && store['moe']['orderData'] && store['moe']['orderData']['isCache'] === 'Y';
    const updateData = {
        isExistCache
    };
    yield put({
        type: moeActionTypes.UPDATE_FIELD,
        updateData
    });
}

//get patient allergy list
function* getPatientSummary() {
    let { data } = yield call(axiosMoe.get, '/moe/patientSummary');
    if (data.respCode === 0) {
        yield put({
            type: moeActionTypes.UPDATE_PATIENT_ALLERGY_INF,
            data: data.data
        });
        yield put({
            type: moeActionTypes.UPDATE_PATIENT_ALLERGY_CONNECTED_FLAG,
            data: true
        });
    } else {
        // yield put({
        //     type: commonTypes.OPEN_ERROR_MESSAGE,
        //     error: data.errMsg ? 'Get patient allergy list failed.' : 'Service error',
        //     data: data.data
        // });
        yield put({
            type: moeActionTypes.UPDATE_PATIENT_ALLERGY_CONNECTED_FLAG,
            data: false
        });
        yield call(commRespCodeMapping, data);
    }
}

function* moeLogin() {
    while (true) {

        let { params } = yield take(moeActionTypes.LOGIN);
        yield call(commonSaga, function* () {
            //params.moePatient.user.orderNum = 1280;
            window.sessionStorage.setItem('moeIfLogin', true);
            window.sessionStorage.setItem('moeLoginName', null);
            window.sessionStorage.setItem('moeLoginTime', null);
            window.sessionStorage.setItem('moeLoginInfo', null);
            window.sessionStorage.setItem('moeToken', null);
            window.sessionStorage.setItem('reloginParams', JSON.stringify(params.moePatient));

            //get error msg
            const store = storeConfig.store.getState();
            const msgList = store && store['message']['commonMessageList'];
            if (!msgList || msgList.length === 0) {
                yield put({
                    type: messageType.GET_MESSAGE_LIST_BY_APP_ID,
                    params: {
                        applicationId: configs.applicationId
                    }
                });
                // let messageData = yield call(axios.get, `/message/listMessageListByApplicationId?applicationId=${configs.applicationId}`);
                // if (messageData.status === 200 && messageData.data && messageData.data.respCode === 0) {
                //     yield put({
                //         type: messageType.COMMON_MESSAGE_LIST,
                //         commonMessageList: messageData.data.data
                //     });
                // } else {
                //     yield put({
                //         type: messageType.OPEN_COMMON_MESSAGE,
                //         payload: {
                //             msgCode: '110031'
                //         }
                //     });
                // }
            }
            //end get error msg

            let { data } = yield call(axiosMoe.post, '/moe/login', params.moePatient);
            if (data.respCode === 0) {

                let moeToken = data.data.token;
                window.sessionStorage.setItem('moeToken', moeToken);
                //delete data.data.token;

                let orderData = {};
                orderData.drugList = [];
                orderData.orderData = null;

                let hospSetting = yield call(axiosMoe.post, '/moe/getHospitalSetting', params.moeHospSetting, { headers: { 'Authorization': moeToken } });
                if (hospSetting.data.respCode === 0) {
                    data.hospSetting = hospSetting.data.data;

                    let dataCodeList = yield call(axiosMoe.post, '/moe/listCodeList', params.moeCodeList, { headers: { 'Authorization': moeToken } });
                    if (dataCodeList.data.respCode === 0) {
                        let codeListData = dataCodeList.data.data;
                        /* eslint-disable */
                        codeListData.action_status.map(item => { item.code = item.actionStatusType; item.engDesc = item.actionStatus; });
                        codeListData.base_unit.map(item => { item.code = item.baseUnitId; item.engDesc = item.baseUnit; });
                        codeListData.duration_unit.map(item => { item.code = item.durationUnit; item.engDesc = item.durationUnitDesc; });
                        codeListData.freq_code.map(item => { item.code = item.freqCode; item.engDesc = item.freqDescEng; });
                        codeListData.route.map(item => { item.code = item.routeId; item.engDesc = item.routeEng; });
                        /* eslint-enable */
                        data.codeList = dataCodeList.data.data;
                        yield put({
                            type: moeActionTypes.LOGIN_SUCCESS,
                            data: data.data,
                            codeList: data.codeList,
                            hospSetting: data.hospSetting
                        });
                        // if (data.data.user && data.data.user.orderNum !== 0) {
                        if (data.data.user) {
                            let dataParams = {
                                'caseNo': data.data.user.moeCaseNo,
                                'hospcode': data.data.user.hospitalCd,
                                'ordNo': data.data.user.orderNum,
                                'patientKey': data.data.user.moePatientKey
                            };
                            let dataOrder = yield call(axiosMoe.post, '/moe/getOrder', dataParams);
                            if (dataOrder.data.respCode === 0) {
                                let dataOrderResp = dataOrder.data.data;

                                yield put({
                                    type: moeActionTypes.UPDATE_FIELD,
                                    updateData: {'moeOriginData': dataOrderResp}
                                });
                                if (dataOrderResp) {
                                    let drugList = prescriptionUtilities.getDrugDataForUI(dataOrderResp);
                                    orderData.drugList = drugList;
                                    orderData.orderData = dataOrderResp;
                                }
                            }
                        }
                    } else {
                        // yield put({
                        //     type: commonTypes.OPEN_ERROR_MESSAGE,
                        //     error: data.errMsg ? 'Get code list failed.' : 'Service error',
                        //     data: data.data
                        // });
                        yield call(commRespCodeMapping, dataCodeList.data);
                    }

                    yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: orderData });

                    //get drug history
                    let drugHistoryParams = {
                        'prescType': defaultDrugHistoryTypeVal,
                        'withinMonths': defaultDrugHistoryPeriodVal
                    };//data.data.user.loginId
                    let drugHistoryData = yield call(axiosMoe.post, '/moe/listDrugHistory', drugHistoryParams);
                    if (drugHistoryData.status === 200 && drugHistoryData.data.respCode === 0) {
                        let updateDrugHistoryData = {};
                        updateDrugHistoryData.drugHistoryList = drugHistoryUtilities.getDrugHistoryListForUI(drugHistoryData.data.data);
                        yield put({ type: moeActionTypes.UPDATE_DRUG_HISTORY_FIELD, updateData: updateDrugHistoryData });
                    } else {
                        // yield put({
                        //     type: commonTypes.OPEN_ERROR_MESSAGE,
                        //     error: data.errMsg ? 'Get drug history list failed.' : 'Service error',
                        //     data: data.data
                        // });
                        yield call(commRespCodeMapping, drugHistoryData.data);
                    }

                    //get my favourite list
                    let myFavouriteParams = { 'department': false, 'userId': data.data.user.moeCaseNo.loginId };//data.data.user.loginId
                    let myFavouriteData = yield call(axiosMoe.post, '/moe/listMyFavourite', myFavouriteParams);
                    if (myFavouriteData.status === 200 && myFavouriteData.data.respCode === 0) {
                        let updateMyFavouriteData = {};
                        updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
                        updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);
                        yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
                    } else {
                        // yield put({
                        //     type: commonTypes.OPEN_ERROR_MESSAGE,
                        //     error: data.errMsg ? 'Get my favourite list failed.' : 'Service error',
                        //     data: data.data
                        // });
                        yield call(commRespCodeMapping, myFavouriteData.data);
                    }

                    //get department favourite list
                    yield call(callDeptFavourit, { 'department': true, 'searchString': '' });

                    //get patient allergy list
                    yield call(getPatientSummary);
                    // let patientAllergyData = yield call(axiosMoe.get, '/moe/patientSummary');
                    // if (patientAllergyData.status === 200 && patientAllergyData.data.respCode === 0) {
                    //     yield put({
                    //         type: moeActionTypes.UPDATE_PATIENT_ALLERGY_INF,
                    //         data: patientAllergyData.data.data
                    //     });
                    //     yield put({
                    //         type: moeActionTypes.UPDATE_PATIENT_ALLERGY_CONNECTED_FLAG,
                    //         data: true
                    //     });
                    // } else {
                    //     // yield put({
                    //     //     type: commonTypes.OPEN_ERROR_MESSAGE,
                    //     //     error: data.errMsg ? 'Get patient allergy list failed.' : 'Service error',
                    //     //     data: data.data
                    //     // });
                    //     yield put({
                    //         type: moeActionTypes.UPDATE_PATIENT_ALLERGY_CONNECTED_FLAG,
                    //         data: false
                    //     });
                    //     yield call(commRespCodeMapping, patientAllergyData.data);
                    // }


                    yield call(checkUnsavedRecord);
                } else {
                    yield call(commRespCodeMapping, hospSetting.data);
                }
            } else {
                yield put({
                    type: moeActionTypes.LOGIN_ERROR,
                    error: data.errMsg ? data.errMsg : 'Service error',
                    data: data.data
                });
                // yield put({
                //     type: commonTypes.OPEN_ERROR_MESSAGE,
                //     error: data.errMsg ? data.errMsg : 'Service error',
                //     data: data.data
                // });
                yield call(commRespCodeMapping, data);
            }
        });
        // try {

        // } catch (error) {
        //     yield put({
        //         type: commonTypes.OPEN_ERROR_MESSAGE,
        //         error: error.message ? error.message : 'Service error',
        //         data: error
        //     });
        //     console.log(error);
        // } finally {
        //     yield fork(closeLoading);
        // }
    }
}

function* fetchSearchDrug(action) {
    // yield call(commonSaga, function* a() {
    //     let { data } = yield call(axiosMoe.post, '/moe/listDrugSuggest', action.params);
    //     if (data.respCode === 0) {
    //         yield put({ type: moeActionTypes.SEARCH_DRUG_LIST, data: data.data });
    //     } else {
    //         yield put({
    //             type: commonTypes.OPEN_ERROR_MESSAGE,
    //             error: data.errMsg ? data.errMsg : 'Service error',
    //             data: data.data
    //         });
    //     }
    // });
    try {
        let { data } = yield call(axiosMoe.post, '/moe/listDrugSuggest', action.params);
        if (data.respCode === 0) {
            yield put({ type: moeActionTypes.SEARCH_DRUG_LIST, data: data.data });
        } else {
            // yield put({
            //     type: commonTypes.OPEN_ERROR_MESSAGE,
            //     error: data.errMsg ? data.errMsg : 'Service error',
            //     data: data.data
            // });
            yield call(commRespCodeMapping, data);
        }
    } catch (error) {
        yield call(catchError, error);
    }
}

function* searchDrug() {
    yield takeLatest(moeActionTypes.SEARCH_DRUG, fetchSearchDrug);
}

function* getCodeList() {
    while (true) {
        let { params } = yield take(moeActionTypes.GET_CODE_LIST);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/listCodeList', params);
            if (data.respCode === 0) {
                yield put({ type: moeActionTypes.CODE_LIST, data: data.data });
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         yield put({ type: moeActionTypes.CODE_LIST, data: data.data });
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* saveDrug() {
    let isCache = false;
    while (true) {
        let { params, orderData, patient/*,isDeleteOrder*/, resetDuplicate, callback, orderRemark, codeList, isSubmit, spaCallback } = yield take(moeActionTypes.SAVE_DRUG);
        yield call(commonSaga, function* () {
            let paramsData = prescriptionUtilities.getDrugDataForBackend(params, orderData, patient, orderRemark, codeList);
            console.log('demi test paramsData',paramsData);
            let url;
            if (!isSubmit) {
                url = '/moe/cacheOrder';
                isCache = true;
            } else {
                if (orderData && orderData.moeOrder && orderData.moeOrder.ordNo && orderData.moeOrder.ordNo !== 0) {
                    url = '/moe/updateOrder';
                    isCache = false;
                } else {
                    url = '/moe/insertOrder';
                    isCache = false;
                }
            }

            if (!paramsData.hospcode) paramsData.hospcode = patient.hospitalCd;
            if (!paramsData.orderNo) paramsData.orderNo = 0;

            console.time('call updateOrder or insertOrder api totle time');
            let { data } = yield call(axiosMoe.post, url, paramsData);
            console.timeEnd('call updateOrder or insertOrder api totle time');
            if (data.respCode === 0) {
                console.time('update reducer time');
                let updateData = {};
                updateData.isSaveSuccess = true;
                updateData.saveMessageList = [];
                updateData.selectedPrescriptionIndex = null;
                updateData.showDetail = false;
                if (resetDuplicate) {
                    updateData.duplicateDrugList = [];
                    updateData.openDuplicateDialog = false;
                    updateData.selectedDeletedList = [];
                }

                //call getOrder api
                let dataParams = {
                    'caseNo': patient.moeCaseNo,
                    'hospcode': patient.hospitalCd,
                    'ordNo': data.data,
                    'patientKey': patient.moePatientKey
                };
                if (!isSubmit) {
                    dataParams.ordNo = orderData && orderData.moeOrder && orderData.moeOrder.ordNo;
                }
                // getOrderMethod(dataParams);
                let dataOrder = yield call(axiosMoe.post, '/moe/getOrder', dataParams);
                if (dataOrder.status === 200 && dataOrder.data.respCode === 0) {
                    let dataOrderResp = dataOrder.data.data;
                    if (!isCache) {
                        yield put({
                            type: moeActionTypes.UPDATE_FIELD,
                            dataOrderResp: dataOrderResp
                        });
                    }

                    if (dataOrderResp) {
                        let drugList = prescriptionUtilities.getDrugDataForUI(dataOrderResp);
                        updateData.drugList = drugList;
                        updateData.orderData = dataOrderResp;
                    } else {
                        updateData.drugList = [];
                        updateData.orderData = null;
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                } else {
                    yield call(commRespCodeMapping, dataOrder.data);
                }

                yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });

                if(isSubmit){
                    if(typeof spaCallback === 'function') {
                        yield put({
                            type: commonTypes.HANDLE_CLEAN_MASK,
                            status: 'open'
                        });
                    }
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: MOE_MSG_CODE.MOE_SAVE_ORDER_SUCCESS,
                            showSnackbar: true,
                            btnActions: {
                                btn1Click: typeof spaCallback === 'function' ?
                                    () => {
                                        spaCallback(true);
                                    } : null
                            }
                        }
                    });
                }

                console.timeEnd('update reducer time');
            } else {
                let updateData = {};
                updateData.isSaveSuccess = false;
                updateData.saveMessageList = data.errMsg ? 'Save failed.' : 'Service error';
                yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         console.time('update reducer time');
            //         let updateData = {};
            //         updateData.isSaveSuccess = true;
            //         updateData.saveMessageList = [];
            //         updateData.selectedPrescriptionIndex = null;
            //         updateData.showDetail = false;
            //         if (resetDuplicate) {
            //             updateData.duplicateDrugList = [];
            //             updateData.openDuplicateDialog = false;
            //             updateData.selectedDeletedList = [];
            //         }

            //         //call getOrder api
            //         let dataParams = {
            //             'caseNo': patient.moeCaseNo,
            //             'hospcode': patient.hospitalCd,
            //             'ordNo': data.data,
            //             'patientKey': patient.moePatientKey
            //         };
            //         if (!isSubmit) {
            //             dataParams.ordNo = orderData && orderData.moeOrder && orderData.moeOrder.ordNo;
            //         }
            //         // getOrderMethod(dataParams);
            //         let dataOrder = yield call(axiosMoe.post, '/moe/getOrder', dataParams);
            //         if (dataOrder.status === 200 && dataOrder.data.respCode === 0) {
            //             let dataOrderResp = dataOrder.data.data;
            //             if (dataOrderResp) {
            //                 let drugList = prescriptionUtilities.getDrugDataForUI(dataOrderResp);
            //                 updateData.drugList = drugList;
            //                 updateData.orderData = dataOrderResp;
            //             } else {
            //                 updateData.drugList = [];
            //                 updateData.orderData = null;
            //             }
            //             if (typeof callback === 'function') {
            //                 callback();
            //             }
            //         } else {
            //             // yield put({
            //             //     type: commonTypes.OPEN_ERROR_MESSAGE,
            //             //     error: data.errMsg ? data.errMsg : 'System error.',
            //             //     data: data.data
            //             // });
            //             yield call(commRespCodeMapping, dataOrder.data);
            //         }

            //         yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });
            //         console.timeEnd('update reducer time');
            //         break;
            //     }
            //     default: {
            //         let updateData = {};
            //         updateData.isSaveSuccess = false;
            //         updateData.saveMessageList = data.errMsg ? 'Save failed.' : 'Service error';
            //         yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* cancelOrder() {
    while (true) {
        let { params } = yield take(moeActionTypes.CANCEL_ORDER);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/cancelOrder');
            if (data.respCode === 0) {
                let updateData = {};
                updateData.isSaveSuccess = true;
                updateData.saveMessageList = [];
                updateData.selectedPrescriptionIndex = null;
                updateData.showDetail = false;
                updateData.duplicateDrugList = [];
                updateData.openDuplicateDialog = false;
                updateData.selectedDeletedList = [];

                //call getOrder api
                let dataOrder = yield call(axiosMoe.post, '/moe/getOrder', params);
                if (dataOrder.status === 200 && dataOrder.data.respCode === 0) {
                    let dataOrderResp = dataOrder.data.data;

                    yield put({
                        type: moeActionTypes.UPDATE_FIELD,
                        updateData: {'moeOriginData': dataOrderResp}
                    });

                    if (dataOrderResp) {
                        let drugList = prescriptionUtilities.getDrugDataForUI(dataOrderResp);
                        updateData.drugList = drugList;
                        updateData.orderData = dataOrderResp;
                    } else {
                        updateData.drugList = [];
                        updateData.orderData = null;
                    }
                } else {
                    // yield put({
                    //     type: commonTypes.OPEN_ERROR_MESSAGE,
                    //     error: data.errMsg ? data.errMsg : 'System error.',
                    //     data: data.data
                    // });
                    yield call(commRespCodeMapping, dataOrder.data);
                }

                yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         let updateData = {};
            //         updateData.isSaveSuccess = true;
            //         updateData.saveMessageList = [];
            //         updateData.selectedPrescriptionIndex = null;
            //         updateData.showDetail = false;
            //         updateData.duplicateDrugList = [];
            //         updateData.openDuplicateDialog = false;
            //         updateData.selectedDeletedList = [];

            //         //call getOrder api
            //         let dataOrder = yield call(axiosMoe.post, '/moe/getOrder', params);
            //         if (dataOrder.status === 200 && dataOrder.data.respCode === 0) {
            //             let dataOrderResp = dataOrder.data.data;
            //             if (dataOrderResp) {
            //                 let drugList = prescriptionUtilities.getDrugDataForUI(dataOrderResp);
            //                 updateData.drugList = drugList;
            //                 updateData.orderData = dataOrderResp;
            //             } else {
            //                 updateData.drugList = [];
            //                 updateData.orderData = null;
            //             }
            //         } else {
            //             yield put({
            //                 type: commonTypes.OPEN_ERROR_MESSAGE,
            //                 error: data.errMsg ? data.errMsg : 'System error.',
            //                 data: data.data
            //             });
            //         }

            //         yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}


function* deleteOrder() {
    while (true) {
        let { params } = yield take(moeActionTypes.DELETE_ORDER);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/deleteOrder', params);
            if (data.respCode === 0) {
                yield put({ type: moeActionTypes.DELETE_ORDER_SUCCESS, data: data });
                let reloginParams = moeUtilities.getMoeSetting().reloginParams;
                let reloginData = yield call(axiosMoe.post, '/moe/login', reloginParams);
                if (reloginData.data.respCode === 0) {
                    let actionData = reloginData.data.data;
                    window.sessionStorage.setItem('moeActionCd', actionData.user.actionCd);
                    let updateData = {
                        duplicateDrugList: [],
                        openDuplicateDialog: false,
                        showDetail: false,
                        actionCd: actionData.user.actionCd
                    };
                    if (typeof params.callback === 'function')
                        params.callback();
                    yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });
                }
                else {
                    // yield put({
                    //     type: commonTypes.OPEN_ERROR_MESSAGE,
                    //     error: reloginData.data.errMsg ? reloginData.data.errMsg : 'Service error',
                    //     data: reloginData.data.data
                    // });
                    yield call(commRespCodeMapping, reloginData.data);
                }
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         yield put({ type: moeActionTypes.DELETE_ORDER_SUCCESS, data: data });
            //         let reloginParams = moeUtilities.getMoeSetting().reloginParams;
            //         let reloginData = yield call(axiosMoe.post, '/moe/login', reloginParams);
            //         if (reloginData.data.respCode === 0) {
            //             let actionData = reloginData.data.data;
            //             window.sessionStorage.setItem('moeActionCd', actionData.user.actionCd);
            //             let updateData = {
            //                 duplicateDrugList: [],
            //                 openDuplicateDialog: false,
            //                 showDetail: false,
            //                 actionCd: actionData.user.actionCd
            //             };
            //             if (typeof params.callback === 'function')
            //                 params.callback();
            //             yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: updateData });
            //         }
            //         else {
            //             // yield put({
            //             //     type: commonTypes.OPEN_ERROR_MESSAGE,
            //             //     error: reloginData.data.errMsg ? reloginData.data.errMsg : 'Service error',
            //             //     data: reloginData.data.data
            //             // });
            //             yield call(commRespCodeMapping, reloginData.data);
            //         }
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}


function* getOrder() {
    while (true) {
        let { params } = yield take(moeActionTypes.GET_ORDER_DRUG_LIST);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/getOrder', params);
            if (data.respCode === 0) {
                let orderData = {};
                yield put({
                    type: moeActionTypes.UPDATE_FIELD,
                    updateData: {'moeOriginData': data.data}
                });
                if (data.data) {
                    let drugList = prescriptionUtilities.getDrugDataForUI(data.data);
                    console.log('demi test drugList',drugList);
                    orderData.drugList = drugList;
                    orderData.orderData = data.data;
                }
                yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: orderData });
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         let orderData = {};
            //         if (data.data) {
            //             let drugList = prescriptionUtilities.getDrugDataForUI(data.data);
            //             orderData.drugList = drugList;
            //             orderData.orderData = data.data;
            //         }
            //         yield put({ type: moeActionTypes.UPDATE_FIELD, updateData: orderData });
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* getSpecialIntervalText() {
    while (true) {
        let { params, callBack } = yield take(moeActionTypes.GET_SPECIAL_INTERVAL_TEXT);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/generateSpecialIntervalText', params);
            if (data.respCode === 0) {
                yield put({ type: moeActionTypes.SPECIAL_INTERVAL_TEXT, data: data.data });
                if (typeof callBack === 'function') {
                    callBack(data.data);
                }
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         yield put({ type: moeActionTypes.SPECIAL_INTERVAL_TEXT, data: data.data });
            //         if (typeof callBack === 'function') {
            //             callBack(data.data);
            //         }
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* convertDrug() {
    while (true) {
        let { params } = yield take(moeActionTypes.CONVERT_DRUG);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/convertMedProfile', params.data);
            if (data.respCode === 0) {
                yield put({ type: moeActionTypes.CONVERT_DRUG, data: data.data });
                if (typeof params.callback === 'function') {
                    let callbackData = params.callbackParams;
                    callbackData.convertData = data.data;
                    params.callback(callbackData);
                }
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         yield put({ type: moeActionTypes.CONVERT_DRUG, data: data.data });
            //         if (typeof params.callback === 'function') {
            //             let callbackData = params.callbackParams;
            //             callbackData.convertData = data.data;
            //             params.callback(callbackData);
            //         }
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* getTotalDangerDrug() {
    while (true) {
        let { params, callBack } = yield take(moeActionTypes.GET_TOTAL_DANGER_DRUG);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/getMaxDosage', params);
            if (data.respCode === 0) {
                yield put({ type: moeActionTypes.TOTAL_DANGER_DRUG, data: data.data });
                if (typeof callBack === 'function') {
                    callBack(data.data);
                }
            } else if (data.respCode !== 3) {
                yield call(commRespCodeMapping, data);
            }
        });
    }
}

function* allergyChecking() {
    while (true) {
        let { params, callBack } = yield take(moeActionTypes.GET_ALLERGY_CHECKING);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/allergyChecking', params);
            if (data.respCode === 0) {
                yield put({ type: moeActionTypes.ALLERGY_CHECKING, data: data.data });
                if (typeof callBack === 'function')
                    callBack();
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         yield put({ type: moeActionTypes.ALLERGY_CHECKING, data: data.data });
            //         if (typeof callBack === 'function')
            //             callBack();
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* getMDSEnq() {
    while (true) {
        let { params } = yield take(moeActionTypes.GET_MDS_ENQUIRY);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.get, '/moe/listMDSEnquiries', params);
            if (data.respCode === 0) {
                yield put({
                    type: moeActionTypes.UPDATE_MDS_ENQUIRY,
                    data: data.data
                });
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         yield put({
            //             type: moeActionTypes.UPDATE_MDS_ENQUIRY,
            //             data: data.data
            //         });
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* getHlab1502VTM() {
    while (true) {
        let { resolve, reject } = yield take(moeActionTypes.GET_HLAB1502_VTM);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.get, '/moe/listClinicalAlertRules');
            if (data.respCode === 0) {
                yield put({
                    type: moeActionTypes.UPDATE_HLAB1502_VTM,
                    data: data.data
                });
                resolve();
            } else {
                yield call(commRespCodeMapping, data);
                reject();
            }
            // switch (data.respCode) {
            //     case 0: {
            //         yield put({
            //             type: moeActionTypes.UPDATE_HLAB1502_VTM,
            //             data: data.data
            //         });
            //         resolve();
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         reject();
            //         break;
            //     }
            // }
        }, reject);
    }
}

function* saveHlab1502Negative() {
    while (true) {
        yield take(moeActionTypes.SAVE_HLAB1502_NEGATIVE);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/patientAlert');
            if (data.respCode === 0) {
                //get patient allergy list
                yield call(getPatientSummary);
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         //get patient allergy list
            //         yield call(getPatientSummary);
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* deleteHlab1502Negative() {
    while (true) {
        let { params } = yield take(moeActionTypes.DELETE_HLAB1502_NEGATIVE);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.delete, '/moe/patientAlert/' + params.alertSeqNo + '/' + params.deleteReason + '/' + params.version);
            if (data.respCode === 0) {
                //get patient allergy list
                yield call(getPatientSummary);
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         //get patient allergy list
            //         yield call(getPatientSummary);
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

export function* moeLogout() {
    while (true) {
        let { callback } = yield take(moeActionTypes.LOGOUT);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/logout');
            if (data.respCode === 0 || data.respCode === 1) {
                if (typeof (callback) === 'function') {
                    callback();
                }
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         if (typeof (callback) === 'function') {
            //             callback();
            //         }
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* addNoKnownAllergy() {
    while (true) {
        yield take(moeActionTypes.ADD_NO_KNOWN_ALLERGY);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.post, '/moe/patientAllergy');
            if (data.respCode === 0) {
                //get patient allergy list
                yield call(getPatientSummary);
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         //get patient allergy list
            //         yield call(getPatientSummary);
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* reconfirmAllergy() {
    while (true) {
        yield take(moeActionTypes.RECONFIRM_ALLERGY);
        yield call(commonSaga, function* () {
            let { data } = yield call(axiosMoe.put, '/moe/bulkUpdatePatientAllergy');
            if (data.respCode === 0) {
                //get patient allergy list
                yield call(getPatientSummary);
            } else {
                yield call(commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         //get patient allergy list
            //         yield call(getPatientSummary);
            //         break;
            //     }
            //     default: {
            //         yield call(commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

export const moeSaga = [
    moeLogin,
    searchDrug,
    // getGrugByid,
    getCodeList,
    saveDrug,
    deleteOrder,
    getOrder,
    getSpecialIntervalText,
    convertDrug,
    getTotalDangerDrug,
    allergyChecking,
    getMDSEnq,
    getHlab1502VTM,
    saveHlab1502Negative,
    getDeptFavouriteList,
    deleteHlab1502Negative,
    addNoKnownAllergy,
    reconfirmAllergy,
    cancelOrder,
    moeLogout
];
