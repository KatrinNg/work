import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import {FormControl, Select, InputLabel, FormHelperText} from '@material-ui/core';
import { 
  preBPEInputId,
  prePCAInputId
 } from './common/AssessmentUnit.js';

const styles = (theme) => ({
  formControl: {
    height: 40,
    margin: theme.spacing(1),
    width: 130
  }
});

class AssessmentBox extends Component {

  constructor(props){
    super(props);

    this.state = {
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (this.props.input_disable) {
      let i;
      for (i = 0; i < 6; i++) {
        document.getElementById(preBPEInputId + '_' + (i + 1)).disabled = true;
        document.getElementById(prePCAInputId + '_' + (i + 1)).disabled = true;
      }
    }
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
  }

  render(){

    const { headerIn, headerSel, indexS, input_length, input_mandate = false, Input_preId, input_error = false, input_handleChange, input_disable, preSelectId, 
      selectOne_data, selectOne_sel, selectOne_value, selectOne_label, selectOne_mandate = false, selectOne_error = false, selectOne_disable,
      selectTwo_data, selectTwo_sel, selectTwo_value, selectTwo_label, selectTwo_mandate = false, selectTwo_error = false, selectTwo_disable, 
      classes } = this.props;

    let backColor;
    let fColor = "black";
    
    if (input_disable) {
      backColor = '#bfbfbf';
      fColor = "#666666";
    }

    const input_s = {
      height: 50,
      width: 80,
      borderRadius: "4px",
      borderColor: "rgba(0, 0, 0, 0.54)",
      fontSize: 24,
      textAlign: "center",
      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
      color: fColor,
      backgroundColor: backColor
    };

    const hd_s = {
      fontFamily: "Microsoft JhengHei, Calibri",
      color: "rgba(0, 0, 0, 0.54)",
      fontSize: "1rem",
      fontWeight: "600"
    };

    const sixInErr_s = {
      fontFamily: "Microsoft JhengHei, Calibri",
      color: "red",
      fontSize: "1rem",
      fontWeight: "600"
    };

    let txtInMand = (input_mandate) ? " *" : "";
    let txtsel1Mand = (selectOne_mandate) ? " *" : "";
    let txtsel2Mand = (selectTwo_mandate) ? " *" : "";

    const content = (
      <table>
        <tr style={hd_s}><td colSpan="3">{headerIn + txtInMand}</td><td>{headerSel}</td></tr>
        <tr>
          <td><input type="text" id={Input_preId + "_1"} onChange={e => input_handleChange(e.target.id)} tabIndex={indexS + 1} maxLength={input_length} style={input_s} /></td>
          <td><input type="text" id={Input_preId + "_2"} onChange={e => input_handleChange(e.target.id)} tabIndex={indexS + 2} maxLength={input_length} style={input_s} /></td>
          <td><input type="text" id={Input_preId + "_3"} onChange={e => input_handleChange(e.target.id)} tabIndex={indexS + 3} maxLength={input_length} style={input_s} /></td>
          <td>
            <FormControl variant="outlined" className={classes.formControl} error={selectOne_error}>
            <InputLabel>{selectOne_label + txtsel1Mand}</InputLabel>
            <Select
                id={preSelectId + "_1"}
                value={selectOne_value}
                name={preSelectId + "_1"}
                label={selectOne_label}
                variant="outlined"
                disabled={selectOne_disable}
                onClick={selectOne_sel}
                onChange={selectOne_sel}
                inputProps={{tabIndex: indexS + 7, id: preSelectId + "_1"}}
                >
                {selectOne_data.map((d) => (
                  <MenuItem key={d.value} value={d.value}> {d.label} </MenuItem>
                ))}
                </Select>
                {selectOne_error && selectOne_mandate && <FormHelperText>This is required!</FormHelperText>}
            </FormControl>
          </td>
        </tr>
        <tr>
          <td><input type="text" id={Input_preId + "_6"} onChange={e => input_handleChange(e.target.id)} tabIndex={indexS + 6} maxLength={input_length} style={input_s} /></td>
          <td><input type="text" id={Input_preId + "_5"} onChange={e => input_handleChange(e.target.id)} tabIndex={indexS + 5} maxLength={input_length} style={input_s} /></td>
          <td><input type="text" id={Input_preId + "_4"} onChange={e => input_handleChange(e.target.id)} tabIndex={indexS + 4} maxLength={input_length} style={input_s} /></td>
          <td>
            <FormControl variant="outlined" className={classes.formControl} error={selectTwo_error}>
              <InputLabel>{selectTwo_label + txtsel2Mand}</InputLabel>
              <Select
                  id={preSelectId + "_2"}
                  value={selectTwo_value}
                  name={preSelectId + "_2"}
                  label={selectTwo_label}
                  variant="outlined"
                  disabled={selectTwo_disable}
                  onClick={selectTwo_sel}
                  onChange={selectTwo_sel}
                  inputProps={{tabIndex: indexS + 8, id: preSelectId + "_2"}}
                  >
                  {selectTwo_data.map((d) => (
                    <MenuItem key={d.value} value={d.value}> {d.label} </MenuItem>
                  ))}
                  </Select>
                  {selectTwo_error && selectTwo_mandate && <FormHelperText>This is required!</FormHelperText>}
            </FormControl>
          </td>
        </tr> 
        <tr><td colSpan={3} style={sixInErr_s}>{input_error && input_mandate && <FormHelperText><td style={sixInErr_s}>BPE six Inputs are required!</td></FormHelperText>}</td></tr>
      </table>
    );

    return (
      <div>
        {content}
      </div>
    );
  }
}

export default withStyles(styles)(AssessmentBox);