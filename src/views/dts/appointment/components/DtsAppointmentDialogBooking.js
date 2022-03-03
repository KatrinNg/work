import React, { Component } from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';

import moment from 'moment';
import _ from 'lodash';

import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import DtsAppointmentDialog from './DtsAppointmentDialog';
import * as dtsBookingConstant from '../../../../constants/dts/appointment/DtsBookingConstant';

const styles = () => ({
});

class DtsAppointmentDialogBooking extends Component {

    checkValidationBeforeOpenDailog = () => {
        if(this.props.generalAppointmentObjList.length != 0)
            return true;
        else
        {
            // go back to single booking mode
            if(this.props.bookingMode == dtsBookingConstant.DTS_BOOKING_MODE_UPDATE_APPT)
                this.props.setBookingMode(dtsBookingConstant.DTS_BOOKING_MODE_APPT);

            // show warning message
            this.props.openCommonMessage({
                msgCode: '140010',
                showSnackbar: true,
                variant: 'warning'
            });
            this.props.closeConfirmDialog();
        }
    }

    render(){
        const {patientInfo, selectedDailyViewTimeslotList, selectedClinic, ...rest} = this.props;
        return(
            this.checkValidationBeforeOpenDailog() ?
                <DtsAppointmentDialog
                    patientInfo={patientInfo}
                    selectedDailyViewTimeslotList={selectedDailyViewTimeslotList}
                    id={'bookingDtsAppointmentDialog'}
                    openConfirmDialog={this.props.openConfirmDialog}
                    closeConfirmDialog={this.props.closeConfirmDialog}
                    selectedClinic={selectedClinic}
                    setBookingMode={this.props.setBookingMode}
                    bookingMode={this.props.bookingMode}

                    generalAppointmentObjList={this.props.generalAppointmentObjList}
                    updateGeneralAppointmentObjList={this.props.updateGeneralAppointmentObjList}
                    removeFromGeneralAppointmentObjList={this.props.removeFromGeneralAppointmentObjList}
                    confirmOverallAppointmentDialog={this.props.confirmOverallAppointmentDialog}
                    cancelOverallAppointmentDialog={this.props.cancelOverallAppointmentDialog}

                    newDefaultRoomId={this.props.newDefaultRoomId}
                    setDefaultRoomId={this.props.setDefaultRoomId}

                    referralListForPatient={this.props.referralListForPatient}
                />
            :
                <></>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        selectedDailyViewTimeslotList: state.dtsAppointmentBooking.selectedDailyViewTimeslotList,
        selectedClinic:state.dtsAppointmentBooking.pageLevelState.selectedClinic
    };
};

const mapDispatchToProps = {
    openCommonMessage
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAppointmentDialogBooking));
