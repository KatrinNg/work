import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import {
    Grid
} from '@material-ui/core';
import { connect } from 'react-redux';
import moment from 'moment';
import DayViewRow from './dayViewRow';
import Enum from '../../../../../enums/enum';
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
                background: '#fcf7b6',
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap',
                overflow: 'hidden'
            }
        },
        '& .tableHead': {
            display: 'flex',
            border: '1px solid #ccc',
            borderBottom: 'none',
            background: '#7bc1d9',
            color: 'white',
            fontWeight: 'bold',
            height: '2rem',
            lineHeight: '2rem',
            '& .rightCell': {
                textAlign: 'center',
                display: 'block',
                padding: 'unset'
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& .slotTime': {
                    fontWeight: 'bold',
                    height: '1.6rem',
                    lineHeight: '1.6rem'
                },
                '& .rowCellContainer': {
                    margin: '0.1rem',
                    width: '100%'
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
            width: 240,
            minWidth: 120,
            borderRight: '1px solid #ccc',
            padding: '0 4px',
            textAlign: 'center'
        },
        '& .rightCell': {
            width: 'calc(100% - 280px )',
            display: 'flex',
            padding: 3,
            '& .slotRemarks': {
                flex: 1,
                width: 'calc(100% - 80px )',
                '& .remark': {
                    //background: 'rgb(208, 240, 251)',
                    borderLeft: '1.5rem solid #a6d1f5',
                    marginBottom: 4,
                    paddingLeft: 6,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    height: '1.6rem',
                    lineHeight: '1.6rem',
                    fontWeight: 'bold',
                    // cursor: 'pointer',
                    borderRadius: '1rem',
                    transition: 'filter 0.3s ease-in-out',
                    '&:hover': {
                        filter: 'brightness(0.8)'
                    }
                },
                '& .remarkClickable': {
                    cursor: 'pointer'
                },
                '& .maleRoot': {
                    backgroundColor: '#d1eefc'
                },
                '& .femaleRoot': {
                    backgroundColor: '#fedeed'
                },
                '& .unknownSexRoot': {
                    backgroundColor: '#f8d186'
                },
                '& .deadRoot': {
                    backgroundColor: '#404040',
                    color: '#fff'
                },
                '& .anonymousRoot': {
                    backgroundColor: '#fff',
                    border: '1px solid #000',
                    borderLeft: '1.5rem solid #a6d1f5'
                },
                '& .remark:last-child': {
                    marginBottom: 0
                }
            },
            '& .moreRemark': {
                width: 80,
                height: '100%',
                color: '#0579c8',
                alignSelf: 'flex-end',
                '& button': {
                    minWidth: 0
                }
            }
        }
    }
});

class DayView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tables: [
                {
                    title: 'Room',
                    head: '',
                    row: [],
                    columns: ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'],
                    isHoliday: null,
                    holidayDesc: null,
                    HolidayOrNoSlot: null
                }
            ]
        };
    }

    componentDidMount() {
        // if (this.props.calendarDayData) {
        //     this.setState({ tables: this.processData(this.props.calendarDayData) });
        // }

        const dataName = `calendarDayData${this.props.index ?? ''}`;
        if (this.props[dataName]) {
            this.setState({ tables: this.processData(this.props[dataName]) });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.calendarDayData !== this.props.calendarDayData || prevProps.dateFrom !== this.props.dateFrom) {
        //     this.setState({ tables: this.processData(this.props.calendarDayData) });
        // }
        // if (prevProps.sessionsConfig !== this.props.sessionsConfig) {
        //     if (this.props.calendarDayData) {
        //         this.setState({ tables: this.processData(this.props.calendarDayData) });
        //     }
        // }

        const dataName = `calendarDayData${this.props.index ?? ''}`;
        if (prevProps[dataName] !== this.props[dataName] || prevProps.dateFrom !== this.props.dateFrom) {
            this.setState({ tables: this.processData(this.props[dataName]) });
        }
        if (prevProps.sessionsConfig !== this.props.sessionsConfig) {
            if (this.props[dataName]) {
                this.setState({ tables: this.processData(this.props[dataName]) });
            }
        }
    }

    processData = (data = []) => {
        let tables = [];

        if (data && data.length > 0) {
            data.forEach(item => {
                let table = {};
                //table.title = this.props.subEncounterTypeListKeyAndValue[item.subEncounterType].shortName;
                table.head = moment(this.props.dateFrom).format('dddd');
                table.row = [];
                let startTime = '09:00';
                let endTime = '18:00';
                table.isHoliday = item.byDate && item.byDate[0] && item.byDate[0].holiday;
                table.holidayDesc = item.byDate[0].holidayDesc;
                table.date = item.byDate[0].date;
                let slots = item.byDate && item.byDate[0] && item.byDate[0].slots;
                table.isWhlDay = slots && slots[0] && slots[0].isWhlDay;
                table.rsnDesc = slots && slots[0] && slots[0].rsnDesc;
                if (!item.byDate[0].slots || item.byDate[0].slots.length < 1) {
                    table.isNoSlot = true;
                } else {
                    let selectedSessIds = this.props.index == null ? this.props.getSelectedSessIds() : this.props.getSelectedSessIds(this.props.index);
                    let selectedSlots = item.byDate[0].slots.filter((sess) => {
                        return (selectedSessIds.indexOf(sess.sessId) >= 0 || !sess.sessId);
                    });
                    //dateDto['slots'] = selectedSess;
                    selectedSlots.forEach(slot => {
                        //let rowIndex = moment(slot.stime, 'HH:mm');
                        //let rowIndex = slot.stime;
                        let date = item.byDate[0].date;
                        let datetime = moment(date + ' ' + slot.stime, Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                        let _slot = { ...slot };
                        let appts = _slot.appts;
                        for (let i = 0; i < appts.length; i++) {
                            let stime = moment(date + ' ' + appts[i].stime, Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                            let etime = moment(date + ' ' + appts[i].etime, Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK);
                            appts[i]['stime'] = stime;
                            appts[i]['etime'] = etime;
                        }
                        table.row.push({
                            ..._slot,
                            encounterType: this.props.encounterTypeValue,
                            subEncounterType: item.subEncounterType,
                            date: item.byDate[0].date,
                            datetime: datetime,
                            normalRemain: 0,
                            forceRemain: 0,
                            tolalRemain: 0,
                            remark: [],
                            timeSlot: []
                        });
                    });
                }
                tables.push(table);
            });
        }
        else {
            let table = {
                title: 'Room',
                head: moment(this.props.dateFrom).format('dddd'),
                row: [],
                columns: [],
                isHoliday: null,
                holidayDesc: null,
                HolidayOrNoSlot: null
            };
            tables.push(table);
        }
        return tables;
    }

    moreOnClick = (rowData) => {
        this.props.showRemarkDialog(rowData.appts || [], this.props.index);
    }
    remarkHover = (e, action, remark, patientRemark) => {
        this.props.openOrClosePopper(e, action, remark, patientRemark);
    }

    render() {
        const { classes, id, calendarViewValue, selectTimeSlot, quotaConfig, bookQuota, openPatientSummary, countryList } = this.props;
        //let myTable = this.processData(this.props.calendarDayData);
        let myTable = this.state.tables;
        let quotaName = quotaConfig && quotaConfig[0];
        return (
            <>
                {
                    calendarViewValue !== 'D' ? null :
                        <Grid id={id} className={classes.root}>
                            {myTable.map((table, i) => (
                                <Grid id={`${id}Table${i}`} key={table.title + table.head} className={classes.table}>
                                    <Grid className={'tableHead'}>
                                        <Grid className={'leftCell'}>Time</Grid>
                                        <Grid className={'rightCell'}>{table.head}</Grid>
                                    </Grid>
                                    <Grid className={'tableBody'}>
                                        {
                                            table.isHoliday || table.isNoSlot || table.isWhlDay ?
                                                <Grid className={'row noSlot'}>
                                                    <Grid className={'leftCell'}>
                                                    </Grid>
                                                    {
                                                        //<Grid id={`${id}Table${i}HolidayOrNoSlot`} className={`rightCell ${table.isHoliday?'holiday':''}`}>
                                                    }
                                                    <Grid id={`${id}Table${i}HolidayOrNoSlot`} className={`rightCell ${table.isHoliday ? 'holiday' : ''}`}>
                                                        {table.isWhlDay ?
                                                            <UnavaButton
                                                                items={table.row}
                                                                configData={{
                                                                    calendar: 'day'
                                                                }}
                                                                remarks={['rsnDesc']}
                                                            />
                                                            : 'No Slot'}

                                                    </Grid>
                                                </Grid> :
                                                table.row.map((row, index) => (
                                                    <DayViewRow
                                                        id={`${id}Table${i}Row${index}`}
                                                        key={row.startTime || index}
                                                        classes={classes}
                                                        rowData={row}
                                                        moreOnClick={this.moreOnClick}
                                                        selectTimeSlot={selectTimeSlot}
                                                        remarkHover={this.remarkHover}
                                                        quotaName={quotaName}
                                                        bookQuota={bookQuota}
                                                        openPatientSummary={openPatientSummary}
                                                        countryList={countryList}
                                                        viewOnly={this.props.index == null ? false : this.props.index === 2}
                                                    />
                                                ))
                                        }
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                }
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        calendarViewValue: state.calendarView.calendarViewValue,
        calendarData: state.calendarView.calendarData,
        calendarDayData: state.calendarView.calendarDayData,
        calendarDayData1: state.calendarView.calendarDayData1,
        calendarDayData2: state.calendarView.calendarDayData2,
        dateFrom: state.calendarView.dateFrom,
        dateTo: state.calendarView.dateTo,
        quotaConfig: state.common.quotaConfig,
        encounterTypeValue: state.calendarView.encounterTypeValue,
        subEncounterTypeValue: state.calendarView.subEncounterTypeValue,
        subEncounterTypeListKeyAndValue: state.calendarView.subEncounterTypeListKeyAndValue,
        countryList: state.patient.countryList || []
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DayView));
