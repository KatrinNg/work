import { take, takeEvery, takeLatest, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import * as bookingActionType from '../../../actions/appointment/booking/bookingActionType';
import { getPatientById } from '../../../actions/patient/patientAction';
import * as patientActionType from '../../../actions/patient/patientActionType';
import * as messageType from '../../../actions/message/messageActionType';
import _ from 'lodash';
import { CommonUtil, EnctrAndRmUtil } from '../../../../utilities';
import * as AppointmentUtil from '../../../../utilities/appointmentUtilities';
import { print } from '../../../../utilities/printUtilities';
import Enum from '../../../../enums/enum';
import { initBookingData } from '../../../../constants/appointment/bookingInformation/bookingInformationConstants';
import { PageStatus as pageStatusEnum, UpdateMeans, PAGE_DIALOG_STATUS, BookMeans } from '../../../../enums/appointment/booking/bookingEnum';
import * as atndService from '../../../../services/ana/attendanceService';
import * as apptService from '../../../../services/ana/appointmentService';
import moment from 'moment';
import { openCommonMessage } from '../../../actions/message/messageAction';
import storeConfig from '../../../storeConfig';
import { getState, dispatch } from '../../../util';
import { mapEncounterTypeList, mapEncounterTypeListNewApi } from '../../../../utilities/apiMappers';
import { alsStartTrans, alsEndTrans } from '../../../actions/als/transactionAction';
import { alsTakeLatest, alsTakeEvery } from '../../als/alsLogSaga';
import {pmiCaseWithEnctrGrpVal} from '../../../../utilities/caseNoUtilities';
import { SHS_APPOINTMENT_GROUP } from '../../../../enums/appointment/booking/bookingEnum';
import {ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC} from '../../../../enums/enum';

function serialize(url, obj) {
    let str = [];
    for (let p in obj)
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    str = str.join('&');
    return url + '?' + str;
}

function* getPatientLatestEncntrCase() {
    const svcCd = yield select(state => state.login.service.svcCd);
    if (svcCd === 'SHS') {
        const patientInfo = yield select(state => state.patient.patientInfo);
        const getEncntrCaseParams = {
            patientKey: patientInfo.patientKey,
            sspecID: SHS_APPOINTMENT_GROUP.SKIN_GRP
        };
        yield put({
            type: patientActionType.GET_LATEST_PATIENT_ENCOUNTER_CASE,
            params: getEncntrCaseParams
        });
    }
}

function* getEncounterTypeListBySite() {
    yield alsTakeEvery(bookingActionType.GET_ENCOUNTER_TYPE_LIST_BY_SITE, function* (action) {
        let { serviceCd, siteId, callback } = action;
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + serviceCd + '&siteId=' + siteId + '&withRooms=Y');
        if (data.respCode === 0) {
            const clinicList = yield select(state => state.common.clinicList);
            let _encounterTypeList = mapEncounterTypeListNewApi(data.data, serviceCd, siteId, clinicList);
            _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, _encounterTypeList);

            const defaultEncounter = AppointmentUtil.getDefaultEncounter({
                encounterTypeList: _.cloneDeep(_encounterTypeList),
                siteId: siteId
            });
            const bookingData = yield select(state => state.bookingInformation.bookingData);
            let newBookingData = {};
            if (defaultEncounter) {
                newBookingData.encounterTypeId = defaultEncounter.encntrTypeId;
                newBookingData.encounterTypeCd = defaultEncounter.encounterTypeCd;
                if (bookingData.qtType !== 'W') {
                    newBookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(newBookingData, newBookingData.encounterTypeId, _encounterTypeList);
                }
                if(bookingData.encntrGrpCd){
                    newBookingData.encntrGrpCd=bookingData.encntrGrpCd;
                }

                const defaultRoom = AppointmentUtil.getDefaultRoom({
                    encntrId: defaultEncounter.encntrTypeId,
                    encounterTypeList: _.cloneDeep(_encounterTypeList),
                    rooms: defaultEncounter.subEncounterTypeList,
                    siteId: siteId
                });
                if (defaultRoom) {
                    newBookingData.rmId = defaultRoom.rmId;
                    newBookingData.rmCd = defaultRoom.subEncounterTypeCd;
                    newBookingData.subEncounterTypeCd = defaultRoom.subEncounterTypeCd;
                }
            }
            newBookingData=AppointmentUtil.setDefaultEncntrAndRoomByEncntrGrp(newBookingData,_encounterTypeList);

            yield put({
                type: bookingActionType.PUT_ENCOUNTER_TYPE_LIST_BY_SITE,
                encounterTypeList: _encounterTypeList,
                newBookingData
            });
            callback && callback(_encounterTypeList);
        }
    });
}

function* fetchGetEncounterTypeList(svcCd, siteId, sspecFilter, callback) {
    let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + svcCd + '&siteId=' + siteId + '&withRooms=Y');
    if (data.respCode === 0) {
        const clinicList = yield select(state => state.common.clinicList);
        let _encounterTypeList = mapEncounterTypeListNewApi(data.data, svcCd, siteId, clinicList);

        if (sspecFilter) {
            _encounterTypeList = _encounterTypeList.filter(x => x.sspecId === sspecFilter);
        }

        _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, _encounterTypeList);
        callback && callback(_encounterTypeList);
        return _encounterTypeList;
    }
}

function* fetchGetSessionList(svcCd, siteId) {
    let { data } = yield call(maskAxios.get, '/cmn/services/' + svcCd + '/sessions');
    if (data.respCode === 0) {
        return (data.data || []).filter(x => x.siteId === siteId && CommonUtil.isActiveSession(x));
    }
}

function* getSessionList() {
    yield alsTakeEvery(bookingActionType.GET_SESSION_LIST, function* (action) {
        const { siteId } = action;
        const service = yield select(state => state.login.service);
        if (service && service.svcCd) {
            const sessionList = yield call(fetchGetSessionList, service.svcCd, siteId);
            yield put({
                type: bookingActionType.UPDATE_STATE,
                updateData: { sessionList: sessionList }
            });
        }
    });
}

function* fetchappointmentBooking(action) {
    let { data } = yield call(maskAxios.post, '/ana/searchFirstAvailTimeslot', action.params);
    const serviceCd = getState(state => state.login.service.svcCd);
    if (data.respCode === 0) {
        if (serviceCd === 'ANT') {
            const { apptStartDate: sdate, apptEndDate: edate } = action.params;
            if (data.data.normal.length === 1 && !data.data.squeezeIn) {
                const slotDate = moment(data.data.normal[0].slotDate);
                let inRange = edate ? slotDate.isBetween(sdate, edate, 'day', '[]') : slotDate.isSameOrAfter(sdate, 'day');
                // console.log('[ANT] start:', sdate, 'end:', edate, 'slot:', data.data.normal, 'inRange:', inRange);
                if (inRange) {
                    yield put({ type: bookingActionType.PUT_TIMESLOT_DATA, data: data.data, params: action.params });
                }
                else {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111203'
                        }
                    });
                }
            }
            else {
                yield put({ type: bookingActionType.PUT_TIMESLOT_DATA, data: data.data, params: action.params });
            }
        }
        else {
            yield put({ type: bookingActionType.PUT_TIMESLOT_DATA, data: data.data, params: action.params });
        }
    } else if (data.respCode === 101) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111204'
            }
        });
    } else if (data.respCode === 100) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111203'
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

function* appointmentBooking() {
    yield alsTakeLatest(bookingActionType.APPOINTMENT_BOOK, fetchappointmentBooking);
}




