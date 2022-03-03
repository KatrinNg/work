import React, { Component } from 'react';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Typography, Button, Grid } from '@material-ui/core';
import { colors } from '@material-ui/core';
import { AccountBox, AccountCircle, Lock, LockOpen } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';
import CommonMessage from '../../constants/commonMessage';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import PasswordInput from '../compontent/passwordInput/passwordInput';
import ValidatorEnum from '../../enums/validatorEnum';
import { resetAll } from '../../store/actions/mainFrame/mainFrameAction';
import { auditAction } from '../../store/actions/als/logAction';

// //For Dental Chart
// import DtsDentalChart2 from '../dts/appointment/components/DtsDentalChart2';
// import DtsTooth13 from '../dts/appointment/components/DtsTooth13';
// import DtsTooth48 from '../dts/appointment/components/DtsTooth48';
// import DtsToothSvg from '../dts/appointment/components/DtsToothSvg';
// //End
import {
  doLogin,
  resetErrorMsg,
  putLoginInfo,
  updateLoginForm
} from '../../store/actions/login/loginAction';
import {
  openCommonMessage
} from '../../store/actions/message/messageAction';
import { Link as RouterLink } from 'react-router-dom';
import ServiceClinicGp from './component/serviceClinicGroup';

import Notice from '../login/component/notice';

const style = (theme) => ({
  buttonRoot: {
    width: '100%',
    textTransform: 'none',
    fontWeight: 'bold'
  },
  gridMargin20: {
    marginBottom: 20
  },
  error_Message: {
    color: 'red',
    fontWeight: 'bold'
  },
  themeColor: {
    dark: colors.green[500]
  },
  get buttonColor() {
    return {
      color: this.themeColor.dark,
      borderColor: this.themeColor.dark,
      '&:hover': {
        color: '#ffffff',
        backgroundColor: this.themeColor.dark
      }
    };
  },
  get textLabel() {
    return {
      color: '#000000'
    };
  },
  get textOutlinedInput() {
    return {
      '&$cssFocused $notchedOutline': {
        borderColor: `${this.themeColor.dark} !important`
      }
    };
  },
  get textFocused() {
    return {

    };
  },
  get textNotchedOutline() {
    return {
      borderWidth: '1px',
      borderColor: 'green !important'
    };
  }
});

const textInputStyle = {
  // WebkitBoxShadow: "0 0 0 1000px #eeeeee inset"
};

// fixing find clinic by siteId instead of clinicCd, as clinicCd is not unique across services
export function getCurLoginServiceAndClinic(serviceCd, siteId, serviceList, clinicList) {
  let curLoginService = serviceList.find(item => item.serviceCd === serviceCd);
  let curLoginClinic = clinicList.find(item => item.siteId === siteId);
  return { service: curLoginService, clinic: curLoginClinic };
}

class LoginForm extends Component {

  //   //test for dental chart
  //   constructor(props){
  //     super(props);
  //     const { classes } = this.props;
  //     this.state={
  //         teethSize: 'S',
  //         toothInfo: null,
  //         toothClassS :{
  //             root:classes.toothRootS,
  //             paper:classes.toothPaperS,
  //             svgClass:classes.toothSvgClassS
  //         },
  //         toothClassM :{
  //             root:classes.toothRootM,
  //             paper:classes.toothPaperM,
  //             svgClass:classes.toothSvgClassM
  //         },
  //         toothClassL :{
  //             root:classes.toothRootL,
  //             paper:classes.toothPaperL,
  //             svgClass:classes.toothSvgClassL
  //         }
  //     };
  //     console.log('classes : '+JSON.stringify(classes));
  // }
  // //End

  componentDidMount() {
    this.props.resetAll();
    this.props.resetErrorMsg();
    window.onkeydown = this.handleKeyDown;
  }

  componentWillUnmount() {
    window.onkeydown = null;
  }


  handleLogin = (e) => {
    if (e)
      e.preventDefault();
    const { svcCd, siteId, loginName, password, clinicList, serviceList } = this.props;
    if (!svcCd || !siteId) {
      this.props.openCommonMessage({
        msgCode: '110047'
      });
    } else {
      const currentSiteDetail = clinicList.find((item) => item.siteId === siteId);
      const ecsLocCode = currentSiteDetail.ecsLocCd || '';
      const params = {
        serviceCode: svcCd,
        clinicCode: currentSiteDetail.siteCd,
        siteId: siteId,
        ecsLocCode: ecsLocCode,
        loginName: loginName,
        password: password
      };
      let curLoginServiceAndClinic = getCurLoginServiceAndClinic(svcCd, siteId, serviceList, clinicList);
      this.props.auditAction('Login', 'Login', null, true, 'user');
      this.props.doLogin(params);
      this.props.putLoginInfo(curLoginServiceAndClinic);
    }
  };

  handleChange = (e) => {
    this.props.resetErrorMsg();
    this.props.updateState(e.target.name, e.target.value);
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.refs.form.submit();
      // this.handleLogin(e);
    }
  }
  handleValidationFormError = () => {
    this.props.resetErrorMsg();
  }

  clientMulIpSet = (serviceAndClinicGp) => {
    if (serviceAndClinicGp) {
      const serviceList = serviceAndClinicGp.clientServiceList || [];
      const siteList = serviceAndClinicGp.clientSiteList || [];
      return serviceList.length === 1 && siteList.length === 1 ? false : true;
    }
    else {
      return false;
    }
  }

  updateServiceClinic = (obj) => {
    this.props.updateLoginForm(obj);
  }

  render() {
    const { classes, loginName, password, serviceAndClinicGp, svcCd, siteId } = this.props;
    const hasMulIpSet = this.clientMulIpSet(serviceAndClinicGp);
    return (
      <Grid container>
        <ValidatorForm
            id="loginForm"
            ref={'form'}
            onSubmit={this.handleLogin}
            onError={this.handleValidationFormError}
            autoComplete="false"
            style={{
            width: '100%',
            marginTop: 5
          }}
        >
          <Grid item container>
            {
              hasMulIpSet ?
                <Grid item container alignItems="center" className={classes.gridMargin20}>
                  <Grid item xs={1}></Grid>
                  <Grid item xs={11}>
                    <ServiceClinicGp
                        id={'logingServiceClinicGp'}
                        serviceAndClinicGp={serviceAndClinicGp}
                        svcCd={svcCd}
                        siteId={siteId}
                        updateServiceClinic={this.updateServiceClinic}
                    />
                  </Grid>
                </Grid>
                : null
            }
            <Grid item container alignItems="center" className={classes.gridMargin20}>
              <Grid item xs={1}><AccountBox /></Grid>
              <Grid item xs={11} container alignItems="center">
                <Grid item xs={6}>
                  <TextFieldValidator
                      fullWidth
                      trim="none"
                      onChange={this.handleChange}
                      onBlur={this.handleChange}
                      value={loginName}
                      name={'loginName'}
                      id={'loginName'}
                      label="Login ID"
                      InputLabelProps={{
                      classes: {
                        root: classes.textLabel,
                        focused: classes.textFocused
                      }
                    }}
                      InputProps={{
                      classes: {
                        root: classes.textOutlinedInput,
                        focused: classes.textFocused,
                        notchedOutline: classes.textNotchedOutline
                      }
                    }}
                      inputProps={{
                      style: textInputStyle,
                      autoComplete: 'new-password'
                    }}
                      msgPosition="bottom"
                      validByBlur={false}
                      validators={[ValidatorEnum.required]}
                      errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                      tabIndex={1}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                      id="btn_signIn"
                      variant="contained"
                      color="primary"
                      size="medium"
                    // onKeyDown={this.handleKeyDown}
                      type="submit"
                      className={classnames(classes.buttonRoot, classes.buttonColor)}
                      style={{ height: '39px', marginLeft: '10px', width: 'calc(100% - 10px)' }}
                      tabIndex={3}
                  >
                    <AccountCircle style={{ marginRight: 8 }} />
                    Sign in
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container alignItems="center" className={classes.gridMargin20}>
              <Grid item xs={1}><Lock /></Grid>
              <Grid item xs={11} container alignItems="center">
                <Grid item xs={6}>
                  <PasswordInput
                      trim="none"
                      onChange={this.handleChange}
                      value={password}
                      name={'password'}
                      id={'password'}
                      label="Password"
                      InputLabelProps={{
                      classes: {
                        root: classes.textLabel,
                        focused: classes.textFocused
                      }
                    }}
                      InputProps={{
                      classes: {
                        root: classes.textOutlinedInput,
                        focused: classes.textFocused,
                        notchedOutline: classes.textNotchedOutline
                      }
                    }}
                      inputProps={{
                      style: textInputStyle,
                      autoComplete: 'new-password'
                    }}
                      msgPosition="bottom"
                      validByBlur={false}
                      validators={[ValidatorEnum.required]}
                      errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                      tabIndex={2}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                      id="btn_forgetPassword"
                      variant="contained"
                      color="primary"
                      size="medium"
                      type="submit"
                      className={classnames(classes.buttonRoot, classes.buttonColor)}
                      component={RouterLink}
                      to="/forgetPassword"
                      style={{ height: '39px', marginLeft: '10px', width: 'calc(100% - 10px)' }}
                      tabIndex={4}
                  >
                    <LockOpen style={{ marginRight: 8 }} />
                    Forgot Password
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {this.props.isLoginSuccess === false && this.props.errorMessage ? (
              <Grid item>
                <Typography className={classes.error_Message} id="loginForm_errorMessage">
                  {this.props.errorMessage}
                </Typography>
              </Grid>
            ) : null}
          </Grid>
        </ValidatorForm>
        {/* <div className={classes.noticeTitle} style={{borderRadius: '16px', padding: '10px'}}>
        <h6 style={{paddingBottom: '5px', color: 'white', fontSize: '16px', margin: '0px'}}>Notice Board</h6>
        <div style={{backgroundColor: 'white', padding: '10px 14px'}}>
          <Notice/>
        </div>
        </div> */}

      </Grid>


    );
  }
}
function mapStateToProps(state) {
  return {
    serviceList: state.common.serviceList,
    clinicList: state.common.clinicList,
    // siteInfo: state.common.siteInfo,
    isLoginSuccess: state.login.isLoginSuccess,
    errorMessage: state.login.errorMessage,
    serviceAndClinicGp: state.login.loginForm.serviceAndClinicGp,
    svcCd: state.login.loginForm.svcCd,
    siteId: state.login.loginForm.siteId,
    loginForm: state.login.loginForm
  };
}
const dispatchProps = {
  doLogin,
  resetErrorMsg,
  resetAll,
  putLoginInfo,
  openCommonMessage,
  updateLoginForm,
  auditAction
};
export default withRouter(connect(mapStateToProps, dispatchProps)(withStyles(style)(LoginForm)));