import { take, takeEvery, put, select, call, putResolve } from 'redux-saga/effects';
import * as mainFrameType from '../actions/mainFrame/mainFrameActionType';
import * as messageType from '../actions/message/messageActionType';
import { updateField } from '../actions/mainFrame/mainFrameAction';
import _ from 'lodash';
import storeConfig from '../storeConfig';
import { deleteSubTabs, deleteTabs, changeTabsActive } from '../actions/mainFrame/mainFrameAction';
// import { updateState as updateFeeCollection } from '../actions/payment/feeCollection';
import accessRightEnum from '../../enums/accessRightEnum';
// import { FEE_COLLECTION_PAGE, GFMIS_ROLE_MAPPING } from '../../enums/enum';
// import { PaymentUtil } from '../../utilities';
import * as commonUtilities from '../../utilities/commonUtilities';
import * as rcpSvc from '../../services/rcp/rcpService';
import doCloseFuncSrc from '../../constants/doCloseFuncSrc';
import { alsStartTrans, alsEndTrans } from '../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from './als/alsLogSaga';
import * as logActions from '../actions/als/logAction';
import * as commonType from '../actions/common/commonActionType';
import * as medicalHistoriesActionType from '../actions/medicalHistories/medicalHistoriesActionType';
import { getActivityKeyAfterDelete } from '../reducers/mainFrameReducer';

function* skipTab() {
    while (true) {
        try {
            let { accessRightCd, params, checkExist, componentParams } = yield take(mainFrameType.SKIP_TAB);
            yield put(alsStartTrans());

            if (accessRightCd) {
                const state = storeConfig.store.getState();
                let tabObj = _.cloneDeep(state.login.accessRights.find(item => item.name === accessRightCd));
                if (tabObj) {
                    params?.validAccessRightCallBack && params.validAccessRightCallBack();

                    tabObj.params = params;
                    if (tabObj.spaPrefix) {
                        tabObj.spaParams = params;
                    }
                    if (componentParams != null)
                        tabObj.componentParams = componentParams;
                    if (checkExist) {
                        if (state.mainFrame.tabs.findIndex(item => item.name === tabObj.name) > -1 ||
                            state.mainFrame.subTabs.findIndex(item => item.name === tabObj.name) > -1) {
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110040'
                                }
                            });
                        } else {
                            yield put({ type: mainFrameType.ADD_TABS, params: tabObj });
                        }
                    } else {
                        yield put({ type: mainFrameType.ADD_TABS, params: tabObj });
                    }
                }
                else {
                    yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '115011',
                            variant: 'error',
                            params: [
                                {
                                    name: 'MSG',
                                    value: `You don't have the access right ([${accessRightCd}] ${commonUtilities.getKeyByValue(accessRightEnum, accessRightCd)}) to access this page!`
                                }
                            ]
                        }
                    });
                    // const tabs = yield select(state => state.mainFrame.tabs);
                    // if (tabs.length > 0) {
                    //     yield put({ type: mainFrameType.RESET_ALL });
                    // }
                    // if (tabs.length === 0) {
                    //     yield put({
                    //         type: mainFrameType.ADD_TABS,
                    //         params: {
                    //             name: accessRightEnum.patientSpec,
                    //             label: `${commonUtilities.getPatientCall()}-specific Function(s)`,
                    //             disableClose: true,
                    //             path: 'indexPatient',
                    //             deep: 1,
                    //             isPatRequired: 'N'
                    //         }
                    //     });
                    //     yield put({ type: patientSpecFuncType.UPDATE_PATIENT_LIST_FIELD, isFocusSearchInput: true});
                    // }
                }
            }

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* redirectTab() {
    while (true) {
        try {
            let { sourceAccessId, destAccessId, params } = yield take(mainFrameType.REDIRECT_TAB);
            yield put(alsStartTrans());

            const state = storeConfig.store.getState();
            if (destAccessId) {
                let tabObj = state.login.accessRights.find(item => item.name === destAccessId);
                if (tabObj) {
                    tabObj.params = params;
                    yield put({ type: mainFrameType.ADD_TABS, params: tabObj });
                }
            }
            if (sourceAccessId) {
                let tabObj = state.login.accessRights.find(item => item.name === sourceAccessId);
                if (tabObj) {
                    if (tabObj.isPatRequired === 'Y') {
                        yield put({ type: mainFrameType.DELETE_SUB_TABS, params: tabObj.name });
                    } else {
                        yield put({ type: mainFrameType.DELETE_TABS, params: tabObj.name });
                    }
                }
            }

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* deleteSubTabsByOtherWay() {
    while (true) {
        try {
            let { params } = yield take(mainFrameType.DELETE_SUB_TABS_BY_OTHERWAY);
            yield put(alsStartTrans());
            const editModeTabs = yield select(state => state.mainFrame.editModeTabs);
            const name = params.name;
            if (editModeTabs.find(item => item.name === name)) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110018',
                        btnActions: {
                            btn1Click: () => {
                                storeConfig.store.dispatch(deleteSubTabs(name));
                            }
                        }
                    }
                });
            } else {
                yield put({ type: mainFrameType.DELETE_SUB_TABS, params: name });
            }
        } catch (error) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put(logActions.auditError(error && error.message));

        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* deleteTabsByOtherWay() {
    while (true) {
        try {
            let { params } = yield take(mainFrameType.DELETE_TABS_BY_OTHERWAY);
            yield put(alsStartTrans());
            const editModeTabs = yield select(state => state.mainFrame.editModeTabs);
            const name = params.name;
            if (editModeTabs.find(item => item.name === name)) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110018',
                        btnActions: {
                            btn1Click: () => {
                                storeConfig.store.dispatch(deleteTabs(name));
                            }
                        }
                    }
                });
            } else {
                yield put({ type: mainFrameType.DELETE_TABS, params: name });
            }
        } catch (error) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put(logActions.auditError(error && error.message));
        } finally {
            yield put(alsEndTrans());
        }
    }
}


