import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Paper,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    IconButton,
    Checkbox,
    FormControlLabel
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import CancelIcon from '@material-ui/icons/Cancel';

import _ from 'lodash';

import DtsBookingAlert from './DtsBookingAlert';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import RadioFieldValidator from '../../../../components/FormValidator/RadioFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
// import { getGdDefaultRoom } from '../../../../store/actions/dts/patient/DtsDefaultRoomAction';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';

import {
    getEncounterTypeList
} from '../../../../store/actions/dts/appointment/bookingAction';
import { TooltipWrapper }from '../../../../utilities/dtsUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
import { getRescheduleReasons } from '../../../../store/actions/appointment/booking/bookingAction';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = () => ({
    root: {
        flexGrow: 1,
        fontFamily:'Microsoft JhengHei, Calibri',
        overflow: 'auto',
        height: '700px'
    },
    paper: {
        padding: '10px',
        textAlign: 'center'
        // color: 'black'
    },
    paperGroup:{
        padding: '0px',
        height: '330px'
    },
    paperGroupItem:{
        padding: '10px'
    },
    paperDefaultRoomLabel:{
        padding: '20px 10px 0px 10px',
        textAlign: 'center',
        height: '50px'
    },
    paperDefaultRoom:{
        padding: '10px',
        height: '50px'
    },
    paperEncounterType:{
        padding: '0px'
    },
    dateListItem:{
        textAlign: 'right',
        '&.rescheduleValueHasDifference' :{
            color:'#ff0000'
        }
    },
    dateListItemSelect:{
        backgroundColor: 'aliceblue'
    },
    errorListItem:{
        minWidth: '25px'
    },
    errorIcon:{
        color: 'red'
    },
    deleteIcon:{
        padding: '8px'
    },
    selectorDiv:{
        display: 'flex'
    },
    timeSelection:{
        width: '150px'
    },
    encounterTypeSelection:{
        width: '450px'
    },
    referralListItemSelection:{
        width: '450px'
    },
    durationSelection:{
        width: '200px'
    },
    label: {
        // textAlign: 'right',
        fontWeight: 'bold',
        height:'100%'
    },
    info:{
        textAlign: 'left',
        fontSize: '15.5px',
        '&.rescheduleValueHasDifference' :{
            color:'#ff0000'
        }
    },
    textArea:{
        height: '75px'
    },
    cellResize:{
        maxWidth:'25% !important'
    },
    cellBigResize:{
        'flex-basis':'75% !important',
        'max-width': '100% !important'
    },
    errMsg:{
        color:'red'
    },
    selectFieldInput:{
        '&.rescheduleValueHasDifference' :{
            background: 'rgba(255, 0, 0, 0.75)',
            borderRadius: '5px',
            backgroundOrigin: 'padding-box'
        }
    },
    tableLayout:{
        maxHeight: '330px',
        overflowY: 'auto',
        borderCollapse: 'separate'
    },
    referralItemInput: {
        display: 'flex',
        height: 'auto'
    },
    tooltipUl: {
        padding: '1px',
        margin: '1px',
        listStyleType: 'none'
    },
    tooltipLi: {
        padding: '1px',
        margin: '1px'
    }
});

class DtsAppointmentDialog extends Component {

    constructor(props){
        super(props);
        this.state = {
            openConfirmDialog: false,
            appointmentIndex: 0,
            callbackFunc: null,
            lastAppointmentObj: null,
            // newDefaultRoomId: null,

            // Data for Default Room update
            defaultRoomInfo: {
                isPromptDefaultRoom: false,
                defaultRoomLabel: 'Nil',
                defaultRoomIdStr: null,
                selectedRoomLabel: 'Nil',
                selectedRoomIdStr: null
            },
            isUpdated:false
        };
    }

    componentDidMount(){
        // console.log('generalAppointmentObjList = ' + JSON.stringify(this.props.generalAppointmentObjList));

        this.setAllDefaultAppointmentTime();
        this.setAllDefaultDurationMin();
        this.setAllInitReferralList();
        this.checkAllError();

        this.setState({lastDailyView: this.props.generalAppointmentObjList[this.props.generalAppointmentObjList.length -1]});

        // single appointment will check default room.
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT){
            this.refreshDefaultRoomInfo();
        }

        this.updateEncounterTypeList();
    }

    componentDidUpdate(pervProps, pervState) {
        if(
            (pervProps && pervProps.generalAppointmentObjList &&
            pervProps.generalAppointmentObjList[pervState.appointmentIndex].selectedRoom != null &&
            this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedRoom != null &&
            pervProps.generalAppointmentObjList[pervState.appointmentIndex].selectedRoom.rmId != this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedRoom.rmId) ||
            ( this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE && pervState.appointmentIndex != this.state.appointmentIndex)
        )
        {
            this.updateEncounterTypeList();
        }
    }

    componentWillUnmount() {

    }

    setAllDefaultAppointmentTime = () => {
        if(this.props.generalAppointmentObjList){
            this.props.generalAppointmentObjList.forEach(apptObj => {
                if(!apptObj.appointmentTime)
                apptObj.appointmentTime = apptObj.timeslots[0];
            });
        }
    }

    setAllDefaultDurationMin = () => {
        if(this.props.generalAppointmentObjList){
            this.props.generalAppointmentObjList.forEach(apptObj => {
                // update appointment just add up all the time from timeslot list
                if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT){
                    apptObj.durationMin = (apptObj.timeslots.length * 15);
                }
                else{   // otherwise, find out the suitable duraion form the duration list
                    const durationList = this.updateDurationList(apptObj);
                    if (apptObj && apptObj.durationMin == null) {
                        if (this.props.duration && durationList.some(item=>item.code==this.props.duration)) {
                            apptObj.durationMin = this.props.duration;
                        } else if(apptObj.selectedEncounterType && apptObj.selectedEncounterType.drtn && durationList.some(item=>item.code==apptObj.selectedEncounterType.drtn)){
                            apptObj.durationMin = apptObj.selectedEncounterType.drtn;
                        }
                    }
                }
            });
        }
    }

    setAllInitReferralList = () => {
        if(this.props.generalAppointmentObjList){
            this.props.generalAppointmentObjList.forEach(apptObj => {
                this.initReferralList(apptObj);
            });
        }
    }

    checkJustification = (dailyView) => {
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT){
            dailyView.justificationMode = (dailyView.justification != null) ? true : false;
        }
        else{
            if(dailyView.selectedEncounterType && dailyView.durationMin > dailyView.selectedEncounterType.drtn)
                dailyView.justificationMode = true;
            else
                dailyView.justificationMode = false;
        }

    }

    checkIsSqueezeInErr = (dailyView) => {
        let isSqueezeInOpt = dailyView.isSqueezeIn;

        // skip checking when DTS_BOOKING_MODE_UPDATE_APPT mode
        if(this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT && dailyView.type == 'A' && !isSqueezeInOpt)
            return true;
        else
            return false;
    }

    checkIsSelfSqueezeIn = (dailyView) => {
        // console.log(JSON.stringify(dailyView));

        // skip checking when DTS_BOOKING_MODE_UPDATE_APPT mode
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT)
            return false;

        let wholeDayTimeslot = [
            ...dailyView.selectedDayTimeslotList.amList,
            ...dailyView.selectedDayTimeslotList.pmList,
            ...dailyView.selectedDayTimeslotList.ameohList,
            ...dailyView.selectedDayTimeslotList.pmeohList,
            ...dailyView.selectedDayTimeslotList.edcList
        ];

        return (
            wholeDayTimeslot.some(item =>
                item.type && item.type=='A' && item.patientKey &&
                dailyView.selectedPatient && item.patientKey == dailyView.selectedPatient.patientKey &&
                dailyView.appointmentTime.startTime == item.startTime
            ) ? true : false
        );
    }

    checkAllError = () => {
        // console.log('check all dailyView item.');
        this.props.generalAppointmentObjList.forEach(item => this.checkError(item));
        this.forceUpdate();
    }

    checkError = (dailyView) => {
        this.checkJustification(dailyView);
        dailyView.hasError = false;
        dailyView.errMsg = [];

        if(!dailyView.appointmentTime)
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('No Start Time.');
        }
        if(!dailyView.durationMin)
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('No Duration Min.');
        }
        if(!dailyView.selectedEncounterType)
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('No Encounter selected.');
        }
        if(dailyView.justificationMode && !dailyView.justification)
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('Require Justification.');
        }
        if(this.checkIsSqueezeInErr(dailyView))
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('Please confirm to make squeeze-in appointment.');
        }
        if(this.checkIsSelfSqueezeIn(dailyView))
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('Same patient cannot book squeeze-in appointment.');
        }
        if(this.isRescheduleAppointment() && (dailyView.reschRsnTypeId == null || dailyView.reschRsnTypeId == '') )
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('Reschedule Must have a reason.');
        }
        if(this.isRescheduleAppointment() &&
            this.rescheduleReasonTypeIsOthers(dailyView.reschRsnTypeId) &&
            (dailyView.reschRsnRemark == null || dailyView.reschRsnRemark == '') )
        {
            dailyView.hasError = true;
            dailyView.errMsg.push('Please enter reschedule remark.');
        }
    }

    noErrorExist= () =>{
        return this.props.generalAppointmentObjList.every(item => item.hasError == false);
    }

    updateDuration = (dailyView) => {
        if(dailyView && dailyView.selectedEncounterType && dailyView.selectedEncounterType.drtn
            && this.updateDurationList(dailyView).filter(item=>item.code==dailyView.durationMin).length==0){
            dailyView.durationMin = null;
        }
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'timeSelector') {
            validators.push('required');
            return validators;
        }
        if (name === 'durationSelector') {
            validators.push('required');
            return validators;
        }
        if (name === 'encounterType'){
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT ||
                this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE ||
                this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT)
            {
                validators.push('required');
            }
            return validators;
        }
        if(name === 'specialRequestText') {
            return validators;
        }
        if(name === 'justificationText') {
            if(this.props.generalAppointmentObjList[this.state.appointmentIndex].justificationMode){
                validators.push('required');
            }
            return validators;
        }
        if(name === 'rescheduleReasonId') {
            return validators;
        }
        if(name === 'rescheduleReasonText') {
            return validators;
        }
        if(name === 'rescheduleReasonTypeSelector') {
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'timeSelector') {
            errorMessages.push('Time cannot be null');
            return errorMessages;
        }
        if (name === 'durationSelector') {
            errorMessages.push('Duration cannot be null');
            return errorMessages;
        }
        if (name === 'encounterType'){
            errorMessages.push('Encounter Type cannot be null');
            return errorMessages;
        }
        if(name === 'specialRequestText') {
            errorMessages.push('Special Request cannot be null');
            return errorMessages;
        }
        if(name === 'justificationText') {
            errorMessages.push('Justification cannot be null');
            return errorMessages;
        }
        if(name === 'rescheduleReasonText') {
            errorMessages.push('Reschedule reason cannot be null');
            return errorMessages;
        }
        // if (name === 'rescheduleReasonTypeSelector') {
        //     errorMessages.push('Reschedule reason type cannot be null');
        //     return errorMessages;
        // }
    }

    rescheduleReasonTypeIsOthers(reschRsnTypeId) {
        let reschduleReasonType = this.props.rescheduleReasonList.find(item => item.rsnTypeId === reschRsnTypeId);
        return reschduleReasonType == null ? false : reschduleReasonType.rsnName === 'OTH';
    }

    handleSpecialRequestOnChange = (value) => {
        //console.log(value);
        if( value != this.props.generalAppointmentObjList[this.state.appointmentIndex].specialRequest) {
            if (this.state.appointmentIndex != 0) {
                // Non first appointment of the multiple appontment booking, apply straight.
                this.props.generalAppointmentObjList[this.state.appointmentIndex].specialRequest = value;
            } else {
                // First appointment of the multiple appontment booking.
                this.props.generalAppointmentObjList
                .map((appointment, index) => {
                    // Return index of generalAppointmentObjList that needs to be update as of the same with the first apppointment.
                    if (this.specialRequestIsSameAsTheFirstAppointmentOnMultipleAppointments(appointment.specialRequest)) {
                        return index;
                    }
                })
                .filter(index => index != undefined) // Remove null values
                .forEach((appointmentIndex) => {
                    // Apply the new value on each of the appointment that needs to be update.
                    this.props.generalAppointmentObjList[appointmentIndex].specialRequest = value;
                });
            }
            this.checkAllError();
            this.setIsUpdated();
        }
    }

    handleJustificationOnChange = (value) => {
        // console.log(value);
        if( value != this.props.generalAppointmentObjList[this.state.appointmentIndex].justification) {
            this.props.generalAppointmentObjList[this.state.appointmentIndex].justification = value;
            this.checkAllError();
            this.setIsUpdated();
        }
    }

    handleEncounterTypeChange = (value) => {
        // console.log(value);
        this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType = value;
        this.checkAllError();
    }

    handleTimeChange = (value) => {
        // console.log(value);
        if( value != this.props.generalAppointmentObjList[this.state.appointmentIndex].appointmentTime) {
            this.props.generalAppointmentObjList[this.state.appointmentIndex].appointmentTime = value;
            this.updateDuration(this.props.generalAppointmentObjList[this.state.appointmentIndex]);
            this.updateStartEndTime(this.props.generalAppointmentObjList[this.state.appointmentIndex]);
            this.checkAllError();
            this.setIsUpdated();
        }
    }

    handleDurationChange = (value) => {
        // console.log(value);
        if( value != this.props.generalAppointmentObjList[this.state.appointmentIndex].durationMin){
            let selectedMinutes = this.updateDurationList(this.props.generalAppointmentObjList[this.state.appointmentIndex]).find(e => e.code == value);
            this.props.generalAppointmentObjList[this.state.appointmentIndex].durationMin = value;
            //this.props.generalAppointmentObjList[this.state.appointmentIndex].isSqueezeIn = value.isSqueezeIn;
            this.props.generalAppointmentObjList[this.state.appointmentIndex].isSqueezeIn = selectedMinutes.isSqueezeIn;
            this.updateStartEndTime(this.props.generalAppointmentObjList[this.state.appointmentIndex]);
            this.checkAllError();
            this.setIsUpdated();
        }
    }

    handleRescheduleReasonOnChange = (value) => {
            this.props.generalAppointmentObjList[this.state.appointmentIndex].reschRsnRemark = value;
            this.checkAllError();
    }

    handleRescheduleReasonTypeOnChange = (value) => {
        if(value != this.props.generalAppointmentObjList[this.state.appointmentIndex].reschRsnTypeId) {
            this.props.generalAppointmentObjList[this.state.appointmentIndex].reschRsnTypeId = value;
            this.checkAllError();
            this.setIsUpdated();
        }
    }

    updateStartEndTime = (dailyView) => {
        // console.log('updateStartEndTime');
        if(this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType && this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType.drtn < dailyView.durationMin){
            dailyView.justificationMode = true;
        }
        else{
            dailyView.justificationMode = true;
            dailyView.justification = '';
        }
    }

    // refreshDailyView = () => {
    //     if(this.props.selectedRoom.rmId != null && this.props.calendarDetailDate != null)
    //         this.props.getDailyView({ rmId: this.props.selectedRoom.rmId, date: this.props.calendarDetailDate});
    // }

    // refreshPatientAppointmentList = () => {
    //     if(this.props.patientInfo != null) {
    //         this.props.getPatientAppointment(
    //             {
    //                 patientKey: this.props.patientInfo.patientKey,
    //                 appointmentDateFrom: dtsUtilities.formatDateParameter(moment().subtract(5, 'years').set('hour', 0).set('minute', 0)),
    //                 appointmentDateTo: dtsUtilities.formatDateParameter(moment().add(5, 'years').set('hour', 23).set('minute', 59))
    //             }
    //         );
    //     }
    // }

    handleReferralListItemChange = (value) => {
        let _referralItemList = [];
        if (value) {
            value.forEach(item => {
                _referralItemList.push(item.value);
                });
        } else {
            _referralItemList = [];
        }
        this.props.generalAppointmentObjList[this.state.appointmentIndex].referralItemList = _referralItemList;
        this.checkAllError();
        this.setIsUpdated();
    }

    handleAppointmentConfirm = () => {
        this.props.generalAppointmentObjList.forEach(apptObj => {
            let tmsltList = this.getSelectedTimeSlot(apptObj);
            apptObj.tmsltList = tmsltList;
        });
        this.props.confirmOverallAppointmentDialog();
    }

    handleRescheduleConfirm = () => {
        this.props.generalAppointmentObjList.forEach(apptObj => {
            let tmsltList = this.getSelectedTimeSlot(apptObj);
            apptObj.tmsltList = tmsltList;
        });
        this.props.confirmOverallAppointmentDialog();
    }

    handleUpdateAppointment = () => {
        this.props.confirmOverallAppointmentDialog();
    }

    handleOnSubmit = () => {
        this.props.generalAppointmentObjList.forEach(apptObj => {
            let tmsltList = this.getSelectedTimeSlot(apptObj);
            apptObj.tmsltList = tmsltList;
        });
        this.props.confirmOverallAppointmentDialog();
    }

    handleSubmitError = () => {
        // console.log('handleSubmitError call');
        let { callbackFunc } = this.state;
        callbackFunc(false);
    }

    handleCancel = () => {
        if(this.state.isUpdated) {
            this.props.openCommonMessage({
                msgCode: '110018',
                btnActions: {
                    btn1Click: () => {
                        //callback(true);
                        this.props.cancelOverallAppointmentDialog();
                        this.resetAll();
                        this.props.closeConfirmDialog();
                    }
                }
            });
        } else {
            this.props.cancelOverallAppointmentDialog();
            this.resetAll();
            this.props.closeConfirmDialog();
        }

    }

    infectionControlIds = this.props.infectionControlUnavailablePeriodReasons.map(rsn => rsn.unavailPerdRsnId);

    updateDurationList = (dailyView) => {
        let tempTimeslots = this.updateTimeslotList(dailyView);

        const selectedTimeslotIndex = this.getItemIndex(tempTimeslots,dailyView.appointmentTime);
        let tmpDurationList = [];
        let totalMin = 0;
        let isSqueezeIn = false;
        if(dailyView.timeslots && dailyView.timeslots.length > 0){
            for(let timeslot of tempTimeslots.slice(selectedTimeslotIndex)){
                // appointment can't book through another appointment.
                const isUnavailablePeriod = timeslot.type == 'U';
                const isInfectionControl = isUnavailablePeriod && timeslot.unavailablePeriodReasonIds?.every(id=>this.infectionControlIds.includes(id));
                if (isInfectionControl)
                    continue;
                else if (isUnavailablePeriod)
                    break;
                else{
                    let duration = moment.duration(moment(timeslot.endTime,'HHmm').diff(moment(timeslot.startTime,'HHmm')));
                    let min = duration.asMinutes();
                    isSqueezeIn = isSqueezeIn || timeslot.type === 'A';
                    totalMin = totalMin + min;
                    tmpDurationList.push({code:totalMin, label:totalMin+'min', isSqueezeIn: isSqueezeIn});
                }
            }
        }
        return tmpDurationList;
    }

    updateTimeslotList = (selectedTimeslot) => {
        let tempTimeslots = [];

        // update application popup don't need full timeslot list
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT){
            tempTimeslots = selectedTimeslot.timeslots;
        }
        else
        {
            if(selectedTimeslot.session.sessionDescription == 'AM')
                tempTimeslots = selectedTimeslot.selectedDayTimeslotList.amList;
            else if(selectedTimeslot.session.sessionDescription == 'PM')
                tempTimeslots = selectedTimeslot.selectedDayTimeslotList.pmList;
            else if(selectedTimeslot.session.sessionDescription == 'AMEOH')
                tempTimeslots = selectedTimeslot.selectedDayTimeslotList.ameohList;
            else if(selectedTimeslot.session.sessionDescription == 'PMEOH')
                tempTimeslots = selectedTimeslot.selectedDayTimeslotList.pmeohList;
            else if(selectedTimeslot.session.sessionDescription == 'EDC')
                tempTimeslots = selectedTimeslot.selectedDayTimeslotList.edcList;
        }

        return tempTimeslots;
    }

    updateEncounterTypeList = () => {
        // console.log('updateEncounterTypeList');
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT ||
            this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT ||
            this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
            this.props.getEncounterTypeList(
                {roomIdList: [this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedRoom.rmId]},
                this.setDefaultEncounterType,
                'dtsAppointmentDialog'
            );
        }
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT){
            if(this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType.encntrTypeId == undefined){
                this.props.getEncounterTypeList(
                    {roomIdList: [this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedRoom.rmId]},
                    this.lookupEncounterType,
                    'dtsAppointmentDialog'
                );
            }
        }
    }

    lookupEncounterType = (encounterTypeList) => {
        if(Array.isArray(encounterTypeList) && encounterTypeList.length > 0 && this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType){
            const encounterResult = encounterTypeList.find(encounterType => encounterType.encntrTypeCd == this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType.encounterTypeCd);
            if(encounterResult != undefined){
                this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType = encounterResult;
                this.forceUpdate();
            }
        }
    }

    setDefaultEncounterType = (encounterTypeList) => {
        // console.log('setDefaultEncounterType');
        // console.log(JSON.stringify(encounterTypeList));
        if(Array.isArray(encounterTypeList) && encounterTypeList.length > 0 && this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType){
            const encounterResult = encounterTypeList.find(encounterType => encounterType.encntrTypeId == this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType.encntrTypeId);
            if(encounterResult != undefined){
                this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType = encounterResult;
            }
        }
        else
        {
            this.props.generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType = undefined;
        }
        this.checkAllError();
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

    getSelectedTimeSlot = (dailyView) => {

        let localDailyViewTimeslot = this.updateTimeslotList(dailyView);
        const targetStartTime = moment(dailyView.appointmentTime.startTime,'HH:mm');

        const firstTimeslotIndex = localDailyViewTimeslot.findIndex(timeslot => moment(timeslot.startTime,'HH:mm').isSameOrAfter(targetStartTime));
        localDailyViewTimeslot = localDailyViewTimeslot.slice(firstTimeslotIndex).filter(timeslot => timeslot.type != 'U');
        return localDailyViewTimeslot.slice(0, dailyView.durationMin / 15);
    }

    getDialogTitle = () => {
        if(this.isRescheduleAppointment()) {
            return 'Reschedule Appointment - Appointment Details';
        }
        else{
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT)
                return 'Update Special Request / Justification';
            else
                return 'Making Appointment - Appointment Details';
        }
    }

    specialRequestIsSameAsTheFirstAppointmentOnMultipleAppointments = (specialRequest) => {
        if (this.props.generalAppointmentObjList != null && this.props.generalAppointmentObjList.length > 0) {
            // Appointment exists.
            return this.props.generalAppointmentObjList.length == 1 ? true : // Length == 1 => self always is self
            this.props.generalAppointmentObjList[0].specialRequest === specialRequest; // Is same as the first appointment
        }
        return false;
    }

    refreshDefaultRoomInfo = () => {
        let defaultRoomInfo = {
            isPromptDefaultRoom: false,
            defaultRoomLabel: 'Nil',
            defaultRoomIdStr: null,
            selectedRoomLabel: 'Nil',
            selectedRoomIdStr: null
        };

        if (this.props.selectedClinic && this.props.generalAppointmentObjList.length > 0 &&
            this.props.generalAppointmentObjList[0].selectedRoom)
        {
            let selectedRoomId = this.props.generalAppointmentObjList[0].selectedRoom.rmId;
            let selectedRoomCd = this.props.generalAppointmentObjList[0].selectedRoom.rmCd;
            let selectedEncounterType = this.props.generalAppointmentObjList[0].selectedEncounterType;

            defaultRoomInfo.selectedRoomIdStr = selectedRoomId ? selectedRoomId.toString() : '';
            defaultRoomInfo.selectedRoomLabel = this.props.selectedClinic.siteCd + ' ' + selectedRoomCd;

            // Don't prompt for change of Default Room for any of the following cases:
            // i.   Single appointment only
            // ii.  Patient is General Public
            if (
                this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT &&
                this.props.generalAppointmentObjList[0].selectedPatient.patientSts != 'P')
            {
                // Prompt for change of Default Room only on specific encounter types, and room is changed
                if (selectedEncounterType && selectedEncounterType.checkDfltRm &&
                    (selectedRoomId != this.props.patientDefaultRoomId))
                {
                    defaultRoomInfo.isPromptDefaultRoom = true;

                    if (this.props.patientDefaultRoomId != null) {
                        defaultRoomInfo.defaultRoomLabel = dtsUtilities.getClinicRoomLabel(this.props.patientDefaultRoomId, this.props.roomList, this.props.clinicList);
                        defaultRoomInfo.defaultRoomIdStr = this.props.patientDefaultRoomId.toString();
                    } else {
                        this.props.setDefaultRoomId(defaultRoomInfo.selectedRoomIdStr);
                        // this.setState({newDefaultRoomId: defaultRoomInfo.selectedRoomIdStr});
                    }
                }
            }
        }

        this.setState({defaultRoomInfo: defaultRoomInfo});
    }

    handleRemoveReserveItemChange = (e) => {
        this.props.generalAppointmentObjList[this.state.appointmentIndex].removeReserveItem = e.target.checked;
        this.checkAllError();
    }

    handleDefaultRoomChange = (e) => {
        // this.setState({newDefaultRoomId: e.target.value});
        this.props.setDefaultRoomId(e.target.value);
    }

    isRescheduleAppointment = () => {
        let isReschedule = this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT;

        if (isReschedule && (this.props.rescheduleReasonList == null || this.props.rescheduleReasonList.length == 0)) {
            this.props.getRescheduleReasons();
        }

        return isReschedule;
    }

    rescheduleAppointmentHasDifferenceOn(type, value) {
        return dtsUtilities.appointmentHasDifferenceOn(type, this.props.generalAppointmentObjList[this.state.appointmentIndex].fromAppointment, value);
    }

    appointmentClassExt(type, value) {
        let classExt = ' ';
        if (this.isRescheduleAppointment()) {
            // reschedule appointment and highlight in red if value has different with original apppointment
            if (this.rescheduleAppointmentHasDifferenceOn(type, value)) {
                classExt += 'rescheduleValueHasDifference';
            }
        }
        return classExt;
    }

    getToolTipText(type, value) {
        let text = null;
        if (this.isRescheduleAppointment()) {
            // reschedule appointment tooltip text shows original appointment value if there is difference
            if (this.rescheduleAppointmentHasDifferenceOn(type, value)) {
                switch(type) {
                    case dtsBookingConstant.DTS_APPOINTMENT_DATE:
                        text = moment(this.props.generalAppointmentObjList[this.state.appointmentIndex].fromAppointment.appointmentDateTime).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT);
                        break;
                    case dtsBookingConstant.DTS_APPOINTMENT_START_TIME:
                        text = dtsUtilities.getAppointmentStartTime(this.props.generalAppointmentObjList[this.state.appointmentIndex].fromAppointment).format('HH:mm');
                        break;
                    case dtsBookingConstant.DTS_APPOINTMENT_DURATION:
                        text = dtsUtilities.getAppointmentDuration(this.props.generalAppointmentObjList[this.state.appointmentIndex].fromAppointment).toString() + 'min';
                        break;
                    case dtsBookingConstant.DTS_APPOINTMENT_SURGERY:
                        text = this.props.generalAppointmentObjList[this.state.appointmentIndex].fromAppointment.roomCode;
                        break;
                    case dtsBookingConstant.DTS_APPOINTMENT_ENCTR_TYPE:
                        text = this.props.generalAppointmentObjList[this.state.appointmentIndex].fromAppointment.encounterTypeDescription;
                        break;
                    default:
                        break;
                }
            }
        }
        return text;
    }

    isAllowAppointmentRemove = () => {
        if(this.props.generalAppointmentObjList.length <= 1)
            return false;
        else
            return true;
    }

    removeAppointmentFromList = idx => event => {
        event.stopPropagation();
        if(this.isAllowAppointmentRemove()){
            // if the removed item and the current appointment index is pointing to the list item, then update the current appointment index -1
            if((idx + 1) >= this.props.generalAppointmentObjList.length && idx == this.state.appointmentIndex){
                this.setState({appointmentIndex: (idx -1 )}, this.props.removeFromGeneralAppointmentObjList(idx));
            }
            else
                this.setState({appointmentIndex: this.state.appointmentIndex}, this.props.removeFromGeneralAppointmentObjList(idx));
        }
    }

    setIsUpdated = () => {
        // console.log('isUpdated:',this.state.isUpdated.toString());
        !this.state.isUpdated && this.setState({isUpdated:true});
    }

    getSpecialtiesCd = (sspecId) => {
        let searchResult = undefined;
        if(this.props.allSpecialties != null && Array.isArray(this.props.allSpecialties)){
            searchResult = this.props.allSpecialties.find(item => item.sspecId == sspecId);
        }

        if(searchResult != undefined)
            return searchResult.sspecCd;
        else
            return '';
    }

    resetAll = () => {
    }

    getIcon = () =>{
        return <RequiredIcon />;
    }

    initReferralList = (confirmAppointmentObj) => {
        const {referralListForPatient} = this.props;
        let showReferralSection = false;

        if(referralListForPatient != null && referralListForPatient.length > 0 &&
            (this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT || this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE)) {
            // console.log('check referral match condition');
        // referral match condition
        /*
        1.	Referral is not discharged                  > checked at booking.js [updateReferralListForPatient()]
        2.	Referral has same patient as appointment    > checked at booking.js [updateReferralListForPatient()]
        3.	Referral has same clinic as appointment     > checked at DtsReferralList.js [getReferralList()]
        4.	Referral has same discipline as the surgery room of appointment             > checked at booking.js [updateReferralListForPatient()]
        5.	Surgery room of appointment same as latest appointment in referral history  > checked at DtsAppointmentDialog.js [initReferralList()]
        */
            showReferralSection = true;
            let roomId = confirmAppointmentObj.selectedRoom.rmId;

            let tempReferralList = [];
            referralListForPatient.forEach(item => {
                if(item.appointment != undefined && item.appointment != null ){
                    if(item.appointment.roomId == roomId){
                        tempReferralList.push(item);
                    }
                }
            });

            // clean the list and user need to manually choose if more than one record match all 5 criterias.
            if(tempReferralList.length > 1)
                confirmAppointmentObj.referralItemList = [];
            else
                confirmAppointmentObj.referralItemList = tempReferralList;
        }

        confirmAppointmentObj.showReferralSection = showReferralSection;
    }

    getTooltipDetailReferralRecord = (referralRecord, classes) => {
        let rows = [];
        rows.push('Referral From:');
        rows.push(dtsUtilities.getClinicRoomLabel(referralRecord.roomIdFrom, this.props.roomList, this.props.clinicList) +' @ '+ moment(referralRecord.referralDtm).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT));

        if(referralRecord.appointment != undefined && referralRecord.appointment != null){
            rows.push('Last appointment:');
            rows.push(dtsUtilities.getClinicRoomLabel(referralRecord.appointment.roomId, this.props.roomList, this.props.clinicList) + ' @ '+moment(referralRecord.appointment.appointmentDateTime).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT));
        }

        const tooltipItems = rows.map((item, idx) =>
            (<li key={idx} className={classes.tooltipLi}>{item}</li>)
        );

        return (
            <ul className={classes.tooltipUl}>{tooltipItems}</ul>
        );
    }


    render(){
        const { classes, openConfirmDialog, generalAppointmentObjList, referralListForPatient, patientDefaultRoomId, ...rest } = this.props;

        let engName = '';
        let chiName = '';
        let clinicName = '';
        let roomDesc = '';
        let roomId = null;
        let encounterTypeDesc = '';
        let selectedEncounterType = null;

        if(generalAppointmentObjList.length > 0){
            if(generalAppointmentObjList[this.state.appointmentIndex].selectedPatient){
                let patientInfo = generalAppointmentObjList[this.state.appointmentIndex].selectedPatient;
                engName = patientInfo.engSurname+', '+patientInfo.engGivename;
                chiName = patientInfo.nameChi;
            }

            if(generalAppointmentObjList[this.state.appointmentIndex].selectedClinic)
                clinicName = generalAppointmentObjList[this.state.appointmentIndex].selectedClinic.clinicName;

            if(generalAppointmentObjList[this.state.appointmentIndex].selectedRoom)
                roomDesc = generalAppointmentObjList[this.state.appointmentIndex].selectedRoom.rmCd;
                roomId = generalAppointmentObjList[this.state.appointmentIndex].selectedRoom.rmId;

            if(generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType)
            {
                selectedEncounterType = generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType;
                encounterTypeDesc = selectedEncounterType.encntrTypeDesc;
            }
            else{
                encounterTypeDesc = generalAppointmentObjList[this.state.appointmentIndex].encounterTypeDescription;
            }

            let selectedRescheduleAppointment = this.props.generalAppointmentObjList[this.state.appointmentIndex].fromAppointment;
            if(selectedRescheduleAppointment && selectedRescheduleAppointment.patientDto){

                engName = selectedRescheduleAppointment.patientDto.engSurname + ', '+ selectedRescheduleAppointment.patientDto.engGivename;
                chiName = selectedRescheduleAppointment.patientDto.nameChi;
                clinicName = generalAppointmentObjList[this.state.appointmentIndex].selectedClinic.clinicName;
                roomDesc = generalAppointmentObjList[this.state.appointmentIndex].selectedRoom.rmCd;
                roomId = generalAppointmentObjList[this.state.appointmentIndex].selectedRoom.rmId;
                encounterTypeDesc = (generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType) ? generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType.encntrTypeDesc : '';
            }
        }
        return (
            <CIMSDialog id="dtsAppointmentDailog" dialogTitle={this.getDialogTitle()} open={openConfirmDialog} dialogContentProps={{ style: { width: '100%' } }}>
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    {generalAppointmentObjList.length > 0 &&
                        <DialogContent id={'dtsAppointmentDailogContent'} style={{ padding: 0 }}>
                            <div className={classes.root}>
                                <Grid container spacing={0}>
                                    <Grid item xs={12}>
                                    <DtsBookingAlert/>
                                    </Grid>
                                    <Grid item xs={5} className={classes.cellResize}>
                                    <Paper square  className={classes.paper+' '+classes.label}>Patient</Paper>
                                    </Grid>
                                    <Grid item xs={7} className={classes.cellBigResize}>
                                    <Paper square className={classes.paper+' '+classes.info}>
                                        {/* {
                                        engName + ((chiName != undefined) ? ' ('+chiName+')' : '')
                                        } */}
                                        {dtsUtilities.getPatientNameWithOrder(engName, chiName, false)}
                                    </Paper>
                                    </Grid>
                                    <Grid item xs={5} className={classes.cellResize}>
                                    <Paper square className={classes.paper+' '+classes.label}>Clinic</Paper>
                                    </Grid>
                                    <Grid item xs={7} className={classes.cellBigResize}>
                                    <Paper square className={classes.paper+' '+classes.info}>{clinicName}</Paper>
                                    </Grid>
                                    <Grid item xs={5} className={classes.cellResize}>
                                    <Paper square className={classes.paper+' '+classes.label}>Surgery</Paper>
                                    </Grid>
                                    <Grid item xs={7} className={classes.cellBigResize}>
                                    <TooltipWrapper
                                        base={
                                            <Paper square className={classes.paper+' '+classes.info + this.appointmentClassExt(dtsBookingConstant.DTS_APPOINTMENT_SURGERY, roomId)}>{roomDesc}</Paper>
                                        }
                                        message={
                                            this.getToolTipText(dtsBookingConstant.DTS_APPOINTMENT_SURGERY, roomId)
                                        }
                                        placement={'left'}
                                    />
                                    </Grid>

                                    {
                                        // Prompt for Change of Default Room
                                        this.state.defaultRoomInfo.isPromptDefaultRoom &&
                                        <React.Fragment>

                                        <Grid item xs={5} className={classes.cellResize + ' ' + classes.defaultSurgery}>
                                        <Paper square className={classes.paperDefaultRoomLabel+' '+classes.label}>Default Surgery</Paper>
                                        </Grid>

                                        <Grid item xs={7} className={classes.cellBigResize}>
                                            <Paper square className={classes.paperDefaultRoom+' '+classes.info}>
                                            {patientDefaultRoomId ?
                                            (
                                                <React.Fragment>
                                                    <RadioFieldValidator
                                                        id={'defaultRoomRadio'}
                                                        value={this.props.newDefaultRoomId}
                                                        onChange={this.handleDefaultRoomChange}
                                                        list={[
                                                            { label: <>Unchanged keep as {'('+this.state.defaultRoomInfo.defaultRoomLabel+')'} <RequiredIcon /></>,
                                                            value: this.state.defaultRoomInfo.defaultRoomIdStr} ,
                                                            { label: <>Change to {this.state.defaultRoomInfo.selectedRoomLabel} <RequiredIcon /></>,
                                                            value: this.state.defaultRoomInfo.selectedRoomIdStr }
                                                        ]}
                                                        validators={this.props.newDefaultRoomId ? [] : [ValidatorEnum.required]}
                                                        errorMessages={this.props.newDefaultRoomId ? [] : [CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                        //disabled={isSelected}
                                                        msgPosition="bottom"
                                                        //FormControlLabelProps={{ className: classes.formControlLabelClss2 }}
                                                    />
                                                </React.Fragment>
                                            ) :
                                            (
                                                <React.Fragment>
                                                    <Typography>
                                                        Current: {this.state.defaultRoomInfo.defaultRoomLabel} <br/>
                                                        Will be set to: {this.state.defaultRoomInfo.selectedRoomLabel}
                                                    </Typography>
                                                </React.Fragment>
                                            )
                                            }

                                            </Paper>
                                        </Grid>

                                        </React.Fragment>
                                    }

                                    <Grid item xs={5}  className={classes.cellResize}>
                                        <Paper square className={classes.paper+' '+classes.label}>Encounter Type</Paper>
                                    </Grid>
                                    <Grid item xs={7} className={classes.cellBigResize}>
                                        <TooltipWrapper
                                            base={
                                                ((this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT ||
                                                    this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT ||
                                                    this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE))
                                                ?
                                                    (
                                                        <Paper square className={classes.paperEncounterType+' '+classes.info}>
                                                            <div className={classes.paperGroupItem +' '+classes.encounterTypeSelection}>
                                                                <DtsSelectFieldValidator
                                                                    className={classes.selectFieldInput + this.appointmentClassExt(dtsBookingConstant.DTS_APPOINTMENT_ENCTR_TYPE, (selectedEncounterType) ? selectedEncounterType.encntrTypeId : null)}
                                                                    id={'encounterType'}
                                                                    isDisabled={(this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_MODE_APPT &&
                                                                        this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT &&
                                                                        this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE)}
                                                                    isRequired
                                                                    TextFieldProps={{
                                                                        variant: 'outlined',
                                                                        label: <>Encounter Type <RequiredIcon /></>
                                                                    }}
                                                                    options={this.props.encounterTypeListForApptDialog.map((item) => ({value:item, label:item.encntrTypeDesc}))}
                                                                    value={generalAppointmentObjList[this.state.appointmentIndex].selectedEncounterType}
                                                                    msgPosition="bottom"
                                                                    validators={this.getValidator('encounterType')}
                                                                    errorMessages={this.getErrorMessage('encounterType')}
                                                                    onChange={e => this.handleEncounterTypeChange(e.value)}
                                                                />
                                                            </div>
                                                        </Paper>
                                                    )
                                                :
                                                    (<Paper square className={classes.paper+' '+classes.info + this.appointmentClassExt(dtsBookingConstant.DTS_APPOINTMENT_ENCTR_TYPE, selectedEncounterType.encntrTypeId)}>{encounterTypeDesc}</Paper>)
                                            }
                                            message={
                                                this.getToolTipText(dtsBookingConstant.DTS_APPOINTMENT_ENCTR_TYPE, (selectedEncounterType) ? selectedEncounterType.encntrTypeId : null)
                                            }
                                            placement={'left'}
                                        />
                                    </Grid>
                                    {
                                        generalAppointmentObjList[this.state.appointmentIndex].showReferralSection &&
                                        <React.Fragment>
                                            <Grid item xs={5}  className={classes.cellResize}>
                                                <Paper square className={classes.paper+' '+classes.label}>Referral List</Paper>
                                            </Grid>
                                            <Grid item xs={7} className={classes.cellBigResize}>
                                                <Paper square className={classes.paperEncounterType+' '+classes.info}>
                                                    <div className={classes.paperGroupItem +' '+classes.referralListItemSelection}>
                                                        <DtsSelectFieldValidator
                                                            id={'ReferralListItemSelect'}
                                                            TextFieldProps={{
                                                                variant: 'outlined',
                                                                label: <>Referral List</>
                                                            }}
                                                            options={
                                                                referralListForPatient && referralListForPatient.map((item) => (
                                                                    {
                                                                        value: item,
                                                                        label: this.getSpecialtiesCd(item.sspecIdFrom)+' to '+this.getSpecialtiesCd(item.sspecIdTo)+' @ '+moment(item.referralDtm).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT),
                                                                        tooltip: this.getTooltipDetailReferralRecord(item, classes)
                                                                    }
                                                                ))
                                                            }
                                                            innerProps={{
                                                                className: classes.referralItemInput
                                                            }}
                                                            value={generalAppointmentObjList[this.state.appointmentIndex].referralItemList}
                                                            msgPosition="bottom"
                                                            isMulti
                                                            // addAllOption
                                                            fullWidth
                                                            // validators={this.getValidator('RoomEmptyTimeslotSelector')}
                                                            // errorMessages={this.getErrorMessage('RoomEmptyTimeslotSelector')}
                                                            onChange={this.handleReferralListItemChange}
                                                        />
                                                    </div>
                                                </Paper>
                                            </Grid>
                                        </React.Fragment>
                                    }


                                    <Grid item xs={3}>
                                        <Paper square className={classes.paperGroup}>
                                            <Grid item>
                                                <div className={classes.tableLayout}>
                                                    <List>
                                                        {generalAppointmentObjList.map((dailyView, idx) => {
                                                            return (
                                                                <ListItem
                                                                    key={idx}
                                                                    className={(this.state.appointmentIndex == idx) ? classes.dateListItemSelect : ''}
                                                                    button onClick={e => this.setState({appointmentIndex: idx})}
                                                                >
                                                                    <TooltipWrapper
                                                                        base={
                                                                            <ListItemText
                                                                                className={classes.dateListItem + this.appointmentClassExt(dtsBookingConstant.DTS_APPOINTMENT_DATE, dailyView.date)}
                                                                                primary={moment(dailyView.date).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)}
                                                                            />
                                                                        }
                                                                        message={
                                                                            this.getToolTipText(dtsBookingConstant.DTS_APPOINTMENT_DATE, dailyView.date)
                                                                        }
                                                                        placement={'bottom'}
                                                                    />
                                                                    <ListItemIcon className={classes.errorListItem}>
                                                                    {
                                                                        (dailyView.hasError) ? (
                                                                            <ErrorIcon className={classes.errorIcon} />
                                                                        ): (<></>)
                                                                    }
                                                                    </ListItemIcon>
                                                                    <IconButton
                                                                        className={classes.deleteIcon}
                                                                        disabled={!this.isAllowAppointmentRemove()}
                                                                        onClick={this.removeAppointmentFromList(idx)}
                                                                    >
                                                                        <CancelIcon fontSize="small"/>
                                                                    </IconButton>

                                                                </ListItem>
                                                            );
                                                        })}
                                                    </List>
                                                </div>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Paper square className={classes.paperGroup}>
                                            <div className={classes.tableLayout}>
                                                <Grid className={classes.selectorDiv}>
                                                    <TooltipWrapper
                                                        base={
                                                            <div className={classes.paperGroupItem +' '+classes.timeSelection}>
                                                                <DtsSelectFieldValidator
                                                                    className={classes.selectFieldInput + this.appointmentClassExt(dtsBookingConstant.DTS_APPOINTMENT_START_TIME, generalAppointmentObjList[this.state.appointmentIndex].appointmentTime)}
                                                                    id={'timeSelect'}
                                                                    isDisabled={this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT}
                                                                    isRequired
                                                                    TextFieldProps={{
                                                                        variant: 'outlined',
                                                                        label: <>Time <RequiredIcon /></>
                                                                    }}
                                                                    options={generalAppointmentObjList[this.state.appointmentIndex].timeslots && generalAppointmentObjList[this.state.appointmentIndex].timeslots.map((item) => ({value:item, label:item.startTime}))}
                                                                    value={generalAppointmentObjList[this.state.appointmentIndex].appointmentTime}
                                                                    msgPosition="bottom"
                                                                    validators={this.getValidator('timeSelector')}
                                                                    errorMessages={this.getErrorMessage('timeSelector')}
                                                                    onChange={e => this.handleTimeChange(e.value)}
                                                                />
                                                            </div>
                                                        }
                                                        message={
                                                            this.getToolTipText(dtsBookingConstant.DTS_APPOINTMENT_START_TIME, generalAppointmentObjList[this.state.appointmentIndex].appointmentTime)
                                                        }
                                                        placement={'bottom'}
                                                    />
                                                    <TooltipWrapper
                                                        base={
                                                            <div className={classes.paperGroupItem+' '+classes.durationSelection}>
                                                                <DtsSelectFieldValidator
                                                                    className={classes.selectFieldInput + this.appointmentClassExt(dtsBookingConstant.DTS_APPOINTMENT_DURATION, generalAppointmentObjList[this.state.appointmentIndex].durationMin)}
                                                                    id={'durationSelect'}
                                                                    isDisabled={this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT}
                                                                    isRequired
                                                                    TextFieldProps={{
                                                                        variant: 'outlined',
                                                                        label: <>Duration <RequiredIcon /></>
                                                                    }}
                                                                    options={generalAppointmentObjList[this.state.appointmentIndex]
                                                                        && generalAppointmentObjList[this.state.appointmentIndex].appointmentTime
                                                                        && this.updateDurationList(generalAppointmentObjList[this.state.appointmentIndex]).map((item) => (
                                                                            //{ value: { code: item.code, isSqueezeIn: item.isSqueezeIn }, label: item.label }
                                                                            { value: item.code, label: item.label }
                                                                        ))
                                                                    }
                                                                    value={generalAppointmentObjList[this.state.appointmentIndex].durationMin}
                                                                    msgPosition="bottom"
                                                                    validators={this.getValidator('durationSelector')}
                                                                    errorMessages={this.getErrorMessage('durationSelector')}
                                                                    onChange={e => this.handleDurationChange(e.value)}
                                                                />
                                                            </div>
                                                        }
                                                        message={
                                                            this.getToolTipText(dtsBookingConstant.DTS_APPOINTMENT_DURATION, generalAppointmentObjList[this.state.appointmentIndex].durationMin)
                                                        }
                                                        placement={'bottom'}
                                                    />
                                                </Grid>
                                                {this.isRescheduleAppointment() && generalAppointmentObjList[this.state.appointmentIndex].fromAppointment.reserve != null ?
                                                    <Grid>
                                                        <div className={classes.paperGroupItem+' '+classes.info}>
                                                            <FormControlLabel control={
                                                                <Checkbox
                                                                    checked={generalAppointmentObjList[this.state.appointmentIndex].removeReserveItem}
                                                                    onChange={e => this.handleRemoveReserveItemChange(e)}
                                                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                                                />
                                                            } label="Remove Reserve Item"
                                                            />
                                                        </div>
                                                    </Grid>
                                                    :
                                                    null
                                                }
                                                {!this.isRescheduleAppointment() ? <Grid>
                                                    <div className={classes.paperGroupItem+' '+classes.info}>
                                                        {/* <TextFieldValidator
                                                            id={'specialRequestTextField'}
                                                            value={generalAppointmentObjList[this.state.appointmentIndex].specialRequest}
                                                            disabled={false}
                                                            variant="outlined"
                                                            label={<>Special Request</>}
                                                            inputProps={{ maxLength: 500 }}
                                                            absoluteMessage
                                                            validators={this.getValidator('specialRequestText')}
                                                            errorMessages={this.getErrorMessage('specialRequestText')}
                                                            onChange={e => this.handleSpecialRequestOnChange(e.target.value)}
                                                        /> */}
                                                        <CIMSMultiTextField
                                                            id={'specialRequestTextField'}
                                                            value={generalAppointmentObjList[this.state.appointmentIndex].specialRequest}
                                                            disabled={false}
                                                            rows="2"
                                                            variant="outlined"
                                                            label={<>Special Request</>}
                                                            inputProps={{ maxLength: 500 }}
                                                            absoluteMessage
                                                            validators={this.getValidator('specialRequestText')}
                                                            errorMessages={this.getErrorMessage('specialRequestText')}
                                                            onChange={e => this.handleSpecialRequestOnChange(e.target.value)}
                                                        />
                                                    </div>
                                                </Grid> : null
                                                }
                                                <Grid>
                                                    <div className={classes.paperGroupItem+' '+classes.info}>
                                                        {generalAppointmentObjList[this.state.appointmentIndex].justificationMode == true && (
                                                            // <TextFieldValidator
                                                            //     id={'justificationTextField'}
                                                            //     value={generalAppointmentObjList[this.state.appointmentIndex].justification}
                                                            //     disabled={!generalAppointmentObjList[this.state.appointmentIndex].justificationMode}
                                                            //     variant="outlined"
                                                            //     label={<>Justification <RequiredIcon /> </>}
                                                            //     inputProps={{ maxLength: 500 }}
                                                            //     absoluteMessage
                                                            //     validators={this.getValidator('justificationText')}
                                                            //     errorMessages={this.getErrorMessage('justificationText')}
                                                            //     onChange={e => this.handleJustificationOnChange(e.target.value)}
                                                            // />
                                                            <CIMSMultiTextField
                                                                id={'justificationTextField'}
                                                                value={generalAppointmentObjList[this.state.appointmentIndex].justification}
                                                                disabled={!generalAppointmentObjList[this.state.appointmentIndex].justificationMode}
                                                                rows="2"
                                                                variant="outlined"
                                                                label={<>Justification <RequiredIcon /> </>}
                                                                inputProps={{ maxLength: 500 }}
                                                                absoluteMessage
                                                                validators={this.getValidator('justificationText')}
                                                                errorMessages={this.getErrorMessage('justificationText')}
                                                                onChange={e => this.handleJustificationOnChange(e.target.value)}
                                                            />
                                                            )
                                                        }
                                                    </div>
                                                </Grid>
                                                {this.isRescheduleAppointment() ? <Grid>
                                                    <div className={classes.paperGroupItem+' '+classes.info}>
                                                        <DtsSelectFieldValidator
                                                            id={'rescheduleReasonTypeSelect'}
                                                            isDisabled={false}
                                                            isRequired
                                                            TextFieldProps={{
                                                                variant: 'outlined',
                                                                label: <>Reschedule Reason Type <RequiredIcon /></>
                                                            }}
                                                            options={this.props.rescheduleReasonList.map((item) => (
                                                                    { value: item.rsnTypeId, label: item.rsnDesc }
                                                                ))
                                                            }
                                                            value={generalAppointmentObjList[this.state.appointmentIndex].reschRsnTypeId}
                                                            msgPosition="bottom"
                                                            validators={this.getValidator('rescheduleReasonTypeSelector')}
                                                            errorMessages={this.getErrorMessage('rescheduleReasonTypeSelector')}
                                                            onChange={e => this.handleRescheduleReasonTypeOnChange(e.value)}
                                                        />
                                                    </div>
                                                </Grid> : null
                                                }
                                                {this.isRescheduleAppointment() ? <Grid>
                                                    <div className={classes.paperGroupItem+' '+classes.info}>
                                                        {this.rescheduleReasonTypeIsOthers(generalAppointmentObjList[this.state.appointmentIndex].reschRsnTypeId) &&
                                                            (<TextFieldValidator
                                                                id={'rescheduleReasonTextField'}
                                                                value={generalAppointmentObjList[this.state.appointmentIndex].reschRsnRemark}
                                                                disabled={false}
                                                                variant="outlined"
                                                                label={<>Reschedule Reason</>}
                                                                inputProps={{ maxLength: 500 }}
                                                                absoluteMessage
                                                                validators={this.getValidator('rescheduleReasonText')}
                                                                errorMessages={this.getErrorMessage('rescheduleReasonText')}
                                                                onChange={e => this.handleRescheduleReasonOnChange(e.target.value)}
                                                            />)
                                                        }
                                                    </div>
                                                </Grid> : null
                                                }
                                                <Grid>
                                                    <List className={classes.paperGroupItem+' '+classes.info}>
                                                    {
                                                        generalAppointmentObjList[this.state.appointmentIndex].errMsg.map((msg, idx) => {
                                                        return (
                                                            <ListItem key={idx}>
                                                                <ListItemText className={classes.errMsg} primary={msg} />
                                                            </ListItem>
                                                        );
                                                    })}
                                                    </List>
                                                </Grid>
                                            </div>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </div>
                        </DialogContent>
                    }
                    <DialogActions className={classes.dialogAction}>
                        <CIMSButton
                            onClick={() => this.refs.form.submit()}
                            id={'appointment_confirm'}
                            color="primary"
                            disabled={!this.noErrorExist()}
                        >Confirm
                        </CIMSButton>
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
        duration: state.dtsAppointmentBooking.pageLevelState.duration,
        encounterTypeListForApptDialog: state.dtsAppointmentBooking.encounterTypeListForApptDialog,
        roomList: state.common.rooms,
        clinicList: state.common.clinicList,
        patientDefaultRoomId: state.patient.defaultRoomId,
        rescheduleReasonList: state.bookingInformation.rescheduleReasonList,
        allSpecialties: state.dtsPreloadData.allSpecialties,
        infectionControlUnavailablePeriodReasons: state.dtsPreloadData.infectionControlUnavailablePeriodReasons
    };
};

const mapDispatchToProps = {
    getRescheduleReasons,
    openCommonMessage,
    getEncounterTypeList
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAppointmentDialog));
