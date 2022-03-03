import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './NameTextFieldStyle';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import { Person } from '@material-ui/icons';
import * as generalUtil from '../../utils/generalUtil';
import { connect } from 'react-redux';
import { trim } from 'lodash';

class NameTextField extends Component {
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

  handleNameChanged = (event) => {
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

  handleNameBlur = () => {
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

  handleNameIconClicked = () => {
    let { loginInfo,updateState,fieldValMap,prefix,mramId } = this.props;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    let value = loginInfo.userDto.salutation?`${loginInfo.userDto.salutation} ${loginInfo.userDto.engSurname} ${loginInfo.userDto.engGivName}`:`${loginInfo.userDto.engSurname} ${loginInfo.userDto.engGivName}`;
    fieldValObj.value = value;
    this.setState({ val:value });
    generalUtil.handleOperationType(fieldValObj);
    updateState&&updateState({
      fieldValMap
    });
  }

  render() {
    const { id='',classes,viewMode } = this.props;
    let { val } = this.state;
    return (
      <div>
        <TextField
            id={`${id}_input`}
            variant="outlined"
            className={classes.textField}
            value={val}
            disabled={viewMode}
            InputProps={{
              classes:{ input: classes.input },
              className: classes.paddingRightNone,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                      id={`${id}_icon`}
                      onClick={()=>{this.handleNameIconClicked();}}
                  >
                    <Person />
                  </IconButton>
                </InputAdornment>
              )
            }}
            onChange={(e)=>{this.handleNameChanged(e);}}
            onBlur={this.handleNameBlur}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginInfo: state.login.loginInfo
  };
};

// const mapDispatchToProps = {
// };

export default connect(mapStateToProps)(withStyles(styles)(NameTextField));
