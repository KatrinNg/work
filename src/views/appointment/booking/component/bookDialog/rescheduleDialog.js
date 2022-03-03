import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Select from '../../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../../components/TextField/FastTextFieldValidator';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import { updateState, getRescheduleReasons } from '../../../../../store/actions/appointment/booking/bookingAction';
import { PAGE_DIALOG_STATUS } from '../../../../../enums/appointment/booking/bookingEnum';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';
import {auditAction} from '../../../../../store/actions/als/logAction';

const styles = theme => ({
    dialogPaper: {
        width: '60%'
    }
});

const RescheduleDialog = (props) => {
    const { classes, pageDialogStatus, bookConfirm, bookingData, rescheduleReasonList } = props; //NOSONAR
    let formRef = React.useRef(null);

    React.useEffect(() => {
        props.getRescheduleReasons();
    }, []);

    const onChange = (obj) => {
        props.updateState({
            bookingData: {
                ...bookingData,
                ...obj
            }
        });
    };

    const rsnReason = rescheduleReasonList && rescheduleReasonList.find(x => x.rsnTypeId === bookingData.reschRsnTypeId);

    return (
        <CIMSPromptDialog
            id="booking_reschedule_appointment"
            open={pageDialogStatus === PAGE_DIALOG_STATUS.RESCHEDULE}
            dialogTitle={'Reschedule Appointment'}
            classes={{ paper: classes.dialogPaper }}
            dialogContentText={
                <ValidatorForm ref={formRef}>
                    <Grid container spacing={2}>
                        <Grid item container>
                            <Typography>Please enter the reason for rescheduling the appointment and confirm.</Typography>
                        </Grid>
                        <Grid item container>
                            <Select
                                id="booking_reschedule_reasonId"
                                options={rescheduleReasonList && rescheduleReasonList.map(item => ({
                                    value: item.rsnTypeId, label: item.rsnDesc
                                }))}
                                value={bookingData.reschRsnTypeId}
                                onChange={e => onChange({ reschRsnTypeId: e.value })}
                                TextFieldProps={{
                                    label: <>Reschedule Reason<RequiredIcon /></>,
                                    variant: 'outlined'
                                }}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item container>
                            <FastTextFieldValidator
                                id="booking_reschedule_otherReason"
                                variant="outlined"
                                multiline
                                rows="4"
                                value={bookingData.reschRsnRemark}
                                disabled={rsnReason && rsnReason.rsnName === 'OTH' ? false : true}
                                label="Other Reason"
                                onBlur={e => onChange({ reschRsnRemark: e.target.value })}
                                inputProps={{ maxLength: 200 }}
                                calActualLength
                            />
                        </Grid>
                    </Grid>
                </ValidatorForm>
            }
            buttonConfig={
                [
                    {
                        id: 'booking_reschedule_btnConfirm',
                        name: 'OK',
                        onClick: () => {
                            const formPromise = formRef.current.isFormValid(false);
                            formPromise.then(result => {
                                if(result){
                                    bookConfirm();
                                }
                            });
                         }
                    },
                    {
                        id: 'booking_reschedult_btnCancel',
                        name: 'Cancel',
                        onClick: () => {
                            props.auditAction('Cancel Reschedule Appointment',null,null,false,'ana');
                            props.updateState({
                                pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED,
                                bookingData: {
                                    ...bookingData,
                                    reschRsnTypeId: null,
                                    reschRsnRemark: null
                                }
                            });
                         }
                    }
                ]
            }
        />
    );
};

const mapState = (state) => {
    return {
        pageDialogStatus: state.bookingInformation.pageDialogStatus,
        bookingData: state.bookingInformation.bookingData,
        rescheduleReasonList: state.bookingInformation.rescheduleReasonList
    };
};

const mapDispatch = {
    updateState,
    getRescheduleReasons,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(RescheduleDialog));