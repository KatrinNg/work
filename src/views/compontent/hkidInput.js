import React, { Component } from 'react';
import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';
import _ from 'lodash';
import memoize from 'memoize-one';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';

function getFormatHKID(value) {
    let val = _.cloneDeep(value);
    if (val) {
        val = val.replace('(', '').replace(')', '');
        const len = val.length;
        val = val.substr(0, len - 1) + '(' + val.substr(len - 1) + ')';
    }
    return val;
}

export default class HKIDInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFocus: false,
            _value: _.cloneDeep(this.props.value)
        };
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (prevProps.value !== this.props.value) {
            this.setState({ _value: _.cloneDeep(this.props.value) });
        }
        return '';
    }

    componentDidUpdate() { }

    handleOnFocus = (e) => {
        this.setState({ isFocus: true });
        this.props.onFocus && this.props.onFocus(e);
    }

    handleOnBlur = (e) => {
        this.setState({ isFocus: false });
        this.props.onBlur && this.props.onBlur(e);
    }

    handleOnChange = (e) => {
        this.props.onChange && this.props.onChange(e);
        this.setState({ _value: e.target.value });
    }

    validateHKIDInput = () => {
        this.inputRef.validateCurrent();
    }

    getValidators = memoize((maxLength, validators, errorMessages) => {
        let _validators = _.cloneDeep(validators || []);
        let _errorMessages = _.cloneDeep(errorMessages || []);
        if (maxLength) {
            _validators.push(ValidatorEnum.maxStringLength(maxLength));
            _errorMessages.push(CommonMessage.VALIDATION_MAX_CHARACTERS(maxLength));
        }
        return { validators: _validators, errorMessages: _errorMessages };
    });

    render() {
        //eslint-disable-next-line
        const { isHKID, onBlur, onFocus, inputProps, forceTrimSpace, value, onChange, validators, errorMessages, ...rest } = this.props;//NOSONAR
        const { isFocus, _value } = this.state;

        //
        // let maxLength = isHKID ? (9 + 1) : 30;
        let maxLength = isHKID ? 9 : 30;
        if (inputProps && inputProps.maxLength) {
            // maxLength = (inputProps.maxLength + 1);
            maxLength = inputProps.maxLength;
        }
        let showValue = _value;
        if (isHKID && !isFocus) {
            //add two bits '(', ')'
            maxLength = 11;
            showValue = getFormatHKID(showValue);
        } else if (isHKID && isFocus) {
            if (showValue) {
                showValue = showValue.replace('(', '').replace(')', '');
                // if (showValue.length > maxLength - 1) {
                //     showValue = showValue.substring(0, maxLength - 1);
                // }
            }
        }
        if(showValue) {
            if (forceTrimSpace) {
                showValue = showValue.replace(/\s+/g, '');
            }
        }

        const validator = this.getValidators(maxLength, validators, errorMessages);
        return (
            <TextFieldValidator
                upperCase
                fullWidth
                noChinese
                calActualLength
                onBlur={this.handleOnBlur}
                onFocus={this.handleOnFocus}
                onChange={this.handleOnChange}
                value={showValue}
                inputProps={{
                    ...inputProps,
                    maxLength: maxLength
                }}
                ref={ref => this.inputRef = ref}
                {...validator}
                {...rest}
            />
        );
    }
}