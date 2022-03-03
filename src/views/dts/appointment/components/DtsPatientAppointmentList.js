import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';
import memoize from 'memoize-one';

import {
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Paper,
    FormControlLabel,
    Switch
} from '@material-ui/core';
import {
    Menu as MenuIcon,
    Print as PrintIcon,
    Phone as PhoneIcon,
    Edit as EditIcon,
    AccessTime as TimeIcon,
    Delete as DeleteIcon,
    MoreVert as SubMenuIcon
} from '@material-ui/icons';
import { connect } from 'react-redux';
import {
    getPatientAppointment,
    setSelectedRescheduleAppointment,
    removeFromReserveList,
    setSelectedDeleteAppointment,
    getAppointmentLog
} from '../../../../store/actions/dts/appointment/bookingAction';
import { getRescheduleReasons } from '../../../../store/actions/appointment/booking/bookingAction';
import moment from 'moment';
import DtsMenuButton from '../../components/DtsMenuButton';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
import DtsAppointmentSlipFormDialog from './DtsAppointmentSlipFormDialog';
import DtsPrintAppointmentLabel from './DtsPrintAppointmentLabel';
import ContactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import { REDIRECT_ACTION_TYPE } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import { setRedirect, dtsUpdateState, dtsGetAppointmentLabel } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import { setSelectedAppointmntTask } from '../../../../store/actions/dts/appointment/attendanceAction';
import Enum from '../../../../enums/enum';
import { DTS_DATE_WEEKDAY_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = {
    root: {
        width: '95%',
        margin: '10px auto auto auto',
        boxShadow: '0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
        // textAlign:'center'
    },
    headerTableCell: {
        borderWidth: '1px 0px',
        fontSize: 13,
        backgroundColor: '#48aeca',
        color: '#fff',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 1
    },
    cellDateTime: {
        maxWidth: '110px',
        width:'110px'
    },
    cellClinic: {
        maxWidth: '80px',
        width:'80px'
    },
    cellSurgery: {
        maxWidth: '80px',
        width:'80px'
    },
    cellEncounter: {
        maxWidth: '210px',
        width:'210px'
    },
    cellButton: {
        maxWidth: '40px',
        width:'40px'
    },
    bobyTableCell: {
        borderWidth: '1px 0px',
        '&.today': {
            backgroundColor: '#ffe9ec'
        },
        '&.endFuture': {
            //borderWidth: '3px 0px 1px 0px',
            //borderTopColor: '#000'
        },
        '&.selectedForReschedule': {
            backgroundColor: '#ccecfc !important'
        },
        '&.deletedAppointment': {
            textDecoration: 'line-through'
        }
    },
    otherSeriveLabel: {
        backgroundColor: '#000',
        color: '#fff',
        fontWeight: 'bold',
        padding: '1px 1px'
    },
    cellFont: {
        fontSize: '13px',
        'white-space': 'pre-line'
    },
    tableLayout: {
        maxHeight: '325px',
        overflowY: 'auto',
        borderCollapse: 'separate'
    },
    apptTitle: {
        margin: 0,
        padding: 2,
        fontSize: 12,
        backgroundColor: '#f3ffff',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '32px'
    },
    buttonFormLabel: {
        position: 'absolute',
        right: '0',
        top: '0'
    },
    appointmentListHeaderDiv: {
        position: 'relative'
    }
};



class DtsPatientAppointmentList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            futureAppointmentListShowDeletedAppointments: false,
            pastAppointmentListShowDeletedAppointments: false
        };

        this.futureAppointmentListViewRef = null;
        this.pastAppointmentListViewRef = null;
        this.futureAppointmentListItemsRef = [];
        this.pastAppointmentListItemsRef = [];

        this.setFutureAppointmentListViewRef = element => {
            if(element){
                this.removeTableViewScrollListener(this.futureAppointmentListViewRef);
                this.futureAppointmentListViewRef = element;
                this.addTableViewScrollListener(element);
            }
        };
        this.setPastAppointmentListViewRef = element => {
            if(element){
                this.removeTableViewScrollListener(this.pastAppointmentListViewRef);
                this.pastAppointmentListViewRef = element;
                this.addTableViewScrollListener(element);
            }
        };
    }

    componentDidMount(prevProps) {
        // console.log('componentDidMount: _.isEmpty(this.props.patientAppointmentList) = '+_.isEmpty(this.props.patientAppointmentList));
        //this.updateAppointmentList(prevProps);
    }

    componentDidUpdate(prevProps) {
        // console.log('componentDidUpdate: _.isEmpty(this.props.patientAppointmentList) = '+_.isEmpty(this.props.patientAppointmentList));
        //this.updateAppointmentList(prevProps);
    }

    componentWillUnmount(prevProps) {
        this.removeTableViewScrollListener();
    }

    // updateAppointmentList = (prevProps) =>{
    //     if (( (!prevProps || prevProps.patient == null) && this.props.patient != null)
    //     || ( (this.props.patient && !prevProps) || (this.props.patient && prevProps && this.props.patient.patientKey != prevProps.patient.patientKey) )
    //     || ( (prevProps && prevProps.patient && this.props.patient.patientKey != prevProps.patient.patientKey)
    //         && this.props.patient && _.isEmpty(this.props.patientAppointmentList) )) {
    //         this.props.getPatientAppointment(
    //             {
    //                 patientKey: this.props.patient.patientKey,
    //                 appointmentDateFrom: dtsUtilities.formatDateParameter(moment().subtract(5, 'years').set('hour', 0).set('minute', 0)),
    //                 appointmentDateTo: dtsUtilities.formatDateParameter(moment().add(5, 'years').set('hour', 23).set('minute', 59))
    //             }
    //         );
    //     }
    // }

    addTableViewScrollListener = (viewRef) => {
        ReactDOM.findDOMNode(viewRef).addEventListener('scroll', (e) => {
            if(viewRef === this.futureAppointmentListViewRef){
                this.futureAppointmentListItemsRef.forEach(itemRef => itemRef.close());
            }
            if(viewRef === this.pastAppointmentListViewRef){
                this.pastAppointmentListItemsRef.forEach(itemRef => itemRef.close());
            }
        });
    }

    removeTableViewScrollListener = (viewRef) => {
        if(viewRef) {
            viewRef.removeEventListener('scroll', null);
        } else {
            if(this.futureAppointmentListViewRef) {
                this.futureAppointmentListViewRef.removeEventListener('scroll', null);
            }
            if(this.pastAppointmentListViewRef) {
                this.pastAppointmentListViewRef.removeEventListener('scroll', null);
            }
        }
    }

    handleRescheduleAppointment = async (appointment) => {
        console.log('handleRescheduleAppointment');
        if (appointment) {
            this.props.setSelectedRescheduleAppointment({ fromAppointment: appointment });
            await this.props.setBookingModeAsync(dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT);
            this.getRescheduleReasonTypeListIfNeeded();
        }
    }

    handleUpdateAppointment = async (appointment) => {
        console.log('handleUpdateAppointment');
        if (appointment) {
            await this.props.setBookingModeAsync(dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT);
            this.props.addToGeneralAppointmentObjList(appointment);
            this.props.appointmentAction();
        }
    }

    dtsAppointmentMenu(appointmentDate, appointment, isFutureAppointment) {
        let timeslots = appointment.appointmentDetlBaseVoList.find(
            d => d.isObsolete == this.isDeletedAppointment(appointment) // Deleted Appointment contains isObs only.
        ).mapAppointmentTimeSlotVosList.map(t => t.timeslotVo).sort((a, b) => a.startTime > b.startTime ? 1 : a.startTime < b.startTime ? -1 : 0);
        let itemListEl = [];
        if (appointmentDate.diff(moment(), 'dates') > 0) { // future appointment
            const edititemListEl = [
                { item: 'Print Appointment List', action: () => { console.log('Print appt click 1'); } },
                { item: 'Print Appointment label', action: () => { console.log('Print appt click 2'); } }
            ];
            if (this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_APPT) {
                edititemListEl.push({ item: 'Reschedule appointment', action: (event) => { event.stopPropagation(); this.handleRescheduleAppointment(appointment); } });
                edititemListEl.push({ item: 'Update Appointment', action: (event) => { event.stopPropagation(); this.handleUpdateAppointment(appointment); } });
            }
            if (appointment.reserve) {
                edititemListEl.push({ item: 'Update Reserve List', action: () => this.props.openReserveListDialogAction(appointment) });
                edititemListEl.push({ item: 'Remove from Reserve List', action: () => this.props.removeFromReserveList(appointment.reserve) });
            } else {
                edititemListEl.push({ item: 'Add to Reserve List', action: () => this.props.openReserveListDialogAction(appointment) });
            }
            itemListEl = [
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<PrintIcon></PrintIcon>}
                            itemListEl={
                                [
                                    {
                                        item: 'Print Appointment List', action: () => {
                                            console.log(appointment);
                                            console.log(appointmentDate);
                                            this.handlePrintApptSlip(appointment, appointmentDate);
                                        }
                                    },
                                    {
                                        item: 'Print Appointment label', action: () => {
                                            console.log('Print appt click 2');
                                            this.handlePrintAppointmentLabel(appointment);
                                        }
                                    }
                                ]}
                        />
                },
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<PhoneIcon></PhoneIcon>}
                            itemListEl={
                                [
                                    { item: 'Contact History', action: () => { console.log('click Contact History'); this.props.openContactHistoryDialogAction(appointment); } },
                                    { item: 'Reminder', action: () => { console.log('click Reminder'); this.props.openContactHistoryDialogAction(appointment); } }
                                ]}
                        />
                },
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<EditIcon></EditIcon>}
                            itemListEl={edititemListEl}
                        />
                },
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<DeleteIcon />}
                            itemListEl={
                                [
                                    { item: 'Delete Appointment', action: () => { this.props.openDeleteAppointmentAction(); this.props.setSelectedDeleteAppointment({ appointment }); } }
                                ]}
                        />
                },
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<SubMenuIcon></SubMenuIcon>}
                            itemListEl={
                                [
                                    { item: 'Appointment Log', action: () => this.props.getAppointmentLog(appointment.appointmentId) },
                                    { item: 'Timeslot Log', action: () => this.props.openTimeslotLogDialogAction(timeslots) }
                                ]}
                        />
                }
            ];
        }
        else {
            itemListEl = [
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<PhoneIcon></PhoneIcon>}
                            itemListEl={
                                [
                                    { item: 'Print Appointment List', action: () => { console.log('Print appt click 1'); } },
                                    { item: 'Print Appointment label', action: () => { console.log('Print appt click 2'); } },
                                    { item: 'Contact History', action: () => { console.log('Print appt click 3'); this.props.openContactHistoryDialogAction(appointment); } }
                                ]}
                        />
                },
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<EditIcon></EditIcon>}
                            itemListEl={
                                [
                                    { item: 'Print Appointment List', action: () => { console.log('Print appt click 1'); } },
                                    { item: 'Print Appointment label', action: () => { console.log('Print appt click 2'); } }
                                ]}
                        />
                },
                {
                    item:
                        <DtsMenuButton
                            buttonEl={<SubMenuIcon></SubMenuIcon>}
                            itemListEl={
                                [
                                    { item: 'Appointment Log', action: () => this.props.getAppointmentLog(appointment.appointmentId) },
                                    { item: 'Timeslot Log', action: () => this.props.openTimeslotLogDialogAction(timeslots) }
                                ]}
                        />
                }
            ];
        }

        return (<DtsMenuButton
            direct={'horizontal'}
            menuButtonSize={'small'}
            buttonEl={<MenuIcon></MenuIcon>}
            itemListEl={itemListEl}
            ref={ref => {
                if(ref){
                    isFutureAppointment ? this.futureAppointmentListItemsRef.push(ref) : this.pastAppointmentListItemsRef.push(ref);
                }
            }}
                />);
    }

    appointmentDateClassExt(appointment, appointmentDate, prevAppointmentDate) {
        let classExt = '';
        classExt += appointmentDate.isSame(moment(), 'day') ? ' today' : prevAppointmentDate && prevAppointmentDate.diff(moment(), 'days') >= 0 && appointmentDate.diff(moment(), 'days') < 0 ? ' endFuture' : '';
        classExt += this.isSelectedRescheduleAppointment(appointmentDate) ? ' selectedForReschedule' : '';
        classExt += this.isDeletedAppointment(appointment) ? ' deletedAppointment' : '';
        return classExt;
    }

    getClinicCd = (siteId) => {
        let result;
        if (this.props.clinicList != null && this.props.clinicList.length > 0) {
            result = this.props.clinicList.find(item => item.siteId === siteId);
            return result.siteCd;
        }
    }

    getSrvCd = (siteId) => {
        let result;
        if (this.props.clinicList != null && this.props.clinicList.length > 0) {
            result = this.props.clinicList.find(item => item.siteId === siteId);
            return result.svcCd;
        }
    }

    getAppointmentStartTime(appointment) {
        let time = moment(_.min(appointment.appointmentDetlBaseVoList.find(
            (d) => (d.isObsolete === this.isDeletedAppointment(appointment)) // Deleted Appointment contains isObs only.
        ).mapAppointmentTimeSlotVosList.filter(
            (d) => (d.isObsolete === this.isDeletedAppointment(appointment))
        ).map(
            (d) => (d.startDtm)
        )));

        return moment(appointment.appointmentDateTime).set({ 'hour': time.get('hour'), 'minute': time.get('minute') });
    }

    getAppointmentEndTime(appointment) {
        let time = moment(_.max(appointment.appointmentDetlBaseVoList.find(
            (d) => (d.isObsolete === this.isDeletedAppointment(appointment)) // Deleted Appointment contains isObs only.
        ).mapAppointmentTimeSlotVosList.filter(
            (d) => (d.isObsolete === this.isDeletedAppointment(appointment))
        ).map(
            (d) => (d.endDtm)
        )));

        return moment(appointment.appointmentDateTime).set({ 'hour': time.get('hour'), 'minute': time.get('minute') });
    }

    isFutureDate(date) {
        if (!(date instanceof moment)){
            date = moment(date);
        }
        return moment().startOf('day').diff(date.startOf('day'), 'days') <= 0;
    }

    getPastAppointmentList = (includeDeletedAppointments) => {
        let pastAppointmentList = this.props.patientAppointmentList.filter(appointment => !this.isFutureDate(appointment.appointmentDateTime));
        if (!includeDeletedAppointments) {
            pastAppointmentList = pastAppointmentList.filter(appointment => appointment.appointmentTypeCode !== dtsBookingConstant.DTS_APPOINTMENT_TYPE_CD_CANCEL);
        }
        return pastAppointmentList
            .sort((a, b) => moment(this.getAppointmentStartTime(a)).diff(moment(this.getAppointmentStartTime(b)), 'minutes'))
            .reverse();
    }

    getFutureAppointmentList = (includeDeletedAppointments) => {
        let futureAppointmentList = this.props.patientAppointmentList.filter(appointment => this.isFutureDate(appointment.appointmentDateTime));
        if (!includeDeletedAppointments) {
            futureAppointmentList = futureAppointmentList.filter(appointment => appointment.appointmentTypeCode !== dtsBookingConstant.DTS_APPOINTMENT_TYPE_CD_CANCEL);
        }
        return futureAppointmentList
            .sort((a, b) => moment(this.getAppointmentStartTime(a)).diff(moment(this.getAppointmentStartTime(b)), 'minutes'));
    }

    isSelectedRescheduleAppointment(appointmentDateTime) {
        if (this.props.selectedRescheduleAppointment == null || this.props.selectedRescheduleAppointment['fromAppointment'] == null) {
            return false;
        }
        let selectedAppointmentDateTime = this.getAppointmentStartTime(this.props.selectedRescheduleAppointment['fromAppointment']);
        return moment(appointmentDateTime).isSame(selectedAppointmentDateTime, 'second');
    }


    unSelectedRescheduleAppointment(appointment) {
        if (this.isSelectedRescheduleAppointment(this.getAppointmentStartTime(appointment))) {
            // Click the selected to unselect.
            this.props.setSelectedRescheduleAppointment(null);
            this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_MODE_APPT);
        }
    }

    getRescheduleReasonTypeListIfNeeded() {
        if (this.props.rescheduleReasonList == null || this.props.rescheduleReasonList.length == 0) {
            this.props.getRescheduleReasons();
        }
    }

    getAppointmentListTableView(appointmentList, isFutureAppointments) {
        const { classes } = this.props;
        let dtsPatientAppointmentList = this;
        return (<Table classes={{ root: classes.tableLayout }}>
            <TableHead>
                <TableRow>
                    <TableCell className={classes.headerTableCell + ' ' + classes.cellDateTime}>Date & Time</TableCell>
                    <TableCell className={classes.headerTableCell + ' ' + classes.cellClinic}>Clinic</TableCell>
                    <TableCell className={classes.headerTableCell + ' ' + classes.cellSurgery}>Surgery</TableCell>
                    <TableCell className={classes.headerTableCell + ' ' + classes.cellEncounter}>Encounter</TableCell>
                    <TableCell className={classes.headerTableCell + ' ' + classes.cellButton}>&nbsp;</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {appointmentList
                    .map(function (item, idx, array) {
                        //let appointmentStartDateTime = moment(item.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList[0].sdtm);
                        let appointmentStartDateTime = dtsPatientAppointmentList.getAppointmentStartTime(item);
                        let appointmentEndDateTime = dtsPatientAppointmentList.getAppointmentEndTime(item);
                        let prevAppointmentStartDate = moment('2999/12/31', 'YYYY/MM/DD');
                        if (idx > 0) {
                            prevAppointmentStartDate = moment(array[idx - 1].appointmentDateTime, 'YYYY-MM-DD');
                        }
                        return (
                            <TableRow key={'patientAppointmentList' + idx} onClick={() => dtsPatientAppointmentList.unSelectedRescheduleAppointment(item)}>
                                <TableCell className={classes.bobyTableCell + (dtsPatientAppointmentList.appointmentDateClassExt(item, appointmentStartDateTime, prevAppointmentStartDate))} >
                                    <Grid className={classes.cellDateTime} item xs zeroMinWidth>
                                        <Typography noWrap className={classes.cellFont}>{appointmentStartDateTime.format(DTS_DATE_WEEKDAY_DISPLAY_FORMAT +'[\n] HH:mm') + '-' + appointmentEndDateTime.format('HH:mm')}</Typography>
                                    </Grid>
                                </TableCell>
                                <TableCell className={classes.bobyTableCell + (dtsPatientAppointmentList.appointmentDateClassExt(item, appointmentStartDateTime, prevAppointmentStartDate))}>
                                    <Grid className={classes.cellClinic} item xs zeroMinWidth>
                                        <Typography noWrap className={classes.cellFont}>{dtsPatientAppointmentList.getClinicCd(item.siteId)}</Typography>
                                    </Grid>
                                </TableCell>
                                <TableCell className={classes.bobyTableCell + (dtsPatientAppointmentList.appointmentDateClassExt(item, appointmentStartDateTime, prevAppointmentStartDate))}>
                                    <Grid className={classes.cellSurgery} item xs zeroMinWidth>
                                        <Typography noWrap className={classes.cellFont}>{item.roomCode}</Typography>
                                    </Grid>
                                </TableCell>
                                <TableCell className={classes.bobyTableCell + (dtsPatientAppointmentList.appointmentDateClassExt(item, appointmentStartDateTime, prevAppointmentStartDate))}>
                                    <Grid className={classes.cellEncounter} item xs zeroMinWidth>
                                        <Typography noWrap className={classes.cellFont}>{item.encounterTypeDescription}</Typography>
                                    </Grid>
                                </TableCell>
                                <TableCell className={classes.bobyTableCell + (dtsPatientAppointmentList.appointmentDateClassExt(item, appointmentStartDateTime, prevAppointmentStartDate))}>
                                    <Grid className={classes.cellButton} item xs zeroMinWidth>
                                        {dtsPatientAppointmentList.getSrvCd(item.siteId) === 'DTS' ? dtsPatientAppointmentList.dtsAppointmentMenu(appointmentStartDateTime, item, isFutureAppointments) : <Grid className={classes.otherSeriveLabel}>{dtsPatientAppointmentList.getSrvCd(item.siteId)}</Grid>}
                                    </Grid>
                                </TableCell>
                            </TableRow>
                        );
                    })}
            </TableBody>
        </Table>);
    }

    isDeletedAppointment(appointment) {
        return appointment.appointmentTypeCode === 'D';
    }

    futureAppointmentListButtonActionForDisplayDeletedAppointment = () => {
        this.setState((prevState) => ({
            futureAppointmentListShowDeletedAppointments: !prevState.futureAppointmentListShowDeletedAppointments
        }));

    }

    pastAppointmentListButtonActionForDisplayDeletedAppointment = () => {
        this.setState((prevState) => ({
            pastAppointmentListShowDeletedAppointments: !prevState.pastAppointmentListShowDeletedAppointments
        }));
    }

    handleOpenDtsPrintAppointmentLabelDialog = () => {
        this.setState({ dtsPrintAppointmentLabelDialogOpen: true });
    }//DH Miki
    handleCloseDtsPrintAppointmentLabelDialog = () => {
        this.setState({ dtsPrintAppointmentLabelDialogOpen: false });
        this.props.dtsUpdateState({ openDtsPrintPmiAppointmentDialog: false, pmiAppointmentLabelData: null });
    }//DH Miki
    handlePrintAppointmentLabel = (appointment) => {
        console.log(appointment);
        if (appointment) {
            this.props.dtsGetAppointmentLabel({
                appointmentDate: dtsUtilities.formatDateChineseDayOfWeekLabel(moment(appointment.appointmentDateTime, 'YYYY-MM-DD')),
                appointmentTime: moment(dtsUtilities.getAppointmentStartTime(appointment)).format(Enum.TIME_FORMAT_12_HOUR_CLOCK),
                encntrTypeDesc: appointment.encounterTypeDescription,
                rmCd: appointment.roomCode,
                engSurname: appointment.patientDto.engSurname,
                engGivename: appointment.patientDto.engGivename,
                otherDocNo: appointment.patientDto.otherDocNo || '0123456789'
            }, this.handleOpenDtsPrintAppointmentLabelDialog);
            this.handleOpenDtsPrintAppointmentLabelDialog();
        }
    }//DH Miki
    handleOpenDtsAppointmentSlipFormDialog = () => {
        this.setState({ dtsAppointmentSlipFormDialogOpen: true });
    };//DH Miki
    handleCloseDtsAppointmentSlipFormDialog = () => {
        this.setState({ dtsAppointmentSlipFormDialogOpen: false });
        this.props.dtsUpdateState({ openDtsAppointmentSlipFormDialog: false, appointmentSlipData: null });
    };//DH Miki
    handlePrintApptSlip = (appointment, appointmentDate) => {
        // console.log(this.getFutureAppointmentList(true));
        // console.log(this.getFutureAppointmentList(false));
        this.props.setSelectedAppointmntTask({ selectedAppointmentTask: appointment });
        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.PRINT_APPOINTMENT_SLIP }); //DH Anthony
        this.handleOpenDtsAppointmentSlipFormDialog(); //DH Anthony
    }; //DH Miki
    getPatientAddress = () => {
        const { rooms, commonCodeList } = this.props;
        memoize((appointment, type) => {
            const _addressList = appointment.patientDto.addressList || [];
            const _address = _addressList.find(item => item.addressTypeCd === type);
            if (_address) {
                const region = ContactInformationEnum.REGION.find(item => item.code === _address.region);
                const district = commonCodeList.district && commonCodeList.district.find(item => item.code === _address.districtCd);
                const subDistrict = commonCodeList.sub_district && commonCodeList.sub_district.find(item => item.code === _address.subDistrictCd);
                const addrType = _address.addressLanguageCd;
                let value;
                let addressArr = [];
                switch (_address.addressFormat) {
                    case ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS: {
                        addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                        if (_address.addressLanguageCd === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                            if (addressArr.length > 0) {
                                value = addressArr.join(', ');
                                value = value.toUpperCase();
                            }
                        } else {
                            if (addressArr.length > 0) {
                                addressArr = addressArr.reverse();
                                value = addressArr.join('');
                            }
                        }
                        break;
                    }
                    case ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS: {
                        value = _address.addrTxt || '';
                        break;
                    }
                    case ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS: {
                        addressArr = PatientUtil.loadPatientAddress(_address, region, district, subDistrict, _address.addressFormat, addrType);
                        if (addressArr.length > 0) {
                            if (addrType === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE) {
                                value = `Postal Box ${addressArr.join(', ')}`;
                            } else {
                                value = `${ContactInformationEnum.FIELD_CHI_LABEL.CONTACT_POSTOFFICE_BOXNO} ${addressArr.join(', ')}`;
                            }
                            // value = addressArr.join(', ');
                        }
                        break;
                    }
                    default: {
                        value = '';
                        break;
                    }
                }
                return value;
            }
            return '';
        });
    };
    render() {
        const { classes, className, dtsPmiAppointmentLabelData, ...rest } = this.props;
        //let dtsPatientAppointmentList = this;
        return (
            (this.props.patient && this.props.patient.patientKey) ? (
                <>
                    <Paper className={classes.root + ' ' + className} >
                        {/* if the version of material-ui/core is higher, we actually can use 'TableContainer' instead of using 'div' here*/}
                        <div className={classes.appointmentListHeaderDiv}>
                            <h4 className={classes.apptTitle}>Appointments on/after today</h4>
                            <FormControlLabel
                                className={classes.buttonFormLabel}
                                control={
                                    <Switch
                                        checked={this.state.futureAppointmentListShowDeletedAppointments}
                                        onChange={this.futureAppointmentListButtonActionForDisplayDeletedAppointment}
                                    />
                                }
                                label="Deleted"
                            />
                        </div>
                        <div className={classes.tableLayout} ref={this.setFutureAppointmentListViewRef}>
                            {this.getAppointmentListTableView(this.getFutureAppointmentList(this.state.futureAppointmentListShowDeletedAppointments), true)}
                        </div>
                        <div className={classes.appointmentListHeaderDiv}>
                            <h4 className={classes.apptTitle}>Appointments before today</h4>
                            <FormControlLabel
                                className={classes.buttonFormLabel}
                                control={
                                    <Switch
                                        checked={this.state.pastAppointmentListShowDeletedAppointments}
                                        onChange={this.pastAppointmentListButtonActionForDisplayDeletedAppointment}
                                    />
                                }
                                label="Deleted"
                            />
                        </div>
                        <div className={classes.tableLayout} ref={this.setPastAppointmentListViewRef}>
                            {this.getAppointmentListTableView(this.getPastAppointmentList(this.state.pastAppointmentListShowDeletedAppointments), false)}
                        </div>
                    </Paper>
                    {this.state.dtsPrintAppointmentLabelDialogOpen && (
                        <DtsPrintAppointmentLabel
                            openConfirmDialog={this.state.dtsPrintAppointmentLabelDialogOpen}
                            closeConfirmDialog={this.handleCloseDtsPrintAppointmentLabelDialog}
                            pmiAppointmentLabelData={dtsPmiAppointmentLabelData}
                        />
                    )}
                    {this.state.dtsAppointmentSlipFormDialogOpen && (
                        <DtsAppointmentSlipFormDialog
                            openConfirmDialog={this.state.dtsAppointmentSlipFormDialogOpen}
                            closeConfirmDialog={this.handleCloseDtsAppointmentSlipFormDialog}
                            appointmentSlipData={this.props.appointmentSlipData}
                            address={this.getPatientAddress(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE)}
                            futureAppointmentList={this.getFutureAppointmentList(false)}
                            selectedAppointmentTask={this.state.selectedAppointmentTask}
                        />
                    )}
                </>
            ) : ''
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        patientAppointmentList: state.dtsAppointmentBooking.pageLevelState.patientAppointmentList,
        clinicList: state.common.clinicList,
        selectedRescheduleAppointment: state.dtsAppointmentBooking.selectedRescheduleAppointment,
        rescheduleReasonList: state.bookingInformation.rescheduleReasonList,
        dtsPmiAppointmentLabelData: state.dtsPatientSummary.pmiAppointmentLabelData,
        appointmentSlipData: state.dtsPatientSummary.appointmentSlipData,
        commonCodeList: state.common.commonCodeList,
        selectedAppointmentTask: state.dtsAppointmentAttendance.selectedAppointmentTask
    };
};

const mapDispatchToProps = {
    getPatientAppointment,
    setSelectedRescheduleAppointment,
    getRescheduleReasons,
    removeFromReserveList,
    setSelectedDeleteAppointment,
    getAppointmentLog,
    dtsGetAppointmentLabel,
    dtsUpdateState,
    setSelectedAppointmntTask,
    setRedirect
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPatientAppointmentList));
