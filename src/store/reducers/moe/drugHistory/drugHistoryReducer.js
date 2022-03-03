import * as moeActionTypes from '../../../actions/moe/moeActionType';
import {
    defaultTypeVal,
    defaultPeriodVal
} from '../../../../enums/moe/drugHistoryEnum';

const inital_state = {
    drugHistoryList: [],

    prescType: defaultTypeVal,
    withinMonths: defaultPeriodVal,

    //free text dialog
    open: false,
    newData: [],
    freeTextData: []
};

export default (state, action) => {
    if (!state) state = inital_state;
    switch (action.type) {
        case moeActionTypes.UPDATE_DRUG_HISTORY_FIELD: {
            let lastState = { ...state };
            for (let m in action.updateData) {
                lastState[m] = action.updateData[m];
            }
            return lastState;
        }
        case moeActionTypes.RESET_DRUG_LIST: {
            // return {
            //     ...state,
            //     drugHistoryList: [],
            //     prescType: defaultTypeVal,
            //     withinMonths: defaultPeriodVal,
            //     open: false,
            //     newData: [],
            //     freeTextData: []
            // };
            return inital_state;
        }
        default: return state;
    }
};