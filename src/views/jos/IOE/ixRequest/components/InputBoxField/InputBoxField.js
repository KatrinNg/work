import React, { Component } from 'react';
import { styles } from './InputBoxFieldStyle';
import { withStyles } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import { isUndefined,isNull,trim } from 'lodash';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import {getState} from '../../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

class InputBoxField extends Component {
  constructor(props){
    super(props);
    this.state={
      val: '',
      disabledFlag: !isUndefined(props.disabledFlag)?props.disabledFlag:true  //default:true
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { id,middlewareObject,categoryType,itemValType } = props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let valObj = !isUndefined(valMap)?valMap.get(id):null;
    let val = '';
    let disabledFlag = !isUndefined(props.disabledFlag)?props.disabledFlag:(!isNull(valObj)&&!isUndefined(valObj)?!valObj.isChecked:true);
    switch (itemValType) {
      case constants.ITEM_VALUE.TYPE1:
        val = !isNull(valObj)&&!isUndefined(valObj)?valObj.itemVal:'';
        break;
      case constants.ITEM_VALUE.TYPE2:
        val = !isNull(valObj)&&!isUndefined(valObj)?valObj.itemVa2:'';
        break;
      default:
        break;
    }
    val = !isNull(val)?val:'';
    if (val!==state.val||disabledFlag!==state.disabledFlag) {
      return {
        val,
        disabledFlag
      };
    }
    return null;
  }

  handleChanged = event => {
    const { id,middlewareObject,categoryType,updateStateWithoutStatus,itemValType,questionEditMode=false } = this.props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let valObj = valMap.get(id);
    let val = event.target.value;
    switch (itemValType) {
      case constants.ITEM_VALUE.TYPE1:
        valObj.itemVal = val;
        break;
      case constants.ITEM_VALUE.TYPE2:
        valObj.itemVal2 = val;
        break;
      default:
        break;
    }
    this.setState({
      val:event.target.value
    });
    if (questionEditMode) {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        questionEditMiddlewareObject:middlewareObject
      });
    } else {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        middlewareObject
      });
    }
  }

  handleBlur = () => {
    const { id,middlewareObject,categoryType,updateStateWithoutStatus,itemValType,sideEffect,questionEditMode=false } = this.props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let valObj = valMap.get(id);
    let val = '';
    switch (itemValType) {
      case constants.ITEM_VALUE.TYPE1:
        valObj.itemVal = trim(valObj.itemVal);
        val = valObj.itemVal;
        break;
      case constants.ITEM_VALUE.TYPE2:
        valObj.itemVal2 = trim(valObj.itemVal2);
        val = valObj.itemVal;
        break;
      default:
        break;
    }
    sideEffect&&sideEffect(valObj);
    if (questionEditMode) {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        questionEditMiddlewareObject:middlewareObject
      });
    } else {
      updateStateWithoutStatus&&updateStateWithoutStatus({
        middlewareObject
      });
    }
    this.setState({
      val
    });
  }

  render() {
    const { classes, id='', maxLength, enableDisabled=true,nullAble} = this.props;
    let { val,disabledFlag } = this.state;
    let inputProps = {
      autoComplete: 'off',
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className:classes.inputProps,
        maxLength: maxLength || null,
        style: {
          backgroundColor: enableDisabled ? (disabledFlag ? color.cimsDisableColor : 'unset') : 'unset'
        }
      }
    };

    return (
      <div className={classes.wrapper}>
        <TextField
            fullWidth
            id={`form_item_inputbox_${id}`}
            value={val}
            disabled={enableDisabled?disabledFlag:false}
            onChange={event => {this.handleChanged(event);}}
            onBlur={()=>{this.handleBlur();}}
            error={!disabledFlag&&nullAble==='N'&&val===''}
            {...inputProps}
        />
      </div>
    );
  }
}

export default withStyles(styles)(InputBoxField);
