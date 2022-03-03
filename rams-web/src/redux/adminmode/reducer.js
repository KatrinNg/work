import * as ActionTypes from 'redux/actionTypes';
import { produce } from 'utility/utils';
import * as mockData from 'pages/adminMode/protocol/mockData';

const initState = {
    hotList: [],
    hotList_treatment_name:[],
    groupList: [],
    categoryGroupList:[],
    vitalSignTypeList: {},
    weightBearingStatus1List: [],
    weightBearingStatus2List: [],
    protocolList: [],
    categoryList: [],
    positionList: [],
    sideList: [],
    regionList: [],
    setList: [],
    repetitionList: [],
    resistanceList: [],
    resistanceUnitList: [],
    walkingAidsList: [],
    assistiveDevice1List: [],
    assistiveDevice2List: [],
    assistanceList: [],
    durationList: [],
    protocolOTData: [],
    activityListByRoom: [],
    roomList: [],
};

const reducer = (state = initState, action = null) => {
    switch (action.type) {
        case ActionTypes.SET_ADMINMODE_DATA:
            const newState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState;
        /* case ActionTypes.SET_HOTLIST_DATA:
            const newState = produce(state, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return newState; */
        case ActionTypes.SET_GROUPLIST_DATA:
            const groupList = state.groupList;
            const newGroupState = produce(groupList, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return { ...state, groupList: newGroupState.groupList };
        case ActionTypes.SET_VITALSIGNTYPELIST_DATA:
            const vitalSignTypeList = state.vitalSignTypeList;
            const newVitalSignTypeState = produce(vitalSignTypeList, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return { ...state, vitalSignTypeList: newVitalSignTypeState.vitalSignTypeList };
        case ActionTypes.SET_SIDELIST_DATA:
            const sideList = state.sideList;
            const newSideState = produce(sideList, (draft) => {
                Object.entries(action.payload).forEach(([key, value]) => {
                    draft[key] = action.payload[key];
                });
            });
            return { ...state, sideList: newSideState.sideList };
        default:
            return state;
    }
};

export default reducer;
