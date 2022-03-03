import React from 'react';
import useStyles from './styles';
import { useSelector } from 'react-redux';
import hosLogoImg from 'resource/dashboard/hos-logo-copy@2x.png'
export default function RightContent(props){
    const classes = useStyles()
    const {isPT, room_id} = props
    const { g_lastUpdateTime } = useSelector(
        (state) => {
            const {lastUpdateTime} = state.dashboard;
            return {
                g_lastUpdateTime: lastUpdateTime,
            }
        }
    );
    return <div className={classes.rightContent}>
        <div className={classes.roomTime} >
            <div className={classes.topRoom} style={isPT?null:{backgroundColor: '#c8c8c8'}}>
                <span>{'Room'}</span>
                <span>{room_id}</span>
            </div>
            <div className={classes.buttomTime}>
                <span>{'Last Update Time'}</span>
                <span>{g_lastUpdateTime}</span>
            </div>
        </div>
        <div className={classes.iconLoginout}>
            <img alt={'Hospital Logo'} src={hosLogoImg} />
            <span>{'Logout all'}</span>
        </div>
    </div>
}