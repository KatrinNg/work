import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText, MenuItem, MenuList } from '@material-ui/core';
import {styles} from './DropdownFieldStyle';
import { findIndex } from 'lodash';

class DropdownField extends Component {
  constructor(props){
    super(props);
    this.state = {
      filterDropList:[]
    };
  }

  componentDidMount(){
    //filter
    let tempDropList = this.filterDropdownOptions();
    this.setState({
      filterDropList:tempDropList
    });
  }

  filterDropdownOptions = () => {
    const { originDropList,dataList } = this.props;
    let tempDropList = [];
    originDropList.forEach(obj => {
      let index = findIndex(dataList,(dataObj)=>{
        return dataObj.codeIoeFormId === obj.codeIoeFormId;
      });
      if (index === -1) {
        tempDropList.push(obj);
      }
    });
    return tempDropList;
  }

  handleChange = event => {
    const { valueChange,updateState } = this.props;
    let value = event.target.value;
    let formRequireFlag = false;
    // check empty
    formRequireFlag = value === ''?true:false;
    updateState&&updateState({
      formRequireFlag
    });
    valueChange&&valueChange(value);
  }

  render() {
    const {
      classes,
      value,
      id='',
      formRequireFlag=false
    } = this.props;
    let { filterDropList } = this.state;
    return (
      <div>
        <TextField
            className={classes.dropdown}
            id={`turnaround_time_dropdown_${id}`}
            autoCapitalize="off"
            select
            error={formRequireFlag?true:false}
            value={value||''}
            onChange={event => {this.handleChange(event);}}
        >
          {filterDropList.map(option => (
            <MenuItem className={classes.menuListRoot} key={option.codeIoeFormId} value={option.codeIoeFormId}>
              {option.nameAndNum}
            </MenuItem>
          ))}
        </TextField>
        <FormHelperText
            error
            classes={{
              'error':classes.errorHelper
            }}
        >
          {formRequireFlag?'This field is required.':null}
        </FormHelperText>
      </div>
    );
  }
}

export default withStyles(styles)(DropdownField);
