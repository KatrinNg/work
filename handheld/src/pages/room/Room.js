import React, { useState, useRef, useEffect } from 'react';
import Widget from 'components/Widget/Widget';
import { Typography, makeStyles, TextField, Button, FormControl, Select, OutlinedInput, MenuItem, Backdrop } from '@material-ui/core';
import { IconButton } from "@material-ui/core";
import ColorButton from 'components/ColorButton/ColorButton';
import enterIcon from 'resource/enterRoom/icon-in.png';
import leaveIcon from 'resource/enterRoom/icon-out.png';
import CustomTextField from 'components/Input/CustomTextField.js';
import barcodeIcon from 'resource/barcode/botton-bar-icon-scan-inactive.png';
import PopupDialog from 'components/Popup/Popup.js';
import userIcon from 'resource/user/icon-user.png';
import Describe from 'components/CommonDescribe/CommonDescribe';
import { useHistory } from 'react-router-dom';
import BarCodeReader from 'react-barcode-reader';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import VoiceAlert, { voiceType } from 'components/VoiceAlert/VoiceAlert';
import useStyles from './styles';
import _, { cloneDeep } from 'lodash';
import * as ActionTypes from 'redux/actionTypes';
import CommonSpinner from "components/CommonSpinner/CommonSpinner.js"
import cookie from 'storage/cookie'
import Scan from 'components/Scan';

export default function Room() {

    const history = useHistory();
    const dispatch = useDispatch()
/*
   useEffect(()=>{
   dispatch({
    type: ActionTypes.FETCH_ROOM_IN_OUT,
                        payload: {
                            "login_id": "@CMSIT",
                            "hosp_code": "TPH",
                            "dept": "OT",
                            "room_id": "G046",    //G046    4BC  loginRoom
                            "case_no": "HN06000037Z" ,    //HN06000037Z    HN01108000T
                            "action":  "CHECKIN",
                            callback:(data)=>{
console.log(data,"room check")
                            }
                            }
                             })
    },[])*/

    const { loginRoom, dept, loginHosp } = useSelector(state => state.loginInfo)
    const classes = useStyles()
    const [showSpinner, setShowSpinner] = useState(false)
    const focus = useRef(null)
    const [open, setOpen] = useState()
    const [patientDetails, setPatientDetails] = useState(null)
    const [openReminderAfterFetch, setOpenReminderAfterFetch] = useState(false)
    const [error, setError] = useState(false)
    const [barcodeError, setBarcodeError] = useState({
        status: false,
        message: ""
    })
    const [barcode, setBarcode] = useState({
        type: "",
        barcode: ""
    })
    const [openReminder, setOpenReminder] = useState(false);
    const childRef = useRef(null);

    const openCamera = () => {
        dispatch({
            type: ActionTypes.SHOW_SCAN,
            payload: {
                showScan: true
            }
        })
    }

    const getScanResult = (res) => {
        console.log(res);
    }

    function handleClick(event) {
        if (event === "enter" || event === "leave") {
            childRef && childRef.current.pauseVideo(voiceType.Alarm3_1)
            childRef && childRef.current.pauseVideo(voiceType.Alarm5)
            childRef && childRef.current.pauseVideo(voiceType.Magical)
            setBarcode({ ...barcode, type: event })
            // setOpenReminderAfterFetch(false)
            setError(false);
            setBarcodeError({ ...barcodeError, status: false });

            focus.current.focus()
        }

        if (event === "clear") {
            childRef && childRef.current.pauseVideo(voiceType.Alarm3_1)
            childRef && childRef.current.pauseVideo(voiceType.Alarm5)
            childRef && childRef.current.pauseVideo(voiceType.Magical)
            setBarcode({ ...barcode, type: "", barcode: "" });
            // setOpenReminderAfterFetch(false)
            setError(false);
            setBarcodeError({ ...barcodeError, status: false });
        }

        if (event === "confirm") {

            if (barcode.type === "" || barcode.barcode === "") {
                setError(true)
            }

            if (barcode.barcode !== "") {
                const timer = setTimeout(() => {
                    setShowSpinner(true)
                }, 1000)

                setPatientDetails(null)
                dispatch({
                    type: ActionTypes.FETCH_ROOM_IN_OUT,
                    payload: {
                        "login_id": cookie.getCookie("user"),
                        "hosp_code": loginHosp,
                        "dept": dept,
                        "room_id": loginRoom,    //G046    4BC  loginRoom
                        "case_no": barcode.barcode,    //HN06000037Z    HN01108000T
                        "action": barcode.type === "enter" ? "CHECKIN" : "PRE-EXIT",
                        callback: (data) => {
                            clearTimeout(timer)
                            setShowSpinner(false)
                            if (data.response) {

                                if (data.response.Status === "CHECKIN SUCCESS" || data.response.status === "PRE-EXIT") {

                                    dispatch({
                                        type: ActionTypes.FETCH_ROOM_TREATMENT_RECORD,
                                        payload: {
                                            "login_id":cookie.getCookie("user"),
                                            "hosp_code":loginHosp,
                                            "dept":dept,
                                            "case_no":barcode.barcode,
                                            callback: ({treatment_record})=>{
                                            const attend = treatment_record.length > 0 ? "subsequnet" : "first"
                                                setPatientDetails({details:data.response, attend: attend});

                                                dispatch({
                                                           type: ActionTypes.SET_ROOM,
                                                           payload: {
                                                                     barcode: barcode.barcode,
                                                                     }
                                                           })
                                                setOpen(true);
                                            }
                                        }
                                    })
                                } else if(data.response.Status === "CHECKOUT SUCCESS"){

                                    dispatch({
                                            type: ActionTypes.SET_ROOM,
                                                payload: {
                                                    barcode: '',
                                                }
                                            })
                                            history.push("/home")
                                }
                            } else {
                                if (data.status === "Bad Request") {
                                    if (data.StatusCode === "E001" || data.StatusCode === "E003") {
                                        //沒有此病人或活動            //病人已進入治療室
                                        setBarcodeError({ ...barcodeError, status: true, message: data.message })
                                        childRef && childRef.current.playVideo(voiceType.Alarm3_1)
                                    } else if (data.StatusCode === "E002" || data.StatusCode === "E004") {
                                        //錯誤到診!!! 病人應到:          //病人沒有進入治療室
                                        setBarcodeError({ ...barcodeError, status: true, message: data.message });
                                        childRef && childRef.current.playVideo(voiceType.Alarm5)
                                    } else if(data.StatusCode === "E007"){
                                    //活動已在進行中
                                    setBarcodeError({ ...barcodeError, status: true, message: data.message });
                                    childRef && childRef.current.playVideo(voiceType.Error01)
                                    }
                                }
                            }
                        },
                    }
                })
            }
        }
    }


    const onEnterRoom = () => {
        if (barcode.type === "enter") {
            history.push("/detail")
        } else {

        }
        setOpen(false)

    }

    const handleScan = () => {
        // history.push("/scan")
    }

    const handleReminder = () => {
        const timer = setTimeout(() => {
            setShowSpinner(true)
        }, 2000)
        dispatch({
            type: ActionTypes.FETCH_ROOM_IN_OUT,
            payload: {
                "login_id": cookie.getCookie("user"),
                "hosp_code": loginHosp,
                "dept": dept,
                "room_id": loginRoom,
                "case_no": barcode.barcode,
                "action": "CHECKOUT",
                callback: (data) => {
                    if (data.response.Status === "CHECKOUT SUCCESS") {
                        clearTimeout(timer)
                        setOpen(false);
                        setShowSpinner(false)
                        setOpenReminder(true);
                    }
                }
            }
        })
    }

    const handleConfirm = () => {
        dispatch({
            type: ActionTypes.SET_ROOM,
            payload: {
                barcode: '',
            }
        })
        history.push("/home")
    }

    return (
        <>
            <Scan getScanResult={getScanResult}/>
            <div style={{ padding: "10px 9px 8px" }}>
                <Widget title={"進入或離開"} >
                    <Typography className={classes.font} style={{ textAlign: "center" }}>請選擇可以去進入或離開以及輸入檔案編號</Typography>
                    <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
                        <ColorButton
                            className={classes.enterBtn}
                            variant="contained"
                            color="primary"
                            style={{
                                background: "#aae8ab",
                                border: "1px solid #70cf72",
                                borderRadius: "10px",
                                color: "#000000", opacity: barcode.type === "enter" ? 1 : 0.3
                            }}
                            onClick={() => handleClick("enter")}
                        >
                            <div className={classes.btnLogoDiv}>
                                <img src={enterIcon} style={{ height: "20px", width: "20px" }} />
                                進入
                            </div>
                        </ColorButton>

                        <ColorButton
                            className={classes.leaveBtn}
                            variant="contained"
                            style={{
                                background: "#ffa2a2",
                                border: "1px solid #f07474",
                                borderRadius: "10px",
                                color: "#000000", opacity: barcode.type === "leave" ? 1 : 0.3
                            }}
                            onClick={() => handleClick("leave")}
                        >
                            <div className={classes.btnLogoDiv}>
                                <img src={leaveIcon} style={{ height: "20px", width: "20px" }} />
                                離開
                            </div>
                        </ColorButton>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "260px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", width: "100%", flexDirection: "column" }}>
                                <div>{error && barcode.type === "" && <Typography style={{ marginLeft: "15px" }} className={classes.error}>請選擇治療室</Typography>}</div>
                                <Typography style={{ marginTop: "27px" }} className={classes.font}>檔案編號</Typography>
                            </div>

                            <div style={{ display: "flex", width: "260px" }}>
                                <CustomTextField
                                    ref={focus}
                                    helperText={error && barcode.barcode === "" ? <span className={classes.error}>請輸入檔案編號</span> : barcodeError.status ? <span className={classes.error}>{barcodeError.message}</span> : ""}
                                    value={barcode.barcode}
                                    onChange={e => {
                                        let value = e.target.value

                                        if (barcodeError.status === true) {
                                            setBarcodeError({ ...barcodeError, status: false, message: "" })
                                        }
                                        setBarcode({ ...barcode, barcode: value.replace(/[^A-Za-z0-9()\s]/g, '') })
                                    }}
                                    className={classes.textField}
                                />
                                <VoiceAlert childRef={childRef} />
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <IconButton onClick={() => openCamera()} className={classes.barcodeDiv}>
                                        <div>
                                            <img className={classes.barcodeIcon} src={barcodeIcon} />
                                        </div>
                                    </IconButton>
                                    <Typography className={classes.font} style={{ fontSize: "14px", marginLeft: "6px" }}>掃描</Typography>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "21px" }}>
                                <ColorButton
                                    className={classes.clearBtn}
                                    variant="contained"
                                    color="primary"
                                    style={{
                                        background: "#e3fdf7",
                                        border: "1px solid #a8e2d3", color: "#289f7e"
                                    }}
                                    onClick={() => handleClick("clear")}
                                >
                                    清除
                                </ColorButton>
                                <ColorButton
                                    className={classes.clearBtn}
                                    variant="contained"
                                    color="primary"
                                    style={{
                                        background: "#e3fdf7",
                                        border: "1px solid #a8e2d3", color: "#289f7e"
                                    }}
                                    onClick={() => handleClick("confirm")}
                                >
                                    確認
                                </ColorButton>
                            </div>
                        </div>
                    </div>
                </Widget>

                <PopupDialog
                    open={open}
                    title={barcode.type === "enter" ? "提示" : "離開"}
                    content={<>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}>
                            <img src={userIcon} style={{ marginRight: "14px" }} />
                            <div >
                                <Describe label={'病人姓名'} value={patientDetails?.details?.patient_name} margin={'0'}></Describe>
                            </div>
                            {(() => {

                                const inOut = barcode.type === "enter" ? "login" : "logout"

                                if ((barcode.type === "enter" || barcode.type === "leave") &&
                                    patientDetails?.details?.continuous_spo2 === "Y" ||

                                    (patientDetails?.details?.[`${patientDetails?.attend}_attend_${inOut}`].substring(0,1) === "Y" || patientDetails?.details?.[`${patientDetails?.attend}_attend_${inOut}`].substring(1,2) === "Y" )

                                    && open) {

                                    childRef && childRef.current.playVideo(voiceType.Magical)
                                    document.querySelector("#customVoiceAlertVideo_Magical").addEventListener("ended", () => {
                                        childRef && childRef.current.playVideo(voiceType.Alarm3_1)
                                    }, false);
                                } else if ((barcode.type === "enter" || barcode.type === "leave") && open) {

                                    childRef && childRef.current.playVideo(voiceType.Magical)
                                }


                            })()}
                        </div>

                        {barcode.type === "enter" && <div>
                            <Typography className={classes.font}>預防措施</Typography>
                            <div style={{ marginTop: "18px", marginBottom: "19px" }}>
                                {patientDetails?.details?.precautions !== "" && patientDetails?.details?.precautions.split(";").length > 0 && patientDetails?.details?.precautions.split(";").map(item => {

                                    return <img src={require(`resource/OTPT/${item}.png`)} className={classes.icon} />
                                })}
                            </div>
                        </div>}
                        <div>
                            <Typography className={classes.font}>備註</Typography>
                            <Typography style={{ fontSize: "16px", fontWeight: "600" }}>
                                {(()=>{
                                    if(barcode.type === "enter" || barcode.type === "leave"){
                                        const inOut = barcode.type === "enter" ? "login" : "logout"
                                        const arr = []
                                        if(patientDetails?.details?.continuous_spo2 === "Y" ){
                                           barcode.type === "enter" ?  arr.push("全程血氧監測") : arr.push("收取Oximeter")
                                        }

                                        if(patientDetails?.details?.[`${patientDetails?.attend}_attend_${inOut}`].substring(0,1) === "Y"){
                                             arr.push("血壓-[企]")
                                        }
                                        if(patientDetails?.details?.[`${patientDetails?.attend}_attend_${inOut}`].substring(1,2) === "Y"){
                                             arr.push("血壓-[坐]")
                                        }
                                        if(patientDetails?.details?.[`${patientDetails?.attend}_attend_${inOut}`].substring(2,3) === "Y"){
                                             arr.push("量度血氧")
                                        }
                                        if(patientDetails?.details?.[`${patientDetails?.attend}_attend_${inOut}`].substring(3,4) === "Y"){
                                             arr.push("見治療師")
                                        }
                                        return arr.join(", ")

                                    }

                                })()  }

                            </Typography>
                        </div>
                    </>
                    }
                    maxWidth={"303px"}
                    leftBtn={barcode.type === "enter" ? "確認" : "確認離開"}
                    leftAction={barcode.type === "enter" ? onEnterRoom : handleReminder}
                    leftStyle={{ fontSize: "18px", height: "40px" }}
                    rightBtn={barcode.type !== "enter" && "返回"}
                    rightAction={() => {
                        setOpen(false)
                    }}
                    rightStyle={{ fontSize: "16px", height: "40px", background: "#e3fdf7", border: "1px solid #a8e2d3", color: "#86c0b0" }}
                    dialogActionsDirection={"column"}
                />

                <PopupDialog
                    open={openReminder}
                    title={"通知"}
                    content={<>
                        <Typography className={classes.font} style={{ textAlign: "center" }}>病人離開前請記錄離開時間</Typography>
                    </>
                    }
                    maxWidth={"303px"}
                    leftBtn={"確認"}
                    leftAction={handleConfirm}
                    leftStyle={{ fontSize: "18px", height: "40px" }}
                    dialogActionsDirection={"column"}
                />


                <CommonSpinner display={showSpinner} />
            </div>



        </>
    )
}