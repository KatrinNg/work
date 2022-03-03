import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import moment from 'moment';
import {
    Grid
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TimeGroup from './timeGroup';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import '../../../../../styles/ag-theme-balham/sass/ag-theme-balham.scss';
import './weekView.css';
import QuotaButton from '../quotaButton';
import UnavaButton from '../unavaButton';

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
        minWidth: 400,
        flex: 1,
        height: '100%',
        marginRight: 10,
        display: 'flex',
        flexFlow: 'column',
        '&:last-child': {
            marginRight: 0
        },
        '& .tableTitle': {
            display: 'flex',
            '& .leftCell': {
                border: '1px solid #ccc',
                borderBottom: 'none',
                height: 28,
                lineHeight: '28px',
                background: '#fcf7b6'
            }
        },
        '& .tableHead': {
            display: 'flex',
            border: '1px solid #ccc',
            borderBottom: 'none',
            background: 'rgb(208, 240, 251)',
            '& .rightCell': {
                textAlign: 'center',
                display: 'block'
            }
        },
        '& .tableBody': {
            maxHeight: '100%',
            border: '1px solid #ccc',
            overflowY: 'auto',
            marginBottom: 7
        },
        '& .row': {
            display: 'flex',
            borderBottom: '1px solid #ccc',
            height: 52,
            '&:last-child': {
                borderBottom: 'none'
            },
            '&.noSlot': {
                color: ' rgb(92, 96, 94)',
                '& .rightCell': {
                    textAlign: 'center',
                    lineHeight: '40px',
                    background: 'rgb(255, 255, 204)',
                    display: 'block',
                    '&.holiday': {
                        background: 'rgb(254, 210, 217)'
                    }
                }
            },
            '&.slot': {
                '& .rightCell': {
                    cursor: 'pointer',
                    '&.noSlot': {
                        cursor: 'auto'
                    }
                }
            },
            '& .leftCell': {
                position: 'relative',
                '& .slotTime': {
                    paddingTop: 10
                },
                '& .quota': {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    '& span': {
                        fontSize: 12,
                        marginRight: 4,
                        '&:last-child': {
                            marginRight: 0
                        }
                    }
                }
            }
        },
        '& .leftCell': {
            width: 120,
            minWidth: 120,
            borderRight: '1px solid #ccc',
            padding: '0 4px',
            textAlign: 'center'
        },
        '& .rightCell': {
            width: 'calc(100% - 135px )',
            display: 'flex',
            padding: 3,
            '& .slotRemarks': {
                flex: 1,
                width: 'calc(100% - 80px )',
                '& .remark': {
                    background: 'rgb(208, 240, 251)',
                    borderLeft: '6px solid #a6d1f5',
                    marginBottom: 4,
                    paddingLeft: 6,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                },
                '& .remark:last-child': {
                    marginBottom: 0
                }
            },
            '& .moreRemark': {
                width: 80,
                height: '100%',
                color: '#0579c8',
                alignSelf: 'flex-end'
            }
        }
    }
});

class StatusRenderer extends Component {
    constructor(props) {
        super(props);
        props.eParentOfValue.style.width = '100%';
    }
    render() {
        let quotaName = this.props.quotaConfig && this.props.quotaConfig[0];
        const { bookQuota } = this.props;
        let field = this.props.colDef.field;
        let data = this.props.data[field];
        let datetime = data.start;
        return (
            !data.isWhlDay ?
                <QuotaButton
                    field={field}
                    quotasData={data}
                    quotaName={quotaName}
                    bookQuota={bookQuota}
                    bookingData={{
                        ...data,
                        calendar: 'week',
                        datetime: datetime
                    }}
                /> :
                <UnavaButton
                    items={[data]}
                    configData={{
                        calendar: 'week',
                        datetime: data.date
                    }}
                    remarks={['rsnDesc']}
                />
        );
    }
}

