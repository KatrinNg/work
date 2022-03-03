import React from 'react';
// import PropTypes from 'prop-types';
// import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import memoize from 'memoize-one';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    },
    option: {
        minHeight: 36,
        whiteSpace: 'nowrap'
    }
}));

const CIMSAutoComplete = React.forwardRef((props, ref) => {
    const classes = useStyles();
    const {
        options,
        value,
        defaultValue,
        disabled,
        multiple,
        onChange,
        TextFieldProps,
        addNullOption,
        addAllOption,
        ...rest
    } = props;

    const multiValFilter = memoize((opts, val) => {
        let filterList = [];
        for (let i = 0; i < val.length; i++) {
            filterList.push(opts.find(item => item.value === val[i]));
        }
        return filterList;
    });


    const handleOnChange = (event, newValue) => {
        if(multiple){
            if(newValue && newValue.length > 0){
                onChange && onChange(newValue.map(item => item.value));
            } else {
                onChange && onChange([]);
            }
        } else {
            if (!newValue) {
                onChange && onChange({ value: null });
            } else {
                onChange && onChange(newValue);
            }
        }
    };

    let _value = null, _defaultValue = null, _options = options || [];

    if (addNullOption && _options.findIndex(item => item.value === '') < 0) {
        _options.unshift({
            label: '',
            value: ''
        });
    }
    if (addAllOption && _options.findIndex(item => item.value === '*All') < 0) {
        _options.unshift({
            label: '*All',
            value: '*All'
        });
    }

    if (multiple) {
        _defaultValue = defaultValue ? multiValFilter(_options, defaultValue) : [];
        _value = value ? multiValFilter(_options, value) : [];
    } else {
        _defaultValue = defaultValue ? _options.find(item => item.value === defaultValue) : null;
        _value = value ? _options.find(item => item.value === value) : null;
    }
    return (
        <Autocomplete
            ref={ref}
            value={_value}
            multiple={multiple}
            defaultValue={_defaultValue}
            disabled={disabled}
            options={_options}
            getOptionLabel={option => option.label}
            onChange={handleOnChange}
            renderInput={params => {
                return (
                    <TextField
                        {...params}
                        fullWidth
                        variant={disabled ? 'standard' : 'outlined'}
                        {...TextFieldProps}
                    />
                );
            }}
            classes={{
                root: classes.root,
                option: classes.option,
                ...classes
            }}
            {...rest}
        />
    );
});

export default CIMSAutoComplete;