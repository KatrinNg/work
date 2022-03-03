import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Paper,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from '@material-ui/core';

import {
    Edit as EditIcon,
    Cached as CachedIcon
} from '@material-ui/icons';

import _ from 'lodash';

import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';


import {
    resetUrgentRoomList,
    insertUrgentAppointment,
    getUrgentRoomList,
    setCalendarDetailDate,
    setSelectedRoom,
    reassignUrgentAppointment
} from '../../../../store/actions/dts/appointment/bookingAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { resolve } from 'promise-polyfill';

const styles = () => ({
    root: {
        flexGrow: 1,
        '& .MuiInputBase-root.Mui-disabled ':{
            backgroundColor:'#cacaca50'
        },
        '& .MuiInputLabel-outlined.MuiInputLabel-shrink':{
            fontSize: '12px',
            color:'#585858',
            transform: 'translate(5px, -5px) scale(1)',
            backgroundColor: '#ffffff30'
        }
    },
    paper: {
        padding: '10px',
        textAlign: 'center'
        // color: 'black'
    },
    blankLabel: {
        height: '18px'
    },
    label: {
        textAlign: 'left',
        fontWeight: 'bold'
    },
    info: {
        textAlign: 'left'
    },
    headerTableCell: {
        backgroundColor: '#48aeca',
        color: '#fff',
        fontWeight: 'normal',
        borderStyle: 'none'
    },
    tableRow: {
        height: 'auto'
    },
    tableRowBold: {
        fontWeight: 'bold'
    },
    editIconTableCell: {
        padding: '5px !important',
        color:'#48aeca'
    }
});

// function createRecord(surgery,urgentPatientDefRoom,currentEncounterType){
//     return {surgery,urgentPatientDefRoom,currentEncounterType};
// }

class DtsUrgentAppointmentDialog extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openConfirmDialog: true,
            discNumber: '',
            roomId: '',
            //mode: 'I',      //I = insert urgent appointment, R = reassign urgent appointment
            currentUrgentAppointment: null
        };
    }

    componentDidMount() {
        this.props.getUrgentRoomList({ clinicId: this.props.defaultClinic.siteId });
        this.updateReassignAppointment();
    }

    componentWillUnmount() {
        this.props.resetUrgentRoomList();
    }

    updateReassignAppointment = () => {
        if(this.props.urgentFunctionStatus == 'R'){
            if(this.props.sourceFrom == 'PatientSummary'){
                let currentUrgentAppointment = this.props.appointmentHistory.find(
                    appt => (moment(appt.appointmentDate, 'YYYY-MM-DD').format('YYYYMMDD') == moment().format('YYYYMMDD') && appt.isUrgSqueeze == 1 && appt.encounterBaseVo.encntrSts == 'N')
                );
                // console.log(JSON.stringify(currentUrgentAppointment));
                this.setState({currentUrgentAppointment: currentUrgentAppointment});
            }
            else{ // soruceFrom should be 'DtsBooking'
                let currentUrgentAppointment = this.props.patientAppointmentList.find(
                    appt => (moment(appt.appointmentDateTime).format('YYYYMMDD') == moment().format('YYYYMMDD') && appt.isUrgentSqueeze == 1 && appt.encounterBaseVo.encounterStatus == 'N')
                );
                // console.log(JSON.stringify(currentUrgentAppointment));
                this.setState({currentUrgentAppointment: currentUrgentAppointment});
            }
        }
    }

    handleDiscNumberOnChange = (value) => {
        this.setState({ discNumber: value });
    }

    handleCancel = () => {
        this.props.closeConfirmDialog();
    }

    editOnClick =(value) => {
        console.log('editOnClick');
        this.setState({ roomId: value.roomId}, () => {
            this.refs.form.submit();
        });
    }

    reassignOnClick = (value) => {
        console.log('reassignOnClick');
        this.setState({ roomId: value.roomId}, () => {
            this.refs.form.submit();
        });
    }

    skipTheSameRoomForReassign = (room) => {
        if(this.props.urgentFunctionStatus == 'R') {
            if(this.props.sourceFrom == 'DtsBooking' && room.roomId == this.state.currentUrgentAppointment.roomId)
                return true;
            else if(this.props.sourceFrom == 'PatientSummary' && room.roomId == this.state.currentUrgentAppointment.rmId)
                return true;
            else
                return false;
        }
        else
        {
            return false;
        }
    }

    handleOnSubmit = () => {
        // this.props.refreshApptHitory, this.props.refreshDailyView
        if(this.props.urgentFunctionStatus == 'I') {

            this.props.insertUrgentAppointment(
                {
                    apptDate:moment().format(),
                    isObs:0,
                    isSqueeze:1,
                    isUrg:1,
                    isUrgSqueeze:1,
                    patientKey:this.props.patientInfo.patientKey,
                    qtId:'QT1',
                    rmId:this.state.roomId,
                    seq:0,
                    siteId:this.props.defaultClinic.siteId,
                    sessCd: '%',
                    byPassWarning: false
                },
                [this.props.closeConfirmDialog, ...this.props.callbackList]
            );
        }
        else if(this.props.urgentFunctionStatus == 'R'){
            this.props.reassignUrgentAppointment(
                {
                    apptDate:moment().format(),
                    apptId:this.state.currentUrgentAppointment.appointmentId,
                    patientKey: this.state.currentUrgentAppointment.patientKey,
                    reschRsnRemark: 'Doctor Request (Case Distribution)',
                    reschRsnTypeId: 10442, // hardcode >> DRC   Doctor Request (Case Distribution)
                    rmId: this.state.roomId,
                    sessCd: this.props.urgentRoomList[0].sessionDescription,
                    siteId: this.props.defaultClinic.siteId
                },[this.props.closeConfirmDialog, ...this.props.callbackList]
            );
        }

        // Below part was designed to move the insert urgent appointment API call, refresh day view & appointment list to the booking.js,
        // but this urgent booking dialog is also quoted at the patient summary page. So we stay the call and refresh on this component as of the above.

        // let urgentAppointmentObj = {    room: this.props.roomList.find(rm=> rm.rmId === value.roomId),
        //                                 date: moment(),
        //                                 siteId: this.props.defaultClinic.siteId,
        //                                 patientKey: this.props.patientInfo.patientKey
        //                             };
        // new Promise((resolve) => {
        //     this.props.addToUrgentAppointmentObj(urgentAppointmentObj, resolve);
        // }).then(() => {
        //     this.props.setFilterMode(1);
        //     this.props.setCalendarDetailDate(urgentAppointmentObj.date.startOf('day'));
        //     this.props.setSelectedRoom({room: urgentAppointmentObj.room});
        //     return true;
        // }).then(() => {
        //     return new Promise((resolve) => {
        //         this.props.confirmUrgentAppointmentDialog(resolve);
        //     });
        // }).then(() =>{
        //     this.props.closeConfirmDialog();
        // });
    }

    sortUrgentRoomList = (a, b) => {
        if (a.roomId == this.props.defaultRoomId)
            return -1;
        else if(Number(a.roomCode.substring(1)) < Number(b.roomCode.substring(1)))
            return -1;
        else
            return 1;
    }

    render() {
        const { classes, openConfirmDialog, defaultClinic, urgentRoomList, defaultRoomId, ...rest } = this.props;
        const selectedClientType = 'EP';

        return (
            <CIMSDialog id="dtsUrgentAppointmentDialog" dialogTitle="Making Urgent Appointment" open={openConfirmDialog} dialogContentProps={{ style: { width: 580, padding:15 } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    <DialogContent id={'dtsAppointmentDailogContent'} style={{ padding: 0 }}>
                        <div className={classes.root}>
                            <Grid container spacing={0}>
                                <Grid item xs={12}>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper square className={classes.paper + ' ' + classes.label}>Clinic</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper square className={classes.paper + ' ' + classes.info}>{defaultClinic.siteCd}</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper square className={classes.paper + ' ' + classes.label}>Session</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                <Paper square className={classes.paper+' '+classes.info}>{(urgentRoomList && urgentRoomList[0]) ? urgentRoomList[0].sessionDescription : 'N/A'}</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper square className={classes.paper + ' ' + classes.label}>Client Type</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper square className={classes.paper + ' ' + classes.info}>{selectedClientType}</Paper>
                                </Grid>
                                {/* <Grid item xs={12}><Paper square className={classes.paper + ' ' + classes.blankLabel}></Paper></Grid> */}
                                <Grid item xs={12} style={{padding:15}}>
                                    <TextFieldValidator
                                        // className={classes.textArea}
                                        id={'discNoField'}
                                        value={this.state.discNumber}
                                        disabled
                                        variant="outlined"
                                        label={<>Disc Number</>}
                                        inputProps={{ maxLength: 100 }}
                                        absoluteMessage
                                        onChange={e => this.handleDiscNumberOnChange(e.target.value)}
                                    />
                                </Grid>
                                {/* <Grid item xs={12}>
                                    <Paper square className={classes.paper+' '+classes.blankLabel}></Paper>
                                </Grid> */}
                            </Grid>
                            <Grid>
                                <Paper square className={classes.paper+' '+classes.label}>Surgery Selection
                                    <Table className={classes.table} aria-label="caption table">
                                        <TableHead>
                                            <TableRow className={classes.tableRow}>
                                                <TableCell align="center" className={classes.headerTableCell}>#</TableCell>
                                                <TableCell align="center" className={classes.headerTableCell}>Surgery</TableCell>
                                                <TableCell align="center" className={classes.headerTableCell}>Urgent Patient Def. Rm/Oth.</TableCell>
                                                <TableCell align="center" className={classes.headerTableCell}>Current Encounter Type</TableCell>
                                                <TableCell align="center" className={classes.headerTableCell}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {urgentRoomList && urgentRoomList.sort(this.sortUrgentRoomList).map((item,index) => (
                                            <TableRow className={classes.tableRow} key={index} >
                                                <TableCell align="center" component="th" scope="row" className={defaultRoomId == item.roomId && classes.tableRowBold}>{defaultRoomId == item.roomId && '*'}{index+1}</TableCell>
                                                <TableCell align="center" className={defaultRoomId == item.roomId && classes.tableRowBold}>{item.roomCode}</TableCell>
                                                <TableCell align="center" className={defaultRoomId == item.roomId && classes.tableRowBold}>{dtsUtilities.formatUndefinedToZero(item.todayUrgentIsDefaultRoomCount) + ' / ' + dtsUtilities.formatUndefinedToZero(item.todayUrgentNotDefaultRoomCount)}</TableCell>
                                                <TableCell align="center" className={defaultRoomId == item.roomId && classes.tableRowBold}>{item.currentEncounterTypeCode}</TableCell>
                                                <TableCell className={classes.editIconTableCell} align="center">
                                                    {/* <EditIcon onClick={e => this.editOnClick(item)} style={{cursor:'pointer'}}/> */}
                                                    {(this.props.urgentFunctionStatus == 'I')
                                                    ?
                                                        (<EditIcon onClick={e => this.editOnClick(item)} style={{cursor:'pointer'}}/>)
                                                    :
                                                        !this.skipTheSameRoomForReassign(item) && (<CachedIcon onClick={e => this.reassignOnClick(item)} style={{cursor:'pointer'}}/>)
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </Grid>
                        </div>
                    </DialogContent>
                    <DialogActions className={classes.dialogAction}>
                        <CIMSButton
                            onClick={this.handleCancel}
                            color="primary"
                            id={'appointment_cancel'}
                        >Cancel</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            </CIMSDialog>
        );
    }
}

const mapStateToProps = (state) => {

    return {
        defaultClinic: state.login.clinic,
        patientInfo: state.patient.patientInfo,
        defaultRoomId: state.patient.defaultRoomId,
        urgentRoomList: state.dtsAppointmentBooking.urgentRoomList,
        patientAppointmentList: state.dtsAppointmentBooking.pageLevelState.patientAppointmentList,
        appointmentHistory: state.patient.appointmentHistory
    };
};

const mapDispatchToProps = {
    resetUrgentRoomList,
    insertUrgentAppointment,
    getUrgentRoomList,
    setCalendarDetailDate,
    setSelectedRoom,
    reassignUrgentAppointment
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsUrgentAppointmentDialog));
