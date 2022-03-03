import { Grid } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useStyles } from "./styles";
import edit from 'resource/Icon/demo-icon/edit.svg';
import CommonItem from "components/CommonItem/CommonItem";
import CommonSelect from "components/CommonSelect/CommonSelect";
import CustomTextField from 'components/Input/CustomTextField';
import Switch from 'components/Switch/Switch';
import DetailTab from '../DetailTab';
import TimePicker from 'components/TimePicker/TimePicker';
import CheckBox from "components/CheckBox/CheckBox";
import './ScheduleTherapeuticGroup.css'
import CustomDatePicker from 'components/Date/CustomDatePicker'
import timeIcon from 'resource/Icon/time.svg';
import Icon from "@material-ui/core/Icon";
import moment from "moment";
import * as ActionTypes from 'redux/actionTypes';
import { useDispatch, useSelector } from 'react-redux';

const ScheduleTherapeuticGroup = (props) => {
    const classes = useStyles();
    const therapeuticGroupName = 'therapeuticGroup'
    const dispatch = useDispatch();
    const { 
        title,
        isEdit,
        setDateRange,
        room,
        category,
        name,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        startTime,
        endTime,
        setStartTime,
        setEndTime,
        week,
        remark,
        setRoom,
        setCategory,
        setName,
        setRemark,
        forceErrorDisplay,
        setIsValidValue,
        setIsReadOnly,
        setCalendarDisabled,
        titleColor,
        onChangeWeek,
        setIsRecurrent,
        selectedDate,
        isRecurrent,
        handleSetSelectDate,
        treatmentId
    } = props;
    function setRecurrentDays({ target }, index) {
        const { checked } = target;
        onChangeWeek(checked, index)
    }
    const { roomList } = useSelector((state) => state.patientDetail);
    // const { category_list } = useSelector((state) => state.calendar);
    const [categoryList, setCategoryList] = useState([])
    const [nameList, setNameList] = useState([])

    useEffect(() => {
        dispatch({type: ActionTypes.FETCH_ROOT_LIST,payload: {}});
        dispatch({type: ActionTypes.FETCH_CATEGORY_LIST,payload: {
            callback: (apiData) => {
                setCategoryList(apiData)
            }
        }});
    }, [])
    
    const changeIsRecurrent = ({target}) => {
        const { checked } = target;
        setIsRecurrent(checked);
        handleSetSelectDate(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), null, checked)
    }

    const assemblyData = (value = '', isStartDate) => {
        if (value) {
            const result = isStartDate ? [value, endDate] : [startDate, value];
            const formatResult = result.map(i => { return moment(i).format('YYYY-MM-DD')});
            setDateRange(formatResult)
        }
    }

    const handleRemark = ({target}) => {
        const { value } = target;
        setRemark(value)
    }

    const onEdit = () => {
        setIsReadOnly(true);
        setCalendarDisabled(true);
        setDateRange([moment(startDate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD')])
    }

    const handleChangeRoom = (e) => {
        setRoom(e.target.value)
    }
    return (
        <Grid container direction='column' style={{paddingTop: 50,paddingRight: 5, height: '100%'}}>
            <Grid container className={classes.title}>
                <Grid container item xs={10}>
                    { isEdit ? null : <span className={classes.typeColor} style={{background: titleColor}}></span> }
                    <Grid>{title}</Grid>
                </Grid>
                <Grid container item alignItems="center" justifyContent="flex-end" xs={2}>
                    { isEdit ? null : <img className={classes.editIcon} src={edit} onClick={onEdit} /> }
                </Grid>
            </Grid>
            <Grid container style={{flex: 1, position: 'relative', width: '100%'}}>

                <Grid className={classes.baseBox}>
                    <DetailTab treatmentId={treatmentId} selectedDate={selectedDate}/>
                    <Grid container style={{paddingLeft:15, paddingRight: 12}}>
                        <CommonItem label={'Room'} labelWidth={81}>
                            {
                                isEdit ? 
                                <CommonSelect
                                    valueFiled='room_id' 
                                    labelFiled='room_id' 
                                    required={true} 
                                    width={'calc(100% - 81px)'} 
                                    placeholder={'Room'} 
                                    id={`${therapeuticGroupName}Room`} 
                                    value={room} 
                                    onChange={(e)=>{handleChangeRoom(e)}}
                                    items={roomList} 
                                /> : 
                                <span>{room}</span>
                            } 
                        </CommonItem>
                        <CommonItem label={'Category'} labelWidth={81}>
                            {
                                isEdit ? 
                                <CommonSelect 
                                    valueFiled='category'
                                    labelFiled='category'
                                    required={true} width={'calc(100% - 81px)'} 
                                    placeholder={'Category'} 
                                    id={`${therapeuticGroupName}Category`} 
                                    value={category} 
                                    onChange={(e)=>{setCategory(e.target.value)}} 
                                    items={categoryList} 
                                /> : 
                                <div className={classes.readOnlyItem}>{category}</div>
                            }
                        </CommonItem>
                        <CommonItem label={'Name'} labelWidth={81}>
                            {
                                isEdit ? 
                                <CommonSelect
                                    required={true}
                                    valueFiled='group_name'
                                    labelFiled='group_name'
                                    width={'calc(100% - 81px)'}
                                    placeholder={'Name'}
                                    id={`${therapeuticGroupName}Name`}
                                    value={name}
                                    onChange={(e)=>{console.log(e);setName(e.target.value)}}
                                    items={categoryList}
                                /> : 
                                <div className={classes.readOnlyItem}>{name}</div>
                            }
                        </CommonItem>
                        <CommonItem label={'Date'} labelWidth={81}>
                            {
                                isEdit ? 
                                <Grid container style={{flex: 1}} >
                                    <Grid item style={{flex: 1}}>
                                        <CustomDatePicker
                                            value={startDate}
                                            // label={'Start Date'}
                                            handleChangeDate={(e) => {
                                                const value = e.target.value;
                                                setStartDate(value);
                                                assemblyData(value, true);
                                            }}
                                            maxDate={endDate}
                                            forceErrorDisplay={forceErrorDisplay}
                                            validators={['isRequired']}
                                        />
                                    </Grid>
                                    <Grid item style={{padding: '0 7px', lineHeight: '40px'}} className={classes.label}>to</Grid>
                                    <Grid item style={{flex: 1}}>
                                        <CustomDatePicker
                                            value={endDate}
                                            minDate={startDate}
                                            // label={'End Date'}
                                            handleChangeDate={(e) => {
                                                const value = e.target.value;
                                                setEndDate(value);
                                                assemblyData(value, false);
                                            }}
                                            forceErrorDisplay={forceErrorDisplay}
                                            validators={['isRequired']}
                                        />
                                    </Grid>
                                </Grid>: 
                                <div className={classes.readOnlyItem}>{moment(startDate).format('DD-MMM-YYYY')} to {moment(endDate).format('DD-MMM-YYYY')}</div>
                            }
                        </CommonItem>
                        <CommonItem label={'Time'} labelWidth={81}>
                            {
                                isEdit ? 
                                <Grid container style={{flex: 1}}  >
                                    <Grid item style={{flex: 1}}>
                                        <TimePicker
                                                value={startTime}
                                                maxTime={endTime}
                                            onChange={(time) => {setStartTime(time)}}
                                                keyboardIcon={<Icon ><img width={18} height={18} alt="" src={timeIcon} /></Icon>}
                                                validators={['isRequired']}
                                                isValidValue={(isValid) => setIsValidValue(isValid)}
                                                forceErrorDisplay={forceErrorDisplay}
                                            ampm={false}
                                        />
                                    </Grid>
                                    <Grid item style={{padding: '0 7px', lineHeight: '40px'}} className={classes.label}>to</Grid>
                                    <Grid item style={{flex: 1}}>
                                        <TimePicker
                                                value={endTime}
                                                minTime={startTime}
                                            onChange={(time) => {setEndTime(time)}}
                                                keyboardIcon={<Icon ><img width={18} height={18} alt="" src={timeIcon} /></Icon>}
                                                validators={['isRequired']}
                                                isValidValue={(isValid) => setIsValidValue(isValid)}
                                                forceErrorDisplay={forceErrorDisplay}
                                            ampm={false}
                                        />
                                    </Grid>
                                </Grid>
                            : 
                                <div className={classes.readOnlyItem}>{moment(startTime).format('HH:mm')} to {moment(endTime).format('HH:mm')}</div>
                            }
                        </CommonItem>
                        {
                            isEdit ? 
                            <CommonItem label={'Recurrent'} labelWidth={81}>
                                <Grid style={{marginLeft: -10}} >
                                    <Switch checked={isRecurrent} onChange={(e) => changeIsRecurrent(e)}/>
                                </Grid>
                            </CommonItem>: 
                            null
                        }
                        {
                        isEdit && isRecurrent ? 
                            <CommonItem label={''} labelWidth={81} labelStyle={{height: '100%'}}>
                                <Grid container style={{width: 'calc(100% - 81px)'}}>
                                    {
                                        week.map((item, i) => {
                                            //select-label-class
                                            return (
                                                <CheckBox
                                                checked={item.checked}
                                                onChange={(e) => { setRecurrentDays(e, i) }}
                                                customformlabelclass={`${item.checked ? 'recurrent-custom-form-label-class select-label-class' :'recurrent-custom-form-label-class'}`}
                                                label={item.day}
                                                key={i}/>
                                            )
                                        })
                                    }
                                </Grid>
                            </CommonItem>: 
                            null
                        }
                        <CommonItem label={'Remark'} labelWidth={81}>
                            {
                                isEdit ? 
                                <CustomTextField
                                    value={remark}
                                    onChange={handleRemark}
                                    style={{width: 'calc(100% - 81px)'}}
                                    placeholder="Remark"
                                />: 
                                <div className={classes.readOnlyItem}>{remark || '-'}</div>
                            }
                        </CommonItem>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ScheduleTherapeuticGroup