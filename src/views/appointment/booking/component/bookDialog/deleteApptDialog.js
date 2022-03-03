import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import FastTextField from '../../../../../components/TextField/FastTextField';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CommonMessage from '../../../../../constants/commonMessage';

class DeleteApptDialog extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {
            id,
            classes,
            open,
            deleteReasonsList,
            deleteReasonType,
            deleteReasonText,
            onChange,
            onDelete,
            onCancel
        } = this.props;

        return (
            <CIMSPromptDialog
                open={open ? true : false}
                id={`${id}_deleteReasonDialog`}
                dialogTitle={'Delete Appointment'}
                classes={{ paper: classes.dialogPaper2 }}
                dialogContentText={
                    <ValidatorForm ref={r => this.deleteFormRef = r}>
                        <Grid container spacing={2}>
                            <Grid item container xs={12}>
                                <Typography>Please enter the reason for deleting the appointment and confirm.</Typography>
                            </Grid>
                            <Grid item container xs={12}>
                                <SelectFieldValidator
                                    id={`${id}_deleteReasonDialog_deleteReasonType`}
                                    value={deleteReasonType}
                                    options={deleteReasonsList && deleteReasonsList.map(item => (
                                        { value: item.rsnTypeId, label: `${item.rsnDesc}` }
                                    ))}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: <>Reason<RequiredIcon /></>//'Reason'
                                    }}
                                    onChange={e => onChange(e.value, 'deleteReasonType')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                />
                            </Grid>
                            <Grid item container xs={12}>
                                <FastTextField
                                    id={`${id}_deleteReasonDialog_deleteReasonText`}
                                    fullWidth
                                    value={deleteReasonText}
                                    inputProps={{ maxLength: 500 }}
                                    label="Remarks"
                                    calActualLength
                                    multiline
                                    rows="4"
                                    onBlur={e => onChange(e.target.value, 'deleteReasonText')}
                                />
                            </Grid>
                        </Grid>
                    </ValidatorForm>
                }
                buttonConfig={
                    [
                        {
                            id: `${id}_deleteReasonDialog_delete`,
                            name: 'Delete',
                            disabled: deleteReasonType == '',
                            onClick: () => {
                                const valid = this.deleteFormRef && this.deleteFormRef.isFormValid(false);
                                valid.then(result => {
                                    if(result) {
                                        onDelete();
                                    }
                                });
                            }
                        },
                        {
                            id: `${id}_deleteReasonDialog_cancel`,
                            name: 'Cancel',
                            onClick: () => { onCancel(); }
                        }
                    ]
                }
            />);
    }
}

const styles = theme => ({
    dialogPaper2: {
        minWidth: '50%',
        maxWidth: '50%'
    }
});

export default withStyles(styles)(DeleteApptDialog);