import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import makeStyles from '@material-ui/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import EnctDetail from './enctDetail';
import EnctList from './enctList';
import { PAGE_STATUS } from '../../../enums/administration/enctManagement';
import { resetAll } from '../../../store/actions/administration/enctManagement';

const useSytles = makeStyles(theme => ({
    root: {
        height: '100%'
    }
}));

const EnctManagement = (props) => {
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
                    || pageStatus === PAGE_STATUS.NONEDITABLE ? <EnctDetail  /> : <EnctList />
            }
        </Grid>
    );
};

const mapState = (state) => {
    return {
        pageStatus: state.enctManagement.pageStatus
    };
};

const mapDispatch = {
    resetAll
};

export default connect(mapState, mapDispatch)(EnctManagement);