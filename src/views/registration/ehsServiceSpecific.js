import { Button, Checkbox, FormControlLabel, Grid, Radio, TextField, Tooltip, Typography, withStyles, Chip } from '@material-ui/core';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { connect } from 'react-redux';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import MemberFormGroup from './component/serviceSpecific/EHS/MemberFormGroup';
import { updateState, updatePatientEhsDto } from '../../store/actions/registration/registrationAction';
import _ from 'lodash';
import { patientPhonesBasic } from '../../constants/registration/registrationConstants';
import CIMSCommonSelect from '../../components/Select/CIMSCommonSelect';
import ContactPhones from './component/phones/contactPhones';
import { CustomInput } from '../../components/TextField/CustomInput';
import CIMSFormLabel from '../../components/InputLabel/CIMSFormLabel';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CIMSCommonDatePicker from '../../components/DatePicker/CIMSCommonDatePicker';
import Enum, { EHS_CONSTANT } from '../../enums/enum';
import CIMSMultiTextField from '../../components/TextField/CIMSMultiTextField';
import { getPhoneLength } from './component/phones/phoneField';
import FieldConstant from '../../constants/fieldConstant';
import * as moment from 'moment';
import { RegistrationUtil } from '../../utilities';
import ButtonStatusEnum from '../../enums/registration/buttonStatusEnum';
import { isApplyEhsMember } from '../../utilities/patientUtilities';

