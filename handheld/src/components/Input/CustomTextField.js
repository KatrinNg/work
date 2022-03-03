import { TextField } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import {generateRandomId} from '../../utility/utils'
import { debounce } from 'lodash';
import { useStyles } from './styles';

const CustomTextField = ({
    onPressEnter = () => null,
    onChange = () => null,
    debounceChange,
    allowAction = true,
    disableOnPermission = false,
    value = '',
    isTextArea,
    isNoSpace,
    isTrim,
    minNum,
    disabled,
    minLength,
    maxLength,
    numberField,
    changeOnBlur = () => null,
    style = {},
    textAreaMinRow = 5,
    changeOnFocus = () => null,
    canPressEnter,
    initialAsNull,
    type,
    ...rest
}, ref) => {
    const { ...other } = rest;
    const extraProps = {};


    const classes = useStyles();
    const [tempValue, setTempValue] = useState(value);
    const [uid] = useState(generateRandomId());
    // const [isOnBlurTriggered, setOnBlurTrigger] = useState(false);
    // const previousDisable = usePrevious(`${allowAction}`);

    useEffect(() => {
        if (debounceChange) {
            setTempValue(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);



    // For 'forceCheckValidation' case
   
    // useEffect(() => {
    //     onValidation(value);

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [validators]);

    // logic to force error display
 
    if (isTextArea) {
        extraProps.multiline = true;
        extraProps.rows = textAreaMinRow;
    }

    

    const updateParent = (e) => {
        onChange(e);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    const onValueChange = (e) => {
        let value = e.target.value;
        if (numberField) {
            value = parseInt(value);

            if (isNaN(value)) {
                if(initialAsNull){
                    value = null
                }else{
                    value =  0;
                }
                
            }
        }

        if (isNoSpace) {
            value = value.replace(/\s/g, '');
        }
        e.target.value = value;

        const { name, value: newValue } = e.target;

        if (debounceChange) {
            setTempValue(newValue);
            reference.current({
                target: {
                    name,
                    value: newValue,
                },
            });
        } else {
            updateParent(e);
        }
    };

    const reference = useRef(debounce(updateParent, 300));

    const handleOnBlur = (e) => {
        let originalValue = e.target.value;
        let updatedValue = e.target.value;
        if (isTrim) {
            updatedValue = updatedValue.trim();
        }

        if (originalValue !== updatedValue) {
            e.target.value = updatedValue;
            onChange(e);
        }
    };

    // const onValidation = (valueToCheck) => {
    //     let tempError = mapValidators(valueToCheck, validators);
    //     tempError = [...tempError, ...checkValueLength(valueToCheck, minLength, maxLength)];

    //     isValidValue(tempError.length === 0);
    //     setErrorMessage(tempError);
    // };


    const getDisableStatus = () => {
        if (disableOnPermission) {
            return true;
        }

        if (disabled) {
            return true;
        }

        if (allowAction === false) {
            return true;
        }

        return false;
    };


    const extraInputProps = {};
    const extraStyle = {};
    if (numberField) {
        extraInputProps.type = 'number';
    }

    if (numberField) {
        //extraStyle.width = 250;
    }

    return (
        <div id={"abc"} style={{ ...extraStyle, ...style }} className={classes.SLayout}>
            <TextField
                inputRef={ref}
                type={type}
                InputProps={{
                    style: {
                        fontSize: 14,
                        borderRadius: 8,
                        height: other.multiline ? "auto" : 40,
                        background: getDisableStatus() ? '#F7F7F7' : 'initial',
                    },
                    ...extraInputProps,
                }}
                
                onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                        if (!canPressEnter) {
                            ev.preventDefault();
                        }
                        onPressEnter();
                    }
                    if(numberField && (ev.key === "-" || ev.key === "+" || ev.key === ".")){
                        ev.preventDefault();
                    }

                   
                }}
                inputProps={numberField && { min:minNum } }
                InputLabelProps={{
                    style: {
                        fontSize: 14,
                    },
                }}
                onBlur={(e) => {
                    handleOnBlur(e);
                    changeOnBlur({
                        target: {
                            name: rest.name,
                            value,
                        },
                    });
                }}
                onFocus={changeOnFocus}
                onChange={onValueChange}
                onPaste={(e) => {
                    // prevent paste e character to the field
                    const value = e.clipboardData.getData('text');

                    if (numberField && parseInt(value) < 0 && (value.includes('e') || value.includes("+") || value.includes("-") || value.includes("."))) {
                        e.preventDefault();
                    }

                }}
                variant="outlined"
                multiline={isTextArea}
                fullWidth={true}
                size={'small'}
                value={debounceChange ? tempValue ?? '' : value || ''}
                disabled={getDisableStatus()}
                onKeyDown={(e) => {
                    // prevent entering 'e' character when number input field
                    if (numberField && e.keyCode === 69) {
                        e.preventDefault();
                    }
                
                }}
                {...rest}
                {...extraProps}
                {...other}
            />
            
            {/* <ErrorMessages isOnBlurTriggered={isOnBlurTriggered} errorMessage={errorMessage} />
            {numberField && !checkNull(value) && value < minNumber && (
                <div style={{ paddingLeft: 10, fontSize: 12, color: 'red', marginTop: 8 }}>
                    Number Cannot smaller than {minNumber}
                </div>
            )} */}
        </div>
    );
};

export default React.forwardRef(CustomTextField);
