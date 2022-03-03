import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import accessRightEnum from '../../../../enums/accessRightEnum';
import { getPatientInfo }from '../../../../utilities/dtsUtilities';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';

import IconButton from '@material-ui/core/IconButton';
import {
    Cancel as CancelIcon,
    LocalOffer as TagIcon,
    Comment as CommentIcon,
    Phone as PhoneEnabledIcon,
    Print as PrintIcon
} from '@material-ui/icons';

import { setSelectedRescheduleAppointment } from '../../../../store/actions/dts/appointment/bookingAction';
import DtsUnavailablePeriodAppointmentListGrid from './DtsUnavailablePeriodAppointmentListGrid';
import DtsReserveListGrid from './DtsReserveListGrid';
import {
    getUnavailableAppointments,
    getReserveList,
    setSelectedAppointment,
    setRedirect
} from '../../../../store/actions/dts/appointment/emptyTimeslotAction';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import DtsPrintReserveListDialog from './DtsPrintReserveListDialog';
import { REDIRECT_ACTION_TYPE } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import { getReserveListReport } from '../../../../store/actions/dts/appointment/emptyTimeslotAction';

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        fontFamily: 'Microsoft JhengHei, Calibri',
        margin: '8px 7px 0px 2px'
    },
    list: {
        width: '100%'
    },
    iconButton: {
        padding: 3
    },
    icon: {
        width: '2em',
        height: '2em'
    },
    alignRight: {
        float: 'right'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '0px 0px 5px 7px'
    }
});

const DtsEmptyTimeslotPatientGroup = (props) => {
    const { setRedirect, classes, roomId, selectedAppointment, reserveListReport, reserveList, ...rest } = props;
    const [tab, setTab] = useState(0);
    const [appointment, setAppointment] = useState(null);
    const [openReportDialog, setOpenReportDialog] = React.useState(false);

    useEffect(() => {
        setAppointment(null);
        if (roomId) {
            const now = moment();
            const from = now.format('YYYY-MM-DD');
            const to = now.add(3, 'M').format('YYYY-MM-DD');
            tab === 0 && props.getUnavailableAppointments(roomId, from, to);
            tab === 1 && props.getReserveList(roomId, from, to);
            // tab === 2 && props.getReserveList(roomId, from, to); //Miki
        }
    }, [tab, roomId]);
    useEffect(() => { props.setSelectedAppointment(null); }, [appointment]);

    const selectAppointment = () => {
        props.setSelectedAppointment(appointment);
        props.setSelectedRescheduleAppointment({ fromAppointment: appointment });
        const callback = () => {
            props.skipTab(accessRightEnum.DtsBooking,
                {
                    paramFrom: 'DtsEmptyTimeslotPatientGroup',
                    bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT
                }
            );
        };
        getPatientInfo({ patientKey: appointment.patientKey, callback });
    };
    const handlePrintClick = () => {
        // props.setRedirect({action:REDIRECT_ACTION_TYPE.PRINT_RESERVE_LIST});
        handleOpenReportDialog();
    };
    const handleOpenReportDialog = () => {
        console.log('open clicked');
        console.log(props.reserveList);
        props.getReserveListReport({list: props.reserveList, site: props.clinicCode, surgery: props.roomCd});
        setOpenReportDialog(true);
    };
    const handleCloseReportDialog = () => {
        setOpenReportDialog(false);
    };
    return (
        <>
            <Paper className={classes.root}>
                <Grid container>
                    <Grid item className={classes.list}>
                        <span className={classes.alignRight}>
                            <Tooltip title="Appointments under Unavailable Periods">
                                <IconButton className={classes.iconButton} color={tab === 0 ? 'primary' : 'disabled'} onClick={() => setTab(0)} disabled={!roomId}><CancelIcon className={classes.icon} /></IconButton>
                            </Tooltip>
                            <Tooltip title="Reserve List">
                                <IconButton className={classes.iconButton} color={tab === 1 ? 'primary' : 'disabled'} onClick={() => setTab(1)} disabled={!roomId}><TagIcon className={classes.icon} /></IconButton>
                            </Tooltip>
                            {/* Miki Sprint 8 10-09-2020 START  */}
                            <Tooltip title="Print Reserve List">
                                <IconButton
                                    className={classes.iconButton}
                                    color={tab === 1 ? 'primary' : 'disabled'}
                                    onClick={handleOpenReportDialog}
                                    disabled={!(tab===1)}
                                >
                                    <PrintIcon className={classes.icon} /></IconButton>
                            </Tooltip>
                            {/* Miki Sprint 8 10-09-2020 END  */}
                        </span>
                    </Grid>
                    <Grid item className={classes.list}>
                        {tab === 0 && <DtsUnavailablePeriodAppointmentListGrid setAppointment={setAppointment} />}
                        {tab === 1 && <DtsReserveListGrid setAppointment={setAppointment} />}
                    </Grid>
                    <Grid container className={classes.container}>
                        <Grid item className={classes.row}>
                            <PhoneEnabledIcon />
                            <CIMSTextField
                                className={classes.singleRowTextField}
                                id={'patientTelInput'}
                                disabled
                                variant="outlined"
                                InputProps={{
                                    style: {
                                        height: '30px',
                                        width: '150px',
                                        margin: '5px',
                                        color: 'black'
                                    }
                                }}
                                value={appointment?.patientDto?.phoneList[0]?.phoneNumber}
                            />
                            <CIMSButton color="primary" disabled={!appointment || selectedAppointment} onClick={selectAppointment}>Select</CIMSButton>
                        </Grid>
                        <Grid item className={classes.row}>
                            <CommentIcon />
                            <CIMSTextField
                                className={classes.singleRowTextField}
                                id={'specialRequest'}
                                disabled
                                variant="outlined"
                                InputProps={{
                                    style: {
                                        height: '30px',
                                        width: '228px',
                                        margin: '5px',
                                        color: 'black'
                                    }
                                }}
                                value={appointment?.appointmentSpecialRequestVo?.remark}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            {/* Miki Sprint 8 10-09-2020 START  */}
            <DtsPrintReserveListDialog
                openConfirmDialog={openReportDialog}
                closeConfirmDialog={handleCloseReportDialog}
                reserveListReport={reserveListReport}
            />
            {/* Miki Sprint 8 10-09-2020 END  */}
        </>
    );
};

const mapStateToProps = (state) => {
    return {
        roomId: state.dtsEmptyTimeslot.selectedEmptyTimeslot?.surgery.rmId,
        roomCd: state.dtsEmptyTimeslot.selectedEmptyTimeslot?.surgery.rmCd,
        selectedAppointment: state.dtsEmptyTimeslot.selectedAppointment,
        reserveList: state.dtsEmptyTimeslot.reserveList,
        reserveListReport: state.dtsEmptyTimeslot.reserveListReport,
        clinicCode: state.dtsEmptyTimeslot.selectedClinic.siteCd
    };
};

const mapDispatchToProps = {
    setRedirect,
    getUnavailableAppointments,
    getReserveList,
    setSelectedAppointment,
    skipTab,
    setSelectedRescheduleAppointment,
    getReserveListReport
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEmptyTimeslotPatientGroup));