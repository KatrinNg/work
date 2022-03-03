import * as timeslotPlanActionType from '../../../actions/appointment/timeslotPlan/timeslotPlanActionType';

const initState = {
    dialogOpen: false,
    dialogAction: '',
    dialogWeekdayOpen: false,
    timeslotPlanHdrs: [],
    tmsltPlanHdrId: 0,
    tmsltPlanHdr: null,
    tmsltPlanWeekday: null,
    timeslotPlans: [],
    otherTimeslotPlans: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case timeslotPlanActionType.RESET_ALL: {
            return {
                ...initState
            };
        }

        case timeslotPlanActionType.UPDATE_STATE: {
            let lastAction = {...state};
            for(let p in action.updateData){
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case timeslotPlanActionType.PUT_LIST_TIMESLOT_PLAN_HDR: {
            return{
                ...state,
                timeslotPlanHdrs: action.data
            };
        }

        case timeslotPlanActionType.PUT_TIMESLOT_PLAN: {
            return{
                ...state,
                tmsltPlanHdr: action.data
            };
        }

        case timeslotPlanActionType.PUT_TIMESLOT_PLAN_WEEKDAY: {
            return{
                ...state,
                timeslotPlans: action.data
            };
        }

        case timeslotPlanActionType.PUT_OTHER_TIMESLOT_PLAN_WEEKDAY: {
            return{
                ...state,
                otherTimeslotPlans: action.data
            };
        }

        case timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_HDR_DIALOG: {
            return {
                ...state,
                dialogOpen: false,
                dialogAction: '',
                tmsltPlanHdrId: 0,
                tmsltPlanHdr: null
            };
        }

        case timeslotPlanActionType.CLOSE_TIMESLOT_PLAN_DIALOG: {
            return {
                ...state,
                dialogWeekdayOpen: false,
                tmsltPlanHdrId: 0,
                tmsltPlanHdr: null,
                tmsltPlanWeekday: null,
                timeslotPlans: [],
                otherTimeslotPlans: null
            };
        }

        default: {
            return state;
        }
    }
};