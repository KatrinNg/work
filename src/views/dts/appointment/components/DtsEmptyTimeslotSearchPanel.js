import React, { Component } from 'react';
//import { useState, useRef } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import FormControl from '@material-ui/core/FormControl';
import DtsButton from '../../components/DtsButton';

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
import moment from 'moment';


import {
    resetLocationEncounter,
    getServeRoom
} from '../../../../store/actions/dts/appointment/remindAppointmentAction';

import {
    getRoomList,
    getEmptyTimeslotList,
    setSelectedClinic,
    setSelectedRoomList,
    setCalendarDetailDate1,
    setCalendarDetailDate2
} from '../../../../store/actions/dts/appointment/emptyTimeslotAction';
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
        'text-align':'center'
    },
    row:{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
        // margin: '10px 3px 0px 3px'
    },
    row2:{
        width: '100%',
        margin: '10px 3px 0px 3px'
    },
    row2Button:{
        margin: 8,
        minWidth: '15px'

    },
    clinicSelect:{
        width: '95%',
        margin: '8px'
    },
//    multipleSelect:{
//        width: '95%',
//        margin: '8px'
//    },
    roomSelect:{
        width: '95%',
        margin: '8px'
    },
    roomInput: {
        display: 'flex',
        height: 'auto'
    },
    label: {
        padding:'10px 0px',
        fontStyle: 'italic'
        //top: '10px'
    },
    inlineBoldLabel:{
        padding: 10,
        fontWeight: '600',
        fontStyle: 'italic',
//        fontSize: '10pt',
        position: 'relative',
        top: '10px',
        bottom: '10px'
    },
    inlineLabel2:{
        color: 'blue'
    },
    applDatePicker:{
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
    groupSplitBtn:{
        width: '95%',
        display: 'inline-flex',
        margin: '8px 10px'
    },
    button: {
        margin: 4,
        textTransform: 'none',
        minWidth: '10px',
        'border-radius':'25px',
        border:'none',
        'box-shadow':'none',
        backgroundColor:'#fff',
        color:'#92a8d3',
        '&:hover':{
            backgroundColor:'#cccccc30',
            color:'#00000070'
        }
    }

});


class DtsEmptyTimeslotSearchPanel extends Component {

    constructor(props){
        super(props);

        // Component state
        this.state = {
            selectedRoomList: [],
            selectedClinic: null,
            calendarDetailDate1: moment(0, 'HH').add(7, 'd'),
            calendarDetailDate2: moment(0, 'HH').add(12, 'd'),
            ignoreRescheduledWithin24hours: true
        };

    }

    // componentWillMount() {
    // }

    componentDidMount() {
        let curClinic = this.props.clinicList.find(clinic => clinic.siteId == this.props.defaultClinic.siteId);
        this.setState({
            selectedClinic:curClinic,
            selectedRoomList: this.props.selectedRoomList,
            ...this.props.calendarDetailDate1 && {calendarDetailDate1: moment(this.props.calendarDetailDate1)},
            ...this.props.calendarDetailDate2 && {calendarDetailDate2: moment(this.props.calendarDetailDate2)}
        });
        this.props.setSelectedClinic({selectedClinic: curClinic});
        const self = this;
        let getServeRoom = function (){
            //console.log('self1' + typeof self);
            return function (){
                //console.log('self' + typeof self);
                //console.log('self.props' + typeof self.props);
                self.props.getServeRoom({userId: self.props.loginInfo.userDto.userId, date: moment()}, self.setDefaultRoom);
            };
        }();
        this.props.getRoomList({siteId:curClinic.siteId},getServeRoom);
    }


    componentDidUpdate(prevProps) {
        //if(this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
        if(this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
            //set default to clinicList[0]
            this.props.setSelectedClinic({clinic:this.props.clinicList[0]});
            this.props.getRoomList({siteId:this.props.clinicList[0].siteId});
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
        this.setState({selectedClinic: value});
        this.props.getRoomList({siteId:value.siteId});
    }

    handleRoomChange = (value) => {

        let _selectedRoomList = [];
        if (value) {
            value.forEach(item => {
                _selectedRoomList.push(item.value);
                });
        } else {
            _selectedRoomList = [];
        }
        this.setState({selectedRoomList: _selectedRoomList});
    }

    handleDateChange1 = value => {
        this.setState({calendarDetailDate1: moment(value)});
    }

    handleDateChange2 = value => {
        this.setState({calendarDetailDate2: moment(value)});
    }

    handleIgnoreRescheduledWithin24hoursChange = event => { //tbd
        this.setState({ignoreRescheduledWithin24hours: event.target.checked});
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'ClinicEmptyTimeslotSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'RoomEmptyTimeslotSelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'ClinicEmptyTimeslotSelector') {
            errorMessages.push('Clinic is required');
            return errorMessages;
        }
        else if (name === 'RoomEmptyTimeslotSelector') {
            errorMessages.push('Room is required');
            return errorMessages;
        }
    }
    handleOnSubmit = () => {
        //test hardcode
        console.log('booking-dailyViewList:'+JSON.stringify(this.props.dailyViewList));
        // console.log('handleOnSubmit-state:' + JSON.stringify(this.state));
        this.props.setSelectedClinic({selectedClinic: this.state.selectedClinic});
        this.props.setSelectedRoomList({selectedRoomList: this.state.selectedRoomList});
        this.props.setCalendarDetailDate1({ calendarDetailDate1: this.state.calendarDetailDate1.format('YYYY-MM-DD') });
        this.props.setCalendarDetailDate2({ calendarDetailDate2: this.state.calendarDetailDate2.format('YYYY-MM-DD') });

        this.props.getEmptyTimeslotList({
            clinicId:this.state.selectedClinic.siteId,
            clinicCd:this.state.selectedClinic.clinicCd,
            //rmIdList:this.state.selectedRoomList,
            roomCdList:this.state.selectedRoomList.join(','),
            fromDate:this.state.calendarDetailDate1.format('YYYY-MM-DD'),
            toDate:this.state.calendarDetailDate2.format('YYYY-MM-DD'),
            ignoreRescheduledWithin24hours:this.state.ignoreRescheduledWithin24hours
        });
        this.props.onClose();//Miki
    }

    handleSubmitError = () => {
        // console.log('handleSubmitError call');
        let { callbackFunc } = this.state;
        callbackFunc(false);
    }

    render(){
        const {classes, className,clinicList, roomList,  ...rest } = this.props;

        //let dailyTaskLabel =  moment(calendarDetailDate1, 'YYYY-MM-DD').format('DD-MM-YYYY[(]ddd[)]') + ' ' + selectedClinic + ' - ' + selectedRoom + '';
        //console.log('dailyTaskLabel ' + dailyTaskLabel);
        return (
            <Paper className={classes.root +' ' +className}>
                <ValidatorForm ref="emptyTimeslotSearch" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    <div className={classes.row}>
                        <FormControl className={classes.clinicSelect}>
                            {typeof clinicList[0] != 'undefined' &&
                            <DtsSelectFieldValidator
                                id={'EmptyClinicSelect'}
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
                                validators={this.getValidator('ClinicEmptyTimeslotSelector')}
                                errorMessages={this.getErrorMessage('ClinicEmptyTimeslotSelector')}
                                onChange={e => this.handleClinicChange(e.value)}
                            />}
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <FormControl className={classes.roomSelect}>
                            {/* Multiple Selection with no Select All option */}

                            <DtsSelectFieldValidator
                                id={'EmptyRoomSelect'}
                                // isDisabled={false}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Room</>
                                }}
                                options={
                                    roomList && roomList.map((item) => (
                                        { value: item.rmCd, label: item.rmCd }))
                                }
                                innerProps={{
                                    className: classes.roomInput
                                }}
                                value={this.state.selectedRoomList}
                                msgPosition="bottom"
                                //hideSelectedOptions={false}
                                //closeMenuOnSelect={false}
                                isMulti
                                addAllOption
                                //addNullOption
                                fullWidth
                                validators={this.getValidator('RoomEmptyTimeslotSelector')}
                                errorMessages={this.getErrorMessage('RoomEmptyTimeslotSelector')}
                                onChange={this.handleRoomChange}
                            />
                            </FormControl>
                    </div>
                    <div className={classes.row}>
                        <span className={classes.inlineBoldLabel}>
                            Time Slot Date  <span title="Time Slot Date: Within 1 year / Max Range: 1 month" className={classes.inlineLabel2}> [?] </span>
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
{/*
// To be removed
                    <div className={classes.row}>
                        <FormControlLabel
                            control={
                                <CIMSCheckBox
                                    id={'ignoreRescheduledWithin24hours'}
                                    disabled={false}
                                    className={classes.checkPadding}
                                    onChange={this.handleIgnoreRescheduledWithin24hoursChange} //tbd
                                    checked={this.state.ignoreRescheduledWithin24hours}
                                />
                            }
                            className={classes.checkLabelMagin}
                            label={<Typography variant="subtitle1">Ignore rescheduled within 24 hrs slots</Typography>}
                        />
                    </div>
*/}
                    <div className={classes.row}>
                        <DtsButton
                            className={classes.searchBoxBtn} iconType={'REFRESH'}
                            onClick={() => this.refs.emptyTimeslotSearch.submit()}
                        >Search
                        </DtsButton>
                    </div>

                    <div className={classes.row}>
                    </div>
                </ValidatorForm>
            </Paper>
        );
    }

}


const mapStateToProps = (state) => {
    // console.log('DailyViewList ' + JSON.stringify());
    return {
        //clinicList: state.dtsCommon.clinicList,
        serviceCd: state.login.service.serviceCd,
        selectedClinic: state.dtsEmptyTimeslot.selectedClinic,
        selectedRoomList: state.dtsEmptyTimeslot.selectedRoomList,
        roomList: state.dtsEmptyTimeslot.roomList,
        calendarDetailDate1: state.dtsEmptyTimeslot.calendarDetailDate1,
        calendarDetailDate2: state.dtsEmptyTimeslot.calendarDetailDate2,
        defaultClinic: state.login.clinic,
        clinicList: state.common.clinicList,
        loginInfo: state.login.loginInfo,
        dailyViewList: state.dtsAppointmentBooking.pageLevelState.dailyView
    };
};

const mapDispatchToProps = {
    resetLocationEncounter,
    setSelectedClinic,
    getRoomList,
    setSelectedRoomList,
    setCalendarDetailDate1,
    setCalendarDetailDate2,
    getServeRoom,
    getEmptyTimeslotList
};

//export default withStyles(styles)(DtsDayViewPanel);

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEmptyTimeslotSearchPanel));