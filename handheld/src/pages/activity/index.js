import React, { useState, useRef, useEffect } from 'react';
import Widget from 'components/Widget/Widget';
import { Container, Typography, CssBaseline, makeStyles, TextField, Button, FormControl, Select, OutlinedInput, MenuItem, IconButton } from '@material-ui/core';
import ColorButton from 'components/ColorButton/ColorButton';
import { useSelector, useDispatch } from 'react-redux';
import CustomTextField from 'components/Input/CustomTextField.js';
import barcodeIcon from 'resource/barcode/botton-bar-icon-scan-inactive.png';
import PopupDialog from 'components/Popup/Popup.js';
import userIcon from 'resource/user/icon-user.png';
import Describe from 'components/CommonDescribe/CommonDescribe';
import startIcon from 'resource/activity/icon-start.png';
import endIcon from 'resource/activity/icon-stop.png';
import useStyles from './styles';
import BarCodeReader from 'react-barcode-reader';
import { useHistory } from 'react-router-dom';
import * as ActionTypes from 'redux/actionTypes';
import VoiceAlert, { voiceType } from 'components/VoiceAlert/VoiceAlert';
import _, { cloneDeep } from 'lodash';
import CommonSpinner from "components/CommonSpinner/CommonSpinner.js"
import { getSearchParams } from 'utility/utils';
import Scan from 'components/Scan';
import cookie from 'storage/cookie'

