import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { DialogContent, DialogActions, Grid } from '@material-ui/core';
import { AccountBox } from '@material-ui/icons';
import CIMSFormLabel from 'components/InputLabel/CIMSFormLabel';
import CIMSButton from 'components/Buttons/CIMSButton';
import Input from './delayInput';
import ValidatorForm from 'components/FormValidator/ValidatorForm';
import RequiredIcon from 'components/InputLabel/RequiredIcon';
import NewAprrovalDialog from './newAprrovalDialog';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import { CommonUtil } from '../../utilities';
import PasswordInputNoHint from './passwordInput/passwordInputNoHint';
import { auditAction } from '../../store/actions/als/logAction';

const styles = () => ({
    DialogContent: {
        maxHeight: 555
    },
    title: {
        fontSize: '1.5rem',
        marginBottom: 20
    },
    searchString: {
        fontSize: '',
        textAlign: 'center',
        marginBottom: 20,
        display: 'block'
    },
    dialogActions: {
        justifyContent: 'center',
        padding: 0
    },
    button: {
        minWidth: '140px', height: '38px'
    },
    textfield: {
        marginBottom: 20,
        marginTop: 20
    },
    paper: {
        width: '100%'
    }
});

class SupervisorsApprovalDialog extends Component {

    componentWillUnmount() {
        this.props.resetApprovalDialog&&this.props.resetApprovalDialog();
    }

    handleConfirm = () => {
        this.props.auditAction('confirm supervisors approval dialog', null, null, false);
        setTimeout(() => {
            const formValid = this.refs.approvalForm.isFormValid(false);
            formValid.then(result => {
                if (result) {
                    this.props.confirm();
                }
            });
        }, 200);
    }

    handleChange = (value) => {
        this.props.handleChange(value);
    }

    handleCancel = () => {
        this.props.handleCancel();
        this.props.auditAction('cancel supervisors approval dialog', null, null, false);
    }

    render() {
        const {
            classes,
            supervisorsApprovalDialogInfo,
            searchString,
            title,
            component,
            ...rest
        } = this.props;
        //let patientLabel = CommonUtil.getPatientCall();
        let loginUserStaffId = this.props.loginUserStaffId ? this.props.loginUserStaffId: '';

        return (
            <NewAprrovalDialog
                id="patientSearch_approvalDialog"
                open
                dialogTitle="Supervisor's Approval"
                classes={{
                    paper: classes.paper
                }}
                {...rest}
            >
                <DialogContent id="patientSearch_approvalDialogContent" >
                    {
                        title ?
                            <Grid container >
                                <Grid
                                    container
                                    item
                                    xs={12}
                                    className={classes.title}
                                >
                                    {/* <>{`Search by ${patientLabel} Name: `}</> */}
                                    <>{title}</>
                                </Grid>
                            </Grid>
                            : null
                    }
                    {
                        searchString ?
                            <Grid container >
                                <Grid
                                    container
                                    xs={12}
                                    className={classes.searchString}
                                >
                                    <>{searchString}</>
                                </Grid>
                            </Grid>
                            : null
                    }
                    <Grid container>
                            <ValidatorForm ref="approvalForm" style={{width:'calc(100% - 30px)'}}>
                                {
                                    component ?
                                        <Grid container style={{width:700}}>
                                            {component()}
                                        </Grid>
                                        : null
                                }
                                <CIMSFormLabel
                                    fullWidth
                                    labelText="Approver"
                                >
                                    <Grid container alignItems="center" className={classes.textfield}>
                                        <Grid item container justify="center" xs={1}>
                                            <AccountBox />
                                        </Grid>
                                        <Grid item xs={11}>
                                            <PasswordInputNoHint
                                                fullWidth
                                                onBlur={value => this.handleChange(value)}
                                                inputProps={{ autoComplete: 'new-password' }}
                                                value={supervisorsApprovalDialogInfo.staffId}
                                                id={'patientSearch_approver_staff_id'}
                                                label={<>Approver's Staff ID<RequiredIcon /></>}
                                                autoFocus
                                                validators={[
                                                    ValidatorEnum.required,
                                                    ValidatorEnum.matchRegexp('^(?!(^' + loginUserStaffId + '$)).*$')
                                                ]}
                                                errorMessages={[
                                                    CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                                    CommonMessage.NON_LOGIN_USER_REQUIRED()
                                                ]}
                                            />
                                        </Grid>
                                    </Grid>
                                </CIMSFormLabel>
                            </ValidatorForm>
                    </Grid>
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <CIMSButton
                        className={classes.button}
                        id="patientSearch_btnConfirmApprovalDialog"
                        onClick={this.handleConfirm}
                    >Confirm</CIMSButton>
                    <CIMSButton
                        className={classes.button}
                        id="patientSearch_btnCancelApprovalDialog"
                        onClick={() => this.handleCancel()}
                    >Cancel</CIMSButton>
                </DialogActions>
            </NewAprrovalDialog>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loginUserStaffId: state.login.loginInfo.userDto.staffId
    };
};

const mapDispatchToProps = {
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SupervisorsApprovalDialog));
