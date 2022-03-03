import React, { useEffect, useState } from 'react';
import {useHistory } from 'react-router-dom'
import {Typography} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import PopupDialog from 'components/Popup/Popup.js';
import CommonSelect from 'components/CommonSelect/CommonSelect.js';
import ColorButton from 'components/ColorButton/ColorButton';
import useStyles from './styles'
import roomIcon from 'resource/homeIcon/roomIcon.svg'
import * as ActionTypes from 'redux/actionTypes';
import cookie from 'storage/cookie';
export default function RoomChange() {
    const { g_loginRoom,g_roomList,g_loginHosp} = useSelector(
        (state) => {
            const {loginRoom,roomList,loginHosp} = state.loginInfo
            return {
                g_loginRoom: loginRoom,
                g_roomList: roomList,
                g_loginHosp: loginHosp
            }
        }
    );
    const dispatch = useDispatch();
    const history = useHistory()
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const [selectedRm, setSelectedRm] = useState(g_loginRoom)
    const rooms = [
        { label: "1號房", value: "1號房" },
        { label: "2號房", value: "2號房" },
        { label: "3號房", value: "3號房" },
        { label: "4號房", value: "4號房" }
    ]
    useEffect(()=>{
        dispatch({
            type: ActionTypes.FETCH_LOGININFO_ROOMLIST,
            payload: {}
        })
    },[])
    useEffect(()=>{
        setSelectedRm(g_loginRoom)
    },[g_loginRoom])
    const handleChange = (event, item) => {
        const {
            target: { value },
        } = event;
        if (item === "room") {
            setSelectedRm(typeof value === 'string' ? value.split(',') : value,)
        }

    };
    const changeRoom = () => {
        setOpen(false);
        // no change room  return
        if(selectedRm.toString() === g_loginRoom.toString())return
       
        dispatch({
            type: ActionTypes.SET_LOGIN_ROOM,
            payload: {loginRoom: selectedRm[0]}
        })
        dispatch({
            type: ActionTypes.SET_ROOM,
            payload: {
                barcode: '',
            }
        })
        cookie.setCookie('loginRoom', selectedRm);
        cookie.setCookie(cookie.getCookie('user'), selectedRm);
        history.push('/home')
    }
    return <>
        <div className={classes.roomContent}>
            <div className={classes.roomTop}>
                <span>{'所在房間'}</span>
                <span>{`${g_loginHosp} - ${g_loginRoom}`}</span>
            </div>
            <div className={classes.roomBottom}>
                <img alt="room" style={{width: "40px",height: '44px'}} src={roomIcon} />  
                <ColorButton onClick={()=>{setOpen(true)}} color="primary" style={{width: "120px",height: '40px',color:'#FFF',fontSize: '16px'}}>{'更改'}</ColorButton>
            </div>
        </div>
        <PopupDialog
            open={open}
            title={"選擇房間"}
            content={<>
                <Typography className={classes.font} style={{ marginBottom: "14px" }}>請選擇你想登入的房間</Typography>
                <CommonSelect valueFiled='room_id' labelFiled='room_id' className={classes.select} placeholder={'-治療室-'} id="loginRoom" value={selectedRm}
                    onChange={(event) => { handleChange(event, "room") }}
                    items={g_roomList} width={'260px'} />
                <Typography className={classes.font} style={{ marginTop: "14px", marginBottom: "45px" }}>* 你亦可以在登入後更改房間</Typography>
            </>}
            maxWidth={"296px"}
            leftBtn={"取消"}
            leftAction={() => setOpen(false)}
            leftStyle={{ background: "#e3fdf7", borderColor: "#a8e2d3", color: "#289f7e" }}
            rightBtn={"確認"}
            rightAction={()=>{changeRoom()}}
            dialogActionsDirection={"row"}
        />
    </>
}

