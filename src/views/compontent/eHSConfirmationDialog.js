import { Grid, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../components/Dialog/CIMSPromptDialog';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import _ from 'lodash';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';

const useStyles = makeStyles(theme => ({
    dialogPaper: {
        width: '30%'
    },
    total: {
        paddingTop: '10px',
        marginTop: '10px',
        borderTop: '1px #e0e0e0 solid'
    },
    topMarginAdjustment: {
        paddingTop: '10px',
        marginTop: '10px',
        borderTop: '1px #e0e0e0 solid'
    },
    errMsg: {
        color: '#fd0000',
        padding: '2px 14px',
        fontSize: 12
    }
}));

const EHSConfirmationDialog = props => {

    let confirmationFormRef = React.useRef(null);
    const classes = useStyles();
    const ehsLabelSetting = JSON.parse(localStorage.getItem("ehsLabelSetting"));
    const initConfirmationForm = {
        labelFormLabel: (ehsLabelSetting && ehsLabelSetting.labelFormLabel) === 0 ? 0 : ((ehsLabelSetting && ehsLabelSetting.labelFormLabel) || 12),
        redBookLabel: (ehsLabelSetting && ehsLabelSetting.redBookLabel) === 0 ? 0 : ((ehsLabelSetting && ehsLabelSetting.redBookLabel) || 16),
        coverofTheMedicalRecord: (ehsLabelSetting && ehsLabelSetting.coverofTheMedicalRecord) === 0 ? 0 : ((ehsLabelSetting && ehsLabelSetting.coverofTheMedicalRecord) || 4),
        cornerOfTheMedicalRecord: (ehsLabelSetting && ehsLabelSetting.cornerOfTheMedicalRecord) === 0 ? 0 : ((ehsLabelSetting && ehsLabelSetting.cornerOfTheMedicalRecord) || 1),
        topMarginAdjustment: (ehsLabelSetting && ehsLabelSetting.topMarginAdjustment) === 0 ? 0 : ((ehsLabelSetting && ehsLabelSetting.topMarginAdjustment) || 0)
    };
    const [confirmationForm, setConfirmationForm] = useState({
        size: 33,
        total: parseInt(initConfirmationForm.labelFormLabel) + parseInt(initConfirmationForm.redBookLabel) + parseInt(initConfirmationForm.coverofTheMedicalRecord) + parseInt(initConfirmationForm.cornerOfTheMedicalRecord),
        ...initConfirmationForm
    });

    const {
        id,
        open,
        handleConfirm,
        handleCancel
    } = props;

    const handleOnChange = (value, name) => {
        let _confirmationForm = _.cloneDeep(confirmationForm);
        _confirmationForm[name] = value === '' ? 0 : value;
        if (name === 'labelFormLabel' || name === 'redBookLabel' || name === 'coverofTheMedicalRecord' || name === 'cornerOfTheMedicalRecord') {
            _confirmationForm.total = parseInt(_confirmationForm.labelFormLabel) + parseInt(_confirmationForm.redBookLabel) + parseInt(_confirmationForm.coverofTheMedicalRecord) + parseInt(_confirmationForm.cornerOfTheMedicalRecord);
        }
        setConfirmationForm(_confirmationForm);
    };

    const handleClickYes = () => {
        let confirmationFormValid = confirmationFormRef.isFormValid(false);
        confirmationFormValid.then(result => {
            if (result) {
                if (confirmationForm.size === 33) {
                    let ehsLabelSetting = {
                        labelFormLabel: confirmationForm.labelFormLabel,
                        redBookLabel: confirmationForm.redBookLabel,
                        coverofTheMedicalRecord: confirmationForm.coverofTheMedicalRecord,
                        cornerOfTheMedicalRecord: confirmationForm.cornerOfTheMedicalRecord,
                        topMarginAdjustment: confirmationForm.topMarginAdjustment
                    };
                    window.localStorage.setItem('ehsLabelSetting', JSON.stringify(ehsLabelSetting));
                } else {
                    let ehsLabelSetting = {
                        ...initConfirmationForm,
                        topMarginAdjustment: confirmationForm.topMarginAdjustment
                    };
                    window.localStorage.setItem('ehsLabelSetting', JSON.stringify(ehsLabelSetting));
                }
                handleConfirm(confirmationForm);
            } else {
                confirmationFormRef.focusFail();
            }
        });
    };

    const confirmationFormInvalid = confirmationForm.size === 33 && confirmationForm.total > confirmationForm.size;

    return (
        <CIMSPromptDialog
            open={open}
            dialogTitle={'Confirmation'}
            classes={{
                paper: classes.dialogPaper
            }}
            dialogContentText={
                <ValidatorForm ref={r => confirmationFormRef = r}>
                    <Grid container>
                        <Grid container justify="center" style={{ marginTop: 20 }}>Please customize your label</Grid>
                        <Grid container alignItems="center" style={{ marginTop: 30 }}>
                            <Grid container item xs={6} justify="center">
                                Size
                            </Grid>
                            <Grid container item xs={4}>
                                <SelectFieldValidator
                                    options={[
                                        { value: 33, label: '3 × 11' },
                                        { value: 44, label: '4 × 11' }
                                    ]}
                                    id={id + '_size'}
                                    value={confirmationForm.size}
                                    onChange={e => handleOnChange(e.value, 'size')}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    absoluteMessage
                                />
                            </Grid>
                        </Grid>
                        {
                            confirmationForm.size === 33 ? <><Grid container alignItems="center" style={{ marginTop: 10 }}>
                                <Grid container item xs={6} justify="center">
                                    Lab Form Label
                                </Grid>
                                <Grid container item xs={4}>
                                    <FastTextFieldValidator
                                        id={`${id}_labelFormLabel`}
                                        variant="outlined"
                                        type="number"
                                        value={confirmationForm.labelFormLabel}
                                        onBlur={e => handleOnChange(e.target.value, 'labelFormLabel')}
                                    />
                                </Grid>
                            </Grid>
                                <Grid container alignItems="center" style={{ marginTop: 10 }}>
                                    <Grid container item xs={6} justify="center">
                                        Red Book Label
                                    </Grid>
                                    <Grid container item xs={4}>
                                        <FastTextFieldValidator
                                            id={`${id}_redBookLabel`}
                                            variant="outlined"
                                            type="number"
                                            value={confirmationForm.redBookLabel}
                                            onBlur={e => handleOnChange(e.target.value, 'redBookLabel')}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container alignItems="center" style={{ marginTop: 10 }}>
                                    <Grid container item xs={6} justify="center">
                                        Cover of the medical record
                                    </Grid>
                                    <Grid container item xs={4}>
                                        <FastTextFieldValidator
                                            id={`${id}_coverofTheMedicalRecord`}
                                            variant="outlined"
                                            type="number"
                                            value={confirmationForm.coverofTheMedicalRecord}
                                            onBlur={e => handleOnChange(e.target.value, 'coverofTheMedicalRecord')}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container alignItems="center" style={{ marginTop: 10 }}>
                                    <Grid container item xs={6} justify="center">
                                        Corner of the medical record
                                    </Grid>
                                    <Grid container item xs={4}>
                                        <FastTextFieldValidator
                                            id={`${id}_cornerOfTheMedicalRecord`}
                                            variant="outlined"
                                            type="number"
                                            value={confirmationForm.cornerOfTheMedicalRecord}
                                            onBlur={e => handleOnChange(e.target.value, 'cornerOfTheMedicalRecord')}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container alignItems="center" className={classes.total}>
                                    <Grid container item xs={6} justify="center">
                                        Total
                                    </Grid>
                                    <Grid container item xs={4}>
                                        <FastTextFieldValidator
                                            id={id + '_total'}
                                            value={confirmationForm.total}
                                            variant="outlined"
                                            onChange={null}
                                            disabled
                                        />
                                    </Grid>
                                    {
                                        confirmationFormInvalid ?
                                            <Grid container justify="center" alignItems="center" style={{ marginTop: 10 }}>
                                                <Typography className={classes.errMsg}>
                                                    {'The total number of label is exceed the maximum (33) requirement.'}
                                                </Typography>
                                            </Grid> : null
                                    }
                                </Grid>
                            </> : null
                        }
                        <Grid container alignItems="center" className={classes.topMarginAdjustment}>
                            <Grid container item xs={6}>
                                Top Margin Adjustment
                            </Grid>
                            <Grid container item xs={4}>
                                <FastTextFieldValidator
                                    id={`${id}_topMarginAdjustment`}
                                    variant="outlined"
                                    type="number"
                                    allowNegative
                                    value={confirmationForm.topMarginAdjustment}
                                    onChange={(e) => {
                                        if ((parseInt(e.target.value) < -1000 || parseInt(e.target.value) > 1000)) {
                                            e.target.value = confirmationForm.topMarginAdjustment;
                                        } else {
                                            let _confirmationForm = _.cloneDeep(confirmationForm);
                                            _confirmationForm.topMarginAdjustment = e.target.value;
                                            setConfirmationForm(_confirmationForm);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        let _confirmationForm = _.cloneDeep(confirmationForm);
                                        _confirmationForm.topMarginAdjustment = parseInt(e.target.value === '' ? 0 : e.target.value);
                                        setConfirmationForm(_confirmationForm);
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>
            }
            buttonConfig={
                [
                    {
                        id: `${id}_Yes`,
                        name: 'YES',
                        disabled: confirmationFormInvalid,
                        onClick: handleClickYes
                    },
                    {
                        id: `${id}_No`,
                        name: 'NO',
                        onClick: handleCancel
                    }
                ]
            }
        />
    );
};

export default EHSConfirmationDialog;