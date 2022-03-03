import * as BookingAnonymousActionType from '../../../actions/appointment/booking/bookingAnonymousActionType';
import _ from 'lodash';
import * as appointmentUtilities from '../../../../utilities/appointmentUtilities';
import {
    initBookingData,
    initRplaceAppointmentData,
    initAnonymousPersonalInfo
} from '../../../../constants/appointment/bookingInformation/bookingInformationConstants';
import { anonPageStatus,UpdateMeans } from '../../../../enums/appointment/booking/bookingEnum';
import * as patientUtilities from '../../../../utilities/patientUtilities';
import moment from 'moment';

const initState = {
    timeSlotList: {},
    pageStatus: anonPageStatus.VIEW,
    bookingData: _.cloneDeep(initBookingData),
    bookingDataBackup: _.cloneDeep(initBookingData),
    bookTimeSlotData: null,
    bookSqueezeInTimeSlotData: null,
    remarkCodeList: [],
    isEnableCrossBookClinic: false,
    anonPatientInfo: null,
    anonyomousBookingActiveInfo: _.cloneDeep(initAnonymousPersonalInfo),
    anonymousPersonalInfoBackUp: _.cloneDeep(initAnonymousPersonalInfo),
    currentAnonyomousBookingActiveInfo: _.cloneDeep(initAnonymousPersonalInfo),
    waitingList: null,
    prefilledData: null,
    codeList: null,
    patientList: [],
    replaceAppointmentData: _.cloneDeep(initRplaceAppointmentData),
    patientSearchParam: {
        searchType: 'ID',
        searchValue: ''
    },
    anonyomous: [],
    newOrUpdate:UpdateMeans.BOOKNEW,
    bookWithNewCase: false,
    closeTabFunc: null,
    supervisorsApprovalDialogInfo:{
        staffId: '',
        open: false
    },
    sessionList: null,
    isShowRemarkTemplate: true,
    redirectParam: null
};

export default (state = _.cloneDeep(initState), action = {}) => {
    switch (action.type) {
        case BookingAnonymousActionType.RESET_INFO_ALL: {
            // return {...initState};
            return _.cloneDeep(initState);
        }
        case BookingAnonymousActionType.PUT_GET_CODE_LIST: {
            return {...state, codeList: action.codeList};
        }
        case BookingAnonymousActionType.RESET_SQUEEZE: {
            let bookingData = { ...state.bookingData };
            bookingData.isSqueeze = 0;
            bookingData.isUrgSqueeze = 0;
            return {
                ...state,
                bookingData: bookingData
            };
        }
        case BookingAnonymousActionType.PUT_URG_SQUEEZE: {
            let bookingData = { ...state.bookingData };
            bookingData.isSqueeze = 1;
            bookingData.isUrgSqueeze = 1;
            return {
                ...state,
                bookingData: bookingData
            };
        }
        case BookingAnonymousActionType.PUT_SQUEEZE: {
            let bookingData = { ...state.bookingData };
            bookingData.isSqueeze = 1;
            bookingData.isUrgSqueeze = 0;
            return {
                ...state,
                bookingData: bookingData
            };
        }
        case BookingAnonymousActionType.PUT_LIST_TIMESLOT_DATA: {
            if (action.timeSlotList && action.timeSlotList.slotForBookingDtos) {
                let {slotForBookingDtos} = action.timeSlotList;
                for (let i = 0; i < slotForBookingDtos.length; i++) {
                    slotForBookingDtos[i].datetime = `${ slotForBookingDtos[i].slotDate } ${ slotForBookingDtos[i].startTime }`;
                }
            }
            return {
                ...state,
                timeSlotList: action.timeSlotList,
                pageStatus: anonPageStatus.SEARCHING
            };
        }
        case BookingAnonymousActionType.PUT_TIMESLOT_DATA: {
            let bookTimeSlotData = action.data.normal;
            let newOrUpdate=state.newOrUpdate;
            if(bookTimeSlotData && bookTimeSlotData.length > 0){
                for (let i = 0; i < bookTimeSlotData.length; i++) {
                    bookTimeSlotData[i].remarkId = state.bookingData.remarkId;
                    bookTimeSlotData[i].memo = state.bookingData.memo;
                    bookTimeSlotData[i].qtType = state.bookingData.qtType;
                }
            }

            let bookSqueezeInTimeSlotData;
            if (action.data.squeezeIn && action.params.apptStartTime !== '00:00' && action.data.squeezeIn[0].startTime === action.params.apptStartTime) {
                bookSqueezeInTimeSlotData = action.data.squeezeIn;
            }
            return {
                ...state,
                bookTimeSlotData: bookTimeSlotData,
                bookSqueezeInTimeSlotData: bookSqueezeInTimeSlotData,
                pageStatus: bookSqueezeInTimeSlotData?anonPageStatus.SQUEEZE:anonPageStatus.SELECTED,
                newOrUpdate
            };
        }
        case BookingAnonymousActionType.UPDATE_STATE: {
            let lastAction = {...state};
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            if (action.updateData.anonPatientInfo) {
                lastAction.anonPatientInfo = {...action.updateData.anonPatientInfo};
            }

            if (action.updateData.currentAnonyomousBookingActiveInfo) {
                lastAction.currentAnonyomousBookingActiveInfo = {...action.updateData.currentAnonyomousBookingActiveInfo};
            }

            return lastAction;
        }
        case BookingAnonymousActionType.PUT_LIST_REMARK_CODE: {
            let {remarkCodeList} = action;
            return {
                ...state,
                remarkCodeList: remarkCodeList
            };
        }
        case BookingAnonymousActionType.OPEN_REPLACE_APPOINTMENT: {
            let {replaceAppointmentInfo} = action;
            return {
                ...state,
                replaceAppointmentData: replaceAppointmentInfo
            };
        }
        case BookingAnonymousActionType.RESET_REPLACE_APPOINTMENT: {
            return {
                ...state,
                replaceAppointmentData: _.cloneDeep(initRplaceAppointmentData)
            };
        }
        case BookingAnonymousActionType.PUT_SEARCH_PATIENT_LIST: {
            const patientResult = patientUtilities.getPatientSearchResult(action.data && action.data.patientDtos, action.countryList);
            let _waiting = _.cloneDeep(state.anonyomous);

            /*            const sortPhoneNo = patientResult[0].phoneList,
                            customSortPhoneTypeCd = ['MSMS', 'M', 'H', 'O', 'F', 'T'],
                            customLookup = customSortPhoneTypeCd.reduce((accumulator, currentValue, currentIndex, array) => {
                                accumulator[currentValue] = ('000' + currentIndex).slice(-4);
                                return accumulator;
                            }, {}),
                            customSortPhoneTypeCdFn = (a, b) => {
                                return (customLookup[a.phoneTypeCd] || a.phoneTypeCd).localeCompare(customLookup[b.phoneTypeCd] || b.phoneTypeCd);
                            },
                            sortedPhoneList = sortPhoneNo.sort(customSortPhoneTypeCdFn);*/

            if (patientResult.length > 1) {
                return {
                    ...state,
                    patientList: patientResult
                };
            } else if (patientResult.length === 1) {
                _waiting = {
                    ..._waiting,
                    patientKey: patientResult[0].patientKey
                };

                let mobile = patientResult[0].phoneList ? patientResult[0].phoneList : null;
                if (mobile) {
                    mobile = mobile.find(item => item.smsPhoneInd == 1);
                    if (!mobile && patientResult[0].phoneList) {
                        mobile = patientResult[0].phoneList.sort((a, b) => moment(a.ceateDtm) - moment(b.ceateDtm));
                        mobile = mobile[0];
                    }
                }

                let personalInfo = {
                    docTypeCd: patientResult[0].docTypeCd,
                    docNo: patientResult[0].hkidOrDocno,
                    surname: patientResult[0].engSurname,
                    givenName: patientResult[0].engGivename,
                    // countryCd: FieldConstant.COUNTRY_CODE_DEFAULT_VALUE,
                    mobile: {
                        smsPhoneInd: mobile ? mobile.smsPhoneInd : null,
                        phoneTypeCd: mobile ? mobile.phoneTypeCd : null,
                        countryCd: mobile ? mobile.countryCd : null,
                        areaCd: mobile ? mobile.areaCd : null,
                        dialingCd: mobile ? mobile.dialingCd : null,
                        phoneNo: mobile ? mobile.phoneNo : null
                    },
                    isHKIDValid: true
                    // patientKey:patientResult[0].patientKey
                };

                return {
                    ...state,
                    patientList: patientResult,
                    anonyomousBookingActiveInfo: _.cloneDeep(personalInfo),
                    anonymousPersonalInfoBackUp: _.cloneDeep(personalInfo),
                    anonyomous: _waiting,
                    newOrUpdate:UpdateMeans.BOOKNEW
                    // waitingPatDetail
                };
            } else {

                return {
                    ...state,
                    patientList: patientResult,
                    anonyomousBookingActiveInfo: _.cloneDeep(initAnonymousPersonalInfo),
                    anonymousPersonalInfoBackUp: _.cloneDeep(initAnonymousPersonalInfo),
                    anonyomous: []
                    // waitingPatDetail
                };
            }
        }
        case BookingAnonymousActionType.UPDATE_FIELD: {
            return {
                ...state,
                ...action.fields
            };
        }
        case BookingAnonymousActionType.PUT_ENCOUNTER_TYPE_LIST_BY_SITE : {
            let bookingData = { ...state.bookingData };
            let { encounterTypeList, newBookingData } = action;
            bookingData['encounterTypeList'] = encounterTypeList;
            bookingData = {
                ...bookingData,
                ...newBookingData
            };
            return {
                ...state,
                bookingData: bookingData
            };
        }
        default: {
            return state;
        }
    }
};
