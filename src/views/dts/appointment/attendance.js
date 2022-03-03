import React, { Component } from 'react';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { Grid, IconButton } from '@material-ui/core';
import {
    NotificationsActive,
    NotificationsOff
} from '@material-ui/icons';
import Drawer from '@material-ui/core/Drawer';
import _ from 'lodash';
import moment from 'moment';
import DtsAttendanceSearchPanel from './components/DtsAttendanceSearchPanel';
import DtsAttendanceFilter from './components/DtsAttendanceFilter';
import DtsAttendanceAlert from './components/DtsAttendanceAlert';
import DtsAttendanceTaskListPanel from './components/DtsAttendanceTaskListPanel';
import DtsAttendanceTaskFooter from './components/DtsAttendanceTaskFooter';

import DtsDailyNoteAttendance from './components/DtsDailyNoteAttendance';
import DtsAttendanceConfirmationDialog from './components/DtsAttendanceConfirmationDialog';
import dtstheme from '../theme';
import {
    resetAll,
    setAttendanceAlertSettings,
    setSelectedRoom,
    setCalendarDetailDate,
    getDailyView,
    resetDailyNote,
    getDailyNote
} from '../../../store/actions/dts/appointment/attendanceAction';
import Enum from '../../../enums/enum';
import {
    attendanceStatus, clinicalStatus
} from '../../../enums/dts/attendance/attendanceFilterEnum';
import { StatusList as EncounterStatusList } from '../../../enums/dts/encounter/encounterStatusEnum';
import DtsButton from '../components/DtsButton';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../constants/dts/DtsConstant';

// const defaultTheme = createMuiTheme();

const styles = (theme) => ({
    root: {
        width: '100%',
        overflow: 'initial'
    },
    leftPanel: {
        width: '350px',
        margin: '0px 5px',
        padding: 10
    },
    leftPanelItme: {
        marginBottom: '10px'
    },
    mainPanel: {
        width: '1620px'
    },
    patientReaderComponent: {
        width: '750px'
        //height: '100px'
    },
    dailyNoteComponent: {
        width: '800px',
        marginBottom: '8px'
        //height: '100px'
    },
    attendanceTaskListComponent: {
        width: '1900px',
        paddingBottom: '5px'
    },
    attendanceTaskFooterComponent: {
        width: '1850px'
        // height:'100px'
    },
    actionNotSave: {
        backgroundColor: '#ffff009c',
        cursor: 'pointer'
    },
    actionInProg: {
        backgroundColor: '#9de2ffc9',
        cursor: 'pointer'
    },
    actionPending: {
        backgroundColor: '#ff83fab8',
        cursor: 'pointer'
    },
    actionComp: {
        backgroundColor: '#55e29cb8',
        cursor: 'pointer'
    },
    attendanceAlertSettingsIcon: {
        width: '50px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
    },
    openMenuDrawer: {
        maxWidth: '230px'
    },
    button: {
        margin: 4,
        textTransform: 'none',
        minWidth: '10px',
        'border-radius': '25px',
        border: 'none',
        'box-shadow': 'none',
        backgroundColor: '#fff',
        color: '#92a8d3',
        '&:hover': {
            backgroundColor: '#cccccc30',
            color: '#00000070'
        }
    },
    row:{
        width:'200px',
        display: 'inline'
    }
});


class Attendance extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openConfirmDialog: false,
            left: false
        };
    }

    componentWillUnmount() {
        let attendanceAlertSettings = this.props.attendanceAlertSettings;
        this.props.resetAll();
        this.props.setAttendanceAlertSettings(attendanceAlertSettings);
    }

    closeAppointmentDialogBox = () => {
        this.setState({ openConfirmDialog: false });
    }

    openAttendanceDialogBox = () => {
        this.setState({ openConfirmDialog: true });
        // console.log('openDialogBox');
    }

    attendanceFilterLogic(item, filterClinicalStatus, filterEncounterTypeCd, filterAttendanceStatus, filterInfectionControlDisplay, infectionControlIds) {
        if (filterAttendanceStatus) {
            if (filterAttendanceStatus === attendanceStatus.ATTENDED.statusCd) {
                if (item.type == 'A' && !item.appointment.attendanceBaseVo?.arrivalTime) {
                    return false;
                }
                else if (item.type != 'A') {
                    return false;
                }
            }
            else if (filterAttendanceStatus === attendanceStatus.NOT_ATTEND.statusCd) {
                if (item.type == 'A' && item.appointment.attendanceBaseVo?.arrivalTime) {
                    return false;
                }
                else if (item.type != 'A') {
                    return false;
                }
            }
        }

        if (filterEncounterTypeCd) {
            if (item.type == 'A' && item.appointment.encounterTypeCd != filterEncounterTypeCd) {
                return false;
            }
            else if (item.type != 'A') {
                return false;
            }
        }

        if (filterClinicalStatus) {
            if (filterClinicalStatus === clinicalStatus.NOT_COMPLETED.statusCd) {
                if (item.type == 'A' && item.appointment.encounterBaseVo) {
                    if (item.appointment.encounterBaseVo.encounterStatus === EncounterStatusList.ENCOUNTER_COMPLETED) {
                        return false;
                    }
                }
                else if (item.type != 'A') {
                    return false;
                }
            }
        }

        if (!filterInfectionControlDisplay && !_.isEmpty(infectionControlIds)) {
            if (item.unavailablePeriods) {
                const unavailablePeriodsInfectionControl = item.unavailablePeriods.filter(unavailablePeriod => infectionControlIds.includes(unavailablePeriod.unavailablePeriodReasonId));
                if (unavailablePeriodsInfectionControl.length > 0 && unavailablePeriodsInfectionControl.length == item.unavailablePeriods.length) {
                    return false;
                }
            }
        }

        return true;
    }

    getActionTypeClass = (encounterStatus) => {
        const { classes } = this.props;

        if (encounterStatus) {
            switch (encounterStatus) {
                case EncounterStatusList.NOT_YET_CALLED: {
                    return classes.actionNotSave;
                }
                case EncounterStatusList.CALLED_AND_IN_PROGRESS: {
                    return classes.actionInProg;
                }
                case EncounterStatusList.SURGERY_COMPLETED_BUT_WRITE_UP_NOT_YET_COMPLETED: {
                    return classes.actionPending;
                }
                case EncounterStatusList.ENCOUNTER_COMPLETED: {
                    return classes.actionComp;
                }
            }
        }
        else {
            return '';
        }
    }

    getAttendanceAlertSettingsIcon = () => {
        if (!this.props.attendanceAlertSettings['mute']) {
            return (<IconButton id={'icon_attendace_alert_settings'} color="primary" onClick={() => this.openAttendanceAlertSettings()}>
                <NotificationsActive className="icon_attendace_alert_settings" />
            </IconButton>);
        }
        return (<IconButton id={'icon_attendace_alert_settings'} color="primary" onClick={() => this.openAttendanceAlertSettings()}>
            <NotificationsOff className="icon_attendace_alert_settings" />
        </IconButton>);
    }

    openAttendanceAlertSettings = () => {
        let attendanceAlertSettings = Object.assign({}, this.props.attendanceAlertSettings);
        attendanceAlertSettings['open'] = true;
        this.props.setAttendanceAlertSettings(attendanceAlertSettings);
    }

    openSearchBox = (anchor, classes) => (
        <Grid container >
            <Grid item container direction="column" justify="flex-start" aligItems="center" className={classes.leftPanel}>
                <h4 style={{ textAlign: 'center' }}>Search Appointment</h4>
                <Grid className={classes.leftPanelItme} item><DtsAttendanceSearchPanel onClose={this.toggleDrawer(anchor, false)} /></Grid>
                <Grid className={classes.leftPanelItme} item><DtsAttendanceFilter filterLogic={this.attendanceFilterLogic} isShowEncounter={this.isShowEncounter()}/></Grid>
            </Grid>
            {/* <Grid item className={classes.attendanceTaskListComponent}><DtsAttendanceTaskListPanel filterLogic={this.attendanceFilterLogic} actionTypeClassFunc={this.getActionTypeClass} attendanceAction={this.openAttendanceDialogBox} /></Grid> */}
        </Grid>
    );

    toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.setState({ [anchor]: open });
    };

    handleDateShift = (dayToShift) => {
        let dateObj = moment(this.props.calendarDetailDate) || moment(0, 'HH');
        dateObj = dateObj.add(dayToShift, 'days');
        this.props.setCalendarDetailDate({calendarDetailDate: dateObj});
        this.handleOnRefresh(this.props.selectedRoom, dateObj);
    }

    handleSurgeryShift = (roomToShift) => {
        if(!_.isEmpty(this.props.selectedRoom)) {
            let selectedRoom = this.props.selectedRoom;
            let selectedRoomIndex = this.props.roomList.indexOf(selectedRoom);
            let nextSelectedRoomIndex = (selectedRoomIndex + roomToShift) % this.props.roomList.length;
            selectedRoom = this.props.roomList[nextSelectedRoomIndex];
            if(!(nextSelectedRoomIndex < 0 || nextSelectedRoomIndex >= this.props.roomList.length)) {
                this.props.setSelectedRoom({selectedRoom: selectedRoom});
                this.handleOnRefresh(selectedRoom, this.props.calendarDetailDate);
            }
        }
    }

    handleOnRefresh = (inputRoom, inputDate) => {
        const selectedRoom = inputRoom || this.props.selectedRoom;
        const selectedDate = inputDate || this.props.calendarDetailDate;
        this.props.resetDailyNote();
        this.props.getDailyView({rmId:selectedRoom.rmId, date:moment(selectedDate).format('YYYY-MM-DD')});
        this.props.getDailyNote({clinicRoomId:selectedRoom.rmId, appointmentDate:moment(selectedDate).format('YYYY-MM-DD')});
    }

    isShowEncounter = () => {
        return this.props.userRoleType != Enum.USER_ROLE_TYPE.COUNTER;
    }

    render() {
        const { classes, selectedRoom, calendarDetailDate } = this.props;
        const selectedRoomLabel = selectedRoom ? selectedRoom.rmCd : '';
        let selectedCalendarDetailDateLabel = '';
        if(calendarDetailDate) {
            selectedCalendarDetailDateLabel = moment().startOf('day').diff(calendarDetailDate, 'days') == 0 ? 'Today' : moment(calendarDetailDate).format(DTS_DATE_DISPLAY_FORMAT);
        }

        return (
            <MuiThemeProvider theme={dtstheme}>
                {/* <MuiThemeProvider theme={defaultTheme}> */}
                <Grid container className={classes.root}>

                    <div className={classes.root}>
                        <table border="0 solid black">
                            <tbody>
                                <tr>
                                    <td>
                                        <Grid container>
                                            {/* <Grid item className={classes.leftPanel}></Grid>
                                             */}
                                            <Grid item className={classes.openMenuDrawer}>
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

                                            <Grid item className={classes.patientReaderComponent}>
                                                {/* <DtsAttendanceConfirmationPanel /> */}
                                                {/* ====================USER COMMENT ON LAYOUT START=========================*/}
                                                <div className={classes.row}>
                                                    <DtsButton className={classes.searchBoxBtn} iconType={'REFRESH'} onClick={() => {this.handleOnRefresh(null, null);}}>Refresh</DtsButton>
                                                </div>

                                                <div className={classes.row}>
                                                    <CIMSButton className={classes.button} onClick={() => {this.handleDateShift(-1);}}>&lt;</CIMSButton>
                                                    <CIMSButton className={classes.button} onClick={this.toggleDrawer('right', true)}>{selectedCalendarDetailDateLabel}</CIMSButton>
                                                    <CIMSButton className={classes.button} onClick={() => {this.handleDateShift(1);}}>&gt;</CIMSButton>
                                                </div>
                                                <div className={classes.row}>
                                                    <CIMSButton className={classes.button} onClick={() => {this.handleSurgeryShift(-1);}}>&lt;</CIMSButton>
                                                    <CIMSButton className={classes.button} onClick={this.toggleDrawer('right', true)}>{selectedRoomLabel}</CIMSButton>
                                                    <CIMSButton className={classes.button} onClick={() => {this.handleSurgeryShift(1);}}>&gt;</CIMSButton>
                                                </div>
                                                {/* ====================USER COMMENT ON LAYOUT END=========================*/}
                                            </Grid>
                                            <Grid item className={classes.dailyNoteComponent}><DtsDailyNoteAttendance /></Grid>
                                            <Grid item className={classes.attendanceAlertSettingsIcon}>
                                                {this.getAttendanceAlertSettingsIcon()}
                                            </Grid>
                                        </Grid>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Grid container>
                                            <Grid item className={classes.attendanceTaskListComponent}><DtsAttendanceTaskListPanel filterLogic={this.attendanceFilterLogic} actionTypeClassFunc={this.getActionTypeClass} attendanceAction={this.openAttendanceDialogBox} isShowEncounter={this.isShowEncounter()}/></Grid>
                                        </Grid>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Grid container>
                                            <Grid item className={classes.leftPanel}></Grid>
                                            <Grid item className={classes.attendanceTaskFooterComponent}><DtsAttendanceTaskFooter actionTypeClassFunc={this.getActionTypeClass} isShowEncounter={this.isShowEncounter()}/></Grid>
                                        </Grid>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {this.state.openConfirmDialog && <DtsAttendanceConfirmationDialog id={'dtsAttendanceConfirmationDialog'}
                                            // attendanceAction={this.openAttendanceDialogBox}
                                            openConfirmDialog={this.state.openConfirmDialog}
                                            closeConfirmDialog={this.closeAppointmentDialogBox}
                                                                         />
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </Grid>
            </MuiThemeProvider>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        attendanceAlertSettings: state.dtsAppointmentAttendance.attendanceAlertSettings,
        selectedRoom: state.dtsAppointmentAttendance.selectedRoom,
        calendarDetailDate: state.dtsAppointmentAttendance.calendarDetailDate,
        roomList: state.dtsAppointmentAttendance.roomList,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType
    };
};

const mapDispatchToProps = {

    resetAll,
    setAttendanceAlertSettings,
    setSelectedRoom,
    setCalendarDetailDate,
    getDailyView,
    resetDailyNote,
    getDailyNote

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Attendance));
