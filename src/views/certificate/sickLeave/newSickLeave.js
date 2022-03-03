import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, FormControlLabel, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import FastTextField from '../../../components/TextField/FastTextField';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
// import SickLeaveDateRange from './component/sickLeaveDateRange';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../constants/commonMessage';
import CommonRegex from '../../../constants/commonRegex';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import moment from 'moment';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../enums/validatorEnum';
import AttnDate from '../component/attnDate';
import LeaveDateRange from './component/leaveDateRange';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
// import * as PatientUtil from '../../../utilities/patientUtilities';
import Enum from '../../../enums/enum';
import SiteAlterOpts from '../component/siteAlterOpts';

const styles = () => ({
    root: {
        width: '95%'
    }
});

class newSickLeave extends Component {

    componentDidMount() {
        // let tempLeaveInfo = { ...this.props.newLeaveInfo };
        // let tempSection = CommonUtilities.matchSection(moment(), 'H');
        // tempLeaveInfo.dateRange.leaveFromSection = tempSection;
        // this.props.handleOnChange({ newLeaveInfo: tempLeaveInfo });

    }


    updateLeaveInfo = (value, name) => {
        let leaveInfo = { ...this.props.newLeaveInfo };
        // const reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        // if (name === 'to' || name === 'sufferFrom' || name === 'remark') {
        //     if (reg.test(value)) {
        //         return;
        //     }
        // }
        leaveInfo[name] = value;
        this.props.handleOnChange({ newLeaveInfo: leaveInfo });
    }

    render() {
        const { classes, allowCopyList, newLeaveInfo, isSelected, patientInfo,attnDate, svcCd, selCert } = this.props;
        // const isHKID = PatientUtil.isHKIDFormat(patientInfo.primaryDocTypeCd);
        const isHKID=patientInfo.primaryDocTypeCd===Enum.DOC_TYPE.HKID_ID;
        return (

            <Grid container spacing={2} className={classes.root}>
                <Grid item container><AttnDate id="sickLeave" /></Grid>
                <Grid item container xs={8}>
                    <FastTextFieldValidator
                        id={this.props.id + '_txtTo'}
                        value={newLeaveInfo.to}
                        onBlur={e => this.updateLeaveInfo(e.target.value, 'to')}
                        inputProps={{ maxLength: 34 }}
                        label={<>To<RequiredIcon /></>}
                        disabled={isSelected}
                        variant={'outlined'}
                        calActualLength
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />
                </Grid>
                <Grid item container xs={2}>
                    <DateFieldValidator
                        id={this.props.id + '_AttnDate'}
                        label={<>Attendance Date<RequiredIcon /></>}
                        isRequired
                        disabled={isSelected}
                        disableFuture
                        value={attnDate}
                        onChange={(date) => { this.props.updateAttnDate(date);}}
                        inputVariant={'outlined'}
                    />
                </Grid>
                <Grid item container xs={2}>
                    <DateFieldValidator
                        id={this.props.id + '_issueDate'}
                        label={<>Date of Issue<RequiredIcon /></>}
                        isRequired
                        validByBlur
                        disabled={isSelected}
                        disableFuture
                        value={newLeaveInfo.issueDate}
                        onChange={(date) => { this.updateLeaveInfo(date, 'issueDate'); }}
                        inputVariant={'outlined'}
                    />
                </Grid>
                <Grid item container xs={12}>
                    <FastTextFieldValidator
                        id={this.props.id + '_sufferFrom'}
                        upperCase
                        value={newLeaveInfo.sufferFrom}
                        onBlur={e => this.updateLeaveInfo(e.target.value, 'sufferFrom')}
                        inputProps={{ maxLength: 66 }}
                        label={<>Suffer From<RequiredIcon /></>}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        disabled={isSelected}
                        variant={'outlined'}
                        calActualLength
                    />
                </Grid>
                <Grid item container xs={12}>
                    {/* <SickLeaveDateRange
                        id={'sickLeaveNewSickLeaveDateRange'}
                        data={newLeaveInfo.dateRange}
                        onChange={e => { this.updateLeaveInfo(e, 'dateRange'); }}
                        isSelected={isSelected}
                    /> */}
                    <LeaveDateRange
                        id="sickLeaveNewSickLeaveDateRange"
                        data={newLeaveInfo.dateRange}
                        onChange={e => { this.updateLeaveInfo(e, 'dateRange'); }}
                        isSelected={isSelected}
                    />
                </Grid>
                <Grid item container xs={12} >
                    <FastTextField
                        id={this.props.id + '_reamrk'}
                        value={newLeaveInfo.remark}
                        onBlur={e => this.updateLeaveInfo(e.target.value, 'remark')}
                        inputProps={{ maxLength: 50 }}
                        label="Remarks"
                        disabled={isSelected}
                        variant={'outlined'}
                        calActualLength
                    />
                </Grid>
                <Grid item container xs={2}>
                    <SelectFieldValidator
                        id={`${this.props.id}_noOfCopy`}
                        value={this.props.copyPage}
                        options={allowCopyList && allowCopyList.map(item => ({ value: item.value, label: item.desc }))}
                        onChange={e => this.props.handleOnChange({ copyPage: e.value })}
                        TextFieldProps={{
                            label: <>No. of Copy<RequiredIcon /></>,
                            variant: 'outlined'
                        }}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        isDisabled={isSelected}
                    />
                </Grid>
                {
                    isHKID ?
                        <Grid item container xs={2}>
                            <FormControlLabel
                                className={classes.formlabelRoot}
                                control={
                                    <CIMSCheckBox
                                        checked={newLeaveInfo.isMaskHKID === '0'}
                                        onChange={e => this.updateLeaveInfo(e.target.checked ? '0' : '1', 'isMaskHKID')}
                                        color="primary"
                                        className={classes.iconBtnRoot}
                                        disabled={isSelected}
                                        id={`${this.props.id}_showFullHKID`}
                                    />
                                }
                                label={<Typography className={classes.tableTitle}>Show Full HKID</Typography>}
                                disabled={isSelected}
                            />
                        </Grid>
                        : null
                }
                {
                    svcCd === 'SPP' ?
                        selCert.svcCd === 'SPP' ?
                            <Grid item container xs={12}>
                                <SiteAlterOpts
                                    id={this.props.id}
                                    innerRef={inner => this.siteAlterOptsRef = inner}
                                    codSppSiteAlterCd={newLeaveInfo.codSppSiteAlterCd}
                                    updateSiteAlter={this.updateLeaveInfo}
                                    isDisabled={isSelected}
                                    selCert={selCert}
                                />
                            </Grid>
                            : null
                        : null
                }
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        newLeaveInfo: state.sickLeave.newLeaveInfo,
        patientInfo: state.patient.patientInfo,
        svcCd: state.login.service.svcCd
    };
};

const mapDispatchToProps = {
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(newSickLeave));