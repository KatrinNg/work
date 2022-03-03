import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import { connect } from 'react-redux';
import Enum from '../../../../enums/enum';
import DtsDailyNoteUi from './DtsDailyNoteUi';

import {
    getDailyNote,
    updateDailyNote,
    resetDailyNote
} from '../../../../store/actions/dts/appointment/attendanceAction';

const styles = {

};



class DtsDailyNoteAttendance extends Component {

    constructor(props){
        super(props);

        this.state = {
            dailyNote:{}
        };
    }

    componentDidUpdate = (prevProps) => {
        if((prevProps.selectedRoom != this.props.selectedRoom || prevProps.calendarDetailDate != this.props.calendarDetailDate) &&
            this.props.selectedRoom && this.props.selectedRoom.rmId && this.props.calendarDetailDate){
            this.props.getDailyNote({clinicRoomId:this.props.selectedRoom.rmId, appointmentDate:moment(this.props.calendarDetailDate).format('YYYY-MM-DD')});
        }
        if(this.props.dailyNote != prevProps.dailyNote) {
            this.setState({dailyNote:this.props.dailyNote});
        }
    }

    componentWillUnmount() {
        this.props.resetDailyNote();
    }

    noteSave = () => {
        const { calendarDetailDate, selectedRoom} = this.props;
        const dailyNote = this.state.dailyNote;
        this.props.updateDailyNote({appointmentDate:moment(this.state.calendarDetailDate).format(Enum.DATE_FORMAT_EYMD_VALUE),clinicRoomId:selectedRoom.rmId,notes:dailyNote.notes,version:dailyNote.version});
        //this.props.updateDailyNote({dailyNoteDto:this.state.dailyNote});
        // save to database
    }

    noteOnChange = (e) => {
        let newState = Object.assign({}, this.state.dailyNote);
        newState.notes = e.target.value;
        this.setState({dailyNote:newState});
        //this.props.setDailyNote({notes:e.target.value});
    }

    noteIsDisable = () => {
        const { calendarDetailDate, selectedRoom} = this.props;
        // console.log('calendarDetailDate',calendarDetailDate,'selectedRoom', JSON.stringify(selectedRoom));
        if(moment(calendarDetailDate).isValid() && selectedRoom) {
            return false;
        } else {
            return true;
        }
    }

    render(){
        const { classes, className, dailyNote, ...rest } = this.props;
        return (
            <DtsDailyNoteUi
                noteLabel={(typeof dailyNote.updateBy == 'undefined' && typeof dailyNote.updateDateTime == 'undefined') ?
                 'Daily Note' : 'Daily Note is updated' + (typeof dailyNote.updateBy == 'undefined' ? ' on ' + moment(dailyNote.updateDateTime).format(Enum.DATE_FORMAT_24) :
                 ' by ' + dailyNote.updateBy + (typeof dailyNote.updateDateTime == 'undefined' ? '' : ' on ' + moment(dailyNote.updateDateTime).format(Enum.DATE_FORMAT_24)))}
                noOfRows={1}
                noteValue={this.state.dailyNote.notes}
                noteSave={this.noteSave}
                noteOnChange={this.noteOnChange}
                noteIsDisable={this.noteIsDisable}
                saveBtn
            />
        );
    }

}

const mapStateToProps = (state) => {
    return {
        selectedRoom: state.dtsAppointmentAttendance.selectedRoom,
        dailyNote: state.dtsAppointmentAttendance.dailyNote,
        calendarDetailDate: state.dtsAppointmentAttendance.calendarDetailDate
    };
};

const mapDispatchToProps = {
    getDailyNote,
    updateDailyNote,
    resetDailyNote
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDailyNoteAttendance));