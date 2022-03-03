import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './NormalTextFieldStyle';
import { TextField } from '@material-ui/core';
import * as generalUtil from '../../utils/generalUtil';

class NormalTextField extends Component {
  constructor(props){
    super(props);
    this.state={
      val:''
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

  handleYearChanged = (event, type) => {
    let { updateState,fieldValMap,prefix,mramId} = this.props;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = event.target.value;
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      val:event.target.value
    });
    type && updateState&&updateState({
      fieldValMap
    });
  }

  render() {
    const { id='', classes, maxLength, viewMode=false, placeholder =''} = this.props;
    let { val } = this.state;
    let inputProps = {
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
              value={val}
              disabled={viewMode}
              InputProps={{
                className: classes.abnormal,
                classes: {
                  input: classes.input,
                  disabled: classes.disabled
                }
              }}
              onChange={event => {this.handleYearChanged(event);}}
              onBlur={event => {this.handleYearChanged(event,'blur');}}
              placeholder={placeholder}
              {...inputProps}
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(NormalTextField);