export default function Activity() {

    const history = useHistory();
    const classes = useStyles();
    const focus = useRef(null)
    const [openStartReminder, setOpenStartReminder] = useState(false);
    const [openEndReminder, setOpenEndReminder] = useState(false);
    const [openReminder, setOpenReminder] = useState(false);
    const [error, setError] = useState(false);

    const [endReminder, setEndReminder] = useState("")
    const [patientDetails, setPatientDetails] = useState(null)
    const [showSpinner, setShowSpinner] = useState(false)

    const childRef = useRef(null);
    const [barcode, setBarcode] = useState({
        type: "start",
        fileBarcode: "",
        activityBarcode: ""
    })
    const [barcodeError, setBarcodeError] = useState({
        fileStatus: false,
        activityStatus: false,
        fileMessage: "",
        activityMessage: ""
    });

    const dispatch = useDispatch()
    const { g_treatment_data, g_currentTreatment, g_activityBarcode, g_barcode } = useSelector(
        (state) => {
            return {
                g_treatment_data: state.detail?.treatment_data,
                g_currentTreatment: state.detail?.currentTreatment,
                g_activityBarcode: state.activity?.activityBarcode,
                g_barcode: state.room?.barcode,
            }
        }
    );
    const { loginRoom, dept, loginHosp } = useSelector(state => state.loginInfo)

    useEffect(() => {
        if (getSearchParams(history.location.search, 'toDetail') === '1') {
            setBarcode({
                type: 'start',
                fileBarcode: g_barcode,
                activityBarcode: ''
            })
        }
    }, [])
/*
       useEffect(() => {
            dispatch({
                type: ActionTypes.FETCH_SET_TREATMENT,
                payload: {
                    callback: ((data) => { console.log(data, "data1") }),
                    actionType: 'START',
                }
            })
    
            //StatusCode: "E005"
            //message: "活動不存在!:8888401"
            //status: "Bad Request"
    
        }, [])*/

    //const activityBarcodeNumber = ["8880504", "8880539", "8880521", "8880553", "8880277", "8880518", "8880517", "8880546", "8880545"]

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
        if (event === "start" || event === "end") {
            setBarcode({ ...barcode, type: event })
            setError(false);
            setBarcodeError({ ...barcodeError, fileStatus: false, fileMessage: "", activityStatus: false, activityMessage: "" });
            childRef && childRef.current.pauseVideo(voiceType.Alarm3_1)
            focus.current.focus()
        }

        if (event === "clear") {
            childRef && childRef.current.pauseVideo(voiceType.Alarm3_1)
            setBarcode({ ...barcode, type: "", fileBarcode: "", activityBarcode: "" })
            setError(false);
            setBarcodeError({ ...barcodeError, fileStatus: false, fileMessage: "", activityStatus: false, activityMessage: "" });
        }

        if (event === "confirm") {

            if (barcode.type === "") {
                setError(true)
            }

            if (barcode.type === "end" && barcode.fileBarcode === "") {
                setError(true)
            }

            if (barcode.type === "start" && (barcode.fileBarcode === "" || barcode.activityBarcode === "")) {
                setError(true)
            }


            if (barcode.type === "start") {

                if (barcode.activityBarcode !== "" && barcode.fileBarcode !== "") {
                    setPatientDetails(null)
                    const timer = setTimeout(() => {
                        setShowSpinner(true)
                    }, 1000)
                    dispatch({
                        type: ActionTypes.FETCH_SET_TREATMENT,
                        payload: {
                            login_id: cookie.getCookie("user"),
                            hosp_code: loginHosp,
                            dept: dept,
                            room_id :loginRoom,    //G046     4BC
                            case_no: barcode.fileBarcode,     //HN06000037Z     HN01108000T
                            barcode: barcode.activityBarcode,  // 8880539
                            actionType: "START",
                            callback: (data) => {
                                clearTimeout(timer)
                                setShowSpinner(false)

                                if (data.response) {
                                    if (data.response.status === "START SUCCESS") {

                                        dispatch({
                                            type: ActionTypes.FETCH_PATIENT_DETAIL,
                                            payload: {
                                                login_id: cookie.getCookie("user"),
                                                dept: dept,
                                                case_no: barcode.fileBarcode,
                                                hosp_code: loginHosp,
                                                room_id: loginRoom,
                                                callback: ({ patient_details }) => {

                                                    setPatientDetails({ patient_name: patient_details.patient_name, record: data.response.treatment_record[0] })

                                                    setOpenStartReminder(true);
                                                }
                                            }
                                        })
                                    }
                                } else if (data.status === "Bad Request") {

                                    if (data.StatusCode === "E001" || data.StatusCode === "E003") {
                                        //沒有此病人                       /病人已進入治療室
                                        setBarcodeError({ ...barcodeError, fileStatus: "true", fileMessage: data.message });
                                        childRef && childRef.current.playVideo(voiceType.Alarm3_1)

                                    } else if (data.StatusCode === "E005" || data.StatusCode === "E008" || data.StatusCode === "E007") {
                                        //活動不存在!                             //其他活動正在進行中，請先完成      //活動已在進行中
                                        setBarcodeError({ ...barcodeError, activityStatus: "true", activityMessage: data.message })
                                        childRef && childRef.current.playVideo(voiceType.Error01)
                                    } else if (data.StatusCode === "E006") {
                                        //此活動已被停用
                                        setBarcodeError({ ...barcodeError, activityStatus: "true", activityMessage: data.message })
                                    } else if(data.StatusCode === "E002" || data.StatusCode === "E004"){
                                    //錯誤到診!!! 病人應到:                  //病人沒有進入治療室
                                    setBarcodeError({ ...barcodeError, fileStatus: "true", fileMessage: data.message });
                                    childRef && childRef.current.playVideo(voiceType.Alarm5)
                                    }

                                }
                            }
                        }
                    })
                }
            }


            if (barcode.type === "end" && barcode.fileBarcode !== "") {
                const timer = setTimeout(() => {
                    setShowSpinner(true)
                }, 1000)
                setPatientDetails(null)

                dispatch({
                    type: ActionTypes.FETCH_SET_TREATMENT,
                    payload: {
                        login_id: cookie.getCookie("user"),
                        hosp_code: loginHosp,
                        dept: dept,
                        room_id : loginRoom,    //G046     4BC
                        case_no: barcode.fileBarcode,     //HN06000037Z     HN01108000T
                        barcode: barcode.activityBarcode,  // 8880539
                        actionType: "END",
                        callback: (data) => {
                            clearTimeout(timer)
                            setShowSpinner(false)

                            if (data.response && data.response.status === "END SUCCESS") {
                                setPatientDetails({ record: data.response.treatment_record[0] })

                                setOpenEndReminder(true);
                            } else if (data.status === "Bad Request") {

                                if (data.StatusCode === 'E001') {
                                    // 沒有此病人
                                    setBarcodeError({ ...barcodeError, fileStatus: "true", fileMessage: data.message })
                                    childRef && childRef.current.playVideo(voiceType.Alarm3_1)
                                }
                            }
                        }
                    }
                })

            }

        }
    }

    const handleStart = () => {
        if (barcode.type === "start") {
            let idx = null;
            g_treatment_data.forEach((item, i) => {
                if (item.treatment_name === g_currentTreatment) {
                    idx = i;
                    return;
                }
            })
            if (idx || idx === 0) {

                const temp = JSON.parse(JSON.stringify(g_treatment_data))

                // temp[g_currentTreatmentIndex].isStart = true;
                dispatch({
                    type: ActionTypes.SET_ACTIVITY,
                    payload: {
                        activityBarcode: {
                            ...g_activityBarcode,
                            [barcode.fileBarcode]: barcode.activityBarcode
                        },
                    }
                })
                dispatch({
                    type: ActionTypes.SET_DETAIL,
                    payload: {
                        treatment_data: temp,
                        isScanTreatment: true,
                        startTreatment: temp[idx].treatment_seq,
                        // startTreatment: temp[idx].treatment_seq,
                    }
                })
                dispatch({
                    type: ActionTypes.SET_ROOM,
                    payload: {
                        barcode: '',
                    }
                })
            }
            // history.push("/home")
        }
        history.push("/home")
        setOpenStartReminder(false)
        setOpenEndReminder(false)
    }

    const handleOpenReminder = () => {


        if (endReminder === "") {
            setOpenStartReminder(false)
            setOpenEndReminder(false)
            setOpenReminder(true)

        } else {
            const timer = setTimeout(() => {
                setShowSpinner(true)
            }, 1000)
            dispatch({
                type: ActionTypes.FETCH_UPDATE_TREATMENT_REMARKS,
                payload: {
                    login_id: cookie.getCookie("user"),
                    hosp_code: loginHosp,
                    dept: dept,
                    room_id: loginRoom,
                    case_no: barcode.fileBarcode,
                    treatment_record_id: patientDetails?.record?.treatment_record_id,
                    handheld_remark_details: endReminder,
                    callback: (data) => {
                        if (data) {
                            clearTimeout(timer)
                            setOpenStartReminder(false)
                            setOpenEndReminder(false)
                            setOpenReminder(true)
                        }
                    }
                }
            })

        }

    }

    return <>
        <Scan getScanResult={getScanResult}/>
        <div style={{ padding: "10px 9px 8px" }}>
            <CommonSpinner display={showSpinner} />
            <Widget title={"活動"} >
                <VoiceAlert childRef={childRef} />
                <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
                    <ColorButton
                        className={classes.enterBtn}
                        variant="contained"
                        color="primary"
                        style={{
                            background: "#aae8ab",
                            border: "1px solid #70cf72",
                            borderRadius: "10px",
                            color: "#000000", opacity: barcode.type === "start" ? 1 : 0.3
                        }}
                        onClick={() => handleClick("start")}
                    >
                        <div className={classes.btnLogoDiv}>
                            <img src={startIcon} style={{ height: "20px", width: "20px" }} />
                            開始
                        </div>
                    </ColorButton>

                    <ColorButton
                        className={classes.leaveBtn}
                        variant="contained"
                        style={{
                            background: "#ffa2a2",
                            border: "1px solid #f07474",
                            borderRadius: "10px",
                            color: "#000000", opacity: barcode.type === "end" ? 1 : 0.3
                        }}
                        onClick={() => handleClick("end")}
                    >
                        <div className={classes.btnLogoDiv}>
                            <img src={endIcon} style={{ height: "20px", width: "20px" }} />
                            停止
                        </div>
                    </ColorButton>
                </div>

                <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", width: "200px", flexDirection: "column" }}>
                        <div>{error && barcode.type === "" && <Typography style={{ marginLeft: "-16px" }} className={classes.error}>請選擇開始或停止</Typography>}</div>

                        <Typography className={classes.font} style={{ textAlign: "center", justifyContent: "center", alignItems: "center", }}>請輸入或掃描檔案編號{barcode.type === "start" && "及活動編號"}</Typography>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "260px" }}>

                        <Typography style={{ marginTop: "27px" }} className={classes.font}>檔案編號</Typography>


                        <div style={{ display: "flex", width: "260px" }}>
                            <CustomTextField
                                ref={focus}
                                helperText={error && barcode.fileBarcode === "" ? <span className={classes.error}>請輸入檔案編號</span> : barcodeError.fileStatus ? <span className={classes.error}>{barcodeError.fileMessage}</span> : ""}
                                value={barcode.fileBarcode}
                                onChange={e => {
                                    let value = e.target.value

                                    setBarcode({ ...barcode, fileBarcode: value.replace(/[^A-Za-z0-9()\s]/g, '') })

                                    setBarcodeError({ ...barcodeError, fileStatus: false, fileMessage: "", activityStatus: false, activityMessage: "" })

                                    if (error === true) {
                                        setError(false)
                                    }

                                }}
                                className={classes.textField}
                            />

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <IconButton onClick={() => openCamera()} className={classes.barcodeDiv}>
                                    <div>
                                        <img className={classes.barcodeIcon} src={barcodeIcon} />
                                    </div>
                                </IconButton>
                                <Typography className={classes.font} style={{ fontSize: "14px", marginLeft: "6px" }}>掃描</Typography>
                            </div>
                        </div>

                        {(barcode.type === "start" || barcode.type === "") && <>
                            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", width: "100%", flexDirection: "column" }}>
                                <Typography className={classes.font}>活動編號</Typography>
                            </div>

                            <div style={{ display: "flex", width: "260px" }}>
                                <CustomTextField
                                    ref={focus}
                                    helperText={error && barcode.activityBarcode === "" ? <span className={classes.error}>請輸入活動編號</span> : barcodeError.activityStatus ? <span className={classes.error}>{barcodeError.activityMessage}</span> : ""}

                                    value={barcode.activityBarcode}
                                    onChange={e => {

                                        let value = e.target.value


                                        setBarcode({ ...barcode, activityBarcode: value.replace(/[^A-Za-z0-9()\s]/g, '') })

                                        setBarcodeError({ ...barcodeError, fileStatus: false, fileMessage: "", activityStatus: false, activityMessage: "" })

                                        if (error === true) {
                                            setError(false)
                                        }

                                    }}
                                    className={classes.textField}
                                />
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <IconButton onClick={() => openCamera()} className={classes.barcodeDiv}>
                                        <div>
                                            <img className={classes.barcodeIcon} src={barcodeIcon} />
                                        </div>
                                    </IconButton>
                                    <Typography className={classes.font} style={{ fontSize: "14px", marginLeft: "6px" }}>掃描</Typography>
                                </div>
                            </div>
                        </>}


                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "21px" }}>
                            <ColorButton
                                className={classes.clearBtn}
                                variant="contained"
                                color="primary"
                                style={{
                                    background: "#e3fdf7",
                                    border: "1px solid #a8e2d3",
                                    color: "#289f7e",
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
                                    background: "#39ad90",
                                    color: "#ffffff",
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
                open={openStartReminder}
                title={"提示(運動前)"}
                content={<>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}>
                        <img src={userIcon} style={{ marginRight: "14px" }} />
                        <div >
                            <Describe label={'病人姓名'} value={patientDetails?.patient_name} margin={'0'}></Describe>
                            {(() => {

                                if (barcode.type === "start" && openStartReminder && patientDetails?.record?.before_spo2) {

                                    childRef && childRef.current.playVideo(voiceType.Magical)
                                    document.querySelector("#customVoiceAlertVideo_Magical").addEventListener("ended", () => {
                                        childRef && childRef.current.playVideo(voiceType.Alarm3_1)
                                    }, false);
                                } else if (barcode.type === "start" && openStartReminder) {
                                    childRef && childRef.current.playVideo(voiceType.Magical)
                                }

                            })()}
                        </div>
                    </div>

                    <div>
                        <Typography className={classes.font}>備註</Typography>
                        <Typography style={{ fontSize: "16px", fontWeight: "600" }}>{
                            patientDetails?.record?.before_spo2 && patientDetails?.record?.before_bp ? "量度血氧, 量度血壓"
                                :
                                patientDetails?.record?.before_spo2 ? "量度血氧" : patientDetails?.record?.before_bp ? "量度血壓" : ""
                        }</Typography>
                    </div>
                </>
                }
                maxWidth={"303px"}
                leftBtn={"確認"}
                leftAction={handleStart}
                leftStyle={{ fontSize: "18px", height: "40px" }}
                dialogActionsDirection={"column"}
            />

            <PopupDialog
                open={openEndReminder}
                title={"備註"}
                content={<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {(() => {

                        if (barcode.type === "end" && openEndReminder && patientDetails?.record?.after_spo2) {

                            childRef && childRef.current.playVideo(voiceType.Magical)
                            document.querySelector("#customVoiceAlertVideo_Magical").addEventListener("ended", () => {
                                childRef && childRef.current.playVideo(voiceType.Alarm3_1)
                            }, false);
                        } else if (barcode.type === "end" && openEndReminder) {
                            childRef && childRef.current.playVideo(voiceType.Magical)
                        }
                    })()}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "17px" }}>
                        <Typography className={classes.font}>備註可以於摘要內查閱:</Typography>
                    </div>
                    <CustomTextField value={endReminder} onChange={e => setEndReminder(e.target.value)} multiline rows={3} className={classes.textField} style={{ width: "258px" }} />
                </div>
                }
                maxWidth={"303px"}
                leftBtn={"確認"}
                leftAction={handleOpenReminder}
                leftStyle={{ fontSize: "18px", height: "40px" }}
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
                leftAction={handleStart}
                leftStyle={{ fontSize: "18px", height: "40px" }}
                dialogActionsDirection={"column"}
            />
        </div>
    </>
}