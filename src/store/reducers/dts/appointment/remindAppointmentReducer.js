import * as remindAppointmentActionType from '../../../actions/dts/appointment/remindAppointmentActionType';
import moment from 'moment';
import _ from 'lodash';

const initState = {

    selectedClinic: {},
    selectedRoomList: [],
    roomList:[],
    calendarDetailDate1: '',
    calendarDetailDate2: '',
    onlyNeedReminder: true,
    remindAppointmentList:{},
    serveRoom: {},
    contactHistoryList: null,
    reminderTemplate: null,
    contactHistoryInfo: {
        hasEdit: false,
        id: null,
        callerName: '',
        NotificationDate: null,
        NotificationTime: null,
        tel: '',
        email: '',
        note: '',
        contactType: '',
        appointmentDate: null,
        sentDateTime: null,
        sentBy: '',
        schduleDateTime: null,
        subject: '',
        message: '',
        result: '',
        status: '',
        version: null,
        smsLogId: null,
        address:''
    },
    contactDetailsTabVal: 0,
    contactHistoryTelNotesListSucceed: [],
    contactHistoryTelNotesListFailed: [],
    contactHistoryMailNotesListSucceed: [],
    lastGetRemindAppointmentListAction: null,
    remindAppointmentListReport: null,
    openDtsPrintRemindAppointmentListReportDialog: false,
    selectedDateStart:moment(0, 'HH').add(7, 'd'),
    selectedDateEnd:moment(0, 'HH').add(12, 'd'),
    selectedRooms:[]
};


