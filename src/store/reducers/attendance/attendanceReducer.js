import * as attendanceTypes from './../../actions/attendance/attendanceActionType';

const inital_state = {
    patientStatusList: [],
    patientStatus: null,
    anaRemarkTypes: [],
    discNum: '',
    isNep: false,
    nepRemark: '',
    isAttend: false,
    appointmentForAttendance: null,
    appointmentConfirmInfo: null,
    patientQueueList: [],
    enableWalkIn: false,
    openPromptDialog: false,
    appointmentList: [],
    currentAppointment: null,
    patientStatusFlag:'N',
    markArrivalDialogOpen:false,
    markArrivalDisNum:'',
    doCloseCallback: null,
    doCloseBackUp: {
        patientStatus: null,
        discNum: '',
        isNep: false,
        nepRemark: '',
        confirmECSEligibility:''
    },
    caseIndicator: '',
    confirmECSEligibility: '',
    patientSvcExist: true
};

export default (state = inital_state, action = {}) => {
    switch (action.type) {
        case attendanceTypes.ANA_ATND_PUT_PATIENT_STATUS_LIST: {
            return {
                ...state,
                patientStatusList: action.codeList ? action.codeList.patient_status : []
            };
        }
        case attendanceTypes.ANA_ATND_PUT_ANA_REMARK: {
            return {
                ...state,
                anaRemarkTypes: action.anaRemarkTypes ? action.anaRemarkTypes : []
            };
        }
        case attendanceTypes.ANA_ATND_UPDATE_FIELD: {
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
        case attendanceTypes.ANA_ATND_MARK_ATTENDANCE_SUCCESS: {
            return {
                ...state,
                isAttend: true,
                appointmentConfirmInfo: action.data,
                currentAppointment: null
            };
        }
        case attendanceTypes.ANA_ATND_APPOINTMENT_FOR_ATTENDANCE_SUCCESS: {
            let currentAppointment = { ...action.currentAppointment };
            let tempDialogFlag = false;
            if (!action.currentAppointment) {
                tempDialogFlag = true;
            }

            //update patient status
            let patientStatusCd = state.patientStatus;
            if (currentAppointment.patientStatusFlag === 'Y') {
                if (currentAppointment.patientStatusCd) {
                    patientStatusCd = currentAppointment.patientStatusCd;
                }
            }

            return {
                ...state,
                currentAppointment: currentAppointment,
                patientStatus: patientStatusCd,
                openPromptDialog: tempDialogFlag
            };
        }
        case attendanceTypes.ANA_ATND_DESTROY_MARK_ATTENDANCE: {
            return {
                inital_state,
                patientStatusList: state.patientStatusList
            };
        }
        case attendanceTypes.ANA_ATND_PUT_APPOINTMENT_LIST: {
            return {
                ...state,
                appointmentList: action.appointmentList
            };
        }
        case attendanceTypes.ANA_ATND_RESET_ALL: {
            return inital_state;
        }
        default:
            return state;
    }
};