class WeekView extends Component {
    constructor(props) {
        super(props);
        let columnDefs = [];
        let weekdayColDefs = [
            { headerName: 'Sun', field: 'day0', width: 225 },
            { headerName: 'Mon', field: 'day1', width: 225 },
            { headerName: 'Tue', field: 'day2', width: 225 },
            { headerName: 'Wed', field: 'day3', width: 225 },
            { headerName: 'Thu', field: 'day4', width: 225 },
            { headerName: 'Fri', field: 'day5', width: 225 },
            { headerName: 'Sat', field: 'day6', width: 225 }
        ];
        for (let i = 0; i < weekdayColDefs.length; i++) {
            weekdayColDefs[i].headerValueGetter = this.getDateHeader;
            weekdayColDefs[i].cellRenderer = 'statusRenderer';
            weekdayColDefs[i].cellRendererParams = {
                quotaConfig: props.quotaConfig,
                bookQuota: props.bookQuota
            };
            weekdayColDefs[i].cellStyle = this.dayCellStyle;
            weekdayColDefs[i].maxWidth = weekdayColDefs[i].width;
            weekdayColDefs[i].minWidth = weekdayColDefs[i].width;
            weekdayColDefs[i].suppressMenu = true;
            weekdayColDefs[i].suppressSorting = true;
            weekdayColDefs[i].suppressRowTransform = true;
            weekdayColDefs[i].suppressMovable = true;
        }
        columnDefs.push({
            headerName: 'Time',
            field: 'time',
            valueFormatter: (params) => {
                let time = params.value;
                if (time < 10) {
                    time = '0' + time;
                }
                return time;
            },
            cellStyle: {
                fontWeight: 'bold',
                textAlign: 'center',
                justifyContent: 'center'
            },
            minWidth: 85,
            maxWidth: 85,
            suppressMenu: true,
            suppressMovable: true,
            suppressSorting: true
        });
        columnDefs = columnDefs.concat(weekdayColDefs);
        this.state = {
            openPopper: false,
            anchorEl: null,
            openDialog: false,
            rowData: this.getTimeRowsTable(),
            tables: [],
            schedules: [],
            columnDefs: columnDefs,
            defaultColDef: {
                suppressMenu: true,
                cellStyle: {
                    textAlign: 'center'
                }
            }
        };
        this.refGrid = React.createRef();
    }

    componentDidMount() {
        if (this.props.calendarWeekData) {
            this.setState({ rowData: this.getTimeRowsTable(this.props.calendarWeekData) });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.dateFrom !== this.props.dateFrom) {
            if (this.refGrid.current) {
                this.refGrid.current.grid.api.refreshHeader();
            }
        }
        if (prevProps.calendarWeekData !== this.props.calendarWeekData) {
            if (this.refGrid.current) {
                this.setState({ rowData: this.getTimeRowsTable(this.props.calendarWeekData) });
                setTimeout(() => {
                    if (this.refGrid.current) {
                        this.updateRowHeight();
                    }
                }, 50);
            }
        }
        if (prevProps.sessionsConfig !== this.props.sessionsConfig) {
            if (this.props.calendarWeekData) {
                this.setState({ rowData: this.getTimeRowsTable(this.props.calendarWeekData) });
            }
        }
    }

    dayCellStyle = (params) => {
        let style = {
            textAlign: 'center'
        };
        let data = params.data;
        let field = params.colDef.field;
        let day = data[field];
        if (day.isWhlDay) {
            return {
                backgroundColor: 'white',
                borderBottom: '1px solid #dbdddc',
                borderTop: 'None',
                height: data.rowSpanHeight + 'px',
                ...style
            };
        } else {
            return {
                ...style,
                height: '100%',
                borderBottom: 'None'
            };
        }
    };

    getDateHeader = (param) => {
        let dayMargin = parseInt(param.colDef.field.split('day')[1]);
        return moment(this.props.dateFrom).add('days', dayMargin).format('DD MMM (ddd)');
    }

    getStartHour = (date) => {
        let m = date.getMonth() + 1;
        let s = date.getFullYear() + '-' + m + '-' + date.getDate() + ' ' + date.getHours() + ':00';
        return moment(s, 'YYYY-MM-DD HH:mm');
    }
    getEndHour = (date) => {
        let m = date.getMonth() + 1;
        let h = date.getHours() + 1;
        let s = date.getFullYear() + '-' + m + '-' + date.getDate() + ' ' + h + ':00';
        return moment(s, 'YYYY-MM-DD HH:mm');
    }

    updateRowHeight = () => {

        this.refGrid.current.grid.api.resetRowHeights();

    }

    getHourSession = (hour) => {
        return parseInt(hour.split(':')[0]);
    }

    getTimeRowsTable = (schedules) => {
        // Build the time group object list
        let groups = 24;
        let days = 7;
        let table = [];
        for (let i = 0; i < groups; i++) {
            let rowObj = { 'time': i };
            for (let j = 0; j < days; j++) {
                rowObj['day' + j] = {};
            }
            table.push(rowObj);
        }
        // get all schedules
        let allSchedules = [];
        let unavaDayList = [];
        if (schedules) {
            let r = this.processData(schedules);
            if (r) {
                allSchedules = r.first;
                unavaDayList = r.sec;
            }
        }
        let [s, e] = this.props.getSessStartEndTime();
        let hourStart = s && s.split(':')[0];
        e = e && parseInt(moment(e, 'HH:mm').subtract(1, 'minutes').format('H'));
        let hourEnd = e && (e + 1);
        // filling the time scale when no data
        let hourDiff = hourEnd - hourStart;
        for (let i = 0; i < 24; i++) {
            table[i]['time'] = i;
        }

        // filling the schedules to hour slots;
        allSchedules.forEach((data) => {
            let groupIdx = data.group;
            let dayIdx = data.dayIdx;
            table[groupIdx]['day' + dayIdx] = data;
        });

        table = table.slice(hourStart, hourEnd);
        //add the attributes of the max quotas for time slot
        let rowSpanHeight = 0;
        table.forEach((timeSess) => {
            let maxQuota = 0;
            for (let tsKey in timeSess) {
                let maxSessQuotas = 0;
                let quotas = timeSess[tsKey].quotas;
                for (let qtKey in quotas) {
                    if (quotas[qtKey] > 0) {
                        maxSessQuotas++;
                    }
                }
                maxQuota = maxSessQuotas > maxQuota ? maxSessQuotas : maxQuota;
            }
            if (maxQuota > 4) {
                let extraLines = Math.ceil((maxQuota - 4) / 2);
                rowSpanHeight += 75 + extraLines * 30;
            } else {
                rowSpanHeight += 75;
            }
            timeSess['maxQuota'] = maxQuota;
        });
        table.map((timeSess) => timeSess['rowSpanHeight'] = rowSpanHeight);
        //add unavailable list to the calendar
        if (unavaDayList && unavaDayList.length > 0) {
            unavaDayList.forEach((day) => {
                let unavaDay = 'day' + day.date.day();
                table[0][unavaDay] = day;
                table[0][unavaDay].isWhlDay = true;
                //table.map((timeSess) =>{
                //timeSess[unavaDay] = day;
                //timeSess[unavaDay].isWhlDay = true;
                //});
            });
        }
        return table;
    }

    processData = (payload) => {
        let allSchedules = [];
        let unavaDayList = [];
        if (payload) {
            let rmId = payload[0]['rmId'];
            let days = payload[0]['byDate'];
            days.forEach((day, idx) => {
                let slots = day.slots;
                let date = day.date;
                let selectedSessIds = this.props.getSelectedSessIds();
                let selectedSess = day.slots.filter((sess) => {
                    return (selectedSessIds.indexOf(sess.sessId) >= 0 || !sess.sessId);
                });
                slots = selectedSess;
                //Add to the unavailable list
                let isWhlDay = slots && slots[0] && slots[0].isWhlDay;
                if (isWhlDay) {
                    let unavaDay = {
                        ...(slots && slots[0]),
                        date: moment(date, 'YYYY-MM-DD')
                    };
                    unavaDayList.push(unavaDay);
                } else {
                    let dayTimeGroup = new TimeGroup();
                    let dayTimeGroupList = [];
                    let daySchedules = [];
                    slots.forEach((slot) => {
                        let timeGroupObj = {
                            id: slot.tmsltId,
                            dayIdx: idx
                        };
                        let start = new Date(date + ' ' + slot.stime);
                        let end = new Date(date + ' ' + slot.etime);
                        let endWithMargin = new Date(date + ' ' + slot.etime);
                        endWithMargin.setMinutes(end.getMinutes() - 1);
                        let spanHours = endWithMargin.getHours() - start.getHours();
                        let tmp = [1, 2, 3, 4, 5, 6, 7, 8];
                        // Add one time slot to the dayTimeGroup, could be 2 or more if spanned between
                        for (let i = 0; i <= spanHours; i++) {
                            let groupKey = start.getHours() + i;
                            if (dayTimeGroupList.indexOf(groupKey) === -1) {
                                timeGroupObj['start'] = this.getStartHour(start);
                                timeGroupObj['end'] = this.getEndHour(start);
                                timeGroupObj['datetime'] = start;
                                dayTimeGroupList.push(groupKey);
                                dayTimeGroup.addGroup(groupKey, timeGroupObj);
                            }
                            // add quote to the group
                            for (let j = 1; j < tmp.length + 1; j++) {
                                let quotaKey = 'qt' + j;
                                let qtNum = slot['qt' + j];
                                let quotaBooked = slot['qt' + j + 'Booked'];
                                dayTimeGroup.addQuota(groupKey, quotaKey, qtNum, quotaBooked);
                            }
                        }
                    });
                    dayTimeGroup.updateTitle();
                    daySchedules = dayTimeGroup.getSchedules();
                    allSchedules = allSchedules.concat(daySchedules);
                }
            });
        }
        return ({
            first: allSchedules,
            sec: unavaDayList
        });
    };

    render() {
        const { classes, id, calendarViewValue, quotaConfig } = this.props;
        return (
            <div id={'calendarCalendarDataGrid'} style={{ height: '99%' }}>
                <CIMSDataGrid
                    ref={this.refGrid}
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '100%',
                        display: 'block'
                    }}
                    gridOptions={{
                        columnDefs: this.state.columnDefs,
                        rowData: this.state.rowData,
                        frameworkComponents: {
                            statusRenderer: StatusRenderer
                        },
                        getRowNodeId: function (data) {
                            return data.time;
                        },
                        rowHeight: 75,
                        rowBuffer: 500,
                        getRowHeight: function (params) {
                            let maxQuota = params.data.maxQuota;
                            let defaultHeight = 75;
                            let extraLineHeight = 30;
                            if (maxQuota > 4) {
                                let extraLines = Math.ceil((maxQuota - 4) / 2);
                                let h = extraLines * extraLineHeight;
                                return (defaultHeight + h);
                            }
                            return (defaultHeight);
                        },
                        defaultColDef: { autoHeight: true },
                        suppressRowHoverHighlight: true
                    }}
                    suppressGoToRow
                    suppressDisplayTotal
                    disableAutoSize
                    suppressRowTransform
                    suppressColumnVirtualisation
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        calendarViewValue: state.calendarView.calendarViewValue,
        calendarWeekData: state.calendarView.calendarWeekData,
        calendarData: state.calendarView.calendarData,
        quotaConfig: state.common.quotaConfig,
        encounterTypeValue: state.calendarView.encounterTypeValue,
        subEncounterTypeListKeyAndValue: state.calendarView.subEncounterTypeListKeyAndValue,
        dateFrom: state.calendarView.dateFrom,
        dateTo: state.calendarView.dateTo
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(WeekView));
