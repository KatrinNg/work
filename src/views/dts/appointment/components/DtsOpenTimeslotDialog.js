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

import _ from 'lodash';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import Checkbox from '@material-ui/core/Checkbox';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import Enum from '../../../../enums/enum';
import {
    deleteUnavailablePeriod,
    getDailyView
} from '../../../../store/actions/dts/appointment/bookingAction';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = {
    root: {
        width: '100%'
    },

    table: {
        paddingTop: '10px',
        width: '100%'
    },
    paperGroup:{
        padding: '0px',
        height: '270'
    },
    confirmPanel: {
        padding: 0,
        width: 500
    },
    paper: {
        padding: '10px',
        textAlign: 'left'
        // color: 'black'
    },

    label: {
        fontWeight: 'bold'
    },title: {
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#ccc',
        fontWeight: 'bold',
        borderStyle: 'none'

    },
    optionRoot:{
        marginLeft: '0px'
    },
    dialogHeadLabel:{
        color: 'black',
        textAlign: 'left'
    },
    requireResonIcon:{
        color:'red'
    },
    cellBigResize:{
        'flex-basis':'75% !important',
        'max-width': '100% !important'
    },cellResize:{
        maxWidth:'25% !important'
    },header:{
        marginBottom: '10px'
    },reasonSelection:{
        width: '300px'
    }, selectorDiv:{
        display: 'flex'
    },paperGroupItem:{
        padding: '10px'
    },
    info:{
        textAlign: 'left',
        fontSize: '15.5px'
    },remarksTextField:{
        width:'350px'
    },    timeSelection:{
        width: '150px'
    },
    headerTableCell:{
        backgroundColor: '#48aeca',
        color: '#ffffff',
        fontSize:'13px',
        borderStyle: 'none',
        textAlign:'left',
        'max-width': '100% !important'
    }

};

class DtsOpenTimeslotDialog extends Component {

    constructor(props){
        super(props);
        this.state = {
            selectedUnavailablePeriodId: []
        };
    }

    componentDidMount(prevProps, pervState){

    }

    componentDidUpdate(prevProps){

    }



    handleOnSubmit = () => {
        let selectedUnavailPerdId = '';

        selectedUnavailPerdId = this.state.selectedUnavailablePeriodId[0];

        this.props.deleteUnavailablePeriod({
            unavailPerdId: selectedUnavailPerdId
        });

        this.props.getDailyView({ rmId: this.props.selectedRoom.rmId, date: moment(this.props.calendarDetailDate)});
    }


    handleCancel = () => {

        this.props.closeConfirmDialog();
    }


    getValidator = (name) => {
        let validators = [];

        if (name === 'reasonSelector') {
            validators.push('required');
            return validators;
        }if (name === 'remarksText') {
            validators.push('required');
            return validators;
        }

    }

    getErrorMessage = (name) => {
        let errorMessages = [];

        if (name === 'reasonSelector') {
            errorMessages.push('Reason cannot be null');
            return errorMessages;
        }if (name === 'startTimeSelector') {
            errorMessages.push('Start Time cannot be null');
            return errorMessages;
        }
        if (name === 'endTimeSelector') {
            errorMessages.push('End Time cannot be null');
            return errorMessages;
        }
    }



    getCloseTimeSlotItem(idx, item, classes){
       return (
         <TableRow key={idx}>
                <TableCell >
                    <Checkbox
                        label={idx} key={idx.toString()}
                        onClick={event => this.handleClick(event.target.checked, idx)}
                        checked={this.state.selectedUnavailablePeriodId.includes(idx)}
                        disabled={(item.isWholeClinic == '0')? false:true}
                    />
                </TableCell>
                <TableCell className={classes.tableCell}>
                    {moment(item.startDate).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}
                </TableCell>
                <TableCell className={classes.tableCell}>
                    {moment(item.endDate).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}
                </TableCell>
                <TableCell className={classes.tableCell}>
                    {this.checkScope(item)}
                </TableCell>
                <TableCell className={classes.tableCell}>
                    {item.unavailablePeriodReason}
                </TableCell>
                <TableCell className={classes.tableCell}>
                    {item.remark}
                </TableCell>
                <TableCell className={classes.tableCell}>
                    {this.getCreatedUserName(item)}
                </TableCell>
                <TableCell className={classes.tableCell}>
                    {this.getCreationDate(item)}
                </TableCell>
        </TableRow>

        );
    }

    refreshTimeSlotPanel = () =>{
        //console.log('test: ');
    }

    handleClick = (event, idx) =>{
        let tempArray = _.clone(this.state.selectedUnavailablePeriodId);

        if(event){
            if(tempArray.length == 0){
                tempArray.push(idx);
                this.setState({selectedUnavailablePeriodId:tempArray});
            }else{
                tempArray.pop(tempArray[0]);
                tempArray.push(idx);
                this.setState({selectedUnavailablePeriodId:tempArray});
            }
        }else{
            tempArray.pop(idx);
            //tempArray.pop(item);
            this.setState({selectedUnavailablePeriodId:tempArray});
        }
    }
    checkScope(item){
        let isWholeClinic = '';

        if(item.isWholeClinic == '0'){
            isWholeClinic = 'Room';
        }else{
            isWholeClinic = 'Clinic';
        }

        return isWholeClinic;

    }

    getCreatedUserName(item){
        if (!item.updateUser) return 'SYSTEM';

        let genderTitle = '';
        let createdUserName = '';

        //console.log('item.updateUser.salutation: ' + item.updateUser.salutation);
        if(item.updateUser.salutation){
            //console.log('Entered!');
            genderTitle = item.updateUser.salutation;
            createdUserName = genderTitle + '. ' + item.updateUser.engGivenName + ' ' + item.updateUser.engSurname;
        }else{
            createdUserName = item.updateUser.engGivenName + ' ' + item.updateUser.engSurname;
        }
        return createdUserName;
    }

    getCreationDate(item){
        let creationDate = '';

        //creationDate = item.updateDate.substring(0, 10);

        //console.log('creationDate: ' + creationDate);
        creationDate = moment(item.updateDate).format('DD-MM-YYYY HH:mm');

        return creationDate;
    }

    render(){
        const { classes, openConfirmDialog, selectedClinic,selectedRoom, calendarDetailDate, ...rest } = this.props;

        let clinicName = '';
        let roomDesc = '';
        let date = '';

        if(selectedClinic)
        clinicName = selectedClinic.clinicName;

        if(selectedRoom)
        roomDesc = selectedRoom.rmCd;

        if(calendarDetailDate)
        date = moment(this.props.calendarDetailDate).format(DTS_DATE_DISPLAY_FORMAT);

        return(

            <div>

            <CIMSDialog id="dtsOpenTimeSlotDialog" dialogTitle="Unavailable Period Information" open={openConfirmDialog} dialogContentProps={{ style: { width: '100%' } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError} >
                        <DialogContent id={'dtsOpenTimeSlotDialog'}  style={{ padding: 0 }}>
                            <div className={classes.root}>
                                <Grid container spacing={0}>
                                    <Grid item xs={5} className={classes.cellResize}>
                                        <Paper square  className={classes.paper+' '+classes.label}>Clinic/Unit </Paper>
                                    </Grid>
                                    <Grid item xs={7} className={classes.cellBigResize}>
                                        <Paper square className={classes.paper+' '+classes.info}>{clinicName}</Paper>
                                    </Grid>
                                    <Grid item xs={5} className={classes.cellResize}>
                                        <Paper square  className={classes.paper+' '+classes.label}>Surgery </Paper>
                                    </Grid>
                                    <Grid item xs={7} className={classes.cellBigResize}>
                                        <Paper square className={classes.paper+' '+classes.info}>{roomDesc}</Paper>
                                    </Grid>
                                    <Grid item xs={5} className={classes.cellResize}>
                                        <Paper square  className={classes.paper+' '+classes.label}>Timeslot Date </Paper>
                                    </Grid>
                                    <Grid item xs={7} className={classes.cellBigResize}>
                                        <Paper square className={classes.paper+' '+classes.info}>{date}</Paper>
                                    </Grid>
                                 </Grid>
                                <br></br>
                                <br></br>
                                 <Table className={classes.table} aria-label="caption table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className={classes.headerTableCell}></TableCell>
                                                <TableCell className={classes.headerTableCell}>Start Time</TableCell>
                                                <TableCell className={classes.headerTableCell}>End Time</TableCell>
                                                <TableCell className={classes.headerTableCell}>Scope</TableCell>
                                                <TableCell className={classes.headerTableCell}>Close Reason</TableCell>
                                                <TableCell className={classes.headerTableCell}>Remark</TableCell>
                                                <TableCell className={classes.headerTableCell}>Created By</TableCell>
                                                <TableCell className={classes.headerTableCell}>Created On</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                 _.uniqWith(this.props.DailyViewList
                                                 .filter(item => item.type === 'U')
                                                 .flatMap(item => item.unavailablePeriods), function(arrVal, othVal) {
                                                      return arrVal.unavailPerdId === othVal.unavailPerdId;})
                                                 .map((row, idx) => {return this.getCloseTimeSlotItem(row.unavailPerdId, row, classes);})
                                            }
                                        </TableBody>
                                </Table>
                            </div>
                        </DialogContent>

                        <DialogActions className={classes.dialogAction}>
                            <CIMSButton
                                onClick={() => this.refs.form.submit()}
                                id={'open_closed_timeslot_confirm'}
                                color="primary"
                            >Confirm</CIMSButton>
                            <CIMSButton
                                onClick={this.handleCancel}
                                color="primary"
                                id={'open_closed_timeslot_cancel'}
                            >Cancel</CIMSButton>
                        </DialogActions>
                </ValidatorForm>
        </CIMSDialog>
            </div>

        );
    }
}

const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);
    return {
        serviceCd: state.login.service.serviceCd,
        selectedClinic: state.dtsAppointmentBooking.pageLevelState.selectedClinic,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        calendarDetailDate: state.dtsAppointmentBooking.pageLevelState.calendarDetailDate,
        DailyViewList: state.dtsAppointmentBooking.pageLevelState.dailyView
    };
};

const mapDispatchToProps = {

    deleteUnavailablePeriod,
    getDailyView
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsOpenTimeslotDialog));







