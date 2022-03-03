import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import {
    //Checkbox,
    Typography,
    FormControlLabel
} from '@material-ui/core';

import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import DtsSplitButton from '../../components/DtsSplitButton';
import moment from 'moment';
import _ from 'lodash';

import {
    DatePicker
  } from '@material-ui/pickers';
  import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
  import { openCommonMessage } from '../../../../store/actions/message/messageAction';


import {
    getRoomList,
    getEncounterTypeList,
    resetEncounterTypeList,
    getAppointmentList,
    getAppointmentListReport,
    setCalendarDetailEndDate,
    setCalendarDetailStartDate,
    setSelectedEncounterTypeList,
    setSelectedRoomList,
    setWithinClosePeriod
} from '../../../../store/actions/dts/appointment/searchAppointmentAction';

import Enum from '../../../../enums/enum';

const styles = ({

    root: {
        margin: 'auto',
        width:'650px',
        padding: '10px',
        'border-radius': '0px',
        border: '0px',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        'text-align':'center'
    },
    row:{
        width: '100%',
        display: 'flex',
        alignItems: 'center'
        //justifyContent: 'center'
        // margin: '10px 3px 0px 3px'
    },
    rowCenter:{
        justifyContent: 'center'
    },
    rowAlignLeft:{
        width: '100%'
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
    encounterTypeSelect:{
        width: '95%',
        margin: '8px'
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
    },
    radioGroup:{
        marginLeft:'10px'
    }

});


// Button group
const buttonGroupNames = ['Search', 'and Print Appt List'];

class DtsAppointmentListSearchPanel extends Component {

    constructor(props){
        super(props);

        // Component state
        this.state = {
            selectedRoomList: ['*All'],
            selectedClinic: null,
            selectedEncounterTypeList: ['*All'],
            selectedDateType:'appointmentDate',
            calendarDetailMonth1: null,
            // calendarDetailMonth2: null,
            calendarDetailDate1: moment(0, 'HH').add(7, 'd'),
            calendarDetailDate2: moment(0, 'HH').add(12, 'd'),
            onlyClosedPeriod: false,
            currentButtonName: buttonGroupNames[0]
        };

    }

    componentDidMount() {
        let curClinic = this.props.clinicList.find(clinic => clinic.siteId == this.props.defaultClinic.siteId);
        this.setState({selectedClinic:curClinic});
        const self = this;

        this.props.getRoomList({siteId:curClinic.siteId}
                //this.setDefaultRoomAndEncounterType
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
        //this.props.resetAll();
        //console.log('DtsAppointmentListSearchPanel-componentWillUnmount');
    }

    handleClinicChange = (value) => {
        this.setState({selectedClinic: value});
        this.props.getRoomList({siteId:value.siteId});
    }

    handleRoomChange = (value) => {
        //console.log('handleRoomChange-value:',JSON.stringify(value));

        let _selectedRoomList = [];
        if (value) {
            value.forEach(item => {
                _selectedRoomList.push(item.value);
            });
         } else {
            _selectedRoomList = [];
        }
        this.setState({selectedRoomList: _selectedRoomList});

        let noAllSelectedRoomList  = _selectedRoomList.filter(item => item!='*All');
        //console.log('handleRoomChange:'+ JSON.stringify(noAllSelectedRoomList));
        this.setState({selectedEncounterTypeList:[]});//reset
        if(noAllSelectedRoomList.length > 0)
            this.props.getEncounterTypeList({rmId:noAllSelectedRoomList[0]});

    }
    getEncounterTypeList = () => {
        this.props.getEncounterTypeList({rmId:this.state.selectedRoomList});
    }

    handleEncounterTypeChange = (value) => {
        let _selectedEncounterTypeList = [];
        if (value) { //handle x button
            value.forEach(item => {
                _selectedEncounterTypeList.push(item.value);
                });
        } else {
            _selectedEncounterTypeList = [];
        }
        this.setState({selectedEncounterTypeList:_selectedEncounterTypeList});
    }

    handleDateChange1 = value => {
        let tempDate = moment(value,DTS_DATE_DISPLAY_FORMAT);
        this.setState({calendarDetailDate1: tempDate});
    }

    handleDateChange2 = value => {
        let tempDate = moment(value,DTS_DATE_DISPLAY_FORMAT);
        this.setState({calendarDetailDate2: tempDate});
    }

    handleMonthChange1 = value => {
        this.setState({calendarDetailMonth1:moment(value)});
        this.handleDateChange1(moment(value).date(1).format(DTS_DATE_DISPLAY_FORMAT));
        this.handleDateChange2((moment(value).endOf('month')).format(DTS_DATE_DISPLAY_FORMAT));
    }

    // handleMonthChange2 = value => {
    //     this.setState({calendarDetailMonth2:moment(value)},this.handleDateChange2((moment(value).endOf('month')).format(DTS_DATE_DISPLAY_FORMAT))); //set date to last day of month
    // }

    handleOnlyClosedPeriodChange = event => {
        this.setState({onlyClosedPeriod: event.target.checked});
    }

    buttonGroupOnClick = (buttonName) => {
        this.setState({currentButtonName: buttonName}, this.refs.AppointmentListSearch.submit());
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'ClinicSearchAppointmentSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'RoomSearchAppointmentSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'EncounterTypeSearchAppointmentSelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'ClinicSearchAppointmentSelector') {
            errorMessages.push('Clinic is required');
            return errorMessages;
        }
        else if (name === 'RoomSearchAppointmentSelector') {
            errorMessages.push('Room is required');
            return errorMessages;
        }
        else if (name === 'EncounterTypeSearchAppointmentSelector') {
            errorMessages.push('Encounter Type is required');
            return errorMessages;
        }
    }

    handleOnSubmit = () => {
        //console.log('handleOnSubmit, currentButtonName = ' + this.state.currentButtonName);
        //console.log('handleOnSubmit, date1,2 = ' + moment(this.state.calendarDetailDate1).format(Enum.DATE_FORMAT_24)+';'+moment(this.state.calendarDetailDate2).format(Enum.DATE_FORMAT_24));

        if(moment(this.state.calendarDetailDate1) > moment(this.state.calendarDetailDate2)){
            this.props.openCommonMessage({
                msgCode: '140023',
                showSnackbar: true,
                variant: 'warning',
                params: []
            });
            return;
        }

        if(Math.abs(moment(this.state.calendarDetailDate1).diff(moment(this.state.calendarDetailDate2),'days')) > 31){
            this.props.openCommonMessage({
                msgCode: '140024',
                showSnackbar: true,
                variant: 'warning',
                params: []
            });
            return;
        }

        if (this.state.currentButtonName === buttonGroupNames[0])
        {
            this.props.getAppointmentList({
                clinicId:this.state.selectedClinic.siteId,
                roomIds:this.state.selectedRoomList.join(','),
                encounterTypeIds:this.state.selectedEncounterTypeList.join(','),
                dateFrom:moment(this.state.calendarDetailDate1).format(Enum.DATE_FORMAT_EYMD_VALUE),
                dateTo:moment(this.state.calendarDetailDate2).add(1, 'days').format(Enum.DATE_FORMAT_EYMD_VALUE), //to date day end = next day 00:00
                dateType:this.state.selectedDateType,
                onlyClosedPeriod:this.state.onlyClosedPeriod
            });
            this.props.onClose();
        }
        else if (this.state.currentButtonName === buttonGroupNames[1])
        {
            // Print button
            this.props.getAppointmentList({
                clinicId:this.state.selectedClinic.siteId,
                roomIds:this.state.selectedRoomList.join(','),
                encounterTypeIds:this.state.selectedEncounterTypeList.join(','),
                dateFrom:moment(this.state.calendarDetailDate1).format(Enum.DATE_FORMAT_EYMD_VALUE),
                dateTo:moment(this.state.calendarDetailDate2).add(1, 'days').format(Enum.DATE_FORMAT_EYMD_VALUE),
                dateType:this.state.selectedDateType,
                onlyClosedPeriod:this.state.onlyClosedPeriod
            }, this.printAppointmentList);
            this.props.onClose();
        }
        else
        {
// Should throw error, if it is an unrecognized button click
        }
    }

    handleSubmitError = () => {
        // console.log('handleSubmitError call');
        let { callbackFunc } = this.state;
        callbackFunc(false);
    }

    handleSelectedDateTypeChange = (e) => {
        this.setState({selectedDateType:e.target.value});
    }

    printAppointmentList = () => {
        //console.log('printAppointmentList:' + JSON.stringify(this.props.appointmentList));
        if(this.props.appointmentList && this.props.appointmentList.list && this.props.appointmentList.list.length>0 ) {
            this.props.getAppointmentListReport({appointmentList:this.props.appointmentList.list},this.handleOpenReportDialog);
        }
    }

    handleOpenReportDialog = () => {
        this.props.openReportDialog();
    }

    render(){
        const {classes, className,clinicList, roomList, encounterTypeList,  ...rest } = this.props;

        //console.log('dailyTaskLabel ' + dailyTaskLabel);
        return (
            <Paper className={classes.root +' ' +className}>
                <ValidatorForm ref="AppointmentListSearch" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
                     <div className={classes.row}>
                        <FormControl className={classes.clinicSelect}>
                            {typeof clinicList[0] != 'undefined' &&
                            <DtsSelectFieldValidator
                                id={'ClinicSearchAppointmentSelect'}
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
                                validators={this.getValidator('ClinicSearchAppointmentSelector')}
                                errorMessages={this.getErrorMessage('ClinicSearchAppointmentSelector')}
                                onChange={e => this.handleClinicChange(e.value)}
                            />}
                        </FormControl>
                    </div>
                    <div className={classes.row}>
                        <FormControl className={classes.roomSelect}>
                            {/* Multiple Selection with no Select All option */}

                            <DtsSelectFieldValidator
                                id={'RoomSearchAppointmentSelect'}
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
                                value={this.state.selectedRoomList}
                                msgPosition="bottom"
                                //hideSelectedOptions={false}
                                //closeMenuOnSelect={false}
                                isMulti
                                addAllOption
                                //addNullOption
                                fullWidth
                                validators={this.getValidator('RoomSearchAppointmentSelector')}
                                errorMessages={this.getErrorMessage('RoomSearchAppointmentSelector')}
                                onChange={this.handleRoomChange}
                            />
                            </FormControl>
                    </div>
                    <div className={classes.row}>
                        <FormControl className={classes.encounterTypeSelect}>
                            <DtsSelectFieldValidator
                                id={'EncounterTypeSearchAppointmentSelect'}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Encounter Type</>
                                }}
                                options={
                                    encounterTypeList && _.isArray(encounterTypeList)  && encounterTypeList.map((item) => (
                                        { value: item.encntrTypeId, label: item.encntrTypeDesc }))
                                }
                                // innerProps={{
                                //     className: classes.roomInput
                                // }}
                                value={this.state.selectedEncounterTypeList}
                                msgPosition="bottom"
                                //hideSelectedOptions={false}
                                //closeMenuOnSelect={false}
                                isMulti
                                addAllOption
                                fullWidth
                                validators={this.getValidator('EncounterTypeSearchAppointmentSelector')}
                                errorMessages={this.getErrorMessage('EncounterTypeSearchAppointmentSelector')}
                                onChange={this.handleEncounterTypeChange}
                            />
                            </FormControl>
                    </div>
                    <div className={classes.rowAlignLeft}>
                        <RadioGroup className={classes.radioGroup} defaultValue={'appointmentDate'} aria-label="setSelectedAttendanceStatus" name="setSelectedAttendanceStatus" onChange={this.handleSelectedDateTypeChange}>
                            <FormControlLabel rolLabel key={'attendanceFilter_appointmentDate'} classes={{root: classes.optionRoot, label:classes.optionLabel}} value={'appointmentDate'} control={<Radio classes={{root: classes.radioButton}} />} label={'Appointment Date'} />
                            <FormControlLabel key={'attendanceFilter_creationDate'} classes={{root: classes.optionRoot, label:classes.optionLabel}} value={'creationDate'} control={<Radio classes={{root: classes.radioButton}} />} label={'Creation Date'} />
                        </RadioGroup>
                        {/* <span className={classes.inlineBoldLabel}>
                            Appointment Date  <span title="Max Range: Recent 2 weeks" className={classes.inlineLabel2}> [?] </span>
                        </span> */}
                    </div>

                    <div className={classes.row}>
                        <DatePicker
                            variant="static"
                            openTo="month"
                            views={['year','month']}
                            onChange={this.handleMonthChange1}
                            value={this.state.calendarDetailMonth1}
                        />
                        {/* &nbsp;&nbsp;&nbsp;
                        <DatePicker
                            variant="static"
                            openTo="month"
                            views={['year','month']}
                            onChange={this.handleMonthChange2}
                            value={this.state.calendarDetailMonth2}
                        /> */}
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

                    <div className={classes.row + classes.rowCenter}>
                        <FormControlLabel
                            control={
                                <CIMSCheckBox
                                    id={'onlyClosedPeriod'}
                                    disabled={false}
                                    className={classes.checkPadding}
                                    onChange={this.handleOnlyClosedPeriodChange}
                                    checked={this.state.onlyClosedPeriod}
                                />
                            }
                            className={classes.checkLabelMagin}
                            label={<Typography variant="subtitle1">Only Within Closed Period</Typography>}
                        />
                    </div>

                    <div className={classes.row}>

                        <DtsSplitButton
                            className={classes.groupSplitBtn}
                            itemListEl={buttonGroupNames}
                            btnOnClick={this.buttonGroupOnClick}
                        />
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
        appointmentList:state.dtsSearchAppointment.appointmentList,
        roomList: state.dtsSearchAppointment.roomList,
        encounterTypeList: state.dtsSearchAppointment.encounterTypeList,
        defaultClinic: state.login.clinic,
        clinicList: state.common.clinicList,
        loginInfo: state.login.loginInfo
        // selectedRoomList: state.dtsSearchAppointment.sjustin_electedRoomList,
        // selectedEncounterTypeList: state.dtsSearchAppointment.selectedEncounterTypeList,
        // calendarDetailDate1: state.dtsSearchAppointment.calendarDetailDate1,
        // calendarDetailDate2: state.dtsSearchAppointment.calendarDetailDate2,
        // onlyClosedPeriod: state.dtsSearchAppointment.withinClosePeriod
    };
};

const mapDispatchToProps = {
    getRoomList,
    getEncounterTypeList,
    resetEncounterTypeList,
    getAppointmentList,
    getAppointmentListReport,
    setCalendarDetailEndDate,
    setCalendarDetailStartDate,
    setSelectedEncounterTypeList,
    setSelectedRoomList,
    setWithinClosePeriod,
    openCommonMessage
};

//export default withStyles(styles)(DtsDayViewPanel);

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAppointmentListSearchPanel));