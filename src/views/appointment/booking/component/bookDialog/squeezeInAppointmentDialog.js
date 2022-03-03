import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import CIMSDialog from '../../../../../components/Dialog/CIMSDialog';
import { connect } from 'react-redux';
import { Box, withStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { Grid, Typography } from '@material-ui/core';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import * as CommonUtilities from '../../../../../utilities/commonUtilities';
import memoize from 'memoize-one';
import _ from 'lodash';
import moment from 'moment';
import Enum from '../../../../../enums/enum';
import {auditAction} from '../../../../../store/actions/als/logAction';
import { BookMeans, PageStatus as pageStatusEnum  } from '../../../../../enums/appointment/booking/bookingEnum';
import FamilyNumberBtn from '../bookForm/familyMember/FamilyNumberBtn';

const styles = () => ({
    paper: {
        minWidth: '64%',
        maxWidth: '75%',
        overflowY: 'unset',
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

class squeezeInAppointmentDialog extends Component {
    constructor(props) {
        super(props);
    }

    // :.FYI use same Click UrgentSqueezeIn SqueezeIn ?
    handleUrgentSqueezeInClick = () => {
        this.props.auditAction('Confim Urgent Squeeze In',null,null,false,'ana');
        if (this.props.isUseForSearchDialog) {
            this.props.handleSqueezeIn(true);
        } else {
            let bookSqueezeInTimeSlotData = _.cloneDeep(this.props.bookSqueezeInTimeSlotData);
            bookSqueezeInTimeSlotData[0].isSqueeze = 1;
            bookSqueezeInTimeSlotData[0].isUrgentSqueeze = 1;
            this.props.updateState({ bookSqueezeInTimeSlotData });
            this.props.handleBookConfirm(bookSqueezeInTimeSlotData);
        }
    }

    handleSqueezeInClick = () => {
        this.props.auditAction('Confim Squeeze In',null,null,false,'ana');
        if (this.props.isUseForSearchDialog) {
            this.props.handleSqueezeIn();
        } else {
            let bookSqueezeInTimeSlotData = _.cloneDeep(this.props.bookSqueezeInTimeSlotData);
            bookSqueezeInTimeSlotData[0].isSqueeze = 1;
            bookSqueezeInTimeSlotData[0].isUrgentSqueeze = 0;
            this.props.updateState({ bookSqueezeInTimeSlotData });
            this.props.handleBookConfirm(bookSqueezeInTimeSlotData);
        }
    }

    getSiteCd = memoize((list, siteId) => {
        const site = list && list.find(item => item.siteId === siteId);
        return site && site.siteCd;
    });

    render() {
        const {
            classes,
            bookSqueezeInTimeSlotData,
            handleBookSearch,
            handleBookCancel,
            bookingData,
            openSqueezeInAppointmentDialog,
            quotaConfig,
            clinicList,
            rooms,
            appointmentMode,
            serviceCd,
            pageStatus,
            patientInfo,
            currentSelectedApptInfo,
            familyMemberData
        } = this.props;

        let siteName = bookingData && bookingData.siteId ? this.getSiteCd(clinicList, bookingData && bookingData.siteId) : '';
        let dateRender = [];

        if (bookSqueezeInTimeSlotData) {
            for (let squeezeInTimeSlot in bookSqueezeInTimeSlotData) {
                const {encounterTypeId,rmId}=bookingData;
                const curSelEnct=bookingData.encounterTypeList.find(enct=>enct.encntrTypeId===encounterTypeId);
                const curSelRoom=rooms.find(room=>room.rmId===rmId);
                dateRender.push({
                    site: siteName,
                    // room: bookingData && bookingData.subEncounterTypeCd,
                    // encType: bookingData && bookingData.encounterTypeCd,
                    room:curSelRoom&&curSelRoom.rmDesc,
                    encType:curSelEnct&&curSelEnct.description,
                    apptDate: moment(bookSqueezeInTimeSlotData[squeezeInTimeSlot].slotDate).format(Enum.APPOINTMENT_BOOKING_DATE),
                    means: bookingData ? CommonUtilities.getQuotaTypeDescByQuotaType(quotaConfig, bookingData.qtType) : '',
                    startTime: bookSqueezeInTimeSlotData[squeezeInTimeSlot].startTime,
                    endTime: bookSqueezeInTimeSlotData[squeezeInTimeSlot].endTime
                });
            }
        }

        const showFamilyBtn = serviceCd === 'CGS' && appointmentMode === BookMeans.SINGLE && pageStatus !== pageStatusEnum.WALKIN && patientInfo?.cgsSpecOut?.pmiGrpName;

        return (
            <CIMSDialog
                classes={{
                    paper: classes.paper
                }}
                id={'squeezeInAppointmentDialog'}
                dialogTitle={'Squeeze-in Appointment'}
                open={openSqueezeInAppointmentDialog}
            >
                <FormControl>
                    <DialogContent>
                        <Grid container spacing={1}>
                            <Grid item container justify="space-between">
                                <Grid item container xs={10} style={{ height: '30px', padding: '5px 5px 5px 5px' }} wrap="nowrap">
                                    {
                                        'Please confirm to squeeze-in or urgent squeeze-in the appointment.'
                                    }
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
                                    height: '200px',
                                    // height: '637px', // 12 Row
                                    display: 'block'
                                }}
                                gridOptions={{
                                    enableBrowserTooltips: true,
                                    columnDefs: [
                                        { headerName: 'Site', field: 'site', tooltipField: 'site', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Room', field: 'room', tooltipField: 'room', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Enc. Type', field: 'encType', tooltipField: 'encType', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Quota Type', field: 'means', tooltipField: 'means', minWidth: 140, cellRenderer: 'dateRender' },
                                        { headerName: 'Appt. Date', field: 'apptDate', tooltipField: 'apptDate', minWidth: 170, cellRenderer: 'dateRender' },
                                        { headerName: 'Appt. Start Time	', field: 'startTime', tooltipField: 'startTime', minWidth: 170, cellRenderer: 'dateRender' },
                                        { headerName: 'Appt. End Time', field: 'endTime', tooltipField: 'endTime', minWidth: 170, cellRenderer: 'dateRender' }
                                        // PDF Select Update ??
                                        // ,{ headerName: 'Remark/Memo', field: 'means', tooltipField: 'means', minWidth: 140, cellRenderer: 'dateRender' }
                                    ],
                                    rowData: dateRender,
                                    getRowNodeId: data => data.id,
                                    getRowHeight: params => 50
                                }}
                            />
                        </Grid>
                    </DialogContent>
                </FormControl>
                <DialogActions style={{ justify: 'flex-end', padding: 0 }}>
                    <CIMSButton
                        id={'squeeze_in' + name + 'button'}
                        onClick={
                            this.handleSqueezeInClick
                        }
                    >
                        <Typography>Squeeze In</Typography>
                    </CIMSButton>
                    <CIMSButton
                        id={'urgentSqueeze_in' + name + 'button'}
                        onClick={
                            this.handleUrgentSqueezeInClick
                        }
                    >
                        <Typography>Urgent Squeeze In</Typography>
                    </CIMSButton>
                    {
                        !this.props.isUseForSearchDialog ?
                            <CIMSButton
                                id={'search' + name + 'button'}
                                onClick={
                                    ()=>{
                                        this.props.auditAction('Click Search Timeslot Button In Squeeze In Appointment Dialog',null,null,false,'ana');
                                        handleBookSearch();
                                    }
                                }
                            >
                                Search
                        </CIMSButton>
                            : <></>
                    }
                    <CIMSButton
                        id={'cancel' + name + 'button'}
                        onClick={
                            ()=>{
                                this.props.auditAction('Cancel Squeeze In',null,null,false,'ana');
                                handleBookCancel();
                            }
                        }
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
        clinicList: state.common.clinicList,
        serviceCd: state.login.service.serviceCd,
        participantList: state.ehr.participantList,
        loginName: state.login.loginInfo.loginName,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        accessRights: state.login.accessRights,
        siteCd: state.login.clinic.siteCd,
        svcCd: state.login.service.svcCd,
        clinicConfig: state.common.clinicConfig,
        quotaConfig: state.common.quotaConfig,
        siteId: state.login.clinic.siteId,
        rooms:state.common.rooms,
        currentSelectedApptInfo: state.bookingInformation.currentSelectedApptInfo,
        familyMemberData: state.bookingInformation.familyMemberData,
        patientInfo: state.patient.patientInfo,
        pageStatus: state.bookingInformation.pageStatus,
        appointmentMode: state.bookingInformation.appointmentMode
    };
};

const mapDispatchToProps = {
    auditAction
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(squeezeInAppointmentDialog)));