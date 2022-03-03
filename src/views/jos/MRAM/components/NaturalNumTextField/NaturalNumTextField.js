import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './NaturalNumTextFieldStyle';
import { TextField, FormHelperText } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import * as generalUtil from '../../utils/generalUtil';

class NaturalNumTextField extends Component {
  constructor(props){
    super(props);
    this.state={
      errorFlag: false,
      abnormalFlag: false,
      val:'',
      specialErrorFlag: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap,prefix,mramId } = props;
    let val = '', errorFlag = false, abnormalFlag=false;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    val = fieldValObj!==undefined?fieldValObj.value:'';
    errorFlag = fieldValObj!==undefined?fieldValObj.isError:false;
    abnormalFlag = fieldValObj!==undefined?fieldValObj.isAbnormal:false;
    if (val!==state.val||errorFlag!==state.errorFlag||abnormalFlag!==state.abnormalFlag) {
      return {
        val,
        errorFlag,
        abnormalFlag
      };
    }
    return null;
  }

  handleNaturalChanged = (event) => {
    let { updateState, fieldValMap, prefix, mramId, rangeValObj, sideEffect, abnormal2ErrorSwitch = false, typeName = 'MramNo' } = this.props;
    let errorFlag = false, specialErrorFlag = false;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = event.target.value;

    if (event.target.value !== '') {
      if (typeName === 'MramNo') {
        if (!generalUtil.NaturalValCheck(event.target.value)) {
          errorFlag = false;
        } else {
          errorFlag = true;
        }
      } else if (typeName === 'MramVPT') {
        if (!generalUtil.DoubleValCheck(event.target.value)) {
          errorFlag = false;
        } else {
          errorFlag = true;
        }
      }
    }
    let abnormalFlag = generalUtil.abnormalCheck(event.target.value,rangeValObj);
    fieldValObj.isError = errorFlag;
    fieldValObj.isAbnormal = abnormalFlag;
    if (abnormal2ErrorSwitch) {
      fieldValObj.isError = errorFlag||abnormalFlag;
      specialErrorFlag = abnormalFlag;
    }
    sideEffect&&sideEffect(event.target.value,mramId);
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      val:event.target.value,
      errorFlag,
      abnormalFlag,
      specialErrorFlag
    });
    updateState&&updateState({
      fieldValMap
    });
  }

  render() {
    const { id='',abnormalMsg='',errorMsg='',classes, maxLength,extraContent='',msgPosition = 'bottom',viewMode=false } = this.props;
    let { errorFlag,abnormalFlag,val,specialErrorFlag } = this.state;
    let numberInputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        maxLength: maxLength || null
      }
    };

    return (
      <div>
        <div className={classes.wrapper}>
          {msgPosition === 'top'&&(errorFlag||abnormalFlag)?(
            <FormHelperText
                error
                classes={{
                  error:classes.helper_error
                }}
            >
              <ErrorOutline className={classes.error_icon} />
              {/* Illegal Characters */}
              {errorFlag?(specialErrorFlag?errorMsg:'Invalid Entry'):(abnormalFlag?abnormalMsg:'')}
            </FormHelperText>
          ):null}
          <TextField
              id={id}
              error={!errorFlag?abnormalFlag:true}
              value={val}
              disabled={viewMode}
              InputProps={{
                className: errorFlag?classes.abnormal:(abnormalFlag?classes.abnormal:null),
                classes: {
                  input: classes.input,
                  disabled: classes.disabled
                }
              }}
              onChange={event => {this.handleNaturalChanged(event);}}
              {...numberInputProps}
          />
          <div className={classes.extraContent}>
            <label className={classes.extraContentLabel}>{extraContent}</label>
          </div>
          {msgPosition === 'bottom'&&(errorFlag||abnormalFlag)?(
            <FormHelperText
                error
                classes={{
                  error:classes.helper_error
                }}
            >
              <ErrorOutline className={classes.error_icon} />
              {/* Illegal Characters */}
              {errorFlag?(specialErrorFlag?errorMsg:'Invalid Entry'):(abnormalFlag?abnormalMsg:'')}
            </FormHelperText>
          ):null}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(NaturalNumTextField);
