import React from 'react';
import { Container } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import useStyles from './styles'
import loginOrOut from 'resource/homeIcon/login-or-out.svg'
import activity from 'resource/homeIcon/activity.svg'
import group from 'resource/homeIcon/group.svg'
import info from 'resource/homeIcon/info.svg'
import live from 'resource/homeIcon/live.svg';
import pic from 'resource/login/pic.png';
import RoomChange from 'components/RoomChange/RoomChange';

export default function Home() {
    const classes = useStyles()
    const history = useHistory();
    const MenuFuc = (props) => {
        const {src,text,alt,others,path,name} = props
        return <div className={classes.menuFuc} {...others} onClick={()=>{
            history.push(path)
        }}>
            <img alt={alt} src={src} />
            <span>{text}</span>
        </div>
    }
    return <>
        <Container disableGutters className={classes.content}>
            <div className={classes.menuPanel}>
                <div className={classes.workScanning}>
                    <span style={{color: '#6374c8'}}>{'工作'}</span>
                </div>
                <div className={classes.menuContent}>
                    <MenuFuc alt="loginOrOut" src={loginOrOut} text={'進入或離開'} path={'/room'} />
                    <MenuFuc alt="info" src={info} text={'摘要'} path={'/enterCase'} />
                    <MenuFuc alt="activity" src={activity} text={'活動'} path={'/activity'} />
                    <MenuFuc alt="live" src={live} text={'現場'} path={'/scene'} />
                    <MenuFuc alt="group" src={group} text={'小組'} path={'/group'} />
                    <MenuFuc alt="none" src={group} text={''} others={{style:{visibility: 'hidden'}}} />
                </div>
            </div>
            <RoomChange />
            <div className={classes.exercise}>
                <img alt="exercise" src={pic} />  
            </div>
        </Container>
    </>
}

