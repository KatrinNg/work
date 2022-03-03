import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './DecimalTextFieldStyle';
import { TextField, FormHelperText } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import * as generalUtil from '../../utils/generalUtil';

class DecimalTextField extends Component {
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
    let val = '', errorFlag = false, abnormalFlag=false ;
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

  handleDecimalChanged = (event, type) => {
    let { updateState,fieldValMap,prefix,mramId,rangeValObj,sideEffect, disabledNegative=false, abnormal2ErrorSwitch=false } = this.props;
    let errorFlag = false, specialErrorFlag = false;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    let tempVal = event.target.value;
    if (disabledNegative) {
      tempVal = tempVal.replace(/-/g,'');
    }
    fieldValObj.value = tempVal;

    if (tempVal!=='') {
      if (generalUtil.DecimalValCheck(tempVal)) {
        errorFlag = true;
      }
    }
    let abnormalFlag = generalUtil.abnormalCheck(tempVal,rangeValObj);
    fieldValObj.isError = errorFlag;
    fieldValObj.isAbnormal = abnormalFlag;
    if (abnormal2ErrorSwitch) {
      fieldValObj.isError = errorFlag||abnormalFlag;
      specialErrorFlag = abnormalFlag;
    }
    sideEffect&&sideEffect(tempVal,mramId,event);
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      val:tempVal,
      errorFlag,
      abnormalFlag,
      specialErrorFlag
    });
    type && updateState&&updateState({
      fieldValMap
    });
  }

  render() {
    const {
      id='',
      errorMsg='',
      abnormalMsg='',
      classes,
      maxLength,
      extraContent='',
      msgPosition = 'bottom',
      viewMode=false,
      errorIconOpen=true,
      errorController=false,
      redBorderController=false,
      showErrorMsg = true} = this.props;
    let { errorFlag,abnormalFlag,val,specialErrorFlag } = this.state;
    let numberInputProps = {
      autoCapitalize:'off',
      autoComplete:'off',
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
              error={!errorFlag?abnormalFlag||errorController||redBorderController:true}
              value={val}
              disabled={viewMode}
              InputProps={{
                className: errorFlag?classes.abnormal:(abnormalFlag?classes.abnormal:null),
                classes: {
                  input: classes.input,
                  disabled: classes.disabled
                }
              }}
              onChange={event => {this.handleDecimalChanged(event);}}
              onBlur={event => {this.handleDecimalChanged(event,'blur');}}
              {...numberInputProps}
          />
          <div className={classes.extraContent}>
            <label>{extraContent}</label>
          </div>
          {msgPosition === 'bottom'&&showErrorMsg&&(errorFlag||abnormalFlag||errorController)?(
            <FormHelperText
                error
                classes={{
                  root:classes.helper_error
                }}
            >
              {(errorIconOpen)?(
                <ErrorOutline className={classes.error_icon} />
                ):null
              }
              {/* Illegal Characters */}
              {errorFlag?(specialErrorFlag?errorMsg:'Invalid Entry'):((abnormalFlag||errorController)?abnormalMsg:'')}
            </FormHelperText>
          ):null}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DecimalTextField);
