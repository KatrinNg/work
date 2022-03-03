import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import {
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Paper,
    Card,
    IconButton,
    FormControlLabel,
    Switch,
    SvgIcon,
    Chip,
    Tooltip
} from '@material-ui/core';


import {
    Cancel as CancelIcon,
    Menu as MenuIcon,
    Print as PrintIcon,
    Phone as PhoneIcon,
    Edit as EditIcon,
    AccessTime as TimeIcon,
    Delete as DeleteIcon,
    MoreVert as SubMenuIcon,
//    PhoneEnabled as PhoneEnabledIcon,
    Phone as PhoneEnabledIcon,
    Notifications as NotificationsIcon,
//    PhoneDisabled as PhoneDisabledIcon
    Phone as PhoneDisabledIcon,
    LocalOffer as TagIcon,
    Gavel,
    PanTool as WaitingListIcon
} from '@material-ui/icons';
import DtsMenuButton from '../../components/DtsMenuButton';
import { connect } from 'react-redux';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import FormControl from '@material-ui/core/FormControl';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
//import DtsDurationIcon from './DtsDurationIcon';
import DtsTimeslotsDurationIcon from './DtsTimeslotsDurationIcon';
import DtsButton from '../../components/DtsButton';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import OverflowTypography from '../../components/OverflowTypography';
import _ from 'lodash';
import {
    setCalendarDetailDate,
    getDailyView,
    setSqueezeInMode,
    setSelectedDayTimeslotList,
    setSelectedDeleteAppointment,
    setSelectedCloseTimeslot,
    removeFromReserveList,
    getEncounterTypeList,
    setSelectedEncounterType,
    setDuration,
    setDailyViewNavigationHistory,
    getAppointmentLabel,
    getAppointmentLog,
    setSelectedRescheduleAppointment
 } from '../../../../store/actions/dts/appointment/bookingAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';

import moment from 'moment';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
import Enum from '../../../../enums/enum';
import DtsPrintAppointmentLabel from './DtsPrintAppointmentLabel';
import DtsPatientLink from './DtsPatientLink';
import { DTS_DATE_DISPLAY_FORMAT, DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';

const styles = {
    root:{
        width:'100%'
    },
    table: {
        width: '100%'
    },
    tableRow:{
        height:'32px'
    },
    headerTableCell:{
        backgroundColor: '#48aeca',
        color: '#ffffff',
        fontSize:'13px',
        borderStyle: 'none',
        textAlign:'left'
    },
    tableCell:{
        borderStyle: 'none',
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        padding:'0px 8px',
        '&:last-child': {
            //padding: '8px',
            paddingRight: '8px'
        },
        maxWidth:'200px'
    },
    tableCellPatientInfo:{
        //color: 'darkblue'

    },
    headerTableCellReserveTag:{
        minWidth:'24px'

    },
    tableRowEnd:{
        height:'32px'
    },
    tableRowSessionBreak:{
        height: '0px'
    },
    tableCellSessionBreak:{
        border: '2px solid #63a293',
        height: '0px'
    },
    dayEnd:{
        textAlign: 'center'
    },
    menuItem:{
        display: 'inline-flex'
    },
    durCell:{
        width: '11%',
        minWidth:'60px'
    },
    noWrapGrid:{
        maxWidth: '160px'
    },
    dateSelector:{
        top: '10px',
        width: '260px',
        marginBottom: '20px',
        display: 'inline-block'
    },
    dateLabel:{
        margin: '0px 0px 0px 15px',
        width: '50%',
        display: 'inline-block',
        fontSize: '16px'
    },
    surgeryLabel:{
        display: 'inline-block',
        fontSize: '16px'
    },
    cancelIcon:{
        float: 'right'
    },
    filterIcon:{
        width: '20px',
        marginLeft: '80px',
        display: 'inline-block'

    },
    unavailableTableRow:{
        backgroundColor:'#EFEFEF',
        height:'32px'
    },
    alignCenter:{
        textAlign: 'center'
        //marginRight: '100px'
    },
    multiApptRoot:{
        padding: '5px',
        position: 'fixed',
        bottom: '30px',
        width: '533px',
        right: '30px',
        zIndex: 1
    },
    chip:{
        margin: '5px'
    },
    bookmarkBtn:{
        margin:'5px auto',
        width:'200px',
        'text-align':'center',
        display: 'flex',
        justifyContent: 'center'
    },
    bookmarkHead:{
        display: 'flex'
    },
    bookmarkGrid:{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        margin: 0
    },
    nonAppointment:{
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },
    alightNonAppointmentText:{
        marginRight: '100px'
    },
    isSelfPatientRecord :{
        fontWeight: 'bolder',
        color: '#5c0099'
    },
    isSelfPatientRecordBackground :{
        backgroundColor:'#eeccff'
    },
    isReferralShowAppointment :{
        fontWeight: 'bolder',
        color: 'SaddleBrown'
    },
    isReferralShowAppointmentBackground :{
        backgroundColor:'PaleGoldenRod'
    },
    popoverText: {
        paddingRight: '5px'
    },
    tooltip: {
        fontSize: '1em',
        overflowWrap: 'break-word'
    }
};

class DtsDayViewPanel extends Component {

    constructor(props){
        super(props);
        this.state = {

            dtsPrintAppointmentLabelDialogOpen:false,
            navigationHistoryLimit: 15,
            updateApptObj: null,
            confirmPromptDialog: {
                open: false,
                content: null,
                action: null
            },
            displayInfectionControl: false
        };
    }

    // componentWillMount() {

    // }

    componentDidMount(){

        // Reschedule flow get encounter type list
        // if(this.props.selectedRescheduleAppointment != null && this.props.selectedRescheduleAppointment.fromAppointment != null) {
        //     this.props.getEncounterTypeList({roomIdList: [this.props.selectedRescheduleAppointment.fromAppointment.roomId]});
        // }
    }
    componentDidUpdate(prevProps) {
        if(
            // prev record exist and date have change
            (prevProps && prevProps.DailyViewList !== this.props.DailyViewList)
            ||
            // prev record not exist and dailyViewList exist
            ((prevProps.DailyViewList == null || prevProps.DailyViewList.length == 0) && this.props.DailyViewList && this.props.DailyViewList.length > 0)
        )
            this.updateSelectedDayTimeslotList();

        // // Reschedule flow set encounter type ref from appointment
        // if (this.props.selectedRescheduleAppointment != null
        //     && this.props.selectedRescheduleAppointment.fromAppointment != null
        //     && this.props.encounterTypeList.length > 0
        //     && _.isEmpty(this.props.selectedEncounterType) ) {
        //     let encounterType = this.props.encounterTypeList.filter(encounterType => encounterType.encntrTypeId === this.props.selectedRescheduleAppointment.fromAppointment.appointmentDetlBaseVoList[0].encounterTypeId)[0];
        //     if(!_.isEmpty(encounterType)) {
        //         this.props.setSelectedEncounterType({encounterType:encounterType});
        //         this.props.setDuration(encounterType.drtn);
        //     }
        // }

        this.setDailyViewNavigationHistoryIfNeeded(prevProps);
    }

    setDailyViewNavigationHistoryIfNeeded = () => {
        if (this.props.calendarDetailDate && this.props.selectedRoom) {
            if(this.props.dailyViewNavigationHistory.filter(history => history.appointmentDate.isSame(this.props.calendarDetailDate, 'day') && history.room.rmId === this.props.selectedRoom.rmId).length == 0) {
                let pinnedDailyViewNavigationHistory = Object.assign([],this.props.dailyViewNavigationHistory.filter(history => history.pinned));
                let unpinnedDailyViewNavigationHistory = Object.assign([],this.props.dailyViewNavigationHistory.filter(history => !history.pinned));
                unpinnedDailyViewNavigationHistory.unshift({ recordTime: moment(), room: this.props.selectedRoom, appointmentDate: moment(this.props.calendarDetailDate), pinned: null });
                this.props.setDailyViewNavigationHistory(pinnedDailyViewNavigationHistory.concat(unpinnedDailyViewNavigationHistory).slice(0,this.state.navigationHistoryLimit));
            }
        }
    }

    updateSelectedDayTimeslotList = () => {
        //console.log('updateSelectedDayTimeslotList');
        let dayViewTimeslotList = {amList:[], pmList:[], ameohList:[], pmeohList:[], edcList:[]};
        let sessionDesc = '';
        let timeslotType = '';
        let patientKeyVal = '';
        if(this.props.DailyViewList != null){
            this.props.DailyViewList.forEach(dailyView => {
                if(dailyView != null){
                    sessionDesc = dailyView.session.sessionDescription;
                    timeslotType = dailyView.type;
                    patientKeyVal = (dailyView.appointment) ? dailyView.appointment.patientKey : '';
                    dailyView.timeslots.forEach(timeslot => {
                        let newTimeslot = {...timeslot, type:timeslotType, patientKey:patientKeyVal, unavailablePeriodReasonIds:dailyView.unavailablePeriods?.map(o=>o.unavailablePeriodReasonId)};
                        if(sessionDesc == 'AM')
                            dayViewTimeslotList.amList.push(newTimeslot);
                        else if(sessionDesc == 'PM')
                            dayViewTimeslotList.pmList.push(newTimeslot);
                        else if(sessionDesc == 'AMEOH')
                            dayViewTimeslotList.ameohList.push(newTimeslot);
                        else if(sessionDesc == 'PMEOH')
                            dayViewTimeslotList.pmeohList.push(newTimeslot);
                        else if(sessionDesc == 'EDC')
                            dayViewTimeslotList.edcList.push(newTimeslot);
                    });
                }
            });
        }
        Object.values(dayViewTimeslotList).forEach(list => list.sort((a,b) => a.startTime > b.startTime? 1 : a.startTime < b.startTime? -1 : 0));
        this.props.setSelectedDayTimeslotList(dayViewTimeslotList);
    }

    getPatientName(patient){
        let patientEngName = CommonUtilities.getFullName(patient.engSurname, patient.engGivename);
        let patientChiName = patient.nameChi;

        let patientName = patientChiName;
        if (patientName){
            patientName += ' ' + patientEngName;
        }
        else {
            patientName = patientEngName;
        }

        return patientName;
    }

    getTelIcon(telIcon){

        let telObj;

        if(telIcon == 'R3'){
            telObj = (
                <PhoneEnabledIcon>
                     direct={'horizontal'}
                    menuButtonSize={'small'}
                    color={'blue'}
                </PhoneEnabledIcon>
            );
        }else if (telIcon == 'R2'){
            telObj = (
                <PhoneDisabledIcon>
                     direct={'horizontal'}
                    menuButtonSize={'small'}
                    color={'blue'}
                </PhoneDisabledIcon>
            );
        }else if (telIcon == 'R1'){
            telObj = (
                <SvgIcon>
                    <text x={0} y={20} fill="#404040" fontSize="1.5rem" fontWeight="bold">?</text>
                </SvgIcon>
            );
        }
        else {
            telObj = '';
        }

        return telObj;

    }
    getValidator = (name) => {
        let validators = [];
        if (name === 'SessionSelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'SessionSelector') {
            errorMessages.push('testing');
            return errorMessages;
        }
    }

    handleDateChange = (value) => {
        //console.log('handleDateChangevalue ' + value);
        this.props.setCalendarDetailDate(moment(value));
        this.props.getDailyView({ rmId: this.props.selectedRoom.rmId, date: moment(value)});
    }

    switchSqueezeInMode = () => {
        this.props.setSqueezeInMode(!this.props.squeezeInMode);
    }

    switchInfectionControlDisplay = () => {
        this.setState({ displayInfectionControl: !this.state.displayInfectionControl });
    }

    getBellIcon(bellIcon){

        let bellObj;

        if(bellIcon == '1'){
            bellObj = (
                <NotificationsIcon>
                        direct={'horizontal'}
                    menuButtonSize={'small'}
                    color={'blue'}
                </NotificationsIcon>
            );
        }
        else{
            bellObj = '';
        }
        return bellObj;
    }



    getMenuIcon(item){
        // console.log('date: ' + moment(item.date).isSameOrAfter(moment(), 'day'));
//        console.log('getMenuIcon-item:', JSON.stringify(item));

        //define list -
        let iconList = [];
        let printerIconList = [];
        let phoneIconList = [];
        let editIconList = [];
        let timeIconList = [];
        let deleteIconList = [];
        let subMenuIconList = [];
        let waitingListIconList = [];


        if (this.isShowPrintAppointmentList(item)){
            printerIconList.push({item:'Print Appointment List', action:(event)=>{event.stopPropagation(); console.log('Print appt click 1');}});
        }
        if(this.isShowPrintAppointmentLabel(item)){
            printerIconList.push({item:'Print Appointment label', action:(event)=>{event.stopPropagation(); this.handlePrintAppointmentLabel(item);}});
        }
        if(this.isShowContactHistory(item)){
            phoneIconList.push({item:'Contact History', action:(event)=>{event.stopPropagation(); this.props.openContactHistoryDialogAction(item.appointment);}});
        }

        if(this.isShowRescheduleAppointment(item)){
            editIconList.push({item:'Reschedule Appointment', action:(event)=>{event.stopPropagation(); this.handleRescheduleAppointmentButtonAction(item);}});
        }

        if(this.isShowUpdateAppointment(item)){
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT)
                editIconList.push({item:'Update Appointment', action:(event)=>{event.stopPropagation(); this.handleUpdateAppointment(item);}});
        }

        if(this.isShowAddToReserveList(item)){
            editIconList.push({item:'Add to Reserve List', action:()=>{this.props.openReserveListDialogAction(item.appointment);}});
        }

        if(this.isShowUpdateReserveList(item)){
            editIconList.push({item:'Update Reserve List', action:()=>{this.props.openReserveListDialogAction(item.appointment);}});
        }

        if(this.isShowRemoveFromReserveList(item)){
            editIconList.push({item:'Remove from Reserve List', action:()=>{this.props.removeFromReserveList(item.appointment.reserve);}});
        }

        if(this.isShowCloseTimeslot(item)){
            timeIconList.push({item:'Close timeslot', action:(event)=>{event.stopPropagation(); this.props.closeTimeSlotAction(); this.props.setSelectedCloseTimeslot(item);}});
        }
        if(this.isShowOpenTimeslot(item)){
            timeIconList.push({item:'Open timeslot', action:(event)=>{event.stopPropagation(); this.props.openUnavailableTimeSlotAction();}});
        }
        if(this.isShowDeleteAppointment(item)){
            deleteIconList.push({item:'Delete Appointment', action:(event)=>{event.stopPropagation(); this.props.openDeleteAppointmentAction();this.props.setSelectedDeleteAppointment(item);}});

        }
        if(this.isShowWaitingList(item)){
            waitingListIconList.push({item:'Add to Waiting List', action:()=>{this.props.openWaitingListDialogAction(item.appointment.patientDto && item.appointment.patientDto.patientKey);}});

        }

        if (item.appointment) {
            subMenuIconList.push({item:'Appointment Log', action:()=>this.props.getAppointmentLog(item.appointment.appointmentId)});
        }
        subMenuIconList.push({item:'Timeslot Log', action:()=>this.props.openTimeslotLogDialogAction(item.timeslots)});

        if (printerIconList.length > 0){
            iconList.push({item:<DtsMenuButton buttonEl={<PrintIcon></PrintIcon>} itemListEl={printerIconList}/>});
        }
        if(phoneIconList.length>0){
            iconList.push({item:<DtsMenuButton buttonEl={<PhoneIcon></PhoneIcon>} itemListEl={phoneIconList}/>});
        }
        if(editIconList.length>0){
            iconList.push({item:<DtsMenuButton buttonEl={<EditIcon></EditIcon>} itemListEl={editIconList}/>});
        }
        if(timeIconList.length>0){
            iconList.push({item:<DtsMenuButton buttonEl={<TimeIcon></TimeIcon>} itemListEl={timeIconList}/>});
        }
        if(deleteIconList.length>0){
            iconList.push({item:<DtsMenuButton buttonEl={<DeleteIcon></DeleteIcon>} itemListEl={deleteIconList}/>});
        }
        if(waitingListIconList.length>0){
            iconList.push({item:<DtsMenuButton buttonEl={<WaitingListIcon></WaitingListIcon>} itemListEl={waitingListIconList}/>});
        }
        if(subMenuIconList.length>0){
            iconList.push({item:<DtsMenuButton buttonEl={<SubMenuIcon></SubMenuIcon>} itemListEl={subMenuIconList}/>});
        }

        return (
        <DtsMenuButton
            direct={'horizontal'}
            menuButtonSize={'small'}
            buttonEl={<MenuIcon></MenuIcon>}
            itemListEl={iconList}
        />);
    }

    isShowPrintAppointmentList(item){

        return true;
    }
    isShowPrintAppointmentLabel(item){
        return true;
    }

    isShowContactHistory(item){
        return true;
    }

    isShowRescheduleAppointment(item){
        if(moment(item.date).isSameOrAfter(moment(), 'day') && item.type === 'A'){
            // today or later and appointment item.
            let appointmentDateTime = moment(dtsUtilities.getAppointmentStartTime(item.appointment));
            if (appointmentDateTime.diff(moment(), 'dates') > 0) {
                // later than now.
                if(this.props.patientInfo) {
                    // patient loaded - show reschedule btn on day view if appointment item is self.
                    return item.appointment.patientKey === this.props.patientInfo.patientKey;
                } else {
                    // patient not loaded - show reschedule btn for the appointment item always.
                    return true;
                }
            }
        }
        return false;
    }

    isShowUpdateAppointment(item){
        if(moment(item.date).isSameOrAfter(moment(), 'day') && item.type === 'A'){
            return true;
        }else{
            return false;
        }
    }

    isShowAddToReserveList(item){
        return moment(item.date).isSameOrAfter(moment(), 'day') && item.type === 'A' && !item.appointment.reserve;
    }

    isShowUpdateReserveList(item){
        return moment(item.date).isSameOrAfter(moment(), 'day') && item.type === 'A' && item.appointment.reserve;
    }

    isShowRemoveFromReserveList(item){
        return moment(item.date).isSameOrAfter(moment(), 'day') && item.type === 'A' && item.appointment.reserve;
    }

    isShowCloseTimeslot(item){
        return true;
    }

    isShowOpenTimeslot(item){
        if(item.type === 'U'){
            return true;
        }else{
            return false;
        }
    }

    isShowDeleteAppointment(item){
        if(moment(item.date).isSameOrAfter(moment(), 'day') && item.type == 'A'){
            return true;
        }else{
            return false;
        }
    }

    isShowWaitingList(item){
        if(item.type == 'A'){
            return true;
        }else{
            return false;
        }
    }

    cancelMultipleAppointment = () => {
        this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_MODE_APPT);
    }

    // removeDailyViewTimeslot = removeIdx => event => {
    //     // console.log('removeDailyViewTimeslot index = '+removeIdx);
    //     let outputDailyViewTimeslotList = [...this.props.generalAppointmentObjList];
    //     let removeList = outputDailyViewTimeslotList.splice(removeIdx, 1);
    //     this.props.updateGeneralAppointmentObjList(outputDailyViewTimeslotList);
    // }

    isSelfPatient = (patient) => {
        return this.props.patientInfo && this.props.patientInfo.patientKey === patient?.patientKey;
    }

    infectionControlPeriodItem(item) {
        const infectionControlIds = this.props.infectionControlUnavailablePeriodReasons.map(rsn => rsn.unavailPerdRsnId);
        if (item.unavailablePeriods) {
            const unavailablePeriodsInfectionControl = item.unavailablePeriods.filter(unavailablePeriod => infectionControlIds.includes(unavailablePeriod.unavailablePeriodReasonId));
            if (unavailablePeriodsInfectionControl.length > 0 && unavailablePeriodsInfectionControl.length == item.unavailablePeriods.length) {
                return true;
            }
        }
        return false;
    }

    getHighlightClass = (listItem, classes, isBackground = false) => {
        const highlightClasses = [];
        if (this.isSelfPatient(listItem?.appointment?.patientDto)) {
            highlightClasses.push(isBackground? classes.isSelfPatientRecordBackground : classes.isSelfPatientRecord);
        }
        if(this.props.referralShowAppointmentId && this.props.referralShowAppointmentId === listItem?.appointment?.appointmentId) {
            highlightClasses.push(isBackground? classes.isReferralShowAppointmentBackground : classes.isReferralShowAppointment);
        }
        return clsx(highlightClasses);
    }

    handleClick = (event, timeslotItem) => {
        //this.props.tonyTestSetValue('a', 'hihi'); // Tony test
        //this.props.printtonyTestSetValue(); // Tony test
        if (!this.props.isPatientTab) return;
        if(moment(this.props.DailyViewList[0].date).startOf('day').isSameOrAfter(moment().startOf('day'))){
            if(this.props.patientInfo){
                if(timeslotItem){
                    if(timeslotItem.type != 'U'){
                        this.props.addToGeneralAppointmentObjList(timeslotItem);
                        if(
                            (this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT) ||
                            (this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT && timeslotItem.type != 'A' )
                        ){
                            // if (!_.isEmpty(this.props.selectedEncounterType)) {
                                this.props.appointmentAction(); //open popup
                            // } else {
                            //     this.props.openCommonMessage({
                            //         msgCode: '111601',
                            //         showSnackbar: true
                            //     });
                            // }
                        }
                    }
                }
            }
        }
    };

    handleUpdateAppointment = async (timeslotItem) => {
        await this.props.setBookingModeAsync(dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT);
        this.props.addToGeneralAppointmentObjList(timeslotItem.appointment);
        this.props.appointmentAction();
    }

    handlePrintAppointmentLabel = (appointmentItem) => {
        //console.log('handlePrintAppointmentLabel-item:'+JSON.stringify(appointmentItem));
        if(appointmentItem.appointment){
            this.props.getAppointmentLabel({
                //appointmentDate: moment(appointmentItem.date).format(Enum.DATE_FORMAT_DMY_WITH_WEEK),
                appointmentDate: dtsUtilities.formatDateChineseDayOfWeekLabel(appointmentItem.date),
                appointmentTime: moment(dtsUtilities.getAppointmentStartTime(appointmentItem.appointment)).format(Enum.TIME_FORMAT_12_HOUR_CLOCK),
                encntrTypeDesc: appointmentItem.appointment.encounterTypeDescription,
                rmCd: appointmentItem.appointment.roomCode,
                engSurname: appointmentItem.appointment.patientDto.engSurname,
                engGivename: appointmentItem.appointment.patientDto.engGivename,
                otherDocNo: appointmentItem.appointment.patientDto.otherDocNo || '0123456789' //no otherDocNo in appointmentItem-patientDto
            },this.handleOpenDtsPrintAppointmentLabelDialog);
            //appointmentLabelData
        }
    }

    handleRescheduleAppointmentButtonAction = async (appointmentItem) => {
        this.props.setSelectedRescheduleAppointment({ fromAppointment: appointmentItem.appointment });
        await this.props.setBookingModeAsync(dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT);
        if (_.isEmpty(this.props.patientInfo)) {
            const callback = () => {
                this.props.skipTab(accessRightEnum.DtsBooking,
                    {
                        paramFrom: 'DtsDayViewPanel',
                        bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT
                    }
                );
            };
            dtsUtilities.getPatientInfo({ patientKey: appointmentItem.appointment.patientKey, callback });
        }
    }

    getAllAppointmentTimeslot = (appointment) => {
        return _.flatten(appointment.appointmentDetlBaseVoList.filter((item) => (!item.isObsolete))[0].mapAppointmentTimeSlotVosList.filter((item) => (!item.isObsolete)).map((item) => (item.timeslotVo)));
    }

    getDailyViewItem(idx, item, classes){
        const displayInfectionControl = this.state.displayInfectionControl;
        const infectionControlIds = this.props.infectionControlUnavailablePeriodReasons.map(rsn => rsn.unavailPerdRsnId);
        if (!displayInfectionControl && this.infectionControlPeriodItem(item)) {
            return null;
        }
        return (
            <TableRow className={clsx(item.type === 'U' && classes.unavailableTableRow, classes.tableRow, this.getHighlightClass(item, classes, true))} key={idx} hover={item.type != 'U'} onClick={(event) => this.handleClick(event, item)}>
                <TableCell className={classes.tableCell + ' ' + classes.durCell} align="right">
                    {/* <DtsDurationIcon duration={moment(item.endTime, 'HHmm').diff(moment(item.startTime, 'HHmm'), 'minutes') / 15}/> */}
                    <DtsTimeslotsDurationIcon iconType={item.appointment ? item.appointment.isUrgentSqueeze && item.appointment.isUrgentSqueeze == 1 ? 'isUrgentSqueeze': item.appointment.isUrgent && item.appointment.isUrgent == 1 ? 'isUrgent' : item.appointment.isSqueeze && item.appointment.isSqueeze == 1 ? 'isSqueeze' : 'isNormal' : 'isNormal'} timeslots={item.type === 'A' ? dtsUtilities.getAllAppointmentTimeslot(item.appointment) : item.timeslots}/>
                </TableCell>
                <TableCell className={clsx(classes.tableCell, this.getHighlightClass(item, classes), (item.type === 'A' && !_.isEmpty(item.unavailablePeriods)) && classes.unavailableTableRow)}>
                    {//item.startTime.replace(/(.{2})$/,':$1')
                        item.type === 'A' && !_.isEmpty(item.unavailablePeriods) ?
                        <Tooltip classes={{ tooltip: classes.tooltip }} title={item.unavailablePeriods.map(u => u.unavailablePeriodReason).reduce((acc, val, idx) => [...acc, <br key={idx}/>, val])}>
                            <p style={{margin: 0}}>{item.startTime}</p>
                        </Tooltip>
                        : item.startTime
                    }
                </TableCell>
                {item.type === 'U' ? (
                    <React.Fragment >
                        <TableCell className={classes.tableCell + ' ' + classes.alignCenter} colSpan={7}>
                            <OverflowTypography popoverTextProps={{className: classes.popoverText}} noWrap className={classes.nonAppointment}>
                                {/* Not to concat reason if not to display infection control && item with infectionControlId */}
                                {item.unavailablePeriods && item.unavailablePeriods.length > 0 ? '--- ' + _.uniq(item.unavailablePeriods.filter(item => displayInfectionControl ? true:!infectionControlIds.includes(item.unavailablePeriodReasonId)).map((item) => (item.unavailablePeriodReason))).join(', ') + ' ---' : ''}
                            </OverflowTypography>
                        </TableCell>
                    </React.Fragment>
                    ):(
                    <React.Fragment >
                        <TableCell className={classes.tableCell +' '+ classes.tableCellPatientInfo}>
                            {/* {item.type == 'A' && item?.appointment?.patientDto?
                            this.isSelfPatient(item?.appointment?.patientDto)? <Typography noWrap className={this.getHighlightClass(item, classes)}>{item.type == 'A' ? this.getPatientName(item.appointment.patientDto) : ''}</Typography>
                            : <DtsPatientLink patient={item.appointment.patientDto}/>
                            : null
                            } */}
                            {item.type == 'A' && item?.appointment?.patientDto?
                            this.isSelfPatient(item?.appointment?.patientDto)? <OverflowTypography popoverTextProps={{className: classes.popoverText}} noWrap className={this.getHighlightClass(item, classes)}>{item.type == 'A' ? this.getPatientName(item.appointment.patientDto) : ''}</OverflowTypography>
                            : <DtsPatientLink patient={item.appointment.patientDto}/>
                            : null
                            }
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                                <OverflowTypography popoverTextProps={{className: classes.popoverText}} noWrap {...item.type != 'A' ?{className: classes.nonAppointment}:{className: this.getHighlightClass(item, classes)}}>{item.type == 'A' ? item.appointment.encounterTypeDescription : (item.type == 'T' && item.timeslots.length > 0) ? item.timeslots[0].clnEncounterTypeGrpDescriptionDefault : ''}</OverflowTypography>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                                <OverflowTypography popoverTextProps={{className: classes.popoverText}} noWrap className={this.getHighlightClass(item, classes)}>{item.type == 'A' && item.appointment.appointmentSpecialRequestVo ? item.appointment.appointmentSpecialRequestVo.remark : ''}</OverflowTypography>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                                {item.type == 'A' && item.appointment.appointmentJustificationVo &&
                                <Tooltip classes={{ tooltip: classes.tooltip }} title={item.appointment.appointmentJustificationVo.exemptReason}>
                                    <Gavel className={this.getHighlightClass(item, classes)}/>
                                </Tooltip>
                                }
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            {item.appointment?.reserve?
                                <TagIcon>
                                    direct={'horizontal'}
                                    menuButtonSize={'small'}
                                    color={'blue'}
                                </TagIcon> : ''
                            }
                        </TableCell>
                        <TableCell className={classes.tableCell}>{item.type == 'A' ? this.getTelIcon(item.appointment.remindStatus) : ''}</TableCell>
                        <TableCell className={classes.tableCell}>{item.type == 'A' && item.appointment.patientDto.patientReminders && item.appointment.patientDto.patientReminders.length > 0 ? this.getBellIcon(1) : ''}</TableCell>
                    </React.Fragment>
                )}

                        <TableCell className={classes.tableCell}>{this.getMenuIcon(item)}</TableCell>



            </TableRow>
        );
    }

    handleOpenDtsPrintAppointmentLabelDialog = () => {
        this.setState({dtsPrintAppointmentLabelDialogOpen:true});
    }

    handleCloseDtsPrintAppointmentLabelDialog = () => {
        this.setState({dtsPrintAppointmentLabelDialogOpen:false});
    }

    getCurrentAvailableTimeSlotIndex = () => {
        if(Array.isArray(this.props.availableTimeSlotList) && this.props.availableTimeSlotList.length != 0 ){
            if(this.props.calendarDetailDate != null){
                let currIndex = this.props.availableTimeSlotList.findIndex( item =>
                    item === moment(this.props.calendarDetailDate).format()
                );

                if(currIndex != -1){
                    return currIndex;
                }
            }
        }
        return 0;
    }

    render(){
        const { classes, className, filterMode, calendarDetailDate,availableTimeSlotList,appointmentLabelData, selectedRoom, ...rest } = this.props;
        let sessionList = _.uniq(this.props.DailyViewList.map(item => item.session.sessionDescription.toUpperCase())).sort(
            (a, b) => {
                const sessionOrder = ['AMEOH', 'AM', 'PM', 'PMEOH', 'EDC'];
                let idx_a = sessionOrder.indexOf(a);
                let idx_b = sessionOrder.indexOf(b);

                if (idx_a > idx_b){
                    return 1;
                }
                else if (idx_a < idx_b){
                    return -1;
                }
                else {
                    return 0;
                }
            }
        );

        return(

        <ValidatorForm ref="LocationEncounterForm">
            {this.state.dtsPrintAppointmentLabelDialogOpen && (
                <DtsPrintAppointmentLabel
                    openConfirmDialog={this.state.dtsPrintAppointmentLabelDialogOpen}
                    closeConfirmDialog={this.handleCloseDtsPrintAppointmentLabelDialog}
                    pmiAppointmentLabelData={appointmentLabelData}
                />
            )}
            <Paper className={classes.root + ' ' + className}>
                <Paper style={{height:50}} variant="outlined" square>
                    <Grid>
                        <div style={{height:50, width:500, float:'left',display:'flex', alignItems:'center',justifyContent:'left'}}>
                        {
                            (filterMode == 0) ? (
                                <Card className={classes.emptyCalenderList}></Card>
                            ) : (filterMode == 2) ? (
                                <FormControl className={classes.dateSelector}>
                                    {typeof availableTimeSlotList != undefined && availableTimeSlotList.length != 0 && <DtsSelectFieldValidator
                                        key={DTS_DATE_DISPLAY_FORMAT}
                                        id={'dateSelect'}
                                        isDisabled={false}
                                        TextFieldProps={{
                                            variant: 'outlined'
                                        }}
                                        options={
                                            availableTimeSlotList.map((item) => (
                                                { value: item, label: moment(item, 'YYYY-MM-DD HH:mm:ss').format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)}))
                                        }
                                        defaultValue={availableTimeSlotList[this.getCurrentAvailableTimeSlotIndex()]}
                                        value={calendarDetailDate}
                                        //value={moment(calendarDetailDate, 'YYYY-MM-DD').format('DD-MM-YYYY')}
                                        msgPosition="bottom"
                                        //addNullOption
                                        validators={this.getValidator('DateSelector')}
                                        errorMessages={this.getErrorMessage('DateSelector')}
                                        onChange={e => this.handleDateChange(e.value)}
                                                                                                                       />
                                    }
                                </FormControl>
                            ) : (filterMode == 1 && calendarDetailDate) ?
                            (
                                <label  className={classes.dateLabel}  >
                                    {moment(calendarDetailDate, 'YYYY-MM-DD').format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)}
                                </label >
                            ) : (filterMode == -1) && (<label className={classes.dateLabel}>No matched date</label>)
                        }
                        {
                            !_.isEmpty(selectedRoom) && calendarDetailDate && (
                                    <label  className={classes.surgeryLabel}  >Surgery: {selectedRoom.rmCd}</label>
                            )
                        }
                        </div>
                        <div style={{height:50, float:'right', display:'flex', alignItems:'center'}}>
                            <FormControlLabel
                                control={<Switch checked={this.props.squeezeInMode} onChange={this.switchSqueezeInMode} />}
                                label="Show Booked Appointment"
                            />
                            <FormControlLabel
                                control={<Switch checked={this.state.displayInfectionControl} onChange={this.switchInfectionControlDisplay} />}
                                label="Show Infection Control"
                            />
                            {/* <IconButton className={classes.filterIcon} onClick={e => this.switchSqueezeInMode()}>
                                <img src={dailyViewFilterIcon} alt="dailyViewFilterIcon" ></img>
                            </IconButton> */}
                        </div>
                    </Grid>
                </Paper>

                <Table className={classes.table} aria-label="caption table">
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.headerTableCell} align="right">Duration</TableCell>
                            <TableCell className={classes.headerTableCell}>Time</TableCell>
                            <TableCell className={classes.headerTableCell}>Patient Info</TableCell>
                            <TableCell className={classes.headerTableCell}>Enc. Type</TableCell>
                            <TableCell className={classes.headerTableCell}>Special Request</TableCell>
                            <TableCell className={classes.headerTableCell}>Just.</TableCell>

                            <TableCell className={classes.headerTableCell + ' ' + classes.headerTableCellReserveTag}></TableCell>
                            <TableCell className={classes.headerTableCell}></TableCell>
                            <TableCell className={classes.headerTableCell}></TableCell>
                            <TableCell className={classes.headerTableCell}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    {
                    (filterMode == 2 ? typeof availableTimeSlotList != undefined && availableTimeSlotList.length != 0 : calendarDetailDate) ?
                        (
                            <TableBody>
                                {
                                    sessionList.map(
                                        (session, idx, array) => {
                                            return (
                                            <React.Fragment key={'dailyViewSession' + session}>
                                                {
                                                    this.props.DailyViewList
                                                    .filter(item => this.props.squeezeInMode ? true : item.type === 'T')
                                                    .filter(item => item.session.sessionDescription.toUpperCase() == session).map(
                                                        (row, idx) => {return this.getDailyViewItem(idx, row, classes);}
                                                    )
                                                }
                                                {
                                                    (array.indexOf(session) === array.length - 1) ? (
                                                        <TableRow className={classes.tableRowEnd} key={'dailyViewSessionEnd' + session}>
                                                            <TableCell colSpan={10} className={classes.tableCell +' '+ classes.dayEnd} >--- Day End ---</TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        <TableRow className={classes.tableRowSessionBreak} key={'dailyViewSessionSessionBreak' + session}>
                                                            <TableCell colSpan={10} className={classes.tableCellSessionBreak}/>
                                                        </TableRow>
                                                    )
                                                }
                                            </React.Fragment>
                                            );
                                        }
                                    )
                                }
                            </TableBody>
                        )
                    :
                        null
                    }
                </Table>
            </Paper>
            {
                (this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE) &&
                <Paper className={classes.multiApptRoot + ' ' + className}>
                    <Grid container>
                        <Grid container item xs={12} className={classes.bookmarkHead}>
                            <Grid item xs={2}></Grid>
                            <Grid item xs={8}>
                                <DtsButton className={classes.bookmarkBtn} iconType={'BOOKMARK'} onClick={this.props.appointmentAction} >Check Out</DtsButton>
                            </Grid>
                            <Grid item xs={2}>
                                <Tooltip title={'Cancel'}>
                                    <IconButton className={classes.cancelIcon} onClick={e => this.cancelMultipleAppointment()}>
                                        <CancelIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} className={classes.bookmarkGrid}>
                            {this.props.generalAppointmentObjList.map((data, idx) => {
                                const dateTimeLabel = moment(data.date).format(DTS_DATE_DISPLAY_FORMAT) + ' ' +
                                ((data.appointmentTime != null) ? data.appointmentTime.startTime : data.timeslots[0].startTime);
                                return (
                                <li key={idx}>
                                    <Chip
                                        size="small"
                                        label={dateTimeLabel}
                                        onDelete={() => {
                                            this.setState({ confirmPromptDialog: {
                                                open: true,
                                                content: `Confirm to remove ${dateTimeLabel} from the appointment list?`,
                                                action: this.props.removeFromGeneralAppointmentObjList(idx)
                                            }});
                                        }}
                                        className={classes.chip}
                                    />
                                </li>
                                );
                            })}
                        </Grid>
                    </Grid>
                    <CIMSPromptDialog
                        open={this.state.confirmPromptDialog.open}
                        dialogTitle={'Confirmation'}
                        dialogContentText={this.state.confirmPromptDialog.content || 'Confirm?'}
                        dialogActions={
                            <Grid container wrap="nowrap" justify="center">
                                <CIMSButton
                                    id="confirmBeforeActionPopupOkayButton"
                                    onClick={() => {
                                        setTimeout(() => {
                                            this.state.confirmPromptDialog.action();
                                            this.setState({ confirmPromptDialog: {
                                                open: false,
                                                content: null,
                                                action: null
                                            }});
                                        }, 0);
                                    }}
                                >Confirm</CIMSButton>
                                <CIMSButton
                                    id="confirmBeforeActionPopupCancelButton"
                                    onClick={() => {
                                        this.setState({ confirmPromptDialog: {
                                            open: false,
                                            content: null,
                                            action: null
                                        }});
                                    }}
                                >Cancel</CIMSButton>
                            </Grid>
                        }
                    />
                </Paper>
            }
        </ValidatorForm>
        );
    }
}

const mapStateToProps = (state) => {
    // console.log('selectedDailyViewTimeslotList ' + JSON.stringify(state.dtsAppointmentBooking.selectedDailyViewTimeslotList));
    return {
        DailyViewList: state.dtsAppointmentBooking.pageLevelState.dailyView,
        filterMode: state.dtsAppointmentBooking.pageLevelState.filterMode,
        calendarDetailDate: state.dtsAppointmentBooking.pageLevelState.calendarDetailDate,
        availableTimeSlotList: state.dtsAppointmentBooking.pageLevelState.availableTimeSlotList,
        patientInfo: state.patient.patientInfo,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        selectedEncounterType: state.dtsAppointmentBooking.pageLevelState.selectedEncounterType,
        squeezeInMode: state.dtsAppointmentBooking.pageLevelState.squeezeInMode,
        // selectedRescheduleAppointment: state.dtsAppointmentBooking.selectedRescheduleAppointment,
        selectedDayTimeslotList: state.dtsAppointmentBooking.selectedDayTimeslotList,
        encounterTypeList: state.dtsAppointmentBooking.pageLevelState.encounterTypeList,
        dailyViewNavigationHistory: state.dtsAppointmentBooking.dailyViewNavigationHistory,
        appointmentLabelData: state.dtsAppointmentBooking.appointmentLabelData,
        referralShowAppointmentId: state.dtsAppointmentBooking.referralShowAppointmentId,
        infectionControlUnavailablePeriodReasons: state.dtsPreloadData.infectionControlUnavailablePeriodReasons
    };
};

const mapDispatchToProps = {
    setCalendarDetailDate,
    getDailyView,
    setSqueezeInMode,
    setSelectedDayTimeslotList,
    setSelectedDeleteAppointment,
    setSelectedCloseTimeslot,
    removeFromReserveList,
    getEncounterTypeList,
    setSelectedEncounterType,
    setDuration,
    setDailyViewNavigationHistory,
    getAppointmentLabel,
    getAppointmentLog,
    openCommonMessage,
    setSelectedRescheduleAppointment,
    skipTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDayViewPanel));