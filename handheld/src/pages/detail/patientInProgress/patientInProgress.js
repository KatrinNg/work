import React from "react";
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import ColorButton from 'components/ColorButton/ColorButton';
import stop from 'resource/detail/icon-stop.svg';

export default function PatientInProgress({ data, handleStop, g_currentTreatmentIndex }) {
    const classes = useStyles();
    return (
        <Grid className={classes.inprogressBox} container justifyContent="space-between">
            <Grid item>
                <Grid className={classes.inprogressTips}>此病人正在進行</Grid>
                <Grid className={classes.inprogressTreatment}>
                    {data?.treatment_name || ''}
                </Grid>
            </Grid>
            <Grid item style={{textAlign: 'right'}}>
                    <ColorButton
                        className={classes.rightBtnStyle}
                        variant="contained"
                        color="primary"
                        style={{minWidth: 80, minHeight: 36}}
                        // onClick={}
                    >
                        <img src={stop} className={classes.stopBtn} />
                        <span onClick={() => handleStop(g_currentTreatmentIndex)}>停止</span>
                    </ColorButton>
            </Grid>
        </Grid>
    )
}