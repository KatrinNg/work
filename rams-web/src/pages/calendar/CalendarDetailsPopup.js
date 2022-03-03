import React, {useState} from "react";
import { Grid, List, Dialog, ListItem } from '@material-ui/core';
import ColorButton from 'components/ColorButton/ColorButton';
import useStyles from './styles';
import roomSvg from 'resource/Icon/room.svg'
import patientSvg from 'resource/Icon/patient.svg'
import DetailTab from "./DetailTab";

const CalendarDetailsPopup = ({ open, onClose, id, item, openPanelInPopUp = () => {} }) => {
    const classes = useStyles();
    const { title, room, roomNumber, category, date, time, remark, personCount, treatment_id, selectedDate } = item;
    return (
        <Dialog
            open={open}
            aria-labelledby={`${id}_popup_calendarDetail`}
            onClose={onClose}
        >
            <Grid container className={classes.popup}>
                <Grid container className={classes.popupTitle}>
                    <Grid item className={classes.popupTitleLeft}>
                        <span className={classes.rectangle} style={{ backgroundColor: item?.color || '#4f5369'}}/>
                    </Grid>
                    <Grid item className={classes.popupTitleContent}>{title}</Grid>
                    <Grid item className={classes.popupTitleRight}>
                        <span  >
                            <img alt="" className={classes.roomIcon} src={roomSvg} />
                            {roomNumber}
                        </span>
                        <span >
                            <img alt="" className={classes.patientIcon} src={patientSvg} />
                            {personCount}
                        </span>
                    </Grid>
                </Grid>

                <DetailTab treatmentId={treatment_id} selectedDate={selectedDate}/>

                <Grid container className={classes.popupInfoBox}>
                    <Grid container>
                        <Grid item className={classes.popupInfoLabel}>Room</Grid>
                        <Grid item className={classes.popupInfoValue}>{room}</Grid>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.popupInfoLabel}>Category</Grid>
                        <Grid item className={classes.popupInfoValue}>{category}</Grid>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.popupInfoLabel}>Name</Grid>
                        <Grid item className={classes.popupInfoValue}>{title}</Grid>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.popupInfoLabel}>Date</Grid>
                        <Grid item className={classes.popupInfoValue}>{date}</Grid>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.popupInfoLabel}>Time</Grid>
                        <Grid item className={classes.popupInfoValue}>{time}</Grid>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.popupInfoLabel}>Remark</Grid>
                        <Grid item className={classes.popupInfoValue}>{remark}</Grid>
                    </Grid>
                </Grid>

                <Grid container justifyContent="flex-end" className={classes.popupFooter}>
                    <ColorButton style={{ height: 40, width: 110 }} color="primary" variant='outlined' onClick={(e) => {openPanelInPopUp(treatment_id)}}>Edit</ColorButton>
                </Grid>
            </Grid>
        </Dialog>
    )
}

export default CalendarDetailsPopup;