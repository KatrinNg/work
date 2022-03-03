import *as type from '../../../actions/appointment/apptEnquiry/apptEnquiryActionType';
import moment from 'moment';
import ApptEnum from '../../../../views/appointment/appointmentEnquiry/enum/apptEnquiryEnum';

function getInitalState() {
    return {
        criteria: {
            serviceCd: null,
            type: ApptEnum.APPT_TYPE.APPT_LIST,
            clinicCd: null,
            encounterCd: '*All',
            subEncounterCd: '*All',
            dateFrom: moment(),
            dateTo: moment(),
            status: '*All',
            remarkCd: null
        },
        enquiryResult: []
        // encounterTypeList: []
    };
}

const INITAL_STATE = getInitalState();

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case type.RESET_ALL: {
            let initState = getInitalState();
            initState.criteria.dateFrom=moment();
            initState.criteria.dateTo=moment();
            return { ...initState };
        }

        case type.UPDATE_FIELD: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case type.LOAD_ENQUIRY_RESULT: {
            let { result } = action;
            return {
                ...state,
                enquiryResult: result
            };
        }

        default: {
            return state;
        }
    }
};

