import React, { useState, useEffect } from "react"
import MainContentUI from '../common/MainContentUI'
import { useDispatch, useSelector } from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
const Position = () => {
    const dispatch = useDispatch();
    const { assistanceList } = useSelector(state => state.adminmode)
    useEffect(()=>{
        dispatch({
            type:ActionTypes.FETCH_ASSISTANCE_LIST,
            payload:{
                "login_id":"@CMSIT",
                "hosp_code":"TPH",
                "dept":"OT"
            }
        })
    }, [dispatch])
    
    const handleSave = (data) => {
        dispatch({
            type: ActionTypes.UPDATE_SIDELIST_DATA,
            payload: {
                login_id:'@CMSIT',
                hosp_code:'TPH',
                dept:'OT',
                treatment_properties_dept: data
            }
        });
    }
    return (
        <MainContentUI id={'assistance'} title="Assistance" list={assistanceList} onSave={ handleSave}/>
    )
}

export default Position;