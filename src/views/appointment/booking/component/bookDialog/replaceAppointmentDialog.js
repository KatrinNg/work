import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import CIMSDialog from '../../../../../components/Dialog/CIMSDialog';
import { connect } from 'react-redux';
import { Box, withStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import { Grid } from '@material-ui/core';
import moment from 'moment';
import Enum from '../../../../../enums/enum';
import * as CommonUtilities from '../../../../../utilities/commonUtilities';
import * as PatientUtilities from '../../../../../utilities/patientUtilities';
import { BookMeans, PageStatus as pageStatusEnum } from '../../../../../enums/appointment/booking/bookingEnum';
import * as AppointmentUtilities from '../../../../../utilities/appointmentUtilities';
import {auditAction} from '../../../../../store/actions/als/logAction';
import FamilyNumberBtn from '../bookForm/familyMember/FamilyNumberBtn';

const styles = () => ({
    paper: {
        // minWidth: 1600,
        minWidth: '90%',
        maxWidth: '100%',
        overflowY: 'auto',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    textSqueeze: {
        fontWeight: 'bold',
        padding: '25px 0px 25px 0px'
    },
    textSqueeze2: {
        padding: '25px 0px 25px 0px'
    }
});

class replaceAppointmentDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handReplaceAppointmentDialogClose = () => {
        this.props.auditAction('Close Appointment Duplicate Booking Dialog',null,null,false,'ana');
        if(this.props.pageStatus === pageStatusEnum.EDIT){
            this.props.updateState({ openReplaceAppointmentDialog: false });
        } else {
            this.props.resetReplaceAppointment();
            this.props.updateState({ pageStatus: pageStatusEnum.SELECTED });
        }
    }

    render() {
        const { classes, openReplaceAppointmentDialog, replaceAppointmentData, inputPatientInfo,
             quotaConfig, clinicList, svcCd, clinicConfig, isNewReplaceList, isFamilyReplace, familyReplaceAppointmentList, appointmentMode, serviceCd, pageStatus, patientInfo, currentSelectedApptInfo, familyMemberData  } = this.props;

        let dateRender = [];
        let bookedAppointments = 0;
        let replaceApptList = null;
        let cimsOneReplaceApptList = replaceAppointmentData && replaceAppointmentData.cimsOneReplaceList
                ? replaceAppointmentData.cimsOneReplaceList : null;

        if (isNewReplaceList) {
            if (replaceAppointmentData && replaceAppointmentData.replaceApptList) {
                replaceApptList = replaceAppointmentData.replaceApptList;
            }
        } else {
            if (replaceAppointmentData && replaceAppointmentData.bookingData) {
                replaceApptList = replaceAppointmentData.bookingData;
            }
        }

        if (replaceApptList) {
            // For Cims 2 Appt
            for (let i = 0; i < replaceApptList.length; i++) {
                let qtType = '';
                let siteCd = '';
                clinicList.filter(item => item.siteId === replaceApptList[i].siteId).forEach(site => { siteCd = site.siteCd; });
                if (replaceApptList[i].appointmentDetlBaseVoList) {
                    for (let apptDetlLength = 0; apptDetlLength < replaceApptList[i].appointmentDetlBaseVoList.length; apptDetlLength++) {
                        if (replaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList && replaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].isObs === 0) {
                            for (let mapApptLength = 0; mapApptLength < replaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList.length; mapApptLength++) {
                                if (replaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList[mapApptLength].isObs === 0) {
                                    qtType = replaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList[mapApptLength].qtType;
                                }
                            }
                        }
                    }
                }

                let bookingDataInfo = {
                    apptDate: moment(replaceApptList[i].apptDateTime).format(Enum.APPOINTMENT_BOOKING_DATE),
                    startTime: moment(replaceApptList[i].apptDateTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                    // bookingUnit No of the slots ???
                    slots: replaceApptList[i].bookingUnit,
                    site: siteCd,
                    room: replaceApptList[i].rmDesc,
                    patientInfo: inputPatientInfo,
                    means: CommonUtilities.getQuotaTypeDescByQuotaType(quotaConfig, qtType),
                    encType: replaceApptList[i].encntrTypeDesc,
                    apptType: replaceApptList[i].apptTypeCd,
                    isCimsOneAppt: ''
                };
                dateRender.push(bookingDataInfo);
            }
        }

        if (cimsOneReplaceApptList) {
            // For Cims One
            for (let i = 0; i < cimsOneReplaceApptList.length; i++) {
                let qtType = '';
                let siteCd = '';
                clinicList.filter(item => item.siteId === cimsOneReplaceApptList[i].siteId).forEach(site => { siteCd = site.siteCd; });

                if (cimsOneReplaceApptList[i].appointmentDetlBaseVoList) {
                    for (let apptDetlLength = 0; apptDetlLength < cimsOneReplaceApptList[i].appointmentDetlBaseVoList.length; apptDetlLength++) {
                        if (cimsOneReplaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList && cimsOneReplaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].isObs === 0) {
                            for (let mapApptLength = 0; mapApptLength < cimsOneReplaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList.length; mapApptLength++) {
                                if (cimsOneReplaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList[mapApptLength].isObs === 0) {
                                    qtType = cimsOneReplaceApptList[i].appointmentDetlBaseVoList[apptDetlLength].mapAppointmentTimeSlotVosList[mapApptLength].qtType;
                                }
                            }
                        }
                    }
                }

                let bookingDataInfo = {
                    apptDate: moment(cimsOneReplaceApptList[i].apptDateTime).format(Enum.APPOINTMENT_BOOKING_DATE),
                    startTime: moment(cimsOneReplaceApptList[i].apptDateTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                    // bookingUnit No of the slots ???
                    slots: cimsOneReplaceApptList[i].bookingUnit,
                    site: siteCd,
                    room: cimsOneReplaceApptList[i].rmDesc,
                    patientInfo: inputPatientInfo,
                    means: qtType,
                    encType: cimsOneReplaceApptList[i].encntrTypeDesc,
                    apptType: cimsOneReplaceApptList[i].apptTypeCd,
                    isCimsOneAppt: 'Y'
                };
                dateRender.push(bookingDataInfo);
            }
        }

        bookedAppointments = isFamilyReplace ? familyReplaceAppointmentList.length : dateRender ? dateRender.length : 0;

        // For display the unit string.
        let unitString = '';
        if (replaceAppointmentData) {
            Enum.APPT_INTERVAL_UNIT.filter(unit => isFamilyReplace && familyReplaceAppointmentList.length > 0 ? unit.code === familyReplaceAppointmentList[0].minIntervalUnit : unit.code === replaceAppointmentData.minIntervalUnit)
                .forEach(unitStringEach => {
                    unitString = unitStringEach.engDesc;
                });
        }
        let minInterval = isFamilyReplace && familyReplaceAppointmentList.length > 0 ? familyReplaceAppointmentList[0].minInterval : replaceAppointmentData && replaceAppointmentData.minInterval ? replaceAppointmentData.minInterval : '0';

        // Control for overlapping appointment by service setting (Warning / Blocking)
        let siteParams = AppointmentUtilities.getOverlappingAppointmentSiteParamsByServiceCd(svcCd, clinicConfig);

        const showFamilyBtn = serviceCd === 'CGS' && appointmentMode === BookMeans.SINGLE && pageStatus !== pageStatusEnum.WALKIN && patientInfo?.cgsSpecOut?.pmiGrpName;

        return (
            <CIMSDialog
                classes={{
                    paper: classes.paper
                }}
                id={'replaceAppointmentDialog'}
                dialogTitle={'Appointment Duplicate Booking'}
                open={openReplaceAppointmentDialog}
            >
                <FormControl>
                    <DialogContent>
                        <Grid container spacing={1}>
                            <Grid item container justify="space-between">
                                <Grid item container xs={10} style={{ height: '30px', padding: '5px 5px 5px 5px' }} wrap="nowrap">
                                    The client has already booked {bookedAppointments} appointment(s) for the same encounter type within {minInterval} {unitString}(s).
                                </Grid>
                                {showFamilyBtn && (
                                    <Grid item container xs={2} wrap="nowrap" id={`squeeze-in_bookingConfirm`}>
                                        <Box mb={1}>
                                            <FamilyNumberBtn
                                                isConfirm
                                                isShowHistory
                                                disabled={currentSelectedApptInfo && pageStatus === pageStatusEnum.VIEW || familyMemberData.length < 2 ? true : false}
                                                appointmentId={currentSelectedApptInfo?.appointmentId || null}
                                            />
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                            <CIMSDataGrid
                                ref={ref => this.refGrid = ref}
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    // width: '1532px',
                                    width: '100%',
                                    height: '500px',
                                    // height: '637px', // 12 Row
                                    display: 'block'
                                }}
                                gridOptions={{
                                    enableBrowserTooltips: true,
                                    columnDefs: [
                                        { headerName: 'Appt Date', field: 'apptDate', tooltipField: 'apptDate', minWidth: 126, cellRenderer: 'dateRender' },
                                        { headerName: 'Start Time', field: 'startTime', tooltipField: 'startTime', minWidth: 110, cellRenderer: 'dateRender' },
                                        { headerName: '# slots', field: 'slots', tooltipField: 'slots', minWidth: 91, cellRenderer: 'dateRender' },
                                        { headerName: 'Site', field: 'site', tooltipField: 'site', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Room', field: 'room', tooltipField: 'room', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'PMI Info', field: 'patientInfo', tooltipField: 'patientInfo', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Quota Type', field: 'means', tooltipField: 'means', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Enc. Type', field: 'encType', tooltipField: 'encType', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Appt. Type', field: 'apptType', tooltipField: 'apptType', minWidth: 122, cellRenderer: 'dateRender' },
                                        { headerName: 'CIMS 1 Appt', field: 'isCimsOneAppt', tooltipField: 'isCimsOneAppt', minWidth: 116, cellRenderer: 'dateRender' }
                                    ],
                                    rowData: isFamilyReplace ? familyReplaceAppointmentList : dateRender,
                                    getRowNodeId: data => data.id,
                                    getRowHeight: params => 50
                                }}
                            />
                        </Grid>
                    </DialogContent>
                </FormControl>
                <DialogActions style={{ justifyContent: 'flex-end', padding: '0px 15px 10px 0px' }}>
                    {
                        siteParams && !(siteParams.paramValue === Enum.OVERLAPPING_APPT_CONTRO.BLOCK) ?
                            <CIMSButton
                                id={'urgentSqueeze_in' + name + 'button'}
                                onClick={
                                    () => {
                                        this.props.auditAction('Confirm Still Proceed in Appointment Duplicate Booking Dialog');
                                        this.props.handStillAppointments();
                                    }
                                }
                            >
                                Still Proceed
                            </CIMSButton>
                            :
                            <></>
                    }
                    {
                        replaceApptList && replaceApptList.length > 0 ?
                            <CIMSButton
                                id={'squeeze_in' + name + 'button'}
                                onClick={() => {
                                    this.props.auditAction('Confirm Replace Old Appointment');
                                    this.props.handReplaceOldAppointmnet();
                                }}
                            >
                                Replace Old Appointment
                            </CIMSButton>
                            : <></>
                    }
                    <CIMSButton
                        id={'squeeze_in' + name + 'button'}
                        onClick={this.handReplaceAppointmentDialogClose}
                    >
                        Cancel
                </CIMSButton>
                </DialogActions>
            </CIMSDialog>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        clinicList: state.common.clinicList || null,
        accessRights: state.login.accessRights,
        siteCd: state.login.clinic.siteCd,
        siteId: state.login.clinic.siteId,
        quotaConfig: state.common.quotaConfig,
        svcCd: state.login.service.svcCd,
        clinicConfig: state.common.clinicConfig,
        pageStatus: state.bookingInformation.pageStatus,
        isFamilyReplace: state.bookingInformation.isFamilyReplace,
        familyReplaceAppointmentList: state.bookingInformation.familyReplaceAppointmentList,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        familyMemberData: state.bookingInformation.familyMemberData,
        patientInfo: state.patient.patientInfo,
        appointmentMode: state.bookingInformation.appointmentMode
    };
};

const mapDispatchToProps = {
    auditAction
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(replaceAppointmentDialog)));