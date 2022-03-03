import * as type from '../../actions/patient/patientActionType';
import * as action from '../../actions/patient/patientAction';
import { loadEncounterInfo, refreshPatient } from '../../actions/patient/patientAction';
import Enum from '../../../enums/enum';
import moment from 'moment';
import { ompSts, genSts, caseSts, pageSts } from '../../../enums/anSvcID/anSvcIDEnum';
import _ from 'lodash';

export const antenatalInfo = {
    clcAntIdSrc: 0,
    clcAntOmpId: 0,
    codHcinstId: '',
    deliveryHosp:'',
    antSvcId: '',
    isHaXferIn: 1,
    confirmLetterRefNum: '',
    isFopRefuse: 0,
    haRefNum: '',
    isFullCase: 0,
    codInvldExpyRsnId: null,
    invldExpyRsnTxt: '',
    sts: caseSts.ACTIVE,
    clcAntSrcs: [],
    clcAntOmpDto: {
        clcAntIdSrc: 0,
        clcAntOmpId: 0,
        emailAddr: '',
        //emailLangCd: Enum.AN_SERVICE_ID_LANGUAGE_PREFERRED.TRADITIONAL_CHINESE,
        emailLangCd: '',
        recSts: ompSts.CURRENT,
        genSts: genSts.UNSUBSCRIBE,
        genDateTime: null
    },
    clcFopDto: {
        clcFopId: 0,
        clcAntId: 0,
        engSurname: null,
        engGivName: null,
        //singleNameInd: 0,
        nameChi: null,
        ccCode1: null,
        ccCode2: null,
        ccCode3: null,
        ccCode4: null,
        ccCode5: null,
        ccCode6: null,
        dob: null,
        exactDateCd: null,
        codEduLvlId: null,
        otherEduLvl: null,
        codOcpId: null,
        otherOcp: null,
        phn: null
    },
    gestWeek:null,
    EDC:null,
    LMP:null,
    encntrGrpCd:''
};

export const antSvcInfo = {
    anSvcIdDialogSts: false,
    ccCodeChiChar: [],
    clcAntCurrent:_.cloneDeep(antenatalInfo),
    //antenatalInfo: _.cloneDeep(antenatalInfo),
    //antenatalInfoBk: _.cloneDeep(antenatalInfo),
    // omp: _.cloneDeep(omp),
    // ompBk: _.cloneDeep(omp),
    // fatherInfo: _.cloneDeep(fatherInfo),
    // fatherInfoBk: _.cloneDeep(fatherInfo),
    //isFopRefuse: 0,
    //deliveryHospital: [],
    caseStsChangeRsns: [],
    pageSts: pageSts.DEFAULT,
    anSvcIdSeq: '',
    //isAssBk: 0,
    //antSvcIdList: []
    clcAntFullList:[]
};

const initState = {
    patientInfo: null,
    eHRUrl: '',
    appointmentInfo: {},
    nationalityList: [],
    countryList: [],
    encounterInfo: {},
    caseNoInfo: {},
    languageData: {},
    appointmentHistory: null,
    majorKeyChangeHistoryList: [],
    bannerItems: [],
    bannerData: {
        gravidaAndParity: null,
        isWrkEdcModified: false,
        geneticInfo: []
    },
    loadEncounterInfo,
    pucChecking: null,
    patientSummaryViewLog: {
        open: false,
        apptList: null
    },
    isEnableCrossBookClinic: false,
    caseIndicatorInfo: {
        caseIndicator: '',
        open: false
    },
    patientSvcExist: true,
    destinationList: [],
    gumLabelPrintReqParams: null,
    openAntSvcInfoDialog:false,
    spaAction: { ...action },
    refreshPatient,
    familyEncounterSearchList: [],
    isFamilyEncounterSearchDialogOpen: false
};

export default (state = initState, action = {}) => {
    switch (action.type) {
        case type.PUT_PATIENT_INFO: {
            return {
                ...state,
                patientInfo: action.data,
                appointmentInfo: action.appointmentInfo || {},
                caseNoInfo: action.caseNoInfo || {},
                attendance: action.attendance || {}
            };
        }
        case type.PUT_EHR_PATIENT_STATUS: {
            let eHRPatientInfo = state.patientInfo;
            eHRPatientInfo.patientEhr.isMatch = action.data;
            return {
                ...state,
                patientInfo: eHRPatientInfo
            };
        }
        case type.PUT_EHR_URL: {
            return {
                ...state,
                eHRUrl: action.eHRUrl
            };
        }
        case type.RESET_EHR_URL: {
            return {
                ...state,
                eHRUrl: ''
            };
        }
        case type.PUT_LANGUAGE_LIST: {
            return { ...state, languageData: action.languageData };
        }
        case type.PUT_PATIENT_PUC: {
            return { ...state, pucChecking: action.pucChecking ? { ...action.pucChecking } : null };
        }
        case type.UPDATE_STATE: {
            let lastAction = { ...state };

            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }
        case type.RESET_ALL: {
            return {
                ...initState,
                countryList: state.countryList,
                nationalityList: state.nationalityList,
                destinationList: state.destinationList,
                appointmentInfo: {},
                caseNoInfo: {},
                languageData: state.languageData
            };
        }
        case type.RESET_PATIENT_PANEL: {
            return {
                ...initState,
                patientInfo: state.patientInfo,
                countryList: state.countryList,
                destinationList: state.destinationList,
                nationalityList: state.nationalityList,
                appointmentInfo: {},
                caseNoInfo: {},
                languageData: state.languageData
            };
        }

        case type.LOAD_NATIONALITY_LIST_AND_COUNTRY_LIST: {
            return {
                ...state,
                nationalityList: action.nationalityList || [],
                countryList: action.countryList || []
            };
        }

        case type.UPDATE_PATIENT_APPOINTMENT: {
            let appointmentInfo = action.appointmentInfo || {};
            return {
                ...state,
                appointmentInfo
            };
        }

        case type.UPDATE_PATIENT_CASENO: {
            let caseNoInfo = action.caseNoInfo || {};
            return {
                ...state,
                caseNoInfo
            };
        }

        case type.LOAD_PATIENT_ENCOUNTER_INFO: {
            let encounterInfo = action.encounterInfo || {};
            return {
                ...state,
                encounterInfo
            };
        }

        case type.PUT_MAJORKEY_CHANGE_HISTORY: {
            return {
                ...state,
                majorKeyChangeHistoryList: action.data
            };
        }

        case type.PUT_LIST_APPOINTMENT_HISTORY: {
            return {
                ...state,
                appointmentHistory: action.appointmentHistory
            };
        }

        case type.PUT_PATIENT_BANNER: {
            return {
                ...state,
                bannerItems: action.data
            };
        }

        case type.CLEAR_PATIENT_BANNER: {
            return {
                ...state,
                bannerItems: []
            };
        }

        case type.LOAD_THS_DESTINATION: {
            let destinationList = (action.destinationList || []).filter(
                (item) => {
                    if (item.expyDate) {
                        return item.efftDate && item.status === 'A' && moment().isBetween(moment(item.efftDate, Enum.DATE_FORMAT_EYMD_VALUE), moment(item.expyDate, Enum.DATE_FORMAT_EYMD_VALUE), 'day', '[]');
                    } else if (!item.expyDate) {
                        return item.efftDate && item.status === 'A' && moment().isSameOrAfter(moment(item.efftDate, Enum.DATE_FORMAT_EYMD_VALUE), 'day');
                    }
                });
            return {
                ...state,
                destinationList: destinationList
            };
        }

        case type.PUT_PATIENT_BANNER_DATA: {
            return {
                ...state,
                bannerData: { ...state.bannerData, ...action.data }
            };
        }

        case type.CLEAR_PATIENT_BANNER_DATA: {
            return {
                ...state,
                bannerData: initState.bannerData
            };
        }

        case type.PUT_PATIENT_PSORIASIS_INFO: {
            let patientInfo = state.patientInfo;
            patientInfo.psoInfo = action.params;
            return {
                ...state,
                patientInfo
            };
        }

        case type.PUT_PSO_INFO: {
            let patientInfo = _.cloneDeep(state.patientInfo);
            patientInfo.psoInfo = action.psoInfo;
            return {
                ...state,
                patientInfo
            };
        }

        case type.PUT_LATEST_PATIENT_ENCOUNTER_CASE: {
            return {
                ...state,
                shsInfo: action.shsInfo
            };
        }

        case type.UPDATE_FAMILY_ENCOUNTER_SEARCH_LIST: {
            const { familyEncounterSearchList } = action.payload;

            return {
                ...state,
                familyEncounterSearchList
            };
        }

        case type.UPDATE_FAMILY_ENCOUNTER_SEARCH_DIALOG: {
            return {
                ...state,
                isFamilyEncounterSearchDialogOpen: !state.isFamilyEncounterSearchDialogOpen
            };
        }

        case type.PUT_GENETIC_SCREENING_INFO: {
            return {
                ...state,
                bannerData: { ...state.bannerData, geneticInfo: action.geneticInfo }
            };
        }

        default:
            state.loadEncounterInfo = loadEncounterInfo;
            state.refreshPatient = refreshPatient;
            return { ...state };
    }
};