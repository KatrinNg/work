import React, { Component } from 'react';
import {FormHelperText, withStyles} from '@material-ui/core';
import {trim} from 'lodash';
import { styles } from './StringTextFieldStyle';
// import TextareaAutosize from '@material-ui/core/TextareaAutosize';

class StringTextField extends Component {
  integerValCheck = val => {
    let checkFlag=false;
    let sum = 0;
    for (let i=0; i<val.length; i++)
    {
        let c = val.charCodeAt(i);
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f))
        {
        sum++;
        }
        else
        {
            sum+=3;
        }
    }
    if (sum > 300) {
        checkFlag=true;
    }
    return checkFlag;
  }

  handleChange = event => {
    const { valueChange,updateState } = this.props;
    let value = event.target.value;
    let timeRequireFlag = false;
    let timeIllegalFlag = false;
    // check empty
    if (trim(value) === '') {
      timeRequireFlag = true;
    } else {
      // check illegal
      if (this.integerValCheck(value)) {
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

    return (
      <div>
        {/* <TextField
            className={classes.input}
            id={`instruction_string_input_${id}`}
            autoCapitalize="off"
            error={timeRequireFlag||timeIllegalFlag?true:false}
            inputProps={{
              maxLength: 300,
              style:{
                fontSize:'1rem',
                fontFamily: 'Arial'
              }
            }}
            InputProps={{
              style:{
                fontSize:'1rem',
                fontFamily: 'Arial'
              }
            }}
            placeholder={placeholder}
            value={value||''}
            onChange={event => {this.handleChange(event);}}
        /> */}
        <textarea
            className={classes.input}
            id={`instruction_string_input_${id}`}
            placeholder={placeholder}
            rows="3"
            value={value || ''}
            onChange={event => { this.handleChange(event); }}
        />
        <FormHelperText
            error
            classes={{
              'error':classes.errorHelper
            }}
        >
          {timeRequireFlag?'This field is required.':(timeIllegalFlag?'The input value cannot exceed 300.':null)}
        </FormHelperText>
      </div>
    );
  }
}

export default withStyles(styles)(StringTextField);
