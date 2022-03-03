import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';

import DtsCalendar from '../../components/DtsCalendar';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import {
    // resetCalendarList,
    getAvailableCalendarTimeSlot,
    getAvailableCalendarTimeSlotForExpress,
    setCalendarDetailMth,
    setAppointmentSearchPanelTabVal,
    setUtilizationMode,
    setExpressEditMode
} from '../../../../store/actions/dts/appointment/bookingAction';

import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';

//material-ui core
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ShuffleIcon from '@material-ui/icons/Shuffle';

const styles = ({
    root: {
        fontFamily: 'Microsoft JhengHei, Calibri',
        margin: '5px auto auto auto',
        minWidth: '90%',
        maxWidth: '400px',
        padding: '0px 10px 10px 10px',
        'border-radius': '0px !important',
        border: '0px',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        'text-align': 'center'
    },
    row: {
        display: 'flex',
        'align-items': 'baseline',
        margin: '5px 0px'
        // margin: '5px 0px'
    },
    lastRow: {
        // margin: '5px 0px',
        // padding: '0px 0px 7px 0px'
    },
    button: {
        margin: 4,
        textTransform: 'none',
        minWidth: '10px',
        'border-radius': '25px',
        border: 'none',
        'box-shadow': 'none',
        backgroundColor: '#fff',
        color: '#92a8d3',
        '&:hover': {
            backgroundColor: '#cccccc30',
            color: '#00000070'
        }

    },
    defPaper: {
        width: 70,
        margin: '0px 2px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#00000070',
        'box-shadow': 'none',
        'border-radius': '0px !important'
    },
    gridRoot: {
        margin: '3px',
        height: 132
    },
    cardRoot: {
        'border-radius': '0px !important'
    },
    cardContent: {
        padding: 0,
        '&:last-child': {
            paddingBottom: 0
        }
    },
    emptyCalenderList: {
        width: '380px',
        height: '120px',
        textAlign: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        display: 'flex'
    },
    red: {
        backgroundColor: '#df4333',
        color: '#ffffff'
    },
    green: {
        backgroundColor: '#7fc355'
    },
    white: {
        backgroundColor: 'white'
    },
    black: {
        backgroundColor: 'black'
    },
    gray: {
        backgroundColor: '#80808069'
    },
    tooltipGray: {
        backgroundColor: '#808080'
    },
    blue: {
        backgroundColor: 'cornflowerblue'
    },
    yellow: {
        backgroundColor: '#ffff00',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #dede00'
    },
    orange: {
        backgroundColor: '#ff6600',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #bb4b00'
    },
    purple: {
        backgroundColor: '#ff33cc',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #c09'
    },
    darkGreen: {
        backgroundColor: '#5b9636'
    },
    lightGreen: {
        backgroundColor: '#b5e61d',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #96c500'
    },
    expressIcon: {
        float: 'right'
    },
    editIcon_ExpressMode_Off: {
        backgroundColor: 'white',
        padding: '0px !important',
        color: '#64aeed'
    },
    tooltipUl: {
        padding: '1px',
        margin: '1px',
        listStyleType: 'none'
    },
    tooltipLi: {
        padding: '1px',
        margin: '1px'
    },
    tooltipwhite: {
        backgroundColor: 'white',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #cccccc9c'
    },
    defPaperRange: {
        width: 53,
        margin: '0px 2px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#00000070',
        'box-shadow': 'none',
        'border-radius': '0px !important'
    },
    todayDateBorder: {
        '-webkit-box-sizing': 'border-box',
        border: '2px solid #000000'
    },
    utilizationIcon: {
        width: '70px'
    },
    utilizationIcon_small: {
        width: '50px'
    },
    defPaperSmall:{
        width: 20,
        margin: '0px 2px',
        textAlign: 'center',
        fontSize: '12px',
        'box-shadow': 'none',
        'border-radius': '0px !important'
    }
});

class DtsCalendarGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            startMonth: moment(),
            endMonth: moment()
        };
    }

    componentDidMount() {
        //this.props.resetCalendarList();
        this.updateSelectRange(0);
    }

    componentDidUpdate(prevProps) {
    }

    calendarGroupOnClick = (calendarGroup) => {
        this.props.setCalendarDetailMth(calendarGroup);
        this.props.setAppointmentSearchPanelTabVal(1);      //1 = DtsCalendarDetail
    }

    updateSelectRange = (value, triggerUpdate = false) => {
        let startMonth;
        let endMonth;

        if (value == 0) {
            startMonth = moment().startOf('month');
            endMonth = moment(startMonth).add(3, 'months').subtract(1, 'days');
        }
        else {
            if (Array.isArray(this.props.calendarDataGroupList) && this.props.calendarDataGroupList.length != 0) {
                startMonth = moment(this.props.calendarDataGroupList[0].calendarDataGroupDate).add(value, 'months').startOf('month');
            }
            else {
                startMonth = this.state.startMonth.add(value, 'months').startOf('month');
            }
            endMonth = moment(startMonth).add(3, 'months').subtract(1, 'days');
        }
        if (triggerUpdate)
            this.setState({ startMonth: startMonth, endMonth: endMonth }, this.updateCalendarGroups);
        else
            this.setState({ startMonth: startMonth, endMonth: endMonth });
    }

    buttonOnClick = (value) => {
        // console.log(value);
        this.updateSelectRange(value, true);
    }

    updateCalendarGroups = () => {
        if (!_.isEmpty(this.props.selectedClinic) && !_.isEmpty(this.props.selectedRoom) && !_.isEmpty(this.props.selectedEncounterType)) {
            if (this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE) {
                this.props.getAvailableCalendarTimeSlot({
                    dateFrom: dtsUtilities.formatDateParameter(this.state.startMonth),
                    dateTo: dtsUtilities.formatDateParameter(this.state.endMonth),
                    clinicCd: this.props.selectedClinic ? this.props.selectedClinic.siteCd : null,
                    roomCd: this.props.selectedRoom ? this.props.selectedRoom.rmCd : null,
                    slot: this.props.selectedEncounterType ? (this.props.selectedEncounterType.drtn / 15) : null,
                    encounterTypeId: this.props.selectedEncounterType ? this.props.selectedEncounterType.encntrTypeId : null
                });
            }
            else {
                this.props.getAvailableCalendarTimeSlotForExpress({
                    dateFrom: dtsUtilities.formatDateParameter(this.state.startMonth),
                    dateTo: dtsUtilities.formatDateParameter(this.state.endMonth),
                    clinicCd: this.props.selectedClinic ? this.props.selectedClinic.siteCd : null,
                    roomCd: this.props.selectedRoom ? this.props.selectedRoom.rmCd : null,
                    slot: this.props.selectedEncounterType ? (this.props.selectedEncounterType.drtn / 15) : null,
                    encounterTypeId: this.props.selectedEncounterType ? this.props.selectedEncounterType.encntrTypeId : null
                });
            }
        }
    }

    handleChangeUtilizationMode = () => {
        if (this.props.utilizationMode)
            this.props.setUtilizationMode(false);
        else
            this.props.setUtilizationMode(true);
    }

    generateFooterToolTip = (classes) => {
        if (this.props.utilizationMode) {
            return (
                <>
                    <Paper className={classes.defPaperRange}><span className={classes.tooltipwhite}>&nbsp;&nbsp;&nbsp;</span> 0</Paper>
                    <Paper className={classes.defPaperRange}><span className={classes.lightGreen}>&nbsp;&nbsp;&nbsp;</span> 1-30</Paper>
                    <Paper className={classes.defPaperRange}><span className={classes.yellow}>&nbsp;&nbsp;&nbsp;</span> 31-70</Paper>
                    <Paper className={classes.defPaperRange}><span className={classes.orange}>&nbsp;&nbsp;&nbsp;</span> 71-99</Paper>
                    <Paper className={classes.defPaperRange}><span className={classes.purple}>&nbsp;&nbsp;&nbsp;</span> 100</Paper>
                    <Paper className={classes.defPaperRange}><span className={classes.gray}>&nbsp;&nbsp;&nbsp;</span> Closed</Paper>
                </>
            );
        } else if (this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE) {
            return (
                <>
                    <Paper className={classes.defPaperSmall}>&nbsp;&nbsp;&nbsp;</Paper>
                    <Paper className={classes.defPaper}><span className={classes.todayDateBorder}>&nbsp;T&nbsp;</span> Today</Paper>
                    <Paper className={classes.defPaper}><span className={classes.blue}>&nbsp;&nbsp;&nbsp;</span> Express</Paper>
                    <Paper className={classes.defPaper}><span className={classes.red}>&nbsp;&nbsp;&nbsp;</span> Holiday</Paper>
                    <Paper className={classes.defPaper}><span className={classes.gray}>&nbsp;&nbsp;&nbsp;</span> Close</Paper>
                    <Paper className={classes.defPaperSmall}>&nbsp;&nbsp;&nbsp;</Paper>
                </>
            );
        } else {
            return (
                <>
                    <Paper className={classes.defPaperSmall}>&nbsp;&nbsp;&nbsp;</Paper>
                    <Paper className={classes.defPaper}><span className={classes.todayDateBorder}>&nbsp;T&nbsp;</span> Today</Paper>
                    <Paper className={classes.defPaper}><span className={classes.green}>&nbsp;&nbsp;&nbsp;</span> Available</Paper>
                    <Paper className={classes.defPaper}><span className={classes.red}>&nbsp;&nbsp;&nbsp;</span> Holiday</Paper>
                    <Paper className={classes.defPaper}><span className={classes.gray}>&nbsp;&nbsp;&nbsp;</span> Close</Paper>
                    <Paper className={classes.defPaperSmall}>&nbsp;&nbsp;&nbsp;</Paper>
                </>
            );
        }

    }
    getTooltipDetailForUtilization = (classes) => {
        let rows = [];
        rows.push((this.props.utilizationMode) ? 'Utilization Mode' : 'Availability Mode');

        // if (this.props.utilizationMode) {
        //     rows.push(
        //         <Grid container direction="row" justify="center" alignItems="center" className={classes.lastRow}>
        //             <p className={classes.tooltipLi}><span className={classes.white}>&nbsp;&nbsp;&nbsp;</span> 0</p>
        //             <p className={classes.tooltipLi}><span className={classes.green}>&nbsp;&nbsp;&nbsp;</span> 1-30</p>
        //             <p className={classes.tooltipLi}><span className={classes.yellow}>&nbsp;&nbsp;&nbsp;</span> 31-70</p>
        //             <p className={classes.tooltipLi}><span className={classes.orange}>&nbsp;&nbsp;&nbsp;</span> 71-99</p>
        //             <p className={classes.tooltipLi}><span className={classes.purple}>&nbsp;&nbsp;&nbsp;</span> 100</p>
        //             <p className={classes.tooltipLi}><span className={classes.tooltipGray}>&nbsp;&nbsp;&nbsp;</span> Closed</p>
        //         </Grid>
        //     );

        // this.props.expressDateList.map((date) =>
        //     rows.push(moment(date).format('Do MMM YY'))
        // );
        // }

        const tooltipItems = rows.map((item, idx) =>
            (<li key={idx} className={classes.tooltipLi}>{item}</li>)
        );

        return (
            <ul className={classes.tooltipUl}>{tooltipItems}</ul>
        );
    }
    render() {
        const { classes, className, calendarDataGroupList, expressDateList, bookingMode, utilizationMode, ...rest } = this.props;

        let dtsCalendarGroup = this;
        return (
            <Paper className={classes.root + ' ' + className} variant="outlined" square>
                <Grid>
                    <Grid container direction="row" justify="center" alignItems="center" className={classes.row}>
                        <CIMSButton className={classes.button} onClick={e => this.buttonOnClick(-12)}>&lt;&lt;&lt;</CIMSButton>
                        <CIMSButton className={classes.button} onClick={e => this.buttonOnClick(-2)}>&lt;&lt;</CIMSButton>
                        <CIMSButton className={classes.button} onClick={e => this.buttonOnClick(-1)}>&lt;</CIMSButton>
                        <CIMSButton className={classes.button} onClick={e => this.buttonOnClick(0)}>Today</CIMSButton>
                        <CIMSButton className={classes.button} onClick={e => this.buttonOnClick(1)}>&gt;</CIMSButton>
                        <CIMSButton className={classes.button} onClick={e => this.buttonOnClick(2)}>&gt;&gt;</CIMSButton>
                        <CIMSButton className={classes.button} onClick={e => this.buttonOnClick(12)}>&gt;&gt;&gt;</CIMSButton>
                    </Grid>
                    <Grid container direction="row" justify="space-around" alignItems="center" className={classes.row}>
                        {
                            calendarDataGroupList.length > 0 ? (
                                calendarDataGroupList.map(function (value, idx) {
                                    return <Grid key={idx} className={classes.gridRoot}>
                                        <Card key={idx} className={classes.cardRoot}>
                                            <CardContent className={classes.cardContent}>
                                                <CardActionArea className={classes.cardContent}>
                                                    <Grid key={idx}>
                                                        <DtsCalendar key={idx} {...value} action={e => dtsCalendarGroup.calendarGroupOnClick(value)} expressDateList={expressDateList} bookingMode={bookingMode}></DtsCalendar>
                                                    </Grid>
                                                </CardActionArea>
                                            </CardContent>
                                        </Card>
                                    </Grid>;
                                })
                            )
                                :
                                (
                                    <Card className={classes.emptyCalenderList}>No record</Card>
                                )
                        }
                    </Grid>
                    <Grid container direction="row" justify="center" alignItems="center" className={classes.lastRow}>
                        {/* <Paper className={classes.defPaper}><span className={classes.darkGreen}>&nbsp;&nbsp;&nbsp;</span> Today</Paper>
                        <Paper className={classes.defPaper}><span className={classes.green}>&nbsp;&nbsp;&nbsp;</span> Available</Paper>
                        <Paper className={classes.defPaper}><span className={classes.blue}>&nbsp;&nbsp;&nbsp;</span> Express</Paper>
                        <Paper className={classes.defPaper}><span className={classes.red}>&nbsp;&nbsp;&nbsp;</span> Holiday</Paper>
                        <Paper className={classes.defPaper}><span className={classes.gray}>&nbsp;&nbsp;&nbsp;</span> Close</Paper> */}
                        {this.generateFooterToolTip(classes)}
                        <Tooltip title={this.getTooltipDetailForUtilization(classes)}>
                            <div>
                                <IconButton
                                    className={classes.expressIcon + ' ' + classes.editIcon_ExpressMode_Off}
                                    disabled={this.props.calendarDataGroupList.length === 0}
                                    onClick={e => this.handleChangeUtilizationMode()}
                                >
                                    <ShuffleIcon fontSize="small"/>
                                </IconButton>
                            </div>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Paper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        selectedClinic: state.dtsAppointmentBooking.pageLevelState.selectedClinic,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        selectedEncounterType: state.dtsAppointmentBooking.pageLevelState.selectedEncounterType,
        calendarDataGroupList: state.dtsAppointmentBooking.pageLevelState.calendarDataGroupList,
        expressDateList: state.dtsAppointmentBooking.expressDateList,
        utilizationMode: state.dtsAppointmentBooking.pageLevelState.utilizationMode
    };
};

const mapDispatchToProps = {
    getAvailableCalendarTimeSlot,
    getAvailableCalendarTimeSlotForExpress,
    setCalendarDetailMth,
    setAppointmentSearchPanelTabVal,
    setUtilizationMode,
    setExpressEditMode
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsCalendarGroup));