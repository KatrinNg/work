import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, TextField, Checkbox, FormHelperText } from '@material-ui/core';
import { styles } from './BasicInfoStyle';
import classNames from 'classnames';
import { trim } from 'lodash';

class BasicInfo extends Component {

  handleTextFieldChanged = event => {
    const { updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      templateName: event.target.value,
      templateNameErrorFlag: trim(event.target.value)===''?true:false,
      templateNameMessage:'This field is required.'
    });
  }

  handleTextFieldBlur = event => {
    const { updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      templateNameErrorFlag: trim(event.target.value)===''?true:false
    });
  }

  handleCheckBoxChanged = event => {
    const { updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      isActive: event.target.checked
    });
  }

  render() {
    const { classes,templateName,isActive,templateNameErrorFlag,templateNameMessage } = this.props;
    let inputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className: classes.inputProps
      }
    };
    return (
      <div className={classNames(classes.wrapper,classes.flexCenter)}>
        <div className={classNames(classes.floatLeft)}>
          <div className={classes.flexCenter}>
            <label className={classes.label}>
              Template Name<span className={classes.required}>*</span>
            </label>
            <TextField
                id="input_service_profile_dialog_template_name"
                error={templateNameErrorFlag}
                onChange={this.handleTextFieldChanged}
                // onBlur={this.handleTextFieldBlur}
                value={templateName}
                {...inputProps}
            />
          </div>
          <div className={classes.errorWrapper}>
            {templateNameErrorFlag?(
              <FormHelperText id="error_service_profile_template_name" error classes={{root:classes.helperError}}>
                {/* <ErrorOutline className={classes.errorIcon} /> */}
                {templateNameMessage}
              </FormHelperText>
            ):null}
          </div>
        </div>
        <div className={classNames(classes.floatLeft,classes.activeWrapper)}>
          <label className={classes.label}>Active</label>
          <Checkbox
              id="checkbox_service_profile_dialog_template_active"
              onChange={this.handleCheckBoxChanged}
              color="primary"
              checked={isActive}
              className={classes.checkbox}
          />
        </div>
      </div>
    );
  }
}

export default connect()(withStyles(styles)(BasicInfo));
