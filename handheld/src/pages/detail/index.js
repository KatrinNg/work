import React, {useRef, useState, useEffect} from "react";
import Tooltip from '@material-ui/core/Tooltip';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Fab from '@material-ui/core/Fab';
import Abstract from "./abstract/abstract";
import HealthReferenceValue from './healthReferenceValue/healthReferenceValue';
import PatientInProgress from './patientInProgress/patientInProgress';
import Treatment from "./treatment/treatment";
import { useStyles } from "./style";
import * as ActionTypes from 'redux/actionTypes';
import VoiceAlert, { voiceType } from "components/VoiceAlert/VoiceAlert";
import RemarkDialog from './treatment/remarkDialog/remarkDialog';
import ConfirmFinishDialog from "./treatment/confirmFinishDialog/confirmFinishDialog";
import moment from "moment";
export default function Detail() {
    const classes = useStyles();
    const history = useHistory();
    const childRef = useRef(null);
    const payloadRef = useRef(null);
    const configRef = useRef(null);
    const dispatch = useDispatch()
    const { g_treatment_data, g_dept, g_currentTreatment, g_isScanTreatment, g_patientDetail, g_barcode,g_activityBarcode } = useSelector(
        (state) => {
            return {
                g_treatment_data: state.detail?.treatment_data,
                g_currentTreatment: state.detail?.currentTreatment,
                g_isScanTreatment: state.detail?.isScanTreatment,
                g_patientDetail: state.detail?.patientDetail,
                g_dept: state.loginInfo?.dept,
                g_activityBarcode: state.activity?.activityBarcode,
                g_barcode: state.room?.barcode,
            }
        }
    );
    const [openRemarkDialog, setRemarkOpenDialog] = useState(false);
    const [openConfirmFinishDialog, setOpenConfirmFinishDialog] = useState(false);
    const [finisItemConfig, setFinishItemConfig] = useState({
        currentTreatment: null,
        startTreatment: null
    });
    const [remark, setRemark] = useState('');
    const [indexObj, setIndexObj] = useState(null);

    const getCurrentTreatmentIndex = () => {
        let idx = null;
        if (!g_currentTreatment) return idx;
        g_treatment_data.forEach((item, i) => {
            if (item.treatment_name === g_currentTreatment) {
                idx = i;
                return;
            }
        })

        return idx;
    }

    useEffect(() => {
        if (g_treatment_data.length === 0) {
            dispatch({type: ActionTypes.FETCH_PATIENT_DETAILS_MASTER_LIST,payload: {}})
            dispatch({type: ActionTypes.FETCH_PATIENT_DETAIL,payload: {}})
            dispatch({type: ActionTypes.FETCH_CURRENT_TREATMENT,payload: {}})
            dispatch({type: ActionTypes.FETCH_E_VITAL_LIST,payload: {}})
        }
    }, [])

    useEffect(() => {
        dispatch({type: ActionTypes.FETCH_PATIENT_PRECAUTION_ICON_LIST,payload: {}})
    }, [g_dept])

    const onChange = () => {
        console.log(g_dept)
        dispatch({
            type: ActionTypes.SET_LOGIN_ROOM,
            payload: {dept: g_dept === 'OT'? 'PT': 'OT'}
        })
    }
    const handleRemark = (remark, itemIndex, rIndex) => {
        setRemark(remark)
        setRemarkOpenDialog(true)
        setIndexObj({
            itemIndex,
            rIndex
        })
    }

    const handleCloseRemark = () => {
        setRemarkOpenDialog(false)
        setIndexObj(null)
        setRemark('')
       payloadRef.current = null
       configRef.current = null
    }

    const handleConfirmRemark = (t) => {
        
        const temp = JSON.parse(JSON.stringify(payloadRef.current ? payloadRef.current.treatment_data : g_treatment_data))
        // const temp = JSON.parse(JSON.stringify(g_treatment_data))
        dispatch({
            type: ActionTypes.FETCH_UPDATE_TREATMENT_REMARKS,
            payload: {
                callback: () => {
                    temp[indexObj.itemIndex].recordList[indexObj.rIndex].remark = t;
                    dispatch({
                        type: ActionTypes.SET_DETAIL,
                        payload: {
                            treatment_data: temp
                        }
                    })
                    let tempCurTreatment = null;
                    console.log('temp: ', temp);
                    if (configRef.current && payloadRef.current) {
                        if (configRef.current.startTreatment) {
                            tempCurTreatment = temp[configRef.current.index].treatment_name;
                            // temp[config.index].isStart = true;
                            // startTreatment = temp[config.index].treatment_seq
                            payloadRef.current = {
                                treatment_data: temp,
                                currentTreatment: tempCurTreatment,
                                // startTreatment
                            }
                            fetchStart(() => {
                                handleCloseRemark();
                            })
                        } else {
                            payloadRef.current = {
                                treatment_data: temp,
                                currentTreatment: tempCurTreatment,
                                // startTreatment
                            }
                            setDetail()
                            handleCloseRemark();
                        }
                    } else {
                        handleCloseRemark();
                    }
                    // payloadRef.current.treatment_data = temp
                    
                }
            }
        })
    }
    const handleStart = (index) => {
        
        const curIdx = getCurrentTreatmentIndex();
        if (!curIdx && curIdx !== 0) {
            setOpenConfirmFinishDialog(true)
            setFinishItemConfig({
                currentTreatment: null,
                startTreatment: g_treatment_data[index],
                index
            })
            
        } else { // if (index === currentTreatmentRef.current + 1) 
            setOpenConfirmFinishDialog(true)
            setFinishItemConfig({
                currentTreatment: g_treatment_data[curIdx],
                startTreatment: g_treatment_data[index],
                index
            })
        }
    }

    const handleStop = (index) => {
        const curIdx = getCurrentTreatmentIndex();
        if (index === curIdx ) {
            setOpenConfirmFinishDialog(true)
            setFinishItemConfig({
                currentTreatment: g_treatment_data[curIdx],
                startTreatment: null,
                index
            })
        }
    }

    const handleCloseFinishDialog = () => {
        setOpenConfirmFinishDialog(false)
    }

    const fetchStop = (callback) => {
        dispatch({
            type: ActionTypes.FETCH_SET_TREATMENT,
            payload: {
                callback: callback,
                actionType: 'END',
            }
        })
    }

    const setDetail = () => {
        // Refresh data
        dispatch({
            type: ActionTypes.SET_DETAIL,
            // payload: {
            //     treatment_data: temp,
            //     currentTreatment: tempCurTreatment,
            //     // startTreatment
            // }
            payload: payloadRef.current
        })
    }

    const fetchStart = (callback) => {
        dispatch({
            type: ActionTypes.FETCH_SET_TREATMENT,
            payload: {
                actionType: 'START',
                callback: () => {
                    if (!g_activityBarcode[g_barcode] ) {
                        console.log('g_isScanTreatment: ', g_activityBarcode[g_barcode]);
                        dispatch({
                            type: ActionTypes.SET_DETAIL,
                            payload: {
                                currentTreatment: payloadRef.current.currentTreatment
                            }
                        })
                        history.push('/activity?toDetail=1')
                        return;
                    }
                    setDetail();
                    callback();
                }
            }
        })
        
    }

    const handleConfirmFinishDialog = (config) => {
        
        const temp = JSON.parse(JSON.stringify(g_treatment_data));
        let curStopIndex = config.index
        let startTreatment = null
        
        temp.forEach((item, index) => {
            if (config.currentTreatment && item.treatment_seq === config.currentTreatment.treatment_seq) {
                curStopIndex = index;
            }
            // temp[index].isStart = false;
            // startTreatment = temp[index].treatment_seq
        })
        console.log('curStopIndex: ', curStopIndex);
        let tempCurTreatment = g_currentTreatment;
        if (config.currentTreatment) {
            console.log(config)
            fetchStop(() => {
                if (temp[curStopIndex].handheld_remark === 'Y') {
                    // if()
                    const i = temp[curStopIndex].recordList.length
                    temp[curStopIndex].recordList.push({
                        time: moment().format('hh:mm'),
                        remark: '',
                    })
                    tempCurTreatment = null;
                    configRef.current = config;
                    payloadRef.current = {
                        treatment_data: temp,
                        currentTreatment: tempCurTreatment,
                        // startTreatment
                    }
                    // if (config.startTreatment) {
                    //     tempCurTreatment = temp[config.index].treatment_name;
                    //     // temp[config.index].isStart = true;
                    //     // startTreatment = temp[config.index].treatment_seq
                    //     payloadRef.current = {
                    //         treatment_data: temp,
                    //         currentTreatment: tempCurTreatment,
                    //         // startTreatment
                    //     }
                    // }
                    handleRemark('', curStopIndex,i)
                } else {
                    tempCurTreatment = null;
                    if (config.startTreatment) {
                        tempCurTreatment = temp[config.index].treatment_name;
                        // temp[config.index].isStart = true;
                        // startTreatment = temp[config.index].treatment_seq
                        payloadRef.current = {
                            treatment_data: temp,
                            currentTreatment: tempCurTreatment,
                            // startTreatment
                        }
                        fetchStart(() => {
                            handleCloseFinishDialog()
                        })
                    } else {
                        payloadRef.current = {
                            treatment_data: temp,
                            currentTreatment: tempCurTreatment,
                            // startTreatment
                        }
                        setDetail(); //
                        handleCloseFinishDialog()
                    }
                }
            })
        } else {
            payloadRef.current = {
                treatment_data: temp,
                currentTreatment: config.startTreatment.treatment_name,
                // startTreatment a
            }
            fetchStart(() => {
                handleCloseFinishDialog()
            })
        }
        
    }
    const text = g_dept === 'PT' ? '治療' : '活動';

    const cIdx = getCurrentTreatmentIndex();
    return (
        <div className={classes.detailBox}>
            <VoiceAlert childRef={childRef} />
            {(g_currentTreatment ) && <PatientInProgress handleStop={handleStop} g_currentTreatmentIndex={cIdx} voiceAlert={childRef} data={g_treatment_data[cIdx]}/>}
            <Abstract detail={g_patientDetail}/>
            <Treatment
                g_treatment_data={g_treatment_data}
                text={text}
                handleStop={handleStop}
                handleStart={handleStart}
                handleRemark={handleRemark}
                g_currentTreatment={g_currentTreatment}
            />
            <HealthReferenceValue />
            <Tooltip  >
                <Fab onClick={onChange} color="primary" className={classes.tooltip}>
                    to {g_dept === 'OT' ? 'PT' : 'OT'}
                </Fab>
            </Tooltip>
            {openRemarkDialog && <RemarkDialog
                open={openRemarkDialog}
                onClose={handleCloseRemark}
                onConfirm={handleConfirmRemark}
                remark={remark}
            />}
            {openConfirmFinishDialog && <ConfirmFinishDialog
                config={finisItemConfig}
                open={openConfirmFinishDialog}
                onClose={handleCloseFinishDialog}
                // currentTreatment={}
                text={text}
                onConfirm={handleConfirmFinishDialog}
            />}
        </div>
    )
}