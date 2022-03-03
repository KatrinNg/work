import React, { useState } from "react";
import {  useSelector } from 'react-redux';
import ActivitiesItemTitle from './ActivitiesItemTitle';
import TreatmentActivitiesItemContent from './TreatmentActivitiesItemContent';
import { useStyles } from './style';
import { Button } from "@material-ui/core";
import Arrow from 'resource/Icon/demo-icon/arrow-arrow-down.svg';
import Calendar from "components/Calendar/Calendar";
import moment from "moment";

export default function TreatmentActivitiesItem(props) {
    const classes = useStyles();
    const [isExpand, setIsExpand] = useState(false);

    const {
         treatmentActivitiesLists
    } = useSelector(
        state => ({
            treatmentActivitiesLists: state.patientDetail?.treatmentActivitiesLists,
        })
        );
    function onDateChange(e) {
        console.log(e);
    }
    
    return (
        <div className={classes.TreatmentActivitiesItem}>
            <ActivitiesItemTitle {...props} />
            {/* <Calendar onDateChange={onDateChange}/> */}
            <TreatmentActivitiesItemContent handleChangeState={props.handleChangeState} isExpand={isExpand} treatmentActivities={props.item} treatmentActivitiesLists={treatmentActivitiesLists}/>
            <Button className={classes.ExpandButton} onClick={() => setIsExpand(!isExpand)}>
                <img alt="" src={Arrow} className={`${classes.expandIcon} ${isExpand ? classes.rotateExpandIcon : ''}`}/>
            </Button>
        </div>
    )
}