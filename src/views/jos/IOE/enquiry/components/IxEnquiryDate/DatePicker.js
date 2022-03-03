import React, { Component } from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { trim } from 'lodash';

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
    if (this.props.format === 'DD-MMM-YYYY') {
      editFormat = 'DD-MM-YYYY';
    } else if (this.props.format === 'MMM-YYYY') {
      editFormat = 'MM-YYYY';
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
    const { format, id = '', ...reset } = this.props;
    return (
      <KeyboardDatePicker
          style={{ whiteSpace: 'pre' }}
          id={id}
          autoFocus={(this.state.format === 'DD-MM-YYYY' && format === 'DD-MMM-YYYY')}
          onChange={this.handleChange}
          value={this.state.value}
          onFocus={this.inputOnFocus}
          onBlur={this.inputOnBlur}
          autoOk
          format={this.state.format}
          error={this.state.error ? true : false}
          {...reset}
      />
    );
  }
}

DatePicker.defaultProps = {
  'no-need-input-label': true
};

export default DatePicker;
