import React, { useState, useEffect } from 'react';
import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';

const FastTextFieldValidator = React.forwardRef((props, ref) => {

    const [val, setVal] = useState('');

    useEffect(() => {
        setVal(props.value);
    }, [props.value]);

    const handleOnChange = (e) => {
        props.onChange && props.onChange(e);
        setVal(e.target.value);
    };

    //eslint-disable-next-line
    const { onChange, value, ...rest } = props;

    return (
        <TextFieldValidator
            value={val}
            onChange={handleOnChange}
            ref={ref}
            {...rest}
        />
    );
});

export default FastTextFieldValidator;