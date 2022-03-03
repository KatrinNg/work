import * as eHRActionType from '../../actions/EHR/eHRActionType';
import _ from 'lodash';
import { patientBasic } from '../../../constants/registration/registrationConstants';

const initState = {
    participantList: [],
    patientById: _.cloneDeep(patientBasic),
    openEHRIdentityDialog: false,
    updateFromEHRDate: false,
    keepEHRState: false
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case eHRActionType.RESET_ALL: {
            return {
                ...initState
            };
        }
        case eHRActionType.KEEP_EHR_STATE: {
            return {
                ...state,
                keepEHRState: true
            };
        }
        case eHRActionType.OPEN_EHR_IDENTITY_DIALOG: {
            return {
                ...state,
                openEHRIdentityDialog: true
            };
        }
        case eHRActionType.GET_FROM_EHR_DATE: {
            return {
                ...state,
                updateFromEHRDate: action.value
            };
        }
        case eHRActionType.PUT_EHR_EPMI: {
            return {
                ...state,
                participantList: action.participantList,
                openEHRIdentityDialog: action.openEHRIdentityDialog
            };
        }
        case eHRActionType.PUT_PATINET_BY_ID: {
            return {
                ...state,
                patientById: []
            };
        }
        case eHRActionType.CLOSE_EHR_IDENTITY_DIALOG: {
            return {
                ...state,
                participantList: [],
                openEHRIdentityDialog: false
            };
        }
        default:
            return state;
    }
};