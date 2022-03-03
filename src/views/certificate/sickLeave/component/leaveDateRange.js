import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import DatePicker from '../../../../components/FormValidator/DateFieldValidator';
import Select from '../../../../components/FormValidator/SelectFieldValidator';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import moment from 'moment';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import CommonRegex from '../../../../constants/commonRegex';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';

const styles = theme => ({
    root: {
        padding: `${theme.spacing(3)}px ${theme.spacing(2)}px`,
        width: '100%'
    }
});

const sectionOptions = [
    { label: 'AM', value: Enum.SECTION_TYPE.AM },
    { label: 'PM', value: Enum.SECTION_TYPE.PM }
];

function isPeriodValid(value) {
    if (value === undefined || value === null || value === '') { return true; }
    const num = parseFloat(value);
    if (!isNaN(value) && num > 0 && num % 0.5 === 0) {
        return true;
    }
    return false;
}

function isPostiveDecimal(value) {
    if (!value) return false;
    return new RegExp(CommonRegex.VALIDATION_REGEX_POSITIVE_DECIMAL).test(value);
}

function calcFromDate(todate, toSection, period) {
    if (isPeriodValid(period) && todate && moment(todate).isValid() && toSection) {
        if (toSection === Enum.SECTION_TYPE.AM) {
            let date = moment(todate).add(-Math.floor(period), 'day');
            let section = Enum.SECTION_TYPE.PM;
            if (isPostiveDecimal(period)) {
                section = Enum.SECTION_TYPE.AM;
            }
            return { date, section };
        } else if (toSection === Enum.SECTION_TYPE.PM) {
            let date = moment(todate).add(-(Math.ceil(period) - 1), 'day');
            let section = Enum.SECTION_TYPE.AM;
            if (isPostiveDecimal(period)) {
                section = Enum.SECTION_TYPE.PM;
            }
            return { date, section };
        }
    }
    return null;
}

function calcToDate(fromdate, fromSection, period) {
    if (isPeriodValid(period) && fromdate && moment(fromdate).isValid() && fromSection) {
        if (fromSection === Enum.SECTION_TYPE.AM) {
            let date = moment(fromdate).add(Math.ceil(period) - 1, 'day');
            let section = Enum.SECTION_TYPE.PM;
            if (isPostiveDecimal(period)) {
                section = Enum.SECTION_TYPE.AM;
            }
            return { date, section };
        } else if (fromSection === Enum.SECTION_TYPE.PM) {
            let date = moment(fromdate).add(Math.floor(period), 'day');
            let section = Enum.SECTION_TYPE.PM;
            if (!isPostiveDecimal(period)) {
                section = Enum.SECTION_TYPE.AM;
            }
            return { date, section };
        }
        return null;
    }
    return null;
}

export function calcPeriod(fromdate, fromSection, todate, toSection) {
    if (!CommonUtil.isFromDateAfter(fromdate, todate) && fromSection && toSection) {
        if (moment(fromdate).isSame(moment(todate), 'day')
            && fromSection === Enum.SECTION_TYPE.PM
            && toSection === Enum.SECTION_TYPE.AM) {
            return '';
        } else {
            let diffDays = moment(todate).diff(moment(fromdate), 'day') + 1;
            if (fromSection === Enum.SECTION_TYPE.PM) {
                diffDays -= 0.5;
            }
            if (toSection === Enum.SECTION_TYPE.AM) {
                diffDays -= 0.5;
            }
            return diffDays;
        }
    }
}

class LeaveDateRange extends Component {
    constructor(props) {
        super(props);

        ValidatorForm.addValidationRule(ValidatorEnum.isPeriodValid, isPeriodValid);
    }

    handleDateChange = (value, name) => {
        let rangeData = { ...this.props.data };
        rangeData[name] = value;
        this.props.onChange(rangeData);
    }

    handleDateAccept = (value, name) => {
        if (value && moment(value).isValid()) {
            let rangeData = { ...this.props.data };
            rangeData[name] = value;
            if (rangeData.period) {
                if (name === 'leaveFrom') {
                    const todate = calcToDate(moment(rangeData.leaveFrom), rangeData.leaveFromSection, rangeData.period);
                    if (todate) {
                        rangeData['leaveTo'] = todate.date;
                        rangeData['leaveToSection'] = todate.section;
                    }
                }
                if (name === 'leaveTo') {
                    const fromdate = calcFromDate(moment(rangeData.leaveTo), rangeData.leaveToSection, rangeData.period);
                    if (fromdate) {
                        rangeData['leaveFrom'] = fromdate.date;
                        rangeData['leaveFromSection'] = fromdate.section;
                    }
                }
            } else {
                const period = calcPeriod(rangeData.leaveFrom, rangeData.leaveFromSection, rangeData.leaveTo, rangeData.leaveToSection);
                if (period) { rangeData.period = period; }
            }
            this.props.onChange(rangeData);
        }
    }

    handleSectionChange = (value, name) => {
        let rangeData = _.cloneDeep(this.props.data);
        rangeData[name] = value;
        if (rangeData.period) {
            if (name === 'leaveFromSection') {
                const todate = calcToDate(moment(rangeData.leaveFrom), rangeData.leaveFromSection, rangeData.period);
                if (todate) {
                    rangeData['leaveTo'] = todate.date;
                    rangeData['leaveToSection'] = todate.section;
                }
            }
            if (name === 'leaveToSection') {
                const fromdate = calcFromDate(moment(rangeData.leaveTo), rangeData.leaveToSection, rangeData.period);
                if (fromdate) {
                    rangeData['leaveFrom'] = fromdate.date;
                    rangeData['leaveFromSection'] = fromdate.section;
                }
            }
        } else {
            const period = calcPeriod(rangeData.leaveFrom, rangeData.leaveFromSection, rangeData.leaveTo, rangeData.leaveToSection);
            if (period) { rangeData.period = period; }
        }
        this.props.onChange(rangeData);
    }

    handlePeriodBlur = (value) => {
        let rangeData = _.cloneDeep(this.props.data);
        // rangeData.period = value;
        rangeData.period = value ? parseFloat(value) : '';
        if (rangeData.period && isPeriodValid(rangeData.period)) {
            if (rangeData.leaveFrom
                && moment(rangeData.leaveFrom).isValid()
                && rangeData.leaveFromSection) {
                const todate = calcToDate(rangeData.leaveFrom, rangeData.leaveFromSection, rangeData.period);
                if (todate) {
                    rangeData['leaveTo'] = todate.date;
                    rangeData['leaveToSection'] = todate.section;
                }
            } else if (rangeData.leaveFrom
                && moment(rangeData.leaveFrom).isValid()) {
                rangeData['leaveFromSection'] = Enum.SECTION_TYPE.AM;
                const todate = calcToDate(rangeData.leaveFrom, Enum.SECTION_TYPE.AM, rangeData.period);
                if (todate) {
                    rangeData['leaveTo'] = todate.date;
                    rangeData['leaveToSection'] = todate.section;
                }
            }
        }
        this.props.onChange(rangeData);
    }

    render() {
        const { classes, data, isSelected } = this.props;

        return (
            <CIMSFormLabel
                labelText={<>Leave Range<RequiredIcon /></>}
                className={classes.root}
            >
                <Grid container>
                    <Grid item container >
                        <Grid item xs={6}>
                            <FastTextFieldValidator
                                id={`${this.props.id}_txtPeriod`}
                                label={<>Total Number of Day(s)<RequiredIcon /></>}
                                type="decimal"
                                disabled={isSelected}
                                /* eslint-disable */
                                inputProps={{
                                    maxLength: 4
                                }}
                                // InputProps={{
                                //     endAdornment: <Grid item xs>day(s)</Grid>
                                // }}
                                /* eslint-enable */
                                value={data.period}
                                onBlur={e => this.handlePeriodBlur(e.target.value)}
                                onChange={e => {
                                    let _val = _.clone(e.target.value);
                                    const pointIdx = _val.indexOf('.');
                                    if (new RegExp(CommonRegex.VALIDATION_REGEX_DECIMAL).test(_val) && pointIdx !== _val.length - 1 && pointIdx !== -1) {
                                        _val = parseFloat(_val || 0);
                                        e.target.value = _val;
                                    }
                                }}
                                validators={[ValidatorEnum.required, ValidatorEnum.isPeriodValid]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.PERIOD_SHOULD_BE_POINT5_TIMES()]}
                                ref={'period'}
                                absoluteMessage
                            />
                        </Grid>
                    </Grid>
                    <Grid item spacing={1} container style={{ marginTop: 24 }}>
                        <Grid item xs={4}>
                            <DatePicker
                                id={`${this.props.id}_fromDate`}
                                isRequired
                                value={data.leaveFrom}
                                label={<>Leave From<RequiredIcon /></>}
                                disabled={isSelected}
                                absoluteMessage
                                onChange={(e) => { this.handleDateChange(e, 'leaveFrom'); }}
                                onBlur={e => this.handleDateAccept(e, 'leaveFrom')}
                                onAccept={e => this.handleDateAccept(e, 'leaveFrom')}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Select
                                id={`${this.props.id}_fromDateSection`}
                                options={sectionOptions}
                                value={data.leaveFromSection}
                                onChange={e => this.handleSectionChange(e.value, 'leaveFromSection')}
                                isDisabled={isSelected}
                                TextFieldProps={{
                                    label: <>Session</>,
                                    variant: 'outlined'
                                }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                absoluteMessage
                            />
                        </Grid>
                    </Grid>

                    <Grid item container style={{ marginTop: 24 }} >
                        <Grid item container spacing={1}>
                            <Grid item xs={4}>
                                <DatePicker
                                    id={`${this.props.id}_toDate`}
                                    value={data.leaveTo}
                                    onChange={(e) => { this.handleDateChange(e, 'leaveTo'); }}
                                    onBlur={e => this.handleDateAccept(e, 'leaveTo')}
                                    onAccept={e => this.handleDateAccept(e, 'leaveTo')}
                                    isRequired
                                    label={<>Leave To<RequiredIcon /></>}
                                    disabled={isSelected}
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Select
                                    id={`${this.props.id}_toDateSection`}
                                    options={sectionOptions}
                                    value={data.leaveToSection}
                                    onChange={e => this.handleSectionChange(e.value, 'leaveToSection')}
                                    isDisabled={isSelected}
                                    TextFieldProps={{
                                        label: <>Session</>,
                                        variant: 'outlined'
                                    }}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CIMSFormLabel>
        );
    }
}

export default withStyles(styles)(LeaveDateRange);