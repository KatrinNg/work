import React, { useState, useEffect } from "react";
import { useStyles } from "./style";
import combinedShape from 'resource/group/combined-shape.svg';
import { Grid } from "@material-ui/core";
import Describe from "components/CommonDescribe/CommonDescribe";
import arrowArrow from 'resource/group/arrow-arrow-r.svg';
import arrowArrowDisabled from 'resource/group/arrow-arrow-r-disabled.svg';
import iconPerson from 'resource/group/icon-person.svg';
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
import GroupDetail from './groupDetail/GroupDetail';
export default function Group() {
    const classes = useStyles();
    // const [openDetail, setOpenDetail] = useState(false);
    const [currentDetail, setCurrentDetail] = useState(null);
    const dispatch = useDispatch()
    const { g_groupList, g_finishedGroupList, g_dept, g_room_id, g_hosp_code } = useSelector(
        (state) => {
            return {
                g_groupList: state.group?.groupList,
                g_finishedGroupList: state.group?.finishedGroupList,
                g_dept: state.loginInfo?.dept,
                g_room_id: state.loginInfo?.loginRoom,
                g_hosp_code: state.loginInfo?.loginHosp
            }
        }
    );
    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_GROUP_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
                start_date: '2022/01/01',
                end_date: '2022/12/31',
                room_id: g_room_id
            }
        })
        
    }, [])
    // const [groupList, setGroupList] = useState([
    //     {title: 'Adaptive Coping Strategies COPD educational group', time: '11:00 - 12:40', groupNumber: 1},
    //     {title: 'Adaptive Coping Strategies COPD educational group', time: '12:00 - 13:40', groupNumber: 1},
    //     {title: 'Adaptive Coping Strategies COPD educational group', time: '13:00 - 14:40', groupNumber: 1},
    // ]);
    // const [finishedGroupList, setFinishedGroupList] = useState([
    //     {title: 'Adaptive Coping Strategies COPD educational group', time: '11:00 - 12:40', groupNumber: 1},
    //     {title: 'Adaptive Coping Strategies COPD educational group', time: '13:00 - 14:40', groupNumber: 1},
    // ]);
    const history = useHistory();

    const openDetail = (item) => {
        setCurrentDetail(item)
    }

    const closeDetail = () => {
        setCurrentDetail(null)
    }

    return (
        <>
            {
                !currentDetail ? <Grid className={classes.groupBox}>
                    {
                        (g_groupList.length === 0 && g_finishedGroupList.length === 0) &&
                        <Grid container direction="column" justifyContent="center" alignItems="center" className={classes.noDataBox}>
                            <img src={combinedShape} className={classes.noDataImage} />
                            <span className={classes.noDataText} >沒有小組，請在系統内加入</span>
                        </Grid>
                    }
                    {
                        (g_groupList.length > 0 || g_finishedGroupList.length > 0) &&
                        <>
                            {
                                g_groupList.length > 0 &&
                                <>
                                    <Grid container className={classes.secTitle}>進行中</Grid>
                                    <Describe label={'小組'} margin="6px 0 24px 0">
                                        <Grid style={{ marginTop: 10 }} container>
                                            {
                                                g_groupList.map((i, d) => {
                                                    return (
                                                        <Grid key={d} container alignItems="center" className={classes.groupItem} onClick={() => { openDetail(i)}}>
                                                            <Grid xs={1} item className={classes.groupItemIndex}>{d + 1}</Grid>
                                                            <Grid xs={10} item>
                                                                <Grid className={classes.groupTitle}>{i.group_name}</Grid>
                                                                <Grid container item>
                                                                    <Grid item style={{ color: '#737578' }}>{i.start_time + ' - ' + i.end_time}</Grid>
                                                                    <Grid item>
                                                                        <img className={classes.groupNumberIcon} src={iconPerson} />
                                                                        <span style={{ color: '#6374c8' }}>{i.groupNumber}</span>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid xs={1} item>
                                                                <img src={arrowArrow} className={classes.groupItemIcon} />
                                                            </Grid>
                                                        </Grid>
                                                    )
                                                })
                                            }
                                        </Grid>
                                    </Describe>
                                </>
                            }
                            {
                                g_finishedGroupList.length > 0 &&
                                <>
                                    <Grid container className={classes.secTitle}>已結束</Grid>
                                    <Grid style={{ marginTop: 10 }} container>
                                        {
                                            g_finishedGroupList.map((i, d) => {
                                                return (
                                                    <Grid key={d} container alignItems="center" className={classes.groupItem}>
                                                        <Grid className={classes.groupItemMask}></Grid>
                                                        <Grid xs={1} item className={classes.groupItemIndex}>{d + 1}</Grid>
                                                        <Grid xs={10} item>
                                                            <Grid style={{ fontSize: 14, fontWeight: 600 }}>{i.group_name}</Grid>
                                                            <Grid container item>
                                                                <Grid item style={{ color: '#737578' }}>{i.start_time + ' - ' + i.end_time}</Grid>
                                                                <Grid item>
                                                                    <img className={classes.groupNumberIcon} src={iconPerson} />
                                                                    <span style={{ color: '#6374c8' }}>{i.groupNumber}</span>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid xs={1} item>
                                                            <img src={arrowArrowDisabled} className={classes.groupItemIcon} style={{ color: '#8c8c8c' }} />
                                                        </Grid>
                                                    </Grid>
                                                )
                                            })
                                        }
                                    </Grid>
                                </>
                            }
                        </>
                    }
                </Grid> : <GroupDetail currentDetail={currentDetail} closeDetail={closeDetail}/>
            }
        </>
    )
}