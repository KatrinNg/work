import React from 'react';
import { connect } from 'react-redux';
// import AutoScollTable from '../../../components/Table/AutoScrollTable';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import { Paper } from '@material-ui/core';
import * as AppointmentUtil from '../../../utilities/appointmentUtilities';
import * as CaseNoUtil from '../../../utilities/caseNoUtilities';
import { withStyles } from '@material-ui/core/styles';
import CommomTableToolsBar from '../../compontent/commonTableToolsBar';
import Enum, { SERVICE_CODE } from '../../../enums/enum';
import accessRightEnum from '../../../enums/accessRightEnum';
import { setRedirect, dtsUpdateState, dtsGetAppointmentLabel } from '../../../store/actions/dts/patient/DtsPatientSummaryAction'; //DH Anthony
import { getPatientById as getPatientPanelPatientById, getRedesignPatientAppointment, loadEncounterInfo, updateState, getPatientEncounter, refreshPatient, updateLastCheckDate } from '../../../store/actions/patient/patientAction';
import { markAttendanceForPatientSummary, listAppointmentList } from '../../../store/actions/attendance/attendanceAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import DtsUrgentAppointmentDialog from '../../dts/appointment/components/DtsUrgentAppointmentDialog'; //DH Miki
import DtsGpUrgentAppointmentDialog from '../../dts/appointment/components/DtsGpUrgentAppointmentDialog'; //DH Anthony
import DtsPrintAppointmentLabel from '../../dts/appointment/components/DtsPrintAppointmentLabel'; //DH Anthony
import DtsAppointmentSlipFormDialog from '../../dts/appointment/components/DtsAppointmentSlipFormDialog'; //DH Anthony
import DtsReassignUrgentAppointmentDialog from '../../dts/appointment/components/DtsReassignUrgentAppointmentDialog'; //DH Anthony
import { REDIRECT_ACTION_TYPE } from '../../../enums/dts/patient/DtsPatientSummaryEnum'; //DH Anthony
import { SHS_APPOINTMENT_GROUP } from '../../../enums/appointment/booking/bookingEnum';
import DtsAttendClickDialog from '../../dts/appointment/components/DtsAttendanceConfirmationDialog'; //DH Miki
import moment from 'moment';
import { setPatientKeyNAppointment, setSelectedAppointmntTask, confirmAttendance } from '../../../store/actions/dts/appointment/attendanceAction'; // DH Miki
import _ from 'lodash';
import * as dtsUtilities from '../../../utilities/dtsUtilities'; //DH Justin 2020/09/11
import { getAppointmentLog, getPatientAppointment } from '../../../store/actions/dts/appointment/bookingAction'; //DH Edmund //DH Miki
import { auditAction } from '../../../store/actions/als/logAction';
import CaseIndicatorDialog from './caseIndicatorDialog';
import * as CommonUtil from '../../../utilities/commonUtilities';
import * as dtsBookingConstant from '../../../constants/dts/appointment/DtsBookingConstant';
import { UserUtil, SiteParamsUtil } from '../../../utilities';
import TransferInDialog from '../../appointment/attendance/component/transferInDialog';
import { updateAntInfoInOtherPage } from '../../../utilities/anSvcIdUtilities';
import { showPsoReminder } from '../../../utilities/attendanceUtilities';
import PaymentMsgDialog from '../../appointment/attendance/component/paymentMsgDialog';
import TracingMsgDialog from '../../compontent/tracingMsgDialog';
import ConfirmAtndDialog  from '../../compontent/confirmAtndDialog';

const styles = theme => ({
    paperRoot: {
        backgroundColor: theme.palette.dialogBackground,
        padding: '4px 4px 12px 4px',
        width: '100%',
        height: '100%'
    },
    tableContainer: {
        height: 'auto',
        maxHeight: 165
    },
    tableRowRoot: {
        height: 'unset'
    },
    tableGrid: {
        backgroundColor: theme.palette.white
    },
    iconBtnRoot: {
        padding: 0,
        marginLeft: 4,
        color: theme.palette.white
    },
    buttonRoot: {
        marginLeft: 10,
        marginRight: 5,
        marginTop: 2,
        marginBottom: 2,
        padding: 0,
        height: 35 * theme.palette.unit
    },
    makeApptBtn: {
        marginLeft: 10,
        marginRight: 5,
        marginTop: 2,
        marginBottom: 2,
        padding: '0px 12px',
        height: 35 * theme.palette.unit
    },
    highLineRowRoot: {
        '& td': {
            color: '#0579c8',
            fontStyle: 'italic'
        }
    },
    printApptBtn:{
        marginLeft: 10,
        marginRight: 5,
        marginTop: 2,
        marginBottom: 2,
        height: 35 * theme.palette.unit
    }
});

class ApptDetails extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectIndex: [],
            curSelectedAppt: null,
            dtsUrgentAppointmentDialogOpen: false, //DH Miki
            dtsGpUrgentAppointmentDialogOpen: false, //DH Anthony
            dtsReassignUrgentAppointmentDialogOpen: false, //DH Anthony
            dtsPrintAppointmentSlipDialogOpen: false, //DH Anthony
            dtsAppointmentSlipFormDialogOpen: false, //DH Miki
            dtsPrintAppointmentLabelDialogOpen: false, //DH Anthony
            openAttendanceConfirmDialog: false, //DH Miki
            dtsDtsPrintPmiAddressDialogOpen: false, //DH Miki
            confirmTransferIn: false,
            transferInData: null,
            paymentMsgDialogParams:{
                open:false,
                encounterTypeId:null
            },
            openTracingMsgDialog: false,
            apptInfo: null,
            confirmAtndDialogOpen: false,
            ehsConfirmAttendance: false,
            ehsConfirmAtndData: null
        };
    }

    componentDidUpdate(preProps) {
        if (preProps.appointmentHistory !== this.props.appointmentHistory) {
            if (this.gridColumnApi && this.gridApi) {
                const colIds = this.gridColumnApi.getAllDisplayedColumns().map(col => col.getColId());
                this.gridApi.refreshCells({ columns: colIds, force: true });
            }
        }
    }

    genTools = (isReadOnly) => {
        const { id, classes, isEnableCrossBookClinic, allServiceCheck, serviceCd, siteId, appointmentHistory } = this.props;
        const { curSelectedAppt } = this.state;
        // const apptTimeType = this.apptTimeTpye();
        const notAllowBackTake = curSelectedAppt ? this.isNotAllowBackTake(curSelectedAppt.appointmentDate) : true;
        let isFutureAppt = curSelectedAppt ? AppointmentUtil.isFutureAppointment(curSelectedAppt) : false;
        const attnBtnDisabled = !curSelectedAppt || curSelectedAppt.attnStatusCd === 'Y' || isFutureAppt || serviceCd !== curSelectedAppt.serviceCd || siteId !== curSelectedAppt.siteId;

        const isCrossService = curSelectedAppt && curSelectedAppt.serviceCd !== serviceCd;
        const isAllowBackdateWalkIn = CommonUtil.isHaveAccessRight(accessRightEnum.AllowBackdateWalkIn);
        const isAttendedAppt = AppointmentUtil.isAttendedAppointment(curSelectedAppt && curSelectedAppt.attnStatusCd);
        let tools;
        const printTodayApptDisabled = allServiceCheck || this.getAppointmentList().filter(appt => AppointmentUtil.isTodayAppointment(appt)).length === 0;
        const printMultiApptDisabled = allServiceCheck || this.getAppointmentList().length === 0;

        if(isReadOnly){
            tools = [
                {
                    id: `${id}_apptDetails_allService_chb_tool`,
                    color: 'primary',
                    className: classes.iconBtnRoot,
                    func: (...arg) => this.handleAllServiceChange(...arg),
                    label: 'All Services',
                    type: 'checkBox',
                    checked: allServiceCheck
                },{
                    id: `${id}_apptDetails_view_log_btn_tool`,
                    classes: { sizeSmall: classes.buttonRoot },
                    func: this.handleOpenViewLog,
                    label: 'View Log',
                    type: 'button'
                }
            ];
        }else{
            if (serviceCd === 'DTS') {
                tools = [
                    {
                        id: `${id}_apptDetails_allService_chb_tool`,
                        color: 'primary',
                        className: classes.iconBtnRoot,
                        func: (...arg) => this.handleAllServiceChange(...arg),
                        label: 'All Services',
                        type: 'checkBox',
                        checked: allServiceCheck
                    },
                    {
                        id: `${id}_apptDetails_make_appt_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleMakeDtsApptClick,
                        label: 'Make Appt',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_edit_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: () => this.handleEditDtsApptClick(curSelectedAppt.appointmentId), //DH Anthony
                        label: 'Edit',
                        disabled: !curSelectedAppt || curSelectedAppt.attnStatusCd === 'Y' || !(isEnableCrossBookClinic || curSelectedAppt.siteId === this.props.siteId) || isCrossService,
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_make_urg_appt_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleMakeUrgApptClick,
                        disabled: this.urgentAppointmentStatue() == 'D', //DH Edwin
                        label: 'Make Urg Appt',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_make_gp_urg_appt_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleMakeGpUrgApptClick,
                        disabled: this.urgentAppointmentStatue() == 'D', //DH Edwin
                        label: (this.urgentAppointmentStatue() == 'R' ? 'Reassign' : 'Make') + ' GP Urg Appt', //DH Edwin
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_reassign_urg_appt_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: () => this.handleReassignUrgApptClick(curSelectedAppt.appointmentId), //DH Anthony
                        label: 'Reassign Urg Appt',
                        disabled: !curSelectedAppt || isCrossService, //DH Anthony
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_print_appt_slip_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: () => this.handlePrintApptSlip(), //DH Anthony
                        label: 'Print Appt Slip',
                        // disabled: !curSelectedAppt || isCrossService,
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_print_appt_label_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: () => this.handlePrintApptLabel(curSelectedAppt.appointmentId), //DH Anthony
                        label: 'Print Appt Label',
                        disabled: !curSelectedAppt || isCrossService,
                        type: 'button'
                    },
                    // {
                    //     id: `${id}_apptDetails_print_all_appt_btn_tool`,
                    //     classes: { sizeSmall: classes.buttonRoot },
                    //     func: this.handlePrintAllAppt,
                    //     label: 'Print All Appt',
                    //     type: 'button'
                    // },
                    {
                        id: `${id}_apptDetails_view_log_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: this.handleOpenViewLog,
                        label: 'View Log',
                        type: 'button',
                        disabled: !curSelectedAppt || isCrossService
                    },
                    {
                        id: `${id}_apptDetails_attend_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: () => this.handleDtsAttendClick(curSelectedAppt.appointmentId),
                        // dental Anthony sprint 8 2020/09/07 - Start
                        //label: 'Attend',
                        label: curSelectedAppt && curSelectedAppt.attnStatusCd === 'Y' ? 'Revoke' : 'Attend',
                        // dental Anthony sprint 8 2020/09/07 - End
                        disabled: !curSelectedAppt || isCrossService,
                        type: 'button'
                    }
                ];
            } else if (serviceCd === SERVICE_CODE.TBC) {
                tools = [
                    {
                        id: `${id}_apptDetails_allService_chb_tool`,
                        color: 'primary',
                        className: classes.iconBtnRoot,
                        func: (...arg) => this.handleAllServiceChange(...arg),
                        label: 'All Services',
                        type: 'checkBox',
                        checked: allServiceCheck
                    },
                    {
                        id: `${id}_apptDetails_vaccine_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleVaccine,
                        label: 'Vaccination',
                        disabled: !curSelectedAppt || isAttendedAppt===false || serviceCd !== curSelectedAppt.serviceCd,
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_vaccine_walkin_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleWalkIn,
                        label: 'Walk-In Attend',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_edit_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: () => this.handleEditAppt(),
                        label: 'Edit',
                        disabled: !curSelectedAppt || curSelectedAppt.attnStatusCd === 'Y' || !(isEnableCrossBookClinic || curSelectedAppt.siteId === this.props.siteId) || isCrossService,
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_print_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: this.printReportSingleSlip,
                        label: 'Print',
                        disabled: !curSelectedAppt || isCrossService,
                        type: 'button'
                    },
                    // {
                    //     id: `${id}_apptDetails_print_all_btn_tool`,
                    //     classes: {sizeSmall: classes.buttonRoot},
                    //     func: this.printReportMultipleSlip,
                    //     label: 'Print All',
                    //     type: 'button'
                    // },
                    {
                        id: `${id}_apptDetails_view_log_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: this.handleOpenViewLog,
                        label: 'View Log',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_attend_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: ()=>this.handleBeforeAttend(isAttendedAppt),
                        label: 'Attend',
                        disabled: attnBtnDisabled,
                        type: 'button'
                    }
                ];
                if (isAllowBackdateWalkIn) {
                    tools.splice(2, 0, {
                        id: `${id}_apptDetails_backdate_walkIn_attend_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleBackdateWalkIn,
                        label: 'Backdate Walk-in Attend',
                        type: 'button'
                    });
                }
            } else {
                tools = [
                    {
                        id: `${id}_apptDetails_allService_chb_tool`,
                        color: 'primary',
                        className: classes.iconBtnRoot,
                        func: (...arg) => this.handleAllServiceChange(...arg),
                        label: 'All Services',
                        type: 'checkBox',
                        checked: allServiceCheck
                    },
                    {
                        id: `${id}_apptDetails_walkIn_attend_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleWalkIn,
                        label: 'Walk-In Attend',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_make_appt_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleMakeApptClick,
                        label: 'Make Appointment',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_edit_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: () => this.handleEditAppt(),
                        label: 'Edit',
                        disabled: !curSelectedAppt || curSelectedAppt.attnStatusCd === 'Y' || !(isEnableCrossBookClinic || curSelectedAppt.siteId === this.props.siteId) || isCrossService,
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_print_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: this.printReportSingleSlip,
                        label: 'Print',
                        disabled: !curSelectedAppt || isCrossService,
                        type: 'button'
                    },
                    // {
                    //     id: `${id}_apptDetails_print_all_btn_tool`,
                    //     classes: {sizeSmall: classes.buttonRoot},
                    //     func: this.printReportMultipleSlip,
                    //     label: 'Print All',
                    //     type: 'button'
                    // },
                    {
                        id: `${id}_apptDetails_view_log_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: this.handleOpenViewLog,
                        label: 'View Log',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_attend_btn_tool`,
                        classes: { sizeSmall: classes.buttonRoot },
                        func: ()=>this.handleBeforeAttend(isAttendedAppt),
                        label: 'Attend',
                        disabled: attnBtnDisabled,
                        type: 'button'
                    }
                ];
                if(serviceCd === 'SPP'){
                    tools.splice(6, 0,  {
                        id: `${id}_apptDetails_print_today_appt_slip_btn_tool`,
                        classes: { sizeSmall: classes.printApptBtn },
                        func: this.handlePrintTodayAppt,
                        disabled: printTodayApptDisabled,
                        label: 'Print Today Appt',
                        type: 'button'
                    },
                    {
                        id: `${id}_apptDetails_print_multi_appt_slip_btn_tool`,
                        classes: { sizeSmall: classes.printApptBtn },
                        func: this.handlePrintMultiApptSlip,
                        disabled: printMultiApptDisabled,
                        label: 'Print Multi Appt',
                        type: 'button'
                    });
                }
                if (isAllowBackdateWalkIn) {
                    tools.splice(1, 0, {
                        id: `${id}_apptDetails_backdate_walkIn_attend_btn_tool`,
                        classes: { sizeSmall: classes.makeApptBtn },
                        func: this.handleBackdateWalkIn,
                        label: 'Backdate Walk-in Attend',
                        type: 'button'
                    });
                }
            }
        }



        return tools;
    };

    isNotAllowBackTake = pastApptDate => {
        const { clinicConfig } = this.props;
        const where = { svcCd: this.props.serviceCd, siteId: this.props.siteId };
        // let allowBackTakeDay = AppointmentUtilities.getAllowBackTakeDay(clinicConfig, where, pastApptDate);
        let notAllowBackTake = AppointmentUtil.isExpiryAllowBackTakeDate(clinicConfig, where, pastApptDate);
        return notAllowBackTake;
    };
    // Commented by DH Tony 20200921 - start
    // checkEcsStatus = checkEcsStatus => {
    //     console.log('check ecs status');
    //     console.log(checkEcsStatus);
    //     if (checkEcsStatus) {
    //         if (checkEcsStatus.isValid) {
    //             if (checkEcsStatus.eligibleDental1 == 'Y' || checkEcsStatus.eligibleDental2 == 'Y') {
    //                 return 'Y';
    //             } else {
    //                 return 'N';
    //             }
    //         } else {
    //             return '?';
    //         }
    //     } else {
    //         return '';
    //     }
    // };
    // Commented by DH Tony 20200921 - end
    handleAllServiceChange = (e, checked) => {
        this.resetSelected();
        this.props.setAllServiceCheck(checked);
    };

    resetSelected = () => {
        this.gridApi.deselectAll();
    };

    handleMakeApptClick = () => {
        this.props.auditAction('Appointment Detail Click Make Appointment Button', null, null, false, 'ana');
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            this.props.handleSkipTab('newBook', null, accessRightEnum.booking);
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    };

    handleMakeDtsApptClick = () => {
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.MAKE_APPOINTMENT });
            this.props.handleAddTab(accessRightEnum.DtsBooking);
        }
    }; //DH Anthony

    handleEditDtsApptClick = appointmentId => {
        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.EDIT_APPOINTMENT, appointmentId: appointmentId });
        this.props.handleAddTab(accessRightEnum.DtsBooking);
    }; //DH Anthony

    handleMakeUrgApptClick = () => {
        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.URGENT_APPOINTMENT });
        this.handleOpenDtsUrgentAppointmentDialog();
    }; //DH Anthony

    handleMakeGpUrgApptClick = () => {
        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.GP_URGENT_APPOINTMENT });
        this.handleOpenDtsGpUrgentAppointmentDialog();
    }; //DH Anthony

    handleReassignUrgApptClick = appointmentId => {
        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.REASSIGN_URGENT_APPOINTMENT, appointmentId: appointmentId }); //DH Anthony
        this.handleOpenDtsReassignUrgentAppointmentDialog(); //DH Anthony
    }; //DH Miki

    // handlePrintApptSlip = appointmentId => {
    handlePrintApptSlip = (callback = null) => {
        // const { curSelectedAppt } = this.state;
        if (this.props.patient != null) {
            this.props.getPatientAppointment(
                {
                    patientKey: this.props.patient.patientKey,
                    appointmentDateFrom: dtsUtilities.formatDateParameter(moment().subtract(5, 'years').set('hour', 0).set('minute', 0)),
                    appointmentDateTo: dtsUtilities.formatDateParameter(moment().add(5, 'years').set('hour', 23).set('minute', 59)),
                    includeDeletedAppointments: 1
                }
                , callback
            );
        }
        let _appointmentList = this.getAppointmentList();
        this.props.setSelectedAppointmntTask({ selectedAppointmentTask: _appointmentList[0] || [] });
        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.PRINT_APPOINTMENT_SLIP }); //DH Anthony
        this.handleOpenDtsAppointmentSlipFormDialog(); //DH Anthony
    }; //DH Miki sprint 11 update

    isFutureDate(date) {
        if (!(date instanceof moment)) {
            date = moment(date);
        }
        return moment().startOf('day').diff(date.startOf('day'), 'days') <= 0;
    }//DH Miki sprint 11 update

    isDeletedAppointment(appointment) {
        return appointment.appointmentTypeCode === 'D';
    }//DH Miki sprint 11 update

    getAppointmentStartTime(appointment) {
        let time = moment(_.min(appointment.appointmentDetlBaseVoList.find(
            (d) => (d.isObsolete === this.isDeletedAppointment(appointment)) // Deleted Appointment contains isObs only.
        ).mapAppointmentTimeSlotVosList.filter(
            (d) => (d.isObsolete === this.isDeletedAppointment(appointment))
        ).map(
            (d) => (d.startDtm)
        )));

        return moment(appointment.appointmentDateTime).set({ 'hour': time.get('hour'), 'minute': time.get('minute') });
    }//DH Miki sprint 11 update

    getFutureAppointmentList = (includeDeletedAppointments) => {
        let futureAppointmentList = this.props.patientAppointmentList.filter(appointment => this.isFutureDate(appointment.appointmentDateTime));
        if (!includeDeletedAppointments) {
            futureAppointmentList = futureAppointmentList.filter(appointment => appointment.appointmentTypeCode !== dtsBookingConstant.DTS_APPOINTMENT_TYPE_CD_CANCEL);
        }
        return futureAppointmentList
            .sort((a, b) => moment(this.getAppointmentStartTime(a)).diff(moment(this.getAppointmentStartTime(b)), 'minutes'));
    }//DH Miki sprint 11 update

    // dental Miki sprint 8 2020/08/20 - Start
    handlePrintApptLabel = appointmentId => {
        const { curSelectedAppt } = this.state;
        console.log(curSelectedAppt);
        this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.PRINT_APPOINTMENT_LABEL, appointmentId: appointmentId }); //DH Anthony
        this.props.setSelectedAppointmntTask({
            selectedAppointmentTask: curSelectedAppt
        });
        // let tempDate = curSelectedAppt.appointmentDate + ''; //DH Justin 2020/09/11 - Start (DateFormat method move to dtsUtilities)
        this.props.dtsGetAppointmentLabel({
            appointmentDate: dtsUtilities.formatDateChineseDayOfWeekLabel(moment(curSelectedAppt.appointmentDate, 'YYYY-MM-DD')),
            appointmentTime: moment(curSelectedAppt.appointmentTime, 'HH:mm').format(Enum.TIME_FORMAT_12_HOUR_CLOCK), //DH Justin 2020/09/11 - End
            encntrTypeDesc: curSelectedAppt.encntrTypeCd,
            rmCd: curSelectedAppt.rmCd,
            engSurname: this.props.patient.engSurname,
            engGivename: this.props.patient.engGivename,
            otherDocNo: this.props.patient.otherDocNo || '0123456789'
        });
        this.handleOpenDtsPrintAppointmentLabelDialog();
    };
    // dental Miki sprint 8 2020/08/20 - END
    handleDtsAttendClick = appointmentId => {
        const { curSelectedAppt } = this.state;

        if (curSelectedAppt.attnStatusCd === 'Y') {
            this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.REVOKE_APPOINTMENT, appointmentId: appointmentId });
            this.props.setPatientKeyNAppointment({
                patientKey: this.props.patient.patientKey,
                selectedAppointmentTask: curSelectedAppt
            });
            this.handleOpenDtsAttendanceConfirmDialog();
        } else {
            this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.ATTEND_APPOINTMENT, appointmentId: appointmentId });
            // console.log('check ecs status : ' + this.checkEcsStatus(this.props.selectedPatientEcsStatus)); // commented by DH tony 20200921
            let ecsResult = dtsUtilities.checkEcsStatus(this.props.selectedPatientEcsStatus); // DH tony 20200921
            //if (dtsUtilities.checkEcsStatus(this.props.selectedPatientEcsStatus) == 'N' || dtsUtilities.checkEcsStatus(this.props.selectedPatientEcsStatus) == '?') { commented by DH tony 20200921
            if (!dtsUtilities.isEcsPassed(ecsResult)) {
                this.props.setPatientKeyNAppointment({
                    patientKey: this.props.patient.patientKey,
                    selectedAppointmentTask: curSelectedAppt,
                    selectedPatientEcsResult: ecsResult // this.checkEcsStatus(this.props.selectedPatientEcsStatus) // Change by DH tony 20200921
                });
                this.handleOpenDtsAttendanceConfirmDialog();
            } else {
                this.props.confirmAttendance(
                    {
                        byPassWarning: false,
                        apptId: curSelectedAppt.appointmentId,
                        apptVersion: moment(curSelectedAppt.version).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
                        atndSrc: 'C',
                        discNum: '',
                        isRealtime: true,
                        patientKey: this.props.patient.patientKey,
                        siteId: curSelectedAppt.siteId,
                        //                        svcCd: 'DTS',
                        isEcsResultNo: !dtsUtilities.isEcsPassed(ecsResult), // this.checkEcsStatus(this.props.selectedPatientEcsStatus) == 'N' ? true : false, // Change by DH tony 20200921
                        ecsReasonCode: '',
                        ecsReasonRemarks: ''
                    },
                    [this.props.refreshApptList],
                    true
                );
            }
        }
    }; // DH Miki

    handleEditAppt = (appt = null) => {
        this.props.auditAction('Appointment Detail Click Edit Appointment Button', null, null, false, 'ana');
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            const { curSelectedAppt } = this.state;
            const { caseNoInfo, serviceCd, patient } = this.props;

            let apptInfo = appt ? appt : curSelectedAppt;
            const isOtherEncntrGrpAppt = AppointmentUtil.checkIsOtherEncntrGrpAppt(caseNoInfo, apptInfo,serviceCd,patient);
            const isTraceAppt = apptInfo.isTrace;
            if (isOtherEncntrGrpAppt) {
                this.props.openCommonMessage({
                    msgCode: '110167'
                });
            } else {
                if (isTraceAppt === 1) {
                    this.setState({ openTracingMsgDialog: true, apptInfo });
                } else {
                    this.props.handleSkipTab('edit', apptInfo, accessRightEnum.booking);
                }
            }

        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    };

    handleBeforeAttend = (isAttendedAppt) => {
        if (!this.state.curSelectedAppt) return;
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            // if (this.props.serviceCd === 'ANT') {
            //     if (this.state.curSelectedAppt.encntrTypeCd === 'ENC_TRANS') {
            //         this.transferIn.doTransferIn();
            //     } else {
            this.handleAttend(isAttendedAppt);
            //     }
            // } else {
            //     this.handleAttend();
            // }
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    };

    handleAttend = (isAttendedAppt) => {
        const { patient, caseNoInfo, patientSvcExist } = this.props;
        const { curSelectedAppt } = this.state;
        // let isUseCaseNo = CommonUtil.isUseCaseNo();
        const isNewToSvcSiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, this.props.siteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, this.props.siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';
        if (patient.idSts === 'N') {
            if (isAttendedAppt===false && ((isNewToSvc === '1' && !patientSvcExist) || isAttenConfirmEcsEligibility === '1')) {
                this.props.updateState({ caseIndicatorInfo: { ...this.props.caseIndicatorInfo, open: true } });
            } else {
                this.checkCaseBeforeTakeAttn(patient, caseNoInfo);
            }
        } else {
            let patientLabel = CommonUtil.getPatientCall();
            this.props.openCommonMessage({
                msgCode: '130209',
                params: [{ name: 'PATIENT_LABEL', value: patientLabel },
                { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
                ]
            });
        }
    }

    handleSubmitCaseIndicator = () => {
        const { patient, caseNoInfo } = this.props;
        // this.markAttendance();
        this.checkCaseBeforeTakeAttn(patient, caseNoInfo);
    }

    checkCaseBeforeTakeAttn = (patient, caseNoInfo) => {
        CaseNoUtil.handleCaseNoBeforeAttend(patient, this.state.curSelectedAppt, this.props.serviceCd, (callbackPara, callbackAction) => {
            if (typeof (callbackPara) !== 'undefined') {
                if (typeof (callbackPara) === 'string') {
                    if (this.state.curSelectedAppt.encntrTypeCd === 'ENC_TRANS' && this.props.serviceCd === 'ANT') {
                        this.transferIn.doTransferIn({ caseNo: callbackPara });
                    } else if (this.props.serviceCd === 'EHS') {
                        this.handleEhsAttendance(callbackPara);
                    } else {
                        this.markAttendance(callbackPara);
                    }
                }
                else {
                    if (callbackPara === null && typeof (callbackAction) === 'string') {
                        if (callbackAction === 'fail') {
                            this.props.openCommonMessage({
                                msgCode: '111015',
                                params: [{ name: 'HEADER', value: 'Attendance' }],
                                btnActions: {
                                }
                            });
                        } else if (callbackAction === 'no active rule') {
                            this.props.openCommonMessage({
                                msgCode: '110166'
                            });
                        }
                    } else if (this.props.serviceCd === 'EHS') {
                        this.handleEhsAttendance(callbackPara);
                    } else {
                        this.markAttendance(callbackPara);
                    }
                }
            } else if (this.props.serviceCd === 'EHS') {
                this.handleEhsAttendance();
            } else {
                this.markAttendance();
            }
        });
    }

    handleEhsAttendance = (callbackPara) => {
        const { patient, siteId } = this.props;
        const { curSelectedAppt } = this.state;
        const checkBeforeAtnd = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'EHS_PMI_INFO_CHECK_BEFORE_ATND');
        const enctrCdArr = ((checkBeforeAtnd && checkBeforeAtnd.configValue) || '').split(',');
        if (enctrCdArr.includes(curSelectedAppt.encounterTypeCd)) {
            if (patient.patientEhsDto && patient.patientEhsDto.lastChkDate && moment().isSame(moment(patient.patientEhsDto.lastChkDate), 'days')) {
                this.setState({confirmAtndDialogOpen:true},()=>{
                    this.confirmAtndRef.doEhsConfirmAtnd({ caseNo: callbackPara });
                });
            } else {
                this.props.openCommonMessage({
                    msgCode: '111018',
                    btnActions: {
                        btn1Click: () => {
                            this.props.updateLastCheckDate( {
                                patientKey: patient.patientKey,
                                lastChkDate: moment().format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                                version: patient.patientEhsDto && patient.patientEhsDto.version
                            } ,()=>{
                                this.props.refreshPatient({isRefreshCaseNo: true, callBack: ()=>{
                                    this.setState({confirmAtndDialogOpen:true},()=>{
                                        this.confirmAtndRef.doEhsConfirmAtnd({ caseNo: callbackPara });
                                    });
                                }});
                            });
                        },
                        btn2Click: () => {
                            new Promise((resolve) => {
                                this.props.closeCommonMessage();
                                resolve();
                            }).then(() => {
                                this.props.skipTab(accessRightEnum.patientSummary);
                            });
                        }
                    }
                });
            }
        } else {
            this.setState({confirmAtndDialogOpen:true},()=>{
                this.confirmAtndRef.doEhsConfirmAtnd({ caseNo: callbackPara });
            });
        }
    }

    markAttendance = (caseNoVal) => {
        const { patientStatus } = this.props.patient;
        const { curSelectedAppt, confirmTransferIn, transferInData } = this.state;
        const { ehsConfirmAttendance, ehsConfirmAtndData } = this.state;
        const { patient, caseNoInfo, siteId, serviceCd, patientSvcExist, caseIndicatorInfo } = this.props;
        const isCaseDto=typeof (caseNoVal)==='object';
        let listApptParams = {
            siteIds: siteId,
            withPMIDetls: false,
            allService: false,
            withShowObsInfomation: false,
            svcCd: serviceCd,
            patientKey: patient.patientKey,
            attnStatusCd: '',
            startDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            endDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE)
        };
        let params = {
            apptId: curSelectedAppt.appointmentId,
            isRealtime: true,
            patientKey: patient.patientKey,
            patientStatusCd: patientStatus,
            //caseNo: curSelectedAppt.caseNo || (caseDto ? null : caseNoInfo.caseNo),
            caseNo: isCaseDto ? null : caseNoVal,
            siteId: siteId,
            svcCd: serviceCd,
            apptVersion: curSelectedAppt.version,
            //caseDto: caseDto || null
            caseDto: isCaseDto ? caseNoVal : null
        };
        const isNewToSvcSiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_NEW_USER_TO_SVC');
        const isAttenConfirmEcsEligibilitySiteParam = CommonUtil.getTopPriorityOfSiteParams(this.props.clinicConfig, this.props.serviceCd, siteId, 'IS_ATND_CONFIRM_ECS_ELIGIBILITY');
        let isNewToSvc = (isNewToSvcSiteParam && isNewToSvcSiteParam.configValue) || '0';
        let isAttenConfirmEcsEligibility = (isAttenConfirmEcsEligibilitySiteParam && isAttenConfirmEcsEligibilitySiteParam.configValue) || '0';

        if ((isNewToSvc === '1') && !patientSvcExist) {
            params.patientSvcSts = caseIndicatorInfo.caseIndicator;
        }
        if ((isAttenConfirmEcsEligibility === '1')) {
            if (caseIndicatorInfo.confirmECSEligibility) {
                params.isRqrCnsltFee = caseIndicatorInfo.confirmECSEligibility === 'C' ? false : true;
                params.isPaidCnsltFee = caseIndicatorInfo.confirmECSEligibility === 'C' ? false : true;
                params.isRqrPrscrbFee = caseIndicatorInfo.confirmECSEligibility === 'C' ? false : true;
                params.isPaidPrscrbFee = caseIndicatorInfo.confirmECSEligibility === 'C' ? false : true;
                params.isQueueProcessed = true;
                params.isEcsElig = caseIndicatorInfo.confirmECSEligibility === 'C' ? true : false;
                params.isFeeSettled = caseIndicatorInfo.confirmECSEligibility === 'C' ? false : true;
            } else {
                params.isRqrCnsltFee = caseIndicatorInfo.caseIndicator === 'C' ? false : true;
                params.isPaidCnsltFee = caseIndicatorInfo.caseIndicator === 'C' ? false : true;
                params.isRqrPrscrbFee = caseIndicatorInfo.caseIndicator === 'C' ? false : true;
                params.isPaidPrscrbFee = caseIndicatorInfo.caseIndicator === 'C' ? false : true;
                params.isQueueProcessed = true;
                params.isEcsElig = caseIndicatorInfo.caseIndicator === 'C' ? true : false;
                params.isFeeSettled = caseIndicatorInfo.caseIndicator === 'C' ? false : true;
            }
        }
        listApptParams.page = 1;
        this.props.auditAction('Appointment Detail Click Attend Button');
        if (ehsConfirmAttendance === true) {
            params.waiverCatgryCd = ehsConfirmAtndData.ehsWaiverCategoryCd;
            params.ehsTeamId = ehsConfirmAtndData.team;
            params.ehsMbrSts = this.props.patient?.ehsMbrSts;
            this.setState({ ehsConfirmAttendance: false, ehsConfirmAtndData: null });
        }
        const fetchMarkAttnd = () => {   
            this.props.markAttendanceForPatientSummary(params, listApptParams, curSelectedAppt, (result) => {
                let caseNo = '';
                if (curSelectedAppt.caseNo) {
                    caseNo = curSelectedAppt.caseNo;
                } else if (result.caseDto) {
                    caseNo = result.caseDto.caseNo || '';
                } else if (result.caseNo) {
                    caseNo = result.caseNo;
                } else if (caseNoInfo.caseNo) {
                    caseNo = caseNoInfo.caseNo;
                }
                if (curSelectedAppt.appointmentId) {
                    this.props.getRedesignPatientAppointment(curSelectedAppt.appointmentId, AppointmentUtil.getSiteCdServiceCdParams(serviceCd, siteId), patient && patient.caseList);
                    this.props.loadEncounterInfo(result.encounter);
                    this.props.getPatientPanelPatientById({
                        patientKey: patient.patientKey,
                        caseNo: caseNo
                    });
                }
                if (serviceCd === 'SHS') {
                    this.updateOpenPaymentMsgParams({ open: true, encounterTypeId: result.encounterTypeId });
                }
                this.props.refreshApptList();
                this.props.checkPatientSvcExits();
                this.resetSelected();
                // this.props.listAppointmentList(listApptParams);
                this.props.updateState({ caseIndicatorInfo: { caseIndicator: '', confirmECSEligibility: '', open: false } });
            });
        };
        if (confirmTransferIn === true) {
            updateAntInfoInOtherPage(transferInData, () => {
                this.props.refreshPatient({
                    isRefreshCaseNo: true
                });
                fetchMarkAttnd();
            });
            this.setState({ confirmTransferIn: false, transferInData: null });
        } else {
            fetchMarkAttnd();
        }
    };

    handleOpenViewLog = () => {
        this.props.auditAction('Appointment Detail Click View Log Button', null, null, false, 'ana');
        //DH Edmund Start
        if (this.props.serviceCd === 'DTS') {
            this.props.getAppointmentLog(this.state.curSelectedAppt.appointmentId);
            return;
        }
        //DH Edmund End
        this.props.openViewLog();
    };

    printReportSingleSlip = () => {
        const { curSelectedAppt } = this.state;
        const { curApptDetail } = curSelectedAppt;
        let reportParam = {
            appointmentId: curSelectedAppt.appointmentId,
            encounterTypeId: curApptDetail.encntrTypeId,
            patientKey: curSelectedAppt.patientKey,
            rmId: curSelectedAppt.rmId,
            siteId: curSelectedAppt.siteId,
            svcCd: curSelectedAppt.serviceCd,
            slipType: 'Single',
            isShowDetail: true
        };
        this.props.auditAction('Appointment Detail Click Print Button');
        this.props.getAppointmentReport(reportParam);
    };

    printReportMultipleSlip = () => {
        const { allServiceCheck } = this.props;
        let reportParam = {
            allService: allServiceCheck,
            clinicCd: this.props.appointmentList[0].clinicCd,
            encounterTypeCd: this.props.appointmentList[0].encounterTypeCd,
            patientKey: this.props.patient.patientKey,
            subEncounterTypeCd: this.props.appointmentList[0].subEncounterTypeCd,
            slipType: 'Multiple',
            allAppointment: true,
            isShowDetail: true
        };
        this.props.getAppointmentReport(reportParam);
    };

    handleOpenDtsUrgentAppointmentDialog = () => {
        this.setState({ dtsUrgentAppointmentDialogOpen: true });
    }; //DH Anthony

    handleCloseDtsUrgentAppointmentDialog = () => {
        this.setState({ dtsUrgentAppointmentDialogOpen: false });
    }; //DH Miki

    handleOpenDtsGpUrgentAppointmentDialog = () => {
        this.setState({ dtsGpUrgentAppointmentDialogOpen: true });
    }; //DH Anthony

    handleCloseDtsGpUrgentAppointmentDialog = () => {
        this.setState({ dtsGpUrgentAppointmentDialogOpen: false });
    }; //DH Anthony

    handleOpenDtsReassignUrgentAppointmentDialog = () => {
        this.setState({ dtsReassignUrgentAppointmentDialogOpen: true });
    }; //DH Anthony

    handleCloseDtsReassignUrgentAppointmentDialog = () => {
        this.setState({ dtsReassignUrgentAppointmentDialogOpen: false });
    }; //DH Anthony

    handleOpenDtsAppointmentSlipFormDialog = () => {
        this.setState({ dtsAppointmentSlipFormDialogOpen: true });
    }; //DH Anthony

    handleCloseDtsAppointmentSlipFormDialog = () => {
        this.setState({ dtsAppointmentSlipFormDialogOpen: false });
        this.props.dtsUpdateState({ openDtsAppointmentSlipFormDialog: false, appointmentSlipData: null });
    }; //DH Anthony

    handleOpenDtsPrintAppointmentLabelDialog = () => {
        this.setState({ dtsPrintAppointmentLabelDialogOpen: true });
    }; //DH Anthony

    handleCloseDtsPrintAppointmentLabelDialog = () => {
        this.setState({ dtsPrintAppointmentLabelDialogOpen: false });
        this.props.dtsUpdateState({ openDtsPrintPmiAppointmentDialog: false, pmiAppointmentLabelData: null }); //DH Miki
    }; //DH Anthony

    handleOpenDtsAttendanceConfirmDialog = () => {
        this.setState({ openAttendanceConfirmDialog: true });
    }; //DH Miki

    handleCloseDtsAttendanceConfirmDialog = () => {
        this.setState({ openAttendanceConfirmDialog: false });
    }; //DH Miki
    getAppointmentList = () => {
        const { clinicList, appointmentHistory } = this.props;
        let appointmentListArr = [];

        for (let i in appointmentHistory) {
            let data = appointmentHistory[i];

            data.apptDateTime = moment(data.apptDateTime).format(Enum.DATE_FORMAT_EYMD_VALUE + ' ' + Enum.TIME_FORMAT_24_HOUR_CLOCK);
            data.createDtm = moment(data.createDtm).format(Enum.DATE_FORMAT_EYMD_VALUE + ' ' + Enum.TIME_FORMAT_24_HOUR_CLOCK);

            const clinic = clinicList.find(x => x.siteId === data.siteId);
            data.serviceCd = clinic.serviceCd;
            data.clinicName = clinic.clinicName;

            appointmentListArr.push(data);
        }
        appointmentListArr.sort((a, b) => {
            if (
                moment(a.apptDateTime, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`).isAfter(
                    moment(b.apptDateTime, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`)
                )
            ) {
                return 1;
            } else if (
                moment(a.apptDateTime, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`).isBefore(
                    moment(b.apptDateTime, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`)
                )
            ) {
                return -1;
            }
        });
        return appointmentListArr;
    };

    getWeekDay = weekDay => {
        let engWeekDay = '';
        if (weekDay == '0') {
            engWeekDay = 'Sun';
        }
        if (weekDay == '1') {
            engWeekDay = 'Mon';
        }
        if (weekDay == '2') {
            engWeekDay = 'Tue';
        }
        if (weekDay == '3') {
            engWeekDay = 'Wed';
        }
        if (weekDay == '4') {
            engWeekDay = 'Thur';
        }
        if (weekDay == '5') {
            engWeekDay = 'Fri';
        }
        if (weekDay == '6') {
            engWeekDay = 'Sat';
        }
        return engWeekDay;
    };

    getWeekDay = weekDay => {
        let engWeekDay = '';
        if (weekDay == '0') {
            engWeekDay = 'Sun';
        }
        if (weekDay == '1') {
            engWeekDay = 'Mon';
        }
        if (weekDay == '2') {
            engWeekDay = 'Tue';
        }
        if (weekDay == '3') {
            engWeekDay = 'Wed';
        }
        if (weekDay == '4') {
            engWeekDay = 'Thur';
        }
        if (weekDay == '5') {
            engWeekDay = 'Fri';
        }
        if (weekDay == '6') {
            engWeekDay = 'Sat';
        }
        return engWeekDay;
    };

    getAppointmentColumn = () => {
        const {
            isClinicalUser,
            serviceCd,
            quotaConfig,
            listConfig,
            loginInfo,
            siteId,
            siteParams
        } = this.props;
        let columnDefs = [];
        const isCimsCounterBaseRole = UserUtil.hasSpecificRole(loginInfo.userDto, 'CIMS-COUNTER');
        if (listConfig && listConfig.APPT_DETAILS) {
            let listConfigHandledCaseNo = CaseNoUtil.handleCaseNoSection(listConfig.APPT_DETAILS, 'labelCd', 'caseNo');
            const list = listConfigHandledCaseNo.sort(function (a, b) {
                return b.site - a.site || a.displayOrder - b.displayOrder;
            });
            columnDefs.push({
                headerName: '',
                colId: 'index',
                valueGetter: params => params.node.rowIndex + 1,
                minWidth: 55,
                maxWidth: 55,
                filter: false
            });
            for (let i = 0; i < list.length; i++) {
                const { labelCd, labelName, labelLength, site } = list[i];
                let col = {
                    headerName: labelName,
                    minWidth: labelLength,
                    field: labelCd
                };
                switch (labelName) {
                    case 'Clinic / Unit':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd && isCimsCounterBaseRole) {
                                    return 'DH Clinic';
                                }
                                return params.value;
                            }
                        };
                        break;
                    case 'Clinic':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd && isCimsCounterBaseRole) {
                                    return 'DH Clinic';
                                }
                                return params.value;
                            }
                        };
                        break;
                    case 'Surgery':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd && isCimsCounterBaseRole) {
                                    return 'DH Clinic';
                                }
                                return params.value;
                            }
                        };
                        break;
                    case 'Date':
                        col = {
                            ...col,
                            valueFormatter: params => moment(params.value, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`).format(Enum.DATE_FORMAT_EDMY_VALUE)
                        };
                        break;
                    case 'Weekday':
                        col = {
                            ...col,
                            valueFormatter: params => this.getWeekDay(moment(params.value, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`).weekday())
                        };
                        break;
                    case 'Time':
                        col = {
                            ...col,
                            valueFormatter: params => moment(params.value, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
                        };
                        break;
                    case 'Encounter Type':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd && isCimsCounterBaseRole) {
                                    return '--';
                                }
                                return params.value;
                            }
                        };
                        break;
                    case 'Spec. Rqst':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (isCimsCounterBaseRole && serviceCd !== params.data.serviceCd) {
                                    return '';
                                }
                                return params.data.specialRqstDto ? params.data.specialRqstDto.remark : '';
                            }
                        };
                        break;
                    case 'Service':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd && isCimsCounterBaseRole) {
                                    return 'DH';
                                }
                                return params.value;
                            }
                        };
                        break;
                    case 'Arrival Time':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (params.value) {
                                    return moment(params.value).format(Enum.DATE_FORMAT_24_HOUR);
                                } else {
                                    return '';
                                }
                            }
                        };
                        break;
                    case 'Arrival Date/Time':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (params.value) {
                                    return moment(params.value).format(Enum.DATE_FORMAT_24_HOUR);
                                } else {
                                    return '';
                                }
                            }
                        };
                        break;
                    case 'Appt. Date/Time':
                        col = {
                            ...col,
                            valueFormatter: params => moment(params.value, `${Enum.DATE_FORMAT_EYMD_VALUE} ${Enum.TIME_FORMAT_24_HOUR_CLOCK}`).format(Enum.DATE_FORMAT_24_HOUR)
                        };
                        break;
                    case 'Room':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd) {
                                    return '--';
                                }
                                return params.value;
                            }
                        };
                        break;
                    case 'Quota Type':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd) {
                                    return '--';
                                }
                                const qtType = params.data.curApptDetail.mapAppointmentTimeSlotVosList[0]?.qtType;
                                if (qtType) {
                                    let means = quotaConfig && quotaConfig.length > 0 && quotaConfig[0][_.toLower(qtType) + 'Name'];
                                    return means;
                                } else {
                                    return 'Counter';
                                }

                            }
                        };
                        break;
                    case 'Attn.':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                // if (params.value === Enum.ATTENDANCE_STATUS.ATTENDED) {
                                //     return 'Attended';
                                // } else if (params.value === Enum.ATTENDANCE_STATUS.NOT_ATTEND || '') {
                                //     if (params.data.arrivalTime) {
                                //         return 'Arrived';
                                //     } else {
                                //         return '';
                                //     }
                                // }
                                return AppointmentUtil.getAppointmentRecordStatus(params.value, params.data.arrivalTime);
                            }
                        };
                        break;
                    case 'Case No.':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd !== params.data.serviceCd) {
                                    return '--';
                                }
                                // if (SiteParamsUtil.getIsPMICaseNoAliasGen(siteParams, serviceCd, siteId)) {
                                //     return params.data.alias;
                                // } else {
                                //     return CaseNoUtil.getFormatCaseNo(params.value);
                                // }
                                return CaseNoUtil.getCaseAlias(params.data);
                            }
                        };
                        break;
                    case 'Length (mins)':
                        col = {
                            ...col,
                            valueFormatter: params => {
                                if (serviceCd == 'DTS') {
                                    return dtsUtilities.getAppointmentDuration(params.data, true);
                                }
                                // return AppointmentUtil.compareMinuteTime(params.data.curApptDetail.mapAppointmentTimeSlotVosList[0]?.edtm, params.data.curApptDetail.mapAppointmentTimeSlotVosList[0]?.sdtm);
                                return (params.data.apptDateTime && params.data.apptDateEndTime) ? AppointmentUtil.compareMinuteTime(params.data.apptDateEndTime, params.data.apptDateTime) : '';
                            }
                        };
                        break;
                }
                columnDefs.push(col);
            }
        }
        return columnDefs;
    };

    /*
     * code return : D, I, R
     * D = disable urgent function
     * I = allow insert urgent appointment
     * R = allow reassign urgent appointment
     */
    //DH Edwin
    urgentAppointmentStatue = () => {
        let urgentFoundToday = false;
        let output = '';
        if (Array.isArray(this.props.appointmentHistory)) {
            this.props.appointmentHistory.forEach(appt => {
                if (moment(appt.appointmentDate, 'YYYY-MM-DD').format('YYYYMMDD') == moment().format('YYYYMMDD')) {
                    // console.log(JSON.stringify(appt));
                    if (appt.isUrgSqueeze == 1) {
                        urgentFoundToday = true;
                        if (appt.encounterBaseVo.encntrSts == 'N') {
                            output = 'R';
                        }
                    }
                }
            });
        }
        if (output != '') {
            // console.log(output);
            return output;
        } else if (urgentFoundToday) {
            // console.log('D');
            return 'D';
        } else {
            // console.log('I');
            return 'I';
        }
    };
    //DH Edwin

    handleVaccine = () => {
        if (this.state.curSelectedAppt && this.state.curSelectedAppt.appointmentId) {
            this.props.auditAction('Appointment Detail Click Vaccine Button', null, null, false, 'ana');
            this.props.getPatientEncounter(this.state.curSelectedAppt.appointmentId);
            this.props.handleSkipTab('vaccine', null, accessRightEnum.vaccination);
        }
    }

    handleWalkIn = () => {
        this.props.auditAction('Appointment Detail Click Walk-In Attend Button', null, null, false, 'ana');
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            this.props.handleSkipTab('walkIn', null, accessRightEnum.booking);
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    }

    handleBackdateWalkIn = () => {
        this.props.auditAction('Appointment Detail Click Backdate Walk-In Attend Button', null, null, false, 'ana');
        if (this.props.patient && this.props.patient.patientKey && !parseInt(this.props.patient.deadInd)) {
            if (this.props.patient.idSts === 'N') {
                this.props.handleSkipTab('backdateWalkIn', null, accessRightEnum.booking);
            } else {
                let patientLabel = CommonUtil.getPatientCall();
                this.props.openCommonMessage({
                    msgCode: '130209',
                    params: [{ name: 'PATIENT_LABEL', value: patientLabel },
                    { name: 'PATIENT_LABEL_LOWERCASE', value: patientLabel.toLowerCase() }
                    ]
                });
            }
        } else {
            this.props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    }

    confirmTransferIn = (transferInData, transferInInputParams) => {
        this.setState({ confirmTransferIn: true, transferInData });
        this.markAttendance(transferInInputParams.caseNo);
    }

    updateOpenPaymentMsgParams = (params) => {
        let paymentMsgDialogParams = _.cloneDeep(this.state.paymentMsgDialogParams);
        for (let name in params) {
            paymentMsgDialogParams[name] = params[name];
        }
        this.setState({ paymentMsgDialogParams });
    }

    handlePaymentMsgDialogOk = () => {
        let paymentMsgDialogParams = _.cloneDeep(this.state.paymentMsgDialogParams);
        paymentMsgDialogParams.open = false;
        this.setState({ paymentMsgDialogParams }, () => {
            showPsoReminder(this.props.patient);
        });
    }

    handleTracingMsgDialogOk = () => {
        const { apptInfo } = this.state;
        this.setState({ openTracingMsgDialog: false });
        this.props.handleSkipTab('edit', apptInfo, accessRightEnum.booking);
    }

    handlePrintTodayAppt = () => {
        let reportParam = {
            svcCd: this.props.serviceCd,
            allAppointment: false,
            siteId: this.props.siteId,
            patientKey: this.props.patient.patientKey
        };
        this.props.getSppApptSlipReport(reportParam);
    }

    handlePrintMultiApptSlip = () => {
        let reportParam = {
            svcCd: this.props.serviceCd,
            allAppointment: true,
            siteId: this.props.siteId,
            patientKey: this.props.patient.patientKey
        };
        this.props.getSppApptSlipReport(reportParam);
    }

    hanldeEHSConfirmAttendance = (ehsConfirmAtndInputParams, ehsConfirmAtndData) => {
        this.setState({ ehsConfirmAttendance: true, ehsConfirmAtndData });
        this.markAttendance(ehsConfirmAtndInputParams.caseNo);
        this.setState({ confirmAtndDialogOpen: false });
    }

    render() {
        const { id, classes, address, appointmentSlipData, dtsPmiAppointmentLabelData, serviceCd, caseIndicatorInfo, loginInfo, isReadOnly } = this.props; //DH Miki
        const tools = this.genTools(isReadOnly);
        const { paymentMsgDialogParams, openTracingMsgDialog, confirmAtndDialogOpen } = this.state;
        //ascending order of Appt. Date/Time
        let _appointmentList = this.getAppointmentList();
        let _columnDef = this.getAppointmentColumn();

        return (
            <>
                <Paper className={classes.paperRoot}>
                    <CommomTableToolsBar id={`${id}_apptDetail_toolsBar`} tools={tools} labelArr={['Appointment Details']} />
                    <CIMSDataGrid
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '15vh'
                        }}
                        gridOptions={{
                            rowHeight: 35,
                            columnDefs: _columnDef,
                            rowData: _appointmentList,
                            getRowNodeId: data => data.appointmentId,
                            onGridReady: params => {
                                this.gridApi = params.api;
                                this.gridColumnApi = params.columnApi;
                            },
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            onRowClicked: () => { },
                            onSelectionChanged: params => {
                                if (params) {
                                    const selectedRows = params.api.getSelectedRows();
                                    this.setState({ curSelectedAppt: selectedRows ? selectedRows[0] : null });
                                }
                            },
                            onRowDataUpdated: event => this.setState({ curSelectedAppt: event?.api?.getSelectedRows()?.[0] }), //DH Edmund
                            onRowDoubleClicked: params => {
                                // dental Anthony sprint 8 2020/09/07 - Start
                                // const attnStatus = params.data.attnStatusCd;
                                // if (attnStatus !== 'Y' && (this.props.isEnableCrossBookClinic || params.data.siteId === this.props.siteId)) {
                                //     this.handleEditAppt(params.data);
                                // }
                                if (serviceCd === 'DTS') {
                                    // this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.MAKE_APPOINTMENT, appointmentId: params.data.appointmentId });
                                    // this.props.handleAddTab(accessRightEnum.DtsBooking);
                                    this.props.handleSkipTabForDts(
                                        accessRightEnum.DtsBooking,
                                        {
                                            paramFrom: 'patientSummary',
                                            action: 'showDailyView',
                                            data: params.data
                                        }
                                    );
                                } else {
                                    const attnStatus = params.data.attnStatusCd;
                                    if (attnStatus !== 'Y' && (this.props.isEnableCrossBookClinic || params.data.siteId === this.props.siteId)) {
                                        this.handleEditAppt(params.data);
                                    }
                                }
                                // dental Anthony sprint 8 2020/09/07 - End
                            },
                            getRowStyle: params => {
                                let rowStyle = null;
                                if (params.data.isUnavailAppt !== 1) {
                                    rowStyle = {
                                        backgroundColor: null
                                    };
                                } else {
                                    rowStyle = {
                                        backgroundColor: '#e0e0e0'
                                    };
                                }
                                return rowStyle;
                            },
                            postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                        }}
                        suppressGoToRow
                        suppressDisplayTotal
                    />
                    {/* {_appointmentList &&
                        <Grid container className={classes.tableGrid}>
                            <AutoScollTable
                                columns={tableHeader}
                                store={_appointmentList}
                                classes={{
                                    container: classes.tableContainer,
                                    tableRowRoot: classes.tableRowRoot
                                }}
                                selectIndex={this.state.selectIndex}
                                handleRowClick={this.handleTableRowClick}
                                handleRowDbClick={this.handleRowDbClick}
                            />
                        </Grid>
                    } */}
                </Paper>
                {/* DH Edwin */}
                {this.state.dtsUrgentAppointmentDialogOpen && (
                    <DtsUrgentAppointmentDialog
                        urgentFunctionStatus={this.urgentAppointmentStatue()}
                        sourceFrom={'PatientSummary'}
                        openConfirmDialog={this.state.dtsUrgentAppointmentDialogOpen}
                        closeConfirmDialog={this.handleCloseDtsUrgentAppointmentDialog}
                        callbackList={[this.props.refreshApptList]}
                    />
                )}
                {this.state.dtsGpUrgentAppointmentDialogOpen && (
                    <DtsGpUrgentAppointmentDialog
                        urgentFunctionStatus={this.urgentAppointmentStatue()}
                        sourceFrom={'PatientSummary'}
                        openConfirmDialog={this.state.dtsGpUrgentAppointmentDialogOpen}
                        closeConfirmDialog={this.handleCloseDtsGpUrgentAppointmentDialog}
                        callbackList={[this.props.refreshApptList]}
                    />
                )}
                {/* DH Miki */}
                <DtsReassignUrgentAppointmentDialog openConfirmDialog={this.state.dtsReassignUrgentAppointmentDialogOpen} closeConfirmDialog={this.handleCloseDtsReassignUrgentAppointmentDialog} />
                {/* DH Anthony */}
                {this.state.dtsAppointmentSlipFormDialogOpen && (
                    <DtsAppointmentSlipFormDialog
                        openConfirmDialog={this.state.dtsAppointmentSlipFormDialogOpen}
                        closeConfirmDialog={this.handleCloseDtsAppointmentSlipFormDialog}
                        futureAppointmentList={this.getFutureAppointmentList(false)}
                        appointmentSlipData={appointmentSlipData}
                        selectedAppointmentTask={_appointmentList[0]}
                        address={address}
                    /> //DH Miki sprint 11 update
                )}
                {/* DH Anthony */}
                {this.state.dtsPrintAppointmentLabelDialogOpen && (
                    <DtsPrintAppointmentLabel
                        openConfirmDialog={this.state.dtsPrintAppointmentLabelDialogOpen}
                        closeConfirmDialog={this.handleCloseDtsPrintAppointmentLabelDialog}
                        pmiAppointmentLabelData={dtsPmiAppointmentLabelData}
                    />
                )}
                {this.state.openAttendanceConfirmDialog && (
                    <DtsAttendClickDialog
                        openConfirmDialog={this.state.openAttendanceConfirmDialog}
                        closeConfirmDialog={this.handleCloseDtsAttendanceConfirmDialog}
                        importCallback={this.props.refreshApptList}
                    />
                )}
                {/* DH Miki */}
                {caseIndicatorInfo.open ? <CaseIndicatorDialog handleSubmitCaseIndicator={this.handleSubmitCaseIndicator} /> : null}
                {/**Transfer In */}
                {
                    this.props.serviceCd === 'ANT' && this.props.patient.genderCd === Enum.GENDER_FEMALE_VALUE ?
                        <TransferInDialog
                            innerRef={ref => this.transferIn = ref}
                            confirm={this.confirmTransferIn}
                            auditAction={this.props.auditAction}
                        />
                        : null
                }
                {
                    this.props.serviceCd === 'SHS' && paymentMsgDialogParams.open ?
                        <PaymentMsgDialog
                            id={'back_take_attendance_payment_message_dialog'}
                            paymentMsgDialogParams={paymentMsgDialogParams}
                            handlePaymentMsgDialogOk={this.handlePaymentMsgDialogOk}
                        />
                        : null
                }
                {
                    this.props.serviceCd === 'SHS' && openTracingMsgDialog ?
                        <TracingMsgDialog
                            id={'defaulter_tracing_case_message_dialog'}
                            openTracingMsgDialog={openTracingMsgDialog}
                            handleTracingMsgDialogOk={this.handleTracingMsgDialogOk} 
                        />
                    :null
                }
                {
                    this.props.serviceCd === 'EHS' && confirmAtndDialogOpen ?
                        <ConfirmAtndDialog
                            id={'confirm_attendance'}
                            innerRef={ref => this.confirmAtndRef = ref}
                            confirmAtndDialogOpen={this.state.confirmAtndDialogOpen}
                            confirm={this.hanldeEHSConfirmAttendance}
                            auditAction={this.props.auditAction}
                            closeConfirmAtndDialog={()=>{
                                this.setState({confirmAtndDialogOpen : false});
                            }}
                            currentRmCd={this.state.curSelectedAppt.rmCd}
                        />
                        : null
                }
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        patient: state.patient.patientInfo,
        selectedPatientEcsStatus: state.ecs.selectedPatientEcsStatus, //DH Edwin
        appointmentHistory: state.patient.appointmentHistory,
        dtsPmiAppointmentLabelData: state.dtsPatientSummary.pmiAppointmentLabelData, //DH Miki
        appointmentSlipData: state.dtsPatientSummary.appointmentSlipData, //DH Miki sprint 8
        selectedAppointmentTask: state.dtsAppointmentAttendance.selectedAppointmentTask, //DH Miki
        clinicList: state.common.clinicList,
        caseNoInfo: state.patient.caseNoInfo,
        serviceCd: state.login.service.serviceCd,
        isEnableCrossBookClinic: state.patient.isEnableCrossBookClinic,
        quotaConfig: state.common.quotaConfig,
        siteId: state.login.clinic.siteId,
        listConfig: state.common.listConfig,
        caseIndicatorInfo: state.patient.caseIndicatorInfo,
        loginInfo: state.login.loginInfo,
        patientAppointmentList: state.dtsAppointmentBooking.pageLevelState.patientAppointmentList, //DH Miki
        siteParams: state.common.siteParams
    };
};

const mapDispatchToProps = {
    setRedirect, //DH Anthony
    dtsUpdateState, //DH Anthony
    setPatientKeyNAppointment, //DH Miki
    confirmAttendance, //DH Miki
    setSelectedAppointmntTask, //DH Miki
    dtsGetAppointmentLabel, //DH Miki
    getAppointmentLog, //DH Edmund
    getPatientAppointment, //DH Miki
    listAppointmentList,
    getPatientPanelPatientById,
    getRedesignPatientAppointment,
    loadEncounterInfo,
    openCommonMessage,
    markAttendanceForPatientSummary,
    auditAction,
    updateState,
    getPatientEncounter,
    refreshPatient,
    updateLastCheckDate
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApptDetails));
