import * as redesignBookingActionType from '../../../actions/appointment/booking/redesignBookingActionType';
import _ from 'lodash';
import { BookMeans } from '../../../../enums/appointment/booking/bookingEnum';
import { redesignInitBookingData } from '../../../../constants/appointment/bookingInformation/redesignBookingInformationConstants';

const initState = {
    timeSlotList: {},
    clinicList: [],
    bookingData: _.cloneDeep(redesignInitBookingData),
    bookingDataBackup: null,
    bookTimeSlotData: null,
    defaultEncounterCd: null,
    remarkCodeList: [],
    confirmData: [],
    defaultCaseTypeCd: 'N',
    isEnableCrossBookClinic: false,
    appointmentMode: BookMeans.SINGLE,
    bookConfirmSelected: -1, //bookConfirm dialog selected timeSlot
    contactList: []
};

export const redesignBookingInformation = (state = initState, action = {}) => {
    switch (action.type) {
        case redesignBookingActionType.RESET_INFO_ALL: {
            let bookingData = _.cloneDeep(redesignInitBookingData);
            return {
                ...initState,
                bookingData: bookingData
            };
        }

        case redesignBookingActionType.REDESIGN_PUT_LIST_REMARK_CODE: {
            let { remarkCodeList } = action;
            return {
                ...state,
                remarkCodeList: remarkCodeList
            };
        }
        default: {
            return state;
        }

    }
};