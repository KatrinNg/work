import React from 'react';
import PropTypes from 'prop-types';
// import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

// const useStyles = makeStyles(theme => ({
// }));

const CIMSRadioCombination = React.forwardRef((props, ref) => {
    // const classes = useStyles();
    const {
        id,
        list,
        value,
        RadioProps,
        FormControlLabelProps,
        disabled,
        onChange,
        ...rest
    } = props;

    return (
        <RadioGroup
            id={id + '_radioGroup'}
            value={value}
            name={name}
            onChange={e => onChange(e)}
            {...rest}
        >
            {
                list && list.map((item, index) =>
                    <FormControlLabel
                        id={id + '_' + item.value + '_radioLabel'}
                        key={index}
                        value={item.value}
                        disabled={disabled}
                        label={item.label}
                        labelPlacement="end"
                        {...FormControlLabelProps}
                        control={
                            <Radio
                                id={id + '_' + item.value + '_radio'}
                                color="primary"
                                {...RadioProps}
                            />}
                    />
                )}
        </RadioGroup>
    );
});

CIMSRadioCombination.propTypes = {
    RadioProps: PropTypes.object,
    FormControlLabelProps: PropTypes.object,
    list: PropTypes.array
};

export default CIMSRadioCombination;