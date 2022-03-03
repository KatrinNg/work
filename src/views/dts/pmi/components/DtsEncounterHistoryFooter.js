import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { Grid, Paper } from '@material-ui/core';

import { StatusList as EncounterStatusList } from '../../../../enums/dts/encounter/encounterStatusEnum';

const styles = (theme) => ({
    root: {
        width: '100%',
        overflow: 'initial',
        paddingTop:20
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
    }
});

class DtsEncounterListFooter extends Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    // counterEncounterStatus(encounterStatus){
    //     const { dailyView } = this.props;

    //     return dailyView ? dailyView.filter((item) => (item.type == 'A' && item.appointment.encounterBaseVo && item.appointment.encounterBaseVo.encounterStatus == encounterStatus)).length : 0;
    // }

    render() {
        const { actionTypeClassFunc, classes } = this.props;

        return(
            <Grid container spacing={0} className={classes.root}>
                <Grid item xs={5}>
                    <Grid container direction="row" justify="flex-start" alignItems="center" className={classes.itemGridGroup}>
                        {/* <CIMSButton color="primary" id={'TakeAtt'}>Take Att</CIMSButton>
                        <CIMSButton color="primary" id={'DiscNum'}>Disc Num</CIMSButton>
                        <CIMSButton color="primary" id={'ArrTime'}>Arrival Time</CIMSButton>
                        <CIMSButton color="primary" id={'RevAtt'}>Revoke Att</CIMSButton> */}
                    </Grid>
                </Grid>
                <Grid item xs={7}>
                    <Grid container direction="row" justify="flex-end" alignItems="center" className={classes.itemGridGroup}>
                        <Paper className={classes.paperIndicator}> <span className={actionTypeClassFunc(EncounterStatusList.NOT_YET_CALLED)}>&nbsp;&nbsp;&nbsp;</span> {'Not Saved'}</Paper>
                        <Paper className={classes.paperIndicator}><span className={actionTypeClassFunc(EncounterStatusList.CALLED_AND_IN_PROGRESS)}>&nbsp;&nbsp;&nbsp;</span> {'In Progress'}</Paper>
                        <Paper className={classes.paperIndicator}><span className={actionTypeClassFunc(EncounterStatusList.SURGERY_COMPLETED_BUT_WRITE_UP_NOT_YET_COMPLETED)}>&nbsp;&nbsp;&nbsp;</span> {'Pending for Write-Up'}</Paper>
                        <Paper className={classes.paperIndicator}><span className={actionTypeClassFunc(EncounterStatusList.ENCOUNTER_COMPLETED)}>&nbsp;&nbsp;&nbsp;</span> {'Completed'}</Paper>
                    </Grid>
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
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEncounterListFooter));