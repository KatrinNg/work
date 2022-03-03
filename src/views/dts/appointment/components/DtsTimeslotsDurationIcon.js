import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import DtsDurationIcon from './DtsDurationIcon';

const styles = ({

});

class DtsTimeslotsDurationIcon extends Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    render(){
        const { classes, timeslots, duration, iconType, ...rest } = this.props;

        let durationValue = 0;

        if (timeslots) {
            durationValue = timeslots.map((item) => moment(item.endTime, 'HH:mm').diff(moment(item.startTime, 'HH:mm'), 'minutes')).reduce((a, b) => a + b);
        } else if (duration) {
            durationValue =  duration;
        }

        return (
            <DtsDurationIcon iconType={iconType} duration={durationValue / 15} />
        );
    }
}

export default withStyles(styles)(DtsTimeslotsDurationIcon);