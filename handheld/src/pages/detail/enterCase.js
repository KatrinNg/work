import React, { useState, useRef, useEffect } from 'react';
import Widget from 'components/Widget/Widget';
import { Typography, makeStyles, TextField, Button, FormControl, Select, OutlinedInput, MenuItem, Backdrop, IconButton } from '@material-ui/core';
import Scan from 'components/Scan';
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
import { useStyles } from "./style";
import _, { cloneDeep } from 'lodash';
import * as ActionTypes from 'redux/actionTypes';
import CommonSpinner from "components/CommonSpinner/CommonSpinner.js"
import cookie from 'storage/cookie'


export default function EnterCase() {

    const history = useHistory();
    const dispatch = useDispatch()
    const focus = useRef()
    const { loginRoom, dept, loginHosp } = useSelector(state => state.loginInfo)
    const classes = useStyles()
    const [showSpinner, setShowSpinner] = useState(false)
    const [patientDetails, setPatientDetails] = useState(null)
    const [error, setError] = useState(false)
    const [barcodeError, setBarcodeError] = useState({
        status: false,
        message: ""
    })
    const [barcode, setBarcode] = useState({
        barcode: ""
    })
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
        if (event === "clear") {
            childRef && childRef.current.pauseVideo(voiceType.Alarm3_1)
            childRef && childRef.current.pauseVideo(voiceType.Alarm5)
            childRef && childRef.current.pauseVideo(voiceType.Magical)
            setBarcode({ ...barcode, barcode: "" });
            setError(false);
            setBarcodeError({ ...barcodeError, status: false });
        }

        if (event === "confirm") {

            if (barcode.barcode === "") {
                setError(true)
            }

            if (barcode.barcode !== "") {
                const timer = setTimeout(() => {
                    setShowSpinner(true)
                }, 1000)

                setPatientDetails(null)
                history.push("/detail")
            }
        }
    }


    return (
        <>
            <Scan getScanResult={getScanResult}/>
            <div style={{ padding: "10px 9px 8px" }}>
                <Widget title={"摘要"} >
                    <Typography className={classes.font} style={{ textAlign: "center" }}>請輸入檔案編號</Typography>

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

                <CommonSpinner display={showSpinner} />
            </div>



        </>
    )
}