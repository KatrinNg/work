import React, { Component } from 'react';
import { TextField, FormHelperText, withStyles } from '@material-ui/core';
import {trim} from 'lodash';
import { styles } from './IntegerTextFieldStyle';

class IntegerTextField extends Component {
  integerValCheck = val => {
    let partten = /^(0|[1-9][0-9]*)$/;
    if (!partten.test(val)) {
      return true;
    }
    return false;
  }

  handleChange = event => {
    const { valueChange,updateState } = this.props;
    let value = event.target.value;
    let timeRequireFlag = false;
    let timeIllegalFlag = false;
    // check empty
    if (trim(value) === '') {
      timeRequireFlag = true;
      timeIllegalFlag = false;
    } else {
      // check illegal
      if (this.integerValCheck(value)) {
        timeRequireFlag = false;
        timeIllegalFlag = true;
      }
    }
    updateState&&updateState({
      timeRequireFlag,
      timeIllegalFlag
    });
    valueChange&&valueChange(value);
  }

  render() {
    const {
      classes,
      value,
      id='',
      placeholder='',
      timeRequireFlag=false,
      timeIllegalFlag=false
    } = this.props;
    let inputProps = {
      inputProps: {
        className: classes.inputProps,
        maxLength: 3
      },
      InputProps: {
        classes: {
          input: classes.input
        }
      }
    };

    return (
      <div>
        <TextField
            id={`turnaround_time_integer_input_${id}`}
            error={timeRequireFlag || timeIllegalFlag ? true : false}
            placeholder={placeholder}
            value={value||''}
            onChange={event => {this.handleChange(event);}}
            {...inputProps}
        />
        <FormHelperText
            error
            classes={{
              'error':classes.errorHelper
            }}
        >
          {timeRequireFlag?'This field is required.':(timeIllegalFlag?'This value is illegal.':null)}
        </FormHelperText>
      </div>
    );
  }
}

export default withStyles(styles)(IntegerTextField);
