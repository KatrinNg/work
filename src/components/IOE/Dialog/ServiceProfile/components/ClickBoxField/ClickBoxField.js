import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './ClickBoxFieldStyle';
import { isNull,isUndefined } from 'lodash';
import { Checkbox } from '@material-ui/core';
import * as utils from '../../utils/dialogUtils';
import { SERVICE_PROFILE_MAINTENANCE_CODE } from '../../../../../../constants/message/IOECode/serviceProfileMaintenanceCode';
import * as constants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';

class ClickBoxField extends Component {
  constructor(props){
    super(props);
    this.state={
      isChecked: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { id,middlewareObject,categoryType } = props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let valObj = !isUndefined(valMap)?valMap.get(id):null;
    let isChecked = !isNull(valObj)&&!isUndefined(valObj)?valObj.isChecked:false;
    if (isChecked!==state.isChecked) {
      return {
        isChecked
      };
    }
    return null;
  }

  handleChanged = event => {
    const { id,middlewareObject,categoryType,updateState,sideEffect,ioeFormMap,openCommonMessage,selectedFormId } = this.props;
    let valMap = middlewareObject[`${categoryType}ValMap`];
    let masterTestMap = middlewareObject.masterTestMap;
    let valObj = valMap.get(id);
    let checkFlag = event.target.checked;
    let msgCode = '';
    if (checkFlag) {
      msgCode = utils.validateMaxTest(valObj,valMap,ioeFormMap,selectedFormId);
    }
    if (msgCode!=='') {
      if (msgCode === SERVICE_PROFILE_MAINTENANCE_CODE.EXCEEDED_TEST_LIMIT) {
        openCommonMessage&&openCommonMessage({msgCode});
      } else {
        let payload = {
          msgCode,
          params:[
            {
              name:'testName',
              value:valObj.itemName
            }
          ],
          btnActions: {
            btn1Click: () => {
              // YES
              for (let itemValObj of valMap.values()) {
                if (itemValObj.ioeType !== constants.TEST_ITEM_IOE_TYPE.ITEF) {
                  itemValObj.isChecked = false;
                  utils.handleClickBoxOperationType(itemValObj);
                }
              }
              valObj.isChecked = checkFlag;
              this.setState({
                isChecked:checkFlag
              });
              sideEffect&&sideEffect(id,valMap,masterTestMap,middlewareObject.codeIoeFormId);
              utils.handleClickBoxOperationType(valObj);
              updateState&&updateState({
                middlewareObject
              });
            }
          }
        };
        openCommonMessage&&openCommonMessage(payload);
      }
    } else {
      valObj.isChecked = checkFlag;
      this.setState({
        isChecked:checkFlag
      });
      sideEffect&&sideEffect(id,valMap,masterTestMap,middlewareObject.codeIoeFormId);
      utils.handleClickBoxOperationType(valObj);
      updateState&&updateState({
        middlewareObject
      });
    }
  }

  render() {
    const {classes,id=''} = this.props;
    let {isChecked} = this.state;

    return (
      <div>
        <Checkbox
            id={`form_item_clickbox_${id}`}
            checked={isChecked}
            onChange={this.handleChanged}
            color="primary"
            classes={{
              root:classes.rootCheckbox
            }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(ClickBoxField);
