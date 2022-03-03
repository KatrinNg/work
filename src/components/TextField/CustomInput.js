import { Grid, TextField } from '@material-ui/core';
import React, { memo, useEffect, useRef, useState } from 'react';
import RequiredIcon from '../InputLabel/RequiredIcon';

export const CustomInput = memo(
    ({
        id,
        value,
        setter,
        label,
        type = 'text',
        multiline = false,
        rows = 4,
        autoFocus = false,
        className,
        disabled = false,
        minLength,
        maxLength,
        required
    }) => {
        const [inputValue, setInputValue] = useState('');

        const inputRef = useRef(null);

        const [validationError, setValidationError] = useState(false);
        const [errorMessage, setErrorMessage] = useState('');

        useEffect(() => {
            setInputValue(value);
        }, [value]);

        const handleInputValueOnChange = (e) => {
            let newValue = e.target.value;
            if (type === 'tel') {
                newValue = newValue.replace(/[^0-9]/g, '');
            } else if (type === 'number') {
                newValue = newValue.replace(/[^0-9.]/g, '');
                if (newValue.indexOf('.') === 0) {
                    newValue = '0.';
                } else if (newValue.indexOf('0') === 0 && newValue.indexOf('.') < 0 && newValue.length > 1) {
                    newValue = newValue.substring(1);
                } else if (newValue.indexOf('.') > 0 && newValue.charAt(newValue.indexOf('.') + 1)) {
                    if (newValue.charAt(newValue.indexOf('.') + 1) === '.') {
                        newValue = newValue.substring(0, newValue.indexOf('.') + 1);
                    } else {
                        newValue = newValue.substring(0, newValue.indexOf('.') + 2);
                    }
                }
            }
            setInputValue(newValue);
        };

        const performValidation = () => {
            let error = false;

            if (required) {
                if (!inputValue) {
                    error = true;
                    setErrorMessage('This field is required!');
                }
            }

            if (minLength && inputValue && inputValue.length < minLength) {
                error = true;
                setErrorMessage(`Input less than ${minLength} characters!`);
            }

            if (!error) {
                setErrorMessage('');
            }

            error !== validationError && setValidationError(error);
        };

        useEffect(() => {
            performValidation();
        }, [inputValue, required]);

        const handleChange = () => {
            if (value !== inputValue) setter(inputValue);
        };

        const handleKeyDown = (e) => {
            if ((e.keyCode === 13 || e.which === 13) && !multiline) {
                inputRef?.current?.blur();
            }
        };

        return (
            <>
                <TextField
                    id={id}
                    className={className}
                    inputRef={inputRef}
                    fullWidth
                    type={type}
                    label={
                        <span>
                            {label}
                            {required && <RequiredIcon />}
                        </span>
                    }
                    value={inputValue || ''}
                    variant="outlined"
                    size="small"
                    onChange={(e) => handleInputValueOnChange(e)}
                    onBlur={handleChange}
                    onKeyDown={handleKeyDown}
                    multiline={multiline}
                    rows={rows}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    inputProps={{
                        maxLength: maxLength
                    }}
                    error={validationError}
                />
                {validationError && <small style={{ color: 'red' }}>{errorMessage}</small>}
            </>
        );
    }
);
