import { take, takeLatest, call, put, select } from 'redux-saga/effects';
import { maskAxios } from '../../../../services/axiosInstance';
import _ from 'lodash';
import * as bookingAnonymousActionType from '../../../actions/appointment/booking/bookingAnonymousActionType';
import * as messageType from '../../../actions/message/messageActionType';
import { anonPageStatus, UpdateMeans } from '../../../../enums/appointment/booking/bookingEnum';
import { print } from '../../../../utilities/printUtilities';

import * as apptService from '../../../../services/ana/appointmentService';
import * as anonApptService from '../../../../services/ana/anonymousApptService';

import { CommonUtil, PatientUtil, AppointmentUtil, EnctrAndRmUtil, ApiMappers, SiteParamsUtil } from '../../../../utilities';

import moment from 'moment';
import Enum from '../../../../enums/enum';
import { initBookingData, initAnonymousPersonalInfo, initRplaceAppointmentData } from '../../../../constants/appointment/bookingInformation/bookingInformationConstants';
import {alsStartTrans, alsEndTrans} from '../../../actions/als/transactionAction';
import {alsTakeLatest, alsTakeEvery} from '../../als/alsLogSaga';
import { dispatch } from '../../../util';

function serialize(url, obj) {
    let str = [];
    for (let p in obj)
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    str = str.join('&');
    return url + '?' + str;
}

function* getBookedTimeslot(){
    const bookTimeSlotData=yield select(state=>state.bookingAnonymousInformation.bookTimeSlotData);
    const bookSqueezeInTimeSlotData=yield select(state=>state.bookingAnonymousInformation.bookSqueezeInTimeSlotData);
    let bookTimeSlotList=bookSqueezeInTimeSlotData?_.cloneDeep(bookSqueezeInTimeSlotData) : _.cloneDeep(bookTimeSlotData);

    const dateStr=moment(bookTimeSlotList[0].slotDate).format(Enum.APPOINTMENT_BOOKING_DATE);
    const sTimeStr=bookTimeSlotList[0].startTime;
    const eTimeStr=bookTimeSlotList[bookTimeSlotList.length-1].endTime;
    const bookedTimeSlotStr=`${dateStr}  ${sTimeStr} - ${eTimeStr}`;
    return bookedTimeSlotStr;
}

function* getEncounterTypeListBySite() {
    yield alsTakeEvery(bookingAnonymousActionType.GET_ENCOUNTER_TYPE_LIST_BY_SITE, function* (action) {
        let { serviceCd, siteId, callback } = action;
        let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + serviceCd + '&siteId=' + siteId + '&withRooms=Y');
        if (data.respCode === 0) {
            const clinicList = yield select(state => state.common.clinicList);
            let _encounterTypeList = ApiMappers.mapEncounterTypeListNewApi(data.data, serviceCd, siteId, clinicList);
            _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, _encounterTypeList);

            const defaultEncounter = AppointmentUtil.getDefaultEncounter({
                encounterTypeList: _encounterTypeList,
                siteId: siteId
            });
            const bookingData = yield select(state => state.bookingAnonymousInformation.bookingData);
            let newBookingData = {};
            if (defaultEncounter) {
                newBookingData.encounterTypeId = defaultEncounter.encntrTypeId;
                newBookingData.encounterTypeCd = defaultEncounter.encounterTypeCd;
                newBookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(newBookingData, newBookingData.encounterTypeId, _encounterTypeList);

                if(bookingData.encntrGrpCd){
                    newBookingData.encntrGrpCd=bookingData.encntrGrpCd;
                }

                const defaultRoom = AppointmentUtil.getDefaultRoom({
                    encntrId: defaultEncounter.encntrTypeId,
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
                type: bookingAnonymousActionType.PUT_ENCOUNTER_TYPE_LIST_BY_SITE,
                encounterTypeList: _encounterTypeList,
                newBookingData
            });
            callback && callback(_encounterTypeList);
        }
    });
}

function* fetchGetEncounterTypeList(svcCd, siteId, callback) {
    let { data } = yield call(maskAxios.get, '/cmn/encounterTypes?svcCd=' + svcCd + '&siteId=' + siteId + '&withRooms=Y');
    if (data.respCode === 0) {
        const clinicList = yield select(state => state.common.clinicList);
        let _encounterTypeList = ApiMappers.mapEncounterTypeListNewApi(data.data, svcCd, siteId, clinicList);
        _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, _encounterTypeList);
        callback&&callback(_encounterTypeList);
        return _encounterTypeList;
    }
}

function* fetchappointmentBooking(action) {
    let params = { ...action.params, sessId: action.params.sessId === '*All' ? null : action.params.sessId };
    let { data } = yield call(maskAxios.post, '/ana/searchFirstAvailTimeslot', params);
    if (data.respCode === 0) {
        yield put({ type: bookingAnonymousActionType.PUT_TIMESLOT_DATA, data: data.data, params: action.params });
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
    }
}

function* appointmentBooking() {
    yield alsTakeLatest(bookingAnonymousActionType.APPOINTMENT_BOOK, fetchappointmentBooking);
}

function* fetchListTimeSlotForAppointmentBook(action) {
    // let {data} = yield call(maskAxios.post, 'ana/timeslots/avail', action.params);
    let { data } = yield call(maskAxios.get, 'ana/timeslots', { params: action.params });
    if (data.respCode === 0) {
        const bookingData = yield select(state => state.bookingAnonymousInformation.bookingData);
        const timeSlotList = AppointmentUtil.filterAllTimeSlotByQtType(data.data, bookingData.qtType || '');
        yield put({ type: bookingAnonymousActionType.PUT_LIST_TIMESLOT_DATA, timeSlotList });
    }
}

function* listTimeSlotForAppointmentBook() {
    yield alsTakeLatest(bookingAnonymousActionType.LIST_TIMESLOT, fetchListTimeSlotForAppointmentBook);
}

