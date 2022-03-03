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
            handleOnChange,
            codeList
        } = this.props;
        const { transferOutForm } = this.props;

        return (
            <Grid container item xs={12} spacing={2} className={classes.root}>
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
                        id="transferOut_reason"
                        options={codeList.spp_xfer_Out_reason.map(item => (
                            { value: item.otherId, label: item.engDesc }
                        ))}
                        TextFieldProps={{
                            variant: 'outlined',
                            label: <>Reason<RequiredIcon /></>
                        }}
                        value={transferOutForm.reason}
                        onChange={e => handleOnChange(e.value, 'reason')}
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        absoluteMessage
                    />
                </Grid>
                {
                    transferOutForm.reason === 80010 ?
                    <Grid container item xs={12} className={classes.formItem}>
                        <Grid item xs={6} >
                            <SelectFieldValidator
                                id="transferOut_nation"
                                options={codeList.spp_xfer_out_nation.map(item => (
                                    { value: item.otherId, label: item.engDesc }
                                ))}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Nation<RequiredIcon /></>
                                }}
                                value={transferOutForm.nation}
                                onChange={e => handleOnChange(e.value, 'nation')}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                absoluteMessage
                            />
                        </Grid>
                    </Grid>
                    : null
                }
                {
                    transferOutForm.reason === 81352 || transferOutForm.reason === 81351 ?
                    <Grid item xs={12} className={classes.formItem}>
                        <SelectFieldValidator
                            id="transferOut_transfer_detail"
                            options={transferOutForm.reason === 81352 ? codeList.spp_xfer_out_clinic_detl.map(item => (
                                { value: item.otherId, label: item.engDesc }
                            )): transferOutForm.reason === 81351 ? codeList.spp_xfer_out_hospital_detl.map(item => (
                                { value: item.otherId, label: item.engDesc }
                            )) : null}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Transfer Detail<RequiredIcon /></>
                            }}
                            value={transferOutForm.transferDetail}
                            onChange={e => handleOnChange(e.value, 'transferDetail')}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            absoluteMessage
                        />
                    </Grid> : null
                }
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
                <Grid item xs={12} >
                    <FastTextFieldValidator
                        id="transferOut_remarks"
                        label={<>Remarks</>}
                        fullWidth
                        calActualLength
                        inputProps={{ maxLength: 2000 }}
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
        const { classes, isOpen, title } = this.props;
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
                            id: 'transferOut_saveBtn',
                            name: 'Save',
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
        codeList: state.common.commonCodeList
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TransferOutDialog));