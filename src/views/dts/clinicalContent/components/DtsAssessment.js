import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Assessment from './assessmentComp/Assessment';
import { 
  getDtoClcDtpObj,
  assessmentUUID
 } from './assessmentComp/common/AssessmentUnit.js';

const styles = (theme) => ({
});

class DtsAssessment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assessmentDTO: this.props.assessmentDTO,
      assessment: this.props.assessment
    };
  }

  componentDidMount() {
    this.handleVisivility(this.props.show);
  }

  componentDidUpdate(prevProps) {
    if(this.props.show != prevProps.show) {
      this.handleVisivility(this.props.show);
    }
  }

  handleVisivility = (show) => {
    let x = document.getElementById(assessmentUUID);
    if (show) {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
  }

  render() {
    const { bpeNANum, aData, show, saveNum, classes } = this.props;

    return (
      <form autoComplete="off">
        <Assessment aData={aData} bpeNA={bpeNANum} divId={assessmentUUID} save={saveNum} />
      </form>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    bookingPageStatus: state.dtsAppointmentBooking.pageStatus,
    switchingFlag: state.dtsAppointmentBooking.switchingFlag,
    patient: state.patient.patientInfo,
    tabs: state.mainFrame.tabs,
    subTabs: state.mainFrame.subTabs,
    accessRights: state.login.accessRights,
    userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
    defaultClinic: state.login.clinic,
    latestEncounter: state.clinicalContentEncounter.latestEncounter
  };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAssessment));