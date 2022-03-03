import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
//import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import  Button from '@material-ui/core/Button';
import  Paper from '@material-ui/core/Paper';
import  Grid from '@material-ui/core/Grid';
import  Box from '@material-ui/core/Box';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';


const styles = (theme) => ({
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  withoutLabel: {
    marginTop: theme.spacing(3)
  },
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  margin: {
    margin: theme.spacing(1)
  }
});

class DtsPerioChartField extends Component {

    constructor(props){
            super(props);
            this.state = {

              remarks: null
            };

        }

  onRemarksChange = (event, value) =>{

    this.setState({remarks:value});
    console.log('setRemarks: ' + value);
  };


      render(){
        const { classes, ...rest } = this.props;

        return (

            <div className={classes.root}>
              <Grid container spacing={1}>
                <Grid item xs={6} >
                  <Box style={{ width: '100%' }} mx="auto" >
                    <Box  display="flex" flexDirection="row" m={0} pb={1} >
                      <Box p={0} m={0} >
                        <Button variant="contained" size="small">Go to chart bleeding</Button>
                      </Box>
                      <Box  pl={0.5} m={0} >
                        <Button variant="contained" size="small">Nil</Button>
                      </Box>
                      <Box pl={0.5} m={0} >
                        <Button variant="contained" size="small">4</Button>
                      </Box>
                        <Box pl={0.5} m={0}>
                      <Button variant="contained" size="small">5</Button>
                      </Box>
                        <Box pl={0.5} m={0}>
                      <Button variant="contained" size="small">6</Button>
                      </Box>
                      <Box  pl={0.5} m={0} >
                        <Button variant="contained" size="small">7</Button>
                      </Box>
                    </Box>
                    <Box  display="flex" flexDirection="row"  m={0} >
                      <Box  p={0} >
                        <Button variant="contained" size="small">Go to chart pocket</Button>
                      </Box>
                      <Box   pl={0.5}>
                        <Button variant="contained" size="small">8</Button>
                      </Box>
                      <Box  pl={0.5}>
                        <Button variant="contained" size="small">9</Button>
                      </Box>
                        <Box  pl={0.5}>
                      <Button variant="contained" size="small">10</Button>
                      </Box>
                        <Box   pl={0.5}>
                      <Button variant="contained" size="small">+</Button>
                      </Box>
                    </Box>
                  </Box>

                </Grid>
                <Grid item xs={6}>
                    <FormGroup row style={{ width: '100%' }}>
                      <FormControl className={classes.formControl}>
                        {/* <TextareaAutosize
                            rowsMin={10}
                            style={{ width: '440px' }}
                            aria-label="empty textarea" placeholder="Remarks"
                        /> */}
                        <CIMSMultiTextField
                            style={{ width: '440px'}}
                            id={'remarksTextField'}
                            label={'Remarks'}
                            rows={3}
                            value={this.state.remarks}
                            placeholder="Remarks"
                            onChange={e => this.onRemarksChange(e, e.target.value)}
                        />
                        </FormControl>
                    </FormGroup>

                    <Box display="flex" flexDirection="row"  m={1} >
                      <Box  p={0} >
                        <Button variant="contained" size="small">View previous charts</Button>
                      </Box>
                      <Box   pl={0.5}>
                        <Button variant="contained" size="small">Blank Chart</Button>
                      </Box>
                      <Box  pl={0.5}>
                        <Button variant="contained" size="small">New Chart</Button>
                      </Box>
                    </Box>
                </Grid>
              </Grid>
            </div>
        );
  }
}

const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);

    return {

    };
};

const mapDispatchToProps = {

};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPerioChartField));

