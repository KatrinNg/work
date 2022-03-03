import { take, call, put, takeEvery, select } from 'redux-saga/effects';
import { maskAxios } from '../../../services/axiosInstance';
import _ from 'lodash';
import * as RegistrationType from '../../actions/registration/registrationActionType';
import * as commonType from '../../actions/common/commonActionType';
import * as mainFrameType from '../../actions/mainFrame/mainFrameActionType';
import * as patientType from '../../actions/patient/patientActionType';
import ButtonStatusEnum from '../../../enums/registration/buttonStatusEnum';
import * as messageType from '../../actions/message/messageActionType';
import * as PatientUtil from '../../../utilities/patientUtilities';
import * as RegUtil from '../../../utilities/registrationUtilities';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import { SiteParamsUtil } from '../../../utilities';
import { getResetState } from '../../reducers/registration/registrationReducer';
import accessRightEnum from '../../../enums/accessRightEnum';
import Enum, { SERVICE_CODE, PAPER_SIZE_TYPE } from '../../../enums/enum';
// import {
//     patientPhonesBasic
// } from '../../../constants/registration/registrationConstants';
import * as RegistrationAction from '../../actions/registration/registrationAction';
import { alsStartTrans, alsEndTrans } from '../../actions/als/transactionAction';
import { alsTakeEvery, alsTakeLatest } from '../als/alsLogSaga';
import { dispatch, getState } from '../../util';
import {familyNoTypes, patientBaseInfoBasic, patientContactInfoBasic} from '../../../constants/registration/registrationConstants';
import * as commonAction from '../../actions/common/commonAction';
import * as mainFrameAction from '../../actions/mainFrame/mainFrameAction';
import * as patientAction from '../../actions/patient/patientAction';
import storeConfig from '../../storeConfig';
import { format } from 'date-fns';
import { getPaperSize, print } from '../../../utilities/printUtilities';


function* updatePatient() {
    while (true) {
        let { params, callback } = yield take(RegistrationType.UPDATE_PATIENT);
        try {
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/patient/updatePatient', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110102',
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            } else if (data.respCode === 1) {
                if (data.data) {
                    /**Special handle: old data english name too long */
                    if (data.data.findIndex(x => _.toUpper(x) === 'ENGSURNAME' || _.toUpper(x) === 'ENGGIVENAME') > -1) {
                        yield put({ type: RegistrationType.UPDATE_STATE, updateData: { loadErrorParameter: true } });
                    }
                }
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
                const loginServiceCd = yield select(state => state.login.service.serviceCd);
                if (data.errMsg && loginServiceCd === SERVICE_CODE.EHS) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '130300',
                            params: [
                                { name: 'HEADER', value: 'PMI New Registration' },
                                { name: 'MESSAGE', value: data.errMsg }
                            ]
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
        } finally {
            yield put(alsEndTrans());
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        }
    }
}

function* savePatient() {
    while (true) {
        let { params, callback } = yield take(RegistrationType.REGISTER_PATIENT);
        try {
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/patient/insertPatient', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110103',
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            } else if (data.respCode === 1) {
                //todo parameterException
            } else if (data.respCode === 3) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110032'
                    }
                });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110127'
                    }
                });
            } else {
                const loginServiceCd = yield select(state => state.login.service.serviceCd);
                if (data.errMsg && loginServiceCd === SERVICE_CODE.EHS) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '130300',
                            params: [
                                { name: 'HEADER', value: 'PMI New Registration' },
                                { name: 'MESSAGE', value: data.errMsg }
                            ]
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
        } finally {
            yield put(alsEndTrans());
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        }
    }
}

