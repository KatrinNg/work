import React, { Component } from 'react';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import _ from 'lodash';
import DtsAppointmentListSearchPanel from './components/DtsAppointmentListSearchPanel';
import DtsAppointmentList from './components/DtsAppointmentList';
import DtsPrintAppointmetListDialog from './components/DtsPrintAppointmetListDialog';
import DtsButton from '../components/DtsButton';
import Drawer from '@material-ui/core/Drawer';
import dtstheme from '../theme';
import {
    resetAll
} from '../../../store/actions/dts/appointment/searchAppointmentAction';



// import {
//     resetAll
// } from '../../../store/actions/dts/appointment/appointmentAction';

import Enum from '../../../enums/enum';

// const defaultTheme = createMuiTheme();

const styles = (theme) => ({
    root: {
        width: '100%',
        overflow: 'initial'
    },
    container: {
        flexWrap: 'wrap'
    },
    leftPanel: {
        width: '90%',
        margin: '0px 5px'
    },
    rightPanel: {
        width: '1540px',
        margin: '0px 5px'
    },
    openMenuDrawer:{
        maxWidth:'650px',
        marginTop:-5
    }
});


class SearchAppointment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openReportDialog: false,
            left: false
        };
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    handleCloseReportDialog = () => {
        this.setState({ openReportDialog: false });
    }

    handleOpenReportDialog = () => {
        //console.log('handleOpenReportDialog...');
        this.setState({ openReportDialog: true });
    }

    openSearchBox = (anchor, classes) => (
        <Grid item container direction="column" aligItems="center" className={classes.leftPanel}>
            <h4  style={{textAlign:'center'}}>Search Appointment</h4>
            <Grid className={classes.leftPanelItme} item><DtsAppointmentListSearchPanel openReportDialog={this.handleOpenReportDialog} onClose={this.toggleDrawer(anchor, false)}/></Grid>
        </Grid>
    );

    toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.setState({ [anchor]: open });
    };

    render() {
        const { classes, appointmentListReport } = this.props;

        return (
            <MuiThemeProvider theme={dtstheme}>
                {/* <MuiThemeProvider theme={defaultTheme}> */}
                <Grid container className={classes.root}>

                    <div className={classes.root}>

                        <Grid container className={classes.container}>
                            {/* <Grid item container direction="column" aligItems="center" className={classes.leftPanel}>
                                <Grid className={classes.leftPanelItme} item><DtsAppointmentListSearchPanel openReportDialog={this.handleOpenReportDialog} /></Grid>
                            </Grid> */}
                            <Grid item xs={12} className={classes.openMenuDrawer}>
                                {['right'].map((anchor) => (
                                    <React.Fragment key={anchor}>
                                        <DtsButton className={classes.searchBoxBtn} iconType={'SEARCH'} onClick={this.toggleDrawer(anchor, true)}>Search Appointment List</DtsButton>
                                        <Drawer
                                            anchor={anchor}
                                            open={this.state[anchor]}
                                            onClose={this.toggleDrawer(anchor, false)}
                                            keepMounted
                                        // onOpen={this.toggleDrawer(anchor, true)}
                                        >
                                            {this.openSearchBox(anchor, classes)}
                                        </Drawer>
                                    </React.Fragment>
                                ))}
                            </Grid>
                            <Grid item xs={12} className={classes.rightPanel}>
                                <Grid item><DtsAppointmentList/>
                                </Grid>
                            </Grid>
                            {this.state.openReportDialog && <DtsPrintAppointmetListDialog
                                openReportDialog={this.state.openReportDialog}
                                closeReportDialog={this.handleCloseReportDialog}
                                appointmentListReport={appointmentListReport}
                                                            />}
                        </Grid>
                    </div>

                </Grid>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        appointmentListReport: state.dtsSearchAppointment.appointmentListReport
        // withinClosePeriod: state.dtsSearchAppointment.withinClosePeriod
    };
};

const mapDispatchToProps = {
    resetAll

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SearchAppointment));
