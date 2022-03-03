import { Grid } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import useStyles from './styles';
import ScheduleGroup from "./ScheduleGroup";
import BigCalendar from 'components/Calendar/Calendar'
import ColorButton from 'components/ColorButton/ColorButton';
import CalendarDetailsPopup from "./CalendarDetailsPopup";
import ScheduleTherapeuticGroup from './ScheduleTherapeuticGroup/ScheduleTherapeuticGroup';
import * as ActionTypes from 'redux/actionTypes';
import AddIcon from 'resource/Icon/add-group.svg';
import IconButton from '@material-ui/core/IconButton';
import moment from "moment";
import { CONSTANT } from 'constants/MessageList';
import * as _ from 'lodash';
import api from "api/calendar";
const { setCalendarList } = api;
// import useDebounce from 'hooks/useDebounce';

const Index = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const defaultSelectedDate = new Date();
    const colorList = CONSTANT.colorList;

    const [isCreate, setIsCreate] = useState(false);
    const [week, setWeek] = useState([
        {day: 'Monday', checked: false},
        {day: 'Friday', checked: false},
        {day: 'Tuesday', checked: false},
        {day: 'Saturday', checked: false},
        {day: 'Wednesday', checked: false},
        {day: 'Sunday', checked: false},
        {day: 'Thursday', checked: false},
    ]);
    const [dateRange, setDateRange] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [open, setOpen] = useState(false);
    const [calendarDetail, setCalendarDetail] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [events, setEvents] = useState([]);
    const [room, setRoom] = useState(null);
    const [category, setCategory] = useState(null);
    const [name, setName] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [remark, setRemark] = useState('');
    const [startDate, setStartDate] = useState(null); // use in add or edit 
    const [endDate, setEndDate] = useState(null); // use in add or edit 
    const [initList, setInitList] = useState([]);
    const [isCalendarDisabled, setCalendarDisabled] = useState(false);
    const [titleColor, setTitleColor] = useState('#6374c8');
    const [treatmentId, setTreatmentId] = useState(null);
    const [forceErrorDisplay, setForceErrorDisplay] = useState(false);
    const [isValidValue, setIsValidValue] = useState(false);
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [selectedDate, setSelectDate] = useState([]);
    const [selectedWeekDay, setSelectedWeekDay] = useState([]);

    const handleApiDataItem = (i, index, cb) => {
        const itemStartDate = moment(i.start_date, "YYYY-MM-DD").toDate();
        const itemEndDate = moment(i.end_date, "YYYY-MM-DD").toDate();
        const color = colorList[randomColor()];
        i.custom_api_index = index;
        calcItemDays(color, i, itemStartDate, itemStartDate, itemEndDate, [], (res = []) => {
            cb(res)
        });
    }

    const calcItemDays = (color, item, current, startDate, endDate, cloneArray = [], cb) => {
        const isBetween = moment(current).isBetween(startDate, endDate, null, '[]');
        const selectedDay = item.recurrent_details ?  item.recurrent_details.split(';').map(i => _.capitalize(i)) : [];
        const formatDay = moment(current).format('ddd');
        const {category, recurrent, remarks, room_id, group_name, start_time, end_time, custom_api_index, personCount = '-'} = item;
        const format_start_time = moment(`2022-01-01 ${start_time}`).toDate();
        const format_end_time = moment(`2022-01-01 ${end_time}`).toDate();
        const week = [
            {day: 'Monday', checked: false, shortDay: 'Mon'},
            {day: 'Friday', checked: false, shortDay: 'Fri'},
            {day: 'Tuesday', checked: false, shortDay: 'Tue'},
            {day: 'Saturday', checked: false, shortDay: 'Sat'},
            {day: 'Wednesday', checked: false, shortDay: 'Wed'},
            {day: 'Sunday', checked: false, shortDay: 'Sun'},
            {day: 'Thursday', checked: false, shortDay: 'Thu'},
        ];
        week.forEach(i => {
            if (selectedDay.find(v => i.shortDay === v)) {
                i.checked = true;
            }
        })
        week.forEach(i => delete i.shortDay);
        const handleGroup = {
                category: category,
                color: color,
                start: current,
                end: current,
                isRecurrent: recurrent === 'Y',
                rangeStartDate: startDate,
                rangeEndDate: endDate,
                remark: remarks,
                room: room_id,
                roomNumber: room_id,
                personCount,
                // selectedDate: [],
                time: [format_start_time, format_end_time],
                title: group_name,
                treatment_id: custom_api_index,
                week: week,
            }
        if (isBetween) {
            if (item.recurrent === 'Y') {
                if (selectedDay.includes(formatDay)) cloneArray.push(handleGroup);
            } else {
                cloneArray.push(handleGroup)
            }
            current = moment(current).add(1, 'days').toDate();
            calcItemDays(color, item, current, startDate, endDate, cloneArray, cb);
        } else {
            const getSelectDate = cloneArray.map(i => {
                return {
                    date: moment(i.start).format('DD-MMM-YYYY'),
                    day: moment(i.start).format('dddd')
                }
            })
            cloneArray.forEach(i => i.selectedDate = getSelectDate);
            cb(cloneArray)
        }
    }

    const randomColor = () => {
        const res = Math.floor(Math.random()*(colorList.length - 1));
        return res
    }

    const { 
        calendar_list: g_calendar_list,
     } = useSelector((state) => state.calendar);
    
    const disPatchCalendarList = (year = moment().year()) => {
        const currentYear = year;
        dispatch({type: ActionTypes.FETCH_CALENDAR_LIST,payload: {
            params: {
                start_date: `${currentYear}/01/01`,
                end_date: `${currentYear}/12/31`,
            },
            callback: (apiData) => {
                const filterData = [];
                apiData.forEach(i => {
                    if (!filterData.find(v => v.category === i.category && v.group_name === i.group_name)) {
                        filterData.push(i)
                    }
                })
                const eventList = filterData.map((i, d) => {
                    return new Promise((rs, rj) => {
                        handleApiDataItem(i, d, (data) => {
                            rs(data);
                        })
                    })
                })
                Promise.all(eventList).then(res => {
                    const result = _.flatten(res);
                    setEvents(result)
                })
            }
        }})
    }
      
    useEffect(() => {
        disPatchCalendarList();
    }, [])

    const onOpen = (item) => {
        setOpen(true);
        setCalendarDetail(item)
    }
    const onClose = () => {
        setOpen(false);
        setCalendarDetail(null)
    }

    // function onSelectDate(e) {
    //     const { value } = e;
    //     setSelectDate(value)
    // }
    const onEdit = () => {
        setIsEdit(true);
        setOpen(false)
        setCalendarDisabled(true);
        setIsReadOnly(true);
    }

    const calculateSelectDate = async (s, e, selectDays=selectedWeekDay, rec = isRecurrent) => {
        const tempArr = [];
        
        const fn = async (current) => {
            if (moment(current).isBetween(s, e, null, '[]')) {
                if (rec) {
                    const formatDay = moment(current).format('ddd');
                    if (selectDays.includes(formatDay)) {
                        tempArr.push({
                            date: moment(current).format('DD-MMM-yyyy'),
                            day: moment(current).format('dddd')
                        })
                    }
                } else {
                    tempArr.push({
                        date: moment(current).format('DD-MMM-yyyy'),
                        day: moment(current).format('dddd')
                    })
                }
                current = moment(current).add(1, 'days').toDate();
                fn(current)
            }
        }
        await fn(s);
        
        return tempArr
    }
    

    const handleDateRange = async (range) => {
        setDateRange(range);
        if (range.length > 1) {
            const s = range[0];
            const e = range[1];
            if (s === 'Invalid date' || e === 'Invalid date') return;
            const tempArr = await calculateSelectDate(s, e)
            setSelectDate(tempArr)
        }
    }

    const onCancel = () => {
        dispatch({
            type: ActionTypes.MESSAGE_OPEN_MSG,
            payload: {
                open: true,
                messageInfo: {
                    message: 'Are you sure to cancel?',
                    messageType: 'success',
                    btn1Label: 'Cancel',
                    btn2Label: 'Yes',
                    btn2Action: () => {
                        setIsEdit(false);
                        setCalendarDetail(null);
                        handleDateRange([]);
                        setCalendarDisabled(false);
                        handleReset();
                    }
                },
            }
        });
    
    }

    const getSelectedDate = (e) => {
        if (e) {
            //right side panel
            const { start, slots } = e;
            const date = slots && slots.length ? slots[slots.length-1] : start
            setScheduleDate(date);
            const formatScheduleDate = moment(date).format('DD-MMM-YYYY');
            //base on events to create data
            const res = events.filter(i => {
                const date = moment(i.start).format('DD-MMM-YYYY');
                return moment(date).isSame(formatScheduleDate)
            });
            const result = res.map(i => {
                const startTime = moment(i.time[0]).format('HH:mm');
                const endTime = moment(i.time[1]).format('HH:mm');
                const startDate = moment(i.rangeStartDate).format('DD-MMM-YYYY')
                const endDate = moment(i.rangeEndDate).format('DD-MMM-YYYY')
                return {
                    color: i.color,
                    title: i.title,
                    category: i.category,
                    date: `${startDate} to ${endDate}`,
                    time: `${startTime} - ${endTime}`,
                    current: '-',
                    personCount: i.personCount,
                    roomNumber: i.roomNumber,
                    room: i.room,
                    remark: i.remark,
                    treatment_id: i.treatment_id,
                    selectedDate: i.selectedDate,
                    week: i.week,
                    isRecurrent: i.isRecurrent,
                }
            })
            // setScheduleDate(slots[0]);
            setInitList(result);
            setIsEdit(false);
        }
    }

    const changeSchemaToSaveData = (data, callback) => {
        const res = data.map(item => {
            const itemObject = item.length > 0 ? item[0] : null;
            const dateList = item.map(i => moment(i.start));
            if (itemObject) {
                const recurrent_details = itemObject.week.filter(i => i.checked).map(i => {
                    const day = i.day;
                    return _.upperCase(day.slice(0, 3))
                }).join(';');
                const formatSelectDates = itemObject.selectedDate.map(v => {
                    return  moment(v.date, 'DD/MMM/YYYY').format('DD/MM/YYYY')
                }).join(';')
                return 	{
                    // hosp_code:'',
                    // login_id:'',
                    // dept:'',
                    category: itemObject.category,
                    group_name: itemObject.title,
                    group_date: formatSelectDates,
                    start_date: moment.min(dateList).format('DD/MM/YYYY'),
                    end_date: moment.max(dateList).format('DD/MM/YYYY'),
                    start_time: moment(itemObject.time[0]).format('HH:mm'),
                    end_time: moment(itemObject.time[1]).format('HH:mm'),
                    remarks: itemObject.remark,
                    room_id: itemObject.room,
                    recurrent: itemObject.isRecurrent ? 'Y' : 'N',
                    recurrent_details,
                }
            }
        })
        callback(res);
    }

    const calculateDateEvent = () => {
        const formatEvent = _.fill(Array(g_calendar_list.length), []);
        if (startDate && endDate) {
            const originalData = formatEvent.map((v, vdx) => {
                return events.filter(i => i.treatment_id === vdx);
            })
            changeSchemaToSaveData(originalData, (data) => {
                const recurrent_details = week.filter(i => i.checked).map(i => {
                    const day = i.day;
                    return _.upperCase(day.slice(0, 3))
                }).join(';');
                const formatSelectDates = selectedDate.map(v => {
                    return  moment(v.date, 'DD/MMM/YYYY').format('DD/MM/YYYY')
                }).join(';')
                const addData = {
                    hosp_code:'TPH',
                    login_id:'@CMSIT',
                    dept:'OT',
                    category,
                    group_name: name,
                    group_date: formatSelectDates,
                    start_date: moment(startDate).format('DD/MM/YYYY'),
                    end_date: moment(endDate).format('DD/MM/YYYY'),
                    start_time: moment(startTime).format('HH:mm'),
                    end_time: moment(endTime).format('HH:mm'),
                    remarks: remark,
                    room_id: room,
                    recurrent: isRecurrent ? 'Y' : 'N',
                    recurrent_details,
                }
//                console.log(data);
                const params = { therapeutic_group_dept: addData };
                 setCalendarList(params).then(res=> {
                    if (res?.data?.response?.status === 'SUCCESS') {
                        dispatch({
                            type: ActionTypes.MESSAGE_OPEN_MSG,
                            payload: {
                                open: true,
                                messageInfo: {
                                    message: 'Therapeutic group is scheduled successfully',
                                    messageType: 'success',
                                    btn2Label: 'OK',
                                    btn2Action: () => {
                                        getSelectedDate({start: scheduleDate});
                                        setIsEdit(false);
                                        setCalendarDetail(null);
                                        handleDateRange([]);
                                        handleReset();
                                    }
                                },
                            }
                        });
                    }
                 })
            })
        }
    }
    const checkValidation = () => {
        let isPass = true;
        if (!startDate || !endDate || !startTime || !endTime) {
            isPass = false;
        }
        // data.forEach((item) => {
        //     if (!item.recipient) {
        //         isPass = false;
        //     } else {
        //         if (!item.comment) {
        //             isPass = false;
        //         }
        //     }
        // });

        return isPass;
    };

    const handleScheduleGroup = () => {
        const isValid = checkValidation();
        if (!isValid) {
            setForceErrorDisplay(true);
            return;
        }
        if (!isValidValue) return;
        calculateDateEvent();
    }

    const handleReset = (isClearAll = false) => {
        setCalendarDisabled(false);
        if (calendarDetail && isClearAll) {
            const selectDays = calendarDetail.week.filter(i => i.checked).map(i => i.day.slice(0, 3));
            setSelectedWeekDay(selectDays);

            setRoom(calendarDetail.room)
            setCategory(calendarDetail.category)
            setName(calendarDetail.title)
            setRemark(calendarDetail.remark)
            setStartDate(calendarDetail.rangeStartDate)
            setEndDate(calendarDetail.rangeEndDate)
            setStartTime(calendarDetail.time[0])
            setEndTime(calendarDetail.time[1])
            setIsRecurrent(calendarDetail.isRecurrent);
            setTreatmentId(calendarDetail.treatment_id);
            setWeek(calendarDetail.week)
            setSelectDate(calendarDetail.selectedDate)
            // setDateRange([calendarDetail.rangeStartDate, calendarDetail.rangeEndDate])
            setDateRange([moment(calendarDetail.rangeStartDate).format('YYYY-MM-DD'),moment(calendarDetail.rangeEndDate).format('YYYY-MM-DD')])
        } else {
            
            setRoom(null)
            setCategory(null)
            setName(null)
            setRemark('')
            setStartDate(null)
            setEndDate(null)
            setStartTime(null)
            setEndTime(null)
            setIsRecurrent(false);
            setTreatmentId(null);
            const copyWeek = JSON.parse(JSON.stringify(week)) ;
            copyWeek.forEach(i => i.checked = false);
            setWeek(copyWeek)
            setSelectDate([])
            setIsCreate(false);
            setDateRange([])
            setSelectedWeekDay([])
        }
    }

    const handleSetSelectDate = async (s, e, selectDays, i) => {
        selectDays = selectDays || selectedWeekDay
        if (s && e) {
            const tempArr = await calculateSelectDate(s, e, selectDays, i)

            setSelectDate(tempArr)
        }
    }

    const onChangeWeek = async (checked, index) => {
        const copyWeek =JSON.parse(JSON.stringify(week));
        copyWeek[index].checked = checked;
        const selectDays = copyWeek.filter(i => i.checked).map(i => i.day.slice(0, 3));
        setSelectedWeekDay(selectDays);
        setWeek(copyWeek)
        // const tempArr = await calculateSelectDate(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), selectDays)
        // setSelectDate(tempArr)
        handleSetSelectDate(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), selectDays)
    }

    const openPanelInPopUp = (treatment_id) => {
        const currentTreatment = events.find(i => i.treatment_id === treatment_id);
        onEdit();
        setTreatmentId(treatment_id);
        setDateRange([moment(currentTreatment.rangeStartDate).format('YYYY-MM-DD'),moment(currentTreatment.rangeEndDate).format('YYYY-MM-DD')])
        showEventItem(currentTreatment, true)
    }

    const showEventItem = (e, customIsReadOnly = false) => {
        const { room, remark, category, title, rangeStartDate, rangeEndDate, time, color, treatment_id, selectedDate, isRecurrent, week } = e;
        // sourceDataItemRef.current = e;
        setCalendarDetail(e);
        setIsReadOnly(customIsReadOnly);
        setIsEdit(true);
        setRoom(room)
        setCategory(category)
        setName(title)
        setRemark(remark)
        setStartDate(rangeStartDate)
        setEndDate(rangeEndDate)
        setStartTime(time[0])
        setEndTime(time[1])
        setTitleColor(color)
        setTreatmentId(treatment_id);
        setSelectDate(selectedDate);
        setIsRecurrent(isRecurrent);
        setWeek(week);
        setSelectedWeekDay(week.filter(i => i.checked).map(i => i.day.slice(0, 3)));
        
    }

    const handleAddIcon = () => {
        onEdit()
        setCalendarDisabled(true)
        setTreatmentId(null)
        setIsCreate(true);
    }

    const onMonthChange = (month) => {
        setEvents([]);
        const year = moment(month).year();
        disPatchCalendarList(year);
        // const currentMonth = moment(month).format('YYYY-MM-DD');
        // const copyEvents = events;
        // const filterEvents = copyEvents.filter(i => {
        //     const day = moment(i.start).format('YYYY-MM-DD');
        //     return moment(day).isSame(currentMonth, 'month');
        // })
        // setEvents(filterEvents);
    }

    return (<div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Grid container style={{ padding: '6px', height: '100%', backgroundColor: '#ecf0f7' }}>
            <Grid item xs={7} style={{ paddingBottom: 80 }}>
                <BigCalendar 
                    defaultSelectedDate={defaultSelectedDate}
                    dateRange={dateRange}
                    onSelectDate={(e) => getSelectedDate(e)}
                    onSelectEvent={(e) => {showEventItem(e)}}
                    onMonthChange={(e) => {onMonthChange(e)}}
                    disabled={isCalendarDisabled}
                    events={events}
                    selectedWeekDay={selectedWeekDay}
                    isRecurrent={isRecurrent}
                    />
            </Grid>
            <Grid item xs={5} style={{ paddingBottom: isEdit ? 74 : 0, position: 'relative' }}>
                {
                    !isEdit ? 
                    <IconButton className={classes.addIconButton} onClick={() => {handleAddIcon()}}>
                        <img src={AddIcon} className={classes.addIcon}/>
                    </IconButton> : null
                }
                {isEdit ? <ScheduleTherapeuticGroup
                    title={isCreate ? 'Schedule Therapeutic Group' :name}
                    setIsReadOnly={setIsReadOnly}
                    isEdit={isReadOnly}
                    setDateRange={handleDateRange}
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    room={room}
                    category={category}
                    name={name}
                    remark={remark}
                    setRoom={setRoom}
                    setCategory={setCategory}
                    setName={setName}
                    setRemark={setRemark}
                    week={week}
                    setCalendarDisabled={setCalendarDisabled}
                    titleColor={titleColor}
                    treatmentId={treatmentId}
                    setIsValidValue={setIsValidValue}
                    forceErrorDisplay={forceErrorDisplay}
                    onChangeWeek={onChangeWeek}
                    isRecurrent={isRecurrent}
                    setIsRecurrent={setIsRecurrent}
                    setTreatmentId={setTreatmentId}
                    handleSetSelectDate={handleSetSelectDate}
                    selectedDate={selectedDate}
                        />: <ScheduleGroup 
                        setCalendarDisabled={setCalendarDisabled}
                        scheduleDate={scheduleDate} 
                        onOpen={onOpen} 
                        onEdit={onEdit} 
                        handleAddIcon={handleAddIcon}
                        initList={initList} />}
                
            </Grid>
        </Grid>
        {isEdit && isReadOnly && <Grid container alignItems='center' justifyContent='flex-end' className={classes.footer}>
            <ColorButton onClick={onCancel} style={{ height: 40 }} variant="contained">Cancel</ColorButton>
            <ColorButton 
                style={{ marginLeft: 5, height: 40 }} 
                variant="outlined" 
                color="primary"
                onClick={() => {handleReset(true)}}
                >Reset</ColorButton>
            <ColorButton 
                onClick={handleScheduleGroup}
                style={{ marginRight: 49, marginLeft: 5, height: 40 }} 
                variant="contained" 
                color="primary"
            >{treatmentId ? 'Save' : 'Create'}</ColorButton>
        </Grid>}
        {open && <CalendarDetailsPopup openPanelInPopUp={openPanelInPopUp} item={calendarDetail} open={open} onClose={onClose} />}
    </div>)
}

export default Index;