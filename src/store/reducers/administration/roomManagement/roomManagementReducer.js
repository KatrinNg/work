import _ from 'lodash';
import { PAGE_STATUS } from '../../../../enums/administration/roomManagement/roomManagementEnum';
import * as types from '../../../actions/administration/roomManagement/roomManagementActions';
// import { initNewRoom } from '../../../../utilities/administrationUtilities';
import { initRoom } from '../../../../constants/administration/administrationConstants';
import {isActiveEnctType} from '../../../../utilities/enctrAndRoomUtil';

const initState = {
    rooms: null,
    pageStatus: PAGE_STATUS.VIEWING,
    steps: ['General', 'Encounter Type Assignment'],
    activeStep: 0,
    roomGeneralData: {
        originalInfo: null,
        changingInfo: initRoom
    },
    availList: [],
    assignedList: [],
    searchAvailVal: '',
    searchAssignedVal: '',
    availIdx: null,
    assginedIdx: null,
    selectedRoom: [],
    doCloseCallbackFunc: null
};


export default (state = _.cloneDeep(initState), action = {}) => {
    switch (action.type) {
        case types.RESET_ALL: {
            return _.cloneDeep(initState);
        }
        case types.RESET_ROOM_DATA: {
            let _roomGeneralData = {
                originalInfo: null,
                changingInfo: initRoom
            };
            return {
                ...state,
                pageStatus: PAGE_STATUS.VIEWING,
                activeStep: 0,
                roomGeneralData: _roomGeneralData,
                availList: [],
                assignedList: [],
                searchAvailVal: '',
                searchAssignedVal: '',
                availIdx: null,
                assginedIdx: null,
                selectedRoom: []
            };
        }
        case types.UPDATE_STATE: {
            return { ...state, ...action.updateData };
        }
        case types.PUT_ENCT_LIST: {
            return {
                ...state,
                availList: action.availList
            };
        }
        case types.PUT_ROOMS: {
            return {
                ...state,
                rooms: action.rooms
            };
        }
        case types.LOAD_ROOM_DATA: {
            const { room } = action;
            let _roomGeneralData = {
                originalInfo: _.cloneDeep(room),
                changingInfo: _.cloneDeep(room)
            };
            let assignedList = _.cloneDeep(room.encntrTypeList || []);
            assignedList=assignedList.filter(item=>isActiveEnctType(item));
            assignedList = assignedList.map(item => {
                return {
                    ...item,
                    displayStr: `[${item.encntrTypeCd}] ${item.encntrTypeDesc}`
                };
            });
            return {
                ...state,
                roomGeneralData: _roomGeneralData,
                pageStatus: PAGE_STATUS.EDITING,
                assignedList
            };
        }
        default:
            return { ...state };
    }
};