const EhsServiceSpecific = (props) => {
    const {
        id,
        comDisabled,
        classes,
        patientBaseInfo,
        updateState,
        updatePatientEhsDto,
        registerCodeList,
        codeList,
        patientOperationStatus
    } = props;

    const { patientEhsDto } = patientBaseInfo;

    const [relationshipOptions, setRelationshipOptions] = useState([]);
    const [waiverOptions, setWaiverOptions] = useState([]);
    const [exactDodOptions, setExactDodOptions] = useState([]);

    const [isDeceased, setIsDeceased] = useState(false);

    const [dodFormat, setDodFormat] = useState(Enum.DATE_FORMAT_EDMY_VALUE);

    useEffect(() => {
        if (codeList && codeList.ehs_waiver_catgry) {
            setWaiverOptions(codeList.ehs_waiver_catgry.map((item) => ({ value: item.code, label: item.engDesc })));
        }
    }, []);

    useEffect(() => {
        if (Boolean(patientEhsDto?.dod) || Boolean(patientEhsDto?.exactDodCd)) {
            !isDeceased && setIsDeceased(true);
        }
    }, [patientEhsDto]);

    useEffect(() => {
        if (patientEhsDto?.exactDodCd) {
            setDodFormat(RegistrationUtil.getDateFormat(patientEhsDto?.exactDodCd));
        }
    }, [patientEhsDto?.exactDodCd]);

    useEffect(() => {
        if (registerCodeList && registerCodeList.relationship) {
            setRelationshipOptions(registerCodeList.relationship.map((item) => ({ value: item.code, label: item.engDesc })));
        }
        if (registerCodeList && registerCodeList.exact_dob) {
            setExactDodOptions(registerCodeList.exact_dob.map((item) => ({ value: item.code, label: item.engDesc })));
        }
    }, [registerCodeList]);

    const handleDodOnFocus = () => {
        if (patientEhsDto?.exactDodCd === Enum.DATE_FORMAT_EMY_KEY) {
            setDodFormat(Enum.DATE_FORMAT_FOCUS_MY_VALUE);
        } else if (patientEhsDto?.exactDodCd === Enum.DATE_FORMAT_EDMY_KEY) {
            setDodFormat(Enum.DATE_FORMAT_FOCUS_DMY_VALUE);
        } else if (patientEhsDto?.exactDodCd === Enum.DATE_FORMAT_EY_KEY) {
            setDodFormat(Enum.DATE_FORMAT_EY_VALUE);
        }
    };

    const handleDodOnBlur = () => {
        setDodFormat(RegistrationUtil.getDateFormat(patientEhsDto?.exactDodCd));
    };

    return (
        <Grid container spacing={3} className={classes.gridContainer} style={{ padding: '0px 100px' }}>
            <Grid item xs={12} container spacing={1}>
                <Grid item xs={12}>
                    <Typography className={classes.title} variant="h6" color="primary">
                        Member
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <MemberFormGroup comDisabled={comDisabled} />
                </Grid>
                <Grid item xs={12}>
                    <CIMSFormLabel fullWidth labelText="Submitted Type" style={{ padding: 10, marginTop: '10px' }}>
                        <Grid container spacing={1} className={classes.gridContainer}>
                            <Grid item xs="auto">
                                <FormControlLabel
                                    id={`${id}_submittedInPerson_label`}
                                    style={{ marginLeft: 0 }}
                                    checked={patientEhsDto?.submitType === 1}
                                    onChange={() => updatePatientEhsDto({ submitType: 1, submitName: '', submitRelationshipCd: null })}
                                    control={<Radio id={`${id}_submittedInPerson_radioBtn`} color="primary" />}
                                    label="In person"
                                    disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                />
                            </Grid>
                            <Grid item xs="auto">
                                <FormControlLabel
                                    id={`${id}_submittedByPost_label`}
                                    style={{ marginLeft: 0 }}
                                    checked={patientEhsDto?.submitType === 2}
                                    onChange={() => updatePatientEhsDto({ submitType: 2, submitName: '', submitRelationshipCd: null })}
                                    control={<Radio id={`${id}_submittedByPost_radioBtn`} color="primary" />}
                                    label="By post"
                                    disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                />
                            </Grid>
                            <Grid item xs="auto">
                                <FormControlLabel
                                    id={`${id}_submittedByFax_label`}
                                    style={{ marginLeft: 0 }}
                                    checked={patientEhsDto?.submitType === 3}
                                    onChange={() => updatePatientEhsDto({ submitType: 3, submitName: '', submitRelationshipCd: null })}
                                    control={<Radio id={`${id}_submittedByFax_radioBtn`} color="primary" />}
                                    label="By fax"
                                    disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                />
                            </Grid>
                            <Grid item xs="auto">
                                <FormControlLabel
                                    id={`${id}_submittedByEForm_label`}
                                    style={{ marginLeft: 0 }}
                                    checked={patientEhsDto?.submitType === 4}
                                    onChange={() => updatePatientEhsDto({ submitType: 4, submitName: '', submitRelationshipCd: null })}
                                    control={<Radio id={`${id}_submittedByEForm_radioBtn`} color="primary" />}
                                    label="By e-form"
                                    disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                />
                            </Grid>
                            <Grid item xs container spacing={1}>
                                <Grid item xs={12} md="auto">
                                    <FormControlLabel
                                        id={`${id}_submittedByRepresentative_label`}
                                        style={{ marginLeft: 0 }}
                                        checked={patientEhsDto?.submitType === 5}
                                        onChange={() => updatePatientEhsDto({ submitType: 5, submitName: '', submitRelationshipCd: null })}
                                        control={<Radio id={`${id}_submittedByRepresentative_radioBtn`} color="primary" />}
                                        label="Representative"
                                        disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                    />
                                </Grid>
                                <Grid item xs={12} lg>
                                    <CustomInput
                                        id={`${id}_representativeName_textField`}
                                        label="Representative Name"
                                        className={classes.textFieldRoot}
                                        name="submitName"
                                        value={patientEhsDto?.submitName}
                                        disabled={comDisabled || patientEhsDto?.submitType !== 5}
                                        setter={(value) => updatePatientEhsDto({ submitName: value })}
                                        required={patientEhsDto?.submitType === 5}
                                    />
                                </Grid>
                                <Grid item xs={12} lg>
                                    <CIMSCommonSelect
                                        id={`${id}_representativeRelationship_select`}
                                        label={
                                            <span>
                                                Representative Relationship
                                                {patientEhsDto?.submitType === 5 && <RequiredIcon />}
                                            </span>
                                        }
                                        controlProps={{
                                            className: classes.textFieldRoot
                                        }}
                                        labelProps={{
                                            classes: { root: classes.selectRoot, shrink: 'shrink' }
                                        }}
                                        inputProps={{ openMenuOnFocus: true, isClearable: false }}
                                        options={relationshipOptions}
                                        value={relationshipOptions.find((item) => item.value === patientEhsDto?.submitRelationshipCd) || null}
                                        onChange={(e) => updatePatientEhsDto({ submitRelationshipCd: e?.value || null })}
                                        disabled={comDisabled || patientEhsDto?.submitType !== 5}
                                        error={patientEhsDto?.submitType === 5 && !patientEhsDto?.submitRelationshipCd}
                                    />
                                    {patientEhsDto?.submitType === 5 && !patientEhsDto?.submitRelationshipCd && (
                                        <small style={{ color: 'red' }}>This field is required!</small>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </CIMSFormLabel>
                </Grid>
            </Grid>

            {/* <Grid item xs={12}>
                <Typography className={classes.title} variant="h6" color="primary">
                    Contact Phone (Reference Only)
                </Typography>
            </Grid>
            <Grid item xs={12} container spacing={1} className={classes.gridContainer}>
                <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                    <Grid item xs={12} md={3} lg={2}>
                        <TextField id="Representative_Name" variant="outlined" label="Name" fullWidth className={classes.textFieldRoot} disabled />
                    </Grid>
                    <Grid item xs={12} md={3} lg={2}>
                        <TextField id="Representative_Name" variant="outlined" label="Relationship" fullWidth className={classes.textFieldRoot} disabled />
                    </Grid>
                    <Grid item xs={12} md={3} lg={2}>
                        <TextField id={'tel'} name={'tel'} type="tel" fullWidth label={'Phone (preferred)'} disabled variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography className={classes.title} variant="h7" color="primary">
                            Other Phones
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} lg={2}>
                        <TextField id={'tel'} name={'tel'} type="tel" fullWidth disabled variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={3} lg={2}>
                        <TextField id={'tel'} name={'tel'} type="tel" fullWidth disabled variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={3} lg={2}>
                        <TextField id={'tel'} name={'tel'} type="tel" fullWidth disabled variant="outlined" />
                    </Grid>
                </Grid>
            </Grid> */}
            <Grid item xs={12} container spacing={1}>
                <Grid item xs={12}>
                    <Typography className={classes.title} variant="h6" color="primary">
                        For EHS Appointment Reminder <small>(EHS SMS will only be sent with the following Phone Number)</small>
                    </Typography>
                </Grid>
                <Grid item xs={12} container spacing={1}>
                    <Grid item xs={12} md={6} lg={4} container spacing={1}>
                        <Grid item xs={12} md={6} lg={3}>
                            <CustomInput
                                id="Representative_Name"
                                type="tel"
                                label="Country Code"
                                className={classes.textFieldRoot}
                                name="phnSmsDialingCd"
                                value={patientEhsDto?.phnSmsDialingCd}
                                maxLength={4}
                                setter={(value) => updatePatientEhsDto({ phnSmsDialingCd: value })}
                                disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                required={patientEhsDto?.phnSms && patientEhsDto?.phnSms !== ''}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <CustomInput
                                id="Representative_Name"
                                type="tel"
                                label="Area Code"
                                className={classes.textFieldRoot}
                                name="areaCd"
                                value={patientEhsDto?.phnSmsAreaCd}
                                maxLength={3}
                                setter={(value) => updatePatientEhsDto({ phnSmsAreaCd: value })}
                                disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                            />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <CustomInput
                                id="Representative_Name"
                                type="tel"
                                label="SMS Phone"
                                className={classes.textFieldRoot}
                                name="phnSms"
                                value={patientEhsDto?.phnSms}
                                setter={(value) => updatePatientEhsDto({ phnSms: value })}
                                disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                maxLength={getPhoneLength(patientEhsDto?.phnSmsDialingCd)}
                                required={
                                    (patientEhsDto?.phnSmsDialingCd &&
                                        patientEhsDto?.phnSmsDialingCd !== FieldConstant.DIALING_CODE_DEFAULT_VALUE &&
                                        patientEhsDto?.phnSmsDialingCd !== '') ||
                                    (patientEhsDto?.phnSmsAreaCd && patientEhsDto?.phnSmsAreaCd !== '') ||
                                    patientEhsDto?.smsOpt === EHS_CONSTANT.SMS_CHINESE ||
                                    patientEhsDto?.smsOpt === EHS_CONSTANT.SMS_ENGLISH
                                }
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} xl={3}>
                        <CIMSCommonSelect
                            id="Representative_Relationship"
                            label="Language"
                            controlProps={{
                                className: classes.textFieldRoot
                            }}
                            labelProps={{
                                classes: { root: classes.selectRoot, shrink: 'shrink' }
                            }}
                            inputProps={{ openMenuOnFocus: true, isClearable: false }}
                            disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                            options={EHS_CONSTANT.SMS_OPTIONS}
                            value={EHS_CONSTANT.SMS_OPTIONS.find((item) => item.value === patientEhsDto?.smsOpt)}
                            onChange={(e) => updatePatientEhsDto({ smsOpt: e?.value || EHS_CONSTANT.SMS_NOCONSENT })}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} container spacing={1}>
                <Grid item xs={12}>
                    <Typography className={classes.title} variant="h6" color="primary">
                        Others
                    </Typography>
                </Grid>
                <Grid item xs={12} container spacing={1} className={classes.gridContainer} style={{ alignItems: 'center' }}>
                    <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                        <Grid item xs={4}>
                            <CIMSCommonSelect
                                id="Representative_Relationship"
                                label="Waiver Type"
                                controlProps={{
                                    className: classes.textFieldRoot
                                }}
                                labelProps={{
                                    classes: { root: classes.selectRoot, shrink: 'shrink' }
                                }}
                                inputProps={{ openMenuOnFocus: true }}
                                options={waiverOptions}
                                value={waiverOptions.find((item) => item.value === patientEhsDto?.ehsWaiverCatgryCd)}
                                onChange={(e) => updatePatientEhsDto({ ehsWaiverCatgryCd: e?.value || null })}
                                disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <CIMSCommonSelect
                                id="Representative_Relationship"
                                label="Spouse/ partner is also an EHC client"
                                controlProps={{
                                    className: classes.textFieldRoot
                                }}
                                labelProps={{
                                    classes: { root: classes.selectRoot, shrink: 'shrink' }
                                }}
                                inputProps={{ openMenuOnFocus: true }}
                                disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                                options={EHS_CONSTANT.IS_SPOUSE_EHC_CLINET_OPTIONS}
                                value={EHS_CONSTANT.IS_SPOUSE_EHC_CLINET_OPTIONS.find((item) => item.value === patientEhsDto?.isSpouseEhc)}
                                onChange={(e) =>
                                    updatePatientEhsDto({
                                        isSpouseEhc: e !== null ? e?.value : null,
                                        spouseRemark: e?.value === 1 ? patientEhsDto?.spouseRemark : null
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <CustomInput
                                id="Representative_Name"
                                label="Spouse/ partner Remark"
                                className={classes.textFieldRoot}
                                name="spouseRemark"
                                value={patientEhsDto?.spouseRemark}
                                setter={(value) => updatePatientEhsDto({ spouseRemark: value })}
                                disabled={comDisabled || patientEhsDto?.isSpouseEhc !== 1}
                            />
                        </Grid>
                    </Grid>
                    {/* <Grid item xs={12} container spacing={1}>
                        <Grid item xs={12}>
                            <Grid item xs="auto">
                                <Chip
                                    label="Dememtia Pilot"
                                    color="primary"
                                    disabled={comDisabled}
                                    onClick={() => {
                                        updatePatientEhsDto({ remark: patientEhsDto?.remark + (patientEhsDto?.remark && '\n') + 'Dememtia Pilot' });
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <CIMSMultiTextField id="ehs_patientSummary_tab_remark" label="Remark" rows={3} disabled value={patientEhsDto?.remark || ''} />
                        </Grid>
                    </Grid> */}
                    <Grid item xs={12} container spacing={1} style={{ alignItems: 'center' }}>
                        <Grid item xs="auto">
                            <FormControlLabel
                                id={`${id}_isNgoReferral_checkbox_label`}
                                style={{ marginLeft: 0 }}
                                checked={patientEhsDto?.isNgoReferral === 1}
                                onChange={(e) => updatePatientEhsDto({ isNgoReferral: e.target.checked ? 1 : 0 })}
                                control={<Checkbox id={`${id}_isNgoReferral_checkbox`} color="primary" />}
                                label="NGO Referral"
                                disabled={comDisabled || !patientBaseInfo?.isApplyEhsMember}
                            />
                        </Grid>
                        {patientOperationStatus !== ButtonStatusEnum.ADD && isApplyEhsMember(patientBaseInfo?.ehsMbrSts) && (
                            <Grid item xs="auto">
                                <FormControlLabel
                                    id={`${id}_isChecked_checkbox_label`}
                                    style={{ marginLeft: 0 }}
                                    checked={
                                        (patientEhsDto?.lastChkDate && moment(patientEhsDto?.lastChkDate).isSame(moment(), 'date')) ||
                                        patientEhsDto?.isCheckedInfo === 'Y'
                                    }
                                    onChange={(e) => updatePatientEhsDto({ isCheckedInfo: e.target.checked ? 'Y' : null })}
                                    control={<Checkbox id={`${id}_isChecked_checkbox`} color="primary" />}
                                    label="Information Checked?"
                                    disabled={
                                        comDisabled ||
                                        !patientBaseInfo?.isApplyEhsMember ||
                                        (patientEhsDto?.lastChkDate && moment(patientEhsDto?.lastChkDate).isSame(moment(), 'date'))
                                    }
                                />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} container spacing={1}>
                <Grid item xs={12}>
                    <Typography className={classes.title} variant="h6" color="primary">
                        Deceased Status
                    </Typography>
                </Grid>
                <Grid item xs={12} container spacing={1} className={classes.gridContainer}>
                    <Grid item xs={12} md="auto">
                        <FormControlLabel
                            id="submittedByRepresentative"
                            style={{ marginLeft: 0 }}
                            control={<Checkbox id="submittedByRepresentativeRadio" color="primary" />}
                            label="Deceased"
                            checked={isDeceased}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    updatePatientEhsDto({ exactDodCd: Enum.DATE_FORMAT_EDMY_KEY, dod: moment().format(Enum.DATE_FORMAT_EYMD_VALUE) });
                                } else {
                                    updatePatientEhsDto({ exactDodCd: null, dod: null });
                                }
                                setIsDeceased(e.target.checked);
                            }}
                            disabled={comDisabled}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} lg={3} xl={2}>
                        <CIMSCommonSelect
                            id="Dod Format"
                            label={
                                <span>
                                    Dod Format
                                    {isDeceased && <RequiredIcon />}
                                </span>
                            }
                            controlProps={{
                                className: classes.textFieldRoot
                            }}
                            labelProps={{
                                classes: { root: classes.selectRoot, shrink: 'shrink' }
                            }}
                            inputProps={{ openMenuOnFocus: true, isClearable: false }}
                            options={exactDodOptions}
                            value={exactDodOptions.find((item) => item.value === patientEhsDto?.exactDodCd)}
                            onChange={(e) =>
                                updatePatientEhsDto({
                                    exactDodCd: e !== null ? e?.value : null
                                })
                            }
                            disabled={!isDeceased || comDisabled}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} lg={3} xl={2}>
                        <CIMSCommonDatePicker
                            // id={`${id}_end_date_datePicker`}
                            InputLabelProps={{
                                classes: {
                                    root: classes.inputLabelRoot,
                                    shrink: 'shrink'
                                }
                            }}
                            margin="none"
                            label={
                                <span>
                                    Dod
                                    {isDeceased && <RequiredIcon />}
                                </span>
                            }
                            format={dodFormat}
                            autoFocus={dodFormat === Enum.DATE_FORMAT_FOCUS_DMY_VALUE || dodFormat === Enum.DATE_FORMAT_FOCUS_MY_VALUE}
                            value={patientEhsDto?.dod}
                            onChange={(value) => updatePatientEhsDto({ dod: value })}
                            maxDate={moment()}
                            onFocus={() => handleDodOnFocus()}
                            onBlur={() => handleDodOnBlur()}
                            disabled={!isDeceased || comDisabled}
                            error={isDeceased && (!patientEhsDto?.dod || !moment(patientEhsDto?.dod).isValid() || moment(patientEhsDto?.dod).isAfter(moment()))}
                        />
                        {isDeceased && !patientEhsDto?.dod && <small style={{ color: 'red' }}>This field is required!</small>}
                        {patientEhsDto?.dod && !moment(patientEhsDto?.dod).isValid() && (
                            <small style={{ color: 'red' }}>Invalid Date Format: {dodFormat}!</small>
                        )}
                        {patientEhsDto?.dod && moment(patientEhsDto?.dod).isValid() && moment(patientEhsDto?.dod).isAfter(moment()) && (
                            <small style={{ color: 'red' }}>Dod cannot be later than today!</small>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const styles = (theme) => ({
    title: {
        fontWeight: 'bold'
    },
    textFieldRoot: {
        margin: 0
    },
    gridContainer: {
        width: '100%'
    },
    selectRoot: {
        '&.shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
            backgroundColor: 'white'
        }
    },
    datePickerInput: {
        height: '20px'
    }
});

const mapStateToProps = (state) => {
    return {
        patientOperationStatus: state.registration.patientOperationStatus,
        patientBaseInfo: state.registration.patientBaseInfo,
        registerCodeList: state.registration.codeList,
        codeList: state.common.commonCodeList
    };
};

const mapDispatchToProps = {
    updateState,
    updatePatientEhsDto
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EhsServiceSpecific));
