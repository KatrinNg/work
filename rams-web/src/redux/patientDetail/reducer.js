import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';
import {
    positionList, categoryList, sideList, durationList,
    assistanceList, walkingAidsList, wheelchairList,
    assistiveDeviceList, weightBearingStatusList, resistanceList,
    setList, repetitionList, regionList
} from 'pages/patientDetail/mockData';

export const NAME = 'patientDetail';

const initState = {
    case_no: 'HN06000037Z',
    protocolList: [],
    protocolValue: '',
    treatmentChange: false,
    roomChange: false,
    treatmentActivitiesLists: {
        positionList: [],
        categoryList: [],
        sideList: [],
        durationList: [],
        assistanceList: [],
        walkingAidsList: [],
        assistiveDeviceList: [],
        weightBearingStatusList: [],
        resistanceList: [],
        setList: [],
        repetitionList: [],
        regionList: [],
    },
    wheelchairList: wheelchairList,
    treatmentActivities: [],
    patientDetailsType: 'PT',
    patientDetailsPT:{
        caseNumber:'HN05000248U',
        room: '',
        therapist: 'J2KMED',
        patientConditions: '',
        status: 'Active',
        o2:'',
        cardiacRisk: false,
        remarks: '',
    },
    patientDetailsOT:{
        caseNumber:'HN05000248U',
        room: '',
        therapist: 'J2KMED',
        patientConditions: '',
        status: 'Active',
        o2:'',
        fallRisk: false,
        remarks: '',
        wheelchair: '',
        assistiveDevice1: '',
        assistiveDevice2: '',
        weightBearingStatus1: '',
        weightBearingStatus2: '',
    },
    patientDetail: {},
    roomList: [],
    precautionList: [],
    therapistList: [],
    statusList: [{
        value: 'ACTIVE',
        name: 'Active',
    }, {
        value: 'INACTIVE',
        name: 'Inactive',
    }],
    patientConditionsList: [],
    o2List: [],
    assistiveDeviceList1: [],
    assistiveDeviceList2: [],
    weightBearingStatusList1: [],
    weightBearingStatusList2: [],
    masterHealthRef: {},
    therapeuticGroupList: {},
    selectedTherapeuticGroup: []
};

const patientDetail = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_PATIENT_DETAIL:
            const newState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });

            return newState;
        case ActionTypes.SET_PATIENT_DETAILS_BASIC:
            const patientDetails = state.patientDetail
            const newPatientDetail = produce(patientDetails, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return {...state,patientDetail:newPatientDetail};
        case ActionTypes.SWITCH_PATIENT_DETAILS_TYPE:
            const updatePatientDetailsTypeState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    console.log(draft,"draft")
                    draft[key] = action.payload[key];
                });
            });
            return updatePatientDetailsTypeState;
        default:
            return state;
    }
}

export default patientDetail;