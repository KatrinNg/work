import React from "react";
import { Grid, Paper } from "@material-ui/core";
import roomSvg from 'resource/Icon/room.svg'
import patientSvg from 'resource/Icon/patient.svg'
import useStyles from './styles';

const ScheduleListItem = (props) => {
    const { item, onClick } = props;
    const { 
        color = '#4f5369',
        title = 'Back care educational group',
        category = 'Adaptive Coping Strategies',
        date = '14-Nov-2021 to 15-Dec-2021',
        time = '11:00 - 12:00',
        current = 'Monday Class',
        personCount = 7,
        roomNumber = '-',
        remark = '',
     } = item;
    const classes = useStyles();
    return (<Grid item onClick={onClick}>
        <Paper elevation={3} className={classes.itemPaper}>
            <Grid container>
                <Grid item className={classes.itemLeft}>
                    <span className={classes.rectangle} style={{ backgroundColor: color}}/>
                </Grid>
                <Grid item className={classes.itemContent}>
                    <div className={classes.itemTitle}>{title}</div>
                    <div className={classes.itemCategory}>{category}</div>
                    <div className={classes.itemDate}>{date}</div>
                    <div className={classes.itemTime}>{time}</div>
                    {/* <div className={classes.itemRecurrent}>{current}</div> */}
                    <div className={classes.remark}>{remark}</div>
                    
                </Grid>
                <Grid item className={classes.itemRight}>
                    <Grid container style={{marginBottom: 15, paddingTop: 3}}>
                        <img alt="" className={classes.roomIcon} src={roomSvg} />
                        {roomNumber}
                    </Grid>
                    <Grid container>
                        <img alt="" className={classes.patientIcon} src={patientSvg} />
                        {personCount}
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    </Grid>)
}

export default ScheduleListItem;