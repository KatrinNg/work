import React, { useEffect, useState } from 'react'
import useStyles from './styles'
import { Grid, Typography, makeStyles, Box, InputAdornment, Switch, FormControl, InputLabel } from "@material-ui/core";
import CustomTextField from 'components/Input/CustomTextField';
import CommonSelect from 'components/CommonSelect/CommonSelect';
import { categoryList, treatmentList } from './mockData';
import * as _ from 'lodash';
import * as ActionTypes from 'redux/actionTypes';
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';
import InputNumber from 'components/Input/InputNumber';
import CheckBox from "components/CheckBox/CheckBox";
import { useDispatch, useSelector } from 'react-redux';
import ColorButton from 'components/ColorButton/ColorButton';
import clsx from 'clsx';

export default function TreatmentDetail(props) {

    const { protocolName, treatmentData, hideTreatmentDetail, setTitle, protocolDetail } = props

    const classes = useStyles()
    const dispatch = useDispatch();
    const [treatmentDetail, setTreatmentDetail] = useState();

    const { protocolList, categoryGroupList, positionList, categoryList,
        sideList, regionList, setList, repetitionList, resistanceList,
        resistanceUnitList, walkingAidsList, assistiveDevice1List,
        assistiveDevice2List,
        weightBearingStatus1List, assistanceList, durationList, groupList } = useSelector(state => state.adminmode);


    useEffect(() => {
        setTreatmentDetail(treatmentData)
    }, [treatmentData])

    const handleSelectChange = (value, field) => {

        const newData = _.cloneDeep(treatmentDetail)
        newData[field] = value

        setTreatmentDetail(newData)
      
    }

    const handleSwitchChange = (value, field) => {
        let status
        if (value === "Y") {
            status = "N"
        } else {
            status = "Y"
        }


        const newData = _.cloneDeep(treatmentDetail)
        newData[field] = status
        setTreatmentDetail(newData)

    }

    const handleSave = () => {

        if (treatmentDetail.treatment_name === "" || treatmentDetail.treatment_category === "") {
            dispatch({
                type: ActionTypes.MESSAGE_OPEN_MSG,
                payload: {
                    open: true,
                    messageInfo: {
                        message: 'Category and treatment cannot be blank',
                        messageType: 'warning',
                        btn2Label: 'OK',
                    },
                }
            });

        } else {
            const newProtocolTreatmentList = protocolDetail.protocol_treatment_list;
            const foundIndex = newProtocolTreatmentList.findIndex((item)=>{
                return item.treatment_sort === treatmentDetail.treatment_sort;
            });
            if(foundIndex === -1)
            {
                newProtocolTreatmentList.push(treatmentDetail)
            }else{
                newProtocolTreatmentList.forEach((item2,index)=>{
                    if(item2.treatment_sort === treatmentDetail.treatment_sort){
                        newProtocolTreatmentList[index] = treatmentDetail;
                    }
                })
                const tempProtocolTreatmentList = newProtocolTreatmentList.filter((item)=>{return item.treatment_category&&item.treatment_name})
                const protocolTreatmentList = tempProtocolTreatmentList.map((item)=>item={...item,hosp_code:'TPH',dept:'PT',protocol_name:protocolName,protocol_status:protocolDetail.protocol_status})
                dispatch({
                    type: ActionTypes.UPDATE_PROTOCOL_DATA,
                    payload: {
                        login_id: '@CMSIT',
                        hosp_code: 'TPH',
                        dept: 'PT',
                        action: 'UPDATE',
                        protocol_data: {
                            hosp_code: 'TPH',
                            protocol_name_old: protocolName,
                            protocol_name: protocolName,
                            protocol_status: protocolDetail.protocol_status,
                            protocol_treatment_list: protocolTreatmentList,
                        },
                        callback: (res) => {
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
            }
        }

    }

    const handleCancel = () => {
        if (protocolName) {
            hideTreatmentDetail({ isShow: false, protocolName: '', treatmentSort: '' });
        } else {
            hideTreatmentDetail({ isShow: false });
        }
        setTitle("Protocol Details")

    }

    return (
        <>
            <Grid className={classes.treatmentContent}>
                <Grid>
                    <Typography className={classes.font}>Category</Typography>
                    <Box className={classes.treatmentSelectContainer} style={{ width: "454px", height: "40px" }}>
                        <SearchSelectList
                            id={'treatmentDetailCategorySearchSelectList'}
                            placeholder={"-"}
                            options={categoryList.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                            valueFiled={"treatment_category"}
                            labelFiled={"treatment_category"}
                            value={treatmentDetail?.treatment_category}
                            handleSelect={(v) => handleSelectChange(v, 'treatment_category')}
                            disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                        />
                    </Box>
                </Grid>
                <Grid style={{ marginTop: "23px" }}>
                    <Typography className={classes.font}>Treatment</Typography>
                    <Box className={classes.treatmentSelectContainer} style={{ width: "454px", height: "40px" }}>
                        <SearchSelectList
                            id={'treatmentDetailTreatmentSearchSelectList'}
                            placeholder={"-"}
                            options={groupList.filter(item=>item.status === "ACTIVE" && item.category === treatmentDetail?.treatment_category)}
                            valueFiled={"group_name"}
                            labelFiled={"group_name"}
                            value={treatmentDetail?.treatment_name}
                            handleSelect={(v) => handleSelectChange(v, 'treatment_name')}
                            disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                        />
                    </Box>
                </Grid>
                <Grid style={{ marginTop: "23px", width: "100%" }}>
                    <Typography className={classes.font}>Documentation</Typography>
                    <Box className={classes.treatmentDetailTextfield} >
                        <CustomTextField 
                            id={'treatmentDetailDocumentationInput'}
                            disabled 
                            style={{ borderColor: "transparent" }} 
                            fullWidth 
                            value={treatmentDetail?.treatment_doc} 
                        />
                    </Box>
                </Grid>
                <Grid style={{ marginTop: "23px", display: "flex" }}>
                    <Grid>
                        <Typography className={classes.font}>Position</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "240px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailPositionSearchSelectList'}
                                placeholder={"-"}
                                options={positionList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.position}
                                handleSelect={(v) => handleSelectChange(v, 'position')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid>
                        <Typography className={classes.font}>Side / Direction</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "240px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailSideOrDirectionSearchSelectList'}
                                placeholder={"-"}
                                options={sideList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.side}
                                handleSelect={(v) => handleSelectChange(v, 'side')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid>
                        <Typography className={classes.font}>Region</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "240px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailRegionSearchSelectList'}
                                placeholder={"-"}
                                options={regionList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.region}
                                handleSelect={(v) => handleSelectChange(v, 'region')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid style={{ marginTop: "23px", display: "flex" }}>
                    <Grid>
                        <Typography className={classes.font}>Set</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "151px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailSetSearchSelectList'}
                                placeholder={"-"}
                                options={setList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.set}
                                handleSelect={(v) => handleSelectChange(v, 'set')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid>
                        <Typography className={classes.font}>Repetition</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "320px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailRepetitionSearchSelectList'}
                                placeholder={"-"}
                                options={repetitionList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.repetition}
                                handleSelect={(v) => handleSelectChange(v, 'repetition')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid style={{ marginTop: "23px" }}>

                    <Typography className={classes.font}>Resistance</Typography>
                    <Grid style={{ display: "flex", alignItems: "center" }}>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "339px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailResistanceSearchSelectList1'}
                                placeholder={"-Select Resistance-"}
                                options={resistanceList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.resistance}
                                handleSelect={(v) => handleSelectChange(v, 'resistance')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                        <Grid style={{ marginRight: "20px" }}>Or</Grid>
                        <InputNumber
                            id={'treatmentDetailResistanceInputNumber'}
                            value={treatmentDetail?.resistance_value}
                            placeholder={0}
                            className={classes.treatmentDetailInputNum}
                            onChange={v => handleSelectChange(v, 'resistance_value')}
                            disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                        />
                        <Box className={classes.treatmentSelectContainer} style={{ width: "150px", height: "42px", marginLeft: "20px" }}>
                            <SearchSelectList
                                id={'treatmentDetailResistanceSearchSelectList2'}
                                placeholder={"-Select Unit-"}
                                options={resistanceUnitList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.resistance_unit}
                                handleSelect={(v) => handleSelectChange(v, 'resistance_unit')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>

                </Grid>
                <Grid style={{ marginTop: "23px", display: "flex" }}>
                    <Grid>
                        <Typography className={classes.font}>Walking Aids</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "240px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailWalkingAidsSearchSelectList'}
                                placeholder={"-"}
                                options={walkingAidsList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.walking_aids}
                                handleSelect={(v) => handleSelectChange(v, 'walking_aids')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid>
                        <Typography className={classes.font}>Assistive Device(1)</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "240px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailAssistiveDevice1SearchSelectList'}
                                placeholder={"-"}
                                options={assistiveDevice1List?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.assistive_device_1}
                                handleSelect={(v) => handleSelectChange(v, 'assistive_device_1')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid>
                        <Typography className={classes.font}>Assistive Device(2)</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "240px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailAssistiveDevice2SearchSelectList'}
                                placeholder={"-"}
                                options={assistiveDevice2List?.filter(item => item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.assistive_device_2}
                                handleSelect={(v) => handleSelectChange(v, 'assistive_device_2')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid style={{ marginTop: "23px", display: "flex" }}>
                    <Grid>
                        <Typography className={classes.font}>Weight Bearing Status</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "270px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailWeightBearingStatusSearchSelectList'}
                                placeholder={"-"}
                                options={weightBearingStatus1List?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.weight_bearing_status_1}
                                handleSelect={(v) => handleSelectChange(v, 'weight_bearing_status_1')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid>
                        <Typography className={classes.font}>Assistance</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "265px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailAssistanceSearchSelectList'}
                                placeholder={"-"}
                                options={assistanceList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.assistance_device_2}
                                handleSelect={(v) => handleSelectChange(v, 'assistance_device_2')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid>
                        <Typography className={classes.font}>Distance</Typography>
                        <InputNumber
                            id={'treatmentDetailDistanceInputNumber'}
                            fullWidth
                            className={classes.treatmentDetailInputNum}
                            suffix={<span style={{ fontSize: 14, color: '#000' }}>m</span>}
                            value={treatmentDetail?.distance}
                            onChange={v => handleSelectChange(v, 'distance')}
                            disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                        />
                    </Grid>

                </Grid>
                <Grid style={{ marginTop: "23px", display: "flex", width: "100%" }}>
                    <Grid>
                        <Typography className={classes.font}>Duration</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ width: "151px", height: "40px" }}>
                            <SearchSelectList
                                id={'treatmentDetailDurationSearchSelectList'}
                                placeholder={"-"}
                                options={durationList?.filter(item=>item.status.toUpperCase() === "ACTIVE")}
                                valueFiled={"value"}
                                labelFiled={"display_name"}
                                value={treatmentDetail?.duration}
                                handleSelect={(v) => handleSelectChange(v, 'duration')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid style={{ width: "100%" }}>
                        <Typography className={classes.font}>Remarks</Typography>
                        <Box className={classes.treatmentDetailTextfield} >
                            <CustomTextField
                                id={'treatmentDetailRemarksInput'}
                                style={{ borderColor: "transparent" }}
                                fullWidth value={treatmentDetail?.remark}
                                onChange={v => handleSelectChange(v.target.value, 'remark')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />

                        </Box>
                    </Grid>
                </Grid>
                <Grid>
                    <Grid container item xs={8} style={{ minWidth: 690 }}>
                        <Grid xs={6} item className={classes.secTitle}>Before</Grid>
                        <Grid xs={6} item className={classes.secTitle}>After</Grid>
                    </Grid>
                    <Grid container className={classes.switchesBox}>
                        <Grid container item className={clsx(classes.switch, classes.switchesItemsBox)} xs={8}>
                            <Grid container item className={`${classes.switchesBackground}`} xs={6}>
                                <Grid container item xs alignItems="center">
                                    <Grid item className={classes.labelName}>BP</Grid>
                                    <Switch
                                        id={'treatmentDetailBeforeBPSwitch'}
                                        checked={treatmentDetail?.befor_bp === "Y"}
                                        onChange={() => handleSwitchChange(treatmentDetail?.befor_bp, "befor_bp")}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                    />
                                </Grid>
                                <Grid container item xs alignItems="center" className={classes.yellowBorderColor}>
                                    <Grid item className={classes.labelName}>SpO2</Grid>
                                    <Switch
                                        id={'treatmentDetailBeforeSpO2Switch'}
                                        checked={treatmentDetail?.befor_spo2 === "Y"}
                                        onChange={() => handleSwitchChange(treatmentDetail?.befor_spo2, "befor_spo2")}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item className={`${classes.switchesBackground}`} xs={6}>
                                <Grid container item xs alignItems="center">
                                    <Grid item className={classes.labelName}>BP</Grid>
                                    <Switch
                                        id={'treatmentDetailAfterBPSwitch'}
                                        checked={treatmentDetail?.after_bp === "Y"}
                                        onChange={() => handleSwitchChange(treatmentDetail?.after_bp, "after_bp")}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                    />
                                </Grid>
                                <Grid container item xs alignItems="center">
                                    <Grid item className={classes.labelName}>SpO2</Grid>
                                    <Switch
                                        id={'treatmentDetailAfterSpO2Switch'}
                                        checked={treatmentDetail?.after_spo2 === "Y"}
                                        onChange={() => handleSwitchChange(treatmentDetail?.after_spo2, "after_spo2")}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container item xs>
                    <CheckBox 
                        id={'treatmentDetailCheckBox'}
                        iconSize={20}
                        checked={treatmentDetail?.handheld_remark === "Y"}
                        label={<span className={classes.checkboxLabel}>Handheld remark</span>}
                        onChange={() => handleSwitchChange(treatmentDetail?.handheld_remark, "handheld_remark")}
                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                    />
                </Grid>
                <Grid className={classes.buttonDiv}>
                    <ColorButton 
                        id={'treatmentDetailCancelButton'}
                        onClick={handleCancel} 
                        style={{ height: 40, width: 110, borderRadius: "10px" }} 
                        variant="contained">
                            Cancel
                    </ColorButton>
                    <ColorButton
                        id={'treatmentDetailSaveButton'}
                        onClick={handleSave}
                        style={{ marginLeft: 6, height: 40, width: 110, borderRadius: "10px" }}
                        variant="contained" color="primary"
                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                    >
                        Save
                    </ColorButton>
                </Grid>
            </Grid>
        </>
    )
}