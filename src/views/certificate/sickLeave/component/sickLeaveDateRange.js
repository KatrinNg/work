import React, { Component } from 'react';
import {
    Grid,
    Radio,
    FormControlLabel,
    IconButton,
    RadioGroup,
    InputAdornment,
    FormHelperText
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import DateFieldValidator from 'components/FormValidator/DateFieldValidator';
import CIMSFormLabel from 'components/InputLabel/CIMSFormLabel';
import TextFieldValidator from 'components/FormValidator/TextFieldValidator';
import { Add, Remove } from '@material-ui/icons';
import moment from 'moment';
import ValidatorEnum from 'enums/validatorEnum';
import CommonMessage from 'constants/commonMessage';
import RequiredIcon from 'components/InputLabel/RequiredIcon';
import Enum from '../../../../enums/enum';
import _ from 'lodash';

const CustomRadio = withStyles({
    root: {
        padding: 5
    }
})(Radio);

const CustomFormControlLabel = withStyles({
    root: {
        marginLeft: 'unset',
        marginRight: 10
    }
})(FormControlLabel);

const styles = theme => ({
    root: {
        padding: `${theme.spacing(3)}px ${theme.spacing(2)}px`,
        width: '100%'
    },
    periodContainerRoot: {
        padding: '0px 0px 0px 16px',
        alignItems: 'center'
    },
    itemRoot: {
        marginRight: 3
    },
    iconButtonRoot: {
        padding: 3
    }
});

class SickLeaveDateRange extends Component {

    state = {
        errorMessageList: []
    }

    validatorListener = (isValid, message, name) => {
        let { errorMessageList } = this.state;
        let index = errorMessageList.findIndex(error => error.fieldName === name);
        if (!isValid) {
            if (index === -1) {
                errorMessageList.push({
                    fieldName: name,
                    errMsg: message
                });
            } else {
                errorMessageList[index] = {
                    fieldName: name,
                    errMsg: message
                };
            }
        } else {
            if (index > -1) {
                errorMessageList.splice(index, 1);
            }
        }
        this.setState({ errorMessageList });
    }

    handleDateChange = (value, name) => {
        let rangeData = { ...this.props.data };
        rangeData[name] = value;
        this.props.onChange(rangeData);
    }

    handleDateAccept = (value, name) => {
        if (value && moment(value).isValid()) {
            /**handle datefrom and dateto */
            let rangeData = { ...this.props.data };
            if (name === 'leaveFrom' && moment(rangeData.leaveTo).isValid() && moment(value).isAfter(moment(rangeData.leaveTo))) {
                rangeData.leaveTo = value;
            } else if (name === 'leaveTo' && moment(rangeData.leaveFrom).isValid() && moment(value).isBefore(moment(rangeData.leaveFrom))) {
                rangeData.leaveFrom = value;
            }
            rangeData[name] = value;
            /**handle datefrom and dateto */

            /**handle period value */
            if (rangeData.leaveTo && rangeData.leaveFrom && moment(rangeData.leaveTo).isValid() && moment(rangeData.leaveFrom).isValid()) {
                let day = moment(rangeData.leaveTo).diff(moment(rangeData.leaveFrom), 'day');
                if (rangeData.section === Enum.SECTION_TYPE.NOTSPECIFY) {
                    day += 1;
                } else {
                    if (day > 0) {
                        day += 1;
                    }
                }
                rangeData['period'] = day.toString();
            }
            /**handle period value */
            this.props.onChange(rangeData);
        }
    }

    handIconBtnClick = (e, name) => {
        let tempRangeData = _.cloneDeep(this.props.data);
        this.refs.period.validateCurrent();
        if (this.refs.period.isValid()) {
            let tempPeriod = Number(tempRangeData.period);
            let { leaveFrom } = this.props.data;
            if (name === 'Add') {
                tempPeriod = tempPeriod + 1;
            } else if (name === 'Minus') {
                tempPeriod = tempPeriod - 1;
                if (tempPeriod < 0) {
                    tempPeriod = 0;
                }
            }
            let tempLeaveTo = this.addDayPeriod(tempPeriod, leaveFrom);
            tempRangeData.leaveTo = tempLeaveTo;
            tempRangeData.period = tempPeriod.toString();
        }
        this.props.onChange(tempRangeData);
    }

    addDayPeriod = (period, date) => {
        let tempPeriod = Number(period) - 1;
        if (tempPeriod >= 1) {
            return moment(date).add(tempPeriod, 'days');
        } else {
            return date;
        }
    }

    handlePeriodChange = (value) => {
        let tempRangeData = _.cloneDeep(this.props.data);
        tempRangeData.period = value;
        this.refs.period.validateCurrent();
        if (this.refs.period.isValid()) {
            const { leaveFrom } = this.props.data;
            let tempLeaveTo = this.addDayPeriod(value, leaveFrom);
            tempRangeData.leaveTo = tempLeaveTo;
        }
        this.props.onChange(tempRangeData);
    }

    handlePeriodBlur = () => {
        let tempRangeData = _.cloneDeep(this.props.data);
        if (tempRangeData.section !== Enum.SECTION_TYPE.NOTSPECIFY && _.toString(tempRangeData.period) === '1'){
            tempRangeData.period = '0';
            tempRangeData.leaveTo = tempRangeData.leaveFrom;
            this.props.onChange(tempRangeData);
        }
        if(tempRangeData.section === Enum.SECTION_TYPE.NOTSPECIFY && _.toString(tempRangeData.period) === '0'){
            tempRangeData.period = '1';
            tempRangeData.leaveTo = tempRangeData.leaveFrom;
            this.props.onChange(tempRangeData);
        }
    }

    handleSectionChange = (value) => {
        let rangeData = _.cloneDeep(this.props.data);
        let tempPeriod = Number(rangeData.period);
        if (tempPeriod === 1) {
            if (value === Enum.SECTION_TYPE.AM || value === Enum.SECTION_TYPE.PM) {
                rangeData.period = '0';
            }
        } else if (tempPeriod === 0) {
            if (value === Enum.SECTION_TYPE.NOTSPECIFY) {
                rangeData.period = 1;
            }
        }
        rangeData.section = value;
        this.props.onChange(rangeData);
    }

    render() {
        const { classes, data, isSelected } = this.props;
        const { errorMessageList } = this.state;

        return (
            <CIMSFormLabel
                labelText={<>Leave Range<RequiredIcon /></>}
                className={classes.root}
            >
                <Grid container spacing={2}>
                    <Grid item container spacing={2}>
                        <Grid item xs={2}>
                            <DateFieldValidator
                                id={this.props.id + '_FromDate'}
                                isRequired
                                value={data.leaveFrom}
                                label={<>Leave From<RequiredIcon /></>}
                                inputVariant="outlined"
                                notShowMsg
                                validByBlur
                                disabled={isSelected}
                                onChange={(e) => { this.handleDateChange(e, 'leaveFrom'); }}
                                onBlur={e => this.handleDateAccept(e, 'leaveFrom')}
                                onAccept={e => this.handleDateAccept(e, 'leaveFrom')}
                                validatorListener={(...arg) => this.validatorListener(...arg, 'Leave From')}
                            />
                        </Grid>

                        <Grid container item xs={2} wrap="nowrap" alignItems="center">
                            <Grid item>
                                <TextFieldValidator
                                    id={this.props.id + '_txtPeriod'}
                                    label="Period"
                                    type="number"
                                    disabled={isSelected}
                                    variant="outlined"
                                    /* eslint-disable */
                                    InputProps={{
                                        endAdornment:
                                            <InputAdornment position="end">
                                                <IconButton
                                                    className={classes.iconButtonRoot}
                                                    color={isSelected ? 'inherit' : 'primary'}
                                                    disabled={isSelected}
                                                    onClick={e => { this.handIconBtnClick(e, 'Add'); }}
                                                >
                                                    <Add />
                                                </IconButton>
                                            </InputAdornment>,
                                        startAdornment:
                                            <InputAdornment position="start">
                                                <IconButton
                                                    className={classes.iconButtonRoot}
                                                    color={isSelected ? 'inherit' : 'primary'}
                                                    disabled={isSelected}
                                                    onClick={e => { this.handIconBtnClick(e, 'Minus'); }}
                                                >
                                                    <Remove />
                                                </IconButton>
                                            </InputAdornment>
                                    }}
                                    inputProps={{
                                        maxLength: 4,
                                        style: { textAlign: 'center' }
                                    }}
                                    /* eslint-enable */
                                    value={data.period}
                                    onChange={e => { this.handlePeriodChange(e.target.value); }}
                                    onBlur={this.handlePeriodBlur}
                                    validators={[ValidatorEnum.required, ValidatorEnum.isPositiveIntegerWithZero]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_POSITIVE_INTEGER_WITH_ZERO()]}
                                    validatorListener={(...arg) => this.validatorListener(...arg, 'Period')}
                                    validByBlur
                                    notShowMsg
                                    name={'Period'}
                                    ref={'period'}
                                />
                            </Grid>
                            <Grid item xs style={{ paddingLeft: 4 }}>day(s)</Grid>
                        </Grid>
                        <Grid item container xs={4}>
                            <RadioGroup
                                id={this.props.id + '_sectionRadioGroup'}
                                row
                                value={data.section}
                                onChange={e => { this.handleSectionChange(e.target.value); }}
                            >
                                <CustomFormControlLabel value={Enum.SECTION_TYPE.AM} control={<CustomRadio disabled={isSelected} color={'primary'} />} label="AM" />
                                <CustomFormControlLabel value={Enum.SECTION_TYPE.PM} control={<CustomRadio disabled={isSelected} color={'primary'} />} label="PM" />
                                <CustomFormControlLabel value={Enum.SECTION_TYPE.NOTSPECIFY} control={<CustomRadio disabled={isSelected} color={'primary'} />} label="Not Specify" />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                    <Grid item xs={2}>
                        <DateFieldValidator
                            id={this.props.id + '_ToDate'}
                            value={data.leaveTo}
                            inputVariant="outlined"
                            onChange={(e) => { this.handleDateChange(e, 'leaveTo'); }}
                            onBlur={e => this.handleDateAccept(e, 'leaveTo')}
                            onAccept={e => this.handleDateAccept(e, 'leaveTo')}
                            validatorListener={(...arg) => this.validatorListener(...arg, 'Leave To')}
                            notShowMsg
                            isRequired
                            validByBlur
                            label={<>Leave To<RequiredIcon /></>}
                            disabled={isSelected}
                        />
                    </Grid>
                </Grid>
                {
                    errorMessageList.map((item, index) => (
                        <FormHelperText key={index} error id="sickLeaveDateRange_errorMessage">
                            {`${item.fieldName}: ${item.errMsg}`}
                        </FormHelperText>
                    ))
                }
            </CIMSFormLabel>
        );
    }
}

export default withStyles(styles)(SickLeaveDateRange);