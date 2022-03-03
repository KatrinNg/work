import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import CIMSButton from '../Buttons/CIMSButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import { openIdleTimeDialog, closeIdleTimeDialog } from '../../store/actions/common/commonAction';
import { refreshToken, logout, doLogin, putLoginInfo, resetErrorMsg, updateisTemporaryLogin } from '../../store/actions/login/loginAction';
import { addTabs, resetAll } from '../../store/actions/mainFrame/mainFrameAction';
import { Grid, Typography } from '@material-ui/core';
import { Alarm } from '@material-ui/icons';
import Enum from '../../enums/enum';
import * as CommonUtilities from '../../utilities/commonUtilities';
import moment from 'moment';
import accessRightEnum from '../../enums/accessRightEnum';
import PasswordInput from '../../views/compontent/passwordInput/passwordInput';
import PasswordInputNoHint from '../../views/compontent/passwordInput/passwordInputNoHint';
import ValidatorForm from '../FormValidator/ValidatorForm';

const styles = (theme) => ({
    paper: {
        // backgroundColor: '#f4f4f4',
        backgroundColor:theme.palette.cimsBackgroundColor,
        minWidth: 300,
        maxWidth: 'none'
    },
    formControlCss: {
        // backgroundColor: '#f4f4f4',
        backgroundColor:theme.palette.cimsBackgroundColor,
        padding: '40px 10px 10px 10px'
    },
    iconCss: {
        height: '7.25rem',
        width: '7.25rem',
        padding: '20px'
    }
});

class CIMSIdleAlertDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            timer: null,
            timeOut: null,
            showLoginDialog: false,
            showLogoutDialog: false,
            password: '',
            isPasswordErr: false
        };
        this.letshowLoginDialog = false;
        this.showLogoutDialog = false;
        this.showLoginDialogTime = 0;
    }

    componentDidMount() {


        // this.props.refreshToken();
        this.props.resetErrorMsg();
        window.onkeydown = this.handleKeyDown;
        let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        let idleTimeOutScreen = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IDLE_TIMEOUT_LOCK_SCREEN, this.props.clinicConfig, where).configValue;
        let idleTimeOut = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.IDLE_TIMEOUT_LOGOUT, this.props.clinicConfig, where).configValue;
        window.lastMove = new Date().getTime();
        document.onmousemove = (ev) => {
            window.lastMove = new Date().getTime();
        };
        const { expiryTime } = this.props;
        let timer = setInterval(() => {
            this.props.refreshToken();
        }, expiryTime);
        let timeOut = setInterval(() => {
            let now = new Date().getTime();
            if (this.showLoginDialogTime !== 0 && (now - this.showLoginDialogTime) >= (idleTimeOut - idleTimeOutScreen) * 60 * 1000) {
                clearInterval(timeOut);
                this.showLoginDialog = false;
                this.showLogoutDialog = true;
                this.setState({ showLoginDialog: this.showLoginDialog, showLogoutDialog: this.showLogoutDialog });
            } else if (this.showLoginDialogTime === 0 && (now - window.lastMove) >= idleTimeOutScreen * 60 * 1000) {
                this.showLoginDialog = true;
                this.props.openIdleTimeDialog();
                this.showLogoutDialog = false;
                this.setState({ showLoginDialog: this.showLoginDialog, showLogoutDialog: this.showLogoutDialog });
                this.showLoginDialogTime = new Date().getTime();
            }
        }, 1000);
        this.setState({ timer, timeOut, idleTimeOutScreen: idleTimeOutScreen, idleTimeOut: idleTimeOut });
    }
    //update by Renny spa dialog focus conflict start 20200729
    componentDidUpdate() {
        const spaDialogs = document.querySelectorAll('div[data-spadialog]');
        if (this.state.showLoginDialog) {
            if (spaDialogs.length > 0) {
                for (let i = 0; i < spaDialogs.length; i++) {
                    spaDialogs[i].style.display = 'none';
                }
            }
        } else {
            if (spaDialogs.length > 0) {
                for (let i = 0; i < spaDialogs.length; i++) {
                    spaDialogs[i].style.display = 'block';
                }
            }
        }

        if (document.getElementById('timeout-dialog-login')) {
            if (this.props.commonMessageDetail.messageCode === '110058') {
                document.getElementById('timeout-dialog-login').style.zIndex = '1300';
                setTimeout(() => {
                    if (document.getElementById('cims-message-dialog-close')) {
                        document.getElementById('cims-message-dialog-close').style.display = 'none';
                    }
                }, 50);
            }
        }

        if(this.state.showLogoutDialog && this.state.timer) {
            clearInterval(this.state.timer);
        }
    }
    //update by Renny spa dialog focus conflict end 20200729
    componentWillUnmount() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        if (this.state.timeOut) {
            clearInterval(this.state.timeOut);
        }
    }

    handleKeyDown = (e) => {
        window.lastMove = new Date().getTime();
        if (e.keyCode === 13) {
            if (this.showLoginDialog) {
                this.passwordRef && this.passwordRef.blur();
                this.onClickLoginOK();
            }
        }
    }

    // fixing find clinic by siteId instead of clinicCd, as clinicCd is not unique across services
    getCurLoginServiceAndClinic = (serviceCd, clinicCd, siteId) => {
        const { serviceList, clinicList } = this.props;
        let curLoginService = serviceList.find(item => item.serviceCd === serviceCd);
        let curLoginClinic = clinicList.find(item => item.siteId === siteId);
        curLoginService = curLoginService ? curLoginService : { serviceCd: serviceCd };
        curLoginClinic = curLoginClinic ? curLoginClinic : { clinicCd: clinicCd };

        return { service: curLoginService, clinic: curLoginClinic };
    }

    onClickLogoutOK = () => {
        this.props.logout();
        this.showLoginDialog = false;
        this.props.closeIdleTimeDialog();
        this.showLogoutDialog = false;
        this.setState({ showLoginDialog: this.showLoginDialog, showLogoutDialog: this.showLogoutDialog });
    }

    // fixing find clinic by siteId instead of clinicCd, as clinicCd is not unique across services
    onClickLoginOK = () => {
        if (this.state.password.trim() == '') {
            this.setState({ isPasswordErr: true });
            this.props.resetErrorMsg();
            return;
        }
        const currentClinicDetail = this.props.clinicList.filter((item) => item.siteId === this.props.clinic.siteId)[0];
        const ecsLocCode = currentClinicDetail ? currentClinicDetail.ecsLocCd : '';
        const params = {
            serviceCode: this.props.serviceCd,
            clinicCode: this.props.clinicCd,
            siteId: this.props.clinic.siteId,
            ecsLocCode: ecsLocCode,
            loginName: this.props.loginName,
            password: this.state.password,
            isIdleLogin: true
        };
        let curLoginServiceAndClinic = this.getCurLoginServiceAndClinic(this.props.serviceCd, this.props.clinicCd, this.props.clinic.siteId);
        this.props.doLogin(params, () => {
            let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
            let passwordEffectiveDayObj = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.PASSWORD_EFFECTIVE_DAY, this.props.clinicConfig, where);
            let expiryDates = moment(this.props.pwdLastDate, Enum.DATE_FORMAT_EYMD_VALUE).add(passwordEffectiveDayObj.configValue, 'day');
            let expiryDays = moment(expiryDates.format(Enum.DATE_FORMAT_EYMD_VALUE), Enum.DATE_FORMAT_EYMD_VALUE).diff(moment(moment().format(Enum.DATE_FORMAT_EYMD_VALUE), Enum.DATE_FORMAT_EYMD_VALUE), 'day');
            if (expiryDays <= 0) {
                // expiry
                this.props.updateisTemporaryLogin('E');// update expiry status after login to contorl display in changepassword
                // delete all tabs and add userprofile
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    if (this.props.tabs.length != 0) {
                        this.props.resetAll();
                    } else {
                        this.props.addTabs(this.props.accessRights.find(item => item.name === accessRightEnum.changePersonalPassword));
                        break;
                    }
                }
            }
            this.props.putLoginInfo(curLoginServiceAndClinic);
            this.setState({ password: '' });
            this.showLoginDialog = false;
            this.props.closeIdleTimeDialog();
            this.showLogoutDialog = false;
            this.setState({ showLoginDialog: this.showLoginDialog, showLogoutDialog: this.showLogoutDialog });
            window.lastMove = new Date().getTime();
            this.showLoginDialogTime = 0;
            this.props.handleCloseExpMessage();
            this.props.resetErrorMsg();
        });
        this.setState({ isPasswordErr: false });
    }

    render() {
        const { classes } = this.props;
        return (
            <>
                <Dialog
                    classes={{
                        paper: classes.paper
                    }}
                    id={'timeout-dialog'}
                    style={{
                        background: '#fff',
                        zIndex: 1302
                    }}
                    open={this.state.showLogoutDialog}
                >
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                    >
                        <Alarm color="primary" className={classes.iconCss} />
                        <FormControl className={classes.formControlCss}>
                            <FormControl >
                                <DialogContent style={{
                                    fontWeight: 'bolder',
                                    color: 'red',
                                    fontSize: 'larger'
                                }}
                                >
                                    {`This System was left idle for over ${this.state.idleTimeOut} minutes `}
                                </DialogContent>
                                <DialogContent style={{
                                    fontWeight: 'bold',
                                    height: 90
                                }}
                                >
                                    {'For Security reason, you are required to login again. '}
                                </DialogContent>

                                <DialogActions>
                                    <CIMSButton onClick={this.onClickLogoutOK} id={'timeout-ok-logout'} color="primary">{'Ok'}</CIMSButton>

                                </DialogActions>
                            </FormControl>
                        </FormControl>
                    </Grid>
                </Dialog>
                <Dialog
                    classes={{
                        paper: classes.paper
                    }}
                    id={'timeout-dialog-login'}
                    style={{
                        background: '#fff',
                        zIndex: 1302
                    }}
                    open={this.state.showLoginDialog}
                >
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                    >
                        <Alarm color="primary" className={classes.iconCss} />
                        <ValidatorForm autoComplete="off">
                            <FormControl className={classes.formControlCss}>
                                <FormControl >
                                    <DialogContent style={{
                                        fontWeight: 'bolder',
                                        color: 'red',
                                        fontSize: 'larger'
                                    }}
                                    >
                                        {`This System was left idle for over ${this.state.idleTimeOutScreen} minutes `}
                                    </DialogContent>
                                    <DialogContent style={{
                                        fontWeight: 'bold',
                                        height: 170
                                    }}
                                    >
                                        <div>{'For Security reason, you are required to enter your password to revoke the system. '}</div>
                                        <div style={{ marginTop: 15, marginBottom: 15 }}>
                                            {'Username'}<span style={{ marginLeft: 3 }}>{':'}</span>
                                            <span style={{ marginLeft: 45 }}>{this.props.loginName}</span>
                                        </div>
                                        <div>
                                            <Grid
                                                container
                                                direction="row"
                                                justify="flex-start"
                                                alignItems="center"
                                                wrap="nowrap"
                                            >{'Password'}<span style={{ marginLeft: 5 }}>{':'}</span>
                                                <PasswordInputNoHint
                                                    id="idle_password"
                                                    style={{ margin: 0, padding: 0, width: '45%', marginLeft: 45 }}
                                                    value={this.state.password}
                                                    inputProps={{ maxLength: 20, autoComplete: 'off', ref: ref => this.passwordRef = ref }}
                                                    onBlur={(value) => { this.setState({ password: value }); }}
                                                    error={this.state.isPasswordErr}
                                                    onFocus={e => {
                                                        e.nativeEvent.stopImmediatePropagation();
                                                    }}
                                                />
                                                <input type="text" style={{ display: 'none' }} />
                                            </Grid>
                                            {this.props.errorMessage ? (
                                                <Grid item style={{ marginLeft: 145, marginTop: 10 }}>
                                                    <Typography
                                                        style={{ color: 'red', fontWeight: 'bold', fontSize: '14px' }}

                                                    >
                                                        {this.props.errorMessage}
                                                    </Typography>

                                                </Grid>
                                            ) : null}
                                            {
                                                this.state.isPasswordErr ? <Grid item style={{ marginLeft: 145, marginTop: 10 }}>
                                                    <Typography
                                                        style={{ color: 'red', fontWeight: 'bold', fontSize: '14px' }}
                                                    >
                                                        {'Password is required!'}
                                                    </Typography>
                                                </Grid> : null
                                            }
                                        </div>
                                    </DialogContent>

                                    <DialogActions>
                                        <CIMSButton onClick={this.onClickLoginOK} id={'timeout-unlockScreen-ok'} color="primary">{'OK'}</CIMSButton>
                                        <CIMSButton onClick={this.onClickLogoutOK} id={'timeout-unlockScreen-logout'} color="primary">{'Logout'}</CIMSButton>
                                    </DialogActions>
                                </FormControl>
                            </FormControl>
                        </ValidatorForm>
                    </Grid>
                </Dialog>

            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        expiryTime: state.login.loginInfo.expiryTime,
        loginName: state.login.loginInfo.loginName,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        clinic: state.login.clinic,
        clinicConfig: state.common.clinicConfig,
        serviceList: state.common.serviceList,
        clinicList: state.common.clinicList,
        errorMessage: state.login.errorMessage,
        pwdLastDate: state.login.loginInfo && state.login.loginInfo.pwdLastDate,
        tabs: state.mainFrame.tabs,
        accessRights: state.login.accessRights,
        siteId: state.login.clinic.siteId,
        commonMessageDetail: state.message.commonMessageDetail
    };
};

const dispatchToProps = {
    refreshToken,
    logout,
    putLoginInfo,
    doLogin,
    resetErrorMsg,
    updateisTemporaryLogin,
    resetAll,
    addTabs,
    openIdleTimeDialog,
    closeIdleTimeDialog
};

export default withRouter(connect(mapStateToProps, dispatchToProps)(withStyles(styles)(CIMSIdleAlertDialog)));
