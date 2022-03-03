import React, {useState, useEffect} from "react";
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import live from 'resource/scene/icon-live.svg';
import Describe from 'components/CommonDescribe/CommonDescribe';
import recurrent from 'resource/scene/recurrent.svg'
import ColorButton from 'components/ColorButton/ColorButton';
import { useDispatch, useSelector } from "react-redux";
import * as ActionTypes from 'redux/actionTypes';
import moment from "moment";

export default function Detail() {
    const classes = useStyles();
    const [list, setList] = useState([]);
    const dispatch = useDispatch()

    const { loginRoom: g_room_id, dept: g_dept, loginHosp:g_hosp_code } = useSelector((state) => state.loginInfo);
    const { sceneData: g_sceneData} = useSelector((state) => state.scene);

    const dispatchGetSceneData = () => {
        dispatch({
            type: ActionTypes.FETCH_SCENE_DATA,
            payload: {
                login_id:'@CMSIT',
                hosp_code:'TPH',
                room_id:g_room_id,
                dept:'OT',
                callback: ({room_data = []}) => {
                    Array.isArray(room_data)?setList(room_data):setList([]);
                }
            },
        })
    }

    const handleDtm = (time) => {
        return time ? moment(g_sceneData.system_dtm, 'DD/MMM/YYYY HH:mm:ss').format('DD-MMM-YYYY HH:mm:ss') : '-'
    }

    const calcRestTime = (item) => {
        if(item.treatment_duration)
        {
            const startTime = moment(item.last_updated, 'DD/MMM/YYYY HH:mm:ss').valueOf();
            const systemTime = g_sceneData.system_dtm ? moment(g_sceneData.system_dtm, 'DD/MMM/YYYY HH:mm:ss').valueOf() : 0;
            const durationTimeNumber = typeof item.treatment_duration === 'number' ? item.treatment_duration : Number(item.treatment_duration.split(' ')[0]);
            const durationTime = moment(startTime).add(durationTimeNumber, 'm').valueOf();
            const result = moment(Math.abs(durationTime - systemTime)).format('m');
            return durationTime - systemTime < 0 ? result : `-${result}`
        }

    }

    useEffect(() => {
        dispatchGetSceneData()
    }, [])

    return (
        <div className={classes.sceneBox}>
            <Grid>
                <Grid container className={classes.sceneTitle} alignItems="center" justifyContent="center">
                    <img src={live} style={{marginRight: 5}} />
                    <span>現場情況</span>
                </Grid>
                <Grid container style={{margin: '11px 0 0 0'}}>
                    <Grid xs item>
                        <Describe margin="0 0 0 18px" label={'病人數量'} value={list?.length.toString()}></Describe>
                    </Grid>
                    <Grid xs item>
                        <Describe margin="0" label={'最後更新時間'} value={handleDtm(g_sceneData.system_dtm)}></Describe>
                    </Grid>
                </Grid>
                <Grid>
                <Grid style={{minHeight: '51vh'}}>
                    <Grid className={classes.formStyle}>
                        <Grid container>
                            <Grid xs={4} item container className={classes.formLabel}>病人姓名</Grid>
                            <Grid xs={3} item className={classes.formLabel}>治療項目</Grid>
                            <Grid xs={3} item className={classes.formLabel}>病房/病床</Grid>
                            <Grid xs={2} item className={`${classes.formLabel} ${classes.lastItemColumn}`}>尚餘時間</Grid>
                        </Grid>
                        <Grid className={classes.formContent} container>
                            {
                                list.map((i, d) => {
                                    return (
                                        <Grid container key={d}>
                                            <Grid xs={4} item className={`${d === list.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>
                                                {i.patient_name_eng}</Grid>
                                            <Grid xs={3} item className={`${d === list.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>
                                                {i.current_treatment}</Grid>
                                            <Grid xs={3} item className={`${d === list.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>
                                                {i.ward}/{i.bed}</Grid>
                                            <Grid xs={2} item className={`${d === list.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem} ${classes.lastItemColumn}`}>
                                                {calcRestTime(i)}</Grid>
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                    </Grid>
                </Grid>
                </Grid>
                <Grid container justifyContent="center" className={classes.btnBox}>
                    <ColorButton
                        className={classes.updateBtn}
                        variant="contained"
                        color="primary"
                        onClick={() => dispatchGetSceneData()}
                        >
                            <img style={{marginRight: 8, width: 18}} src={recurrent} />
                            <span>更新</span>
                    </ColorButton>
                </Grid>
            </Grid>
        </div>
    )
}