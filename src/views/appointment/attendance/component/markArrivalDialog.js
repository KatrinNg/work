import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import ValidatorForm from 'components/FormValidator/ValidatorForm';
import CIMSPromptDialog from 'components/Dialog/CIMSPromptDialog';
import {
    updateField,
    markArrival
} from '../../../../store/actions/attendance/attendanceAction';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import moment from 'moment';
import Enum from '../../../../enums/enum';

class MarkArrivalDialog extends React.Component {

    state = {
        currentTime: moment()
    }

    componentDidMount() {
        this.setState({ currentTime: moment() });
    }

    handleMarkArrivalSubmit = () => {
        const formValid = this.refs.markArrivalFormRef.isFormValid(false);

        formValid.then(result => {
            if (result) {
                let params = {
                    apptId: this.props.currentAppointment.appointmentId,
                    apptVersion: this.props.currentAppointment.version,
                    arrivalTime: this.state.currentTime.format(Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                    discNum: this.props.markArrivalDisNum,
                    isRealtime: true,
                    siteId: this.props.siteId,
                    svcCd: this.props.serviceCd,
                    patientKey: this.props.patientInfo.patientKey
                };
                this.props.markArrival(params, () => {
                    this.props.updateField({ markArrivalDialogOpen: false, markArrivalDisNum: '' });
                    this.props.refreshAttendancePage();
                });
            }
        });
    }

    handleChange = (name, e) => {
        let stateData = { markArrivalDisNum: this.props.markArrivalDisNum };
        stateData[name] = e.target.value;
        this.props.updateField({ ...stateData });
    }

    render() {
        const { classes, open, markArrivalDisNum } = this.props;
        const { currentTime } = this.state;
        return (
            <CIMSPromptDialog
                open={open}
                id={'markArrival'}
                dialogTitle={'Mark Arrival'}
                paperStyl={classes.paper}
                dialogContentText={
                    <div>
                        <Grid item container xs={12} style={{ marginBottom: 20, marginTop: 20 }}>
                            Please confirm the arrival. You can optionally input the disc number
                            </Grid>

                        <Grid item container xs={6} style={{ marginBottom: 20 }}>
                            <span style={{ fontWeight: 'bold' }}>Time: </span><span>{currentTime.format('HH:mm:ss')}</span>
                        </Grid>
                        <Grid item container xs={6}>
                            <ValidatorForm ref="markArrivalFormRef" onSubmit={this.handleMarkArrivalSubmit} >
                                <Grid item container>
                                    <FastTextFieldValidator
                                        id={'markArrival_disNo'}
                                        value={markArrivalDisNum}
                                        onBlur={e => this.handleChange('markArrivalDisNum', e)}
                                        calActualLength
                                        label={<>Disc Number</>}
                                        inputProps={{ maxLength: 500 }}
                                    />
                                </Grid>
                            </ValidatorForm>
                        </Grid>
                    </div>
                }
                buttonConfig={
                    [
                        {
                            id: 'markArrival_confirm',
                            name: 'Confirm Arrival',
                            onClick: () => {
                                this.refs.markArrivalFormRef.submit();
                            }
                        },
                        {
                            id: 'markArrival_cancel',
                            name: 'Cancel',
                            onClick: () => {
                                this.props.updateField({ markArrivalDialogOpen: false, markArrivalDisNum: '' });
                            }
                        }
                    ]
                }
            />
        );
    }
}


const mapStatetoProps = (state) => {
    return ({
        markArrivalDisNum: state.attendance.markArrivalDisNum,
        siteId: state.login.clinic.siteId,
        serviceCd: state.login.service.serviceCd,
        currentAppointment: state.attendance.currentAppointment,
        patientInfo: state.patient.patientInfo
    });
};

const mapDispatchtoProps = {
    updateField,
    markArrival
};

const styles = theme => ({
    root: {
        padding: 4
    },
    paper: {
        minWidth: 600,
        maxWidth: '100%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    }
});


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(MarkArrivalDialog));