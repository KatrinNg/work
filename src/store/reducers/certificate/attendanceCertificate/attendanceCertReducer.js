import * as type from '../../../actions/certificate/attendanceCertificate/attendanceCertActionType';
import _ from 'lodash';

const initState = {
    reportData: null,
    handlingPrint: false,
    attendanceCertList: null,
    closeTabFunc: null
};
export default (state = initState, action = {}) => {
    switch (action.type) {
        case type.PUT_ATTENDANCE_CERT: {
            return {
                reportData: action.data,
                ...state
            };
        }

        case type.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case type.PUT_LIST_ATTENDANCE_CERTIFICATES: {
            return {
                ...state,
                attendanceCertList: action.data.filter(item => item.status === 'A')
            };
        }

        case type.RESET_ALL: {
            return _.cloneDeep(initState);
        }

        default:
            return state;
    }
};
