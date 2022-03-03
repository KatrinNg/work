import React,{useState,useEffect} from "react"
import {useDispatch} from 'react-redux'
import {Box,Grid} from '@material-ui/core'
import CustomTextField from 'components/Input/CustomTextField'
import * as ActionTypes from 'redux/actionTypes'
import useStyles from './styles'

const ListEdit = (props) => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const {index,rowData,minEditData,maxEditData,currentPage,pageSize,others} = props

    const [minimumValue,setMinimumValue] = useState(rowData.minimumValue)
    const [maximumValue,setMaximumValue] = useState(rowData.maximumValue)

    useEffect(()=>{
        setMinimumValue(rowData.minimumValue)
        setMaximumValue(rowData.maximumValue)
    },[rowData])

    const handleChange = (e,index,flag) => {
        let newIndex = index
        if(currentPage>1){
            newIndex = (currentPage-1)*pageSize+index
        }
        if(flag === 'min'){
            setMinimumValue(e.target.value)
            minEditData.push({minimumValue:e.target.value*1,index:newIndex})
        }else{
            setMaximumValue(e.target.value)
            maxEditData.push({maximumValue:e.target.value*1,index:newIndex})
        }
    }

    const changeOnBlur = (flag) => {
        if(rowData.name !== 'spo2'){
            if(rowData.minimumValue && rowData.maximumValue){
                if (minimumValue*1>=maximumValue*1) {
                    if(flag === 'min'){
                        dispatch({
                            type: ActionTypes.MESSAGE_OPEN_MSG,
                            payload: {
                                open: true,
                                messageInfo: {
                                    message: 'MinimumValue should less than MaximumValue',
                                    messageType: 'warning',
                                    btn2Label: 'OK',
                                },
                            }
                        });
                        setMinimumValue('')
                    }else{
                        dispatch({
                            type: ActionTypes.MESSAGE_OPEN_MSG,
                            payload: {
                                open: true,
                                messageInfo: {
                                    message: 'MaximumValue should more than MinimumValue',
                                    messageType: 'warning',
                                    btn2Label: 'OK',
                                },
                            }
                        });
                        setMaximumValue('')
                    }
                }
            }
        }
    }

    return (
        <Grid {...others} key={`listEdit-${index}`} style={{ background: "#ffffff",padding: "0 62px 0 16px", display: "flex", justifyContent: "space-between", borderRadius: "6px", height: "40px", marginBottom: "5px", alignItems: "center" }}>
            <Box>{rowData.label}</Box>
            <Grid style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box style={{marginRight:90}}>
                    <CustomTextField
                        id={'vitalSignTypeListEditInput1'}
                        value={minimumValue}
                        onChange={(e)=>{handleChange(e,index,'min')}}
                        style={{width:80,backgroundColor:'#F5F5F5'}}
                        numberField
                        minNum={0}
                        maxNum={rowData.name==='spo2'?100:maximumValue*1-1}
                        changeOnBlur={()=>{changeOnBlur('min')}}
                        inputPropsStyle={{height:30,borderRadius:6}}
                    />
                </Box>
                <Box style={{marginRight:-30}}>
                    {
                        rowData.name === 'spo2'?<Box width={80}>100</Box>:
                        <CustomTextField
                            id={'vitalSignTypeListEditInput2'}
                            value={maximumValue}
                            onChange={(e)=>{handleChange(e,index,'max')}}
                            style={{width:80,backgroundColor:'#F5F5F5'}}
                            numberField
                            minNum={minimumValue*1+1}
                            changeOnBlur={()=>{changeOnBlur('max')}}
                            inputPropsStyle={{height:30,borderRadius:6}}
                        />
                    }
                </Box>
            </Grid>
        </Grid>
    )
}
export default ListEdit