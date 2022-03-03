import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { Grid, Paper } from '@material-ui/core';

import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { StatusList as EncounterStatusList } from '../../../../enums/dts/encounter/encounterStatusEnum';

const styles = (theme) => ({
    root: {
        width: '100%',
        overflow: 'initial'
    },
    paperIndicator:{
        minWidth: '110px',
        fontSize:'14px',
        'box-shadow':'none',
        textAlign: 'center',
        padding: '5px 20px'
    },
    itemGridGroup:{
        width: '100%',
        height: '100%'
    },
    availableTime:{
        backgroundColor:'#ff9d45'
    },
    unavailableTime:{
        backgroundColor:'#b1b1b1'
    },
    lateArrival:{
        backgroundColor:'#ff5f5f'
    }
});

class DtsAttendanceTaskFooter extends Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    counterEncounterStatus(encounterStatus){
        const { dailyView } = this.props;

        return dailyView ? dailyView.filter((item) => (item.type == 'A' && item.appointment.encounterBaseVo && item.appointment.encounterBaseVo.encounterStatus == encounterStatus)).length : 0;
    }

    render() {
        const { actionTypeClassFunc, classes } = this.props;

        return(
            <Grid container spacing={0} className={classes.root}>
                <Grid item xs={5}>
                    <Grid container direction="row" justify="flex-start" alignItems="center" className={classes.itemGridGroup}>
                        <Paper className={classes.paperIndicator}><span className={classes.availableTime}>&nbsp;&nbsp;&nbsp;</span> No changes within 24 hrs</Paper>
                        <Paper className={classes.paperIndicator}><span className={classes.unavailableTime}>&nbsp;&nbsp;&nbsp;</span> Unavailable Timeslot</Paper>
                        <Paper className={classes.paperIndicator}><span className={classes.lateArrival}>&nbsp;&nbsp;&nbsp;</span> Late Arrival</Paper>
                        {/* <CIMSButton color="primary" id={'TakeAtt'}>Take Att</CIMSButton>
                        <CIMSButton color="primary" id={'DiscNum'}>Disc Num</CIMSButton>
                        <CIMSButton color="primary" id={'ArrTime'}>Arrival Time</CIMSButton>
                        <CIMSButton color="primary" id={'RevAtt'}>Revoke Att</CIMSButton> */}
                    </Grid>
                </Grid>
                <Grid item xs={7}>
                    {this.props.isShowEncounter ?
                        <Grid container direction="row" justify="flex-end" alignItems="center" className={classes.itemGridGroup}>
                            <Paper className={classes.paperIndicator}> <span className={actionTypeClassFunc(EncounterStatusList.NOT_YET_CALLED)}>&nbsp;&nbsp;&nbsp;</span> {'Not Saved (' + this.counterEncounterStatus(EncounterStatusList.NOT_YET_CALLED) + ')'}</Paper>
                            <Paper className={classes.paperIndicator}><span className={actionTypeClassFunc(EncounterStatusList.CALLED_AND_IN_PROGRESS)}>&nbsp;&nbsp;&nbsp;</span> {'In Progress (' + this.counterEncounterStatus(EncounterStatusList.CALLED_AND_IN_PROGRESS) + ')'}</Paper>
                            <Paper className={classes.paperIndicator}><span className={actionTypeClassFunc(EncounterStatusList.SURGERY_COMPLETED_BUT_WRITE_UP_NOT_YET_COMPLETED)}>&nbsp;&nbsp;&nbsp;</span> {'Pending for Write-Up (' + this.counterEncounterStatus(EncounterStatusList.SURGERY_COMPLETED_BUT_WRITE_UP_NOT_YET_COMPLETED) + ')'}</Paper>
                            <Paper className={classes.paperIndicator}><span className={actionTypeClassFunc(EncounterStatusList.ENCOUNTER_COMPLETED)}>&nbsp;&nbsp;&nbsp;</span> {'Completed (' + this.counterEncounterStatus(EncounterStatusList.ENCOUNTER_COMPLETED) + ')'}</Paper>
                        </Grid> : null
                    }
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        // patient: state.patient.patientInfo
        dailyView: state.dtsAppointmentAttendance.dailyView
    };
};

const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAttendanceTaskFooter));