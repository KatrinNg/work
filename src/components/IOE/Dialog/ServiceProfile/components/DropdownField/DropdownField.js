import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './DropdownFieldStyle';
import CustomizedSelectFieldValidator from '../../../../../Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as ServiceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import { isUndefined,isNull } from 'lodash';
import * as utils from '../../utils/dialogUtils';
import {getState} from '../../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

class DropdownField extends Component {
  constructor(props){
    super(props);
    this.state={
      val: '',
      disabledFlag: true  //default:true
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { id,middlewareObject,categoryType,itemValType } = props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let valObj = !isUndefined(valMap)?valMap.get(id):null;
    let val = '';
    let disabledFlag = !isNull(valObj)?!valObj.isChecked:true;
    switch (itemValType) {
      case ServiceProfileConstants.ITEM_VALUE.TYPE1:
        val = !isNull(valObj)?valObj.itemVal:'';
        break;
      case ServiceProfileConstants.ITEM_VALUE.TYPE2:
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
    const { id,middlewareObject,categoryType,updateState,itemValType } = this.props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let valObj = valMap.get(id);
    let val = !!event?event.value:'';
    switch (itemValType) {
      case ServiceProfileConstants.ITEM_VALUE.TYPE1:
        valObj.itemVal = val;
        break;
      case ServiceProfileConstants.ITEM_VALUE.TYPE2:
        valObj.itemVal2 = val;
        break;
      default:
        break;
    }
    utils.handleDropdownOperationType(valObj);
    this.setState({
      val
    });
    updateState&&updateState({
      middlewareObject
    });
  }

  render() {
    const {id='',dropdownMap,itemValType, nullAble } = this.props;
    let { val,disabledFlag } = this.state;
    let optionItems = !isUndefined(dropdownMap)&&dropdownMap.size>0?dropdownMap.get(id).get(itemValType):[];
    return (
      <div>
        <CustomizedSelectFieldValidator
            id={`form_item_dropdown_${id}`}
            options={optionItems.map(option=>{
              return {
                label: option.value,
                value: option.codeIoeFormItemDropId
              };
            })}
            isValid={nullAble==='N'?(!disabledFlag?(val!==''?true:false):true):true}
            notShowMsg
            isClearable
            value={val}
            isDisabled={disabledFlag}
            onChange={event => {this.handleSelectChange(event);}}
            styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
            menuPortalTarget={document.body}
            inputStyle={{
              backgroundColor: disabledFlag ? color.cimsDisableColor : 'unset'
            }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(DropdownField);
