import * as type from '../../../actions/appointment/timeslotManagementV2/timeslotManagementV2ActionType';

const INSTAL_STATE = {
    loadingTimeslotPlanHdrs: false,
    timeslotPlanHdrs: [],
    loadingTimeslotPlans: false,
    timeslotPlans: [],
    loadingPredefinedTimeslots: false,
    predefinedTimeslots: []
};

export default (state = INSTAL_STATE, action = {}) => {
    switch (action.type) {
        case type.RESET: {
            return { ...INSTAL_STATE };
        }
        case type.UPDATE_STATE: {
            return {
                ...state,
                ...action.newState
            };
        }
        default:
            return state;
    }
};
