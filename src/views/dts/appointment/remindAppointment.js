import React, { Component } from 'react';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import _ from 'lodash';
import DtsRemindAppointmentSearchPanel from './components/DtsRemindAppointmentSearchPanel';
import DtsRemindAppointmentList from './components/DtsRemindAppointmentList';
import DtsContactHistoryDialog from './components/DtsContactHistoryDialog';
import { contactHistoryAction } from '../../../enums/dts/appointment/contactHistoryActionEnum';
import dtstheme from '../theme';

import DtsButton from '../components/DtsButton';
import Drawer from '@material-ui/core/Drawer';
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
        width: '400px',
        margin: '0px 5px'
    },
    rightPanel: {
        width: '1540px',
        margin: '0px 5px'
    },
    searchBoxBtn: {
        width: '15%',
        marginTop: '0px'
    }
    /*
        leftPanelItme:{
            marginBottom: '10px'
        },
        mainPanel:{
            width: '1620px'
        },
        patientReaderComponent:{
            width: '820px'
            //height: '100px'
        },
        dailyNoteComponent:{
            width: '800px'
            //height: '100px'
        },
        attendanceTaskListComponent:{
            width:'1620px'
        },
        attendanceTaskFooterComponent:{
            width:'1620px'
            // height:'100px'
        }
    */
});


class RemindAppointment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openContactHistoryDialog: false,
            contactHistoryAction: null,
            contactHistoryAppointmentId: null,
            left:false
        };
    }

    componentWillUnmount() {
        // this.props.resetAll();
    }

    closeContactHistoryDialogBox = () => {
        this.setState({ openContactHistoryDialog: false, contactHistoryAction: null, contactHistoryAppointmentId: null });
    }

    openContactHistoryDialogBox = () => {
        this.setState({ openContactHistoryDialog: true });
        // console.log('openDialogBox');
    }

    insertContactHistory = (appointment) => {
        //console.log('appointmentId(insertContactHistory):' + appointmentId);
        this.setState({ contactHistoryAction: contactHistoryAction.VIEW, contactHistoryAppointment: appointment });
        this.openContactHistoryDialogBox();
    }

    openSearchBox = (anchor, classes) => (
        <Grid item container className={classes.leftPanel}>
            <Grid className={classes.leftPanelItme} item>
                <h4 style={{ textAlign: 'center' }}>Search Patient</h4>
                <DtsRemindAppointmentSearchPanel onClose={this.toggleDrawer(anchor, false)} /></Grid>
        </Grid>
    );
    toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.setState({ [anchor]: open });
    };
    render() {
        const { classes } = this.props;

        return (
            <MuiThemeProvider theme={dtstheme}>
                {/* <MuiThemeProvider theme={defaultTheme}> */}
                <Grid container className={classes.root}>

                    <div className={classes.root}>
                        <Grid container className={classes.container}>
                            <Grid item xs={12}>
                                {['right'].map((anchor) => (
                                    <React.Fragment key={anchor}>
                                        <DtsButton className={classes.searchBoxBtn} iconType={'SEARCH'} onClick={this.toggleDrawer(anchor, true)}>Search / Print Patient List</DtsButton>
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
                            {/* <Grid item container direction="column" aligItems="center" className={classes.leftPanel}>
                                <Grid className={classes.leftPanelItme} item><DtsRemindAppointmentSearchPanel /></Grid>
                            </Grid> */}
                            <Grid item xs={12} className={classes.rightPanel}>
                                <Grid item>
                                    <DtsRemindAppointmentList
                                        onClickEditContactHistory={this.insertContactHistory}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <div>
                            {this.state.openContactHistoryDialog ? <DtsContactHistoryDialog id={'dtsContactHistoryDialog'}
                                contactHistoryAction={this.state.contactHistoryAction}
                                openContactHistoryDialog={this.state.openContactHistoryDialog}
                                closeContactHistoryDialog={this.closeContactHistoryDialogBox}
                                appointment={this.state.contactHistoryAppointment}
                            /> : null}
                        </div>
                    </div>

                </Grid>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo
    };
};

const mapDispatchToProps = {

    // resetAll

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RemindAppointment));
