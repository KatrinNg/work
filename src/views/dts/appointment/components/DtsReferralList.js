import React, { useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
import {
    Tab,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Tabs,
    Typography,
    Paper
} from '@material-ui/core';
import {
    Menu as MenuIcon
} from '@material-ui/icons';
import DtsMenuButton from '../../components/DtsMenuButton';
import {
    getDisciplines,
    setSelectedRescheduleAppointment,
    setSelectedDeleteAppointment
 } from '../../../../store/actions/dts/appointment/bookingAction';
 import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';

 import accessRightEnum from '../../../../enums/accessRightEnum';
 import * as dtsUtilities from '../../../../utilities/dtsUtilities';

const useStyles = makeStyles(() => ({
    root: {
        margin: '10px 0 0 0',
        borderRadius: 0,
        border: 0,
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
    },
    title: {
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#48aeca',
        fontWeight: 600,
        minWidth: '450px'
    },
    headerTableCell: {
        borderWidth: '0px 0px',
        fontSize: 13,
        backgroundColor: '#48aeca',
        color: '#fff',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 1
    },
    bobyTableCell: {
        borderWidth: '1px 0px'
    },
    tab: {
        minWidth: 80
    }
}));

const DtsReferralList =  props => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const referralList = useSelector(state => state.dtsAppointmentBooking.referralList);
    const selectedClinic = useSelector(state => state.dtsAppointmentBooking.pageLevelState.selectedClinic);
    const disciplines = useSelector(state => state.dtsAppointmentBooking.disciplines);
    const allSpecialties = useSelector(state => state.dtsPreloadData.allSpecialties);
    const clinicList = useSelector(state => state.common.clinicList);
    const rooms = useSelector(state => state.common.rooms);
    const roomList = useSelector(state => state.dtsAppointmentBooking.pageLevelState.roomList);

    const [selectedDiscipline, setSelectedDiscipline] = useState();

    useEffect(() => {
        selectedClinic && dispatch(getDisciplines(selectedClinic.siteId));
        //selectedClinic && dispatch(getReferralList(selectedClinic.siteId));
    }, [selectedClinic]);

    function handleMakeAppointment(patientKey) {
        const callback = () => {
            dispatch(skipTab(accessRightEnum.DtsBooking,
                {
                    paramFrom: 'DtsDayViewPanel',
                    bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_APPT
                }
            ));
        };
        dtsUtilities.getPatientInfo({ patientKey: patientKey, callback });
    }

    const handleUpdateAppointment = async (appointment) => {
        await props.setBookingModeAsync(dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT);
        props.addToGeneralAppointmentObjList(appointment);
        props.appointmentAction();
    };

    function handleRescheduleAppointment(appointment) {
        dispatch(setSelectedRescheduleAppointment({ fromAppointment: appointment }));
        const callback = () => {
            dispatch(skipTab(accessRightEnum.DtsBooking,
                {
                    paramFrom: 'DtsDayViewPanel',
                    bookingMode: dtsBookingConstant.DTS_BOOKING_MODE_RESCHEDULE_APPT
                }
            ));
        };
        dtsUtilities.getPatientInfo({ patientKey: appointment.patientKey, callback });
    }

    function handleShowAppointment(appointment) {
        props.showAppointment(appointment);
    }

    function getActionMenu(referral) {
        const itemListEl = [];
        itemListEl.push({ item: 'Show Referral Details', action: () => {} });
        itemListEl.push({ item: 'Discharge Referral', action: () => {} });
        //itemListEl.push({ item: 'Forward Referral', action: () => {} });
        if (!referral.appointment) {
            itemListEl.push({ item: 'Make Appointment', action: () => handleMakeAppointment(referral.patientKey) });
        } else {
            itemListEl.push({item:'Update Appointment', action:(event)=>{event.stopPropagation(); handleUpdateAppointment(referral.appointment);}});
            itemListEl.push({ item: 'Reschedule Appointment', action: () => handleRescheduleAppointment(referral.appointment) });
            itemListEl.push({ item: 'Delete Appointment', action: () => {props.openDeleteAppointmentAction();dispatch(setSelectedDeleteAppointment({appointment: referral.appointment}));} });
            itemListEl.push({ item: 'Show Appointment', action: () => handleShowAppointment(referral.appointment) });
            //itemListEl.push({ item: 'Swap Appointment', action: () => {} });
        }
        return (
            <DtsMenuButton
                direct="vertical"
                menuButtonSize="small"
                buttonEl={<MenuIcon/>}
                itemListEl={itemListEl}
            />
        );
    }

    function getFrom(referral) {
        const discipline = allSpecialties.find(s => s.sspecId == referral.sspecIdFrom).sspecCd;
        const clinic = clinicList.find(s => s.siteId == referral.siteIdFrom).siteCd;
        const room = rooms.find(s => s.rmId == referral.roomIdFrom).rmCd;
        return discipline + ' ' + clinic + ' ' + room;
    }

    function getStatus(referral) {
        if (referral.isDischarged) {
            return 'Discharged';
        } else if (!referral.appointment) {
            return 'Requested';
        } else if (referral.appointment.attendanceStatusCode === 'Y') {
            return 'Consultation';
        } else {
            return 'In Queue';
        }
    }

    function referralToRow(referral, idx) {
        return (
            <TableRow key={'referral' + idx}>
                <TableCell className={classes.bobyTableCell} >
                    <Typography noWrap className={classes.cellFont}>{moment(referral.referralDtm).format('YYYY/MM/DD [(]ddd[)]')}</Typography>
                </TableCell>
                <TableCell className={classes.bobyTableCell}>
                    <Typography noWrap className={classes.cellFont}>{getFrom(referral)}</Typography>
                </TableCell>
                <TableCell className={classes.bobyTableCell}>
                    <Typography noWrap className={classes.cellFont}>{referral.appointment?.roomCode}</Typography>
                </TableCell>
                <TableCell className={classes.bobyTableCell}>
                    <Typography noWrap className={classes.cellFont}>{getStatus(referral)}</Typography>
                </TableCell>
                <TableCell className={classes.bobyTableCell}>
                    {getActionMenu(referral)}
                </TableCell>
            </TableRow>
        );
    }

    return <Paper className={classes.root}>
        <Tabs
            selectionFollowsFocus
            value={selectedDiscipline}
            indicatorColor="primary"
            textColor="primary"
            onChange={(event, value) => setSelectedDiscipline(value)}
            aria-label="Disciplines"
        >
            <Tab className={classes.tab} label="All" value={null}/>
            {disciplines.map(discipline => <Tab className={classes.tab} key={discipline.sspecId} label={discipline.sspecCd} value={discipline}/>)}
        </Tabs>
        <Typography className={classes.title} id="tableTitle" component="div">
            Referral list
        </Typography>
        <Table classes={{ root: classes.tableLayout }}>
            <TableHead>
                <TableRow>
                    <TableCell className={classes.headerTableCell}>Date</TableCell>
                    <TableCell className={classes.headerTableCell}>From</TableCell>
                    <TableCell className={classes.headerTableCell}>To</TableCell>
                    <TableCell className={classes.headerTableCell}>Status</TableCell>
                    <TableCell className={classes.headerTableCell}>&nbsp;</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {referralList?.filter(referral => !selectedDiscipline || referral.sspecIdTo === selectedDiscipline.sspecId).map(referralToRow)}
            </TableBody>
        </Table>
    </Paper>;
};

export default DtsReferralList;