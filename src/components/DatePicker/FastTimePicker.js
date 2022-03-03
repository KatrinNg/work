import React, { useState, useEffect } from 'react';
import CIMSTimePicker from './CIMSTimePicker';

const FastTimePicker = React.forwardRef((props, ref) => {

    const [val, setVal] = useState(null);

    useEffect(() => {
        setVal(props.value);
    }, [props.value]);

    const handleOnChange = (e) => {
        props.onChange && props.onChange(e);
        setVal(e);
    };

    //eslint-disable-next-line
    const { onChange, value, component, ...rest } = props;
    const Component = component ? component : CIMSTimePicker;
    return (
        <Component
            value={val}
            onChange={handleOnChange}
            ref={ref}
            {...rest}
        />
    );
});

export default FastTimePicker;
