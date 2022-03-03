import * as types from '../../actions/ehs/ehsSpaControlActionType';
import { openEhsPrintApptListDialog, searchPatients, updateState } from '../../actions/ehs/ehsSpaControlAction';
import Enum from '../../../enums/enum';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import {
    addTabs,
    skipTab,
    changeTabsActive,
    deleteTabs,
    updateTabs,
    updateField as mainFrameUpdateField,
    cleanSubTabs
} from '../../actions/mainFrame/mainFrameAction';
import { getPatientEncounter, getPatientById, resetAll as patientResetAll } from '../../actions/patient/patientAction';
import { handleBeforeOpenPatientPanel } from '../../../utilities/commonUtilities';
import { updateState as updateAnonBookingState } from '../../../store/actions/appointment/booking/bookingAnonymousAction';
import { updateState as updateBookingState } from '../../../store/actions/appointment/booking/bookingAction';

const INITAL_STATE = {
    ehsStagingId: null,
    isLinkPmi: false,
    isEnrollNewReg: false,
    isOpenSearchPmiPopup: false,
    patientList: [],
    updateState: updateState,
    searchPatients: searchPatients,
    searchType: Enum.DOC_TYPE.HKID_ID,
    searchValue: '',
    patientSearchParam: {
        searchType: Enum.DOC_TYPE.HKID_ID,
        searchValue: ''
    },
    handleOnCloseEhsStagingDialog: null,
    doCloseFuncSrc: doCloseFuncSrc,
    changeTabsActive: changeTabsActive,
    updateTabs: updateTabs,
    deleteTabs: deleteTabs,
    addTabs: addTabs,
    skipTab: skipTab,
    mainFrameUpdateField: mainFrameUpdateField,
    getPatientEncounter: getPatientEncounter,
    getPatientById: getPatientById,
    handleBeforeOpenPatientPanel: handleBeforeOpenPatientPanel,
    updateAnonBookingState: updateAnonBookingState,
    updateBookingState: updateBookingState,
    cleanSubTabs: cleanSubTabs,
    patientResetAll: patientResetAll,
    isOpenEhsPrintApptListDialog: false,
    ehsApptListReportData: null,
    openEhsPrintApptListDialog: openEhsPrintApptListDialog
};

export default (state = INITAL_STATE, action = {}) => {
    switch (action.type) {
        case types.RESET: {
            return {
                ...INITAL_STATE
            };
        }
        case types.UPDATE_STATE: {
            return {
                ...state,
                ...action.newState
            };
        }
        case types.CLOSE_EHS_PMI_SEARCH_DIALOG: {
            return {
                ...INITAL_STATE
            };
        }
        case types.OPEN_EHS_PRINT_APPT_LIST_DIALOG: {
            return {
                ...state,
                isOpenEhsPrintApptListDialog: true,
                ehsApptListReportData: action.ehsApptListReportData
            };
        }
        case types.CLOSE_EHS_PRINT_APPT_LIST_DIALOG: {
            return {
                ...state,
                isOpenEhsPrintApptListDialog: false,
                ehsApptListReportData: null
            };
        }
        default:
            return { ...state };
    }
};
