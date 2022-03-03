import React, { useState, useEffect } from 'react';
import { generateRandomId } from 'utility/utils';
// import 'date-fns';
import moment from 'moment';
import ErrorMessages from 'components/Message/ErrorMessages';
import mapValidators from 'utility/mapValidators';
// import { TextField } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import {
    // MuiPickersUtilsProvider,
    KeyboardTimePicker,
} from '@material-ui/pickers';
// import DateFnsUtils from '@date-io/date-fns';
import './styles.css'

export default function TimePicker(props) {
    const {
        isValidValue = () => null,
        forceErrorDisplay,
        validators,
        inputVariant,
        hiddenValidationTips = false,
        value,
        ...rest
    } = props;
    const [errorMessage, setErrorMessage] = useState([]);
    const [isOnBlurTriggered, setOnBlurTrigger] = useState(false);
    const [dateErrorMsg, setDateErrorMsg] = useState();

    useEffect(() => {
        if (forceErrorDisplay) {
            setOnBlurTrigger(true);
        }
    }, [forceErrorDisplay]);

    useEffect(() => {
        onValidation(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const onValidation = (value) => {
        let tempError = mapValidators(value, validators);
        let isValid = true;

        const { minTime, maxTime } = rest;

        if (minTime) {
            if (
                new Date(moment(value)).getTime() <
                new Date(moment(minTime)).getTime()
            ) {
                tempError.push('The end time cannot be earlier than the start time')
                isValid = false;
            }
        }

        if (maxTime) {
            if (
                new Date(moment(value)).getTime() >
                new Date(moment(maxTime)).getTime()
            ) {
                tempError.push('The start time cannot be later than the end time')
                isValid = false;
            }
        }

        isValidValue(tempError.length === 0 && isValid);
        setErrorMessage(tempError);
        value && handleOnBlur()

        return tempError.length === 0 && isValid;
    };

    const handleOnBlur = () => {
        setOnBlurTrigger(true);
    };

    return (
        <Grid container>
            <KeyboardTimePicker
                value={value}
                fullWidth
                className='custom_time_picker'
                id={`${generateRandomId()}_TimePicker`}
                KeyboardButtonProps={{
                    style: {
                        padding: '0 5px 5px 0'
                    }
                }}
                error={
                    hiddenValidationTips ? false : (errorMessage.length > 0 && isOnBlurTriggered) || dateErrorMsg !== ''
                }
                helperText={!hiddenValidationTips && (errorMessage.length ? '' : dateErrorMsg)}
                inputVariant={inputVariant ? inputVariant : 'outlined'}
                onError={(err) => {
                    setDateErrorMsg(err);
                }}
                onBlur={handleOnBlur}
                {...rest}
            />
            <ErrorMessages isOnBlurTriggered={isOnBlurTriggered} errorMessage={errorMessage} />
        </Grid>
        // <TextField
        //     className='custom_time_picker'
        //     id={`${generateRandomId()}_TimePicker`}
        //     type="time"
        //     defaultValue="07:30"
        //     InputLabelProps={{
        //         shrink: true,
        //     }}
        //     inputProps={{
        //         step: 300, // 5 min
        //     }}
        // />
    )
}