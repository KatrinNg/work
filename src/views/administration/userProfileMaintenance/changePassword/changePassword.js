import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    TextField
} from '@material-ui/core';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CommonRegex from '../../../../constants/commonRegex';
import {
    updateField,
    resetAll,
    updateCancel,
    updatePassword
} from '../../../../store/actions/administration/changePassword/changePasswordAction';
import * as changePasswordErrorMessages from '../../../../constants/administration/changePasswordErrorMessage';
import { logout } from '../../../../store/actions/login/loginAction';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import Enum from '../../../../enums/enum';

const styles = ({
    grid: {
        marginTop: 5,
        marginBottom: 5
    },
    h6Title: {
        marginTop: 20,
        marginBottom: 10
    }
});
function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

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

function validateMessage(isIncludeRequired, name, value, newPwd = null, curPwd = null, validationRegex = CommonRegex.VALIDATION_REGEX_PASSWORD) {
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
                return changePasswordErrorMessages.pwdFormatMsg();
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
            passwordMinAlpNumericLength: null
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

    }
    componentWillUnmount() {
        this.props.resetAll();
    }
    handleChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        if (e.target.name === 'confirmNewPwd' && e.target.value.length - this.props.confirmNewPwd.length > 1) {
            return false;
        }
        this.props.updateField(name, value);
    }
    handleSubmit = (e) => {
        e.preventDefault();
        if (this.validateSubmit(true)) {
            let submitParams = {
                currentPassword: this.props.curPwd,
                newPassword: this.props.newPwd
            };
            const callBack = () => {
                if (this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin) {
                    this.props.logout();
                }
            };
            this.props.updatePassword(
                submitParams,
                callBack
            );
        }
    }
    //validate password
    validateSubmit(isIncludeRequired) {
        let validateFlag = true;
        let { errorMessage,
            passwordMinNumericLength,
            passwordMinAlpNumericLength,
            passwordMinLength,
            passwordMaxLength
        } = this.state;
        let curPwd_valid, newPwd_valid, confirmNewPwd_valid;

        let validationRegex = `^(?=(?:.*?[0-9]){${passwordMinNumericLength},})(?=.*[A-Z]{1,})(?=.*[a-z]{1,})(?=(?:.*?[a-zA-Z0-9]){${passwordMinAlpNumericLength},}).{${passwordMinLength},${passwordMaxLength}}$`;

        let curPwdMsg = validateMessage(isIncludeRequired, 'curPwd', this.props.curPwd, validationRegex);
        if (curPwdMsg) {
            errorMessage['curPwd_errMsg'] = curPwdMsg;
            curPwd_valid = false;
            validateFlag = false;
        } else {
            errorMessage['curPwd_errMsg'] = '';
            curPwd_valid = true;
        }

        let newPwdMsg = validateMessage(isIncludeRequired, 'newPwd', this.props.newPwd, null, this.props.curPwd, validationRegex);
        if (newPwdMsg) {
            errorMessage['newPwd_errMsg'] = newPwdMsg;
            newPwd_valid = false;
            validateFlag = false;
        } else {
            errorMessage['newPwd_errMsg'] = '';
            newPwd_valid = true;
        }

        let confirmNewPwdMsg = validateMessage(isIncludeRequired, 'confirmNewPwd', this.props.confirmNewPwd, this.props.newPwd, validationRegex);
        if (confirmNewPwdMsg) {
            errorMessage['confirmNewPwd_errMsg'] = confirmNewPwdMsg;
            confirmNewPwd_valid = false;
            validateFlag = false;
        } else {
            errorMessage['confirmNewPwd_errMsg'] = '';
            confirmNewPwd_valid = true;
        }
        this.setState({
            curPwd_valid,
            newPwd_valid,
            confirmNewPwd_valid,
            errorMessage
        });
        return validateFlag;
    }
    handleOnblur = () => {
        // let newPwd = name == 'confirmNewPwd' ? this.props.newPwd : null;
        // let curPwd = name == 'newPwd' ? this.props.curPwd : null;
        // let errMsg = validateMessage(name, value, newPwd,curPwd);
        // let isValid;
        // let { errorMessage } = this.state;
        // if (errMsg) {
        //     errorMessage[name + '_errMsg'] = errMsg;
        //     isValid = false;
        // } else {
        //     errorMessage[name + '_errMsg'] = '';
        //     isValid = true;
        // }
        // this.setState({ errorMessage, [name + '_valid']: isValid });
        this.validateSubmit(false);
    }
    handleCancel = () => {
        if (this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin) {
            this.props.logout();
            return;
        }
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
            <Grid>
                <Typography variant="h6" className={classes.h6Title}>Change Password:</Typography>

                <Grid item container xs={8}>
                    <Grid item container className={classes.grid}>
                        <Grid item xs={3}>
                            <Typography variant="subtitle1">Current Password<RequiredIcon />:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField
                                variant={'outlined'}
                                id={'curPassword'}
                                style={{ margin: 0, padding: 0, width: '73%' }}
                                name={'curPwd'}
                                value={this.props.curPwd}
                                margin="normal"
                                inputProps={{
                                    maxLength: 20
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
                                style={{ margin: 0, padding: 0, width: '73%' }}
                                name={'newPwd'}
                                value={this.props.newPwd}
                                error={!this.state.newPwd_valid || !this.props.isCorrectNewPwd}
                                margin="normal"
                                inputProps={{
                                    maxLength: 20
                                }}
                                onPaste={() => { window.event.returnValue = false; }}
                                onContextMenu={() => { window.event.returnValue = false; }}
                                onCopy={() => { window.event.returnValue = false; }}
                                onCut={() => { window.event.returnValue = false; }}
                                onChange={this.handleChange}
                                onBlur={this.handleOnblur}
                                type={'password'}
                                autoComplete={'off'}

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
                                style={{ margin: 0, padding: 0, width: '73%' }}
                                name={'confirmNewPwd'}
                                value={this.props.confirmNewPwd}
                                error={!this.state.confirmNewPwd_valid}
                                margin="normal"
                                inputProps={{
                                    maxLength: 20
                                }}
                                type={'password'}
                                onPaste={() => { window.event.returnValue = false; }}
                                onContextMenu={() => { window.event.returnValue = false; }}
                                onCopy={() => { window.event.returnValue = false; }}
                                onCut={() => { window.event.returnValue = false; }}
                                onChange={this.handleChange}
                                onBlur={this.handleOnblur}
                                autoComplete={'off'}
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
        ...state.changePassword.changePasswordDTO
    };
};
const dispatchToProps = {
    updateField,
    resetAll,
    updateCancel,
    updatePassword,
    logout
};
export default connect(mapStateToProps, dispatchToProps)(withStyles(styles)(ChangePassword));