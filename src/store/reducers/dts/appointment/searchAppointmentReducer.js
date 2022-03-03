import * as searchAppointmentActionType from '../../../actions/dts/appointment/searchAppointmentActionType';
import moment from 'moment';
import _ from 'lodash';


const initState = {
    selectedClinic: {},
    roomList: [],
    encounterTypeList: [],
    appointmentList:[],
    appointmentListReport:null
};


export default (state = initState, action = {}) => {

    switch (action.type) {

        case searchAppointmentActionType.GET_ROOM_LIST_SAGA: {
            let lastAction = {...state};
            for(let p in action.roomList) {
                lastAction[p] = action.roomList[p];
            }
            //lastAction['roomList'] = action.params.roomList;
            return lastAction;
        }

        case searchAppointmentActionType.GET_ENCOUNTER_TYPE_LIST_SAGA: {
            let lastAction = {...state};
            for(let p in action.encounterTypeList) {
                lastAction[p] = action.encounterTypeList[p];
            }
            //lastAction['roomList'] = action.params.roomList;
            return lastAction;
        }

        case searchAppointmentActionType.GET_APPOINTMENT_LIST_SAGA: {
            //console.log('reducer-GET_APPOINTMENT_LIST_SAGA:'+JSON.stringify(action.appointmentList));
            let lastAction = {...state};
            for(let p in action.appointmentList) {
                lastAction[p] = action.appointmentList[p];
            }
            //lastAction['roomList'] = action.params.roomList;
            return lastAction;
        }

        case searchAppointmentActionType.GET_APPOINTMENT_LIST_REPORT_SAGA: {
            //console.log('reducer-GET_APPOINTMENT_LIST_REPORT_SAGA:'+action.appointmentListReport);
            let lastAction = {...state};
            lastAction['appointmentListReport'] = action.appointmentListReport;
            return lastAction;
        }

        case searchAppointmentActionType.RESET_ALL: {
            return initState;
        }

        case searchAppointmentActionType.RESET_ENCOUNTER_TYPE_LIST: {
            return {
                ...state,
                encounterTypeList:[]
            };
        }

        case searchAppointmentActionType.RESET_APPOINTMENT_LIST_REPORT: {
            return {
                ...state,
                RESET_APPOINTMENT_LIST_REPORT:null
            };
        }

        case searchAppointmentActionType.SET_SELECTED_ROOM_LIST: {
            let lastAction = {...state};
            lastAction['selectedRoomList'] = action.params;
            return lastAction;
        }

        case searchAppointmentActionType.SET_SELECTED_ENCOUNTER_TYPE_LIST: {
            let lastAction = {...state};
            lastAction['selectedEncounterTypeList'] = action.params;
            return lastAction;
        }

        case searchAppointmentActionType.SET_CALENDAR_DETAIL_START_DATE: {
            let lastAction = {...state};
            lastAction['calendarDetailDate1'] = action.params;
            return lastAction;
        }

        case searchAppointmentActionType.SET_CALENDAR_DETAIL_END_DATE: {
            let lastAction = {...state};
            lastAction['calendarDetailDate2'] = action.params;
            return lastAction;
        }

        case searchAppointmentActionType.SET_WITHIN_CLOSE_PERIOD: {
            let lastAction = {...state};
            lastAction['withinClosePeriod'] = action.params;
            return lastAction;
        }

        default: {
            return state;
        }
    }


};