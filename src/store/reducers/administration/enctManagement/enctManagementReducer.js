import * as enctActionType from '../../../actions/administration/enctManagement';
import { PAGE_STATUS } from '../../../../enums/administration/enctManagement';
import * as AdminUtil from '../../../../utilities/administrationUtilities';

const initState = {
    pageStatus: PAGE_STATUS.VIEWING,
    steps: ['General', 'Room Assignment'],
    activeStep: 0,
    enctList: {
        selected: [],
        encounterTypelist: []
    },
    enctDetailGeneral: {
        originalInfo: null,
        changingInfo: AdminUtil.initNewEnct()
    },
    enctDetailRoom: {
        searchAvailableVal: null,
        searchSelectedVal: null,
        availableList: [],
        selectedList: [],
        availableIndex: '',
        selectedIndex: ''
    },
    doCloseCallbackFunc: null
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case enctActionType.RESET_ALL: {
            return { ...initState };
        }
        case enctActionType.UPDATE_STATE: {
            return { ...state, ...action.updateData };
        }
        case enctActionType.UPDATE_ENCT_LIST: {
            return {
                ...state,
                enctList: {
                    ...state.enctList,
                    encounterTypelist: action.data
                }
            };
        }
        case enctActionType.INIT_ENCT_INFO: {
            return {
                ...state,
                enctDetailGeneral: {
                    ...state.enctDetailGeneral,
                    originalInfo: action.originalInfo,
                    changingInfo: action.changingInfo
                },
                enctDetailRoom: {
                    ...state.enctDetailRoom,
                    selectedList: action.enctSelectedRoom
                }
            };
        }
        case enctActionType.LOAD_ROOMS: {
            return {
                ...state,
                enctDetailRoom: {
                    ...state.enctDetailRoom,
                    selectedList: action.selectedList,
                    availableList: action.availableList
                }
            };
        }
        default:
            return state;

    }
};