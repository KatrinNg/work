import React, { Component } from 'react';
//import { useState, useRef } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FormControl from '@material-ui/core/FormControl';
//import FormLabel from '@material-ui/core/FormLabel';
import {
    //Checkbox,
    Typography,
    FormControlLabel
} from '@material-ui/core';

import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
//import CIMSButton from '../../../../components/Buttons/CIMSButton';
//import DtsButton from '../../components/DtsButton';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import DtsSplitButton from '../../components/DtsSplitButton';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
//import Select from 'react-select';
//import ReactSelect from 'react-select';
//import DtsMultipleSelect from '../../components/DtsMultipleSelect';
//import CIMSSelect from '../../../../components/Select/CIMSSelect';
// import { getClinicList } from '../../../../store/actions/dts/dtsCommonAction';
import moment from 'moment';


import {
    resetLocationEncounter,
    setSelectedClinic,
    getRoomList,
    //    setSelectedRoom,
    setCalendarDetailDate1,
    setCalendarDetailDate2,
    setOnlyNeedReminder,
    getRemindAppointmentList,
    getServeRoom,
    getRemindAppointmentListReport,
    resetRemindAppointmentListReport,
    setSelectedRooms,
    setSelectedDateStart,
    setSelectedDateEnd
} from '../../../../store/actions/dts/appointment/remindAppointmentAction';
import DtsPrintRemindAppointmentListReportDialog from './DtsPrintRemindAppointmentListReportDialog';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = ({

    // root: {
    //     width: 250
    // }
    root: {
        margin: 'auto',
        width: '90%',
        padding: '10px',
        'border-radius': '0px',
        border: '0px',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        'text-align': 'center',
        '& .MuiInputLabel-outlined':{
            fontSize: '14px',
            marginTop: '2px',
            marginLeft: '-3px'
        }
    },
    row: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
        // margin: '10px 3px 0px 3px'
    },
    row2: {
        width: '100%',
        margin: '10px 3px 0px 3px'
    },
    row2Button: {
        margin: 8,
        minWidth: '15px'

    },
    clinicSelect: {
        width: '95%',
        margin: '8px'
    },
    //    multipleSelect:{
    //        width: '95%',
    //        margin: '8px'
    //    },
    roomSelect: {
        width: '95%',
        margin: '8px'
    },
    roomInput: {
        display: 'flex',
        height: 'auto'
    },
    label: {
        padding: '10px 0px',
        fontStyle: 'italic'
        //top: '10px'
    },
    inlineBoldLabel: {
        padding: 10,
        fontWeight: '600',
        fontStyle: 'italic',
        //        fontSize: '10pt',
        position: 'relative',
        top: '10px',
        bottom: '10px'
    },
    inlineLabel2: {
        color: 'blue'
    },
    applDatePicker: {
        width: '45%',
        margin: '8px'
    },
    checkPadding: {
        margin: 0,
        padding: 10
    },
    checkLabelMagin: {
        margin: 0
    },
    //    searchBoxBtn:{
    //        //float: 'right'
    //        width: '95%'
    //        // margin: '10px 3px 0px 3px'
    //    },
    groupSplitBtn: {
        width: '95%',
        // display: '',
        float:'left',
        margin: '8px 10px'
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
    }

});


// Button group
const buttonGroupNames = ['Search', 'and Print Appt List'];

class DtsRemindAppointmentSearchPanel extends Component {

    constructor(props) {
        super(props);

        // Component state
        this.state = {
            selectedRoomList: [],
            selectedClinic: null,
            calendarDetailDate1: moment(0, 'HH').add(7, 'd'),
            calendarDetailDate2: moment(0, 'HH').add(12, 'd'),
            // calendarDetailDate1: this.props.selectedDateStart,
            // calendarDetailDate2: this.props.selectedDateEnd,
            onlyNeedReminder: true,
            currentButtonName: buttonGroupNames[0],
            remindAppointmentListReportDialogOpen: false
        };
    }

    // componentWillMount() {
    //this.props.resetLocationEncounter();
    // if(this.props.clinicList && this.props.clinicList.length==0) {
    //     this.props.getClinicList({serviceCd:this.props.serviceCd});
    // }
    // let a = moment('2020-06-24T13:15:30+0800');
    // let b = moment('2020-06-24 13:15:30');

    // console.log('a:' + a.format());
    // console.log('b:' + b.format());

    // console.log('moment().format():' + moment().format());
    // console.log('moment().format(\'YYYY-MM-DD HH:mm:ss\'):' + moment().format('YYYY-MM-DD HH:mm:ss'));
    // }

    componentDidMount() {
        console.log('compoentnDidMount');
        let curClinic = this.props.clinicList.find(clinic => clinic.siteId == this.props.defaultClinic.siteId);
        this.setState({ selectedClinic: curClinic });
        const self = this;
        let getServeRoom = function () {
            //console.log('self1' + typeof self);
            return function () {
                //console.log('self' + typeof self);
                //console.log('self.props' + typeof self.props);
                self.props.getServeRoom({ userId: self.props.loginInfo.userDto.userId, date: moment() }, self.setDefaultRoom);
            };
        }();
        this.props.getRoomList({ siteId: curClinic.siteId },
            // function (){
            //     let self = this;
            //     return function (){
            //         self.props.getServeRoom({userId: self.props.loginInfo.userDto.userId, date: moment()}, self.setDefaultRoom);
            //     };
            // }()
            getServeRoom
        );
    }


    componentDidUpdate(prevProps) {
        console.log('componentDidUpdate');
        //if(this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
        if (this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
            //set default to clinicList[0]
            this.props.setSelectedClinic({ clinic: this.props.clinicList[0] });
            this.props.getRoomList({ siteId: this.props.clinicList[0].siteId });
        }
        //console.log('selectedRoom:'+JSON.stringify(this.state.selectedRoom));
    }

    componentWillUnmount() {
        this.props.resetLocationEncounter();
    }

    setDefaultRoom = (roomList) => {
        {/*
        //console.log('Default roomList:' + JSON.stringify(roomList));
        //console.log('roomList:' + JSON.stringify(this.props.roomList));
        if (roomList && roomList.length > 0){
            let roomInRoomList = this.props.roomList.find((item) => (item.rmId == roomList[0].roomId));

            if (roomInRoomList) {
                this.setState({selectedRoomList: roomInRoomList});
            }
        }
        else{
            this.setState({selectedRoomList: this.props.roomList.length > 0 ? this.props.roomList[0] : null});
        }
        this.refs.remindAppointmentSearch.submit();
*/}
    }

    handleClinicChange = (value) => {
        this.setState({ selectedClinic: value });
        this.props.getRoomList({ siteId: value.siteId });
    }

    handleRoomChange = (value) => {

        let _selectedRoomList = [];
        if (value) {
            value.forEach(item => {
                _selectedRoomList.push(item.value);
                this.props.setSelectedRooms(_selectedRoomList);
            });
        } else {
            _selectedRoomList = [];
        }

        this.setState({ selectedRoomList: _selectedRoomList });

        //        this.setState({selectedRoomList: value});
    }

    handleDateChange1 = value => {
        let tempValue = moment(value);
        this.setState({ calendarDetailDate1: moment(value) });
        this.props.setSelectedDateStart(tempValue.format('YYYY-MM-DD'));//tbu: will use local state instead
        this.props.setCalendarDetailDate1(tempValue.format('YYYY-MM-DD'));
    }

    handleDateChange2 = value => {
        let tempValue = moment(value);
        this.setState({ calendarDetailDate2: moment(value) });
        this.props.setSelectedDateEnd(tempValue.format('YYYY-MM-DD'));
        this.props.setCalendarDetailDate2(tempValue.format('YYYY-MM-DD'));

    }

    handleOnlyNeedReminderChange = event => {

        this.setState({ onlyNeedReminder: event.target.checked });

    }

    buttonGroupOnClick = (buttonName) => {
        this.setState({ currentButtonName: buttonName }, this.refs.remindAppointmentSearch.submit());
    }

    // buttonOnClick = () =>{
    //     // console.log('buttonOnClick Clinic: ' + this.state.selectedClinic);
    //     // console.log('buttonOnClick Room: ' + this.state.selectedRoom);
    //     this.props.setSelectedClinic({selectedClinic: this.state.selectedClinic});
    //     this.props.setSelectedRoom({selectedRoom: this.state.selectedRoom});
    //     this.props.setcalendarDetailDate1({ calendarDetailDate1: this.state.calendarDetailDate1});
    //     this.props.getDailyView({rmId:this.state.selectedRoom.rmId, date:this.state.calendarDetailDate1});
    // }


    getValidator = (name) => {
        let validators = [];
        if (name === 'ClinicRemindAppointmentSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'RoomRemindAppointmentSelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'ClinicRemindAppointmentSelector') {
            errorMessages.push('Clinic is required');
            return errorMessages;
        }
        else if (name === 'RoomRemindAppointmentSelector') {
            errorMessages.push('Room is required');
            return errorMessages;
        } else if (name === 'NoPatientSelected'){
            errorMessages.push('Please select patient before print.');
            return errorMessages;
        }
    }
    /*
        handlePrevDate = ()=>{
            console.log('handlePrevDate');
            let dateObj;

            if(this.state.calendarDetailDate1 == null)
                dateObj = moment(0, 'HH');
            else
                dateObj = this.state.calendarDetailDate1;
            dateObj = moment(dateObj).subtract(1, 'days');
            this.setState({calendarDetailDate1: dateObj}, this.refs.remindAppointmentSearch.submit());
        }

        handleIncrementDate = () =>{
            console.log('handleIncrementDate');
            let dateObj;

            if(this.state.calendarDetailDate1 == null)
                dateObj = moment(0, 'HH');
            else
                dateObj = this.state.calendarDetailDate1;
            dateObj = moment(dateObj).add(1, 'days');
            this.setState({calendarDetailDate1: dateObj}, this.refs.remindAppointmentSearch.submit());
        }

        handleTodayDate = () => {
            console.log('handleTodayDate');
            let dateObj;
            dateObj = moment(0, 'HH');
            this.setState({calendarDetailDate1: dateObj}, this.refs.remindAppointmentSearch.submit());
        }
    */

    // dental Miki sprint 9 2020/09/16 - Start
    genRemindAppointmentListParams = () => {
        console.log('genRemindAppointmentListParams');

        if (Array.isArray(this.props.selectedRoomList) && this.props.selectedRoomList.length != 0) {
            let reminderListByDate = [];

            // gen data map
            let reminderDateMap = new Map();
            let reminderRoomMap;
            let reminderPatientMap;

            this.props.selectedRoomList.forEach((roomItem) => {
                if (!reminderDateMap.has(roomItem.appointmentDateTime.substring(0, 10) + 'T00:00:00+08:00')) {
                    let reminderRoomMap = new Map();
                    reminderDateMap.set(roomItem.appointmentDateTime.substring(0, 10) + 'T00:00:00+08:00', reminderRoomMap);
                }

                reminderRoomMap = reminderDateMap.get(roomItem.appointmentDateTime.substring(0, 10) + 'T00:00:00+08:00');
                if (!reminderRoomMap.has(roomItem.roomCode)) {
                    let reminderPatientMap = new Map();
                    reminderRoomMap.set(roomItem.roomCode, reminderPatientMap);
                }

                reminderPatientMap = reminderRoomMap.get(roomItem.roomCode);
                if (!reminderPatientMap.has(roomItem.patientDto.patientKey)) {
                    reminderPatientMap.set(roomItem.patientDto.patientKey, roomItem);
                }
            });

            // gen data array list for params
            let reminderDateList = Array.from(reminderDateMap);

            reminderDateList.sort(function (a, b) {
                let aTime = moment(a[0]);
                let bTime = moment(b[0]);
                if (aTime.isBefore(bTime))
                    return -1;
                else
                    return 1;
            });

            reminderDateList.forEach((dateList) => {
                // console.log(dateList);
                let tempRoomList = Array.from(dateList[1]);
                tempRoomList.sort(function (a, b) {
                    let aRoom = moment(a[0]);
                    let bRoom = moment(b[0]);
                    if (aRoom.isBefore(bRoom))
                        return -1;
                    else
                        return 1;
                });
            });

            //Each Date START
            // console.log(reminderDateList);
            let tempReminderList = [];
            let tempSurgeryList = [];
            reminderDateList.forEach((dateList) => {
                let appointmentDate = dateList[0];
                let roomList = Array.from(dateList[1]); // 0: [Room Code, patientKeyList]

                //Each Room START
                let tempRoomList = [];
                roomList.forEach(eachRoomList => {
                    let tempPatientList = [];
                    let patientList = Array.from(eachRoomList[1]); // 0: [patientKey, patientData]
                    let surgery = eachRoomList[0];
                    //Each Patient START
                    patientList.forEach(patient => {
                        //Patient phoneList
                        let phoneList = '';
                        if (patient[1].patientDto.phoneList.length > 0) {
                            let tempPhoneListArray = [];
                            patient[1].patientDto.phoneList.forEach(phone => {
                                let tempPhone = phone.phoneTypeCode + ': ' + phone.phoneNumber.substr(0, 4) + ' ' + phone.phoneNumber.substr(4, 4);
                                tempPhoneListArray.push(tempPhone);
                            });
                            phoneList = tempPhoneListArray.toString().split(',').join('\n');
                        }
                        let docNo = patient[1].patientDto.documentPairList.filter(mainDoc => mainDoc.isPrimary === 1).map(doc => {
                            return dtsUtilities.maskDocNo(doc.documentNo);
                        });
                        let chiName = patient[1].patientDto.nameChi || '';
                        let docId = docNo[0] || '';
                        let duration = dtsUtilities.getAppointmentDuration(patient[1]) || '';
                        let encType = patient[1].encounterTypeDescription || '';
                        let englishName = dtsUtilities.getPatientName(patient[1].patientDto) || '';
                        // console.log(patient[1].patientDto.patientReminders);
                        let toStringPatientReminder =  patient[1].patientDto.patientReminders.length > 0 ? patient[1].patientDto.patientReminders[0].remark : '';
                        let patientReminder = toStringPatientReminder;
                        let specialReminderList = patient[1].specialReminderList != undefined ? patient[1].specialReminderList : '';
                        let remindStatus = patient[1].remindStatus || 'R0';
                        let specialRequest = (patient[1].appointmentSpecialRequestVo && patient[1].appointmentSpecialRequestVo.remark) ? patient[1].appointmentSpecialRequestVo.remark : '';
                        let startTime = moment(dtsUtilities.getAppointmentStartTime(patient[1])).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) || '';
                        let tel = phoneList;

                        tempPatientList.push({
                            'chiName': chiName,
                            'docId': docId,
                            'duration': duration,
                            'encType': encType,
                            'englishName': englishName,
                            'patientReminder': patientReminder,
                            'remindStatus': remindStatus,
                            'specialReminderList': specialReminderList,
                            'specialRequest': specialRequest,
                            'startTime': startTime,
                            'tel': tel
                        });
                    });//Each Patient END
                    tempRoomList.push({
                        'appointmentDate': moment(appointmentDate).format('DD-MM-YYYY'),
                        'surgery': surgery,
                        'reminderListPatient': tempPatientList
                    });
                    tempSurgeryList.push(surgery);
                });//Each Room END
                tempReminderList.push(tempRoomList);

            });//Each Date END
            //Return result
            let result = {};
            result = {
                'surgeryList': tempSurgeryList,
                'reminderList': tempReminderList
            };
            console.log(result);
            return result;
        }
        else {
            return null;
        }
    }

    handleOpenPrintRemindAppointmentListReportDialog = () => {
        this.setState({ remindAppointmentListReportDialogOpen: true });
    }

    handleClosePrintRemindAppointmentListReportDialog = () => {
        this.setState({ remindAppointmentListReportDialogOpen: false });
        this.props.resetRemindAppointmentListReport();
    }; //dental Miki sprint 9 2020/09/21 - END

    handleOnSubmit = () => {
        console.log('handleOnSubmit, currentButtonName = ' + this.state.currentButtonName);

        // let dateObj;

        if (this.state.currentButtonName === buttonGroupNames[0]) {
            // Search button
            this.props.setSelectedClinic({ selectedClinic: this.state.selectedClinic });
            //            this.props.setSelectedRoom({selectedRoomList: this.state.selectedRoomList});
            // this.props.setCalendarDetailDate1({ calendarDetailDate1: this.state.calendarDetailDate1.format('YYYY-MM-DD') });
            // this.props.setCalendarDetailDate2({ calendarDetailDate2: this.state.calendarDetailDate2.format('YYYY-MM-DD') });
            // this.props.setCalendarDetailDate1({ calendarDetailDate1: this.props.selectedDateStart.format('YYYY-MM-DD') });
            // this.props.setCalendarDetailDate2({ calendarDetailDate2: this.props.selectedDateEnd.format('YYYY-MM-DD') });
            this.props.setOnlyNeedReminder({ onlyNeedReminder: this.state.onlyNeedReminder });
            this.props.getRemindAppointmentList({
                clinicId: this.state.selectedClinic.siteId,
                rmIdList: this.state.selectedRoomList,
                // apptDateFrom: this.state.calendarDetailDate1,
                // apptDateTo: this.state.calendarDetailDate2
                apptDateFrom: this.props.selectedDateStart,
                apptDateTo: this.props.selectedDateEnd
            });
            // this.props.setSelectedDateEnd(this.state.calendarDetailDate2.format('YYYY-MM-DD'));
            // this.props.setSelectedDateStart(this.state.calendarDetailDate1.format('YYYY-MM-DD'));
            // this.props.setSelectedRooms(this.state.selectedRoomList);
            this.props.onClose();
        }
        else if (this.state.currentButtonName === buttonGroupNames[1]) {
            // dental Miki sprint 9 2020/09/17 - START
            if (this.props.selectedRoomList.length > 0) {
                let getResult = this.genRemindAppointmentListParams();
                let tempReminderListByDate = [];
                getResult.reminderList.forEach(foo => {
                    foo.forEach(temp => {
                        tempReminderListByDate.push(temp);
                    });
                });
                // console.log(tempReminderListByDate);
                this.props.getRemindAppointmentListReport({
                    'appointmentDateRange': moment(this.state.calendarDetailDate1).format('DD-MM-YYYY') + ' to ' + moment(this.state.calendarDetailDate2).format('DD-MM-YYYY'),
                    'appointmentListId': '9876543210',
                    'surgeryList': getResult.surgeryList.filter((v, i, a) => a.indexOf(v) === i).sort().toString(),
                    'isReminderPatientsNeed': this.state.onlyNeedReminder ? 'Yes' : 'No',
                    'locationName': this.state.selectedClinic.clinicName,
                    'reminderListByDate': tempReminderListByDate
                });
                this.handleOpenPrintRemindAppointmentListReportDialog();
                // dental Miki sprint 9 2020/09/21 - END
            } else {
                // popup alert user to select room list first
                this.props.openCommonMessage({msgCode: '101710'});
                // this.getErrorMessage('NoPatientSelected');
            }
        }
        else {
            // Should throw error, if it is an unrecognized button click
        }
    }

    handleSubmitError = () => {
        // console.log('handleSubmitError call');
        let { callbackFunc } = this.state;
        callbackFunc(false);
    }

    render() {
        const { classes, className, clinicList, roomList, ...rest } = this.props;

        //let dailyTaskLabel =  moment(calendarDetailDate1, 'YYYY-MM-DD').format('DD-MM-YYYY[(]ddd[)]') + ' ' + selectedClinic + ' - ' + selectedRoom + '';
        //console.log('dailyTaskLabel ' + dailyTaskLabel);
        return (
            <>
            <Paper className={classes.root + ' ' + className}>
                <ValidatorForm ref="remindAppointmentSearch" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    <div className={classes.row}>
                        <FormControl className={classes.clinicSelect}>
                            {typeof clinicList[0] != 'undefined' &&
                                <DtsSelectFieldValidator
                                    id={'ClinicRemindAppointmentSelect'}
                                    // isDisabled={false}
                                    isDisabled
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Clinic</>
                                    }}
                                    options={
                                        clinicList.map((item) => (
                                            { value: item, label: item.clinicCd }))}
                                    //defaultValue={clinicList[0]}
                                    value={this.state.selectedClinic}
                                    msgPosition="bottom"
                                    //addNullOption
                                    //onBlur={this.handleClinicChange}
                                    validators={this.getValidator('ClinicRemindAppointmentSelector')}
                                    errorMessages={this.getErrorMessage('ClinicRemindAppointmentSelector')}
                                    onChange={e => this.handleClinicChange(e.value)}
                                />}
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <FormControl className={classes.roomSelect}>
                            {/* Multiple Selection with no Select All option */}

                            <DtsSelectFieldValidator
                                id={'RoomRemindAppointmentSelect'}
                                // isDisabled={false}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Room</>
                                }}
                                options={
                                    roomList && roomList.map((item) => (
                                        { value: item.rmId, label: item.rmCd }))
                                }
                                innerProps={{
                                    className: classes.roomInput
                                }}
                                value={this.props.selectedRooms}
                                msgPosition="bottom"
                                //hideSelectedOptions={false}
                                //closeMenuOnSelect={false}
                                isMulti
                                addAllOption
                                //addNullOption
                                fullWidth
                                validators={this.getValidator('RoomRemindAppointmentSelector')}
                                errorMessages={this.getErrorMessage('RoomRemindAppointmentSelector')}
                                onChange={this.handleRoomChange}
                            />

                            {/* Multiple Selection with Select All option */}
                            {/*}
                            <DtsMultipleSelect
                                id={'RoomRemindAppointmentSelect'}
                                //isDisabled={false}
//                                inputTextFieldLabel="Room"
//                                inputOptionList={
//                                    roomList.map((item) => (
//                                        { value: item, label: item.rmCd }))
//                                }

                                options={
                                    roomList && roomList.map((item) => (
                                        { value: item.rmId, label: item.rmCd }))
                                }
                                isMulti
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
//                                className={classes.multipleSelect}
                                value={this.state.selectedRoomList}
                                allowSelectAll
//                                msgPosition="bottom"
                                //addNullOption
//                                validators={this.getValidator('RoomRemindAppointmentSelector')}
//                                errorMessages={this.getErrorMessage('RoomRemindAppointmentSelector')}
//                                onChange={e => this.handleRoomChange(e.value)}
                                onChange={this.handleRoomChange}
                            />
*/}

                            {/*}
                            <DtsSelectFieldValidator

//                            <DtsMultipleSelect

                                id={'RoomRemindAppointmentSelect'}
//                                isDisabled={false}
//                                TextFieldProps={{
//                                    variant: 'outlined',
//                                    label: <>Room</>
//                                }}
                                options={
                                    roomList && roomList.map((item) => (
                                        { value: item.rmId, label: item.rmCd }))
                                }
//                                innerProps={{
//                                    className: classes.roomInput
//                                }}
                                value={this.state.selectedRoomList}
//                                msgPosition="bottom"
                                //addNullOption
//                                fullWidth
                                validators={this.getValidator('RoomRemindAppointmentSelector')}
                                errorMessages={this.getErrorMessage('RoomRemindAppointmentSelector')}
                                onChange={e => this.handleRoomChange(e)}
//                                onChange={this.handleRoomChange}
                            />
*/}
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <span className={classes.inlineBoldLabel}>
                            Appointment Date  <span title="Max Range: Recent 2 weeks" className={classes.inlineLabel2}> [?] </span>
                        </span>
                    </div>
                    <div className={classes.row}>
                        <FormControl className={classes.applDatePicker}>
                            <DateFieldValidator
                                //ref={ref => this.dateOfBirthRef = ref}
                                id={'calendarDetailDate1'}
                                label={DTS_DATE_DISPLAY_FORMAT}
                                format={DTS_DATE_DISPLAY_FORMAT}
                                inputVariant="outlined"
                                disabled={false}
                                value={this.state.calendarDetailDate1}
                                onChange={this.handleDateChange1}
                                isRequired
                                validByBlur
                                errorMessages={['From Appointment Date is required']}
                            />
                        </FormControl>
                        &nbsp;-&nbsp;
{/*
                    </div>
                    <div className={classes.row}>
                        |
                    </div>
                    <div className={classes.row}>
*/}
                        <FormControl className={classes.applDatePicker}>
                            <DateFieldValidator
                                //ref={ref => this.dateOfBirthRef = ref}
                                id={'calendarDetailDate2'}
                                label={DTS_DATE_DISPLAY_FORMAT}
                                format={DTS_DATE_DISPLAY_FORMAT}
                                inputVariant="outlined"
                                disabled={false}
                                value={this.state.calendarDetailDate2}
                                onChange={this.handleDateChange2}
                                isRequired
                                validByBlur
                                errorMessages={['To Appointment Date is required']}
                            />
                        </FormControl>
                    </div>

                    <div className={classes.row}>
                        <FormControlLabel
                            control={
                                <CIMSCheckBox
                                    id={'onlyNeedReminder'}
                                    disabled={false}
                                    className={classes.checkPadding}
                                    onChange={this.handleOnlyNeedReminderChange}
                                    checked={this.state.onlyNeedReminder}
                                />
                            }
                            className={classes.checkLabelMagin}
                            label={<Typography variant="subtitle1">Only patients who need reminder</Typography>}
                        />
                    </div>

                    <div className={classes.row}>
                        {/*
                        <DtsButton className={classes.searchBoxBtn} iconType={'REFRESH'} onClick={() => this.refs.remindAppointmentSearch.submit()}>Search</DtsButton>
*/}
                        <DtsSplitButton
                            className={classes.groupSplitBtn}
                            itemListEl={buttonGroupNames}
                            btnOnClick={this.buttonGroupOnClick}
                        />
                    </div>

                    <div className={classes.row}>
                        {/*                     <CIMSButton className={classes.button} onClick={this.handlePrevDate}>&lt;</CIMSButton>
                        <CIMSButton className={classes.button} onClick={this.handleTodayDate}>Today</CIMSButton>
                        <CIMSButton className={classes.button} onClick={this.handleIncrementDate}>&gt;</CIMSButton>
*/}
                    </div>
                </ValidatorForm>
            </Paper>
            {this.state.remindAppointmentListReportDialogOpen && (
                <DtsPrintRemindAppointmentListReportDialog
                    openConfirmDialog={this.state.remindAppointmentListReportDialogOpen}
                    closeConfirmDialog={this.handleClosePrintRemindAppointmentListReportDialog}
                    remindAppointmentListReport={this.props.remindAppointmentListReport}
                    closeLeftPanel={this.props.onClose}
                />
            )}
            </>
        );
    }

}


const mapStateToProps = (state) => {
    // console.log('DailyViewList ' + JSON.stringify(state.dtsAppointmentBooking.dailyView));
    return {
        //clinicList: state.dtsCommon.clinicList,
        serviceCd: state.login.service.serviceCd,
        selectedClinic: state.dtsRemindAppointment.selectedClinic,
        selectedRoomList: state.dtsRemindAppointment.selectedRoomList,
        roomList: state.dtsRemindAppointment.roomList,
        calendarDetailDate1: state.dtsRemindAppointment.calendarDetailDate1,
        calendarDetailDate2: state.dtsRemindAppointment.calendarDetailDate2,
        onlyNeedReminder: state.dtsRemindAppointment.onlyNeedReminder,
        defaultClinic: state.login.clinic,
        clinicList: state.common.clinicList,
        loginInfo: state.login.loginInfo,
        remindAppointmentListReport: state.dtsRemindAppointment.remindAppointmentListReport,
        selectedRooms:state.dtsRemindAppointment.selectedRooms,
        selectedDateStart:state.dtsRemindAppointment.selectedDateStart,
        selectedDateEnd:state.dtsRemindAppointment.selectedDateEnd
    };
};

const mapDispatchToProps = {
    resetLocationEncounter,
    // getClinicList,
    setSelectedClinic,
    getRoomList,
    //    setSelectedRoom,
    setCalendarDetailDate1,
    setCalendarDetailDate2,
    setOnlyNeedReminder,
    getRemindAppointmentList,
    getServeRoom,
    getRemindAppointmentListReport,
    resetRemindAppointmentListReport,
    openCommonMessage,
    setSelectedRooms,
    setSelectedDateStart,
    setSelectedDateEnd
};

//export default withStyles(styles)(DtsDayViewPanel);

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsRemindAppointmentSearchPanel));