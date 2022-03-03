import { makeStyles } from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import * as PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    icon: {
        margin: theme.spacing(1, 0, 0, 3)
    }
}));

const CheckboxComponent = ({ checked }) => {
    const classes = useStyles();

    return (
        <>
            {checked ? (
                <CheckBoxIcon className={classes.icon} color="primary" />
            ) : (
                <CheckBoxOutlineBlankIcon className={classes.icon} />
            )}
        </>
    );
};

CheckboxComponent.propTypes = {
    data: PropTypes.object
};
export default CheckboxComponent;
