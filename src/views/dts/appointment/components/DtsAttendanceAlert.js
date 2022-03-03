import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import Paper from '@material-ui/core/Paper';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Snackbar, SnackbarContent, withStyles, IconButton, Switch } from '@material-ui/core';
import { styles } from './DtsAttendanceAlertStyle';
import clsx from 'clsx';
import 'date-fns';

import normalBookingSound from '../../../../sound/Normal_Booking_recording.mp3';
import urgentBookingSound from '../../../../sound/Urgent_Appointment_recording.mp3';

import {
	getServeRoom,
    getAttendance
} from '../../../../store/actions/dts/appointment/attendanceAction';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import {
    setAttendanceAlertSettings,
    getRoomList
} from '../../../../store/actions/dts/appointment/attendanceAction';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';

import moment from 'moment';
import { connect } from 'react-redux';
// import _ from 'lodash';

import {
    NotificationsActive,
    NotificationsOff,
    Close
} from '@material-ui/icons';

const bookingSounds={
    N:normalBookingSound,
    U:urgentBookingSound
};

class DtsAttendanceAlert extends Component {

    constructor(props){
        super(props);
        this.state = {
            bookingTypeCode: '',
            delay: 30000,
            openSnackbar: false,
            remindedAttendance: [],
            attendance: [],
            loginInfo: this.props.loginInfo,
            urgentCount: 0,
            normalCount: 0
          };
    }

    componentDidMount() {
        this.getDefaultServeRoom();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.hasLoggedInDTS() && (this.interval=== undefined || prevState.delay !== this.state.delay)) {
            clearInterval(this.interval);
            this.interval = setInterval(this.loadData, this.state.delay);
        }

