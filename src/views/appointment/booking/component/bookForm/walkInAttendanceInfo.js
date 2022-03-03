import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
    Checkbox
} from '@material-ui/core';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import CommonRegex from '../../../../../constants/commonRegex';
import * as CommonUtilities from '../../../../../utilities/commonUtilities';
import { PageStatus as pageStatusEnum } from '../../../../../enums/appointment/booking/bookingEnum';

const styles = () => ({
    maintitleRoot: {
        paddingTop: '6px',
        fontSize: '14pt',
        fontWeight: 600
    },
    infoContainerRoot: {
        flexWrap: 'wrap',
        //alignItems: 'flex-end',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        padding: '16px 18px 16px 18px',
        borderRadius: '4px',
        marginBottom: '2px'
    }
});

const payment = [
    {
        'code': 'Cash',
        'engDesc': 'Cash'
    },
    {
        'code': 'Cheque',
        'engDesc': 'Cheque'
    },
    {
        'code': 'Octopus',
        'engDesc': 'Octopus'
    }
];

class walkInAttendanceInfo extends Component {

    updateInfo = (info) => {
        this.props.handleWalkInInfoChange(info);
    }

    handlePatientStatusChange = (e) => {
        let info = {
            ...this.props.walkInInfo,
            patientStatus: e.value
        };
        this.updateInfo(info);

    }

    changeRadio = (e, checked) => {
        let value = e.target.value;
        let info = { ...this.props.walkInInfo };
        if (checked) {
            info.paymentMeanCD = value;
            this.updateInfo(info);
        }
    };

    handleDiscNumberChange = (e) => {
        let reg = new RegExp(CommonRegex.VALIDATION_REGEX_INCLUDE_CHINESE);
        let inputProps = this.refs.discNum.props.inputProps;
        let value = e.target.value;
        if (reg.test(value)) {
            return;
        }

        if (inputProps.maxLength && value.length > inputProps.maxLength) {
            value = value.slice(0, inputProps.maxLength);
        }

        let info = {
            ...this.props.walkInInfo,
            discNumber: value
        };
        this.updateInfo(info);
    }

    handleCbMSWChange = (e, checked) => {
        let info = { ...this.props.walkInInfo };
        if (checked) {
            info.mswWaiver = 1;
        } else {
            info.mswWaiver = 0;
        }
        this.updateInfo(info);
    }

    handleAmountChange = (e) => {
        let info = {
            ...this.props.walkInInfo,
            amount: e.target.value
        };
        this.updateInfo(info);
    }

    render() {
        const { classes, pageStatus, patientStatusList, walkInInfo } = this.props;
        if (pageStatus !== pageStatusEnum.WALKIN){
            return null;
        }
        return (
            <Grid item container>
                <Typography className={classes.maintitleRoot}>Attendance Information</Typography>
                <Grid container item className={classes.infoContainerRoot}>
                    <Grid container spacing={1}>
                        <Grid item xs={4}>
                            <Grid container item >
                                <Typography >{CommonUtilities.getPatientCall()} Status</Typography>
                            </Grid>
                            <Grid container item>
                                <SelectFieldValidator
                                    id={this.props.id + 'patientStatus'}
                                    options={patientStatusList && patientStatusList.map((item) => (
                                            { value: item.code, label: item.superCode }
                                        ))}
                                    name={'patientStatus'}
                                    onChange={this.handlePatientStatusChange}
                                    value={walkInInfo.patientStatus}
                                    addNullOption
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container item>
                                <Typography>Payment Mean</Typography>
                            </Grid>
                            <Grid container item>
                                <RadioGroup
                                    id={this.props.id + '_PaymentMeanGroup'}
                                    row
                                    style={{ flexWrap: 'nowrap', justifyContent: 'space-between', width: '100%' }}
                                    name="Payment Means"
                                    value={walkInInfo.paymentMeanCD || 'Cash'}
                                    onChange={(...arg) => this.changeRadio(...arg, 'paymentMeanCD')}
                                >
                                    {
                                        payment.map((item, index) =>
                                            <FormControlLabel key={index} value={item.code}
                                                //disabled={comDisabled}
                                                label={item.engDesc}
                                                labelPlacement="end"
                                                id={this.props.id + '_' + item.code + '_radioLabel'}
                                                control={
                                                    <Radio
                                                        id={this.props.id + '_' + item.code + '_radio'}
                                                        color={'primary'}
                                                    />}
                                            />
                                        )}
                                </RadioGroup>
                            </Grid>
                        </Grid>
                        <Grid item xs={2}>
                            <Grid container item>
                                <Typography>Amount</Typography>
                            </Grid>
                            <FastTextFieldValidator
                                id={'txt_' + this.props.id + '_Amount'}
                                variant={'standard'}
                                value={walkInInfo.amount}
                                onBlur={(e) => this.handleAmountChange(e, 'amount')}
                            />
                        </Grid>

                    </Grid>
                    <Grid container spacing={1} style={{ alignItems: 'flex-end' }}>
                        <Grid item xs={4}>
                            <Grid container item>
                                <Typography>Disc Number</Typography>
                            </Grid>
                            <FastTextFieldValidator
                                id={'txt_' + this.props.id + '_Disc_Number'}
                                variant={'outlined'}
                                ref={'discNum'}
                                value={walkInInfo.discNumber}
                                onBlur={this.handleDiscNumberChange}
                                style={{ width: '100%' }}
                                inputProps={{ maxLength: 10 }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id={this.props.id + 'Msw_Waiver_CheckBox'}
                                        value={'1'}
                                        name={'MSW Waiver'}
                                    />
                                }
                                label={'MSW Waiver'}
                                checked={walkInInfo.mswWaiver === 1}// eslint-disable-line
                                onChange={this.handleCbMSWChange}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}
const mapStatetoProps = (state) => {
    return ({
        patientInfo: state.patient.patientInfo,
        walkInInfo: state.bookingInformation.walkInAttendanceInfo,
        pageStatus: state.bookingInformation.pageStatus
    });
};

const mapDispatchtoProps = {
};
export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(walkInAttendanceInfo));