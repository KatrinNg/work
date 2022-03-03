import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography
} from '@material-ui/core';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import CommonRegex from '../../../../constants/commonRegex';
import _ from 'lodash';
import FieldConstant from '../../../../constants/fieldConstant';
import HKIDInput from '../../../compontent/hkidInput';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import PatientSearchGroup from '../../../compontent/patientSearchGroup';
import PhoneField from '../../../registration/component/phones/phoneField';
import Enum from '../../../../enums/enum';
import moment from 'moment';
import PatientSearchDialog from '../../../compontent/patientSearchResultDialog';
import NewPMISearchResultDialog from '../../../compontent/newPMISearchResultDialog';
import { auditAction } from '../../../../store/actions/als/logAction';
import {
    initAnonymousPersonalInfo
} from '../../../../constants/appointment/bookingInformation/bookingInformationConstants';
import {
    checkPatientName
} from '../../../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import { CommonUtil, SiteParamsUtil } from '../../../../utilities';
import { anonPageStatus } from '../../../../enums/appointment/booking/bookingEnum';

const styles = () => ({
    root: {
        width: '100%'
        //borderLeft:'none'
        // borderBottom: '1px solid #dcdcdc'
        //
    },
    title: {
        marginBottom: '1.5rem'
    },
    formRoot: {
        width: '100%',
        display: 'flex'
    },
    containerRoot: {
        //width:'100%',
        display: 'flex'
    },
    itemRoot: {
        margin: 10,
        flex: 1
    },
    formLabelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    }
});

class anonymousPatientBar extends Component {

    componentDidMount() {
        this.handleResetButtonClick();
    }

    shouldComponentUpdate(nextP) {
        if (nextP.patientList !== this.props.patientList) {


            if (nextP.patientList.length > 1) {
                //do something.
            } else if (nextP.patientList.length === 1) {
                let patInfo = this.loadSearchPatient(nextP.patientList[0]);
                this.props.updateState({ ...patInfo });
            } else {
                return true;
            }
        }
        return true;
    }

    invalidFieldList = [];

    fillingPatientInfo = (info) => {
        let emptyFieldCount = 0;


        if (!this.props.anonPatientInfo.patientKey) {
            for (let i in info) {
                if (info[i] === '' && i !== 'docNo' && i !== 'docTypeCd') {
                    emptyFieldCount++;
                }
            }

            if (info.docTypeCd === 'ID' && !info.isHKIDValid) {
                emptyFieldCount++;
            }

            if (!info.mobile.phoneTypeCd || !info.mobile.phoneNo) {
                emptyFieldCount++;
            }
        }

        let anonPatientInfo = null;
        if (emptyFieldCount === 0 && this.invalidFieldList.length === 0) {
            let tempDocTypeCd = info.docNo !== '' ? info.docTypeCd : '';
            const isHKIDFormat = PatientUtil.isHKIDFormat(info.docTypeCd);
            anonPatientInfo = {
                ...this.props.anonPatientInfo,
                //docTypeCd: info.docTypeCd,
                docTypeCd: tempDocTypeCd,
                surname: _.toUpper(info.surname),
                givenName: _.toUpper(info.givenName),
                hkid: isHKIDFormat ? PatientUtil.getCleanHKIC(_.toUpper(info.docNo || '')) : '',
                otherDocNo: isHKIDFormat ? '' : _.toUpper(info.docNo || ''),
                mobile: info.mobile,
                // countryCd: info.ctryCd,
                dialingCd: info.dialingCd,
                deadInd: '0',
                patientKey: this.props.anonPatientInfo.patientKey || '0',
                version: info.version,
                docNo: isHKIDFormat ? PatientUtil.getCleanHKIC(_.toUpper(info.docNo || '')) : ''
            };
        }

        this.props.updateState({ anonPatientInfo: anonPatientInfo });
    }

    handleDocTypeChange = (e) => {
        let patient = {
            ...this.props.patient,
            docTypeCd: e.value
        };
        this.updateAnonymousPatientInfo(patient);
    }

    handleInputsChange = (e, name) => {
        let reg = '';
        let value = e.target.value;

        if (name === 'mobile') {
            reg = new RegExp(CommonRegex.VALIDATION_REGEX_NOT_NUMBER);
        } else {
            reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        }

        if (reg.test(value)) {
            return;
        }

        let patient = { ...this.props.patient };
        patient[name] = value;
        this.updateAnonymousPatientInfo(patient);
    }

    validatorListener = (isvalid, name) => {
        let patientInfo = { ...this.props.patient };
        if (!isvalid) {
            patientInfo[name] = '';
            if (this.invalidFieldList.indexOf(name) < 0) {
                this.invalidFieldList.push(name);
            }
        } else {
            let tempInvalidFieldList = [];
            this.invalidFieldList.forEach(f => {
                if (f !== name) {
                    tempInvalidFieldList.push(f);
                }
                this.invalidFieldList = tempInvalidFieldList;
            });
        }
        this.fillingPatientInfo(patientInfo);
    }

    handleCountryCdChange = (e) => {
        let patient = {
            ...this.props.patient,
            countryCd: e.value
        };
        this.refs.mobile.validateCurrent();
        this.updateAnonymousPatientInfo(patient);
    }

    // handleDocNoChange = (value) => {
    //     let reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
    //     if (reg.test(value)) {
    //         return;
    //     }

    //     let inputProps = this.refs.docNo.props.inputProps;
    //     if (inputProps.maxLength && value.length > inputProps.maxLength) {
    //         value = value.slice(0, inputProps.maxLength);
    //     }
    // }

    handleContactPhoneChange = (value, name) => {
        let contactPhone = _.cloneDeep(this.props.contactPhone);
        if (name === 'countryCd') {
            contactPhone['areaCd'] = '';
            let countryOptionsObj = this.props.countryList.find(item => item.countryCd == value);
            let dialingCd = countryOptionsObj && countryOptionsObj.dialingCd;
            contactPhone['dialingCd'] = dialingCd;
        }
        // phoneList[index][name] = value;
        if (name === 'phoneTypeCd') {
            if (value === Enum.PHONE_TYPE_MOBILE_SMS) {
                contactPhone['phoneTypeCd'] = Enum.PHONE_TYPE_MOBILE_PHONE;
                // contactPhone['countryCd'] = FieldConstant.COUNTRY_CODE_DEFAULT_VALUE;
                contactPhone['dialingCd'] = FieldConstant.DIALING_CODE_DEFAULT_VALUE;
                contactPhone['smsPhoneInd'] = '1';
            } else {
                contactPhone['smsPhoneInd'] = '0';
            }
        }
        if (name === 'dialingCd') {
            value = value.replace(/[^0-9]/ig, '');
            if (value !== contactPhone['dialingCd']) {
                contactPhone['areaCd'] = '';
            }
        }
        contactPhone[name] = value;

        let bookingAnonymousInformation = this.props.bookingAnonymousInformation;

        bookingAnonymousInformation.anonyomousBookingActiveInfo.mobile = contactPhone;

        // const selectSMSMobile = this.phoneListHasSMSMobile(phoneList);
        // this.props.onChange(phoneList, selectSMSMobile);
        this.props.updateField({ bookingAnonymousInformation: bookingAnonymousInformation });

        this.validatorListener(contactPhone, 'mobile');
    }

    preFillDocPair = (searchObj) => {
        const { codeList, patSearchTypeList } = this.props;
        const { searchType, searchString } = searchObj;
        let selSearchType = patSearchTypeList.find(item => {
            if (item.searchTypeCd === searchType && item.searchTypeCd !== 'APPTID') {
                return item;
            } else {
                return undefined;
            }
        });
        if (selSearchType && selSearchType.isDocType === 1) {
            let docType = codeList.doc_type.find(item => item.code === searchType);
            let anonPatientInfo = _.cloneDeep(initAnonymousPersonalInfo);
            if (docType) {
                anonPatientInfo.docTypeCd = searchType;
                anonPatientInfo.docNo = searchString;
            } else {
                anonPatientInfo.docTypeCd = '';
                anonPatientInfo.docNo = searchString;
            }
            this.props.updateState({
                anonyomousBookingActiveInfo: anonPatientInfo,
                anonymousPersonalInfoBackUp: anonPatientInfo
            });
            this.docTypeRef.focus();
        }
    }

