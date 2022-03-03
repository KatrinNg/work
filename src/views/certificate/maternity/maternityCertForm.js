import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import RadioFieldValidator from '../../../components/FormValidator/RadioFieldValidator';
import OutlinedRadioValidator from '../../../components/FormValidator/OutlinedRadioValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../constants/commonMessage';
import moment from 'moment';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../enums/validatorEnum';
import AttnDate from '../component/attnDate';

const styles = () => ({
    root: {
        width: '95%'
    },
    formLabelContainer: {
        paddingTop: 20,
        paddingBottom: 20
    },
    radioGroupClassname: {
        height: 'auto',
        paddingTop: 20,
        paddingBottom: 20
    },
    formControlLabelClss1: {
        padding: '10px 0px'
    },
    formControlLabelClss2: {
        paddingLeft: 30
    }
});

class MaternityCertForm extends Component {

    updateLeaveInfo = (value, name) => {
        let leaveInfo = { ...this.props.newLeaveInfo };
        leaveInfo[name] = value;
        if (name === 'cbo_LeaveDate') {
            this.leaveDateFromRef.validateCurrent();
            this.leaveDateToRef.validateCurrent();
            if (!value) {
                leaveInfo['dpk_LeaveFrom'] = null;
                leaveInfo['dpk_LeaveTo'] = null;
            }
        } else if (name === 'cbo_DateOfConfinement') {
            this.dateOfConfinementRef.validateCurrent();
            if (!value) {
                leaveInfo['dpk_DateOfConfinement'] = null;
            }
        } else if (name === 'cbo_Disease') {
            if (!value) {
                leaveInfo['rdo_Disease'] = '';
                leaveInfo['txt_DiseaseRemark'] = '';
            }
        } else if (name === 'rdo_MaternityStatus') {
            if (value === 'pregnant') {
                leaveInfo['dpk_MaternityDelivered'] = null;
            }
        } else if (name === 'dpk_MaternityDelivered') {
            if(value && moment(value).isValid()){
                leaveInfo['rdo_MaternityStatus'] = 'delivered';
            }
        } else if (name === 'dpk_DateOfConfinement') {
            if(value && moment(value).isValid()){
                leaveInfo['cbo_DateOfConfinement'] = true;
            }
        } else if (name === 'rdo_Disease') {
            leaveInfo['cbo_Disease'] = true;
        } else if (name === 'txt_DiseaseRemark') {
            if (value) {
                leaveInfo['cbo_Disease'] = true;
            }
        } else if (name === 'dpk_LeaveFrom' || name === 'dpk_LeaveTo') {
            if (value && moment(value).isValid()){
                leaveInfo['cbo_LeaveDate'] = true;
            }
        }
        this.props.handleOnChange({ newLeaveInfo: leaveInfo });
    }

    onAcceptDate = (date, name) => {
        let leaveInfo = { ...this.props.newLeaveInfo };
        leaveInfo[name] = date;
        if (leaveInfo.dpk_LeaveFrom && leaveInfo.dpk_LeaveTo &&
            moment(leaveInfo.dpk_LeaveFrom).isValid() && moment(leaveInfo.dpk_LeaveTo).isValid() &&
            moment(leaveInfo.dpk_LeaveTo).isBefore(moment(leaveInfo.dpk_LeaveFrom))
        ) {
            if (name === 'dpk_LeaveFrom') {
                leaveInfo.dpk_LeaveTo = leaveInfo.dpk_LeaveFrom;
            }
            if (name === 'dpk_LeaveTo') {
                leaveInfo.dpk_LeaveFrom = leaveInfo.dpk_LeaveTo;
            }
            this.props.handleOnChange({ newLeaveInfo: leaveInfo });
        }
    }

    render() {
        const { classes, allowCopyList, newLeaveInfo, isSelected } = this.props;
        return (

            <Grid container spacing={2} className={classes.root}>
                <Grid item container><AttnDate id="maternityCert" /></Grid>
                <Grid item container xs={6} style={{ marginBottom: 15 }}>
                    <FastTextFieldValidator
                        id={this.props.id + '_txt_To'}
                        value={newLeaveInfo.txt_To}
                        onBlur={e => this.updateLeaveInfo(e.target.value, 'txt_To')}
                        inputProps={{ maxLength: 34 }}
                        label={<>To<RequiredIcon /></>}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        disabled={isSelected}
                        variant={'outlined'}
                        absoluteMessage
                        calActualLength
                    />
                </Grid>
                <Grid item container xs={2} style={{ marginLeft: 40 }}>
                    <DateFieldValidator
                        id={this.props.id + '_dpk_CertDate'}
                        value={newLeaveInfo.dpk_CertDate}
                        isRequired
                        onChange={e => this.updateLeaveInfo(e, 'dpk_CertDate')}
                        label={<>Date<RequiredIcon /></>}
                        disabled={isSelected}
                        disableFuture
                        absoluteMessage
                        inputVariant={'outlined'}
                    />
                </Grid>
                <Grid item container xs={6}>
                    <OutlinedRadioValidator
                        id={this.props.id + '_maternityStatus'}
                        labelText="Maternity Status"
                        isRequired
                        value={newLeaveInfo.rdo_MaternityStatus}
                        onChange={e => { e.stopPropagation(); this.updateLeaveInfo(e.target.value, 'rdo_MaternityStatus'); }}
                        list={[
                            { label: 'The patient is pregnant.', value: 'pregnant' },
                            {
                                label: <Grid container alignItems="center">
                                    <Grid item>The patient has delivered on:</Grid>
                                    <Grid item style={{ marginLeft: 10 }}>
                                        <DateFieldValidator
                                            id={this.props.id + '_dpk_MaternityDelivered'}
                                            isRequired={newLeaveInfo.rdo_MaternityStatus === 'delivered'}
                                            disableFuture
                                            value={newLeaveInfo.dpk_MaternityDelivered}
                                            onChange={e => this.updateLeaveInfo(e, 'dpk_MaternityDelivered')}
                                            disabled={isSelected}
                                            inputVariant={'outlined'}
                                            absoluteMessage
                                        />
                                    </Grid>
                                </Grid>,
                                value: 'delivered'
                            }
                        ]}
                        RadioGroupProps={{
                            row: false,
                            className: classes.radioGroupClassname
                        }}
                        FormControlLabelProps={{
                            className: classes.formControlLabelClss1
                        }}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        disabled={isSelected}
                    />
                </Grid>
                <Grid item container xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                id={this.props.id + '_cbo_DateOfConfinement'}
                                checked={newLeaveInfo.cbo_DateOfConfinement}
                                onChange={e => this.updateLeaveInfo(e.target.checked, 'cbo_DateOfConfinement')}
                                color="primary"
                            />
                        }
                        label={
                            <Grid container alignItems="center">
                                <Grid item>
                                    The patient's expected date of confinement is:
                                </Grid>
                                <Grid item style={{ marginLeft: 20 }}>
                                    <DateFieldValidator
                                        ref={ref => this.dateOfConfinementRef = ref}
                                        id={this.props.id + '_dpk_DateOfConfinement'}
                                        isRequired={newLeaveInfo.cbo_DateOfConfinement}
                                        value={newLeaveInfo.dpk_DateOfConfinement}
                                        onChange={e => this.updateLeaveInfo(e, 'dpk_DateOfConfinement')}
                                        disabled={isSelected}
                                        inputVariant={'outlined'}
                                        disablePast
                                        absoluteMessage
                                    />
                                </Grid>
                            </Grid>
                        }
                        disabled={isSelected}
                    />
                </Grid>
                <Grid item container xs={12} alignItems="center">
                    <Grid item>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id={this.props.id + '_cbo_Disease'}
                                    checked={newLeaveInfo.cbo_Disease}
                                    onChange={e => this.updateLeaveInfo(e.target.checked, 'cbo_Disease')}
                                    color="primary"
                                />
                            }
                            label="The patient has"
                            disabled={isSelected}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <RadioFieldValidator
                            id={this.props.id + '_rdo_Disease'}
                            value={newLeaveInfo.rdo_Disease}
                            onChange={e => this.updateLeaveInfo(e.target.value, 'rdo_Disease')}
                            list={[
                                { label: 'complication(s)', value: 'C' },
                                { label: 'associated disease(s)', value: 'A' }
                            ]}
                            validators={newLeaveInfo.cbo_Disease ? [ValidatorEnum.required] : []}
                            errorMessages={newLeaveInfo.cbo_Disease ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                            disabled={isSelected}
                            msgPosition="right"
                            FormControlLabelProps={{ className: classes.formControlLabelClss2 }}
                        />
                    </Grid>
                </Grid>
                <Grid item container xs={12} style={{ paddingLeft: 40 }}>
                    <FastTextFieldValidator
                        rows="3"
                        multiline
                        trim="none"
                        label="Remarks"
                        id={this.props.id + '_txt_DiseaseRemark'}
                        value={newLeaveInfo.txt_DiseaseRemark}
                        style={{ height: 90 }}
                        disabled={isSelected}
                        inputProps={{ maxLength: 4000 }}
                        calActualLength
                        onBlur={e => this.updateLeaveInfo(e.target.value, 'txt_DiseaseRemark')}
                        variant={'outlined'}
                    />
                </Grid>
                <Grid item container xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                id={this.props.id + '_cbo_LeaveDate'}
                                checked={newLeaveInfo.cbo_LeaveDate}
                                onChange={e => this.updateLeaveInfo(e.target.checked, 'cbo_LeaveDate')}
                                color="primary"
                            />
                        }
                        label={
                            <Grid container alignItems="center">
                                <Grid item>Sick Leave from</Grid>
                                <Grid item style={{ marginLeft: 20 }}>
                                    <DateFieldValidator
                                        ref={ref => this.leaveDateFromRef = ref}
                                        id={this.props.id + '_dpk_LeaveFrom'}
                                        isRequired={newLeaveInfo.cbo_LeaveDate}
                                        value={newLeaveInfo.dpk_LeaveFrom}
                                        onChange={e => this.updateLeaveInfo(e, 'dpk_LeaveFrom')}
                                        onBlur={e => this.onAcceptDate(e, 'dpk_LeaveFrom')}
                                        onAccept={e => this.onAcceptDate(e, 'dpk_LeaveFrom')}
                                        disabled={isSelected}
                                        inputVariant={'outlined'}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item style={{ marginLeft: 20, marginRight: 20 }}>to</Grid>
                                <Grid item>
                                    <DateFieldValidator
                                        ref={ref => this.leaveDateToRef = ref}
                                        id={this.props.id + '_dpk_LeaveTo'}
                                        isRequired={newLeaveInfo.cbo_LeaveDate}
                                        value={newLeaveInfo.dpk_LeaveTo}
                                        onChange={e => this.updateLeaveInfo(e, 'dpk_LeaveTo')}
                                        onBlur={e => this.onAcceptDate(e, 'dpk_LeaveTo')}
                                        onAccept={e => this.onAcceptDate(e, 'dpk_LeaveTo')}
                                        disabled={isSelected}
                                        inputVariant={'outlined'}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item style={{ marginLeft: 20 }}>inclusive is recommended.</Grid>
                            </Grid>
                        }
                        disabled={isSelected}
                    />
                </Grid>
                <Grid item container xs={2} style={{ marginTop: 20 }}>
                    <SelectFieldValidator
                        id={`${this.props.id}_noOfCopy`}
                        value={this.props.copyPage}
                        options={allowCopyList && allowCopyList.map(item => ({ value: item.value, label: item.desc }))}
                        onChange={e => this.props.handleOnChange({ copyPage: e.value })}
                        TextFieldProps={{
                            label: <>No. of Copy<RequiredIcon /></>,
                            variant:'outlined'
                        }}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        isDisabled={isSelected}
                    />
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        newLeaveInfo: state.maternity.newLeaveInfo
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MaternityCertForm));