import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    Grid,
    Typography
} from '@material-ui/core'
import useStyles from './styles'
import CommonSelect from 'components/CommonSelect/CommonSelect';
import {wheelchairItems,assistiveDeviceItems,weightBearingStatusItems} from './mockData'
import * as ActionTypes from 'redux/actionTypes';
export default function PatientDetailsOT() {

    const classes = useStyles();
    const dispatch = useDispatch();
    const { g_wheelchair,g_assistiveDevice1,g_assistiveDevice2,g_weightBearingStatus1,g_weightBearingStatus2,
        g_wheelchairList,g_assistiveDeviceList1, g_assistiveDeviceList2,
        g_weightBearingStatusList1, g_weightBearingStatusList2} = useSelector(
        (state) => {
            const {patientDetail,wheelchairList,treatmentActivitiesLists} = state.patientDetail;
            const {wheelchair,assistive_device_1,assistive_device_2,weight_bearing_status_1,weight_bearing_status_2} = patientDetail;
            const {assistiveDeviceList1,assistiveDeviceList2,weightBearingStatusList1,weightBearingStatusList2} = treatmentActivitiesLists;
            return {
                g_wheelchair: wheelchair,
                g_assistiveDevice1:assistive_device_1,
                g_assistiveDevice2: assistive_device_2,
                g_weightBearingStatus1: weight_bearing_status_1,
                g_weightBearingStatus2: weight_bearing_status_2,
                g_wheelchairList: wheelchairList,
                g_assistiveDeviceList1: assistiveDeviceList1,
                g_assistiveDeviceList2: assistiveDeviceList2,
                g_weightBearingStatusList1: weightBearingStatusList1,
                g_weightBearingStatusList2: weightBearingStatusList2
            }
        }
    );
    const handleChange = (event,changeKey) => {
        const tempValue = event.target.value
        let payloadTemp = {}
        switch(changeKey){
            case 'wheelchair':
                payloadTemp = {wheelchair:tempValue};
                break;
            case 'assistiveDevice1':
                payloadTemp = {assistive_device_1:tempValue};
                break;
            case 'assistiveDevice2':
                payloadTemp = {assistive_device_2:tempValue};
                break;
            case 'weightBearingStatus1':
                payloadTemp = {weight_bearing_status_1:tempValue};
                break;
            case 'weightBearingStatus2':
                payloadTemp = {weight_bearing_status_2:tempValue};
                break;
            default:
                return;
        }
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAILS_BASIC,
            payload: payloadTemp
        });
    };

    return (
            <Grid container  className={classes.containMargin} >
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Wheelchair</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} placeholder={'Wheelchair'} id="patientDetailsWheelchair" value={g_wheelchair} 
                         onChange={(event)=>{handleChange(event,'wheelchair')}} valueFiled='value' labelFiled='name'
                         items={g_wheelchairList} width={'400px'} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Assistive Device(1)</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} placeholder={'Assistive Device(1)'} id="patientDetailsAssistiveDevice1" value={g_assistiveDevice1}
                         valueFiled='value' labelFiled='name'
                         onChange={(event)=>{handleChange(event,'assistiveDevice1')}}
                         items={g_assistiveDeviceList1} width={'400px'} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Assistive Device(2)</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} placeholder={'Assistive Device(2)'} id="patientDetailsAssistiveDevice2" value={g_assistiveDevice2} 
                         valueFiled='value' labelFiled='name'
                         onChange={(event)=>{handleChange(event,'assistiveDevice2')}}
                         items={g_assistiveDeviceList2} width={'400px'} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Weight Bearing Status(1)</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} placeholder={'Weight Bearing Status(1)'} id="patientDetailsWeightBearingStatus1" value={g_weightBearingStatus1} 
                         valueFiled='value' labelFiled='name'
                         onChange={(event)=>{handleChange(event,'weightBearingStatus1')}}
                         items={g_weightBearingStatusList1} width={'400px'} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3} lg={2} >
                        <Typography className={classes.formLabel} >Weight Bearing Status(2)</Typography>
                    </Grid>
                    <Grid item xs={9} lg={10} >
                        <CommonSelect required={true} placeholder={'Weight Bearing Status(2)'} id="patientDetailsWeightBearingStatus2" value={g_weightBearingStatus2} 
                         valueFiled='value' labelFiled='name'
                         onChange={(event)=>{handleChange(event,'weightBearingStatus2')}}
                         items={g_weightBearingStatusList2} width={'400px'} />
                    </Grid>
                </Grid>
            </Grid>
    )
}
