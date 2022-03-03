import React from 'react';
import TextFieldValidator from 'components/FormValidator/TextFieldValidator';
import _ from 'lodash';

function encryption(value) {
    let val = '';
    value && _.range(value.length).forEach(() => { val = val + '●'; });
    return val;
}

function decrypt(curValue, preValue, start, end) {
    if (start === end) {
        let changeVal = curValue.replace(new RegExp(/●/g), '') || '';
        if (!changeVal && curValue.length < preValue.length) {
            let value = preValue.substring(0, start - 1) + changeVal + preValue.substr(end);
            return value;
        } else {
            let value = preValue.substring(0, start) + changeVal + preValue.substr(end);
            return value;
        }
    } else {
        let changeVal = curValue.replace(new RegExp(/●/g), '') || '';
        let value = preValue.substring(0, start) + changeVal + preValue.substr(end);
        return value;
    }
}

class PassCodeInputNoHint extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            innerValue: encryption(this.props.value || ''),
            actualValue: _.cloneDeep(this.props.value || ''),
            selectionStart: 0,
            selectionEnd: 0
        };
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if(prevProps.value !== this.props.value) {
            this.setState({
                innerValue: encryption(this.props.value || ''),
                actualValue: _.cloneDeep(this.props.value || ''),
                selectionStart: 0,
                selectionEnd: 0
            });
        }
        return '';
    }

    handleOnSelect = (e) => {
        e.target.selectionStart = (this.state.innerValue || '').length;
        e.target.selectionEnd = (this.state.innerValue || '').length;
        this.setState({
            selectionStart: e.target.selectionStart,
            selectionEnd: e.target.selectionEnd
        });
    }

    handleOnChange = e => {
        let targetVal = e.target.value || '';
        this.setState({
            innerValue: encryption(targetVal),
            actualValue: decrypt(targetVal, this.state.actualValue, this.state.selectionStart, this.state.selectionEnd),
            selectionStart: e.target.selectionStart,
            selectionEnd: e.target.selectionEnd
        });
    };

    handleOnBlur = e => {
        this.props.onBlur && this.props.onBlur(this.state.actualValue);
    }

    validateCurrent = () => {
        this.textFieldRef.validateCurrent();
    }

    render() {
        const { id, label, validators, errorMessages, error, inputProps, inputRef, name, disabled } = this.props;
        const { innerValue } = this.state;
        return (
            <TextFieldValidator
                fullWidth
                name={name}
                onPaste={() => { window.event.returnValue = false; }}
                onContextMenu={() => { window.event.returnValue = false; }}
                onCopy={() => { window.event.returnValue = false; }}
                onCut={() => { window.event.returnValue = false; }}
                onSelect={this.handleOnSelect}
                onChange={this.handleOnChange}
                onBlur={this.handleOnBlur}
                id={`${id}_passcode`}
                value={innerValue}
                label={label}
                validators={validators}
                errorMessages={errorMessages}
                error={error}
                inputProps={{
                    ...inputProps,
                    maxLength: 5
                }}
                inputRef={inputRef}
                ref={r => this.textFieldRef = r}
                disabled={disabled}
            />
        );
    }
}

export default PassCodeInputNoHint;