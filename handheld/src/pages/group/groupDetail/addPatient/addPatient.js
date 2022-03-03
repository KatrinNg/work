import React, {useState} from "react";
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import Describe from "components/CommonDescribe/CommonDescribe";
import CustomTextField from 'components/Input/CustomTextField';
import scanIcon from 'resource/group/botton-bar-icon-scan-inactive.svg';
import ColorButton from "components/ColorButton/ColorButton";
import { IconButton } from "@material-ui/core";
import Scan from "components/Scan";
import { useDispatch } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';

export default function AddPatient({addPatient, patientAction}) {
    const classes = useStyles();
    const [newCaseNo, setCaseNo] = useState(null)
    const dispatch = useDispatch()

    const openCamera = () => {
        dispatch({
            type: ActionTypes.SHOW_SCAN,
            payload: {
                showScan: true
            }
        })
    }

    const saveAddPatient = () => {
        addPatient(patientAction.START, newCaseNo, (res) => {
            setCaseNo(null);
        })
    }

    const getScanResult = (res) => {
        console.log(res);
    }

    return (
        <>
            <Scan getScanResult={getScanResult}/>
            <Grid className={classes.addPatientBox}>
                <Grid className={classes.title}>加入病人</Grid>
                <Describe label={'檔案編號'} >
                    <Grid container style={{marginTop: 7}}>
                        <Grid item xs>
                            <CustomTextField
                                className={classes.textField} 
                                value={newCaseNo} 
                                onChange={e => {setCaseNo(e.target.value)}} />
                        </Grid>
                        <Grid item style={{margin: '-7px 0 0 7px'}}>
                        <Grid container  direction="column" justifyContent="center" alignItems="center">
                            <IconButton onClick={() => openCamera()} style={{padding: 6}}>
                                <div className={classes.scanIconBox}>
                                    <img src={scanIcon} />
                                </div>
                            </IconButton>
                            <span style={{color: '#737578', fontSize: 12,}}>掃描</span>
                            {/* <input id="addPatientCamera" type="file" accept="image/*" capture="camera" style={{display: 'none'}} /> */}
                        </Grid>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} style={{marginTop: 14}}>
                        <Grid xs item>
                            <ColorButton
                                onClick={()=>{setCaseNo(null)}} 
                                style={{width: '100%'}}
                                color="cancel" 
                                variant="contained">清除</ColorButton>
                        </Grid>
                        <Grid xs item>
                            <ColorButton 
                                onClick={()=>{saveAddPatient()}}
                                style={{width: '100%'}}
                                color="primary" 
                                variant="contained">確認</ColorButton>
                        </Grid>
                    </Grid>
                </Describe>
            </Grid>
        </>
    )
}