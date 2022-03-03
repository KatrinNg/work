import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import {
    AppBar,
    Grid,
    Toolbar,
    IconButton,
    Typography,
    Avatar,
    Tooltip,
    Popover,
    Popper,
    Fade,
    Paper
} from '@material-ui/core';
import { logout, refreshToken } from '../../store/actions/login/loginAction';
import MenuBarButton from './menuBarButton';
import Logoffgif from '../../images/menu/logoff2.gif';
import CIMSAlertDialog from '../../components/Dialog/CIMSAlertDialog';
import { deleteTabs, deleteSubTabs, changeTabsActive } from '../../store/actions/mainFrame/mainFrameAction';
import { updatePatientListField } from '../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import * as CommonUtil from '../../utilities/commonUtilities';
// import CircularProgress from '@material-ui/core/CircularProgress';
import doCloseFuncSrc from '../../constants/doCloseFuncSrc';
import { updateField } from '../../store/actions/mainFrame/mainFrameAction';
import CIMSLightToolTip from '../../components/ToolTip/CIMSLightToolTip';

const styles = theme => ({
    appbarRoot: {
        borderBottom: '1px solid #dcdcdc',
        // backgroundColor: '#fff',
        background:theme.palette.cimsBackgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 1000,
        position: 'unset'
    },
    toolbarRoot: {
        minHeight: 46
    },
    loginMessageRoot: {
        lineHeight: 1.3,
        fontWeight: 400,
        color: theme.palette.primary.main,
        fontSize: 'small',
        width: '100%',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        textAlign: 'end'
    },
    logoutAvatar: {
        width: 20,
        height: 20,
        borderRadius: '5%'
    },
    overFlowText: {
        overflow: 'hidden'
    },
    customToolTip: {
        fontSize: 16,
        position: 'absolute',
        width: 230,
        top: 15
        //left: 150
    },
    popperRoot: {
        padding: '6px 8px',
        maxWidth: 500,
        position: 'absolute',
        top: 20,
        width: 260
    },
    dtsSpecLoginInfo:{
        whiteSpace: 'pre-line',
        wordBreak:'break-word'
    },
    dtsSpecLoginInfoTitleDiv:{
        float:'left'
    }
});


class MenuBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            timer: null,
            showDialog: false,
            anchorEl: null,
            openLonInInfo: false
        };
    }

    componentWillUnmount() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        if (this.state.timeOut) {
            clearInterval(this.state.timeOut);
        }
    }

    handleLogout = () => {
        const { tabs, subTabs, deleteTabs, deleteSubTabs, changeTabsActive } = this.props;//NOSONAR
        let tabList = _.concat(tabs, subTabs);
        let delFunc = (deep, name) => {
            if (parseInt(deep) === 2) {
                deleteSubTabs(name);
            } else if (parseInt(deep) === 1) {
                deleteTabs(name);
            }
        };
        this.props.updateField({
            curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_LOGOUT
        });
        CommonUtil.closeAllTabs(tabList, delFunc, changeTabsActive, doCloseFuncSrc.CLOSE_BY_LOGOUT).then(result => {
            if (result) {
                this.props.logout();
                this.props.updatePatientListField({ isFocusSearchInput: true });
            }
            this.props.updateField({
                curCloseTabMethodType: doCloseFuncSrc.null
            });
        });
    }

    handleLoginNameMouseIn = (e) => {
        const { service } = this.props;
        if (service.svcCd === 'DTS') {
            e && e.stopPropagation ? e.stopPropagation() : window.event.cancelBubble = true;
            this.setState({ anchorEl: e.currentTarget, openLonInInfo: true });
        }
    }

    handleLoginNameMouseOut = () => {
        const { service } = this.props;
        if (service.svcCd === 'DTS') {
            this.setState({ anchorEl: null, openLonInInfo: false });
        }
    }


    render() {
        const { classes,loginInfo,service/*,spaLoaded ?*/ } = this.props;
        return (
            <Grid container>
                {/* <AppBar className={classes.appbarRoot} elevation={2} style={{background:'yellow'}}> */}
                <AppBar className={classes.appbarRoot} elevation={2} >
                    <Grid item container>
                        {
                            (this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin||this.props.isResetPassword) ? null :
                                /*spaLoaded ?*/ <Toolbar className={classes.toolbarRoot} >
                                    {this.props.menuList && this.props.menuList.map((item, index) => (
                                        <MenuBarButton
                                            key={index}
                                            icon={item.icon}
                                            label={item.label}
                                            name={item.name}
                                            childMenu={item.child}
                                            menuData={item}
                                        />
                                    ))}
                                </Toolbar>/* :
                                    <Grid item container justify={'center'} alignItems="center"><CircularProgress size={24} /></Grid>*/
                        }

                    </Grid>
                    {/* <Grid item container alignItems="flex-end" justify="center" direction="column" className={classes.overFlowText}>
                        <Grid container id={'menu_bar_developEnvironment'}>
                            <Typography style={{ fontSize: '2rem', fontWeight: 'bolder', color: 'red', textAlign: 'end', width: '100%' }}>{'開 發 環 境'}</Typography>
                        </Grid>
                    </Grid> */}
                    <Grid item container alignItems="flex-end" justify="center" direction="column" className={classes.overFlowText}>
                        <Grid container id={'menu_bar_login_name'} style={{justifyContent:'flex-end'}}>
                            <Grid style={{ width: 260 }}>
                                <Typography
                                    className={classes.loginMessageRoot}
                                    onMouseEnter={this.handleLoginNameMouseIn}
                                    onMouseLeave={this.handleLoginNameMouseOut}
                                    title={service.svcCd === 'DTS' ? null : `User: ${this.props.loginName}`}
                                >
                                    {this.props.loginName}
                                </Typography>
                            </Grid>
                            {
                                service.svcCd === 'DTS' ?
                                    <Popper open={this.state.openLonInInfo} placement="bottom-start" anchorEl={this.state.anchorEl} transition style={{ zIndex: 1200 }}>
                                        {({ TransitionProps }) => {
                                            return (
                                                <Fade {...TransitionProps} timeout={350}>
                                                    <Paper className={classes.popperRoot}>
                                                        <Grid item container>
                                                            <Grid item xs={12} className={classes.dtsSpecLoginInfo}><div className={classes.dtsSpecLoginInfoTitleDiv}><b>Staff ID:</b></div><div>&nbsp;{loginInfo.userDto.staffId || 'N'}</div></Grid>
                                                            <Grid item xs={12} className={classes.dtsSpecLoginInfo}><div className={classes.dtsSpecLoginInfoTitleDiv}><b>ECS Account:</b></div><div>&nbsp;{loginInfo.userDto.ecsUserId || 'N'}</div></Grid>
                                                            <Grid item xs={12} className={classes.dtsSpecLoginInfo}><div className={classes.dtsSpecLoginInfoTitleDiv}><b>With eHRSS Account:</b></div><div>&nbsp;{loginInfo.userDto.ehrId || 'N'}</div></Grid>
                                                        </Grid>
                                                    </Paper>
                                                </Fade>
                                            );
                                        }}
                                    </Popper>
                                    : null
                            }
                        </Grid>
                        <Grid container id={'menu_bar_login_time'}>
                            <Typography className={classes.loginMessageRoot} variant="body1" title={`Login Time: ${this.props.loginTime}`}>{this.props.loginTime}</Typography>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <IconButton
                            id={'menuBarLogoutButton'}
                            color="primary"
                            onClick={this.handleLogout}
                            title="Logout"
                            tabIndex={-1}
                        >
                            <Avatar src={Logoffgif} className={classes.logoutAvatar} />
                        </IconButton>
                    </Grid>
                </AppBar>
                <CIMSAlertDialog
                    id="timeout-dialog"
                    dialogStyle={{ backgroundColor: '#fff' }}
                    open={this.state.showDialog}
                    onClickOK={this.handleLogout}
                    onClose={this.handleLogout}
                    okButtonName={'Close'}
                    dialogTitle="Session Timeout"
                    dialogContentTitle={'Your session expired. Please login again.'}
                />
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loginName: state.login.loginInfo.loginName,
        loginTime: state.login.loginInfo.loginTime,
        expiryTime: state.login.loginInfo.expiryTime,
        menuList: state.login.menuList,
        tabs: state.mainFrame.tabs,
        subTabs: state.mainFrame.subTabs,
        isTemporaryLogin: state.login.isTemporaryLogin === 'Y',
        isFirstTimeLogin: state.login.isTemporaryLogin === 'F',
        isExpiryLogin: state.login.isTemporaryLogin === 'E',
        isResetPassword:state.login.isTemporaryLogin==='R',
        loginInfo: state.login.loginInfo,
        service: state.login.service
    };
};

const dispatchToProps = {
    refreshToken,
    logout,
    deleteTabs, deleteSubTabs, changeTabsActive,
    updatePatientListField,
    updateField
};

export default withRouter(connect(mapStateToProps, dispatchToProps)(withStyles(styles)(MenuBar)));