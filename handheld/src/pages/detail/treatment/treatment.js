import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useStyles } from "./style";
import ColorButton from 'components/ColorButton/ColorButton';
import { Grid } from "@material-ui/core";
import Widget from "components/Widget/Widget";
import Describe from 'components/CommonDescribe/CommonDescribe';
import stop from 'resource/detail/icon-stop.svg';
import startIcon from 'resource/detail/icon-start.svg';
import triangle from 'resource/detail/icon-triangle.svg';
import edit from 'resource/detail/icon-pen.svg';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment';


export default function Treatment({g_treatment_data, text, handleStop, handleStart, handleRemark, g_currentTreatment}) {
    const classes = useStyles();
    const dispatch = useDispatch()
    

    // const currentTreatmentRef = useRef(null);

    
    const renderButton = (item, index) => {
        let isStart = g_currentTreatment === item.treatment_name;
        return <>
            <ColorButton
                className={classes.rightBtnStyle}
                variant="contained"
                color={isStart ? 'default' : 'primary'}
                disabled={isStart ? true: false}
                style={{ width: 80, height: 36, marginRight: 10, paddingLeft: 8,paddingRight: 8 }}
                onClick={() => handleStart(index)}
            >
                {isStart ? '':<img  src={startIcon} className={classes.startBtn} />}
                <span>{isStart ? '已': ''}開始</span>
            </ColorButton>
            <ColorButton
                className={classes.rightBtnStyle}
                variant="contained"
                color={!isStart ? 'default' : 'primary'}
                disabled={!isStart ? true: false}
                style={{ width: 80, height: 36,paddingLeft: 8,paddingRight: 8 }}
                onClick={() => handleStop(index)}
            >
                <img src={stop} className={classes.stopBtn} />
                <span>停止</span>
            </ColorButton>
        </>
    }

    const renderTreatment = () => {
        return g_treatment_data.map((item, index) => {
            const NumberOfAlternativeTreatments = item.treatment_optional ?
                <div>
                    <span>可替補{text}</span>
                    <span className={classes.numberStyle}>{item.treatment_optional}</span>
                </div> : '';
            // if (isStart) {
            //     currentTreatmentRef.current = index;
            // }
            return <div key={index} style={{ marginBottom: 10 }}><Widget noBodyPadding title={text + item.treatment_seq} headerActionSlot={NumberOfAlternativeTreatments}>
                <Grid className={classes.treatmentBox}>
                    <Grid style={{ margin: '0 0 20px 13px' }}>
                        <Describe label={text + '名稱'} margin="0" value={item.treatment_name}></Describe>
                        <Grid style={{ margin: '22px 0' }}>
                            {renderButton(item, index)}
                        </Grid>
                        {item.recordList?.length > 0 && <Describe label={text + '記錄'} margin="0 0 20px 0">
                            <Grid container style={{ margin: '10px 0 0 -13px', width: 'calc(100% + 13px)' }}>
                                {
                                    item.recordList.map((d, i) => {
                                        return (
                                            <Grid key={d + i} container alignItems="center" className={classes.treatmentRecordItem}>
                                                <Grid xs item>{d.treatment_end_dt ? moment(d.treatment_end_dt).format('HH:mm') : ''}</Grid>
                                                <Grid container item alignItems="center" justifyContent="flex-end" style={{flex: 1, overflow: 'hidden'}} >
                                                    <div className={classes.remark}>備注: { d.remark}</div>
                                                </Grid>
                                                <IconButton aria-label="delete" onClick={() => { handleRemark(d.remark, index, i) }} className={classes.treatmentEditIcon}>
                                                    <img src={edit} />
                                                </IconButton>
                                            </Grid>
                                        )
                                    })
                                }
                            </Grid>
                        </Describe>}
                        <Describe label={'時間長度'} margin="0" value={item.duration + ' 分鐘'}></Describe>
                    </Grid>
                    <Grid>
                        <Grid className={classes.treatmentValue}>
                            <Describe label={text + '前測量'} margin="0">
                                {item.befor_bp === 'Y' ? <>
                                    <img src={triangle} className={classes.treatmentIcon} />
                                    <span className={`${classes.treatmentLabel} ${classes.treatmentMargin}`}>BP</span>
                                </> : ''
                                }
                                {
                                    item.befor_spo2 === 'Y' ? <><img src={triangle} className={classes.treatmentIcon} />
                                        <span className={classes.treatmentLabel}>SpO₂</span></> : ''
                                }

                            </Describe>
                        </Grid>
                        <Grid className={classes.treatmentValue}>
                            <Describe label={text+ '後測量'} margin="0">
                                {item.after_bp === 'Y' ? <>
                                    <img src={triangle} className={classes.treatmentIcon} />
                                    <span className={`${classes.treatmentLabel} ${classes.treatmentMargin}`}>BP</span>
                                </> : ''
                                }
                                {
                                    item.after_spo2 === 'Y' ? <><img src={triangle} className={classes.treatmentIcon} />
                                        <span className={classes.treatmentLabel}>SpO₂</span></> : ''
                                }
                                {/* <img src={triangle} className={classes.treatmentIcon}/>
                            <span className={classes.treatmentLabel}>BP</span> */}
                            </Describe>
                        </Grid>
                    </Grid>
                    <Grid className={classes.treatmentItem}>
                        <Describe label={'Position'} value={item.position}></Describe>
                        <Describe label={'Side / Direction'} value={item.side}></Describe>
                        <Describe label={'Region'} value={item.region}></Describe>
                        <Describe label={'Remarks'} value={item.remark} margin='0'></Describe>
                    </Grid>
                </Grid>
            </Widget></div>
        })
    }

    

    return (
        <>
            {renderTreatment()}
            
        </>
    )
}