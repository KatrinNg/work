import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, DialogActions, Grid, Typography } from '@material-ui/core';
import { styles } from './LogDialogStyle';
import Draggable from 'react-draggable';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import OccupationalTable from '../OccupationalTable/OccupationalTable';
import OthersTable from '../OthersTable/OthersTable';
import * as constants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import SmokingTable from '../SmokingTable/SmokingTable';
import PassiveTable from '../PassiveTable/PassiveTable';
import DrinkingTable from '../DrinkingTable/DrinkingTable';
import SubstanceAbuseTable from '../SubstanceAbuseTable/SubstanceAbuseTable';
import ProblemLogTable from '../ProblemLogTable/ProblemLogTable';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e)=> e.target.getAttribute('customlogdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class LogDialog extends Component {

  handleOK = () => {
    const { handleLogOK } = this.props;
    handleLogOK&&handleLogOK();
  }

  renderTable = () => {
    const { dataList, type, serviceList, dropdownOption } = this.props;
    let tableProps = {
      type,
      dataList,
      serviceList,
      dropdownOption,
      viewMode:true
    };
    let tableElement = null;
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY:
        tableElement = (<OccupationalTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS:
        tableProps.prefix = 'social';
        tableElement = (<OthersTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS:
        tableProps.prefix = 'occupation';
        tableElement = (<OthersTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS:
        tableProps.prefix = 'family';
        tableElement = (<OthersTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING:
        tableElement = (<SmokingTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING:
        tableElement = (<DrinkingTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE:
        tableElement = (<SubstanceAbuseTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS:
        tableElement = (<ProblemLogTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL:
        tableElement = (<ProblemLogTable {...tableProps} />);
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE:
        tableElement = (<PassiveTable {...tableProps} />);
        break;
      default:
        break;
    }
    return tableElement;
  }

  render() {
    const { classes,isOpen,type } = this.props;
    let title = '';
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY:
        title = 'Occupational History Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS:
        title = 'Occupational History Others Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING:
        title = 'Social History Smoking Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING:
        title = 'Social History Drinking Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE:
        title = 'Social History Substance Abuse Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_OTHERS:
        title = 'Social History Others Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS:
        title = 'Past Medical History Record Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS:
        title = 'Others Record Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL:
        title = 'Family Relationship Problem Log';
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE:
        title = 'Social History Passive Smoking Information Log';
        break;
      default:
        break;
    }
    return (
      <Dialog
          classes={{paper: classes.paper}}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="paper"
          PaperComponent={PaperComponent}
      >
        {/* title */}
        <DialogTitle
            className={classes.dialogTitle}
            disableTypography
            customlogdrag="allowed"
        >
          {title}
        </DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            <Paper elevation={1}>
              {this.renderTable()}
            </Paper>
          </Typography>
        </DialogContent>
        {/* button group */}
        <DialogActions className={classes.dialogActions}>
          <Grid
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
          >
            <Grid item xs>
              <CIMSButton
                  id="btn_medical_history_log_ok"
                  style={{float:'right'}}
                  onClick={this.handleOK}
              >
                OK
              </CIMSButton>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(LogDialog);
