import React, { useEffect, useState } from 'react';
import Widget from 'components/Widget/Widget';
import Switch from 'components/Switch/Switch';
import { FormControlLabel, TextField, Typography, Grid, Paper, makeStyles } from '@material-ui/core';
import loginIcon from 'resource/Icon/login/login.png';
import logoutIcon from 'resource/Icon/logout/logout.png';
import ColorButton from 'components/ColorButton/ColorButton';
import * as _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';

const useStyles = makeStyles((theme) => ({
    measureHealthGrid: {
        border: '1px solid #979797',
        borderRadius: '10px',
        paddingLeft: '12px',
        paddingRight: '12px',
    },
    measureHealtMargin: {
        margin: '0px 5px',
    
    },

}));


export default function MeasureHealthStatus() {
    const { patientDetail } = useSelector(state => state.patientDetail)
    const classes = useStyles();
    const dispatch = useDispatch();

    function toggleButton(key, index) {
        const newPatientDetail = _.cloneDeep(patientDetail);
        const newValue = patientDetail[key].split("") 
        newValue[index] = patientDetail[key][index] === "Y" ? "N" : "Y"
       
        newPatientDetail[key] = newValue.join("")

        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                patientDetail: newPatientDetail
            }
        })
      
    }

    function handleSwitchChange() {
        const newValue = patientDetail.continuous_spo2 === "Y" ? "N" : "Y"
        const newPatientDetail = _.cloneDeep(patientDetail);

        newPatientDetail.continuous_spo2 = newValue

        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                patientDetail: newPatientDetail
            }
        })
    }

    return (<>
        <div >
            <Widget title={'Measure Health Status'}>
                <Grid container justifyContent="flex-end" >
                    <FormControlLabel
                        className={classes.measureHealtMargin}
                        classes={classes.switch}
                        control={<Switch checked={patientDetail?.continuous_spo2 === "Y"} onChange={handleSwitchChange} name="checked" />}
                        label={<Typography variant='h5' style={{fontSize:"14px", fontWeight:"600", fontFamily:"PingFangHK-Semibold"}} >Continuous SpO2 Monitoring</Typography>}
                        labelPlacement='start'
                    />
                </Grid>
                <Grid container spacing={4} className={classes.measureHealtMargin}>

                    <Grid item >
                        <Typography style={{ marginBottom: '14px', fontSize:"16px", fontWeight:"600" }} variant='h5'>First Attend</Typography>
                        <Grid container spacing={2} direction="column" className={classes.measureHealthGrid}>
                            <Typography style={{ paddingTop: '12px' }} variant='h6'>

                                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '5px', fontSize:"16px", fontWeight:"600" }}><img src={loginIcon} /><span>&thinsp;Login</span></div>

                            </Typography>
                            <div style={{ display: 'flex', marginBottom: '16px', marginTop: '2px' }}>

                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_login?.[0] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("first_attend_login", 0)}
                                >
                                    BP(Sit)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_login?.[1] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("first_attend_login", 1)}
                                >
                                    BP(Stand)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_login?.[2] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("first_attend_login", 2)}
                                >
                                    SpO2
                                </ColorButton>
                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_login?.[3] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("first_attend_login", 3)}
                                >
                                    Therapist
                                </ColorButton>
                            </div>

                            <div style={{ border: '1px solid #f3f3f3', width: "30%", marginLeft: '35%', marginRight: '35%' }}></div>

                            <Typography style={{ paddingTop: '12px' }} variant='h6'>

                                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '5px', fontSize:"14px", fontWeight:"600" }}><img src={logoutIcon} /><span>&thinsp;Logout</span></div>

                            </Typography>
                            <div style={{ display: 'flex', marginBottom: '12px', marginTop: '2px' }}>

                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_logout?.[0] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("first_attend_logout", 0)}
                                >
                                    BP(Sit)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_logout?.[1] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("first_attend_logout", 1)}
                                >
                                    BP(Stand)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_logout?.[2] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("first_attend_logout", 2)}
                                >
                                    SpO2
                                </ColorButton>
                                <ColorButton
                                    style={
                                        patientDetail?.first_attend_logout?.[3] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("first_attend_logout", 3)}
                                >
                                    Therapist
                                </ColorButton>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid item >
                        <Typography style={{ marginBottom: '14px', fontSize:"16px", fontWeight:"600" }} variant='h5'>Subsequent Attend</Typography>
                        <Grid container spacing={2} direction="column" className={classes.measureHealthGrid}>
                            <Typography style={{ paddingTop: '12px' }} variant='h6'>

                                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '5px', fontSize:"16px", fontWeight:"600" }}><img src={loginIcon} /><span>&thinsp;Login</span></div>

                            </Typography>
                            <div style={{ display: 'flex', marginBottom: '16px', marginTop: '2px' }}>

                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_login?.[0] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("subsequent_attend_login", 0)}
                                >
                                    BP(Sit)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_login?.[1] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("subsequent_attend_login", 1)}
                                >
                                    BP(Stand)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_login?.[2] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("subsequent_attend_login", 2)}
                                >
                                    SpO2
                                </ColorButton>
                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_login?.[3] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("subsequent_attend_login", 3)}
                                >
                                    Therapist
                                </ColorButton>
                            </div>

                            <div style={{ border: '1px solid #f3f3f3', width: "30%", marginLeft: '35%', marginRight: '35%' }}></div>

                            <Typography style={{ paddingTop: '12px' }} variant='h6'>

                                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '5px', fontSize:"14px", fontWeight:"600" }}><img src={logoutIcon} /><span>&thinsp;Logout</span></div>

                            </Typography>

                            <div style={{ display: 'flex', marginBottom: '12px', marginTop: '2px' }}>

                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_logout?.[0] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("subsequent_attend_logout", 0)}
                                >
                                    BP(Sit)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_logout?.[1] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleButton("subsequent_attend_logout", 1)}
                                >
                                    BP(Stand)
                                </ColorButton>

                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_logout?.[2] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("subsequent_attend_logout", 2)}
                                >
                                    SpO2
                                </ColorButton>
                                <ColorButton
                                    style={
                                        patientDetail?.subsequent_attend_logout?.[3] === "Y" ?
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px' }
                                            :
                                            { width: '95px', paddingTop: '12px', paddingBottom: '12px', marginRight: '7px', background: "#f6f6f6", color: "#999999", border: "solid 1px #dfdfdf" }
                                    }
                                    variant="contained" color="primary"
                                    onClick={() => toggleButton("subsequent_attend_logout", 3)}
                                >
                                    Therapist
                                </ColorButton>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>

            </Widget>
        </div>
    </>)
}