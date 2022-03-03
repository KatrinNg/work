import React, { Component } from 'react';
import { styles } from './TextareaFieldStyle';
import { withStyles } from '@material-ui/core/styles';
import * as generalUtil from '../../utils/generalUtil';
import { trim } from 'lodash';
import { Typography } from '@material-ui/core';
import clsx from 'clsx';

class TextareaField extends Component {
  constructor(props){
    super(props);
    this.state={
      val: ''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap,prefix,mramId } = props;
    let val = '';
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    val = fieldValObj!==undefined?fieldValObj.value:'';

    if (val!==state.val) {
      return {
        val
      };
    }
    return null;
  }

  handleTextareaChanged = (event) => {
    let { updateState,fieldValMap,prefix,mramId } = this.props;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = event.target.value;
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      val:event.target.value
    });
    // updateState&&updateState({
    //   fieldValMap
    // });
  }

  handleTextareaBlur = () => {
    let { updateState,fieldValMap,prefix,mramId } = this.props;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = trim(fieldValObj.value);
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      val:fieldValObj.value
    });
    updateState&&updateState({
      fieldValMap
    });
  }

  render() {
    const {id='', classes, viewMode=false, maxLength } = this.props;
    let { val } = this.state;
    return (
      <div>
        <Typography
            id={`${id}_Textarea`}
            className={clsx(classes.textBox,{
              [classes.disabled]:viewMode
            })}
            component="textarea"
            onBlur={()=>{this.handleTextareaBlur();}}
            onChange={(e)=>{this.handleTextareaChanged(e);}}
            value={val}
            disabled={viewMode}
            maxLength={maxLength}
        />
      </div>
    );
  }
}

export default withStyles(styles)(TextareaField);
