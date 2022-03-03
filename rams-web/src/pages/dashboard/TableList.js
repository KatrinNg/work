import React, {useState,useEffect, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
import RowItem from './RowItem';
import useStyles from './styles';
import wardIcon from 'resource/dashboard/ward-icon.png';
import wardIconOT from 'resource/dashboard/ward-icon-ot.png';
import moment from 'moment'
export default function TableList(props){
    const classes = useStyles()
    const {type} = props;
    const pagesize = 10;
    const [totlePage,setTotlePage] = useState(0);
    const [currPage,setCurrPage] = useState(1)
    const [displayList,setDisplayList] = useState([])
    const dispatch = useDispatch()
    let timerRef = useRef(null);
    const { g_dataList ,g_systemDtm,g_patientDetailsType, g_lastUpdateTime} = useSelector(
        (state) => {
            const { dataList, systemDtm, lastUpdateTime } = state.dashboard;
            const {patientDetailsType='PT'} = state.patientDetail;
            return {
                g_dataList: dataList,
                g_systemDtm: systemDtm,
                g_patientDetailsType: patientDetailsType,
                g_lastUpdateTime: lastUpdateTime,
            }
        }
    );
    useEffect(()=>{
        // dispatch({
        //     type: ActionTypes.SET_DASHBOARD_LIST,
        //     payload: {
        //         lastUpdateTime: moment(new Date()).format('HH:mm:ss')
        //     }
        // })
    },[])

    

    
    useEffect(()=>{
        if (g_dataList) {
            const totalPage = Math.ceil((g_dataList.length) / pagesize) || 0;
            let cPage = currPage
            if (totalPage > cPage) {
                cPage = cPage + 1;
            } else {
                cPage = 1;
            }
            setCurrPage(cPage)
            setTotlePage(totalPage)
            let s = 0;
            let e = pagesize;
            if (cPage !== 1) {
                s = (cPage - 1) * pagesize;
                e = cPage;
            }
            setDisplayList(g_dataList.slice(s,e))
        }
    },[g_lastUpdateTime])
    return <>
        <div className={classes.listPanel}>
            <div className={classes.BoardRow} style={type==='OT'?{
                backgroundColor: '#000000',
                color: '#09fdff',
                border: 'none',
                fontSize: '22px'
            }:{
                backgroundColor: '#fafafa',
                border: 'none',
                fontSize: '22px'
            }}>
                <span className={classes.itemName}>{'Name'}</span>
                {type==='OT'?<><span className={classes.itemWardBead}>
                    <img className={classes.wardIconImg} alt={'wardIcon'} src={wardIconOT} />
                    {'Ward / Bed Details'}
                </span>
                <span className={classes.itemTreatment}>{'Activity'}</span></>:<>
                <span className={classes.itemWardBead}>
                    <img className={classes.wardIconImg} alt={'wardIcon'} src={wardIcon} />
                    {'Ward / Bed Details'}
                </span>
                <span className={classes.itemTreatment}>{'Treatment'}</span>
                </>}
                <span className={classes.itemO2Plus}>{'SPO2/PULSE'}</span>
                <span className={classes.itemRemainTime} style={{paddingRight: 0,width: '7%',display:'inline-block',textAlgin: 'right'}}>{'Remain time (mins)'}</span>
            </div>
            
            {displayList.map((item,index)=>{
                return <RowItem key={`row${index}`} item={item} index={index} systemDtm={g_systemDtm} />
            })}
        </div>
        <div className={classes.page} ><span style={{backgroundColor: type==='OT'?'#fff':'#e1e1e1'}}>{`Page ${currPage}/${totlePage}`}</span></div>
    </>
}