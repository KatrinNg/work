import React from 'react';
import { connect } from 'react-redux';
import makeStyles from '@material-ui/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import { PAGE_STATUS } from '../../../enums/administration/userRole';
import { resetAll } from '../../../store/actions/administration/userRole';
import URList from './urList';
import URDetail from './urDetail';

const useSytles = makeStyles(theme => ({
    root: {
        height: '100%'
    }
}));

const UserRole = (props) => {
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
                pageStatus === PAGE_STATUS.ADDING || pageStatus === PAGE_STATUS.EDITING ? <URDetail /> : <URList />
            }
        </Grid>
    );
};

const mapState = (state) => {
    return {
        pageStatus: state.userRole.pageStatus
    };
};

const mapDispatch = {
    resetAll
};

export default connect(mapState, mapDispatch)(UserRole);