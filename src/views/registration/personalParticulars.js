import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import {
    Grid,
    FormControl,
    FormControlLabel,
    Box,
    colors,
    Chip
} from '@material-ui/core';
import memoize from 'memoize-one';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import OutlinedRadioValidator from '../../components/FormValidator/OutlinedRadioValidator';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import RegFieldName from '../../enums/registration/regFieldName';
import HKIDInput from '../compontent/hkidInput';
import RegChCodeField from './component/regChCodeField';
import RegDateBirthField from './component/regDateBirthField';
import ButtonStatusEnum from '../../enums/registration/buttonStatusEnum';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import * as CommonUtilities from '../../utilities/commonUtilities';
import { RegistrationUtil } from '../../utilities';
import Enum, { SERVICE_CODE, PATIENT_STATUS, SPECIAL_NEEDS_ID } from '../../enums/enum';
import CIMSCheckBox from '../../components/CheckBox/CIMSCheckBox';
import {
    updateState,
    searchPatient,
    updateChiChar,
    searchAssociatedPersonWithHKID,
    updatePatientBaseInfo
} from '../../store/actions/registration/registrationAction';
import { openCommonCircular, closeCommonCircular } from '../../store/actions/common/commonAction';
import {
    checkOcsss,
    checkEcs,
    setEcsPatientStatus,
    resetEcsPatientStatus,
    resetOcsssPatientStatus,
    completeRegPageReset,
    openEcsDialog,
    openOcsssDialog,
    setEcsPatientStatusInRegPage,
    setOcsssPatientStatusInRegPage,
    regPageKeyFieldOnBlur
} from '../../store/actions/ECS/ecsAction';
// import * as EcsActionType from '../../store/actions/ECS/ecsActionType';
import * as PatientUtil from '../../utilities/patientUtilities';
import {
    initSelectedPatientEcsStatus,
    initSelectedPatientOcsssStatus
} from '../../store/reducers/ECS/ecsReducer';
import EcsResultTextField from '../../components/ECS/Ecs/EcsResultTextField';
import OcsssResultTextField from '../../components/ECS/Ocsss/OcsssResultTextField';
import * as EcsUtilities from '../../utilities/ecsUtilities';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { ecsSelector, ocsssSelector, regPatientInfoSelector, regPatientKeySelector } from '../../store/selectors/ecsSelectors';
import CIMSButton from '../../components/Buttons/CIMSButton';
import PatientSearchGroup from '../compontent/patientSearchGroup';
import palette from '../../theme/palette';
import AccessRightEnum from '../../enums/accessRightEnum';
import { auditAction } from '../../store/actions/als/logAction';
import moment from 'moment';
import { getCodeDescriptionByCategory } from '../../utilities/dtsUtilities';
import BabyIcon from './component/babyIcon';
import FamilyNoFormGroup from './component/serviceSpecific/familyNumber/FamilyNoFormGroup';
import { familyNoTypes } from '../../constants/registration/registrationConstants';

const sysRatio = CommonUtilities.getSystemRatio();
const unit = CommonUtilities.getResizeUnit(sysRatio);
//eslint-disable-next-line
const styles = (theme) => ({
    //...theme,
    //spacing: theme.spacing,
    root: {
        paddingTop: 10,
        width: '90%'
    },
    grid: {
        paddingTop: 4,
        paddingBottom: 4,
        //padding: 20,
        justifyContent: 'center'
    },
    form_input: {
        width: '100%'
    },
    radioGroup: {
        //height: 36
        height: 39 * unit - 2
    },
    checkBoxRoot: {
        height: 'auto'
    },
    chip: {
        backgroundColor: colors.orange[600],
        color: 'white',
        height: '100%',
        borderRadius: theme.spacing(1) / 2
    },
    updateIndentifierBtn: {
        margin: '-3px 0px 0px',
        padding: '4px 30px'
    },
    customSecondaryBtn: {
        color: palette.secondary.main,
        backgroundColor: palette.white,
        border: 'solid 1px #e0417e',
        boxShadow: '2px 2px 2px #6e6e6e',
        '&:hover': {
            color: palette.white,
            backgroundColor: '#c51162'
        },
        '&$focusVisible': {
            color: palette.white,
            backgroundColor: '#c51162'
        },
        '&:disabled': {
            border: 'solid 1px #e0e0e0'
        }
    }
});

class PersonalParticulars extends React.Component {

    static getDerivedStateFromProps(nextProps) {
        // if (!nextProps.comDisabled) {
        let isHkidRequired, isDocNumRequired;
        if (nextProps.patientBaseInfo.hkid) {
            isHkidRequired = true;
            isDocNumRequired = false;
        } else if (!nextProps.patientBaseInfo.hkid && (nextProps.patientBaseInfo.otherDocNo || nextProps.patientBaseInfo.docTypeCd)) {
            isHkidRequired = false;
            isDocNumRequired = true;
        } else {
            isHkidRequired = true;
            isDocNumRequired = true;
        }

        // if (nextProps.patientBaseInfo.otherDocNo || nextProps.patientBaseInfo.docTypeCd) {
        //     isDocNumRequired = true;
        // }
        return { isHkidRequired, isDocNumRequired };
        // }
        // return { isHkidRequired: true, isDocNumRequired: true };
    }

    state = {
        isHkidRequired: true,
        isDocNumRequired: true,
        ecsLocalStore: _.cloneDeep(initSelectedPatientEcsStatus),
        ocsssLocalStore: _.cloneDeep(initSelectedPatientOcsssStatus),
        patientBaseInfoSnapshot: {},
        addlValidators: [],
        addlErrorMessages: []
    }

    componentDidMount() {
        const hkidDom = document.getElementById('registration_personalParticulars_documentType');
        hkidDom && hkidDom.focus();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state !== nextState ||
            nextProps.ecsResetFlag ||
            nextProps.patientBaseInfo !== this.props.patientBaseInfo ||
            nextProps.patientOperationStatus !== this.props.patientOperationStatus ||
            nextProps.registerCodeList !== this.props.registerCodeList) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.autoFocus) {
            this.priDocTypeRef.focus();
            this.props.updateState({ autoFocus: false });
        }
        if (this.props.loadErrorParameter) {
            this.handleUpdateIdentify();
            setTimeout(() => {
                const valid = this.props.checkPersonalFormValid(true);
                valid.then(result => {
                    if (!result) {
                        this.props.focusFail();
                    }
                });
            }, 1000);
            this.props.updateState({ loadErrorParameter: false });
        }
        if (this.props.focusAssoPerName
            && this.associatedPersonNameRef.inputRef
            && !this.associatedPersonNameRef.inputRef.disabled) {
            this.associatedPersonNameRef.inputRef.focus();
            this.props.updateState({ focusAssoPerName: false });
        }
        // isNextReg, registeredPatientList: props from registration
        const {registeredPatientList, isNextReg, updatePatientBaseInfo, isNewFamily} = this.props;
        // If nextReg/ new family next Reg => add back familyNoType and pmiGrpId
        if (isNextReg && (prevProps.pmiGrpName !== registeredPatientList[0]?.pmiGrpName || isNewFamily)) {
            updatePatientBaseInfo({
                // pmiGrpId: registeredPatientList[0].pmiGrpId,
                pmiGrpName: registeredPatientList[0].pmiGrpName,
                familyNoType: familyNoTypes.EXISTING
            });
        }
    }

    genDocTypeList = memoize((list) => {
        let codeList = list && list.doc_type;
        if (!codeList) return [];
        return codeList;
    })

    filterDocTypeList = memoize((list) => {
        let codeList = list && list.doc_type;
        if (!codeList) return [];
        return codeList.filter(item => item.code !== Enum.DOC_TYPE.HKID_ID &&
            item.code !== Enum.DOC_TYPE.BIRTH_CERTIFICATE_HK &&
            item.code !== Enum.DOC_TYPE.BABY_WITHOUT_HKBC &&
            item.code !== Enum.DOC_TYPE.MOTHER_ID_OF_BABY);
    });

    filterLangGroupList = memoize((groupList, preferredLangMap) => {
        if (!preferredLangMap) return null;
        if (!preferredLangMap['CM'] || preferredLangMap['CM'].length === 0) {
            return groupList.filter(item => item.langGroupCd !== 'CM');
        } else {
            return groupList;
        }
    });

    filterPreferredLangList = memoize((preferredLangMap, groupList, defaultLangGroup, patientBaseInfo) => {
        if (!preferredLangMap) return null;
        let fieldName = '';
        if (patientBaseInfo.langGroup && patientBaseInfo.langGroup !== 'E') {
            fieldName = patientBaseInfo.langGroup;
        } else if (defaultLangGroup) {
            fieldName = defaultLangGroup;
        } else {
            fieldName = groupList && groupList[0].langGroupCd;
        }

        return preferredLangMap && preferredLangMap[fieldName];
    });

    transformToGroupCd = memoize((languageData, patientBaseInfo) => {
        let defaultLangGroup = '';
        const langGroupList = languageData.codeLangGroupDtos || [];
        patientBaseInfo.preferredLangCd && langGroupList.forEach((item, index) => {
            let filterPreferredLangList =
                languageData &&
                languageData.codePreferredLangMap &&
                languageData.codePreferredLangMap[item.langGroupCd] &&
                languageData.codePreferredLangMap[item.langGroupCd].filter(itemObj => itemObj.preferredLangCd == patientBaseInfo.preferredLangCd);
            if (filterPreferredLangList && filterPreferredLangList.length == 1) {
                defaultLangGroup = filterPreferredLangList[0] && filterPreferredLangList[0].langGroupCd;
            } else if (filterPreferredLangList && filterPreferredLangList.length == 2) {
                defaultLangGroup = filterPreferredLangList[1] && filterPreferredLangList[1].langGroupCd;

            }
        });
        return defaultLangGroup;
    });

    getClinicConfig = memoize((configName, configs, where) => {
        let config = CommonUtilities.getPriorityConfig(configName, configs, where);
        return config;
    })

    hasAccessRight = memoize(rightCd => {
        const { accessRights } = this.props;
        return accessRights && accessRights.findIndex(item => item.name === rightCd) > -1;
    })

    chineseNameOnChange = (value, patientInfo, updateFunc) => {
        let patient = _.cloneDeep(patientInfo);
        if (patient.nameChi === value) {
            return;
        }
        patient.nameChi = value;
        for (let i = 5; i >= 0; i--) {
            let name = 'ccCode' + (i + 1);
            patient[name] = '';
        }
        updateFunc({ patientInfo: patient, ccCodeChiChar: [] });
    }

    handleCoreFieldChange = (value, name, patientInfo, updateFunc) => {
        let patient = _.cloneDeep(patientInfo);
        // if (name === 'idSts') {
        //     if (value) {
        //         value = 'N';
        //     }
        //     else {
        //         value = 'T';
        //     }
        // }
        if (name === 'primaryDocTypeCd') {
            if (value !== Enum.DOC_TYPE.TRAVEL_DOCUMENTS_OVERSEAS) {
                patient['priIssueCountryCd'] = '';
            }
        }
        patient[name] = value;
        updateFunc({ patientInfo: patient });
    }

    handleOnChange = (value, name) => {
        let patient = _.cloneDeep(this.props.patientBaseInfo);
        if (name === 'isFm' || name === 'isPnsn') {
            if (value) {
                value = 1;
            }
            else {
                value = 0;
            }
        } else if (name === 'tbcPcfbDate') {
            if (value) {
                value = moment();
            }
            else {
                value = '';
            }
        } else if (name === 'patientSts') {
            if (value == 'H' || value === 'A' || value === 'P' || value === 'O' || !value) {
                patient['isPnsn'] = 0;
            }
        } else if (name === 'additionalDocTypeCd') {
            if (value !== Enum.DOC_TYPE.TRAVEL_DOCUMENTS_OVERSEAS) {
                patient['addlIssueCountryCd'] = '';
            }
            if (!value) {
                patient['additionalDocNo'] = '';
            }
        }
        patient[name] = value;
        this.props.updateState({ patientBaseInfo: patient });
        // handle preferredLanguage
        if (name === 'langGroup') {
            const preferredLangList = this.props.languageData && this.props.languageData.codePreferredLangMap && this.props.languageData.codePreferredLangMap[value];
            patient['preferredLangCd'] = preferredLangList[0] && preferredLangList[0].preferredLangCd;
            this.props.updateState({ patientBaseInfo: patient });
        }
    }

    handleOnChangeSpecialNeeds = (e, name) => {
        let patient = _.cloneDeep(this.props.patientBaseInfo);
        const _patientReminderList = _.cloneDeep(this.props.patientReminderList || []);
        patient[name] = e.value;
        let requireDto = { scope: Enum.SHARE_WITH_LIST[1].code, isEmpty: false };
        if (name === RegFieldName.DTS_SPECIALNEEDS_CATEGORY) {
            requireDto = {
                ...requireDto,
                codMsgTypeId: SPECIAL_NEEDS_ID.SPECIAL_NEED_CATG,
                remark: `Special Needs Category: ${e.label}`
            };
        } else if (name === RegFieldName.DTS_SPECIALNEEDS_SUBCATEGORY) {
            requireDto = {
                ...requireDto,
                codMsgTypeId: SPECIAL_NEEDS_ID.SPECIAL_NEED_SUB_CATG,
                remark: `Special Needs SubCategory: ${e.label}`
            };
        }
        const reminderIndex = _patientReminderList.findIndex(x => _.toString(x.codMsgTypeId) === requireDto.codMsgTypeId);
        if (reminderIndex > -1) {
            if (e.value) {
                _patientReminderList[reminderIndex] = {
                    ..._patientReminderList[reminderIndex],
                    ...requireDto
                };
            } else {
                _patientReminderList.splice(reminderIndex, 1);
                if (_patientReminderList.length <= 0) {
                    _patientReminderList.push(RegistrationUtil.initNewPatientReminderRec());
                }
            }
        } else {
            if (e.value) {
                let newReminder = RegistrationUtil.initNewPatientReminderRec();
                newReminder.seq = _patientReminderList.length;
                _patientReminderList.push({
                    ...newReminder,
                    ...requireDto
                });
            }
        }
        this.props.updateState({
            patientBaseInfo: patient,
            patientReminderList: _patientReminderList
        });
    }

    handleOnChangeAssoPerson = (value, name) => {
        let info = _.cloneDeep(this.props.assoPersonInfo);
        info[name] = value;
        this.props.updateState({ assoPersonInfo: info });
    }

    handleOnChangeBirthPlace = (e, name) => {
        let patient = _.cloneDeep(this.props.patientBaseInfo);
        patient[name] = e.value;
        // if (e.nationality) {
        //     patient['nationality'] = e.nationality;
        // }
        this.props.updateState({ patientBaseInfo: patient });
    }

    handleOnDocTypeBlur = (e) => {
        this.handleEcsChange(e);
    }

    handleOnDocNoBlur = (e, name) => {
        let patient = _.cloneDeep(this.props.patientBaseInfo);
        let value = e.target.value;
        if (name === RegFieldName.PRIMARY_DOC_NO) {
            if (PatientUtil.isHKIDFormat(patient.primaryDocTypeCd)) {
                let formatVal = PatientUtil.getHkidFormat(value);
                patient[name] = formatVal;
            }
        }
        this.handleEcsChange(e);
    }

    handleDocNOFocus = (e, name) => {
        let patient = _.cloneDeep(this.props.patientBaseInfo);
        let value = e.target.value;
        if (name === RegFieldName.PRIMARY_DOC_NO) {
            if (PatientUtil.isHKIDFormat(patient.primaryDocTypeCd)) {
                let txtVal = value.replace('(', '').replace(')', '');
                patient[name] = txtVal;
                this.props.updateState({ patientBaseInfo: patient });
            }
        }
    }

    handleEcsChange = (e) => {
        this.props.regPageKeyFieldOnBlur();
    }

    handleSearchInputBlur = (searchObj, isSearchable, smartCardData = null) => {
        if (searchObj.searchString && this.props.comDisabled && isSearchable) {
            let params = { docType: searchObj.searchType, searchString: searchObj.searchString };
            this.props.auditAction('Search Patient');
            this.props.searchPatient(params, (buttonStatus) => {
                if (buttonStatus === ButtonStatusEnum.ADD) {
                    if (smartCardData) {
                        this.props.preFillSmartCardData(smartCardData);
                    } else {
                        this.preFillPrimaryDocPair(searchObj);
                    }
                }
                let patientSearchParam = { searchType: Enum.DOC_TYPE.HKID_ID, searchValue: '' };
                this.props.updateState({ patientSearchParam });
            });
        }
        this.handleEcsChange();
    }

    preFillPrimaryDocPair = (searchObj) => {
        let patient = _.cloneDeep(this.props.patientBaseInfo);
        patient.primaryDocTypeCd = searchObj.searchType;
        patient.primaryDocNo = searchObj.searchString;
        let updateData = { patientBaseInfo: patient };
        this.props.updateState(updateData);
    }

    getValidator = (name, patientInfo, allowSingleNameInput) => {
        let validators = [], errorMessages = [];
        const { patSearchTypeList } = this.props;

        if (name === RegFieldName.PRIMARY_DOC_TYPE) {
            validators.push(ValidatorEnum.required);
            errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        } else if (name === RegFieldName.PRIMARY_DOC_NO) {
            const isHKIDFormat = PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
            validators.push(ValidatorEnum.required);
            errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            if (isHKIDFormat) {
                validators.push(ValidatorEnum.isHkid);
                let hkidFomratDocTypeList = patSearchTypeList.filter(item => item.searchTypeCd === patientInfo.primaryDocTypeCd);
                let replaceMsg = CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR((hkidFomratDocTypeList[0] && hkidFomratDocTypeList[0].dspTitle) || 'HKID Card');
                errorMessages.push(replaceMsg);
            } else {
                let selSearchType = patSearchTypeList.find(item => item.searchTypeCd === patientInfo.primaryDocTypeCd);
                let minLength = selSearchType && selSearchType.minSearchLen ? selSearchType.minSearchLen : 1;
                // let selSearchType = getSelSearchType(availDocType, searchType);
                validators.push(ValidatorEnum.minStringLength(minLength));
                errorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', minLength));
            }
        } else if (name === RegFieldName.ENGLISH_SURNAME) {
            validators.push(ValidatorEnum.isSpecialEnglish);
            errorMessages.push(CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH());
            if (allowSingleNameInput) {
                if ((!patientInfo.engSurname && !patientInfo.engGivename) || (patientInfo.engSurname === '' && patientInfo.engGivename === '')) {
                    validators.push(ValidatorEnum.required);
                    errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
                }
            }
            else {
                validators.push(ValidatorEnum.required);
                errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
            validators.push(ValidatorEnum.maxStringLength(40));
            errorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMAXWIDTH(40));
        } else if (name === RegFieldName.ENGLISH_GIVENNAME) {
            validators.push(ValidatorEnum.isSpecialEnglish);
            errorMessages.push(CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH());
            if (allowSingleNameInput) {
                if ((!patientInfo.engSurname && !patientInfo.engGivename) || (patientInfo.engSurname === '' && patientInfo.engGivename === '')) {
                    validators.push(ValidatorEnum.required);
                    errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
                }
            }
            else {
                validators.push(ValidatorEnum.required);
                errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
            validators.push(ValidatorEnum.maxStringLength(40));
            errorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMAXWIDTH(40));
        } else if (name === RegFieldName.PATIENT_STATUS) {
            const patientStsConfig = this.getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_PAT_STATUS_REQ, this.props.clinicConfig, { serviceCd: this.props.serviceCd });
            if (patientStsConfig.configValue && patientStsConfig.configValue === 'Y') {
                validators.push(ValidatorEnum.required);
                errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
        } else if (name === RegFieldName.ADDITIONAL_DOC_TYPE) {
            validators.push(ValidatorEnum.hasSameValue);
            let errorMessage = CommonMessage.VALIDATION_NOTE_HAS_SAME_VALUE();
            let messageStr = errorMessage.replace('%VALUE_A%', 'Additional Document Pair').replace('%VALUE_B%', 'Primary Document Pair');
            errorMessages.push(messageStr);
        } else if (name === RegFieldName.ADDITIONAL_DOC_NO) {
            const isHKIDFormat = PatientUtil.isHKIDFormat(patientInfo.additionalDocTypeCd);
            validators.push(ValidatorEnum.hasSameValue);
            let errorMessage = CommonMessage.VALIDATION_NOTE_HAS_SAME_VALUE();
            let messageStr = errorMessage.replace('%VALUE_A%', 'Additional Document Pair').replace('%VALUE_B%', 'Primary Document Pair');
            errorMessages.push(messageStr);
            if (isHKIDFormat) {
                validators.push(ValidatorEnum.isHkid);
                let hkidFomratDocTypeList = patSearchTypeList.filter(item => item.searchTypeCd === patientInfo.primaryDocTypeCd);
                let replaceMsg = CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR((hkidFomratDocTypeList[0] && hkidFomratDocTypeList[0].dspTitle) || 'HKID Card');
                errorMessages.push(replaceMsg);
            } else {
                let selSearchType = patSearchTypeList.find(item => item.searchTypeCd === patientInfo.additionalDocTypeCd);
                let minLength = selSearchType && selSearchType.minSearchLen ? selSearchType.minSearchLen : 1;
                // let selSearchType = getSelSearchType(availDocType, searchType);
                validators.push(ValidatorEnum.minStringLength(minLength));
                errorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', minLength));
                // validators.push(ValidatorEnum.minStringLength(6));
                // errorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', 6));
            }
            if (patientInfo.additionalDocTypeCd) {
                validators.push(ValidatorEnum.required);
                errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
        }
        return { validators, errorMessages };
    }

    getWarning = (coreInfo) => {
        let warning = [];
        if (coreInfo.primaryDocTypeCd === Enum.DOC_TYPE.BABY_WITHOUT_HKBC ||
            coreInfo.primaryDocTypeCd === Enum.DOC_TYPE.MOTHER_ID_OF_BABY) {
            warning.push(ValidatorEnum.isEnglishWarnningCharWithBabyName);
        }
        else {
            warning.push(ValidatorEnum.isEnglishWarningChar);
        }
        return warning;
    }

    resetChineseNameFieldValid = () => {
        if (this.chineseNameField) {
            this.chineseNameField.makeValid();
        }
    }

    handleUpdateIdentify = () => {
        this.props.auditAction('Update Identifier', null, null, false, 'patient');
        this.props.updateState({ hasIdentify: true });
    }

    resetSearchGroup = () => {
        // this.searchGpRef.resetAll();
        this.props.updateState({ searchType: Enum.DOC_TYPE.HKID_ID, searchValue: '' });
    }

    handleAllowSingleName = (checked, name) => {
        this.props.updateState({ [name]: checked });
    }

    checkIsSameAsPriDocPair = () => {
        // const{patientBaseInfo}=this.props;
        const patient = _.cloneDeep(this.props.patientBaseInfo);
        // let validators=[];
        // let errorMessages=[];
        // if(){
        // }

        if (patient.additionalDocTypeCd !== '' && patient.additionalDocNo !== '') {
            let result = (patient.additionalDocTypeCd === patient.primaryDocTypeCd) && (patient.additionalDocNo === patient.primaryDocNo.trim());
            return !result;
        }
        else {
            return true;
        }
    }

    handlePriDocPairOnBlur = (e) => {
        this.addlDocTypeRef.validateCurrent();
        this.addlDocNoRef.validateHKIDInput();
        this.handleEcsChange(e);
    }

    handleAddlDocPairOnBlur = () => {
        this.addlDocTypeRef.validateCurrent();
        this.addlDocNoRef.validateHKIDInput();
    }

    handleOnAssoPerHKIDBlur = e => {
        let assoPersonInfo = _.cloneDeep(this.props.assoPersonInfo);
        assoPersonInfo.assoPerHKID = e.target.value;
        if (e.target.value) {
            const hkid = PatientUtil.getCleanHKIC(e.target.value);
            this.assoPerHkidRef
                && this.assoPerHkidRef.inputRef
                && this.assoPerHkidRef.inputRef.validate(e.target.value, false, false, (isValid) => {
                    if (isValid) {
                        this.props.searchAssociatedPersonWithHKID(hkid);
                    }
                });
        } else {
            assoPersonInfo.assoPerName = '';
        }
        this.props.updateState({ assoPersonInfo: assoPersonInfo });
    }

    extDobOnChange = (dobData, patientInfo, updateFunc) => {
        let patient = _.cloneDeep(patientInfo);
        updateFunc({ patientInfo: { ...patient, ...dobData } });
    }

    isMatchAssoPerson = () => {
        const { assoPersList } = this.props;
        return assoPersList && assoPersList.length > 0 || !assoPersList;
    }

    getAssoValidators = (name) => {
        const { patientBaseInfo } = this.props;
        if (name === 'assoPerHKID') {
            let validators = [ValidatorEnum.isHkid], errorMessages = [CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR()];
            if (patientBaseInfo && patientBaseInfo.patientSts
                && patientBaseInfo.patientSts === PATIENT_STATUS.DGS
                || patientBaseInfo.patientSts === PATIENT_STATUS.DHA) {
                validators.push(ValidatorEnum.required);
                errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
            return { validators, errorMessages };
        }
        if (name === 'assoPerReltship') {
            let validators = [], errorMessages = [];
            if (patientBaseInfo && patientBaseInfo.patientSts
                && patientBaseInfo.patientSts === PATIENT_STATUS.DGS
                || patientBaseInfo.patientSts === PATIENT_STATUS.DHA) {
                validators.push(ValidatorEnum.required);
                errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
            return { validators, errorMessages };
        }
    }

    getCoreFieldProps = (name, coreInfo, updateFunc) => {
        const { registerCodeList } = this.props;
        const valid = this.getValidator(name, coreInfo, coreInfo.allowSingleNameInput);
        switch (name) {
            case 'primaryDocTypeCd': {
                const docTypeList = this.genDocTypeList(registerCodeList);
                return {
                    TextFieldProps: {
                        variant: 'outlined',
                        label: <>Document Type<RequiredIcon /></>
                    },
                    options: docTypeList.map((item) => ({ value: item.code, label: item.engDesc })),
                    absoluteMessage: true,
                    validators: valid.validators,
                    errorMessages: valid.errorMessages,
                    ref: ref => this.priDocTypeRef = ref,
                    onBlur: this.handlePriDocPairOnBlur,
                    onChange: e => this.handleCoreFieldChange(e.value, 'primaryDocTypeCd', coreInfo, updateFunc),
                    value: coreInfo.primaryDocTypeCd
                };
            }
            case 'primaryDocNo': {
                const isHKIDFormat = PatientUtil.isHKIDFormat(coreInfo.primaryDocTypeCd);
                return {
                    label: <> Document No.< RequiredIcon /></>,
                    isHKID: isHKIDFormat,
                    variant: 'outlined',
                    absoluteMessage: true,
                    validators: valid.validators,
                    errorMessages: valid.errorMessages,
                    onBlur: e => { this.handleCoreFieldChange(e.target.value, 'primaryDocNo', coreInfo, updateFunc); this.handlePriDocPairOnBlur(e); },
                    // onChange: e => this.handleCoreFieldChange(e.target.value, 'primaryDocNo', coreInfo, updateFunc),
                    value: coreInfo.primaryDocNo
                };
            }
            case 'priIssueCountryCd': {
                const priRequireIssCntry = this.isPriRequireIssCntry(coreInfo.primaryDocTypeCd);
                return {
                    TextFieldProps: {
                        variant: 'outlined',
                        label: <>Issuing Country / Region{priRequireIssCntry ? <RequiredIcon /> : null}</>
                    },
                    options: this.props.countryList && this.props.countryList.map((item) => ({ value: item.countryCd, label: item.countryName })),
                    value: coreInfo.priIssueCountryCd,
                    onChange: e => this.handleCoreFieldChange(e.value, 'priIssueCountryCd', coreInfo, updateFunc),
                    validators: priRequireIssCntry ? [ValidatorEnum.required] : [],
                    errorMessages: priRequireIssCntry ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []
                };
            }
            case 'idSts': {
                return {
                    // control: <CIMSCheckBox />,
                    // checked: coreInfo.idSts === 'N',
                    // label: 'With Proven Document',
                    // onChange: e => this.handleCoreFieldChange(e.target.checked, 'idSts', coreInfo, updateFunc)
                    //name: 'Sex',
                    labelText: 'With Proven Document',
                    isRequired: true,
                    absoluteMessage: true,
                    value: coreInfo.idSts,
                    onChange: e => this.handleCoreFieldChange(e.target.value, 'idSts', coreInfo, updateFunc),
                    // list: registerCodeList &&
                    //     registerCodeList.gender &&
                    //     registerCodeList.gender.map(item => ({ label: item.engDesc, value: item.code })),
                    list:[{label:'Yes',value:'N'},{label:'No',value:'T'}].map(item => ({ label: item.label, value: item.value })),
                    validators: [ValidatorEnum.required],
                    errorMessages: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
                    RadioGroupProps: { className: this.props.classes.radioGroup }
                };
            }
            case 'engSurname': {
                const isSurNameRequired = coreInfo.allowSingleNameInput ? coreInfo.engGivename === '' : true;
                return {
                    value: coreInfo.engSurname,
                    upperCase: true,
                    onlyOneSpace: true,
                    absoluteMessage: true,
                    variant: 'outlined',
                    trim: 'all',
                    inputProps: { maxLength: 40 },
                    label: <>Surname{isSurNameRequired ? <RequiredIcon /> : null}</>,
                    validators: valid.validators,
                    errorMessages: valid.errorMessages,
                    warning: this.getWarning(coreInfo),
                    warningMessages: [CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()],
                    onBlur: e => this.handleCoreFieldChange(e.target.value, 'engSurname', coreInfo, updateFunc)
                };
            }
            case 'engGivename': {
                const isGivenNameRequired = coreInfo.allowSingleNameInput ? coreInfo.engSurname === '' : true;
                return {
                    value: coreInfo.engGivename,
                    upperCase: true,
                    onlyOneSpace: true,
                    absoluteMessage: true,
                    variant: 'outlined',
                    trim: 'all',
                    inputProps: { maxLength: 40 },
                    label: <>Given Name{isGivenNameRequired ? <RequiredIcon /> : null}</>,
                    validators: valid.validators,
                    errorMessages: valid.errorMessages,
                    warning: [ValidatorEnum.isEnglishWarningChar],
                    warningMessages: [CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()],
                    onBlur: e => this.handleCoreFieldChange(e.target.value, 'engGivename', coreInfo, updateFunc)
                };
            }
            case 'singleNameInd': {
                return {
                    control: <CIMSCheckBox />,
                    checked: coreInfo.allowSingleNameInput,
                    label: 'Single Name Ind'
                };
            }
            case 'otherName': {
                return {
                    value: coreInfo.otherName,
                    upperCase: true,
                    onlyOneSpace: true,
                    absoluteMessage: true,
                    trim: 'all',
                    variant: 'outlined',
                    label: <>Other Name</>,
                    inputProps: { maxLength: 20 },
                    validators: [ValidatorEnum.isSpecialEnglish],
                    errorMessages: [CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()],
                    warning: [ValidatorEnum.isEnglishWarningChar],
                    warningMessages: [CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()],
                    onBlur: e => this.handleCoreFieldChange(e.target.value, 'otherName', coreInfo, updateFunc)
                };
            }
            case 'nameChi': {
                return {
                    value: coreInfo.nameChi,
                    ref: ref => this.chineseNameField = ref,
                    variant: 'outlined',
                    label: '中文姓名',
                    absoluteMessage: true,
                    trim: 'all',
                    inputProps: { maxLength: 20 },
                    // validators: [ValidatorEnum.isChinese],
                    // errorMessages: [CommonMessage.VALIDATION_NOTE_CHINESEFIELD()],
                    onBlur: e => this.chineseNameOnChange(e.target.value, coreInfo, updateFunc)
                };
            }
            case 'chinaCode': {
                return {
                    resetChineseNameFieldValid: this.resetChineseNameFieldValid,
                    ccCode1: coreInfo.ccCode1,
                    ccCode2: coreInfo.ccCode2,
                    ccCode3: coreInfo.ccCode3,
                    ccCode4: coreInfo.ccCode4,
                    ccCode5: coreInfo.ccCode5,
                    ccCode6: coreInfo.ccCode6
                };
            }
            case 'regDateBirth': {
                return {
                    handleExtDobChange: (dobData) => this.extDobOnChange(dobData, coreInfo, updateFunc),
                    onChange: (value, name) => this.handleCoreFieldChange(value, name, coreInfo, updateFunc),
                    dobValue: coreInfo.dob,
                    exact_dobValue: coreInfo.exactDobCd,
                    exact_dobList: registerCodeList && registerCodeList.exact_dob || null
                };
            }
            case 'genderCd': {
                return {
                    name: 'Sex',
                    labelText: 'Sex',
                    isRequired: true,
                    absoluteMessage: true,
                    value: coreInfo.genderCd,
                    onChange: e => this.handleCoreFieldChange(e.target.value, 'genderCd', coreInfo, updateFunc),
                    list: registerCodeList &&
                        registerCodeList.gender &&
                        registerCodeList.gender.map(item => ({ label: item.engDesc, value: item.code })),
                    validators: [ValidatorEnum.required],
                    errorMessages: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
                    RadioGroupProps: { className: this.props.classes.radioGroup }
                };
            }
            case 'babyIcon': {
                return {
                    showBabyInfoIcon: RegistrationUtil.isShowBabyIcon(coreInfo.primaryDocTypeCd),
                    onClick: () => { this.props.openBabyInfoDialog(); }
                };
            }
        }
    }

    isPriRequireIssCntry = (primaryDocTypeCd) => {
        const priDocIsOverseasDoc = PatientUtil.isOverseasDocType(primaryDocTypeCd);
        return priDocIsOverseasDoc;
    }

    render() {
        const {
            classes,
            isProblemPMI,
            registerCodeList,
            patientBaseInfo,
            comDisabled,
            countryList,
            nationalityList,
            accessRights,
            patientOperationStatus,
            languageData,
            ecs,
            ocsss,
            ecsResult,
            ocsssResult,
            clinicConfig,
            serviceCd,
            allowSingleNameInput,
            patientById,
            patientStatusList,
            // searchType, searchValue
            patientSearchParam,
            assoPersonInfo,
            viewPatDetails,
            cncPreloadData,
            isOpenSearchPmiPopup,
            isNextReg,
            siteId
        } = this.props;

        const additionalDocTypeList = this.filterDocTypeList(registerCodeList);
        const id = 'registration_personalParticulars';

        const isDataSelected = patientOperationStatus === ButtonStatusEnum.DATA_SELECTED;

        // const hkicForEcs = EcsUtilities.getProperHkicForEcs(patientBaseInfo);
        const langGroupList = this.filterLangGroupList(languageData.codeLangGroupDtos, languageData.codePreferredLangMap);
        let defaultLangGroup = this.transformToGroupCd(languageData, patientBaseInfo);
        const preferredLangList = this.filterPreferredLangList(languageData.codePreferredLangMap, langGroupList, defaultLangGroup, patientBaseInfo);
        const where = { serviceCd: serviceCd };
        const fmcbConfig = this.getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_FM_CB, clinicConfig, where);
        const pensionerConfig = this.getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_PENSIONER_CB, clinicConfig, where);
        const showAssoConfig = this.getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_ASSO_PERS, clinicConfig, where);
        const specialNeedsConfig = this.getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_SHOW_SPECIAL_NEEDS, clinicConfig, where);
        const patientStsConfig = this.getClinicConfig(Enum.CLINIC_CONFIGNAME.IS_PAT_STATUS_REQ, clinicConfig, where);
        // const searchGroupDisabled = patientOperationStatus === ButtonStatusEnum.EDIT || patientOperationStatus === ButtonStatusEnum.ADD || patientOperationStatus === ButtonStatusEnum.DATA_SELECTED;

        const addlDocNoIsHKID = PatientUtil.isHKIDFormat(patientBaseInfo.additionalDocTypeCd);
        const patientEhr = patientById.patientEhr || null;
        const formatPMINO = PatientUtil.getFormatDHPMINO(patientById.patientKey, patientBaseInfo.idSts);
        let filterRegisterCodeList = (registerCodeList && registerCodeList.doc_type || []).filter(item => item.searchTypeCd !== 'APPTID');
        const isMatchAssoPers = this.isMatchAssoPerson();
        const assoPerHKIDValidtor = this.getAssoValidators('assoPerHKID');
        const assoPerReltshipValidator = this.getAssoValidators('assoPerReltship');

        const addiDocIsOverseasDoc = PatientUtil.isOverseasDocType(patientBaseInfo.additionalDocTypeCd);
        const priRequireIssCntry = this.isPriRequireIssCntry(patientBaseInfo.primaryDocTypeCd);
        const addiRequireIssCntry = !viewPatDetails ? addiDocIsOverseasDoc : false;

        const updateFunc = ({ patientInfo, ...obj }) => this.props.updateState({ patientBaseInfo: patientInfo, ...obj });
        const coreInfo = { ...patientBaseInfo, allowSingleNameInput: allowSingleNameInput };
        const documentTypeProps = this.getCoreFieldProps('primaryDocTypeCd', patientBaseInfo, updateFunc);
        const documentNoProps = this.getCoreFieldProps('primaryDocNo', patientBaseInfo, updateFunc);
        const priIssueCountryProps = this.getCoreFieldProps('priIssueCountryCd', patientBaseInfo, updateFunc);
        const withProvenProps = this.getCoreFieldProps('idSts', patientBaseInfo, updateFunc);
        const surNameProps = this.getCoreFieldProps('engSurname', coreInfo, updateFunc);
        const giveNameProps = this.getCoreFieldProps('engGivename', coreInfo, updateFunc);
        const singleNameIndProps = this.getCoreFieldProps('singleNameInd', coreInfo, updateFunc);
        const otherNameProps = this.getCoreFieldProps('otherName', patientBaseInfo, updateFunc);
        const chineseNameProps = this.getCoreFieldProps('nameChi', patientBaseInfo, updateFunc);
        const chinaCodeProps = this.getCoreFieldProps('chinaCode', patientBaseInfo, updateFunc);
        const regDateBirthProps = this.getCoreFieldProps('regDateBirth', patientBaseInfo, updateFunc);
        const genderProps = this.getCoreFieldProps('genderCd', patientBaseInfo, updateFunc);
        const babyIconProps = this.getCoreFieldProps('babyIcon', patientBaseInfo, updateFunc);

        const additionalDocTypeValid = this.getValidator(RegFieldName.ADDITIONAL_DOC_TYPE, patientBaseInfo, allowSingleNameInput);
        const additionalDocNoValid = this.getValidator(RegFieldName.ADDITIONAL_DOC_NO, patientBaseInfo, allowSingleNameInput);
        const patientStatusValid = this.getValidator(RegFieldName.PATIENT_STATUS, patientBaseInfo, allowSingleNameInput);

        const coreFieldDisabled = patientOperationStatus !== ButtonStatusEnum.ADD;

        const useIdeas = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, serviceCd, siteId, Enum.CLINIC_CONFIGNAME.REGISTRATION_USE_IDEAS)?.paramValue === '1';

        return (
            <Grid container justify="center">
                <Grid item container className={classes.root} spacing={2}>
                    {/* <Grid item container xs={12} className={classes.grid}> */}
                    <Grid item container xs={12} justify="space-between">
                        <Grid item container xs={6} spacing={1}>
                            <Grid item container xs={9}>
                                <FormControl className={classes.form_input}>
                                    {
                                        viewPatDetails ?
                                            null :
                                            <PatientSearchGroup
                                                id={`${id}_patient_search_group`}
                                                // searchType={searchType}
                                                // searchValue={searchValue}
                                                patientSearchParam={patientSearchParam}
                                                searchInputOnBlur={this.handleSearchInputBlur}
                                                disabled={patientOperationStatus === ButtonStatusEnum.EDIT || patientOperationStatus === ButtonStatusEnum.ADD}
                                                hasNameSearchRight={this.hasAccessRight(AccessRightEnum.patientNameSearch)}
                                                docTypeList={filterRegisterCodeList}
                                                optLbl={'engDesc'}
                                                optVal={'code'}
                                                updateState={this.props.updateState}
                                                allDocType
                                                useIdeas={useIdeas}
                                            />
                                    }
                                </FormControl>
                            </Grid>
                            {
                                isProblemPMI ?
                                    <Grid item container xs={3}>
                                        <Chip className={classes.chip} label="CHECK ID" />
                                    </Grid> : null
                            }
                        </Grid>
                        <Grid item container xs={6} spacing={1} style={{ justifyContent: 'flex-end' }}>
                            <Grid item container xs={4}>
                                <FormControl className={classes.form_input}>
                                    <FastTextFieldValidator
                                        id={`${id}_ehrNumber`}
                                        label="eHR Number"
                                        variant="outlined"
                                        InputProps={{
                                            readOnly: true
                                        }}
                                        value={patientEhr ? patientEhr.ehrNo : ''}
                                        fullWidth
                                        disabled
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item container xs={4}>
                                <FormControl className={classes.form_input}>
                                    <FastTextFieldValidator
                                        id={`${id}_dhPMINumber`}
                                        label="DH PMI Number"
                                        variant="outlined"
                                        InputProps={{
                                            readOnly: true
                                        }}
                                        fullWidth
                                        disabled
                                        // value={patientById.patientKey}
                                        value={formatPMINO}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item container xs={3}>
                                <FormControl>
                                    {
                                        viewPatDetails || !coreFieldDisabled ?
                                            null :
                                            <CIMSButton
                                                id={`${id}_update_identifier`}
                                                children={'Update Identifier'}
                                                classes={{ sizeSmall: classes.updateIndentifierBtn }}
                                                className={classes.customSecondaryBtn}
                                                fullWidth
                                                color={'secondary'}
                                                disabled={comDisabled}
                                                onClick={this.handleUpdateIdentify}
                                            />
                                    }
                                </FormControl>
                            </Grid>

                        </Grid>
                    </Grid>
                    <Grid item container xs={12} spacing={1}>
                        {
                            patientOperationStatus === ButtonStatusEnum.ADD ?
                                <BabyIcon
                                    {...babyIconProps}
                                    id="personalParticulars_babyInfoButton"
                                    disabled={viewPatDetails}
                                /> : null
                        }
                        <Grid item container xs={10} spacing={1}>
                            <Grid item container xs={4} className={classes.grid}>
                                <FormControl className={classes.form_input}>
                                    <SelectFieldValidator
                                        {...documentTypeProps}
                                        id={id + '_documentType'}
                                        isDisabled={viewPatDetails || coreFieldDisabled}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item container xs={4} className={classes.grid}>
                                <FormControl className={classes.form_input}>
                                    <HKIDInput
                                        {...documentNoProps}
                                        id={id + '_documentNumber'}
                                        disabled={viewPatDetails || coreFieldDisabled}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item container xs={4} className={classes.grid}>
                                <FormControl className={classes.form_input}>
                                    <SelectFieldValidator
                                        {...priIssueCountryProps}
                                        id={id + '_issuing_country_region'}
                                        isDisabled={viewPatDetails || !priRequireIssCntry || coreFieldDisabled}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid item container xs={2} className={classes.grid} style={{ justifyContent: 'flex-end' }}>
                            <FormControl className={classes.form_input}>
                                <OutlinedRadioValidator
                                    {...withProvenProps}
                                    id={`${id}_with_proven_document`}
                                    disabled={comDisabled || coreFieldDisabled || (patientById.idSts === 'N'&&patientById.patientKey>0)}
                                />
                            </FormControl>


                        </Grid>
                    </Grid>
                    <Grid item container xs={12} spacing={1}>
                        <Grid item container xs={10} spacing={1}>
                            <Grid item container xs={4} className={classes.grid}>
                                <FormControl className={classes.form_input}>
                                    <FastTextFieldValidator
                                        {...surNameProps}
                                        id={id + '_surName'}
                                        disabled={viewPatDetails || coreFieldDisabled}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item container xs={4} className={classes.grid}>
                                <FormControl className={classes.form_input}>
                                    <FastTextFieldValidator
                                        {...giveNameProps}
                                        id={id + '_givenName'}
                                        disabled={viewPatDetails || coreFieldDisabled}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item container xs={4} className={classes.grid}>
                                <FormControl className={classes.form_input}>
                                    <FastTextFieldValidator
                                        {...otherNameProps}
                                        id={id + '_otherName'}
                                        disabled={viewPatDetails || coreFieldDisabled}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid item container xs={2} className={classes.grid} style={{ justifyContent: 'flex-end' }}>
                            <FormControlLabel className={classes.form_input}
                                {...singleNameIndProps}
                                id={`${id}_single_name_ind`}
                                style={{ display: viewPatDetails ? 'none' : '' }}
                                disabled={viewPatDetails || coreFieldDisabled}
                                onChange={e => this.handleAllowSingleName(e.target.checked, 'allowSingleNameInput')}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container xs={12} className={classes.grid} spacing={1}>
                        <Grid item container xs={6} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <RegChCodeField
                                    {...chinaCodeProps}
                                    id={id + '_chinaCode'}
                                    updateChiChar={this.props.updateChiChar}
                                    comDisabled={comDisabled || coreFieldDisabled}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item container xs={2} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <FastTextFieldValidator
                                    {...chineseNameProps}
                                    id={id + '_chineseName'}
                                    disabled={comDisabled || coreFieldDisabled}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item container xs={4} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <SelectFieldValidator
                                    id={id + '_birthPlace'}
                                    options={countryList.map((item) => (
                                        { value: item.countryCd, label: item.countryName, nationality: item.nationality }))
                                    }
                                    value={patientBaseInfo.birthPlaceCd}
                                    onChange={e => this.handleOnChangeBirthPlace(e, RegFieldName.BIRTH_PLACE)}
                                    addNullOption
                                    isDisabled={comDisabled || viewPatDetails}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: 'Birth Place'
                                    }}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item container xs={12} className={classes.grid} spacing={1}>
                        <Grid item container xs={4} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <RegDateBirthField
                                    {...regDateBirthProps}
                                    id={id + '_birthField'}
                                    comDisabled={viewPatDetails || coreFieldDisabled}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item container xs={4} className={classes.grid}>
                            <OutlinedRadioValidator
                                {...genderProps}
                                id={id + '_genderCd'}
                                disabled={viewPatDetails || coreFieldDisabled}
                            />
                        </Grid>
                        <Grid item container xs={4} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <SelectFieldValidator
                                    id={id + '_nationality'}
                                    options={nationalityList.map((item) => (
                                        { value: item, label: item }))
                                    }
                                    value={patientBaseInfo.nationality}
                                    addNullOption
                                    onChange={e => this.handleOnChange(e.value, 'nationality')}
                                    isDisabled={comDisabled}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: 'Nationality'
                                    }}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item container xs={12} className={classes.grid} spacing={1}>
                        <Grid item container xs={6} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <SelectFieldValidator
                                    id={id + '_translationLanguage'}
                                    options={
                                        langGroupList &&
                                        langGroupList.map((item) => (
                                            { value: item.langGroupCd, label: ((item.engPreferredLang ? item.engPreferredLang : '') + ' ') + (item.tchPreferredLang ? item.tchPreferredLang : '') }))}
                                    value={(patientBaseInfo.langGroup != 'E' && patientBaseInfo.langGroup) || (defaultLangGroup) || (langGroupList && langGroupList[0].langGroupCd)}
                                    onChange={(e) => this.handleOnChange(e.value, 'langGroup')}
                                    absoluteMessage
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    isDisabled={comDisabled}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Preferred Language/Interpreter Service Type<RequiredIcon /></>
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item container xs={6} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <SelectFieldValidator
                                    id={id + '_preferredLanguage'}
                                    options={preferredLangList && preferredLangList.map((item) => (
                                        { value: item.preferredLangCd, label: ((item.engLangCategory ? item.engLangCategory : '') + ' ') + (item.tcnLangCategory ? item.tcnLangCategory : '') + (item.remark ? ' (' + item.remark + ')' : '') }))
                                    }
                                    value={(patientBaseInfo.preferredLangCd != 'E' && patientBaseInfo.preferredLangCd) || (preferredLangList && preferredLangList[0] && preferredLangList[0].preferredLangCd)}
                                    onChange={e => this.handleOnChange(e.value, 'preferredLangCd')}
                                    absoluteMessage
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    isDisabled={comDisabled}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Preferred Language/Interpreter Service Language<RequiredIcon /></>
                                    }}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item container xs={12} className={classes.grid} spacing={1}>
                        <Grid item container xs={4} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <SelectFieldValidator
                                    id={id + '_additional_documentType'}
                                    isDisabled={comDisabled}
                                    ref={ref => this.addlDocTypeRef = ref}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: 'Additional Document Type'
                                    }}
                                    options={
                                        additionalDocTypeList.map((item) => (
                                            { value: item.code, label: item.engDesc }))}
                                    value={patientBaseInfo.additionalDocTypeCd}
                                    addNullOption
                                    absoluteMessage
                                    onBlur={this.handleAddlDocPairOnBlur}
                                    validators={additionalDocTypeValid.validators}
                                    errorMessages={additionalDocTypeValid.errorMessages}
                                    onChange={e => this.handleOnChange(e.value, RegFieldName.ADDITIONAL_DOC_TYPE)}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item container xs={4} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <HKIDInput
                                    isHKID={addlDocNoIsHKID}
                                    id={id + '_additional_documentNumber'}
                                    ref={ref => this.addlDocNoRef = ref}
                                    label={<>Additional Document No.{patientBaseInfo.additionalDocTypeCd ? <RequiredIcon /> : null} </>}
                                    variant="outlined"
                                    disabled={comDisabled}
                                    absoluteMessage
                                    // eslint-disable-next-line
                                    // inputProps={{ maxLength: addlDocNoIsHKID ? 9 : 30 }}
                                    name={RegFieldName.DOCUMENT_NUMBER}
                                    value={patientBaseInfo.additionalDocNo}
                                    onBlur={e => { this.handleOnChange(e.target.value, RegFieldName.ADDITIONAL_DOC_NO); this.handleAddlDocPairOnBlur(e); }}
                                    validators={additionalDocNoValid.validators}
                                    errorMessages={additionalDocNoValid.errorMessages}
                                // onChange={e => this.handleOnChange(e.target.value, RegFieldName.ADDITIONAL_DOC_NO)}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item container xs={4} className={classes.grid}>
                            <FormControl className={classes.form_input}>
                                <SelectFieldValidator
                                    id={id + '_additional_document_issuing_country_region'}
                                    isDisabled={comDisabled || !addiRequireIssCntry}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Additional Document Issuing Country / Region{addiRequireIssCntry ? <RequiredIcon /> : null}</>
                                    }}
                                    options={countryList.map((item) => (
                                        { value: item.countryCd, label: item.countryName }))
                                    }
                                    value={patientBaseInfo.addlIssueCountryCd}
                                    onChange={e => this.handleOnChange(e.value, RegFieldName.ADDITIONAL_ISSUE_COUNTRY_CD)}
                                    validators={addiRequireIssCntry ? [ValidatorEnum.required] : []}
                                    errorMessages={addiRequireIssCntry ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item container xs={12} spacing={1}>
                        <Grid item container xs={6} className={classes.grid}>
                            <Box display="flex" width={1} >
                                <Box display="flex" width={0.6} pr={1}>
                                    <Box pr={1}>
                                        <CIMSButton
                                            id={id + '_ecsBtn'}
                                            disabled={!EcsUtilities.isEcsEnable(
                                                accessRights,
                                                ecs.docTypeCds,
                                                ecs.ecsUserId,
                                                ecs.ecsLocCode,
                                                !isDataSelected,
                                                ecs.ecsServiceStatus,
                                                ecs.hkicForEcs) || viewPatDetails}
                                            style={EcsUtilities.getEcsBtnStyle()}
                                            onClick={(e) => {
                                                if (isDataSelected) {
                                                    this.props.checkEcs(
                                                        EcsUtilities.getEcsParamsForDirectCall(
                                                            ecs.ecsUserId,
                                                            ecs.dob,
                                                            ecs.exactDobCd,
                                                            ecs.hkicForEcs,
                                                            ecs.ecsLocCode,
                                                            ecs.patientKey,
                                                            null
                                                        ),
                                                        ecs.hkicForEcs,
                                                        null,
                                                        setEcsPatientStatusInRegPage
                                                    );
                                                } else {
                                                    this.props.openEcsDialog({
                                                        docTypeCd: ecs.docTypeCd,
                                                        disableMajorKeys: isDataSelected || patientOperationStatus === ButtonStatusEnum.ADD || patientOperationStatus === ButtonStatusEnum.EDIT,
                                                        engSurname: ecs.engSurname,
                                                        engGivename: ecs.engGivename,
                                                        chineseName: ecs.chineseName,
                                                        cimsUser: ecs.ecsUserId,
                                                        locationCode: ecs.ecsLocCode,
                                                        patientKey: ecs.patientKey,
                                                        hkid: ecs.hkicForEcs,
                                                        dob: ecs.dob,
                                                        exactDob: ecs.exactDobCd,
                                                        mustBeAssociated: false
                                                    },
                                                        null,
                                                        setEcsPatientStatusInRegPage);
                                                }
                                            }}
                                        >{EcsUtilities.getEcsBtnName()}</CIMSButton>
                                    </Box>

                                    {
                                        <Box pr={1}>
                                            <CIMSButton
                                                id={id + '_ecsAssocBtn'}
                                                disabled={!EcsUtilities.isEcsEnable(
                                                    accessRights,
                                                    ecs.docTypeCds,
                                                    ecs.ecsUserId,
                                                    ecs.ecsLocCode,
                                                    false,
                                                    ecs.ecsServiceStatus,
                                                    ecs.hkicForEcs,
                                                    true) || viewPatDetails}
                                                style={EcsUtilities.getEcsAssocBtnStyle()}
                                                onClick={(e) => {
                                                    this.props.openEcsDialog({
                                                        docTypeCd: ecs.docTypeCd,
                                                        disableMajorKeys: true,
                                                        engSurname: ecs.engSurname,
                                                        engGivename: ecs.engGivename,
                                                        chineseName: ecs.chineseName,
                                                        cimsUser: ecs.ecsUserId,
                                                        locationCode: ecs.ecsLocCode,
                                                        patientKey: ecs.patientKey,
                                                        hkid: ecs.hkicForEcs,
                                                        dob: ecs.dob,
                                                        exactDob: ecs.exactDobCd,
                                                        mustBeAssociated: true,
                                                        associatedHkic: assoPersonInfo.assoPerHKID
                                                    },
                                                        null,
                                                        setEcsPatientStatusInRegPage);
                                                }}
                                            >{EcsUtilities.getEcsAssoBtnName()}</CIMSButton>
                                        </Box>

                                    }

                                    <Box flexGrow={1}>
                                        <EcsResultTextField id={id + '_ecsResultTxt'} ecsStore={ecsResult} fullWidth ></EcsResultTextField>
                                    </Box>
                                </Box>
                                <Box display="flex" width={0.4}>
                                    <Box pr={1}>
                                        <CIMSButton
                                            id={id + '_ocsssBtn'}
                                            style={{ padding: '0px', margin: '0px' }}
                                            disabled={!EcsUtilities.isOcsssEnable(
                                                accessRights,
                                                ocsss.docTypeCds,
                                                ocsss.ocsssServiceStatus,
                                                ocsss.hkicForEcs,
                                                ocsss.ecsUserId,
                                                ocsss.ecsLocId
                                            )
                                                || isOpenSearchPmiPopup
                                                || patientOperationStatus === ButtonStatusEnum.VIEW
                                                || ocsssResult.isValid
                                                || viewPatDetails
                                            }
                                            onClick={(e) => {
                                                this.props.openOcsssDialog({
                                                    hkid: ocsss.hkicForEcs,
                                                    patientKey: ocsss.patientKey,
                                                    ecsUserName: ocsss.ecsUserId,
                                                    ecsLocationId: ocsss.ecsLocId
                                                }, null, setOcsssPatientStatusInRegPage, this.props.checkOcsss);
                                            }}
                                        >OCSSS</CIMSButton>

                                    </Box>
                                    <Box flexGrow={1}>
                                        <OcsssResultTextField id={id + '_ocsssResultTxt'} ocsssStore={ocsssResult} fullWidth ></OcsssResultTextField>
                                    </Box>
                                </Box>

                            </Box>
                        </Grid>
                    </Grid>
                    <Grid item container xs={12} spacing={1}>
                        <Grid item container xs={2} className={classes.grid}>
                            <SelectFieldValidator
                                id={`${id}_patient_status`}
                                isDisabled={comDisabled}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Patient Status{patientStsConfig.configValue && patientStsConfig.configValue === 'Y' ? <RequiredIcon /> : null}</>
                                }}
                                absoluteMessage
                                value={patientBaseInfo.patientSts}
                                validators={patientStatusValid.validators}
                                errorMessages={patientStatusValid.errorMessages}
                                options={patientStatusList && patientStatusList.map((item) => ({ value: item.code, label: item.superCode }))}
                                onChange={e => this.handleOnChange(e.value, RegFieldName.PATIENT_STATUS)}
                                addNullOption
                            />
                        </Grid>
                        {
                            serviceCd === SERVICE_CODE.ANT ?
                                <Grid item container xs={2} className={classes.grid}>
                                    <FormControlLabel className={classes.form_input}
                                        control={
                                            <CIMSCheckBox
                                                id={`${id}_ccdsCase`}
                                                onChange={e => this.handleOnChange(e.target.checked ? 1 : 0, 'isCCDS')}
                                            />
                                        }
                                        label={'CCDS Case'}
                                        disabled={comDisabled}
                                        checked={patientBaseInfo.isCCDS === 1}
                                    />
                                </Grid>
                                : null
                        }
                        {
                            serviceCd === SERVICE_CODE.TBC ?
                                <Grid item container xs={2} className={classes.grid}>
                                    <FormControlLabel className={classes.form_input}
                                        control={
                                            <CIMSCheckBox
                                                id={`${id}_joinedPCFB`}
                                                value={patientBaseInfo.tbcPcfbDate}
                                                onChange={e => this.handleOnChange(e.target.checked, RegFieldName.JOINED_PCFB)}
                                            />
                                        }
                                        label={'PMCO Compensated'}
                                        disabled={comDisabled}
                                        checked={patientBaseInfo.tbcPcfbDate}
                                    />
                                </Grid>
                                : null
                        }
                        {
                            fmcbConfig.configValue && fmcbConfig.configValue === 'Y' ?
                                <Grid item container xs={2} className={classes.grid}>
                                    <FormControlLabel className={classes.form_input}
                                        control={
                                            <CIMSCheckBox
                                                id={`${id}_eligible_for_NTKFMTC`}
                                                value={patientBaseInfo.isFm}
                                                onChange={e => this.handleOnChange(e.target.checked, RegFieldName.ELIGIBLE_FOR_NTKFMTC)}
                                            />
                                        }
                                        label={'Eligible for NTKFMTC'}
                                        disabled={comDisabled}
                                        checked={patientBaseInfo.isFm === 1}
                                    />
                                </Grid>
                                : null
                        }
                        {
                            pensionerConfig.configValue && pensionerConfig.configValue === 'Y' ?
                                <Grid item container xs={1} className={classes.grid}>
                                    <FormControlLabel className={classes.form_input}
                                        control={
                                            <CIMSCheckBox
                                                id={`${id}_pensioner`}
                                                value={patientBaseInfo.isPnsn}
                                                onChange={e => this.handleOnChange(e.target.checked, RegFieldName.PENSIONER)}
                                            />
                                        }
                                        label={'Pensioner'}
                                        disabled={comDisabled || (!(patientBaseInfo.patientSts === PATIENT_STATUS.GS) && !(patientBaseInfo.patientSts === PATIENT_STATUS.DGS))}  //CIMSDENT-3  Enable Pensioner checkbox for GS / DGS patient status only
                                        checked={patientBaseInfo.isPnsn === 1}
                                    />
                                </Grid>
                                : null
                        }
                        {
                            pensionerConfig.configValue
                                && pensionerConfig.configValue === 'Y'
                                && showAssoConfig.configValue
                                && parseInt(showAssoConfig.configValue) === 1 ?
                                <>
                                    <Grid item container xs={2} className={classes.grid}>
                                        <HKIDInput
                                            id={id + '_associated_person_hkid'}
                                            ref={r => this.assoPerHkidRef = r}
                                            isHKID
                                            inputRef={ref => this.assoPerHkidInpuRef = ref}
                                            disabled={comDisabled}
                                            label={<>HKID (Associated Person){assoPerHKIDValidtor.validators.findIndex(x => x === ValidatorEnum.required) > -1 ? <RequiredIcon /> : ''}</>}
                                            variant="outlined"
                                            absoluteMessage
                                            value={assoPersonInfo.assoPerHKID}
                                            onBlur={this.handleOnAssoPerHKIDBlur}
                                            validators={assoPerHKIDValidtor.validators}
                                            errorMessages={assoPerHKIDValidtor.errorMessages}
                                            // onChange={e => this.handleOnChangeAssoPerson(e.target.value, 'assoPerHKID')}
                                            onKeyDown={(e) => {
                                                if (e.keyCode === 13) {
                                                    this.assoPerHkidInpuRef.blur();
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item container xs={4} className={classes.grid}>
                                        <FastTextFieldValidator
                                            id={`${id}_associated_person_name`}
                                            ref={r => this.associatedPersonNameRef = r}
                                            label={'Associated Person Name'}
                                            variant={'outlined'}
                                            disabled={comDisabled || isMatchAssoPers}
                                            inputProps={{ maxLength: 160 }}
                                            calActualLength
                                            upperCase
                                            onlyOneSpace
                                            absoluteMessage
                                            trim={'all'}
                                            value={assoPersonInfo.assoPerName}
                                            validators={[
                                                ValidatorEnum.isSpecialEnglish,
                                                ValidatorEnum.maxStringLength(160)
                                            ]}
                                            errorMessages={[
                                                CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH(),
                                                CommonMessage.VALIDATION_NOTE_BELOWMAXWIDTH(160)
                                            ]}
                                            warning={[ValidatorEnum.isEnglishWarningChar]}
                                            warningMessages={[CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                                            onBlur={e => this.handleOnChangeAssoPerson(e.target.value, 'assoPerName')}
                                        />
                                    </Grid>
                                    <Grid item container xs={3} className={classes.grid}>
                                        <SelectFieldValidator
                                            id={`${id}_associated_person_relationShip`}
                                            isDisabled={comDisabled}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: <>Relationship with Associated Person{assoPerReltshipValidator.validators.findIndex(x => x === ValidatorEnum.required) > -1 ? <RequiredIcon /> : ''}</>
                                            }}
                                            value={assoPersonInfo.assoPerReltship}
                                            options={[
                                                { label: 'Spouse', value: 'S' },
                                                { label: 'Father', value: 'F' },
                                                { label: 'Mother', value: 'M' }
                                            ]}
                                            onChange={e => this.handleOnChangeAssoPerson(e.value, 'assoPerReltship')}
                                            validators={assoPerReltshipValidator.validators}
                                            errorMessages={assoPerReltshipValidator.errorMessages}
                                        />
                                    </Grid>
                                </>
                                : null
                        }
                        {
                            specialNeedsConfig.configValue && specialNeedsConfig.configValue === 'Y' ?
                                <Grid item container xs={4} className={classes.grid}>
                                    <SelectFieldValidator
                                        id={`${id}_sepcial_need_category`}
                                        isDisabled={comDisabled}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Special Needs (Category)</>
                                        }}
                                        options={getCodeDescriptionByCategory(['SPECIAL NEEDS CATEGORY'], cncPreloadData, 'cnc').map((item) => (
                                            { value: item.codCncId, label: item.code }))}
                                        value={patientBaseInfo.dtsSpecNeedCatgryId}
                                        sortBy="label"
                                        addNullOption
                                        onChange={e => this.handleOnChangeSpecialNeeds(e, RegFieldName.DTS_SPECIALNEEDS_CATEGORY)}
                                    />
                                </Grid>
                                : null
                        }
                        {
                            specialNeedsConfig.configValue && specialNeedsConfig.configValue === 'Y' ?
                                <Grid item container xs={4} className={classes.grid}>
                                    <SelectFieldValidator
                                        id={`${id}_sepcial_need_sub_category`}
                                        isDisabled={comDisabled}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: <>Special Needs (Sub-category)</>
                                        }}
                                        options={getCodeDescriptionByCategory(['SPECIAL NEEDS SUB-CATEGORY'], cncPreloadData, 'cnc').map((item) => (
                                            { value: item.codCncId, label: item.code }))}
                                        value={patientBaseInfo.dtsSpecNeedScatgryId}
                                        sortBy="label"
                                        addNullOption
                                        onChange={e => this.handleOnChangeSpecialNeeds(e, RegFieldName.DTS_SPECIALNEEDS_SUBCATEGORY)}
                                    />
                                </Grid>
                                : null
                        }
                    </Grid>

                    {serviceCd === 'CGS' && <FamilyNoFormGroup comDisabled={comDisabled} isNextReg={isNextReg}/>}

                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = state => {
    return {
        loginInfo: state.login.loginInfo,
        clinicInfo: state.login.clinic,
        accessRights: state.login.accessRights,
        patientOperationStatus: state.registration.patientOperationStatus,
        registerCodeList: state.registration.codeList,
        nationalityList: state.patient.nationalityList || [],
        countryList: state.patient.countryList || [],
        patientBaseInfo: state.registration.patientBaseInfo,
        languageData: state.patient.languageData,
        patientById: state.registration.patientById,
        ecs: ecsSelector(state, regPatientInfoSelector, regPatientKeySelector),
        ocsss: ocsssSelector(state, regPatientInfoSelector, regPatientKeySelector),
        ecsResetFlag: state.ecs.shouldRegPageClearResult,
        ocsssServiceStatus: state.ecs.ocsssServiceStatus,
        ecsResult: state.ecs.regSummaryEcsStatus,
        ocsssResult: state.ecs.regSummaryOcsssStatus,
        isProblemPMI: state.registration.isProblemPMI,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        passportList: state.common.passportList,
        allowSingleNameInput: state.registration.allowSingleNameInput,
        autoFocus: state.registration.autoFocus,
        patientStatusList: state.common.commonCodeList.patient_status,
        // searchType: state.registration.searchType,
        // searchValue: state.registration.searchValue
        patientSearchParam: state.registration.patientSearchParam,
        patSearchTypeList: state.common.patSearchTypeList,
        loadErrorParameter: state.registration.loadErrorParameter,
        assoPersList: state.registration.assoPersList,
        focusAssoPerName: state.registration.focusAssoPerName,
        assoPersonInfo: state.registration.assoPersonInfo,
        viewPatDetails: state.registration.viewPatDetails,
        cncPreloadData: state.dtsPreloadData.cncCodeList,
        patientReminderList: state.registration.patientReminderList,
        isOpenSearchPmiPopup: state.registration.isOpenSearchPmiPopup,
        pmiGrpName: state.registration.patientBaseInfo.pmiGrpName,
        siteId: state.login.clinic.siteId
    };
};

const mapDispatchToProps = {
    updateState,
    searchPatient,
    updateChiChar,
    openCommonCircular,
    closeCommonCircular,
    checkEcs,
    checkOcsss,
    setEcsPatientStatus,
    resetEcsPatientStatus,
    resetOcsssPatientStatus,
    openCommonMessage,
    completeRegPageReset,
    openEcsDialog,
    openOcsssDialog,
    regPageKeyFieldOnBlur,
    auditAction,
    searchAssociatedPersonWithHKID,
    updatePatientBaseInfo
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PersonalParticulars));