import React, { useState, useEffect } from 'react';
import CIMSTextField from './CIMSTextField';

const FastTextField = React.forwardRef((props, ref) => {

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
        <CIMSTextField
            value={val}
            onChange={handleOnChange}
            ref={ref}
            {...rest}
        />
    );
});

export default FastTextField;