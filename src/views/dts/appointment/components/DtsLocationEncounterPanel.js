import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import _ from 'lodash';

import Tooltip from '@material-ui/core/Tooltip';
import DateRangeIcon from '@material-ui/icons/DateRange';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';

import DtsSplitButton from '../../components/DtsSplitButton';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';

import { openCommonMessage } from '../../../../store/actions/message/messageAction';


import {
    getAvailableCalendarTimeSlot,
    getAvailableCalendarTimeSlotForExpress,
    getRoomList,
    getEncounterTypeList,
    setSelectedClinic,
    setSelectedRoom,
    setSelectedEncounterType,
    setDuration,
    setAppointmentSearchPanelTabVal,
    setCalendarDetailMth,
    setUtilizationMode
    } from '../../../../store/actions/dts/appointment/bookingAction';

const styles = ({
    root: {
        margin: '10px auto auto auto',
        minWidth: '90%',
        maxWidth:'400px',
        padding: '10px',
        'border-radius': '0px',
        border: '0px',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        'text-align':'center'
    },
    row:{
        width: '100%',
        paddingTop: '10px'
    },
    clinicSelect:{
        width: '45%',
        margin: '10px 3px 0px 3px'
    },
    roomSelect:{
        width: '45%',
        margin: '10px 3px 0px 3px',
        '&.roomNotMatchPatientDefaultRoom': {
            background: 'rgba(255, 75, 75, 0.7)',
            borderRadius: '5px',
            backgroundOrigin: 'padding-box',
            '-webkit-text-fill-color':'#480000',
            '& label':{
                padding:'0px !important',
                backgroundColor:'#ffffff30'
            }
        }
    },
    encounterSelect:{
        width: '75%',
        margin: '10px 3px 0px 3px'
    },
    timeslotInput:{
        width: '15%',
        margin: '10px 3px 0px 3px'
    },
    searchBtn:{
        margin:'auto',
        width:'50%',
        'text-align':'center'
    },
    groupSplitBtn:{
        // width: '60%',
        display: 'inline-flex',
        margin: 'auto'
    },
    expressIcon:{
        right: '27px',
        position: 'relative',
        float: 'right',
        top: '5px'
    },
    tooltipUl:{
        padding: '1px',
        margin: '1px',
        listStyleType: 'none'
    },
    tooltipLi:{
        padding: '1px',
        margin: '1px'
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
    grayIcon:{
        color: 'gray'
    },
    blueIcon:{
        color: 'cornflowerblue'
    }
});


class DtsLocationEncounterPanel extends Component {

    constructor(props){
        super(props);

        let date = new Date().getDate(); //Current Date
        let month = new Date().getMonth() + 1; //Current Month
        let year = new Date().getFullYear(); //Current Year

        this.state = {
            today:date + '' + month + '' + year,
            roomClassExt: ''
        };
    }

     componentDidMount() {
        let curClinic = this.props.clinicList.find(clinic => clinic.siteId == this.props.defaultClinic.siteId);
        this.props.setSelectedClinic({clinic:curClinic});
        this.props.getRoomList({siteId:curClinic.siteId});

        if(!_.isEmpty(this.props.selectedRoom)) {
            this.setState({ roomClassExt: this.getPatientDefaultRoomClassExt(this.props.selectedRoom)});
        }
     }

     componentDidUpdate(prevProps) {
        if(this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
            //set default to clinicList[0]
            this.props.setSelectedClinic({clinic:this.props.clinicList[0]});
            this.props.getRoomList({siteId:this.props.clinicList[0].siteId});
        }
        if(this.props.encounterTypeList != prevProps.encounterTypeList  && typeof this.props.encounterTypeList[0] != 'undefined'){
            if(this.props.selectedEncounterType != undefined){
                const encounterTypeResult = this.props.encounterTypeList.find(item => item.encntrTypeId === this.props.selectedEncounterType.encntrTypeId);
                if(encounterTypeResult == undefined){
                    const recallEncounterType = this.findRecallForGdRoom();
                    if(recallEncounterType != undefined){
                        this.props.setSelectedEncounterType({encounterType:recallEncounterType});
                    }
                    else{
                        this.props.setSelectedEncounterType({});
                    }
                }
                else{
                    this.props.setSelectedEncounterType({encounterType:encounterTypeResult});
                }
            }
            else{
                const recallEncounterType = this.findRecallForGdRoom();
                if(recallEncounterType != undefined){
                    this.props.setSelectedEncounterType({encounterType:recallEncounterType});
                }
            }
        }

        // check selected room change.
        if(!_.isEmpty(this.props.selectedRoom) && prevProps.selectedRoom?.rmId != this.props.selectedRoom?.rmId){
            this.setState({ roomClassExt: this.getPatientDefaultRoomClassExt(this.props.selectedRoom)});
        }
    }

    componentWillUnmount() {
        // this.props.resetLocationEncounter();
    }

    handleClinicChange = (value) => {
        // console.log('handleClinicChange = '+JSON.stringify(value));
        this.props.setSelectedClinic({clinic:value});
        this.props.getRoomList({siteId:value.siteId});
        this.props.setSelectedRoom({});
        this.props.setSelectedEncounterType({});
    }


    handleRoomChange = (value) => {
        // console.log('handleRoomChange = '+JSON.stringify(value));
        this.props.setSelectedRoom({room:value});
        this.props.getEncounterTypeList({roomIdList: [value.rmId]});
        this.setState({ roomClassExt: this.getPatientDefaultRoomClassExt(value)});
    }

    handleEncounterChange = (value) => {
        this.props.setSelectedEncounterType({encounterType:value});
        this.props.setDuration(value.drtn);
    }

    handleSlotChange = (value) => {
        this.props.setDuration(value * 15);
    }

    findRecallForGdRoom = () => {
        // console.log('findRecallForGdRoom');
        // if the room setting is for GD, default the encounter type to be "Recall, 30m"
        const gdSpecialties = this.props.allSpecialties.find(specialties => specialties.sspecCd == 'GD');
        if(this.props.selectedRoom?.sspecId == gdSpecialties.sspecId){
            const encounterTypeResult = this.props.encounterTypeList.find(item => item.encntrTypeCd === 'Recall, 30m');
            if(encounterTypeResult != undefined){
                return encounterTypeResult;
            }
        }
        return undefined;
    }

    getTooltipDetailForExpress = (classes) => {
        let rows = [];
        rows.push('Express Mode '+((this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE) ? 'On' : 'Off'));
        if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE)
            rows.push('3 Appointments, Interval 2 weeks');

        const tooltipItems = rows.map((item, idx) =>
            (<li key={idx} className={classes.tooltipLi}>{item}</li>)
        );

        return (
            <ul className={classes.tooltipUl}>{tooltipItems}</ul>
        );
    }

    searchBtnOnClick = (value) => {
        // console.log(this.props.bookingMode);
        if(value == 'Search Calendar'){
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT ||
                this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE ||
                this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE ||
                this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT ){
                if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE){
                    this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_MODE_APPT);
                }
                // console.log('Search Calendar');
                this.searchCalendarList();
            }
            else{
                this.props.openCommonMessage({
                    msgCode: '140014',
                    showSnackbar: true,
                    variant: 'warning',
                    params: [
                        { name: 'FUNCTION_NAME', value: 'Search Calendar'},
                        { name: 'BOOKING_MODE',
                            value:
                                dtsBookingConstant.DTS_BOOKING_MODE_APPT+' and '+
                                dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE+' and '+
                                dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT+' mode'
                        }
                    ]
                });
            }
        }
        else if(value == 'Search Calendar Express'){
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT ||
                this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE){
                if(this.checkRctEncounter()) {
                    // console.log('Search Calendar Express');
                    this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE);
                    this.searchCalendarListForExpress();
                    this.props.setUtilizationMode(false);
                }
                else {
                    // show warning message
                    this.props.openCommonMessage({
                        msgCode: '140009',
                        showSnackbar: true,
                        variant: 'warning'
                    });
                }
            }
            else{
                this.props.openCommonMessage({
                    msgCode: '140014',
                    showSnackbar: true,
                    variant: 'warning',
                    params: [
                        { name: 'FUNCTION_NAME', value: 'Search Calendar Express'},
                        { name: 'BOOKING_MODE', value: dtsBookingConstant.DTS_BOOKING_MODE_APPT+' and '+dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE+' mode'}
                    ]
                });
            }
        }
    }

    checkRctEncounter = () => {
        // hard code encounter type id for testing phase.
        if(this.props.selectedEncounterType.encntrTypeId == 10148 ||
            this.props.selectedEncounterType.encntrTypeId == 10149 ||
            this.props.selectedEncounterType.encntrTypeId == 10150 ||
            this.props.selectedEncounterType.encntrTypeId == 10151)
            return true;
        else {
            return false;
        }
    }

    searchCalendarListForExpress = () => {
        let startMonth = moment().startOf('month');
        let endMonth = moment(startMonth).add(3, 'months').subtract(1,'days');

        if(!_.isEmpty(this.props.selectedClinic) && !_.isEmpty(this.props.selectedRoom) && !_.isEmpty(this.props.selectedEncounterType)){
            this.props.getAvailableCalendarTimeSlotForExpress({
                dateFrom: dtsUtilities.formatDateParameter(startMonth),
                dateTo: dtsUtilities.formatDateParameter(endMonth),
                clinicCd: this.props.selectedClinic ? this.props.selectedClinic.siteCd : null,
                roomCd: this.props.selectedRoom ? this.props.selectedRoom.rmCd : null,
                slot: this.props.duration / 15,
                encounterTypeId: this.props.selectedEncounterType ? this.props.selectedEncounterType.encntrTypeId : null
            },this.setCalendarDetailDefaultMonth);
        }
    }

    searchCalendarList = () => {
        let startMonth = moment().startOf('month');
        let endMonth = moment(startMonth).add(3, 'months').subtract(1,'days');

        if(!_.isEmpty(this.props.selectedClinic) && !_.isEmpty(this.props.selectedRoom) && this.props.duration){
            let getAvailableCalendarTimeSlotParams = {
                dateFrom: dtsUtilities.formatDateParameter(startMonth),
                dateTo: dtsUtilities.formatDateParameter(endMonth),
                clinicCd: this.props.selectedClinic ? this.props.selectedClinic.siteCd : null,
                roomCd: this.props.selectedRoom ? this.props.selectedRoom.rmCd : null,
                slot: this.props.duration / 15,
                encounterTypeId: this.props.selectedEncounterType ? this.props.selectedEncounterType.encntrTypeId : null
            };
            if (!_.isEmpty(this.props.encntrTypeId)) {
                getAvailableCalendarTimeSlotParams['encounterTypeId'] = this.props.selectedEncounterType ? this.props.selectedEncounterType.encntrTypeId : null;
            }
            this.props.getAvailableCalendarTimeSlot(getAvailableCalendarTimeSlotParams,this.setCalendarDetailDefaultMonth);
        }
    }

    setCalendarDetailDefaultMonth = () => {
        this.props.setCalendarDetailMth(_.isArray(this.props.calendarDataGroupList) && this.props.calendarDataGroupList.length > 0 ? this.props.calendarDataGroupList[0] : '');
        this.props.setAppointmentSearchPanelTabVal(1);
    }

    patientHasDefaultRoom = () => {
        return this.props.patient && this.props.patient.defaultRoomId !== null;
    }

    isMatchPatientDefaultRoom = (room) => {
        if(this.patientHasDefaultRoom()) {
            return room.rmId === this.props.patient.defaultRoomId;
        }
        return false;
    }

    getPatientDefaultRoomClassExt = (room) => {
        if(!this.patientHasDefaultRoom()) {
            // no default room preset
            return '';
        }
        return this.isMatchPatientDefaultRoom(room) ? '':' roomNotMatchPatientDefaultRoom';
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'ClinicSelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'ClinicSelector') {
            errorMessages.push('testing');
            return errorMessages;
        }
    }

    render(){
        const { classes, className, clinicList, roomList, encounterTypeList, patientDefaultRoomId, ...rest } = this.props;
        return(
            <Paper className={classes.root +' ' +className}>
                <ValidatorForm ref="LocationEncounterForm" onSubmit={(event, params) => this.searchBtnOnClick(params)}>
                    <Grid container>
                        <FormControl className={classes.clinicSelect}>
                            {typeof clinicList[0] != 'undefined' && <DtsSelectFieldValidator
                                id={'clinicSelect'}
                                isDisabled
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Clinic</>
                                }}
                                options={
                                    clinicList.map((item) => (
                                        { value: item, label: item.siteCd }))}
                                //defaultValue={clinicList[0]}
                                value={this.props.selectedClinic}
                                msgPosition="bottom"
                                //addNullOption
                                //onBlur={this.handleClinicChange}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                onChange={e => this.handleClinicChange(e.value)}
                                                                    />}
                        </FormControl>

                        <FormControl className={classes.roomSelect + this.state.roomClassExt}>

                            <DtsSelectFieldValidator
                                id={'roomSelect'}
                                isDisabled={this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MULTIPLE_MODE}
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
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                onChange={e => this.handleRoomChange(e.value)}
                            />
                        </FormControl>

                        <FormControl className={classes.encounterSelect}>
                            <DtsSelectFieldValidator
                                id={'encounterSelect'}
                                isDisabled={false}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Encounter Type</>
                                }}
                                options={
                                    encounterTypeList && (patientDefaultRoomId != null) ?
                                    ( encounterTypeList.filter(x => !x.blockWithDfltRm).map((item) => (
                                        { value: item, label: item.encntrTypeDesc })) ) :
                                    ( encounterTypeList.map((item) => (
                                        { value: item, label: item.encntrTypeDesc })) )
                                    }
                                value={this.props.selectedEncounterType}
                                msgPosition="bottom"
                                //addNullOption
                                validators={this.getValidator('EncounterSelector')}
                                errorMessages={this.getErrorMessage('EncounterSelector')}
                                onChange={e => this.handleEncounterChange(e.value)}
                            />
                        </FormControl>

                        <FormControl className={classes.timeslotInput}>
                            <TextFieldValidator
                                id={'timeslotInput'}
                                variant="outlined"
                                label="Slot"
                                disabled={false}
                                validByBlur={false}
                                // eslint-disable-next-line
                                inputProps={{ maxLength: 3 }}
                                value={this.props.duration/15}
                                msgPosition="bottom"
                                trim={'all'}
                                onChange={e => this.handleSlotChange(e.target.value)}
                                validators={[ValidatorEnum.isPositiveInt]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            />
                        </FormControl>

                        <div className={classes.row}>
                            {/* <DtsButton className={classes.searchBtn} iconType={'SEARCH'} onClick={this.searchCalendarList}>Search Calendar</DtsButton> */}
                            <DtsSplitButton
                                className={classes.groupSplitBtn}
                                iconType={'SEARCH'}
                                itemListEl={['Search Calendar', 'Search Calendar Express']}
                                itemsColorList={['BLUE', 'GREEN']}
                                btnOnClick={(value)=>this.refs.LocationEncounterForm.submit(null, value)}
                                specialMode
                            />

                            <Tooltip title={this.getTooltipDetailForExpress(classes)}>
                                <DateRangeIcon fontSize="large" className={classes.expressIcon + ' ' + ((this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE)?classes.blueIcon:classes.grayIcon)}/>
                            </Tooltip>
                        </div>
                    </Grid>
                </ValidatorForm>
            </Paper>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        defaultClinic: state.login.clinic,
        clinicList: state.common.clinicList,
        roomList: state.dtsAppointmentBooking.pageLevelState.roomList,
        encounterTypeList: state.dtsAppointmentBooking.pageLevelState.encounterTypeList,
        selectedClinic: state.dtsAppointmentBooking.pageLevelState.selectedClinic,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        selectedEncounterType: state.dtsAppointmentBooking.pageLevelState.selectedEncounterType,
        duration: state.dtsAppointmentBooking.pageLevelState.duration,
        patientDefaultRoomId: state.patient.defaultRoomId,
        patient: state.patient,
        calendarDataGroupList: state.dtsAppointmentBooking.pageLevelState.calendarDataGroupList,
        allSpecialties: state.dtsPreloadData.allSpecialties
    };
};

const mapDispatchToProps = {
    getRoomList,
    getEncounterTypeList,
    getAvailableCalendarTimeSlot,
    getAvailableCalendarTimeSlotForExpress,
    setSelectedClinic,
    setSelectedRoom,
    setSelectedEncounterType,
    setDuration,
    openCommonMessage,
    setAppointmentSearchPanelTabVal,
    setCalendarDetailMth,
    setUtilizationMode
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsLocationEncounterPanel));