import * as sessionManagementActionType from '../../../actions/administration/sessionManagement/sessionManagementActionType';

const initState = {
    dialogOpen: false,
    dialogAction: '',
    records: [],
    updatingRecords: []
    // dialogWeekdayOpen: false,
    // timeslotPlanHdrs: [],
    // tmsltPlanHdrId: 0,
    // tmsltPlanHdr: null,
    // tmsltPlanWeekday: null,
    // timeslotPlans: [],
    // otherTimeslotPlans: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case sessionManagementActionType.UPDATE_STATE: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case sessionManagementActionType.GET_SESSIONS_OF_SERVICE: {
            return {
                ...state,
                records: action.data
            };
        }

        case sessionManagementActionType.GET_SESSIONS_OF_SITE: {
            return {
                ...state,
                records: action.data
            };
        }

        case sessionManagementActionType.GET_SINGLE_SESSIONS_BY_ID: {
            return {
                ...state,
                updatingRecords: action.data
            };
        }

        case sessionManagementActionType.PUSH_SESSION_OF_SERVICE: {
            let data = action.data;

            data.siteId = data.siteId.siteId;
            data.svcCd = data.svcCd.svcCd;

            const joinedData = state.records.concat(data);

            return {
                ...state,
                records: joinedData
            };
        }

        case sessionManagementActionType.PUSH_SESSION_OF_SITE: {
            let data = action.data;

            data.siteId = data.siteId.siteId;
            data.svcCd = data.svcCd.svcCd;

            const joinedData = state.records.concat(data);

            return {
                ...state,
                records: joinedData
            };
        }

        case sessionManagementActionType.PUSH_SINGLE_SESSIONS_TO_UPDATING_SESSION: {
            return {
                ...state,
                updatingRecords: action.data
            };
        }

        case sessionManagementActionType.CLOSE_SESSION_MANAGEMENT_DIALOG: {
            return {
                ...state,
                dialogOpen: false,
                dialogAction: '',
                updatingRecords: []
            };
        }

        // case sessionManagementActionType.RESET_ALL: {
        //     return {
        //         ...initState
        //     };
        // }

        // case sessionManagementActionType.PUT_LIST_TIMESLOT_PLAN_HDR: {
        //     return{
        //         ...state,
        //         sessionManagementHdrs: action.data
        //     };
        // }

        // case sessionManagementActionType.PUT_TIMESLOT_PLAN: {
        //     return{
        //         ...state,
        //         sessionManagementHdr: action.data
        //     };
        // }

        // case sessionManagementActionType.PUT_TIMESLOT_PLAN_WEEKDAY: {
        //     return{
        //         ...state,
        //         sessionManagement: action.data
        //     };
        // }

        // case sessionManagementActionType.PUT_OTHER_TIMESLOT_PLAN_WEEKDAY: {
        //     return{
        //         ...state,
        //         otherSessionManagement: action.data
        //     };
        // }

        // case sessionManagementActionType.CLOSE_TIMESLOT_PLAN_HDR_DIALOG: {
        //     return {
        //         ...state,
        //         dialogOpen: false,
        //         dialogAction: '',
        //         tmsltPlanHdrId: 0,
        //         tmsltPlanHdr: null
        //     };
        // }

        // case sessionManagementActionType.CLOSE_TIMESLOT_PLAN_DIALOG: {
        //     return {
        //         ...state,
        //         dialogWeekdayOpen: false,
        //         tmsltPlanHdrId: 0,
        //         tmsltPlanHdr: null,
        //         tmsltPlanWeekday: null,
        //         timeslotPlans: [],
        //         otherTimeslotPlans: null
        //     };
        // }

        default: {
            return state;
        }
    }
};