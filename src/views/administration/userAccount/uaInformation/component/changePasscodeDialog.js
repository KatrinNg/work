import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { Grid, Typography } from '@material-ui/core';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import CIMSPromptDialog from 'components/Dialog/CIMSPromptDialog';
import { updateState } from '../../../../../store/actions/administration/userAccount/userAccountAction';
import _ from 'lodash';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import { auditAction } from '../../../../../store/actions/als/logAction';
import PassCodeInputNoHint from './passCodeInputNoHint';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';
import CommonMessage from '../../../../../constants/commonMessage';

class ChangePasscodeDialog extends React.Component {

    componentDidMount() {
        ValidatorForm.addValidationRule(ValidatorEnum.isSamePasscode, () => {
            const changePasscodeDialogInfo = _.cloneDeep(this.props.changePasscodeDialogInfo);
            if (changePasscodeDialogInfo.passCode !== '' && changePasscodeDialogInfo.rePassCode !== '') {
                let result = (changePasscodeDialogInfo.passCode !== changePasscodeDialogInfo.rePassCode);
                return !result;
            }
            else {
                return true;
            }
        });
    }


    handleSubmitChangePasscode = () => {
        const formValid = this.refs.changePasscodeFormRef.isFormValid(false);
        formValid.then(result => {
            if (result) {
                this.props.handleSubmitChangePasscode();
            }
        });
    }

    render() {
        const { classes, changePasscodeDialogInfo, updateState } = this.props;

        return (
            <CIMSPromptDialog
                open
                id={'caseIndicator'}
                dialogTitle={'Change Passcode'}
                paperStyl={classes.paper}
                dialogContentText={
                    <div>
                        <Grid container spacing={1} className={classes.root}>
                            <ValidatorForm ref="changePasscodeFormRef" onSubmit style={{ width: '100%' }}>
                                <Grid item container xs={12} style={{ marginTop: 10 }}>
                                    <Grid item xs={4} style={{ textAlign: 'end' }}>
                                        <Typography variant="subtitle1">Login Name:</Typography>
                                    </Grid>
                                    <Grid item xs={1} />
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle1">{changePasscodeDialogInfo.userName}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid item container xs={12} style={{ marginTop: 10 ,alignItems:'center'}}>
                                    <Grid item xs={4} style={{ textAlign: 'end' }}>
                                        <Typography variant="subtitle1">Passcode<RequiredIcon />: </Typography>
                                    </Grid>
                                    <Grid item xs={1} />
                                    <Grid item xs={6}>
                                        <PassCodeInputNoHint
                                            id="passCodeInputNoHint"
                                            value={changePasscodeDialogInfo.passCode}
                                            inputProps={{ maxLength: 5, autoComplete: 'off' }}
                                            ref={r => this.passCodeFieldRef = r}
                                            onBlur={(value) => {
                                                this.rePasscodeFieldRef.validateCurrent();
                                                updateState({ changePasscodeDialogInfo: { ...changePasscodeDialogInfo, passCode: value } });
                                            }}
                                            validators={[ValidatorEnum.required, ValidatorEnum.equalStringLength(5), ValidatorEnum.isSamePasscode]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_PASSCODE_CHARACTORS(), CommonMessage.VALIDATION_SAME_PASSCODE()]}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item container xs={12} style={{ marginTop: 10, alignItems: 'center' }}>
                                    <Grid item xs={4} style={{ textAlign: 'end' }}>
                                        <Typography variant="subtitle1">Re-enter Passcode<RequiredIcon />: </Typography>
                                    </Grid>
                                    <Grid item xs={1} />
                                    <Grid item xs={6}>
                                        <PassCodeInputNoHint
                                            id="rePassCodeInputNoHint"
                                            value={changePasscodeDialogInfo.rePassCode}
                                            inputProps={{ maxLength: 5, autoComplete: 'off' }}
                                            ref={r => this.rePasscodeFieldRef = r}
                                            onBlur={(value) => {
                                                this.passCodeFieldRef.validateCurrent();
                                                updateState({ changePasscodeDialogInfo: { ...changePasscodeDialogInfo, rePassCode: value } });
                                            }}
                                            validators={[ValidatorEnum.required, ValidatorEnum.equalStringLength(5), ValidatorEnum.isSamePasscode]}
                                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_PASSCODE_CHARACTORS(), CommonMessage.VALIDATION_SAME_PASSCODE()]}
                                        />
                                    </Grid>
                                </Grid>
                            </ValidatorForm>
                        </Grid>
                    </div>
                }
                buttonConfig={
                    [
                        {
                            id: 'changePasscode_save',
                            name: 'Save',
                            onClick: () => {
                                this.props.auditAction('Click Save In Change Passcode Dialog');
                                this.handleSubmitChangePasscode();
                            }
                        },
                        {
                            id: 'changePasscode_cancel',
                            name: 'Cancel',
                            onClick: () => {
                                this.props.auditAction('Cancel Change Passcode', null, null, false, 'ana');
                                this.props.updateState({ changePasscodeDialogInfo: { userName: '', open: false, passCode: '', rePassCode: '', version: '', isAdmin: '' } });
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
        changePasscodeDialogInfo: state.userAccount.changePasscodeDialogInfo
    });
};

const mapDispatchtoProps = {
    updateState,
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


export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(ChangePasscodeDialog));