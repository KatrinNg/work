import React, { Component } from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import * as dtsBookingConstant from '../../../constants/dts/appointment/DtsBookingConstant';

const styles = ({
    root: {
        width: 112
    },
    header: {
        width: 112
    },
    node: {
        justify: 'center',
        spacing: '0'
    },
    emptyPaper: {
        height: 16,
        width: 16,
        visibility: 'hidden'
    },
    paper: {
        height: 16,
        width: 16,
        textAlign: 'center',
        color:'#6f6f6f',
        fontSize:12
    },
    headerPaper: {
        height: 20,
        width: 126,
        textAlign: 'center'
        // fontWeight: 'bold'
    },
    red: {
        backgroundColor: '#df4333',
        color: '#ffffff'
    },
    green: {
        backgroundColor: '#7fc355'
    },
    lightGreen:{
        backgroundColor:'#b5e61d'
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
    lightGray:{
        backgroundColor:'#efefef'
    },
    blue: {
        backgroundColor: 'cornflowerblue'
    },
    yellow: {
        backgroundColor: '#ffff00'
    },
    darkGreen: {
        backgroundColor: '#5b9636'
    },
    orange: {
        backgroundColor: '#ff6600'
    },
    purple: {
        backgroundColor: '#ff33cc'
    },
    todayDateBorder:{
        '-webkit-box-sizing': 'border-box',
        border: '2px solid #000000'
    }
});

class DtsCalendar extends Component {
    constructor(props) {
        super(props);
        //this.formatCell = this.formatCell.bind(this);
    }

    formatCell(node, idx, classes, utilizationMode) {
        let colorClass;
        // let classValue;
        // classValue = node.display === 'N' ? classes.emptyPaper :classes.paper;
        if (utilizationMode) {
            // =========When in Utilization Mode START========
            if (
                ((this.props.bookingMode != dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE) && node.availabilityIndicator != 'U' && node.availabilityIndicator != 'H' && moment(node.dateValue).isSameOrAfter(moment(0, 'HH'))) || 
                ((this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_EXPRESS_MODE) && node.availabilityIndicator == 'Q' && moment(node.dateValue).isSameOrAfter(moment(0, 'HH')))
                ) {
                let result = 100-node.availabilityPercentage;
                if (result == 0) {
                    colorClass = classes.white;
                } else if (result > 0 && result < 31) {
                    colorClass = classes.lightGreen;
                } else if (result > 30 && result < 71) {
                    colorClass = classes.yellow;
                } else if (result > 70 && result < 100) {
                    colorClass = classes.orange;
                } else if (result == 100) {
                    colorClass = classes.purple;
                } else {
                    colorClass = classes.gray;
                }
                // colorClass = classes.white;
            } else if (node.availabilityIndicator === 'U') {
                colorClass = classes.gray;
            } else if (node.availabilityIndicator === 'H') {
                colorClass = classes.red;
            } else {
                colorClass = classes.lightGray;
            }
            let today = moment().format('YYYY-MM-DD' + 'T00:00:00+08:00');
            if (node.dateValue === today) {
                colorClass += ' ' +classes.todayDateBorder;
            }
            // =========When in Utilization Mode END========
        } else {
            // =========When in Availability Mode START========
            if (node.availabilityIndicator === 'H')
                colorClass = classes.red;
            else if (node.availabilityIndicator === 'A' && moment(node.dateValue).isSameOrAfter(moment(0, 'HH')))
                colorClass = classes.green;
            else if (node.availabilityIndicator === 'Q' && moment(node.dateValue).isSameOrAfter(moment(0, 'HH')))
                colorClass = classes.blue;
            // else if(node.availabilityIndicator === 'B')
            //     colorClass = classes.black;
            else if (node.availabilityIndicator === 'U')
                colorClass = classes.gray;
            else
                colorClass = classes.lightGray;

            if (node.availabilityIndicator === 'Q') {
                if (Array.isArray(this.props.expressDateList) && this.props.expressDateList.length > 0) {
                    if (this.props.expressDateList.findIndex(date => date == node.dateValue) != -1) {
                        colorClass = classes.yellow;
                        node.label = "T";
                    }
                }
            }
            let today = moment().format('YYYY-MM-DD' + 'T00:00:00+08:00');
            if (node.dateValue === today) {
                colorClass += ' ' +classes.todayDateBorder;
                node.label = "T";
            }
        }// =========When in Availability Mode END========

        return (
            <Grid key={idx} item>
                <Paper className={classes.paper + ' ' + colorClass} variant="outlined" square>
                    {node.label}
                </Paper>
            </Grid>
        );
    }

    calendarWeekHeader(classes) {
        return (
            <>
                <Grid item>
                    <Paper className={classes.paper + ' ' + classes.red} variant="outlined" square>S</Paper>
                </Grid>
                <Grid item>
                    <Paper className={classes.paper + ' ' + classes.white} variant="outlined" square>M</Paper>
                </Grid>
                <Grid item>
                    <Paper className={classes.paper + ' ' + classes.white} variant="outlined" square>T</Paper>
                </Grid>
                <Grid item>
                    <Paper className={classes.paper + ' ' + classes.white} variant="outlined" square>W</Paper>
                </Grid>
                <Grid item>
                    <Paper className={classes.paper + ' ' + classes.white} variant="outlined" square>T</Paper>
                </Grid>
                <Grid item>
                    <Paper className={classes.paper + ' ' + classes.white} variant="outlined" square>F</Paper>
                </Grid>
                <Grid item>
                    <Paper className={classes.paper + ' ' + classes.gray} variant="outlined" square>S</Paper>
                </Grid>
            </>
        );
    }

    fillEmptyDate(firstDay, classes) {
        let daysNeedToFill = 0;
        let emptyDays = [];

        // console.log(firstDay);
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
            <Grid key={idx} item>
                <Paper className={classes.emptyPaper} variant="outlined" square></Paper>
            </Grid>
        );
    }

    render() {
        const { classes, className, calendarDataGroupDate, calendarDateList, action, utilizationMode, ...rest } = this.props;
        const dtsCalendar = this;

        return (
            <Grid container className={classes.root + ' ' + className} onClick={action}>
                <Grid item xs={12}>
                    <Grid container className={classes.header}>
                        <Grid>
                            <Paper className={classes.headerPaper} variant="outlined" square>
                                {moment(calendarDataGroupDate).format('MMM YYYY')}
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid container className={classes.node}>
                        {dtsCalendar.calendarWeekHeader(classes)}
                        {dtsCalendar.fillEmptyDate(calendarDateList[0], classes)}
                        {calendarDateList.map(function (value, idx) {
                            return dtsCalendar.formatCell(value, idx, classes, utilizationMode);
                        })}
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        utilizationMode: state.dtsAppointmentBooking.pageLevelState.utilizationMode
    };
};

export default connect(mapStateToProps)(withStyles(styles)(DtsCalendar));