function* fetchLoadAppointmentBooking(action) {
    let bookingData = _.cloneDeep(initBookingData);
    if (action.passData) bookingData = _.cloneDeep(action.passData);

    //set elapsedPeriod when appointment date and time is null
    bookingData = AppointmentUtil.getDefaultElapsedPeriodBookData(bookingData);

    const clinic = yield select(state => state.login.clinic);
    //default clinic code
    if (!bookingData.clinicCd) {
        bookingData.clinicCd = clinic.clinicCd;
    }

    if (!bookingData.siteId) {
        bookingData.siteId = clinic.siteId;
    }

    const prefilledData = yield select(state => state.bookingAnonymousInformation.prefilledData);
    for (let k in prefilledData) {
        bookingData[k] = prefilledData[k];
    }

    //init encounterTypeList
    let serviceCd = yield select(state => state.login.service.serviceCd);
    // const encounterTypeList = yield select(state => state.bookingAnonymousInformation.bookingData.encounterTypeList);
    // const _encounterTypeList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(bookingData.siteId, encounterTypeList);
    const _encounterTypeList = yield call(fetchGetEncounterTypeList, clinic.serviceCd, bookingData.siteId);
    const selEncounter = _encounterTypeList.find(item => item.encntrTypeId === bookingData.encounterTypeId);
    bookingData.encounterTypeList = _.cloneDeep(_encounterTypeList);
    bookingData.encounterTypeCd = selEncounter ? selEncounter.encounterTypeCd : '';

     //get session list
     const sessionList = yield call(fetchGetSessionList, clinic.svcCd, clinic.siteId);

    //init default encounterType
    const clinicConfig = yield select(state => state.common.clinicConfig);
    let where = { serviceCd, clinicCd: clinic.clinicCd };
    const crossBookConfig = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.ENABLE_CROSS_BOOK_CLINIC, clinicConfig, where);
    const isShowRemarkTemplate = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_REMARK_TEMPLATE, clinicConfig, where);
    // const defaultEncounter = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.DEFAULT_ENCOUNTER_CD, clinicConfig, where);
    // const defaultEncounterCd = defaultEncounter.configValue;

    //encounterType and room
    const newOrUpdate = yield select(state => state.bookingAnonymousInformation.newOrUpdate);
    const { defaultEncounter, defaultRoom } = AppointmentUtil.getDefaultEncounterAndRoom({
            encounterTypeList: _encounterTypeList,
            encntrId: bookingData.encounterTypeId,
            roomId: bookingData.rmId
        });
    if (newOrUpdate !== UpdateMeans.UPDATE) {

        if (defaultEncounter) {
            bookingData.encounterTypeId = defaultEncounter.encntrTypeId;
            bookingData.encounterTypeCd = defaultEncounter.encounterTypeCd;
        }

        if (defaultRoom) {
            bookingData.rmId = defaultRoom.rmId;
            bookingData.rmCd = defaultRoom.rmCd;
            bookingData.subEncounterTypeCd = defaultRoom.rmCd;
        }
    } else {
        //Justin 20200921: encounter type inactive or expire
        const encounterType = _encounterTypeList && _encounterTypeList.find(x => x.encntrTypeId === bookingData.encounterTypeId);
        if (!EnctrAndRmUtil.isActiveEnctrTypeId(bookingData.encounterTypeId, _encounterTypeList)) {
            bookingData.encounterTypeCd = '';
            bookingData.encounterTypeId = '';
            bookingData.subEncounterTypeCd = '';
            bookingData.rmId = '';
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
            if (!EnctrAndRmUtil.isActiveRoomId(bookingData.rmId, mappingRooms)) {
                bookingData.subEncounterTypeCd = '';
                bookingData.rmId = '';
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
        if (!CommonUtil.isActiveSessionId(bookingData.sessId, sessionList)) {
            bookingData.sessId = '';
            dispatch({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111241',
                    showSnackbar: true
                }
            });
        }
    }

    bookingData.appointmentDate = bookingData.appointmentDate ? bookingData.appointmentDate : null;
    bookingData.appointmentTime = bookingData.appointmentTime ? moment(bookingData.appointmentTime, 'HH:mm') : null;
    bookingData.qtType = bookingData.qtType || Enum.APPOINTMENT_TYPE_SUFFIX[0].code;
    //TODO: will be remove, replace qtType
    bookingData.appointmentTypeCd = bookingData.qtType;

    bookingData.elapsedPeriod = bookingData.elapsedPeriod || '';
    bookingData.elapsedPeriodUnit = bookingData.elapsedPeriodUnit || '';
    bookingData.bookingUnit = bookingData.bookingUnit || 1;

    const encntrGrpList = yield select(state => state.caseNo.encntrGrpList);
    if (encntrGrpList && encntrGrpList.length === 1) {
        bookingData.encntrGrpCd = encntrGrpList[0].encntrGrpCd;
    } else if (encntrGrpList && encntrGrpList.length > 1) {
        if (defaultEncounter) {
            bookingData = AppointmentUtil.getEncntrGrpByEncntrId(defaultEncounter.encntrTypeId, _.cloneDeep(bookingData));
        }
    }

    if (bookingData && bookingData.encounterTypeId) {
        bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId);
    }

    yield put({
        type: bookingAnonymousActionType.UPDATE_STATE,
        updateData: {
            bookingData: _.cloneDeep(bookingData),
            bookingDataBackup: _.cloneDeep(bookingData),
            // defaultEncounterCd: defaultEncounterCd,
            isEnableCrossBookClinic: crossBookConfig.configValue === 'Y',
            isShowRemarkTemplate: isShowRemarkTemplate && isShowRemarkTemplate.configValue ? _.toString(isShowRemarkTemplate.configValue) !== '0' : true,
            sessionList
        }
    });
}

function* initAnonBookingData() {
    yield alsTakeLatest(bookingAnonymousActionType.INIT_ANON_BOOKING_DATA, fetchLoadAppointmentBooking);
}

