import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';

import EditIcon from '@material-ui/icons/Edit';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import HelpIcon from '@material-ui/icons/Help';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import IconButton from '@material-ui/core/IconButton';

import {

    setCalendarDetailDate,
    setFilterMode,
    getDailyNote,
    setExpressEditMode,
    setExpressDateList,
    getMultipleDailyViewForExpress,
    setUtilizationMode
    // setSelectedDailyViewTimeslotList
} from '../../../../store/actions/dts/appointment/bookingAction';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';
import { PageStatus as pageStatusEnum } from '../../../../enums/dts/appointment/bookingEnum';
import InformationIcon from '../img/informationTooltipInBooking.png';

const styles = ({
    root: {
        fontFamily: 'Microsoft JhengHei, Calibri',
        margin: '1px auto auto auto',
        minWidth: '390px',
        width: '90%',
        padding: '10px',
        'border-radius': '0px',
        border: '0px',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        'text-align': 'center'
    },
    row: {
        width: 385
    },
    header: {
        width: 200
    },
    card: {
        width: 55,
        height: 55
    },
    emptyCard: {
        width: 55,
        height: 55,
        visibility: 'hidden'
    },
    cardContent: {
        width: '100%',
        margin: 'auto',
        padding: '0px !important',
        height: '100%',
        '& p': {
            marginRight: '4px',
            lineHeight: '1.5',
            fontSize: '1rem'
            // fontWeight: '600'
        }
    },
    cardHeader: {
        width: '100%',
        margin: 'auto',
        padding: '0px !important',
        height: '100%',
        '& p': {
            lineHeight: '1.5',
            fontSize: '1rem',
            fontWeight: '600'
        }
    },
    emptyCalenderDetail: {
        width: '380px',
        height: '380px',
        textAlign: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        display: 'flex',
        margin: 'auto'
    },
    ameoh: {
        width: 38,
        height: 3,
        // borderRadius: '25%',
        position: 'absolute',
        top: '7px',
        right: '10px'
    },
    am: {
        width: 10,
        height: 15,
        // borderRadius: '25%',
        position: 'absolute',
        top: '12px',
        right: '10px'
    },
    amWhole: {
        width: 10,
        height: 15,
        // borderRadius: '25%',
        position: 'absolute',
        top: '12px',
        right: '10px'
    },
    pm: {
        width: 10,
        height: 15,
        // borderRadius: '25%',
        position: 'absolute',
        top: '30px',
        right: '10px'
    },
    pmeoh: {
        width: 38,
        height: 3,
        // borderRadius: '25%',
        position: 'absolute',
        top: '47px',
        right: '10px'
    },
    pmWhole: {
        width: 10,
        height: 15,
        // borderRadius: '25%',
        position: 'absolute',
        top: '30px',
        right: '10px'
    },
    edc: {
        width: 10,
        height: 15,
        // borderRadius: '25%',
        position: 'absolute',
        top: '20px',
        left: '8px'
    },
    cardActionArea: {
        width: '100%',
        height: '100%'
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
    expressIcon: {
        float: 'right'
    },
    editIcon_ExpressMode_On: {
        backgroundColor: '#64aeed',
        color: 'white'
    },
    editIcon_ExpressMode_Off: {
        backgroundColor: 'white',
        color: '#64aeed'
    },
    red: {
        backgroundColor: '#df4333',
        color: '#ffffff'
    },
    green: {
        backgroundColor: '#7fc355'
        // backgroundColor:'#b5e61d'
    },
    lightGreen: {
        backgroundColor: '#b5e61d',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #96c500'
    },
    white: {
        backgroundColor: 'white',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #cccccc9c'
    },
    black: {
        backgroundColor: 'black'
    },
    gray: {
        backgroundColor: '#80808069'
    },
    lightGray: {
        backgroundColor: '#efefef'
    },
    blue: {
        backgroundColor: 'cornflowerblue'
    },
    yellow: {
        backgroundColor: '#ffff00',
        '-webkit-box-sizing': 'border-box',
        border: '1px solid #dede00'
    },
    lightBlue: {
        backgroundColor: '#d1eefc'
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
    informationIcon:{
        float:'left'
    }
});

class DtsCalendarDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // componentWillMount() {

    // }

    componentDidMount() {

    }

    handleExpressEditClick = () => {
        if (this.props.expressEditMode)
            this.props.setExpressEditMode(false);
        else
            this.props.setExpressEditMode(true);
        this.props.setCalendarDetailDate('');
        // this.props.setUtilizationMode(false);
    }

    handleConfirmExpress = () => {
        if (this.props.patientInfo) {
            let paramsList = [];
            if (this.props.expressDateList.length > 0) {
                this.props.expressDateList.forEach(date => {
                    let dateParams = {
                        encounterTypeId: this.props.selectedEncounterType.encntrTypeId,
                        roomId: this.props.selectedRoom.rmId,
                        targetDate: date
                    };

                    paramsList.push(dateParams);
                });
                this.props.getMultipleDailyViewForExpress(paramsList, [this.triggerMultipleAppointmentDialog]);
            }
        }
    }

    triggerMultipleAppointmentDialog = () => {
        //console.log('triggerMultipleAppointmentDialog');
        if (Array.isArray(this.props.dailyViewForExpress) && this.props.dailyViewForExpress.length > 0) {
            this.props.dailyViewForExpress.forEach(dailyView => {
                this.props.addToGeneralAppointmentObjList(dailyView);
            });
            this.props.appointmentAction();
        }
    }

    timeSlotColor(code, classes, utilizationMode, node) {
        if (utilizationMode) {
            let result = 100 - node.availabilityPercentage;
            if (result == 0) {
                return classes.white;
            } else if (result > 0 && result < 31) {
                return classes.lightGreen;
            } else if (result > 30 && result < 71) {
                return classes.yellow;
            } else if (result > 70 && result < 100) {
                return classes.orange;
            } else if (result == 100) {
                return classes.purple;
            } else {
                return classes.gray;
            }
        } else {
            if (code === 'A') {         //A = available
                return classes.green;
            } else if (code === 'Q') {  //Q = Express mode
                return classes.blue;
            } else if (code === 'U') {  //U = Other unavailable period
                return classes.white;
            } else {
                return '';
            }
        }
    }

    innerCell(node, classes) {
        let amClass = '';
        let pmClass = '';

        let colorClassAmeoh = '';
        let colorClassAm = '';
        let colorClassPm = '';
        let colorClassPmeoh = '';
        let colorClassEdc = '';

        /*
        * Express mode > node.calendarDataSessionList will be null
        * Non Express mode > node.calendarExpressData will be null
        */

        if (node.calendarDataSessionList != null && node.calendarExpressData == null && moment(node.dateValue).isSameOrAfter(moment(0, 'HH'))) {
            let timeCodeList = node.calendarDataSessionList;
            if (timeCodeList && timeCodeList.length > 0) {
                for (let i = 0; i < timeCodeList.length; i++) {
                    if (timeCodeList[i].session.sessionDescription === 'AM')
                        colorClassAm = this.timeSlotColor(timeCodeList[i].availabilityIndicator, classes, this.props.utilizationMode, timeCodeList[i]);
                    else if (timeCodeList[i].session.sessionDescription === 'PM')
                        colorClassPm = this.timeSlotColor(timeCodeList[i].availabilityIndicator, classes, this.props.utilizationMode, timeCodeList[i]);
                    else if (timeCodeList[i].session.sessionDescription === 'AMEOH')
                        colorClassAmeoh = this.timeSlotColor(timeCodeList[i].availabilityIndicator, classes, this.props.utilizationMode, timeCodeList[i]);
                    else if (timeCodeList[i].session.sessionDescription === 'PMEOH')
                        colorClassPmeoh = this.timeSlotColor(timeCodeList[i].availabilityIndicator, classes, this.props.utilizationMode, timeCodeList[i]);
                    else if (timeCodeList[i].session.sessionDescription === 'EDC')
                        colorClassEdc = this.timeSlotColor(timeCodeList[i].availabilityIndicator, classes, this.props.utilizationMode, timeCodeList[i]);
                }
            }

            if (colorClassAmeoh === '' || (colorClassAmeoh === colorClassAm))
                amClass = classes.amWhole;
            else
                amClass = classes.am;

            if (colorClassPmeoh === '' || (colorClassPmeoh === colorClassPm))
                pmClass = classes.pmWhole;
            else
                pmClass = classes.pm;

            if (colorClassEdc === '' )
                colorClassEdc = classes.edc;
        }
        else if (node.calendarExpressData != null && moment(node.dateValue).isSameOrAfter(moment(0, 'HH'))) {
            amClass = classes.amWhole;
            pmClass = classes.pmWhole;
            colorClassAm = this.timeSlotColor(node.availabilityIndicator, classes, this.props.utilizationMode, node);
            colorClassPm = this.timeSlotColor(node.availabilityIndicator, classes, this.props.utilizationMode, node);
        }

        return (
            <CardContent className={classes.cardContent}>
                <p>{node.calendarData}</p>
                {(node.availabilityIndicator === 'A' || node.availabilityIndicator === 'Q') ?
                    (
                        <>
                            <div className={classes.ameoh + ' ' + colorClassAmeoh}></div>
                            <div className={amClass + ' ' + colorClassAm}></div>
                            <div className={pmClass + ' ' + colorClassPm}></div>
                            <div className={classes.pmeoh + ' ' + colorClassPmeoh}></div>
                            <div className={classes.edc + ' ' + colorClassEdc}></div>
                        </>
                    )
                    :
                    (<></>)
                }
            </CardContent>
        );
    }

    getTooltipDetailForEdit = (classes) => {
        let rows = [];
        rows.push('Edit Mode ' + ((this.props.expressEditMode) ? 'On' : 'Off'));

        if (this.props.expressDateList.length > 0) {
            rows.push('Selected:');
            this.props.expressDateList.map((date) =>
                rows.push(moment(date).format('Do MMM YY'))
            );
        }

        const tooltipItems = rows.map((item, idx) =>
            (<li key={idx} className={classes.tooltipLi}>{item}</li>)
        );

        return (
            <ul className={classes.tooltipUl}>{tooltipItems}</ul>
        );
    }

    getTooltipDetailForCalendar = (node, classes) => {
        if (this.props.expressEditMode) {
            return '';
        }

        let rows = [];
        for (let i = 0; i < node.calendarExpressData.defaultExpressAppointmentCount; i++) {
            if (node.calendarExpressData.defaultAppointmentDateList[i] != null)
                rows.push(moment(node.calendarExpressData.defaultAppointmentDateList[i]).format('Do MMM YY'));
            else
                rows.push('N/A');
        }

        const tooltipItems = rows.map((item, idx) =>
            (<li key={idx} className={classes.tooltipLi}>{item}</li>)
        );

        return (
            <ul className={classes.tooltipUl}>{tooltipItems}</ul>
        );
    }
    getTooltipDetailForInformation =(classes)=>{
        let rows = [];
        rows.push('Information on each cell: ');
        rows.push(<img src={InformationIcon} alt="InformationIcon" style={{height:'74px'}}/>);

        const tooltipItems = rows.map((item, idx) =>
            (<li key={idx} className={classes.tooltipLi}>{item}</li>)
        );

        return (
            <ul className={classes.tooltipUl}>{tooltipItems}</ul>
        );
    }

    calendarSelectedDate = (value) => {
        // console.log('calendarSelectedDate');
        // console.log(JSON.stringify(value));

        this.props.setFilterMode(1);
        this.props.setCalendarDetailDate(value);
        this.props.onAvailableDateSelect(value);
        //this.props.setPageStatus(pageStatusEnum.EDIT);
        if (this.props.calendarDetailDate == value) {
            this.props.getDailyNote({ clinicRoomId: this.props.selectedRoom.rmId, appointmentDate: value });
        }
    }

    calendarSelectedDateExpressMode = (node) => {
        // console.log('calendarSelectedDateExpressMode');
        // console.log(JSON.stringify(node));

        if (this.props.expressEditMode) {
            let tempDateList = null;
            let dateFound = -1;

            if (Array.isArray(this.props.expressDateList)) {
                // check selected date exist at the express date list
                dateFound = this.props.expressDateList.findIndex(date => date == node.dateValue);
                console.log('dateFound = ' + dateFound);

                // selected date exist at the express date list
                if (dateFound != -1) {
                    tempDateList = [...this.props.expressDateList];
                    tempDateList.splice(dateFound, 1);
                    // console.log('tempDateList = '+tempDateList);
                    this.props.setExpressDateList(tempDateList);
                }
                // selected date not exist at the express date list
                else {
                    if (this.props.expressDateList.length < node.calendarExpressData.defaultExpressAppointmentCount) {
                        let selectedDate = node.dateValue;
                        tempDateList = [...this.props.expressDateList];
                        tempDateList.push(selectedDate);
                        tempDateList.sort(function (a, b) {
                            if (moment(a).isSameOrBefore(moment(b)))
                                return -1;
                            else
                                return 1;
                        });
                        // console.log('tempDateList = '+tempDateList);
                        this.props.setExpressDateList(tempDateList);
                    }
                }
            }
        }
        else {
            if (node.calendarExpressData.defaultExpressAppointmentCount == node.calendarExpressData.defaultAppointmentDateList.length) {
                let tempDateList = [...node.calendarExpressData.defaultAppointmentDateList];
                this.props.setExpressDateList(tempDateList);
            }
        }
    }


    formatCell(node, idx, classes) {
        let colorClass;
        // console.log(JSON.stringify(node));

        if (node.availabilityIndicator === 'H')
            colorClass = classes.red;
        else if ((node.availabilityIndicator === 'A' || node.availabilityIndicator === 'Q') && moment(node.dateValue).isSameOrAfter(moment(0, 'HH')))
            colorClass = classes.white;
        else if (node.availabilityIndicator === 'U')
            colorClass = classes.gray;
        else
            colorClass = classes.lightGray;

        if (node.availabilityIndicator === 'Q') {
            if (Array.isArray(this.props.expressDateList) && this.props.expressDateList.length > 0) {
                if (this.props.expressDateList.findIndex(date => date == node.dateValue) != -1) {
                    colorClass = classes.lightBlue;
                }
            }
        }
        if (this.props.calendarDetailDate === node.dateValue) {
            colorClass = classes.lightBlue;
        }
        return (
            <Card key={idx} className={classes.card + ' ' + colorClass}>
                {
                    //(node.availabilityIndicator === 'A') ?
                    (node.availabilityIndicator != 'H' && node.availabilityIndicator != 'U') ?
                        (
                            (this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE) ?
                                (
                                    (node.availabilityIndicator == 'Q' && moment(node.dateValue).isSameOrAfter(moment(0, 'HH'))) ?
                                        (
                                            <Tooltip title={this.getTooltipDetailForCalendar(node, classes)}>
                                                <CardActionArea className={classes.cardActionArea} onClick={e => this.calendarSelectedDateExpressMode(node)}>
                                                    {this.innerCell(node, classes)}
                                                </CardActionArea>
                                            </Tooltip>
                                        )
                                        :
                                        (
                                            this.innerCell(node, classes)
                                        )
                                )
                                :
                                (
                                    <CardActionArea className={classes.cardActionArea} onClick={e => this.calendarSelectedDate(node.dateValue)}>
                                        {this.innerCell(node, classes)}
                                    </CardActionArea>
                                )
                        )
                        :
                        (
                            this.innerCell(node, classes)
                        )
                }

            </Card>
        );
    }

    calendarWeekHeader(classes) {
        return (
            <>
                <Card className={classes.card + ' ' + classes.red}>
                    <CardContent className={classes.cardHeader}>
                        <p>Sun</p>
                    </CardContent>
                </Card>
                <Card className={classes.card + ' ' + classes.white}>
                    <CardContent className={classes.cardHeader}>
                        <p>Mon</p>
                    </CardContent>
                </Card>
                <Card className={classes.card + ' ' + classes.white}>
                    <CardContent className={classes.cardHeader}>
                        <p>Tue</p>
                    </CardContent>
                </Card>
                <Card className={classes.card + ' ' + classes.white}>
                    <CardContent className={classes.cardHeader}>
                        <p>Wed</p>
                    </CardContent>
                </Card>
                <Card className={classes.card + ' ' + classes.white}>
                    <CardContent className={classes.cardHeader}>
                        <p>Thu</p>
                    </CardContent>
                </Card>
                <Card className={classes.card + ' ' + classes.white}>
                    <CardContent className={classes.cardHeader}>
                        <p>Fri</p>
                    </CardContent>
                </Card>
                <Card className={classes.card + ' ' + classes.gray}>
                    <CardContent className={classes.cardHeader}>
                        <p>Sat</p>
                    </CardContent>
                </Card>
            </>
        );
    }

    fillEmptyDate(firstDay, classes) {
        let daysNeedToFill = 0;
        let emptyDays = [];
        // console.log('FirstDay: ' + JSON.stringify(firstDay));
        if (firstDay) {
            daysNeedToFill = moment(firstDay.dateValue).day();
        }
        else {
            daysNeedToFill = 0;
        }

        for (let i = 0; i < daysNeedToFill; i++) {
            emptyDays.push(this.emptyDate(i, classes));
        }

        return (
            <>{emptyDays}</>
        );
    }

    emptyDate(idx, classes) {
        return (
            <Card key={idx} className={classes.emptyCard}>
                <CardContent className={classes.cardContent}></CardContent>
            </Card>
        );
    }

    render() {
        const { classes, className, calendarDetailMth, ...rest } = this.props;
        const dtsCalendarDetail = this;

        return (
            <Paper className={classes.root + ' ' + className} variant="outlined" square>
                {
                    (calendarDetailMth.calendarDataGroupDate != '' && calendarDetailMth.calendarDateList.length > 0) ?
                        (
                            <Grid container direction="row" justify="center">
                                {/* Grid row for the header */}
                                <Grid container direction="row" justify="center" alignItems="center" className={classes.row}>
                                    <Grid item xs={3}>
                                        <Tooltip title={this.getTooltipDetailForInformation(classes)}>
                                            <div>
                                                <IconButton className={classes.informationIcon + ' ' + classes.editIcon_ExpressMode_Off}>
                                                    <HelpIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography gutterBottom variant="h5" component="h2">{moment(calendarDetailMth.calendarDataGroupDate).format('MMMM YYYY')}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Tooltip title={'Confirm Express'}>
                                            <div>
                                                <IconButton
                                                    className={classes.expressIcon + ' ' + classes.editIcon_ExpressMode_Off}
                                                    disabled={this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE || !this.props.patientInfo}
                                                    onClick={e => this.handleConfirmExpress()}
                                                >
                                                    <BookmarkIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                        <Tooltip title={this.getTooltipDetailForEdit(classes)}>
                                            <div>
                                                <IconButton
                                                    className={classes.expressIcon + ' ' + ((this.props.expressEditMode) ? classes.editIcon_ExpressMode_On : classes.editIcon_ExpressMode_Off)}
                                                    disabled={this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE}
                                                    onClick={e => this.handleExpressEditClick()}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    </Grid>
                                </Grid>

                                {/* Grid row for the days */}
                                <Grid container direction="row" className={classes.row} >
                                    {dtsCalendarDetail.calendarWeekHeader(classes)}
                                    {dtsCalendarDetail.fillEmptyDate(calendarDetailMth.calendarDateList[0], classes)}
                                    {
                                        calendarDetailMth.calendarDateList.map(function (value, idx) {
                                            return dtsCalendarDetail.formatCell(value, idx, classes);
                                        })
                                    }
                                </Grid>
                            </Grid>
                        )
                        :
                        (
                            <Card className={classes.emptyCalenderDetail}>No record</Card>
                        )
                }
            </Paper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        calendarDetailMth: state.dtsAppointmentBooking.pageLevelState.calendarDetailMth,
        calendarDetailDate: state.dtsAppointmentBooking.pageLevelState.calendarDetailDate,
        patientInfo: state.patient.patientInfo,
        dailyViewForExpress: state.dtsAppointmentBooking.dailyViewForExpress,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        selectedEncounterType: state.dtsAppointmentBooking.pageLevelState.selectedEncounterType,
        expressEditMode: state.dtsAppointmentBooking.pageLevelState.expressEditMode,
        expressDateList: state.dtsAppointmentBooking.expressDateList,
        utilizationMode: state.dtsAppointmentBooking.pageLevelState.utilizationMode
    };
};

const mapDispatchToProps = {
    setCalendarDetailDate,
    setFilterMode,
    getDailyNote,
    setExpressEditMode,
    setExpressDateList,
    getMultipleDailyViewForExpress,
    setUtilizationMode
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsCalendarDetail));