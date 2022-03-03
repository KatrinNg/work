import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import NativeSelect from "@material-ui/core/NativeSelect";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import { withStyles } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CIMSButton from '../../../../../components/Buttons/CIMSButton';

import PerioDraw from "./PerioDraw";

const styles = (theme) => ({
    root: {
        width: "100%",
        overflow: "initial",
        fontFamily: "Microsoft JhengHei, Calibri",
        backgroundColor:"#F8F8F840",
        color: '#404040'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 10
    },
    formHelperText: {
        padding: "0 0 0 0"
    },
    formControlLabel: {
        padding: "0 0 0 0"
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
        padding: "0 0 0 10px"
    },
    formLabel: {
        padding: "30px 0 0 0"
    },
    textField: {
        width: 500
    },
    button: {
        borderRadius: 10,
        backgroundColor:"#e0e0eb"
    },
    font: {
      fontFamily: 'Microsoft JhengHei, Calibri',
      fontSize: '12pt',
      color: '#404040'
    }
});

class PerioDrawControl extends Component {

  constructor(props){
    super(props);
    this.state = {
        selToothNum: "",
        selEPT: "",
        selMob: ""
      };
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
  }

  render(){
    const {pdState, selToothNum, selEPT, selMob, handleClick, handleClickDrawConfirm, handleClickDrawReset, handleChangeEPT, handleChangeMob, handleChangeToothNum, handleChangeNCCheck, isExtract, isNC, classes} = this.props;

    const listToothNum = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28", "48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];
    const listEPT = [{id: 1, name: "+ve"}, {id: 2, name: "-ve"}, {id: 0, name: "Nil"}];
    const listMob = [{id: 1, name: "I"}, {id: 2, name: "II"}, {id: 3, name: "III"}, {id: 0, name: "Nil"}];
    
    let selectListToothNum = listToothNum.map((item, i) => {
        return (<option key={i} value={i}>{item}</option>);
    });

    let radioListEPT = listEPT.map((item, i) => {
        return (<FormControlLabel key={i} labelPlacement="start" disabled={isNC} value={item.id} control={<Radio />} label={item.name} />);
    });

    let radioListMob = listMob.map((item, i) => {
        return (<FormControlLabel key={i} labelPlacement="start" disabled={isNC} value={item.id} control={<Radio />} label={item.name} />);
    });

    const largeDraw = 3;
    const td_furc= {
        verticalAlign: "top"
    };
    const td_remarks = {
        verticalAlign: "top",
        padding: "20px 0 0 0px",
        fontFamily: 'Microsoft JhengHei, Calibri',
        fontSize: '12pt',
        color: '#404040'
    };
    return (
        <div>
            <table>
                <tr>
                <td>
                <FormControl className={classes.formControl}>
                    <table>
                    <tr>
                    <FormLabel className={classes.font}>Tooth Number:</FormLabel>
                    <NativeSelect className={classes.selectEmpty} value={selToothNum} name="toothNumSelect" onChange={handleChangeToothNum} inputProps={{ "aria-label": "age" }} >
                        {selectListToothNum}
                    </NativeSelect>
                    </tr>
                    </table>
                    <FormLabel className={classes.font}>EPT:</FormLabel>
                    <RadioGroup name="eptRadio" value={selEPT} onChange={handleChangeEPT} row aria-label="position">
                        {radioListEPT}
                    </RadioGroup>
                    <FormLabel className={classes.font}>Mobility:</FormLabel>
                    <RadioGroup name="mobRadio" value={selMob} onChange={handleChangeMob} row aria-label="position">
                        {radioListMob}
                    </RadioGroup>
                    <FormLabel className={classes.font}>Disable:</FormLabel>
                    <FormGroup aria-label="position" row>
                        <FormControlLabel checked={isNC} onChange={handleChangeNCCheck} className={classes.formControlLabel} value="start" control={<Checkbox />} label={<Typography className={classes.font}>NOT CHART (NC)</Typography>} labelPlacement="start" />
                    </FormGroup>
                </FormControl>
                </td>
                <td style={td_furc}>
                    <Grid className={classes.formLabel}><FormLabel className={classes.font}>Furcation:</FormLabel><PerioDraw border="1" scale={largeDraw} pdState={pdState} handleClick={handleClick} isExtract={isExtract}  /></Grid>
                </td>
                <td style={td_remarks}>
                    <TextField
                        id="perioChart-textArea-Remark-id"
                        label="Remarks"
                        type="text"
                        multiline
                        variant="outlined"
                        className={classes.textField}
                        rows={8}
                        rowsMax={8}
                    />
                </td>
                </tr>
                <tr>
                <td></td>
                <td align="right">
                    <CIMSButton onClick={handleClickDrawConfirm}>Confirm</CIMSButton>
                    <CIMSButton onClick={handleClickDrawReset}>Reset</CIMSButton>
                </td>
                <td align="right">
                    {/* <CIMSButton >Save</CIMSButton> */}
                </td>
                </tr>
            </table>
        </div>
    );
  }
}

export default withStyles(styles)(PerioDrawControl);