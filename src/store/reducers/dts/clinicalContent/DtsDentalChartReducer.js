import * as types from '../../../actions/dts/clinicalContent/DtsDentalChartActionType';
import _ from 'lodash';

const INITIAL_STATE = {
    dentalChartList:[],
    dentalChartData:[],
    specialties: [],
    dialogOpen: false,
    dialogName: '',
    currentSelectedId: '',
    dialogInfo: {
        defaultRoomId: 0,
        patientKey: '',
        specialtyId: '',
        roomId: '',
        isReferral: 0,
        isReferralDisabled: true,
        isDischarged: 0,
        isDischargedDisabled: true,
        version: null
    }
};

export default (state = _.cloneDeep(INITIAL_STATE), action = {}) => {
    switch (action.type) {
        case types.RESET_ALL: {
            return _.cloneDeep({ INITIAL_STATE });
        }
        case types.RESET_DIALOGINFO: {
            let dialogInfo = {
                defaultRoomId: 0,
                patientKey: '',
                specialtyId: '',
                roomId: '',
                isReferral: 0,
                isReferralDisabled: true,
                isDischarged: 0,
                isDischargedDisabled: true,
                version: null
            };
            return { ...state, dialogInfo: dialogInfo };
        }
        case types.UPDATE_STATE: {
            //console.log('Info4: ' + action.updateData);
            return {
                ...state,
                ...action.updateData
            };
        }
        case types.SET_REMARK: {
            let lastAction = {...state};
            lastAction.dentalChartData = action.params;
            return lastAction;
        }
        case types.SET_DSP_TOOTH: {
            let lastAction = {...state};
            lastAction.dentalChartData = action.params;
            return lastAction;
        }
        default:
            return state;
    }
};
