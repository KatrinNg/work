import React, { Component, createRef } from 'react';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import SelectBox from '../SelectBox/SelectBox';
import { styles } from './FilterStyles';
import { FormGroup, FormControl, FormControlLabel, TextField, Grid, InputLabel, Form, Typography,FormHelperText,ErrorOutline } from '@material-ui/core';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import _ from 'lodash';
import { getState } from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiPaper:{
      root:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiInputBase: {
      ...theme.overrides.MuiInputBase,
      root: {
        height: 39,
        color:color.cimsTextColor
      },
      input:{
        padding:'0px 10px'
      }
    },
    MuiPickersCalendarHeader:{
      iconButton:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiFormLabel:{
      root:{
        color: color.cimsPlaceholderColor
      }
    },
    MuiInputLabel: {
      shrink: {
        color: `${color.cimsLabelColor} !important`
      }
    },
    MuiFormControlLabel:{
      label:{
        MuiDisabled:{
          color: color.cimsPlaceholderColor
        }
      }
    },
    MuiFormHelperText: {
      root: {
        fontSize: 12,
        color: 'red',
        error: {
          padding: 2
        }
      }
    }
  }
});

class Filter extends Component {
  constructor(props){
    super(props);
    this.state = {
      refNoVal:'',
      PMIVal:''
    };
  }

  handleChangeText = (event,inputName) => {
    let pattern = /^\d{0,10}$/;
    if (inputName=='PMI' && pattern.test(event.target.value)) {
      this.setState({ PMIVal: event.target.value });
    }else if(inputName=='RefNo'){
      this.setState({ refNoVal: event.target.value });
    }
  }
  handleBlur=(event,inputName)=>{
    let value = _.trim(event.target.value);
    if (inputName=='PMI') {
      this.setState({ PMIVale: value });
    }else if(inputName=='RefNo'){
      this.setState({ refNoVal: value});
    }
  }
  hangdleFormSubmit = e => {
    let { onSearch, options} = this.props;
    let { actionBy }=options;
    e.preventDefault();
    let params = {};
    let form = e.target;
    for (let index = 0; index < form.length; index++) {
      const element = form[index].name;
      if (element) {
        params[element] = form[element].value;
      }
    }
    params.action = params.action == 'All' ? '' : params.action;
    params.actionBy = params.actionBy == 'All' ? '' : params.actionBy;
    let resUserName =actionBy.find((item)=> { if(params.actionBy != ''){return params.actionBy==item.value;}});
    params.userName=!resUserName?'':resUserName.title;
    onSearch && onSearch(params);
  }

  handleBack = () => {
    const { handleBack } = this.props;
    handleBack && handleBack();
  }
  render() {
    const { refNoVal,PMIVal } = this.state;
    const { options, classes} = this.props;
    const { actionBy = [],actionDrop = []} = options;
    return (
      <MuiThemeProvider theme={customTheme}>
        <form onSubmit={this.hangdleFormSubmit}>
          <Typography component="div" style={{padding:'20px 0'}}>
            <Grid style={{display:'flex', alignItems:'center'}} >
              <Grid className={classes.center} style={{ width:'15%'}}>
                <span>Action:</span>
                <FormControl style={{flex:1}}>
                  <SelectBox
                      id="action"
                      height={39}
                      name="action"
                      labelId="action"
                      options={actionDrop}
                      classes={classes}
                  />
                </FormControl>
              </Grid>
              <Grid className={classes.center} style={{ width:'15%'}}>
                <span>Action By:</span>
                <FormControl style={{flex:1}}>
                  <SelectBox
                      id="actionBy"
                      height={39}
                      name="actionBy"
                      labelId="form-screening-label"
                      options={actionBy}
                  />
                </FormControl>
              </Grid>
              <Grid className={classes.center} style={{ width:'15%'}}>
                <span>PMI:</span>
                <TextField
                    id="gsc-input-PMI"
                    name="pmi"
                    value={PMIVal}
                    minWidth="80%"
                    onChange={e => this.handleChangeText(e,'PMI')}
                    onBlur={e => this.handleBlur(e,'PMI')}
                    variant={'outlined'}
                    style={{flex:1}}
                />
              </Grid>
              <Grid className={classes.center} style={{ width:'15%'}}>
                <span>Ref No.:</span>
                <Grid style={{flex:1}}>
                    <TextField
                        id="gsc-input-RefNo"
                        name="refNo"
                        value={refNoVal}
                        minWidth="75%"
                        onChange={e => this.handleChangeText(e,'RefNo')}
                        onBlur={e => this.handleBlur(e,'RefNo')}
                        variant={'outlined'}
                        style={{flex:1}}
                    />
                </Grid>
              </Grid>
              <Grid style={{ width:'20%',paddingLeft:40}}>
                <CIMSButton id="Filter" maxWidth="6%" style={{ width: '30%' }} type={'submit'} variant="contained" color="primary">Search</CIMSButton>
                <CIMSButton id="Filter" maxWidth="6%" style={{ width: '30%' }} type={'button'} variant="contained" color="primary" onClick={this.handleBack}>Back</CIMSButton>
              </Grid>
            </Grid>
          </Typography>
        </form>
      </MuiThemeProvider>
    );
  }
}

export default (withStyles(styles)(Filter));

