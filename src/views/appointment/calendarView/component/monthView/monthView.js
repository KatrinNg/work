import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import {
    Grid
} from '@material-ui/core';
import { connect } from 'react-redux';
import moment from 'moment';
import Enum from '../../../../../enums/enum';
import QuotaButton from '../quotaButton';
import UnavaButton from '../unavaButton';
import _ from 'lodash';
import { DateUtil } from '../../../../../utilities';

const styles = () => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex'
    },
    button: {
        textTransform: 'none',
        width: '100%',
        height: '100%',
        padding: 0
    },
    table: {
        flex: 1,
        height: '100%',
        maxHeight: 800,
        marginRight: 10,
        display: 'flex',
        flexFlow: 'column',
        '&:last-child': {
            marginRight: 0
        },
        '& .tableHead': {
            '& .row': {
                display: 'flex',
                border: '1px solid #ccc',
                '&:not(.titleRow)': {
                    background: '#7bc1d9'
                },
                '&.titleRow': {
                    border: 'none',
                    '& .tableCell': {
                        borderColor: 'rgba(255,255,255,0)',
                        height: 30,
                        '&.titleCell': {
                            border: '1px solid #ccc',
                            borderBottom: 'none',
                            lineHeight: '30px',
                            background: '#fcf7b6',
                            'text-overflow': 'ellipsis',
                            'white-space': 'nowrap',
                            overflow: 'hidden'
                        }
                    }
                },
                '& .tableCell': {
                    textAlign: 'center',
                    height: 32,
                    lineHeight: '32px',
                    fontWeight: 'bold',
                    color: 'white'
                },
                '& .tableCell:nth-of-type(1)': {
                    color: 'red'
                }
            }
        },
        '& .tableBody': {
            flex: 1,
            display: 'flex',
            flexFlow: 'column',
            maxHeight: '100%',
            border: '1px solid #ccc',
            borderTop: 'none',
            // overflowY: 'auto',
            marginBottom: 7,
            '& .row': {
                display: 'flex',
                flex: 1,
                borderBottom: '1px solid #ccc',
                '&:last-child': {
                    marginRight: 0
                },
                '& .tableCell': {
                    minHeight: 100,
                    paddingLeft: '0.2%',
                    paddingRight: '0.2%',
                    position: 'relative',
                    display: 'flex',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '& .tableCellContainer': {
                        width: '100%',
                        '& .tableCellTitle':{
                            position: 'absolute',
                            fontWeight: 'bold',
                            top: '1%',
                            left: '1%',
                            borderRadius: '50%',
                            fontSize: '1.3rem',
                            width: '1.5rem',
                            textAlign: 'center',
                            padding: '3px',
                            height: '1.5rem',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease-in-out'
                        },
                        '& .tableCellTitle:Hover':{
                            background: '#bedcf1'
                        },
                        '& .tableCellTitleToday':{
                            background: '#7bc1d9'
                        },
                        '& .tableCellTitleToday:Hover':{
                            background: '#0579c8'
                        },
                        '& .tableCellContent':{
                            width: '100%',
                            position: 'relative',
                            top: '1rem'
                        }
                    }
                }
            }
        },
        '& .tableCell': {
            flex: 1,
            borderRight: '1px solid #ccc',
            minWidth: 109,

            '&:last-child': {
                borderRight: 'none'
            }
        }
    },
    underline: {
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        border: '0.5px solid #ccc'
    },
    isHoliday: {
        color: 'red'
    }
});

class MonthCell extends Component {
    constructor(props){
        super(props);
    }

