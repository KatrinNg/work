import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Paper,
    DialogContent,
    DialogActions
} from '@material-ui/core';

import _ from 'lodash';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import {
    getUnavailableReasons,
    insertUnavailableTimeslot,
    getDailyView
} from '../../../../store/actions/dts/appointment/bookingAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import Enum from '../../../../enums/enum';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';

const styles = {
    root: {
        width: '750px'
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
        textAlign: 'center'
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
        //margin:'auto',
        //marginTop:'10px'
    },    timeSelection:{
        width: '150px'
    }

};

class DtsCloseTimeSlotDialog extends Component {

    constructor(props){
        super(props);
        this.state = {
            selectedReason: null,
            remarks: '',
            selectedStartTime: null,
            selectedStartTimeId: null,
            selectedEndTime: null,
            dayViewTimeslotList: null,
            appointmentIndex: null,
            isUpdated:false

        };
    }

    componentDidMount(prevProps, pervState){
        //console.log('unavilable reasons: ' + this.props.getUnavailableReasons());
        //this.props.getUnavailableReasons();
        this.props.getUnavailableReasons();
        this.getDailyViewTimeslotList();
    }

    componentDidUpdate(prevProps){
        if(this.props.selectedCloseTimeSlot && (prevProps.selectedCloseTimeSlot == null || prevProps.selectedCloseTimeSlot != this.props.selectedCloseTimeSlot)){
            this.setDefaultStartTime();
            this.setDefaultEndTime();
        }
    }

    setDefaultStartTime =() => {
        this.setState({selectedStartTime: this.props.selectedCloseTimeSlot.timeslots[0].startTime});
        this.setState({selectedStartTimeId: this.props.selectedCloseTimeSlot.timeslots[0].id});
    }

    setDefaultEndTime =() => {
        this.setState({selectedEndTime: this.props.selectedCloseTimeSlot.timeslots[this.props.selectedCloseTimeSlot.timeslots.length - 1].endTime});
         //this.setState({selectedStartTimeId: this.props.selectedCloseTimeSlot.timeslots[0].id});
    }


    handleOnSubmit = () => {
        // console.log('handleOnSubmit call');
        this.handleCloseTimeSlotConfirm();
    }

    handleCloseTimeSlotConfirm = () =>{

        let calendarDate = new Date(this.props.calendarDetailDate).getTimezoneOffset();

        this.props.insertUnavailableTimeslot({
            svcCd: this.props.serviceCd,
            siteIds: [ this.props.selectedClinic.siteId ],
            wholeServiceFlag: '0',
            wholeClinicFlag: '0',
            assignedRoomIds: [ this.props.selectedRoom.rmId ],
            startDate:moment(this.props.calendarDetailDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
            endDate:moment(this.props.calendarDetailDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE),
            startTime: moment(this.state.selectedStartTime, 'HH:mm').format('HH:mm'),
            endTime: moment(this.state.selectedEndTime, 'HH:mm').format('HH:mm'),
            wholeDayFlag: '0',
            unavailPerdRsnId:this.state.selectedReason.unavailPerdRsnId,
            remark: this.state.remarks,
            remarkChi: this.state.remarks
        }, ((rmId, date) => {
            return () => {
                this.props.getDailyView({ rmId, date});
            };
        })(this.props.selectedRoom.rmId, this.props.calendarDetailDate));
        this.props.closeConfirmDialog();

    }

    // handleCloseTimeSlotConfirm = () =>{
    //      // create upm
    //      let params = {
    //         svcCd: this.props.serviceCd,
    //         siteIds: this.props.selectedClinic,
    //         wholeServiceFlag: 0,
    //         wholeDayFlag: 0,
    //         wholeClinicFlag: 0,
    //         startDate: moment(this.props.calendarDetailDate).format('YYYY-MM-DD'),
    //         endDate: moment(this.props.calendarDetailDate).format('YYYY-MM-DD'),
    //         startTime: dialogInfo.dialogStartTime && moment(dialogInfo.dialogStartTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
    //         endTime: dialogInfo.dialogStartTime && moment(dialogInfo.dialogEndTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
    //         assignedRoomIds: (dialogInfo.dialogIsWholeService || dialogInfo.dialogIsWholeClinic) ? [] : dialogInfo.dialogAssginedRoomList,
    //         unavailPerdRsnId: this.state.selectedReason.id,
    //         remark: this.state.remarks
    //     };
    //     this.props.createUpm(params, () => {
    //         this.handleClose();
    //         this.props.deselectAllFnc();
    //         let params = {
    //             siteId: this.props.upmSiteId === '*All' ? null : this.props.upmSiteId,
    //             svcCd: this.props.serviceCd
    //         };
    //         this.props.listUpmList(this.props.clinicList, params);
    //     });
    // }

    handleSubmitError = () => {

    }

    handleCancel = () => {
        if(this.state.isUpdated) {
            this.props.openCommonMessage({
                msgCode: '110018',
                btnActions: {
                    btn1Click: () => {
                        this.props.closeConfirmDialog();
                    }
                }
            });
        } else {
        this.props.closeConfirmDialog();
        }
    }

    handleRemarkOnChange = (value) => {
        if(value != this.state.remarks) {
            this.setState({remarks: value});
            this.setState({isUpdated:true});
        }
    }

    handleReasonChange = (value) => {
        if(value != this.state.selectedReason) {
            this.setState({selectedReason: value});
            this.setState({isUpdated:true});
        }
    }
    handleStartTimeChange = (value) => {
        if( value != this.state.selectedStartTime) {
            this.setState({selectedStartTime: value} );
            this.setState({isUpdated:true});
        }
    }


    handleEndTimeChange = (value) => {
        if(value != this.state.selectedEndTime) {
            this.setState({selectedEndTime: value});
            this.setState({isUpdated:true});
        }
    }

    updateEndTime = (timeSlotList) => {
        let tempEndTimeList = [];

        if(timeSlotList && timeSlotList.length > 0){
            let isMatch = false;
                for(let i = 0; i< timeSlotList.length; i++){

                //  if(this.state.selectedStartTime && this.state.selectedStartTime.id == timeSlotList[i].id){
                //      isMatch = true;
                //  }
                 if(this.state.selectedStartTime && this.state.selectedStartTimeId == timeSlotList[i].id){
                    isMatch = true;
                }
                 if(isMatch){
                     tempEndTimeList.push({code: timeSlotList[i].endTime, label: timeSlotList[i].endTime});
                 }
             }
        }
        return tempEndTimeList;

    }

    updateTimeList = (selectedTimeList) => {
        let tempStartTimeList = [];

        tempStartTimeList = selectedTimeList;

        return tempStartTimeList;

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


    getItemIndex = (arr,value) => {


        if(Array.isArray(arr)){

            if(value != null){

                for(let i = 0; i < arr.length; i++) {
                    if(arr[i].id === value.id) {
                        return i;
                    }
                }
            }
            return 0;
        }

    }
    getDailyViewTimeslotList = () =>{
        let dayViewTimeslotList = [...this.props.selectedDayTimeslotList.ameohList,...this.props.selectedDayTimeslotList.amList,...this.props.selectedDayTimeslotList.pmList,...this.props.selectedDayTimeslotList.pmeohList,...this.props.selectedDayTimeslotList.edcList];

        dayViewTimeslotList = dayViewTimeslotList.filter(function (el) {
            return el != null;
          });

          this.setState({dayViewTimeslotList: dayViewTimeslotList});
    }


    render(){
        const { classes, openConfirmDialog, unavailableReasons, DailyViewList, selectedDailyViewTimeslot,selectedDayTimeslotList,selectedCloseTimeSlot, ...rest } = this.props;

        console.log('selected close timeslot start time: ' + JSON.stringify(this.state.selectedStartTime));



        return(

            <div>

            <CIMSDialog id="dtsCloseTimeSlotDialog" dialogTitle="Close Timeslot" open={openConfirmDialog} dialogContentProps={{ style: { width: '100%' } }}>

                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError} >
                        <DialogContent id={'dtsCloseTimeSlotDialog'}  style={{ padding: 0 }}>
                            <div className={classes.root}>

                                <Grid container spacing={0}>
                                    <Grid item xs={12} className={classes.header}>
                                        <label className={classes.dialogHeadLabel}>Please enter the reason for closing timeslot(s) and confirm. </label>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Time</Paper>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Paper square className={classes.paperGroup}>
                                            <Grid className={classes.selectorDiv}>
                                                <div className={classes.paperGroupItem +' '+classes.timeSelection}>
                                                            <DtsSelectFieldValidator
                                                                id={'startTimeSelect'}
                                                                isDisabled={false}
                                                                isRequired
                                                                TextFieldProps={{
                                                                    variant: 'outlined',
                                                                    label: <>Start Time<RequiredIcon /></>
                                                                }}
                                                                options={this.state.dayViewTimeslotList && this.state.dayViewTimeslotList.map((item) => ({value:item.startTime, label:item.startTime}))}
                                                                value={this.state.selectedStartTime}
                                                                //value={}
                                                                //value={this.state.dayViewTimeslotList[0].startTime}
                                                                //defaultValue={this.state.dayViewTimeslotList && this.state.dayViewTimeslotList.filter((item) => item.startTime == this.state.selectedStartTime.startTime)}
                                                                msgPosition="bottom"
                                                                validators={this.getValidator('startTimeSelector')}
                                                                errorMessages={this.getErrorMessage('startTimeSelector')}
                                                                onChange={e => this.handleStartTimeChange(e.value)}
                                                            />


                                                </div>


                                                <div className={classes.paperGroupItem +' '+classes.timeSelection}>
                                                        <DtsSelectFieldValidator
                                                            id={'endTimeSelect'}
                                                            isDisabled={false}
                                                            isRequired
                                                            TextFieldProps={{
                                                                variant: 'outlined',
                                                                label: <>End Time<RequiredIcon /></>
                                                            }}
                                                            //options={DailyViewList && DailyViewList.map((item) => ({value:item, label:item.endTime}))}
                                                            options={this.state.dayViewTimeslotList  && this.updateEndTime(this.state.dayViewTimeslotList).map((item) => ({ value: item.code, label: item.label }))}
                                                            value={this.state.selectedEndTime}
                                                            msgPosition="bottom"
                                                            validators={this.getValidator('endTimeSelector')}
                                                            errorMessages={this.getErrorMessage('endTimeSelector')}
                                                            onChange={e => this.handleEndTimeChange(e.value)}
                                                        />
                                                </div>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Reason</Paper>
                                    </Grid>
                                    <Grid item xs={9}>
                                    <Paper square className={classes.paperGroup}>
                                        <Grid className={classes.selectorDiv}>
                                                <div className={classes.paperGroupItem +' '+classes.reasonSelection}>
                                                    <DtsSelectFieldValidator
                                                        id={'reasonSelect'}
                                                        isDisabled={false}
                                                        isRequired
                                                        TextFieldProps={{
                                                            variant: 'outlined',
                                                            style: { width: 350 },
                                                            label: <>Select a reason <RequiredIcon /></>
                                                        }}
                                                        options={unavailableReasons&& unavailableReasons.unavailableReasons && unavailableReasons.unavailableReasons.map((item) => ({value:item, label:item.rsnDesc}))}
                                                        value={this.state.selectedReason}
                                                        msgPosition="bottom"
                                                        validators={this.getValidator('reasonSelector')}
                                                        errorMessages={this.getErrorMessage('reasonSelector')}
                                                        onChange={e => this.handleReasonChange(e.value)}
                                                    />
                                                </div>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={3} className={classes.cellResize}>
                                            <Paper square  className={classes.paper+' '+classes.label} elevation={0}>Remarks</Paper>
                                    </Grid>

                                    <Grid item xs={9}>
                                        <Paper square className={classes.paperGroup}>
                                            <Grid className={classes.selectorDiv}>
                                                <div className={classes.paperGroupItem+' '+classes.info}>
                                                        {/* <TextFieldValidator
                                                            id={'remarksTextField'}
                                                            value={this.state.remarks}
                                                            variant="outlined"
                                                            label={<>Remarks </>}
                                                            inputProps={{ style: { height: 250, width: 350 }, maxLength: 500 }}
                                                            onChange={e => this.handleRemarkOnChange(e.target.value)}
                                                        /> */}
                                            <CIMSMultiTextField
                                                className={classes.remarksTextField}
                                                id={'remarksTextField'}
                                                label={<>Remarks </>}
                                                value={this.state.remarks}
                                                onChange={e => this.handleRemarkOnChange(e.target.value)}
                                            >
                                            </CIMSMultiTextField>

                                                </div>
                                            </Grid>
                                        </Paper>
                                    </Grid>

                                 </Grid>

                            </div>
                        </DialogContent>

                    <DialogActions className={classes.dialogAction}>

                        <CIMSButton
                            onClick={() => this.refs.form.submit()}
                            id={'attendance_confirm'}
                            color="primary"
                        >Confirm</CIMSButton>
                        <CIMSButton
                            onClick={this.handleCancel}
                            color="primary"
                            id={'attendance_cancel'}
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
        unavailableReasons: state.dtsAppointmentBooking.pageLevelState.unavailableReasons,
        DailyViewList: state.dtsAppointmentBooking.pageLevelState.dailyView,
        selectedDailyViewTimeslot: state.dtsAppointmentBooking.selectedDailyViewTimeslot,
        selectedDayTimeslotList: state.dtsAppointmentBooking.selectedDayTimeslotList,
        serviceCd: state.login.service.serviceCd,
        selectedClinic: state.dtsAppointmentBooking.pageLevelState.selectedClinic,
        calendarDetailDate: state.dtsAppointmentBooking.pageLevelState.calendarDetailDate,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        selectedCloseTimeSlot: state.dtsAppointmentBooking.selectedCloseTimeSlot
    };
};

const mapDispatchToProps = {
    getUnavailableReasons,
    getDailyView,
    insertUnavailableTimeslot,
    openCommonMessage
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsCloseTimeSlotDialog));

