import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import { FormControl, FormLabel } from '@material-ui/core';
import RequiredIcon from './RequiredIcon';

const styles = theme => ({
    errorColor: {},
    disabled: {},
    formLabel: {
        transform: 'translate(14px, -6px) scale(0.75)',
        top: 0,
        left: '-10px',
        position: 'absolute',
        backgroundColor: theme.palette.cimsBackgroundColor,
        paddingLeft: '6px',
        paddingRight: '6px',
        '&$disabled': {
            color: theme.palette.cimsPlaceholderColor,
            borderColor: theme.palette.action.disabled
        },
        '&$errorColor': {
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main
        }
    },
    root: {
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderRadius: '4px',
        display: 'flex',
        paddingLeft: 14,
        paddingRight: 14,
        justifyContent: 'space-around',
        '&$disabled': {
            color: theme.palette.text.disabled,
            borderColor: theme.palette.action.disabled
        },
        '&$errorColor': {
            borderColor: theme.palette.error.main
        }
    },
    disabledColor:{
        background:theme.palette.cimsDisableColor
    }
});

class CIMSFormLabel extends Component {
    render() {
        const { classes, className, error, disabled, FormLabelProps, isRequired, labelText, children, ...rest } = this.props;
        return (
            <FormControl
                {...rest}
                className={
                    classNames({
                        [classes.errorColor]: error,
                        [classes.disabled]: disabled,
                        [classes.root]: true,
                        [classes.disabledColor]:disabled
                    }, className)
                }
            >
                <FormLabel
                    {...FormLabelProps}
                    className={classNames({
                        [classes.errorColor]: error,
                        [classes.disabled]: disabled,
                        [classes.formLabel]: true
                    }, FormLabelProps && FormLabelProps.className)}
                >{labelText}{isRequired ? <RequiredIcon /> : null}</FormLabel>
                {children}
            </FormControl>
        );
    }
}

CIMSFormLabel.propTypes = {
    error: PropTypes.bool,
    disabled: PropTypes.bool,
    isRequired: PropTypes.bool
};

export default withStyles(styles)(CIMSFormLabel);