import React from "react";
import { Children, cloneElement } from "react";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from "moment";
import { useStyles } from "./style";
import './style.css'
import IconButton from '@material-ui/core/IconButton';
// import btnClose from 'Resource/Icon/demo-icon/button-close-btn.svg';
import calendarNext from 'resource/Icon/demo-icon/calendar-next.svg';
import calendarPrevious from 'resource/Icon/demo-icon/calendar-previous.svg';
import recurrent from 'resource/Icon/demo-icon/recurrent.svg';
import PropTypes from 'prop-types';
import { useState } from "react";
import { Grid } from "@material-ui/core";
export default function BigCalendar(props) {
    const {
        height = '100%', 
        width = '100%',
        showToolBar = true,
        onMonthChange = () => {},
        defaultSelectedDate = new Date(),
        onSelectDate = () => {},
        dateRange = [],
        selectedWeekDay = [],
        disabled = false,
        events = [],
        onSelectEvent = () => {},
        isRecurrent,
    } = props;
    // console.log(events);
    // events item required keys [ start, end, title, allDay: false ]
    // e.g
    // {
    //     start: '12/13/2021 08:00',
    //     end: '12/13/2021 09:00',
    //     title: 'Calendar title1',
    //     allDay: false,
    // },

    const [calcDate, setCalcDate] = useState(defaultSelectedDate);
    const [formatDate, setFormatDate ] = useState(moment(calcDate).format('MMMM YYYY'));
    const [recentlySelectedDate, setSelectedDate] = useState(defaultSelectedDate);
    const toolBarStyle = {
        customWidth: width
    }
    const classes = useStyles(toolBarStyle);
    const localizer = momentLocalizer(moment);

    function onEventClick(e) { 
        if (disabled) return;
        // console.log(e, 'onSelectEvent')
        onSelectEvent && onSelectEvent(e)
    }
    function renderEvent({event}) {
        const { title, isRecurrent, color: background = '#4f5369', start } = event;
        const isCurrentMonth = moment(start).isSame(calcDate, 'month');
        const result = isCurrentMonth ? 
        <Grid container className={classes.eventBox} style={{background}}>
            <Grid item style={{width: 17}}>
                {isRecurrent ? <img className={classes.eventIcon} src={recurrent} /> : null}
            </Grid>
            <Grid item style={{flex: 1}} className={classes.name}>
                {title}
            </Grid>
        </Grid> : null
        return (
            result
            // <div className={classes.eventBox}>
            //     {showIcon ? <img className={classes.eventIcon} src={recurrent} /> : null}
            //     <span className={`${classes.name} ${showIcon ? '' : classes.emptyIconStyle}`}>{title}</span>
            // </div>
        )
    }
    function renderDateHeader(e) {
        const { label, isOffRange } = e;
        const style = {
            textAlign: 'left',
            fontFamily: 'PingFangTC',
            fontSize: 14,
            fontWeight: 'normal',
            fontStretch: 'normal',
            fontStyle: 'normal',
            color: '#515151',
            padding: '5px 0 0 8px',
        }
        return (
            <div style={style}>{isOffRange ? '' : label}</div>
        )
    }
    function renderHeader(e) {
        const { label } = e;
        const style = {
            width: '100%',
            background: label === 'Sunday' ? '#c83e47' : '#3ab395',
            height: '35px',
            lineHeight: '35px',
            color: '#fff',
            borderRadius: '3px',
            fontFamily: 'PingFangTC',
            fontSize: '12px',
            fontWeight: 600,
            fontStretch: 'normal',
            fontStyle: 'normal',
            letterSpacing: 'normal',
            border: 'none',
        }
        return (
            <div style={style}>{label}</div>
        )
    }
    function dayItemClick(e) {
        // alert(JSON.stringify(e))
        const { slots } = e;
        if (slots && slots.length) {
            const value = slots[slots.length-1];
            if (disabled) return;
            setSelectedDate(value)
            onSelectDate && onSelectDate(e);
        }
    }
    function renderRateCellWrapper(e) {
        let backgroundColor = '#fff';
        const { children, value } = e;
        const { props } = children;
        const formatSelectedDate = moment(recentlySelectedDate).format('YYYY-MM-DD');
        const formatValue = moment(value).format('YYYY-MM-DD');
        const weekFormatValue = moment(value).format('ddd'); //e.g Sat Sun
        const isCurrentMonth = moment(formatValue).isSame(calcDate, 'month');
        const style = {
            marginRight: 5,
            marginBottom: 6,
            borderRadius: 5,
            border: `${ moment(formatSelectedDate).isSame(formatValue) && isCurrentMonth ? '2px solid #facb42' : '1px solid #e2e2e2'}`,
        }
    const isInclude_And_IsCurrentMonth = isRecurrent ? selectedWeekDay.includes(weekFormatValue) && isCurrentMonth : isCurrentMonth;
        if (dateRange.length > 1) {
            const afterDate = dateRange[0];
            const beforeDate = dateRange[1];
            const isAfterDate = moment(value).isSameOrAfter(afterDate);
            const isBeforeDate = moment(value).isSameOrBefore(beforeDate);
            backgroundColor = isAfterDate && isBeforeDate && isInclude_And_IsCurrentMonth ? '#ffe9a8' : '#fff';
        }
        style.background = backgroundColor;
        return <div className={props.className} style={style} >{children}</div>
    }

    const TouchCellWrapper = ({ children, value, onSelectSlot }) => (
        React.cloneElement(Children.only(children), {
            onTouchEnd: () => onSelectSlot({ action: 'click', slots: [value] }),
        })
    );
    function backToLastMonth() {
        const new_date = moment(calcDate).subtract(1, 'months').toDate();
        setCalcDate(new_date)
        setFormatDate(moment(new_date).format('MMMM YYYY'))
        onMonthChange && onMonthChange(new_date)
    }
    function goToNextMonth() {
        const new_date = moment(calcDate).add(1, 'months').toDate();
        setCalcDate(new_date)
        setFormatDate(moment(new_date).format('MMMM YYYY'))
        onMonthChange && onMonthChange(new_date)
    }
    return (
        <Grid container direction='column' style={{height: '100%'}}>  
            {
                showToolBar ?
                    <Grid container>
                        <div className={classes.toolbar}>
                            <IconButton onClick={backToLastMonth}>
                                <img className={classes.iconImg} src={calendarPrevious} />
                            </IconButton>
                            <span className={classes.toolbarName}>{formatDate}</span>
                            <IconButton onClick={goToNextMonth}>
                                <img className={classes.iconImg} src={calendarNext} />
                            </IconButton>
                        </div>
                    </Grid>
                     : null
            }
            <Grid container style={{flex: 1}}>

                <Calendar
                    {...props}
                    date={calcDate}
                    localizer={localizer}
                    events={events}
                    defaultDate={ new Date() }
                    views={[Views.MONTH]}
                    defaultView={Views.MONTH}
                    onSelectEvent={onEventClick}
                    style={{height: height, width: width, minHeight: 400}}
                    toolbar={false}
                    onNavigate={() => {}}
                    selectable={"ignoreEvents"}
                    onSelectSlot={(e) => dayItemClick(e)}
                    onSelecting={(e) => dayItemClick(e)}
                    longPressThreshold={0}
                    formats={{
                        weekdayFormat: (date, culture, localizer) => {
                            const DAY = moment(date).format('dddd');
                            return DAY
                        },
                        dateFormat: (date) => {
                            const DAY = moment(date).format('D');
                            return DAY
                        }
                    }}
                    components={{
                        month: {
                            event: (e) => renderEvent(e),
                            dateHeader: (e) => renderDateHeader(e),
                            header: (e) => renderHeader(e),
                        },
                        dateCellWrapper: (props) => (
                            <TouchCellWrapper {...props} onSelectSlot={dayItemClick} >
                                { renderRateCellWrapper(props)}
                            </TouchCellWrapper>
                        ),
                    }}
                    messages={{
                        showMore: () => 'More...'
                    }}
                />
            </Grid>
        </Grid>
    )
}

BigCalendar.propTypes = {
    showToolBar: PropTypes.bool,
    formatDate: PropTypes.string,
    onMonthChange: PropTypes.func,
    onSelectDate: PropTypes.func,
    dateRange: PropTypes.array,
    selectedWeekDay: PropTypes.arrayOf(PropTypes.string),
    height: PropTypes.string,
    width: PropTypes.string,
}