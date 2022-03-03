import * as CaseNoActionType from '../../actions/caseNo/caseNoActionType';
import Enum from '../../../enums/enum';
import _ from 'lodash';
import moment from 'moment';
import {checkIsAutoGen} from '../../../utilities/caseNoUtilities';

export const initCaseNoForm = {
    caseNo: '',
    ownerClinicCd: '',
    casePrefixCd: '',
    encounterTypeCd: '',
    subEncounterTypeCd: '',
    regDtm: null,
    patientStatus: null,
    caseReference: '',
    caseSeq: '',
    remark: '',
    patientKey: '',
    statusCd: Enum.CASE_STATUS.ACTIVE
};

const initState = {
    openCaseNo: false,
    caseDialogStatus: '',
    isAutoGen: '',
    isNoPopup: false,
    caseNoForm: _.cloneDeep(initCaseNoForm),
    casePrefixList: [],
    encounterGroupDtos: [],
    caseCallBack: null,
    codeListDtos: {},
    openSelectCase: Enum.CASE_SELECTOR_STATUS.CLOSE,
    caseSelectCallBack: null,
    selectCaseList: null,
    currentUpdateField: '',
    aliasRule: null,
    encntrGrpList:[],
    encntrGrp:null
};
export default (state = initState, action = {}) => {
    switch (action.type) {
        case CaseNoActionType.OPEN_CASENO_DIALOG: {
            return {
                ...state,
                openCaseNo: true,
                caseDialogStatus: action.caseDialogStatus,
                isNoPopup: action.isNoPopup,
                caseNoForm: { ...state.caseNoForm, ...action.caseNoForm },
                caseCallBack: action.caseCallBack
            };
        }

        case CaseNoActionType.CLOSE_CASENO_DIALOG: {
            return {
                ...state,
                openCaseNo: false,
                caseDialogStatus: '',
                caseCallBack: null,
                encounterGroupDtos: [],
                caseNoForm: _.cloneDeep(initCaseNoForm),
                isNoPopup: false,
                currentUpdateField: '',
                encntrGrp: null
            };
        }

        case CaseNoActionType.UPDATE_CASENO_FORM: {
            const caseNoForm = Object.assign({}, state.caseNoForm, action.form);
            return {
                ...state,
                caseNoForm
            };
        }

        case CaseNoActionType.UPDATE_STATE: {
            let lastAction = { ...state };
            for (let p in action.updateData) {
                lastAction[p] = action.updateData[p];
            }
            return lastAction;
        }

        case CaseNoActionType.PUT_CASE_PREFIX: {
            const casePrefixList = action.casePrefixList;

            let isAutoGen = '';
            let filterResult = casePrefixList.filter(item => item.isAutoGen === 'Y' && item.isAutoSeq === 'Y');
            if (filterResult.length === 1) {
                isAutoGen = 'Y';
            }
            else {
                isAutoGen = 'N';
            }
            return {
                ...state,
                casePrefixList,
                isAutoGen
            };
        }

        case CaseNoActionType.PUT_ALIAS_RULES: {
            const aliasRules = action.aliasRules;
            return {
                ...state,
                aliasRule: aliasRules
            };
        }

        // case CaseNoActionType.PUT_ENCOUNTER_TYPE_LIST: {
        //     const encounterList = _.cloneDeep(action.encounterTypeList);
        //     return { ...state, encounterList };
        // }

        case CaseNoActionType.GET_ENCOUNTER_GROUP: {
            let encounterGroupDtos = state.encounterGroupDtos;
            const casePrefixList = state.casePrefixList;
            if (state.caseNoForm && state.caseNoForm.casePrefixCd && casePrefixList) {
                const currentCasePrefix = casePrefixList.find(item => item.casePrefixCd === state.caseNoForm.casePrefixCd);
                encounterGroupDtos = currentCasePrefix && currentCasePrefix.encounterGroupDtos;
            }
            return {
                ...state,
                encounterGroupDtos
            };
        }

        case CaseNoActionType.PUT_CODE_LIST: {
            return {
                ...state,
                codeListDtos: action.codeList
            };
        }

        case CaseNoActionType.SELECT_CASE_TRIGGER: {
            return {
                ...state,
                openSelectCase: action.trigger,
                selectCaseList: action.selectCaseList || null,
                caseSelectCallBack: action.caseSelectCallBack || null
            };
        }

        case CaseNoActionType.PUT_ENCOUNTER_GROUP_LIST: {
            return {
                ...state,
                encntrGrpList: action.encntrGrpList
            };
        }

        default:
            return state;
    }
};
