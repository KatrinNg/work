
import * as moeActionTypes from '../../../actions/moe/moeActionType';

const inital_state = {
    deptFavouriteList: [],
    orginalDeptFavouriteList: []
};

export default (state, action) => {
    if (!state) state = inital_state;
    switch (action.type) {
        case moeActionTypes.UPDATE_DEPT_FAVOURITE_FIELD: {
            let lastState = { ...state };
            for (let m in action.updateData) {
                lastState[m] = action.updateData[m];
            }
            return lastState;
        }
        case moeActionTypes.RESET_DRUG_LIST: {
            return inital_state;
        }
        default: return state;
    }
};