function* getPatientById() {
    while (true) {

        try {
            let { patientKey, callback } = yield take(RegistrationType.GET_PATINET_BY_ID);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/patient/getPatient', { 'patientKey': patientKey });
            if (data.respCode === 0) {
                yield put({ type: RegistrationType.SELECTED_PATIENT_BY_ID, data: data.data, callback: callback });
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110130'
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
        }
    }
}

function* selectedPatientById() {
    yield alsTakeEvery(RegistrationType.SELECTED_PATIENT_BY_ID, function* (action) {
        yield put({ type: RegistrationType.INIT_PATIENT_BY_ID, data: action.data });
        yield put({ type: RegistrationType.RESPONSE_SELECTED_PMI });
        action.callback && action.callback();
    });
}

function* initMiscellaneous() {
    yield alsTakeEvery(RegistrationType.INIT_MISCELLANEOUS, function* (action) {
        const { patientById = [] } = action;
        const loginServiceCd = yield select(state => state.login.service.serviceCd);
        const loginClinicCd = yield select(state => state.login.clinic.clinicCd);
        const loginName = yield select(state => state.login.loginInfo.loginName);
        let miscellaneousData = RegUtil.genMiscellaneousData(_.cloneDeep(patientById), loginServiceCd, loginName, loginClinicCd);
        yield put({
            type: RegistrationType.RESPONSE_INIT_MISCELLANEOUS,
            miscellaneousData
        });
    });
}

function* initPatient() {
    yield alsTakeEvery(RegistrationType.INIT_PATIENT_BY_ID, function* (action) {
        let patientById = _.cloneDeep(action.data);
        const countryList = yield select(state => state.patient.countryList) || [];
        if (patientById) {
            //transfer
            patientById = PatientUtil.transferPatientDocumentPair(patientById);
            //sort patient phone
            patientById = PatientUtil.initPatientPhoneSort(patientById);
            //will be abandon
            patientById.hkid = PatientUtil.getHkidFormat(patientById.hkid);

            //cc code init
            let ccCodeChiChar = [];
            const nameChi = patientById.nameChi;
            for (let i = 5; i >= 0; i--) {
                if (patientById[`ccCode${i + 1}`] && nameChi && nameChi[i]) {
                    ccCodeChiChar[i] = nameChi[i];
                }
            }

            //generate miscellaneous data.
            yield put({ type: RegistrationType.INIT_MISCELLANEOUS, patientById });

            //check if patient has single name
            let patientIsSingleName = false;
            if ((patientById.engSurname !== '' && !patientById.engGivename) || (!patientById.engSurname && patientById.engGivename !== '')) {
                patientIsSingleName = true;
            }

            yield put({
                type: RegistrationType.RESPONSE_INIT_PATIENT,
                patientBaseInfo: RegUtil.initPatientBaseInfo(patientById),
                contactPersonList: RegUtil.initPatientContactPerson(patientById, countryList),
                patientSocialData: RegUtil.initPatientSocialData(patientById),
                patientContactInfo: RegUtil.initPatientContactInfo(patientById),
                phoneList: RegUtil.initPatientPhone(patientById.phoneList),
                addressList: RegUtil.initPatientAddress(patientById.addressList),
                assoPersonInfo: RegUtil.initPatientAssoPerson(patientById),
                cgsSpec: patientById?.cgsSpecOut || {},
                patientById,
                ccCodeChiChar,
                patientIsSingleName
            });
        }
    });
}

function* resetAll() {
    yield alsTakeEvery(RegistrationType.RESET_ALL, function* () {
        const codeList = yield select(state => state.registration.codeList);
        const addressList = yield select(state => state.registration.addressList);
        let patInfo=_.cloneDeep(patientBaseInfoBasic);
        patInfo=RegUtil.mapPmiWithProvenDocVal(patInfo);
        yield put({ type: RegistrationType.INIT_MISCELLANEOUS });
        yield put({ type: RegistrationType.RESPONSE_RESET_ALL, codeList, addressList,patInfo });
    });
}

function* fetchCreateNewPMI(patient) {
    const docPairDtos = PatientUtil.getPatientDocumentPair(patient);
    if (docPairDtos && docPairDtos.primaryDocPair) {
        patient.documentPairList = [{
            docNo: docPairDtos.primaryDocPair.docNo,
            docTypeCd: docPairDtos.primaryDocPair.docTypeCd,
            serviceCd: docPairDtos.primaryDocPair.serviceCd,
            isPrimary: 1
        }];
    }

    const codeList = yield select(state => state.registration.codeList);
    const addressList = yield select(state => state.registration.addressList);
    let initState = getResetState({ codeList, addressList });

    //set default gender
    const defaultGender = CommonUtilities.getCurrentLoginSiteParamsByName(Enum.CLINIC_CONFIGNAME.NEW_REG_SEX_DEFAULT);
    initState.patientById.genderCd = defaultGender || '';
    initState.patientById=RegUtil.mapPmiWithProvenDocVal(initState.patientById);
    //set default gender

    initState.patientById = {
        ...initState.patientById,
        ...patient
    };
    initState.patientById = PatientUtil.transferPatientDocumentPair(initState.patientById);
    initState.patientBaseInfo = RegUtil.initPatientBaseInfo(initState.patientById);
    if (patient && patient.phoneList) {
        let phoneList = patient.phoneList.map(phone => phone);
        initState.phoneList = phoneList;
        // yield put(RegistrationAction.blockFirstUpdatePhoneListAndRestore(phoneList));
    }

    // EHS Logic - Default isAppyEhsMember for new PMI registration
    const svcCd = yield select((state) => state.login.service.svcCd);
    const siteId = yield select((state) => state.login.clinic.siteId);
    if (svcCd === SERVICE_CODE.EHS) {
        initState.patientBaseInfo = {
            ...initState.patientBaseInfo,
            isApplyEhsMember: 1,
            patientEhsDto: {
                ...initState.patientBaseInfo.patientEhsDto,
                siteId
            }
        };
    }

    yield put({ type: RegistrationType.RESPONSE_CREATE_NEW_PMI, initState });

    yield put({ type: RegistrationType.INIT_MISCELLANEOUS });
}

function* createNewPMI() {
    yield takeEvery(RegistrationType.CREATE_NEW_PMI, function* (action) {
        let { patient } = action;
        yield call(fetchCreateNewPMI, patient);
    });
}


function* searchPatientApi(params) {
    const siteParams = yield select(state => state.common.siteParams);
    const svcCd = yield select(state => state.login.service.svcCd);
    const siteId = yield select(state => state.login.clinic.siteId);
    const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, svcCd, siteId);
    let url = '';
    if (isNewPmiSearchResultDialog) {
        url = '/patient/searchPmi?';
    } else {
        url = '/patient/patients?';
    }
    for (let p in params) {
        url += `${p}=${encodeURIComponent(params[p])}&`;
    }
    url = url.substring(0, url.length - 1);
    let { data } = yield call(maskAxios.get, url);
    if (data.respCode === 0) {
        return { data };
    } else if (data.respCode === 101) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110101',
                variant: 'error',
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
    return { data };
}

