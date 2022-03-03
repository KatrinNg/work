import React, {useState,useEffect, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useStyles from './styles';
import {boardList,buttomData,boardListOT} from './mockData'
import * as ActionTypes from 'redux/actionTypes';
import DashboardPT from './DashboardPT';
import DashboardOT from './DashboardOT'
export default function Dashboard (){
    const classes = useStyles()
    const dispatch = useDispatch()
    const [data, setData] = useState(boardList)
    let timerRef = useRef(null);
    const { isPT, g_hotItems, g_patientDetailsType } = useSelector(
        (state) => {
            const {patientDetailsType='PT'} = state.patientDetail;
            const {hotItems} = state.dashboard;
            return {
                isPT: patientDetailsType==='PT',
                g_hotItems: hotItems,
                g_patientDetailsType: patientDetailsType
            }
        }
    );
    const room_id = g_patientDetailsType === 'PT'?'4BC':'G046'
    const getList = () => {
        dispatch({
            type: ActionTypes.FETCH_DASHBOARD_LIST,
            payload: {
                dept: g_patientDetailsType,
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                room_id: room_id
            }
        })
        dispatch({
            type: ActionTypes.FETCH_HOTITEMS_LIST,
            payload: {
                dept:g_patientDetailsType,
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                room_id: room_id
            }
        })
    }
    useEffect(() => {
        getList();
        timerRef.current = setInterval(() => {
            getList();
        }, 5000);
        return ()=>{
            clearInterval(timerRef.current)
        }
    },[])
    return <div className={classes.DashboardPanel}>
        {isPT ? <DashboardPT hotItems={g_hotItems} room_id={room_id}/> : <DashboardOT room_id={room_id} hotItems={g_hotItems}/>}
    </div>
}

