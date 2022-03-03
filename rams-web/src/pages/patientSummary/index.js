import React, {useState,useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {Grid, Typography} from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import useStyles from './styles';
import ColorButton from 'components/ColorButton/ColorButton';
import BasicDatePicker from 'components/DatePicker/DatePicker';
import moment from 'moment'
import { cloneDeep } from 'lodash';

import infoBlack from 'resource/Icon/info-black/info-black.png';
import PopupDialog from 'components/Popup/PopupDialog';
import * as ActionTypes from 'redux/actionTypes';
export default function PatientSummary (){
    const classes = useStyles()
    const dispatch = useDispatch()
    const { g_patientDetailsType,g_patientSummary } = useSelector(
        (state) => {
            const {patientDetailsType='PT'} = state.patientDetail;
            const {patientSummary} = state.patientSummary;
            return {
                g_patientDetailsType: patientDetailsType,
                g_patientSummary: patientSummary
            }
        }
    );
    const [startDate,setStartDate] = useState(moment().format('DD-MMM-yyyy'));//useState(moment(new Date()).format('DD-MMM-yyyy'))
    const [weekDays,setWeekDays] = useState([])
    const [summaryList,setSummaryList] = useState([])
    const [dataFlag,setDataFlag] = useState(true)
    const [openDialog, setOpenDialog] = useState(false);
    const [popupContent, setPopupContent] = useState()
    const title = g_patientDetailsType === 'PT'?'Treatment Details':'Activity Details'
    const title1 = g_patientDetailsType === 'PT'?'Treatment':'Activity'

    const getList = () => {
        const start_date = moment(startDate,'DD-MMM-yyyy').format('YYYY/MM/DD');
        const end_date = moment(startDate).add(6,'days').format('YYYY/MM/DD');
        dispatch({
            type: ActionTypes.FETCH_PATIENT_SUMMARY_LIST,
            payload: {
                start_date: start_date,
                end_date: end_date,
                dept: 'OT',
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                case_no: 'HN06000037Z'
            }
        })
    }
    useEffect(()=>{
        // const data = g_patientDetailsType === 'PT'?(dataFlag?summaryDate:summaryDate1):(dataFlag?activityDate:activityDate1)
        // setSummaryList(data)
        initWeekDate()
        getList();
    },[dataFlag])
    useEffect(()=>{
        const data = dealSummaryData(g_patientSummary)
        setSummaryList(data)
    },[g_patientSummary])

    const initDate = (val) => {
        if(val < 10){
            return '0'+val;
        }else{
            return val;
        }
    }

    const dealTime = (time) => {
        const times = time.split(' ')
        const d_m_y = times[0].split('/')
        return `${d_m_y[2]}/${d_m_y[1]}/${d_m_y[0]} ${times[1]}`
    }
    const sortRecords = (record) => {
        const retRecord = record;
        retRecord.sort((a,b)=>{
            const aDate = moment(dealTime(a.treatment_start_dt)).valueOf()
            const bDate = moment(dealTime(b.treatment_start_dt)).valueOf()
            return aDate - bDate
        })
        return retRecord
    }

    const dealSummaryData = (data,sts=true) => {
        const {prescription_data,treatment_record} = data;
        if(prescription_data && treatment_record){
            let retData = []
            //Sort data by time
            let record_s = sortRecords(treatment_record);
            if(prescription_data && prescription_data.length>0){
                for (let index = 0; index < prescription_data.length; index++) {
                    const element = prescription_data[index];
                    const {category,treatment_name:leftName,remarks,treatment_doc} = element;
                    if(treatment_record ){
                        
                        let categoryWeeks = [[],[],[],[],[],[],[]];
                        let walking_aids = '',resistance = '',resistance_unit = '';
                        let pushIndex = [];
                        for (let j = 0; j < record_s.length; j++) {
                            const e = record_s[j];
                            let {treatment_start_dt,treatment_end_dt,treatment_category,treatment_name} = e
                            walking_aids = e.walking_aids
                            resistance = e.resistance;
                            resistance_unit = e.resistance_unit;
                            treatment_start_dt = dealTime(treatment_start_dt);
                            treatment_end_dt = dealTime(treatment_end_dt);
                            //according to {category} and {leftName} get data
                            if(treatment_category === category && leftName === treatment_name){
                                //Get the difference in days as the subscript of the week array
                                const durationDay = moment.duration(new Date(treatment_start_dt.split(' ')[0]).getTime() - new Date(startDate).getTime()).days()
                                
                                if(durationDay>=0 && durationDay < 7){
                                    categoryWeeks[durationDay].push({
                                        time: moment(treatment_start_dt).format('HH:mm'),
                                        meter: `${moment.duration(moment(treatment_end_dt).valueOf() - moment(treatment_start_dt).valueOf()).minutes()} meters`
                                    })
                                }
                                //Get the subscript of the assembled data
                                pushIndex.push(j);
                            }
                        }
                        //Add to impression array data
                        retData.push({
                            category:category,
                            treatment: leftName,
                            RAMSRemarks: remarks,
                            weekdayData: {
                                meters: categoryWeeks,
                                treatmentDetails: {
                                    cateogry: category,
                                    treatment: leftName,
                                    documentation: treatment_doc,
                                    resistance: `${resistance} ${resistance_unit}`,
                                    walkingAids: walking_aids
                                }
                            },
                            state: sts

                        })
                        //clear has push data
                        record_s = record_s.filter((item,index)=>{return pushIndex.indexOf(index)<0})
                    }
                }
            }
            //remaining array
            if(record_s && record_s.length>0){
                let dgData = [];
                //Get deduplicated data : prescription_data 
                for (let j = 0; j < record_s.length; j++) {
                    const dgElement = record_s[j]
                    let hasPush = false;
                    //Determine if it has been pushed
                    if(dgData.length>0){
                        for (let index = 0; index < dgData.length; index++) {
                            const element = dgData[index];
                            if(element.category === dgElement.treatment_category && element.treatment_name === dgElement.treatment_name){
                                hasPush = true;
                                break;
                            }
                        }
                    }
                    //push in {dgData}
                    if(!hasPush){
                        dgData.push({
                            "category": dgElement.treatment_category,
                            "treatment_name": dgElement.treatment_name,
                            "treatment_doc": dgElement.treatment_doc,
                            "remarks": dgElement.handheld_remarks,
                        })
                    }
                }
                //Reassemble expired data and Merge to Impression Data
                const dealRemainRecord = dealSummaryData({prescription_data:dgData,treatment_record:record_s},false)
                retData = retData.concat(dealRemainRecord)
            }
            
            
            //console.log(record_s,'record_s',retData)
            return retData;
        }
    }
    
    /**
     * Initialize the day of the week
     * @returns 
     */
    const initWeekDate = (sDate) => {
        let d = sDate?new Date(startDate):startDate;
        // //current month and year
        // let year = d.getFullYear();
        // let month = initDate(d.getMonth()+1)
        // let day = initDate(d.getDate())
        // //has props startDate
        // if(startDate && startDate.length === 11){
        //     d = new Date(startDate);
        //     year = d.getFullYear();
        //     month = initDate(d.getMonth()+1)
        //     day = initDate(d.getDate())
        // }
        // //current date
        // let tempDate = year+'-'+ month + '-'+ initDate(day)
        // // current month  begin day
        // let tempCurrent = [];
        // for(let i=day; i<= getLastDate(year,month).getDate(); i++){
        //     const curDate = `${year}-${month}-${initDate(i)}`;
        //     const tempDate = moment(curDate).format('DD MMM');
        //     const tempWeekday = `(${moment(curDate).format('ddd')})`
        //     tempCurrent.push({date:tempDate,day:i,weekday: tempWeekday,fullDate: curDate});
        // }
        // //get the length of days
        // const getLeng = tempCurrent.length;
        // if(getLeng >= 7){
        //     setWeekDays(tempCurrent.slice(0,7))
        //     return;
        // }
        // if(getLeng < 7){
        //     //next month
        //     const nextYear= month === 12 ?  year + 1 : year;
        //     const nextMonth= month === 12 ? '01' : initDate(parseInt(month)+1);
        //     for(let k=1; k <= 7 - getLeng; k++){
        //         const curDate = nextYear+'-'+nextMonth+'-'+ initDate(k);
        //         const nextDate = moment(curDate).format('DD MMM');
        //         const nextWeekday = `(${moment(curDate).format('ddd')})`
        //         tempCurrent.push({date:nextDate,day:k,weekday:nextWeekday,fullDate: curDate});
        //     }
        // }
        let tempCurrent = []
        for (let index = 0; index < 7; index++) {
            const tempData = moment(d).add(index,'days')
            const curDate = tempData.format('DD MMM');
            const curWeekday = `(${tempData.format('ddd')})`
            const day = tempData.format('DD');
            const fullDate = tempData.format('yyyy-MM-DD');
            tempCurrent.push({date:curDate,day,weekday:curWeekday,fullDate: fullDate})
        }
        setWeekDays(tempCurrent)
    }

    /**
     * Day of the week before the previous day
     */
    const getPreWeekdays = () => {
        let tempWeekDays = cloneDeep(weekDays)
        const tempData = moment(tempWeekDays[0].fullDate).subtract(1,'days')
        const preDate = tempData.format('DD MMM');
        const preWeekday = `(${tempData.format('ddd')})`
        const day = tempData.format('DD');
        const fullDate = tempData.format('yyyy-MM-DD');
        tempWeekDays.pop()
        tempWeekDays.unshift({date:preDate,day,weekday:preWeekday,fullDate: fullDate})
        // const currFristDay = tempWeekDays[0].fullDate
        // const fristDay = parseInt(tempWeekDays[0].day);
        // const fristMonth = new Date(currFristDay).getMonth();//0-11
        // const fristYear = new Date(currFristDay).getFullYear();
        // let year='',month='',day='';
        // if(fristDay === 1){
        //     if(fristMonth === 0){
        //         year = fristYear - 1;
        //         month = 12;
        //     }else{
        //         year = fristYear
        //         month = fristMonth + 1
        //     }
        //     day = getLastDate(year,month).getDate()
        // }else{
        //     year = fristYear;
        //     month = fristMonth + 1
        //     day = fristDay - 1
        // }
        // tempWeekDays.pop()
        // const curDate = year + '-' + month + '-'+ day;
        // const preDate = moment(curDate).format('DD MMM');
        // const preWeekday = `(${moment(curDate).format('ddd')})`
        // tempWeekDays.unshift({date:preDate,day,weekday:preWeekday,fullDate: curDate})
        setWeekDays(tempWeekDays)
        setStartDate(tempData.format('DD-MMM-yyyy'))
        setDataFlag((flag)=>!flag)
    }

    /**
     * Date of the next day and week
     */
    const getNextWeekdays = () => {
        let tempWeekDays = cloneDeep(weekDays)
        const tempData = moment(tempWeekDays[6].fullDate).add(1,'days')
        const nextDate = tempData.format('DD MMM');
        const nextWeekday = `(${tempData.format('ddd')})`
        const day = tempData.format('DD');
        const fullDate = tempData.format('yyyy-MM-DD');
        tempWeekDays.shift()
        tempWeekDays.push({date:nextDate,day,weekday:nextWeekday,fullDate: fullDate})
        // const fristDay = parseInt(tempWeekDays[6].day);
        // const fristMonth = new Date(currFristDay).getMonth();//0-11
        // const fristYear = new Date(currFristDay).getFullYear();
        // const lastDay = getLastDate(fristYear,fristMonth+1).getDate()
        // let year='',month='',day='';
        // if(fristDay === lastDay){
        //     if(fristMonth === 11){
        //         year = fristYear + 1;
        //         month = 1;
        //     }else{
        //         year = fristYear
        //         month = fristMonth + 2
        //     }
        //     day = 1;
        // }else{
        //     year = fristYear;
        //     month = fristMonth + 1
        //     day = fristDay + 1
        // }
        // tempWeekDays.shift()
        // const curDate = year + '-' + month + '-'+ day;
        // const nextDate = moment(curDate).format('DD MMM');
        // const nextWeekday = `(${moment(curDate).format('ddd')})`
        // tempWeekDays.push({date:nextDate,day,weekday:nextWeekday,fullDate: curDate})
        setWeekDays(tempWeekDays)
        setStartDate(moment(tempWeekDays[0].fullDate).format('DD-MMM-yyyy'))
        setDataFlag((flag)=>!flag)
    }

    const getLastDate = (year,month) => {
        return new Date(year,month,0);
    }
    const searchDateChange = (value) => {
        setStartDate(value)
    }
    const popSummaryDetail = (detail) => {
        setPopupContent(
            <>
                <Grid container  >
                    <Grid container >
                        <Grid item xs={4} lg={4}  container direction="column"  >
                            <Typography className={classes.popWeightLabel}>Cateogry</Typography>
                            <Typography className={classes.popFontSize}>{detail.cateogry}</Typography>
                        </Grid>
                        <Grid item xs={4} lg={4}  container direction="column"  >
                            <Typography className={classes.popWeightLabel}>{title1}</Typography>
                            <Typography className={classes.popFontSize}>{detail.treatment}</Typography>
                        </Grid>
                        <Grid item xs={4} lg={4}  container direction="column"  >
                            <Typography className={classes.popWeightLabel}>Documentation</Typography>
                            <Typography className={classes.popFontSize}>{detail.documentation}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container style={{marginTop: '15px'}}>
                        <Grid item xs={4} lg={4}  container direction="column"  >
                            <Typography className={classes.popWeightLabel}>Resistance</Typography>
                            <Typography className={classes.popFontSize}>{detail.resistance}</Typography>
                        </Grid>
                        <Grid item xs={4} lg={4}  container direction="column"  >
                            <Typography className={classes.popWeightLabel}>Walking Aids</Typography>
                            <Typography className={classes.popFontSize}>{detail.walkingAids}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </>
        )
        setOpenDialog(true)
    }
    return <>
        <PopupDialog
            open={openDialog}
            id={'SummaryDetailPop'}
            title={title}
            content={popupContent}
            maxWidth={"900px"}
            closeAction={() => {
                setOpenDialog(false)
            }}
            topCloseBtn={true}
        />
        <div className={classes.patientSummaryAppbar}>
                <Typography>Patient Summary</Typography>
        </div>
        <div className={classes.containerPanel}>
            <Grid container alignItems='center' justifyContent='flex-end' className={classes.dateSearch}>
                <Typography className={classes.formLabel}>Date</Typography>
                <div style={{width: '160px'}}>
                    <BasicDatePicker value={new Date()} onChange={searchDateChange} />
                </div>
                <ColorButton style={{marginRight: 49, marginLeft: 5, height: 40,fontWeight: 600}} onClick={()=>{initWeekDate(startDate);setDataFlag(flag=>!flag)}} variant="contained" color="primary">Go</ColorButton>
            </Grid>
            <Grid container  className={classes.containMargin} >
                <Grid container className={classes.weekDaysTitle}>
                    <Grid item className={classes.columnItem} style={{paddingLeft: '15px',width: '26%'}} container direction="row" alignItems="center" justifyContent='space-between'>
                        <Typography >{title}</Typography>
                        <Grid onClick={()=>{getPreWeekdays()}} item container direction="column" className={classes.iconStyle} alignItems="center" justifyContent='center'>
                            <ArrowBackIosIcon fontSize='small' style={{paddingLeft: '-5px',marginLeft: '5px'}} />
                        </Grid>
                    </Grid>
                    {weekDays && weekDays.map((item,index)=>{
                        return (
                            <>
                            {index === (weekDays.length - 1)?<Grid key={`summaryWeekday${index}`} style={{width: '14%'}} item container direction="row" alignItems="center" justifyContent='space-between'>
                                    <Grid item  style={{width: 'calc(100% - 35px)'}} container direction="column" alignItems="center">
                                        <Typography className={classes.weekdayLabel}  >{item.date}</Typography>
                                        <Typography className={classes.weekdayLabel} >{item.weekday}</Typography>
                                    </Grid>
                                    <Grid onClick={()=>{getNextWeekdays()}} item container direction="column" className={classes.iconStyle} alignItems="center" justifyContent='center'>
                                        <ArrowForwardIosIcon fontSize='small' />
                                    </Grid>
                                </Grid>:<Grid className={classes.columnItem} key={`summaryWeekday${index}`} item container direction="column" alignItems="center" justifyContent='center'>
                                    <Typography className={classes.weekdayLabel} >{item.date}</Typography>
                                    <Typography className={classes.weekdayLabel} >{item.weekday}</Typography>
                                </Grid>}
                            </>
                        )
                    })}
                </Grid>
                {
                    summaryList && summaryList.map((item,index)=>{
                        const {meters=[],treatmentDetails={}} = item.weekdayData
                        return (<>
                            <Grid key={`summaryItem${index}`} container className={classes.summaryContent} style={!item.state?{backgroundColor:'#eee',opacity:0.55}:(index%2)?{backgroundColor:'#fafafa'}:null}>
                                <Grid item className={classes.summaryItem} style={{padding: '15px',width: '26%'}} container direction="column"  >
                                    <div className={classes.categoryItem} >
                                        <Typography ><span className={classes.weightLabel}>{`Category: `}</span>{item.category}</Typography>
                                        <Typography style={{marginBottom: '15px'}} ><span className={classes.weightLabel}>{`${title1}: `}</span>{item.treatment}</Typography>
                                        {(item.RAMSRemarks && item.RAMSRemarks !== '') && <Typography ><span className={classes.weightLabel}>{`RAMS Remarks: `}</span>{item.RAMSRemarks}</Typography>}
                                    </div>
                                </Grid>
                                {meters && meters.map((meter,meterIndex)=>{
                                    return (
                                        <>
                                        {meterIndex === (meters.length - 1)?<Grid key={`summaryMeters${index}-${meterIndex}`} className={classes.summaryItem} style={{width: '14%'}} item container direction="column"  >
                                                
                                                    <MeterContent meter={meter} metersIndex={`${index}-${meterIndex}`}/>
                                                    {meter&&meter.length>0 && <div className={classes.msIcon} onClick={()=>{popSummaryDetail(treatmentDetails)}}>
                                                        <img src={infoBlack} alt="Treatment Details" />
                                                    </div>}
                                            </Grid>:<Grid className={classes.summaryItem} key={`summaryMeters${index}-${meterIndex}`} item container direction="column" >
                                                <MeterContent meter={meter} metersIndex={`${index}-${meterIndex}`}/>
                                                {meter&&meter.length>0 && <div className={classes.msIcon} onClick={()=>{popSummaryDetail(treatmentDetails)}}>
                                                    <img src={infoBlack} alt="Treatment Details" />
                                                </div>}
                                            </Grid>}
                                        </>
                                    )
                                })}
                            </Grid>
                        </>)
                    })
                }
            </Grid>
        </div>
        
    </>
}

const MeterContent = (props) => {
    const {meter,metersIndex} = props
    const classes = useStyles()
    return <>
        {meter && meter.map((ms,index)=>{
            return (
                <div key={`summaryMeter${metersIndex}-${index}`} className={classes.msItem} style={index === (meter.length - 1)?{borderBottom: 'none'}:null}>
                    <Typography className={classes.weightLabel} >{ms.time}</Typography>
                    <Typography >{ms.meter}</Typography>
                </div>
            )
        })}
    </>
}