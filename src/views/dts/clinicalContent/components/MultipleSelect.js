import React, { Component } from 'react';
import {Select,MenuItem,Checkbox,ListItemText} from '@material-ui/core';

class MultipleSelect extends Component {
  constructor(props) {
    super(props);
    let { value=[] } = props;
    this.state = {
      options: [],
      optionVals: value,
      defaultValue:'All'
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.optionVals) {
      this.setState({
        optionVals: nextProps.value
      });
    }
  }

  handleChange=(event)=>{
    const { onChange } = this.props;
    // let { defaultValue, options } = this.state;
    let value = event.target.value||[];




    if(typeof value[0] == 'undefined'){

            value.splice(0, 1);


      }
       onChange&&onChange(value);
    this.setState({optionVals:value});
  }

  render() {
    // const { classes } = this.props;
    const { id='', options=[] } = this.props;
    let { optionVals } = this.state;

    return (
      <Select
          id={`mutiple_checkbox_select_${id}`}
          multiple
          value={optionVals}
          onChange={this.handleChange}
          renderValue={selected => selected.join(', ')}
          variant="outlined"
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.label}>
            <Checkbox id={'note_type_mutiple_checkbox_'+option} color="primary" checked={optionVals.indexOf(option.label) > -1} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    );
  }
}

export default MultipleSelect;