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
    width: '250px'
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
    textAlign: 'center',
    paddingLeft: '12px',
    color: 'black'
  }
};

class EcsResultTextField extends Component {
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

  getEcsDisplayTextFromStore = (ecsStore) => {
    let org = '';
    let eligibleMedicalStr = 'N';
    let eligibleDentalStr = 'N';
    if(ecsStore){
        let eligibleIndex = ecsUtil.getEligibleIndexFromEcsResult(ecsStore);
        if(ecsStore.hkId === ''){
            return '';
        }
        if(eligibleIndex == 0){
            return 'Invalid.';
        }
        org = ecsStore['svrOrg'+eligibleIndex];
        eligibleMedicalStr = ecsStore['eligibleMedical'+eligibleIndex];
        eligibleDentalStr = ecsStore['eligibleDental'+eligibleIndex];
    } else {
        return '';
    }

    return `${org}. Medical: ${eligibleMedicalStr}, Dental: ${eligibleDentalStr}`;
};

  getDetailArray(ecsStore){
    let result = [];
    if(ecsStore){
      const resultIndex = ecsUtil.getEligibleIndexFromEcsResult(ecsStore);
      const getDetailObj = (key, value) => {return {label:key, desc: value};};
      const toValueIfValid = (ecsStore, value) => { return ecsStore.isValid ? value : '-';};
      result.push(getDetailObj('Last Checked Date & Time:' , ecsStore.lastCheckedTime));

      if(ecsStore.isAssoicated){
        result.push(getDetailObj('Associated HKID:' , ecsStore.hkId));
      }

      result.push(getDetailObj('Serving Organisation:' , toValueIfValid(ecsStore, ecsStore[`svrOrg${resultIndex}`])));
      result.push(getDetailObj('Serving Institution:' , toValueIfValid(ecsStore, ecsStore[`svrInt${resultIndex}`])));
      result.push(getDetailObj('Eligible for Medical:' , toValueIfValid(ecsStore, ecsStore[`eligibleMedical${resultIndex}`])));
      result.push(getDetailObj('Eligible for Dental:' , toValueIfValid(ecsStore, ecsStore[`eligibleDental${resultIndex}`])));
      result.push(getDetailObj('Returned Name:' , ecsStore.englishName === '' || ecsStore.translatedName === '' ? '-' : (ecsStore.englishName === '' ?  ecsStore.translatedName : ecsStore.englishName)));
      result.push(getDetailObj('Eligible Staff Indicator:' , toValueIfValid(ecsStore, ecsStore[`eligibleStaff${resultIndex}`])));
      result.push(getDetailObj('In-Service:' , toValueIfValid(ecsStore, ecsStore[`inServe${resultIndex}`])));
    }
   return result;
  }

  render() {
    const {
      classes,
      ecsStore,
      parentPageName = '',
      anchorOrigin={
        vertical: 'top',
        horizontal: 'right'
      },
      transformOrigin={
        vertical: 'bottom',
        horizontal: 'center'
      },
      ...rest} = this.props;
    const open = Boolean(this.state.popoverFlag);

    let detailArray = this.getDetailArray(ecsStore);

    const displayText = this.getEcsDisplayTextFromStore(ecsStore);
    return (
      <>
      <Popover
          id={`${parentPageName}_ecs_result_popover`}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          className={classes.popover}
          anchorEl={this.state.popoverFlag}
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
            variant="outlined"
            title={displayText}
            value={displayText}
            label={'ECS Result'}
            InputProps={{
              endAdornment:
                    ecsStore.isInitState?<></>:
                    <InputAdornment position="end">
                    <InfoIcon
                        ref="infoIcon"
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
export default withStyles(style)(EcsResultTextField);
