import * as genSlotActionType from '../../../actions/appointment/generateTimeSlot';
import moment from 'moment';

const timeslotState = {
    fromDate: moment(),
    toDate: moment(),
    selectedTempDto: null,
    roomId: null,
    slotTempList: [],
    selectedTempDetails: [],
    dateRangeLimit:365
};

export default (state = timeslotState, action = {}) => {
    switch (action.type) {
        case genSlotActionType.RESET_ALL: {
            return {
                ...timeslotState,
                fromDate: moment(),
                toDate: moment(),
                slotTempList: [],
                selectedTempDetails: []
            };
        }

        case genSlotActionType.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }

        case genSlotActionType.PUT_TEMPLATE_DATA: {
            return {
                ...state,
                selectedTempDetails: [],
                slotTempList: action.data
            };
        }

        default: {
            return state;
        }

    }
};