import React, { useState, useRef, useEffect } from 'react';
import Popper from '@material-ui/core/Popper';
import Autocomplete from '@material-ui/lab/Autocomplete';
import InputBase from '@material-ui/core/InputBase';
import { useStyles } from './styles';
import { InputAdornment, Grid, TextField } from '@material-ui/core';
import SearchIcon from 'resource/Icon/search.svg';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { isString } from 'utility/utils';
import mapValidators from 'utility/mapValidators';
import ErrorMessages from 'components/Message/ErrorMessages';
import ClearIcon from '@material-ui/icons/Clear';
const SearchSelectList = ({
    value = '',
    options = [],
    handleSelect = (value) => {},
    placeholder = '',
    textFieldProps = {},
    popperProps = {},
    searchProps = {},
    startAdornment = '',
    valueFiled = 'value',
    labelFiled = 'name',
    width = 440,
    disabled = false,
    isValidValue = () => null,
    forceErrorDisplay,
    validators,
    isClear,
    closeBtnId,
    showMsg= false,
    valueSuffix = ''
}) => {
    const nWidth = isString(width) ? width : width + 'px';
    const classes = useStyles({ width: nWidth });
    const [anchorEl, setAnchorEl] = React.useState(null);

    const [errorMessage, setErrorMessage] = useState([]);
    const [isOnBlurTriggered, setOnBlurTrigger] = useState(false);
    // const [autoCompleteValue, setAutoCompleteValue] = useState(value);
    const pendingValueRef = useRef(null);
    const pendingObjectValueRef = useRef(null);
    const toggleContainerRef = useRef(null);
    // check errors when change render
    useEffect(() => {
        onValidation(value);
    }, [value,options]);

    const getInitValue = (v) => {
        let text = '';
        options.forEach((item) => {
            if (item[valueFiled] === v) {
                text = item[labelFiled];
                return;
            }
        });
        return text;
    };
    
    const [textField, setTextField] = useState(getInitValue(value));
    useEffect(()=>{
        setTextField(value)
    },[value])
    // logic to force error display
    useEffect(() => {
        if (forceErrorDisplay) {
            setOnBlurTrigger(true);
        }
    }, [forceErrorDisplay]);

    const handleClick = (event) => {
        if (disabled) return;
        setTimeout(() => {
            setAnchorEl(event.target);
            // setAutoCompleteValue(textField);
            pendingValueRef.current = '';
            pendingObjectValueRef.current = {};
        }, 0);
    };

    const handleClose = (event, reason) => {
        if (reason === 'toggleInput') {
            return;
        }

        // setTextField(value);
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
        if (pendingValueRef.current) {
            setTextField(pendingObjectValueRef.current);
            handleSelect(pendingValueRef.current, pendingObjectValueRef.current);
            onValidation(pendingValueRef.current);
            setOnBlurTrigger(true);
        }
        if (!value && !pendingValueRef.current) {
            onValidation(pendingValueRef.current);
            setOnBlurTrigger(true);
        }

        // handleValueChange(event, newValue);
    };

    const onValidation = (value) => {
        let tempError = mapValidators(value, validators);
        tempError = [...tempError];
        if(value && value !=='' && options && showMsg){
            let outItems = true;
            for (let index = 0; index < options.length; index++) {
                const element = options[index];
                if(value == element[valueFiled]){
                    outItems = false
                    break;
                }
            }
            if(outItems){
                tempError.push(showMsg)
                setOnBlurTrigger(true);
            }
        }
        isValidValue(tempError.length === 0);
        setErrorMessage(tempError);
        
    };

    const handleValueChange = (e, newValue) => {
        // let value = newValue ? newValue : '';
        // setAutoCompleteValue(value);
        const value = newValue ? (isString(newValue) ? newValue : newValue[valueFiled]) : '';
        pendingValueRef.current = value;
        pendingObjectValueRef.current = newValue;
    };

    const getValue = (value) => {
        let temp = value ? (isString(value) ? value : value[labelFiled]) : '';
        if (temp && valueSuffix) {
            temp = temp + ' ' + valueSuffix;
        }
        return temp;
    };

    const onClear = (e) => {
        handleValueChange(e, '');
        setTextField(pendingObjectValueRef.current);
        handleSelect(pendingValueRef.current, pendingObjectValueRef.current);
        onValidation(pendingValueRef.current);
        e.stopPropagation();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'github-label' : undefined;
    const documentClick = (e) => {
        
        if (toggleContainerRef.current&& !toggleContainerRef.current.contains(e.target) ) {
                
            setAnchorEl(null);
          }
        
    }

    useEffect(() => {
        window.addEventListener('click', documentClick);
        return () => {
            window.removeEventListener('click', documentClick)
        }
    }, [])

    
    return (
        <React.Fragment>
            <div className={classes.root} >
                <TextField
                    id
                    value={getValue(textField)}
                    onClick={handleClick}
                    // labelWidth={0}
                    fullWidth
                    variant="outlined"
                    placeholder={placeholder}
                    disabled={errorMessage.length > 0 ? false : true}
                    error={errorMessage.length > 0 && isOnBlurTriggered}
                    // classes={classes.textField}
                    InputProps={{
                        startAdornment: startAdornment,
                        endAdornment: (
                            <InputAdornment position="end">
                                {textField && isClear && <ClearIcon id={closeBtnId} onClick={onClear} />}
                                <ArrowDropDownIcon style={{ color: '#797979' }} />
                            </InputAdornment>
                        ),
                        classes: {
                            input: classes.textField,
                            notchedOutline: classes.notchedOutline,
                        },
                    }}
                    {...textFieldProps}
                />
                <Popper
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    className={classes.popper}
                    {...popperProps}
                    ref={toggleContainerRef}
                >
                    <Autocomplete
                        open
                        onClose={handleClose}
                        classes={{
                            paper: classes.paper,
                            option: classes.option,
                            popperDisablePortal: classes.popperDisablePortal,
                        }}
                        value={pendingValueRef.current}
                        onChange={handleValueChange}
                        // disableCloseOnSelect
                        disablePortal
                        renderOption={(option, { selected }) => (
                            <Grid container className={classes.listItem}>
                                {option[labelFiled]}
                            </Grid>
                        )}
                        options={options}
                        getOptionLabel={(option) => option[labelFiled] || ''}
                        renderInput={(params) => (
                            <Grid container alignItems="center" className={classes.inputSearch}>
                                <Grid style={{ width: 25 }}>
                                    <img style={{ display: 'block' }} alt="" src={SearchIcon} width="18" height="18" />
                                </Grid>
                                <InputBase
                                    ref={params.InputProps.ref}
                                    inputProps={{ ...params.inputProps, style: { padding: 0 } }}
                                    // autoFocus
                                    className={classes.inputBase}
                                    placeholder="Search"
                                />
                            </Grid>
                        )}
                        {...searchProps}
                    />
                </Popper>
                <ErrorMessages isOnBlurTriggered={isOnBlurTriggered} errorMessage={errorMessage} />
            </div>
        </React.Fragment>
    );
};

export default SearchSelectList;
