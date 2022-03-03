import React, { Component } from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import _ from 'lodash';

import DtsLocationEncounterPanel from './DtsLocationEncounterPanel';
import DtsCalendarGroup from './DtsCalendarGroup';
import DtsAppointmentSearchPanel from './DtsAppointmentSearchPanel';
import DtsEmptyTimeSlotDateList from './DtsEmptyTimeSlotDateList';

const styles = ({
    root: {
        fontFamily: 'Microsoft JhengHei, Calibri',
        margin:0,
        width: '100%'
    },
    emptyTimeSlotRoot:{
        fontFamily: 'Microsoft JhengHei, Calibri',
        margin:0,
        paddingLeft:15,
        paddingTop:10,
        width: '100%'
    }

});

class DtsLeftPanel extends Component {

    render(){
        const { classes, emptyTimeslotDateList, ...rest } = this.props;
// console.log('emptyTimeslotDateList : ' + JSON.stringify(emptyTimeslotDateList));
        return (
            (_.isEmpty(emptyTimeslotDateList)) ? (
                <Grid container className={classes.root}>
                    <Grid item>
                        <DtsLocationEncounterPanel
                            bookingMode={this.props.bookingMode}
                            setBookingMode={this.props.setBookingMode}
                        />
                        <DtsCalendarGroup
                            bookingMode={this.props.bookingMode}
                        />
                        <DtsAppointmentSearchPanel
                            appointmentAction={this.props.appointmentAction}
                            bookingMode={this.props.bookingMode}
                            setBookingMode={this.props.setBookingMode}
                            addToGeneralAppointmentObjList={this.props.addToGeneralAppointmentObjList}
                            updateGeneralAppointmentObjList={this.props.updateGeneralAppointmentObjList}
                            generalAppointmentObjList={this.props.generalAppointmentObjList}
                        />
                    </Grid>
                </Grid>
            ) : (
                <Grid container className={classes.emptyTimeSlotRoot}>
                    <Grid item>
                        <DtsEmptyTimeSlotDateList setBookingMode={this.props.setBookingMode}/>
                    </Grid>
                </Grid>
            )
        );
    }
}

const mapStateToProps = (state) => {
    return {
        emptyTimeslotDateList: state.dtsAppointmentBooking.emptyTimeslotDateList
    };
};

export default connect(mapStateToProps)(withStyles(styles)(DtsLeftPanel));