function* fetchListTimeSlotForAppointmentBook(action) {
    // let { data } = yield call(maskAxios.post, 'ana/timeslots/avail', action.params);
    // const config = { data: action.params };
    let { data } = yield call(maskAxios.get, 'ana/timeslots', { params: action.params });
    if (data.respCode === 0) {
        const bookingData = yield select(state => state.bookingInformation.bookingData);
        const timeSlotList = AppointmentUtil.filterAllTimeSlotByQtType(data.data, bookingData.qtType || '');
        yield put({ type: bookingActionType.PUT_LIST_TIMESLOT_DATA, timeSlotList });
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* listTimeSlotForAppointmentBook() {
    yield alsTakeLatest(bookingActionType.LIST_TIMESLOT, fetchListTimeSlotForAppointmentBook);
}

function* listAppointmentHistory() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.LIST_APPOINTMENT_HISTORY);
            yield put(alsStartTrans());

            let service = yield select(state => state.login.service);
            let patientInfo = yield select(state => state.patient.patientInfo);
            let allServiceChecked = yield select(state => state.bookingInformation.allServiceChecked);
            let _params = {
                withPMIDetls: false,
                allService: allServiceChecked,
                withShowObsInfomation: false,
                svcCd: service.svcCd,
                patientKey: patientInfo.patientKey,
                ...params
            };
            let { data } = yield call(apptService.listAppointments, _params);
            if (data.respCode === 0) {
                let process_data = AppointmentUtil.processAppointmentData(data.data);
                yield put({
                    type: bookingActionType.PUT_LIST_APPOINTMENT_HISTORY,
                    appointmentHistory: process_data
                });
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

function* multipleBookingConfirm() {
    yield alsTakeLatest(bookingActionType.MULTIPLE_BOOKING_CONFIRM, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.post, '/ana/appointments/multipleAppointments', params, { retry: 0 });
        if (data.respCode === 0) {
            if (data.data.bookSuccess) {
                let paramsCaseNo='';
                if(params.normalConfirmList.length>0){
                    paramsCaseNo=params.normalConfirmList[0].caseNo;
                }else if(params.stillConfirmList.length>0){
                    paramsCaseNo=params.stillConfirmList[0].caseNo;
                }else{
                    paramsCaseNo=params.replaceApptList[0].caseNo;
                }
                const bookingData = yield select(state => state.bookingInformation.bookingData);
                const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                if (data.data.confirmResultList && data.data.confirmResultList.length > 0) {
                    data.data.confirmResultList.sort((a, b) => moment(a.apptDate).diff(moment(b.apptDate), 'days', true));
                    //multiple appointment take the first successful case.
                    const caseNo = data.data.caseDto ? data.data.caseDto.caseNo || '' : caseNoInfo && caseNoInfo.caseNo;
                    const alias = data.data.caseDto ? data.data.caseDto.alias || '' : caseNoInfo && caseNoInfo.alias;
                    const isPmiCaseWithEnctrGrp=pmiCaseWithEnctrGrpVal();
                    const bookInfo = {
                        apptId: data.data.confirmResultList[0].apptId,
                        encntrTypeId: bookingData.encounterTypeId,
                        rmId: bookingData.rmId,
                        apptDate: data.data.confirmResultList[0].apptDate,
                        memo: data.data.confirmResultList[0].memo,
                        caseNo: caseNo,
                        encntrTypeDesc: data.data.confirmResultList[0].encntrTypeDesc,
                        rmDesc: data.data.confirmResultList[0].rmDesc,
                        alias: isPmiCaseWithEnctrGrp?paramsCaseNo?alias:'':alias,
                        encntrGrpCd:paramsCaseNo?caseNoInfo&&caseNoInfo.encntrGrpCd||'':''
                    };
                    yield put({
                        type: bookingActionType.REDESIGN_PUT_BOOK_SUCCESS,
                        bookInfo: bookInfo
                    });
                    yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
                    yield put({ type: bookingActionType.RESET_REPLACE_APPOINTMENT });
                    // callback && callback(data.data.confirmResultList);
                    callback && callback(data.data);
                }
            } else {
                let replaceAppointmentInfo = {
                    replaceApptList: data.data.replaceApptList,
                    cimsOneReplaceList: data.data.replaceCimsOneApptList,
                    normalConfirmList: data.data.normalConfirmList,
                    stillConfirmList: data.data.stillConfirmList,
                    minInterval: data.data.minInterval ? data.data.minInterval : '',
                    minIntervalUnit: data.data.minIntervalUnit ? data.data.minIntervalUnit : '',
                    isReplaceAppointment: data.data.replaceAppointment,
                    isSameDayAppointment: data.data.sameDayAppointment
                };
                let openSameDayAppointmentDialog, openReplaceAppointmentDialog;
                if (data.data.sameDayAppointment) {
                    openSameDayAppointmentDialog = true;
                    openReplaceAppointmentDialog = false;
                } else if (data.data.replaceAppointment) {
                    openSameDayAppointmentDialog = false;
                    openReplaceAppointmentDialog = true;
                } else {
                    openSameDayAppointmentDialog = false;
                    openReplaceAppointmentDialog = false;
                }
                yield put({
                    type: bookingActionType.UPDATE_STATE,
                    updateData: {
                        multipleReplaceApptData: replaceAppointmentInfo,
                        openSameDayAppointmentDialog,
                        openReplaceAppointmentDialog
                    }
                });
            }
        }
        //  else if (data.respCode === 100) {
        //     //not exist
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111233' } });
        // } else if (data.respCode === 101) {
        //     //update exception
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111235' } });
        // } else if (data.respCode === 102) {
        //     //no suitable timeslot
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
        // } else if (data.respCode === 103) {
        //     //no suitable timeslot
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
        // } else if (data.respCode === 107) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
        // } else if (data.respCode === 108) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
        // } else if (data.respCode === 109) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
        // } else if (data.respCode === 110) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '111242',
        //             params: [
        //                 { name: 'HEADER', value: 'Book Confirm' },
        //                 { name: 'MODULE_NAME', value: 'appointment booking' }
        //             ]
        //         }
        //     });
        // }
        //  else if (data.respCode === 146) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: { msgCode: '110155' }
        //     });
        // } else if (data.respCode === 148) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '110139'
        //         }
        //     });
        // } else if (data.respCode === 149) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '110140'
        //         }
        //     });
        // } else if (data.respCode === 150) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: { msgCode: '110153' }
        //     });
        // } else if (data.respCode === 151) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: { msgCode: '110204' }
        //     });
        // } else if (data.respCode === 152) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: { msgCode: '110205' }
        //     });
        // }
        else if ([100,101,102,103,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
            apptService.handleOperationFailed(data.respCode,data);
        } else {
            yield put({ type: bookingActionType.PUT_BOOK_FAIL });
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
        }
    });
}

function* sppMultipleBookConfirm(){
    yield alsTakeLatest(bookingActionType.SPP_MULTIPLE_BOOKING_CONFIRM, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.post, '/ana/appointments/multipleEncntrApptBooking', params, { retry: 0 });
        if (data.respCode === 0) {
            // if (data.data.bookSuccess) {
                // let paramsCaseNo='';
                // if(params.normalConfirmList.length>0){
                //     paramsCaseNo=params.normalConfirmList[0].caseNo;
                // }else if(params.stillConfirmList.length>0){
                //     paramsCaseNo=params.stillConfirmList[0].caseNo;
                // }else{
                //     paramsCaseNo=params.replaceApptList[0].caseNo;
                // }
            //     const bookingData = yield select(state => state.bookingInformation.bookingData);
            //     const caseNoInfo = yield select(state => state.patient.caseNoInfo);
            //     if (data.data.confirmResultList && data.data.confirmResultList.length > 0) {
            //         data.data.confirmResultList.sort((a, b) => moment(a.apptDate).diff(moment(b.apptDate), 'days', true));
            //         //multiple appointment take the first successful case.
            //         const caseNo = data.data.caseDto ? data.data.caseDto.caseNo || '' : caseNoInfo && caseNoInfo.caseNo;
            //         const alias = data.data.caseDto ? data.data.caseDto.alias || '' : caseNoInfo && caseNoInfo.alias;
            //         const isPmiCaseWithEnctrGrp=pmiCaseWithEnctrGrpVal();
            //         const bookInfo = {
            //             apptId: data.data.confirmResultList[0].apptId,
            //             encntrTypeId: bookingData.encounterTypeId,
            //             rmId: bookingData.rmId,
            //             apptDate: data.data.confirmResultList[0].apptDate,
            //             memo: data.data.confirmResultList[0].memo,
            //             caseNo: caseNo,
            //             encntrTypeDesc: data.data.confirmResultList[0].encntrTypeDesc,
            //             rmDesc: data.data.confirmResultList[0].rmDesc,
            //             alias: isPmiCaseWithEnctrGrp?paramsCaseNo?alias:'':alias,
            //             encntrGrpCd:paramsCaseNo?caseNoInfo&&caseNoInfo.encntrGrpCd||'':''
            //         };
            //         yield put({
            //             type: bookingActionType.REDESIGN_PUT_BOOK_SUCCESS,
            //             bookInfo: bookInfo
            //         });
            //         yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
            //         yield put({ type: bookingActionType.RESET_REPLACE_APPOINTMENT });
            //         // callback && callback(data.data.confirmResultList);
            //         callback && callback(data.data);
            //     }
            // } else {
            //     let replaceAppointmentInfo = {
            //         replaceApptList: data.data.replaceApptList,
            //         cimsOneReplaceList: data.data.replaceCimsOneApptList,
            //         normalConfirmList: data.data.normalConfirmList,
            //         stillConfirmList: data.data.stillConfirmList,
            //         minInterval: data.data.minInterval ? data.data.minInterval : '',
            //         minIntervalUnit: data.data.minIntervalUnit ? data.data.minIntervalUnit : '',
            //         isReplaceAppointment: data.data.replaceAppointment,
            //         isSameDayAppointment: data.data.sameDayAppointment
            //     };
            //     let openSameDayAppointmentDialog, openReplaceAppointmentDialog;
            //     if (data.data.sameDayAppointment) {
            //         openSameDayAppointmentDialog = true;
            //         openReplaceAppointmentDialog = false;
            //     } else if (data.data.replaceAppointment) {
            //         openSameDayAppointmentDialog = false;
            //         openReplaceAppointmentDialog = true;
            //     } else {
            //         openSameDayAppointmentDialog = false;
            //         openReplaceAppointmentDialog = false;
            //     }
            //     yield put({
            //         type: bookingActionType.UPDATE_STATE,
            //         updateData: {
            //             multipleReplaceApptData: replaceAppointmentInfo,
            //             openSameDayAppointmentDialog,
            //             openReplaceAppointmentDialog
            //         }
            //     });
            // }
            if (data.data.multipleConfirmApptDtos && data.data.multipleConfirmApptDtos.length > 0) {
                let paramsCaseNo = '';
                if (params[0].normalConfirmList.length > 0) {
                    paramsCaseNo = params[0].normalConfirmList[0].caseNo;
                }
                const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                const isPmiCaseWithEnctrGrp = pmiCaseWithEnctrGrpVal();
                const caseNo = data.data.caseDto ? data.data.caseDto.caseNo || '' : caseNoInfo && caseNoInfo.caseNo;
                const alias = data.data.caseDto ? data.data.caseDto.alias || '' : caseNoInfo && caseNoInfo.alias;
                const dtos = data.data.multipleConfirmApptDtos;
                let apptList = [];
                dtos.forEach((dto, idx) => {
                    //fyi: sprint 58 ignore overleap and duplicate appointment.
                    if (dto.bookSuccess) {
                        //bookInfo.push({ ...dto.confirmResultList, encntrTypeId: params[idx].encntrTypeId, rmId: params[idx].rmId });
                        dto.confirmResultList.forEach(e => {
                            e.encntrTypeId = params[idx].normalConfirmList[0].encntrTypeId;
                            e.rmId = params[idx].normalConfirmList[0].rmId;
                            apptList.push(e);
                        });
                    } else {
                        //bookingInfo.push(...dto.stillConfirmList);
                        //bookInfo.push({ ...dto.stillConfirmList, encntrTypeId: params[idx].encntrTypeId, rmId: params[idx].rmId });
                        dto.stillConfirmList.forEach(e => {
                            e.encntrTypeId = params[idx].normalConfirmList[0].encntrTypeId;
                            e.rmId = params[idx].normalConfirmList[0].rmId;
                            apptList.push(e);
                        });
                    }
                });

                let bookInfo = apptList.reduce((a, b) => {
                    const ma = Math.abs(moment().diff(moment(a.apptDate)));
                    const mb = Math.abs(moment().diff(moment(b.apptDate)));
                    if (ma === mb) {
                        return a;
                    } else {
                        return ma > mb ? b : a;
                    }
                });
                let _bookInfo = {
                    encntrTypeId: bookInfo.encntrTypeId,
                    rmId: bookInfo.rmId,
                    apptDate: bookInfo.apptDate,
                    memo: bookInfo.memo,
                    caseNo: caseNo,
                    encntrTypeDesc: bookInfo.encntrTypeDesc,
                    rmDesc: bookInfo.rmDesc,
                    alias: isPmiCaseWithEnctrGrp ? paramsCaseNo ? alias : '' : alias,
                    encntrGrpCd: paramsCaseNo ? caseNoInfo && caseNoInfo.encntrGrpCd || '' : ''
                };
                // bookInfo.map(info => {
                //     return {
                //         //apptId: data.data.confirmResultList[0].apptId,
                //         encntrTypeId: info.encounterTypeId,
                //         rmId: info.rmId,
                //         apptDate: info.apptDate,
                //         memo: info.memo,
                //         caseNo: caseNo,
                //         encntrTypeDesc: info.encntrTypeDesc,
                //         rmDesc: info.rmDesc,
                //         alias: isPmiCaseWithEnctrGrp ? paramsCaseNo ? alias : '' : alias,
                //         encntrGrpCd: paramsCaseNo ? caseNoInfo && caseNoInfo.encntrGrpCd || '' : ''
                //     };
                // });
                yield put({
                    type: bookingActionType.REDESIGN_PUT_BOOK_SUCCESS,
                    bookInfo: _bookInfo
                });
                yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
                yield put({ type: bookingActionType.RESET_REPLACE_APPOINTMENT });
                callback && callback(data.data);
            }
        }
        //  else if (data.respCode === 100) {
        //     //not exist
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111233' } });
        // } else if (data.respCode === 101) {
        //     //update exception
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111235' } });
        // } else if (data.respCode === 102) {
        //     //no suitable timeslot
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
        // } else if (data.respCode === 103) {
        //     //no suitable timeslot
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
        // } else if (data.respCode === 107) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
        // } else if (data.respCode === 108) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
        // } else if (data.respCode === 109) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
        // } else if (data.respCode === 110) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '111242',
        //             params: [
        //                 { name: 'HEADER', value: 'Book Confirm' },
        //                 { name: 'MODULE_NAME', value: 'appointment booking' }
        //             ]
        //         }
        //     });
        // }
        //  else if (data.respCode === 146) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
        // } else if (data.respCode === 148) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '110139'
        //         }
        //     });
        // } else if (data.respCode === 149) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '110140'
        //         }
        //     });
        // } else if (data.respCode === 150) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: { msgCode: '110153' }
        //     });
        // } else if (data.respCode === 151) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: { msgCode: '110204' }
        //     });
        // } else if (data.respCode === 152) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: { msgCode: '110205' }
        //     });
        // }else if (data.respCode === 153) {
        //     apptService.handleOperationFailed(153, data);
        // } else {
        else if ([100,101,102,103,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
            apptService.handleOperationFailed(data.respCode,data);
        } else{
            yield put({ type: bookingActionType.PUT_BOOK_FAIL });
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
        }
    });
}

function* bookingConfirm() { // NOTE bookingConfirm
    yield alsTakeLatest(bookingActionType.BOOK_CONFIRM, function* (action) {
        const appointmentMode = yield select(state => state.bookingInformation.appointmentMode);
        const service=yield select(state=>state.login.service);
        const selectedFamilyMember = yield select(state => state.bookingInformation.selectedFamilyMember);
        const isFamilyBooking = selectedFamilyMember.length > 0;
        if (appointmentMode === BookMeans.MULTIPLE) {
            if (service.svcCd === 'SPP') {
                let multipleConfirmData = [];
                action.params.params.forEach(e => {
                    multipleConfirmData.push({ normalConfirmList: e });
                });
                yield put({ type: bookingActionType.SPP_MULTIPLE_BOOKING_CONFIRM, params: multipleConfirmData, callback: action.callback });
            } else if(isFamilyBooking) {
                const params = AppointmentUtil.multiFamilyBookingParamHandler(action.params.params, selectedFamilyMember);
                yield put({ type: bookingActionType.MULTIPLE_BOOKING_CONFIRM, params: params, callback: action.callback });
            } else {
                let params = { normalConfirmList: action.params.params };
                yield put({ type: bookingActionType.MULTIPLE_BOOKING_CONFIRM, params: params, callback: action.callback });
            }
        } else {
            const familyBookingParam = AppointmentUtil.familyBookingParamHandler(action.params.params, selectedFamilyMember);
            let { data } = yield call(
                maskAxios.post,
                isFamilyBooking ? '/ana/cgs/appointments/batch/booking' : '/ana/appointments',
                familyBookingParam,
                { retry: 0 }
            );

            const multiBook104List = AppointmentUtil.checkPatientsCode(isFamilyBooking, data);

            if (data.respCode === 0 && multiBook104List.length === 0) {
                const {caseNoInfo, patientInfo} = yield select(state => state.patient);

                if(isFamilyBooking) {
                    const familyMemberData = yield select(state => state.bookingInformation.familyMemberData);
                    // Get booking successful patient
                    const successfulList = AppointmentUtil.checkBookingStatus(data.data.responseCodeByPatientKey);
                    // Generate book result
                    const familyBookingResult = AppointmentUtil.familyBookingResultGenerator(familyMemberData, selectedFamilyMember, patientInfo, data.data.confirmAppointmentBaseVos[0], successfulList);
                    yield put({ type: bookingActionType.UPDATE_FAMILY_BOOKING_RESULT, payload:{ familyBookingResult: familyBookingResult }});
                }

                const caseNo = data.data.caseDto ? data.data.caseDto.caseNo || '' : caseNoInfo && caseNoInfo.caseNo;
                const alias = data.data.caseDto ? data.data.caseDto.alias || '' : caseNoInfo && caseNoInfo.alias;
                const paramsCaseNo=action.params.params.caseNo;
                const isPmiCaseWithEnctrGrp=pmiCaseWithEnctrGrpVal();
                const bookInfo = {
                    apptId: isFamilyBooking ? data.data.confirmAppointmentBaseVos[0]?.apptId : data.data.apptId,
                    encntrTypeId: action.params.params.encntrTypeId,
                    rmId: action.params.params.rmId,
                    apptDate: isFamilyBooking ? data.data.confirmAppointmentBaseVos[0]?.apptDate : data.data.apptDate,
                    memo: isFamilyBooking ? data.data.confirmAppointmentBaseVos[0]?.memo : data.data.memo,
                    caseNo: caseNo,
                    encntrTypeDesc: isFamilyBooking ? data.data.confirmAppointmentBaseVos[0]?.encntrTypeDesc : data.data.encntrTypeDesc,
                    rmDesc: isFamilyBooking ? data.data.confirmAppointmentBaseVos[0]?.rmDesc : data.data.rmDesc,
                    alias: isPmiCaseWithEnctrGrp?paramsCaseNo?alias:'':alias,
                    encntrGrpCd:paramsCaseNo?caseNoInfo&&caseNoInfo.encntrGrpCd||'':''
                };
                yield put({
                    type: bookingActionType.REDESIGN_PUT_BOOK_SUCCESS,
                    bookInfo
                });
                yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
                action.callback && action.callback(data.data);
            } else if (data.respCode === 104 || multiBook104List.length > 0) { // NOTE Book 104
                yield put({ type: bookingActionType.UPDATE_FAMILY_BOOKING_PARAM, payload:{ familyBookingParam: familyBookingParam }});
                // Check the Booking Rule
                yield put({
                    type: bookingActionType.CHECK_BOOKING_RULE,
                    params: AppointmentUtil.checkBookingRuleParamsHandler(action.checkBookingRuleParams[0], multiBook104List, isFamilyBooking),
                    isFamilyBooking
                });
            }
            //  else if (data.respCode === 3) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110032' } });
            // } else if (data.respCode === 100) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
            // } else if (data.respCode === 103) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
            // } else if (data.respCode === 104) {
            //     // Check the Booking Rule
            //     yield put({
            //         type: bookingActionType.CHECK_BOOKING_RULE,
            //         params: action.checkBookingRuleParams[0]
            //     });
            // } else if (data.respCode === 105) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110286' } });
            // } else if (data.respCode === 107) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
            // } else if (data.respCode === 108) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
            // } else if (data.respCode === 109) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
            // } else if (data.respCode === 110) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '111242',
            //             params: [
            //                 { name: 'HEADER', value: 'Book Confirm' },
            //                 { name: 'MODULE_NAME', value: 'appointment booking' }
            //             ]
            //         }
            //     });
            // } else if (data.respCode === 146) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
            // } else if (data.respCode === 148) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110139'
            //         }
            //     });
            // } else if (data.respCode === 149) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110140'
            //         }
            //     });
            // } else if (data.respCode === 150) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110153' }
            //     });
            // } else if (data.respCode === 151) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110204' }
            //     });
            // } else if (data.respCode === 152) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110205' }
            //     });
            // }else if (data.respCode === 153) {
            //     apptService.handleOperationFailed(153, data);
            // }else {
            else if ([3,100,101,102,103,105,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
                apptService.handleOperationFailed(data.respCode,data);
            } else{
                yield put({ type: bookingActionType.PUT_BOOK_FAIL });
                yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
            }
            if (data.respCode !== 0 && data.respCode !== 104) {
                yield put({ type: bookingActionType.UPDATE_STATE, updateData: { pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED } });
            }
        }
    });
}

function* stillAppointmentsBookingConfirm() { //NOTE stillAppointments
    yield alsTakeLatest(bookingActionType.STILL_APPOINTMENTS_BOOK_CONFIRM, function* (action) {
        const {appointmentMode, selectedFamilyMember, familyBookingParam} = yield select(state => state.bookingInformation);
        const isFamilyBooking = selectedFamilyMember.length > 0;

        if (appointmentMode === BookMeans.MULTIPLE) {
            const multipleReplaceApptData = yield select(state => state.bookingInformation.multipleReplaceApptData);
            let params = {
                normalConfirmList: multipleReplaceApptData.normalConfirmList,
                stillConfirmList: multipleReplaceApptData.stillConfirmList
            };
            yield put({ type: bookingActionType.MULTIPLE_BOOKING_CONFIRM, params: params, callback: action.callback });
        } else {
            const pageStatus = yield select(state => state.bookingInformation.pageStatus);
            if (pageStatus === pageStatusEnum.EDIT) {
                const rescheduleApptData = yield select(state => state.bookingInformation.rescheduleApptData);
                let params = {
                    stillReschedule: true,
                    appointmentInfoBaseVo: rescheduleApptData.appointmentInfoBaseVo
                };
                yield put({ type: bookingActionType.REAPPOINTMENT, params: params, callback: action.callback });
            } else {
                const waitingList = yield select(state => state.bookingInformation.waitingList);
                if (waitingList) {
                    let params = {
                        confirmAppointmentDto: action.params.params[0],
                        stillProceed: true,
                        ...waitingList
                    };
                    yield put({ type: bookingActionType.BOOK_CONFIRM_WAITING, params: params, callback: action.callback });
                } else {
                    let { data } = yield call(maskAxios.post,
                        isFamilyBooking ? '/ana/cgs/appointments/batch/stillProcess' : '/ana/appointments/stillAppointments',
                        isFamilyBooking ? familyBookingParam : action.params.params[0],
                        { retry: 0 });
                    if (data.respCode === 0) {
                        const paramsCaseNo=action.params.params[0].caseNo;
                        const {caseNoInfo, patientInfo} = yield select(state => state.patient);

                        if(isFamilyBooking) {
                            const familyMemberData = yield select(state => state.bookingInformation.familyMemberData);
                            // Generate book result
                            const familyBookingResult = AppointmentUtil.familyBookingResultGenerator(
                                familyMemberData,
                                selectedFamilyMember,
                                patientInfo,
                                data.data.confirmAppointmentBaseVos[0],
                                [],
                                true
                            );
                            yield put({ type: bookingActionType.UPDATE_FAMILY_BOOKING_RESULT, payload:{ familyBookingResult: familyBookingResult }});
                        }

                        const currentpatientBookInfo = isFamilyBooking ? data.data.confirmAppointmentBaseVos.find( patient => patient.patientKey === patientInfo.patientKey) : null;
                        const isPmiCaseWithEnctrGrp=pmiCaseWithEnctrGrpVal();
                        const bookInfo = {
                            apptId: isFamilyBooking ? currentpatientBookInfo.apptId : data.data.apptId,
                            encntrTypeId: action.params.params[0].encntrTypeId,
                            rmId: action.params.params[0].rmId,
                            apptDate: isFamilyBooking ? currentpatientBookInfo.apptDate : data.data.apptDate,
                            memo: isFamilyBooking ? currentpatientBookInfo.memo : data.data.memo,
                            caseNo: action.params.params[0].caseNo,
                            encntrTypeDesc: isFamilyBooking ? currentpatientBookInfo.encntrTypeDesc : data.data.encntrTypeDesc,
                            rmDesc: isFamilyBooking ? currentpatientBookInfo.rmDesc : data.data.rmDesc,
                            alias: isPmiCaseWithEnctrGrp?paramsCaseNo?caseNoInfo && caseNoInfo.alias || '':'':caseNoInfo && caseNoInfo.alias || '',
                            encntrGrpCd:paramsCaseNo?caseNoInfo&&caseNoInfo.encntrGrpCd||'':''
                        };
                        yield put({
                            type: bookingActionType.REDESIGN_PUT_BOOK_SUCCESS,
                            bookInfo
                        });
                        yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
                        action.callback && action.callback(data.data);
                    }
                    //  else if (data.respCode === 3) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110032' } });
                    // } else if (data.respCode === 100) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
                    // } else if (data.respCode === 103) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
                    // } else if (data.respCode === 104) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111201' } });
                    // } else if (data.respCode === 105) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110286' } });
                    // } else if (data.respCode === 107) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
                    // } else if (data.respCode === 108) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
                    // } else if (data.respCode === 109) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
                    // } else if (data.respCode === 110) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: {
                    //             msgCode: '111242',
                    //             params: [
                    //                 { name: 'HEADER', value: 'Book Confirm' },
                    //                 { name: 'MODULE_NAME', value: 'appointment booking' }
                    //             ]
                    //         }
                    //     });
                    // } else if (data.respCode === 146) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
                    // } else if (data.respCode === 148) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: {
                    //             msgCode: '110139'
                    //         }
                    //     });
                    // } else if (data.respCode === 149) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: {
                    //             msgCode: '110140'
                    //         }
                    //     });
                    // } else if (data.respCode === 150) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: { msgCode: '110153' }
                    //     });
                    // } else if (data.respCode === 151) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: { msgCode: '110204' }
                    //     });
                    // } else if (data.respCode === 152) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: { msgCode: '110205' }
                    //     });
                    // }else if (data.respCode === 153) {
                    //     apptService.handleOperationFailed(153, data);
                    // } else {
                    else if ([3,100,101,102,103,104,105,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
                        apptService.handleOperationFailed(data.respCode,data);
                    } else{
                        yield put({ type: bookingActionType.PUT_BOOK_FAIL });
                        yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
                    }
                    if (data.respCode !== 0) {
                        yield put({ type: bookingActionType.UPDATE_STATE, updateData: { pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED } });
                    }
                }
            }
        }
    });
}

function* replaceOldAppointmnetBookingConfirm() { //NOTE Confirm replaceOld
    yield alsTakeLatest(bookingActionType.REPLACE_OLD_APPOINTMNET_BOOK_CONFIRM, function* (action) {
        const appointmentMode = yield select(state => state.bookingInformation.appointmentMode);
        if (appointmentMode === BookMeans.MULTIPLE) {
            const multipleReplaceApptData = yield select(state => state.bookingInformation.multipleReplaceApptData);
            let params = {
                normalConfirmList: multipleReplaceApptData.normalConfirmList,
                stillConfirmList: multipleReplaceApptData.stillConfirmList,
                replaceApptList: multipleReplaceApptData.replaceApptList
            };
            yield put({ type: bookingActionType.MULTIPLE_BOOKING_CONFIRM, params: params, callback: action.callback });
        } else {
            const pageStatus = yield select(state => state.bookingInformation.pageStatus);
            if (pageStatus === pageStatusEnum.EDIT) {
                const rescheduleApptData = yield select(state => state.bookingInformation.rescheduleApptData);
                let params = {
                    stillReschedule: true,
                    replaceApptList: rescheduleApptData.replaceApptList,
                    appointmentInfoBaseVo: rescheduleApptData.appointmentInfoBaseVo
                };
                yield put({ type: bookingActionType.REAPPOINTMENT, params: params, callback: action.callback });
            } else {
                const waitingList = yield select(state => state.bookingInformation.waitingList);
                const replaceAppointmentData = yield select(state => state.bookingInformation.replaceAppointmentData);
                if (waitingList) {
                    let params = {
                        confirmAppointmentDto: action.params.params[0][0].confirmAppointmentDto,
                        replaceApptList: replaceAppointmentData.bookingData,
                        stillProceed: true,
                        ...waitingList
                    };
                    yield put({ type: bookingActionType.BOOK_CONFIRM_WAITING, params: params, callback: action.callback });
                } else {
                    let { data } = yield call(maskAxios.post, '/ana/appointments/replaceableOldAppointments', action.params.params[0][0], { retry: 0 });
                    if (data.respCode === 0) {
                        const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                        const paramsCaseNo=action.params.params[0][0].confirmAppointmentDto.caseNo;
                        const isPmiCaseWithEnctrGrp=pmiCaseWithEnctrGrpVal();
                        const bookInfo = {
                            apptId: data.data.apptId,
                            encntrTypeId: action.params.params[0][0].confirmAppointmentDto.encntrTypeId,
                            rmId: action.params.params[0][0].confirmAppointmentDto.rmId,
                            apptDate: action.params.params[0][0].confirmAppointmentDto.apptDate,
                            memo: action.params.params[0][0].confirmAppointmentDto.memo,
                            caseNo: action.params.params[0][0].confirmAppointmentDto.caseNo,
                            encntrTypeDesc: data.data.encntrTypeDesc,
                            rmDesc: data.data.rmDesc,
                            alias: isPmiCaseWithEnctrGrp?paramsCaseNo?caseNoInfo && caseNoInfo.alias || '':'':caseNoInfo && caseNoInfo.alias || '',
                            encntrGrpCd:paramsCaseNo?caseNoInfo&&caseNoInfo.encntrGrpCd||'':''
                        };
                        yield put({
                            type: bookingActionType.REDESIGN_PUT_BOOK_SUCCESS,
                            bookInfo
                        });
                        yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
                        action.callback && action.callback(data.data);
                    }
                    //  else if (data.respCode === 3) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110032' } });
                    // } else if (data.respCode === 100) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
                    // } else if (data.respCode === 103) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
                    // } else if (data.respCode === 104) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111201' } });
                    // } else if (data.respCode === 105) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110286' } });
                    // } else if (data.respCode === 107) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
                    // } else if (data.respCode === 108) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
                    // } else if (data.respCode === 109) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
                    // } else if (data.respCode === 110) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: {
                    //             msgCode: '111242',
                    //             params: [
                    //                 { name: 'HEADER', value: 'Book Confirm' },
                    //                 { name: 'MODULE_NAME', value: 'appointment booking' }
                    //             ]
                    //         }
                    //     });
                    // } else if (data.respCode === 146) {
                    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
                    // } else if (data.respCode === 148) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: {
                    //             msgCode: '110139'
                    //         }
                    //     });
                    // } else if (data.respCode === 149) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: {
                    //             msgCode: '110140'
                    //         }
                    //     });
                    // } else if (data.respCode === 150) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: { msgCode: '110153' }
                    //     });
                    // } else if (data.respCode === 151) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: { msgCode: '110204' }
                    //     });
                    // } else if (data.respCode === 152) {
                    //     yield put({
                    //         type: messageType.OPEN_COMMON_MESSAGE,
                    //         payload: { msgCode: '110205' }
                    //     });
                    // }else if (data.respCode === 153) {
                    //     apptService.handleOperationFailed(153, data);
                    // } else {
                    else if (data.respCode === 106) {
                        yield put({
                            type: messageType.OPEN_COMMON_MESSAGE,
                            payload: { msgCode: '115571' }
                        });
                    }
                    else if ([3,100,101,102,103,104,105,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
                        apptService.handleOperationFailed(data.respCode,data);
                    } else{
                        yield put({ type: bookingActionType.PUT_BOOK_FAIL });
                        yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110031' } });
                    }
                    if (data.respCode !== 0) {
                        yield put({ type: bookingActionType.UPDATE_STATE, updateData: { pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED } });
                    }
                }
            }
        }
    });
}

function* replaceRuleAppointmentHandler(data) {
    /**
     * NOTE
     * Scenario:
     *  - hvSameDay && hvReplace -> Overlapped
     *  - hvSameDay -> Overlapped
     *  - hvReplace -> Appt. Dulplicate Booking (No Replace Old Appt option)
     */
    const hvSameDay = data.data.replaceAppointmentCheckingVos.find((rule) => rule.isSameDayAppointment);

    const hvReplace = data.data.replaceAppointmentCheckingVos.find((rule) => rule.isReplaceAppointment);

    if (hvSameDay && !hvReplace || hvReplace && hvSameDay)
        yield put({
            type: bookingActionType.UPDATE_STATE,
            updateData: { openSameDayAppointmentDialog: true }
        });

    if (hvReplace && !hvSameDay){
        const familyMemberData = yield select(state => state.bookingInformation.familyMemberData);

        yield put({
            type: bookingActionType.UPDATE_STATE,
            updateData: {
                openReplaceAppointmentDialog: true,
                isFamilyReplace: true,
                familyReplaceAppointmentList: AppointmentUtil.familyReplaceAptDataGenerator(
                    data.data.replaceAppointmentCheckingVos, familyMemberData
                )
            }
        });
    }
}

function* checkBookingRule() { //NOTE checkBookingRule
    yield alsTakeEvery(bookingActionType.CHECK_BOOKING_RULE, function* (action) {
        let { params, callback, isFamilyBooking } = action;
        let url = isFamilyBooking ? '' : serialize('/ana/appointments/replaceRule', params);
        let { data } = isFamilyBooking? yield call(maskAxios.post, '/ana/cgs/appointments/batch/replaceRule',params) : yield call(maskAxios.get, url);
        if (data.respCode === 0) {
            if(isFamilyBooking) {
                yield replaceRuleAppointmentHandler(data);
                return;
            }
            const isSameDayAppointment = data.data.isSameDayAppointment;
            const isReplaceAppointment = data.data.isReplaceAppointment;
            const replaceAppointmentInfo = {
                bookingData: data.data.appointmentInfoBaseVo,
                cimsOneReplaceList: data.data.cimsOneReplaceAppointmentInfoBaseVo,
                // Update the isSameDayAppointment to isReplaceAppointment
                minInterval: data.data.minInterval ? data.data.minInterval : '',
                minIntervalUnit: data.data.minIntervalUnit ? data.data.minIntervalUnit : ''
            };
            yield put({
                type: bookingActionType.UPDATE_STATE,
                updateData: {
                    openReplaceAppointmentDialog: data.data.isReplaceAppointment,
                    openSameDayAppointmentDialog: data.data.isSameDayAppointment,
                    replaceAppointmentData: replaceAppointmentInfo,
                    isFamilyReplace: false
                }
            });
            callback && callback(!isSameDayAppointment && !isReplaceAppointment);
        }
    });
}

function* bookConfirmWaiting() {
    yield alsTakeLatest(bookingActionType.BOOK_CONFIRM_WAITING, function* (action) {
        let { data } = yield call(maskAxios.post, '/ana/waitingList/appointments', action.params, { retry: 0 });
        if (data.respCode === 0) {
            if (data.data.bookSuccess) {
                const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                const bookInfo = {
                    apptId: data.data.apptId,
                    encntrTypeId: action.params.confirmAppointmentDto.encntrTypeId,
                    rmId: action.params.confirmAppointmentDto.rmId,
                    apptDate: action.params.confirmAppointmentDto.apptDate,
                    memo: action.params.confirmAppointmentDto.memo,
                    caseNo: action.params.confirmAppointmentDto.caseNo,
                    encntrTypeDesc: data.data.confirmAppointmentDto.encntrTypeDesc,
                    rmDesc: data.data.confirmAppointmentDto.rmDesc,
                    alias: caseNoInfo && caseNoInfo.alias || ''
                };
                yield put({ type: bookingActionType.REDESIGN_PUT_BOOK_SUCCESS, bookInfo });
                yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
                yield put({ type: bookingActionType.RESET_REPLACE_APPOINTMENT });
                action.callback && action.callback({ apptId: data.data.apptId });
            } else {
                let replaceAppointmentInfo = {
                    bookingData: data.data.replaceApptList,
                    cimsOneReplaceList: data.data.replaceCimsOneApptList,
                    minInterval: data.data.minInterval ? data.data.minInterval : '',
                    minIntervalUnit: data.data.minIntervalUnit ? data.data.minIntervalUnit : '',
                    isReplaceAppointment: data.data.replaceAppointment,
                    isSameDayAppointment: data.data.sameDayAppointment,
                    isStillProceed: data.data.stillProceed
                };
                let openSameDayAppointmentDialog, openReplaceAppointmentDialog;
                if (data.data.sameDayAppointment) {
                    openSameDayAppointmentDialog = true;
                    openReplaceAppointmentDialog = false;
                } else if (data.data.replaceAppointment) {
                    openSameDayAppointmentDialog = false;
                    openReplaceAppointmentDialog = true;
                } else {
                    openSameDayAppointmentDialog = false;
                    openReplaceAppointmentDialog = false;
                }
                yield put({
                    type: bookingActionType.UPDATE_STATE,
                    updateData: {
                        replaceAppointmentData: replaceAppointmentInfo,
                        openSameDayAppointmentDialog,
                        openReplaceAppointmentDialog
                    }
                });
            }
        }
        //  else if (data.respCode === 3) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110032' } });
        // } else if (data.respCode === 101) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111217' } });
        // } else if (data.respCode === 102) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
        // } else if (data.respCode === 103) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
        // } else if (data.respCode === 104) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111201' } });
        // } else if (data.respCode === 105) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111113' } });
        // } else if (data.respCode === 106) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111114' } });
        // } else if (data.respCode === 107) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
        // } else if (data.respCode === 108) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
        // } else if (data.respCode === 109) {
        //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
        // } else if (data.respCode === 110) {
        //     yield put({
        //         type: messageType.OPEN_COMMON_MESSAGE,
        //         payload: {
        //             msgCode: '111242',
        //             params: [
        //                 { name: 'HEADER', value: 'Book Confirm' },
        //                 { name: 'MODULE_NAME', value: 'appointment booking' }
        //             ]
        //         }
        //     });
        // }
        else if ([3,100,101,102,103,104,105,106,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
            apptService.handleOperationFailed(data.respCode,data);
        }
    });
}


function* getAppointmentReport() {
    while (true) {
        try {
            let { params } = yield take(bookingActionType.GET_APPOINTMENT_REPORT);

            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/ana/apptSlipReport', { params });
            if (data.respCode === 0) {
                yield print({ base64: data.data });
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

function* getSppApptSlipReport() {
    while (true) {
        try {
            let { params } = yield take(bookingActionType.GET_SPP_APP_SLIP_REPORT);

            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/ana/sppApptSlipReport', { params });
            if (data.respCode === 0) {
                yield print({ base64: data.data });
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

function* walkInAppointment() {
    while (true) {

        try {
            let { params, bookingData, walkInInfo, callback } = yield take(bookingActionType.WALK_IN_ATTENDANCE);
            yield put(alsStartTrans());

            let clinicList = yield select(s => s.common.clinicList);
            // let patientInfo = yield select(s => s.patient.patientInfo);
            // let idSts = patientInfo ? patientInfo.idSts : 'T';
            let site = clinicList.find(s => s.siteId === params.siteId);
            let svcCd = site ? site.svcCd : null;

            let patientLabel = CommonUtil.getPatientCall();
            // if (idSts !== 'N') {
            //     yield put(openCommonMessage({
            //         msgCode: '130209',
            //         params: [{ name: 'PATIENT_LABEL', value: patientLabel },
            //         { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
            //         ]
            //     }));
            //     continue;
            // }


            let { data } = yield call(atndService.walkIn, { svcCd, atndSrc: 'C', ...params });
            if (data.respCode === 0) {
                let clinicList = yield select(state => state.common.clinicList);
                let encounterTypes = yield select(state => state.common.encounterTypeList);
                let rooms = yield select(state => state.common.rooms);

                let massageData = atndService.takeAttendanceResponseToConfirmReduxState(
                    data.data,
                    bookingData,
                    clinicList,
                    encounterTypes,
                    rooms
                );
                const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                const paramsCaseNo=params.caseNo;
                massageData.patientStatusCd = params.patientStatusCd ? params.patientStatusCd : '';
                if (!massageData.encntrGrpCd) {
                    massageData.encntrGrpCd = paramsCaseNo ? caseNoInfo && caseNoInfo.encntrGrpCd || '' : '';
                }

                yield put({
                    type: bookingActionType.BOOK_AND_ATTEND_SUCCEESS,
                    respData: massageData,
                    walkInData: walkInInfo
                });
                callback && callback(massageData);
            }else if (data.respCode === 103) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        params: [
                            {
                                name: 'PATIENT_CALL',
                                value: patientLabel.toLowerCase()
                            }
                        ],
                        msgCode: '130202'
                    }
                });
            } else if ([100, 101, 102, 140, 141].indexOf(data.respCode) !== -1) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '130205'
                    }
                });
            } else if (data.respCode === 143) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        params: [
                            {
                                name: 'PATIENT_CALL',
                                value: patientLabel.toLowerCase()
                            }
                        ],
                        msgCode: '111240'
                    }
                });
            }
            //  else if (data.respCode === 3) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '110032'
            //         }
            //     });
            // } else if ([100, 101, 102, 140, 141].indexOf(data.respCode) !== -1) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '130205'
            //         }
            //     });
            // } else if (data.respCode === 103) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             params: [
            //                 {
            //                     name: 'PATIENT_CALL',
            //                     value: patientLabel.toLowerCase()
            //                 }
            //             ],
            //             msgCode: '130202'
            //         }
            //     });
            // } else if (data.respCode === 107) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
            // } else if (data.respCode === 108) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
            // } else if (data.respCode === 109) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
            // } else if (data.respCode === 143) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             params: [
            //                 {
            //                     name: 'PATIENT_CALL',
            //                     value: patientLabel.toLowerCase()
            //                 }
            //             ],
            //             msgCode: '140112'
            //         }
            //     });
            // } else if (data.respCode === 151) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110204' }
            //     });
            // } else if (data.respCode === 152) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110205' }
            //     });
            else if ([3,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
                apptService.handleOperationFailed(data.respCode,data);
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

function* listRemarkCode() {
    while (true) {

        try {
            yield take(bookingActionType.LIST_REMARK_CODE);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/appointment/listRemarkCode');
            if (data.respCode === 0) {
                yield put({
                    type: bookingActionType.PUT_LIST_REMARK_CODE,
                    remarkCodeList: data.data
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

function* cancelAppointment() {
    while (true) {
        try {
            let { apptPara } = yield take(bookingActionType.CANCEL_APPOINTMENT);
            yield put(alsStartTrans());

            let url = 'appointment/cancelAppointment';
            let { data } = yield call(maskAxios.post, url, apptPara);
            if (data.respCode === 0) {
                //yield put({ type: bookingActionType.BOOK_AND_ATTEND_SUCCEESS });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111213'
                    }
                });
                yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
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
                        msgCode: '111218'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111219'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111205'
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

function* deleteAppointment() {
    while (true) {
        try {
            let { params, listParams } = yield take(bookingActionType.DELETE_APPOINTMENT);
            const svcCd = yield select(state => state.login.service.svcCd);
            yield put(alsStartTrans());

            let url = 'ana/appointments';
            let { data } = yield call(maskAxios.delete, url, { data: params });
            if (data.respCode === 0) {
                //yield put({ type: bookingActionType.BOOK_AND_ATTEND_SUCCEESS });
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111213',
                        showSnackbar: true
                    }
                });
                yield put({
                    type: bookingActionType.LIST_APPOINTMENT_HISTORY,
                    params: listParams
                });
                yield put({
                    type: bookingActionType.UPDATE_STATE,
                    updateData: {
                        currentSelectedApptInfo: null,
                        appointmentMode: ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC.indexOf(svcCd) > -1 ? BookMeans.MULTIPLE : BookMeans.SINGLE
                    }
                });
                yield put({ type: bookingActionType.INIT_BOOKING_DATA });
                const curPatientAppt = yield select(state => state.patient.appointmentInfo);
                if (curPatientAppt && curPatientAppt.appointmentId && params.apptId === curPatientAppt.appointmentId) {
                    yield put({ type: patientActionType.UPDATE_PATIENT_APPOINTMENT, appointmentInfo: null });
                }
                yield call(getPatientLatestEncntrCase);
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
                        msgCode: '111218'
                    }
                });
            } else if (data.respCode === 102) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111219'
                    }
                });
            } else if (data.respCode === 101) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111205'
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

function* respEditAppointment(respCode) {
    switch (respCode) {
        case 1: {
            break;
        }
        case 100: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111218' } });
            break;
        }
        case 3: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110032' } });
            break;
        }
        case 101: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111205' } });
            break;
        }
        case 103: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
            break;
        }
        case 102: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111219' } });
            break;
        }
        case 104: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111201' } });
            break;
        }
        case 105: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '' } });
            break;
        }
        case 106: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '' } });
            break;
        }
        case 107: {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
            break;
        }
    }
}

function* updateAppointment(action) {
    let { params, callback } = action;
    let { data } = yield call(maskAxios.put, '/ana/appointments', params);
    if (data.respCode === 0) {
        yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111212' } });
        yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
        yield put({ type: bookingActionType.UPDATE_APPOINTMENT_SUCCESS });
        const patientInfo = yield select(state => state.patient.patientInfo);
        const caseNoInfo = yield select(state => state.patient.caseNoInfo);
        yield put(getPatientById({
            patientKey: patientInfo.patientKey,
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            callBack: () => {
                storeConfig.store.dispatch({ type: bookingActionType.INIT_BOOKING_DATA });
            }
        }));
        callback && callback();
    } else {
        yield call(respEditAppointment, data.respCode);
    }
}

function* reAppointment() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.REAPPOINTMENT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.put, '/ana/appointments/reAppointment', params);
            if (data.respCode === 0) {
                if (data.data.rescheduleSuccess) {
                    const respData = data.data.appointmentInfoBaseVo;
                    const apptDetlVo = respData.appointmentDetlBaseVoList.find(x => x.isObs === 0);
                    const caseNoInfo = yield select(state => state.patient.caseNoInfo);
                    const paramsCaseNo=params.appointmentInfoBaseVo.caseNo;
                    const isPmiCaseWithEnctrGrp=pmiCaseWithEnctrGrpVal();
                    let bookConfirmData = {
                        appointmentId: respData.appointmentId,
                        caseNo: respData.caseNo,
                        encntrTypeId: apptDetlVo.encntrTypeId,
                        rmId: apptDetlVo.rmId,
                        appointmentDate: respData.apptDateTime,
                        memo: apptDetlVo.memo,
                        caseTypeCd: 'New Case',
                        encntrTypeDesc: respData.encntrTypeDesc,
                        rmDesc: respData.rmDesc,
                        //alias: caseNoInfo && caseNoInfo.alias || '',
                        alias: isPmiCaseWithEnctrGrp?paramsCaseNo?caseNoInfo && caseNoInfo.alias:'':caseNoInfo && caseNoInfo.alias,
                        encntrGrpCd:paramsCaseNo?caseNoInfo&&caseNoInfo.encntrGrpCd||'':''
                    };
                    yield put({
                        type: bookingActionType.UPDATE_STATE,
                        updateData: {
                            confirmData: bookConfirmData,
                            futureAppt: null,
                            futureApptId: null,
                            pageStatus: pageStatusEnum.CONFIRMED,
                            pageDialogStatus: PAGE_DIALOG_STATUS.NONE,
                            currentSelectedApptInfo: null
                        }
                    });
                    yield put({ type: bookingActionType.LIST_APPOINTMENT_HISTORY });
                    yield put({ type: bookingActionType.RESET_REPLACE_APPOINTMENT });
                    yield call(getPatientLatestEncntrCase);
                    let apptInfo = { ...data.data.appointmentInfoBaseVo, apptId: data.data.appointmentInfoBaseVo.appointmentId };
                    callback && callback(apptInfo);
                } else {
                    let rescheduleInfo = {
                        appointmentInfoBaseVo: data.data.appointmentInfoBaseVo,
                        replaceApptList: data.data.replaceApptList,
                        cimsOneReplaceList: data.data.replaceCimsOneApptList,
                        isReplaceAppointment: data.data.replaceAppointment,
                        isSameDayAppointment: data.data.sameDayAppointment,
                        minInterval: data.data.minInterval ? data.data.minInterval : '',
                        minIntervalUnit: data.data.minIntervalUnit ? data.data.minIntervalUnit : ''
                    };
                    let openSameDayAppointmentDialog, openReplaceAppointmentDialog;
                    if (data.data.sameDayAppointment) {
                        openSameDayAppointmentDialog = true;
                        openReplaceAppointmentDialog = false;
                    } else if (data.data.replaceAppointment) {
                        openSameDayAppointmentDialog = false;
                        openReplaceAppointmentDialog = true;
                    } else {
                        openSameDayAppointmentDialog = false;
                        openReplaceAppointmentDialog = false;
                    }
                    yield put({
                        type: bookingActionType.UPDATE_STATE,
                        updateData: {
                            rescheduleApptData: rescheduleInfo,
                            openSameDayAppointmentDialog,
                            openReplaceAppointmentDialog
                        }
                    });
                }
            }
             else if ([104,108,109,110,151,152,153].indexOf(data.respCode) > -1) {
                apptService.handleOperationFailed(data.respCode,data);
            //  else if (data.respCode === 104) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
            // } else if (data.respCode === 108) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
            // } else if (data.respCode === 109) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
            // } else if (data.respCode === 110) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '111242',
            //             params: [
            //                 { name: 'HEADER', value: 'Book Confirm' },
            //                 { name: 'MODULE_NAME', value: 'appointment booking' }
            //             ]
            //         }
            //     });
            // } else if (data.respCode === 151) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110204' }
            //     });
            // } else if (data.respCode === 152) {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: { msgCode: '110205' }
            //     });
            } else {
                yield call(respEditAppointment, data.respCode);
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* submitUpdateAppointment() {
    while (true) {
        try {
            let { updateApptPara, updateOrBookNew, callback } = yield take(bookingActionType.SUBMIT_UPDATE_APPOINTMENT);
            yield put(alsStartTrans());

            if (updateOrBookNew === UpdateMeans.UPDATE) {
                yield call(updateAppointment, { params: updateApptPara, callback });
            } else if (updateOrBookNew === UpdateMeans.BOOKNEW) {
                let params = {
                    stillReschedule: false,
                    appointmentInfoBaseVo: updateApptPara
                };
                yield put({ type: bookingActionType.REAPPOINTMENT, params, callback });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* listContatHistory() {
    while (true) {
        try {
            let { apptId, callback } = yield take(bookingActionType.GET_CONTACT_HISTORY);
            yield put(alsStartTrans());

            if (apptId) {
                let { data } = yield call(maskAxios.get, `/ana/appointments/${apptId}/contactHistories`);
                if (data.respCode === 0) {
                    yield put({
                        type: bookingActionType.PUT_CONTACT_HISTORY,
                        contactList: data.data
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
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* insertContatHistory() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.INSERT_CONTACT_HISTORY);
            yield put(alsStartTrans());

            if (params) {
                let { data } = yield call(maskAxios.post, `/ana/appointments/${params.appointmentId}/contactHistories`, params);
                if (data.respCode === 0) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110021',
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
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* updateContatHistory() {
    while (true) {

        try {
            let { params, callback } = yield take(bookingActionType.UPDATE_CONTACT_HISTORY);
            yield put(alsStartTrans());

            if (params) {
                let { data } = yield call(maskAxios.put, `/ana/appointments/${params.appointmentId}/contactHistories/${params.contactHistoryId}`, params);
                if (data.respCode === 0) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: data.data.statusCd === 'A' ? '110023' : '110022',
                            showSnackbar: true
                        }
                    });
                    callback && callback();
                } else if (data.respCode === 100) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111221'
                        }
                    });
                } else if (data.respCode === 101) {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111222'
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
        }
    }
}

function getBookingDataFromSelectedData(selectedData, encounterTypeList, sessionList, isEdit = false) {
    if (selectedData) {
        let apptInfo = _.cloneDeep(selectedData);
        let bookingData = getState(state => state.bookingInformation.bookingData);
        const filterEncounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(apptInfo.siteId, encounterTypeList);
        let tempBookingData = _.cloneDeep(bookingData);
        tempBookingData.encounterTypeCd = apptInfo.encounterTypeCd;
        tempBookingData.encounterTypeId = apptInfo.encntrTypeId;
        tempBookingData.subEncounterTypeCd = apptInfo.subEncounterTypeCd;
        tempBookingData.rmId = apptInfo.rmId;
        tempBookingData.appointmentDate = apptInfo.appointmentDate;
        tempBookingData.caseTypeCd = apptInfo.caseTypeCd;
        tempBookingData.qtType = apptInfo.qtType;
        tempBookingData.encounterTypeList = _.cloneDeep(filterEncounterTypeList);
        tempBookingData.remarkId = apptInfo.remarkId;
        tempBookingData.memo = apptInfo.memo;
        tempBookingData.patientStatusCd = apptInfo.patientStatusCd;
        tempBookingData.sessId = apptInfo.sessId;
        tempBookingData.bookingUnit = apptInfo.bookingUnit;
        tempBookingData.forDoctorOnly = apptInfo.forDoctorOnly;
        tempBookingData.priority = apptInfo.priority;
        //reset the elapsed period
        tempBookingData.elapsedPeriod = '';
        tempBookingData.elapsedPeriodUnit = '';
        //SHS service defaulter tracing
        if (apptInfo.svcCd === 'SHS') {
            tempBookingData.isTrace = apptInfo.isTrace || 0;
            tempBookingData.dfltTraceRsnTypeId = apptInfo.dfltTraceRsnTypeId || '';
            tempBookingData.dfltTraceRsnRemark = apptInfo.dfltTraceRsnRemark || '';
            tempBookingData.isDfltTracePriority = apptInfo.isDfltTracePriority || 0;
        }
        tempBookingData.appointmentDateTo = null;
        tempBookingData.gestWeekFromWeek = null;
        tempBookingData.gestWeekFromDay = null;
        tempBookingData.gestWeekToWeek = null;
        tempBookingData.gestWeekToDay = null;
        if (apptInfo.appointmentTime) {
            const aTime = apptInfo.appointmentTime.split(':');
            if (aTime.length === 2) {
                tempBookingData.appointmentTime = moment(apptInfo.appointmentDate).set({ 'hours': aTime[0], 'minutes': aTime[1] });
            }
        } else {
            tempBookingData.appointmentTime = moment(apptInfo.appointmentDate).set({ 'hours': 0, 'minutes': 0, 'second': 0 });
        }
        tempBookingData.siteId = apptInfo.siteId;
        tempBookingData.patientStatusCd = apptInfo.patientStatusCd;

        if (isEdit) {
            //Justin 20200921: encounter type inactive or expire
            const encounterType = filterEncounterTypeList && filterEncounterTypeList.find(x => x.encntrTypeId === apptInfo.encntrTypeId);
            if (!EnctrAndRmUtil.isActiveEnctrTypeId(apptInfo.encntrTypeId, filterEncounterTypeList)) {
                tempBookingData.encounterTypeCd = '';
                tempBookingData.encounterTypeId = '';
                tempBookingData.subEncounterTypeCd = '';
                tempBookingData.rmId = '';
                dispatch({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111237',
                        showSnackbar: true
                    }
                });
            } else {
                //Justin 20200921: room inactive or expire
                const mappingRooms = encounterType.subEncounterTypeList;
                if (!EnctrAndRmUtil.isActiveRoomId(apptInfo.rmId, mappingRooms)) {
                    tempBookingData.subEncounterTypeCd = '';
                    tempBookingData.rmId = '';
                    dispatch({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '111237',
                            showSnackbar: true
                        }
                    });
                }
            }

            //when session is inactive
            if (!CommonUtil.isActiveSessionId(apptInfo.sessId, sessionList)) {
                tempBookingData.sessId = '';
                dispatch({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111241',
                        showSnackbar: true
                    }
                });
            }
        }

        return tempBookingData;
    }
    return null;
}

function getPatientStatusCd() {
    const patientInfo = getState(state => state.patient.patientInfo);
    const caseNoInfo = getState(state => state.patient.caseNoInfo);
    return AppointmentUtil.getPatientStatusCd(caseNoInfo && caseNoInfo.caseNo, patientInfo);
}

function* selectAppointment() {
    yield alsTakeEvery(bookingActionType.TRIGGER_SELECT_APPOINTMENT, function* (action) {
        let { selectedData } = action;
        if (selectedData) {
            const encounterTypeList = yield select(state => state.common.encounterTypeList);
            const sessionList = yield select(state => state.common.sessionsConfig);
            let bookingData = getBookingDataFromSelectedData(selectedData, encounterTypeList, sessionList);
            bookingData.patientStatusCd = getPatientStatusCd();
            yield put({
                type: bookingActionType.UPDATE_STATE,
                updateData: {
                    bookingData,
                    appointmentMode: BookMeans.SINGLE
                }
            });
        }
        // Quota type = Walk-in : cannot select appointment
        else {
            yield put({ type: bookingActionType.INIT_BOOKING_DATA });
        }
    });
}

function* editAppointment() {
    yield alsTakeEvery(bookingActionType.EDIT_APPOINTMENT, function* (action) {
        let apptInfo = _.cloneDeep(action.selectedData);
        apptInfo.patientStatusCd = getPatientStatusCd();
        const svcCd = yield select(state => state.login.service.svcCd);
        const sessionList = yield call(fetchGetSessionList, svcCd, apptInfo.siteId);
        yield put({
            type: bookingActionType.GET_ENCOUNTER_TYPE_LIST_BY_SITE,
            serviceCd: svcCd,
            siteId: apptInfo.siteId,
            callback: (encounterTypeList) => {
                let bookingData = getBookingDataFromSelectedData(apptInfo, encounterTypeList, sessionList, true);
                dispatch({
                    type: bookingActionType.PUT_EDIT_APPOINTMENT,
                    apptInfo,
                    bookingData,
                    sessionList
                });
            }
        });
    });
}

function* init_bookingData() {
    yield alsTakeEvery(bookingActionType.INIT_BOOKING_DATA, function* (action) {
        let { bookData, cartData } = action;
        let newBookingData = _.cloneDeep(initBookingData);
        if (bookData) newBookingData = _.cloneDeep(bookData);
        // const service = yield select(state => state.login.service);
        const clinic = yield select(state => state.login.clinic);
        const pageStatus = yield select(state => state.bookingInformation.pageStatus);

        //init data
        if (!newBookingData.siteId) {
            newBookingData.siteId = clinic.siteId;
        }

        if(cartData && cartData.length){
            newBookingData.siteId =  cartData[0]?.siteId || clinic.siteId;
        }

        // yield put({
        //     type: bookingActionType.GET_ENCOUNTER_TYPE_LIST_BY_SITE,
        //     serviceCd: clinic.svcCd,
        //     siteId: newBookingData.siteId,
        //     callback: (encounterTypeList) => {

        //     }
        // });

        //get default encounterTypeList
        // const encounterTypeList = getState(state => state.common.encounterTypeList);
        // const _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(clinic.siteId, encounterTypeList);
        const _encounterTypeList = yield call(fetchGetEncounterTypeList, clinic.serviceCd, newBookingData.siteId, newBookingData.sspecFilter);

        //get session list
        const sessionList = yield call(fetchGetSessionList, clinic.svcCd, clinic.siteId);

        newBookingData.encounterTypeList = _.cloneDeep(_encounterTypeList);

        //encounterType and room
        const caseNoInfo = yield select(state => state.patient.caseNoInfo);
        const { defaultEncounter, defaultRoom } = AppointmentUtil.getDefaultEncounterAndRoom({
            encounterTypeList: _encounterTypeList,
            encntrId: newBookingData.encounterTypeId,
            roomId: newBookingData.rmId,
            caseNoDto: caseNoInfo
        });
        if (defaultEncounter) {
            newBookingData.encounterTypeId = defaultEncounter.encntrTypeId;
            newBookingData.encounterTypeCd = defaultEncounter.encounterTypeCd;
        }

        if (defaultRoom) {
            newBookingData.rmId = defaultRoom.rmId;
            newBookingData.rmCd = defaultRoom.rmCd;
            newBookingData.subEncounterTypeCd = defaultRoom.rmCd;
        }

        if (newBookingData.sspecFilter) {
            const encounterType = newBookingData.encounterTypeList.find(x => x.isNewOld === 0);
            newBookingData.encounterTypeId = encounterType?.encntrTypeId;
            newBookingData.encounterTypeCd = encounterType?.encounterTypeCd;
            newBookingData.rmId = '';
            newBookingData.rmCd = '';
            newBookingData.subEncounterTypeCd = '';
            const defaultRoomCd = CommonUtil.getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.SHS_ANA_WALK_IN_SKIN_RM_CD_DEFAULT, clinic.svcCd, clinic.siteId);
            if (defaultRoomCd) {
                const room = encounterType.subEncounterTypeList.find(x => x.rmCd === defaultRoomCd);
                if (room) {
                    newBookingData.rmId = room.rmId;
                    newBookingData.rmCd = room.rmCd;
                    newBookingData.subEncounterTypeCd = room.rmCd;
                }
            }
        }
        newBookingData.sspecFilter = null;

        //appointment date and time
        newBookingData.appointmentDate = newBookingData.appointmentDate ? newBookingData.appointmentDate : null;
        newBookingData.appointmentTime = newBookingData.appointmentTime ? moment(newBookingData.appointmentTime, 'HH:mm') : null;

        //quota type
        newBookingData.qtType = newBookingData.qtType || Enum.APPOINTMENT_TYPE_SUFFIX[0].code;

        //multiple appointment
        newBookingData.multipleAppointmentDate = newBookingData.multipleAppointmentDate || moment();
        newBookingData.multipleNoOfAppointment = newBookingData.multipleNoOfAppointment || '';
        newBookingData.multipleInterval = newBookingData.multipleInterval || '';
        newBookingData.multipleIntervalUnit = newBookingData.multipleIntervalUnit || Enum.INTERVAL_TYPE[1]['code'];

        //get default patientStatus
        const patientInfo = yield select(state => state.patient.patientInfo);
        //retrieve patientStatus from caseno or patient
        newBookingData.patientStatusCd = AppointmentUtil.getPatientStatusCd(caseNoInfo && caseNoInfo.caseNo, patientInfo);

        const encntrGrpList = yield select(state => state.caseNo.encntrGrpList);
        if (encntrGrpList && encntrGrpList.length === 1) {
            newBookingData.encntrGrpCd = encntrGrpList[0].encntrGrpCd;
        } else if (encntrGrpList && encntrGrpList.length > 1) {
            const caseNoEncntrGrpCd = caseNoInfo.encntrGrpCd || '';
            if (caseNoEncntrGrpCd) {
                newBookingData.encntrGrpCd = caseNoEncntrGrpCd;
            } else {
                if (defaultEncounter) {
                    newBookingData = AppointmentUtil.getEncntrGrpByEncntrId(defaultEncounter.encntrTypeId, _.cloneDeep(newBookingData));
                }
            }
        }
        newBookingData=AppointmentUtil.setDefaultEncntrAndRoomByEncntrGrp(newBookingData,_encounterTypeList);

        if (newBookingData && newBookingData.encounterTypeId) {
            newBookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(newBookingData, newBookingData.encounterTypeId);
        } else {
            if (newBookingData) {
                //get default elapsed period
                newBookingData = AppointmentUtil.getDefaultElapsedPeriodBookData(newBookingData);
            }
        }

        //walk in flow
        if (pageStatus === pageStatusEnum.WALKIN) {
            newBookingData.appointmentDate = moment();
            newBookingData.appointmentTime = moment();
            newBookingData.qtType = 'W';
            const walkInAttendanceInfo = yield select(state => state.bookingInformation.walkInAttendanceInfo);
            let walkInfo = { ...walkInAttendanceInfo, patientStatus: caseNoInfo && caseNoInfo.patientStatus };
            yield put({
                type: bookingActionType.UPDATE_STATE,
                updateData: {
                    walkInAttendanceInfo: walkInfo,
                    walkInAttendanceInfoBackUp: _.cloneDeep(walkInfo)
                }
            });
        }

        //prefill data
        const prefilledData = yield select(state => state.bookingInformation.prefilledData);
        for (let k in prefilledData) {
            newBookingData[k] = prefilledData[k];
        }

        if (clinic.serviceCd === 'SHS') {
            newBookingData = {
                ...newBookingData,
                isTrace: 0,
                dfltTraceRsnTypeId: '',
                dfltTraceRsnRemark: '',
                isDfltTracePriority: 0
            };
        }

        if (clinic.serviceCd === 'CGS') {
            const cgsDefaultEncType = _encounterTypeList.find(x => x.encounterTypeCd == newBookingData.encounterTypeCd);
            if (cgsDefaultEncType) {
                newBookingData.encounterTypeId = cgsDefaultEncType.encntrTypeId;
            }
        }

        yield put({
            type: bookingActionType.UPDATE_STATE,
            updateData: {
                bookingData: newBookingData,
                bookingDataBackup: _.cloneDeep(newBookingData),
                initDataFinished: true,
                sessionList: _.cloneDeep(sessionList),
                familyMemberData: [],
                selectedFamilyMember: [],
                familyBookingResult: []
            }
        });
    });
}

function* getReminderTemplate() {
    while (true) {
        try {
            let { siteId, commMeansCd, status } = yield take(bookingActionType.GET_REMINDER_TEMPLATE);
            yield put(alsStartTrans());

            let url = `ana/apptReminders/remindTemplate?siteId=${siteId}`;
            if (commMeansCd) {
                url += `&commMeansCd${commMeansCd}`;
            }
            if (status) {
                url += `&url${status}`;
            }
            let resp = yield call(maskAxios.get, url);
            if (resp.data.respCode === 0) {
                yield put({
                    type: bookingActionType.PUT_REMINDER_TEMPLATE,
                    reminderTemplate: resp.data.data
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function reminderListApi(apptId) {
    let url = `ana/appointments/${apptId}/apptReminders`;
    return maskAxios.get(url);
    // let {data} = yield call(maskAxios.get, url);
    // if(data.respCode===0){
    //     return {data};
    // } else {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: {
    //             msgCode: '110031'
    //         }
    //     });
    // }
}

function* getReminderList() {
    // yield takeLatest(bookingActionType.APPOINTMENT_BOOK, fetchReminderHistory);
    while (true) {
        try {
            let { apptInfo, callback } = yield take(bookingActionType.LIST_REMINDER_LIST);
            yield put(alsStartTrans());

            // let url = `ana/appointments/${apptInfo.appointmentId}/apptReminders`;
            // let resp = yield call(maskAxios.get, url);
            let { data } = yield call(reminderListApi, apptInfo.appointmentId);
            if (data.respCode === 0) {
                yield put({
                    type: bookingActionType.PUT_REMINDER_LIST,
                    reminderList: data.data,
                    reminderListBk: _.cloneDeep(data.data),
                    currentSelectedApptInfo: apptInfo
                });
                callback && callback();
            }
            else {
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

function* submitApptReminder() {
    while (true) {
        try {
            let { params, pageAction, callback } = yield take(bookingActionType.SUBMIT_APPOINTMENT_REMINDER);
            yield put(alsStartTrans());

            let resp = null;
            if (pageAction === pageStatusEnum.ADD) {
                let url = `ana/appointments/${params.apptId}/apptReminders`;
                resp = yield call(maskAxios.post, url, params.reminder);
            }
            // else if(pageAction===pageStatusEnum.DELETE){
            //     let url = `ana/appointments/${params.apptId}/apptReminders/${params.apptRmndId}`;
            //     resp = yield call(maskAxios.delete, url, { data: params.reminder });
            // }
            // else if(pageAction===pageStatusEnum.SEND){
            //     let url = `ana/appointments/${params.apptId}/apptReminders/${params.apptRmndId}`;
            //     resp = yield call(maskAxios.post, url, { data: params.reminder });
            // }
            else {
                let url = `ana/appointments/${params.apptId}/apptReminders/${params.apptRmndId}`;
                resp = yield call(maskAxios.put, url, params.reminder);
            }
            if (resp.data.respCode === 0) {
                let msgCode = '110021';
                if (pageAction === pageStatusEnum.EDIT) {
                    msgCode = '110023';
                }
                //do something.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: msgCode,
                        showSnackbar: true
                    }
                });
                callback && callback();
                // yield put({
                //     type: bookingActionType.LIST_REMINDER_LIST,
                //     apptId: params.apptId
                // });
                let { data } = yield call(reminderListApi, params.apptId);
                if (data.respCode === 0) {
                    yield put({
                        type: bookingActionType.UPDATE_STATE,
                        updateData: { reminderList: data.data, reminderListBk: _.cloneDeep(data.data) }
                    });
                }
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

function* deleteApptReminder() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.DELETE_APPOINTMENT_REMINDER);
            yield put(alsStartTrans());

            let url = `ana/appointments/${params.apptId}/apptReminders/${params.apptRmndId}`;
            let resp = yield call(maskAxios.delete, url, { data: params.reminder });

            if (resp.data.respCode === 0) {
                //do something.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111228',
                        showSnackbar: true
                    }
                });
                callback && callback();
                // yield put({
                //     type: bookingActionType.LIST_REMINDER_LIST,
                //     apptId: params.apptId
                // });
                let { data } = yield call(reminderListApi, params.apptId);
                if (data.respCode === 0) {
                    yield put({
                        type: bookingActionType.UPDATE_STATE,
                        updateData: { reminderList: data.data, reminderListBk: _.cloneDeep(data.data) }
                    });
                }
                else {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110031'
                        }
                    });
                }
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

function* sendReminderInfo() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.SEND_APPOINTMENT_REMINDER);
            yield put(alsStartTrans());

            let url = `ana/appointments/${params.apptId}/apptReminders/${params.apptRmndId}`;
            let resp = yield call(maskAxios.post, url, params.reminder);

            if (resp.data.respCode === 0) {
                //do something.
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111209',
                        params: [
                            {
                                name: 'TYPE',
                                value: params.reminder.commMeansCd === Enum.CONTACT_MEAN_SMS ? 'SMS' : 'email'
                            }
                        ],
                        showSnackbar: true
                    }
                });
                callback && callback();
                let { data } = yield call(reminderListApi, params.apptId);
                if (data.respCode === 0) {
                    yield put({
                        type: bookingActionType.UPDATE_STATE,
                        updateData: { reminderList: data.data, reminderListBk: _.cloneDeep(data.data) }
                    });
                }
                else {
                    yield put({
                        type: messageType.OPEN_COMMON_MESSAGE,
                        payload: {
                            msgCode: '110031'
                        }
                    });
                }
                // yield put({
                //     type: bookingActionType.LIST_REMINDER_LIST,
                //     apptId: params.apptId
                // });
            } else if (resp.data.respCode === 106) {
                let patientLabel = CommonUtil.getPatientCall();
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        params: [
                            {
                                name: 'PATIENT_CALL',
                                value: patientLabel.toLowerCase()
                            }
                        ],
                        msgCode: '130700'
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


function* listSpecReqTypes() {
    while (true) {
        try {
            let { params } = yield take(bookingActionType.LIST_SPECREQ_TYPES);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.get, '/ana/anaSpecialRqstTypes?svcCd=' + params.serviceCd);
            if (data.respCode === 0) {
                yield put({
                    type: bookingActionType.PUT_SPECREQ_TYPES,
                    specReqTypesList: data.data
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

function* listSpecReq() {
    while (true) {
        let { params, callback } = yield take(bookingActionType.LIST_SPECREQ);
        let { data } = yield call(maskAxios.get, '/ana/appointments/' + params.appointmentId + '/anaSpecialRqsts');
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
    }
}

function* insertSpecReq() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.INSERT_SPECREQ);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/ana/appointments/' + params.apptId + '/anaSpecialRqsts', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110021',
                        showSnackbar: true
                    }
                });
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

function* updateSpecReq() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.UPDATE_SPECREQ);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.put, '/ana/appointments/' + params.apptId + '/anaSpecialRqsts/' + params.specialRqstId, params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '110023',
                        showSnackbar: true
                    }
                });
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

function* getRescheduleReasons() {
    while (true) {

        try {
            yield take(bookingActionType.GET_RESCHEDULE_REASONS);
            yield put(alsStartTrans());

            const service = yield select(state => state.login.service);
            const clinic = yield select(state => state.login.clinic);
            let { data } = yield call(maskAxios.get, '/ana/appointments/rescheduleReasons?svcCd=' + service.svcCd + '&siteId=' + clinic.siteId);
            if (data.respCode === 0) {
                yield put({
                    type: bookingActionType.UPDATE_STATE,
                    updateData: { rescheduleReasonList: data.data }
                });
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* putAnonymousAppointmentPmiLinkage(action) {
    const { data } = yield call(maskAxios.put, '/ana/anonymousAppointments/pmiLinkage', action.params);
    if (data.respCode === 0) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130301',
                params: [
                    { name: 'MESSAGE', value: 'The appointment has been successfully associated.' }
                ],
                showSnackbar: true
            }
        });
        action.callback && action.callback(data.data);
    } else if (data.respCode === 1) {
        //todo parameterException
    } else if (data.respCode === 151) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: { msgCode: '110204' }
        });
    } else if (data.respCode === 152) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: { msgCode: '110205' }
        });
    } else if (data.respCode === 153) {
        apptService.handleOperationFailed(data.respCode,data);
    } else {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110031'
            }
        });
    }
}

function* anonymousAppointmentPmiLinkage() {
    yield alsTakeLatest(bookingActionType.PUT_ANONYMOUS_APPOINTMENT_PMILINKAGE, putAnonymousAppointmentPmiLinkage);
}

function* getRoomUtilization() {
    yield alsTakeEvery(bookingActionType.GET_ROOM_UTILIZATION, function* (action) {
        let { siteId, slotDate } = action;
        let { data } = yield call(maskAxios.get, '/ana/timeslotOverview', { params: { siteId, slotDate } });
        if (data.respCode === 0) {
            yield put({ type: bookingActionType.UPDATE_STATE, updateData: { roomUtilizationData: AppointmentUtil.processRoomUtilizationData(data.data) } });
        }
    });
}

function* getBookingMaximumTimeslot() {
    yield alsTakeEvery(bookingActionType.GET_BOOKING_MAXIMUM_TIMESLOT, function* (action) {
        const { encntrTypeId, callBack } = action;
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes/' + encntrTypeId);
        if (data.respCode === 0) {
            callBack && callBack(data);
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

function* checkPatientSvcExist() {
    while (true) {
        try {
            let { params, callback } = yield take(bookingActionType.CHECKPATIENTSVCEXIST);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.get, '/ana/checkPatientSvcExist', { params: { patientKey: params.patientKey, svcCd: params.svcCd } });
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

function* listEncntrCaseRsn() {
    yield alsTakeEvery(bookingActionType.LIST_ENCNTR_CASE_RSN, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.get, 'cmn/shsEncntrCaseRsn', { params });
        if (data.respCode === 0) {
            callback && callback(data.data);
        }
    });
}

function* checkApptWithEncntrCaseStatus() {
    yield alsTakeEvery(bookingActionType.CHECK_APPOINTMENT_WITH_ENCOUNTER_CASE, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.get, 'ana/Encounter/encounterCaseChecking', { params });
        if (data.respCode === 0) {
            callback && callback(data.data);
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '115009'
                }
            });
        }
    });
}

function* logShsEncntrCase() {
    yield alsTakeEvery(bookingActionType.LOG_SHS_ENCNTR_CASE, function* (action) {
        const { params, callback } = action;
        let { data } = yield call(maskAxios.post, '/ana/Encounter/clcLogShsEncntrCase', params);
        if (data.respCode === 0) {
            callback && callback(data.data);
        } else if(data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110203'
                }
            });
        }
    });
}

function* getFamilyMemberAsync() {
    yield alsTakeEvery(bookingActionType.GET_FAMILY_MEMBER, function* () {
        const patientKey = yield select((state) => state.patient.patientInfo.patientKey);
        const result = yield call(maskAxios.get, `/patient/cgs/patient/${patientKey}/family/patients`);
        if (result.data.respCode === 0)
            yield put({
                type: bookingActionType.UPDATE_FAMILY_MEMBER,
                payload: { familyMember: result.data.data.sort((a, b) => {
                    return -(a.patientKey === patientKey);
                }) }
            });
    });
}

function* getFamilyBookingAsync() {
    yield alsTakeEvery(bookingActionType.GET_FAMILY_BOOKING, function* (action) {
        const serviceCd = yield select((state) => state.login.service.serviceCd);

        const { patient, callback } = action;

        const { appointmentId, patientKey, isShowHistory, isAttend, isDateBack, arrivalTime } = patient;

        const pk = patientKey ? patientKey : yield select((state) => state.patient.patientInfo.patientKey);

        if (serviceCd === 'CGS') {
            const result = yield call(maskAxios.get, `/ana/cgs/appointments/${appointmentId}/family/patients`);

            if (result.data.respCode === 0 && result.data.data.length > 1) {
                // Filter patient -> attend/ not attend by arrivalTime
                const sortedPatientFamily = result.data.data
                    .filter((data) => {
                        const formatArrivalTime = data.appts[0]?.arrivalTime
                            ? moment(data.appts[0].arrivalTime).format('DD-MMM-YYYY HH:mm')
                            : '';
                        return formatArrivalTime && arrivalTime ? formatArrivalTime === arrivalTime : true;
                    })
                    .sort((a, b) => {
                        return -(a.patientKey === pk);
                    });

                yield put({
                    type: isAttend
                        ? bookingActionType.UPDATE_ATTN_FAMILY_MEMBER
                        : isDateBack
                        ? bookingActionType.UPDATE_DATE_BACK_FAMILY_MEMBER
                        : bookingActionType.UPDATE_FAMILY_MEMBER,
                    payload: { familyMember: sortedPatientFamily }
                });

                // If patientKey exists (Patient List page - isRedirectByPatientList)
                if (patientKey) {
                    yield put({
                        type: bookingActionType.UPDATE_SELECTED_FAMILY_MEMBER,
                        payload: { selectedData: [patient] }
                    });
                    yield put({
                        type: bookingActionType.REDIRECT_BY_PATIENT_LIST,
                        payload: { isRedirectByPatientList: true }
                    });
                }

                if(isShowHistory)
                    yield put({
                        type: bookingActionType.UPDATE_SELECTED_FAMILY_MEMBER,
                        payload: { selectedData: result.data.data.filter(patient=>patient.patientKey !== pk ) }
                    });

                if(isAttend)
                    yield put({
                        type: bookingActionType.UPDATE_SELECTED_ATTN_FAMILY_MEMBER,
                        payload: { selectedData: result.data.data.filter(patient=>patient.patientKey !== pk ) }
                    });

                if(isDateBack)
                    yield put({
                        type: bookingActionType.UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER,
                        payload: { selectedData: result.data.data.filter(patient=>patient.patientKey !== pk ) }
                    });

                callback && callback(sortedPatientFamily.length > 1 ? true : false);

            } else {
                yield put({
                    type: isAttend
                        ? bookingActionType.UPDATE_ATTN_FAMILY_MEMBER
                        : isDateBack
                        ? bookingActionType.UPDATE_DATE_BACK_FAMILY_MEMBER
                        : bookingActionType.UPDATE_FAMILY_MEMBER,
                    payload: { familyMember: [] }
                });

                callback && callback(false);}

        } else callback && callback(false);
    });
}

function* getApptListRpt() {
    yield takeLatest(bookingActionType.GET_APPT_LIST_RPT, function* (action) {
        const { params, callback } = action;
        const { data } = yield call(maskAxios.get, '/ana/apptListRpt', { params: { ...params } });
        if (data.respCode === 0) {
            callback(data.data);
        }
    });
}

function* multipleSearchAavilTimeSlot() {
    yield alsTakeLatest(bookingActionType.MULTIPLE_SEARCH_AVAIL_TIME_SLOT, function* (action) {
        const { params, callback } = action;
        const { data } = yield call(maskAxios.post, '/ana/multipleSearchFirstAvailTimeslot', params);
        if (data.respCode === 0) {
            const appointmentListCart = yield select(state => state.bookingInformation.appointmentListCart);
            let slot = AppointmentUtil.markMultipleSlotIdx(data.data, appointmentListCart);
            if (data.data.length !== slot.length) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111247',
                        showSnackbar: true
                    }
                });
            }
            callback && callback(slot);
            yield put({
                type: bookingActionType.PUT_MULTIPLE_AVAIL_SLOT_DATA,
                slot: slot
            });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111204'
                }
            });
        } else if (data.respCode === 100) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111203'
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
    });
}

function* updateAppointmentListCart() {
    yield alsTakeLatest(bookingActionType.UPDATE_APPOINTMENT_LIST_CART, function* (action) {
        const { params, mode, callback } = action;
        let newAppointmentListCart = [];
        const getData = yield select(state => state.bookingInformation.appointmentListCart);
        if(mode === 'Add'){
            newAppointmentListCart = _.clone(getData);
            newAppointmentListCart.push(params);
        }else{
            newAppointmentListCart = params;
        }
        yield put({
            type: bookingActionType.PUT_APPOINTMENT_LIST_CART,
            appointmentListCart: newAppointmentListCart
        });
        callback && callback(newAppointmentListCart);
    });
}

