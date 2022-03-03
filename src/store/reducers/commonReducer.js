import * as types from '../actions/common/commonActionType';
import * as actions from '../actions/common/commonAction';
import * as commonUtilities from '../../utilities/commonUtilities';
// import * as LoginActionTypes from '../actions/Login/LoginActionType';
import {
    mapClinicConfig,
    mapClinicList,
    // mapEncounterTypeList,
    mapRoomList,
    mapServiceList
} from '../../utilities/apiMappers';
import _ from 'lodash';
import * as ParentTypes from '../actions/types';

export const initState = {
    roomsEncounterList: [],
    encounterTypeList: [],
    encounterTypes: [],
    quotaConfig: [],
    sessionsConfig: [],
    clnDefaultRmConfig: [],
    serviceSessionsConfig: [],
    rooms: [],
    roomList: [],
    serviceList: [],
    // new api service
    // svcInfo: [],
    clinicList: [],
    // new api site
    // siteInfo: [],
    commonCodeList: {},
    //spa
    spaList: [],
    openCleanMask: false,
    //common error dialog
    openErrorDialog: false,
    errorMessage: '',
    errorData: [],
    errorTitle: '',
    //common circular
    openCommonCircular: false,
    isOpenCommonCircularList: [],
    //searchBar
    searchBarValue: '',
    keepDataSelected: false,
    //snackbar
    warnSnackbarStatus: false,
    warnSnackbarMessage: '',
    //clinic config
    clinicConfig: !sessionStorage.getItem('clinicConfig') ? {} : JSON.parse(sessionStorage.getItem('clinicConfig')),
    // new api siteParams
    siteParams: !sessionStorage.getItem('siteParams') ? {} : JSON.parse(sessionStorage.getItem('siteParams')),
    //list config
    listConfig: !sessionStorage.getItem('listConfig') ? {} : JSON.parse(sessionStorage.getItem('listConfig')),
    //workstation params
    workstationParams: !sessionStorage.getItem('workstationParams') ? [] : JSON.parse(sessionStorage.getItem('workstationParams')),
    //prompt
    openPrompt: false,
    openCommonCircularDialog: false,
    openIdleDialog: false,
    group: [],
    hospital: [],
    specialty: [],
    patSearchTypeList: null,
    loginUserRoleList:[],
    passportList: null,
    deleteReasonsList: [],
    specReqTypesList: [],
    outDocumentTypes: [],
    inOutDocTypeList: null,
    spaFunc: {},
    spaRcp: {
        rcpMachine: null,
        hasGenDayEndRpt: false,
        isMacViewOnly:false
    },
    parentTypes: ParentTypes,
    goPrint:null,
    ehsTeamSiteList: [],
    openCommonClinicalDocument: false,
    commonClinicalDocumentParams: {}
};
export default (state = initState, action = {}) => {
    switch (action.type) {
        case types.ENCOUNTER_TYPE_LIST: {
            return { ...state, encounterTypeList: action.data };
            // return { ...state, encounterTypeList: mapEncounterTypeList(action.data, action.loginServiceCd, action.loginClinicCd) };
        }
        case types.ROOMS_ENCOUNTER_TYPE_LIST: {
            return { ...state, roomsEncounterList: action.data };
        }
        case types.SAVE_CMN_IN_OUT_DOC_TYPE: {
            return { ...state, inOutDocTypeList: action.data };
        }
        case types.SET_ENCOUNTER_TYPES: {
            return { ...state, encounterTypes: action.data };
        }
        case types.SET_QUOTA_TYPES: {
            return { ...state, quotaConfig: action.data };
        }
        case types.SET_SESSIONS: {
            return { ...state, sessionsConfig: action.data };
        }
        case types.SET_DEFAULT_ROOM_CONFIG: {
            return { ...state, clnDefaultRmConfig: action.data };
        }
        case types.SET_SERVICE_SESSIONS: {
            return { ...state, serviceSessionsConfig: action.data };
        }
        case types.SET_ROOMS: {
            let roomData = _.cloneDeep(action.data);
            return { ...state, rooms: action.data, roomList: mapRoomList(roomData) };
        }
        case types.PUT_LIST_SERVICE: {
            // return { ...state, serviceList: action.serviceList };
            // return { ...state, serviceList: mapServiceList(action.serviceList), svcInfo: action.serviceList };
            return { ...state, serviceList: mapServiceList(action.serviceList) };
        }
        case types.PUT_LIST_CLINIC: {
            // return { ...state, clinicList: action.clinicList };
            // return { ...state, clinicList: mapClinicList(action.clinicList), siteInfo: action.clinicList };
            return { ...state, clinicList: mapClinicList(action.clinicList) };
        }
        case types.LOAD_CODE_LIST: {
            return { ...state, commonCodeList: action.codeList };
        }

        /**Common error dialog */
        case types.OPEN_ERROR_MESSAGE: {
            return {
                ...state,
                openErrorDialog: true,
                errorMessage: action.error || '',
                errorData: action.data,
                errorTitle: action.errorTitle
            };
        }
        case types.CLOSE_ERROR_MESSAGE: {
            return {
                ...state,
                openErrorDialog: false
            };
        }
        /**Common error dialog */

        /**Common circular */
        case types.HANDLE_COMMON_CIRCULAR: {
            const sts = action.status;
            let isOpenCommonCircularList = _.cloneDeep(state.isOpenCommonCircularList);
            if (!isOpenCommonCircularList) isOpenCommonCircularList = [];
            if (sts === 'open')
                isOpenCommonCircularList.push(true);
            else
                if (isOpenCommonCircularList.length > 0)
                    isOpenCommonCircularList.splice(0, 1);
            // let openCommonCircular = sts === 'open' ? true : false;
            return {
                ...state,
                isOpenCommonCircularList,
                openCommonCircular: isOpenCommonCircularList.length > 0
            };
        }
        /**Common circular */

        /**Search bar */
        case types.UPDATE_SEARCHBAR_VALUE: {
            let isKeepData = typeof (action.isKeepData) === 'boolean' ? action.isKeepData : state.keepDataSelected;
            return { ...state, searchBarValue: action.value, keepDataSelected: isKeepData };
        }
        /**Search bar */

        /**Snack bar */
        case types.HANDLE_WARN_SNACKBAR: {
            let sts = action.status;
            let warnSnackbarStatus = sts === 'open' ? true : false;
            return { ...state, warnSnackbarStatus, warnSnackbarMessage: action.message };
        }
        /**Snack bar */

        case types.UPDATE_CONFIG: {
            let newState = { ...state };
            // newState.clinicConfig = { ...state.clinicConfig, ...action.clinicConfig };
            newState.clinicConfig = { ...mapClinicConfig(action.clinicConfig, state.clinicList) };
            newState.siteParams = { ...action.clinicConfig };
            sessionStorage.setItem('clinicConfig', JSON.stringify(newState.clinicConfig));
            sessionStorage.setItem('siteParams', JSON.stringify(newState.siteParams));
            return newState;
        }

        case types.UPDATE_WORKSTATION_PARAM:{
            let newState={...state};
            newState.workstationParams=action.workstationParams;
            sessionStorage.setItem('workstationParams',JSON.stringify(newState.workstationParams));
            return newState;
        }

        case types.UPDATE_LIST_CONFIG: {
            let newState = { ...state };
            let config = { ...action.listConfig };
            config.PATIENT_LIST = commonUtilities.getPriorityListConfig(config.PATIENT_LIST, 'patientlist', action.loginInfo.userRoleType, action.loginInfo.service_cd);
            config.WAITING_LIST = commonUtilities.getPriorityListConfig(config.WAITING_LIST, 'waitinglist', action.loginInfo.userRoleType, action.loginInfo.service_cd);
            newState.listConfig = config;
            sessionStorage.setItem('listConfig', JSON.stringify(newState.listConfig));
            return newState;
        }

        /** Prompt */
        case types.PROMPT_MESSAGE_HANDLE: {
            let sts = action.status;
            let openPrompt = sts === 'open' ? true : false;
            return {
                ...state,
                openPrompt
            };
        }

        /**Common circular dialog*/
        case types.OPEN_COMMON_CIRCULAR_DIALOG: {
            return {
                ...state,
                openCommonCircularDialog: true
            };
        }
        case types.CLOSE_COMMON_CIRCULAR_DIALOG: {
            return {
                ...state,
                openCommonCircularDialog: false
            };
        }

        /**idle timout dialog */
        case types.HANDLE_IDLE_DIALOG: {
            let sts = action.status;
            let openIdleDialog = sts === 'open' ? true : false;
            return { ...state, openIdleDialog };
        }
        /**idle timout dialog */

        /**list spa functions start**/
        case types.UPDATE_SPA_LIST: {
            const { spaList: _spaList } = action;
            const spaList = _spaList.map(item => ({...item, accessRightCd: item.accessRightCd.split('-')[0]})).filter((item, index, array) => index === array.findIndex(x => x.accessRightCd === item.accessRightCd));
            return {
                ...state,
                spaList
            };
        }
        case types.HANDLE_CLEAN_MASK: {
            let sts = action.status;
            let openCleanMask = sts === 'open' ? true : false;
            return { ...state, openCleanMask };
        }
        /**list spa functions end**/

        /**list group,hospital,specialty from cmn module start*/
        case types.LOAD_GROUP: {
            return {
                ...state,
                group: action.list
            };
        }

        case types.LOAD_HOSPITAL: {
            return {
                ...state,
                hospital: action.list
            };
        }

        case types.LOAD_SPECIALTY: {
            return {
                ...state,
                specialty: action.list
            };
        }
        /**list group,hospital,specialty from cmn module end*/

        case types.LOAD_PATIENT_SEARCH_TYPE: {
            return {
                ...state,
                patSearchTypeList: action.typeList
            };
        }

        case types.GET_LOGINUSER_ROLE: {
            return {
                ...state,
                loginUserRoleList: action.loginUserRoleList
            };
        }

        case types.LOAD_PASSPORT_LIST: {
            return {
                ...state,
                passportList: action.list
            };
        }

        case types.PUT_DELETE_REASONS: {
            return {
                ...state,
                deleteReasonsList: action.deleteReasonsList
            };
        }

        case types.PUT_SPECREQ_TYPES: {
            return {
                ...state,
                specReqTypesList: action.specReqTypesList
            };
        }

        case types.PUT_SPECIALTIES: {
            return {
                ...state,
                specialties: action.specialties
            };
        }

        case types.RESET_COMMON_CIRCULAR: {
            return {
                ...state,
                openCommonCircular: false,
                isOpenCommonCircularList: []
            };
        }

        case types.SET_OUT_DOCUMENT_TYPES: {
            return {
                ...state,
                outDocumentTypes: action.data
            };
        }

        case types.SET_IN_DOCUMENT_TYPES: {
            return {
                ...state,
                inDocumentTypes: action.data
            };
        }

        case types.LOAD_EHS_TEAM_SITE_LIST: {
            return { ...state, ehsTeamSiteList: action.ehsTeamSiteList };
        }

        case types.UPDATE_STATE: {
            return {
                ...state,
                ...action.updateData
            };
        }

        case types.OPEN_COMMON_CLINICAL_DOCUMENT: {
            return {
                ...state,
                openCommonClinicalDocument: true,
                commonClinicalDocumentParams : action.params
            };
        }
        case types.CLOSE_COMMON_CLINICAL_DOCUMENT: {
            return {
                ...state,
                openCommonClinicalDocument: false
            };
        }

        default:
            return {
                ...state,
                spaFunc: {
                    openCommonCircular: actions.openCommonCircular,
                    closeCommonCircular: actions.closeCommonCircular,
                    openWarnSnackbar: actions.openWarnSnackbar,
                    closeWarnSnackbar: actions.closeWarnSnackbar,
                    goPrint: actions.goPrint
                }
            };
    }
};
