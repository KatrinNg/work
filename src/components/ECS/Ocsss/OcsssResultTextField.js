import React, { Component } from 'react';
import CIMSTextField from '../../TextField/CIMSTextField';
import * as ecsUtil from '../../../utilities/ecsUtilities';
import InfoIcon from '@material-ui/icons/Info';

import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import {
  // ListItemText,
  // ListItem,
  // List,
  Popover,
  Paper,
  TextField,
  Grid,
  Box
} from '@material-ui/core';

import { withStyles  } from '@material-ui/core/styles';


const style ={
  root: {
    flexGrow: 1,
    width: '200px'
  },
  popover: {
    pointerEvents: 'none'
  },
  paper: {
    padding: '12px',
    textAlign: 'center'
  },
  leftTypo:{
    textAlign: 'right',
    fontSize: '12px',
    color: 'black'
  },
  rightTypo:{
    fontSize: '12px',
    paddingLeft: '12px',
    textAlign: 'center',
    color: 'black'
  }
};

class OcsssResultTextField extends Component {
  constructor(props) {
    super(props);
    this.state = {

      popoverFlag: false
    };
  }

  setPopover(boolVal) {
    this.setState({popoverFlag: boolVal});
  }

  handlePopoverOpen = event => {
    this.setPopover(event.currentTarget);
  };

  handlePopoverClose = () => {
    this.setPopover(null);
  };

  getDetailArray(ocsssStore){
    const getDetailObj = (key, value) => {return {label:key, desc: value};};
    const toValueIfValid = (ocsssStore, value) => { return ocsssStore.isValid ? value : '-';};

    let result = [];

    result.push(getDetailObj('Last Checked Date & Time:' , ocsssStore.lastCheckedTime));
    result.push(getDetailObj('Checking Result:' , ocsssStore.checkingResult));
    result.push(getDetailObj('Message Id:' , ocsssStore.messageId));

    if(!ocsssStore.isValid){
        result.push(getDetailObj('Error Message:', ocsssStore.errorMessage));
    }

    return result;
  }

  getOcsssDisplayTextFromStore(ocsssStore){
    let result = '';
    if(!ocsssStore.isInitState){
        if(ocsssStore.checkingResult === 'Y'){
            result = 'Valid.';
        } else if(ocsssStore.checkingResult === 'N') {
            result = 'Invalid';
        } else if(ocsssStore.checkingResult === 'E') {
            result = `Service Error. (Message ID: ${ocsssStore.messageId})`;
        }
    }
    return result;
}

  render() {
    const {
      classes,
      ocsssStore,
      parentPageName = '',
      anchorOrigin={
        vertical: 'top',
        horizontal: 'right'
      },
      transformOrigin={
        vertical: 'bottom',
        horizontal: 'center'
      },
      helperText='',
      ...rest} = this.props;
    const open = Boolean(this.state.popoverFlag);
    const textFieldVal = this.getOcsssDisplayTextFromStore(ocsssStore);
    const detailArray = this.getDetailArray(ocsssStore);
    return (
      <>
      <Popover
          id={`${parentPageName}_ocsss_result_popover`}
          anchorOrigin={anchorOrigin}
          anchorEl={this.state.popoverFlag}
          transformOrigin={transformOrigin}
          className={classes.popover}
          classes={{
            paper: classes.paper
          }}
          open={open}
          onClose={e=> this.handlePopoverClose(e)}
          disableRestoreFocus
      >

      <div className={classes.root}>
      <Grid container spacing={1}>
          {
            detailArray.map(
              (item, index) => {
                return (
                  <Grid key={`${item.label}_detail_key`} container item xs={12}>
                    <Grid container item xs={7} alignItems="center" justify="flex-end">
                      <Typography className={classes.leftTypo}>
                        {item.label}
                      </Typography>
                    </Grid>
                    <Grid container item xs={5} alignItems="center" justify="center">
                      <Typography className={classes.rightTypo}>
                        {item.desc}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              }
            )
          }

      </Grid>
    </div>
      </Popover>
        <CIMSTextField
            disabled
            id={`${parentPageName}_ocsss_result_textfield`}
            variant="outlined"
            value={textFieldVal}
            title={textFieldVal}
            //helperText={!ocsssStore.isInitState && !ocsssStore.isValid?'Note - Please double check if the patient\'s HKIC does contain "C" or "U" symbol before charging NEP fee':''}
            label={'OCSSS Result'}
            InputProps={{
              endAdornment:
              ocsssStore.isInitState?<></>:
                    <InputAdornment position="end">
                    <InfoIcon
                        aria-owns={open ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true"
                        onMouseEnter={e => this.handlePopoverOpen(e)}
                        onMouseLeave={e => this.handlePopoverClose(e)}
                    ></InfoIcon>

                    </InputAdornment>
            }}
            {...rest}
        >

        </CIMSTextField>
      </>
    );
  }
}
export default withStyles(style)(OcsssResultTextField);
