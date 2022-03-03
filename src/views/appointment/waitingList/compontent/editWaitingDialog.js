import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid
} from '@material-ui/core';
import {
    updateField,
    cancelEditWaiting,
    searchPatientList,
    getPatient,
    saveWaiting,
    resetAll,
    resetWaitDetail
} from '../../../../store/actions/appointment/waitingList/waitingListAction';
import { getEncounterTypeList } from '../../../../store/actions/common/commonAction';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import HKIDInput from '../../../compontent/hkidInput';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import CommonMessage from '../../../../constants/commonMessage';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import PatientSearchGroup from '../../../compontent/patientSearchGroup';
import PhoneField from '../../../registration/component/phones/phoneField';
import FieldConstant from '../../../../constants/fieldConstant';
import memoize from 'memoize-one';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import { EnctrAndRmUtil, CommonUtil, PatientUtil, ApiMappers } from '../../../../utilities';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import {
    checkPatientName
} from '../../../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import { waitDetailBasic } from '../../../../constants/appointment/waitingList/waitingListConstants';
import { patientPhonesBasic } from '../../../../constants/registration/registrationConstants';

class EditWaitingDialog extends Component {
    componentDidMount() {
        ValidatorForm.addValidationRule(ValidatorEnum.isExpiryDate, (value) => {
            return !value || moment(value).isSameOrAfter(moment().startOf('day'));
        });
        this.props.resetPatParams();
    }

    shouldComponentUpdate(nextP) {
        if (nextP.patientList !== this.props.patientList) {
            if (nextP.patientList.length > 1) {
                //do something.
            }

            else if (nextP.patientList.length === 1) {
                if (nextP.patientList[0] && nextP.patientList[0].patientKey && !parseInt(nextP.patientList[0].deadInd)) {
                    let patInfo = this.props.loadSearchPatient(nextP.patientList[0]);
                    this.props.updateField(patInfo);
                } else {
                    this.props.openCommonMessage({
                        msgCode: '115571',
                        variant: 'error'
                    });
                }
            }
            else {
                return true;
            }
        }
        if (nextP.autoFocus === true) {
            this.priDocTypeRef.focus();
            this.props.updateField({ autoFocus: false });
            return true;
        }
        return true;
    }

    UNSAFE_componentWillUpdate(nexp) {
        if (nexp.waitDetail !== this.props.waitDetail) {
            if (this.refs.form) {
                this.refs.form.resetValidations();
            }
        }
        if (nexp.waitDetail.siteId === 0 && nexp.editWaitingStatus !== 'I') {
            const encntrTypeId = this.getDefaultEncntrId();
            this.waitingClinicCdOnChange({ value: nexp.clinic.siteId }, encntrTypeId);
        }
    }

    getDefaultEncntrId = memoize(() => {
        const { svcCd, siteId } = this.props.clinic;
        let target = CommonUtil.getHighestPrioritySiteParams(
            Enum.CLINIC_CONFIGNAME.DEFAULT_ENCOUNTER_CD,
            this.props.clinicConfig,
            { siteId, serviceCd: svcCd }
        );
        let defaultEncntrType = target.paramValue ? target.paramValue : '';
        let encntrTypeId = 0;
        if (defaultEncntrType) {
            let encntrType = this.props.encounterTypeList.find(item => item.encounterTypeCd === defaultEncntrType);
            encntrTypeId = encntrType ? encntrType.encntrTypeId : 0;
        }
        return encntrTypeId;
    });

    waitingSubmit = () => {
        const { svcCd } = this.props.clinic;
        const { waitDetail, editWaitingStatus, handlingSearch } = this.props;
        let desc = '';
        const isHKIDFormat = PatientUtil.isHKIDFormat(waitDetail.priDocTypeCd);
        const cleanDocNo = isHKIDFormat ? PatientUtil.getCleanHKIC(waitDetail.priDocNo) : waitDetail.priDocNo;
        if (handlingSearch === true) {
            return;
        }
        let submitData = _.cloneDeep(this.props.waitDetail) || {};
        //patient info
        if (waitDetail.patientKey && waitDetail.patientKey > 0) {
            submitData.anonymousPatientDto = null;
            if (editWaitingStatus === 'E') {
                submitData.version = waitDetail.waitDataVer;
                delete submitData.patientDtoVer;
                delete submitData.waitDataVer;
                desc = 'Save Waiting Update';
            } else {
                desc = 'Create Waiting';
            }
        } else {
            let contactPhone = _.cloneDeep(this.props.contactPhone);
            let newAnonymousPatientDto = {
                priDocTypeCd: waitDetail.priDocTypeCd,
                priDocNo: cleanDocNo,
                engGivename: waitDetail.engGivename,
                engSurname: waitDetail.engSurname,
                areaCd: contactPhone.areaCd,
                cntctPhn: contactPhone.phoneNo,
                phnTypeCd: contactPhone.phoneTypeCd,
                // ctryCd: contactPhone.countryCd,
                dialingCd: contactPhone.dialingCd,
                docTypeCd: waitDetail.priDocTypeCd,
                docNo: cleanDocNo
            };
            if (editWaitingStatus === 'E') {
                newAnonymousPatientDto.version = waitDetail.patientDtoVer;
                newAnonymousPatientDto.anonPatientId = waitDetail.patientKey;
                submitData.version = waitDetail.waitDataVer;
                submitData.innerUpdateAnaAnonPatient = newAnonymousPatientDto;
                // submitData.waitListId=
                delete submitData.patientDtoVer;
                delete submitData.waitDataVer;
                delete submitData.patientKey;
                desc = 'Save Waiting Update';
            } else {
                submitData.newAnonymousPatientDto = newAnonymousPatientDto;
                delete submitData.patientKey;
                desc = 'Create Waiting';
            }

        }

        //waiting info
        submitData.priDocNo = cleanDocNo;
        submitData.cntryCdList = waitDetail.cntryCdList ? waitDetail.cntryCdList.join('|') : '';
        submitData.encntrTypeId = waitDetail.encntrTypeId === 0 ? null : waitDetail.encntrTypeId;
        submitData.remark = waitDetail.remark;
        submitData.siteId = waitDetail.siteId;
        submitData.svcCd = svcCd;
        submitData.travelDtm = waitDetail.travelDate ? moment(waitDetail.travelDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
        this.props.auditAction(desc);
        this.props.saveWaiting({ status: this.props.editWaitingStatus, data: submitData }, this.props.searchWaitingList);
    }

    cancelEditWaiting = () => {
        const { editWaitingStatus } = this.props;
        if (editWaitingStatus === 'E') {
            this.props.auditAction('Cancel Edit Waiting', null, null, false, 'ana');
        } else {
            this.props.auditAction('Cancel Add Waiting', null, null, false, 'ana');
        }
        this.props.resetPatParams();
        this.props.cancelEditWaiting();
    }

    updateWaitData = (data, fieldName) => {
        let _waitDetail = _.cloneDeep(this.props.waitDetail);

        if (fieldName === 'cntryCdList') {
            if (_waitDetail.cntryCdList.length < 5 || data.length < 5) {
                let _cntryCdList = [];
                if (data) {
                    data.forEach(item => {
                        _cntryCdList.push(item.value);
                    });
                } else {
                    _cntryCdList = [];
                }
                _waitDetail[fieldName] = _cntryCdList;
            }
            else {
                // _waitDetail[fieldName] = data;
                //do something
            }
        }
        else if (fieldName === 'engSurname' || fieldName === 'engGivename') {
            _waitDetail[fieldName] = data.toUpperCase();
        }
        else {
            _waitDetail[fieldName] = data;
        }
        this.props.updateField({ waitDetail: _waitDetail });
        if (this.props.handlingSearch) {
            this.props.updateField({ handlingSearch: false });
        }
    }


    waitingClinicCdOnChange = (e, encntrTypeId) => {
        const { waitDetail } = this.props;
        let waitData = _.cloneDeep(waitDetail);
        waitData.siteId = e.value;
        waitData.encntrTypeId = encntrTypeId || 0;
        this.props.updateField({ waitDetail: waitData });
    }


    handleItemSelected = (item) => {
        this.props.getPatient(item.patientKey);
    }
    searchInputOnBlur = (patSearchParam,isSearchable) => {
        const { searchType, searchString } = patSearchParam;
        if (searchString && isSearchable) {
            if (searchType === FieldConstant.PATIENT_NAME_TYPE) {
                this.props.checkPatientName(searchString, (data) => {
                    let hasPatient = data;
                    if (hasPatient) {
                        this.props.updateField({ handlingSearch: false, supervisorsApprovalDialogInfo: { open: true, staffId: '', searchString: searchString } });
                    } else {
                        const storeWaitDetail = this.props.waitDetail;
                        let waitDetail = _.cloneDeep(waitDetailBasic);
                        let contactPhone = _.cloneDeep(patientPhonesBasic);
                        const patSearchTypeList = this.props.patSearchTypeList;
                        let searchTypeObj = patSearchTypeList.find(item => item.searchTypeCd === searchType);
                        waitDetail.siteId = storeWaitDetail.siteId;
                        if (searchTypeObj && searchTypeObj.isDocType === 1) {
                            waitDetail.priDocTypeCd = searchTypeObj.searchTypeCd;
                            waitDetail.priDocNo = searchString;
                        }
                        this.props.openCommonMessage({ msgCode: '115550', showSnackbar: true });
                        const encntrTypeId = this.getDefaultEncntrId();
                        this.props.resetWaitDetail(this.props.clinic.siteId, encntrTypeId);
                        this.props.updateField({ waitDetail, contactPhone, handlingSearch: false, autoFocus: true });

                    }
                });
            } else {
                let params = {
                    docType: searchType,
                    searchString: searchString
                };
                this.props.auditAction(AlsDesc.SEARCH_PATIENT);
                this.props.searchPatientList(params);
            }
            this.props.updateField({ patientSearchParam: { searchType, searchValue: '' } });
        } else {
            this.props.updateField({ handlingSearch: false });
        }
    }

    handleContactPhoneChange = (value, name) => {
        let contactPhone = _.cloneDeep(this.props.contactPhone);
        if (name === 'countryCd') {
            contactPhone['areaCd'] = '';
            let countryOptionsObj = this.props.countryList.find(item => item.countryCd == value);
            let dialingCd = countryOptionsObj && countryOptionsObj.dialingCd;
            contactPhone['dialingCd'] = dialingCd;
        }
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
        this.props.updateField({ contactPhone: contactPhone });
    }

    handleResetBtnOnClick = () => {
        this.props.auditAction('Reset Waiting Details In Add Waiting Dialog', null, null, false, 'ana');
        const encntrTypeId = this.getDefaultEncntrId();
        this.props.resetPatParams();
        this.props.resetWaitDetail(this.props.clinic.siteId, encntrTypeId);
    }

    // isPatNameRequied = () => {
    //     const { waitDetail } = this.props;
    //     if (!waitDetail.engSurname && !waitDetail.engGivename) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    filterEncounter = memoize((encounterTypeList, siteId) => {
        let _encounterTypeList = ApiMappers.mapEncounterTypeListNewApi(encounterTypeList, this.props.serviceCd, siteId, this.props.clinicList);
        let encounterTypeFilterList = EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, _encounterTypeList);
        return encounterTypeFilterList;
    })


    patSearchGroupOnFocus = () => {
        this.props.updateField({ handlingSearch: true });
    };

    filterClinicList = memoize((list, clinicCd, isEnableCross) => {
        if (isEnableCross) {
            return list;
        } else {
            return list && list.filter(item => item.clinicCd === clinicCd);
        }
    });


    render() {
        const {
            id,
            classes,
            editWaitingStatus,
            docTypeList,
            countryList,
            patientSearchParam,
            patSearchTypeList,
            contactPhone,
            waitDetail,
            handlingSearch,
            isShowDepartureDate,
            isShowDestination,
            destinationList,
            encounterTypeList
        } = this.props;
        let { serviceCd, clinicList, clinicCd, isEnableCrossBookClinic } = this.props;
        let hkidValidator = [];
        let hkidErrorMessages = [];

        const isHKIDFormat = PatientUtil.isHKIDFormat(waitDetail.priDocTypeCd);
        if (isHKIDFormat) {
            hkidValidator.push(ValidatorEnum.isHkid);
            let hkidFomratDocTypeList = patSearchTypeList.filter(item => item.searchTypeCd === waitDetail.priDocTypeCd);
            let replaceMsg = CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR((hkidFomratDocTypeList[0] && hkidFomratDocTypeList[0].dspTitle) || 'HKID Card');
            hkidErrorMessages.push(replaceMsg);
        }
        else{
            let selSearchType = patSearchTypeList.find(item => item.searchTypeCd === waitDetail.priDocTypeCd);
            let minLength = selSearchType && selSearchType.minSearchLen ? selSearchType.minSearchLen : 1;
            // let selSearchType = getSelSearchType(availDocType, searchType);
            hkidValidator.push(ValidatorEnum.minStringLength(minLength));
            hkidErrorMessages.push(CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', minLength));
        }

        const isSMSMobile = parseInt(contactPhone.smsPhoneInd) === 1;
        // const requiredPatName = this.isPatNameRequied();
        const encounterList = this.filterEncounter(encounterTypeList, waitDetail.siteId);

        const requireSurName = !waitDetail.engGivename || (waitDetail.engSurname && waitDetail.engGivename);
        const requeireGiveName = !waitDetail.engSurname || (waitDetail.engSurname && waitDetail.engGivename);
        let filterPatSearchTypeList = patSearchTypeList.filter(item => item.searchTypeCd !== 'APPTID');

        const _clinicList = this.filterClinicList(CommonUtil.getClinicListByServiceCode(clinicList, serviceCd), clinicCd, isEnableCrossBookClinic);
        return (
            <CIMSPromptDialog
                id={id}
                dialogTitle={editWaitingStatus === 'E' ? 'Edit Waiting' : 'Add Waiting'}
                dialogContentText={
                    <Grid>
                        <ValidatorForm
                            id={id + 'Form'}
                            ref={'form'}
                            onSubmit={this.waitingSubmit}
                            className={classes.from}
                        >
                            <Grid container item xs={12}>
                                {editWaitingStatus !== 'E' ?
                                    <Grid item xs={12} className={classes.formRow}>
                                        <PatientSearchGroup
                                            id={id + 'SearchPatientSearchInput'}
                                            innerRef={ref => this.searchGroupRef = ref}
                                            patientSearchParam={patientSearchParam}
                                            docTypeList={filterPatSearchTypeList || []}
                                            optVal={'searchTypeCd'}
                                            optLbl={'dspTitle'}
                                            updateState={this.props.updateField}
                                            searchInputOnBlur={this.searchInputOnBlur}
                                            patSearchGroupOnFocus={this.patSearchGroupOnFocus}
                                        />
                                    </Grid> : null
                                }

                                <CIMSFormLabel
                                    fullWidth
                                    labelText={'Waiting List Information'}
                                    className={classes.waitingListInfo}
                                    FormLabelProps={{ className: classes.waitListInfoFormLbl }}
                                >

                                    <Grid item container xs={12} spacing={1} className={classes.fromRowSpacing1}>
                                        <Grid item xs={6}>
                                            <SelectFieldValidator
                                                id={id + 'WaitingPriDocTypeCdSelectField'}
                                                ref={ref => this.priDocTypeRef = ref}
                                                TextFieldProps={{
                                                    variant: 'outlined',
                                                    label: 'Document Type'
                                                }}
                                                fullWidth
                                                addNullOption
                                                options={docTypeList.map(item => ({ value: item.code, label: item.engDesc }))}
                                                value={waitDetail.priDocTypeCd}
                                                isDisabled={waitDetail.patientKey > 0}
                                                onChange={e => this.updateWaitData(e.value, 'priDocTypeCd')}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <HKIDInput
                                                isHKID={isHKIDFormat}
                                                variant="outlined"
                                                id={id + 'WaitingPriDocNoTextField'}
                                                label="Document Number"
                                                value={waitDetail.priDocNo}
                                                disabled={waitDetail.patientKey > 0}
                                                validators={hkidValidator}
                                                errorMessages={hkidErrorMessages}
                                                onBlur={e => this.updateWaitData(e.target.value, 'priDocNo')}
                                                absoluteMessage
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid item container xs={12} spacing={1} className={classes.fromRowSpacing1}>
                                        <Grid item xs={6}>
                                            <FastTextFieldValidator
                                                id={id + 'WaitingEngSurnameTextField'}
                                                label={<>Surname{requireSurName ? <RequiredIcon /> : null}</>}
                                                onlyOneSpace
                                                upperCase
                                                value={waitDetail.engSurname}
                                                variant="outlined"
                                                disabled={waitDetail.patientKey > 0}
                                                inputProps={{ maxLength: 40 }}
                                                validators={!requireSurName ? [ValidatorEnum.isSpecialEnglish] : [
                                                    ValidatorEnum.required,
                                                    ValidatorEnum.isSpecialEnglish
                                                ]}
                                                errorMessages={!requireSurName ? [CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()] : [
                                                    CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                                    CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
                                                ]}
                                                warning={[
                                                    ValidatorEnum.isEnglishWarningChar
                                                ]}
                                                warningMessages={[
                                                    CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                                                ]}
                                                onBlur={e => this.updateWaitData(e.target.value, 'engSurname')}
                                                trim={'all'}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FastTextFieldValidator
                                                id={id + 'WaitingEngGivennameTextField'}
                                                label={<>Given Name{requeireGiveName ? <RequiredIcon /> : null}</>}
                                                onlyOneSpace
                                                upperCase
                                                value={waitDetail.engGivename}
                                                variant="outlined"
                                                disabled={waitDetail.patientKey > 0}
                                                inputProps={{ maxLength: 40 }}
                                                validators={!requeireGiveName ? [ValidatorEnum.isSpecialEnglish] : [
                                                    ValidatorEnum.required,
                                                    ValidatorEnum.isSpecialEnglish
                                                ]}
                                                errorMessages={!requeireGiveName ? [CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()] : [
                                                    CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                                    CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
                                                ]}
                                                warning={[
                                                    ValidatorEnum.isEnglishWarningChar
                                                ]}
                                                warningMessages={[
                                                    CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                                                ]}
                                                onBlur={e => this.updateWaitData(e.target.value, 'engGivename')}
                                                trim={'all'}
                                            />
                                        </Grid>
                                    </Grid>

                                    <Grid item container xs={12} className={classes.formRow}>
                                        <PhoneField
                                            id={`${id}_contactPhone`}
                                            phone={contactPhone}
                                            isRequired={waitDetail.patientKey <= 0}
                                            countryOptions={countryList}
                                            phoneTypeOptions={Enum.PHONE_DROPDOWN_LIST.filter(item => item.value !== 'MSMS')}
                                            onChange={this.handleContactPhoneChange}
                                            isSMSMobile={isSMSMobile}
                                            isPreferPhone={false}
                                            comDisabled={waitDetail.patientKey > 0}
                                            showExtPhoneNo={false}
                                            isPhoneRequired={waitDetail.patientKey <= 0}
                                        />
                                    </Grid>
                                    <Grid item container xs={12} spacing={1} className={classes.fromRowSpacing1}>
                                        <Grid item xs={6}>
                                            <SelectFieldValidator
                                                id={id + 'ClinicSelectField'}
                                                TextFieldProps={{
                                                    variant: 'outlined',
                                                    label: <>Clinic<RequiredIcon /></>
                                                }}
                                                fullWidth
                                                options={_clinicList.map((item) => ({ value: item.siteId, label: item.clinicName }))}
                                                value={waitDetail.siteId}
                                                msgPosition={'bottom'}
                                                validators={[ValidatorEnum.required]}
                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                onChange={(e) => this.waitingClinicCdOnChange(e)}
                                                isDisabled={!isEnableCrossBookClinic}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <SelectFieldValidator
                                                id={id + 'EncounterSelectField'}
                                                TextFieldProps={{
                                                    variant: 'outlined',
                                                    label: <>Encounter</>
                                                }}
                                                fullWidth
                                                sortBy="label"
                                                addNullOption
                                                options={encounterList.map(item => ({ value: item.encntrTypeId, label: item.description }))}
                                                value={waitDetail.encntrTypeId}
                                                onChange={e => this.updateWaitData(e.value, 'encntrTypeId')}
                                            />
                                        </Grid>
                                    </Grid>
                                    {
                                        isShowDepartureDate ?
                                            <Grid item container xs={12} className={classes.formRow}>
                                                <DateFieldValidator
                                                    id={id + 'TravelDateDateField'}
                                                    label={<>Departure Date<RequiredIcon /></>}
                                                    value={waitDetail.travelDate ? waitDetail.travelDate : null}
                                                    disablePast
                                                    onChange={e => this.updateWaitData(e, 'travelDate')}
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                />
                                            </Grid> : null
                                    }
                                    {
                                        isShowDestination ?
                                            <Grid item container xs={12} className={classes.formRow}>
                                                <SelectFieldValidator
                                                    id={id + 'CountrySelectField'}
                                                    TextFieldProps={{
                                                        variant: 'outlined',
                                                        label: <>Destination<RequiredIcon /></>
                                                    }}
                                                    isMulti
                                                    fullWidth
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                    options={destinationList.map((item) => ({ value: item.destinationId, label: item.destinationName}))}
                                                    value={waitDetail.cntryCdList}
                                                    msgPosition="bottom"
                                                    onChange={e => this.updateWaitData(e, 'cntryCdList')}
                                                />
                                            </Grid> : null
                                    }
                                    <Grid item container xs={12} className={classes.formRow}>
                                        <FastTextFieldValidator
                                            id={id + 'RemarkTextField'}
                                            label="Memo"
                                            value={waitDetail.remark}
                                            inputProps={{ maxLength: 150 }}
                                            onBlur={e => this.updateWaitData(e.target.value, 'remark')}
                                        />
                                    </Grid>
                                </CIMSFormLabel>
                            </Grid>
                        </ ValidatorForm>
                    </ Grid>
                }
                open={editWaitingStatus !== 'I'
                }
                buttonConfig={
                    [
                        {
                            id: id + 'ResetButton',
                            name: 'Reset',
                            onClick: this.handleResetBtnOnClick,
                            disabled: handlingSearch,
                            display: editWaitingStatus === 'A'
                        },
                        {
                            id: id + 'SubmitButton',
                            name: 'Save',
                            onClick: () => { this.refs.form.submit(); },
                            disabled: handlingSearch
                        },

                        {
                            id: id + 'CancelButton',
                            name: 'Cancel',
                            onClick: this.cancelEditWaiting
                            // disabled: handlingSearch
                        }
                    ]
                }
            />
        );
    }
}

const style = (theme) => ({
    formRowSearchRow: {
        marginBottom: 19
    },
    from: {
        minWidth: 823,
        width: 823
        // minHeight: 420
    },
    formRow: {
        // display: 'flex',
        // paddingTop: theme.spacing(1),
        // paddingBottom: theme.spacing(1)
        // alignItems: 'flex-end'
        padding: '8px 8px 8px 0px'
    },
    fromRowSpacing1: {
        padding: '8px 0px'
    },
    field: {
        flex: 1,
        margin: '0 4px'
    },
    phoneField: {
        display: 'flex'
    },
    phoneSelectField: {
        width: 200
    },
    phoneTextField: {
        flex: 1,
        marginLeft: 4
    },
    waitingListInfo: {
        padding: 8,
        marginTop: 16
    },
    waitListInfoFormLbl: {
        color: theme.palette.black,
        transform: 'translate(20px, -9px) scale(1.0)',
        fontWeight: 'bold'
    }
});

const mapStateToProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        clinicConfig: state.common.clinicConfig,
        // listConfig: state.common.listConfig,
        editWaitingStatus: state.waitingList.editWaitingStatus,
        docTypeList: state.waitingList.docTypeList,
        waiting: state.waitingList.waiting,
        clinicList: state.waitingList.clinicList,
        countryList: state.patient.countryList || [],
        patientList: state.waitingList.patientList,
        patientSearchParam: state.waitingList.patientSearchParam,
        patSearchTypeList: state.common.patSearchTypeList,
        contactPhone: state.waitingList.contactPhone,
        clinic: state.login.clinic,
        waitingPatDetail: state.waitingList.waitingPatDetail,
        waitDetail: state.waitingList.waitDetail,
        encounterTypes: state.common.encounterTypes,
        encounterTypeList: state.waitingList.encounterTypeList,
        handlingSearch: state.waitingList.handlingSearch,
        autoFocus: state.waitingList.autoFocus,
        isEnableCrossBookClinic: state.waitingList.isEnableCrossBookClinic,
        destinationList:state.patient.destinationList
    };
};

const mapDispatchToProps = {
    updateField,
    cancelEditWaiting,
    getEncounterTypeList,
    searchPatientList,
    getPatient,
    saveWaiting,
    resetAll,
    resetWaitDetail,
    auditAction,
    checkPatientName
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(EditWaitingDialog));
