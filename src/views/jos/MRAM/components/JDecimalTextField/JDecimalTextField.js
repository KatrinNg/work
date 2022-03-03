import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './JDecimalTextFieldStyle';
import { TextField, FormHelperText } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import * as generalUtil from '../../utils/generalUtil';
import _ from 'lodash';
import { MRAM_MEASUREMENTS_ID } from '../../../../../constants/MRAM/measurementAndLabTest/measurementAndLabTestConstant';

class DecimalTextField extends Component {
  constructor(props){
    super(props);
    this.state={
      errorFlag: false,
      abnormalFlag: false,
      val:''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap,prefix,mramId,abnormalFlag,rangeValObj } = props;
    let val = '';
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    val = fieldValObj!==undefined?fieldValObj.value:'';

    if (val!==state.val) {
        let tempFlag = generalUtil.abnormalCheck(val,rangeValObj);
        return {
          val,
          errorFlag: mramId !== MRAM_MEASUREMENTS_ID.WAIST ? tempFlag : false,
          abnormalFlag:abnormalFlag ? abnormalFlag : tempFlag
        };
    }else{
      if(abnormalFlag!==undefined){
        return {
          abnormalFlag
        };
      }
    }

    return null;
  }

  handleDecimalChanged = (event, type) => {
    let { updateState,fieldValMap,prefix,mramId,rangeValObj,sideEffect,abnormalMsg='' } = this.props;
    let errorFlag = false;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = event.target.value;

    if (event.target.value!=='') {
      if (generalUtil.DecimalValCheck(event.target.value)) {
        errorFlag = true;
      }
    }
    let abnormalFlag = generalUtil.abnormalCheck(event.target.value,rangeValObj);
    fieldValObj.isError = errorFlag;
    fieldValObj.isAbnormal = abnormalFlag && abnormalMsg!=='';
    sideEffect&&sideEffect(event.target.value,mramId,event);
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      val:event.target.value,
      errorFlag,
      abnormalFlag
    });
    type && updateState&&updateState({
      fieldValMap
    });
  }

  render() {
    const { id='',abnormalMsg='', classes, maxLength, rangeValObj, extraContent='', msgPosition = 'bottom', viewMode=false, errorIconOpen=true, errorController=false ,redBorderController=false, mixMode=false, minValMsg='', maxValMsg='', width='36%'} = this.props;
    let { errorFlag,abnormalFlag,val } = this.state;
    let numberInputProps = {
      autoCapitalize:'off',
      autoComplete:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        maxLength: maxLength || null
      }
    };

    let tempAbnormalMsg = abnormalMsg;
    if (mixMode&&abnormalFlag) {
      let minVal = _.toNumber(rangeValObj.minVal);
      let maxVal = _.toNumber(rangeValObj.maxVal);
      let currentVal = _.toNumber(val);
      if (currentVal<minVal) {
        tempAbnormalMsg = minValMsg;
      } else if (currentVal>maxVal) {
        tempAbnormalMsg = maxValMsg;
      }
    }

    return (
      <div style={{width:width}}>
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
              {errorFlag?'Invalid Entry':(abnormalFlag?tempAbnormalMsg:'')}
            </FormHelperText>
          ):null}
          <TextField
              id={id}
              style={{width: '100%'}}
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
          {msgPosition === 'bottom'&&(errorFlag||abnormalFlag||errorController)?(
            <FormHelperText
                error
                classes={{
                  root:classes.helper_error
                }}
            >
              {(errorIconOpen && (errorFlag||tempAbnormalMsg))?(
                <ErrorOutline className={classes.error_icon} />
                ):null
              }
              {/* Illegal Characters */}
              {errorFlag?'Invalid Entry':((abnormalFlag||errorController)?tempAbnormalMsg:'')}
            </FormHelperText>
          ):null}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DecimalTextField);