// NOTE Search Patient
function* searchPatient() {
    yield alsTakeEvery(RegistrationType.SEARCH_PATIENT, function* (action) {
        let { searchParams, callback } = action;
        let params = searchParams;
        let { data } = yield call(searchPatientApi, params);
        if (data.respCode === 0) {
            const patientList = data.data;
            let buttonStatus = '';
            if (patientList && patientList.patientDtos && patientList.total === 1 && patientList.patientDtos.length === 1) {
                yield put({
                    type: RegistrationType.SELECTED_PATIENT_BY_ID,
                    data: patientList.patientDtos[0]
                });
                buttonStatus = ButtonStatusEnum.DATA_SELECTED;
                yield call(callback, buttonStatus);
            } else if (patientList && patientList.patientDtos && patientList.patientDtos.length >= 1) {
                yield put({
                    type: RegistrationType.POP_UP_SEARCH_DIALOG,
                    data: patientList,
                    searchParams: searchParams
                });
                yield call(callback, buttonStatus);
            } else {
                yield call(fetchCreateNewPMI);
                // yield put({
                //     type: RegistrationType.UPDATE_STATE,
                //     updateData: { autoFocus: true }
                // });
                buttonStatus = ButtonStatusEnum.ADD;
                yield call(callback, buttonStatus);
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110111',
                        showSnackbar: true
                    }
                });
            }
        }
    });
}
function* findCharByCcCode() {
    yield alsTakeEvery(RegistrationType.FIND_CHAR_BY_CC_CODE, function* (action) {
        let { ccCode, charIndex, updateChiChar, ccCodeList, resetCalling } = action;
        try {
            let { data } = yield call(maskAxios.get, `/cmn/ccCodes?ccCode=${ccCode}`);
            if (data.respCode === 0) {
                updateChiChar && updateChiChar(charIndex, data.data, ccCodeList);
            } else if (data.respCode === 100) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110131'
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
            resetCalling && resetCalling();
        }
    });
}

function* loadPatientRelatedFlag() {
    yield alsTakeEvery(RegistrationType.SELECTED_PATIENT_BY_ID, function* (action) {
        const { data = {} } = action;
        const codeList = yield select(state => state.common.commonCodeList) || {};
        const isProblemPMI = PatientUtil.isProblemPMI(data.documentPairList);
        const isPrimaryUnique = PatientUtil.isPrimaryDocTypeUnique(data.documentPairList, codeList.doc_type);
        yield put({
            type: RegistrationType.LOAD_PATIENT_RELATED_FLAG,
            isProblemPMI,
            isPrimaryUnique
        });
    });
}

