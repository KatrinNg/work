import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './TemplateClickBoxFieldStyle';
import { isNull,isUndefined } from 'lodash';
import { Checkbox } from '@material-ui/core';
import * as utils from '../../utils/ixUtils';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';

class TemplateClickBoxField extends Component {
  constructor(props){
    super(props);
    this.state={
      isChecked: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { id,orderKey,middlewareMapObj,testId,specimentId,level,disabled } = props;
    let isChecked = false;
    if(disabled == undefined || disabled == false){
      if (!!middlewareMapObj) {
        if (level === constants.IX_REQUEST_TEMPLATE_CB.LEVEL_1) {
          if (id === middlewareMapObj.templateId) {
            isChecked = middlewareMapObj.templateSelectAll;
          }
        } else if (level === constants.IX_REQUEST_TEMPLATE_CB.LEVEL_2) {
          let middlewareObject = middlewareMapObj.middlewareMap.get(orderKey);
          isChecked = middlewareObject.selectAll;
        } else if (level === constants.IX_REQUEST_TEMPLATE_CB.LEVEL_3) {
          let middlewareObject = middlewareMapObj.middlewareMap.get(orderKey);
          let valObj = null;
          if (!isNull(testId)) {
            // testId as standard
            let valMap = middlewareObject.testValMap;
            valObj = !isUndefined(valMap)?valMap.get(testId):null;
          } else if (!isNull(specimentId)){
            let valMap = middlewareObject.specimenValMap;
            valObj = !isUndefined(valMap)?valMap.get(specimentId):null;
          }

          isChecked = !isNull(valObj)&&!isUndefined(valObj)?valObj.isChecked:false;
        }
      }
      if (isChecked!==state.isChecked) {
        return {
          isChecked
        };
      }
    }
    return null;
  }

  handleChanged = event => {
    const { specimentId,testId,middlewareMapObj,orderKey,updateStateWithoutStatus,level } = this.props;
    if (level === constants.IX_REQUEST_TEMPLATE_CB.LEVEL_1) {
      utils.handleTemplateTabClickEffect(event.target.checked,level,middlewareMapObj);
    } else if (level === constants.IX_REQUEST_TEMPLATE_CB.LEVEL_2) {
      utils.handleTemplateTabClickEffect(event.target.checked,level,middlewareMapObj,orderKey);
    } else if (level === constants.IX_REQUEST_TEMPLATE_CB.LEVEL_3) {
      utils.handleTemplateTabClickEffect(event.target.checked,level,middlewareMapObj,orderKey,specimentId,testId);
    }
    this.setState({
      isChecked:event.target.checked
    });
    updateStateWithoutStatus&&updateStateWithoutStatus({
      middlewareMapObj,
      autoMiddlewareMapObj:null
    });
  }

  render() {
    const {classes,id='',disabled} = this.props;
    let {isChecked} = this.state;

    return (
      <div>
        <Checkbox
            id={`ix_request_template_item_clickbox_${id}_${Math.random()}`}
            checked={isChecked}
            onChange={this.handleChanged}
            color="primary"
            classes={{
              root:classes.rootCheckbox
            }}
            disabled={disabled}
        />
      </div>
    );
  }
}

export default withStyles(styles)(TemplateClickBoxField);