    searchInputOnBlur = (patSearchParam, isSearchable) => {
        const { searchType, searchString } = patSearchParam;
        if (searchString && isSearchable) {
            if (searchType === FieldConstant.PATIENT_NAME_TYPE) {
                this.props.checkPatientName(searchString, (data) => {
                    let hasPatient = data;
                    if (hasPatient) {
                        this.props.updateField({ supervisorsApprovalDialogInfo: { open: true, staffId: '', searchString: searchString } });
                    } else {
                        const patSearchTypeList = this.props.patSearchTypeList;
                        const isDocType = PatientUtil.searchTypeIsDocType(patSearchTypeList, searchType);
                        // let fields = { waitingPriDocTypeCd: 'ID', waitingPriDocNo: '' };
                        if (isDocType) {
                            // fields.waitingPriDocTypeCd = params.docType;
                            // fields.waitingPriDocNo = params.searchString;
                            this.props.updateField({ waitingPriDocTypeCd: searchType, waitingPriDocNo: searchString });
                        }
                        this.props.openCommonMessage({ msgCode: '115550', showSnackbar: true });
                        let patSearchParam = {
                            docType: searchType,
                            searchString: searchString
                        };
                        this.preFillDocPair(patSearchParam);
                    }
                });
            } else {
                let params = {
                    docType: searchType,
                    searchString: searchString
                };
                const callback = () => {
                    this.preFillDocPair(patSearchParam);
                };
                this.props.auditAction('Search Patient');
                this.props.searchPatientList(params, [], callback);
            }
            this.props.updateState({ patientSearchParam: { searchType, searchValue: '' } });
        }
    }

    resetPatParams = () => {
        const { svcCd, siteId } = this.props.clinic;
        let target = CommonUtil.getHighestPrioritySiteParams(
            Enum.CLINIC_CONFIGNAME.PAT_SEARCH_TYPE_DEFAULT,
            this.props.clinicConfig,
            { siteId, serviceCd: svcCd }
        );

        let patSearchParam = { searchType: target.paramValue ? target.paramValue : Enum.DOC_TYPE.HKID_ID, searchValue: '' };
        return patSearchParam;
    }

    updateAnonymousPatientInfo = (patient) => {
        if (this.invalidFieldList.length === 0) {
            patient = { ...patient, isHKIDValid: true };
        }
        this.props.anonymousInfoOnchange(patient);
    }

    loadSearchPatient = (patientInfo) => {
        /*        const docPairMap = PatientUtil.getPatientDocumentPair(patientInfo);
                let contactPhone = _.cloneDeep(patientPhonesBasic);
                if (patientInfo.phoneList) {
                    let mobile = patientInfo.phoneList ? patientInfo.phoneList : null;

                    mobile = mobile.find(item => item.smsPhoneInd == 1);
                    if (!mobile && patientInfo.phoneList) {
                        mobile = mobile.sort((a, b) => moment(a.ceateDtm) - moment(b.ceateDtm));
                        mobile = mobile[0];
                    }

                    contactPhone.phoneId = mobile.phoneId;
                    contactPhone.phoneTypeCd = mobile.phoneTypeCd;
                    contactPhone.countryCd = mobile.countryCd;
                    contactPhone.areaCd = mobile.areaCd || '';
                    contactPhone.dialingCd = mobile.dialingCd || '';
                    contactPhone.phoneNo = mobile.phoneNo;
                    contactPhone.smsPhoneInd = mobile.smsPhoneInd;
                }
                const patInfo = {
                    anonyomousBookingActiveInfo: {
                        docTypeCd: docPairMap.primaryDocPair.docTypeCd,
                        docNo: docPairMap.primaryDocPair.docNo,
                        surname: patientInfo.engSurname,
                        givenName: patientInfo.engGivename,
                        mobile: contactPhone
                    }
                };
                return patInfo;*/
    }

    handleResetButtonClick = (isResetSearchParams = true) => {
        const contactPhone = {
            phoneId: '',
            phoneTypeCd: 'M',
            // countryCd: 'HK',
            countryCd: null,
            areaCd: '',
            dialingCd: FieldConstant.DIALING_CODE_DEFAULT_VALUE,
            phoneNo: '',
            smsPhoneInd: ''
        };
        const patInfo = {
            anonyomousBookingActiveInfo: {
                docTypeCd: '',
                docNo: '',
                surname: '',
                givenName: '',
                mobile: contactPhone,
                isHKIDValid: true
            },
            patientList: [],
            anonyomous: [],
            waitingList: null
        };

        let patientSearchParam = _.cloneDeep(this.props.patientSearchParam);
        if (isResetSearchParams) {
            patientSearchParam = this.resetPatParams();
        }

        this.props.updateState({ ...patInfo, patientSearchParam });
    }

    handleCloseDialog = () => {
        let patientList = [];

        this.props.updateState({
            patientList: patientList,
            anonyomous: []
        });

        this.handleResetButtonClick(false);
    }

    handleSelectPatient = (selectPatient) => {
        let patientList = [];
        patientList.push(selectPatient);

        let mobile = selectPatient.phoneList ? selectPatient.phoneList : null;
        if (mobile) {
            mobile = mobile.find(item => item.smsPhoneInd == 1);
            if (!mobile && selectPatient.phoneList) {
                mobile = selectPatient.phoneList.sort((a, b) => moment(a.ceateDtm) - moment(b.ceateDtm));
                mobile = mobile[0];
            }
        }
        this.props.auditAction('Select Patient', null, null, false, 'ana');
        if (selectPatient && selectPatient.patientKey && parseInt(selectPatient.deadInd) !== 1) {
            this.props.updateState({
                patientList: patientList,
                anonyomousBookingActiveInfo: {
                    docTypeCd: selectPatient.documentPairList && selectPatient.documentPairList.length > 0 ? selectPatient.documentPairList[0].docTypeCd : null,
                    docNo: selectPatient.documentPairList && selectPatient.documentPairList.length > 0 ? selectPatient.documentPairList[0].docNo : null,
                    surname: selectPatient.engSurname,
                    givenName: selectPatient.engGivename,
                    // countryCd: FieldConstant.COUNTRY_CODE_DEFAULT_VALUE,
                    mobile: {
                        smsPhoneInd: mobile ? mobile.smsPhoneInd : null,
                        phoneTypeCd: mobile ? mobile.phoneTypeCd : null,
                        countryCd: mobile ? mobile.countryCd : null,
                        areaCd: mobile ? mobile.areaCd : null,
                        dialingCd: mobile ? mobile.dialingCd : null,
                        phoneNo: mobile ? mobile.phoneNo : null
                    },
                    isHKIDValid: true
                },
                anonyomous: { patientKey: selectPatient.patientKey }
            });
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }

    }

    render() {
        const {
            classes,
            codeList,
            patient,
            id,
            countryList,
            patientSearchParam,
            patSearchTypeList,
            contactPhone,
            updateField,
            anonPatientInfo,
            waitingList,
            service,
            siteParams,
            clinic,
            pageStatus
        } = this.props;
        const isHKIDFormat = PatientUtil.isHKIDFormat(patient.docTypeCd);

        let hkidValidator = [];
        let hkidErrorMessages = [];
        if (isHKIDFormat) {
            hkidValidator.push(ValidatorEnum.isHkid);
            let hkidFomratDocTypeList = patSearchTypeList.filter(item => item.searchTypeCd === patient.docTypeCd);
            let replaceMsg = CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR((hkidFomratDocTypeList[0] && hkidFomratDocTypeList[0].dspTitle) || 'HKID Card');
            hkidErrorMessages.push(replaceMsg);
        } else {
            let selSearchType = patSearchTypeList.find(item => item.searchTypeCd === patient.docTypeCd);
            let minLength = selSearchType && selSearchType.minSearchLen ? selSearchType.minSearchLen : 1;
            hkidValidator.push(ValidatorEnum.minStringLength(minLength));
            hkidErrorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', minLength));
        }

        const isSMSMobile = parseInt(contactPhone.smsPhoneInd) === 1;
        if (isSMSMobile) {
            contactPhone.phoneTypeCd = Enum.PHONE_TYPE_MOBILE_SMS;
        }

        let filterPatSearchTypeList = patSearchTypeList.filter(item => item.searchTypeCd !== 'APPTID');
        const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, service.svcCd, clinic.siteId);
        return (
            <Grid className={classes.root}>
                <Typography variant="h6" className={classes.title}>Personal Information</Typography>

                {/* <ValidForm onSubmit={() => {
                }} ref={'form'} id={this.props.id + 'AnonymousPatientInfoForm'}
                > */}
                <Grid container spacing={3} style={{ 'marginBottom': '1rem' }}>
                    <Grid item xs={5}>
                        <PatientSearchGroup
                            id={id + 'SearchPatientSearchInput'}
                            innerRef={ref => this.searchGroupRef = ref}
                            patientSearchParam={patientSearchParam}
                            docTypeList={filterPatSearchTypeList || []}
                            optVal={'searchTypeCd'}
                            optLbl={'dspTitle'}
                            updateState={this.props.updateField}
                            searchInputOnBlur={this.searchInputOnBlur}
                            disabled={waitingList ? true : false||pageStatus === anonPageStatus.UPDATE}
                        />
                    </Grid>
                    <Grid item xs={7} style={{ textAlign: 'right' }}>
                        <CIMSButton
                            id={'btn_consultation_reset'}
                            variant="contained"
                            color="primary"
                            size="small"
                            style={{ 'margin': '-3px 0 0', 'padding': '0' }}
                            onClick={() => {
                                this.props.auditAction('Reset Patient Info', null, null, false, 'ana');
                                this.handleResetButtonClick();
                            }}
                            disabled={waitingList ? true : false||pageStatus === anonPageStatus.UPDATE}
                        >Reset</CIMSButton>
                    </Grid>
                </Grid>

                <Grid container spacing={3} style={{ 'marginBottom': '1rem' }}>
                    <Grid item xs={3}>
                        <SelectFieldValidator
                            id={id + 'DocumentTypeSelectField'}
                            ref={ref => this.docTypeRef = ref}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Document Type</>
                            }}
                            className={classes.fieldRoot}
                            fullWidth
                            options={
                                codeList &&
                                codeList.doc_type &&
                                codeList.doc_type.map((item) => (
                                    { value: item.code, label: item.engDesc }))}
                            value={patient.docTypeCd}
                            onChange={this.handleDocTypeChange}
                            isDisabled={anonPatientInfo.patientKey > 0}
                            addNullOption
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <HKIDInput
                            isHKID={isHKIDFormat}
                            id={id + 'DocumentNoTextField'}
                            ref={'docNo'}
                            label={<>Document No.</>}
                            className={classes.fieldRoot}
                            disabled={anonPatientInfo.patientKey > 0}
                            upperCase
                            name={'docNo'}
                            onBlur={e => {
                                this.handleInputsChange(e, 'docNo');
                            }}
                            value={patient.docNo}
                            validators={hkidValidator}
                            errorMessages={hkidErrorMessages}
                            variant="outlined"
                            validatorListener={(isvalid) => this.validatorListener(isvalid, 'docNo')}
                            absoluteMessage
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <FastTextFieldValidator
                            id={id + 'SurnameTextField'}
                            ref={'surname'}
                            label={anonPatientInfo.patientKey && !patient.surname ? <>Surname</> : <>Surname<RequiredIcon /></>}
                            className={classes.fieldRoot}
                            upperCase
                            isRequired
                            disabled={anonPatientInfo.patientKey > 0}
                            onlyOneSpace
                            name={'surname'}
                            variant="outlined"
                            onBlur={e => {
                                this.handleInputsChange(e, 'surname');
                            }}
                            value={patient.surname}
                            validators={[ValidatorEnum.required, ValidatorEnum.isSpecialEnglish]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()]}
                            warning={[
                                ValidatorEnum.isEnglishWarningChar
                            ]}
                            warningMessages={[
                                CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                            ]}
                            // eslint-disable-next-line
                            inputProps={{ maxLength: 40 }}
                            validatorListener={(isvalid) => this.validatorListener(isvalid, 'surname')}
                            trim={'all'}
                            absoluteMessage
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <FastTextFieldValidator
                            id={id + 'GivenNameTextField'}
                            ref={'givenName'}
                            label={anonPatientInfo.patientKey && !patient.givenName ? <>Given Name</> : <>Given
                                    Name<RequiredIcon /></>}
                            className={classes.fieldRoot}
                            isRequired
                            disabled={anonPatientInfo.patientKey > 0}
                            upperCase
                            onlyOneSpace
                            name={'givenName'}
                            variant="outlined"
                            onBlur={e => {
                                this.handleInputsChange(e, 'givenName');
                            }}
                            value={patient.givenName}
                            validators={[ValidatorEnum.required, ValidatorEnum.isSpecialEnglish]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()]}
                            warning={[
                                ValidatorEnum.isEnglishWarningChar
                            ]}
                            warningMessages={[
                                CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                            ]}
                            // eslint-disable-next-line
                            inputProps={{ maxLength: 40 }}
                            validatorListener={(isvalid) => this.validatorListener(isvalid, 'givenName')}
                            trim={'all'}
                            absoluteMessage
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} style={{ 'marginBottom': '1rem' }}>
                    <Grid item xs={6}>
                        <PhoneField
                            id={'bookingAnonymous_contactPhone'}
                            // comDisabled={comDisabled}
                            phone={contactPhone}
                            isRequired={anonPatientInfo.patientKey < 0 || !anonPatientInfo.patientKey}
                            countryOptions={countryList}
                            phoneTypeOptions={anonPatientInfo.patientKey > 0 ? Enum.PHONE_DROPDOWN_LIST : Enum.PHONE_DROPDOWN_LIST.filter(x => x.value !== 'MSMS')}
                            onChange={this.handleContactPhoneChange}
                            isSMSMobile={isSMSMobile}
                            isPreferPhone={false}
                            comDisabled={anonPatientInfo.patientKey > 0 ? true : false}
                            showExtPhoneNo={false}
                            isPhoneRequired={anonPatientInfo.patientKey < 0}
                        />
                    </Grid>
                </Grid>
                {
                    this.props.patientList && this.props.patientList.length > 1 ?
                        isNewPmiSearchResultDialog ?
                            <NewPMISearchResultDialog
                                id={'patient_search_result_dialog'}
                                title="Search Result"
                                results={this.props.patientList || []}
                                handleCloseDialog={() => {
                                    this.props.auditAction('Cancel Select Patient', null, null, false, 'ana');
                                    this.handleCloseDialog();
                                }}
                                handleSelectPatient={this.handleSelectPatient}
                            />
                            :
                            <PatientSearchDialog
                                id={'patient_search_result_dialog'}
                                searchResultList={this.props.patientList || []}
                                handleCloseDialog={() => {
                                    this.props.auditAction('Cancel Select Patient', null, null, false, 'ana');
                                    this.handleCloseDialog();
                                }}
                                handleSelectPatient={this.handleSelectPatient}
                            />
                        : null
                }
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        bookingAnonymousInformation: state.bookingAnonymousInformation,
        patientSearchParam: state.bookingAnonymousInformation.patientSearchParam,
        patSearchTypeList: state.common.patSearchTypeList,
        contactPhone: state.bookingAnonymousInformation.anonyomousBookingActiveInfo.mobile,
        patientList: state.bookingAnonymousInformation.patientList,
        anonPatientInfo: state.bookingAnonymousInformation.anonyomous,
        clinic: state.login.clinic,
        waitingList: state.bookingAnonymousInformation.waitingList,
        siteParams: state.common.siteParams,
        service: state.login.service,
        pageStatus: state.bookingAnonymousInformation.pageStatus
    };
};

const mapDispatchToProps = {
    auditAction,
    checkPatientName
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(anonymousPatientBar));