function* listValidForProblemPMI() {
    yield alsTakeEvery(RegistrationType.LIST_VALID_FOR_PROBLEM_PMI, function* () {
        const patientById = yield select(state => state.registration.patientById);
        let templist = [patientById];
        yield put({
            type: RegistrationType.PUT_VALID_FOR_PROBLEM_PMI,
            problemDialogList: templist
        });
    });
}

function* confirmProblemPatient() {
    yield alsTakeEvery(RegistrationType.CONFIRM_PROBLEM_PATIENT, function* (action) {
        let { patientKeyList = [], loginName = '', callback = null } = action;
        let callParams = {
            loginName,
            patientKeys: patientKeyList
        };
        let { data } = yield call(maskAxios.post, '/patient/problemPatient', callParams);
        if (data.respCode === 0) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110143',
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
    });
}

function* getBabyInfo() {
    while (true) {
        try {
            let { params, callback } = yield take(RegistrationType.GET_BABYINFO);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/patient/genBabyInfo', params);
            if (data.respCode === 0) {
                callback && callback(data.data);
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
        }
    }
}

function* checkAccessRight() {
    yield alsTakeEvery(RegistrationType.CHECK_ACCESS_RIGHT, function* (action) {
        let { callParams, accessRightCd, callback } = action;
        let isHaveRight = 'N';
        let { data } = yield call(maskAxios.post, '/user/listAccessRightByLoginDto', callParams);
        if (data.respCode === 0) {
            const accessRights = data.data;
            const privileges = accessRights && accessRights.filter(item => item.accessRightType === 'button' && item.status === 'A');
            if (privileges && privileges.length > 0) {
                const rightIndex = privileges.findIndex(item => item.accessRightCd === accessRightCd);
                if (rightIndex > -1) {
                    isHaveRight = 'Y';
                }
            }
        }
        callback && callback(isHaveRight);
    });
}

function* checkAccessRightByStaffId() {
    yield alsTakeEvery(RegistrationType.CHECK_ACCESS_RIGHT_BY_STAFFID, function* (action) {
        let { stuffId, accessRightCd, callback } = action;
        let isHaveRight = 'N';
        let { data } = yield call(maskAxios.get, '/user/accessRightByStaffId/' + stuffId);
        if (data.respCode === 0) {
            const accessRights = data.data;
            if (accessRights && accessRights.length > 0) {
                const rightIndex = accessRights.findIndex(item => item.accessRightCd === accessRightCd);
                if (rightIndex > -1) {
                    isHaveRight = 'Y';
                }
            }
            callback && callback(isHaveRight);
        } else if (data.respCode === 100) {
            if (accessRightCd === accessRightEnum.changePatientMajorKey) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110149'
                    }
                });
            } else if (accessRightCd === accessRightEnum.markProblemPatient) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110150'
                    }
                });
            } else if (accessRightCd === accessRightEnum.invalidBookingEncounterTypeApprover) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110202'
                    }
                });
            }
        }

    });
}

function* checkValidPMIExist() {
    yield alsTakeEvery(RegistrationType.CHECK_VALID_PMI_EXIST, function* (action) {
        const { documentPairList, excludePatient, callback, status } = action;
        const docTypeCodeList = yield select(state => state.common.commonCodeList.doc_type);
        const primaryDoc = PatientUtil.getPatientPrimaryDoc(documentPairList);
        if (primaryDoc) {
            const isUnique = PatientUtil.isPrimaryDocTypeUnique(documentPairList, docTypeCodeList);
            let searchType = '';
            // if (isUnique) {
            //     const searchTypeObj = Enum.PATIENT_SEARCH_TYPE.find(item => item.code === primaryDoc.docTypeCd);
            //     searchType = searchTypeObj.searchType;
            // } else {
            //     const searchTypeObj = Enum.PATIENT_SEARCH_TYPE.find(item => item.code === 'DOCNO');
            //     searchType = searchTypeObj.searchType;
            // }
            searchType = primaryDoc.docTypeCd;
            // let searchParams = { searchType: searchType, searchString: PatientUtil.getCleanHKIC(primaryDoc.docNo) };
            let searchString = PatientUtil.isHKIDFormat(searchType) ? PatientUtil.getCleanHKIC(primaryDoc.docNo) : primaryDoc.docNo;
            let searchParams = { docType: searchType, searchString: searchString, isPrimary: 'Y' };
            let { data } = yield call(searchPatientApi, searchParams);
            if (data.respCode === 0) {
                let patientData = _.cloneDeep(data.data);
                let patientList = (patientData && patientData.patientDtos) || [];
                if (excludePatient) {
                    patientList = patientList.filter(item => excludePatient !== item.patientKey);
                }
                let isExistValidPMI = false;
                let validPatientList = patientList.filter(item => !PatientUtil.isProblemPMI(item.documentPairList));
                if (validPatientList.length > 0) {
                    isExistValidPMI = true;
                }
                if (status === 'save') {
                    patientList = validPatientList;
                }
                if (isUnique && isExistValidPMI) {
                    patientData.patientDtos = patientList;
                    yield put({
                        type: RegistrationType.POP_UP_SEARCH_DIALOG,
                        data: patientData
                    });
                } else {
                    callback && callback(patientList);
                }
            }
        }
    });
}

function* patientListDoCreateNew() {
    yield alsTakeEvery(RegistrationType.PATIENT_LIST_CREATE_NEW, function* (action) {
        let { patient } = action;
        yield put({
            type: RegistrationType.CREATE_NEW_PMI,
            patient: patient
        });
        // yield put({
        //     type: RegistrationType.UPDATE_STATE,
        //     updateData: { autoFocus: true }
        // });
    });
}

function* patientSummaryEditPatient() {
    yield alsTakeEvery(RegistrationType.PATIENT_SUMMARY_EDIT_PATIENT, function* (action) {
        // CIMST-3676: To allow Patient Summary (Editable) to co-exist with other patient related modules
        // let loginUserRoleList = yield select(state => state.common.loginUserRoleList);
        // let cimsCounterRoleList = loginUserRoleList.filter(item => item.uamRoleDto && item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-COUNTER');
        let subTabs = yield select(state => state.mainFrame.subTabs);
        let patientSummaryTabIndex = subTabs.findIndex(item => item.name === accessRightEnum.patientSummary);
        const otherSubTabs = subTabs.filter(x => x.name !== accessRightEnum.patientSummary && x.name !== accessRightEnum.viewPatientDetails);
        //if (cimsCounterRoleList.length > 0 && patientSummaryTabIndex !== -1 && otherSubTabs.length >= 1) {
        if (patientSummaryTabIndex !== -1 && otherSubTabs.length >= 1) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110142',
                    params: [{ name: 'PATIENTCALL', value: _.upperFirst(CommonUtilities.getPatientCall()) },
                    { name: 'PATIENTCALL_LOWERFIRST', value: _.lowerFirst(CommonUtilities.getPatientCall()) }]
                }
            });
        } else {
            // yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'open' });
            // yield put({ type: mainFrameType.DELETE_TABS, params: accessRightEnum.patientSpec });
            // yield put({ type: mainFrameType.DELETE_SUB_TABS, params: accessRightEnum.patientSummary });
            // yield put({ type: patientType.RESET_ALL });
            yield put({
                type: mainFrameType.SKIP_TAB,
                accessRightCd: accessRightEnum.registration,
                params: {
                    stepIndex: action.index,
                    patientKey: action.patientKey,
                    redirectFrom: accessRightEnum.patientSummary,
                    pucChecking: action.pucChecking,
                    validAccessRightCallBack: () => {
                        dispatch(commonAction.openCommonCircular());
                        dispatch(mainFrameAction.deleteTabs(accessRightEnum.patientSpec));
                        dispatch(mainFrameAction.deleteSubTabs(accessRightEnum.patientSummary));
                        dispatch(patientAction.resetAll());
                    }
                }
            });
        }
    });
}

function* blockFirstUpdatePhoneListAndRestore() {
    yield takeEvery(RegistrationType.REGISTRATION_BLOCK_FIRST_UPDATE_PHONE_LIST_AND_RESTORE, function* (action) {
        let phoneListToBeRestored = action.phoneList;
        while (true) {
            try {
                yield put(alsStartTrans());
                let updateAction = yield take(RegistrationType.UPDATE_STATE);
                if (updateAction.updateData && updateAction.updateData.phoneList) {
                    yield put(RegistrationAction.updateState({ phoneList: phoneListToBeRestored }));
                    break;
                }
            } finally {
                yield put(alsEndTrans());
            }

        }
    });
}

function* searchAssociatedPersonWithHKID() {
    yield alsTakeLatest(RegistrationType.SEARCH_ASSOCIATED_PERSON_WITH_HKID, function* (action) {
        const { hkid } = action;
        let params = {
            docType: Enum.DOC_TYPE.HKID_ID,
            searchString: hkid
        };
        let { data } = yield call(searchPatientApi, params);
        if (data.respCode === 0) {
            const patientData = _.cloneDeep(data.data);
            let assoPersonInfo = _.cloneDeep(yield select(state => state.registration.assoPersonInfo));
            let assoPersList = [];
            if (patientData.patientDtos) {
                if (patientData.patientDtos.length === 1) {
                    assoPersList = patientData.patientDtos;
                    let patientName = CommonUtilities.getFullName(assoPersList[0].engSurname, assoPersList[0].engGivename);
                    patientName = patientName.substring(0, 160);
                    assoPersonInfo = {
                        ...assoPersonInfo,
                        assoPerName: patientName
                    };
                } else if (patientData.patientDtos.length > 1) {
                    assoPersList = patientData.patientDtos;
                    yield put({
                        type: RegistrationType.OPEN_ASSOCIATED_SEARCH_RESULT
                    });
                } else {
                    assoPersonInfo = {
                        ...assoPersonInfo,
                        assoPerName: ''
                    };
                    yield put(RegistrationAction.updateState({ focusAssoPerName: true }));
                    setTimeout(() => {
                        dispatch({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: {
                                msgCode: '110111',
                                showSnackbar: true
                            }
                        });
                    }, 300);
                }
            }
            yield put(RegistrationAction.updateState({ assoPersList, assoPersonInfo }));
        }
    });
}

function* openMode() {
    yield alsTakeLatest(RegistrationType.OPEN_MODE, function* () {
        const subTabs = yield select(state => state.mainFrame.subTabs);
        if (subTabs && subTabs.findIndex(x => x.name === accessRightEnum.viewPatientDetails) > -1) {
            const patientInfo = yield select(state => state.patient.patientInfo);
            if (patientInfo && patientInfo.patientKey) {
                yield put({ type: RegistrationType.INIT_PATIENT_BY_ID, data: _.cloneDeep(patientInfo) });
                yield put({ type: RegistrationType.UPDATE_STATE, updateData: { viewPatDetails: true} });
            }
        }
    });
}

function* getExistClinicalData() {
    yield alsTakeLatest(RegistrationType.GET_EXIST_CLINICAL_DATA, function* (action) {
        const { callback, patientKey } = action;
        let { data } = yield call(maskAxios.get, `/patient/patients/${patientKey}/pmiClinicalInfo`);
        if(data.respCode === 0) {
            callback(data.data);
        }
    });
}

function* mapPmiWithProvenDocVal(){

        //let phoneListToBeRestored = action.phoneList;
        while (true) {
            yield take(RegistrationType.MAP_PMI_WITH_PROVEN_VALUE);
            try {
                yield put(alsStartTrans());
                let patientBaseInfo=yield select(state=>state.registration.patientBaseInfo);
                const patInfo=RegUtil.mapPmiWithProvenDocVal(patientBaseInfo);
                yield put({
                    type:RegistrationType.RESPONSE_MAP_PMI_WITH_PROVEN_VALUE,
                    patInfo
                });
            } finally {
                yield put(alsEndTrans());
            }

        }
}

function* enrollEhsMember() {
    while (true) {
        let { params, callback } = yield take(RegistrationType.ENROLL_EHS_MEMBER);
        try {
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.post, '/patient/ehs/enrollment', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110102',
                        showSnackbar: true
                    }
                });
                callback && callback(data.data);
            } else if (data.respCode === 1) {
                if (data.data) {
                    /**Special handle: old data english name too long */
                    if (data.data.findIndex((x) => _.toUpper(x) === 'ENGSURNAME' || _.toUpper(x) === 'ENGGIVENAME') > -1) {
                        yield put({ type: RegistrationType.UPDATE_STATE, updateData: { loadErrorParameter: true } });
                    }
                }
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
            } else {
                const loginServiceCd = yield select(state => state.login.service.serviceCd);
                if (data.errMsg && loginServiceCd === SERVICE_CODE.EHS) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '130300',
                            params: [
                                { name: 'HEADER', value: 'PMI New Registration' },
                                { name: 'MESSAGE', value: data.errMsg }
                            ]
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
        } finally {
            yield put(alsEndTrans());
            yield put({ type: commonType.HANDLE_COMMON_CIRCULAR, status: 'close' });
        }
    }
}

