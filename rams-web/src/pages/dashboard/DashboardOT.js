import React, {useState,useEffect} from 'react';
import useStyles from './styles';
import {buttomDataOT} from './mockData'
import TableList from './TableList';
import RightContent from './RightContent';
export default function Dashboard (props){
    const {hotItems, room_id} = props;
    const classes = useStyles()
    return <div className={classes.DashboardPanel} style={{backgroundColor: '#000000'}}>
        <TableList type='OT' />
        <div className={classes.buttomPanel}>
            <div className={classes.leftTable}>
                <div className={classes.tableColumn}>
                    <span>{''}</span>
                    <span>{'剩餘'}</span>
                </div>
                {hotItems&&hotItems.map((item,index)=>{
                    return <div key={`buttomDataOT${index}`} className={`${classes.tableColumn} ${item.treatment_name && item.treatment_name.length > 36 ? classes.overSizeTextStyle: ''}`}>
                        <span>{item.treatment_name}</span>
                        <span>{item.remaining}</span>
                    </div>
                })}
                
            </div>
            <RightContent type={false} room_id={room_id}/>
        </div>
    </div>
}

