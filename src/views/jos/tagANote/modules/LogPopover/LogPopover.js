import React, { Component } from 'react';
import { withStyles, Popover, Divider, Grid } from '@material-ui/core';
import { styles } from './LogPopoverStyle';
import moment from 'moment';
import Enum from '../../../../../enums/enum';

class LogPopover extends Component {

  generateLog = () => {
    const { classes,logContents=[] } = this.props;
    let logElements = [];
    for (let i = 0; i < logContents.length; i++) {
      const noteLog = logContents[i];
      logElements.push(
        <div key={`note_log_${noteLog.logClinicalnoteId}`} className={classes.logContainer}>
          <Grid container>
            <Grid item xs={12}>
              <div>
                <label className={classes.logCreateUserLabel}>{noteLog.updateBy}</label>
                <label className={classes.logCreateDtmLabel}>{moment(noteLog.updateDtm).format(Enum.DATE_FORMAT_24_HOUR)}</label>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div>
                <pre className={classes.contentPre}>{noteLog.taganoteText}</pre>
              </div>
            </Grid>
          </Grid>
          <Divider />
        </div>
      );
    }
    return logElements;
  }

  render() {
    const { classes,isOpen,anchorEl,handlePopverClose,handlePopverExited } = this.props;
    return (
      <Popover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handlePopverClose}
          onExited={handlePopverExited}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
      >
        <div className={classes.wrapper}>
          {this.generateLog()}
        </div>
      </Popover>
    );
  }
}

export default withStyles(styles)(LogPopover);
