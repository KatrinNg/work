import React, { useEffect, useMemo, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { FormHelperText, Grid, Typography } from '@material-ui/core';
import FastTextFieldValidator from 'components/TextField/FastTextFieldValidator';
import ValidatorEnum from 'enums/validatorEnum';
import CommonMessage from 'constants/commonMessage';
import _ from 'lodash';

const useStyles = makeStyles(theme => ({
    
}));

const GestWeekInput = React.forwardRef((props, ref) => {
    const classes = useStyles();
    const { id, weekValue, dayValue, disabled, onChange, ...rest } = props;

    const weekRef = useRef(null);
    const dayRef = useRef(null);
    
    const [week, setWeek] = useState(null);
    const [day, setDay] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setWeek(weekValue);
    }, [weekValue]);

    useEffect(() => {
        setDay(dayValue);
    }, [dayValue]);

    useEffect(() => {
        // console.log('[ANT] errors', week, day);
        // onChange && onChange(isValid(), ...formatValue(week, day));
    }, [errors]);

    const dayLimit = useMemo(() => {
        return week > 0 ? { min: 0, max: 6 } : week < 0 ? { min: -6, max: 0 } : { min: -6, max: 6 };
    }, [week]);

    const formatValue = (week, day) => {
        return [ isNaN(parseInt(week)) ? null : parseInt(week), isNaN(parseInt(day)) ? null : parseInt(day) ];
    };

    const onValidator = (isValid, error, name) => {
        let _errors = _.cloneDeep(errors);
        if(!isValid)
            _errors[name] = error;
        else
            delete _errors[name];

        if (isNaN(parseInt(week)) !== isNaN(parseInt(day))) 
            _errors['Value'] = 'Incomplete value';
        else
            delete _errors['Value'];

        setErrors(_errors);
    };

    const isValid = () => Object.keys(errors).length === 0;

    const onWeekChange = (value) => {
        setWeek(value);
    };

    const onDayChange = (value) => {
        setDay(value);
    };

    return (
        <Grid item container>
            <Grid item container wrap="nowrap" alignItems="center" xs={12} spacing={1}>
                <Grid item>
                    <FastTextFieldValidator
                        id={`${id}_week_input`}
                        ref={weekRef}
                        inputProps={{ maxLength: 3 }}
                        type="number"
                        allowNegative
                        value={week}
                        validators={[ValidatorEnum.minNumber(-99), ValidatorEnum.maxNumber(99)]}
                        errorMessages={[CommonMessage.VALIDATION_MIN_WEEK(-99), CommonMessage.VALIDATION_MAX_WEEK(99)]}
                        validatorListener={(isValid, message) => onValidator(isValid, message, 'Week')}
                        notShowMsg
                        disabled={disabled}
                        onBlur={e => {
                            weekRef.current.validateCurrent((isValid) => {
                                onChange && onChange(isValid, ...formatValue(week, day));
                                // console.log('[ANT] week blur', isValid, week, day);
                            });
                        }}
                        onChange={e => {
                            onWeekChange(e.target.value);
                        }}
                        {...rest}
                    />
                </Grid>
                <Grid item>
                    <Typography>Week(s)</Typography>
                </Grid>
                <Grid item>
                    <FastTextFieldValidator
                        id={`${id}_day_input`}
                        ref={dayRef}
                        inputProps={{ maxLength: 2 }}
                        type="number"
                        allowNegative
                        value={day}
                        validators={[ValidatorEnum.minNumber(dayLimit.min), ValidatorEnum.maxNumber(dayLimit.max)]}
                        errorMessages={[CommonMessage.VALIDATION_MIN_DAY(dayLimit.min), CommonMessage.VALIDATION_MAX_DAY(dayLimit.max)]}
                        validatorListener={(isValid, message) => onValidator(isValid, message, 'Day')}
                        notShowMsg
                        disabled={disabled}
                        onBlur={e => {
                            dayRef.current.validateCurrent((isValid) => {
                                onChange && onChange(isValid, ...formatValue(week, day));
                                // console.log('[ANT] day blur', isValid, week, day);
                            });
                        }}
                        onChange={e => {
                            onDayChange(e.target.value);
                        }}
                        {...rest}
                    />
                </Grid>
                <Grid item>
                    <Typography>Day(s)</Typography>
                </Grid>
            </Grid>
            {!isValid() ?
                <Grid item>
                    {Object.entries(errors).map(([key, value]) =>
                        <FormHelperText error key={key}>{`${value}`}</FormHelperText>
                    )}
                </Grid>
            : null}
        </Grid>
    );
});

const mapStateToProps = (state) => ({

});

const dispatchToProps = {

};

export default (connect(mapStateToProps, dispatchToProps)(GestWeekInput));