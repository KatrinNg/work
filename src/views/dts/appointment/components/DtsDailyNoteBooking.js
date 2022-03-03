import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import DtsDailyNoteUi from './DtsDailyNoteUi';

import {
    getDailyNote,
    updateDailyNote,
    resetDailyNote,
    setIsUpdated
} from '../../../../store/actions/dts/appointment/bookingAction';

const styles = {
    root:{
        padding:'10px'
    }
};



class DtsDailyNoteBooking extends Component {

    constructor(props){
        super(props);

        this.state = {
            dailyNote:{},
            initDailyNote:''
        };
    }
    componentDidUpdate = (prevProps) => {
        if(this.props.selectedRoom && this.props.selectedRoom.rmId && this.props.calendarDetailDate &&
        (prevProps.selectedRoom != this.props.selectedRoom || prevProps.calendarDetailDate != this.props.calendarDetailDate)){
            this.props.getDailyNote({clinicRoomId:this.props.selectedRoom.rmId, appointmentDate:this.props.calendarDetailDate});
        }
        if(this.props.dailyNote != prevProps.dailyNote) {
            this.setState({dailyNote:this.props.dailyNote});
        }
    }

    componentWillUnmount() {
        this.props.resetDailyNote();
    }

    noteOnChange = (e) => {
        //console.log('dailyNote',JSON.stringify(this.state.dailyNote));
            let newState = Object.assign({}, this.state.dailyNote);
            newState.notes = e.target.value;
            this.setState({dailyNote:newState});
    }

    noteSave = () => {
        const { calendarDetailDate, selectedRoom} = this.props;
        const dailyNote = this.state.dailyNote;
        this.props.updateDailyNote({appointmentDate:calendarDetailDate,clinicRoomId:selectedRoom.rmId,notes:dailyNote.notes,version:dailyNote.version});
        this.props.setIsUpdated({isUpdated:false});
    }

    noteOnFocus = (e) => {
        this.setState({initDailyNote:e.target.value});
    }

    noteOnBlur = (e) => {
        if(e.target.value != this.state.initDailyNote) {
            this.props.setIsUpdated({isUpdated:true});
        }

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
        const { classes, className,dailyNote,splitList, ...rest } = this.props;

        return (
            <Paper className={classes.root} variant="outlined" square>
                <DtsDailyNoteUi
                    noteLabel={'Daily Note'}
                    noOfRows={2}
                    noteValue={this.state.dailyNote.notes}
                    noteSave={this.noteSave}
                    noteOnChange={this.noteOnChange}
                    noteOnFocus={this.noteOnFocus}
                    noteOnBlur={this.noteOnBlur}
                    noteIsDisable={this.noteIsDisable}
                    saveBtn
                    splitMenu
                    splitBtnOnClick={item => this.props.splitBtnOnClick(item)}
                    splitList={splitList}
                />
            </Paper>
        );
    }

}

const mapStateToProps = (state) => {
    // console.log();
    // console.log(state.dtsAppointmentBooking.calendarDetailDate);
    return {
        selectedRoom: state.dtsAppointmentBooking.pageLevelState.selectedRoom,
        dailyNote: state.dtsAppointmentBooking.pageLevelState.dailyNote,
        calendarDetailDate: state.dtsAppointmentBooking.pageLevelState.calendarDetailDate
    };
};

const mapDispatchToProps = {
    getDailyNote,
    updateDailyNote,
    resetDailyNote,
    setIsUpdated
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDailyNoteBooking));