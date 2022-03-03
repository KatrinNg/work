import { makeStyles } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import * as PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    icon: {
        margin: theme.spacing(1, 0, 0, 3)
    }
}));

const TickCrossComponent = ({ checked }) => {
    const classes = useStyles();

    return (
        <>
            {checked ? (
                <CheckIcon className={classes.icon} color="primary" />
            ) : (
                <ClearIcon className={classes.icon} color="error" />
            )}
        </>
    );
};

TickCrossComponent.propTypes = {
    data: PropTypes.object
};
export default TickCrossComponent;