function* fetchStillAppointmentsBookingConfirm(action) {
    let { data } = yield call(maskAxios.post, '/ana/appointments/stillAppointments', action.params.params[0], { retry: 0 });

    if (data.respCode === 0) {
            yield put({ type: bookingAnonymousActionType.PUT_BOOK_SUCCESS, data: data.data });
            let appointmentDateStr = yield call(getBookedTimeslot);

            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111210',
                    params: [{ name: 'DETAIL', value: appointmentDateStr }]
                }
            });
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
    // }else if (data.respCode === 109) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
    // }else if (data.respCode === 110) {
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
    // }else if (data.respCode === 146) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });

    // }else if (data.respCode === 148) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: {
    //             msgCode: '110139'
    //         }
    //     });
    // }else if (data.respCode === 149) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: {
    //             msgCode: '110140'
    //         }
    //     });
    // }else if(data.respCode === 150) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: { msgCode: '110153' }
    //     });
    // }else if (data.respCode === 151) {
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
    else if ([3,100,101,102,103,104,105,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
        apptService.handleOperationFailed(data.respCode,data);
    }
    if (data.respCode !== 0) {
        yield put({ type: bookingAnonymousActionType.UPDATE_STATE, updateData: { pageStatus: anonPageStatus.SELECTED } });
    }
}

function* stillAppointmentsBookingConfirm() {
    yield takeLatest(bookingAnonymousActionType.STILL_APPOINTMENTS_BOOK_CONFIRM, fetchStillAppointmentsBookingConfirm);
}

function* fetchReplaceOldAppointmnetBookingConfirm(action) {
    let { data } = yield call(maskAxios.post, '/ana/appointments/replaceableOldAppointments', action.params, { retry: 0 });

    if (data.respCode === 0) {
        let appointmentDateStr = '';
        yield put({ type: bookingAnonymousActionType.PUT_BOOK_SUCCESS, data: data.data });
        appointmentDateStr=yield call(getBookedTimeslot);
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111210',
                params: [{ name: 'DETAIL', value: appointmentDateStr }]
            }
        });
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
    // }else if (data.respCode === 109) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
    // }else if (data.respCode === 110) {
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
    // }else if (data.respCode === 146) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
    // }else if (data.respCode === 148) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: {
    //             msgCode: '110139'
    //         }
    //     });
    // }else if (data.respCode === 149) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: {
    //             msgCode: '110140'
    //         }
    //     });
    // }else if(data.respCode === 150) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: { msgCode: '110153' }
    //     });
    // }else if (data.respCode === 151) {
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
    else if ([3,100,101,102,103,104,105,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
        apptService.handleOperationFailed(data.respCode,data);
    }
    if (data.respCode !== 0) {
        yield put({ type: bookingAnonymousActionType.UPDATE_STATE, updateData: { pageStatus: anonPageStatus.SELECTED } });
    }
}

function* replaceOldAppointmnetBookingConfirm() {
    yield alsTakeLatest(bookingAnonymousActionType.REPLACE_OLD_APPOINTMNET_BOOK_CONFIRM, fetchReplaceOldAppointmnetBookingConfirm);
}

function* fetchBookingConfirm(action) {
    let requestUrl = '/ana/anonymousAppointments';
    let isAnonymous = true;
    let params = action.params;

    if (action.params.confirmAppointmentDto.patientKey) {
        requestUrl = '/ana/appointments';
        isAnonymous = false;
        params = action.params.confirmAppointmentDto;
    }

    let { data } = yield call(maskAxios.post, requestUrl, params, { retry: 0 });
    if (data.respCode === 0) {
        let appointmentDateStr = '';
        if (isAnonymous) {
            let sites = yield select(state => state.common.clinicList);
            let anaRemarkTypes = yield select(state => state.bookingAnonymousInformation.remarkCodeList);
            //let encounterTypes = yield select(state => state.common.encounterTypes);
            let encounterTypes=yield select(state=>state.bookingAnonymousInformation.bookingData.encounterTypeList);
            let site = sites.find(s => s.siteId === action.params.confirmAppointmentDto.siteId);
            let getAppointmentResponse = yield call(apptService.getAppointmentById, data.data.appointmentId, site.siteId, site.svcCd);
            if (getAppointmentResponse && getAppointmentResponse.data.respCode === 0) {
                let apptData = apptService.appointmentToReduxState(getAppointmentResponse.data.data,
                    sites,
                    anaRemarkTypes,
                    encounterTypes);
                yield put({ type: bookingAnonymousActionType.PUT_BOOK_SUCCESS, data: apptData });
                appointmentDateStr=yield call(getBookedTimeslot);
            }
        } else {
            yield put({ type: bookingAnonymousActionType.PUT_BOOK_SUCCESS, data: data.data });
            appointmentDateStr=yield call(getBookedTimeslot);
        }
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '111210',
                params: [{ name: 'DETAIL', value: appointmentDateStr }]
            }
        });
        action.callback && action.callback(data.data);
    }
    else if (data.respCode === 104) {
        yield put({
            type: bookingAnonymousActionType.CHECK_BOOKING_RULE,
            params: action.checkBookingRuleParams[0]
        });
    }
    //  else if (data.respCode === 3) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110032' } });
    // } else if (data.respCode === 100) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
    // } else if (data.respCode === 103) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
    // } else if (data.respCode === 104) {
    //     yield put({
    //         type: bookingAnonymousActionType.CHECK_BOOKING_RULE,
    //         params: action.checkBookingRuleParams[0]
    //     });
    // } else if (data.respCode === 105) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111220' } });
    // } else if (data.respCode === 107) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
    // } else if (data.respCode === 108) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
    // }else if (data.respCode === 109) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
    // }else if (data.respCode === 110) {
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
    // }else if (data.respCode === 146) {
    //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110155' } });
    // }else if (data.respCode === 148) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: {
    //             msgCode: '110139'
    //         }
    //     });
    // }else if (data.respCode === 149) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: {
    //             msgCode: '110140'
    //         }
    //     });
    // }else if(data.respCode === 150) {
    //     yield put({
    //         type: messageType.OPEN_COMMON_MESSAGE,
    //         payload: { msgCode: '110153' }
    //     });
    // }else if (data.respCode === 151) {
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
    else if (data.respCode === 106) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: { msgCode: '115571' }
        });
    }
    else if ([3,100,103,105,107,108,109,110,146,148,149,150,151,152,153].indexOf(data.respCode) > -1) {
        apptService.handleOperationFailed(data.respCode,data);
    }
    if (data.respCode !== 0 && data.respCode !== 104) {
        yield put({ type: bookingAnonymousActionType.UPDATE_STATE, updateData: { pageStatus: anonPageStatus.SELECTED } });
    }
}

function* bookingConfirm() {
    yield alsTakeLatest(bookingAnonymousActionType.BOOK_CONFIRM, fetchBookingConfirm);
}

function* checkBookingRule() {
    yield alsTakeEvery(bookingAnonymousActionType.CHECK_BOOKING_RULE, function* (action) {
        let { params, callback } = action;
        let url = serialize('/ana/appointments/replaceRule', params);
        let { data } = yield call(maskAxios.get, url);
        if (data.respCode === 0) {
            const isSameDayAppointment = data.data.isSameDayAppointment;
            const isReplaceAppointment = data.data.isReplaceAppointment;
            const replaceAppointmentInfo = {
                bookingData: data.data.appointmentInfoBaseVo,
                cimsOneReplaceList: data.data.cimsOneReplaceAppointmentInfoBaseVo,
                // Update the isSameDayAppointment to isReplaceAppointment
                openReplaceAppointmentDialog: data.data.isReplaceAppointment,
                openSameDayAppointmentDialog: data.data.isSameDayAppointment,
                minInterval: data.data.minInterval ? data.data.minInterval : '',
                minIntervalUnit: data.data.minIntervalUnit ? data.data.minIntervalUnit : ''
            };
            yield put({
                type: bookingAnonymousActionType.OPEN_REPLACE_APPOINTMENT,
                replaceAppointmentInfo: replaceAppointmentInfo
            });
            callback && callback(!isSameDayAppointment && !isReplaceAppointment);
        }
    });
}

