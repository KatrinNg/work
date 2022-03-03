import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './YearTextFieldStyle';
import { TextField, FormHelperText } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import * as generalUtil from '../../utils/generalUtil';
import _ from 'lodash';

class YearTextField extends Component {
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
        let tempFlag = generalUtil.integerValCheck(val,rangeValObj);
        return {
          val,
          errorFlag:tempFlag,
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

  handleYearChanged = (event, type) => {
    let { updateState,fieldValMap,prefix,mramId,rangeValObj,sideEffect,abnormalMsg='' } = this.props;
    let errorFlag = false;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = event.target.value;
    if (generalUtil.integerValCheck(event.target.value)) {
      errorFlag = true;
    }
    let abnormalFlag = abnormalMsg && generalUtil.yearAbnormalCheck(event.target.value);
    fieldValObj.isError = errorFlag||(abnormalFlag&&abnormalMsg!=='');
    // sideEffect&&sideEffect(event.target.value,mramId,event);
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
    const { id='',abnormalMsg='', classes, maxLength, rangeValObj, extraContent='', msgPosition = 'bottom', viewMode=false, errorIconOpen=true, errorController=false ,redBorderController=false, mixMode=false, minValMsg='', maxValMsg='', placeholder =''} = this.props;
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

    return (
      <div style={{width:'100%'}}>
        <div className={classes.wrapper}>
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
              onChange={event => {this.handleYearChanged(event);}}
              onBlur={event => {this.handleYearChanged(event,'blur');}}
              placeholder={placeholder}
              {...numberInputProps}
          />
          <div className={classes.extraContent}>
            <label>{extraContent}</label>
          </div>
          {msgPosition === 'bottom'&&(errorFlag||abnormalFlag)?(
            <FormHelperText
                error
                classes={{
                  root:classes.helper_error
                }}
            >
              {/* {(errorIconOpen)?(
                <ErrorOutline className={classes.error_icon} />
                ):null
              } */}
              {/* Illegal Characters */}
              {errorFlag?'This value is illegal.':(abnormalFlag?abnormalMsg:'')}
            </FormHelperText>
          ):null}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(YearTextField);
