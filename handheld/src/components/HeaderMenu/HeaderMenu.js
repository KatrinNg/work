import React, { useEffect, useState } from 'react';
import {useSelector} from 'react-redux';
import {useHistory,useLocation } from 'react-router-dom'
import headRedIcon from 'resource/headerMenuIcon/group-3-copy-2.svg'
import ramsIcon from 'resource/login/rams.png'
import MenuIcon from '@material-ui/icons/Menu';
import ColorButton from 'components/ColorButton/ColorButton';
import CloseIcon from '@material-ui/icons/Close';
import RoomChange from 'components/RoomChange/RoomChange';
import useStyles from './styles';
import offIcon from 'resource/headerMenuIcon/icon-off.svg';
import cookie from 'storage/cookie';
export default function HeaderMenu(props) {
    const {content} = props;
    const history = useHistory()
    const { pathname } = useLocation();
    const [active,setActive] = useState('')
    const { g_loginRoom} = useSelector(
        (state) => {
            return {
                g_loginRoom: state.loginInfo?.loginRoom,
            }
        }
    );
    const classes = useStyles()
    const [open,setOpen] = useState(false)
    useEffect(()=>{
        setActive(pathname)
    },[open])
    const RoomTitle = (props) => {
        const {others} = props
        return <div {...others} className={classes.roomTitle}><span>{'所在房間'}</span><span>{g_loginRoom}</span></div>
    }
    const toMenu = (path) => {
        history.push(path)
    }
    const MenuSpan = (props) => {
        const {text,path,others} = props
        return <span onClick={()=>{toMenu(path)}} style={active===path?{backgroundColor: '#39ad90',color: '#fff'}:null} {...others} className={classes.menuSpan}>{text}</span>
    }
    const loginOut = () => {
        cookie.delCookie('user');
        history.push('/login')
    }
    return <>
        <div className={classes.headerMenuRoot}>
            <div className={classes.leftIcon}>
                <img className={classes.rams} alt="rams" src={ramsIcon} />
                <img className={classes.menulogo} alt="menulogo" src={headRedIcon} />
            </div>
            <ColorButton onClick={()=>{setOpen(!open)}} classes={{root:classes.menuBtn}} color="primary" style={{height: '59px',width: '59px'}}>{open?<CloseIcon className={classes.menuIcon} />:<MenuIcon className={classes.menuIcon}/>}</ColorButton>
        </div>
        {pathname!=='/home'&& <RoomTitle />}
        <div className={classes.contentRoot} style={pathname!=='/home'?{height: 'calc(100% - 89px)'}:null}>
            {content}
        </div>
        {open && <div className={classes.menuDrawPop}>
            <div className={classes.drawPopContent}>
                <div className={classes.workScanning}>
                    <span style={{color: '#6374c8'}}>{'工作'}</span>
                </div>
                <div className={classes.drawMenuContent}>
                    <MenuSpan text={'進入或離開'} path={'/room'} />
                    <MenuSpan text={'摘要'} path={'/enterCase'} />
                    <MenuSpan text={'活動'} path={'/activity'} />
                    <MenuSpan text={'現場'} path={'/scene'} />
                    <MenuSpan text={'小組'} path={'/group'} />
                    <span className={classes.menuSpan} style={{visibility: 'hidden'}}></span>
                </div>
                <RoomChange />
                <div className={classes.loginOut} onClick={()=>{loginOut()}}>
                    <img alt='login-out' src={offIcon} />
                    <span>{'登出'}</span>
                </div>
            </div>
            
        </div>}
    </>
}