// function* listenDoClose(){
//     while(true){

//         try{
//           let{tab}=yield take(mainFrameType.DO_CLOSE_TAB);
//         //   let actions=tab.isPatRequired==='Y'?:
//           yield put({
//               type:mainFrameType.DELETE_SUB_TABS()
//           });
//         }catch(error){
//             yield put({
//                 type: messageType.OPEN_COMMON_MESSAGE,
//                 payload: {
//                     msgCode: '110031'
//                 }
//             });
//         }
//     }
// }

function* addTabs() {
    while (true) {
        try {
            let { params: _params, isDry } = yield take(mainFrameType.ADD_TABS);
            const params = _.cloneDeep(_params);
            yield put(alsStartTrans());

            if (params) {
                const noSuffixName = params.name.split('-')[0];

                const mainFrameState = yield select(state => state.mainFrame);
                const patientInfo = yield select(state => state.patient.patientInfo);
                let newState = _.cloneDeep(mainFrameState);
                let runFlag = true;
                // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
                // let loginUserRoleList = yield select(state => state.common.loginUserRoleList);
                // let userIsNotCounterRole = commonUtilities.checkingIsNotCounterRole(loginUserRoleList);
                if(params.antActiveTab){
                    newState.antActiveTab=params.antActiveTab;
                }
                if (params.params && params.params.medicalHistoriesActiveTab) {
                    yield put({
                        type: medicalHistoriesActionType.SAVE_MEDICAL_HISTORY_ACTIVE_TAB,
                        activeTab: params.params.medicalHistoriesActiveTab
                    });
                }
                if (params.isPatRequired === 'Y') {
                    if (params.name === accessRightEnum.patientSummary) {
                        // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
                        // if (userIsNotCounterRole) {
                        //     if (newState.subTabs.filter(item => item.name !== accessRightEnum.patientSummary && item.name !== accessRightEnum.viewPatientDetails).length > 0) {
                        //         yield put({
                        //             type: messageType.OPEN_COMMON_MESSAGE,
                        //             payload: {
                        //                 msgCode: '110142',
                        //                 params: [{ name: 'PATIENTCALL', value: _.upperFirst(commonUtilities.getPatientCall()) },
                        //                 { name: 'PATIENTCALL_LOWERFIRST', value: _.lowerFirst(commonUtilities.getPatientCall()) }]
                        //             }
                        //         });
                        //         runFlag = false;
                        //     }
                        // }
                    } else if (params.name === accessRightEnum.clientServiceView) {
                        const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                        const caseNo = caseNoInfo ? caseNoInfo.caseNo : '';
                        if (!caseNo) {
                            //prompt message.
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110043'
                                }
                            });
                            runFlag = false;
                        } else {
                            let resp = yield call(rcpSvc.listEncntrByCaseNo, caseNo);
                            if (resp && resp.data.respCode === 0) {
                                const { data } = resp;
                                if (data.data.length === 0) {
                                    //propmt message.
                                    yield put({
                                        type: messageType.OPEN_COMMON_MESSAGE,
                                        payload: {
                                            msgCode: '111406'
                                        }
                                    });
                                    runFlag = false;
                                }
                            } else {
                                //prompt message.
                                yield put({
                                    type: messageType.OPEN_COMMON_MESSAGE,
                                    payload: {
                                        msgCode: '110031'
                                    }
                                });
                                runFlag = false;
                            }
                        }
                    } else if (params.name === accessRightEnum.viewPatientDetails) {
                        runFlag = true;
                    } else {
                        // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
                        // if (userIsNotCounterRole) {
                        //     let patientSummaryTabIndex = newState.subTabs.findIndex(item => item.name === accessRightEnum.patientSummary);
                        //     if (patientSummaryTabIndex !== -1) {
                        //         newState.subTabs.splice(patientSummaryTabIndex, 1);
                        //     }
                        // }

                        //Added by Renny for close encounter summary when open other subtabs on 20200520
                        // let encounterSummaryTabIndex = newState.subTabs.findIndex(item => item.name === accessRightEnum.encounterSummary);
                        // if (encounterSummaryTabIndex !== -1) {
                        //     newState.subTabs.splice(encounterSummaryTabIndex, 1);
                        // }
                        //End added by Renny for close encounter summary when open other subtabs on 20200520
                    }
                    if (runFlag) {
                        let tabsIndex = newState.tabs.findIndex(item => item.name === accessRightEnum.patientSpec);
                        let subTabsIndex = newState.subTabs.findIndex(item => item.name.split('-')[0] === noSuffixName);
                        if (tabsIndex === -1) {
                            let tab = {
                                name: accessRightEnum.patientSpec,
                                label: `${commonUtilities.getPatientCall()}-specific Function(s)`,
                                disableClose: true,
                                path: 'indexPatient',
                                doCloseFunc: null,
                                deep: 1
                            };
                            newState.tabs.splice(0, 0, tab);
                            newState.tabsActiveKey = tab.name;
                        } else {
                            newState.tabsActiveKey = newState.tabs[tabsIndex].name;
                        }

                        if (subTabsIndex === -1) {
                            let subTab = {
                                name: params.name,
                                label: params.label,
                                disableClose: params.disableClose,
                                params: params.params,
                                path: params.path,
                                componentParams: params.componentParams,
                                doCloseFunc: null,
                                deep: 2,
                                spaPrefix: params.spaPrefix, //Added by Renny for spa link prefix on 20200324
                                spaParams: params.spaParams //Added by Demi for spa params on 20210927
                            };
                            newState.subTabs.push(subTab);
                            if (!isDry) {
                                newState.subTabsActiveKey = subTab.name;
                            }
                        } else {
                            // Added by Renny refresh ES when click menu
                            if (newState.subTabs[subTabsIndex].name === accessRightEnum.encounterSummary
                                && mainFrameState.subTabsActiveKey !== newState.subTabsActiveKey) {
                                if (typeof newState.subTabs[subTabsIndex].refreshTabFunc === 'function')
                                    newState.subTabs[subTabsIndex].refreshTabFunc();
                            }
                            // End added by Renny refresh ES when click menu
                            newState.subTabs[subTabsIndex].componentParams = params.componentParams;
                            if(!isDry) {
                                newState.subTabsActiveKey = newState.subTabs[subTabsIndex].name;
                            }
                        }
                    }
                } else {
                    if (params.name === accessRightEnum.registration) {
                        if (patientInfo) {
                            yield put({ type: mainFrameType.PUT_ADD_TABS, newState });
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110046',
                                    params: [{ name: 'PATIENTCALL', value: commonUtilities.getPatientCall() }]
                                }
                            });
                            runFlag = false;
                        } else {
                            let patientSpecFuncIndex = newState.tabs.findIndex(item => item.name === accessRightEnum.patientSpec);
                            if (patientSpecFuncIndex != -1) {
                                newState.tabs.splice(patientSpecFuncIndex, 1);
                            }
                        }
                    } else if (params.name == accessRightEnum.patientSpec) {
                        let regOrSumTabsIndex = newState.tabs.findIndex(item => item.name == accessRightEnum.registration);
                        if (regOrSumTabsIndex != -1) {
                            yield put({ type: mainFrameType.PUT_ADD_TABS, newState });
                            yield put({
                                type: messageType.OPEN_COMMON_MESSAGE,
                                payload: {
                                    msgCode: '110045',
                                    params: [{ name: 'PATIENTCALL', value: commonUtilities.getPatientCall() }]
                                }
                            });
                            runFlag = false;
                        }
                    }
                    // else if (params.name === accessRightEnum.feeCollectionMaintenance) {
                    //     const accessRights = yield select(state => state.login.accessRights);
                    //     let feeCollectionTab = accessRights.find(item => item.name == accessRightEnum.feeCollection);
                    //     if (feeCollectionTab) {
                    //         params = {
                    //             name: feeCollectionTab.name,
                    //             label: feeCollectionTab.label,
                    //             path: feeCollectionTab.path,
                    //             spaPrefix: feeCollectionTab.spaPrefix
                    //         };
                    //         const role = PaymentUtil.getRoleOfPayment();
                    //         if (role === GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR) {
                    //             const feeCollectionTabIndex = newState.tabs.findIndex(item => item.name == accessRightEnum.feeCollection);
                    //             if (feeCollectionTabIndex > -1) {
                    //                 yield put(updateFeeCollection({
                    //                     feeActiveTab: FEE_COLLECTION_PAGE.feeCollectionMaintenance
                    //                 }));
                    //             } else {
                    //                 params.params = {
                    //                     ...params.params,
                    //                     feeActiveTab: FEE_COLLECTION_PAGE.feeCollectionMaintenance
                    //                 };
                    //             }
                    //         }
                    //     } else {
                    //         runFlag = false;
                    //     }
                    // }

                    if (runFlag) {
                        let tabsIndex = newState.tabs.findIndex(item => item.name.split('-')[0] === noSuffixName);
                        if (tabsIndex === -1) {
                            let tab = {
                                name: params.name,
                                label: params.label,
                                disableClose: params.disableClose,
                                params: params.params,
                                path: params.path,
                                componentParams: params.componentParams,
                                doCloseFunc: null,
                                deep: 1,
                                spaPrefix: params.spaPrefix,//Added by Renny for spa link prefix on 20200324
                                spaParams: params.spaParams //Added by Demi for spa params on 20210927
                            };
                            newState.tabs.push(tab);
                            if (!isDry) {
                                newState.tabsActiveKey = tab.name;
                            }
                        } else {
                            newState.tabs[tabsIndex].params = params.params;
                            newState.tabs[tabsIndex].componentParams = params.componentParams;
                            if(!isDry) {
                                newState.tabsActiveKey = newState.tabs[tabsIndex].name;
                            }
                        }
                    }
                }
                yield put({ type: mainFrameType.PUT_ADD_TABS, newState });
            }
        } catch (error) {

            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put(logActions.auditError(error && error.message));
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchDeleteTabs() {
    while (true) {
        try {
            const { params } = yield take(mainFrameType.DELETE_TABS);
            yield put(alsStartTrans());
            const state = yield select(state => state.mainFrame);
            let newState = { ...state };
            newState.tabs = state.tabs.filter(item => item.name !== params);
            if (newState.tabs.length === 0) {
                newState.tabsActiveKey = '';
            } else {
                newState.tabsActiveKey = getActivityKeyAfterDelete(state.tabsActiveKey, params, state.tabs, newState.tabs);
            }
            newState.editModeTabs = state.editModeTabs.filter(item => item.name !== params);
            if (params == accessRightEnum.registration) {
                let tabsIndex = newState.tabs.findIndex((item) => { return item.name === accessRightEnum.patientSpec; });
                if (tabsIndex === -1) {
                    let tab = {
                        name: accessRightEnum.patientSpec,
                        label: `${commonUtilities.getPatientCall()}-specific Function(s)`,
                        disableClose: true,
                        path: 'indexPatient',
                        doCloseFunc: null,
                        deep: 1
                    };
                    newState.tabs.splice(0, 0, tab);
                    newState.tabsActiveKey = tab.name;
                } else {
                    newState.tabsActiveKey = newState.tabs[tabsIndex].name;
                }
            }
            yield put({ type: mainFrameType.UPDATE_FIELD, updateData: newState });
        } catch (error) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put(logActions.auditError(error && error.message));
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchDeleteSubTabs() {
    while (true) {
        try {
            const { params } = yield take(mainFrameType.DELETE_SUB_TABS);
            yield put(alsStartTrans());
            const state = yield select(state => state.mainFrame);
            let newState = { ...state };
            newState.subTabs = state.subTabs.filter(item => item.name !== params);
            if (newState.subTabs.length === 0) {
                newState.tabsActiveKey = accessRightEnum.patientSpec;
                newState.subTabsActiveKey = '';
            } else {
                newState.subTabsActiveKey = getActivityKeyAfterDelete(state.subTabsActiveKey, params, state.subTabs, newState.subTabs);
            }
            newState.editModeTabs = state.editModeTabs.filter(item => item.name !== params);
            yield put({ type: mainFrameType.UPDATE_FIELD, updateData: newState });
        } catch (error) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110031'
                }
            });
            yield put(logActions.auditError(error && error.message));
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* openFunctionMask() {
    yield takeEvery(mainFrameType.OPEN_FUNCTION_MASK, function* (action) {
        let { functionCd } = action;
        let { maskFunctions = [] } = yield select(state => state.mainFrame);
        if (functionCd) {
            if (maskFunctions.findIndex(item => item === functionCd) === -1) {
                maskFunctions.push(functionCd);
            }
        }

        yield put({ type: mainFrameType.UPDATE_MASK_FUNCTIONS, maskFunctions });
    });
}

function* closeFunctionMask() {
    yield takeEvery(mainFrameType.CLOSE_FUNCTION_MASK, function* (action) {
        let { functionCd } = action;
        let { maskFunctions = [] } = yield select(state => state.mainFrame);
        if (functionCd) {
            const index = maskFunctions.findIndex(item => item === functionCd);
            if (index > -1) {
                maskFunctions.splice(index, 1);
            }
        }

        yield put({ type: mainFrameType.UPDATE_MASK_FUNCTIONS, maskFunctions });
    });
}

// Added by Renny close all subTabs exclude excludeTabs
function* closePatientRelativeTabs() {
    yield alsTakeEvery(mainFrameType.CLOSE_PATIENT_RELATIVE_TABS, function* (action) {
        const { excludeTabs, callback } = action;
        let subTabs = yield select(state => state.mainFrame.subTabs);
        // const { subTabs, deleteSubTabs, changeTabsActive, loginUserRoleList } = this.props;//NOSONAR
        let tabList = _.cloneDeep(subTabs);

        // // Updated By Tim: Base role = CIMS-COUNTER -> Always open Patient Summary
        // let cimsCounterRoleList = loginUserRoleList.filter(item => item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-COUNTER');
        // if (cimsCounterRoleList.length > 0) {
        //     let patientSummaryTabIndex = tabList.findIndex(item => item.name === accessRightEnum.patientSummary);
        //     if (patientSummaryTabIndex !== -1) {
        //         tabList.splice(patientSummaryTabIndex, 1);
        //     }
        // }
        // //End Base role = CIMS-COUNTER -> Always open Patient Summary
        for (let i = 0; i < excludeTabs.length; i++) {
            tabList.splice(tabList.findIndex(item => item.name === excludeTabs[i]), 1);
        }
        let delFunc = (deep, name) => {
            if (parseInt(deep) === 2) {
                storeConfig.store.dispatch(deleteSubTabs(name));
            }
        };

        yield putResolve({
            type: mainFrameType.UPDATE_FIELD,
            updateData: { curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON }
        });

        //send doCloseSrc params to closeAllTabs funciont by Demi 20201218
        commonUtilities.closeAllTabs(tabList, delFunc, (deep, key) => { storeConfig.store.dispatch(changeTabsActive(deep, key)); }, doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON).then(result => {
            if (result) {
                if (typeof callback === 'function') callback();
            }
            storeConfig.store.dispatch(updateField({ curCloseTabMethodType: null }));
        });
    });
}
// End added by Renny close all subTabs exclude excludeTabs

export const mainFrameSaga = [
    skipTab,
    redirectTab,
    deleteSubTabsByOtherWay,
    deleteTabsByOtherWay,
    addTabs,
    openFunctionMask,
    closeFunctionMask,
    closePatientRelativeTabs,
    fetchDeleteTabs,
    fetchDeleteSubTabs
];
