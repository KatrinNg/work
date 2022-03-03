import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, withStyles } from '@material-ui/core';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import DateFieldValidator from '../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import Enum from '../../enums/enum';
import FastDatePicker from '../../components/DatePicker/FastDatePicker';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';

const styles = () => ({
    root: {
        paddingBottom: 40
    },
    dialog: {
        width: '50%'
    },
    formItem: {
        marginBottom: 5
    }
});

class TransferOutDialog extends Component {

    renderContent = () => {
        const {
            classes,
            clinicList,
            handleOnChange
        } = this.props;
        const { transferOutForm } = this.props;

        return (
            <Grid container item xs={12} spacing={2} className={classes.root}>
                <Grid item xs={12} className={classes.formItem}>
                    <FastTextFieldValidator
                        id={'transferOut_staffName'}
                        value={transferOutForm.staffName}
                        variant="outlined"
                        label={<>Staff Name</>}
                        onChange={null}
                        disabled
                    />
                </Grid>
                <Grid item xs={12} className={classes.formItem}>
                    <FastTextFieldValidator
                        id="transferOut_reason"
                        variant="outlined"
                        label={<> Record ID<RequiredIcon /></>}
                        fullWidth
                        calActualLength
                        inputProps={{ maxLength: 50 }}
                        value={transferOutForm.recordID}
                        onChange={e => handleOnChange(e.target.value, 'recordID')}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        absoluteMessage
                    />
                </Grid>
                <Grid item xs={12} className={classes.formItem}>
                    <FastTextFieldValidator
                        id={'transferOut_originalLocation'}
                        value={transferOutForm.originalLocation}
                        variant="outlined"
                        label={<>Original Location</>}
                        onChange={null}
                        disabled
                    />
                </Grid>
                <Grid item xs={12} className={classes.formItem}>
                    <SelectFieldValidator
                        id="transferOut_transferTo"
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Transfer To<RequiredIcon /></>
                        }}
                        options={clinicList.map(item => ({ value: item.siteId, label: item.clinicName }))}
                        value={transferOutForm.transferTo}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        onChange={e => handleOnChange(e.value, 'transferTo')}
                        absoluteMessage
                    />
                </Grid>
                <Grid container item xs={12} className={classes.formItem}>
                    <Grid item xs={6} >
                        <FastDatePicker
                            id="transferOut_transferDate"
                            label={<>Transfer Date<RequiredIcon /></>}
                            value={transferOutForm.transferDate}
                            validByBlur
                            onBlur={value => handleOnChange(value, 'transferDate')}
                            onAccept={value => handleOnChange(value, 'transferDate')}
                            format={Enum.DATE_FORMAT_EDMY_VALUE}
                            component={DateFieldValidator}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            absoluteMessage
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} className={classes.formItem}>
                    <FastTextFieldValidator
                        id="transferOut_reason"
                        label={<>Reason<RequiredIcon /></>}
                        fullWidth
                        calActualLength
                        inputProps={{ maxLength: 1000 }}
                        value={transferOutForm.reason}
                        multiline
                        rows="4"
                        onChange={e => handleOnChange(e.target.value, 'reason')}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        absoluteMessage
                    />
                </Grid>
                <Grid item xs={12} >
                    <FastTextFieldValidator
                        id="transferOut_remarks"
                        label={<>Remarks</>}
                        fullWidth
                        calActualLength
                        inputProps={{ maxLength: 1000 }}
                        value={transferOutForm.remarks}
                        multiline
                        rows="4"
                        onChange={e => handleOnChange(e.target.value, 'remarks')}
                        absoluteMessage
                    />
                </Grid>
            </Grid>
        );
    }

    render() {
        const { classes, isOpen, title, selected } = this.props;

        return (
            <CIMSPromptDialog
                id={'transferOutDialog'}
                classes={{
                    paper: classes.dialog
                }}
                open={isOpen}
                dialogTitle={title}
                dialogContentText={this.renderContent()}
                buttonConfig={
                    [
                        {
                            id: 'transferOut_updateBtn',
                            name: selected ? 'Update' : 'Create',
                            onClick: this.props.handleSave
                        },
                        {
                            id: 'transferOut_cancelBtn',
                            name: 'Cancel',
                            onClick: this.props.handleCancel
                        }
                    ]
                }
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TransferOutDialog));