import { take, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {axios} from '../../../services/axiosInstance';
import * as eHRActionType from '../../actions/EHR/eHRActionType';
import * as commonType from '../../actions/common/commonActionType';
import * as mainFrameActionType from '../../actions/mainFrame/mainFrameActionType';
import accessRightEnum from '../../../enums/accessRightEnum';
import Enum from '../../../enums/enum';
import { openCommonMessage } from '../../actions/message/messageAction';
import * as messageType from '../../actions/message/messageActionType';
import * as patientActionType from '../../actions/patient/patientActionType';
import * as patientAction from '../../actions/patient/patientAction';
import * as mainFrameAction from '../../actions/mainFrame/mainFrameAction';
import * as eHRUtilities from '../../../utilities/eHRUtilities';
import {alsStartTrans, alsEndTrans} from '../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../als/alsLogSaga';
import * as logActions from '../../actions/als/logAction';

function* getUpdateFromEHRDate() {
    while (true) {
        try{
            let { value } = yield take(eHRActionType.GET_FROM_EHR_DATE);
            yield put(alsStartTrans());

            yield put({
                type: eHRActionType.UPDATE_FROM_EHR_DATE,
                updateFromEHRDate: value
            });

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* getEHRIdentity() {
    while (true) {
        try {
            let { EHRIdentityData, eHREhrisUrl, callBack } = yield take(eHRActionType.GET_EHR_EPMI);
            yield put(alsStartTrans());

            if (EHRIdentityData && EHRIdentityData.identityList && EHRIdentityData.identityList[0].ehrNo !== '') {
                let { data } = yield call(
                    axios.post,
                    eHREhrisUrl,
                    EHRIdentityData
                );
                yield put({
                    type: eHRActionType.PUT_EHR_EPMI,
                    participantList: data.data.participantList,
                    openEHRIdentityDialog: true
                });
                callBack && callBack(data);
            }
        } catch (error) {
            // eHR API error
            yield put(openCommonMessage({msgCode: '130100'}));
            yield put({ type: mainFrameActionType.DELETE_SUB_TABS, params: accessRightEnum.eHRRegistered });
            throw error;
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* closeEHRIdentityDialog() {
    while (true) {
        try {
            let { type } = yield take(eHRActionType.CLOSE_EHR_IDENTITY_DIALOG);
            yield put(alsStartTrans());

            yield call({
                type: eHRActionType.PUT_EHR_EPMI,
                participantList: [],
                openEHRIdentityDialog: false
            });

        } catch (error) {
            yield put({
                type: eHRActionType.PUT_EHR_EPMI,
                participantList: [],
                openEHRIdentityDialog: false
            });
            yield put({ type: mainFrameActionType.DELETE_SUB_TABS, params: accessRightEnum.eHRRegistered });
            console.log('error checking :' + error);
            yield put(logActions.auditError(error && error.message));
        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* updateEHRPatientStatus() {
    while (true) {
        let { params } = yield take(eHRActionType.UPDATE_EHR_PATIENT_STATUS);
        try {
            yield put(alsStartTrans());
            let { data } = yield call(axios.post, '/patient/ehrPatientStatusUpdate', params);
            if (data.data.resultVal === 'Y') {
                yield put({
                    type: patientActionType.PUT_EHR_PATIENT_STATUS,
                    data: params.isMatch
                });
                // Update and
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130104'
                    }
                });
            } else if (data.data.resultVal === 'N') {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032'
                    }
                });
            }
        } catch (error) {
            // eHR API error
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
            yield put(logActions.auditError(error && error.message));
        } finally{
            yield put(alsEndTrans());
        }
    }
}

function* updatePatient() {
    while (true) {
        let { params, callback, loginName, pcName, ipAddr } = yield take(eHRActionType.UPDATE_PATIENT);
        try {
            yield put(alsStartTrans());
            let { data } = yield call(axios.post, '/patient/updatePatient', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110102',
                        showSnackbar: true
                    }
                });
                callback && callback();

                // Update the EHRPatientStatusParams
                let updateEHRPatientStatusParams = eHRUtilities.getEHRPatientStatusUpdateInfo(
                    params.patientEhr.ehrNo, Enum.IS_MATCH_STATUS, data.data);
                yield put({
                    type: eHRActionType.UPDATE_EHR_PATIENT_STATUS,
                    params: updateEHRPatientStatusParams
                });
                // Need check the user Right in the call api ??
                // let isEHRAccessRight = true;
                // let isEHRSSRegistered = true;
                // let inputParams= eHRUtilities.getEHRISViewerData(params, params.hkId,);
                // let inputParams = {
                //     als: {
                //         clientIp: ipAddr ? ipAddr : '',
                //         correlationId: '1',
                //         userId: loginName ? loginName : '',
                //         workstationId: pcName ? pcName : ''
                //     },

                //     ehrNo: params.patientEhr.ehrNo,
                //     hkId: params.hkId,
                //     identityDocumentNo: params.identityDocumentNo,
                //     typeOfIdentityDocument: params.typeOfIdentityDocument

                // };
                // Close EHR identity dialog
                yield put({
                    type: eHRActionType.RESET_ALL
                });

                yield put({
                    type: eHRActionType.CLOSE_EHR_IDENTITY_DIALOG
                });
                // Open the Tabs
                // yield put(mainFrameAction.addTabs(eHRUtilities.getEHRTabInfo()));
                // Call the eHR Viewer
                // yield put(patientAction.getEHRUrl(inputParams, isEHRAccessRight, isEHRSSRegistered));
            } else if (data.respCode === 1) {
                //todo parameterException
            } else if (data.respCode === 3) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110127'
                    }
                });
            } else if (data.respCode === 103) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110128'
                    }
                });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110129'
                    }
                });
            } else if (data.respCode === 104) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110130'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110138'
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
        } finally {
            yield put(alsEndTrans());
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        }
    }
}

export const eHRSaga = [
    getEHRIdentity,
    closeEHRIdentityDialog,
    getUpdateFromEHRDate,
    updatePatient,
    updateEHRPatientStatus
];