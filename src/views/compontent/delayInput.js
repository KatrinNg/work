import React, { useState, useEffect } from 'react';
import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';

const DelayInput = React.forwardRef(function DelayInput(props, ref) {

    const [chi, setChi] = useState('');

    useEffect(() => {
        setChi(props.value);
    }, [props.value]);

    const handleOnBlur = (e) => {
        props.onChange && props.onChange(e);
        props.onBlur && props.onBlur(e);
    };

    const handleOnChange = (e) => {
        setChi(e.target.value);
    };

    //eslint-disable-next-line
    const { onBlur, onChange, value, ...rest } = props;

    return (
        <TextFieldValidator
            value={chi}
            onBlur={handleOnBlur}
            onChange={handleOnChange}
            ref={ref}
            {...rest}
        />
    );
});

export default DelayInput;