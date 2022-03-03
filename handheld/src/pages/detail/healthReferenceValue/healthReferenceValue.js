import React, {useState} from "react";
import { useStyles } from "./style";
import { useSelector, useDispatch } from 'react-redux';
import Widget from "components/Widget/Widget";
import Describe from 'components/CommonDescribe/CommonDescribe';
import { Grid, Divider } from "@material-ui/core";
import CustomTextField from 'components/Input/CustomTextField';
import warning from 'resource/detail/icon-warning.svg';
import CheckBox from 'components/CheckBox/CheckBox';
import ColorButton from 'components/ColorButton/ColorButton';
import moment from "moment";
import * as ActionTypes from 'redux/actionTypes';
export default function HealthReferenceValue(props) {
    const classes = useStyles();
    const dispatch = useDispatch()
    const { g_spList, g_bpList , g_patientDetail} = useSelector(
        (state) => {
            return {
                g_spList: state.detail?.spList,
                g_bpList: state.detail?.bpList,
                g_patientDetail:state.detail?.patientDetail

            }
        }
    );
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [pulseBp, setPulseBp] = useState('');

    const [oxygen , setOxygen ] = useState('');
    const [o2, setO2] = useState('');
    const [pulseSp, setPulseSp] = useState('');
    const [beyondRange1,setBeyondRange1] = useState(false);
    const [beyondRange2,setBeyondRange2] = useState(false);
    // const [list, setList] = useState([
    //     {time: '(坐) 10-JUN 12:30',up: 100,down: 70,pulse: 100},
    //     {time: '(坐) 10-JUN 12:30',up: 100,down: 70,pulse: 100},
    //     {time: '(坐) 10-JUN 12:30',up: 100,down: 70,pulse: 100},
    //     {time: '(坐) 10-JUN 12:30',up: 100,down: 70,pulse: 100},
    // ]);
    const [checkedForSit, isSetCheckedForSit] = useState(false);
    const [checkedForStand, isSetCheckedForStand] = useState(false);

    const changeForSit = () => {
        isSetCheckedForSit(true);
        isSetCheckedForStand(false);
    }
    const changeForStand = () => {
        isSetCheckedForSit(false);
        isSetCheckedForStand(true);
    }

    const changeDiastolic = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        setDiastolic(value)
    }
    const changeSystolic = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        setSystolic(value)
    }
    const changePulseBp = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        setPulseBp(value)
    }
    const changeOxygen = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        setOxygen(value)
    }
    const changeO2 = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        setO2(value)
    }
    const changePulseSp = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        setPulseSp(value)
    }

    const resetBp = () => {
        setDiastolic('')
        setSystolic('')
        setPulseBp('')
        isSetCheckedForSit(false)
        isSetCheckedForStand(false)
    }

    const onSaveBp = () => {
        if(
            (systolic&&diastolic&&pulseBp)&&(
                systolic<g_patientDetail?.dbp_lower || systolic>g_patientDetail?.dbp_upper ||
                diastolic<g_patientDetail?.sbp_lower || diastolic>g_patientDetail?.sbp_upper ||
                pulseBp<g_patientDetail?.pulse_lower || pulseBp>g_patientDetail?.pulse_upper
            )
        ){
            setBeyondRange1(true);
            return;
        }
        setBeyondRange1(false);
        const t = [...g_bpList];
        let text = '';
        if (checkedForSit) {
            text = 'SIT' 
        }else 
        if (checkedForStand) {
            text = 'STAND'
        }
        t.push({
            dbp:diastolic?parseInt(diastolic):null,
            position:text,
            pulse:pulseBp?parseInt(pulseBp):null,
            record_datetime:'2022/02/18 11:22:33.000',
            record_from:'HANDHELD',
            sbp:systolic?parseInt(systolic):null
        })
        dispatch({
            type:ActionTypes.SET_E_VITAL_LIST,
            payload:{
                record_datetime:'2022/02/18 11:22:33.000',
                dbp:diastolic?parseInt(diastolic):null,
                sbp:systolic?parseInt(systolic):null,
                pulse:pulseBp?parseInt(pulseBp):null,
                position:text,
                callback:(res)=>{
                    if(res==='SUCCESS')
                    {
                        dispatch({
                            type: ActionTypes.SET_DETAIL,
                            payload: {
                                bpList: t
                            }
                        })
                        resetBp();
                    }
                }
            }
        })
    }
    const resetSp = () => {
        setOxygen('')
        setO2('')
        setPulseSp('')
    }

    const onSaveSp = () => {
        if(
            (pulseSp)&&(
                pulseSp<g_patientDetail?.pulse_lower || pulseSp>g_patientDetail?.pulse_upper
            )
        ){
            setBeyondRange2(true);
            return;
        }
        setBeyondRange2(false);
        const t = [...g_spList];
        t.push({
            spo2:oxygen?parseInt(oxygen):null,
            pulse:pulseSp?parseInt(pulseSp):null,
            record_datetime:'2022/02/18 11:22:33.000',
            record_from:'HANDHELD',
            o2:o2?parseInt(o2):null
        })

        dispatch({
            type:ActionTypes.SET_E_VITAL_LIST,
            payload:{
                record_datetime:'2022/02/18 11:22:33.000',
                spo2:oxygen?parseInt(oxygen):null,
                pulse:pulseSp?parseInt(pulseSp):null,
                o2:o2?parseInt(o2):null,
                callback:(res)=>{
                    if(res==='SUCCESS')
                    {
                        dispatch({
                            type: ActionTypes.SET_DETAIL,
                            payload: {
                                spList: t
                            }
                        })
                        resetSp();
                    }
                }
            }
        })
    }
    return (
        <div>
            <Widget noBodyPadding title={'健康參考值'}>
                <div style={{padding: '11px 8px 0 9px'}}>
                    <div className={`${classes.baseFontStyle} ${classes.title}`}>血壓測量</div>
                    <Describe label={'記錄'} margin="0 0 10px 0">
                        <Grid className={classes.formStyle}>
                            <Grid container>
                                <Grid xs={4} container className={`${classes.formLabel} ${classes.formTitle}`}>
                                    <Grid>日期, 時間</Grid>
                                    <Grid style={{textAlign: 'center'}}>(DD-MM HH:mm)</Grid>
                                </Grid>
                                <Grid xs={3}  className={`${classes.formLabel} ${classes.formTitle}`}>上壓</Grid>
                                <Grid xs={3}  className={`${classes.formLabel} ${classes.formTitle}`}>下壓</Grid>
                                <Grid xs={2}  className={`${classes.formLabel} ${classes.formTitle} ${classes.lastItemColumn}`}>脈搏</Grid>
                            </Grid>
                            {
                                g_bpList.map((i, d) => {
                                    return (
                                        <Grid container key={d}>
                                            <Grid xs={4} className={`${d === g_bpList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>{moment(i.record_datetime).format('DD-MMM HH:mm')}</Grid>
                                            <Grid xs={3}  className={`${d === g_bpList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>{i.sbp}</Grid>
                                            <Grid xs={3}  className={`${d === g_bpList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>{i.dbp}</Grid>
                                            <Grid xs={2}  className={`${d === g_bpList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem} ${classes.lastItemColumn}`}>{i.pulse}</Grid>
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                    </Describe>
                    <Divider style={{background: '#ededed', marginBottom: 8}}/>
                    <Describe label={'新增記錄'}  margin="0 0 0 0">
                        <Grid className={`${classes.formStyle} ${classes.formStyleSec}`}>
                            <Grid container>
                                <Grid xs item style={{marginRight: 18}}>
                                    <Describe margin="0" label={'上壓'}>
                                        <CustomTextField 
                                            id='Diastolic'
                                            className={classes.textField} 
                                            value={systolic}
                                            onChange={changeSystolic} />
                                    </Describe>
                                </Grid>
                                <Grid xs item style={{marginRight: 18}}>
                                    <Describe margin="0" label={'下壓'}>
                                        <CustomTextField 
                                            className={classes.textField} 
                                            value={diastolic}
                                            onChange={changeDiastolic} />
                                    </Describe>
                                </Grid>
                                <Grid xs item>
                                    <Describe margin="0" label={'脈搏'}>
                                        <CustomTextField 
                                            className={classes.textField} 
                                            value={pulseBp} 
                                            onChange={changePulseBp} />
                                    </Describe>
                                </Grid>
                            </Grid>
                            {beyondRange1? <Grid container alignItems="center" className={classes.warningText}>
                                <img src={warning} style={{marginRight: 4}}/>
                                <span>超出範圍上下限，請先確認再儲存</span>
                            </Grid> :null}
                            <Grid container>
                                <CheckBox 
                                    icon_size={22} 
                                    checked={checkedForSit} 
                                    onChange={(e) => {changeForSit(e.target.checked)}} 
                                    label={<span style={{color: '#737578', fontSize: 12}}>坐</span>} />
                                <CheckBox 
                                    icon_size={22} 
                                    checked={checkedForStand} 
                                    onChange={(e) => {changeForStand(e.target.checked)}} 
                                    label={<span style={{color: '#737578', fontSize: 12}}>企</span>} />
                            </Grid>
                            <Grid container style={{margin: '18px 0'}}>
                                <ColorButton
                                    className={classes.rightBtnStyle}
                                    variant="contained"
                                    color="cancel"
                                    style={{marginRight: 18, minWidth: 120, minHeight: 40}}
                                    onClick={resetBp}
                                >
                                    清除
                                </ColorButton>
                                <ColorButton
                                    style={{ minWidth: 120, minHeight: 40}}
                                    className={classes.rightBtnStyle}
                                    variant="contained"
                                    color="primary"
                                    onClick={onSaveBp}
                                >
                                    儲存
                                </ColorButton>
                            </Grid>
                        </Grid>
                    </Describe>
                    
                </div>
                <div style={{ padding: '11px 8px 19px 9px' }}>
                    <Divider style={{background: '#ededed', marginBottom: 8}}/>
                    <div className={`${classes.baseFontStyle} ${classes.title}`}>血氧測量</div>
                    <Describe label={'記錄'} margin="0 0 10px 0">
                        <Grid className={classes.formStyle}>
                            <Grid container>
                                <Grid xs={4} container className={`${classes.formLabel} ${classes.formTitle}`}>
                                    <Grid>日期, 時間</Grid>
                                    <Grid style={{textAlign: 'center'}}>(DD-MM HH:mm)</Grid>
                                </Grid>
                                <Grid xs={3}  className={`${classes.formLabel} ${classes.formTitle}`}>血氧</Grid>
                                <Grid xs={3}  className={`${classes.formLabel} ${classes.formTitle}`}>脈搏</Grid>
                                <Grid xs={2}  className={`${classes.formLabel} ${classes.formTitle} ${classes.lastItemColumn}`}>O₂</Grid>
                            </Grid>
                            {
                                g_spList.map((i, d) => {
                                    return (
                                        <Grid container key={d}>
                                            <Grid xs={4} className={`${d === g_spList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>{moment(i.record_datetime).format('DD-MMM HH:mm')}</Grid>
                                            <Grid xs={3}  className={`${d === g_spList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>{i.spo2}</Grid>
                                            <Grid xs={3}  className={`${d === g_spList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem}`}>{i.pulse}</Grid>
                                            <Grid xs={2}  className={`${d === g_spList.length - 1 ? classes.lastItemRow : ''} ${classes.formLabel} ${classes.formItem} ${classes.lastItemColumn}`}>{i.o2}</Grid>
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                    </Describe>
                    <Divider style={{background: '#ededed', marginBottom: 8}}/>
                    <Describe label={'新增記錄'}>
                        <Grid className={`${classes.formStyle} ${classes.formStyleSec}`}>
                            <Grid container>
                                <Grid xs item style={{marginRight: 18}}>
                                    <Describe margin="0" label={'血氧'}>
                                        <CustomTextField 
                                            className={classes.textField} 
                                            value={oxygen} 
                                            onChange={changeOxygen} />
                                    </Describe>
                                </Grid>
                                <Grid xs item style={{marginRight: 18}}>
                                    <Describe margin="0" label={'脈搏'}>
                                        <CustomTextField 
                                            className={classes.textField} 
                                            value={pulseSp} 
                                            onChange={changePulseSp} />
                                    </Describe>
                                </Grid>
                                <Grid xs item>
                                    <Describe margin="0" label={'O₂'}>
                                        <CustomTextField 
                                            className={classes.textField} 
                                            value={o2} 
                                            onChange={changeO2} />
                                    </Describe>
                                </Grid>
                            </Grid>
                            {beyondRange2? <Grid container alignItems="center" className={classes.warningText}>
                                <img src={warning} style={{marginRight: 4}}/>
                                <span>超出範圍上下限，請先確認再儲存</span>
                            </Grid> :null}
                            <Grid container style={{margin: '18px 0'}}>
                                <ColorButton
                                    className={classes.rightBtnStyle}
                                    variant="contained"
                                    color="cancel"
                                    style={{marginRight: 18, minWidth: 120, minHeight: 40}}
                                    onClick={resetSp}
                                >
                                    清除
                                </ColorButton>
                                <ColorButton
                                    style={{ minWidth: 120, minHeight: 40}}
                                    className={classes.rightBtnStyle}
                                    variant="contained"
                                    color="primary"
                                    onClick={onSaveSp}
                                >
                                    儲存
                                </ColorButton>
                            </Grid>
                        </Grid>
                    </Describe>
                </div>
            </Widget>
        </div>
    )
}