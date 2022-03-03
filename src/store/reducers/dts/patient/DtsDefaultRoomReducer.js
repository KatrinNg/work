import * as types from '../../../actions/dts/patient/DtsDefaultRoomActionType';
import _ from 'lodash';

const INITIAL_STATE = {
    defaultRoomList: [],
    defaultRoomLogList: [],
    dialogOpen: false,
    dialogName: '',
    dialogViewLogOpen: false,
    dialogViewLogName: '',
    currentSelectedId: '',
    activeOnly: true,
    dialogInfo: {
        defaultRoomId: null,
        patientKey: '',
        specialtyId: '',
        roomId: '',
        isReferral: 0,
        isReferralDisabled: true,
        isDischarged: 0,
        isDischargedDisabled: true,
        version: null,
        status: '',
        originalRecordId: null
    }
};

export default (state = _.cloneDeep(INITIAL_STATE), action = {}) => {
    switch (action.type) {
        case types.RESET_ALL: {
            return _.cloneDeep(INITIAL_STATE);
        }
        case types.RESET_DIALOGINFO: {
            let dialogInfo = {
                defaultRoomId: null,
                patientKey: '',
                specialtyId: '',
                roomId: '',
                isReferral: 0,
                isReferralDisabled: true,
                isDischarged: 0,
                isDischargedDisabled: true,
                version: null,
                status: '',
                originalRecordId: null
            };
            return { ...state, dialogInfo: dialogInfo };
        }
        case types.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
            // let lastAction = { ...state };
            // for (let p in action.updateData) {
            //     lastAction[p] = action.updateData[p];
            // }
            // return lastAction;
        }
        default: {
            return state;
        }
    }
};
