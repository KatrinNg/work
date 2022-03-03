import _ from 'lodash';
import * as types from '../../../actions/administration/apptSlipRemarks/apptSlipRemarksActionType';

const INITAL_STATE = {};

export default (state = _.cloneDeep(INITAL_STATE), action = {}) => {
    switch (action.type) {
        case types.RESET_ALL: {
            return _.cloneDeep(INITAL_STATE);
        }
        case types.PUT_APPTSLIPREMARKS_LIST: {
            let apptSlipRemarksList = _.cloneDeep(action.apptSlipRemarksList);
            return {
                ...state,
                apptSlipRemarksList: apptSlipRemarksList
            };
        }
        case types.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        default: {
            return { ...state };
        }
    }
};