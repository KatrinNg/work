import * as types from '../../actions/patient/patientSpecFunc/patientSpecFuncActionType';
import * as patientUtilities from '../../../utilities/patientUtilities';
import _ from 'lodash';
import moment from 'moment';
import Enum from '../../../enums/enum';

const INITAL_STATE = {
    searchParameter: {
        roleType: Enum.USER_ROLE_TYPE.COUNTER,
        dateFrom: moment(),
        dateTo: moment()
    },
    filterCondition: {
        attnStatusCd: 'Y',
        encounterTypeCd: '',
        subEncounterTypeCd: '',
        patientKey: ''
    },
    patientList: [],
    patientQueueList: {},
    openLinkPatient: false,
    codeList: null,
    linkParameter: {
        hkidOrDoc: '',
        docTypeCd: '',
        engSurname: '',
        engGivename: '',
        phoneNo: '',
        patientKey: ''
    },
    patientQueueDto: null,
    linkPatientList: [],
    linkPatientStatus: '',
    searchNextAction: '',
    isFocusSearchInput: true,
    transferredPatientKey: null,
    patientSearchParam: {
        searchType: '',
        searchValue: ''
    },
    patientUnderCareDialogOpen: false,
    patientUnderCareVersion: null,
    patientSelected: null,
    searchAppointment: null,
    supervisorsApprovalDialogInfo: {
        open: false,
        staffId: ''
    },
    dateRangeLimit: 90
};


export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
    switch (action.type) {
        case types.RESET_PATIENT_LIST_FIELD: {
            return _.cloneDeep(INITAL_STATE);
        }
        case types.UPDATE_PATIENT_LIST_FIELD: {
            let newState = _.cloneDeep(state);
            newState = { ...newState, ...action.fields };
            return newState;
        }
        case types.PUT_SEARCH_PATIENT_LIST: {
            const patientResult = patientUtilities.getPatientSearchResult(action.data && action.data.patientDtos, action.countryList);
            return {
                ...state,
                patientList: patientResult
            };
        }
        case types.PUT_CODE_LIST: {
            let newState = { ...state };
            newState.codeList = action.codeList;
            return newState;
        }
        case types.RESET_LINK_PATIENT: {
            let newState = { ...state };
            newState.openLinkPatient = false;
            newState.linkParameter = INITAL_STATE.linkParameter;
            newState.linkPatientList = [];
            newState.linkPatientStatus = '';
            return newState;
        }
        case types.PUT_PATIENT_PRECISELY: {
            let newState = { ...state };
            newState.linkPatientList = action.data;
            newState.linkParameter = { ...state.linkParameter, hkidOrDoc: '' };
            return newState;
        }
        case types.PUT_CONFIRM_ANONYMOUS_PATIENT: {
            let newState = { ...state };
            newState.linkPatientStatus = action.status;
            newState.transferredPatientKey = action.data;
            return newState;
        }
        case types.RESET_CONDITION: {
            let patientList = { ...state };
            patientList.filterCondition = INITAL_STATE.filterCondition;
            return patientList;
        }
        case types.UPDATE_PATIENT_LIST_ATTENDANCEINFO: {
            const { attendanceInfo } = action;
            let tempPatientList = { ...state };
            tempPatientList.patientQueueDto = attendanceInfo;
            return tempPatientList;
        }
        case types.PUT_SEARCH_IN_PATIENT_QUEUE: {
            return { ...state, patientQueueList: action.data, searchNextAction: action.data.nextActionPage };
        }
        default:
            return { ...state };
    }
};
