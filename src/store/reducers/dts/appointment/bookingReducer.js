import * as bookingActionType from '../../../actions/dts/appointment/bookingActionType';
import { PageStatus as pageStatusEnum } from '../../../../enums/dts/appointment/bookingEnum';

const initState = {
    pageLevelState:{
        calendarDetailMth: {calendarDataGroupCode: '', calendarDateList: []},
        calendarDataGroupList: [],
        calendarDetailDate: '',
        appointmentSearchPanelTabVal: 0,
        dailyView: [],
        selectedClinic: undefined,
        selectedRoom: undefined,
        selectedEncounterType: undefined,
        patientAppointmentList: [],
        roomList: [],
        encounterTypeList: [],
        sessionList: [],
        duration: 15,
        dailyNote:{},
        filterMode: 0,
        availableTimeSlotList: [],
        squeezeInMode: true,
        pageStatus: pageStatusEnum.VIEW,
        unavailableReasons: [],
        expressBookingMode:false,
        expressEditMode:false,
        utilizationMode:false
    },
    encounterTypeListForApptDialog: [],
    dailyViewNavigationHistory: [],
    dailyViewForExpress: [],
    appointmentList: [],
    printAppointmentReport: false,
    selectedDailyViewTimeslotList: [],
    selectedDayTimeslotList:{amList:[], pmList:[], ameohList:[], pmeohList:[], edcList:[]},
    switchingFlag: false,
    urgentRoomList:[],
    urgentRoomListForGp:[],
    unavailableUrgentRoomListForGp: {siteId: null, roomIdList:[]},
    selectedRescheduleAppointment: null,
    expressDateList:[],
    unavailPerdId:'',
    selectedDeleteAppointment: null,
    emptyTimeslotDateList: [],
    selectedCloseTimeSlot: null,
    appointmentLabelData:null,
    appointmentLog: null,
    timeslotLog: null,
    appointmentMessageObj: {},
    isupdated: false,
    disciplines: [],
    referralList: [],
    referralShowAppointmentId: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.calendarDataGroupList = action.calendarDataGroupList;
            let newAction = {
                ...state,
                pageLevelState: {...pageLevelState, calendarDataGroupList: action.calendarDataGroupList}
            };

            return newAction;

        }

        case bookingActionType.GET_AVAILABLE_CALENDAR_TIME_SLOT_EXPRESS_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.calendarDataGroupList = action.calendarDataGroupList;
            let newAction = {
                ...state,
                pageLevelState: {...pageLevelState, calendarDataGroupList: action.calendarDataGroupList}
            };

            return newAction;
        }


        case bookingActionType.RESET_CALENDAR_LIST: {
            let { pageLevelState } = state;
            pageLevelState.calendarDataGroupList = [];
            return {
                ...state, pageLevelState: {...pageLevelState, calendarDataGroupList: []}
            };
        }

        case bookingActionType.RESET_DAILY_NOTE: {
            let { pageLevelState } = state;
            // pageLevelState.dailyNote = {};
            return {
                ...state, pageLevelState: {...pageLevelState, dailyNote: {}}
            };
        }
        case bookingActionType.RESET_CALENDAR_DETAIL_DATE: {
            let { pageLevelState } = state;
            // pageLevelState.calendarDetailDate = '';
            return {
                ...state,
                pageLevelState: {...pageLevelState, calendarDetailDate: ''}
            };
        }
        case bookingActionType.RESET_AVAILABLE_TIME_SLOT_LIST: {
            let { pageLevelState } = state;
            // pageLevelState.availableTimeSlotList = [];

            return {
                ...state,
                pageLevelState: {...pageLevelState, availableTimeSlotList: []}
            };
        }
        case bookingActionType.SET_CALENDAR_DETAIL_MTH: {
            let { pageLevelState } = state;
            // pageLevelState.calendarDetailMth = action.params;

            return {
                ...state,
                pageLevelState: {...pageLevelState, calendarDetailMth: action.params}
            };
        }
        case bookingActionType.SET_APPOINTMENT_SEARCH_PANEL_TAB_VAL: {
            let { pageLevelState } = state;
            // pageLevelState.appointmentSearchPanelTabVal = action.params;
            return {
                ...state,
                pageLevelState: {...pageLevelState, appointmentSearchPanelTabVal: action.params}
            };
        }
        case bookingActionType.GET_DAILY_VIEW_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.dailyView = action.dailyView;

            return {
                ...state,
                pageLevelState: {...pageLevelState, dailyView: action.dailyView}
            };
        }
        case bookingActionType.GET_MULTIPLE_DAILY_VIEW_FOR_EXPRESS_SAGA: {
            let { dailyViewForExpress } = state;
            dailyViewForExpress = action.params;
            return {
                ...state, dailyViewForExpress
            };
        }
        case bookingActionType.INSERT_APPOINTMENT_SAGA: {

            let lastAction = { ...state };
            for (let p in action.appointmentList) {
                lastAction[p] = action.appointmentList[p];
            }

            return lastAction;
        }
        case bookingActionType.GET_PATIENT_APPOINTMENT_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.patientAppointmentList = action.patientAppointmentList;
            return {
                ...state,
                pageLevelState: {...pageLevelState, patientAppointmentList: action.patientAppointmentList}
            };
        }
        case bookingActionType.RESET_LOCATION_ENCOUNTER: {
            return initState;
        }
        case bookingActionType.GET_ROOM_LIST_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.roomList = action.roomList;
            return {
                ...state,
                pageLevelState: {...pageLevelState, roomList: action.roomList}
            };
        }
        case bookingActionType.GET_ENCOUNTER_TYPE_LIST_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.encounterTypeList = action.encounterTypeList;
            if(action.params.searchFor == 'dtsAppointmentDialog')
            {
                return {...state, encounterTypeListForApptDialog: action.params.encounterTypeList};
            }
            else
            {
                return {
                    ...state,
                    pageLevelState: {...pageLevelState, encounterTypeList: action.params.encounterTypeList}
                };
            }
        }

        case bookingActionType.SET_SELECTED_CLINIC: {
            let { pageLevelState } = state;
            // pageLevelState.selectedClinic = action.params.clinic;
            return {
                ...state,
                pageLevelState: {...pageLevelState, selectedClinic: action.params.clinic}
            };
        }
        case bookingActionType.SET_SELECTED_ROOM: {
            let { pageLevelState } = state;
            // pageLevelState.selectedRoom = action.params.room;
            return {
                ...state,
                pageLevelState: {...pageLevelState, selectedRoom: action.params.room}
            };
        }
        case bookingActionType.SET_SELECTED_ENCOUNTER_TYPE: {
            let { pageLevelState } = state;
            // pageLevelState.selectedEncounterType = action.params.encounterType;
            return {
                ...state,
                pageLevelState: {...pageLevelState, selectedEncounterType: action.params.encounterType}
            };
        }
        case bookingActionType.SET_DURATION: {
            let { pageLevelState } = state;
            // pageLevelState.duration = action.duration;
            return {
                ...state,
                pageLevelState: {...pageLevelState, duration: action.duration}
            };
        }
        case bookingActionType.GET_SESSION_LIST_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.sessionList = action.sessionList;
            return {
                ...state,
                pageLevelState: {...pageLevelState, sessionList: action.sessionList}
            };
        }

        case bookingActionType.GET_DAILY_NOTE_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.dailyNote = action.dailyNote;
            return {
                ...state,
                pageLevelState: {...pageLevelState, dailyNote: action.dailyNote}
            };
        }
        case bookingActionType.SET_FILTER_MODE: {
            let { pageLevelState } = state;
            // pageLevelState.filterMode = action.params;
            return {
                ...state,
                pageLevelState: {...pageLevelState, filterMode: action.params}
            };
        }
        case bookingActionType.SET_CALENDAR_DETAIL_DATE: {
            let { pageLevelState } = state;
            // pageLevelState.calendarDetailDate = action.params;
            return {
                ...state,
                pageLevelState: {...pageLevelState, calendarDetailDate: action.params}
            };
        }
        case bookingActionType.GET_AVAILABLE_TIME_SLOT_LIST_SAGA: {
            let { pageLevelState } = state;
            // pageLevelState.availableTimeSlotList = action.availableTimeSlotList;
            return {
                ...state,
                pageLevelState: {...pageLevelState, availableTimeSlotList: action.availableTimeSlotList}
            };
        }
        case bookingActionType.SET_SELECTED_DAILY_VIEW_TIMESLOT_LIST:{
            let lastAction = {...state};
            lastAction.selectedDailyViewTimeslotList = action.params;
            return lastAction;
        }
        case bookingActionType.RESET_SELECTED_DAILY_VIEW_TIMESLOT_LIST:{
            return {
                ...state,
                selectedDailyViewTimeslotList: []
            };
        }
        case bookingActionType.SET_SQUEEZE_IN_MODE: {
            let { pageLevelState } = state;
            // pageLevelState.squeezeInMode = action.squeezeInMode;
            return {
                ...state,
                pageLevelState: {...pageLevelState, squeezeInMode: action.squeezeInMode}
            };

        }
        case bookingActionType.SET_PAGE_STATUS: {
            let { pageLevelState } = state;
            // pageLevelState.pageStatus = action.pageStatus;
            return {
                ...state,
                pageLevelState: {...pageLevelState, pageStatus: action.pageStatus}
            };

        }
        case bookingActionType.RESET_ALL: {
            return {...initState, unavailableUrgentRoomListForGp: state.unavailableUrgentRoomListForGp};
        }
        case bookingActionType.GET_URGENT_ROOM_LIST_SAGA:{
            let lastAction = {...state};
            lastAction['urgentRoomList'] =action.urgentRoomList;
            return lastAction;
        }
        case bookingActionType.GET_GP_URGENT_ROOM_LIST_SAGA:{
            let lastAction = {...state};
            lastAction.urgentRoomListForGp = action.urgentRoomListForGp;
            return lastAction;
        }
        case bookingActionType.RESET_URGENT_ROOM_LIST:{
            return {
                ...state,
                urgentRoomList: []
            };
        }
        case bookingActionType.RESET_GP_URGENT_ROOM_LIST:{
            return {
                ...state,
                urgentRoomListForGp: []
            };
        }
        case bookingActionType.SET_UNAVAILABLE_GP_URGENT_ROOM_LIST:{
            let lastAction = {...state};
            lastAction.unavailableUrgentRoomListForGp = action.params;
            return lastAction;
        }
        case bookingActionType.SET_SELECTED_RESCHEDULE_APPOINTMENT:{
            let lastAction = {...state};

            lastAction.selectedRescheduleAppointment = action.params;
            return lastAction;
        }
        case bookingActionType.SET_SELECTED_DAY_TIMESLOT_LIST:{
            let lastAction = {...state};
            lastAction.selectedDayTimeslotList = action.params;
            return lastAction;
        }
        case bookingActionType.RESET_SELECTED_RESCHEDULE_APPOINTMENT:{
            return {
                ...state,
                selectedRescheduleAppointment: {}
            };
        }
        case bookingActionType.SET_EXPRESS_BOOKING_MODE:{
            let { pageLevelState } = state;
            // pageLevelState.expressBookingMode = action.params;
            return {
                ...state,
                pageLevelState: {...pageLevelState, expressBookingMode: action.params}
            };
        }
        case bookingActionType.SET_EXPRESS_EDIT_MODE:{
            let { pageLevelState } = state;
            // pageLevelState.expressEditMode = action.params;
            return {
                ...state,
                pageLevelState: {...pageLevelState, expressEditMode: action.params}
            };

        }
        case bookingActionType.SET_EXPRESS_DATE_LIST:{
            let lastAction = {...state};
            lastAction.expressDateList = action.params;
            return lastAction;
        }
        case bookingActionType.DELETE_UNAVAILABLE_PERIOD:{
            let lastAction = {...state};

            lastAction['unavailPerdId'] =action.unavailPerdId;

            return lastAction;
        }
        case bookingActionType.SET_SELECTED_DELETE_APPOINTMENT:{
            let lastAction = {...state};

            lastAction.selectedDeleteAppointment = action.params;
            return lastAction;
        }
        case bookingActionType.GET_UNAVAILABLE_REASONS_SAGA:{
            let { pageLevelState } = state;
            // pageLevelState.unavailableReasons = action.unavailableReasons;
            return {
                ...state,
                pageLevelState: {...pageLevelState, unavailableReasons: action.unavailableReasons}
            };
        }
        case bookingActionType.SET_EMPTY_TIMESLOT_DATE_LIST:{
            let lastAction = {...state};
            lastAction.emptyTimeslotDateList = action.params.emptyTimeslotDateList;
            return lastAction;
        }
        case bookingActionType.SET_SELECTED_CLOSE_TIMESLOT:{
            let lastAction = {...state};

            lastAction.selectedCloseTimeSlot = action.params;
            return lastAction;
        }
        case bookingActionType.RESET_SELECTED_CLOSE_TIMESLOT:{
            return {
                ...state,
                selectedCloseTimeSlot: null
            };
        }
        case bookingActionType.GET_BOOKING_ALERT:{
            let lastAction = { ...state };
            for (let p in action.appointmentList) {
                lastAction[p] = action.appointmentList[p];
            }
            return lastAction;
        }
        case bookingActionType.SET_DAILY_VIEW_NAVIGATION_HISTORY:{
            let lastAction = { ...state };
            lastAction.dailyViewNavigationHistory = action.params;
            return lastAction;
        }

        case bookingActionType.GET_APPOINTMENT_LABEL_SAGA:{
            let lastAction = { ...state };
            lastAction.appointmentLabelData = action.appointmentLabelData;
            return lastAction;
        }
        case bookingActionType.SET_APPOINTMENT_LOG:{
            return { ...state, appointmentLog: action.params };
        }
        case bookingActionType.SET_TIMESLOT_LOG:{
            return { ...state, timeslotLog: action.params };
        }
        case bookingActionType.SET_UTILIZATION_MODE:{
            let { pageLevelState } = state;
            return {
                ...state,
                pageLevelState: {...pageLevelState, utilizationMode: action.params}
            };
        }
        case bookingActionType.SET_APPOINTMENT_MESSAGE_OBJ: {
            return { ...state, appointmentMessageObj: action.params };
        }
        case bookingActionType.SET_IS_UPDATED:{
            let lastAction = {...state};
            lastAction.isUpdated = action.params.isUpdated;
            return lastAction;
        }

        case bookingActionType.SET_DISCIPLINES: {
            return { ...state, disciplines: action.params };
        }
        case bookingActionType.SET_REFERRAL_LIST: {
            return { ...state, referralList: action.params };
        }
        case bookingActionType.SET_REFERRAL_SHOW_APPOINTMENT_ID: {
            return { ...state, referralShowAppointmentId: action.params };
        }
        default: {
            return state;
        }
    }
};
