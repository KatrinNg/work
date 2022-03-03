import * as editTimeSlotActionType from '../../../actions/appointment/editTimeSlot/editTimeSlotActionType';
import moment from 'moment';
import { EnctrAndRmUtil } from '../../../../utilities';

const initState = {
    dateFrom: moment(),
    dateTo: moment(),
    encounterTypeCd: '',
    subEncounterTypeCd: '',
    page: 1,
    pageSize: 10,
    encounterCodeList: [],
    subEncounterCodeList: [],
    selectedItems: [],
    timeslotList: {},
    dialogOpen: false,
    dialogName: '',
    multipleUpdateFinish: false,
    multipleUpdateData: null,
    multipleUpdateForm: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case editTimeSlotActionType.RESET_ALL: {
            const initEncounter = EnctrAndRmUtil.get_init_encounter(state.encounterCodeList);
            return {
                ...initState,
                encounterCodeList: initEncounter.encounterTypeList,
                subEncounterCodeList: initEncounter.subEncounterTypeList,
                encounterTypeCd: initEncounter.encounterTypeCd,
                subEncounterTypeCd: initEncounter.subEncounterTypeCd,
                dateFrom: moment(),
                dateTo: moment()
            };
        }

        case editTimeSlotActionType.INIT_CODE_LIST: {
            const initEncounter = EnctrAndRmUtil.get_init_encounter(action.encounterTypeList);
            return {
                ...state,
                encounterCodeList: initEncounter.encounterTypeList,
                subEncounterCodeList: initEncounter.subEncounterTypeList,
                encounterTypeCd: initEncounter.encounterTypeCd,
                subEncounterTypeCd: initEncounter.subEncounterTypeCd
            };
        }

        case editTimeSlotActionType.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }

        case editTimeSlotActionType.PUT_LIST_TIME_SLOT: {
            return{
                ...state,
                timeslotList: action.data
            };
        }

        case editTimeSlotActionType.PUT_MULTIPLE_UPDATE: {
            return {
                ...state,
                multipleUpdateFinish: true,
                multipleUpdateData: action.data,
                multipleUpdateForm: action.updateParams
            };
        }

        default: {
            return state;
        }
    }
};