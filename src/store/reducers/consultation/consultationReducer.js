import moment from 'moment';
import * as type from '../../actions/consultation/consultationActionType';
import Enum from '../../../enums/enum';

const initState = {
    searchParameter: {
        dateFrom: moment(),
        dateTo: moment(),
        attnStatusCd: '',
        encounterTypeCd: '',
        subEncounterTypeCd: '',
        patientKey: '',
        type: Enum.LANDING_PAGE.CONSULTATION,
        page: 1,
        pageSize: 10
    },
    patientQueueList: []
};
export default (state = initState, action = {}) => {
    switch (action.type) {
        case type.RESET_ALL: {
            let parameter = {
                dateFrom: moment(),
                dateTo: moment(),
                attnStatusCd: '',
                encounterTypeCd: '',
                subEncounterTypeCd: '',
                type: Enum.LANDING_PAGE.CONSULTATION,
                page: 1,
                pageSize: 10
            };
            return {
                ...initState,
                searchParameter: parameter
            };
        }

        case type.UPDATE_STATE: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case type.PUT_PATIENT_QUEUE: {
            return {
                ...state,
                patientQueueList: action.data
            };
        }

        default:
            return state;
    }
};
