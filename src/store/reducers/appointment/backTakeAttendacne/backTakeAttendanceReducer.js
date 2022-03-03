import * as backTakeAttendanceActionTypes from '../../../actions/attendance/backTakeAttendanceAcitonType';
const INITAL_STATE = {
    //patient queue
    // searchParameter: {
    //     dateFrom: moment(),
    //     dateTo: moment(),
    //     attnStatusCd: 'N',
    //     encounterTypeCd: '',
    //     subEncounterTypeCd: '',
    //     patientKey: '',
    //     type: Enum.LANDING_PAGE.ATTENDANCE,
    //     page: 1,
    //     pageSize: 10
    // },
    // showTakeAttendance: false,
    //mark attendance
    patientStatusList: [],
    patientStatus: '',
    patientStatusFlag: 'N',
    isNep: false,
    nepRemark: '',
    discNum: '',
    isAttend: false,
    appointmentForAttendance: null,
    appointmentConfirmInfo: null,
    patientQueueList: [],
    enableWalkIn: false,
    openPromptDialog: false,
    appointmentList: [],
    currentAppointment: null,
    markArrivalDialogOpen: false,
    markArrivalDisNum: '',
    doCloseCallback: null,
    doCloseBackUp: {
        isNep: false,
        nepRemark: '',
        discNum: '',
        patientStatus: ''
    },
    caseIndicator: '',
    confirmECSEligibility: '',
    patientSvcExist: true
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case backTakeAttendanceActionTypes.UPDATE_FIELD: {
            let lastState = { ...state };
            for (let p in action.updateData) {
                lastState[p] = action.updateData[p];
                if(p === 'currentAppointment'){
                    let currentAppointment = action.updateData[p];
                    lastState.isNep = false;
                    lastState.nepRemark = null;
                    lastState.discNum = null;
                    // lastState.patientStatus = null;

                    if(currentAppointment && currentAppointment.attendanceBaseVo){
                        let currentAttendance = currentAppointment.attendanceBaseVo;
                        if(currentAttendance.isNep){
                            lastState.isNep = currentAttendance.isNep;
                            lastState.nepRemark = currentAttendance.nepRemark;
                        }

                        if(currentAttendance.discNum && currentAttendance.discNum !== ''){
                            lastState.discNum = currentAttendance.discNum;
                        }
                    }
                }
            }
            return lastState;
        }

        case backTakeAttendanceActionTypes.RESET_ALL: {
            return INITAL_STATE;
        }

        case backTakeAttendanceActionTypes.PATIENT_STATUS_LIST: {
            return {
                ...state,
                patientStatusList: action.codeList ? action.codeList.patient_status : []
            };
        }

        case backTakeAttendanceActionTypes.PUT_APPOINTMENT_LIST: {
            return {
                ...state,
                appointmentList: action.appointmentList
            };
        }

        case backTakeAttendanceActionTypes.BACK_TAKE_ATTENDANCE_SUCCESS: {
            return {
                ...state,
                isAttend: true,
                appointmentConfirmInfo: action.data,
                currentAppointment: null
            };
        }

        default:
            return state;
    }
};