function* checkFamilyNoAsync() {
    yield alsTakeEvery(RegistrationType.CHECK_FAMILY_NO, function* (action) {
        const { callback } = action;

        const pmiGrpName = yield select((state) => state.registration.patientBaseInfo.pmiGrpName);

        if (!pmiGrpName) {
            callback('invalid');
            yield put({ type: RegistrationType.INVALID_FAMILY_NO });
        } else {
            const result = yield call(maskAxios.get, `/patient/cgs/familyNo/${pmiGrpName}/preRegCheck`);

            if (result.data.respCode === 0) {
                if (!result.data.data.isFamilyExist) {
                    callback('invalid');
                    yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '131001' } });
                    yield put({ type: RegistrationType.INVALID_FAMILY_NO });
                } else {
                    callback('valid');
                    yield put({ type: RegistrationType.VALID_FAMILY_NO });
                }
            }
        }
    });
}

function* chiefParentCheckboxAsync() {
    yield alsTakeEvery(RegistrationType.CHIEF_PARENT_CHECKBOX_HANDLER, function* () {
        const patientBaseInfo = yield select((state) => state.registration.patientBaseInfo);

        const { familyNoType, pmiGrpName, isChief, cgsSpec } = patientBaseInfo;

        // Check type is NEW
        if (familyNoType === familyNoTypes.NEW) {
            yield put({
                type: RegistrationType.UPDATE_PATIENT_BASE_INFO,
                payload: { 'isChief': !isChief }
            });
        }
        // Handle type: EXISTING
        else {
            // if no family no., pop up error message
            if (!pmiGrpName) yield put({ type: RegistrationType.INVALID_FAMILY_NO });
            else {
                /**
                 * Check checkbox value:
                 * if true -> change to false
                 * default -> check family no. is valid or not
                 */
                switch (isChief) {
                    case true:
                        yield put({
                            type: RegistrationType.UPDATE_PATIENT_BASE_INFO,
                            payload: { 'isChief': false }
                        });
                        break;

                    default:
                        const result = yield call(maskAxios.get, `/patient/cgs/familyNo/${pmiGrpName}/preRegCheck`);

                        if (result.data.respCode === 0) {
                            const { hasChief, isFamilyExist, chiefPatientKey } = result.data.data;
                            // Family Number not exist Dialog
                            if (!isFamilyExist)
                                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '131001' } });
                            // Override Chief optional Dialog
                            else if (hasChief && chiefPatientKey !== cgsSpec?.patientKey)
                                yield put({
                                    type: messageType.OPEN_COMMON_MESSAGE,
                                    payload: {
                                        msgCode: '131002',
                                        params: [
                                            {
                                                name: 'patientKey',
                                                value: chiefPatientKey
                                            }
                                        ],
                                        btnActions: {
                                            btn1Click: () => {
                                                storeConfig.store.dispatch(
                                                    RegistrationAction.updatePatientBaseInfo({'isChief': true})
                                                );
                                            }
                                        }
                                    }
                                });
                            else
                                yield put({
                                    type: RegistrationType.UPDATE_PATIENT_BASE_INFO,
                                    payload: { 'isChief': true }
                                });
                        }
                        break;
                }
            }
        }
    });
}


export function* printRegSummaryAsync() {
    yield alsTakeEvery(RegistrationType.PRINT_REG_SUMMARY, function* (action) {
        const { payload, callback } = action;
        const { typeOfFormat, operation, registeredPatientList, pdfData } = payload;

        if (operation === 'print') {
            const reqParams = {
                base64: pdfData,
                orientation: 1,
                callback: (result) => {
                    callback && callback(result);
                }
            };
            yield print(reqParams);
        } else {
            // PMI Array
            const patientIds = registeredPatientList.map((data) => data.pmi);
            // typeOfFormat: PDF, CSV, XLSX
            const result = yield call(maskAxios.post, `/patient/cgs/patients/summary/${typeOfFormat}`, patientIds);
            if (result.data.respCode === 0) {
                switch (operation) {
                    case 'download':
                        const linkSource = `data:${
                            typeOfFormat === 'CSV'
                                ? 'text/csv'
                                : typeOfFormat === 'XLSX'
                                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                : 'application/pdf'
                        };base64,${result.data.data}`;
                        const downloadLink = document.createElement('a');
                        const fileName = `registration_summary_${format(new Date(), 'dd_MM_yyyy')}${
                            typeOfFormat === 'CSV' ? '.csv' : ''
                        }`;
                        downloadLink.href = linkSource;
                        downloadLink.download = fileName;
                        downloadLink.click();
                        break;

                    default:
                        callback(result.data.data);
                }
            }
        }
    });
}

