import React from 'react';
import { connect } from 'react-redux';
import makeStyles from '@material-ui/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import UAM from './uaManagement';
import UAINFO from './uaInformation';
import { PAGE_STATUS } from '../../../enums/administration/userAccount';
import { resetAll } from '../../../store/actions/administration/userAccount/userAccountAction';

const useSytles = makeStyles(theme => ({
    root: {
        height: '100%'
    }
}));

const UserAccount = (props) => {
    const classes = useSytles();
    const {
        pageStatus, resetAll //NOSONAR
    } = props;

    React.useEffect(() => {
        resetAll();
    }, []);

    return (
        <Grid className={classes.root}>
            {
                pageStatus === PAGE_STATUS.ADDING
                    || pageStatus === PAGE_STATUS.EDITING
                    || pageStatus === PAGE_STATUS.NONEDITABLE ? <UAINFO /> : <UAM />
            }
        </Grid>
    );
};

const mapState = (state) => {
    return {
        pageStatus: state.userAccount.pageStatus
    };
};

const mapDispatch = {
    resetAll
};

export default connect(mapState, mapDispatch)(UserAccount);