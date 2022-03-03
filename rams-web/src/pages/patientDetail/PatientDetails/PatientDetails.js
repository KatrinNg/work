import React,{useContext, useEffect,useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    Grid,
    TextField,
    Typography,
    FormHelperText
} from '@material-ui/core'
import useStyles from './styles'
import * as ActionTypes from 'redux/actionTypes';
import Widget from 'components/Widget/Widget';
import PatientDetailsPT from './PatientDetailsPT';
import PatientDetailsOT from './PatientDetailsOT';
import {IndexContextState} from 'pages/patientDetail/index'
import {isEmpty} from 'lodash'
export default function PatientDetails() {
    const dispatch = useDispatch();
    const {forceErrorDisplay} = useContext(IndexContextState)
    const [errorList,setErrorList] = useState({remarks:false})
    const { g_patientDetailsType,g_remarks } = useSelector(
        (state) => {
            const {patientDetailsType='PT'} = state.patientDetail;
            
            return {
                g_patientDetailsType: patientDetailsType,
                g_remarks: state.patientDetail?.patientDetail?.patient_details_remarks
            }
        }
    );
    useEffect(()=>{
        if(forceErrorDisplay){
            setErrorList(err=>{return {...err,remarks:isEmpty(g_remarks)}})
        }
    },[forceErrorDisplay])
    const classes = useStyles();
    const handleRemarksChange = (event)=>{
        const remarks = event.target.value
        dispatch({
            type: ActionTypes.SET_PATIENT_DETAILS_BASIC,
            payload: {
                patient_details_remarks:remarks
            }
        });
        setErrorList(err=>{return {...err,remarks:isEmpty(remarks)}})
    }
    return (
        <Widget title={'Patient Details'}>
            <PatientDetailsPT />
            {g_patientDetailsType=="OT"&&<PatientDetailsOT />}
            <Grid container spacing={2}>
                <Grid item xs={3} lg={2}>
                    <Typography className={classes.formLabel} >Remarks</Typography>
                </Grid>
                <Grid item xs={9} lg={10}>
                    <TextField placeholder={'Remarks'} 
                        error={errorList.remarks}
                        id="patientDetailsRemarks" 
                        value={g_remarks} variant="outlined"  
                        size='small' 
                        className={classes.textFieldWidth} 
                        onChange={handleRemarksChange}/>
                    <FormHelperText style={{display:errorList.remarks?'block':'none',paddingLeft: '5px'}} error={errorList.remarks}>{'Remarks is require'}</FormHelperText>
                </Grid>
            </Grid>
        </Widget>
    )
}
