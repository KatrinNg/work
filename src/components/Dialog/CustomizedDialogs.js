/* eslint-disable react/jsx-boolean-value */
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme) => ({
    paper: {
        overflowY: 'unset',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    dialogTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5
    },
    formControlCss: {
        backgroundColor: theme.palette.dialogBackground,
        padding: '10px 10px 10px 10px',
        borderRadius: 16
    },
    formControl2Css: {
        backgroundColor: theme.palette.cimsBackgroundColor
    }
});

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, id } = props;
    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Typography variant="subtitle2" className={classes.dialogTitle} id={id + 'Title'}>
                {children}
            </Typography>
            {onClose ? (
                <IconButton
                    size={'small'}
                    id={id + '_btnCloseDialog'}
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </div>
    );
});

class CustomizedDialogs extends Component {
    render() {
        const { classes, formControlStyle, dialogTitle, dialogContentProps, children, onCloseIcon, id, ...rest } =
            this.props;
        return (
            <Dialog
                classes={{
                    paper: classes.paper
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                disableBackdropClick
                disableEscapeKeyDown
                {...rest}
            >
                <FormControl className={classes.formControlCss} style={formControlStyle}>
                    <DialogTitle id={id + '_dialogTitle'} onClose={onCloseIcon}>
                        {dialogTitle}
                    </DialogTitle>
                    <FormControl
                        {...dialogContentProps}
                        className={`${classes.formControl2Css} ${dialogContentProps && dialogContentProps.className}`}
                    >
                        {children}
                    </FormControl>
                </FormControl>
            </Dialog>
        );
    }
}

export default withStyles(styles)(CustomizedDialogs);
