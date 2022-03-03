import React from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid
} from '@material-ui/core';
import cover_DH from '../../images/loginPage/cover_DH_v3_revised.png';
import CIMSButton from '../../components/Buttons/CIMSButton';
import {
    doLogin,
    putLoginInfo,
    updateState
} from '../../store/actions/login/loginAction';
import { getCurLoginServiceAndClinic } from './loginForm';
import { auditAction } from '../../store/actions/als/logAction';

const styles = () => ({
    root: {
        width: '100%',
        display: 'block',
        justifyContent: 'center',
        marginTop: 56
    },
    cmpMargin: {
        marginTop: 60
    }
});

class ForceLogin extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.updateState({ isNeedForceLogin: false });
    }

    handleForceLogin = (e) => {
        e.preventDefault();
        const { clinicList, serviceList } = this.props;
        const { svcCd, siteId, loginName, password } = this.props.loginForm;
        const currentSiteDetail = clinicList.find((item) => item.siteId === siteId);
        const ecsLocCode = currentSiteDetail.ecsLocCd || '';
        const params = {
            serviceCode: svcCd,
            clinicCode: currentSiteDetail.siteCd,
            siteId: siteId,
            ecsLocCode: ecsLocCode,
            loginName: loginName,
            password: password,
            forceLogin: 1
        };
        let curLoginServiceAndClinic = getCurLoginServiceAndClinic(svcCd, siteId, serviceList, clinicList);
        this.props.auditAction('Force Login', 'Force Login', null, true, 'user');
        this.props.doLogin(params);
        this.props.putLoginInfo(curLoginServiceAndClinic);
    };

    handleCancel = () => {
        let hostName = '';
        const url = window.location.href;
        hostName = url.split('/')[0];
        window.location.href = hostName + '//' + window.location.host;
    };

    render() {
        const { classes } = this.props;
        if (this.props.isLoginSuccess) {
            return <Redirect to={'/index'} />;
        }
        return (
            <Grid container className={classes.root}>
                <Grid item container justify={'center'}>
                    <img src={cover_DH} alt="" style={{ maxHeight: 300, height: '100%' }} />
                </Grid>
                <Grid item container justify={'center'} className={classes.cmpMargin}>
                    <h3 style={{ maxWidth: 750 }}>
                        The system detected an active session at same/another CIMS work station. You are advised to log out of your previous session to avoid losing any unsaved data.
                    </h3>
                </Grid>
                <Grid item container justify={'center'}>
                    <h3 style={{ color: 'red', maxWidth: 750 }}>
                        When you log in at this CIMS work station, your previous session will automatically become obsolete and any new content entered there would not be saved.
                    </h3>
                </Grid>
                <Grid item container justify={'center'} className={classes.cmpMargin}>
                    <Grid item container style={{ maxWidth: 760 }}>
                        <Grid item container xs={8} justify={'flex-end'}>
                            <CIMSButton
                                id={'force_login_button'}
                                children={'I understood and wanted to proceed with logging in here '}
                                onClick={this.handleForceLogin}
                            />
                        </Grid>
                        <Grid item container xs={4}>
                            <CIMSButton
                                id={'cancel_button'}
                                children={'Cancel'}
                                onClick={this.handleCancel}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}


const mapState = (state) => {
    return {
        loginForm: state.login.loginForm,
        loginInfo: state.login.loginInfo,
        clinic: state.login.clinic,
        serviceList: state.common.serviceList,
        clinicList: state.common.clinicList,
        isLoginSuccess: state.login.isLoginSuccess
    };
};

const dispatch = {
    doLogin,
    putLoginInfo,
    updateState,
    auditAction
};

export default withRouter(connect(mapState, dispatch)(withStyles(styles)(ForceLogin)));