import React, { useState, useEffect } from "react";
import closeBtn from 'resource/barcode/icon-times.svg';
import scanBorder from 'resource/barcode/group-2.svg';
import { useStyles } from './style';
import { IconButton } from '@material-ui/core';
import { useDispatch } from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';

import {
  BrowserBarcodeReader,
  NotFoundException,
  ChecksumException,
  FormatException
} from "@zxing/library";

export default function(props) {
    const classes = useStyles();
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const { 
        getScanResult,
    } = props;

    const codeReader = new BrowserBarcodeReader();
    const dispatch = useDispatch()

    useEffect(() => {
        initCamera();
  }, []);

    const initCamera = () => {
        codeReader.getVideoInputDevices().then(videoInputDevices => {
            setupDevices(videoInputDevices);
        }).catch(err => {
            console.error(err);
        });
    }

    const setupDevices = (videoInputDevices) => {
        // selects first device
        if (videoInputDevices && videoInputDevices.length) {
            setSelectedDeviceId(videoInputDevices[4].deviceId);
        }
        // setup devices dropdown
        // if (videoInputDevices.length >= 1) {
        //     setVideoInputDevices(videoInputDevices)
        // }
    }

    const resetClick = () => {
        codeReader.reset();
        dispatch({
            type: ActionTypes.SHOW_SCAN,
            payload: {
                showScan: false
            }
        })
    }

    const decodeContinuously = (selectedDeviceId) => {
        codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId,"video",(result, err) => {
            if (result) {
                getScanResult && getScanResult(result)
                dispatch({
                    type: ActionTypes.SHOW_SCAN,
                    payload: {
                        showScan: false,
                        barcode: result.text,
                    }
                })
            }
            if (err) {
                if (err instanceof NotFoundException) {
                console.log("No QR code found.");
                }

                if (err instanceof ChecksumException) {
                console.log("A code was found, but it's read value was not valid.");
                }

                if (err instanceof FormatException) {
                console.log("A code was found, but it was in a invalid format.");
                }
            }
        });
    }

    useEffect(
        deviceId => {decodeContinuously(selectedDeviceId);},
    [selectedDeviceId]);

    return (
        <div className={classes.mainBox}>
            <div>
                <IconButton aria-label="close" onClick={resetClick}>
                    <img src={closeBtn} className={classes.closeBtn}/>
                </IconButton>
                <div className={classes.scanTips}>請掃描手帶上的條碼</div>
                <img src={scanBorder} className={classes.scanBorder}/>
                <div className={classes.centreLine}></div>
                <video className={classes.video} id="video" />
            </div>
      </div>
  );
}
