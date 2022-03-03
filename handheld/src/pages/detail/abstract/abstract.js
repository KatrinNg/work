import React, { useState } from "react";
import { useStyles } from "./style";
import {useSelector} from 'react-redux';
import Widget from "components/Widget/Widget";
import { Grid, Divider } from "@material-ui/core";
import Describe from 'components/CommonDescribe/CommonDescribe';
import Patient from 'resource/detail/patient.svg';
import PT01 from 'resource/detail/hypoxic-risk.png';
import PT04 from 'resource/detail/cardiac-pacemaker.jpg';
import PT03 from 'resource/detail/cardiac-risk.jpg';
import PT05 from 'resource/detail/cognitive-impairment.jpg';
import PT07 from 'resource/detail/Fall_Risk.png';
import PT08 from 'resource/detail/Hearing_Impairment.png';
import PT09 from 'resource/detail/Hip_Arthroplasty.png';
import PT02 from 'resource/detail/Contact_Precaution.png';
import PT06 from 'resource/detail/Droplet_Precaution.png';
import PT10 from 'resource/detail/Visual_Impairment.png';
import OT01 from 'resource/detail/ot01.jpg';
import OT02 from 'resource/detail/ot02.jpg';
import OT03 from 'resource/detail/ot03.jpg';
import OT04 from 'resource/detail/ot04.jpg';
import OT05 from 'resource/detail/ot05.jpg';
import OT06 from 'resource/detail/ot06.jpg';
import OT07 from 'resource/detail/ot07.jpg';
import OT08 from 'resource/detail/ot08.jpg';
import OT09 from 'resource/detail/ot09.jpg';
import OT10 from 'resource/detail/ot10.jpg';
import OT11 from 'resource/detail/ot11.jpg';
import OT12 from 'resource/detail/ot12.jpg';
import PreventiveMeasureDialog from "./dialog";

const precautionIconMap = {
    OT01, OT02, OT03, OT04, OT05, OT06, OT07, OT08, OT09, OT10, OT11, OT12,
    PT01, PT02, PT03, PT04, PT05, PT06, PT07, PT08, PT09, PT10,
}

export default function Abstract({ detail }) {
    const classes = useStyles();
    const { g_dept, g_precautionList} = useSelector(
        (state) => {
            return {
                g_dept: state.loginInfo?.dept,
                g_precautionList: state.detail?.precautionList,
            }
        }
    );
    const [open, setOpen] = useState(false);
    const precautionSelect = detail.precautions && detail.precautions.split(';') || [];
//    console.log('precautionSelect: ', precautionSelect);
    const OT = g_dept === 'OT'? true : false;
    // const OT = false;
    // const actionsImage = g_dept === 'OT' ? [OT01, OT02, OT03, OT04, OT05, OT06, OT07] : [PT01, PT02, PT03, PT04];
    const renderActionImage = () => {
        return precautionSelect.map((item, i) => {
            return <img src={precautionIconMap[item]} key={item} className={classes.actionsImage} alt=''/>
        })
    }
    // console.lo
    return (
        <div className={classes.abstractBox}>
            <Widget title={'摘要'}>
                <Grid style={{marginBottom: 26}} container alignItems="center" justifyContent="space-between">
                    <Grid item xs={8}>
                        <Grid item container alignItems="center">
                                <img src={Patient} className={classes.patientAvatar}/>
                            <Grid item>
                                <Describe label={'病人姓名'} value={detail.patient_name} margin={'0'}></Describe>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={4} style={{textAlign: 'right'}}>
                        <span className={`${classes.status} ${classes.baseFontSize}`}>{detail.status}</span>
                    </Grid>
                </Grid>
                <Describe label={'病房 / 病床'}>
                    <span style={{ color: '#39ad90', fontSize: 16, fontWeight: 600 }}>{ detail.ward} / {detail.bed}</span>
                </Describe>
                <Divider style={{background: '#ededed'}}/>
                <Describe label={'O₂(L/min)'} value={detail.o2 || '-'} margin={'18px 0'}></Describe>
                <Describe label={'治療師'} value={detail.therapist_id}></Describe>
                <Describe label={'病人狀況'} value={detail.patient_conditions}></Describe>
                {OT && <Describe label={'跌倒風險'} value={detail.fall_risk === 'Y' ? 'Yes' : 'No'}></Describe>}
                {OT && <Describe label={'輪椅'} value={detail.wheelchair ? 'Yes' : 'No'}></Describe>}
                <Describe label={'預防措施'} showInfoIcon onSuffixClick={() => {setOpen(true)}}>
                    <Grid className={classes.imageBox}>
                        {renderActionImage()}
                    </Grid>
                </Describe>
                <Describe label={'備注'} value={detail.patient_details_remarks}></Describe>
            </Widget>
            <PreventiveMeasureDialog open={open} precautionIconMap={precautionIconMap} list={g_precautionList} onClose={() => {setOpen(false)}}/>
        </div>
    )
}