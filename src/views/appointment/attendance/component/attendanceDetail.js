import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
    Grid,
    Box,
    FormControlLabel
} from '@material-ui/core';
import Enum from '../../../../enums/enum';
import moment from 'moment';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import * as AppointmentUtilities from '../../../../utilities/appointmentUtilities';
import CommonRegex from '../../../../constants/commonRegex';

import * as CommonUtilities from '../../../../utilities/commonUtilities';

import CIMSButton from 'components/Buttons/CIMSButton';
import CIMSCheckBox from 'components/CheckBox/CIMSCheckBox';

import {
    redesignListRemarkCode
} from '../../../../store/actions/appointment/booking/redesignBookingAction';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import * as EcsUtilities from '../../../../utilities/ecsUtilities';
import EcsResultTextField from 'components/ECS/Ecs/EcsResultTextField';
import OcsssResultTextField from 'components/ECS/Ocsss/OcsssResultTextField';

import MwecsResultTextField from 'components/ECS/Mwecs/MwecsResultTextField';
import MwecsMessageIdTextField from 'components/ECS/Mwecs/MwecsMessageIdTextField';
import { openMwecsDialog, openEcsDialog, checkMwecs, checkEcs, openOcsssDialog, setMwecsPatientStatus, checkOcsss, setOcsssPatientStatus, setEcsPatientStatus } from '../../../../store/actions/ECS/ecsAction';
import { ecsSelector, ocsssSelector, mwecsSelector, patientKeySelector, patientInfoSelector } from '../../../../store/selectors/ecsSelectors';

import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import OutlinedRadioValidator from '../../../../components/FormValidator/OutlinedRadioValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import { isAttendedAppointment } from '../../../../utilities/appointmentUtilities';


const sysRatio = CommonUtilities.getSystemRatio();
const unit = CommonUtilities.getResizeUnit(sysRatio);

const styles = () => ({
    apptInfoRow: {
        padding: `${18 * unit}px ${8 * unit}px`
    },
    radioGroup: {
        //height: 36
        height: 39 * unit - 2
    }
});

class AttendanceDetail extends React.Component {

    componentDidMount() {

    }

    handleDiscNumOnChange = (e) => {
        let inputProps = this.refs.discNum.props.inputProps;
        let value = e.target.value;
        let reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);

        if (reg.test(value)) {
            return;
        }

        if (inputProps.maxLength && value.length > inputProps.maxLength) {
            value = value.slice(0, inputProps.maxLength);
        }

        this.props.handleChange(e.target.name, value);
    }

    handleIsNepOnChange = (e) => {
        let value = e.target.checked;
        this.props.handleChange(e.target.name, value);
        // if(!value){
        //     this.props.handleChange('nepRemark', '');
        // }
    }

    handleNepRemarkOnChange = (e) => {
        let value = e.target.value;
        this.props.handleChange(e.target.name, value);
    }

    render() {
        const { classes, currentAppointment, clinicConfig, patientStatus, siteId,
            patientStatusFlag, ecs, ocsss, mwecs, patientStatusList, quotaConfig, patientSvcExist, caseIndicator } = this.props;
        let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        // const patientStatusList = AttendanceUtilities.getPaitentStatusOption(this.props.patientStatusList);
        let bookedApptType = {
            caseType: '',
            bookedQuotaType: ''
        };

        if (currentAppointment) {
            bookedApptType = AppointmentUtilities.getBookedApptType(
                currentAppointment.caseTypeCd,
                currentAppointment.appointmentTypeCd,
                clinicConfig,
                where
            );
        }

        const id = this.props.id || 'attendance_attendanceDetail';

        const isNewToSvcSiteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, this.props.serviceCd, siteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, this.props.serviceCd, siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';
        let confirmECSEligibility = (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isEcsElig) == true ? 'C' :
            (currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isFeeSettled) ? 'P' : '';
        const isAttendedAppt = isAttendedAppointment(currentAppointment && currentAppointment.attnStatusCd);
        const isNullCurAppt = currentAppointment ? false : true;

        return (
            <Grid item container xs={12}>
                <Grid item container xs={12} spacing={1} justify={'space-around'} className={classes.apptInfoRow}>
                    <Grid item xs={4} >
                        <SelectFieldValidator
                            id={id + 'patientStatus'}
                            options={patientStatusList &&
                                patientStatusList.map((item) => (
                                    { value: item.code, label: item.superCode }
                                ))}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: 'Patient Status'
                            }}
                            addNullOption
                            name={'patientStatus'}
                            isDisabled={isAttendedAppt || isNullCurAppt}
                            onChange={(e) => this.props.handleChange('patientStatus', e.value)}
                            value={patientStatus}
                        />
                    </Grid>
                    {
                        (isNewToSvc ==='1' && !patientSvcExist && isAttenConfirmEcsEligibility !== '1' && isAttendedAppt==false) ? <><Grid item xs={6} >
                            <OutlinedRadioValidator
                                id={id + 'caseIndicator'}
                                name="caseIndicator"
                                labelText="Case Indicator"
                                isRequired
                                value={caseIndicator}
                                onChange={e => this.props.handleChange('caseIndicator', e.target.value)}
                                list={
                                    [{ label: 'New to Service', value: 'N' }, { label: 'Existing ' + CommonUtilities.getPatientCall(), value: 'E' }]
                                }
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                RadioGroupProps={{ className: classes.radioGroup }}
                                disabled={isAttendedAppt || isNullCurAppt}
                            />
                        </Grid><Grid item xs={2} /></> : null
                    }
                    {
                        (isNewToSvc !== '1' && isAttenConfirmEcsEligibility !== '1') || (isNewToSvc ==='1' && isAttenConfirmEcsEligibility !== '1' && patientSvcExist) || (isNewToSvc ==='1' && !patientSvcExist && isAttenConfirmEcsEligibility !== '1' && isAttendedAppt) ? <Grid item xs={8} /> : null
                    }
                    {
                        (isNewToSvc ==='1' && patientSvcExist && isAttenConfirmEcsEligibility === '1') || (isAttenConfirmEcsEligibility === '1' && isNewToSvc !== '1') ?
                            <><Grid item xs={6} >
                                <OutlinedRadioValidator
                                    id={id + 'confirmECSEligibility'}
                                    name="confirmECSEligibility"
                                    labelText="Confirm ECS Eligibility"
                                    isRequired
                                    value={confirmECSEligibility}
                                    onChange={e => this.props.handleChange('confirmECSEligibility', e.target.value)}
                                    list={
                                        [{ label: 'Confirm Eligibility', value: 'C' }, { label: 'Payment Settled', value: 'P' }]
                                    }
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{ className: classes.radioGroup }}
                                    disabled={isAttendedAppt && !this.props.editMode || isNullCurAppt}
                                />
                            </Grid><Grid item xs={2} /></> : null
                    }
                    {
                        (isNewToSvc ==='1' && !patientSvcExist && isAttenConfirmEcsEligibility === '1' && isAttendedAppt) ?
                            <><Grid item xs={6} >
                                <OutlinedRadioValidator
                                    id={id + 'confirmECSEligibility'}
                                    name="confirmECSEligibility"
                                    labelText="Confirm ECS Eligibility"
                                    isRequired
                                    value={confirmECSEligibility}
                                    onChange={e => this.props.handleChange('confirmECSEligibility', e.target.value)}
                                    list={
                                        [{ label: 'Confirm Eligibility', value: 'C' }, { label: 'Payment Settled', value: 'P' }]
                                    }
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{ className: classes.radioGroup }}
                                    disabled={isAttendedAppt && !this.props.editMode || isNullCurAppt}
                                />
                            </Grid><Grid item xs={2} /></> : null
                    }
                    {
                        (isNewToSvc ==='1' && !patientSvcExist && isAttenConfirmEcsEligibility === '1' && isAttendedAppt==false) ? <Grid item xs={8} /> : null
                    }
                </Grid>
                {
                    (isNewToSvc ==='1' && !patientSvcExist && isAttenConfirmEcsEligibility === '1' && isAttendedAppt==false) ?
                        <Grid item container xs={12} spacing={1} justify={'space-around'} className={classes.apptInfoRow}>
                            <Grid item xs={6} >
                                <OutlinedRadioValidator
                                    id={id + 'caseIndicator'}
                                    name="caseIndicator"
                                    labelText="Case Indicator"
                                    isRequired
                                    value={caseIndicator}
                                    onChange={e => this.props.handleChange('caseIndicator', e.target.value)}
                                    list={
                                        [{ label: 'New to Service', value: 'N' }, { label: 'Existing ' + CommonUtilities.getPatientCall(), value: 'E' }]
                                    }
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{ className: classes.radioGroup }}
                                    disabled={isAttendedAppt || isNullCurAppt}
                                />
                            </Grid>
                            <Grid item xs={6} >
                                <OutlinedRadioValidator
                                    id={id + 'confirmECSEligibility'}
                                    name="confirmECSEligibility"
                                    labelText="Confirm ECS Eligibility"
                                    isRequired
                                    value={confirmECSEligibility}
                                    onChange={e => this.props.handleChange('confirmECSEligibility', e.target.value)}
                                    list={
                                        [{ label: 'Confirm Eligibility', value: 'C' }, { label: 'Payment Settled', value: 'P' }]
                                    }
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    RadioGroupProps={{ className: classes.radioGroup }}
                                    disabled={isAttendedAppt && !this.props.editMode || isNullCurAppt}
                                />
                            </Grid>
                        </Grid> : null
                }
                <Grid item container alignItems={'flex-end'}>
                    <Grid item container spacing={1} justify={'space-around'} className={classes.apptInfoRow}>
                        <Grid item xs={4}>
                            <FastTextFieldValidator
                                fullWidth
                                disabled
                                id={id + 'encounterType'}
                                value={currentAppointment && currentAppointment.encntrTypeDesc}
                                variant={'outlined'}
                                label={'Encounter'}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FastTextFieldValidator
                                fullWidth
                                disabled
                                id={id + 'subEncoutnerType'}
                                value={currentAppointment && currentAppointment.rmDesc}
                                variant={'outlined'}
                                label={'Room'}
                            />
                        </Grid>
                        <Grid item container xs={4}>
                            <Grid item xs={12} style={{ width: '80%' }}>
                                <FastTextFieldValidator
                                    fullWidth
                                    disabled
                                    id={id + 'quotaTypeCd'}
                                    value={currentAppointment && CommonUtilities.getQuotaTypeDescByQuotaType(quotaConfig, currentAppointment.qtType)}
                                    variant={'outlined'}
                                    // label={Enum.APPOINTMENT_LABELS.QUOTA_TYPE}
                                    label={'Quota Type / Appt. Type'}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container spacing={1} justify={'space-around'} className={classes.apptInfoRow}>
                        <Grid item xs={4} >
                            <FastTextFieldValidator
                                fullWidth
                                disabled
                                id={id + 'date'}
                                value={currentAppointment && currentAppointment.appointmentDate}
                                variant={'outlined'}
                                label={'Appointment Date'}
                            />
                        </Grid>
                        <Grid item container xs={4} alignItems={'flex-end'}>
                            <FastTextFieldValidator
                                fullWidth
                                disabled
                                id={id + 'time'}
                                value={currentAppointment && moment(currentAppointment.appointmentTime, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}
                                variant={'outlined'}
                                label={'Appointment Time'}
                            />
                        </Grid>
                        <Grid item xs={4} >
                            <FastTextFieldValidator
                                fullWidth
                                disabled={isAttendedAppt && !this.props.editMode || isNullCurAppt}
                                variant={'outlined'}
                                id={id + 'discNum'}
                                name={'discNum'}
                                ref={'discNum'}
                                onBlur={(e) => this.handleDiscNumOnChange(e)}
                                value={currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.discNum}
                                inputProps={{ maxLength: 5 }}
                                label={'Disc Number'}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item container xs={12} className={classes.apptInfoRow}>
                    <Box display="flex" width={1}>
                        <Box display="flex">
                            <FormControlLabel
                                control={
                                    <CIMSCheckBox
                                        name={'isNep'}
                                        disabled={isAttendedAppt && !this.props.editMode || isNullCurAppt}
                                        id={`${id}nep_checkbox`}
                                        value={currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep}
                                        onChange={e => this.handleIsNepOnChange(e)}
                                    />
                                }
                                label={'NEP'}
                                checked={(currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.isNep) === true}
                            />
                        </Box>
                        <Box pr={1} flexGrow={1}>
                            <FastTextFieldValidator
                                disabled={isAttendedAppt && !this.props.editMode || !this.props.isNep || isNullCurAppt}
                                id={id + 'nep_remark_txt'}
                                name={'nepRemark'}
                                ref={'nepRemark'}
                                inputProps={{ maxLength: 400 }}
                                value={currentAppointment && currentAppointment.attendanceBaseVo && currentAppointment.attendanceBaseVo.nepRemark}
                                onBlur={e => this.handleNepRemarkOnChange(e)}
                                variant={'outlined'}
                                label={'NEP Remark'}

                            />
                        </Box>
                    </Box>
                </Grid>
                {/* <Grid item container xs={12} className={classes.apptInfoRow}>
                    <FastTextFieldValidator
                        disabled
                        fullWidth
                        id={id + 'attendance_remark'}
                        value={currentAppointment && currentAppointment.remark}
                        variant={'outlined'}
                        label={'Remark'}
                    />
                </Grid> */}
                <Grid item container xs={12} className={classes.apptInfoRow}>
                    {/* <FastTextFieldValidator
                        disabled
                        fullWidth
                        id={id + 'attendance_memo'}
                        value={currentAppointment && currentAppointment.memo}
                        variant={'outlined'}
                        label={'Memo'}
                    /> */}
                    <CIMSMultiTextField
                        disabled
                        id={id + 'attendance_memo'}
                        fullWidth
                        // value={currentAppointment && currentAppointment.apptSlipRemark}
                        value={currentAppointment && currentAppointment.memo}
                        inputProps={{ maxLength: 500 }}
                        variant={'outlined'}
                        label={'Memo'}
                        calActualLength
                        rows="4"
                    />
                </Grid>
                <Grid item container xs={12} >
                    <Box display="flex" width={1} pb={1}>
                        <Box display="flex" width={1}>
                            <Box pr={1}>
                                <CIMSButton
                                    id={id + 'mwecsBtn'}
                                    disabled={!EcsUtilities.isMwecsEnable(
                                        mwecs.accessRights,
                                        mwecs.serviceStatus,
                                        mwecs.ecsUserId,
                                        mwecs.ecsLocId
                                        )}
                                    style={{ padding: '0px', margin: '0px' }}
                                    onClick={() => {
                                        this.props.checkMwecs(EcsUtilities.getMwecsParamsForDirectCall(
                                            mwecs.idType,
                                            mwecs.idNum,
                                            mwecs.patientKey,
                                            mwecs.appointmentId,
                                            mwecs.ecsUserId,
                                            mwecs.ecsLocId
                                        ), null, setMwecsPatientStatus);
                                    }}
                                >MWECS</CIMSButton>
                            </Box>
                            <Box pr={1} flexGrow={1}>
                                <MwecsResultTextField id={id + '_mwecsResultTxt'} mwecsStore={mwecs.selectedPatientMwecsStatus} fullWidth ></MwecsResultTextField>
                            </Box>
                            <Box flexGrow={1}>
                                <MwecsMessageIdTextField id={id + '_mwecsMessageTxt'} mwecsStore={mwecs.selectedPatientMwecsStatus} fullWidth ></MwecsMessageIdTextField>
                            </Box>
                        </Box>

                    </Box>
                    <Box display="flex" width={1} pb={1} >
                        <Box display="flex" width={0.6}>
                            <Box pr={1}>
                                <CIMSButton
                                    id={id + 'ecsBtn'}
                                    disabled={!EcsUtilities.isEcsEnable(
                                        ecs.accessRights,
                                        ecs.docTypeCds,
                                        ecs.ecsUserId,
                                        ecs.ecsLocCode,
                                        false,
                                        ecs.ecsServiceStatus,
                                        ecs.hkicForEcs)}
                                    style={EcsUtilities.getEcsBtnStyle()}
                                    onClick={() => {
                                        this.props.checkEcs(
                                            EcsUtilities.getEcsParamsForDirectCall(
                                                ecs.ecsUserId,
                                                ecs.dob,
                                                ecs.exactDobCd,
                                                ecs.hkicForEcs,
                                                ecs.ecsLocCode,
                                                ecs.patientKey,
                                                ecs.atndId
                                            ),
                                            ecs.hkicForEcs,
                                            null,
                                            setEcsPatientStatus);
                                    }}
                                >{EcsUtilities.getEcsBtnName()}</CIMSButton>
                            </Box>
                            <Box pr={1}>
                                <CIMSButton
                                    id={id + 'ecsAssocBtn'}
                                    disabled={!EcsUtilities.isEcsEnable(
                                        ecs.accessRights,
                                        ecs.docTypeCds,
                                        ecs.ecsUserId,
                                        ecs.ecsLocCode,
                                        false,
                                        ecs.ecsServiceStatus,
                                        ecs.hkicForEcs,
                                        true)}
                                    style={EcsUtilities.getEcsAssocBtnStyle()}
                                    onClick={() => {
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
                                            atndId: ecs.atndId,
                                            mustBeAssociated: true,
                                            associatedHkic: ecs.assoPersHkid
                                        },
                                            null,
                                            setEcsPatientStatus);
                                    }}
                                >{EcsUtilities.getEcsAssoBtnName()}</CIMSButton>
                            </Box>
                            <Box flexGrow={1} pr={1}>
                                <EcsResultTextField id={id + '_ecsResultTxt'} ecsStore={ecs.selectedPatientEcsStatus} fullWidth ></EcsResultTextField>

                            </Box>
                        </Box>
                        <Box display="flex" width={0.4}>
                            <Box pr={1}>
                                <CIMSButton
                                    id={id + 'ocsssBtn'}
                                    style={{ padding: '0px', margin: '0px' }}
                                    disabled={!EcsUtilities.isOcsssEnable(
                                        ocsss.accessRights,
                                        ocsss.docTypeCds,
                                        ocsss.ocsssServiceStatus,
                                        ocsss.hkicForEcs,
                                        ocsss.ecsUserId,
                                        ocsss.ecsLocId
                                        ) || ocsss.selectedPatientOcsssStatus.isValid
                                    }
                                    onClick={() => {
                                        this.props.openOcsssDialog(
                                            {
                                                hkid: ocsss.hkicForEcs,
                                                patientKey: ocsss.patientKey,
                                                atndId: ocsss.atndId,
                                                ecsUserName: ocsss.ecsUserId,
                                                ecsLocationId: ocsss.ecsLocId
                                            },
                                            null, setOcsssPatientStatus, this.props.checkOcsss);
                                    }}
                                >OCSSS</CIMSButton>

                            </Box>
                            <Box flexGrow={1}>
                                <OcsssResultTextField id={id + '_ocsssResultTxt'} ocsssStore={ocsss.selectedPatientOcsssStatus} fullWidth ></OcsssResultTextField>
                            </Box>
                        </Box>
                    </Box>


                </Grid>
            </Grid >
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        quotaConfig: state.common.quotaConfig,
        ecs: ecsSelector(state, patientInfoSelector, patientKeySelector),
        ocsss: ocsssSelector(state, patientInfoSelector, patientKeySelector),
        mwecs: mwecsSelector(state, patientInfoSelector, patientKeySelector),
        siteId: state.login.clinic.siteId,
        serviceCd: state.login.service.serviceCd,
        patientInfo: state.patient.patientInfo
    });
};
const mapDispatchtoProps = {
    redesignListRemarkCode,
    openMwecsDialog,
    openEcsDialog,
    checkEcs,
    checkMwecs,
    openOcsssDialog,
    openCommonMessage,
    checkOcsss
};


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(AttendanceDetail));