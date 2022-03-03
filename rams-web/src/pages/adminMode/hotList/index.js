import React,{useEffect, useState} from 'react'
import {Box, Grid} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux';
import CommonSelect from 'components/CommonSelect/CommonSelect'
import ColorButton from 'components/ColorButton/ColorButton';
import Shape from 'resource/Icon/adminMode/shape.svg'
import SaveImg from 'resource/Icon/adminMode/path.svg'
import DashBoardButtomTable from 'components/DashBoardButtomTable/index'
import * as ActionTypes from 'redux/actionTypes';
import useStyles from './styles'
import ListEdit from './ListEdit'


const HotList = ()=> {
    
    const dispatch = useDispatch()
    const [inEdit,setInEdit] = useState(false);
    const classes = useStyles()
    const [room,setRoom] = useState('')
    const [dashboardPre,setDashboardPre] = useState([])
    const [updatePre,setUpdatePre] = useState(false)
    const [showList,setShowList] = useState([])
    // const [editSelects,setEditSelects] = useState([])
    const [errorMsg,setErrorMsg] = useState([])
    const [duplicatedObj, setDuplicatedObj] = useState({})
    const { isPT,g_hotList,typeName,g_patientDetailsType,g_roomList, g_hotList_treatment_name, g_activityListByRoom } = useSelector(
        (state) => {
            const {patientDetailsType='PT',roomList,patientDetail} = state.patientDetail;
            const {hotList, hotList_treatment_name, activityListByRoom} = state.adminmode;
            return {
                isPT: patientDetailsType==='PT',
                typeName: patientDetailsType==='PT'?'Treatment':'Activity',
                g_hotList: hotList,
                g_hotList_treatment_name: hotList_treatment_name,
                g_patientDetailsType: patientDetailsType,
                g_roomList: roomList,
                g_activityListByRoom: activityListByRoom,
                // g_room: patientDetail.room_id
            }
        }
    );

    const getData = (roomId) => {
        dispatch({
            type: ActionTypes.FETCH_HOTLIST_DATA,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                room_id: roomId,
                dept: isPT?'PT':'OT'
            }
       })
       dispatch({
        type: ActionTypes.FETCH_ACTIVITY_LIST_BY_ROOM,
        payload: {
            login_id: '@CMSIT',
            hosp_code: 'TPH',
            dept: isPT?'PT':'OT',
            room_id:roomId
        },
        });
    }

    useEffect(() => {
        if (g_roomList.length > 0) {
            setRoom(g_roomList[0].room_id);
            getData(g_roomList[0].room_id)
            // dispatch({
            //      type: ActionTypes.FETCH_HOTLIST_DATA,
            //      payload: {
            //          login_id: '@CMSIT',
            //          hosp_code: 'TPH',
            //          room_id: g_roomList[0].room_id,
            //          dept: isPT?'PT':'OT'
            //      }
            // })
        }
    }, [g_roomList])

    useEffect(()=>{

        dispatch({
            type: ActionTypes.FETCH_ROOT_LIST,
            payload: {
                "login_id":"@CMSIT",
                "dept":g_patientDetailsType,
                "hosp_code":"TPH"
            }
        })
    },[])
    // useEffect(()=>{setRoom(g_room)},[g_room])
    useEffect(()=>{
        console.log(g_hotList)
        setShowList(sortList(g_hotList))
        // let editSearchs = getEditList(g_hotList)
        // console.log(g_hotList, editSearchs)
        // if (editSearchs[0]?.value !== '--') {
            
        //     editSearchs.unshift({name: '--',value:'--'})
        // }
        // editSearchs.filter((item, index) => {
        //     if (index === 0) return item;
        //     if(item.value !== '--') return item
        // })
        // setEditSelects(editSearchs)
    },[g_hotList])
    const sortList = (list)=>{
        const retList = list.sort((a,b)=>{
            return Number(a.sort) - Number(b.sort)
        })
        return retList
    }
    const getEditList = (list)=>{
        return list.map((item)=>{
            return {name:item.treatment_name,value: item.treatment_name}
        })
    }
    
    const setSortNos = (sortLength) => {
        let tempSort = []
        for (let index = 1; index <= sortLength; index++) {
            tempSort.push({value: index,label: index})
        }
        return tempSort
    }
    
    useEffect(()=>{
        let dashpre = showList.map((item)=>{
            return {title:item.treatment_name,value: isPT?0:'/',display:item.display}
        })
        dashpre.unshift({ title: '', display: 'y',value: isPT?'Min(s)':'剩餘'} )
        setDashboardPre(dashpre)
    },[updatePre,showList.length])
    const toEdit = ()=>{
        setInEdit(true)
    }
    const sortChange = (data) => {
        const {newData,oldData} = data
        let newShowList = []
        for (let index = 0; index < showList.length; index++) {
            const item = showList[index];
            //small to big
            if(Number(newData.sort)>Number(oldData.sort)){
                if(item.sort>oldData.sort && item.sort<=newData.sort){
                    newShowList.push({...item,sort: Number(item.sort) - 1})
                    if(item.sort==newData.sort){
                        newShowList.push(newData)
                    }
                }else{if(item.sort !=oldData.sort)newShowList.push(item)}
            }else{//big to small  8->3
                if(item.sort>=newData.sort && item.sort<oldData.sort){
                    if(item.sort==newData.sort){
                        newShowList.push(newData)
                    }
                    newShowList.push({...item,sort: Number(item.sort) + 1})
                }else{if(item.sort !=oldData.sort)newShowList.push(item)}
            }
        }
        setShowList(()=>{return [...newShowList]})
        setUpdatePre(!updatePre)
    }

    const treatmentChange = (data) => {
        setShowList((list)=>{
            return list.map((item)=>{
                const newData = data.newData
                if(item.sort == newData.sort){
                    return {...item,room_id:room, treatment_name: newData.treatment_name, treatment_doc: newData.treatment.treatment_doc,treatment_category: newData.treatment.treatment_category,}
                }else{return item}
            })
        })
        setUpdatePre(!updatePre)
    }
    const displayChange = (data) => {
        setShowList((list)=>{
            return list.map((item)=>{
                const newData = data.newData
                if(item.sort == newData.sort){
                    return {...item,display: newData.display}
                }else{return item}
            })
        })
        setUpdatePre(!updatePre)
    }
    const remainingChange = (data) => {
        setShowList((list)=>{
            return list.map((item)=>{
                const newData = data.newData
                if(item.sort == newData.sort){
                    return {...item,remaining: newData.remaining}
                }else{return item}
            })
        })
        setUpdatePre(!updatePre)
    }
    const editChange = (obj) => {
        switch(obj.key){
            case 'sort':
                sortChange(obj.data);
                setDuplicatedObj({})
                break;
            case 'treatment':
                treatmentChange(obj.data);
                setDuplicatedObj({})
                break;
            case 'display':
                displayChange(obj.data);
                setDuplicatedObj({})
                break;
            case 'remaining':
                remainingChange(obj.data);
                break;
            default: return;
        }
    }

    const saveCancel = (flag)=>{
        let onlyList = []
        let msg = []
        let tempDupObj = {}
        if(flag){
            for (let index = 0; index < showList.length; index++) {
                const element = showList[index];
                let exsit = false;
                if (element.display && element.treatment_name !== '--') {
                    for (let i = 0; i < onlyList.length; i++) {
                        const e = onlyList[i];
                        if(element.treatment_name == e.treatment_name && e.display){
                            exsit = true
                            tempDupObj[element.sort] = true;
                            tempDupObj[e.sort] = true;
                            msg.push(`[${element.sort},${e.sort}]`)
                        }
                    }
                    if(!exsit)onlyList.push(element)
                }
            }
        }
        setErrorMsg(msg)
        setDuplicatedObj(tempDupObj)
        if(msg.length>0)return
        if(!flag)setShowList(g_hotList)
        dispatch({
            type: ActionTypes.UPDATE_HOTLIST_DATA,
            payload: {
                "login_id":"@CMSIT",
                "hosp_code":"TPH",
                room_id: room,
                dept: isPT?'PT':'OT',         
                // hot_items: []
                hot_items: flag?showList:g_hotList
            },
            callback: () => {
                if(!flag)return;
                dispatch({
                    type: ActionTypes.MESSAGE_OPEN_MSG,
                    payload: {
                        open: true,
                        messageInfo: {
                            message: 'Hot List Updated successfully',
                            messageType: 'success',
                            btn2Label: 'OK'
                        },
                    }
                });
            }
        })
        setInEdit(false)
        setUpdatePre(!updatePre)
    }
    const roomChange = (e) => {
        const room_id = e.target.value
        setRoom(room_id)
        getData(room_id);
        // dispatch({
        //     type: ActionTypes.FETCH_HOTLIST_DATA,
        //     payload: {
        //         login_id: '@CMSIT',
        //         hosp_code: 'TPH',
        //         room_id,
        //         dept: isPT?'PT':'OT'
        //     }
        // })
    } 
    const treatment_or_activities = g_patientDetailsType === 'PT' ? 'Treatments': 'Activities'
    return (
        <Grid container direction='column' className={classes.containerDiv} style={{backgroundColor:'#ecf0f7'}}>
            <Grid container >
                <Box style={{ padding: '11px 10px', width: '100%' }}>
                    <Box className={classes.rightContentTitle}>{'Hot List ' + treatment_or_activities}</Box>
                    <Box className={classes.roomTitle} >
                        {'Room'}
                    </Box>
                    <Box className={classes.roomSelectEdit}>
                        <CommonSelect
                            id={'hotListSelect'}
                            valueFiled='room_id' 
                            labelFiled='room_id'
                            items={g_roomList}
                            value={room}
                            disabled={inEdit}
                            style={{minWidth: 128}}
                            onChange={roomChange}
                        />
                        {inEdit?<Box>
                            <ColorButton 
                                id={'hotListCancelButton'}
                                onClick={()=>{saveCancel(false)}} >{'Cancel'}</ColorButton>
                            <ColorButton 
                                id={'hotListSaveButton'}
                                style={{backgroundColor: '#39ad90',color: '#fff',marginLeft: 10}} 
                                onClick={()=>{saveCancel(true)}}
                                startIcon={<img alt="save" src={SaveImg} />} >{'Save'}</ColorButton>
                        </Box>:<Box>
                            <ColorButton 
                                id={'hotListEditButton'}
                                style={{backgroundColor: '#39ad90',color: '#fff'}} 
                                onClick={()=>{toEdit()}}
                                startIcon={<img alt="shape" src={Shape} />} >{'Edit'}</ColorButton>
                        </Box>}
                        
                    </Box>
                </Box>
            </Grid>
            <Grid container style={{ flex: 1,width: '100%', position: 'relative'}}>
                <Grid className={classes.tableContent}>
                    <Box className={classes.rowItem} style={{
                            backgroundColor:'#e0e6f1',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#7b0400',
                        }}>
                        <span className={classes.sortSpan} >{'Sort No'}</span>
                        <span className={classes.sortTreatment} >{typeName}</span>
                        <span className={classes.remaining} >Item available</span>
                        {inEdit&&<span className={classes.sortDispaly} >{'Display'}</span>}
                    </Box>
                    {
                        showList&&showList.map((item,index)=>{
                            return inEdit?<ListEdit 
                                index={index} 
                                key={`editRow${item.treatment_name}${index}`} 
                                selectList={g_activityListByRoom} item={item}
                                onChange={(obj) => { editChange(obj) }} 
                                duplicatedObj={duplicatedObj}
                                sortList={setSortNos(showList.length)} />:<RowItem key={`hotListActivities${index}`} rowData={item} />
                        })
                    }
                </Grid>
            </Grid>
            {errorMsg.length>0 && <Box className={classes.errorTip} >
                Duplicated {treatment_or_activities} names, please review and update.
                </Box>}
            <Grid container style={{padding:'0px 10px 20px'}}>
                <Box className={classes.roomTitle} >
                    {'Item ordering preview'}
                </Box>
                <Box className={classes.roomTitle} style={{fontWeight: 'normal', marginTop: 0}} >
                    {'*The numbers of character may shown different in the exact dashboard'}
                </Box>
                <DashBoardButtomTable data={dashboardPre}/>
            </Grid>
        </Grid>
    )
}

const RowItem = (props) => {
    const classes = useStyles()
    const { rowData, others } = props
    const bgStyle = rowData.display?{}: {backgroundColor: '#d8d8d8' }
    return <Box className={classes.rowItem} style={bgStyle} {...others} >
        <span className={classes.sortSpan}>{rowData.sort}</span>
        <span className={classes.sortTreatment}>{rowData.treatment_name}</span>
        <span className={classes.remaining}>{rowData.remaining}</span>
    </Box>
}
export default HotList
