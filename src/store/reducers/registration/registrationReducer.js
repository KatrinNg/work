import _ from 'lodash';
import * as RegistrationType from '../../actions/registration/registrationActionType';
import ButtonStatusEnum from '../../../enums/registration/buttonStatusEnum';
import {
    patientBasic,
    patientSocialDataBasic,
    patientContactInfoBasic,
    patientBaseInfoBasic,
    filterSet,
    babyInfoBasic,
    familyNoTypes
} from '../../../constants/registration/registrationConstants';
import { RegistrationUtil, CommonUtil } from '../../../utilities';
import Enum from '../../../enums/enum';
import RegFieldName from '../../../enums/registration/regFieldName';

const initState = {
    patientOperationStatus: ButtonStatusEnum.VIEW,
    patientList: [],
    patientById: _.cloneDeep(patientBasic),
    patientBaseInfo: _.cloneDeep(patientBaseInfoBasic),
    patientContactInfo: _.cloneDeep(patientContactInfoBasic),
    patientSocialData: _.cloneDeep(patientSocialDataBasic),
    contactPersonList: RegistrationUtil.initPatientContactPerson(),
    addressList: RegistrationUtil.initPatientAddress(),
    phoneList: RegistrationUtil.initPatientPhone(),
    contactInfoSaveAbove: false,
    codeList: {},
    ccCodeChiChar: [],
    corDistrictList: [],
    corSubDistrictList: [],
    resDistrictList: [],
    resSubDistrictList: [],
    filterSet: _.cloneDeep(filterSet),
    filterSet_c: _.cloneDeep(filterSet),// PATIENT_CORRESPONDENCE_ADDRESS_TYPE
    filterSet_r: _.cloneDeep(filterSet),// PATIENT_RESIDENTIAL_ADDRESS_TYPE
    loginService: null,
    changeAddressFormatOnly: false,
    paperBasedRecordList: [],
    patientReminderList: [],
    waiverList: [],
    loginName: '',
    babyInfo: _.cloneDeep(babyInfoBasic),
    hasIdentify: false,
    isProblemPMI: false,
    isPrimaryUnique: false,
    problemDialogList: [],
    allowSingleNameInput: false,
    autoFocus: false,
    searchPMI: {
        data: null,
        selected: null,
        searchParams: null
    },
    openSearchAssoPer: false,
    searchType: Enum.DOC_TYPE.HKID_ID,
    searchValue: '',
    patientSearchParam: {
        searchType: Enum.DOC_TYPE.HKID_ID,
        searchValue: ''
    },
    doCloseCallbackFunc: null,
    loadErrorParameter: false,
    assoPersList: null,
    focusAssoPerName: false,
    assoPersonInfo: {
        assoPerHKID: '',
        assoPerName: '',
        assoPerReltship: ''
    },
    viewPatDetails: false,
    isOpenSearchPmiPopup: false,
    isFamilyNoValid: '',
    isServiceSpecificFormValid: true,
    via: null,
    isPageDirty: false,
    screeningInfo: null,
    docId: ''
};

export function getResetState(state) {
    const { codeList, addressList,patInfo } = state;
    return {
        ...initState,
        // addressList: addressList,
        codeList: codeList,
        patientBaseInfo:patInfo,
        corDistrictList: _.cloneDeep(codeList.district),
        corSubDistrictList: _.cloneDeep(codeList.sub_district),
        resDistrictList: _.cloneDeep(codeList.district),
        resSubDistrictList: _.cloneDeep(codeList.sub_district)
    };
}

export default (state = initState, action = {}) => {
    switch (action.type) {
        case RegistrationType.RESPONSE_RESET_ALL: {
            return getResetState(action);
        }
        case RegistrationType.UPDATE_PATIENT_OPERATE_STATUS: {
            return {
                ...state,
                patientOperationStatus: action.status
            };
        }
        case RegistrationType.UPDATE_STATE: {
            if (state.patientOperationStatus === ButtonStatusEnum.EDIT || state.patientOperationStatus === ButtonStatusEnum.ADD) {
                if (action.updateData && !state.isPageDirty) {
                    const keyIndex = Object.keys(action.updateData).findIndex(k =>
                        k === 'patientBaseInfo' ||
                        k === 'patientContactInfo' ||
                        k === 'patientSocialData' ||
                        k === 'contactPersonList' ||
                        k === 'addressList' ||
                        k === 'phoneList' ||
                        k === 'corDistrictList' ||
                        k === 'corSubDistrictList' ||
                        k === 'resDistrictList' ||
                        k === 'resSubDistrictList' ||
                        k === 'paperBasedRecordList' ||
                        k === 'patientReminderList' ||
                        k === 'waiverList' ||
                        k === 'assoPersonInfo');
                    if (keyIndex > -1) {
                        const keyName = Object.keys(action.updateData)[keyIndex];
                        if (keyName && !_.isEqual(action.updateData[keyName], state[keyName])) {
                            action.updateData.isPageDirty = true;
                        }
                    }
                }
            } else {
                if(state.isPageDirty) {
                    action.updateData.isPageDirty = false;
                }
            }
            return {
                ...state,
                ...action.updateData
            };
        }
        case RegistrationType.RESPONSE_INIT_PATIENT: {
            const {
                patientById, phoneList, addressList, contactPersonList,
                patientSocialData, patientContactInfo, patientBaseInfo,
                ccCodeChiChar, patientIsSingleName, assoPersonInfo, cgsSpec
            } = action;
            const corAddr = addressList.find(item => item.addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE);
            const reAddr = addressList.find(item => item.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE);
            let filterSet_c = _.cloneDeep(filterSet);
            let filterSet_r = _.cloneDeep(filterSet);
            let filterSet_cp = _.cloneDeep(filterSet);
            // contactPersonList.forEach(cnctPerson=>{
            const cnctPerson = contactPersonList[0];
            if (cnctPerson.region) {
                filterSet_cp[RegFieldName.CONTACT_REGION] = 1;
            }
            if (cnctPerson.districtCd) {
                filterSet_cp[RegFieldName.CONTACT_DISTRICT] = 1;
            }
            // cnctPerson.filterSet_cp=filterSet_cp;
            // });
            if (corAddr) {
                if (corAddr.region) {
                    filterSet_c[RegFieldName.CONTACT_REGION] = 1;
                }
                if (corAddr.districtCd) {
                    filterSet_c[RegFieldName.CONTACT_DISTRICT] = 1;
                }
            }

            if (reAddr) {
                if (reAddr.region) {
                    filterSet_r[RegFieldName.CONTACT_REGION] = 1;
                }
                if (reAddr.districtCd) {
                    filterSet_r[RegFieldName.CONTACT_DISTRICT] = 1;
                }
            }
            return {
                ...state,
                patientById,
                phoneList,
                addressList,
                contactPersonList,
                patientSocialData,
                patientContactInfo,
                patientBaseInfo: {
                    ...patientBaseInfo,
                    familyNoType: cgsSpec.pmiGrpId ? familyNoTypes.EXISTING : familyNoTypes.NONE,
                    pmiGrpId: cgsSpec.pmiGrpId,
                    pmiGrpName: cgsSpec.pmiGrpName,
                    isChief: cgsSpec.isChief,
                    cgsSpec: { ...cgsSpec, siteId: cgsSpec.siteId === 0 ? null : cgsSpec.siteId }
                },
                assoPersonInfo,
                assoPersList: RegistrationUtil.IsHKIDbyJS(assoPersonInfo.assoPerHKID || '') && !assoPersonInfo.assoPerName ? [] : null,
                ccCodeChiChar: ccCodeChiChar,
                allowSingleNameInput: patientIsSingleName,
                filterSet: filterSet_cp,
                filterSet_c,
                filterSet_r
            };
        }
        case RegistrationType.PUT_GET_CODE_LIST: {
            return {
                ...state,
                codeList: action.codeList,
                corDistrictList: _.cloneDeep(action.codeList.district),
                corSubDistrictList: _.cloneDeep(action.codeList.sub_district),
                resDistrictList: _.cloneDeep(action.codeList.district),
                resSubDistrictList: _.cloneDeep(action.codeList.sub_district)
            };
        }
        // case RegistrationType.PUT_PATIENT: {
        //     let { patientBaseInfo } = state;
        //     const loginService = state.loginService;
        //     const loginName = state.loginName;
        //     let paperBasedRecordList = [];
        //     let reminderList = [];
        //     let waiverList = [];
        //     let patientIsSingleName = false;
        //     if (action.status === ButtonStatusEnum.ADD) {
        //         if (!RegUtil.IsHKIDbyJS(patientBaseInfo.hkid)) {
        //             patientBaseInfo.hkid = '';
        //         }
        //         //add new miscellaneous paper based rec
        //         let newPaperBasedRecordRec = RegUtil.initNewPaperBasedRec(loginService.serviceCd);
        //         paperBasedRecordList.push(newPaperBasedRecordRec);

        //         //add new micellaneous patient reminder list
        //         let newReminderRec = RegUtil.initNewPatientReminderRec();
        //         reminderList.push(newReminderRec);

        //         //add new waiver list
        //         let newWaiverRec = RegUtil.initNewWaiverRec(loginName);
        //         waiverList.push(newWaiverRec);
        //     }
        //     if (action.status === ButtonStatusEnum.DATA_SELECTED) {

        //         let miscellaneousData = genMiscellaneousData(action.data.patientDtos[0], loginService, loginName);
        //         paperBasedRecordList = miscellaneousData.paperBasedRecordList;
        //         reminderList = miscellaneousData.patientReminderList;
        //         waiverList = miscellaneousData.waiverList;

        //         //check if patient has single name
        //         if ((patientBaseInfo.engSurname !== '' && !patientBaseInfo.engGivename) || (!patientBaseInfo.engSurname && patientBaseInfo.engGivename !== '')) {
        //             patientIsSingleName = true;
        //         }
        //     }
        //     return {
        //         ...state,
        //         patientList: action.data,
        //         patientOperationStatus: action.status, patientBaseInfo,
        //         paperBasedRecordList: paperBasedRecordList,
        //         patientReminderList: reminderList,
        //         waiverList: waiverList,
        //         allowSingleNameInput: patientIsSingleName
        //     };
        // }
        case RegistrationType.UPDATE_CHI_CHAR: {
            let { patientInfo, ccCodeChiChar } = RegistrationUtil.setChCode(action.ccCodeList || [], state.patientBaseInfo, state.ccCodeChiChar);
            let updateData = RegistrationUtil.setChChineseName(patientInfo, ccCodeChiChar, action.charIndex, action.char);
            return {
                ...state,
                patientBaseInfo: updateData.patientInfo,
                ccCodeChiChar: updateData.ccCodeChiChar
            };
        }
        case RegistrationType.UPDATE_BABYINFO_CHI_CHAR: {
            let { patientInfo, ccCodeChiChar } = RegistrationUtil.setChCode(action.ccCodeList || [], state.babyInfo, state.ccCodeChiChar);
            let updateData = RegistrationUtil.setChChineseName(patientInfo, ccCodeChiChar, action.charIndex, action.char);
            return {
                ...state,
                babyInfo: updateData.patientInfo,
                ccCodeChiChar: updateData.ccCodeChiChar
            };
        }
        case RegistrationType.RESET_BABYINFO: {
            let babyInfo = _.cloneDeep(babyInfoBasic);
            return { ...state, babyInfo: babyInfo };
        }
        case RegistrationType.PUT_VALID_FOR_PROBLEM_PMI: {
            const problemDialogList = _.cloneDeep(action.problemDialogList);
            return { ...state, problemDialogList };
        }
        case RegistrationType.LOAD_PATIENT_RELATED_FLAG: {
            return {
                ...state,
                isProblemPMI: action.isProblemPMI,
                isPrimaryUnique: action.isPrimaryUnique
            };
        }
        case RegistrationType.RESPONSE_INIT_MISCELLANEOUS: {
            const { miscellaneousData } = action;
            let paperBasedRecordList = miscellaneousData.paperBasedRecordList;
            let reminderList = miscellaneousData.patientReminderList;
            let waiverList = miscellaneousData.waiverList;
            return {
                ...state,
                paperBasedRecordList: paperBasedRecordList,
                patientReminderList: reminderList,
                waiverList: waiverList
            };
        }
        case RegistrationType.POP_UP_SEARCH_DIALOG: {
            return {
                ...state,
                isOpenSearchPmiPopup: true,
                searchPMI: {
                    data: _.cloneDeep(action.data),
                    selected: null,
                    searchParams: action.searchParams ? _.cloneDeep(action.searchParams) : null
                }
            };
        }
        case RegistrationType.OPEN_ASSOCIATED_SEARCH_RESULT: {
            return{
                ...state,
                openSearchAssoPer: true
            };
        }
        case RegistrationType.RESPONSE_CREATE_NEW_PMI: {
            // const {autoFocus}=state;
            return {
                ...action.initState,
                patientOperationStatus: ButtonStatusEnum.ADD,
                autoFocus: true
            };
        }
        case RegistrationType.RESPONSE_SELECTED_PMI: {
            return {
                ...state,
                patientOperationStatus: ButtonStatusEnum.DATA_SELECTED,
                hasIdentify: false
            };
        }
        case RegistrationType.RESPONSE_MAP_PMI_WITH_PROVEN_VALUE:{
            return {
                ...state,
                patientBaseInfo:action.patInfo
            };
        }
        case RegistrationType.UPDATE_PATIENT_EHS_DTO: {
            return {
                ...state,
                patientBaseInfo:{
                    ...state.patientBaseInfo,
                    patientEhsDto: {
                        ...state.patientBaseInfo.patientEhsDto,
                        ...action.newPatientEhsDto
                    }
                }
            };
        }
        case RegistrationType.UPDATE_PATIENT_BASE_INFO:{
            return {
                ...state,
                patientBaseInfo:{
                    ...state.patientBaseInfo,
                    ...action.payload
                }
            };
        }
        case RegistrationType.UPDATE_CGS_SPEC:{
            return {
                ...state,
                patientBaseInfo: {
                    ...state.patientBaseInfo,
                    cgsSpec: {
                        ...action.payload.value,
                        familyOption: state.patientBaseInfo.familyNoType,
                        pmiGrpId: state.patientBaseInfo.pmiGrpId,
                        pmiGrpName: state.patientBaseInfo.pmiGrpName,
                        isChief: state.patientBaseInfo.isChief
                    }
                }
            };
        }
        case RegistrationType.VALID_FAMILY_NO: {
            return {
                ...state,
                isFamilyNoValid: 'Y'
            };
        }
        case RegistrationType.INVALID_FAMILY_NO: {
            return {
                ...state,
                isFamilyNoValid: 'N'
            };
        }
        case RegistrationType.RESET_FAMILY_NO_CHECKING: {
            return {
                ...state,
                isFamilyNoValid: ''
            };
        }
        case RegistrationType.UPDATE_SERVICE_SPECIFIC_FORM_VALIDATION: {
            return {
                ...state,
                isServiceSpecificFormValid: action.payload.isValid
            };
        }
        case RegistrationType.UPDATE_SCREENING_INFO: {
            const { screenInfoData } = action.payload;

            return {
                ...state,
                screeningInfo: screenInfoData
            };
        }
        case RegistrationType.UPDATE_DOCUMENT_ID: {
            return {
                ...state,
                docId: action.payload
            };
        }
        default:
            return { ...state };
    }
};