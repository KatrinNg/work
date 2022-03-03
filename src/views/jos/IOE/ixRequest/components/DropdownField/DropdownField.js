import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './DropdownFieldStyle';
import CustomizedSelectFieldValidator from '../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import { isUndefined,isNull } from 'lodash';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import { getState } from '../../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

class DropdownField extends Component {
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
    let disabledFlag = !isNull(valObj)?!valObj.isChecked:true;
    switch (itemValType) {
      case constants.ITEM_VALUE.TYPE1:
        val = !isNull(valObj)?valObj.itemVal:'';
        break;
      case constants.ITEM_VALUE.TYPE2:
        val = !isNull(valObj)?valObj.itemVal2:'';
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

  handleSelectChange = event => {
    const { id,middlewareObject,categoryType,updateStateWithoutStatus,itemValType,sideEffect,questionEditMode=false } = this.props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let valObj = valMap.get(id);
    let val = !!event?event.value:'';
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
    sideEffect&&sideEffect(valObj);
    this.setState({ val });
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

  render() {
    const { classes,id='',dropdownMap,itemValType,irtMode=false,clinicList,enableDisabled=true } = this.props;
    let { val,disabledFlag } = this.state;
    let optionItems = irtMode?clinicList:(!isUndefined(dropdownMap)&&dropdownMap.size>0?dropdownMap.get(id).get(itemValType):[]);
    return (
      <div className={classes.wrapper}>
        <CustomizedSelectFieldValidator
            id={`ix_request_item_dropdown_${id}_${itemValType}`}
            options={optionItems.map(option=>{
              return {
                label: option.value,
                value: option.codeIoeFormItemDropId
              };
            })}
            notShowMsg
            isClearable
            value={val}
            isDisabled={enableDisabled?disabledFlag:false}
            onChange={event => {this.handleSelectChange(event);}}
            styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
            menuPortalTarget={document.body}
            inputStyle={{
              borderRadius: '4px',
              border: enableDisabled?(disabledFlag?'none':(!val?'1px solid #ff0000':'none')):'none',
              backgroundColor: enableDisabled ? (disabledFlag ? color.cimsDisableColor : 'unset') : 'unset'
            }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(DropdownField);
