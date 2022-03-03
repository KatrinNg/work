import React, { useEffect, useState } from 'react';
import Widget from 'components/Widget/Widget';
import bpIcon from 'resource/Icon/bp/bp.png';
import spo2Icon from 'resource/Icon/spo-2/spo-2.png';
import { TextField, Typography, Grid, makeStyles } from '@material-ui/core';
import CustomTextField from 'components/Input/CustomTextField';
import * as _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';

const useStyles = makeStyles((theme) => ({
    healthReferenceFont: {
        fontSize: "14px",
        fontWeight: "600",
        paddingLeft: "13px",
        marginBottom: "6px"
    },
    grid: {
        margin: '13px 0 13px 0',
        border: '1px solid #979797',
        borderLeft: '#70d1b2 15px solid',
        borderRadius: '10px',

    },
    healthRefIcon: {
        width: '26px',
        height: '23px',
    },
    input: {
        width: '150px',
        height: '40px',
    },

}));


export default function HealthReference() {
    const { masterHealthRef, patientDetail } = useSelector(state => state.patientDetail)
    const classes = useStyles();
    const dispatch = useDispatch();

    useEffect(()=>{
        
        if(JSON.stringify(masterHealthRef) !== "{}" && JSON.stringify(patientDetail) !== "{}" ){
            const newPatientDetail = _.cloneDeep(patientDetail);

            for (const item in masterHealthRef){
                if(masterHealthRef[item] !== "" && newPatientDetail[item] =="") {
                    newPatientDetail[item] = masterHealthRef[item].toString()
                }
            }

            dispatch({
                type: ActionTypes.SET_PATIENT_DETAIL,
                payload: {
                    patientDetail: newPatientDetail
                }
            })
        }

    },[ JSON.stringify(masterHealthRef) === "{}" && masterHealthRef])

    function handleValueChange(value, field) {
        const newPatientDetail = _.cloneDeep(patientDetail);
        newPatientDetail[field] = value
        
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                patientDetail: newPatientDetail
            }
        })
    }

    return (<>
        <div>
            <Widget title={'Health Reference Value'}>
                <Grid container spacing={4} >
                    <Grid item className={classes.grid} style={{ margin: "28px", marginRight: "15px", marginBottom: "15px", marginTop: "30px" }}>
                        <Grid container direction="column" style={{ paddingRight: "75px", paddingBottom: "10px" }}>
                            <Typography variant="h5" style={{ color: '#3ab395' }}><img src={bpIcon} className={classes.healthRefIcon} />&thinsp;BP</Typography>
                            <div style={{ marginTop: "15px" }}>
                                <Typography variant="h6" className={classes.healthReferenceFont}>Systolic</Typography>
                                <div style={{ display: "flex" }}>
                                    <CustomTextField id="systolic-min" value={patientDetail.sbp_lower} onChange={e => handleValueChange(e.target.value.replace(/\D/g, ''), "sbp_lower")} placeholder="" className={classes.input} size="small" />
                                    &nbsp;
                                    <CustomTextField id="systolic-max" value={patientDetail.sbp_upper} onChange={e => handleValueChange(e.target.value.replace(/\D/g, ''), "sbp_upper")} placeholder="" className={classes.input} size="small" />
                                </div>
                            </div>
                            <div style={{ marginTop: "15px" }}>
                                <Typography variant="h6" className={classes.healthReferenceFont}>Diastolic</Typography>
                                <div style={{ display: "flex" }}>
                                    <CustomTextField id="diastolic-min" value={patientDetail.dbp_lower} onChange={e => handleValueChange(e.target.value.replace(/\D/g, ''), "dbp_lower")} placeholder="" className={classes.input} size="small" />
                                    &nbsp;
                                    <CustomTextField id="diastolic-max" value={patientDetail.dbp_upper} onChange={e => handleValueChange(e.target.value.replace(/\D/g, ''), "dbp_upper")} placeholder="" className={classes.input} size="small" />

                                </div>
                            </div>
                        </Grid>
                    </Grid>

                    <Grid item className={classes.grid} style={{ marginRight: "15px", marginBottom: "15px", marginTop: "30px" }}>
                        <Grid container direction="column" style={{ paddingRight: "75px", paddingBottom: "10px" }}>
                            <Typography variant="h5" style={{ color: '#3ab395' }}><img src={spo2Icon} className={classes.healthRefIcon} />&thinsp;SpO₂ and Pulse</Typography>
                            <div style={{ marginTop: "15px" }}>
                                <Typography variant="h6" className={classes.healthReferenceFont}>SpO₂</Typography>
                                <CustomTextField id="spo2" value={patientDetail.spo2} onChange={e => handleValueChange(e.target.value.replace(/\D/g, ''), "spo2")} placeholder="" className={classes.input} size="small" />
                            </div>
                            <div style={{ marginTop: "15px" }}>

                                <Typography variant="h6" className={classes.healthReferenceFont}>Pulse</Typography>
                                <div style={{ display: "flex" }}>
                                    <CustomTextField id="pluse-min" value={patientDetail.pulse_lower} onChange={e => handleValueChange(e.target.value.replace(/\D/g, ''), "pulse_lower")} placeholder="" className={classes.input} size="small" />
                                    &nbsp;
                                    <CustomTextField id="pluse-max" value={patientDetail.pulse_upper} onChange={e => handleValueChange(e.target.value.replace(/\D/g, ''), "pulse_upper")} placeholder="" className={classes.input} size="small" />
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </Widget>
        </div>
    </>)
}