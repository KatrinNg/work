import React, { useState, useEffect } from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import ErrorMessages from 'components/Message/ErrorMessages';
import mapValidators from 'utility/mapValidators';
import { Grid } from '@material-ui/core';
import moment from 'moment';
import { useStyles } from './styles';
import Icon from "@material-ui/core/Icon";
import CalendarIcon from 'resource/Icon/calendar.svg';
const CustomDatePicker = (props) => {
    const {
        name,
        value,
        handleChangeDate = () => null,
        style = {},
        format,
        inputVariant,
        size,
        label,
        disablePast = false,
        isValidValue = () => null,
        forceErrorDisplay,
        validators,
        disabled,
        onAppFieldValidate,
        hiddenValidationTips = false,
        onChange = () => { },
        minDate,
        maxDate,
        ...rest
    } = props;
    const classes = useStyles();
    const [errorMessage, setErrorMessage] = useState([]);
    const [isOnBlurTriggered, setOnBlurTrigger] = useState(false);
    const [dateErrorMsg, setDateErrorMsg] = useState();
    

    const checkAppFieldValidate = () => {
        if (onAppFieldValidate !== undefined) {
            const isDisabled = getDisableExceptionPermission();

            const isValid = onValidation(value);

            if (isDisabled) {
                onAppFieldValidate(name, isValid);
            } else {
                if (value) {
                    onAppFieldValidate(name, isValid);
                } else {
                    onAppFieldValidate(name, false);
                }
            }
        }
    };

    const getDisableExceptionPermission = () => {
        if (disabled) {
            return true;
        }

       

        return false;
    };

    const getDisableStatus = () => {

        if (disabled) {
            return true;
        }
       
        return false;
    };

    useEffect(() => {
        onValidation(value);
        checkAppFieldValidate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // logic to force error display
    useEffect(() => {
        if (forceErrorDisplay) {
            setOnBlurTrigger(true);
        }
    }, [forceErrorDisplay]);

    const onValidation = (value) => {
        let tempError = mapValidators(value, validators);

        let isValid = true;

        const { minDate, maxDate } = rest;

        if (minDate) {
            if (
                new Date(moment(value).format('dd-MMM-yyyy')).getTime() <
                new Date(moment(minDate).format('dd-MMM-yyyy')).getTime()
            ) {
                
                isValid = false;
            }
        }

        if (maxDate) {
            if (
                new Date(moment(value).format('dd-MMM-yyyy')).getTime() >
                new Date(moment(maxDate).format('dd-MMM-yyyy')).getTime()
            ) {
                
                isValid = false;
            }
        }

        isValidValue(tempError.length === 0 && isValid);
        setErrorMessage(tempError);

        return tempError.length === 0 && isValid;
    };

    const handleChange = (date) => {
        handleChangeDate({
            target: { value: new Date(date), name: name },
        });

        onChange(new Date(date));

        onValidation(date);
    };

    const handleOnBlur = () => {
        setOnBlurTrigger(true);
    };

    return (
        <Grid container>
            <KeyboardDatePicker
                autoOk={true}
                className="custom-date-picker"
                style={{ margin: 0, ...style }}
                inputVariant={inputVariant ? inputVariant : 'outlined'}
                size={size ? size : 'small'}
                fullWidth
                disableToolbar
                allowKeyboardControl={false}
                variant="inline"
                format={format ? format : 'dd-MMM-yyyy'}
                disablePast={disablePast}
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                    style: {
                        padding: '0 5px 5px 0'
                    }
                }}
                label={label ? label : ''}
                InputProps={{
                    readOnly: true,
                    style: {
                        fontSize: 14,
                        paddingRight: 0
                    },
                    
                    classes: {
                        input: classes.textField,
                        root: classes.root
                    },
                }}
                keyboardIcon={<Icon ><img width={18} height={17} alt="" src={CalendarIcon}/></Icon>}
                InputLabelProps={{
                    style: {
                        fontSize: 14,
                    },
                }}
                name={name}
                value={value}
                onChange={(date) => handleChange(date)}
                onBlur={handleOnBlur}
                error={
                    hiddenValidationTips ? false : (errorMessage.length > 0 && isOnBlurTriggered) || dateErrorMsg !== ''
                }
                helperText={!hiddenValidationTips && (errorMessage.length ? '' : dateErrorMsg)}
                onError={(err) => {
                    setDateErrorMsg(err);
                }}
                disabled={getDisableStatus()}
                {...(minDate ? { minDate } : {})}
                {...(maxDate ? { maxDate } : {})}
                {...rest}
            />
            <ErrorMessages isOnBlurTriggered={isOnBlurTriggered} errorMessage={errorMessage} />
        </Grid>
    );
};

export default CustomDatePicker;
