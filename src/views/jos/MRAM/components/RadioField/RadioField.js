import React, { Component } from 'react';
import { styles } from './RadioFieldStyle';
import { withStyles } from '@material-ui/core/styles';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import { FormControlLabel, FormGroup, Checkbox } from '@material-ui/core';
import * as generalUtil from '../../utils/generalUtil';

class RadioField extends Component {
  constructor(props){
    super(props);
    this.state={
      val: ''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap,prefix,mramId } = props;
    let val = '';
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    val = fieldValObj!==undefined?fieldValObj.value:'';
    if (val !== state.val) {
      return { val };
    }
    return null;
  }

  generateRadios = () => {
    const { id = '', radioOptions = [], classes, viewMode = false } = this.props;
    let { val } = this.state;
    let radioElms = radioOptions.map(elm => {
      return(
        <FormControlLabel
            key={`${id}_Radio_${elm.value}`}
            classes={{
            label: classes.normalFont,
            disabled: classes.disabledLabel
          }}
            disabled={viewMode}
            control={
            <Checkbox
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<RadioButtonCheckedIcon />}
                checked={elm.value === val ? true : false}
                color="primary"
                id={`${id}_Radio_${elm.value}`}
                onChange={(e) => { this.handleRadioChanged(e, elm.value); }}
            />
          }
            label={elm.label}
        />
      );
    });
    return radioElms;
  }

  handleRadioChanged = (event, type) => {
    let { updateState, fieldValMap, prefix, mramId, sideEffect } = this.props;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    let value = event.target.checked ? type : '';
    fieldValObj.value = value;
    sideEffect && sideEffect(value, mramId);
    generalUtil.handleOperationType(fieldValObj);
    this.setState({ val: value });
    updateState && updateState({
      fieldValMap
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.radioGroupDiv}>
        <FormGroup aria-label="position" row className={classes.radioGroup}>
          {this.generateRadios()}
        </FormGroup>
      </div>
    );
  }
}

export default withStyles(styles)(RadioField);
