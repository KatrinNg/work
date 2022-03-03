import * as attendanceActionType from '../../../actions/dts/appointment/attendanceActionType';
import moment from 'moment';

const initState = {
    selectedClinic: {},
    selectedRoom: {},
    selectedFilterClinicalStatus:'',
    selectedFilterEncounterTypeCd:'',
    selectedFilterAttendanceStatus:'',
    selectedFilterInfectionControlDisplay: false,
    selectedAppointmentTask: null,
    selectedPatientEcsResult: '',
    attendanceTaskList: [],
    roomList: [],
    calendarDetailDate: moment(0, 'HH'),
    dailyNote:{},
    roomOfficer:{},
    dailyView:[],
    patientInfo:{},
    patientKey: 0,
    serveRoom: {},
    ecsPermitReasonList:[],
    attendanceAlert: {},
    attendanceAlertSettings: {}
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case attendanceActionType.RESET_ALL:{
            return initState;
        }
        case attendanceActionType.RESET_LOCATION_ENCOUNTER: {
            return {
                ...state,
                //clinic?
                selectedRoom:{},
                calendarDetailDate:''
            };
        }
        case attendanceActionType.RESET_ATTENDANCE_FILTER: {
            return {
                ...state,
                selectedFilterClinicalStatus:'',
                selectedFilterEncounterTypeCd:'',
                selectedFilterAttendanceStatus:''
            };
        }
        case attendanceActionType.RESET_DAILY_NOTE: {
            return {
                ...state,
                dailyNote:{}
            };
        }
        case attendanceActionType.GET_CALENDAR_DETAIL_DATE: {
            return {
                ...state,
                calendarDetailDate: action.params
            };
        }
        case attendanceActionType.SET_CALENDAR_DETAIL_DATE: {
            let lastAction = { ...state };

            lastAction['calendarDetailDate'] = action.params.calendarDetailDate;
            return lastAction;
        }
        case attendanceActionType.GET_ROOM_OFFICER_SAGA: {
            let lastAction = {...state};
            lastAction['roomOfficer'] = action.roomOfficer;
            return lastAction;
        }
        case attendanceActionType.GET_ROOM_LIST_SAGA: {
            let lastAction = { ...state };
            for (let p in action.roomList) {
                lastAction[p] = action.roomList[p];
            }
            return lastAction;
        }
        case attendanceActionType.SET_SELECTED_ROOM: {
            let lastAction = { ...state };

            lastAction['selectedRoom'] = action.params.selectedRoom;
            return lastAction;
        }
        case attendanceActionType.SET_SELECTED_CLINIC: {
            let lastAction = { ...state };

            lastAction['selectedClinic'] = action.params.selectedClinic;
            return lastAction;
        }
        case attendanceActionType.SET_SELECTED_FILTER_CLINICAL_STATUS: {

            let lastAction = { ...state };
            lastAction['selectedFilterClinicalStatus'] = action.params.filterClinicalStatus;
            return lastAction;
        }
        case attendanceActionType.SET_SELECTED_FILTER_ENCOUNTER_TYPE_CODE: {
            let lastAction = {...state};
            lastAction['selectedFilterEncounterTypeCd'] = action.params.filterEncounterTypeCd;
            return lastAction;
        }
        case attendanceActionType.SET_SELECTED_FILTER_ATTENDANCE_STATUS: {
            let lastAction = { ...state };
            lastAction['selectedFilterAttendanceStatus'] = action.params.filterAttendanceStatus;
            return lastAction;
        }
        case attendanceActionType.SET_SELECTED_FILTER_INFECTION_CONTROL_DISPLAY: {
            let lastAction = { ...state };
            lastAction.selectedFilterInfectionControlDisplay = action.params.filterInfectionControlDisplay;
            return lastAction;
        }
        case attendanceActionType.GET_DAILY_NOTE: {
            let lastAction = { ...state };
            lastAction['dailyNote'] = 'Patient booked next week appointment(attendance)';
            return lastAction;
        }
        // case attendanceActionType.SET_DAILY_NOTE: {
        //     let lastAction = { ...state };
        //     lastAction['dailyNote'] = action.params.dailyNote;
        // }
        case attendanceActionType.SET_SELECTED_APPOINTMENT_TASK: {
            let lastAction = {...state};
            lastAction['selectedAppointmentTask'] = action.params.selectedAppointmentTask;
            return lastAction;
        }
        case attendanceActionType.SET_PATIENT_KEY: {
            let lastAction = {...state};
            lastAction['patientKey'] = action.params.patientKey;
            return lastAction;
        }
        case attendanceActionType.SET_PATIENT_KEY_N_APPOINTMENT: {
            let lastAction = {...state};
            lastAction['patientKey'] = action.params.patientKey;
            lastAction['selectedAppointmentTask'] = action.params.selectedAppointmentTask;
            lastAction['selectedPatientEcsResult'] = action.params.selectedPatientEcsResult;
            return lastAction;
        }
        case attendanceActionType.GET_DAILY_NOTE_SAGA: {
            let lastAction = {...state};
            lastAction['dailyNote'] =action.dailyNote;
            return lastAction;
        }
        case attendanceActionType.GET_DAILY_VIEW_SAGA: {
            let lastAction = {...state};
            for (let p in action.dailyView) {
                lastAction[p] = action.dailyView[p];
            }
            return lastAction;
        }
        case attendanceActionType.GET_PATIENT_BY_HKID_SAGA: {
            let lastAction = {...state};
            lastAction['patientInfo'] =action.patientInfo[0];
            lastAction['patientKey'] = action.patientInfo[0].patientKey;
            return lastAction;
        }
        case attendanceActionType.GET_APPOINTMENT_TASK_SAGA: {
            let lastAction = {...state};
            let targetAppointment = null;

            action.appointmentTask.appointmentTask
            .sort(
                (a, b) => moment(a.apptDateEndTime).diff(
                    moment(b.apptDateEndTime)
                ,'minutes')
            )
            // .sort(function(a, b){
            //     return a.appointmentId - b.appointmentId;
            // })
            .every(function(appt){

                if(appt.attendanceBaseVo == null){
                    targetAppointment = appt;
                    return false;
                }
                else
                    return true;
            });

            lastAction['selectedAppointmentTask'] =targetAppointment;
            return lastAction;
        }
        case attendanceActionType.GET_PATIENT_BY_IDS_SAGA:{
            let lastAction = {...state};
            lastAction['patientInfo'] =action.patientInfo[0];

            return lastAction;
        }
        case attendanceActionType.GET_SERVE_ROOM_SAGA:{
            let lastAction = {...state};
            for (let p in action.serveRoom) {
                lastAction[p] = action.serveRoom[p];
            }
            return lastAction;
        }
        case attendanceActionType.GET_ECS_PERMIT_REASON_LIST_SAGA: {
            let lastAction = {...state};
            lastAction['ecsPermitReasonList'] = action.ecsPermitReasonList;
            return lastAction;
        }
        case attendanceActionType.GET_ATTENDANCE_SAGA:{
            let lastAction = {...state};
            for (let p in action.attendanceAlert) {
                lastAction[p] = action.attendanceAlert[p];
            }
            return lastAction;
        }
        case attendanceActionType.SET_SELECTED_PATIENT_ECS_RESULT: {
            let lastAction = { ...state };
            lastAction.selectedPatientEcsResult = action.params.selectedPatientEcsResult;
            return lastAction;
        }
        case attendanceActionType.SET_ATTENDANCE_ALERT_SETTINGS: {
            let lastAction = { ...state };
            lastAction.attendanceAlertSettings = action.params;
            return lastAction;
        }
        default: {
            return state;
        }
    }
};
