import React, { Component } from 'react';
import { connect } from 'react-redux';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';

class DtsReassignUrgentAppointmentDialog extends Component {
    constructor(props) {
        super(props);
    }

    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    render() {
        const { openConfirmDialog, patientInfo, action, appointmentId } = this.props;
        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogContentProps={{ style: { width: 400 } }}
                dialogContentText={'DtsReassignUrgentAppointmentDialog, Patient Key: ' + patientInfo.patientKey + ', action: ' + action + ', Appointment Id: ' + appointmentId}
                buttonConfig={[
                    {
                        name: 'Cancel',
                        onClick: this.handleClose
                    }
                ]}
            />
        );
    }
}
function mapStateToProps(state) {
    return {
        patientInfo: state.patient.patientInfo,
        action: state.dtsPatientSummary.redirect.action,
        appointmentId: state.dtsPatientSummary.redirect.appointmentId
    };
}
export default connect(mapStateToProps)(DtsReassignUrgentAppointmentDialog);