export default (state = initState, action = {}) => {

    switch (action.type) {

        case remindAppointmentActionType.RESET_LOCATION_ENCOUNTER: {
            return {
                ...state,
                //clinic?
                selectedRoomList:[],
                calendarDetailDate1:'',
                calendarDetailDate2:'',
                onlyNeedReminder: true
            };
        }
        case remindAppointmentActionType.GET_CALENDAR_DETAIL_DATE1: {

            return {
                ...state,
                calendarDetailDate1: action.params
            };
        }
        case remindAppointmentActionType.GET_CALENDAR_DETAIL_DATE2: {

            return {
                ...state,
                calendarDetailDate2: action.params
            };
        }
        case remindAppointmentActionType.SET_CALENDAR_DETAIL_DATE1: {
            // console.log('remindAppointmentActionType.SET_CALENDAR_DETAIL_DATE: ' + action.params.calendarDetailDate1);
            let lastAction = {...state};
            lastAction['calendarDetailDate1'] =action.params.calendarDetailDate1;
            return lastAction;
        }
        case remindAppointmentActionType.SET_CALENDAR_DETAIL_DATE2: {
            // console.log('remindAppointmentActionType.SET_CALENDAR_DETAIL_DATE: ' + action.params.calendarDetailDate1);
            let lastAction = {...state};
            lastAction['calendarDetailDate2'] =action.params.calendarDetailDate2;
            return lastAction;
        }

        case remindAppointmentActionType.GET_ROOM_LIST_SAGA: {
            let lastAction = {...state};
             for(let p in action.roomList) {
                 lastAction[p] = action.roomList[p];
             }
            return lastAction;
        }

        case remindAppointmentActionType.SET_SELECTED_ROOM_LIST: {
            let lastAction = {...state};
            console.log('==set select room list==');
            lastAction.selectedRoomList = action.params;
            return lastAction;
        }

        case remindAppointmentActionType.SET_SELECTED_CLINIC: {
            let lastAction = {...state};
            //console.log('action.params.clinicCd: ' + action.params.selectedClinic);
            lastAction['selectedClinic'] = action.params.selectedClinic;
            return lastAction;
        }
        case remindAppointmentActionType.GET_REMIND_APPOINTMENT_LIST_SAGA: {
            let lastAction = {...state};
            for (let p in action.remindAppointmentList) {
                lastAction[p] = action.remindAppointmentList[p];
            }
            lastAction.lastGetRemindAppointmentListAction = action.lastGetRemindAppointmentListAction;
            return lastAction;
        }
        case remindAppointmentActionType.GET_SERVE_ROOM_SAGA:{
            let lastAction = {...state};
            for (let p in action.serveRoom) {
                lastAction[p] = action.serveRoom[p];
            }
            return lastAction;
        }
        case remindAppointmentActionType.GET_REMINDER_TEMPLATE_SAGA: {
            return {
                ...state,
                reminderTemplate: action.reminderTemplate
            };
        }
        case remindAppointmentActionType.GET_TEL_NOTES_CODE_SAGA: {
            let lastAction = {...state};
            if (!_.isEmpty(action.contactHistoryTelNotesList)) {
                lastAction['contactHistoryTelNotesListSucceed'] =
                    action.contactHistoryTelNotesList.filter((e) => (e.supplementaryInformationObj.contactStatus == 'SUCCEED'));
                lastAction['contactHistoryTelNotesListFailed'] =
                    action.contactHistoryTelNotesList.filter((e) => (e.supplementaryInformationObj.contactStatus == 'FAILED'));
            }
            else {
                lastAction['contactHistoryTelNotesListSucceed'] = [];
                lastAction['contactHistoryTelNotesListFailed'] = [];
            }

            return lastAction;
        }
        case remindAppointmentActionType.RESET_CONTACT_HISTORY_DIALOG:{
            return{
                ...state,
                contactHistoryList: null,
                contactHistoryInfo: initState.contactHistoryInfo,
                contactDetailsTabVal: 0,
                //contactHistoryTelNotesListSucceed: [],
                //contactHistoryTelNotesListFailed: [],
                contactHistoryMailNotesListSucceed: []
            };
        }

        case remindAppointmentActionType.GET_MAIL_NOTES_CODE_SAGA: {
            console.log('GET_MAIL_NOTES_CODE_SAGA');
            let lastAction = {...state};
            if (!_.isEmpty(action.contactHistoryMailNotesList)) {
                lastAction['contactHistoryMailNotesListSucceed'] =
                    action.contactHistoryMailNotesList.filter((e) => (e.supplementaryInformationObj.contactStatus == 'SUCCEED'));
                // lastAction['contactHistoryMailNotesListFailed'] =
                //     action.contactHistoryMailNotesList.filter((e) => (e.supplementaryInformationObj.contactStatus == 'FAILED'));
            }
            else {
                lastAction['contactHistoryMailNotesListSucceed'] = [];
            }

            return lastAction;
        }

        case remindAppointmentActionType.GET_CONTACT_HISTORY_LIST_SAGA:{
            let lastAction = {...state};
            for (let p in action.contactHistoryList) {
                lastAction[p] = action.contactHistoryList[p];
            }
            return lastAction;
        }

        case remindAppointmentActionType.SET_REMIND_APPOINTMENT_LIST_REPORT: {
            //let lastAction = {...state};
            // lastAction.remindAppointmentListReport = action.params;
            return {
                ...state,
                ...action.updateData
            };
        }

        case remindAppointmentActionType.RESET_REMIND_APPOINTMENT_LIST_REPORT:{
            return{
                ...state,
                remindAppointmentListReport: null,
                openDtsPrintRemindAppointmentListReportDialog: false,
                remindAppointmentList:{},
                selectedDateStart:'',
                selectedDateEnd:'',
                selectedRooms:[]
            };
        }

        case remindAppointmentActionType.SET_SELECTED_ROOMS: {
            let lastAction = {...state};
            lastAction.selectedRooms = action.params;
            return lastAction;
        }

        case remindAppointmentActionType.SET_SELECTED_DATE_END: {
            let lastAction = {...state};
            lastAction.selectedDateEnd = action.params;
            return lastAction;
        }

        case remindAppointmentActionType.SET_SELECTED_DATE_START: {
            let lastAction = {...state};
            lastAction.selectedDateStart = action.params;
            return lastAction;
        }

        default: {
            return state;
        }

    }


};