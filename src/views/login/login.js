import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { useTheme } from '@material-ui/core/styles';
// import cover_EHS from '../../images/loginPage/cover_EHS.jpg';
// import cover_FHS from '../../images/loginPage/cover_FHS.jpg';
// import cover_TBC from '../../images/loginPage/cover_TBC.jpg';
// import cover_THS from '../../images/loginPage/cover_THS.jpg';
// import cover_CAS from '../../images/loginPage/cover_CAS.png';
// import cover_CGS from '../../images/loginPage/cover_CGS.png';
import cover_DH from '../../images/loginPage/cover_DH_v3_revised.png';
// import cover_LOGIN from '../../images/login.png';
import { withTheme, withStyles } from '@material-ui/core/styles';
import LoginForm from './loginForm';
import { Grid, Typography, DialogContent, DialogActions, Button, Grow } from '@material-ui/core';
import { colors } from '@material-ui/core';
import { SupervisedUserCircleRounded } from '@material-ui/icons';
import Notice from './component/notice';
import ImportantNotes from './component/importantNotes';
import ContactUs from './component/contactUs';
import CIMSDialog from '../../components/Dialog/CIMSDialog';
import { preLoadData, updateLoginForm } from '../../store/actions/login/loginAction';
import { batchUpdateState as updateCimsStyle } from '../../store/actions/cimsStyle';
import _ from 'lodash';

// import CIMSAutoComplete from '../../components/AutoComplete/CIMSAutoComplete';

const style = (theme) => ({
  root: {
    alignItems: 'center',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor:theme.palette.cimsBackgroundColor
  },
  inputWidth: {
    width: '100%'
  },
  input: {
    paddingLeft: 10
  },
  container: {
  },
  loginField: {
    paddingRight: 30,
    paddingLeft: 40,
    paddingTop: 10
  },
  noticeField: {
    paddingRight: 40,
    paddingLeft: 30,
    paddingTop: 10
  },
  header: {
    paddingTop: 10
  },
  footer: {
    // position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    zIndex: 999
  },
  themeColor: {
    dark: colors.green[500]
  },
  get noticeTitle() {
    return {
      backgroundColor: this.themeColor.dark
      // backgroundColor: '#5b9bd5'
    };
  },
  noticeContainer:{
    backgroundColor: theme.palette.cimsBackgroundColor,
    padding: '10px 14px'
  },
  hiddenGrid: {
    visibility: 'hidden'
  }
});

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openDialog: false,
      dialogName: '',
      test: []
    };
  }

  componentDidMount() {
    this.props.preLoadData();
    document.getElementsByTagName('html')[0].style.height = '100%';
    document.getElementsByTagName('body')[0].style.height = '100%';
    document.getElementById('root').style.height = '100%';
    document.getElementById('root').style.display = 'flex';
    this.props.updateCimsStyle({ theme: _.cloneDeep(this.props.theme) });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || nextState !== this.state;
  }

  handleUpdateState = (name, value) => {
    this.props.updateLoginForm({ [name]: value });
  }

  handleOpenDialog = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ openDialog: true, dialogName: name });
  }

  handleCloseDialog = () => {
    this.setState({ openDialog: false });
  }
  updateServiceClinic = (data) => {
    this.setState(data);
  }

  render() {
    const { classes, svcCd, siteId, ipInfo } = this.props;
    if (this.props.isLoginSuccess) {
      return <Redirect to={'/index'} />;
    }
    if (this.props.isNeedForceLogin) {
      return <Redirect to={'/forceLogin'} />;
    }
    return (
      <Grid container className={classes.root}>
        <Grid container className={classes.container} justify="center">
          <Grid item container xs={10} spacing={4} className={classes.loginField} style={{ paddingTop: '0px' }}>
            <Grid item xs={6} container justify="center" alignItems="center" style={{ marginBottom: 30 }}>
              {
                (() => {
                  /*let src = '';
                  switch (svcCd && svcCd.toUpperCase()) {
                    case 'THS': src = cover_THS; break;
                    case 'FHS': src = cover_FHS; break;
                    case 'EHS': src = cover_EHS; break;
                    case 'TCS': src = cover_TBC; break;
                    case 'CAS': src = cover_CAS; break;
                    case 'CG': src = cover_CGS; break;
                    case 'SHS': src = cover_LOGIN; break;
                    default: src = cover_DH; break;
                  }*/
                  let src = cover_DH;
                  if (svcCd && siteId) {
                    //return <Grow key={svcCd} in timeout={500}><img src={src} alt="" style={{ width: '100%', maxHeight: 300 }} /></Grow>;
                    return <img src={src} alt="" style={{ width: '100%', maxHeight: 300 }} />;
                  } else {
                    return (
                      <Grow in timeout={2000}>
                        <Grid container alignItems="center" justify="center" direction="column" style={{ marginBottom: 15 }}>
                          <Grid item><SupervisedUserCircleRounded color="primary" style={{ fontSize: 60, width: '12rem', height: '12rem' }} /></Grid>
                          <Grid item><Typography variant="h5">PC have no service or clinic</Typography></Grid>
                        </Grid>
                      </Grow>
                    );
                  }
                })()
              }
            </Grid>
            <Grid item xs={6} container direction="column" justify="center">
              <LoginForm
                  updateState={this.handleUpdateState}
                  loginName={this.props.loginName}
                  password={this.props.password}
              />
            </Grid>
            <Grid item xs={12} container>
              <Grid>
                <div className={classes.noticeTitle} style={{ borderRadius: '16px', padding: '10px' }}>
                  <h6 style={{ paddingBottom: '1px', color: 'white', fontSize: '16px', margin: '0px', textAlign: 'center' }}>Notice Board</h6>
                  <div className={classes.noticeContainer}>
                    <Notice />
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container className={classes.footer} justify="center">
          <Grid item container justify="center">{ipInfo && ipInfo.ipAddr}</Grid>
          <Grid item container justify="center" className={classes.hiddenGrid}>
			<Grid item><Typography>ASL(TeamA+B) : sprint 42-2021/03/17 + JOS version : sprint 44-2021/04/01</Typography></Grid>          </Grid>
          <Grid item container justify="center" alignItems="center">
            <Grid item><Typography>© Department of Health, HKSARG. All rights reserved.</Typography></Grid>
          </Grid>
          <Grid item container justify="center" alignItems="center" spacing={1}>
            <Grid item>
              <Typography component="a" href="" onClick={e => {
                this.handleOpenDialog(e, 'Contact Us');
              }}
              >Contact Us</Typography></Grid>
            <Grid item><Typography>|</Typography></Grid>
            <Grid item><Typography component="a" href="" onClick={e => this.handleOpenDialog(e, 'Important Notes')}>Important Notes</Typography></Grid>
            {/* <Grid item><Typography>|</Typography></Grid>
            <Grid item><Typography component="a" href="" onClick={e => this.handleOpenDialog(e, 'Notice Board')}>Notice Board</Typography></Grid> */}
          </Grid>
        </Grid>
        <CIMSDialog
            id="login_dialog"
            open={this.state.openDialog}
            onClose={this.handleCloseDialog}
            dialogTitle={this.state.dialogName}
        >
          <DialogContent id={'login_dialog_content'}>
            {
              (() => {
                if (this.state.dialogName === 'Contact Us') {
                  return <ContactUs />;
                } else if (this.state.dialogName === 'Important Notes') {
                  return <ImportantNotes />;
                } else if (this.state.dialogName === 'Notice Board') {
                  return <Notice />;
                }
              })()
            }
          </DialogContent>
          <DialogActions className={classes.dialogAction}>
            <Button
                id="login_dialog_closebtn"
                variant="contained"
                color="primary"
                size="small"
                style={{ textTransform: 'none' }}
                onClick={this.handleCloseDialog}
            >Close</Button>
          </DialogActions>
        </CIMSDialog>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    clinicList: state.common.clinicList,
    isLoginSuccess: state.login.isLoginSuccess,
    loginInfo: state.login.loginInfo,
    serviceList: state.common.serviceList,
    svcCd: state.login.loginForm.svcCd,
    siteId: state.login.loginForm.siteId,
    ipInfo: state.login.loginForm.ipInfo,
    loginName: state.login.loginForm.loginName,
    password: state.login.loginForm.password,
    isNeedForceLogin: state.login.isNeedForceLogin
  };
}
const dispatchProps = {
  preLoadData,
  updateLoginForm,
  updateCimsStyle
};
export default withRouter(connect(mapStateToProps, dispatchProps)(withTheme(withStyles(style)(Login))));