function* bookConfirmWaiting() {
    yield alsTakeLatest(bookingAnonymousActionType.BOOK_CONFIRM_WAITING, function* (action) {
        let { data } = yield call(maskAxios.post, '/ana/waitingList/appointments', action.params, { retry: 0 });
        if (data.respCode === 0) {
            yield put({ type: bookingAnonymousActionType.PUT_BOOK_SUCCESS, data: data.data });
            const appointmentDateStr=yield call(getBookedTimeslot);
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111210',
                    params: [{ name: 'DETAIL', value: appointmentDateStr }],
                    btnActions: {
                        btn1Click: action.callback
                    }
                }
            });
        } else if (data.respCode === 100) {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
        } else if (data.respCode === 101) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111217'
                }
            });
        } else if (data.respCode === 102) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111203'
                }
            });
        } else if (data.respCode === 103) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111203'
                }
            });
        } else if (data.respCode === 3) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '110032'
                }
            });
        } else if (data.respCode === 104) {
            yield put({
                type: bookingAnonymousActionType.CHECK_BOOKING_RULE,
                params: action.checkBookingRuleParams && action.checkBookingRuleParams[0]
            });
        } else if(data.respCode === 105) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: { msgCode: '111113' }
            });
        } else if(data.respCode === 106) {
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: { msgCode: '111114' }
            });
        } else if (data.respCode === 107) {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
        }else if (data.respCode === 108) {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
        }else if (data.respCode === 109) {
            yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
        }else if(data.respCode === 110){
            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '111242',
                    params: [
                        { name: 'HEADER', value: 'Book Confirm' },
                        { name: 'MODULE_NAME', value: 'appointment booking' }
                    ]
                }
            });
        }else if(data.respCode === 153){
            apptService.handleOperationFailed(data.respCode,data);
        }
    });
}


function* getAppointmentReport() {
    while (true) {
        try{
            let { params } = yield take(bookingAnonymousActionType.GET_APPOINTMENT_REPORT);
            yield put(alsStartTrans());

            let url = params.reportType === 'Single' ? '/appointment/reportSingleSlip' : '/appointment/reportMultipleSlip';
            let { data } = yield call(maskAxios.post, url, params.reportParam);
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
        }finally{
            yield put(alsEndTrans());
        }
    }

}

function* updateAnonymousAppointment() {
    while (true) {
        try{
            let { params, callback } = yield take(bookingAnonymousActionType.UPDATE_ANONYMOUS_APPOINTMENT);

            yield put(alsStartTrans());
            // let {data} = yield call(maskAxios.post, '/appointment/updateAnonymousAppointment', params);
            let resp = yield call(anonApptService.updateAnonymousAppt, params);
            if (resp && resp.data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111212',
                        btnActions: {
                            btn1Click: callback
                        }
                    }
                });
            }
        }finally{
            yield put(alsEndTrans());
        }
    }
}

//will be removed.
function* cancelAndConfirmAnonymousAppointment() {
    while (true) {
        try{
            let { params, callback } = yield take(bookingAnonymousActionType.CANCEL_CONFIRM_ANONYMOUS_APPOINTMENT);
            yield put(alsStartTrans());

            let { data } = yield call(maskAxios.post, '/appointment/cancelAndConfirmAnonymousAppointment', params);
            if (data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111210',
                        params: [{
                            name: 'DETAIL',
                            value: params.appointmentDto.appointmentDateVo + ' ' + params.appointmentDto.appointmentTime
                        }],
                        btnActions: {
                            btn1Click: callback
                        }
                    }
                });
            }

        }finally{
            yield put(alsEndTrans());
        }
    }
}

function* fetchSeachPatientList(action) {
    // let { data } = yield call(maskAxios.post, '/patient/searchPatient', action.params);
    let { params,callback } = action;
    const siteParams = yield select(state => state.common.siteParams);
    const svcCd = yield select(state => state.login.service.svcCd);
    const siteId = yield select(state => state.login.clinic.siteId);
    const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, svcCd, siteId);
    let url = '';
    if(isNewPmiSearchResultDialog) {
        url = '/patient/searchPmi?';
    } else {
        url = '/patient/patients?';
    }
    for (let p in params) {
        url += `${p}=${encodeURIComponent(params[p])}&`;
    }
    url = url.substring(0, url.length - 1);
    // let url = `/patient/patients?searchString=${action.params.searchString}`;
    let { data } = yield call(maskAxios.get, url);

    if (data.respCode === 0) {
        if (data.data.total > 0) {
            // const patientResult = PatientUtil.getPatientSearchResult(data.data && data.data.patientDtos, action.countryList);
            // if (patientResult[0].deadInd !== '1') {
            yield put({ type: bookingAnonymousActionType.PUT_SEARCH_PATIENT_LIST, data: data.data, countryList: action.countryList });
            // } else {
            //     yield put({
            //         type: messageType.OPEN_COMMON_MESSAGE,
            //         payload: {
            //             msgCode: '115571',
            //             variant: 'error'
            //         }
            //     });
            // }
            yield put({
                type: bookingAnonymousActionType.UPDATE_FIELD,
                fields: { supervisorsApprovalDialogInfo: { staffId: '', open: false, searchString: '' } }
            });
        } else {
            const patSearchTypeList = yield select(state => state.common.patSearchTypeList);
            // const patientSearchParam = yield select(state => state.waitingList.patientSearchParam);
            const isDocType = PatientUtil.searchTypeIsDocType(patSearchTypeList, params.docType);
            let fields = { waitingPriDocTypeCd: 'ID', waitingPriDocNo: '' };
            if (isDocType) {
                fields.waitingPriDocTypeCd = params.docType;
                fields.waitingPriDocNo = params.searchString;
            }
            yield put({
                type: bookingAnonymousActionType.UPDATE_FIELD,
                fields: fields
            });

            yield put({
                type: messageType.OPEN_COMMON_MESSAGE,
                payload: {
                    msgCode: '115550',
                    showSnackbar: true
                }
            });

            yield put({
                type: bookingAnonymousActionType.PUT_SEARCH_PATIENT_LIST,
                data: data.data,
                countryList: action.countryList
            });
            if(data.data.total===0){
                callback&&callback();
            }
        }
    } else if(data.respCode === 2){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130702'
            }
        });
    } else if (data.respCode === 101) {
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '110148',
                showSnackbar: true
            }
        });
    } else if(data.respCode === 102){
        yield put({
            type: messageType.OPEN_COMMON_MESSAGE,
            payload: {
                msgCode: '130703'
            }
        });
    } else {
        yield put({
            type: bookingAnonymousActionType.PUT_SEARCH_PATIENT_LIST,
            data: null,
            countryList: action.countryList
        });
    }
}

function* searchPatientList() {
    yield alsTakeLatest(bookingAnonymousActionType.SEARCH_PATIENT_LIST, fetchSeachPatientList);
}

function* reAnonymousAppointment() {
    while (true) {
        try{
            let { params, callback } = yield take(bookingAnonymousActionType.RE_ANONYMOUS_APPOINTMNET);
            yield put(alsStartTrans());
            let resp = yield call(anonApptService.reAnonymousAppt, params);

            if (resp && resp.data.respCode === 0) {
                // const appointmentDateStr = moment(resp.data.data.apptDateTime).format('DD-MMM-YYYY HH:mm');
                const appointmentDateStr=yield call(getBookedTimeslot);
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111210',
                        params: [{
                            name: 'DETAIL',
                            value: appointmentDateStr
                        }],
                        btnActions: {
                            btn1Click: callback
                        }
                    }
                });
            }
            //  else if (resp && resp.data.respCode === 100) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
            // }  else if (resp && resp.data.respCode === 103) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111203' } });
            // } else if (resp && resp.data.respCode === 107) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '110906' } });
            // } else if (resp && resp.data.respCode === 108) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111238' } });
            // }else if (resp && resp.data.respCode === 109) {
            //     yield put({ type: messageType.OPEN_COMMON_MESSAGE, payload: { msgCode: '111239' } });
            // }else if (resp && resp.data.respCode === 110) {
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
            // }else if (resp && resp.data.respCode === 153) {
            //     apptService.handleOperationFailed(resp.data.respCode,resp.data);
            // }
            else if ([100,103,107,108,109,110,146,148,149,150,151,152,153].indexOf(resp.data.respCode) > -1) {
                apptService.handleOperationFailed(resp.data.respCode,resp.data);
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* bookSuccessCallBack() {
    yield takeLatest(bookingAnonymousActionType.PUT_BOOK_SUCCESS, function*() {
        yield put({ type: bookingAnonymousActionType.INIT_ANON_BOOKING_DATA });
        const { svcCd, siteId }= yield select(state => state.login.clinic);
        const clinicConfig = yield select(state => state.common.clinicConfig);
        let target = CommonUtil.getHighestPrioritySiteParams(
            Enum.CLINIC_CONFIGNAME.PAT_SEARCH_TYPE_DEFAULT,
            clinicConfig,
            { siteId, serviceCd: svcCd }
        );
        let patSearchParam = { searchType: target.paramValue ? target.paramValue : Enum.DOC_TYPE.HKID_ID, searchValue: '' };
        yield put({
            type: bookingAnonymousActionType.UPDATE_STATE,
            updateData: {
                anonPatientInfo: null,
                anonyomousBookingActiveInfo: _.cloneDeep(initAnonymousPersonalInfo),
                anonymousPersonalInfoBackUp: _.cloneDeep(initAnonymousPersonalInfo),
                currentAnonyomousBookingActiveInfo: _.cloneDeep(initAnonymousPersonalInfo),
                pageStatus: anonPageStatus.VIEW,
                waitingList: null,
                bookWithNewCase: false,
                prefilledData: null,
                replaceAppointmentData: _.cloneDeep(initRplaceAppointmentData),
                patientSearchParam: patSearchParam,
                anonyomous: [],
                newOrUpdate:UpdateMeans.BOOKNEW
            }
        });
    });
}

function* deleteAnonymousAppointment() {
    while(true) {
        try {
            const { params, callback } = yield take(bookingAnonymousActionType.DELETE_ANONYMOUS_APPOINTMENT);
            yield put(alsStartTrans());
            let { data } = yield call(maskAxios.delete, '/ana/anonymousAppointments', { data: params });
            if(data.respCode === 0) {
                yield put({
                    type: messageType.OPEN_COMMON_MESSAGE,
                    payload: {
                        msgCode: '111213',
                        showSnackbar: true
                    }
                });
                callback && callback();
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
            }
        } finally {
            yield put(alsEndTrans());
        }
    }
}

function* fetchGetSessionList(svcCd, siteId) {
    let { data } = yield call(maskAxios.get, '/cmn/services/' + svcCd + '/sessions');
    if (data.respCode === 0) {
        return (data.data || []).filter(x => x.siteId === siteId && CommonUtil.isActiveSession(x));
    }
}

function* getSessionList() {
    yield alsTakeEvery(bookingAnonymousActionType.GET_ANONYMOUS_SESSIONSLIST, function* (action) {
        const { siteId } = action;
        const service = yield select(state => state.login.service);
        if (service && service.svcCd) {
            const sessionList = yield call(fetchGetSessionList, service.svcCd, siteId);
            yield put({
                type: bookingAnonymousActionType.UPDATE_STATE,
                updateData: { sessionList: sessionList }
            });
        }
    });
}

export const bookingAnonymousSaga = [
    appointmentBooking,
    listTimeSlotForAppointmentBook,
    initAnonBookingData,
    replaceOldAppointmnetBookingConfirm,
    stillAppointmentsBookingConfirm,
    bookingConfirm,
    bookConfirmWaiting,
    getAppointmentReport,
    updateAnonymousAppointment,
    cancelAndConfirmAnonymousAppointment,
    checkBookingRule,
    searchPatientList,
    reAnonymousAppointment,
    bookSuccessCallBack,
    deleteAnonymousAppointment,
    getEncounterTypeListBySite,
    getSessionList
];