        if(prevState.normalCount != this.state.normalCount || prevState.urgentCount != this.state.urgentCount) {
            let track = bookingSounds[this.state.bookingTypeCode];
            if(track) {
                this.player.src = track;
                this.player.play();
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    hasLoggedInDTS() {
        return this.state.loginInfo && this.props.loginInfo.userDto && this.props.serviceCd && this.props.serviceCd === 'DTS';
    }

    resetAttedanceAlert() {
        this.setState({ remindedAttendance: [],
                        attendance: [],
                        normalCount: 0,
                        urgentCount: 0,
                        openSnackbar: false });
    }

    getDefaultServeRoom() {
        if(this.hasLoggedInDTS()) {
            this.props.getServeRoom({userId: this.props.loginInfo.userDto.userId, date: moment()}, (serveRoom) => {
                this.props.setAttendanceAlertSettings({ roomId: serveRoom[0].roomId,
                                                        roomCode: serveRoom[0].roomCode,
                                                        open: false,
                                                        mute: false });
            }  );
        }
    }

    setAttendance = (attendance) => {
        let remindedAttendance = this.state.remindedAttendance;
        let fullAttendance = attendance;
        let attendanceDiff = fullAttendance.filter(x => !remindedAttendance.map(y => y.apptId).includes(x.apptId));

        let urgentCount = attendanceDiff.map(x => x.isUrgent).reduce((a, b) => a + b, 0);
        let normalCount = attendanceDiff.length- urgentCount;

        if(attendanceDiff.length) {
            this.setState((prevState) => ({ bookingTypeCode : (Math.abs(prevState.urgentCount - urgentCount) > 0 ? 'U' : 'N'),
                                            urgentCount: urgentCount,
                                            normalCount: normalCount,
                                            attendance: attendance,
                                            openSnackbar: urgentCount + normalCount > 0 }));
        }
    }

    getNotificationIcon(muted) {
        if (muted) {
            return <NotificationsOff id="icon_message_type_muted" className="message_icon" onClick={this.handleMutedIconOnclick}/>;
        }
        return <NotificationsActive id="icon_message_type_unmuted" className="message_icon" onClick={this.handleUnmutedIconOnclick}/>;
    }

    loadData = () =>  {
        if (!this.props.attendanceAlertSettings['mute']) {
            this.props.getAttendance(
            {
                clinicId: this.props.defaultClinic.siteId,
                roomId: this.props.attendanceAlertSettings['roomId'],
                appointmentDate: moment().format()
            },this.setAttendance);
        }
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'attendanceAlertSettingsRoom') {
            validators.push('required');
            return validators;
        }
    }
    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'attendanceAlertSettingsRoom') {
            errorMessages.push('attendanceAlertSettingsRoom');
            return errorMessages;
        }
    }

    // close => btn1
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState((prevState) => ({ remindedAttendance: this.state.attendance,
                                        normalCount: 0,
                                        urgentCount: 0,
                                        openSnackbar: false }));
    }

    handleExited = () => {
    }

    handleDelayChange = (e) => {
        this.setState({ delay: Number(e.target.value) });
    }

    handleMutedIconOnclick = () => {
        let attendanceAlertSettings = Object.assign({}, this.props.attendanceAlertSettings);
        attendanceAlertSettings['mute'] = false;
        this.props.setAttendanceAlertSettings(attendanceAlertSettings);
    }

    handleUnmutedIconOnclick = () => {
        let attendanceAlertSettings = Object.assign({}, this.props.attendanceAlertSettings);
        attendanceAlertSettings['mute'] = true;
        this.props.setAttendanceAlertSettings(attendanceAlertSettings);
    }

    handleRoomChange = (e) => {
        let attendanceAlertSettings = Object.assign({}, this.props.attendanceAlertSettings);
        let currentSelectedRoom = attendanceAlertSettings['roomId'];
        attendanceAlertSettings['roomId'] = e.value;
        attendanceAlertSettings['roomCode'] = e.label;
        if (currentSelectedRoom !== e.value) {
            this.resetAttedanceAlert();
        }
        this.props.setAttendanceAlertSettings(attendanceAlertSettings);
    }

    handleAlertSwitch = () => {
        let attendanceAlertSettings = Object.assign({}, this.props.attendanceAlertSettings);
        attendanceAlertSettings['mute'] = !this.props.attendanceAlertSettings['mute'];
        this.props.setAttendanceAlertSettings(attendanceAlertSettings);
    }

    render() {
        let { classes, className, roomList, ...rest} = this.props;
        let { openSnackbar, urgentCount, normalCount } = this.state;

        return(
            <Paper className={classes.root +' ' +className}>
                    <CIMSPromptDialog
                        open={this.props.attendanceAlertSettings['open']}
                        dialogTitle={'Attendance Alert Settings'}
                        classes={{
                            paper: classes.attendanceAlertSettingsFrame
                        }}
                        dialogContentText={
                            <ValidatorForm
                                ref="form"
                                onSubmit={this.handleSave}
                                className={classes.attendanceAlertSettingsContent}
                            >
                                <Grid container spacing={2} >
                                    <Grid item xs={10} >
                                        <FormControlLabel
                                            control={<Switch checked={this.props.attendanceAlertSettings['mute']} onChange={this.handleAlertSwitch} />}
                                            label="Mute alert"
                                        />
                                    </Grid>
                                    <Grid item xs={10} >
                                        <DtsSelectFieldValidator
                                            options={roomList && roomList.map((item) => (
                                                { value: item.rmId, label: item.rmCd }))}
                                            id={'unavailablePeriodManagement_dialogSiteId'}
                                            TextFieldProps={{
                                                variant: 'outlined',
                                                label: 'Select surgery'
                                            }}
                                            value={this.props.attendanceAlertSettings['roomId']}
                                            onChange={e => this.handleRoomChange(e)}
                                            validators={this.getValidator('attendanceAlertSettingsRoom')}
                                            errorMessages={this.getErrorMessage('attendanceAlertSettingsRoom')}
                                            isDisabled={(false)}
                                        />
                                    </Grid>
                                </Grid>

                            </ValidatorForm>
                        }
                        // buttonConfig={[
                        // {
                        //     id: 'attedanceAlertConfigPanelOkayButton',
                        //     name: 'Close',
                        //     disabled: false,
                        //     onClick: () => {
                        //         let attendanceAlertSettings = Object.assign({}, this.props.attendanceAlertSettings);
                        //         attendanceAlertSettings['open'] = false;
                        //         this.props.setAttendanceAlertSettings(attendanceAlertSettings);
                        //     }
                        // }
                        // ]}
                        dialogActions={
                            <Grid container wrap="nowrap" justify="center">
                                <CIMSButton
                                    id="attedanceAlertConfigPanelOkayButton"
                                    onClick={() => {
                                        let attendanceAlertSettings = Object.assign({}, this.props.attendanceAlertSettings);
                                        attendanceAlertSettings['open'] = false;
                                        this.props.setAttendanceAlertSettings(attendanceAlertSettings);
                                    }}
                                >Close</CIMSButton>
                            </Grid>
                        }
                    />
                    <audio ref={ref => this.player = ref} />
                    <Snackbar
                        id="attendance_alert_snackbar"
                        anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                        open={openSnackbar}
                        onClose={this.handleClose}
                        onExited={this.handleExited}
                        ContentProps={{
                            classes: {
                                root:classes.snackBar
                            }
                        }}
                    >
                            <SnackbarContent
                                className={clsx(classes.content,classes.snackbarBackground)}
                                message={
                                    <span>
                                        {this.getNotificationIcon(this.props.attendanceAlertSettings['mute'])}
                                        <span className={clsx(classes.content,classes.surgeryContent)}>{this.props.attendanceAlertSettings['roomCode']}</span>
                                        <span className={clsx(classes.content,classes.urgentCountContent)}>No. of Urgent: {urgentCount}.</span>
                                        <span className={clsx(classes.content,classes.normalCountContent)}>No. of Normal: {normalCount}.</span>
                                    </span>
                                }
                                action={[
                                    <IconButton className={classes.actionClose} key="action_close" onClick={this.handleClose}>
                                        <Close />
                                    </IconButton>
                                ]}
                            />
                        </Snackbar>
            </Paper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loginInfo: state.login.loginInfo,
        serviceCd: state.login.service.serviceCd,
        defaultClinic: state.login.clinic,
        clinicList: state.common.clinicList,
        attendanceAlertSettings:state.dtsAppointmentAttendance.attendanceAlertSettings,
        roomList: state.dtsAppointmentAttendance.roomList
    };
};

const mapDispatchToProps = {
    getAttendance,
    getServeRoom,
    setAttendanceAlertSettings,
    getRoomList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAttendanceAlert));
