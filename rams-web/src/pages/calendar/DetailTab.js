import React, { useState } from "react";
import { Grid, List, Dialog, ListItem } from '@material-ui/core';
import useStyles from './styles';
import { useSelector } from 'react-redux';

const DetailTab = (props) => {
    const { selectedBoxMargin = '0 10px', navBoxStyle = {}, selectedDate = [], treatmentId = null } = props;
    const selectedBoxStyle = {
        selectedBoxMargin
    }
    const classes = useStyles(selectedBoxStyle);
    const [currentSection, setCurrentSection] = useState('1');
    const { 
        calendar_list: g_calendar_list,
     } = useSelector((state) => state.calendar);
    const patientList = treatmentId !== null ? g_calendar_list[treatmentId].personList : [];

    const renderDateNode = () => {
        return <Grid container className={classes.selectedBox}>
            <Grid container className={classes.selectedBoxTitle}>Selected Date</Grid>
            <Grid container className={classes.selectedBoxContent}>
                <Grid container alignContent="flex-start" className={classes.overflowBox}>
                    {selectedDate.length > 0 ? selectedDate.map((item, index) => {
                        return <Grid key={index} container className={classes.selectedBoxRow}>
                            <span className={classes.selectedBoxContentDate}>{item.date}</span>
                            <span className={classes.selectedBoxContentInfo}>{item.day}</span>
                    </Grid>
                    }) : <Grid  className={classes.noSelected}>No selected day</Grid>}
                </Grid>
            </Grid>
        </Grid>
    }
    const renderPatientDetailNode = () => {
        return <><Grid container className={classes.selectedBox}>
            <Grid container className={classes.selectedBoxTitle}>
                <Grid item className={classes.selectedBoxName}>Patient Name</Grid>
                <Grid item className={classes.selectedBoxCase}>Case.No.</Grid>
            </Grid>
            <Grid container className={classes.selectedBoxContent}>
                <Grid container alignContent="flex-start" className={classes.overflowBox}>
                    {
                        patientList.map((i, idx) => {
                            return <Grid key={`${i.category}_${i.patient_name}_${idx}`} container className={classes.selectedBoxRow}>
                                <div className={classes.selectedBoxName}>{i.selective_join !== 'Y' && <span className={classes.spanReq}>*</span>}{i.patient_name}</div>
                                <div className={classes.selectedBoxCase}>{i.case_no || ''}</div>
                                <div className={classes.selectedBoxRemark}>{i.remarks || ''}</div>
                            </Grid>
                        })
                    }
                </Grid>
            </Grid>
        </Grid>
            <Grid container justifyContent="flex-end" className={classes.selectedBoxFooter}>
                * = Selective Join
            </Grid>
        </>
    }
    return (<>
        <Grid container className={classes.navBox} style={navBoxStyle}>
            <List className={classes.listNav} component="nav">
                <div style={{ flex: 1, alignItems: 'center', padding: '0 5px' }}>
                    <ListItem
                        onClick={(e) => {
                            setCurrentSection('1')
                        }}
                        className={classes.listNavItem}
                        selected={'1' === currentSection}
                        classes={{
                            root: classes.ListRoot
                        }}
                        button
                        dense
                    >
                        Date
                    </ListItem>
                </div>
                <div style={{ flex: 1, alignItems: 'center', padding: '0 5px' }}>
                    <ListItem
                        onClick={(e) => {
                            setCurrentSection('2')
                        }}
                        className={classes.listNavItem}
                        selected={'2' === currentSection}
                        classes={{
                            root: classes.ListRoot
                        }}
                        button
                        dense
                    >
                        Patient Details
                    </ListItem>
                </div>
            </List>
        </Grid>
        <Grid container className={classes.selectedMain}>
            {currentSection === '1' ? renderDateNode() : renderPatientDetailNode()}
        </Grid>          
    </>)
}

export default DetailTab;