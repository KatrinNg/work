import * as timeslotType from '../../../actions/appointment/editTimeSlot';
import _ from 'lodash';
import moment from 'moment';

const INSTAL_STATE = {
    dateFrom: moment(),
    dateTo: moment(),
    timeslotList: [],
    dialogOpen: false,
    dialogName: '',
    roomCd: '',
    currentSelectedId: '',
    dialogInfo: {
        dialogRoomCd: '',
        dialogDate: moment(),
        overallQt: '',
        startTime: null,
        endTime: null,
        sessId: '',
        version: null,
        qt1: '',
        qt2: '',
        qt3: '',
        qt4: '',
        qt5: '',
        qt6: '',
        qt7: '',
        qt8: '',
        qt1Booked: '',
        qt2Booked: '',
        qt3Booked: '',
        qt4Booked: '',
        qt5Booked: '',
        qt6Booked: '',
        qt7Booked: '',
        qt8Booked: ''
    },
    dateRangeLimit: 365
};

export default (state = INSTAL_STATE, action = {}) => {
    switch (action.type) {
        case timeslotType.RESET_ALL: {
            return { ...INSTAL_STATE };
        }
        case timeslotType.RESET_DIALOGINFO: {
            let dialogInfo = {
                dialogRoomCd: '',
                dialogDate: moment(),
                overallQuota: '',
                startTime: null,
                endTime: null,
                sessId: '',
                version: null,
                qt1: '',
                qt2: '',
                qt3: '',
                qt4: '',
                qt5: '',
                qt6: '',
                qt7: '',
                qt8: '',
                qt1Booked: '',
                qt2Booked: '',
                qt3Booked: '',
                qt4Booked: '',
                qt5Booked: '',
                qt6Booked: '',
                qt7Booked: '',
                qt8Booked: ''
            };
            return { ...state, dialogInfo: dialogInfo };
        }
        case timeslotType.UPDATE_STATE: {
            return { ...state, ...action.updateData };
        }
        case timeslotType.PUT_LIST_TIME_SLOT: {
            return { ...state, timeslotList: _.cloneDeep(action.data) };
        }
        default: return state;
    }
};