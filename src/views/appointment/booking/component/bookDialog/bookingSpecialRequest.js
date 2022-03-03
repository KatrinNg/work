import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import {
    updateSpecReqState, insertSpecReq, updateSpecReq
} from '../../../../../store/actions/appointment/booking/bookingAction';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import OutlinedRadioValidator from '../../../../../components/FormValidator/OutlinedRadioValidator';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import moment from 'moment';
import {auditAction} from '../../../../../store/actions/als/logAction';

class BookingSpecialRequest extends React.Component {

    componentWillUnmount() {

    }
    handleSpecReqUpdate = () => {
        const formValid = this.refs.specReqFormRef.isFormValid(false);
        formValid.then(result => {
            if (result) {
                let { type, notes, appointmentId, isInsert, specialRqstId, version
                } = this.props.specialRequestInfo;
                if (isInsert) {
                    let insertParams = {
                        apptId: appointmentId,
                        specialRqstTypeId: type,
                        remark: notes
                    };
                    this.props.insertSpecReq(insertParams, (data) => {
                        this.props.updateSpecReqState({
                            open: false,
                            type: '',
                            notes: '',
                            specialRqstId: 0,
                            version: null,
                            appointmentId: 0,
                            isInsert: false,
                            appointmentDate: null
                        });
                        this.props.refreshListAppointment(data);
                    });
                } else {
                    let updateParmas = {
                        apptId: appointmentId,
                        specialRqstId: specialRqstId,
                        specialRqstTypeId: type,
                        remark: notes,
                        version: version
                    };
                    this.props.updateSpecReq(updateParmas, (data) => {
                        this.props.updateSpecReqState({
                            open: false,
                            type: '',
                            notes: '',
                            specialRqstId: 0,
                            version: null,
                            appointmentId: 0,
                            isInsert: false,
                            appointmentDate: null
                        });
                        this.props.refreshListAppointment(data);
                    });
                }
            }
        });


    }

    handleSpecReqFieldChange = (name, e) => {
        let stateData = { ...this.props.specialRequestInfo };
        if (name === 'type') {
            stateData[name] = parseInt(e.target.value);
        } else {
            stateData[name] = e.target.value;
        }
        this.props.updateSpecReqState({ ...stateData });
    }

    render() {
        const { classes, specReqTypesList } = this.props;
        const typesList = specReqTypesList && specReqTypesList.map((item) => { return { value: item.specialRqstTypeId, label: item.specialRqstDesc }; });
        const { open, type, notes, isInsert, appointmentDate } = this.props.specialRequestInfo;
        return (
            <CIMSPromptDialog
                open={open}
                id={'specialRequest'}
                dialogTitle={'Special Request'}
                paperStyl={classes.paper}
                dialogContentText={
                    <div>
                        <Grid container spacing={1} className={classes.root}>

                            <Grid item container direction="column" xs={12}>
                                <ValidatorForm ref="specReqFormRef" onSubmit={this.handleSpecReqUpdate} >
                                    <OutlinedRadioValidator
                                        id="radioGroup_appointment_specReq"
                                        name="appointmentSpecReq"
                                        value={type}
                                        onChange={e => this.handleSpecReqFieldChange('type', e)}
                                        list={typesList}
                                        RadioGroupProps={{ className: classes.radioGroup }}
                                        FormControlLabelProps={{ className: classes.FormControlLabelProps }}
                                        labelText="Type"
                                        isRequired
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                    />
                                    <Grid item container spacing={1} style={{ marginTop: 20 }}>
                                        <Grid item container>
                                            <FastTextFieldValidator
                                                id={'booking_select_appointment_booking_specialRequest_note'}
                                                fullWidth
                                                value={notes}
                                                multiline
                                                rows="5"
                                                onBlur={e => this.handleSpecReqFieldChange('notes', e)}
                                                calActualLength
                                                label={<>Notes</>}
                                                inputProps={{ maxLength: 500 }}
                                                disabled={appointmentDate && moment(appointmentDate).isBefore(moment(), 'day')}
                                            />
                                        </Grid>
                                    </Grid>
                                </ValidatorForm>

                            </Grid>

                        </Grid>
                    </div>
                }
                buttonConfig={
                    [
                        {
                            id: 'specialRequest_save',
                            name: isInsert ? 'Add' : 'Save',
                            disabled: appointmentDate && moment(appointmentDate).isBefore(moment(), 'day'),
                            onClick: () => {
                                this.props.auditAction(`${isInsert ? 'Add' : 'Save'} special request`);
                                this.refs.specReqFormRef.submit();
                            }
                        },
                        {
                            id: 'specialRequest_cancel',
                            name: 'Cancel',
                            onClick: () => {
                                this.props.auditAction('Cancel add/edit special request', null, null, false, 'ana');

                                this.props.updateSpecReqState({
                                    open: false,
                                    type: '',
                                    notes: '',
                                    specialRqstId: 0,
                                    version: null,
                                    appointmentId: 0,
                                    isInsert: false,
                                    appointmentDate: null
                                });
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
        specialRequestInfo: state.bookingInformation.specialRequestInfo,
        specReqTypesList: state.bookingInformation.specReqTypesList
    });
};

const mapDispatchtoProps = {
    updateSpecReqState,
    insertSpecReq,
    updateSpecReq,
    auditAction
};

const styles = theme => ({
    root: {
        padding: 4
    },
    maintitleRoot: {
        paddingTop: 6,
        fontSize: '14pt',
        fontWeight: 600
    },
    marginTop20: {
        marginTop: 6
    },
    radioGroup: {
        padding: '20px 20px 0px 24px',
        height: 'auto',
        flexDirection: 'column'
    },
    gridTitle: {
        padding: '4px 0px'
    },
    buttonRoot: {
        margin: 2,
        padding: 0,
        height: 35
    },
    paper: {
        minWidth: 600,
        maxWidth: '100%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    FormControlLabelProps: {
        marginBottom: 20
    }
});


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(BookingSpecialRequest));