import React, { Component } from 'react';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';

import {
    Grid,
    Paper,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableFooter,
    TableBody,
    TableRow,
    TableCell
} from '@material-ui/core';

import {
    Edit as EditIcon,
    Cached as CachedIcon,
    Delete as DeleteIcon
} from '@material-ui/icons';

import _ from 'lodash';

import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
// import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';

import {
    resetGpUrgentRoomList,
    insertGpUrgentAppointment,
    getGpUrgentRoomList,
    reassignUrgentAppointmentForGp,
    setUnavailableGpUrgentRoomList
} from '../../../../store/actions/dts/appointment/bookingAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';

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
        height:'18px'
    },
    label: {
        textAlign: 'left',
        fontWeight: 'bold'
    },
    info:{
        textAlign: 'left'
    },
    headerTableCell:{
        backgroundColor: '#48aeca',
        color: '#fff',
        fontWeight: 'normal',
        borderStyle: 'none'
    },
    footerTableCell:{
        backgroundColor: '#48aeca',
        color: '#fff',
        fontWeight: 'normal',
        borderStyle: 'none',
        fontSize: '1rem'
    },
    tableRow:{
        height:'auto'
    },
    tableRowBold:{
        fontWeight: 'bold'
    },
    editIconTableCell:{
        padding: '5px !important',
        color:'#48aeca'
    }
});

class DtsGpUrgentAppointmentDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openConfirmDialog: true,
            discNumber:'',
            roomId: '',
            //mode: 'I',      //I = insert urgent appointment, R = reassign urgent appointment
            currentUrgentAppointment: null
        };
    }

    componentDidMount() {
        this.props.getGpUrgentRoomList({clinicId:this.props.defaultClinic.siteId});
        this.updateReassignAppointment();
    }

    componentWillUnmount() {
        this.props.resetGpUrgentRoomList();
    }

    updateReassignAppointment = () => {
        if(this.props.urgentFunctionStatus == 'R'){
            if(this.props.sourceFrom == 'PatientSummary'){
                let currentUrgentAppointment = this.props.appointmentHistory.find(
                    appt => (moment(appt.appointmentDate, 'YYYY-MM-DD').format('YYYYMMDD') == moment().format('YYYYMMDD') && appt.isUrgSqueeze == 1 && appt.encounterBaseVo.encntrSts == 'N')
                );
                // console.log(JSON.stringify(currentUrgentAppointment));
                this.setState({currentUrgentAppointment: currentUrgentAppointment, discNumber: currentUrgentAppointment.attendanceBaseVo.discNum});
            }
            else{ // soruceFrom should be 'DtsBooking'
                let currentUrgentAppointment = this.props.patientAppointmentList.find(
                    appt => (moment(appt.appointmentDateTime).format('YYYYMMDD') == moment().format('YYYYMMDD') && appt.isUrgentSqueeze == 1 && appt.encounterBaseVo.encounterStatus == 'N')
                );
                // console.log(JSON.stringify(currentUrgentAppointment));
                this.setState({currentUrgentAppointment: currentUrgentAppointment, discNumber: currentUrgentAppointment.attendanceBaseVo.discNumber});
            }
        }
    }

    handleDiscNumberOnChange = (value) => {
        this.setState({discNumber: value});
    }

    handleCancel = () => {
        this.props.closeConfirmDialog();
    }

    editOnClick =(value) => {
        this.setState({ roomId: value.roomId}, () => {
            this.refs.form.submit();
        });
    }

    reassignOnClick = (value) => {
        this.setState({ roomId: value.roomId}, () => {
            this.refs.form.submit();
        });
    }

    checkRoomAvailable = (value) => {
        let {siteId, roomIdList} = this.props.unavailableUrgentRoomListForGp;
        if(siteId == this.props.defaultClinic.siteId){
            let resultInd = roomIdList.findIndex(roomId => roomId == value.roomId);
            if(resultInd != -1)
                return false;
            else
                return true;
        }
        return true;
    }

    toggleRoomAvailability = (value) => {
        // console.log('toggleRoomAvailability '+JSON.stringify(value));

        let {siteId, roomIdList} = this.props.unavailableUrgentRoomListForGp;
        let newRoomIdList;
        if(siteId == this.props.defaultClinic.siteId){
            newRoomIdList = [...roomIdList];
        }
        else{
            newRoomIdList = [];
        }

        let resultInd = newRoomIdList.findIndex(roomId => roomId == value.roomId);
        if(resultInd == -1){
            newRoomIdList = [...newRoomIdList, value.roomId];
        }
        else{
            newRoomIdList.splice(resultInd, 1);
        }

        this.props.setUnavailableGpUrgentRoomList(
            {
                siteId: this.props.defaultClinic.siteId,
                roomIdList: newRoomIdList
            }
        );
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'discNoText') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'discNoText') {
            errorMessages.push('Disc No. must be input.');
            return errorMessages;
        }
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
        // console.log('handleOnSubmit call, mode = '+this.state.mode);
        // this.updateReassignAppointment();
        // console.log(JSON.stringify(this.state.currentUrgentAppointment));
        // this.props.refreshApptHitory, this.props.refreshDailyView

        if(this.props.urgentFunctionStatus == 'I'){
            this.props.insertGpUrgentAppointment(
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
                    discNum: this.state.discNumber,
                    byPassWarning: false
                },[this.props.closeConfirmDialog, ...this.props.callbackList]
            );
        }
        else if(this.props.urgentFunctionStatus == 'R'){
            this.props.reassignUrgentAppointmentForGp(
                {
                    apptDate:moment().format(),
                    apptId:this.state.currentUrgentAppointment.appointmentId,
                    patientKey: this.state.currentUrgentAppointment.patientKey,
                    reschRsnRemark: 'Doctor Request (Case Distribution)',
                    reschRsnTypeId: 10442, // hardcode >> DRC   Doctor Request (Case Distribution)
                    rmId: this.state.roomId,
                    sessCd: this.props.urgentRoomListForGp[0].sessionDescription,
                    siteId: this.props.defaultClinic.siteId
                },[this.props.closeConfirmDialog, ...this.props.callbackList]
            );
        }
    }

    sortUrgentRoomList = (a, b) => {
        if(Number(a.roomCode.substring(1)) < Number(b.roomCode.substring(1)))
            return -1;
        else
            return 1;
    }

    totalGpAppointment = () => {
        let totalApptCount = 0;

        this.props.urgentRoomListForGp.forEach(room => {
            totalApptCount += room.gpApptCount;
        });

        return totalApptCount;
    }

    render(){
        const { classes, openConfirmDialog, defaultClinic, urgentRoomListForGp, defaultRoomId, ...rest } = this.props;
        const selectedClientType = 'GP';

        return (
            <CIMSDialog id="dtsGpUrgentAppointmentDialog" dialogTitle={((this.props.urgentFunctionStatus == 'I') ? 'Making' : 'Reassign') + ' GP Urgent Appointment'} open={openConfirmDialog} dialogContentProps={{ style: { width: 580, padding:15 } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    <DialogContent id={'dtsAppointmentDailogContent'} style={{ padding: 0 }}>
                        <div className={classes.root}>
                            <Grid container spacing={0}>
                                <Grid item xs={12}>
                                </Grid>
                                <Grid item xs={6}>
                                <Paper square  className={classes.paper+' '+classes.label}>Clinic</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                <Paper square className={classes.paper+' '+classes.info}>{defaultClinic.siteCd}</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                <Paper square  className={classes.paper+' '+classes.label}>Session</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                <Paper square className={classes.paper+' '+classes.info}>{(urgentRoomListForGp && urgentRoomListForGp[0]) ? urgentRoomListForGp[0].sessionDescription : 'N/A'}</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                <Paper square className={classes.paper+' '+classes.label}>Client Type</Paper>
                                </Grid>
                                <Grid item xs={6}>
                                <Paper square className={classes.paper+' '+classes.info}>{selectedClientType}</Paper>
                                </Grid>
                                {/* <Grid item xs={12}><Paper square className={classes.paper+' '+classes.blankLabel}></Paper></Grid> */}
                                <Grid item xs={12} style={{padding:15}}>
                                    <TextFieldValidator
                                        id={'discNoField'}
                                        value={this.state.discNumber}
                                        disabled={this.props.urgentFunctionStatus == 'R'}
                                        variant="outlined"
                                        label={<>Disc Number</>}
                                        inputProps={{ maxLength: 100 }}
                                        absoluteMessage
                                        validators={this.getValidator('discNoText')}
                                        errorMessages={this.getErrorMessage('discNoText')}
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
                                                <TableCell align="center" className={classes.headerTableCell}>GP Appt.</TableCell>
                                                <TableCell align="center" className={classes.headerTableCell}></TableCell>
                                                <TableCell align="center" className={classes.headerTableCell}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {urgentRoomListForGp && urgentRoomListForGp.sort(this.sortUrgentRoomList).map((item,index) => (
                                            <TableRow className={classes.tableRow} key={index} >
                                                <TableCell align="center" component="th" scope="row" className={defaultRoomId == item.roomId && classes.tableRowBold}>{index+1}</TableCell>
                                                <TableCell align="center" className={defaultRoomId == item.roomId && classes.tableRowBold}>{item.roomCode}</TableCell>
                                                <TableCell align="center" className={defaultRoomId == item.roomId && classes.tableRowBold}>{item.gpApptCount}</TableCell>
                                                <TableCell className={classes.editIconTableCell} align="center">
                                                    {(this.props.urgentFunctionStatus == 'I')
                                                    ?
                                                        this.checkRoomAvailable(item) && (<EditIcon onClick={e => this.editOnClick(item)} style={{cursor:'pointer'}}/>)
                                                    :
                                                        this.checkRoomAvailable(item) && !this.skipTheSameRoomForReassign(item) && (<CachedIcon onClick={e => this.reassignOnClick(item)} style={{cursor:'pointer'}}/>)
                                                    }
                                                </TableCell>
                                                <TableCell className={classes.editIconTableCell} align="center">
                                                    <DeleteIcon onClick={e => this.toggleRoomAvailability(item)} style={{cursor:'pointer'}}/>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow className={classes.tableRow}>
                                                <TableCell align="center" className={classes.footerTableCell}></TableCell>
                                                <TableCell align="center" className={classes.footerTableCell}>Total : </TableCell>
                                                <TableCell align="center" className={classes.footerTableCell}>{this.totalGpAppointment()}</TableCell>
                                                <TableCell align="center" className={classes.footerTableCell}></TableCell>
                                                <TableCell align="center" className={classes.footerTableCell}></TableCell>
                                            </TableRow>
                                        </TableFooter>
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

function mapStateToProps(state) {
    return {
        defaultClinic: state.login.clinic,
        patientInfo: state.patient.patientInfo,
        urgentRoomListForGp: state.dtsAppointmentBooking.urgentRoomListForGp,
        patientAppointmentList: state.dtsAppointmentBooking.pageLevelState.patientAppointmentList,
        appointmentHistory: state.patient.appointmentHistory,
        unavailableUrgentRoomListForGp: state.dtsAppointmentBooking.unavailableUrgentRoomListForGp
    };
}

const mapDispatchToProps = {
    resetGpUrgentRoomList,
    insertGpUrgentAppointment,
    getGpUrgentRoomList,
    reassignUrgentAppointmentForGp,
    setUnavailableGpUrgentRoomList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsGpUrgentAppointmentDialog));