import * as bookingActionType from '../../../actions/appointment/booking/bookingActionType';
import {
    initBookingData,
    initRplaceAppointmentData,
    initMultiReplaceApptData,
    initRescheduleApptData,
    initWalkInAttendanceData
} from '../../../../constants/appointment/bookingInformation/bookingInformationConstants';
import _ from 'lodash';
import moment from 'moment';
import { PageStatus as pageStatusEnum, BookMeans, PAGE_DIALOG_STATUS } from '../../../../enums/appointment/booking/bookingEnum';
import {ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC} from '../../../../enums/enum';
import * as commonUtilities from '../../../../utilities/commonUtilities';

const svc = commonUtilities.getCurrentLoginSvc();

const initState = {
    appointmentList: [],
    timeSlotList: {},
    bookingData: _.cloneDeep(initBookingData),
    bookingDataBackup: _.cloneDeep(initBookingData),
    bookTimeSlotData: null,
    bookSqueezeInTimeSlotData: null,
    walkInAttendanceInfo: _.cloneDeep(initWalkInAttendanceData),
    walkInAttendanceInfoBackUp: _.cloneDeep(initWalkInAttendanceData),
    remarkCodeList: [],
    currentSelectedApptInfo: null,
    pageStatus: pageStatusEnum.VIEW,
    pageDialogStatus: PAGE_DIALOG_STATUS.NONE,
    confirmData: [],
    defaultCaseTypeCd: 'N',
    isEnableCrossBookClinic: false,
    appointmentMode: ACCEPT_DEFAULT_MULTIPLE_APPOINTMENT_SVC.indexOf(svc) > -1 ? BookMeans.MULTIPLE : BookMeans.SINGLE,
    futureApptId: null,
    futureAppt: null,
    bookConfirmSelected: -1, //bookConfirm dialog selected timeSlot
    waitingList: null,
    contactList: [],
    contactHistoryInfo: {
        open: false,
        callerName: '',
        NotificationDate: moment(),
        NotificationTime: moment(),
        tel: '',
        email: '',
        fax: '',
        note: '',
        contactType: 'Tel',
        rowData: {},
        currentSelectedContactInfo: null,
        currentSelectedContact: null,
        currentSingleSelectedContactInfo: null,
        appointmentDate: null
    },
    specialRequestInfo: {
        open: false,
        type: '',
        notes: '',
        specialRqstId: 0,
        version: null,
        appointmentId: 0,
        isInsert: false,
        appointmentDate: null
    },
    //appointment reminder
    openApptReminder: false,
    reminderTabVal: 0,
    reminderTemplate: [],
    reminderList: [],
    apptReminderInfo: {
        reminderTabVal: 0,
        reminderTemplate: [],
        reminderList: [],
        reminderListBk: [],
        reminderType: '',
        //openApptReminder:false,
        rowData: {}
    },
    //special request tempFlag
    specReqTypesList: [],
    reminderType: '',
    rescheduleReasonList: [],
    replaceAppointmentData: _.cloneDeep(initRplaceAppointmentData),
    multipleReplaceApptData: _.cloneDeep(initMultiReplaceApptData),
    rescheduleApptData: _.cloneDeep(initRescheduleApptData),
    openReplaceAppointmentDialog: false,
    openSameDayAppointmentDialog: false,
    linkPmiData: {
        anonymousPatientKey: null,
        appointmentId: [],
        patientKey: null
    },
    roomUtilizationData: null,
    allServiceChecked: false,
    bookWithNewCase: false,
    doCloseCallbackFunc: null,
    checkPatientSvcExist: true,
    initDataFinished: false,
    backdateWalkInDay: 0,
    sessionList: null,
    isShowRemarkTemplate: true,
    appointmentListCart:[],
    familyMemberData: [],
    attnFamilyMemberData: [],
    dateBackFamilyMemberData: [],
    selectedFamilyMember: [],
    selectedAttnFamilyMember: [],
    selectedDateBackFamilyMember: [],
    familyBookingResult: [],
    familyAttnBookingResult: [],
    familyDateBackBookingResult: [],
    isRedirectByPatientList: false,
    familyBookingParam: [],
    isFamilyReplace: false,
    familyReplaceAppointmentList: []
};

export const bookingInformation = (state = initState, action = {}) => {
    switch (action.type) {
        case bookingActionType.RESET_INFO_ALL: {
            let bookingData = _.cloneDeep(initBookingData);
            return {
                ...initState,
                bookingData: bookingData
            };
        }

        case bookingActionType.PUT_EDIT_APPOINTMENT: {
            let { apptInfo, bookingData, sessionList } = action;
            return {
                ...state,
                pageStatus: pageStatusEnum.EDIT,
                appointmentMode: BookMeans.SINGLE,
                currentSelectedApptInfo: apptInfo,
                bookingData: bookingData,
                bookingDataBackup: _.cloneDeep(bookingData),
                sessionList: _.cloneDeep(sessionList)
            };
        }
        case bookingActionType.PUT_LIST_APPOINTMENT_HISTORY: {
            return {
                ...state,
                appointmentHistory: action.appointmentHistory
            };
        }
        case bookingActionType.PUT_LIST_TIMESLOT_DATA: {
            if (action.timeSlotList && action.timeSlotList.slotForBookingDtos) {
                let { slotForBookingDtos } = action.timeSlotList;
                for (let i = 0; i < slotForBookingDtos.length; i++) {
                    slotForBookingDtos[i].datetime = `${slotForBookingDtos[i].slotDate} ${slotForBookingDtos[i].startTime}`;
                }
            }
            return {
                ...state,
                timeSlotList: action.timeSlotList,
                pageDialogStatus: PAGE_DIALOG_STATUS.SEARCHING
            };
        }
        case bookingActionType.PUT_TIMESLOT_DATA: {
            let bookTimeSlotData = action.data.normal;

            if (bookTimeSlotData && bookTimeSlotData.length > 0) {
                for (let i = 0; i < bookTimeSlotData.length; i++) {
                    if (state.appointmentMode === BookMeans.SINGLE) {
                        bookTimeSlotData[i].remarkId = state.bookingData.remarkId;
                        bookTimeSlotData[i].memo = state.bookingData.memo;
                    }
                    bookTimeSlotData[i].qtType = state.bookingData.qtType;
                }
            }

            let bookSqueezeInTimeSlotData;
            if (action.data.squeezeIn && action.params.apptStartTime !== '00:00' && action.data.squeezeIn[0].startTime === action.params.apptStartTime) {
                bookSqueezeInTimeSlotData = action.data.squeezeIn;
            }

            if (bookSqueezeInTimeSlotData && bookSqueezeInTimeSlotData.length > 0) {
                for (let i = 0; i < bookSqueezeInTimeSlotData.length; i++) {
                    if (state.appointmentMode === BookMeans.SINGLE) {
                        bookSqueezeInTimeSlotData[i].remarkId = state.bookingData.remarkId;
                        bookSqueezeInTimeSlotData[i].memo = state.bookingData.memo;
                    }
                    bookSqueezeInTimeSlotData[i].qtType = state.bookingData.qtType;
                    bookSqueezeInTimeSlotData[i].isSqueeze = 1;
                    bookSqueezeInTimeSlotData[i].isUrgentSqueeze = 0;
                }
            }

            return {
                ...state,
                bookTimeSlotData,
                bookSqueezeInTimeSlotData,
                pageDialogStatus: bookSqueezeInTimeSlotData ? PAGE_DIALOG_STATUS.SQUEEZEIN : PAGE_DIALOG_STATUS.SELECTED
            };
        }
        case bookingActionType.PUT_BOOK_FAIL: {
            return {
                ...state,
                pageStatus: pageStatusEnum.VIEW
            };
        }
        // case bookingActionType.PUT_BOOK_SUCCESS: {
        //     let { respData, bookData } = action;
        //     const appointmentInfo = bookData.appointmentDtos[0];

        //     let bookingConfirmData = {
        //         appointmentId: respData[0].appointmentId,
        //         caseNo: appointmentInfo.caseNo ? appointmentInfo.caseNo : '',
        //         encounterTypeCd: appointmentInfo.encounterTypeCd,
        //         subEncounterTypeCd: appointmentInfo.subEncounterTypeCd,
        //         appointmentDate: respData[0].appointmentDate,
        //         appointmentTime: respData[0].appointmentTime,
        //         remarkId: appointmentInfo.remarkId,
        //         memo: appointmentInfo.memo,
        //         caseTypeCd: appointmentInfo.caseTypeCd
        //     };
        //     return {
        //         ...state,
        //         confirmData: bookingConfirmData,
        //         futureAppt: null,
        //         futureApptId: null,
        //         pageStatus: pageStatusEnum.CONFIRMED,
        //         pageDialogStatus: PAGE_DIALOG_STATUS.NONE,
        //         currentSelectedApptInfo: null,
        //         waitingList: null
        //     };
        // }
        case bookingActionType.REDESIGN_PUT_BOOK_SUCCESS: {
            let { bookInfo } = action;
            // TODO : caseNo AND caseTypeCd
            let bookingConfirmData = {
                appointmentId: bookInfo.apptId,
                caseNo: bookInfo.caseNo || '',
                encntrTypeId: bookInfo.encntrTypeId,
                rmId: bookInfo.rmId,
                appointmentDate: bookInfo.apptDate,
                memo: bookInfo.memo,
                caseTypeCd: 'New Case',
                encntrTypeDesc: bookInfo.encntrTypeDesc,
                rmDesc: bookInfo.rmDesc,
                alias:bookInfo.alias||'',
                encntrGrpCd:bookInfo.encntrGrpCd||''
            };

            return {
                ...state,
                confirmData: bookingConfirmData,
                futureAppt: null,
                futureApptId: null,
                pageStatus: pageStatusEnum.CONFIRMED,
                pageDialogStatus: PAGE_DIALOG_STATUS.NONE,
                currentSelectedApptInfo: null,
                waitingList: null,
                bookWithNewCase: false
            };
        }
        case bookingActionType.UPDATE_STATE: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case bookingActionType.UPDATE_CONTACT_HISTORY_STATE: {
            let contactHistoryInfo = {
                ...state.contactHistoryInfo,
                ...action.updateData
            };
            return {
                ...state,
                contactHistoryInfo
            };
        }

        case bookingActionType.UPDATE_SPEC_REQ_STATE: {
            let specialRequestInfo = {
                ...state.specialRequestInfo,
                ...action.updateData
            };
            return {
                ...state,
                specialRequestInfo
            };
        }
        case bookingActionType.BOOK_AND_ATTEND_SUCCEESS: {
            let { respData, walkInData} = action;

            let walkInConfirmData = {
                appointmentId: respData.appointmentId,
                patientKey: respData.patientKey,
                clinicCd: respData.clinicCd,
                siteId: respData.siteId,
                encounterTypeCd: respData.encounterTypeCd,
                encounterTypeId: respData.encntrTypeId,
                encntrTypeId: respData.encntrTypeId,
                subEncounterTypeCd: respData.subEncounterTypeCd,
                rmId: respData.rmId,
                rmCd: respData.rmCd,
                appointmentDate: respData.appointmentDate,
                appointmentTime: respData.appointmentTime,
                caseTypeCd: respData.caseTypeCd,
                patientStatusCd: respData.patientStatusCd,
                attnTime: respData.attnTime,
                caseNo: respData.caseNo,
                discNumber: respData.discNum,
                amount: walkInData.amount,
                paymentMeanCD: walkInData.paymentMeanCD,
                isWalkIn: true,
                encntrTypeDesc: respData.encntrTypeDesc,
                rmDesc: respData.rmDesc,
                alias:respData.alias||'',
                encntrGrpCd:respData.encntrGrpCd||''
            };
            return {
                ...state,
                pageStatus: pageStatusEnum.CONFIRMED,
                pageDialogStatus: PAGE_DIALOG_STATUS.NONE,
                confirmData: walkInConfirmData,
                backdateWalkInDay: 0
            };
        }

        case bookingActionType.PUT_ENCOUNTER_TYPE_LIST_BY_SITE: {
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

        case bookingActionType.PUT_LIST_REMARK_CODE: {
            let { remarkCodeList } = action;
            return {
                ...state,
                remarkCodeList: remarkCodeList
            };
        }

        case bookingActionType.CANCEL_EDIT_APPOINTMENT: {
            return {
                ...state,
                pageStatus: pageStatusEnum.VIEW,
                currentSelectedApptInfo: null,
                prefilledData: null
            };
        }

        case bookingActionType.UPDATE_APPOINTMENT_SUCCESS: {
            return {
                ...state,
                pageStatus: pageStatusEnum.VIEW,
                currentSelectedApptInfo: null,
                futureAppt: null,
                futureApptId: null
            };
        }

        case bookingActionType.PUT_CONTACT_HISTORY: {
            return {
                ...state,
                contactList: action.contactList
            };
        }

        case bookingActionType.CLEAR_CONTACT_HISTORY: {
            return {
                ...state,
                contactList: []
            };
        }
        case bookingActionType.PUT_DEFAULT_CASETYPECD: {
            return {
                ...state,
                defaultCaseTypeCd: action.defaultCaseTypeCd
            };
        }
        case bookingActionType.PUT_REMINDER_TEMPLATE: {
            return {
                ...state,
                apptReminderInfo: {
                    ...state.apptReminderInfo,
                    remindTemplate: action.remindTemplate
                },
                reminderTemplate: action.reminderTemplate
            };
        }
        case bookingActionType.PUT_REMINDER_LIST: {
            return {
                ...state,
                reminderList: action.reminderList,
                reminderListBk: action.reminderListBk,
                apptReminderInfo: {
                    ...state.apptReminderInfo,
                    reminderList: action.reminderList,
                    reminderListBk: action.reminderListBk
                },
                currentSelectedApptInfo: action.currentSelectedApptInfo
            };
        }
        case bookingActionType.PUT_SPECREQ_TYPES: {
            return {
                ...state,
                specReqTypesList: action.specReqTypesList
            };
        }
        case bookingActionType.RESET_REPLACE_APPOINTMENT: {
            return {
                ...state,
                replaceAppointmentData: _.cloneDeep(initRplaceAppointmentData),
                multipleReplaceApptData: _.cloneDeep(initMultiReplaceApptData),
                rescheduleApptData: _.cloneDeep(initRescheduleApptData),
                openReplaceAppointmentDialog: false,
                openSameDayAppointmentDialog: false
            };
        }
        case bookingActionType.UPDATE_PMI_DATA: {
            let { name, value } = action;
            let updateField = {};
            updateField[name] = value;
            return {
                ...state,
                ...updateField
            };
        }
        case bookingActionType.PUT_MULTIPLE_AVAIL_SLOT_DATA: {
            const { slot } = action;
            let cartList=[];
            let bookTimeSlotData = [];

            if (slot && slot.length > 0) {
                for (let i = 0; i < slot.length; i++) {
                    if (state.appointmentMode === BookMeans.SINGLE) {
                        //single appointment need remarkId and memo.
                    }
                    slot[i].normal.forEach(s => {
                        bookTimeSlotData.push(s);
                    });
                }
                // for (let i = 0; i < bookTimeSlotData.length; i++) {
                //     if (state.appointmentMode === BookMeans.SINGLE) {
                //         bookTimeSlotData[i].remarkId = state.bookingData.remarkId;
                //         bookTimeSlotData[i].memo = state.bookingData.memo;
                //     }
                //     bookTimeSlotData[i].qtType = state.bookingData.qtType;
                // }
                // bookTimeSlotData.map(item=>{
                //     return {
                //         ...item,
                //         encounterTypeId:appointmentListCart
                //     }
                // })
            }
            state.appointmentListCart.forEach((e, idx) => {
                cartList.push({
                    ...e,
                    idx
                });
            });

            // let bookSqueezeInTimeSlotData;
            // if (action.data.squeezeIn && action.params.apptStartTime !== '00:00' && action.data.squeezeIn[0].startTime === action.params.apptStartTime) {
            //     bookSqueezeInTimeSlotData = action.data.squeezeIn;
            // }

            // if (bookSqueezeInTimeSlotData && bookSqueezeInTimeSlotData.length > 0) {
            //     for (let i = 0; i < bookSqueezeInTimeSlotData.length; i++) {
            //         if (state.appointmentMode === BookMeans.SINGLE) {
            //             bookSqueezeInTimeSlotData[i].remarkId = state.bookingData.remarkId;
            //             bookSqueezeInTimeSlotData[i].memo = state.bookingData.memo;
            //         }
            //         bookSqueezeInTimeSlotData[i].qtType = state.bookingData.qtType;
            //         bookSqueezeInTimeSlotData[i].isSqueeze = 1;
            //         bookSqueezeInTimeSlotData[i].isUrgentSqueeze = 0;
            //     }
            // }

            return {
                ...state,
                bookTimeSlotData,
                //bookSqueezeInTimeSlotData,
                pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED,
                appointmentListCart:cartList
            };
        }
        case bookingActionType.PUT_APPOINTMENT_LIST_CART: {
            return {
                ...state,
                appointmentListCart: action.appointmentListCart
            };
        }
        case bookingActionType.UPDATE_SELECTED_FAMILY_MEMBER: {
            const { selectedData } = action.payload;
            return {
                ...state,
                selectedFamilyMember: selectedData
            };
        }
        case bookingActionType.UPDATE_SELECTED_ATTN_FAMILY_MEMBER: {
            const { selectedData } = action.payload;
            return {
                ...state,
                selectedAttnFamilyMember: selectedData
            };
        }
        case bookingActionType.UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER: {
            const { selectedData } = action.payload;
            return {
                ...state,
                selectedDateBackFamilyMember: selectedData
            };
        }
        case bookingActionType.UPDATE_FAMILY_MEMBER: {
            const { familyMember } = action.payload;
            return {
                ...state,
                familyMemberData: familyMember
            };
        }
        case bookingActionType.UPDATE_ATTN_FAMILY_MEMBER: {
            const { familyMember } = action.payload;
            return {
                ...state,
                attnFamilyMemberData: familyMember
            };
        }
        case bookingActionType.UPDATE_DATE_BACK_FAMILY_MEMBER: {
            const { familyMember } = action.payload;
            return {
                ...state,
                dateBackFamilyMemberData: familyMember
            };
        }
        case bookingActionType.UPDATE_FAMILY_BOOKING_RESULT: {
            const { familyBookingResult } = action.payload;
            return {
                ...state,
                familyBookingResult: familyBookingResult
            };
        }
        case bookingActionType.UPDATE_FAMILY_ATTN_BOOKING_RESULT: {
            const { familyBookingResult } = action.payload;
            return {
                ...state,
                familyAttnBookingResult: familyBookingResult
            };
        }
        case bookingActionType.UPDATE_FAMILY_DATE_BACK_BOOKING_RESULT: {
            const { familyBookingResult } = action.payload;
            return {
                ...state,
                familyDateBackBookingResult: familyBookingResult
            };
        }
        case bookingActionType.REDIRECT_BY_PATIENT_LIST: {
            const { isRedirectByPatientList } = action.payload;
            return {
                ...state,
                isRedirectByPatientList: isRedirectByPatientList
            };
        }
        case bookingActionType.UPDATE_FAMILY_BOOKING_PARAM: {
            const { familyBookingParam } = action.payload;
            return {
                ...state,
                familyBookingParam: familyBookingParam
            };
        }
        default: {
            return state;
        }

    }
};
