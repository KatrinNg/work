import { FormControl, InputLabel, makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import { overrideReactSelectBgColor } from '../../utilities/registrationUtilities';

const useStyles = makeStyles(() => ({
    activeFormControl: {
        backgroundColor: 'rgb(250, 250, 250)'
    },
    inactiveFormControl: {
        backgroundColor: '#e0e0e0'
    },
    activeSelectLabel: {
        color: 'rgb(132, 132, 132)',
        transform: 'translate(14px, -6px) scale(1)',
        backgroundColor: 'rgb(250, 250, 250)',
        fontSize: '12px'
    },
    inactiveSelectLabel: {
        color: 'rgb(180, 180, 180)',
        zIndex: 1,
        transform: 'translate(14px, 10.5px) scale(1)',
        pointerEvents: 'none'
    },
    selectInput: {
        width: '100%'
    }
}));

const FormControlSelect = ({ isDisabled, value, name, onChange, options, label }) => {
    const classes = useStyles();

    return (
        <FormControl
            fullWidth
            variant="outlined"
            className={isDisabled ? classes.inactiveFormControl : classes.activeFormControl}
        >
            <InputLabel
                className={isDisabled || !value ? classes.inactiveSelectLabel : classes.activeSelectLabel}
                htmlFor="outlined-age-native-simple"
            >
                {label}
            </InputLabel>
            <Select
                isClearable
                isDisabled={isDisabled}
                placeholder=""
                menuPortalTarget={document.body}
                styles={overrideReactSelectBgColor(isDisabled)}
                className={classes.selectInput}
                name={name}
                value={value}
                onChange={onChange}
                options={options}
            />
        </FormControl>
    );
};

FormControlSelect.propTypes = {
    isDisabled: PropTypes.bool,
    label: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array
};

export default FormControlSelect;
