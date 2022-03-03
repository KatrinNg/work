import { Grid, Paper } from "@material-ui/core";
import React, {useState} from "react";
import useStyles from './styles';
import addSvg from 'resource/Icon/add.svg'
import ScheduleListItem from './ScheduleListItem'
import moment from "moment";

const ScheduleGroup = (props) => {
    const {
        onOpen, 
        scheduleDate,
        setCalendarDisabled,
        handleAddIcon,
        initList = [],
    } = props;
    const classes = useStyles();
    return (<Grid container style={{paddingTop: 50, paddingRight: 5, height: '100%'}} direction='column'>
        <Grid container style={{paddingLeft: 10,paddingRight: 10,}}><div className={classes.scheduleGroupTitle}>{scheduleDate ? moment(scheduleDate).format('Do MMMM YYYY , dddd') : null}</div></Grid>
        <Grid container className={classes.SContent}>
            {
                initList.length > 0 ? <Grid className={classes.SContentAbsolute} style={{height: '100%', width: '100%'}}>
                    {initList.map((item, index) => {
                        return <ScheduleListItem key={index} item={item} onClick={ () => {onOpen(item)}}/>
                    })}
                </Grid> : <Grid container justifyContent="center" className={classes.noScheduleList}>
                        <img onClick={() => {handleAddIcon();}} alt=""className={classes.addIconInList} src={addSvg} /> Schedule Therapeutic Group
                </Grid>
            }
        </Grid>
        
    </Grid>)
}

export default ScheduleGroup;