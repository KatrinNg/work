import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Switch } from '@material-ui/core';
import {useSelector,useDispatch} from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
import CommonSelect from 'components/CommonSelect/CommonSelect';
import ColorButton from 'components/ColorButton/ColorButton';
import CustomTextField from 'components/Input/CustomTextField';
import useStyles from './styles';

const GroupDetail = (props) => {

    const {
        detail,
        handleSwitchPage,
        isAdd,
        storeData,
        currentPage,
        pageSize,
        setCurrentPage
    } = props

    const classes = useStyles();

    const dispatch = useDispatch()

    const [inputValue, setInputValue] = useState(detail.data.group_name)
    const [switchValue,setSwitchValue] = useState(detail.data.status==='ACTIVE'?true:false)
    const [selectValue,setSelectValue] = useState(detail.data.category || '')
    const [inputOldValue,setInputOldValue] = useState(detail.data.group_name)
    const {groupList,categoryGroupList} = useSelector(state=>state.adminmode)

    useEffect(()=>{
        dispatch({
            type: ActionTypes.FETCH_CATEGORY_GROUPLIST_DATA,
            payload: {
                login_id:"@CMSIT",
                dept:"OT",
                hosp_code:"TPH"
            }
        })
    },[dispatch])

    const handleCancel = () => {
        handleSwitchPage(false,groupList)
    }

    const handleSave = () => {
        let groupUpdateObj = {
            category: selectValue,
            group_name: inputValue,
            group_name_old: inputOldValue,
            status: switchValue?'ACTIVE':'INACTIVE',
        }
        let groupNewObj = {
            category: selectValue,
            group_name: inputValue,
            status: switchValue?'ACTIVE':'INACTIVE',
        }
        if(isAdd){
            storeData.unshift(groupNewObj)
            setCurrentPage(1)
            dispatch({
                type:ActionTypes.UPDATE_GROUPLIST_DATA,
                payload:{
                    login_id:'@CMSIT',
                    hosp_code:'TPH',
                    dept:'OT',
                    action:'NEW',
                    therapeutic_group_name: groupNewObj
                }
            })
        }else{
            if(currentPage>1){
                let newIndex = (currentPage-1)*pageSize+detail.index
                storeData[newIndex] = groupNewObj
            }else{
                storeData[detail.index] = groupNewObj
            }
        }
        dispatch({
            type:ActionTypes.UPDATE_GROUPLIST_DATA,
            payload:{
                login_id:'@CMSIT',
                hosp_code:'TPH',
                dept:'OT',
                action:'UPDATE',
                therapeutic_group_name: groupUpdateObj
            }
        })
        handleSwitchPage(false,storeData)
    }

    const handleSwitchChange = () => {
        setSwitchValue(!switchValue)
    }

    const handleSearchTextFieldChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleChange = (e) => {
        setInputOldValue(inputValue)
        setSelectValue(e.target.value)
    }

    return (
        <>
            <Box className={classes.contentDetailDiv}>
                <Box className={classes.header}>
                    <Box className={classes.headerTitle} style={{fontWeight:600}}>{'Group Details'}</Box>
                </Box>
                <Box className={classes.contentDetail}>
                    <Grid className={classes.box} style={{ width: '100%', display: 'flex' }}>
                        <Grid item xs={6}>
                            <Typography className={classes.detailTitle}>Name</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={classes.detailTitle}>Status</Typography>
                        </Grid>
                    </Grid>
                    <Grid className={classes.box} style={{ width: '100%', display: 'flex' }}>
                        <Grid item xs={4}  style={{ height: '40px',borderRadius: '8px',backgroundColor: '#f5f5f5',}}>
                            <CustomTextField
                                id={"groupDetailInput"}
                                onChange={(e) => {
                                    handleSearchTextFieldChange(e);
                                }}
                                value={inputValue}
                                size="small"
                                style={{
                                    height: '35px',
                                    borderRadius: '5px',
                                    backgroundColor: '#f5f5f5',
                                }}
                                disabled={isAdd?false:true}
                            />
                        </Grid>
                        <Grid item xs={2}></Grid>
                        <Grid item xs={4} className={classes.switch}>
                            <Box>Active</Box>
                            <Switch
                                id={'groupDetailSwitch'}
                                checked={switchValue}
                                onChange={handleSwitchChange}
                                name="groupDetailSwitch"
                                inputProps={{ 'aria-label': 'checkbox' }}
                            />
                        </Grid>
                    </Grid>
                    <Grid className={classes.box}>
                        <Grid item xs>
                            <Typography className={classes.detailTitle}>Category</Typography>
                        </Grid>
                    </Grid>
                    <Grid className={classes.box}>
                        <Grid item xs>
                            <Box
                                sx={{
                                    '& .MuiSelect-select.MuiSelect-select ': {
                                        background: '#f5f5f5',
                                        borderRadius: '4px',
                                        borderColor: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        transform: 'scale(1.2,2)',
                                    },
                                }}
                            >
                                <CommonSelect
                                    id={"groupDetailSelect"}
                                    placeholder={null}
                                    style={{
                                        height: '40px',
                                    }}
                                    labelFiled='category'
                                    valueFiled='category'
                                    items={categoryGroupList}
                                    value={selectValue}
                                    onChange={(e)=>{handleChange(e)}}
                                    disabled={isAdd?false:true}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid className={classes.buttonDiv}>
                        <ColorButton id={'groupDetailCancelButton'} onClick={() => handleCancel()} style={{ height: 40, width: 110, borderRadius: "10px" }} variant="contained">Cancel</ColorButton>
                        <ColorButton id={'groupDetailSaveButton'} onClick={() => handleSave()} style={{ marginLeft: 6, height: 40, width: 110, borderRadius: "10px" }} variant="contained" color="primary">Save</ColorButton>
                    </Grid>

                </Box>
            </Box>
        </>
    );
}
export default GroupDetail
