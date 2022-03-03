import React, {useState,useEffect} from 'react';
import useStyles from './styles';
import {buttomData} from './mockData'
import TableList from './TableList';
import RightContent from './RightContent';
export default function Dashboard (props){
    const {hotItems, room_id} = props;
    const classes = useStyles()
    
    return <div className={classes.DashboardPanel}>
        <TableList type='PT' />
        <div className={classes.buttomPanel}>
            <div className={classes.leftTable}>
                <div className={classes.tableColumn}>
                    <span>{''}</span>
                    <span>{'Min(s)'}</span>
                </div>
                {hotItems&&hotItems.map((item,index)=>{
                    return <div key={`buttomdata${index}`} className={`${classes.tableColumn} ${item.treatment_name && item.treatment_name.length > 36 ? classes.overSizeTextStyle: ''}`}>
                        <span>{item.treatment_name}</span>
                        <span>{item.remaining}</span>
                    </div>
                })}
                
            </div>
            <RightContent type={true} room_id={room_id}/>
        </div>
    </div>
}