function* printGumLabelAsync() {
    while (true) {
        try {
            const { payload, callback } = yield take(RegistrationType.PRINT_GUM_LABEL);
            const { serviceCd, siteId, patientKey, base64 } = payload;

            yield put(alsStartTrans());
            if (base64) {
                const paperSize = getPaperSize(PAPER_SIZE_TYPE.GUM_LABEL);
                const reqParams = {
                    base64: base64,
                    orientation: 1,
                    paperSize: paperSize || -1,
                    callback: (result) => {
                        callback && callback(result);
                    }
                };
                yield print(reqParams);
            } else {
                const { data } = yield call(
                    maskAxios.get,
                    `patient/getPatientGumLabel/${serviceCd}/${siteId}/${patientKey}`
                );
                if (data.respCode === 0) callback(data.data);
                else {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110031'
                        }
                    });
                }
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

export function* getPatientGrpAsync() {
    yield alsTakeEvery(RegistrationType.GET_PATIENT_KEY, function* (action) {
        const { patientKey, callback} = action;
            const result = yield call(maskAxios.get, `/patient/cgs/patient/${patientKey}/family`);
            if (result.data.respCode === 0) {
                callback(result.data.data);
            }
    });
}

function* pmiSMSCheckingLog() {
    yield alsTakeLatest(RegistrationType.PMI_SMS_CHECKING_LOG, function* (action) {
        const { params } = action;
        yield call(maskAxios.post, 'patient/pmiSmsCheckingLog', params);
    });
}

function* fetchScreeningInfo() {
    yield alsTakeEvery(RegistrationType.FETCH_SCREENING_INFO, function* (action) {
        const serviceCd = yield select(state => state.login.service.serviceCd);
        const { id, callback } = action;

        if (serviceCd === 'CGS') {
            try {
                const { data } = yield call(maskAxios.get, `cgs-consultation/geneticScreening/cht/${id}`);

                if (data.respCode === 0) {
                    const screenInfoData = RegUtil.structuredRegistrationScreeningInfoData(data.data);

                    yield put({
                        type: RegistrationType.UPDATE_SCREENING_INFO,
                        payload: { screenInfoData }
                    });
                    callback && callback();
                } else {
                    throw new Error();
                }
            } catch (err) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110184'
                    }
                });
            }
        }
    });
}

function* saveScreeningInfo() {
    yield alsTakeLatest(RegistrationType.SAVE_SCREENING_INFO, function* (action) {
        const serviceCd = yield select(state => state.login.service.serviceCd);

        if (serviceCd === 'CGS') {
            try {
                const { payload } = action;
                const { data } = yield call(maskAxios.post, 'cgs-consultation/geneticScreening/cht', payload);

                if (data.respCode === 0 && data.msgCode) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: data.msgCode,
                            params: [{ name: 'docType', value: 'CHT'}, { name: 'operation', value: 'save'}],
                            showSnackbar: true
                        }
                    });
                }
            } catch (err) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110185'
                    }
                });
            }
        }
    });
}


export const registrationSaga = [
    updatePatient,
    savePatient,
    getPatientById,
    searchPatient,
    findCharByCcCode,
    loadPatientRelatedFlag,
    listValidForProblemPMI,
    confirmProblemPatient,
    getBabyInfo,
    checkAccessRight,
    checkAccessRightByStaffId,
    checkValidPMIExist,
    resetAll,
    initPatient,
    createNewPMI,
    initMiscellaneous,
    selectedPatientById,
    patientListDoCreateNew,
    patientSummaryEditPatient,
    blockFirstUpdatePhoneListAndRestore,
    searchAssociatedPersonWithHKID,
    openMode,
    getExistClinicalData,
    mapPmiWithProvenDocVal,
    checkFamilyNoAsync,
    chiefParentCheckboxAsync,
    printRegSummaryAsync,
    printGumLabelAsync,
    getPatientGrpAsync,
    pmiSMSCheckingLog,
    enrollEhsMember,
    fetchScreeningInfo,
    saveScreeningInfo
];
