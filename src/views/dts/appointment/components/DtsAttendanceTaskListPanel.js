import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import SvgIcon from '@material-ui/core/SvgIcon';

import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import DtsTimeslotsDurationIcon from './DtsTimeslotsDurationIcon';
import { StatusList as EncounterStatusList } from '../../../../enums/dts/encounter/encounterStatusEnum';
import { epPatientStatus } from '../../../../enums/dts/appointment/epPatientStatusEnum';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import Enum from '../../../../enums/enum';
import DtsPatientLink from './DtsPatientLink';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';
import OverflowTypography from '../../components/OverflowTypography';

import {
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Paper,
    Link
} from '@material-ui/core';

import {
    Menu as MenuIcon,
    Print as PrintIcon,
    Phone as PhoneIcon,
    Edit as EditIcon,
    AccessTime as TimeIcon,
    Delete as DeleteIcon,
    MoreVert as SubMenuIcon,
//  PhoneEnabled as PhoneEnabledIcon,
    Phone as PhoneEnabledIcon,
    Notifications as NotificationsIcon,
//    PhoneDisabled as PhoneDisabledIcon
    Phone as PhoneDisabledIcon
} from '@material-ui/icons';

import {
    getRoomOfficer,
    setPatientKeyNAppointment
} from '../../../../store/actions/dts/appointment/attendanceAction';
import {
    attendanceStatus, clinicalStatus
} from '../../../../enums/dts/attendance/attendanceFilterEnum';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';

const styles = {
    // root:{
    //     width:'100%'
    // },

    root: {
        margin: 'auto',
        textAlign:'center',
        fontFamily: 'Microsoft JhengHei, Calibri',
        width: '100%',
        'border-radius': '0px',
        border: '0px',
        // left: '20px',
        position: 'relative',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
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
        textAlign:'center'
    },
    tableCellPatientInfo:{
        //color: 'darkblue'
    },
    tableRowEnd:{
        height:'32px'
    },
    drInfoLabel:{
        width: '100%',
        display: 'inline-block',
        fontSize: 14,
        margin:5,
        fontFamily: 'Microsoft JhengHei, Calibri'
    },
    sizeIconDiv:{
        float: 'right',
        margin:5
    },
    tableCell:{
        borderStyle: 'none',
        textAlign:'center',
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        padding:'0px 8px',
        '&:last-child': {
            //padding: '8px',
            paddingRight: '8px'
        },
        maxWidth:'300px'
    },
    durCell:{
        width: '70px'
    },
    durCellUnavail:{
        backgroundColor: '#b1b1b1',
        textAlign: 'center',
        color:'#fff'
    },
    alignCenter:{
        textAlign: 'center'
    },
    dayEnd:{
        textAlign: 'center'
    },
    tableRowSessionBreak:{
        height: '0px'
    },
    tableCellSessionBreak:{
        border: '2px solid #63a293',
        height: '0px'
    },
    shortCol:{
        // width: '1rem',
        'max-width': '100% !important'
    },
    mediumCol:{
        width: '7rem',
        'max-width': '100% !important'
    },
    longCol:{
        width: '14.5rem',
        'max-width': '100% !important'
    },
    iconCol:{
        // width: '3rem',
        'max-width': '100% !important'
    },
    indicatorCol:{
        width: '3rem',
        'max-width': '100% !important'
    },
    arrLate:{
        backgroundColor: '#ff5f5f',
        textAlign: 'center',
        color:'#fff'
    },
    ecsYes:{
        color: '#9de2ffc9'
    },
    ecsNo:{
        color: '#ff5f5f',
        fontWeight:600
    },
    urgentSqueezeIn:{
        backgroundColor: '#ff83fab8'
    },
    isNotChangeWithIn24Hr:{
        backgroundColor: '#FD9941',
        textAlign: 'center',
        color:'#fff'
    },
    noWrapGrid:{
        // maxWidth: '220px'
    },
    popoverText: {
        paddingRight: '5px'
    }
};



class DtsAttendanceTaskListPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            dateFrom: null,
            squeezeInMode: null,
            dateTo: null
        };
        //this.formatCell = this.formatCell.bind(this);
    }

    // componentWillMount() {

    // }

    componentDidMount(){

    }

    componentDidUpdate(prevProps){
        if((prevProps.selectedRoom != this.props.selectedRoom || prevProps.calendarDetailDate != this.props.calendarDetailDate) &&
        this.props.selectedRoom && this.props.selectedRoom.rmId && this.props.calendarDetailDate){
            this.props.getRoomOfficer({roomId:this.props.selectedRoom.rmId,date:this.props.calendarDetailDate});
        }
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

    getEp(patient){
        let patientStatus = patient.patientStatus;

        return epPatientStatus.map(s => s.statusCd).includes(patientStatus);

    }
    getPatientStatusDisp(patient){
        const { patientStatusList } = this.props;

        let patientStatus = patientStatusList.find(s => s.code == patient.patientStatus);
        if (patientStatus){
            return patientStatus.superCode;
        }
        else {
            return '';
        }
    }
    arrOnTime = (arrTime, startTime, classes) => {
        //console.log('diff:' + moment(arrTime, 'HHmm').diff(moment(startTime, 'HHmm'), 'minutes'));
        if(arrTime && moment(moment(arrTime).format('HHmm'), 'HHmm').diff(moment(startTime, 'HHmm'), 'minutes') > 0)
            return classes.arrLate;
        else
            return '';
    }

    actionTypeClass = (encounter) => {
        const { actionTypeClassFunc } = this.props;
        if (actionTypeClassFunc){
            if (encounter) {
                return actionTypeClassFunc(encounter.encounterStatus);
            }
            else {
                return '';
            }
        }
    }

    checkEcsClass = (ecs, classes) => {
        if(dtsUtilities.checkEcsStatus(ecs) === 'Y')
            return classes.ecsYes;
        else
            return classes.ecsNo;
    }

    timeSlotStartTimeClass = (item, classes) => {
        if (item.isChangeWithIn24Hr) {
            return '';
        }
        return classes.isNotChangeWithIn24Hr;
    }

    checkUrgent = (appointmentType, classes) => {
        if(appointmentType === 'US')
            return classes.urgentSqueezeIn;
        else
            return '';
    }

    handleClick = (event, attendanceItem) => {
        console.log(attendanceItem);

        if(attendanceItem.type == 'A'){
            if(attendanceItem.appointment.attendanceBaseVo == null){
                console.log('show popup');
                this.props.setPatientKeyNAppointment(
                    {
                        patientKey: attendanceItem.appointment.patientKey,
                        selectedAppointmentTask: attendanceItem.appointment,
                        selectedPatientEcsResult: dtsUtilities.checkEcsStatus(attendanceItem.appointment.appointmentECSChk)
                    }
                );
                this.props.attendanceAction();
            }
            else
                console.log('don\'t show popup');
        }
    };

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

    attendanceFilter = (item) => {
        const { selectedFilterClinicalStatus, selectedFilterEncounterTypeCd, selectedFilterAttendanceStatus, selectedFilterInfectionControlDisplay, filterLogic, ...rest } = this.props;
        const infectionControlIds = this.props.infectionControlUnavailablePeriodReasons.map(rsn => rsn.unavailPerdRsnId);
        return filterLogic(item, selectedFilterClinicalStatus, selectedFilterEncounterTypeCd, selectedFilterAttendanceStatus, selectedFilterInfectionControlDisplay, infectionControlIds);
    }

    openEncounter = (event, appt) => {
        event.stopPropagation();

        let cimsCounterRoleList = this.props.loginUserRoleList.filter(item => item.uamRoleDto && item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-COUNTER');
        let cimsDoctorRoleList = this.props.loginUserRoleList.filter(item => item.uamRoleDto && item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-DOCTOR');
        if (appt.encounterBaseVo){
            //check if the role is counter row
            if(cimsCounterRoleList.length == 1 && cimsDoctorRoleList.length == 0){
                //this.handleSkipTab('currentEncounter', null, accessRightEnum.DtsAttendance);
            }else{
                //dtsUtilities.getPatientInfo({ patientKey: appt.patientDto.patientKey, callback: () => this.handleSkipTab('currentEncounter', null, accessRightEnum.CurrentEncounter) });
                dtsUtilities.getPatientInfo({ patientKey: appt.patientDto.patientKey, callback: () => dtsUtilities.openEncounterPage() });
            }


            //dtsUtilities.getPatientInfo({ patientKey: appt.patientDto.patientKey, callback: () => dtsUtilities.openEncounterPage() });
        }
    }

    // handleSkipTab = (action, apptInfo, target) => {
    //     this.props.skipTab(
    //         target,
    //         {
    //             // stepIndex: index,
    //             patientKey: '',
    //             action,
    //             apptInfo: apptInfo || null

    //         },
    //         true
    //     );
    // };

    missedColumnCount = () => {
        let missedColumns = 0;
        if (!this.props.isShowEncounter){
            missedColumns++;
        }

        return missedColumns;
    }

    getAttendanceTaskItem(idx, item, classes){
        //console.log(JSON.stringify(item));
        // console.log('getAttendanceTaskItem:'+JSON.stringify(item));
        const displayInfectionControl = this.props.selectedFilterInfectionControlDisplay;
        const infectionControlIds = this.props.infectionControlUnavailablePeriodReasons.map(rsn => rsn.unavailPerdRsnId);
        return (
            <React.Fragment >
            {
                item.type == 'A' ? (
                    <TableRow className={classes.tableRow} key={idx} hover onClick={(event) => this.handleClick(event, item)}>
                        <TableCell className={classes.tableCell + ' ' + classes.durCell} align="right">
                            <DtsTimeslotsDurationIcon iconType={item.appointment ? item.appointment.isUrgentSqueeze && item.appointment.isUrgentSqueeze == 1 ? 'isUrgentSqueeze': item.appointment.isUrgent && item.appointment.isUrgent == 1 ? 'isUrgent' : item.appointment.isSqueeze && item.appointment.isSqueeze == 1 ? 'isSqueeze' : 'isNormal' : 'isNormal'} timeslots={dtsUtilities.getAllAppointmentTimeslot(item.appointment)}/>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Typography noWrap>{item.startTime}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell+' '+this.arrOnTime(item.appointment.attendanceBaseVo?.arrivalTime, item.startTime, classes)}>
                            <Typography noWrap>{item.appointment.attendanceBaseVo ? moment(item.appointment.attendanceBaseVo.arrivalTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) : ''}</Typography>
                        </TableCell>
                        {this.props.isShowEncounter ? <TableCell className={classes.tableCell+' '+this.actionTypeClass(item.appointment.encounterBaseVo, classes)} onClick={(e) => this.openEncounter(e, item.appointment)}>
                        </TableCell>:null}
                        <TableCell className={classes.tableCell +' '+ classes.tableCellPatientInfo}>
                            <DtsPatientLink patient={item.appointment.patientDto}/>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            {item.appointment.patientDto.patientReminders && item.appointment.patientDto.patientReminders.length > 0 ? this.getBellIcon(1) : ''}
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Typography noWrap>{this.getPatientStatusDisp(item.appointment.patientDto)}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell+' '+this.checkEcsClass(item.appointment.appointmentECSChk, classes)}>
                            <Typography noWrap>{dtsUtilities.checkEcsStatus(item.appointment.appointmentECSChk)}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                            <OverflowTypography popoverTextProps={{className: classes.popoverText}} noWrap>{item.appointment.encounterTypeDescription}</OverflowTypography>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell+' '+this.checkUrgent(item.appointmentType, classes)}>
                            <Typography noWrap>{item.appointment ? item.appointment.isUrgentSqueeze && item.appointment.isUrgentSqueeze == 1 ? 'Urgent Squeeze-In': item.appointment.isUrgent && item.appointment.isUrgent == 1 ? 'Urgent' : item.appointment.isSqueeze && item.appointment.isSqueeze == 1 ? 'Squeeze-In' : 'Normal' : 'Normal'}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                                <Typography noWrap>{item.appointment.appointmentSpecialRequestVo ? item.appointment.appointmentSpecialRequestVo.remark:''}</Typography>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                                <Typography noWrap>{item.appointment.appointmentJustificationVo ? item.appointment.appointmentJustificationVo.exemptReason : ''}</Typography>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            {this.getTelIcon(item.appointment.remindStatus)}
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Typography noWrap>{item.appointment.attendanceBaseVo ? item.appointment.attendanceBaseVo.discNum : ''}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Typography noWrap>{item.appointment.createByEnglishEngGivenName + ' ' + item.appointment.createByEnglishSurname}</Typography>
                        </TableCell>
                    </TableRow>
                ) :
                item.type == 'U' ? (
                    <TableRow className={classes.tableRow} key={idx} hover onClick={(event) => this.handleClick(event, item)}>
                        <TableCell className={classes.tableCell + ' ' + classes.durCell} align="right">
                            <DtsTimeslotsDurationIcon iconType={item.appointment ? item.appointment.isUrgentSqueeze && item.appointment.isUrgentSqueeze == 1 ? 'isUrgentSqueeze': item.appointment.isUrgent && item.appointment.isUrgent == 1 ? 'isUrgent' : item.appointment.isSqueeze && item.appointment.isSqueeze == 1 ? 'isSqueeze' : 'isNormal' : 'isNormal'} timeslots={item.timeslots}/>
                        </TableCell>
                        <TableCell className={classes.tableCell + ' ' + classes.durCellUnavail}>
                            <Typography noWrap>{item.startTime}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        {this.props.isShowEncounter ? <TableCell className={classes.tableCell}>
                        </TableCell>:null}
                        <TableCell className={classes.tableCell +' '+ classes.tableCellPatientInfo}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                            <OverflowTypography popoverTextProps={{className: classes.popoverText}} noWrap>{item.unavailablePeriods && item.unavailablePeriods.length > 0 ?  _.uniq(item.unavailablePeriods.filter(item => displayInfectionControl ? true:!infectionControlIds.includes(item.unavailablePeriodReasonId)).map((item) => (item.unavailablePeriodReason))).join(', ') : ''}</OverflowTypography>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Typography noWrap>{item.timeslots[0].personType}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                    </TableRow>
                ) : (
                    <TableRow className={classes.tableRow} key={idx} hover onClick={(event) => this.handleClick(event, item)}>
                        <TableCell className={classes.tableCell + ' ' + classes.durCell} align="right">
                            <DtsTimeslotsDurationIcon iconType={item.appointment ? item.appointment.isUrgentSqueeze && item.appointment.isUrgentSqueeze == 1 ? 'isUrgentSqueeze': item.appointment.isUrgent && item.appointment.isUrgent == 1 ? 'isUrgent' : item.appointment.isSqueeze && item.appointment.isSqueeze == 1 ? 'isSqueeze' : 'isNormal' : 'isNormal'} timeslots={item.timeslots}/>
                        </TableCell>
                        <TableCell className={classes.tableCell +' '+this.timeSlotStartTimeClass(item, classes)}>
                            <Typography noWrap>{item.startTime}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        {this.props.isShowEncounter ? <TableCell className={classes.tableCell}>
                        </TableCell>:null}
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell +' '+ classes.tableCellPatientInfo}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Typography noWrap>{item.timeslots[0].personType}</Typography>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            <Grid className={classes.noWrapGrid} item xs zeroMinWidth>
                            <OverflowTypography popoverTextProps={{className: classes.popoverText}} noWrap>{item.timeslots[0].clnEncounterTypeGrpDescriptionDefault}</OverflowTypography>
                            </Grid>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                        </TableCell>
                    </TableRow>
                )
            }
            </React.Fragment>


        );
    }

    render(){
        const { classes, className,  calendarDetailDate, selectedClinic, selectedRoom, roomOfficer, ...rest } = this.props;
        let dailyTaskLabel;
        // let DtsAttendanceTaskListPanel = this;
        dailyTaskLabel = calendarDetailDate && selectedClinic && selectedClinic.clinicCd && selectedRoom && selectedRoom.rmCd ? moment(calendarDetailDate, 'YYYY-MM-DD').format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT) + ' ' + selectedClinic.clinicCd + ' - ' + selectedRoom.rmCd + ' - ' + (roomOfficer && roomOfficer.engGivenName ? roomOfficer.engGivenName :'') + ' '+ (roomOfficer && roomOfficer.engSurname ? roomOfficer.engSurname :'') : '';
        let sessionList = _.uniq(this.props.dailyView.map(item => item.session.sessionDescription.toUpperCase())).sort(
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

        //console.log(JSON.stringify(sessionList));

        return(
        <ValidatorForm ref="AttendanceTaskListForm">
            <Paper className={classes.root + ' ' + className}>
                <Paper>
                    <Grid container spacing={0}>
                        <Grid item xs={6}>
                            <label className={classes.drInfoLabel}  >
                                {/* 28-04-2020(Tue) CWGDC - Surgery 04 - Dr SMO, CHAN */}
                                {dailyTaskLabel}
                            </label>
                        </Grid>
                        <Grid item xs={6}>
                            {/* <div className={classes.sizeIconDiv}>
                                size icon
                            </div> */}
                        </Grid>
                    </Grid>
                </Paper>

                <Table className={classes.table} aria-label="caption table">

                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.headerTableCell +' '+ classes.shortCol} align="right"></TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.shortCol}>Time</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.iconCol}>Arr. Time</TableCell>
                            {this.props.isShowEncounter ? <TableCell className={classes.headerTableCell +' '+ classes.iconCol}>Action</TableCell> : null}
                            <TableCell className={classes.headerTableCell +' '+ classes.longCol}>Patient Info</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.iconCol}></TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.shortCol}>Client Type</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.shortCol}>Ecs</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.longCol}>Enc. Type</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.mediumCol}>Appt. Type</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.mediumCol}>Spec. Req.</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.mediumCol}>Justification</TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.iconCol}></TableCell>
                            <TableCell className={classes.headerTableCell +' '+ classes.shortCol}>Disc Num.</TableCell>
                            <TableCell className={classes.headerTableCell+' '+ classes.mediumCol}>Created By</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            //attendanceTaskList.map((row, idx) => {return this.getAttendanceTaskItem(idx, row, classes);})

                            sessionList.map((session, idx, array) => {
                                return (
                                    <React.Fragment key={'dailyViewSession' + session}>
                                        {
                                            this.props.dailyView
                                            .filter(item => item.session.sessionDescription.toUpperCase() == session)
                                            .filter(this.attendanceFilter)
                                            .map(
                                                (row, idx) => {return this.getAttendanceTaskItem(idx, row, classes);}
                                            )
                                        }
                                        {
                                            (array.indexOf(session) === array.length - 1) ?
                                            (
                                                <TableRow className={classes.tableRowEnd} key={'dailyViewSessionEnd' + session}>
                                                    <TableCell colSpan={15 - this.missedColumnCount()} className={classes.tableCell +' '+ classes.dayEnd} >--- Day End ---</TableCell>
                                                </TableRow>
                                            ) : (
                                                <TableRow className={classes.tableRowSessionBreak} key={'dailyViewSessionSessionBreak' + session}>
                                                    <TableCell colSpan={15 - this.missedColumnCount()} className={classes.tableCellSessionBreak}/>
                                                </TableRow>
                                            )
                                        }
                                    </React.Fragment>
                                );
                            })

                        }

                        {/* <TableRow className={classes.tableRow}>
                            <TableCell colSpan={16} className={classes.tableCell +' '+ classes.dayEnd} >--- Day End ---</TableCell>
                        </TableRow> */}

                    </TableBody>
                </Table>
            </Paper>
        </ValidatorForm>
        );
    }

}

const mapStateToProps = (state) => {
    // console.log('DailyViewList ' + JSON.stringify(state.dtsAppointmentBooking.dailyView));
    return {
        // DailyViewList: state.dtsAppointmentBooking.dailyView
        selectedRoom: state.dtsAppointmentAttendance.selectedRoom,
        selectedClinic: state.dtsAppointmentAttendance.selectedClinic,
        roomList: state.dtsAppointmentAttendance.roomList,
        calendarDetailDate: state.dtsAppointmentAttendance.calendarDetailDate,
        roomOfficer: state.dtsAppointmentAttendance.roomOfficer,
        dailyView: state.dtsAppointmentAttendance.dailyView,
        patientStatusList:state.common.commonCodeList.patient_status,
        selectedFilterClinicalStatus: state.dtsAppointmentAttendance.selectedFilterClinicalStatus,
        selectedFilterEncounterTypeCd: state.dtsAppointmentAttendance.selectedFilterEncounterTypeCd,
        selectedFilterAttendanceStatus: state.dtsAppointmentAttendance.selectedFilterAttendanceStatus,
        selectedFilterInfectionControlDisplay: state.dtsAppointmentAttendance.selectedFilterInfectionControlDisplay,
        loginUserRoleList: state.common.loginUserRoleList,
        infectionControlUnavailablePeriodReasons: state.dtsPreloadData.infectionControlUnavailablePeriodReasons
    };
};

const mapDispatchToProps = {
    getRoomOfficer,
    setPatientKeyNAppointment,
    skipTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAttendanceTaskListPanel));