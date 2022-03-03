import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { DialogContent, DialogActions, Grid } from '@material-ui/core';
import { AccountBox } from '@material-ui/icons';
import CIMSFormLabel from '../../../components/InputLabel/CIMSFormLabel';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';

import NewAprrovalDialog from './newAprrovalDialog';
import * as PatientUtil from '../../../utilities/patientUtilities';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import * as RegUtil from '../../../utilities/registrationUtilities';
import PasswordInputNoHint from '../../compontent/passwordInput/passwordInputNoHint';

const styles = () => ({
    gridMargin20: {
        marginBottom: 20
    },
    textfield: {
        marginBottom: 20,
        marginTop: 20
    }
});

const useStyle = makeStyles(theme => ({
    informationBar: {
        minHeight: 40
        // maxHeight: 150
    },
    complexBar: {
        // backgroundColor: `${theme.palette.primary.main}55`
        backgroundColor: '#DAE3F3'
    },
    grid: {
        paddingLeft: 8,
        paddingRight: 8,
        wordBreak: 'break-word'
    },
    headGrid: {
        textAlign: 'right',
        fontWeight: 'bold',
        paddingRight: 30
    },
    boldGrid: {
        fontWeight: 'bold'
    },
    differentGrid: {
        // color: theme.palette.secondary.main
        color: '#FD0000'
    }
}));

function InformationBar(props) {
    const classes = useStyle();
    return (
        <Grid
            container
            className={classNames({
                [classes.informationBar]: true,
                [classes.complexBar]: props.complex
            })}
            alignContent="center"
        >
            <Grid item xs={4}
                className={classNames({
                    [classes.headGrid]: true,
                    [classes.grid]: true
                })}
            >{props.title}</Grid>
            <Grid item xs={4}
                className={classNames({
                    [classes.grid]: true,
                    [classes.boldGrid]: props.head
                })}
            >{props.content1}</Grid>
            <Grid item xs={4}
                className={classNames({
                    [classes.grid]: true,
                    [classes.boldGrid]: props.head,
                    [classes.differentGrid]: props.head == true ? false : (props.content1 !== props.content2)
                })}
            >{props.content2}</Grid>
        </Grid>
    );
}

class ApprovalDialog extends Component {
    constructor(props) {
        super(props);
    }

    handleConfirm = () => {
        if (this.props.isUserHaveAccess) {
            this.props.confirm();
        } else {
            const formvalid = this.refs.approvalForm.isFormValid(false);
            formvalid.then(result => {
                if (result) {
                    this.props.confirm();
                }
            });
        }
    }

    getPrimaryDocType = (value) => {
        if (value) {
            const docTypeCode = this.props.docTypeCodeList.find(item => item.code === value);
            return docTypeCode && docTypeCode.engDesc;
        }
        return '';
    };

    render() {
        const {
            classes,
            open,
            cancel,
            // approverName,
            // approverPassword,
            staffId,
            existingInfo,
            newInfo,

            onChange,
            isUserHaveAccess
        } = this.props;
        let loginUserStaffId = this.props.loginUserStaffId ? this.props.loginUserStaffId: '';

        return (
            <NewAprrovalDialog
                id="registration_approvalDialog"
                open={open}
                dialogTitle="Supervisor's Approval"  //CIMST-2292 align the title with other supervisors approval dialogs
            >
                <DialogContent id="registration_approvalDialogContent" style={{ maxHeight: 555 }}>
                    <Grid container className={classes.gridMargin20}>
                        <InformationBar
                            head
                            title=""
                            content1="Existing Information"
                            content2="New Information"
                        />
                        <InformationBar
                            complex
                            title="Document Type"
                            content1={this.getPrimaryDocType(existingInfo.primaryDocTypeCd)}
                            content2={this.getPrimaryDocType(newInfo.primaryDocTypeCd)}
                        />
                        <InformationBar
                            title="Document No"
                            content1={PatientUtil.isHKIDFormat(existingInfo.primaryDocTypeCd) ? PatientUtil.getHkidFormat(existingInfo.primaryDocNo) : existingInfo.primaryDocNo}
                            content2={PatientUtil.isHKIDFormat(newInfo.primaryDocTypeCd) ? PatientUtil.getHkidFormat(newInfo.primaryDocNo) : newInfo.primaryDocNo}
                        />
                        <InformationBar
                            complex
                            title="English Name"
                            content1={CommonUtilities.getFullName(existingInfo.engSurname, existingInfo.engGivename)}
                            content2={CommonUtilities.getFullName(newInfo.engSurname, newInfo.engGivename)}
                        />
                        <InformationBar
                            title="Chinese Name"
                            content1={existingInfo.nameChi}
                            content2={newInfo.nameChi}
                        />
                        <InformationBar
                            complex
                            title="Sex"
                            content1={existingInfo.genderCd}
                            content2={newInfo.genderCd}
                        />
                        <InformationBar
                            title="DOB"
                            content1={existingInfo.dob && RegUtil.getDobDateByFormat(existingInfo.exactDobCd, existingInfo.dob)+` (${existingInfo.exactDobCd})`}
                            content2={newInfo.dob && RegUtil.getDobDateByFormat(newInfo.exactDobCd, newInfo.dob)+` (${newInfo.exactDobCd})`}
                        />
                    </Grid>
                    {
                        isUserHaveAccess ?
                            null :
                            <Grid container>
                                <CIMSFormLabel
                                    fullWidth
                                    labelText="Approver"
                                >
                                    <ValidatorForm ref="approvalForm">
                                        <Grid container alignItems="center" className={classes.textfield}>
                                            <Grid item container justify="center" xs={1}>
                                                <AccountBox />
                                            </Grid>
                                            <Grid item xs={11}>
                                                <PasswordInputNoHint
                                                    onBlur={value => onChange(value, 'staffId')}
                                                    inputProps={{ autoComplete: 'off' }}
                                                    value={staffId}
                                                    id={'registration_approver_staff_id'}
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
                                        {/* <Grid item container alignItems="center" className={classes.textfield}>
                                            <Grid item container justify="center" xs={1}><AccountBox /></Grid>
                                            <Grid item xs={11}>
                                                <TextFieldValidator
                                                    fullWidth
                                                    upperCase
                                                    onChange={e => onChange(e.target.value, 'loginName')}
                                                    value={approverName}
                                                    name={'approverName'}
                                                    id={'registration_approverName'}
                                                    label="Login ID"
                                                    autoFocus
                                                    msgPosition="bottom"
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid item container alignItems="center" className={classes.textfield}>
                                            <Grid item container justify="center" xs={1}><Lock /></Grid>
                                            <Grid item xs={11}>
                                                <PasswordInput
                                                    onChange={e => onChange(e.target.value, 'password')}
                                                    value={approverPassword}
                                                    name={'approverPassword'}
                                                    id={'registration_approverPassword'}
                                                    label="Password"
                                                    msgPosition="bottom"
                                                    validators={[ValidatorEnum.required]}
                                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                                />
                                            </Grid>
                                        </Grid> */}
                                    </ValidatorForm>
                                </CIMSFormLabel>
                            </Grid>
                    }
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', padding: 0 }}>
                    <CIMSButton
                        style={{ minWidth: '140px', height: '38px' }}
                        id="registration_btnConfirmApprovalDialog"
                        onClick={this.handleConfirm}
                    >Confirm</CIMSButton>
                    <CIMSButton
                        style={{ minWidth: '140px', height: '38px' }}
                        id="registration_btnCancelApprovalDialog"
                        onClick={() => cancel()}
                    >Cancel</CIMSButton>
                </DialogActions>
            </NewAprrovalDialog>
        );
    }
}

ApprovalDialog.propTypes = {
};

const mapStateToProps = (state) => {
    return {
        loginUserStaffId: state.login.loginInfo.userDto.staffId
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApprovalDialog));

