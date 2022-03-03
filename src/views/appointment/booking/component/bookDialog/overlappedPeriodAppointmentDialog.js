import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import CIMSDialog from '../../../../../components/Dialog/CIMSDialog';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { Grid } from '@material-ui/core';
import {PageStatus as pageStatusEnum} from '../../../../../enums/appointment/booking/bookingEnum';
import Enum from '../../../../../enums/enum';
import * as AppointmentUtilities from '../../../../../utilities/appointmentUtilities';
import {auditAction} from '../../../../../store/actions/als/logAction';

const styles = () => ({
    paper: {
        minWidth: '53%',
        maxWidth: '75%',
        overflowY: 'unset',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    textSqueeze: {
        fontWeight: 'bold',
        padding: '25px 0px 25px 0px'
    },
    textSqueeze2: {
        padding: '25px 0px 25px 0px'
    }
});

class overlappedPeriodAppointmentDialog extends Component {
    constructor(props) {
        super(props);
    }

    handReplaceAppointmentDialogClose = () => {
        this.props.auditAction('Close Overlapped Period Appointment Dialog',null,null,false,'ana');
        if(this.props.pageStatus === pageStatusEnum.EDIT) {
            this.props.updateState({ openSameDayAppointmentDialog: false });
        } else {
            this.props.resetReplaceAppointment();
            this.props.updateState({ pageStatus: pageStatusEnum.SELECTED });
        }
    }

    render() {
        const { classes, openSameDayAppointmentDialog, svcCd, siteId, clinicConfig } = this.props;

        // Control for overlapping appointment by service setting (Warning / Blocking)
        let siteParams = AppointmentUtilities.getOverlappingAppointmentSiteParamsByServiceCd(svcCd, clinicConfig);
        return (
            <CIMSDialog
                classes={{
                    paper: classes.paper
                }}
                id={'overlappedPeriodAppointmentDialog'}
                dialogTitle={'Overlapped Period Appointment'}
                open={openSameDayAppointmentDialog}
            >
            <FormControl>
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid item container justify="space-between">
                            <Grid item container xs={10} style={{ height: '30px', padding: '5px 5px 5px 5px' }} wrap="nowrap">
                                {
                                siteParams && !(siteParams.paramValue === Enum.OVERLAPPING_APPT_CONTRO.BLOCK) ?
                                    'There is an appointment with overlapped period. Would you like to proceed for booking?'
                                    :
                                    'The selected timeslot is booked by another appointment already. Please select another timeslot.'
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </FormControl>
            <DialogActions style={{ justify: 'flex-end', padding: 0 }}>
                {
                siteParams && !(siteParams.paramValue === Enum.OVERLAPPING_APPT_CONTRO.BLOCK)?
                    <CIMSButton
                        id={'squeeze_in' + name + 'button'}
                        onClick={() => {
                            this.props.auditAction('Confirm Still Proceed in Overlapped Period Appointment Dialog');
                            this.props.handStillAppointments();
                        }}
                    >
                        Still Proceed
                    </CIMSButton>
                    :
                    <></>
                }
                <CIMSButton
                    id={'squeeze_in' + name + 'button'}
                    onClick={this.handReplaceAppointmentDialogClose}
                >
                    Cancel
                </CIMSButton>
            </DialogActions>
            </CIMSDialog>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        participantList: state.ehr.participantList,
        loginName: state.login.loginInfo.loginName,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        accessRights: state.login.accessRights,
        siteCd: state.login.clinic.siteCd,
        svcCd: state.login.service.svcCd,
        clinicConfig: state.common.clinicConfig,
        siteId: state.login.clinic.siteId,
        pageStatus: state.bookingInformation.pageStatus
    };
};

const mapDispatchToProps = {
    auditAction
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(overlappedPeriodAppointmentDialog)));