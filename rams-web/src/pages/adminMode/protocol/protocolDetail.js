import React, { useEffect, useState } from 'react'
import useStyles from './styles'
import { Grid, Typography, makeStyles, Box, InputAdornment, Switch, FormControl, InputLabel } from "@material-ui/core";
import CustomTextField from 'components/Input/CustomTextField';
import CommonSelect from 'components/CommonSelect/CommonSelect';
import * as _ from 'lodash';
import pathIcon from 'resource/Icon/landing/path-copy-18.png'
import TreatmentDetail from './treatmentDetail';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
import ColorButton from 'components/ColorButton/ColorButton';
import { useHistory, useLocation } from 'react-router-dom'


export default function ProtocolDetail(props) {
    const { protocolName, setTitle, hideProtocolDetail, hideAddProtocol, protocolIndex } = props

    const dispatch = useDispatch();
    const classes = useStyles()
    const history = useHistory()
    const [treatmentDetail, setTreatmentDetail] = useState({ isShow: false });
    const [protocolDetail, setProtocolDetail] = useState()
    const [isChange, setIsChange] = useState(false)
    const [protocolNameExist, setProtocolNameExist] = useState(false)
    const [oldProtocolName, setOldProtocolName] = useState(protocolName);

    const { protocolList } = useSelector(state => state.adminmode);

    //vertical-tab-1

    useEffect(() => {
        if (oldProtocolName) {
            let newData = _.cloneDeep(protocolList)
            newData = newData.filter(item => item.protocol_name === oldProtocolName)[0]
            const sortNo = new Set(["1", "2", "3", "4", "5"])

            if (newData) {

                newData.protocol_treatment_list.forEach(item => {
                    sortNo.delete(item.treatment_sort)
                })
                const remainingNo = Array.from(sortNo)
                for (const no of remainingNo) {
                    newData.protocol_treatment_list.push({
                        treatment_sort: no,
                        treatment_category: "",
                        treatment_name: "",
                        treatment_doc: "",
                        after_bp: "N",
                        after_spo2: "N",
                        assistance_device_2: "",
                        assistive_device_1: "",
                        assistive_device_2: "",
                        befor_bp: "N",
                        befor_spo2: "N",
                        distance: "",
                        duration: "",
                        handheld_remark: "N",
                        position: "",
                        region: "",
                        remark: "",
                        repetition: "",
                        resistance: "",
                        resistance_unit: "",
                        set: "",
                        side: "",
                        walking_aids: "",
                        weight_bearing_status_1: "",
                        weight_bearing_status_2: ""
                    }
                    )
                }

                newData.protocol_treatment_list.sort((a, b) => a.treatment_sort - b.treatment_sort)
                setProtocolDetail(newData)
            }
        }

    }, [protocolList, protocolName,oldProtocolName])


    useEffect(() => {

        if (!protocolName) {

            const obj = {
                "protocol_name": "",
                "protocol_status": "ACTIVE",
                "protocol_treatment_list": []
            }

            for (let i = 1; i < 6; i++) {
                obj.protocol_treatment_list.push({
                    treatment_sort: i.toString(),
                    treatment_category: "",
                    treatment_name: "",
                    treatment_doc: "",
                    after_bp: "N",
                    after_spo2: "N",
                    assistance_device_2: "",
                    assistive_device_1: "",
                    assistive_device_2: "",
                    befor_bp: "N",
                    befor_spo2: "N",
                    distance: "",
                    duration: "",
                    handheld_remark: "N",
                    position: "",
                    region: "",
                    remark: "",
                    repetition: "",
                    resistance: "",
                    resistance_unit: "",
                    set: "",
                    side: "",
                    walking_aids: "",
                    weight_bearing_status_1: "",
                    weight_bearing_status_2: ""

                })
            }
            setProtocolDetail(obj)

        }
    }, [])

    const handleSwitchPage = (treatmentData) => {

        setTreatmentDetail({ isShow: true, protocolName: protocolName || protocolDetail.protocol_name, treatmentData: treatmentData })

        setTitle("Treatment Details")

    }

    const handleSave = () => {

        const obj = {}

        protocolDetail.protocol_treatment_list.forEach(item => {
            if (!obj[item.treatment_sort]) {
                obj[item.treatment_sort] = 1
            } else {
                obj[item.treatment_sort] = obj[item.treatment_sort] + 1
            }
        })

        const repeatSortNo = Object.values(obj).findIndex(item => item > 1)

        if (repeatSortNo > -1) {

            dispatch({
                type: ActionTypes.MESSAGE_OPEN_MSG,
                payload: {
                    open: true,
                    messageInfo: {
                        message: 'Sort No cannot be repeated',
                        messageType: 'warning',
                        btn2Label: 'OK',
                    },
                }
            });
        } else if(protocolNameExist){
            dispatch({
                type: ActionTypes.MESSAGE_OPEN_MSG,
                payload: {
                    open: true,
                    messageInfo: {
                        message: 'This protocol name already exists and cannot be saved',
                        messageType: 'warning',
                        btn2Label: 'OK',
                        btn2Action: () => {
                            setProtocolNameExist(false);
                        },
                    },
                }
            });
        }else{

            const newData = _.cloneDeep(protocolList)
            const index = newData.findIndex((item) => item.protocol_name === oldProtocolName);
            if (index > -1) {
              //  const index = newData.findIndex(item => item.protocol_name === tempName)
                const newProtocolDetail = _.cloneDeep(protocolDetail)
                const arr = []
                newProtocolDetail.protocol_treatment_list.forEach((item, index) => {
                    if (item.treatment_name === '' && item.treatment_category === '') {
                        arr.push(index)
                    }
                })

                if (arr.length > 0) {
                    arr.sort((a, b) => {
                        return b - a
                    })
                    arr.forEach(item => {

                        newProtocolDetail.protocol_treatment_list.splice(item, 1)
                    })
                }


                newData[index] = newProtocolDetail
                const protocolTreatmentList = newProtocolDetail.protocol_treatment_list.map(
                    (item) =>
                        (item = {
                            ...item,
                            hosp_code: 'TPH',
                            dept: 'PT',
                            protocol_name: newProtocolDetail.protocol_name,
                            protocol_status: newProtocolDetail.protocol_status,
                        }),
                );
                dispatch({
                    type: ActionTypes.UPDATE_PROTOCOL_DATA,
                    payload: {
                        login_id: '@CMSIT',
                        hosp_code: 'TPH',
                        dept: 'PT',
                        action: 'UPDATE',
                        protocol_data: {
                            hosp_code: 'TPH',
                            protocol_name_old: oldProtocolName,
                            protocol_name: protocolDetail.protocol_name,
                            protocol_status: protocolDetail.protocol_status,
                            protocol_treatment_list: protocolTreatmentList,
                        },
                        callback: (res) => {
                            if (res === 'SUCCESS') {
                                setOldProtocolName(protocolDetail?.protocol_name);
                                setIsChange(false);
                            }
                            dispatch({
                                type: ActionTypes.MESSAGE_OPEN_MSG,
                                payload: {
                                    open: true,
                                    messageInfo: {
                                        message: res === 'SUCCESS' ? 'Save successfully' : 'Save failed',
                                        messageType: 'success',
                                        btn2Label: 'OK',
                                    },
                                },
                            });
                        },
                    },
                });
            } else {
                newData.push({
                    ...protocolDetail,
                    protocol_treatment_list: [],
                });
                dispatch({
                    type:ActionTypes.UPDATE_PROTOCOL_DATA,
                    payload:{
                        login_id:'@CMSIT',
                        hosp_code:'TPH',
                        dept:'PT',
                        action:'NEW',
                        protocol_data:{
                            ...protocolDetail,protocol_treatment_list:[],protocol_name_old:protocolDetail?.protocol_name,hosp_code:'TPH'
                        },
                        callback:(res)=>{
                            if(res==='SUCCESS'){
                                setOldProtocolName(protocolDetail?.protocol_name);
                                setIsChange(false)
                            }
                            dispatch({
                                type: ActionTypes.MESSAGE_OPEN_MSG,
                                payload: {
                                    open: true,
                                    messageInfo: {
                                        message: res === 'SUCCESS' ? 'Save successfully' : 'Save failed',
                                        messageType: 'success',
                                        btn2Label: 'OK',
                                    },
                                },
                            });
                        }
                    }
                })
            }
            setProtocolDetail({ ...protocolDetail });


            // setIsChange(false)

            // dispatch({
            //     type: ActionTypes.SET_ADMINMODE_DATA,
            //     payload: {
            //         protocolList: newData
            //     },
            // });

            // setOldProtocolName(protocolDetail?.protocol_name);

            // dispatch({
            //     type: ActionTypes.MESSAGE_OPEN_MSG,
            //     payload: {
            //         open: true,
            //         messageInfo: {
            //             message: 'Save successfully',
            //             messageType: 'success',
            //             btn2Label: 'OK',
            //         },
            //     }
            // });
        }


    }

    const handleCancel = () => {

        if (protocolName) {

            hideProtocolDetail({ isShow: false })
        } else {
            hideAddProtocol({ isShow: false })
        }
        setTitle("Protocol")
    }

    const handleItemClick = (item) => {

        if (protocolDetail.protocol_name === '') {
            dispatch({
                type: ActionTypes.MESSAGE_OPEN_MSG,
                payload: {
                    open: true,
                    messageInfo: {
                        message: 'Please enter protocol name',
                        messageType: 'warning',
                        btn2Label: 'OK',
                    },
                }
            });
        } else if (isChange) {
            dispatch({
                type: ActionTypes.MESSAGE_OPEN_MSG,
                payload: {
                    open: true,
                    messageInfo: {
                        message: 'Please save changes',
                        messageType: 'warning',
                        btn2Label: 'OK',
                    },
                }
            });
        } else {
           
            handleSwitchPage(item)
        }

    }

    return (
        <>
            {treatmentDetail.isShow ? <TreatmentDetail protocolName={oldProtocolName} protocolDetail={protocolDetail} treatmentData={treatmentDetail.treatmentData} hideTreatmentDetail={setTreatmentDetail} setTitle={setTitle} />
                : <Grid className={classes.detailContent}>
                    <Grid>
                        <Grid style={{ display: "flex", justifyContent: "space-between" }}>
                            <Grid>
                                <Typography className={classes.font}>Protocol Name</Typography>
                                <Box className={classes.input}>
                                    <CustomTextField
                                        id={"protocolPTDetailInput"}
                                        onChange={e => {


                                            const newData = _.cloneDeep(protocolDetail)
                                            newData.protocol_name = e.target.value

                                            setProtocolDetail(newData)

                                            setIsChange(true)

                                            const findIndex = protocolList.findIndex(item=>item.protocol_name.trim() === newData.protocol_name.trim())

                                            if(findIndex > -1 && findIndex !== protocolIndex){
                                                setProtocolNameExist(true)
                                                dispatch({
                                                    type: ActionTypes.MESSAGE_OPEN_MSG,
                                                    payload: {
                                                        open: true,
                                                        messageInfo: {
                                                            message: 'This protocol name already exists',
                                                            messageType: 'warning',
                                                            btn2Label: 'OK',
                                                        },
                                                    }
                                                });
                                            }
                                        }}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                        value={protocolDetail?.protocol_name}
                                        size="small"
                                        style={{
                                            height: '34px',
                                            width: "299px",
                                            borderRadius: '5px',
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    />
                                </Box>
                            </Grid>
                            <Grid style={{ width: "350px" }}>
                                <Typography className={classes.font}>Status</Typography>
                                <Grid className={classes.switch} style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ fontSize: "14px", fontWeight: 500 }}>
                                        Active
                                    </Typography>
                                    <Switch
                                        id={'protocolDetailSwitch'}
                                        checked={protocolDetail?.protocol_status === "ACTIVE" ? true : false}
                                        onChange={() => {

                                            let status = protocolDetail?.protocol_status
                                            if (protocolDetail?.protocol_status === "ACTIVE") {
                                                status = "INACTIVE"
                                            } else {
                                                status = "ACTIVE"
                                            }
                                            const newData = _.cloneDeep(protocolDetail)
                                            newData.protocol_status = status
                                            setProtocolDetail(newData)
                                            setIsChange(true)
                                        }}
                                        name="protocolDetailPTSwitch"
                                        inputProps={{ 'aria-label': 'checkbox' }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid style={{ marginTop: "29px" }}>
                            <Grid style={{ display: "flex", marginBottom: "10px" }}>
                                <Typography className={classes.font} style={{ marginRight: "39px" }}>Sort No</Typography>
                                <Typography className={classes.font} style={{ marginRight: "257px" }}>Category</Typography>
                                <Typography className={classes.font} style={{ marginRight: "39px" }}>Treatment</Typography>
                            </Grid>
                            <Grid>

                                {protocolDetail?.protocol_treatment_list?.length > -1 && protocolDetail?.protocol_treatment_list?.map((item, index) => {

                                    return (
                                        <Grid key={`protocolDetailPT-${index}`} className={classes.detailListItem} onClick={() => { handleItemClick(item)}} >
                                            <Box className={classes.protocolSelectContainer}
                                                onClick={e => e.stopPropagation()}>
                                                <CommonSelect
                                                    id={`protocolDetailSelect-${index}`}
                                                    placeholder={null}
                                                    style={{ width: "58px", height: "30px" }}
                                                    items={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }]}

                                                    onChange={e => {

                                                        const newData = _.cloneDeep(protocolDetail)
                                                        const temp = newData.protocol_treatment_list[index].treatment_sort
                                          
                                                        newData.protocol_treatment_list.forEach((item, itemIndex)=>{
                                                            if(item.treatment_sort ===  e.target.value){
                                                                newData.protocol_treatment_list[itemIndex].treatment_sort = temp
                                                            }
                                                        })
                                                        newData.protocol_treatment_list[index].treatment_sort = e.target.value
                                                        newData.protocol_treatment_list.sort((a,b)=>a.treatment_sort-b.treatment_sort)
                                                        setProtocolDetail(newData)
                                                        setIsChange(true)

                                                    }}
                                                    value={item.treatment_sort}
                                                    disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                                />
                                            </Box>

                                            <Grid style={{ width: "318px" }}>{protocolDetail?.protocol_treatment_list?.length > 0 && protocolDetail?.protocol_treatment_list?.[index] && protocolDetail?.protocol_treatment_list?.[index]?.treatment_category === "" ? "-" : protocolDetail?.protocol_treatment_list?.[index]?.treatment_category}</Grid>
                                            <Grid >{protocolDetail?.protocol_treatment_list?.length > 0 && protocolDetail?.protocol_treatment_list?.[index] && protocolDetail?.protocol_treatment_list?.[index]?.treatment_name === "" ? "-" : protocolDetail?.protocol_treatment_list?.[index]?.treatment_name}</Grid>
                                            <img src={pathIcon} alt='pathIcon' style={{ position: "absolute", right: 7 }} />
                                        </Grid>
                                    )
                                })}

                            </Grid>

                        </Grid>
                    </Grid>
                    <Grid className={classes.buttonDiv}>
                        <ColorButton id={'protocolDetailCancelButton'} onClick={handleCancel} style={{ height: 40, width: 110, borderRadius: "10px" }} variant="contained">Cancel</ColorButton>
                        <ColorButton id={'protocolDetailSaveButton'} onClick={handleSave} disabled={!isChange} style={{ marginLeft: 6, height: 40, width: 110, borderRadius: "10px", background: !isChange && "#999999", borderColor: !isChange && "transparent" }} variant="contained" color="primary">Save</ColorButton>
                    </Grid>
                </Grid>
            }

        </>
    )
}