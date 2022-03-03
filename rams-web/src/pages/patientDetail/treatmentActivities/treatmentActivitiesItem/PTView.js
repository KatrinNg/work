import React from "react";
import { useStyles } from './style';
import GridItem from './GridItem';
import { Grid } from "@material-ui/core";
// import CommonSelect from 'components/CommonSelect/CommonSelect';
import InputNumber from 'components/Input/InputNumber';
import CustomTextField from 'components/Input/CustomTextField';
import Switch from 'components/Switch/Switch';
import CheckBox from "components/CheckBox/CheckBox";
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';

export default function PTView(props) {
    const classes = useStyles();
    const {
        position,
        side,
        treatment_set,
        region,
        repetition,
        resistance,
        resistance_value,
        resistance_unit,
        walking_aids,
        assistive_device_1,
        assistive_device_2,
        weight_bearing_status_1,
        weight_bearing_status_2,
        assistance,
        distance,
        duration,
        befor_bp,
        befor_spo2,
        after_bp,
        after_spo2,
        handheld_remark,
        remark,
    } = props.treatmentActivities;
    const {
        positionList,
        sideList,
        setList,
        regionList,
        repetitionList,
        resistanceList,
        walkingAidsList,
        assistiveDeviceList1,
        assistiveDeviceList2,
        weightBearingStatusList1,
        resistanceUnitList,
        assistanceList,
        durationList,
    } = props.treatmentActivitiesLists;

    const { onCheck, onSwitchAfterChange, onSwitchBeforeChange, onChange, onChangeNumber} = props;
    return (
        <>
            <Grid container spacing={2} className={classes.row}>
                <Grid item xs={4}>
                    <GridItem label={'Position'} value={position} items={positionList} placeholder="- Position -" onChange={(v) => onChange(v, 'position')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Side / Direction'} value={side} items={sideList} placeholder="- Side / Direction -" onChange={(v) => onChange(v, 'side')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Region'} value={region} items={regionList} placeholder="- Region -" onChange={(v) => onChange(v, 'region')}/>
                </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.row}>
                <Grid item xs={2}>
                    <GridItem label={'Set'} value={treatment_set} items={setList} placeholder="- Set -" onChange={(v) => onChange(v, 'treatment_set')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Repetition'} value={repetition} items={repetitionList} placeholder="- Repetition -" onChange={(v) => onChange(v, 'repetition')}/>
                </Grid>
            </Grid>
            <Grid container className={classes.row}>
                <GridItem label={'Resistance'} >
                    <Grid item style={{ width: 340, marginRight: 12 }}>
                        <SearchSelectList handleSelect={(v) => onChange(v, 'resistance')} fullWidth={true} id={'Resistance'} options={resistanceList} placeholder="- Select Resistance -" value={ resistance}/>
                    </Grid>
                    <Grid>Or</Grid>
                    <Grid item style={{ width: 150, margin: '0 12px' }}>
                        <InputNumber value={resistance_value} onChange={(v) => onChangeNumber(v, 'resistance_value')}/>
                    </Grid>
                    <Grid item style={{ width: 150 }}>
                        <SearchSelectList handleSelect={(v) => onChange(v, 'resistance_unit')} placeholder="- Select Unit -" fullWidth={true} id={'select Unit'} options={resistanceUnitList} value={resistance_unit}/>
                    </Grid>
                </GridItem>
            </Grid>
            <Grid container spacing={2} className={classes.row}>
                <Grid item xs={4}>
                    <GridItem onChange={(v) => onChange(v, 'walking_aids')} label={'Walking Aids'} items={walkingAidsList} placeholder="- Walking Aids -" value={ walking_aids}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Assistive Device(1)'} items={assistiveDeviceList1} value={assistive_device_1} placeholder="- Assistive Device(1) -" onChange={(v) => onChange(v, 'assistive_device_1')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Assistive Device(2)'} items={assistiveDeviceList2} value={assistive_device_2}  placeholder="- Assistive Device(2) -" onChange={(v) => onChange(v, 'assistive_device_2')}/>
                </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.row}>
                <Grid item xs={4}>
                    <GridItem label={'Weight Bearing Status'} items={weightBearingStatusList1} value={weight_bearing_status_1} placeholder="- Weight Bearing Status -" onChange={(v) => onChange(v, 'weight_bearing_status_1')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Assistance'} items={assistanceList} placeholder="- Assistance -" onChange={(v) => onChange(v, 'assistance')} value={assistance}/>
                </Grid>
                <Grid item xs={2}>
                    <GridItem label={'Distance'}>
                        <InputNumber fullWidth value={distance} onChange={(v) => onChangeNumber(v, 'distance')} suffix={<span style={{fontSize: 14, color: '#000'}}>m</span>}/>
                    </GridItem>
                </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.row}>
                <Grid item xs={2}>
                    <GridItem label={'Duration'} valueSuffix="mins" value={duration} items={durationList} placeholder="- Duration -" onChange={(v) => onChange(v, 'duration')}/>
                </Grid>
                <Grid item xs={10}>
                    <GridItem label={'Remarks'}>
                        <CustomTextField value={remark} fullWidth placeholder="Remarks"  onChange={(e) => onChange(e.target.value, 'remark')}/>
                    </GridItem>
                </Grid>
            </Grid>
            <Grid container item xs={8} style={{minWidth: 690}}>
                <Grid  xs={6} item className={classes.secTitle}>Before</Grid>
                <Grid  xs={6} item className={classes.secTitle}>After</Grid>
            </Grid>
            <Grid container className={classes.switchesBox}>
                <Grid container item className={classes.switchesItemsBox} xs={8}>
                    <Grid container item className={`${classes.switchesBackground}`} xs={6}>
                        <Grid container item xs alignItems="center">
                            <Grid item className={classes.labelName}>BP</Grid>
                            <Switch checked={befor_bp === 'Y'} onChange={(e) => onChange((e.target.checked ? 'Y': 'N'), 'befor_bp')}/>
                        </Grid>
                        <Grid container item xs alignItems="center" className={classes.yellowBorderColor}>
                            <Grid item className={classes.labelName}>SpO2</Grid>
                            <Switch checked={befor_spo2 === 'Y'} onChange={(e) => onChange((e.target.checked ? 'Y': 'N'), 'befor_spo2')}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={`${classes.switchesBackground}`} xs={6}>
                        <Grid container item xs alignItems="center">
                            <Grid item className={classes.labelName}>BP</Grid>
                            <Switch checked={after_bp === 'Y'} onChange={(e) => onChange((e.target.checked ? 'Y': 'N'), 'after_bp')}/>
                        </Grid>
                        <Grid container item xs alignItems="center">
                            <Grid item className={classes.labelName}>SpO2</Grid>
                            <Switch checked={after_spo2 === 'Y'} onChange={(e) => onChange((e.target.checked ? 'Y': 'N'), 'after_spo2')}/>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container item xs>
                    <CheckBox iconSize={20} checked={handheld_remark  === 'Y'} onChange={onCheck} label={<span className={classes.checkboxLabel}>Handheld remark</span>} />
                </Grid>
            </Grid>
        </>
    )
}