    render(){
        const { classes, id, calendarViewValue, quotaConfig, sessionsConfig, getSelectedSessIds, bookQuota, calendarViewValueOnChange } = this.props;
        let day = this.props.day;
        let slots = this.props.day.slots;
        let quotasSum = {
            quotas:{
                qt1: 0,
                qt2: 0,
                qt3: 0,
                qt4: 0,
                qt5: 0,
                qt6: 0,
                qt7: 0,
                qt8: 0
            },
            quotasBooked:{
                qt1Booked: 0,
                qt2Booked: 0,
                qt3Booked: 0,
                qt4Booked: 0,
                qt5Booked: 0,
                qt6Booked: 0,
                qt7Booked: 0,
                qt8Booked: 0
            }
        };
        slots.map((sess) =>{
            for ( let qtKey in sess.quotas ){
                quotasSum.quotas[qtKey] += (sess.quotas[qtKey] || 0);
            }
            for ( let qtBookedKey in sess.quotasBooked ){
                quotasSum.quotasBooked[qtBookedKey] += (sess.quotasBooked[qtBookedKey] || 0);
            }
        });
        let quotaName = quotaConfig && quotaConfig[0];
        let isToday = moment().isSame(day.date, 'day');
        return(
            day.date.month() !== this.props.month ? null:
                <Grid className={'tableCellContainer'}>
                    <Grid className={`tableCellTitle ${isToday ? 'tableCellTitleToday':''}`}
                        onClick={()=>{calendarViewValueOnChange('D', day.date);}}
                    >
                        <span className={day.isHoliday? classes.isHoliday:''}>{day.date.format('D')}</span>
                    </Grid>
                    <Grid className={'tableCellContent'}>
                        {
                            !day.isWhlDay?
                            <QuotaButton
                                quotasData={quotasSum}
                                quotaName={quotaName}
                                bookQuota={bookQuota}
                                bookingData={{
                                    calendar:'month',
                                    datetime: day.date
                                }}
                            />:
                            <UnavaButton
                                items={day.slots}
                                configData={{
                                    calendar:'month',
                                    datetime: day.date
                                }}
                                remarks={['rsnDesc']}
                            />
                        }
                        {
                            //day.slots.map((slot, slotIdx)=>
                             //<Grid key={slotIdx}>
                                //<span>{slot.sessId}</span>
                                //<span>qt1: {slot.qt1}</span>
                                //<span>qt2: {slot.qt2}</span>
                                //<span>qt3: {slot.qt3}</span>
                                //<span>qt4: {slot.qt4}</span>
                            //</Grid>
                        //)
                        }
                    </Grid>
                </Grid>
        );
    }
}
class MonthView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openPopper: false,
            anchorEl: null,
            openDialog: false,
            rowData: null,
            tables: [this.getMonthTable()]
        };
    }

    componentDidMount() {
        if(this.props.calendarMonthData){
            this.setState({ tables: this.processData(this.props.calendarMonthData)});
        } else {
            this.setState({ tables: [this.getMonthTable()]});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.dateFrom !== this.props.dateFrom) {
        // fix date comparator logic
        if (!DateUtil.isSameDate(prevProps.dateFrom, this.props.dateFrom)) {
            if(this.props.calendarMonthData){
                this.setState({ tables: this.processData(this.props.calendarMonthData)});
            } else {
                this.setState({ tables: [this.getMonthTable()]});
            }
        }
        if (JSON.stringify(prevProps.calendarMonthData) !== JSON.stringify(this.props.calendarMonthData)) {
            if(this.props.calendarMonthData){
                this.setState({ tables: this.processData(this.props.calendarMonthData)});
            } else {
                this.setState({ tables: [this.getMonthTable()]});
            }
        }
        if (prevProps.sessionsConfig!== this.props.sessionsConfig) {
            if(this.props.calendarMonthData){
                this.setState({ tables: this.processData(this.props.calendarMonthData)});
            }
        }
    }

    getMonthTable = (schedules) => {
        let dateFrom = this.props.dateFrom;
        let dateTo = this.props.dateTo;
        let month = moment(this.props.dateFrom).month();
        let firstDay = moment(this.props.dateFrom).startOf('month');
        let lastDay = moment(this.props.dateFrom).endOf('month');
        let startDay = moment(this.props.dateFrom).startOf('month').startOf('week').startOf('day');
        let endDay = moment(this.props.dateFrom).endOf('month').endOf('week').startOf('day');
        let dayDiff = endDay.diff(startDay,'days');

        let table = {
            title:'Room',
            startDay: startDay,
            month: month,
            columns:['Sun','Mon','Tue','Wed','Thr','Fri','Sat']
        };
        table.rows = [];
        let row = [];
        // building the empty tables
        for (let i = 0; i <= dayDiff; i++){
            let day = {};
            day.date = moment(startDay).add(i, 'days');
            day.slots = [];
            row.push(day);
            if (i > 0 && (i + 1) % 7 === 0) {
                table.rows.push(row);
                row = [];
            }
        }
        return table;
    }

    processData = (data = [{}]) =>{
        let tables = [];
        if(data.length === 1 && Object.keys(data[0]).length === 0){
            return this.getMonthTable();
        }
        if( data.length > 0 ){
            data.forEach(item => {
                let table = this.getMonthTable();
                let rmObj = this.props.rooms.find((obj)=>{
                    return obj.rmId === item.rmId;
                });
                table.title = rmObj && rmObj.rmDesc;
                let row = {};
                let cell = {
                    encounterType: this.props.encounterTypeValue,
                    rmId: rmObj && rmObj.rmId,
                    time: ''
                };

                let startDay = moment(this.props.dateFrom).startOf('month').startOf('week');
                let endDay = moment(this.props.dateFrom).endOf('month').endOf('week');
                let firstDay = moment(this.props.dateFrom).startOf('month');
                let dayStartShift = firstDay.diff(startDay,'days');
                let dayDiff = endDay.diff(startDay,'days');
                let flatDays = [];
                for (let i = 0; i <= dayDiff; i++){
                    let day = {};
                    day.slots = [];
                    if (i - dayStartShift >= 0 && item.byDate[i - dayStartShift] ) {
                        Object.assign(day, item.byDate[i - dayStartShift]);
                    }
                    day.date = moment(startDay).add(i, 'days');
                    flatDays.push(day);
                }
                let convertedRows = [];
                let flatrow = [];
                flatDays.forEach((dateDto, i) =>{
                    Object.assign(dateDto, {
                        ...cell,
                        holiday: dateDto.holiday,
                        noSlot: dateDto.tolalRemain === undefined,
                        holidayDesc: dateDto.holidayDesc,
                        normalRemain: dateDto.normalRemain || 0,
                        urgentRemain: dateDto.urgentRemain || 0,
                        tolalRemain: dateDto.tolalRemain || 0,
                        remark: dateDto.appointmentRemarkDtos
                    });
                    let selectedSessIds = this.props.getSelectedSessIds();
                    let selectedSess = dateDto.slots.filter((sess) => {
                        return (selectedSessIds.indexOf(sess.sessId) >= 0 || !sess.sessId );
                    });
                    dateDto['slots'] = _.cloneDeep(selectedSess);
                    // format quotas

                    let isWhlDay = false;
                    let isHoliday = false;
                    if(dateDto.slots && dateDto.slots.length > 0){
                        dateDto.slots.forEach((slot) => {
                            if(slot.isWhlDay === true){
                                isWhlDay = true;
                            }
                            if(slot.rsnName=== 'PUH'){
                                isHoliday = true;
                            }
                            slot['quotas'] = {
                                qt1:slot.qt1,
                                qt2:slot.qt2,
                                qt3:slot.qt3,
                                qt4:slot.qt4,
                                qt5:slot.qt5,
                                qt6:slot.qt6,
                                qt7:slot.qt7,
                                qt8:slot.qt8
                            };
                            slot['quotasBooked'] = {
                                qt1Booked: slot.qt1Booked,
                                qt2Booked: slot.qt2Booked,
                                qt3Booked: slot.qt3Booked,
                                qt4Booked: slot.qt4Booked,
                                qt5Booked: slot.qt5Booked,
                                qt6Booked: slot.qt6Booked,
                                qt7Booked: slot.qt7Booked,
                                qt8Booked: slot.qt8Booked
                            };
                        });
                    }
                    dateDto['isWhlDay'] = isWhlDay;
                    dateDto['isHoliday'] = isHoliday;
                    flatrow.push(dateDto);
                    if (i > 0 && (i + 1) % 7 === 0) {
                        convertedRows.push(flatrow);
                        flatrow = [];
                    }
                });
                table['rows'] = _.cloneDeep(convertedRows);
                tables.push(table);
            });
        }
        return tables;
    }

    dataProcessing = (data = [{}]) => {
        let testWeek = '0111111';
        let tables = [];
        data.forEach(item => {
            let table = {};
            table.title =
                this.props.subEncounterTypeListKeyAndValue[item.subEncounterType] &&
                this.props.subEncounterTypeListKeyAndValue[item.subEncounterType].shortName;
            table.columns = [];
            for (let i = testWeek.indexOf('1'); i > -1; i = testWeek.indexOf('1', i + 1)) {
                table.columns.push(moment().isoWeekday(i === 0 ? 7 : i).format('dddd'));
            }
            table.rows = [];
            let row = {};
            let cell = {
                encounterType: this.props.encounterTypeValue,
                subEncounterType: item.subEncounterType,
                time: ''
            };
            item.slotByDateDtos.forEach((dateDto, i) => {
                if (i > 0 && i % 7 === 0) {
                    table.rows.push(row);

                } else {
                    // row[moment(dateDto.date, 'YYYY-MM-DD').format('dddd')] = {
                        row[moment(dateDto.date, Enum.DATE_FORMAT_EYMD_VALUE).format('dddd')] = {
                        ...cell,
                        date: dateDto.date,
                        holiday: dateDto.holiday,
                        noSlot: dateDto.tolalRemain === undefined,
                        holidayDesc: dateDto.holidayDesc,
                        normalRemain: dateDto.normalRemain || 0,
                        urgentRemain: dateDto.urgentRemain || 0,
                        tolalRemain: dateDto.tolalRemain || 0,
                        remark: dateDto.appointmentRemarkDtos
                    };
                }
            });
            tables.push(table);
        });
        return tables;
    }
    render() {
        const { classes, id, calendarViewValue, calendarData, calendarMonthData, quotaConfig, sessionsConfig, getSelectedSessIds, bookQuota, calendarViewValueOnChange } = this.props;
        //let tables = this.dataProcessing(calendarData);
        let tables = this.state.tables;

        return (
            <Grid id={id} className={classes.root}>
                {tables.map((table, i) => (
                    <Grid key={i} className={classes.table}>
                        <Grid className={'tableHead'}>
                            {
                                //<Grid className={'row titleRow'}>
                                    //<Grid className={'titleCell tableCell'} title={table.title}>{table.title}</Grid>
                                    //{table.columns.map((v, i2) =>
                                        //i2 < table.columns.length - 1 ? <Grid key={i2} className={'tableCell'}></Grid> : null
                                    //)}
                                //</Grid>
                            }
                            <Grid className={'row'}>
                                {table.columns.map((monthHeader, monthHeaderIdx) =>
                                    <Grid key={monthHeaderIdx} className={'tableCell'}>{monthHeader}</Grid>
                                )}
                            </Grid>
                        </Grid>
                        <Grid className={'tableBody'}>
                            {table.rows.map((week, weekIdx) => (
                                <Grid key={weekIdx} className={'row'}>
                                    {week.map((day, dayIdx) => <Grid key={dayIdx} className={'tableCell'}>
                                        <MonthCell
                                            day={day}
                                            month={table.month}
                                            classes={classes}
                                            quotaConfig={quotaConfig}
                                            bookQuota={bookQuota}
                                            sessionsConfig={sessionsConfig}
                                            getSelectedSessIds={getSelectedSessIds}
                                            calendarViewValueOnChange={calendarViewValueOnChange}
                                        />
                                        </Grid>
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        calendarViewValue: state.calendarView.calendarViewValue,
        calendarData: state.calendarView.calendarData,
        calendarMonthData: state.calendarView.calendarMonthData,
        quotaConfig: state.common.quotaConfig,
        dateFrom: state.calendarView.dateFrom,
        dateTo: state.calendarView.dateTo,
        rooms: state.common.rooms,
        encounterTypeValue: state.calendarView.encounterTypeValue,
        subEncounterTypeListKeyAndValue: state.calendarView.subEncounterTypeListKeyAndValue
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MonthView));
