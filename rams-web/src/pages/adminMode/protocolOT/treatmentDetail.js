import React, { useEffect, useState } from 'react';
import useStyles from './styles';
import { Grid, Typography, Box, Switch } from '@material-ui/core';
import CustomTextField from 'components/Input/CustomTextField';
import * as _ from 'lodash';
import * as ActionTypes from 'redux/actionTypes';
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';
import CheckBox from 'components/CheckBox/CheckBox';
import { useDispatch, useSelector } from 'react-redux';
import ColorButton from 'components/ColorButton/ColorButton';
import clsx from 'clsx';

export default function TreatmentDetail(props) {
    const { protocolName, treatmentData, hideTreatmentDetail, setTitle, protocolDetail } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [treatmentDetail, setTreatmentDetail] = useState();
    const [categoryList, setCategoryList] = useState();
    const [activityList, setActivityList] = useState();
    const {
        activityListByRoom,
        positionList,
        sideList,
        walkingAidsList,
        assistiveDevice1List,
        assistiveDevice2List,
        assistanceList,
        durationList,
        weightBearingStatus1List,
        weightBearingStatus2List,
    } = useSelector((state) => state.adminmode);

    useEffect(() => {
        setTreatmentDetail(treatmentData);
    }, [treatmentData]);

    const handleSelectChange = (value, field) => {
        const newData = _.cloneDeep(treatmentDetail);
        newData[field] = value;
        setTreatmentDetail(newData);
    };

    const handleSwitchChange = (value, field) => {
        const status = value === 'Y' ? 'N' : 'Y';
        const newData = _.cloneDeep(treatmentDetail);
        newData[field] = status;
        setTreatmentDetail(newData);
    };

    const handleSave = () => {
        console.log(treatmentDetail.treatment_name,treatmentDetail.treatment_category)
        if (treatmentDetail.treatment_name === '' || treatmentDetail.treatment_category === '') {
            dispatch({
                type: ActionTypes.MESSAGE_OPEN_MSG,
                payload: {
                    open: true,
                    messageInfo: {
                        message: 'Category and activity cannot be blank',
                        messageType: 'warning',
                        btn2Label: 'OK',
                        btn2Action: () => {},
                    },
                },
            });
        } else {
            const newProtocolTreatmentList = protocolDetail.protocol_treatment_list;
            const foundIndex = newProtocolTreatmentList.findIndex((item) => {
                return item.treatment_sort === treatmentDetail.treatment_sort;
            });
            if (foundIndex === -1) {
                newProtocolTreatmentList.push(treatmentDetail);
            } else {
                newProtocolTreatmentList.forEach((item2, index) => {
                    if (item2.treatment_sort === treatmentDetail.treatment_sort) {
                        newProtocolTreatmentList[index] = treatmentDetail;
                    }
                });
                const tempProtocolTreatmentList = newProtocolTreatmentList.filter((item) => {
                    return item.treatment_category && item.treatment_name;
                });
                const protocolTreatmentList = tempProtocolTreatmentList.map(
                    (item) =>
                        (item = {
                            ...item,
                            hosp_code: 'TPH',
                            dept: 'OT',
                            protocol_name: protocolName,
                            protocol_status: protocolDetail.protocol_status,
                        }),
                );
                dispatch({
                    type: ActionTypes.UPDATE_PROTOCOL_DATA,
                    payload: {
                        login_id: '@CMSIT',
                        hosp_code: 'TPH',
                        dept: 'OT',
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
    };

    const handleCancel = () => {
        if (protocolName) {
            hideTreatmentDetail({ isShow: false, protocolName: '', treatmentSort: '' });
        } else {
            hideTreatmentDetail({ isShow: false });
        }
        setTitle('Protocol Details');
    };

    const handleCategoryAndNameChange = (val,type) =>{
        const newData = _.cloneDeep(treatmentDetail);
        if(type === 'treatment_category'&& val)
        {
            const category = activityListByRoom?.filter((item) => item?.treatment_category === val)
            const res = category.map((item) => {
                return item.treatment_name;
            });
            const tempActivity = Array.from(new Set(res)).map((item) => {
                return { name: item, value: item };
            });
            setActivityList(tempActivity);
            newData['treatment_category'] = val;
            if(treatmentDetail?.treatment_name && !tempActivity.find((item) => item.value === treatmentDetail?.treatment_name))
            { 
                newData['treatment_name'] = '';
                newData['treatment_doc'] = '';
            }
        }
        if(type === 'treatment_name'&& val)
        {
            const activity = activityListByRoom?.filter((item) => item?.treatment_name === val)
            const res = activity.map((item) => {
                return item.treatment_category;
            });
            const tempCategory = Array.from(new Set(res)).map((item) => {
                return { name: item, value: item };
            });
            setCategoryList(tempCategory);
            newData['treatment_name'] = val;
            if(treatmentDetail?.treatment_category && !tempCategory.find((item) => item.value === treatmentDetail?.treatment_category))
            { 
                newData['treatment_category'] = ''
                newData['treatment_doc'] = '';
            }
        }
        setTreatmentDetail(newData);
    }

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_ACTIVITY_LIST_BY_ROOM,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
                room_id: 'G046',
            },
        });
    }, [dispatch]);

    useEffect(() => {
        const res = activityListByRoom.map((item) => {
            return item.treatment_category;
        });
        const tempCategory = Array.from(new Set(res)).map((item) => {
            return { name: item, value: item };
        });
        setCategoryList(tempCategory);

        const res1 = activityListByRoom.map((item) => {
            return item.treatment_name;
        });
        const tempActivity = Array.from(new Set(res1)).map((item) => {
            return { name: item, value: item };
        });
        setActivityList(tempActivity);
    }, [activityListByRoom]);

    useEffect(() => {
        if (treatmentDetail?.treatment_category && treatmentDetail?.treatment_name) {
            try{
                activityListByRoom.forEach((item) => {
                    if (
                        item?.treatment_category === treatmentDetail?.treatment_category &&
                        item?.treatment_name === treatmentDetail?.treatment_name &&
                        item?.treatment_doc
                    ) {
                        setTreatmentDetail({ ...treatmentDetail, treatment_doc: item?.treatment_doc });
                        throw Error();
                    }
                });
            }catch(e){
            }

        }
    }, [activityListByRoom, treatmentDetail?.treatment_category, treatmentDetail?.treatment_name]);

    return (
        <>
            <Grid className={classes.treatmentContent}>
                <Grid>
                    <Typography className={classes.font}>Category</Typography>
                    <Box className={classes.treatmentSelectContainer} style={{ width: '454px', height: '40px' }}>
                        <SearchSelectList
                            id={'treatmentDetailCategorySearchSelectList'}
                            placeholder={'-'}
                            options={categoryList}
                            valueFiled={'value'}
                            labelFiled={'name'}
                            value={treatmentDetail?.treatment_category}
                            handleSelect={(v) => {handleCategoryAndNameChange(v, 'treatment_category')}}
                            disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                        />
                    </Box>
                </Grid>
                <Grid style={{ marginTop: '23px' }}>
                    <Typography className={classes.font}>Activity</Typography>
                    <Box className={classes.treatmentSelectContainer} style={{ width: '454px', height: '40px' }}>
                        <SearchSelectList
                            id={'treatmentDetailActivitySearchSelectList'}
                            placeholder={'-'}
                            options={activityList}
                            valueFiled={'value'}
                            labelFiled={'name'}
                            value={treatmentDetail?.treatment_name}
                            handleSelect={(v) => {handleCategoryAndNameChange(v, 'treatment_name')}}
                            disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                        />
                    </Box>
                </Grid>
                <Grid style={{ marginTop: '23px', width: '100%' }}>
                    <Typography className={classes.font}>Documentation</Typography>
                    <Box className={classes.treatmentDetailTextfield}>
                        <CustomTextField
                            id={'treatmentDetailDocumentationInput'}
                            disabled
                            style={{ borderColor: 'transparent' }}
                            fullWidth
                            value={treatmentDetail?.treatment_doc}
                        />
                    </Box>
                </Grid>
                <Grid style={{ marginTop: '23px', display: 'flex', width: '100%' }}>
                    <Grid item xs={4}>
                        <Typography className={classes.font}>Duration</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailDurationSearchSelectList'}
                                placeholder={'-'}
                                options={durationList?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.duration}
                                handleSelect={(v) => handleSelectChange(v, 'duration')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.font}>Side</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailSideSearchSelectList'}
                                placeholder={'-'}
                                options={sideList?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.side}
                                handleSelect={(v) => handleSelectChange(v, 'side')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.font}>Position</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailPositionSearchSelectList'}
                                placeholder={'-'}
                                options={positionList?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.position}
                                handleSelect={(v) => handleSelectChange(v, 'position')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid style={{ marginTop: '23px', display: 'flex', width: '100%' }}>
                    <Grid item xs={6}>
                        <Typography className={classes.font}>Assistance</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailAssistanceSearchSelectList'}
                                placeholder={'-Assistance-'}
                                options={assistanceList}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.assistance}
                                handleSelect={(v) => handleSelectChange(v, 'assistance')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className={classes.font}>Walking Aids</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailWalkingAidsSearchSelectList'}
                                placeholder={'-Walking Aids-'}
                                options={walkingAidsList?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.walking_aids}
                                handleSelect={(v) => handleSelectChange(v, 'walking_aids')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid style={{ marginTop: '23px', display: 'flex', width: '100%' }}>
                    <Grid item xs={6}>
                        <Typography className={classes.font}>Assistive Device(1)</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailAssistiveDevice1SearchSelectList'}
                                placeholder={'-Assistive Device(1)-'}
                                options={assistiveDevice1List?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.assistive_device_1}
                                handleSelect={(v) => handleSelectChange(v, 'assistive_device_1')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className={classes.font}>Assistive Device(2)</Typography>
                        <Box className={classes.treatmentSelectContainer} style={{ marginRight: '20px' }}>
                            <SearchSelectList
                                 id={'treatmentDetailAssistiveDevice2SearchSelectList'}
                                placeholder={'-Assistive Device(2)-'}
                                options={assistiveDevice2List?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.assistive_device_2}
                                handleSelect={(v) => handleSelectChange(v, 'assistive_device_2')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid style={{ marginTop: '23px', display: 'flex', width: '100%' }}>
                    <Grid item xs={6}>
                        <Typography className={classes.font}>Weight Bearing Status(1)</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailWeightBearingStatus1SearchSelectList'}
                                placeholder={'-Weight Bearing Status(1)-'}
                                options={weightBearingStatus1List?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.weight_bearing_status_1}
                                handleSelect={(v) => handleSelectChange(v, 'weight_bearing_status_1')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className={classes.font}>Weight Bearing Status(2)</Typography>
                        <Box className={classes.treatmentSelectContainer}>
                            <SearchSelectList
                                id={'treatmentDetailWeightBearingStatus2SearchSelectList'}
                                placeholder={'-Weight Bearing Status(2)-'}
                                options={weightBearingStatus2List?.filter((item) => item.status === 'ACTIVE')}
                                valueFiled={'value'}
                                labelFiled={'display_name'}
                                value={treatmentDetail?.weight_bearing_status_2}
                                handleSelect={(v) => handleSelectChange(v, 'weight_bearing_status_2')}
                                disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid style={{ marginTop: '23px', width: '100%' }}>
                    <Typography className={classes.font}>Remarks</Typography>
                    <Box className={classes.treatmentDetailTextfield} style={{ marginRight: '20px' }}>
                        <CustomTextField
                            id={'treatmentDetailRemarksInput'}
                            style={{ borderColor: 'transparent' }}
                            fullWidth
                            value={treatmentDetail?.remark}
                            onChange={(v) => handleSelectChange(v.target.value, 'remark')}
                            disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                        />
                    </Box>
                </Grid>
                <Grid>
                    <Grid container item xs={8} style={{ minWidth: 690 }}>
                        <Grid xs={6} item className={classes.secTitle}>
                            Before
                        </Grid>
                        <Grid xs={6} item className={classes.secTitle}>
                            After
                        </Grid>
                    </Grid>
                    <Grid container className={classes.switchesBox}>
                        <Grid container item className={clsx(classes.switch, classes.switchesItemsBox)} xs={8}>
                            <Grid container item className={`${classes.switchesBackground}`} xs={6}>
                                <Grid container item xs alignItems="center">
                                    <Grid item className={classes.labelName}>
                                        BP
                                    </Grid>
                                    <Switch
                                        id={'treatmentDetailBeforeBPSwitch'}
                                        checked={treatmentDetail?.befor_bp === 'Y'}
                                        onChange={() => handleSwitchChange(treatmentDetail?.befor_bp, 'befor_bp')}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                    />
                                </Grid>
                                <Grid container item xs alignItems="center" className={classes.yellowBorderColor}>
                                    <Grid item className={classes.labelName}>
                                        SpO2
                                    </Grid>
                                    <Switch
                                        id={'treatmentDetailBeforeSpO2Switch'}
                                        checked={treatmentDetail?.befor_spo2 === 'Y'}
                                        onChange={() => handleSwitchChange(treatmentDetail?.befor_spo2, 'befor_spo2')}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item className={`${classes.switchesBackground}`} xs={6}>
                                <Grid container item xs alignItems="center">
                                    <Grid item className={classes.labelName}>
                                        BP
                                    </Grid>
                                    <Switch
                                        id={'treatmentDetailAfterBPSwitch'}
                                        checked={treatmentDetail?.after_bp === 'Y'}
                                        onChange={() => handleSwitchChange(treatmentDetail?.after_bp, 'after_bp')}
                                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                                    />
                                </Grid>
                                <Grid container item xs alignItems="center">
                                    <Grid item className={classes.labelName}>
                                        SpO2
                                    </Grid>
                                    <Switch
                                        id={'treatmentDetailAfterSpO2Switch'}
                                        checked={treatmentDetail?.after_spo2 === 'Y'}
                                        onChange={() => handleSwitchChange(treatmentDetail?.after_spo2, 'after_spo2')}
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
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                        checked={treatmentDetail?.handheld_remark === 'Y'}
                        onChange={() => handleSwitchChange(treatmentDetail?.handheld_remark, 'handheld_remark')}
                        label={<span className={classes.checkboxLabel}>Handheld remark</span>}
                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                    />
                </Grid>
                <Grid className={classes.buttonDiv}>
                    <ColorButton
                        id={'treatmentDetailCancelButton'}
                        style={{ height: 40, width: 110, borderRadius: '10px' }}
                        variant="contained"
                        onClick={handleCancel}
                    >
                        Cancel
                    </ColorButton>
                    <ColorButton
                        id={'treatmentDetailSaveButton'}
                        style={{ marginLeft: 6, height: 40, width: 110, borderRadius: '10px' }}
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={protocolDetail?.protocol_status.toUpperCase() === "ACTIVE" ? false : true}
                    >
                        Save
                    </ColorButton>
                </Grid>
            </Grid>
        </>
    );
}
