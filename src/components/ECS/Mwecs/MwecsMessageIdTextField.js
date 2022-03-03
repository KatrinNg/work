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

class MwecsMessageIdTextField extends Component {
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

  getDetailArray(mwecsStore){
    let result = [];
    const getDetailObj = (key, value) => {return {label:key, desc: value};};

    const toValueIfValid = (mwecsStore, value) => { return value;};
    result.push(getDetailObj('Last Checked Date & Time:' , mwecsStore.lastCheckedTime));

    if(!mwecsStore.isInitState){
        result.push(getDetailObj('Message ID:' , toValueIfValid(mwecsStore, mwecsStore.messageId)));
        result.push(getDetailObj('HKID/Doc ID:' , toValueIfValid(mwecsStore, mwecsStore.originalDocNo)));
        result.push(getDetailObj('Result:' , mwecsStore.result));
        result.push(getDetailObj('Recipient Name:' , toValueIfValid(mwecsStore, mwecsStore.recipientName)));
    }

    return result;
  }

  getMwecsDisplayTextFromStore(mwecsStore){
    return mwecsStore.messageId? mwecsStore.messageId: '';
}

  render() {
    const {
      classes,
      mwecsStore,
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
    const textFieldVal = this.getMwecsDisplayTextFromStore(mwecsStore);
    const detailArray = this.getDetailArray(mwecsStore);
    return (
      <>
      <Popover
          id={`${parentPageName}_mwecs_result_popover`}
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
            id={`${parentPageName}_mwecs_message_id_textfield`}
            variant="outlined"
            label={'Medical Waiver (Message ID)'}
            value={textFieldVal}
            helperText={helperText}
            InputProps={{
              endAdornment:
              mwecsStore.isInitState?<></>:
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
export default withStyles(style)(MwecsMessageIdTextField);
