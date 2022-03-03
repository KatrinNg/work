import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { Typography, Grid, makeStyles, InputAdornment, IconButton } from '@material-ui/core';
import exerciseIcon from '../../resource/login/pic.png'
import userIcon from '../../resource/login/user-copy.png'
import CustomTextField from '../../components/Input/CustomTextField.js'
import passwordIcon from '../../resource/login/group-2-copy.png'
import hospIcon from '../../resource/login/shape.png'
import ramsIcon from '../../resource/login/rams.png'
import haIcon from '../../resource/login/ha.jpg'
import CommonSelect from 'components/CommonSelect/CommonSelect.js';
import PopupDialog from 'components/Popup/Popup.js';
import ColorButton from 'components/ColorButton/ColorButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as ActionTypes from 'redux/actionTypes';
import cookie from 'storage/cookie';
import useStyles from './styles'
import CommonSpinner from "components/CommonSpinner/CommonSpinner.js"
import ptotIcon from '../../resource/login/icon-ptot.png'

export default function Login() {
    const history = useHistory();
    const dispatch = useDispatch()
    const classes = useStyles();
    const [open, setOpen] = useState(false)
    const [error, setError] = useState(false)
    const [loginError, setLoginError] = useState(false)
    const [selectedRm, setSelectedRm] = useState([])
    const [showPassword, setShowPassword] = useState(false)
    const [showSpinner, setShowSpinner] = useState(false)
    const [openDialogueAfterFetch, setOpenDialogueAfterFetch] = useState(false)
    const [roomList, setRoomList] = useState([])
    const [enteredValue, setEnteredValue] = useState({
        hosp: [],
        dept: "",
        username: "",
        password: ""
    })
    const focus = useRef(null)

    const { g_hospList = [] } = useSelector(
        (state) => {
            const { hospCode } = state.loginInfo
            const formatted = hospCode?.map(item => {
                return { hosp_code: item }
            })
            return {
                g_hospList: formatted
            }
        }
    );

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_LOGININFO_HOSPLIST,
            payload: {}
        })
    }, [])


    useEffect(()=>{
    if(openDialogueAfterFetch){
    if (roomList.length>0){
            setOpen(true)
            setShowSpinner(false)
        } else{
           setShowSpinner(true)
        }
    }

    },[openDialogueAfterFetch, roomList])


    const handleChange = (event, item) => {

        const {
            target: { value },
        } = event;

        if (item === "hosp") {

            setEnteredValue({ ...enteredValue, hosp: typeof value === 'string' ? value.split(',') : value })

        }

        if (item === "room") {
            setSelectedRm(typeof value === 'string' ? value.split(',') : value)
        }

    };

    function handleClick(event) {
        if (event === "PT" || event === "OT") {
            setEnteredValue({...enteredValue, dept: event})
            setError(false);
            focus.current.focus();
        }
    }

    function handleLogin() {
        let detectError = false
        if ((JSON.stringify(enteredValue.hosp) === "[]" || enteredValue.hosp[0] === "") || enteredValue.dept === "" || enteredValue.username === "" || enteredValue.password === "") {
            detectError = true
            setError(true);
        } else if (enteredValue.username !== "" || enteredValue.password !== "") {
            if (enteredValue.username !== "@CMSIT" || enteredValue.password !== "abc123") {
                detectError = true
                setLoginError(true);
            }
        }

        if (!detectError) {
            setError(false);
            setLoginError(false);
            cookie.setCookie('user', enteredValue.username);
            cookie.setCookie('loginHosp', enteredValue.hosp);
            cookie.setCookie('loginDept', enteredValue.dept);

            setRoomList([])
            dispatch({
                type: ActionTypes.FETCH_LOGININFO_ROOMLIST,
                payload: {
                    callback: ({room_list}) => {

                        if(typeof(room_list) === "string"){
                        setRoomList([{ room_id: ""}])
                        } else{
                        setRoomList(room_list);
                        }

                    },
                    "login_id": enteredValue?.username,
                    "hosp_code": enteredValue?.hosp[0],
                    "dept": enteredValue?.dept
                }
            })

            //here call login api

            setOpenDialogueAfterFetch(true)

           // setOpen(true)

        }

    }

    function handleConfirmLogin() {

        if (selectedRm[0] ==="" || selectedRm?.length === 0 ) {
            setError(true)
        } else {
            setOpen(false)
            dispatch({
                type: ActionTypes.SET_LOGIN_ROOM,
                payload: {
                    loginRoom: selectedRm[0],
                    loginHosp: enteredValue?.hosp[0],
                    dept: enteredValue?.dept

                }
            })
            dispatch({
                type: ActionTypes.SET_LOGIN_ROOM,
                payload: {
                    "login_id": enteredValue?.username,
                    "password": enteredValue?.password,
                }
            })
            cookie.setCookie('loginRoom', selectedRm[0]);
            history.push('/home')
        }
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <>
            <CommonSpinner display={showSpinner} />
            <div className={classes.loginTitle}>
                <img className={classes.haIcon} src={haIcon} />
            </div>
            <Grid container justifyContent="center" className={classes.content}>

                <div className={classes.logoSession}>
                    <img className={classes.ramsIcon} src={ramsIcon} />
                    <img className={classes.exerciseIcon} src={exerciseIcon} />
                </div>

                <Grid container direction='column' alignContent='center' justifyContent='flex-start' className={classes.inputSession}>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "14px" }}>
                        <div style={{ display: "flex" }}>
                            <img className={classes.inputIcon} src={hospIcon} />

                            <Typography className={classes.font}>醫院</Typography>
                        </div>
                        <CommonSelect className={classes.select} placeholder={'-請選擇-'} id="loginHosp" value={enteredValue.hosp} valueFiled='hosp_code' labelFiled='hosp_code'
                            onChange={(event) => {
                                handleChange(event, "hosp")
                                setLoginError(false);
                                setError(false)
                            }}
                            items={g_hospList || [{ hosp_code: "" }]} />

                        {error && (JSON.stringify(enteredValue.hosp) === "[]" || enteredValue.hosp[0] === "") && <Typography style={{ marginLeft: "15px" }} className={classes.error}>請選擇醫院</Typography>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "14px" }}>
                        <div style={{ display: "flex" }}>
                            <img className={classes.inputIcon} src={ptotIcon} />

                            <Typography className={classes.font}>治療部</Typography>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <ColorButton
                                className={classes.ptBtn}
                                variant="contained"
                                style={{
                                    border: "1px solid #70cf72",
                                    borderRadius: "10px",
                                    color: "#000000", opacity: enteredValue.dept === "PT" ? 1 : 0.3
                                }}
                                onClick={() => handleClick("PT")}
                            >
                                <div>PT</div>
                            </ColorButton>

                            <ColorButton
                                className={classes.otBtn}
                                variant="contained"
                                style={{
                                    border: "1px solid #70cf72",
                                    borderRadius: "10px",
                                    color: "#000000", opacity: enteredValue.dept === "OT" ? 1 : 0.3
                                }}
                                onClick={() => handleClick("OT")}
                            >
                                <div>OT</div>
                            </ColorButton>
                        </div>

                        {error && enteredValue.dept === "" && <Typography style={{ marginLeft: "15px" }} className={classes.error}>請選擇治療部</Typography>}

                    </div>

                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "14px" }}>
                        <div style={{ display: "flex" }}>
                            <img className={classes.inputIcon} src={userIcon} /> <Typography className={classes.font}>用戶名稱</Typography>
                        </div>
                        <CustomTextField
                            helperText={error && enteredValue.username === "" && <span className={classes.error}>請輸入用戶名稱</span>}
                            className={classes.textField} value={enteredValue.username}
                            onChange={e => {
                                setEnteredValue({ ...enteredValue, username: e.target.value.trim() })
                                setError(false)
                                setLoginError(false)
                            }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                        <div style={{ display: "flex" }}>
                            <img className={classes.inputIcon} src={passwordIcon} /> <Typography className={classes.font}>密碼</Typography>
                        </div>
                        <CustomTextField
                            type={showPassword ? 'text' : 'password'}
                            helperText={error && enteredValue.password === "" ? <span className={classes.error}>請輸入密碼</span> : loginError ? <Typography className={classes.error}>用戶名稱或密碼不正確</Typography> : ""}
                            className={classes.textField} value={enteredValue.password}
                            onChange={e => {
                                setEnteredValue({ ...enteredValue, password: e.target.value.trim() })
                                setError(false)
                                setLoginError(false)
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            className={classes.visibilityBtn}
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ maxLength: 64 }}
                        />
                    </div>

                    {/*    {loginError && <Typography style={{ marginLeft: "15px" }} className={classes.error}>用戶名稱或密碼不正確</Typography>} */}

                    <ColorButton
                        className={classes.button}
                        variant="contained"
                        onClick={() => handleLogin()}
                        color="primary"
                        style={{ marginBottom: "20px" }}
                    >
                        登入
                    </ColorButton>
                </Grid>


            </Grid>

            <PopupDialog
                open={open}
                title={"選擇房間"}
                content={<>
                    <Typography className={classes.font} style={{ marginBottom: "14px" }}>請選擇你想登入的房間</Typography>
                    <CommonSelect className={classes.select} placeholder={'-治療室-'} id="loginRoom" value={selectedRm} valueFiled='room_id' labelFiled='room_id'
                        onChange={(event) => {
                            handleChange(event, "room")
                        }}
                        items={roomList} />
                    {error && (selectedRm.length === 0 || selectedRm[0] === "")&& <Typography style={{ marginLeft: "15px" }} className={classes.error}>請選擇治療室</Typography>}
                    <Typography className={classes.font} style={{ marginTop: "14px", marginBottom: "45px" }}>* 你亦可以在登入後更改房間</Typography>

                </>}
                maxWidth={"296px"}
                leftBtn={"取消"}
                leftAction={() => {setOpen(false); setOpenDialogueAfterFetch (false); setSelectedRm([])}}
                leftStyle={{ background: "#e3fdf7", borderColor: "#a8e2d3", color: "#289f7e" }}
                rightBtn={"確認"}
                rightAction={() => handleConfirmLogin()}
                dialogActionsDirection={"row"}
            />
        </>
    )
}