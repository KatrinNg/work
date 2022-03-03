import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
import _ from 'lodash';

import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

import 'date-fns';

import DtsSplitButton from '../../components/DtsSplitButton';

import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';

import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import moment from 'moment';
import { connect } from 'react-redux';
import {
    getSessionList,
    setFilterMode,
    setCalendarDetailDate,
    getAvailableTimeSlot,
    getDailyView,
    setPageStatus,
    resetCalendarDetailDate,
    resetAvailableTimeSlotList,
    resetDailyNote
} from '../../../../store/actions/dts/appointment/bookingAction';
import { PageStatus as pageStatusEnum } from '../../../../enums/dts/appointment/bookingEnum';
import DtsButton from '../../components/DtsButton';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = ({
    root: {
        fontFamily: 'Microsoft JhengHei, Calibri',
        margin: '1px auto auto auto',
        width: '94%',
        borderRadius: '0px',
        border: '0px',
        boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
    },
    label:{
        marginTop:'0px',
        marginLeft:'0px',
        paddingTop:'5px',
        width: '30%',
        fontWeight: '600',
        fontSize: '10pt',
        position: 'relative',
        backgroundColor:'#ffffff',
        boxShadow:'0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)'
    },
    option:{
        width: '100%'
    },
    session:{
        width: '90%',
        margin:'auto',
        boxShadow:'none'
    },
    row:{
        width:'100%'
    },
    row2:{
        width:'100%',
        height: '55px'
    },
    tableBreak:{
        borderBottom: '4px solid black'
    },
    groupSplitBtn:{
        width: '40%',
        display: 'inline-flex',
        margin: '8px 10px'
    },
    optionRoot:{
        marginLeft: '0px'
    },
    optionLabel:{
        fontSize: '10pt'
    },
    radioButton:{
        padding: '2px'
    },
    radioGroup:{
        display: 'block'
    },
    applDatePicker:{
        width: '50%',
        top: '10px',
        left:'15px'
    },
    next7DaysBtn:{
        margin:'12px 8px',
        float:'right',
        left:'6px'
    },
    sessionSelect:{
        width: '128px',
        top: '10px'
    },
    dailyNoteSearch:{
        width: 400,
        marginTop:-5,
        left:10
    },
    inlineBoldLabel:{
        fontWeight: '600',
        fontSize: '10pt',
        position: 'relative',
        top: '10px'
    },
    inlineBoldLabel2:{
        fontWeight: '600',
        fontSize: '10pt'
    },
    intervalType:{
        top: '10px',
        width: '150px'
    },
    intervalInput:{
        width: 50,
        position: 'relative',
        top: '10px'
    },
    intervalInput2:{
        width: 50
    },
    red:{
        backgroundColor: 'red'
    },
    green:{
        backgroundColor: 'green'
    },
    white:{
        backgroundColor: 'white'
    },
    black:{
        backgroundColor: 'black'
    },
    gray:{
        backgroundColor: 'gray'
    }
});

class DtsAppointmentSearchGroup extends Component {

    constructor(props){
        super(props);
        this.state = {
            selectedSession:'%',
            intervalType: 'W',
            baseDate: moment(),
            intervalValue: 4,
            displacementDate: 1,
            // filterMode: null,
            dateFrom: moment(moment().format('L')),
            dateTo: null,
            searchOption:'A', //Exact match encounter
            clientType:'E', // EP
            searchDailyNoteKeyword: ''
            // dateLabel:''
        };
    }

    componentDidMount(){
        if(this.props.sessionList && this.props.sessionList.length==0) {
            if(!_.isEmpty(this.props.selectedClinic)){
                this.props.getSessionList({siteId:this.props.selectedClinic.siteId});
            }
        }

        // let date = new Date().getDate(); //Current Date
        // let month = new Date().getMonth() + 1; //Current Month
        // let year = new Date().getFullYear(); //Current Year

        // this.setState({
        //     today:date + '/' + month + '/' + year
        // });
    }

    componentDidUpdate(pervProps){
        if(this.props.availableTimeSlotList && this.props.availableTimeSlotList.length > 0 && pervProps.availableTimeSlotList != this.props.availableTimeSlotList) {
            this.props.getDailyView({ rmId: this.props.selectedRoom.rmId, date:this.props.availableTimeSlotList[0]});
        }
        if(this.props.selectedRoom && pervProps.selectedRoom && (pervProps.selectedRoom.rmId != this.props.selectedRoom.rmId)){
            if(!_.isEmpty(this.props.selectedClinic)){
                this.props.getSessionList({siteId:this.props.selectedClinic.siteId});
            }
        }
        if (this.props.generalAppointmentObjList?.length != pervProps.generalAppointmentObjList?.length){
            if (this.props.generalAppointmentObjList.length == 0){
                this.setCalculateBaseDate();
            }
            else {
                this.setCalculateBaseDate(moment.max(this.props.generalAppointmentObjList.map(e => moment(e.date))));
            }
        }
    }

    setCalculateBaseDate = (targetDate)=> {
        if (!targetDate) {
            targetDate = moment();
        }
        this.setState({baseDate: targetDate});
    }

    calculateDate = () => {
        let newDate = moment(this.state.baseDate);
        switch (this.state.intervalType){
            case 'D':
                newDate.add(this.state.intervalValue, 'd');
            break;
            case 'W':
                newDate.add(this.state.intervalValue, 'w');
            break;
            case 'M':
                newDate.add(this.state.intervalValue, 'M');
            break;
        }
        if (this.state.displacementDate > 0){
            newDate.subtract(this.state.displacementDate, 'd');
        }
        this.setState({dateFrom: newDate});
    }

    handleSearchOptionChange = (event, value) => {
        this.setState({searchOption:value});
        //console.log(this.state.searchOption);
    }

    handleClientTypeChange = (event, value) => {
        this.setState({clientType:value});
    }


    handleDateChange = (value) => {
        value = moment(value);
        this.setState({dateFrom: value});
    }


    handleSessionChange = (value) =>{
        this.setState({selectedSession: value});
    }

    handleIntervalChange = (value) => {
        this.setState({intervalType: value});

    }


    calendarGroupOnClick = (calendarGroup) => {
        // console.log('calendarGroupOnClick click');
        // console.log('calendarGroup = '+JSON.stringify(calendarGroup));
        this.props.setCalendarDetailMth(calendarGroup);
        this.props.setAppointmentSearchPanelTabVal(1);      //1 = DtsCalendarDetail
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

    handleSearch = () => {
        if(!_.isEmpty(this.props.selectedClinic) && !_.isEmpty(this.props.selectedRoom) && !_.isEmpty(this.props.selectedEncounterType)){
            this.props.resetDailyNote();
            this.props.resetAvailableTimeSlotList();
            this.props.resetCalendarDetailDate();
            let dateTo;

            //this.props.setFilterMode(0);
            dateTo = moment(this.state.dateFrom);
            dateTo.add(12, 'months');
            this.setState({dateTo: dateTo});
            this.props.setPageStatus(pageStatusEnum.SEARCHING);
            this.updateTimeSlotList(dateTo);
        }
    }



    updateTimeSlotList = (dateTo) =>{
        this.props.getAvailableTimeSlot(
            {
                dateFrom: dtsUtilities.formatDateParameter(this.state.dateFrom),
                dateTo: dtsUtilities.formatDateParameter(dateTo),
                clinicCd: this.props.selectedClinic ? this.props.selectedClinic.siteCd : null,
                roomCd: this.props.selectedRoom ? this.props.selectedRoom.rmCd : null,
                slot: this.props.selectedEncounterType ? (this.props.selectedEncounterType.drtn / 15) : null,
                encounterTypeId: this.props.selectedEncounterType ? this.props.selectedEncounterType.encntrTypeId : null,
                searchOption: this.state.searchOption,
                sessCd: this.state.selectedSession,
                clientType: this.state.clientType,
                dailyNoteKeyword: this.state.searchDailyNoteKeyword,
                maxRecords: 20
            }
            ,this.refreshAvailableTimeSlot
        );

    }

    handleReset = () =>{

        this.setState({selectedSession: '%'});
        this.setState({searchOption: 'A'});
        //this.setState({selectedDate: null});
        this.setState({dateFrom: moment()});

        this.setState({dateTo: null});
        this.setState({clientType: 'E'});

    }

    handleDateIncrement = (value) => {
        let dateObj = value;
        dateObj = moment(value).add(7, 'days');
        this.setState({dateFrom: dateObj});
    }

    refreshAvailableTimeSlot = () => {
        if(typeof this.props.availableTimeSlotList != undefined && this.props.availableTimeSlotList.length != 0){
            this.props.setFilterMode(2);
            this.props.setCalendarDetailDate(this.props.availableTimeSlotList[0]);
        }
        else
            this.props.setFilterMode(-1);
    }

    mulitpleBtnOnClick = (value) => {
        if(value == 'Multiple'){
            console.log('handle multiple');
            if(this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
                this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE);
            }
        }
        else if(value == 'Reset'){
            console.log('handle reset');
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
                this.props.updateGeneralAppointmentObjList([]);
            }
        }
        else if(value == 'Checkout'){
            console.log('handle Checkout');
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
                this.props.appointmentAction(); //open popup
            }
        }
        else if(value == 'Cancel'){
            console.log('handle Cancel');
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
                this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_MODE_APPT);
            }
        }
    }

    multipleBtnShouldDisable = () => {
        // Only single appointment and multiple appointment mode enable this function.
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT || this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE){
            // If selectedRoom is null, disable multiple appointment button
            if(this.props.selectedRoom == undefined)
                return true;
            else
                return false;
        }
        return true;
    }

    searchBtnDisable = () => {
        // Only single appointment, multiple appointment and reschedule appointment mode enable this function.
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT ||
            this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE ||
            this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT){
            return false;
        }
        return true;
    }

    render(){
        const { classes, className,sessionList, ...rest } = this.props;
        return(
            <ValidatorForm ref="LocationEncounterForm">
                <Grid container className={classes.root + ' ' + className}>
                    {/* first row */}
                    <span className={classes.label}>Search Option</span>
                    <Paper variant="outlined" square style={{width:'70%'}}>
                        <Grid className={classes.option}>
                            <FormControl component="fieldset" className={classes.formControl}>
                                <RadioGroup aria-label="searchOption" defaultValue="1" name="searchOption" value={this.state.searchOption} onChange={this.handleSearchOptionChange}>
                                    <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="A" control={<Radio classes={{root: classes.radioButton}} />} label="Exact Match Encounter Type(A)" />
                                    <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="B" control={<Radio classes={{root: classes.radioButton}} />} label="Blank Only (B)" />
                                    <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="C" control={<Radio classes={{root: classes.radioButton}} />} label="With Pre-defined Encounter Type (C)" />
                                    <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="D" control={<Radio classes={{root: classes.radioButton}} />} label="All (B+C)" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Paper>

                    {/* second row */}
                    <span className={classes.label}>Client Type</span>
                    <Paper variant="outlined" square style={{width:'70%'}}>
                        <Grid className={classes.option}>
                            <FormControl component="fieldset" className={classes.formControl}>
                                <RadioGroup className={classes.radioGroup} defaultValue="1" aria-label="clientType" name="this.state.clientType" value={this.state.clientType} onChange={this.handleClientTypeChange}>
                                    <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="E" control={<Radio classes={{root: classes.radioButton}} />} label="EP" />
                                    <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="B" control={<Radio classes={{root: classes.radioButton}} />} label="GP" />
                                    <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="%" control={<Radio classes={{root: classes.radioButton}} />} label="All" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Paper>

                    {/* third row */}
                    <Paper variant="outlined" square style={{width:'30%',boxShadow:'none',marginTop:'5px'}}>
                        <Grid className={classes.session}>
                            <FormControl className={classes.sessionSelect}>
                                <DtsSelectFieldValidator
                                    id={'sessionSelect'}
                                    isDisabled={false}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Session</>
                                    }}
                                    options={
                                        //  [{code:'AM'}, {code:'PM'}, {code:'ALL'}].map((item) => (
                                        //      { value: item.code, label: item.code }))
                                        [{value:'%', label:'ALL'},
                                        ...sessionList.map(
                                            (item) => (
                                                {value:item.sessDesc, label: item.sessDesc}
                                            )
                                        )]
                                    }
                                    value={this.state.selectedSession}
                                    msgPosition="bottom"
                                    validators={this.getValidator('SessionSelector')}
                                    errorMessages={this.getErrorMessage('SessionSelector')}
                                    onChange={e => this.handleSessionChange(e.value)}
                                />
                            </FormControl>
                        </Grid>
                    </Paper>
                    <Paper variant="outlined" square style={{width:'70%',boxShadow:'none',marginTop:'5px'}}>
                        <Grid className={classes.option}>
                            <FormControl className={classes.applDatePicker}>
                                <DateFieldValidator
                                    //ref={ref => this.dateOfBirthRef = ref}
                                    key={this.state.date_format}
                                    id={'selectDate'}
                                    label={DTS_DATE_DISPLAY_FORMAT}
                                    inputVariant="outlined"
                                    disabled={false}
                                    format={DTS_DATE_DISPLAY_FORMAT}
                                    onChange={e => this.handleDateChange(e)}
                                    //onFocus={this.handleDateOnFocus}
                                    //onBlur={e => this.handleDateOnBlur(e, 'dob')}
                                    // value={this.state.selectedDate}
                                    value={this.state.dateFrom}
                                    isRequired
                                    validByBlur
                                    variant={'inline'} // Show datepicher near the textbox instead of center of the screen in a dialog
                                />
                            </FormControl>

                            <DtsButton className={classes.next7DaysBtn} iconType={'SKIPNEXT'} onClick={e => this.handleDateIncrement(this.state.dateFrom)}>Next 7 Days</DtsButton>

                        </Grid>
                    </Paper>

                    {/* forth row */}
                    <Paper variant="outlined" square style={{width:'100%'}}>
                        <Grid className={classes.row}>
                            <DtsSplitButton
                                className={classes.groupSplitBtn}
                                itemListEl={['Multiple', 'Reset', 'Checkout', 'Cancel']}
                                btnOnClick={this.mulitpleBtnOnClick}
                                specialMode={(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE) ? true : false}
                                fixItems
                                disabled={this.multipleBtnShouldDisable()}
                            />
                            <DtsButton onClick={e => this.handleSearch()} iconType={'SEARCH'} disabled={this.searchBtnDisable()}>Search</DtsButton>
                            <DtsButton onClick={this.handleReset} iconType={'REFRESH'}>Reset</DtsButton>
                        </Grid>
                    </Paper>

                    {/* split row */}
                    <Paper>
                        <Grid className={classes.row +' ' + classes.tableBreak}/>
                    </Paper>

                    {/* fifth row */}
                    <Paper variant="outlined" square style={{width:'100%'}}>
                        <Grid className={classes.row}>
                            <TextField className={classes.dailyNoteSearch}
                                id="dailyNoteSearch"
                                label="Keyword for Daily Note"
                                type="search"
                                value={this.state.searchDailyNoteKeyword}
                                onChange={(e)=>{this.setState({searchDailyNoteKeyword:e.target.value });}}
                            />
                        </Grid>
                    </Paper>

                    {/* sixth row */}
                    <Paper variant="outlined" square style={{width:'100%'}}>
                        <Grid className={classes.row2}>
                            <span className={classes.inlineBoldLabel}>Interval of Appt</span>
                            <Input className={classes.intervalInput} defaultValue={this.state.intervalValue} inputProps={{ 'aria-label': 'description' }} onChange={(e)=>this.setState({intervalValue: +e.target.value})}/>
                            <FormControl className={classes.intervalType}>
                                <DtsSelectFieldValidator
                                    id={'intervalTypeSelect'}
                                    isDisabled={false}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Interval</>
                                    }}
                                    options={
                                        [{code:'D', label:'Day'}, {code:'W', label:'Week'}, {code:'M', label:'Month'}].map((item) => (
                                            { value: item.code, label: item.label }))}
                                    value={this.state.intervalType}
                                    msgPosition="bottom"
                                    addNullOption
                                    validators={this.getValidator('IntervalSelector')}
                                    errorMessages={this.getErrorMessage('IntervalSelector')}
                                    onChange={e => this.handleIntervalChange(e.value)}
                                />
                            </FormControl>
                            <span className={classes.inlineBoldLabel}>from {this.state.baseDate.format(DTS_DATE_DISPLAY_FORMAT)}</span>


                        </Grid>
                    </Paper>

                    {/* seventh row */}
                    <Paper variant="outlined" square style={{width:'100%'}}>
                        <Grid className={classes.row}>
                            <DtsButton iconType={'TODAY'} onClick={()=>this.setCalculateBaseDate()}>Today</DtsButton>
                            <span className={classes.inlineBoldLabel2}>[ - </span>
                            <Input className={classes.intervalInput2} defaultValue={this.state.displacementDate} inputProps={{ 'aria-label': 'description' }} onChange={(e)=>this.setState({displacementDate: +e.target.value})}/>
                            <span className={classes.inlineBoldLabel2}>Day(s) ]</span>
                            <DtsButton onClick={()=>this.calculateDate()}>Calculate Date</DtsButton>
                        </Grid>
                    </Paper>
                </Grid>
            </ValidatorForm>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        sessionList: state.dtsAppointmentBooking.pageLevelState.sessionList,
        selectedEncounterType: state.dtsAppointmentBooking.pageLevelState.selectedEncounterType,
        availableTimeSlotList: state.dtsAppointmentBooking.pageLevelState.availableTimeSlotList,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        selectedClinic: state.dtsAppointmentBooking.pageLevelState.selectedClinic
    };
};

const mapDispatchToProps = {
    getSessionList,
    setFilterMode,
    setCalendarDetailDate,
    getAvailableTimeSlot,
    getDailyView,
    setPageStatus,
    resetCalendarDetailDate,
    resetAvailableTimeSlotList,
    resetDailyNote
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAppointmentSearchGroup));
