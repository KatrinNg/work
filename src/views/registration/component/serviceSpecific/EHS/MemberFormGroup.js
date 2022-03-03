import { Checkbox, FormControlLabel, Grid, Typography, withStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import CIMSTextField from '../../../../../components/TextField/CIMSTextField';
import { updateState, updatePatientEhsDto } from '../../../../../store/actions/registration/registrationAction';
import * as _ from 'lodash';
import Enum, { EHS_CONSTANT } from '../../../../../enums/enum';
import ButtonStatusEnum from '../../../../../enums/administration/buttonStatusEnum';
import { PatientUtil } from '../../../../../utilities';
import * as moment from 'moment';
import CIMSCommonDatePicker from '../../../../../components/DatePicker/CIMSCommonDatePicker';
import { isApplyEhsMember } from '../../../../../utilities/patientUtilities';

const MemberFormGroup = (props) => {
    const { comDisabled, patientBaseInfo, updatePatientEhsDto, classes, patientOperationStatus, updateState } = props;

    const [dateFormat, setDateFormat] = useState({
        memberSinceDate: Enum.DATE_FORMAT_EDMY_VALUE,
        applicationDate: Enum.DATE_FORMAT_EDMY_VALUE
    });

    const handleOnChange = (name, value) => {
        updatePatientEhsDto({ [name]: value });
    };

    const handleIsApplyEhsMemberOnchange = (e) => {
        if (!e.target.checked) {
            if (!isApplyEhsMember(patientBaseInfo?.ehsMbrSts)) {
                updateState({ patientBaseInfo: { ...patientBaseInfo, isApplyEhsMember: Enum.COMMON_NO } });
            } else {
                // cancel member?
            }
        } else {
            updateState({ patientBaseInfo: { ...patientBaseInfo, isApplyEhsMember: Enum.COMMON_YES } });
        }
    };

    return (
        <Grid item xs={12} container>
            <Grid item xs={12} container spacing={1}>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="Apply Member"
                        name="isApplyMember"
                        checked={patientBaseInfo?.isApplyEhsMember === 1}
                        onChange={(e) => {
                            handleIsApplyEhsMemberOnchange(e);
                        }}
                        disabled={comDisabled || isApplyEhsMember(patientBaseInfo?.ehsMbrSts)}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <CIMSTextField
                        id="registration_ehs_member_status"
                        label="Status"
                        variant="outlined"
                        disabled
                        value={
                            (patientBaseInfo?.patientKey &&
                                PatientUtil.getEhsMemberStatusDesc(
                                    patientBaseInfo?.ehsMbrSts,
                                    patientBaseInfo?.patientEhsDto?.siteId,
                                    patientBaseInfo?.patientEhsDto?.isFrozen
                                )) ||
                            ''
                        }
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <CIMSTextField id="registration_ehs_member_id" label="Member ID" variant="outlined" disabled />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    {/* <CIMSTextField id="registration_ehs_member_since" label="Member Since" variant="outlined" disabled /> */}
                    <CIMSCommonDatePicker
                        id="registration_ehs_member_since_date"
                        // InputProps={{
                        //     classes: {
                        //         input: classes.datePickerInput
                        //     }
                        // }}
                        label={
                            <span>
                                Member Since
                                {/* <RequiredIcon /> */}
                            </span>
                        }
                        margin={'none'}
                        value={patientBaseInfo?.patientEhsDto?.fistHlthAsmtDate || null}
                        // format={Enum.DATE_FORMAT_EDMY_VALUE}
                        onChange={(value) => {
                            handleOnChange('fistHlthAsmtDate', value);
                        }}
                        format={dateFormat.memberSinceDate}
                        autoFocus={dateFormat.memberSinceDate === Enum.DATE_FORMAT_FOCUS_DMY_VALUE}
                        onFocus={() => setDateFormat({...dateFormat, memberSinceDate: Enum.DATE_FORMAT_FOCUS_DMY_VALUE})}
                        onBlur={() => setDateFormat({...dateFormat, memberSinceDate: Enum.DATE_FORMAT_EDMY_VALUE})}
                        disabled={
                            comDisabled ||
                            patientBaseInfo?.ehsMbrSts !== EHS_CONSTANT.MEMBER_STATUS_TRANSFER ||
                            patientBaseInfo?.ehsMbrSts !== EHS_CONSTANT.MEMBER_STATUS
                        }
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <CIMSCommonDatePicker
                        id="registration_ehs_member_application_date"
                        // InputProps={{
                        //     classes: {
                        //         input: classes.datePickerInput
                        //     }
                        // }}
                        label={
                            <span>
                                Application Date
                                {/* <RequiredIcon /> */}
                            </span>
                        }
                        margin={'none'}
                        value={patientBaseInfo?.patientEhsDto?.appDate || null}
                        // format={Enum.DATE_FORMAT_EDMY_VALUE}
                        onChange={(value) => {
                            handleOnChange('appDate', value);
                        }}
                        format={dateFormat.applicationDate}
                        autoFocus={dateFormat.applicationDate === Enum.DATE_FORMAT_FOCUS_DMY_VALUE}
                        onFocus={() => setDateFormat({...dateFormat, applicationDate: Enum.DATE_FORMAT_FOCUS_DMY_VALUE})}
                        onBlur={() => setDateFormat({...dateFormat, applicationDate: Enum.DATE_FORMAT_EDMY_VALUE})}
                        disabled={comDisabled || !isApplyEhsMember(patientBaseInfo?.ehsMbrSts)}
                    />
                    {/* <CIMSTextField
                        id="registration_ehs_member_application_date"
                        label="Application Date"
                        variant="outlined"
                        disabled
                        value={
                            moment(patientBaseInfo?.patientEhsDto?.appDate).isValid()
                                ? moment(patientBaseInfo?.patientEhsDto?.appDate).format(Enum.DATE_FORMAT_EDMY_VALUE)
                                : ''
                        }
                    /> */}
                </Grid>
            </Grid>
        </Grid>
    );
};

const styles = (theme) => ({
    datePickerInput: {
        height: '20px'
    }
});

const mapStateToProps = (state) => {
    return {
        patientOperationStatus: state.registration.patientOperationStatus,
        patientBaseInfo: state.registration.patientBaseInfo
    };
};

const mapDispatchToProps = { updatePatientEhsDto, updateState };

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MemberFormGroup));
