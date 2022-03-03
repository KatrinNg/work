import * as calendarViewActionType from '../../actions/appointment/calendarView/calendarViewActionType';
import moment from 'moment';

const initState = {
    showMakeAppointmentView: false,
    calendarViewValue: 'D',
    availableQuotaValue: ['normal', 'force', 'all'],
    showAppointmentRemarkValue: true,
    serviceValue: null,
    clinicValue: null,
    encounterTypeValue: null,
    selectEncounterType: {},
    subEncounterTypeValue: null,
    // dateFrom: moment().startOf('month'),
    // dateTo: moment().endOf('month'),
    dateFrom: moment().startOf('day'),
    dateTo: moment().endOf('day'),
    date: moment(),
    clinicListData: [],
    encounterTypeListData: [],
    subEncounterTypeListData: [],
    filterLists: {
        clinicList: [],
        encounterTypeList: [],
        sessionList: []
    },
    calendarData: [],
    calendarMonthData: null,
    calendarWeekData: null,
    calendarDayData: null,
    calendarDayData1: null,
    calendarDayData2: null,
    bookData: null,
    subEncounterTypeListKeyAndValue: {},
    waitingList: null,
    rmId: null,
    openApptListPreview: false,
    apptListReportData: null,
    roomUtilizationData: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case calendarViewActionType.RESET_ALL: {
            return initState;
        }
        case calendarViewActionType.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        case calendarViewActionType.FILLING_DATA: {
            let lastAction = { ...state };
            for (let p in action.fillingData) {
                lastAction[p] = action.fillingData[p];
            }
            return lastAction;
        }
        case calendarViewActionType.PUT_APP_LIST_REPORT_DATA: {
            return {
                ...state,
                apptListReportData: action.reportData,
                openApptListPreview: true
            };
        }
        case calendarViewActionType.PUT_FILTER_LISTS: {
            const {clinicList, encounterTypeList, roomList, sessionList} = action.data;
            return {
                ...state,
                filterLists: {
                    clinicList,
                    encounterTypeList,
                    sessionList
                }
            };
        }
        default: {
            return state;
        }
    }
};

