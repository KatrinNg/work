import * as emptyTimeslotActionType from '../../../actions/dts/appointment/emptyTimeslotActionType';
import moment from 'moment';
import _ from 'lodash';

const initState = {
    emptyTimeslotList:[],
    selectedEmptyTimeslotList:[],
    selectedClinic: {},
    selectedRoomList: [],
    roomList: [],
    calendarDetailDate1:'',
    calendarDetailDate2:'',
    unavailablePeriodAppointmentList:[],
    reserveList: [],
    selectedEmptyTimeslot: null,
    selectedAppointment: null,
    reserveListReport: null, //Miki
    redirect: {
        action: null
    }
};


export default (state = initState, action = {}) => {

    switch (action.type) {
        case emptyTimeslotActionType.SET_REDIRECT: {
            let lastAction = { ...state };
            lastAction['redirect'] = { ...lastAction['redirect'], ...action.params };
            return lastAction;
        }
        case emptyTimeslotActionType.GET_ROOM_LIST_SAGA: {
            let lastAction = {...state};
            for(let p in action.roomList) {
                lastAction[p] = action.roomList[p];
            }
//           lastAction['roomList'] = action.params.roomList;
            return lastAction;
        }
        case emptyTimeslotActionType.GET_EMPTY_TIMESLOT_LIST_SAGA:{
            let lastAction = {...state};
            for (let p in action.emptyTimeslotList) {
                lastAction[p] = action.emptyTimeslotList[p];
            }
            return lastAction;
        }
        case emptyTimeslotActionType.SET_CALENDAR_DETAIL_DATE1: {
            let lastAction = {...state};
            lastAction['calendarDetailDate1'] =action.params.calendarDetailDate1;
            return lastAction;
        }
        case emptyTimeslotActionType.SET_CALENDAR_DETAIL_DATE2: {
            let lastAction = {...state};
            lastAction['calendarDetailDate2'] =action.params.calendarDetailDate2;
            return lastAction;
        }
        case emptyTimeslotActionType.SET_SELECTED_CLINIC: {
            let lastAction = {...state};
            lastAction['selectedClinic'] = action.params.selectedClinic;
            return lastAction;
        }
        case emptyTimeslotActionType.SET_SELECTED_ROOM_LIST: {
            let lastAction = {...state};
            lastAction['selectedRoomList'] = action.params.selectedRoomList;
            return lastAction;
        }
        case emptyTimeslotActionType.SET_SELECTED_EMPTY_TIMESLOT_LIST: {
            let lastAction = {...state};
            console.log('reducer.selectedEmptyTimeslotList:' + JSON.stringify(action.params.selectedEmptyTimeslotList));
            lastAction['selectedEmptyTimeslotList'] = action.params.selectedEmptyTimeslotList;
            return lastAction;
        }
        case emptyTimeslotActionType.GET_UNAVAILABLE_APPOINTMENTS_SUCCESS: {
            const newState = {...state, unavailablePeriodAppointmentList:action.params};
            return newState;
        }
        case emptyTimeslotActionType.GET_RESERVE_LIST_SUCCESS: {
            const newState = {...state, reserveList:action.params};
            return newState;
        }
        case emptyTimeslotActionType.SET_SELECTED_EMPTY_TIMESLOT: {
            return {...state, selectedEmptyTimeslot: action.params};
        }
        case emptyTimeslotActionType.SET_SELECTED_APPOINTMENT: {
            return {...state, selectedAppointment: action.params};
        }
        case emptyTimeslotActionType.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }//Miki
        case emptyTimeslotActionType.GET_RESERVE_LIST_REPORT_SAGA: {
            let lastAction = {...state};
            lastAction['reserveListReport'] = action.appointmentListReport;
            return lastAction;
        }//Miki
        case emptyTimeslotActionType.RESET_ALL: {
            return initState;
        }
        default: {
            return state;
        }
    }


};