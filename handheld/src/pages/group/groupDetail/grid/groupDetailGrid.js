import React, {useState} from "react";
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import PopupDialog from 'components/Popup/Popup';
import { useSelector, useDispatch } from 'react-redux';
import moment from "moment";
import * as ActionTypes from 'redux/actionTypes';

export default function GroupDetailGrid({removePatient}) {
    const classes = useStyles();
    const dispatch = useDispatch();
    // const [g_groupDetailList, setList] = useState([
    // ]);
    const [openSuccessJoinIn, setOpenSuccessJoinIn] = useState(false);
    const [openLeaveGroup, setOpenLeaveGroup] = useState(false);
    const [handleItem, setItem] = useState(null);
    const patientAction = {
        START: 'START',
        END: 'END',
    }

    const { g_groupDetailList = [] } = useSelector(
        (state) => {
            return {
                g_groupDetailList: state.group?.groupDetailList,
            }
        }
    );

    const formatTime = (time) => {
        const res = moment(time, 'DD/MMM/YYYY HH:mm:ss').format('HH:mm');
        return time ? res : '-';
    }

    const openPopUp = (isOpen, item) => {
        setOpenLeaveGroup(isOpen);
        setItem(item)
    }

    const confirmLeaveGroup = (case_no) => {
        removePatient(patientAction.END, case_no, (res) => {
            setOpenLeaveGroup(false)
        })
    }
 
    return (
        <Grid>
            <Grid className={classes.formStyle}>
                <Grid container>
                    <Grid xs={4} item container className={classes.formLabel}>檔案編號 (備注)</Grid>
                    <Grid xs={3} item className={classes.formLabel}>參與者</Grid>
                    <Grid xs={3} item className={classes.formLabel}>時間</Grid>
                    <Grid xs={2} item className={`${classes.formLabel} ${classes.lastItemColumn}`} style={{color: '#f07474'}}>離開</Grid>
                </Grid>
                <Grid className={classes.formContent} container>
                    {
                        g_groupDetailList.map((i, d) => {
                            const treatment_start_dt = i.treatment_datetime && i.treatment_datetime.length > 0 ? i.treatment_datetime[i.treatment_datetime.length - 1].treatment_start_dt : null;
                            const treatment_end_dt = i.treatment_datetime && i.treatment_datetime.length > 0 ? i.treatment_datetime[i.treatment_datetime.length - 1].treatment_end_dt : null;
                            return (
                                <Grid container key={d}>
                                    <Grid xs={4} item className={`${d === g_groupDetailList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>
                                        {i.case_no}
                                    </Grid>
                                    <Grid style={{position: 'relative'}} xs={3} item className={`${d === g_groupDetailList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>
                                        { treatment_start_dt && <span className={`${classes.baseBox}
                                                ${(treatment_start_dt && !treatment_end_dt) ? classes.green : (treatment_start_dt && treatment_end_dt) ? classes.red : ''}`}></span>}
                                        <Grid style={{position: 'relative'}}>
                                            {i.selective_join === 'N' && <span className={classes.asterisk}>*</span>}
                                            <span>{i.patient_name}</span>
                                        </Grid>
                                    </Grid>
                                    <Grid xs={3} item className={`${d === g_groupDetailList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem} ${classes.formInnerItemBox}`}>
                                        <Grid xs item className={`${classes.formInnerItem}`}>
                                            {formatTime(treatment_start_dt)}
                                        </Grid>
                                        <Grid xs item className={`${classes.formInnerItem} ${classes.lastItemColumn}`}>
                                            {formatTime(treatment_end_dt)}
                                        </Grid>    
                                    </Grid>
                                    <Grid xs={2} item className={`${d === g_groupDetailList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem} ${classes.lastItemColumn}`}>
                                       { !(i.treatment_datetime?.treatment_start_dt && i.treatment_datetime?.treatment_end_dt) && <IconButton
                                            onClick={() => openPopUp(true, i)}
                                        >
                                            <Grid className={classes.deleteBtn}>
                                                <Grid className={classes.deleteInnerBtn}></Grid>
                                            </Grid>
                                        </IconButton>}
                                    </Grid>
                                </Grid>
                            )
                        })
                    }
                </Grid>
            </Grid>
            <Grid container justifyContent="flex-end">
                <Grid style={{position: 'relative', marginTop: 8}}>
                    <span className={classes.asterisk}>*</span>
                    <span style={{fontSize: 12}}>選擇性參加</span>
                </Grid>
            </Grid>
            <PopupDialog
                open={openLeaveGroup}
                title={"離開小組"}
                content={<div style={{textAlign: 'center', color: '#737578', fontSize: 12}}>確認病人離開當前小組?</div>}
                // maxWidth={"296px"}
                leftBtn={"取消"}
                leftAction={() => setOpenLeaveGroup(false)}
                leftStyle={{ background: "#e3fdf7", borderColor: "#a8e2d3", color: "#289f7e" }}
                rightBtn={"確認"}
                rightAction={()=>{confirmLeaveGroup(handleItem.case_no)}}
                dialogActionsDirection={"row"}
            />
            <PopupDialog
                open={openSuccessJoinIn}
                title={"成功"}
                content={<div style={{textAlign: 'center', color: '#737578', fontSize: 12}}>你亦可以在登入後更改房間</div>}
                // maxWidth={"296px"}
                // leftBtn={"取消"}
                // leftAction={() => setOpen(false)}
                // leftStyle={{ background: "#e3fdf7", borderColor: "#a8e2d3", color: "#289f7e" }}
                rightBtn={"確認"}
                rightAction={()=>{setOpenSuccessJoinIn(false)}}
                dialogActionsDirection={"row"}
            />
        </Grid>
    )
} 