import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    TextField
} from '@material-ui/core';
import CIMSButton from 'components/Buttons/CIMSButton';
import CommonRegex from '../../../constants/commonRegex';
import {
    updateField,
    resetAll,
    updateCancel,
    updatePassword
} from '../../../store/actions/administration/changePassword/changePasswordAction';
import { updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import * as changePasswordErrorMessages from '../../../constants/administration/changePasswordErrorMessage';
import { logout } from '../../../store/actions/login/loginAction';
import * as commonUtilities from '../../../utilities/commonUtilities';
import Enum from '../../../enums/enum';
import RequiredIcon from 'components/InputLabel/RequiredIcon';
import accessRightEnum from '../../../enums/accessRightEnum';
import _ from 'lodash';
import AlsDesc from '../../../constants/ALS/alsDesc';
import { auditAction } from '../../../store/actions/als/logAction';

const styles = ({
    grid: {
        marginTop: 10,
        marginBottom: 10
    },
    h6Title: {
        color: '#0579c8',
        marginTop: 20,
        marginBottom: 10,
        fontWeight: 'bolder'
    }
});

function errMsg(errorMessage, errorData = null) {
    return (
        <Typography component={'div'} style={{ color: 'red' }} id="changePassword_errorMessage">
            {errorMessage.curPwd_errMsg ?
                errorMessage.curPwd_errMsg
                : null
            }
            {errorMessage.newPwd_errMsg ?
                <Typography style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: errorMessage.newPwd_errMsg }} /> : null
            }
            {errorMessage.confirmNewPwd_errMsg ?
                <Typography style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: errorMessage.confirmNewPwd_errMsg }} /> : null
            }
            {errorData && errorData.map((item, index) =>
                <Typography key={index} style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: item.errMsg }} />
            )
            }
        </Typography>
    );
}

function validateMessage(isIncludeRequired, name, value, newPwd = null, curPwd = null, validationRegex = CommonRegex.VALIDATION_REGEX_PASSWORD, passwordParams = {}) {
    switch (name) {
        case 'curPwd': {
            if (isIncludeRequired && !value && value.trim() === '')
                return changePasswordErrorMessages.curPwdRequired();
            return null;
        }
        case 'newPwd': {
            if (isIncludeRequired && !value && value.trim() === '')
                return changePasswordErrorMessages.newPwdRequired();
            if (value && (!new RegExp(validationRegex).test(value) || curPwd === value))
                return changePasswordErrorMessages.pwdFormatMsg(passwordParams);
            return null;
        }
        case 'confirmNewPwd': {
            if (isIncludeRequired && !value && value.trim() === '')
                return changePasswordErrorMessages.confirmNewPwdRequired();
            if (value && newPwd !== value)
                return changePasswordErrorMessages.noMatchPwd();
            return null;
        }
        default: break;
    }
}
class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curPwd_valid: true,
            newPwd_valid: true,
            confirmNewPwd_valid: true,
            errorMessage: {
                curPwd_errMsg: '',
                newPwd_errMsg: '',
                confirmNewPwd_errMsg: ''
            },
            passwordMinLength: null,
            passwordMaxLength: null,
            passwordMinNumericLength: null,
            passwordMinAlpNumericLength: null,
            curPwd: '',
            newPwd: '',
            confirmNewPwd: ''
        };

        this.handleChange = this.handleChange.bind(this);
    }
    UNSAFE_componentWillMount() {
        this.props.resetAll();
    }
    componentDidMount() {
        let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        let passwordMinLengthObj = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.PASSWORD_MIN_LENGTH, this.props.clinicConfig, where);
        let passwordMaxLengthObj = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.PASSWORD_MAX_LENGTH, this.props.clinicConfig, where);
        let passwordMinNumericLengthObj = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.PASSWORD_MIN_NUMERIC_LENGTH, this.props.clinicConfig, where);
        let passwordMinAlpNumericLengthObj = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.PASSWORD_MIN_ALPHANUMERIC_LENGTH, this.props.clinicConfig, where);
        this.setState({
            passwordMinLength: passwordMinLengthObj.configValue,
            passwordMaxLength: passwordMaxLengthObj.configValue,
            passwordMinNumericLength: passwordMinNumericLengthObj.configValue,
            passwordMinAlpNumericLength: passwordMinAlpNumericLengthObj.configValue
        });
        this.doClose = commonUtilities.getDoCloseFunc_2(accessRightEnum.changePersonalPassword, this.checkDirty, this.saveFunc);
        this.props.updateCurTab(accessRightEnum.changePersonalPassword, this.doClose);
    }
    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (prevProps.curPwd !== this.props.curPwd) {
            this.setState({ curPwd: this.props.curPwd });
        }
        if (prevProps.newPwd !== this.props.newPwd) {
            this.setState({ newPwd: this.props.newPwd });
        }
        if (prevProps.confirmNewPwd !== this.props.confirmNewPwd) {
            this.setState({ confirmNewPwd: this.props.confirmNewPwd });
        }
    }
    componentWillUnmount() {
        this.props.resetAll();
    }
    checkDirty = () => {
        return _.toString(this.props.curPwd) || _.toString(this.props.newPwd) || _.toString(this.props.confirmNewPwd) ? true : false;
    }
    saveFunc = (closeTab) => {
        this.handleSubmit(null, closeTab);
    }
    handleChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        if (e.target.name === 'confirmNewPwd' && e.target.value.length - this.state.confirmNewPwd.length > 1) {
            return false;
        }
        this.setState({ [name]: value });
    }
    handleSubmit = (e, closeTab) => {
        e && e.preventDefault();
        this.props.auditAction(AlsDesc.UPDATE);
        let formValid = this.validateSubmit(true);
        formValid.then(result => {
            if(result) {
                let submitParams = {
                    loginName: this.props.loginInfo.loginName,
                    currentPassword: this.state.curPwd,
                    newPassword: this.state.newPwd
                };
                const callBack = () => {
                    if (this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin || this.props.isResetPassword) {
                        this.props.logout();
                    } else {
                        if (closeTab) {
                            closeTab(true);
                        }
                    }
                };
                this.props.updatePassword(
                    submitParams,
                    callBack
                );
            } else {
                const validList = [
                    { key: 'curPwdRef', isValid: this.state.curPwd_valid },
                    { key: 'newPwdRef', isValid: this.state.newPwd_valid },
                    { key: 'confirmNewPwdRef', isValid: this.state.confirmNewPwd_valid }
                ];
                const firstInValid = validList.find(x => !x.isValid);
                if (firstInValid) {
                    this[firstInValid.key] && this[firstInValid.key].focus();
                }
            }
        });
    }
    //validate password
    validateSubmit(isIncludeRequired, name) {
        return new Promise((resolve) => {
            let validateFlag = true;
            let { errorMessage,
                passwordMinNumericLength,
                passwordMinAlpNumericLength,
                passwordMinLength,
                passwordMaxLength
            } = this.state;
            let { curPwd_valid, newPwd_valid, confirmNewPwd_valid } = this.state;

            let validationRegex = `^(?=(?:.*?[0-9]){${passwordMinNumericLength},})(?=.*[A-Z]{1,})(?=.*[a-z]{1,})(?=(?:.*?[a-zA-Z0-9]){${passwordMinAlpNumericLength},}).{${passwordMinLength},${passwordMaxLength}}$`;

            let passwordParams = { passwordMinLength: this.state.passwordMinLength, passwordMaxLength: this.state.passwordMaxLength };

            if(!name || name === 'curPwd'){
                let curPwdMsg = validateMessage(isIncludeRequired, 'curPwd', this.state.curPwd, validationRegex, passwordParams);
                if (curPwdMsg) {
                    errorMessage['curPwd_errMsg'] = curPwdMsg;
                    curPwd_valid = false;
                    validateFlag = false;
                } else {
                    errorMessage['curPwd_errMsg'] = '';
                    curPwd_valid = true;
                }
            }

            if(!name || name === 'newPwd') {
                let newPwdMsg = validateMessage(isIncludeRequired, 'newPwd', this.state.newPwd, null, this.state.curPwd, validationRegex, passwordParams);
                if (newPwdMsg) {
                    errorMessage['newPwd_errMsg'] = newPwdMsg;
                    newPwd_valid = false;
                    validateFlag = false;
                } else {
                    errorMessage['newPwd_errMsg'] = '';
                    newPwd_valid = true;
                }
            }

            if(!name || name === 'confirmNewPwd') {
                let confirmNewPwdMsg = validateMessage(isIncludeRequired, 'confirmNewPwd', this.state.confirmNewPwd, this.state.newPwd, validationRegex, passwordParams);
                if (confirmNewPwdMsg) {
                    errorMessage['confirmNewPwd_errMsg'] = confirmNewPwdMsg;
                    confirmNewPwd_valid = false;
                    validateFlag = false;
                } else {
                    errorMessage['confirmNewPwd_errMsg'] = '';
                    confirmNewPwd_valid = true;
                }
            }

            this.setState({
                curPwd_valid,
                newPwd_valid,
                confirmNewPwd_valid,
                errorMessage
            }, () => {
                resolve(validateFlag);
            });
        });
    }
    handleOnblur = (e) => {
        this.props.updateField(e.target.name, e.target.value);
        this.validateSubmit(false, e.target.name);
    }
    handleCancel = () => {
        if (this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin || this.props.isResetPassword) {
            this.props.logout();
            return;
        }
        this.props.auditAction(AlsDesc.CANCEL);
        this.props.updateCancel();
        this.setState({
            curPwd_valid: true,
            newPwd_valid: true,
            confirmNewPwd_valid: true,
            errorMessage: {
                curPwd_errMsg: '',
                newPwd_errMsg: '',
                confirmNewPwd_errMsg: ''
            }
        });
    }

    render() {
        const { classes, errorData } = this.props;
        return (
            <Grid style={{ paddingLeft: 30 }}>
                <Typography variant="h6" className={classes.h6Title}>Change Personal Password</Typography>

                <Grid item container xs={8}>
                    <Grid item container className={classes.grid}>
                        <Grid item xs={3}>
                            <Typography variant="subtitle1">Current Password<RequiredIcon />:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                variant={'outlined'}
                                id={'curPassword'}
                                style={{ margin: 0, padding: 0, width: '100%' }}
                                name={'curPwd'}
                                value={this.state.curPwd}
                                margin="normal"
                                inputProps={{
                                    maxLength: this.state.passwordMaxLength
                                }}
                                error={!this.state.curPwd_valid || !this.props.isCorrectCurPwd}
                                onPaste={() => { window.event.returnValue = false; }}
                                onContextMenu={() => { window.event.returnValue = false; }}
                                onCopy={() => { window.event.returnValue = false; }}
                                onCut={() => { window.event.returnValue = false; }}
                                onChange={this.handleChange}
                                onBlur={this.handleOnblur}
                                type={'password'}
                                autoComplete={'off'}
                                inputRef={r => this.curPwdRef = r}
                            />
                        </Grid>
                    </Grid>

                    <Grid item container className={classes.grid}>
                        <Grid item xs={3}>
                            <Typography variant="subtitle1">New Password<RequiredIcon />:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                variant={'outlined'}
                                id={'newPassword'}
                                style={{ margin: 0, padding: 0, width: '100%' }}
                                name={'newPwd'}
                                value={this.state.newPwd}
                                error={!this.state.newPwd_valid || !this.props.isCorrectNewPwd}
                                margin="normal"
                                inputProps={{
                                    maxLength: this.state.passwordMaxLength
                                }}
                                onPaste={() => { window.event.returnValue = false; }}
                                onContextMenu={() => { window.event.returnValue = false; }}
                                onCopy={() => { window.event.returnValue = false; }}
                                onCut={() => { window.event.returnValue = false; }}
                                onChange={this.handleChange}
                                onBlur={this.handleOnblur}
                                type={'password'}
                                autoComplete={'off'}
                                inputRef={r => this.newPwdRef = r}
                            />
                        </Grid>
                    </Grid>

                    <Grid item container className={classes.grid}>
                        <Grid item xs={3}>
                            <Typography variant="subtitle1">Confirm New Password<RequiredIcon />:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                variant={'outlined'}
                                id={'confirmNewPassword'}
                                style={{ margin: 0, padding: 0, width: '100%' }}
                                name={'confirmNewPwd'}
                                value={this.state.confirmNewPwd}
                                error={!this.state.confirmNewPwd_valid}
                                margin="normal"
                                inputProps={{
                                    maxLength: this.state.passwordMaxLength
                                }}
                                type={'password'}
                                onPaste={() => { window.event.returnValue = false; }}
                                onContextMenu={() => { window.event.returnValue = false; }}
                                onCopy={() => { window.event.returnValue = false; }}
                                onCut={() => { window.event.returnValue = false; }}
                                onChange={this.handleChange}
                                onBlur={this.handleOnblur}
                                autoComplete={'off'}
                                inputRef={r => this.confirmNewPwdRef = r}
                            />
                        </Grid>
                    </Grid>

                    <Grid container alignItems={'flex-start'} direction={'row'}>
                        <Grid item xs={8}>
                            {errMsg(this.state.errorMessage, errorData)}
                            {/* <Typography component={'p'} style={{ color: 'red' }}>{this.props.errorData}</Typography> */}
                        </Grid>
                        <Grid item xs={4} container justify="flex-end">
                            <Typography>
                                <CIMSButton
                                    id={'userRoleSaveButton'}
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={this.handleSubmit}
                                >
                                    Update
                                </CIMSButton>
                                <CIMSButton
                                    id={'userRoleCancelButton'}
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={this.handleCancel}
                                >
                                    Cancel
                                </CIMSButton>
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        errorData: state.changePassword.errorData,
        isCorrectCurPwd: state.changePassword.isCorrectCurPwd,
        isCorrectNewPwd: state.changePassword.isCorrectNewPwd,
        isTemporaryLogin: state.login.isTemporaryLogin === 'Y',
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        clinicConfig: state.common.clinicConfig,
        isFirstTimeLogin: state.login.isTemporaryLogin === 'F',
        isExpiryLogin: state.login.isTemporaryLogin === 'E',
        loginInfo: state.login.loginInfo,
        isResetPassword: state.login.isTemporaryLogin === 'R',
        ...state.changePassword.changePasswordDTO
    };
};
const dispatchToProps = {
    updateField,
    resetAll,
    updateCancel,
    updatePassword,
    logout,
    updateCurTab,
    auditAction
};
export default connect(mapStateToProps, dispatchToProps)(withStyles(styles)(ChangePassword));