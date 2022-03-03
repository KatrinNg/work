import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import withStyles from '@material-ui/core/styles/withStyles';

import DtsAppointmentSearchGroup from './DtsAppointmentSearchGroup';
import DtsCalendarDetail from './DtsCalendarDetail';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
    getDailyView ,
    setAppointmentSearchPanelTabVal
} from '../../../../store/actions/dts/appointment/bookingAction';


const styles = ({
    root: {
        fontFamily: 'Microsoft JhengHei, Calibri',
        margin: '1px auto auto auto',
        width: '90%',
        padding: '2px 10px 0px 10px',
        'border-radius': '0px',
        border: '0px',
        'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        'text-align':'center'
    },
    labelText:{
        '&:hover':{
            color:'#fff'
        }
    }
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
        component="div"
        role="tabpanel"
        hidden={value !== index}
        id={`scrollable-auto-tabpanel-${index}`}
        aria-labelledby={`scrollable-auto-tab-${index}`}
        {...other}
    >
      {<Box>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

class DtsAppointmentSearchPanel extends Component {
    constructor(props){
        super(props);
    }

    handleTabChange = (event, newValue) => {
        this.props.setAppointmentSearchPanelTabVal(newValue);
    }

    calendarDetailDateSelect = (date) => {
        if(!_.isEmpty(this.props.selectedRoom))
            this.props.getDailyView({ rmId: this.props.selectedRoom.rmId, date: date});
    }

    render(){
        const { classes, className, appointmentSearchPanelTabVal, ...rest } = this.props;

        return (
            <div>
                <Paper square className={classes.root + ' ' + className}>
                    <Tabs
                        variant="fullWidth"
                        value={appointmentSearchPanelTabVal}
                        indicatorColor="primary"
                        // textColor="primary"
                        onChange={this.handleTabChange}
                        aria-label="Appointment Search"
                    >
                    <Tab label="Search" className={classes.labelText}>
                    </Tab>
                    <Tab label="Calendar" className={classes.labelText}>
                    </Tab>
                    </Tabs>
                </Paper>

                <TabPanel value={appointmentSearchPanelTabVal} index={0}>
                    <DtsAppointmentSearchGroup
                        id={'dtsAppointmentSearchGroup'}
                        appointmentAction={this.props.appointmentAction}
                        bookingMode={this.props.bookingMode}
                        setBookingMode={this.props.setBookingMode}
                        updateGeneralAppointmentObjList={this.props.updateGeneralAppointmentObjList}
                        generalAppointmentObjList={this.props.generalAppointmentObjList}
                    />
                </TabPanel>

                <TabPanel value={appointmentSearchPanelTabVal} index={1}>
                    <DtsCalendarDetail
                        id={'dtsCalendarDetail'}
                        onAvailableDateSelect={this.calendarDetailDateSelect}
                        appointmentAction={this.props.appointmentAction}
                        bookingMode={this.props.bookingMode}
                        setBookingMode={this.props.setBookingMode}
                        addToGeneralAppointmentObjList={this.props.addToGeneralAppointmentObjList}
                    />
                </TabPanel>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        appointmentSearchPanelTabVal: state.dtsAppointmentBooking.pageLevelState.appointmentSearchPanelTabVal,
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom
    };
};

const mapDispatchToProps = {
    setAppointmentSearchPanelTabVal,
    getDailyView
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAppointmentSearchPanel));