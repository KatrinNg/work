import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import RadioFieldValidator from '../../../components/FormValidator/RadioFieldValidator';
import ValidatorComponent from '../../../components/FormValidator/ValidatorComponent';
import {
    Grid,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Tabs,
    Tab,
    Typography,
    FormHelperText
} from '@material-ui/core';
import CIMSFormLabel from '../../../components/InputLabel/CIMSFormLabel';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import { RECURRENCE_TABS, WEEK_DAY_VALUES, ORDINAL_VALUES } from '../../../constants/appointment/editTimeSlot';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import _ from 'lodash';

const WeekCheckBoxList = [
    { label: 'Sunday', value: WEEK_DAY_VALUES.Sunday },
    { label: 'Monday', value: WEEK_DAY_VALUES.Monday },
    { label: 'Tuesday', value: WEEK_DAY_VALUES.Tuesday },
    { label: 'Wednesday', value: WEEK_DAY_VALUES.Wednesday },
    { label: 'Thursday', value: WEEK_DAY_VALUES.Thursday },
    { label: 'Friday', value: WEEK_DAY_VALUES.Friday },
    { label: 'Saturday', value: WEEK_DAY_VALUES.Saturday }
];

const OrdinalList = [
    { label: 'First', value: ORDINAL_VALUES.First },
    { label: 'Second', value: ORDINAL_VALUES.Second },
    { label: 'Third', value: ORDINAL_VALUES.Third },
    { label: 'Fourth', value: ORDINAL_VALUES.Fourth },
    { label: 'Last', value: ORDINAL_VALUES.Last }
];

const WeekDayList = [
    { label: 'Sunday', value: WEEK_DAY_VALUES.Sunday },
    { label: 'Monday', value: WEEK_DAY_VALUES.Monday },
    { label: 'Tuesday', value: WEEK_DAY_VALUES.Tuesday },
    { label: 'Wednesday', value: WEEK_DAY_VALUES.Wednesday },
    { label: 'Thursday', value: WEEK_DAY_VALUES.Thursday },
    { label: 'Friday', value: WEEK_DAY_VALUES.Friday },
    { label: 'Saturday', value: WEEK_DAY_VALUES.Saturday }
];

const RepeatInput = React.forwardRef((props, refs) => {
    const {
        id,
        tab,
        disabled,
        repeatEvery,
        // remark,
        updateData
    } = props;
    const repeatEveryRef = React.useRef(null);
    React.useImperativeHandle(refs, () => ({
        makeValid: () => {
            repeatEveryRef.current && repeatEveryRef.current.makeValid();
        }
    }));

    let maxRepeatNum = 9999;

    return (
        <Grid item container spacing={1}>
            <Grid item xs={3}>
                <FastTextFieldValidator
                    id={`${id}_repeatEvery`}
                    ref={repeatEveryRef}
                    label={<>Repeat Every<RequiredIcon /></>}
                    variant="outlined"
                    disabled={disabled}
                    value={repeatEvery}
                    onBlur={e => updateData({ repeatEvery: e.target.value })}
                    InputProps={{
                        endAdornment: tab === RECURRENCE_TABS.DAILY && (<>Day(s)</>)
                            || tab === RECURRENCE_TABS.WEEKLY && (<>Week(s)</>)
                            || tab === RECURRENCE_TABS.MONTHLY && (<>Month(s)</>)
                    }}
                    type="number"
                    validators={[ValidatorEnum.required, ValidatorEnum.minNumber(1), ValidatorEnum.maxNumber(maxRepeatNum)]}
                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_MIN_NUMBER(1), CommonMessage.VALIDATION_MAX_NUMBER(maxRepeatNum)]}
                />
            </Grid>
            <Grid item xs={8}></Grid>
            {/* <Grid item xs={12}>
                <FastTextFieldValidator
                    id={`${id}_remark`}
                    label={<>Remark</>}
                    variant="outlined"
                    disabled={disabled}
                    value={remark}
                    onBlur={e => updateData({ remark: e.target.value })}
                />
            </Grid> */}
        </Grid>
    );
});

class WeeklyCheckBoxGroup extends ValidatorComponent {
    render() {
        const { id, disabled, value, handleWeekDayOnChange, classes } = this.props;
        const { isValid } = this.state;
        return (
            <Grid item container>
                <Grid item container>
                    <FormGroup
                        id={id + '_weekGroup'}
                        row
                    >
                        {
                            WeekCheckBoxList.map((item, index) =>
                                <FormControlLabel
                                    id={id + '_' + item.value + '_checkboxLabel'}
                                    key={index}
                                    disabled={item.disabled || disabled}
                                    label={item.label}
                                    labelPlacement="end"
                                    checked={value[index] === '1' ? true : false}
                                    onChange={e => handleWeekDayOnChange(e, item.value)}
                                    classes={{
                                        root: classes.weekDayControlLabel
                                    }}
                                    className={!isValid ? classes.errorColor : undefined}
                                    control={
                                        <Checkbox
                                            id={id + '_' + item.value + '_checkbox'}
                                            color="primary"
                                        />}
                                />
                            )}
                    </FormGroup>
                </Grid>
                <Grid item container>
                    {
                        !isValid ?
                            <FormHelperText
                                error
                                style={{
                                    marginTop: -12,
                                    paddingBottom: 20,
                                    position: 'relative'
                                }}
                                id={id + '_weekGroup_message'}
                            >
                                {this.getErrorMessage && this.getErrorMessage()}
                            </FormHelperText>
                            : null
                    }
                </Grid>
            </Grid>
        );
    }
}

const RecurrenceRender = React.forwardRef((props, refs) => {
    const {
        id,
        classes,
        multipleUpdateData,
        updateData,
        disabled
    } = props;

    const {
        multiUpTab,
        weekDay,
        monthRule,
        monthRepeatOn,
        monthOrdinal,
        monthWkDay,
        repeatEvery,
        remark
    } = multipleUpdateData;

    const monthRuleRef = React.useRef(null);
    const monthRepeatOnRef = React.useRef(null);
    const monthOrdinalRef = React.useRef(null);
    const monthWkDayRef = React.useRef(null);
    const repeatInputRef = React.useRef(null);

    const handleTabOnChange = (event, newValue) => {
        updateData({
            multiUpTab: newValue,
            weekDay: '0000000',
            monthRule: null,
            monthRepeatOn: null,
            monthOrdinal: null,
            monthWkDay: null,
            repeatEvery: 1,
            remark: null
        });
        monthRuleRef.current && monthRuleRef.current.makeValid();
        monthRepeatOnRef.current && monthRepeatOnRef.current.makeValid();
        monthOrdinalRef.current && monthOrdinalRef.current.makeValid();
        monthWkDayRef.current && monthWkDayRef.current.makeValid();
        repeatInputRef.current && repeatInputRef.current.makeValid();
    };

    const handleOnChange = (name, value) => {
        let obj = { [name]: value };
        updateData(obj);
    };

    const handleWeekDayOnChange = (e, value) => {
        let _weekDay = _.cloneDeep(weekDay).split('');
        if (value === WEEK_DAY_VALUES.Sunday) {
            _weekDay[0] = _weekDay[0] === '1' ? '0' : '1';
        } else if(value === WEEK_DAY_VALUES.Monday) {
            _weekDay[1] = _weekDay[1] === '1' ? '0' : '1';
        } else if (value === WEEK_DAY_VALUES.Tuesday) {
            _weekDay[2] = _weekDay[2] === '1' ? '0' : '1';
        } else if (value === WEEK_DAY_VALUES.Wednesday) {
            _weekDay[3] = _weekDay[3] === '1' ? '0' : '1';
        } else if (value === WEEK_DAY_VALUES.Thursday) {
            _weekDay[4] = _weekDay[4] === '1' ? '0' : '1';
        } else if (value === WEEK_DAY_VALUES.Friday) {
            _weekDay[5] = _weekDay[5] === '1' ? '0' : '1';
        } else if (value === WEEK_DAY_VALUES.Saturday) {
            _weekDay[6] = _weekDay[6] === '1' ? '0' : '1';
        }
        updateData({ weekDay: _weekDay.join('') });
    };

    const handleAllWeekDayOnChange = () => {
        if (weekDay === '1111111') {
            updateData({ weekDay: '0000000' });
        } else {
            updateData({ weekDay: '1111111' });
        }
    };

    return (
        <Grid container className={classes.root}>
            <CIMSFormLabel
                labelText={<>Recurrence</>}
                className={classes.formLabel}
            >
                <Tabs
                    value={multiUpTab}
                    onChange={handleTabOnChange}
                    indicatorColor="primary"
                >
                    <Tab id={`${id}_dailyTab`} value={RECURRENCE_TABS.DAILY} label={'DAILY'} disabled={disabled} />
                    <Tab id={`${id}_weeklyTab`} value={RECURRENCE_TABS.WEEKLY} label={'WEEKLY'} disabled={disabled} />
                    <Tab id={`${id}_monthlyTab`} value={RECURRENCE_TABS.MONTHLY} label={'MONTHLY'} disabled={disabled} />
                </Tabs>
                <Grid container className={classes.recurrenceContainer}>
                    {
                        multiUpTab === RECURRENCE_TABS.DAILY &&
                        (
                            <Grid item container></Grid>
                        )
                    }
                    {
                        multiUpTab === RECURRENCE_TABS.WEEKLY &&
                        (
                            <Grid item container alignItems="flex-end">
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        id={id + '_allWeekDay_checkboxLabel'}
                                        name="allWeekDays"
                                        label="All Weekdays"
                                        labelPlacement="end"
                                        checked={weekDay === '1111111' ? true : false}
                                        disabled={disabled}
                                        onChange={handleAllWeekDayOnChange}
                                        classes={{
                                            root: classes.weekDayControlLabel
                                        }}
                                        control={
                                            <Checkbox
                                                id={id + '_allWeekDay_checkbox'}
                                                color="primary"
                                            />}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <WeeklyCheckBoxGroup
                                        id={id}
                                        disabled={disabled}
                                        classes={classes}
                                        value={weekDay}
                                        handleWeekDayOnChange={handleWeekDayOnChange}
                                        validators={disabled ? [] : [(value) => value === '0000000' || !value ? false : true]}
                                        errorMessages={disabled ? [] : [CommonMessage.VALIDATION_WEEKLY_MUST_CHOOSE_AT_LEAST_ONE()]}
                                    />
                                </Grid>
                            </Grid>
                        )
                    }
                    {
                        multiUpTab === RECURRENCE_TABS.MONTHLY &&
                        (
                            <Grid item container>
                                <Grid item container style={{ marginBottom: 8, paddingLeft: 64 }}>
                                    <RadioFieldValidator
                                        id={`${id}_monthRuleRadio`}
                                        ref={monthRuleRef}
                                        value={monthRule || ''}
                                        onChange={e => handleOnChange('monthRule', e.target.value)}
                                        disabled={disabled}
                                        list={[
                                            {
                                                value: 'repeatOn',
                                                label:
                                                    <Grid container alignItems="flex-start" style={{ width: 400 }}>
                                                        <FastTextFieldValidator
                                                            id={`${id}_repeatOn`}
                                                            ref={monthRepeatOnRef}
                                                            label={<>Repeat On<RequiredIcon /></>}
                                                            variant="outlined"
                                                            value={monthRepeatOn}
                                                            onBlur={e => handleOnChange('monthRepeatOn', e.target.value)}
                                                            inputProps={{
                                                                style: { paddingLeft: 10 },
                                                                maxLength: 2
                                                            }}
                                                            InputProps={{
                                                                endAdornment: <Typography style={{ minWidth: 70 }}>Of Month</Typography>,
                                                                startAdornment: <Typography style={{ minWidth: 30 }}>Day</Typography>
                                                            }}
                                                            disabled={monthRule !== 'repeatOn'}
                                                            validators={[ValidatorEnum.required, ValidatorEnum.minNumber(1), ValidatorEnum.maxNumber(31)]}
                                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_MIN_NUMBER(1), CommonMessage.VALIDATION_MAX_NUMBER(31)]}
                                                        />
                                                    </Grid>
                                            },
                                            {
                                                value: 'ordinal',
                                                label:
                                                    <Grid container spacing={1} alignItems="flex-start" style={{ width: 600 }}>
                                                        <Grid item xs={6}>
                                                            <SelectFieldValidator
                                                                id={`${id}_monthOrdinal`}
                                                                ref={monthOrdinalRef}
                                                                TextFieldProps={{
                                                                    variant: 'outlined',
                                                                    label: <>Ordinal<RequiredIcon /></>
                                                                }}
                                                                isDisabled={monthRule !== 'ordinal'}
                                                                options={OrdinalList.map(x => ({ label: x.label, value: x.value }))}
                                                                value={monthOrdinal}
                                                                onChange={e => handleOnChange('monthOrdinal', e.value)}
                                                                validators={[ValidatorEnum.required]}
                                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <SelectFieldValidator
                                                                id={`${id}_monthWeekday`}
                                                                ref={monthWkDayRef}
                                                                TextFieldProps={{
                                                                    variant: 'outlined',
                                                                    label: <>Weekday<RequiredIcon /></>
                                                                }}
                                                                isDisabled={monthRule !== 'ordinal'}
                                                                options={WeekDayList.map(x => ({ label: x.label, value: x.value }))}
                                                                value={monthWkDay}
                                                                onChange={e => handleOnChange('monthWkDay', e.value)}
                                                                validators={[ValidatorEnum.required]}
                                                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                            }
                                        ]}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        RadioGroupProps={{ row: false }}
                                        FormControlLabelProps={{
                                            className: classes.monthRuleControlLabel,
                                            onClick: e => { e.preventDefault(); e.stopPropagation(); }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        )
                    }
                    <RepeatInput
                        id={id}
                        tab={multiUpTab}
                        disabled={disabled}
                        repeatEvery={repeatEvery}
                        remark={remark}
                        updateData={updateData}
                        ref={repeatInputRef}
                    />
                </Grid>
            </CIMSFormLabel>
        </Grid>
    );
});

const styles = theme => ({
    root: {
        marginTop: theme.spacing(2)
    },
    formLabel: {
        padding: theme.spacing(2),
        width: '100%'
    },
    recurrenceContainer: {
        paddingTop: theme.spacing(2)
    },
    weekDayControlLabel: {
        minWidth: '9vw',
        marginBottom: theme.spacing(1)
    },
    monthRuleControlLabel: {
        width: 0,
        marginBottom: theme.spacing(1)
    },
    errorColor: {
        color: theme.palette.error.main,
        borderColor: theme.palette.error.main
    }
});
const mapState = state => ({
});
const mapDispatch = {
};
export default connect(mapState, mapDispatch)(withStyles(styles)(RecurrenceRender));