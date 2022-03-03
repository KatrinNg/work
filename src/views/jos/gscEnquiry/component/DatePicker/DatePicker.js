import React, { Component } from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { trim } from 'lodash';
import Enum from '../../../../../../src/enums/enum';

class DatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            format: this.props.format,
            customLable: this.props.label,
            error: props.error
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value,
                error: nextProps.error
            });
        }
    }

    handleChange = (m, f) => {
        const { onChange, labelTitle, focusCallBack } = this.props;
        this.setState({ value: m });
        focusCallBack && focusCallBack(labelTitle);
        onChange && onChange(m, f);
    }

    inputOnFocus = () => {
        const { labelTitle, focusCallBack } = this.props;
        let editFormat = this.props.format;
        if (this.props.format === Enum.DATE_FORMAT_EDMY_VALUE) {
            editFormat = Enum.DATE_FORMAT_DMY;
        } else if (this.props.format === Enum.DATE_FORMAT_EMY_VALUE) {
            editFormat = Enum.DATE_FORMAT_FOCUS_MY_VALUE;
        }
        if (labelTitle && trim(labelTitle) != '') {
            focusCallBack && focusCallBack(labelTitle);
        }
        this.setState({ format: editFormat });
    }

    inputOnBlur = (event) => {
        const { format, focusCallBack, originalLabel } = this.props;
        if (originalLabel && trim(originalLabel) != '' && trim(event.target.value) === '') {
            focusCallBack && focusCallBack(originalLabel);
        }
        this.setState({ format });
    }

    render() {
        const { format, id = '', maxDate, minDate, maxDateMessage, minDateMessage, ...reset } = this.props;
        return (
            <KeyboardDatePicker
                style={{ whiteSpace: 'pre', width: '100%' }}
                id={id}
                autoFocus={(this.state.format === Enum.DATE_FORMAT_DMY && format === Enum.DATE_FORMAT_EDMY_VALUE)}
                onChange={this.handleChange}
                value={this.state.value}
                onFocus={this.inputOnFocus}
                onBlur={this.inputOnBlur}
                autoOk
                format={this.state.format}
                error={this.state.error ? true : false}
                minDate={minDate ? minDate : new Date(Enum.DATE_DEFAULT_MIN_FORMAT)}
                maxDate={maxDate ? maxDate : new Date(Enum.DATE_DEFAULT_MAX_FORMAT)}
                maxDateMessage={maxDateMessage === '' || maxDateMessage ? maxDateMessage : 'Date should not be after maximal date'}
                minDateMessage={minDateMessage === '' || minDateMessage ? minDateMessage : 'Date should not be before minimal date'}
                {...reset}
            />
        );
    }
}

DatePicker.defaultProps = {
    'no-need-input-label': true
};

export default DatePicker;
