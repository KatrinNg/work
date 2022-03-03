import React,{useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    Grid,
    FormControlLabel,
    Typography
} from '@material-ui/core'
import useStyles from './styles'
import CommonSelect from 'components/CommonSelect/CommonSelect';
import Switch from 'components/Switch/Switch';
import * as ActionTypes from 'redux/actionTypes';
export default function PatientDetailsPT() {

    const classes = useStyles();
    const dispatch = useDispatch();
    const { g_patientDetailsType,g_caseNumber,g_room,g_therapist,g_patientConditions,g_status,g_o2,g_fallRisk,
         treatmentChange, roomChange,g_roomList,g_therapistList, g_patientConditionsList,
         g_o2List,g_statusList} = useSelector(
        (state) => {
            const {patientDetailsType='PT',
                roomList,therapistList,patientConditionsList,statusList,o2List,patientDetail,case_no} = state.patientDetail;
            //const tempFormData = patientDetailsType=='PT'?patientDetailsPT:patientDetailsOT;
            const {room_id,therapist_id,patient_conditions,status,o2,fall_risk} = patientDetail;
            return {
                g_caseNumber: case_no,
                g_patientDetailsType:patientDetailsType,
                g_room: room_id,
                g_therapist: therapist_id,
                g_patientConditions: patient_conditions,
                g_status: status,
                g_o2: o2,
                //g_cardiacRisk: patientDetailsPT.cardiacRisk,
                g_fallRisk: fall_risk==='Y'?true:false,
                treatmentChange: state.patientDetail?.treatmentChange,
                roomChange: state.patientDetail?.roomChange,
                g_roomList: roomList,
                g_therapistList:therapistList,
                g_patientConditionsList: patientConditionsList,
                g_statusList: statusList,
                g_o2List: o2List
            }
        }
    );
    const onRoomChange = () => {
        !roomChange && dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                roomChange: true,
            }
        });
    }
    const handleChange = (event,changeKey) => {
        const tempValue = event.target.value
        let payloadTemp = {}
        switch(changeKey){
            case 'room':
                payloadTemp = { room_id: tempValue };
                onRoomChange();
                break;
            case 'therapist':
                payloadTemp = {therapist_id:tempValue};
                break;
            case 'patientConditions':
                payloadTemp = {patient_conditions:tempValue};
                break;
            case 'status':
                payloadTemp = {status:tempValue};
                break;
            case 'o2':
                payloadTemp = {o2:tempValue};
                break;
            default:
                return;
        }
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAILS_BASIC,
            payload: payloadTemp
        });
    };

    const handleCardiacRiskChange = (val) => {
        console.log(val)
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAILS_BASIC,
            payload: { cardiacRisk: val }
        });
    };

    const handleFallRiskChange = (val) => {
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAILS_BASIC,
            payload: { fall_risk: val?'Y':'N' }
        });
    };

    return (
            <Grid container  className={classes.containMargin} >
                <Grid container spacing={2} >
                    <Grid item xs={3} lg={2}>
                        <Typography className={classes.formLabel} >Case Number</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <Typography className={classes.formLabel} >{g_caseNumber}</Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Room</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect valueFiled='room_id' labelFiled='room_id' disabled={treatmentChange} required={true} width={'180px'} placeholder={'Room'} id="patientDetailsRoom" value={g_room} onChange={(event)=>{handleChange(event,'room')}} 
                            items={g_roomList} 
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Therapist</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} placeholder={'Therapist'} id="patientDetailsTherapist" value={g_therapist} onChange={(event)=>{handleChange(event,'therapist')}}
                         items={g_therapistList} valueFiled='therapist_id' labelFiled='therapist_name' width={'400px'} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Patient Conditions</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} valueFiled='value' labelFiled='name' placeholder={'Patient Conditions'} id="patientDetailsConditions" value={g_patientConditions} onChange={(event)=>{handleChange(event,'patientConditions')}}
                         items={g_patientConditionsList} width={'400px'} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Status</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} valueFiled='value' labelFiled='name' placeholder={'Status'} id="patientDetailsStatus" value={g_status} onChange={(event)=>{handleChange(event,'status')}}
                         items={g_statusList} width={'400px'} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >O2(L/min)</Typography>
                    </Grid>
                    <Grid container item xs={9} lg={10}  direction="row" justifyContent="flex-start" alignItems="center">
                        <CommonSelect required={true} valueFiled='value' labelFiled='name' width={'180px'} placeholder={'O2(L/min)'} id="patientDetailsO2" value={g_o2} onChange={(event)=>{handleChange(event,'o2')}}
                         items={g_o2List}  />
                        {g_patientDetailsType=='OT' && <FormControlLabel
                            control={<Switch checked={g_fallRisk} onChange={(e, val) => handleFallRiskChange(val)} name="checked"/> }
                            label="Fall Risk"
                            classes={{label:classes.formLabel}}
                            labelPlacement='start'
                        />}
                        {/* <FormControlLabel
                                control={<Switch checked={g_cardiacRisk} onChange={(e, val) => handleCardiacRiskChange(val)} name="checked"/> }
                                label="Cardiac Risk"
                                classes={{label:classes.formLabel}}
                                labelPlacement='start'
                            /> */}
                    </Grid>
                </Grid>
            </Grid>
    )
}
