import React from 'react';
import { connect } from 'react-redux';
import {
    Tabs,
    Tab,
    Typography,
    Grid
} from '@material-ui/core';
import UserProfile from './userProfile/userProfile';
import ChangePassword from './changePassword/changePassword';
import _ from 'lodash';

class UserProfileMaintenance extends React.Component {

    state = {
        tabValue: 0
    }

    componentDidMount() {
        this.props.ensureDidMount();
        if (this.props.location.state) {
            let params = _.cloneDeep(this.props.location.state);
            if (params.isPwdexpired) {
                this.setState({ tabValue: 1 });
            }

        }
    }

    changeTabValue = (event, value) => {
        this.setState({ tabValue: value });
    }

    render() {
        return (
            <Grid style={{maxHeight:'80vh'}}>
                <Tabs
                    value={this.state.tabValue}
                    onChange={this.changeTabValue}
                    indicatorColor={'primary'}
                >
                    {(this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin||this.props.isResetPassword) ? null :
                        <Tab id={'administrationTabUserProfileMaintenance'} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>User Profile Maintenance</Typography>} />
                    }
                    <Tab id={'administrationTabChangePassword'} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Change Password</Typography>} />
                </Tabs>
                <Grid style={{ padding: '0px 10px' }}>
                    {(this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin||this.props.isResetPassword) ? null :
                        <Typography component={'div'} style={{ display: this.state.tabValue === 0 ? 'inline' : 'none' }}>
                            <Grid>
                                <UserProfile />
                            </Grid>
                        </Typography>
                    }
                    <Typography component={'div'} style={{ display: (this.state.tabValue === 1 || (this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin||this.props.isResetPassword)) ? 'inline' : 'none' }}>
                        <Grid>
                            <ChangePassword />
                        </Grid>
                    </Typography>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isTemporaryLogin: state.login.isTemporaryLogin === 'Y',
        isFirstTimeLogin: state.login.isTemporaryLogin === 'F',
        isExpiryLogin: state.login.isTemporaryLogin === 'E',
        isResetPassword:state.login.isTemporaryLogin==='R',
        tabs: state.mainFrame.tabs
    };
};

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileMaintenance);