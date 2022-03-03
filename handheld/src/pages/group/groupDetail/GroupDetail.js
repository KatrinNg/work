import React, {useState, useEffect} from "react";
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import arrowArrowDisabled from 'resource/group/arrow-arrow-r-disabled.svg';
import Widget from "components/Widget/Widget";
import iconPerson from 'resource/group/icon-person.svg';
import stop from 'resource/detail/icon-stop.svg';
import ColorButton from 'components/ColorButton/ColorButton';
import GroupDetailGrid from "./grid/groupDetailGrid";
import PopupDialog from 'components/Popup/Popup';
import AddPatient from "./addPatient/addPatient";
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
export default function GroupDetail({closeDetail, currentDetail}) {
    const classes = useStyles();
    const history = useHistory();
    const [openFinishGroup, setOpenFinishGroup] = useState(false);
    const dispatch = useDispatch()
    const patientAction = {
        START: 'START',
        END: 'END',
    }

    const { g_groupDetailList = [], g_dept, g_room_id, g_hosp_code } = useSelector(
        (state) => {
            return {
                g_groupDetailList: state.group?.groupDetailList,
                g_dept: state.loginInfo?.dept,
                g_room_id: state.loginInfo?.loginRoom,
                g_hosp_code: state.loginInfo?.loginHosp
            }
        }
    );

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_GROUP_DETAIL,
            payload: {
                login_id: '@CMSIT',
                dept: 'OT',
                hosp_code: 'TPH',
                room_id: g_room_id,
                category: currentDetail.category,
                group_name: currentDetail.group_name,
                treatment_date: currentDetail.group_date
            }
        })
        // dispatch({
        //     type: ActionTypes.SET_DETAIL,
        //     payload: {
        //         currentTreatmentIndex: null
        //     }
        // })
    }, [])

    const confirmFinishGroup = (action, case_no , callback = () => {}) => {
        if(case_no?.length>0)
        {
            const requestData = {
                    // login_id: currentDetail.login_id,
                    login_id: '@CMSIT',
                    hosp_code: currentDetail.hosp_code,
                    dept: currentDetail.dept,
                    room_id: currentDetail.room_id,
                    case_no,
                    treatment_category: currentDetail.category,
                    treatment_name : currentDetail.group_name,
                    action,
                }
            dispatch({
                    type: ActionTypes.HANDLE_PATIENT_IN_GROUP,
                    payload: {
                        requestData,
                        callback: (apiData) => {
                            setOpenFinishGroup(false)
                            callback(apiData)
                        }
                    }
                })
        }
        else
        {
            setOpenFinishGroup(false)
        }

    }

    return (
        <>       
            <Grid className={classes.groupDetailBox}>
                <Grid onClick={closeDetail} container alignItems="center" className={classes.groupDetailCrumb}>
                    <img src={arrowArrowDisabled} className={classes.groupDetailItemIcon}/>
                    <span>返回當日列表</span>
                </Grid>
                <Grid container style={{padding: '0 9px 12px 9px'}}>
                    <Widget noBodyPadding title={'小組 1'}>
                        <Grid style={{padding: '7px 7px 7px 10px'}}>
                            <Grid className={classes.groupDetailTitle}>{currentDetail.group_name}</Grid>
                            <Grid className={classes.groupDetailTime}>{currentDetail.start_time} - {currentDetail.end_time}</Grid>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Grid item>
                                    <Grid container alignItems="center">
                                        <img style={{margin: '0 9px 0 0'}} src={iconPerson} />
                                        <span className={classes.numberCount}>{g_groupDetailList?.length}</span>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <ColorButton
                                        variant="contained"
                                        color="primary"
                                        style={{minWidth: 110, minHeight: 36}}
                                        onClick={() => setOpenFinishGroup(true)}
                                    >
                                        <img src={stop} className={classes.stopBtn} />
                                        <span>結束小組</span>
                                    </ColorButton>
                                </Grid>
                            </Grid>
                            <GroupDetailGrid removePatient={confirmFinishGroup}/>
                        </Grid>
                        <AddPatient addPatient={confirmFinishGroup} patientAction={patientAction}/>
                    </Widget>
                </Grid>
            </Grid>
            <PopupDialog
                open={openFinishGroup}
                title={"結束小組"}
                content={<div style={{textAlign: 'center', color: '#737578', fontSize: 12}}>確認結束當前小組?</div>}
                // maxWidth={"296px"}
                leftBtn={"取消"}
                leftAction={() => setOpenFinishGroup(false)}
                leftStyle={{ background: "#e3fdf7", borderColor: "#a8e2d3", color: "#289f7e" }}
                rightBtn={"確認"}
                rightAction={()=>{confirmFinishGroup(patientAction.END, g_groupDetailList.map(i => i.case_no).join(';'))}}
                dialogActionsDirection={"row"}
            />
        </>
    )
}