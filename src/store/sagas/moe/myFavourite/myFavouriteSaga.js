import { take, call, put } from 'redux-saga/effects';
import axiosMoe from '../../../../services/moeAxiosInstance';
import * as moeActionTypes from '../../../actions/moe/moeActionType';
// import * as commonTypes from '../../../actions/common/commonActionType';
import * as prescriptionUtilities from '../../../../utilities/prescriptionUtilities';
import * as moeSaga from '../moeSaga';
import * as messageType from '../../../actions/message/messageActionType';
import {
    MOE_MSG_CODE
} from '../../../../constants/message/moe/commonRespMsgCodeMapping';

// import {
//     callMyFavourit
// } from '../moeSaga';

// function* catchError(error) {
//     yield put({
//         type: commonTypes.OPEN_ERROR_MESSAGE,
//         error: error.message ? error.message : 'Service error',
//         data: error
//     });
// }

// function* showErrorDialog(data) {
//     yield put({
//         type: moeActionTypes.LOGIN_ERROR,
//         error: data.errMsg ? data.errMsg : 'Service error',
//         data: data.data
//     });
// }

// function* getMyFavouriteList(userId) {
//     //get my favourite list
//     let myFavouriteParams = { 'userId': userId };//data.data.user.loginId
//     let { data } = yield call(axiosMoe.post, '/moe/listMyFavourite', myFavouriteParams);
//     if (data.respCode === 0) {
//         let updateMyFavouriteData = {};
//         updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(data);
//         yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
//     } else {
//         showErrorDialog(data);
//     }
// }

function* addToMyFavourite() {
    while (true) {
        let { params, drugSet, codeList, isSave, favKeyword, delMultipleSet, callback, isSkipSave } = yield take(moeActionTypes.ADD_TO_MY_FAVOURITE);
        yield call(moeSaga.commonSaga, function* () {
            let url = '';
            if (isSave) {
                url = '/moe/saveMyFavourite';
            } else {
                if ((drugSet && drugSet.myFavouriteId && drugSet.myFavouriteId !== -1)) {
                    url = '/moe/updateMyFavourites';
                } else {
                    url = '/moe/saveMyFavourite';
                }
            }

            let updateMyFavouriteData = {
                // showDeleteDialog: false,
                // deleteParentItem: null,
                // deleteChildItem: null,
                showDugSetDialog: null,
                drugSet: null,
                //clear edit panel
                showEditPanel: false,
                curDrugDetail: null,
                drugSetItem: null,
                //clear duplicate
                openDuplicateDialog: false,
                duplicateDrugList: [],
                selectedDeletedList: []
            };

            if (!isSkipSave) {
                let processedData = prescriptionUtilities.getParamsForMyFavourite(params, drugSet, codeList);
                let { data } = yield call(axiosMoe.post, url, processedData);
                if (data.respCode === 0) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: MOE_MSG_CODE.MOE_ADD_TO_MY_FAV_SUCCESS,
                            showSnackbar: true
                        }
                    });
                } else {
                    yield call(moeSaga.commRespCodeMapping, data);
                }

                // if (data.respCode !== 0) {
                //     yield put({
                //         type: commonTypes.OPEN_ERROR_MESSAGE,
                //         error: data.errMsg ? data.errMsg : 'Service error',
                //         data: data.data
                //     });
                // }
            }

            //batch delete set start
            if (delMultipleSet && delMultipleSet.length > 0) {
                let delMulSetParams = [];

                //update delMultipleSet version start
                let myFavouriteDataDel = yield call(axiosMoe.post, '/moe/listMyFavourite', { 'searchString': favKeyword });
                if (myFavouriteDataDel.data.respCode === 0) {
                    delMulSetParams = delMultipleSet.filter(item => {
                        let exist = myFavouriteDataDel.data.data.find(ele => ele.myFavouriteId === item.myFavouriteId);
                        item.version = exist.version;
                        return item;
                    });
                } else {
                    yield call(moeSaga.commRespCodeMapping, myFavouriteDataDel.data);
                }
                //update delMultipleSet version end
                // switch (myFavouriteDataDel.data.respCode) {
                //     case 0: {
                //         delMulSetParams = delMultipleSet.filter(item => {
                //             let exist = myFavouriteDataDel.data.data.find(ele => ele.myFavouriteId === item.myFavouriteId);
                //             item.version = exist.version;
                //             return item;
                //         });
                //         break;
                //     }
                //     default: {
                //         yield call(moeSaga.commRespCodeMapping, myFavouriteDataDel.data);
                //         break;
                //     }
                // }


                let delMultipleSetData = yield call(axiosMoe.delete, '/moe/deleteFavouriteList', { data: delMulSetParams });
                if (delMultipleSetData.status !== 200 || (delMultipleSetData.data && delMultipleSetData.data.respCode !== 0)) {
                    yield call(moeSaga.commRespCodeMapping, delMultipleSetData.data);
                }
            }
            //batch delete set end

            //get my favourite list
            let myFavouriteData = yield call(axiosMoe.post, '/moe/listMyFavourite', { 'searchString': favKeyword });
            if (myFavouriteData.data.respCode === 0) {
                if (!favKeyword)
                    updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
                updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);
            } else {
                yield call(moeSaga.commRespCodeMapping, myFavouriteData.data);
            }
            // switch (myFavouriteData.data.respCode) {
            //     case 0: {
            //         if (!favKeyword)
            //             updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
            //         updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);
            //         break;
            //     }
            //     default: {
            //         yield call(moeSaga.commRespCodeMapping, myFavouriteData.data);
            //         break;
            //     }
            // }

            if (callback && typeof (callback) === 'function') {
                callback();
            }
            yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
        });
    }
}

function* deleteMyFavourite() {
    while (true) {
        let { params, isParent, schFavInputVal } = yield take(moeActionTypes.DELETE_FAVOURITE);
        yield call(moeSaga.commonSaga, function* () {
            let url = '';
            if (isParent) {
                url = '/moe/deleteMyFavourites';
            } else {
                url = '/moe/deleteMyFavouriteDetail';
            }
            let { data } = yield call(axiosMoe.post, url, params);
            if (data.respCode === 0) {
                let updateMyFavouriteData = {};
                // updateMyFavouriteData.showDeleteDialog = false;
                // updateMyFavouriteData.deleteParentItem = null;
                // updateMyFavouriteData.deleteChildItem = null;
                updateMyFavouriteData.showEditPanel = false;
                updateMyFavouriteData.curDrugDetail = null;
                updateMyFavouriteData.drugSetItem = null;

                //get my favourite list
                let myFavouriteParams = { 'searchString': schFavInputVal };//data.data.user.loginId
                let myFavouriteData = yield call(axiosMoe.post, '/moe/listMyFavourite', myFavouriteParams);
                if (myFavouriteData.status === 200 && myFavouriteData.data.respCode === 0) {
                    if (!schFavInputVal)
                        updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
                    updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);

                } else {
                    // yield put({
                    //     type: commonTypes.OPEN_ERROR_MESSAGE,
                    //     error: myFavouriteData.data.errMsg ? myFavouriteData.data.errMsg : 'Service error',
                    //     data: myFavouriteData.data.data
                    // });
                    yield call(moeSaga.commRespCodeMapping, myFavouriteData.data);
                }

                yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
            } else {
                yield call(moeSaga.commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         let updateMyFavouriteData = {};
            //         updateMyFavouriteData.showDeleteDialog = false;
            //         updateMyFavouriteData.deleteParentItem = null;
            //         updateMyFavouriteData.deleteChildItem = null;
            //         updateMyFavouriteData.showEditPanel = false;
            //         updateMyFavouriteData.curDrugDetail = null;
            //         updateMyFavouriteData.drugSetItem = null;

            //         //get my favourite list
            //         let myFavouriteParams = { 'searchString': schFavInputVal };//data.data.user.loginId
            //         let myFavouriteData = yield call(axiosMoe.post, '/moe/listMyFavourite', myFavouriteParams);
            //         if (myFavouriteData.status === 200 && myFavouriteData.data.respCode === 0) {
            //             if (!schFavInputVal)
            //                 updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
            //             updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);
            //         } else {
            //             yield put({
            //                 type: commonTypes.OPEN_ERROR_MESSAGE,
            //                 error: myFavouriteData.data.errMsg ? myFavouriteData.data.errMsg : 'Service error',
            //                 data: myFavouriteData.data.data
            //             });
            //         }

            //         yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
            //         break;
            //     }
            //     default: {
            //         yield call(moeSaga.commRespCodeMapping, data);
            //         break;
            //     }
            // }
        });
    }
}

function* filterMyFavourrite() {
    while (true) {
        let { params } = yield take(moeActionTypes.FILTER_MY_FAVOURITE);
        // yield call(moeSaga.commonSaga, function* () {
        // let myFavouriteData = yield call(axiosMoe.post, '/moe/listMyFavourite', params);
        // if (myFavouriteData.data.respCode === 0) {
        //     let updateMyFavouriteData = {};
        //     updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
        //     updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);

        //     yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
        // }
        // else {
        //     yield put({
        //         type: commonTypes.OPEN_ERROR_MESSAGE,
        //         error: myFavouriteData.data.errMsg ? myFavouriteData.data.errMsg : 'Service error',
        //         data: myFavouriteData.data.data
        //     });
        // }
        // });
        try {
            let { data } = yield call(axiosMoe.post, '/moe/listMyFavourite', params);
            if (data.respCode === 0) {
                let updateMyFavouriteData = {};
                if (!params || !params.searchString)
                    updateMyFavouriteData.myFavouriteListFromBackend = data.data;
                updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(data.data);

                yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
            } else {
                yield call(moeSaga.commRespCodeMapping, data);
            }
            // switch (data.respCode) {
            //     case 0: {
            //         let updateMyFavouriteData = {};
            //         if (!params || !params.searchString)
            //             updateMyFavouriteData.myFavouriteListFromBackend = data.data;
            //         updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(data.data);

            //         yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
            //         break;
            //     }
            //     default: {
            //         yield call(moeSaga.commRespCodeMapping, data);
            //         break;
            //     }
            // }
        } catch (error) {
            yield call(moeSaga.catchError, error);
        }
    }
}

function* reorderMyFavourite() {
    while (true) {
        let { orderParams, searchParams, isOrderDetail } = yield take(moeActionTypes.REORDER_MY_FAV);
        yield call(moeSaga.commonSaga, function* () {
            let orderedData = null;
            if (isOrderDetail) {
                orderedData = yield call(axiosMoe.post, '/moe/orderMyFavouriteDetail', orderParams);
            }
            else {
                orderedData = yield call(axiosMoe.post, '/moe/orderMyFavourites', orderParams);
            }
            if (orderedData.data.respCode === 0) {
                let myFavouriteData = yield call(axiosMoe.post, '/moe/listMyFavourite', searchParams);
                if (myFavouriteData.data.respCode === 0) {
                    let updateMyFavouriteData = {};
                    if (!searchParams || !searchParams.searchString)
                        updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
                    updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);

                    yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
                } else {
                    yield call(moeSaga.commRespCodeMapping, myFavouriteData.data);
                }
            } else {
                yield call(moeSaga.commRespCodeMapping, orderedData.data);
            }
            // switch (orderedData.data.respCode) {
            //     case 0: {
            //         let myFavouriteData = yield call(axiosMoe.post, '/moe/listMyFavourite', searchParams);
            //         if (myFavouriteData.data.respCode === 0) {
            //             let updateMyFavouriteData = {};
            //             if (!searchParams || !searchParams.searchString)
            //                 updateMyFavouriteData.myFavouriteListFromBackend = myFavouriteData.data.data;
            //             updateMyFavouriteData.myFavouriteList = prescriptionUtilities.getMyFavouriteList(myFavouriteData.data.data);

            //             yield put({ type: moeActionTypes.UPDATE_MY_FAVOURITE_FIELD, updateData: updateMyFavouriteData });
            //         } else {
            //             yield call(moeSaga.commRespCodeMapping, myFavouriteData.data);
            //         }
            //         break;
            //     }
            //     default: {
            //         yield call(moeSaga.commRespCodeMapping, orderedData.data);
            //         break;
            //     }
            // }
        });
    }
}


export const myFavouriteSaga = [
    deleteMyFavourite,
    addToMyFavourite,
    filterMyFavourrite,
    reorderMyFavourite
];