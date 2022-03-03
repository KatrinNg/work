import React, { Component, useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import {fade, makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';

import {Box,Card, CardHeader, CardContent, CardActions} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputBase from '@material-ui/core/InputBase';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
//import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import  Button from '@material-ui/core/Button';
import  Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import accessRightEnum from '../../../../enums/accessRightEnum';
import { deleteSubTabsByOtherWay, updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';

const styles = (theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 150
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%'

  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%'
  },
  card: {
   // borderRadius: 0,
   // backgroundColor: theme.palette.primary.light,
   // color: theme.palette.primary.contrastText,
   boxShadow: 'none',
   border : 0,
   // height : '100%',
   overflow: 'auto'
  }
});

class DtsEditQualifierFields extends Component {
    constructor(props){
        super(props);

        this.state = {

          age:'',
          name: 'hai',
          labelWidth: 0,
          details: null,
          fdiToothNo: null,
          rctOption1: null,
          rctOption2: null,
          rctOption3: null,
          rctOption4: null,
          edit: false

        };
    }

    componentDidMount() {



        //this.initDoClose();
    }


    componentDidUpdate(prevProps) {

    }

    componentWillUnmount() {
        console.log('componentUnmount D');
    }

    handleChange = (name, event) => {
      this.setState({name: event.target.value});
      this.setState({edit:true});

    }


    onDetailsChange = (event, value) =>{
      this.setState({details: value});
      this.setState({edit:true});
      console.log('setDetails: ' + value);
    };

    onRCTOption1Change = (event, value)=>{
      this.setState({rctOption1: value});
      this.setState({edit:true});
    }

    onRCTOption2Change = (event, value) => {
      this.setState({rctOption2: value});
      this.setState({edit:true});
    }

    onRCTOption3Change = (event, value) => {
      this.setState({rctOption3: value});
      this.setState({edit:true});
    }


    onRCTOption4Change = (event, value)=>{
      this.setState({rctOption4: value});
      this.setState({edit:true});
    }




    onFDIToothChange = (event, value) => {

      this.setState({fdiToothNo: value});
      this.setState({edit:true});
    }


    doClose = (callback) => {
        if (this.state.edit) {
            this.props.openCommonMessage({
                msgCode: '110018',
                btnActions: {
                    btn1Click: () => {
                        callback(true);
                    }
                }
            });
        }
        else {
            callback(true);
        }
    }



    render(){
        const { classes, qualifierList, ...rest} = this.props;
        console.log('999', qualifierList);
        return(

          <Card classes={{ root: classes.card }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Root Canal Treatment</Typography>
              <FormGroup row style={{ width: '100%' }}>
                <FormControlLabel
                    control={<Switch checked={this.state.supernumerary} color="primary" name="supernumerary" />}
                    label="supernumerary"
                />
                <FormControl required className={classes.formControl} variant="outlined"  size="small">
                  <InputLabel htmlFor="fdiToothNo" >*FDI Tooth No.</InputLabel>
                  <Select
                      label="*FDI Tooth No."
                      value={this.state.fdiToothNo}
                      inputProps={{
                        name: 'fdiToothNo',
                        id: 'fdiToothNo'
                      }}
                      style={{width: '100%'}}
                      onChange={e => this.onFDIToothChange(e, e.target.value)}
                  >
                    <MenuItem value="" ></MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={35}>35</MenuItem>
                  </Select>
          {/*<FormHelperText>Required</FormHelperText>*/}
                </FormControl>
              </FormGroup>

              <FormGroup row style={{ width: '100%' }}>
                <FormControl required className={classes.formControl}  style={{ width: '100%' }} variant="outlined"  size="small">
                  <InputLabel htmlFor="rctprocedures" >RCT (Root canal treatment)/Pulp Tx Procedures</InputLabel>
                  <Select
                      value={this.state.fdiToothNo}
                      label="RCT (Root canal treatment)/Pulp Tx Procedures"
                      inputProps={{
                        name: 'rctprocedures',
                        id: 'rctprocedures'
                      }}
                      style={{width: '100%'}}
                      onChange={e => this.onRCTOption1Change(e, e.target.value)}
                  >
                    <MenuItem value="" >                                                          </MenuItem>
                    <MenuItem value={10}>Instrumentation completed - with stainless stell and NiTi Rotary files</MenuItem>
                    <MenuItem value={11}>Rubber dam applied;Access cavity opened; Canals indentified;</MenuItem>
                  </Select>
                  {/*<FormHelperText>Required</FormHelperText>*/}
                </FormControl>
              </FormGroup>

              <FormGroup row style={{ width: '100%' }}>
                <FormControl required className={classes.formControl} style={{ width: '100%' }} variant="outlined"  size="small">
                  <InputLabel htmlFor="rctprocedures" >RCT (Root canal treatment)/Pulp Tx Irrigation material</InputLabel>
                    <Select
                        required
                        value={this.state.fdiToothNo}
                        label="RCT (Root canal treatment)/Pulp Tx Irrigation material"
                        inputProps={{
                          name: 'rctprocedures',
                          id: 'rctprocedures'
                        }}
                        onChange={e => this.onRCTOption2Change(e, e.target.value)}
                        style={{width: '100%'}}
                    >
                      <MenuItem value=""></MenuItem>
                      <MenuItem value={10}>Sodium chlorite 0.9% sterile irrigation</MenuItem>
                      <MenuItem value={11}>Other irrigation (Please specify in the "Details" box)</MenuItem>
                </Select>
                {/*<FormHelperText>Required</FormHelperText>*/}
                </FormControl>
              </FormGroup>

              <FormGroup row style={{ width: '100%' }}>
                <FormControl required className={classes.formControl}  style={{ width: '100%' }}  variant="outlined"  size="small">
                  <InputLabel htmlFor="rctprocedures"  style={{width: '100%'}}>RCT (Root canal treatment)/Pulp Tx Medicaments/Dressing material</InputLabel>
                    <Select
                        value={this.state.fdiToothNo}
                        label="RCT (Root canal treatment)/Pulp Tx Medicaments/Dressing material"
                        inputProps={{
                          name: 'rctprocedures',
                          id: 'rctprocedures'
                        }}
                        style={{width: '100%'}}
                        onChange={e => this.onRCTOption3Change(e, e.target.value)}
                    >
                      <MenuItem value="">                                                                                </MenuItem>
                      <MenuItem value={10}>Calcium hydroxide paste - non-setting (e.g Hypocal)</MenuItem>
                      <MenuItem value={11}>Other medicaments or dressing materials (Please specify in the "Details" box)</MenuItem>
                    </Select>
                </FormControl>
              </FormGroup>

              <FormGroup row style={{ width: '100%' }}>
                <FormControl required className={classes.formControl}  style={{ width: '100%' }}  variant="outlined"  size="small">
                  <InputLabel htmlFor="rctprocedures"  style={{width: '100%'}}>Local Anaestheic / Medication</InputLabel>
                    <Select
                        value={this.state.fdiToothNo}
                        label="RCT (Root canal treatment)/Pulp Tx Medicaments/Dressing material"
                        inputProps={{
                          name: 'rctprocedures',
                          id: 'rctprocedures'
                        }}
                        style={{width: '100%'}}
                        onChange={e => this.onRCTOption4Change(e, e.target.value)}
                    >
                      <MenuItem value="">                                                                                </MenuItem>
                      <MenuItem value={10}>Infiltration - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)</MenuItem>
                      <MenuItem value={11}>Infiltration - Mepivacaine hydrochloride 3%</MenuItem>
                      <MenuItem value={12}>ID Block - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)</MenuItem>
                    </Select>
                    {/*<FormHelperText>Required</FormHelperText>*/}
                </FormControl>
              </FormGroup>

              <FormGroup row style={{ width: '100%' }}>
                <FormControl className={classes.formControl}>
                    {/* <TextareaAutosize

                        rowsMin={3}
                        style={{ width: '440px', fontSize: '18px' }}
                        aria-label="empty textarea" placeholder="Details"
                    /> */}
                  <CIMSMultiTextField
                      style={{ width: '440px' , fontSize: '18px'}}
                      id={'detailsTextField'}
                      label={'Details'}
                      rows={3}
                      value={this.state.details}
                      placeholder="Details"
                        //onChange={e => this.onNoteChange(e)}
                        //onBlur={e => this.onNoteBlur(e)}
                      onChange={e => this.onDetailsChange(e, e.target.value)}
                  />
                </FormControl>
              </FormGroup>

              <FormGroup row ></FormGroup>

            </CardContent>

            <CardActions disableSpacing>
              <div style={{ width: '100%' }}>
                <Box display="flex" p={1} >
                  <Box width="100%"><Button  edge="end"size="small" variant="contained">Save</Button></Box>
                  <Box flexShrink={0}><Button edge="start" size="small" variant="contained">Delete</Button></Box>
                </Box>
              </div>
            </CardActions>
          </Card>
        );
    }
}

const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);

    return {
      qualifierList: state.dtsProbProc.qualifierList
    };
};

const mapDispatchToProps = {
  updateCurTab,
  openCommonMessage
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEditQualifierFields));
