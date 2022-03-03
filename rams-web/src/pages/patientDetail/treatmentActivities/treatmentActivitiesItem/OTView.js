import React from "react";
import { useStyles } from './style';
import GridItem from './GridItem';
import { Grid, InputAdornment } from "@material-ui/core";
import CustomTextField from 'components/Input/CustomTextField';
import Switch from 'components/Switch/Switch';
import CheckBox from "components/CheckBox/CheckBox";
import SearchIcon from 'resource/Icon/search.svg';

export default function OTView(props) {
    const classes = useStyles();
    const {
        position,
        side,
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
        regionList,
        durationList,
        walkingAidsList,
        assistiveDeviceList1,
        assistiveDeviceList2,
        weightBearingStatusList1,
        weightBearingStatusList2,
        assistanceList,
    } = props.treatmentActivitiesLists;

  
    const { onCheck, onSwitchAfterChange, onSwitchBeforeChange, onChange} = props;
    return (
        <>
            {/* <Grid container spacing={2} className={classes.row}>
                <Grid item xs={12}>
                    <GridItem label={'Activity'}>
                        <CustomTextField value={remarks} disabled fullWidth placeholder="-Activity-"  onChange={(v) => onChange(v, 'remarks')}/>
                    </GridItem>
                </Grid>
            </Grid> */}
            <Grid container spacing={2} className={classes.row}>
                <Grid item xs={2}>
                    <GridItem label={'Duration'} valueSuffix="mins" value={duration} items={durationList} placeholder="- Duration -" onChange={(v) => onChange(v, 'duration')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem startAdornment={<InputAdornment position="start"><Grid style={{ width: 1 }}><img style={{ display: 'block' }} alt="" src={SearchIcon} width="15" height="15" /></Grid></InputAdornment>} label={'Side'} value={side} items={sideList} placeholder="- Side / Direction -" onChange={(v) => onChange(v, 'side')}/>
                </Grid>
                <Grid item xs={6}>
                    <GridItem label={'Position'} value={position} items={positionList} placeholder="- Position -" onChange={(v) => onChange(v, 'position')}/>
                </Grid>
            </Grid>
            {/* <Grid container spacing={2} className={classes.row}>
                <Grid item xs={4}>
                    <GridItem label={'Set'} value={setValue} items={setList} placeholder="- Set -" onChange={(v) => onChange(v, 'setValue')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Repetition'} value={repetitionValue} items={repetitionList} placeholder="- Repetition -" onChange={(v) => onChange(v, 'repetitionValue')}/>
                </Grid>
                <Grid item xs={4}>
                    <GridItem label={'Resistance'} value={resistanceValue} items={resistanceList} placeholder="- Select Resistance -" onChange={(v) => onChange(v, 'resistanceValue')}/>
                </Grid>
            </Grid> */}
            <Grid container className={classes.row} spacing={2}>
                <Grid item xs={6}>
                    <GridItem label={'Assistance'} items={assistanceList} placeholder="- Assistance -" onChange={(v) => onChange(v, 'assistance')} value={assistance}/>
                </Grid>
                <Grid item xs={6}>
                    <GridItem label={'Walking Aids'} items={walkingAidsList} placeholder="- Walking Aids -" value={ walking_aids}  onChange={(v) => onChange(v, 'walking_aids')}/>
                </Grid>
            </Grid>
            <Grid container className={classes.row} spacing={2}>
                <Grid item xs={6}>
                    <GridItem label={'Assistive Device(1)'} items={assistiveDeviceList1} value={assistive_device_1} placeholder="- Assistive Device(1) -" onChange={(v) => onChange(v, 'assistive_device_1')}/>
                </Grid>
                <Grid item xs={6}>
                    <GridItem label={'Assistive Device(2)'} items={assistiveDeviceList2} value={assistive_device_2}  placeholder="- Assistive Device(2) -" onChange={(v) => onChange(v, 'assistive_device_2')}/>
                </Grid>
            </Grid>
            <Grid container className={classes.row} spacing={2}>
                <Grid item xs={6}>
                    <GridItem label={'Weight Bearing Status(1)'} items={weightBearingStatusList1} value={weight_bearing_status_1} placeholder="- Weight Bearing Status -" onChange={(v) => onChange(v, 'weight_bearing_status_1')}/>
                </Grid>
                <Grid item xs={6}>
                    <GridItem label={'Weight Bearing Status(2)'} items={weightBearingStatusList2} value={weight_bearing_status_2} placeholder="- Weight Bearing Status -" onChange={(v) => onChange(v, 'weight_bearing_status_2')}/>
                </Grid>
            </Grid>
            <Grid container spacing={2} className={classes.row}>
                <Grid item xs={12}>
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
                    <CheckBox icon_size={20} checked={handheld_remark  === 'Y'} onChange={onCheck} label={<span className={classes.checkboxLabel}>Handheld remark</span>} />
                </Grid>
            </Grid>
        </>
    )
}