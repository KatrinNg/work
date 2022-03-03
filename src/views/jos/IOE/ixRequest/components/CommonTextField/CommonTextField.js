import React, { Component } from 'react';
import { TextField, FormHelperText, withStyles } from '@material-ui/core';
import { styles } from './CommonTextFieldStyle';

class CommonTextField extends Component {

  handleTextFieldChanged = event => {
    const {onChange,stateParameter} = this.props;
    onChange&&onChange(event,stateParameter);
  }

  handleTextFieldBlur = event => {
    const {onBlur,stateParameter} = this.props;
    onBlur&&onBlur(event,stateParameter);
  }

  maxLengthIsError = (value,num) => {
    let errorFlag = false;
    if(num&&value.length>num){
      let { resetHeight } = this.props;
      resetHeight && resetHeight();
      errorFlag=true;
    }
    return errorFlag;
  }

  render() {
    const {classes,id='',value='',length,disabled=false,required=false,errorFlag,inputStyle} = this.props;
    let inputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className:classes.inputProps,
        style: inputStyle
      }
    };

    let maxLengthError = this.maxLengthIsError(value,length);
    let showRequiredError = required?errorFlag:false;

    return (
      <div className={classes.wrapper}>
        <TextField
            fullWidth
            id={id}
            value={value}
            error={showRequiredError||maxLengthError}
            disabled={disabled}
            onChange={event => {this.handleTextFieldChanged(event);}}
            onBlur={event => {this.handleTextFieldBlur(event);}}
            {...inputProps}
        />
        {showRequiredError?(
          <FormHelperText error classes={{root:classes.helper_error}}>
            This field is required.
          </FormHelperText>
        ):null}
        {maxLengthError?(
          <FormHelperText error classes={{root:classes.helper_error}}>
            This field has exceeded the maximum length.
          </FormHelperText>
        ):null}
      </div>
    );
  }
}

export default withStyles(styles)(CommonTextField);
