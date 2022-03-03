import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './ClickBoxFieldStyle';
import { isNull,isUndefined, random } from 'lodash';
import { Checkbox } from '@material-ui/core';
import * as utils from '../../utils/ixUtils';
import {IX_REQUEST_CODE} from '../../../../../../constants/message/IOECode/ixRequestCode';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';

class ClickExpreeIoeBoxField extends Component {
  constructor(props){
    super(props);
    this.state={
      isChecked: false,
      key: Math.random()
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { id,expressIoeMap,groupName } = props;
    let valMap = expressIoeMap.get(groupName).formMap;
    let valObj = !isUndefined(valMap)?valMap.get(id):null;
    let isCheck = !isNull(valObj)&&!isUndefined(valObj)?valObj.isChecked:false;
    if (isCheck!==state.isChecked) {
      return {
        isChecked:isCheck,
        key: Math.random()
      };
    }
    return null;
  }

  handleChanged = event => {
    const { updateExpressIoeContainerState,updateState,basicInfo,checkedExpressIoeMap,id,expressIoeMap,groupName,updateStateWithoutStatus,updateGroupingContainerState,ioeFormMap,openCommonMessage,selectedFormId,questionEditMode=false } = this.props;
    let valMap = expressIoeMap.get(groupName).formMap;
    let valObj = valMap.get(id);
    let checkFlag = event.target.checked;
    valObj.isChecked = checkFlag;
    if(event.target.checked){
      checkedExpressIoeMap.set(id,valObj);
    }else{
      checkedExpressIoeMap.delete(id);
      if(valObj.inputOrderList&&valObj.inputOrderList.length>0){
        valObj.inputOrderList=[];
      }
    }
    this.setState({
      isChecked:checkFlag
    });
    let msgCode = '';
    updateStateWithoutStatus&&updateStateWithoutStatus({
      expressIoeMap:expressIoeMap
    });
    if(checkedExpressIoeMap.size>0){
      updateExpressIoeContainerState&&updateExpressIoeContainerState({checkedExpressIoeMap});
      basicInfo.checkedExpressIoeMap=checkedExpressIoeMap;
      updateState&&updateState({basicInfo});
      updateGroupingContainerState&&updateGroupingContainerState({resetCheckedExpressIoeMap:false});
    }else{
      basicInfo.checkedExpressIoeMap=checkedExpressIoeMap;
      updateState&&updateState({basicInfo});
      updateExpressIoeContainerState&&updateExpressIoeContainerState({checkedExpressIoeMap});
    }
  }

  render() {
    const {classes,id=''} = this.props;
    let {isChecked, key} = this.state;

    return (
      <div>
        <Checkbox
            id={`ix_request_item_express_ioe_clickbox_${id}`}
            checked={isChecked}
            onChange={this.handleChanged}
            color="primary"
            classes={{
              root:classes.rootCheckbox
            }}
            key={key}
        />
      </div>
    );
  }
}

export default withStyles(styles)(ClickExpreeIoeBoxField);
