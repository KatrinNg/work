import { take, call, put, select, all } from 'redux-saga/effects';
import * as dtsPreloadDataActionType from '../../../actions/dts/preload/DtsPreloadDataActionType';
import * as messageType from '../../../actions/message/messageActionType';
import * as dentalService from '../../../../services/dts/dentalService';
import { maskAxios } from '../../../../services/axiosInstance';


export function* preloadAllSpecialtiesApi(params) {
    return yield call(dentalService.getDtsPreloadAllSpecialties, params, false);
}
export function* preloadAllAnaCodeApi(params) {
    return yield call(dentalService.getDtsPreloadAllAnaCode, params, false);
}
export function* preloadAllCncCodeApi(params) {
    return yield call(dentalService.getDtsPreloadAllCncCode, params, false);
}
export function* findAnaCodeInCategoriesApi(params) {
    return yield call(dentalService.getDtsAnaCodeInCategories, params, false);
}
export function* findCncCodeInCategoriesApi(params) {
    return yield call(dentalService.getDtsCncCodeInCategories, params, false);
}
export function* getUnavailablePeriodReasonsOfInfectionControlApi(params) {
    return yield call(dentalService.getUnvailablePeriodReasonsOfInfectionControl, params, false);
}
export function* getAnaRemarkTypeListApi(params) {
    return yield call(dentalService.getAnaRemarkTypeList, params, false);
}

// dental Miki sprint 7 2020/08/13 - Start
function* getDtsPreloadAllSpecialties() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.GET_ALL_SPECIALTIES);
        const [specialties] = yield all([
            yield call(preloadAllSpecialtiesApi, params)
            // call(dentalService.getDtsPreloadAllSpecialties, params, false)
        ]);
        const specialtiesData = specialties.data;
        if (specialtiesData && specialtiesData.respCode === 0) {
            yield put({
                type: dtsPreloadDataActionType.PUT_ALL_SPECIALTIES_SAGA,
                allSpecialties: specialtiesData.data
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
}

function* getDtsMandatoryEncounterType() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.GET_DTP_MAND_ETYPE_CNC_CODE);
        console.log('dtsPreloadDataSaga.js > getDtsMandatoryEncounterType() > ' + JSON.stringify(params));

        let { data } = yield call(maskAxios.get, '/dts-ana/dts-ana/code/cnc/list/' + params);

        if (data.respCode === 0) {
            let raw = data.data;
            yield put({ type: dtsPreloadDataActionType.GET_DTP_MAND_ETYPE_CNC_CODE_SAGA, params: raw});
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

function* getDtsPreloadAllAnaCode() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.GET_ALL_ANA_CODE);
        const anaCodeList = yield all(
            yield call(preloadAllAnaCodeApi, params)
            // call(dentalService.getDtsPreloadAllAnaCode, params, false)
        );
        const anaCodeListData = anaCodeList.data;
        if (anaCodeListData && anaCodeListData.respCode === 0) {
            yield put({
                type: dtsPreloadDataActionType.PUT_ALL_ANA_CODE_SAGA,
                anaCodeList: anaCodeListData.data
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
}

function* getDtsPreloadAllCncCode() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.GET_ALL_CNC_CODE);
        const cncCodeList = yield all(
            yield call(preloadAllCncCodeApi, params)
            // call(dentalService.getDtsPreloadAllCncCode, params, false)
        );
        const cncCodeListData = cncCodeList.data;
        if (cncCodeListData && cncCodeListData.respCode === 0) {
            yield put({
                type: dtsPreloadDataActionType.PUT_ALL_CNC_CODE_SAGA,
                cncCodeList: cncCodeListData.data
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
}
function* getDtsAnaCodeInCategories() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.POST_CATEGORIES_ANA);
        const anaCodeList = yield call(findAnaCodeInCategoriesApi, params);
            // call(dentalService.getDtsAnaCodeInCategories, params, false)
        const anaCodeListData = anaCodeList.data;
        // const anaCodeListData ='';
        if (anaCodeListData && anaCodeListData.respCode === 0) {
            yield put({
                type: dtsPreloadDataActionType.PUT_CATEGORIES_ANA_SAGA,
                anaCodeList: anaCodeListData.data
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
}
function* getDtsCncCodeInCategories() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.POST_CATEGORIES_CNC);
        const cncCodeList = yield call(findCncCodeInCategoriesApi, params);
            // call(dentalService.getDtsCncCodeInCategories, params, false)
        const cncCodeListData = cncCodeList.data;
        // const cncCodeListData ='';
        if (cncCodeListData && cncCodeListData.respCode === 0) {
            yield put({
                type: dtsPreloadDataActionType.PUT_CATEGORIES_CNC_SAGA,
                cncCodeList: cncCodeListData.data
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
}
// dental Miki sprint 7 2020/08/13 - End

function* getUnavailablePeriodReasonsOfInfectionControl() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.GET_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL);
        const [unavailablePeriodReasonsOfInfectionControl] = yield all([
            yield call(getUnavailablePeriodReasonsOfInfectionControlApi, params)
        ]);
        if (unavailablePeriodReasonsOfInfectionControl.data && unavailablePeriodReasonsOfInfectionControl.data.respCode === 0) {
            yield put({
                type: dtsPreloadDataActionType.PUT_UNAVAILABLE_PERIOD_REASONS_OF_INFECTION_CONTROL,
                infectionControlUnavailablePeriodReasons: unavailablePeriodReasonsOfInfectionControl.data.data
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
}

function* getAnaRemarkTypeList() {
    while (true) {
        const { params } = yield take(dtsPreloadDataActionType.GET_ALL_REMARK_TYPE);
        const [remarkType] = yield all([
            yield call(getAnaRemarkTypeListApi, params)
            // call(dentalService.getDtsPreloadAllSpecialties, params, false)
        ]);
        const remarkTypeData = remarkType.data;
        if (remarkTypeData && remarkTypeData.respCode === 0) {
            yield put({
                type: dtsPreloadDataActionType.PUT_ALL_REMARK_TYPE_SAGA,
                remarkType: remarkTypeData.data
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
}
export const dtsPreloadDataSaga = [getDtsPreloadAllCncCode, getDtsPreloadAllAnaCode, getDtsPreloadAllSpecialties, getDtsAnaCodeInCategories, getDtsCncCodeInCategories, getDtsMandatoryEncounterType, getUnavailablePeriodReasonsOfInfectionControl, getAnaRemarkTypeList];
