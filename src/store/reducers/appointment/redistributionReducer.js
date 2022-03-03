import * as redistributionType from '../../actions/appointment/redistribution/redistributionAction';

const initState = {
    roomUtilizationData: null,
    fromSearchCriteria: {
        date: null,
        room: null,
        session: null
    },
    toSearchCriteria: {
        date: null,
        room: null,
        session: null
    },
    fromOriginalData: null,
    toOriginalData: null,
    fromTargetData: null,
    toTargetData: null,
    fromSelected: [],
    toSelected: [],
    redistributionMismatch: {
        open: false,
        misMatchList: []
    },
    redistributionFailure: {
        open: false,
        failureList: [],
        callback: null
    },
    doCloseCallBack: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case redistributionType.RESET_ALL: {
            return { ...initState };
        }
        case redistributionType.RESET_APPT_DETAILS: {
            return { ...initState, roomUtilizationData: state.roomUtilizationData };
        }
        case redistributionType.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }
        default: {
            return state;
        }
    }
};