export const bookingSaga = [
    appointmentBooking,
    listTimeSlotForAppointmentBook,
    listAppointmentHistory,
    getEncounterTypeListBySite,
    replaceOldAppointmnetBookingConfirm,
    stillAppointmentsBookingConfirm,
    bookingConfirm,
    bookConfirmWaiting,
    getAppointmentReport,
    getSppApptSlipReport,
    walkInAppointment,
    listRemarkCode,
    cancelAppointment,
    deleteAppointment,
    submitUpdateAppointment,
    listContatHistory,
    updateContatHistory,
    insertContatHistory,
    editAppointment,
    init_bookingData,
    getReminderTemplate,
    submitApptReminder,
    listSpecReqTypes,
    listSpecReq,
    insertSpecReq,
    updateSpecReq,
    getReminderList,
    deleteApptReminder,
    sendReminderInfo,
    getRescheduleReasons,
    checkBookingRule,
    anonymousAppointmentPmiLinkage,
    multipleBookingConfirm,
    getRoomUtilization,
    getBookingMaximumTimeslot,
    selectAppointment,
    reAppointment,
    checkPatientSvcExist,
    getSessionList,
    getPatientLatestEncntrCase,
    listEncntrCaseRsn,
    checkApptWithEncntrCaseStatus,
    logShsEncntrCase,
    getApptListRpt,
    multipleSearchAavilTimeSlot,
    sppMultipleBookConfirm,
    updateAppointmentListCart,
    getFamilyMemberAsync,
    getFamilyBookingAsync
];
