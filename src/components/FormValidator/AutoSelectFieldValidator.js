import React, { Component } from 'react';
import ValidatorEnum from '../../enums/validatorEnum';
import SelectFieldValidator from './SelectFieldValidator';

class AutoSelectFieldValidator extends Component {

    componentDidUpdate(prevProps) {
        const { validators, options, onChange, value } = this.props;
        let isMandatoryField = validators && (validators.findIndex(item => item === ValidatorEnum.required) !== 1);
        let isOneOption = options && options.length === 1;
        if (isMandatoryField &&
            isOneOption &&
            ((prevProps.value !== value && !value) || (!prevProps.value && !value))) {
            onChange && onChange(options[0]);
        }
    }

    render() {
        const { onChange, value, ref, ...rest } = this.props;
        return (
            <SelectFieldValidator
                value={value}
                onChange={onChange}
                ref={ref}
                {...rest}
            />
        );
    }
}

export default AutoSelectFieldValidator;