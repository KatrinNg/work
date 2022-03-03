import React, {useState,useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useStyles from './styles';
import o2Img from 'resource/Icon/PT/plain-icon/pt01.jpg';
import contactTransmissionImg from 'resource/Icon/PT/plain-icon/pt02.jpg';
import heartRiskImg from 'resource/Icon/PT/plain-icon/pt03.jpg';
import heartBImg from 'resource/Icon/PT/plain-icon/pt04.jpg';
import brainImg from 'resource/Icon/PT/plain-icon/pt05.jpg';
import dropletsImg from 'resource/Icon/PT/plain-icon/pt06.jpg';
import fallImg from 'resource/Icon/PT/plain-icon/pt07.jpg';
import hearingImg from 'resource/Icon/PT/plain-icon/pt08.jpg';
import brokenImg from 'resource/Icon/PT/plain-icon/pt09.jpg';
import blindImg from 'resource/Icon/PT/plain-icon/pt10.jpg';
import dizzinessImg from 'resource/Icon/OT/plain-icon/ot03.jpg';
import vomitImg from 'resource/Icon/OT/plain-icon/ot04.jpg';
import backpainImg from 'resource/Icon/OT/plain-icon/ot06.jpg';
import dumbImg from 'resource/Icon/OT/plain-icon/ot09.jpg';
import frightenedImg from 'resource/Icon/OT/plain-icon/ot10.jpg';
import beltImg from 'resource/Icon/OT/plain-icon/ot11.jpg';
import wheelchairImg from 'resource/Icon/OT/plain-icon/ot12.jpg';
import moment from 'moment'
const ptImg = {
    PT01:o2Img,
    PT02: contactTransmissionImg,
    PT03: heartRiskImg,
    PT04: heartBImg,
    PT05: brainImg,
    PT06: dropletsImg,
    PT07:fallImg,
    PT08: hearingImg,
    PT09: brokenImg,
    PT10: blindImg,
};
const otImg = {
    OT01: contactTransmissionImg,
    OT02: dropletsImg,
    OT03: dizzinessImg,
    OT04: vomitImg,
    OT05: brokenImg,
    OT06: backpainImg,
    OT07: blindImg,
    OT08: hearingImg,
    OT09: dumbImg,
    OT10: frightenedImg,
    OT11: beltImg,
    OT12: wheelchairImg
}
export default function RowItem(props) {
    const {item,index,systemDtm} = props;
    const {precautions,treatment_duration = '0'} = item;
    let imgList = precautions?precautions.split(';'):[];
    let remainTime = (moment(systemDtm).format('X')* 1 - (moment(item.last_updated).format('X')* 1 + treatment_duration* 1 * 60))/60
    remainTime = remainTime>0?Math.ceil(remainTime):Math.floor(remainTime)
    const { isPt } = useSelector(
        (state) => {
            const {patientDetailsType='PT'} = state.patientDetail;
            return {
                isPt: patientDetailsType==='PT',
            }
        }
    );
    const classes = useStyles()
    const getImg = (str) => {
        let retImg = null;
        retImg = isPt?ptImg[str]:otImg[str]
        return retImg
    }
    return <div className={classes.BoardRow} style={
            isPt?{backgroundColor: '#e1e1e1',color: '#000'}:{backgroundColor:'#232323',color: '#fff'}
        } >
        <span className={classes.itemName} >
            <span style={item.fall_risk==='Y'?{backgroundColor:isPt?'#ff6e6e':'#ff4e4e'}:null}>{item.patient_name_eng}</span>
        </span>
        <span className={classes.itemWardBead}>
            {`${item.ward} / ${item.bed}`}
            {imgList && imgList.length>0 && imgList.map((imgStr,i)=>{
                const currImg = getImg(imgStr)
                return <img key={`wardBeadImg${i}`} className={classes.rowImg} alt={imgStr} src={currImg} />
            })}
        </span>
        <span className={classes.itemTreatment}>{item.current_treatment}</span>
        <span className={classes.itemO2Plus}>{`${(item.spo2 == '-999'?'-': item.sp02) || '-'}/${(item.pulse == '-999'?'-': item.pulse) || '-'}`}</span>
        <span className={classes.itemRemainTime}>{remainTime}</span>
    </div>
}
