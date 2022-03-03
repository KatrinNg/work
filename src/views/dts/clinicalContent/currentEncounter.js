import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import dtstheme from '../theme';
import DtsCurrentEncounterRightPanel from './components/DtsCurrentEncounterRightPanel';
import DtsCurrentEncounterSummary from './components/DtsCurrentEncounterSummary';
import {
  getLatestEncounter,
  getNotesAndProcedures
} from '../../../store/actions/dts/clinicalContent/encounterAction';
const styles = (theme) => ({
  root: {
    height: '100%',
    width: '100%',
    overflow: 'hidden'
  }
});

class currentEncounter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {


const { classes, latestEncounter, patient, ...rest } = this.props;

    this.props.getLatestEncounter({
         patientKey: patient.patientKey
       });



  }

  componentDidUpdate(prevProps) {}

  render() {
    const { classes, latestEncounter, notesAndProceduresList, ...rest } = this.props;

    return (
      <MuiThemeProvider theme={dtstheme}>
        <Grid container spacing={0} className={classes.root}>
          <Grid item key="CurrentEncounterSummary" xs={6}>
            {latestEncounter && latestEncounter.encntrId != null &&
              <DtsCurrentEncounterSummary/>
            }
          </Grid>

          <Grid item key="CurrentEncounterRightPanel" xs={6}>
            <DtsCurrentEncounterRightPanel/>
          </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log('pageStatus 1: ' + JSON.stringify(state.dtsAppointmentBooking.pageStatus));
  return {
    bookingPageStatus: state.dtsAppointmentBooking.pageStatus,
    switchingFlag: state.dtsAppointmentBooking.switchingFlag,
    patient: state.patient.patientInfo,
    tabs: state.mainFrame.tabs,
    subTabs: state.mainFrame.subTabs,
    accessRights: state.login.accessRights,
    userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
    defaultClinic: state.login.clinic,
    latestEncounter: state.clinicalContentEncounter.latestEncounter,
    patientInfo: state.patient.patientInfo
  };
};

const mapDispatchToProps = {
  getLatestEncounter,
  getNotesAndProcedures
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(currentEncounter));
