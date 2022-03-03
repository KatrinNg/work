import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText, MenuItem } from '@material-ui/core';
import {styles} from './DropdownFieldStyle';

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
    const { activeList } = this.props;
    let tempDropList = activeList;
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
    let inputProps = {
      inputProps: {
        className:classes.inputProps
      }
    };
    return (
      <div>
        <TextField
            className={classes.dropdown}
            id={`manage_instruction_dropdown_${id}`}
            autoCapitalize="off"
            select
            error={formRequireFlag?true:false}
            value={value||''}
            onChange={event => {this.handleChange(event);}}
            {...inputProps}
        >
          {filterDropList.map(option => (
            <MenuItem key={option.activeCode} value={option.activeCode+''}>
              {option.activeValue}
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
