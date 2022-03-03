import React from 'react';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import CancelIcon from '@material-ui/icons/Cancel';
import AssignmentIcon from '@material-ui/icons/Assignment';
import HelpIcon from '@material-ui/icons/Help';
import SignalCellularOffIcon from '@material-ui/icons/SignalCellularOff';
import { amber } from '@material-ui/core/colors';
import Enum from '../../enums/enum';
const SEVERITY_CODE = Enum.SYSTEM_MESSAGE_SEVERITY_CODE;

const variantIcon = {
    [SEVERITY_CODE.DATABASE]: WarningIcon,
    [SEVERITY_CODE.WARNING]: CancelIcon,
    [SEVERITY_CODE.APPLICATION]: AssignmentIcon,
    [SEVERITY_CODE.INFORMATION]: ErrorIcon,
    [SEVERITY_CODE.QUESTION]: HelpIcon,
    [SEVERITY_CODE.NETWORK]: SignalCellularOffIcon
};

const styles = theme => ({
    iconButton: {
        color: '#ffffff'
    },
    icon: {
        verticalAlign: 'middle',
        marginRight: 5
    },
    snackbarContent: {
        backgroundColor: amber[700],
        maxWidth: 270,
        minWidth: 50,
        color: '#ffffff'
    },
    ['snackbarContent_' + SEVERITY_CODE.DATABASE]: {
        backgroundColor: amber[700]
    },
    ['snackbarContent_' + SEVERITY_CODE.WARNING]: {
        backgroundColor: theme.palette.error.dark
    },
    ['snackbarContent_' + SEVERITY_CODE.APPLICATION]: {
        backgroundColor: theme.palette.primary.main
    },
    ['snackbarContent_' + SEVERITY_CODE.INFORMATION]: {
        backgroundColor: theme.palette.primary.main
    },
    ['snackbarContent_' + SEVERITY_CODE.QUESTION]: {
        backgroundColor: amber[700]
    },
    ['snackbarContent_' + SEVERITY_CODE.NETWORK]: {
        backgroundColor: theme.palette.error.dark
    }
});

class CIMSSnackbar extends React.Component {
    handleClose = (e) => {
        this.props.close && this.props.close(e);
    };

    render() {
        const { open, message, severityCode, classes } = this.props;
        const Icon = severityCode ? variantIcon[severityCode] : ErrorIcon;//NOSONAR
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                open={open}
                autoHideDuration={6000}
                onClose={this.handleClose}
            >
                <SnackbarContent
                    className={classNames({
                        [classes['snackbarContent_' + severityCode]]: severityCode,
                        [classes.snackbarContent]: true
                    })}
                    message={
                        <span>
                            <Icon className={classes.icon} />
                            {message}
                        </span>
                    }
                    action={[
                        <IconButton className={classes.iconButton} key="action" onClick={this.handleClose}>
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </Snackbar>
        );
    }
}

export default withStyles(styles)(CIMSSnackbar);