import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import withStyles from '@material-ui/core/styles/withStyles';
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
    DialogContent,
    DialogActions
} from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';

import _ from 'lodash';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import FormControl from '@material-ui/core/FormControl';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import { setRedirect } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction'; //DH Anthony //DH Miki
import { REDIRECT_ACTION_TYPE } from '../../../../enums/dts/clinicalContent/currentEncounterEnum';
import { REDIRECT_ACTION_TYPE as PATIENT_REDIRECT_ACTION_TYPE } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import accessRightEnum from '../../../../enums/accessRightEnum';
import Enum from '../../../../enums/enum';

import {
    setPatientKey,
    setSelectedAppointmntTask,
    getPatientByIds,
    getAppoointmentTask,
    getDailyView,
    confirmAttendance,
    updateArrivalTime,
    revokeAttendance
} from '../../../../store/actions/dts/appointment/attendanceAction';
import { getAnaCode } from '../../../../store/actions/dts/dtsCommonAction';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import Tooltip from '@material-ui/core/Tooltip';
import { DTS_ECS_PERMIT_OTHER_REASON_CODE } from '../../../../constants/dts/appointment/DtsAttendanceConstant';

const styles = {
    root: {
        width: '100%'
    },

    confirmPanel: {
        padding: 0,
        width: 500
    },

    label: {
        textAlign: 'right',
        fontWeight: 'bold'
    },title: {
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#7bc1d9',
        color:'#fff',
        fontWeight: 'bold',
        borderStyle: 'none'

    },colTitle:{
        textAlign: 'left',
        borderStyle: 'none',
        fontWeight: 'bold',
        padding: '10px'
    },colLabel:{
        textAlign: 'right',
        fontWeight: 'bold'
    },
    colDetailLabel: {
        textAlign: 'left',
        padding: '10px'

    },colDetailLabel2: {
        textAlign: 'center',
        padding: '10px 0px'

    },
    tableCell:{
        //borderStyle: 'none',
        textAlign: 'left',
        fontWeight: 'bold',
        borderStyle: 'none',
        borderBottom: '1px solid rgba(224, 224, 224, 1)'
    },
    textField:{
        width: 150,
        height: 5,
        top: '5px'

    },
    textField2:{
        width: '45px',
        height: '39px',
        top: '5px',
        backgroundColor: '#48aeca'
    },paperContainer:{
        //border:'1px solid lightgrey'
        marginBottom:'20px'
    },
    attendanceLabel:{
        color: 'black'
    },
    alertLabel:{
        textAlign: 'center',
        fontWeight: 'bold',
        borderStyle: 'none',
        padding: '10px'
    },
    textRed:{
        color:'red'
    },
    row:{
        //width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin:'auto'
        // margin: '10px 3px 0px 3px'
    },
    ecsPermitReasonSelect:{
        width: '600px',
        margin: '8px'
    },
    ecsPermitReasonText:{
        float:'right',
        marginRight:'10px'
    },
    validatorGrid:{
        float:'left',
        display: 'flex',
        alignItems:'center'
    },
    validatorLabel:{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'right'
    },
    paperContainerRed:{
        backgroundColor:'red',
        color:'#ffffff'
    },
    timePicker: {
        flexDirection: 'row',
        paddingBottom: '2px'
    },
    timePickerText: {
        width: '50px'
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
};

class DtsAttendanceConfirmationDialog extends Component {

    constructor(props){
        super(props);
        this.state = {
            //openConfirmDialog: false,
            discNumber:'',
            currentTime:moment(),
            selectedRejectReason:{},
            ecsPermitReasonText:'',
            //isEcs:false //hardcode
            inputTime: moment(props.selectedAppointmentTask.arrivalTime)
        };
    }

    componentDidMount(){
        //temp test
        this.props.getAnaCode([{category:'DTS ECS PERMIT REASON'}]); //hardcode
        this.props.getPatientByIds({patientKey:this.props.patientKey},false);
    }
    componentDidUpdate(prevProps){
        // if(prevProps.patientKey != this.props.patientKey){
        //     this.props.getPatientByIds(
        //         {patientKey:this.props.patientKey},
        //         false
        //     );
        // }

        // if(this.props.patientKey && (prevProps.patientKey != this.props.patientKey || prevProps.calendarDetailDate != this.props.calendarDetailDate)){
        //     if(this.props.selectedAppointmentTask == null){
        //         this.props.getAppoointmentTask(
        //             {
        //                 svcCd:'DTS',
        //                 patientKey:this.props.patientKey,
        //                 startDate:_.isEmpty(this.props.calendarDetailDate) ? moment().format('YYYY-MM-DD') : this.props.calendarDetailDate,
        //                 endDate:_.isEmpty(this.props.calendarDetailDate) ? moment().format('YYYY-MM-DD') : this.props.calendarDetailDate,
        //                 allService:false
        //             },
        //             this.props.attendanceAction
        //         );
        //     }
        //     else
        //         this.props.attendanceAction;
        // }
    }

    dialogTitle = this.props.isRevoke? 'Revoke Attendance' : 'Confirm Take Attendance';

    getClinicCd = (siteId) => {
        let result;
        if(this.props.clinicList != null && this.props.clinicList.length > 0){
            result = this.props.clinicList.find(item=> item.siteId === siteId);
            return result.siteCd;
        }
    }

    updateAttendanceList = () => {
        if (this.props.selectedRoom && this.props.calendarDetailDate) {
            this.props.getDailyView({rmId:this.props.selectedRoom.rmId, date:this.props.calendarDetailDate});
        }
    }

    handleOnSubmit = () => {
        this.props.confirmAttendance(
            {
                byPassWarning: false,
                apptId: this.props.selectedAppointmentTask.appointmentId,
                apptVersion: moment(this.props.selectedAppointmentTask.version).format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
                atndSrc: 'C',
                discNum: this.state.discNumber,
                isRealtime: true,
                patientKey: this.props.patientInfo.patientKey,
                siteId: this.props.selectedAppointmentTask.siteId,
//                svcCd: 'DTS',
                isEcsResultNo: !dtsUtilities.isEcsPassed(this.props.selectedPatientEcsResult),
	            ecsReasonCode:this.state.selectedRejectReason.code ? this.state.selectedRejectReason.code : '',
	            ecsReasonRemarks:this.state.ecsPermitReasonText
            },
            [this.updateAttendanceList, this.handleCancel, this.props.importCallback].filter(func => func),
            true
        );

        this.redirectToCurrentEncounter();


    }

    handleSubmitError = () => {

    }

    //direct to create encounter page
    redirectToCurrentEncounter = () => {


        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.ENCOUNTER });

        //check if the role is counter row
        let cimsCounterRoleList = this.props.loginUserRoleList.filter(item => item.uamRoleDto && item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-COUNTER');
        let cimsDoctorRoleList = this.props.loginUserRoleList.filter(item => item.uamRoleDto && item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-DOCTOR');

            //check if the role is counter row
        if(cimsCounterRoleList.length == 1 && cimsDoctorRoleList.length == 0){
                //this.handleSkipTab('currentEncounter', null, accessRightEnum.DtsAttendance);
        }else{
            this.handleSkipTab('currentEncounter', null, accessRightEnum.CurrentEncounter);
        }
    }

    handleCancel = () => {
        this.props.setPatientKey({patientKey: ''});

        if (this.refs.form){
            this.refs.form.resetValidations();
        }
        this.props.closeConfirmDialog();
    }

    handleClose = () => {
        this.props.setPatientKey({patientKey: ''});
        this.props.setSelectedAppointmntTask({selectedAppointmentTask: null});
        this.props.closeConfirmDialog();
    }

    handleEditArrivalTime = () => {
        this.props.updateArrivalTime(this.props.selectedAppointmentTask.attendanceBaseVo, this.state.inputTime.format(),
            () => [this.updateAttendanceList, this.handleCancel, this.props.importCallback].forEach(func => func()));
    }

    handleRevoke = () => {
        this.props.revokeAttendance(this.props.selectedAppointmentTask.attendanceBaseVo,
            () => [this.updateAttendanceList, this.handleCancel, this.props.importCallback].forEach(func => func()));
    }

    // checkEcsStatus = (ecs) => {
    //     console.log('checkEcsStatus-ecs:' + JSON.stringify(ecs));
    //     if (ecs){
    //         if (ecs.isValid){
    //             if (ecs.eligibleDental1 == 'Y' || ecs.eligibleDental2 == 'Y'){
    //                 return 'Y';
    //             }
    //             else {
    //                 return 'N';
    //             }
    //         }
    //         else {
    //             return '?';
    //         }
    //     }
    //     else {
    //         return '';
    //     }
    // }

    getValidator = (name) => {
        // let validators = [];
        // if (name === 'ClinicAttendanceSelector') {
        //     validators.push('required');
        //     return validators;
        // }
    }

    getErrorMessage = (name) => {
        // let errorMessages = [];
        // if (name === 'ClinicAttendanceSelector') {
        //     errorMessages.push('Clinic is required');
        //     return errorMessages;
        // }
    }

    handleEcsChange=(value)=>{
        this.setState({selectedRejectReason:value});
    }

    handleecsPermitReasonTextOnChange = (value) => {
        // console.log(value);
        this.setState({ecsPermitReasonText: value});
    }

    handleDiscNumberOnChange =(e) => {
        this.setState({discNumber:e.target.value});
    }

    // handleEcsToggle=(e) => { //hardcode
    //     this.setState({isEcs:!this.state.isEcs});
    // }

    //redirect to current encounter page
    handleSkipTab = (action, apptInfo, target) => {
        //openCommonCircular();
        console.log('this.props.patientInfo.patientKey: ' + this.props.patientInfo.patientKey);
        console.log('target: ' + target);
        // deleteSubTabs(accessRightEnum.patientSummary);
        // resetAll();
            this.props.skipTab(
                target,
                {
                    // stepIndex: index,
                    patientKey: '',
                    action,
                    apptInfo: apptInfo || null

                },
                true
            );

        //closeCommonCircular();
        // skipTab(accessRightEnum.booking, { patientKey: patientInfo.patientKey, action: action, apptInfo: apptInfo || null });
    };

    getTooltipDetailForDocType = (classes) => {
        let rows = [];
        let tempItem = dtsUtilities.getDocTypeDescByDocTypeCd(this.props.patientInfo.documentPairList[0].docTypeCd);
        rows.push(tempItem ? tempItem : 'No Document Type');

        const tooltipItems = rows.map((item, idx) =>
            (<li key={idx} className={classes.tooltipLi}>{item}</li>)
        );

        return (
            <ul className={classes.tooltipUl}>{tooltipItems}</ul>
        );
    }
    render(){
        const { classes, openConfirmDialog,patientInfo,selectedAppointmentTask,ecsPermitReasonList,  ...rest } = this.props;
        let engName = patientInfo.engSurname + ', ' + patientInfo.engGivename;
        // console.log('_.isArray(selectedAppointmentTask.appointmentTask) = '+_.isArray(selectedAppointmentTask.appointmentTask));
        // console.log('!_.isEmpty(selectedAppointmentTask.appointmentTask) = '+!_.isEmpty(selectedAppointmentTask.appointmentTask));

        return(

            <div>
            {patientInfo && patientInfo.documentPairList &&
            <CIMSDialog id="dtsAttendanceConfirmationDialog" dialogTitle={this.dialogTitle} open={openConfirmDialog} dialogContentProps={{ style: { width: 800 } }}>
            {
            // _.isArray(selectedAppointmentTask.appointmentTask) &&
            !_.isEmpty(selectedAppointmentTask) ? (
                <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError} >
                        <DialogContent id={'dtsAttendanceConfirmationDialogContent'}>
                            <div className={classes.root}>
                                <Paper className={classes.paperContainer}>
                                    <Grid container spacing={0}>
                                        <Grid item xs={12}>
                                            <Paper  elevation={0} className={classes.title+' '+classes.label}>Patient</Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Name: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper  elevation={0} className={classes.colDetailLabel}>
                                            {/* {patientInfo.engGivename} {patientInfo.engSurname} {patientInfo.nameChi} */}
                                            {dtsUtilities.getPatientNameWithOrder(engName, patientInfo.nameChi, false)}
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper elevation={0}  className={classes.colTitle+' '+classes.colLabel}>Sex: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper  elevation={0} className={classes.colDetailLabel}>{patientInfo.genderCd}</Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper elevation={0}  className={classes.colTitle+' '+classes.colLabel}>Doc Type: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper elevation={0}  className={classes.colDetailLabel}>
                                                <Tooltip title={this.getTooltipDetailForDocType(classes)}>
                                                    <div>
                                                    {patientInfo.documentPairList[0].docTypeCd}
                                                    </div>
                                                </Tooltip>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Doc ID: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper  elevation={0} className={classes.colDetailLabel}>
                                                {/* {patientInfo.documentPairList[0].docNo}   */}
                                                {dtsUtilities.formatDocNo(patientInfo.documentPairList[0].docTypeCd, patientInfo.documentPairList[0].docNo)}
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>D.O.B.: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper elevation={0}  className={classes.colDetailLabel}>
                                                {/* {patientInfo.dob}   */}
                                                {dtsUtilities.formatDateParameter(patientInfo.dob, Enum.DATE_FORMAT_EDMY_VALUE)}
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper className={classes.paperContainer}>
                                    <Grid container spacing={0}>
                                        <Grid item xs={12}>
                                            <Paper  elevation={0} className={classes.title+' '+classes.label}>Appointment</Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Clinic: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper  elevation={0} className={classes.colDetailLabel}>{this.getClinicCd(selectedAppointmentTask.siteId)} </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper elevation={0}  className={classes.colTitle+' '+classes.colLabel}>Surgery: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper  elevation={0} className={classes.colDetailLabel}>{selectedAppointmentTask.roomDesc || selectedAppointmentTask.rmDesc}  </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper elevation={0}  className={classes.colTitle+' '+classes.colLabel}>Date: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper elevation={0}  className={classes.colDetailLabel}>
                                                {/* {moment(selectedAppointmentTask.appointmentDateTime || selectedAppointmentTask.apptDateTime).format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT)}   */}
                                                {dtsUtilities.formatDateParameter(selectedAppointmentTask.appointmentDateTime || selectedAppointmentTask.apptDateTime, DTS_DATE_WEEKDAY_DISPLAY_FORMAT)}
                                                </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Time: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper  elevation={0} className={classes.colDetailLabel}>
                                                {dtsUtilities.getAppointmentStartEndTime(selectedAppointmentTask)}
                                                {/* {moment.min(selectedAppointmentTask.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.map((item) => moment(item.startDtm || item.sdtm))).format('HH:mm')} -
                                                {moment.max(selectedAppointmentTask.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList.map((item) => moment(item.endDtm || item.edtm))).format('HH:mm')} */}
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Encounter: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper elevation={0}  className={classes.colDetailLabel}>{selectedAppointmentTask.encounterTypeDescription || selectedAppointmentTask.encntrTypeDesc} </Paper>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper className={classes.paperContainer}>
                                    <Grid container spacing={0}>
                                        <Grid item xs={12}>
                                            <Paper  elevation={0} className={classes.title+' '+classes.label}>Attendance</Paper>
                                        </Grid>

                                        {!this.props.isRevoke && <>
                                        <Grid item xs={2}>
                                            <Paper  elevation={0} className={classes.colTitle+' '+classes.colLabel}>Disc Number: </Paper>
                                        </Grid>
                                        <Grid item xs={4}>

                                            <CIMSTextField
                                                id={'discNumber'}
                                                //={index}
                                                //label={confirmAttendance.disNumber}
                                                variant="outlined"
                                                InputProps={{
                                                    style: {
                                                        height: '25px',
                                                        width: '120px',
                                                        margin: '5px',
                                                        color: 'black'
                                                    }
                                                }}
                                                value={this.state.discNumber}
                                                onChange={this.handleDiscNumberOnChange}
                                            />
                                        </Grid>
                                        </>}
                                        <Grid item xs={2}>
                                            <Paper elevation={0} className={classes.colTitle+' '+classes.colDetailLabel}>Arrival Time: </Paper>
                                        </Grid>
                                        {!this.props.isRevoke?
                                        <>
                                            <Grid item xs={1}>
                                                <Paper elevation={0}  className={classes.colDetailLabel2}>Hour </Paper>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <CIMSTextField
                                                    id={'hourField'}
                                                    //={index}
                                                    //label={confirmAttendance.arrivalTimeHour}
                                                    disabled
                                                    variant="outlined"
                                                    absoluteMessage
                                                    InputProps={{
                                                        style: {
                                                            height: '25px',
                                                            width: '50px',
                                                            margin: '5px',
                                                            color: '#4e4e4e',
                                                            backgroundColor: 'lightgrey'


                                                        }
                                                    }}
                                                    value={this.state.currentTime.format('HH')}
                                                />
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Paper elevation={0}  className={classes.colDetailLabel2}>Minute </Paper>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <CIMSTextField
                                                    id={'minField'}
                                                    //={index}
                                                    //lab   el={confirmAttendance.arrivalTimeMins}
                                                    variant="outlined"
                                                    disabled
                                                    InputProps={{
                                                        style: {

                                                            height: '25px',
                                                            width: '50px',
                                                            margin: '5px',
                                                            color: 'black',
                                                            backgroundColor: 'lightgrey'

                                                        }
                                                    }}
                                                    value={this.state.currentTime.format('mm')}
                                                />
                                            </Grid>
                                        </>
                                        :
                                        <KeyboardTimePicker
                                            className={classes.timePicker}
                                            onChange={date => this.setState({inputTime: date})}
                                            value={this.state.inputTime}
                                            ampm={false}
                                            autoOk
                                            invalidDateMessage={'Invalid Time Format'}
                                            inputProps={{className: classes.timePickerText}}
                                        />
                                        }
                                    </Grid>
                                </Paper>

                                {(!dtsUtilities.isEcsPassed(this.props.selectedPatientEcsResult) && !this.props.isRevoke) &&
                                    <Paper className={classes.paperContainer}>
                                        <Grid container spacing={0}>
                                            <Grid item xs={12}>
                                                <Paper  elevation={0} className={classes.title+' '+classes.label +' '+classes.paperContainerRed}>Attendance exempt reason for ECS failed patient</Paper>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Paper elevation={0} className={classes.alertLabel}>The patient has ECS status NO - please confirm if still want to take attendance</Paper>
                                            </Grid>
                                            <Grid item xs={12} className={classes.validatorGrid}>
                                                <Paper elevation={0}  className={classes.colTitle+' '+classes.colLabel + ' '+classes.validatorLabel}>Please choose</Paper>
                                                    <div className={classes.row}>
                                                        <FormControl className={classes.ecsPermitReasonSelect}>
                                                            {ecsPermitReasonList.length>0 &&
                                                            <DtsSelectFieldValidator
                                                                id={'ClinicAttendancePermitReasonSelect'}
                                                                isDisabled={false}
                                                                isRequired
                                                                TextFieldProps={{
                                                                    variant: 'outlined'
                                                                    //label: <>Clinic</>
                                                                }}
                                                                options={
                                                                    ecsPermitReasonList.map((item) => (
                                                                        { value: item, label: item.value }))}
                                                                value={this.state.selectedRejectReason}
                                                                msgPosition="bottom"
                                                                addNullOption
                                                                validators={this.getValidator('ClinicAttendanceSelector')}
                                                                errorMessages={this.getErrorMessage('ClinicAttendanceSelector')}
                                                                onChange={e => this.handleEcsChange(e.value)}
                                                            />}
                                                            </FormControl>
                                                    </div>
                                            </Grid>
                                            {this.state.selectedRejectReason.code == 'P1' && <Grid item xs={12}>
                                                <Paper elevation={0} className={classes.alertLabel+' '+classes.textRed}>Please remind patient to update demographic data to the ECS system</Paper>
                                            </Grid>}
                                            <Grid item xs={12}>
                                                <TextFieldValidator
                                                    className={classes.ecsPermitReasonSelect+' ' + classes.ecsPermitReasonText}
                                                    id={'ecsPermitReasonText'}
                                                    // ref={ref => this.surNameRef = ref}
                                                    // name={RegFieldName.ENGLISH_SURNAME}
                                                    value={this.state.ecsPermitReasonText}
                                                    disabled={false}
                                                    variant="outlined"
                                                    label={this.state.selectedRejectReason.code && this.state.selectedRejectReason.code.charAt(0) == 'D' ? 'Input reject reason, to be stored in Spec Req' : 'Input the approval reason.'}
                                                    inputProps={{ maxLength: 500 }}
                                                    absoluteMessage
                                                    validators={this.getValidator('specialRequestText')}
                                                    errorMessages={this.getErrorMessage('specialRequestText')}
                                                    onChange={e => this.handleecsPermitReasonTextOnChange(e.target.value)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                }
                            </div>
                        </DialogContent>

                    <DialogActions className={classes.dialogAction}>
                        {/* <CIMSButton
                            onClick={this.handleEcsToggle}
                            color="primary"
                            id={'attendance_ecs'}
                        >EcsToggle</CIMSButton> */}
                        {!this.props.isRevoke?
                            <CIMSButton
                                onClick={() => this.refs.form.submit()}
                                id={'attendance_confirm'}
                                color="primary"
                                disabled={
                                    !dtsUtilities.isEcsPassed(this.props.selectedPatientEcsResult) &&
                                    !this.state.selectedRejectReason.code ||
                                    (this.state.selectedRejectReason.code && this.state.selectedRejectReason.code == DTS_ECS_PERMIT_OTHER_REASON_CODE && this.state.ecsPermitReasonText=='')
                                }
                            >{this.state.selectedRejectReason.code && this.state.selectedRejectReason.code.charAt(0) == 'D' ? 'Reject Attendance' : 'Confirm Take Attendance'}</CIMSButton>
                        :
                        <>
                            <CIMSButton
                                onClick={this.handleEditArrivalTime}
                                id={'attendance_edit'}
                                color="primary"
                                disabled={!this.state.inputTime?.isValid()}
                            >Edit Arrival Time</CIMSButton>
                            <CIMSButton
                                onClick={this.handleRevoke}
                                id={'attendance_revoke'}
                                color="primary"
                                disabled={this.props.selectedAppointmentTask.encounterBaseVo?.encntrSts !== 'N'}
                            >Revoke</CIMSButton>
                        </>
                        }
                        <CIMSButton
                            onClick={this.handleCancel}
                            color="primary"
                            id={'attendance_cancel'}
                        >Cancel</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            ) : (
                <ValidatorForm ref="form2" onError={this.handleSubmitError} >
                    <DialogContent id={'dtsAttendanceConfirmationDialogContentErr'}>
                        Appointment Not found.
                    </DialogContent>
                    <DialogActions className={classes.dialogAction}>
                            <CIMSButton
                                onClick={this.handleClose}
                                color="primary"
                                id={'attendance_cancel'}
                            >Close</CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            )
            }
            </CIMSDialog>}
            </div>

        );
    }
}

const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);
    // console.log(state.dtsAppointmentAttendance.patientInfo);
    // console.log(state.dtsAppointmentAttendance.selectedAppointmentTask);
    // console.log(state.dtsAppointmentAttendance.calendarDetailDate);
    return {
        patientKey: state.dtsAppointmentAttendance.patientKey,
        patientInfo: state.dtsAppointmentAttendance.patientInfo,
        selectedAppointmentTask: state.dtsAppointmentAttendance.selectedAppointmentTask,
        calendarDetailDate:state.dtsAppointmentAttendance.calendarDetailDate,
        clinicList:state.common.clinicList,
        selectedRoom: state.dtsAppointmentAttendance.selectedRoom,
        ecsPermitReasonList:state.dtsAppointmentAttendance.ecsPermitReasonList,
        selectedPatientEcsResult: state.dtsAppointmentAttendance.selectedPatientEcsResult,
        isRevoke: state.dtsPatientSummary.redirect.action === PATIENT_REDIRECT_ACTION_TYPE.REVOKE_APPOINTMENT,
        loginUserRoleList: state.common.loginUserRoleList
    };
};

const mapDispatchToProps = {
    setPatientKey,
    setSelectedAppointmntTask,
    getPatientByIds,
    getAppoointmentTask,
    getDailyView,
    confirmAttendance,
    getAnaCode,
    setRedirect,
    skipTab,
    updateArrivalTime,
    revokeAttendance
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAttendanceConfirmationDialog));







