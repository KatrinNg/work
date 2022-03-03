import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import FormControl from '@material-ui/core/FormControl';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import DtsButton from '../../components/DtsButton';
// import { getClinicList } from '../../../../store/actions/dts/dtsCommonAction';
import moment from 'moment';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';


import {
    resetLocationEncounter,
    setSelectedClinic,
    getRoomList,
    setSelectedRoom,
    setCalendarDetailDate,
    getDailyView,
    getServeRoom,
    resetDailyNote,
    getDailyNote

} from '../../../../store/actions/dts/appointment/attendanceAction';

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
    roomSelect:{
        width: '95%',
        margin: '8px'
    },
    applDatePicker:{
        width: '95%',
        margin: '8px'
    },
    searchBoxBtn:{
        //float: 'right'
        width: '95%'
        // margin: '10px 3px 0px 3px'
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

class DtsAttendanceSearchPanel extends Component {
    constructor(props){
        super(props);

        this.state = {
            selectedRoom:null,
            selectedClinic: null,
            calendarDetailDate: moment().startOf('day')
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
        let curClinic = this.props.clinicList.find(clinic => clinic.siteId == this.props.defaultClinic.siteId);
        this.setState({selectedClinic:curClinic});
        const self = this;
        let getServeRoom = function (){
            //console.log('self1' + typeof self);
            return function (){
                //console.log('self' + typeof self);
                //console.log('self.props' + typeof self.props);
                self.props.getServeRoom({userId: self.props.loginInfo.userDto.userId, date: moment()}, self.setDefaultRoom);
            };
        }();
        this.props.getRoomList({siteId:curClinic.siteId},
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
        //if(this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
        if(this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
            //set default to clinicList[0]
            this.props.setSelectedClinic({clinic:this.props.clinicList[0]});
            this.props.getRoomList({siteId:this.props.clinicList[0].siteId});
        }
        //console.log('selectedRoom:'+JSON.stringify(this.state.selectedRoom));
    }

    componentWillUnmount() {
        // this.props.resetLocationEncounter();
    }

    // getServeRoom() {
    //     this.props.getServeRoom({userId: this.props.loginInfo.userDto.userId, date: moment()}, this.setDefaultRoom);
    // }

    setDefaultRoom = (roomList) => {
        //console.log('Default roomList:' + JSON.stringify(roomList));
        //console.log('roomList:' + JSON.stringify(this.props.roomList));
        let roomInRoomList = this.props.roomList?.find((item) => (item.rmId == roomList[0]?.roomId));
        if (roomInRoomList) {
            this.setState({selectedRoom: roomInRoomList});
            this.props.setSelectedRoom({selectedRoom: roomInRoomList});
        } else {
            const selectedRoom = this.props.roomList.length > 0 ? this.props.roomList[0] : null;
            this.setState({selectedRoom: selectedRoom});
            this.props.setSelectedRoom({selectedRoom: selectedRoom});
        }
        this.refs.attenanceSearch.submit();
    }

    handleClinicChange = (value) => {
        this.setState({selectedClinic: value});
        this.props.getRoomList({siteId:value.siteId});
        this.handleOnSubmit(value, this.props.selectedRoom,this.props.calendarDetailDate);
    }

    handleRoomChange = (value) => {
        console.log(value);
        this.props.setSelectedRoom({selectedRoom: value});
        this.setState({selectedRoom: value});
        this.handleOnSubmit(this.props.selectedClinic, value, this.props.calendarDetailDate);
    }

    handleDateChange = value => {
        let tempDate = moment(value);
        this.props.setCalendarDetailDate({ calendarDetailDate: tempDate});
        this.setState({calendarDetailDate: tempDate});
        this.handleOnSubmit(this.props.selectedClinic, this.props.selectedRoom, tempDate);
    }

    handleDateShift = (dayToShift) => {
        let dateObj = moment(this.props.calendarDetailDate) || moment(0, 'HH');
        dateObj = dateObj.add(dayToShift, 'days');
        this.setState({calendarDetailDate: dateObj});
        this.props.setCalendarDetailDate({calendarDetailDate: dateObj});
        this.handleOnSubmit(this.props.selectedClinic, this.props.selectedRoom, dateObj);
    }

    handleTodayDate = () => {
    }

    handleOnSubmit = (inputClinic, inputRoom, inputDate) => {
        console.log('handleOnSubmit', this.props.calendarDetailDate);
        const selectedClinic = inputClinic || this.props.selectedClinic;
        const selectedRoom = inputRoom || this.props.selectedRoom;
        const selectedDate = inputDate || this.props.calendarDetailDate;

        this.props.resetDailyNote();
        // let dateObj;

        this.props.setSelectedClinic({selectedClinic: selectedClinic});
        // this.props.setSelectedRoom({selectedRoom: this.state.selectedRoom});
        // this.props.setCalendarDetailDate({ calendarDetailDate: this.state.calendarDetailDate.format('YYYY-MM-DD')});
        this.props.getDailyView({rmId:selectedRoom.rmId, date:moment(selectedDate).format('YYYY-MM-DD')});
        this.props.getDailyNote({clinicRoomId:selectedRoom.rmId, appointmentDate:moment(selectedDate).format('YYYY-MM-DD')});
    }

    // buttonOnClick = () =>{
    //     // console.log('buttonOnClick Clinic: ' + this.state.selectedClinic);
    //     // console.log('buttonOnClick Room: ' + this.state.selectedRoom);
    //     this.props.setSelectedClinic({selectedClinic: this.state.selectedClinic});
    //     this.props.setSelectedRoom({selectedRoom: this.state.selectedRoom});
    //     this.props.setCalendarDetailDate({ calendarDetailDate: this.state.calendarDetailDate});
    //     this.props.getDailyView({rmId:this.state.selectedRoom.rmId, date:this.state.calendarDetailDate});
    // }


    getValidator = (name) => {
        let validators = [];
        if (name === 'ClinicAttendanceSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'AttendanceRoomSelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'ClinicAttendanceSelector') {
            errorMessages.push('Clinic is required');
            return errorMessages;
        }
        else if (name === 'AttendanceRoomSelector') {
            errorMessages.push('Room is required');
            return errorMessages;
        }
    }

    handleSubmitError = () => {
        // console.log('handleSubmitError call');
        let { callbackFunc } = this.state;
        callbackFunc(false);
    }

    render(){
        const {classes, className,clinicList, roomList,  ...rest } = this.props;
        let selectedCalendarDetailDateLabel = '';
        if(this.props.calendarDetailDate) {
            selectedCalendarDetailDateLabel = moment().startOf('day').diff(this.props.calendarDetailDate, 'days') == 0 ? 'Today' : moment(this.props.calendarDetailDate).format(DTS_DATE_DISPLAY_FORMAT);
        }
        //let dailyTaskLabel =  moment(calendarDetailDate, 'YYYY-MM-DD').format('DD-MM-YYYY[(]ddd[)]') + ' ' + selectedClinic + ' - ' + selectedRoom + '';
        //console.log('dailyTaskLabel ' + dailyTaskLabel);
        return (
            <Paper className={classes.root +' ' +className}>
                {/* <ValidatorForm ref="attenanceSearch"> */}
                <ValidatorForm ref="attenanceSearch" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                    <div className={classes.row}>
                        <FormControl className={classes.clinicSelect}>
                            {typeof clinicList[0] != 'undefined' &&
                            <DtsSelectFieldValidator
                                id={'ClinicAttendanceSelect'}
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
                                validators={this.getValidator('ClinicAttendanceSelector')}
                                errorMessages={this.getErrorMessage('ClinicAttendanceSelector')}
                                onChange={e => this.handleClinicChange(e.value)}
                            />}
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <FormControl className={classes.roomSelect}>
                            <DtsSelectFieldValidator
                                id={'AttendanceRoomSelect'}
                                isDisabled={false}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Room</>
                                }}
                                options={
                                    roomList.map((item) => (
                                        { value: item, label: item.rmCd }))
                                }
                                value={this.props.selectedRoom}
                                msgPosition="bottom"
                                //addNullOption
                                validators={this.getValidator('AttendanceRoomSelector')}
                                errorMessages={this.getErrorMessage('AttendanceRoomSelector')}
                                onChange={e => this.handleRoomChange(e.value)}
                            />
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <FormControl className={classes.applDatePicker}>
                            <DateFieldValidator
                                //ref={ref => this.dateOfBirthRef = ref}
                                id={'calendarDetailDate'}
                                label={DTS_DATE_DISPLAY_FORMAT}
                                format={DTS_DATE_DISPLAY_FORMAT}
                                inputVariant="outlined"
                                disabled={false}
                                value={this.props.calendarDetailDate}
                                onChange={this.handleDateChange}
                                isRequired
                                validByBlur
                                errorMessages={['Date is required']}
                            />
                        </FormControl>
                    </div>

                    <div className={classes.row}>
                        <DtsButton className={classes.searchBoxBtn} iconType={'REFRESH'} onClick={() => this.refs.attenanceSearch.submit()}>Refresh</DtsButton>
                    </div>

                    <div className={classes.row}>
                        <CIMSButton className={classes.button} onClick={() => {this.handleDateShift(-1);}}>&lt;</CIMSButton>
                        <CIMSButton className={classes.button} onClick={this.handleTodayDate}>{selectedCalendarDetailDateLabel}</CIMSButton>
                        <CIMSButton className={classes.button} onClick={() => {this.handleDateShift(1);}}>&gt;</CIMSButton>
                    </div>
                </ValidatorForm>
            </Paper>
        );
    }

}


const mapStateToProps = (state) => {
    // console.log('DailyViewList ' + JSON.stringify(state.dtsAppointmentBooking.dailyView));
    return {
        //clinicList: state.dtsCommon.clinicList,
        serviceCd: state.login.service.serviceCd,
        selectedClinic: state.dtsAppointmentAttendance.selectedClinic,
        selectedRoom: state.dtsAppointmentAttendance.selectedRoom,
        roomList: state.dtsAppointmentAttendance.roomList,
        calendarDetailDate: state.dtsAppointmentAttendance.calendarDetailDate,
        defaultClinic: state.login.clinic,
        clinicList: state.common.clinicList,
        loginInfo: state.login.loginInfo
    };
};

const mapDispatchToProps = {
    resetLocationEncounter,
    // getClinicList,
    setSelectedClinic,
    getRoomList,
    setSelectedRoom,
    setCalendarDetailDate,
    getDailyView,
    getServeRoom,
    resetDailyNote,
    getDailyNote
};

//export default withStyles(styles)(DtsDayViewPanel);

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAttendanceSearchPanel));