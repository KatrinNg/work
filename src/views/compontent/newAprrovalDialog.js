import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';

const styles = (theme) => ({
    paper: {
        minWidth: 300,
        maxWidth: '40%',
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
        // borderRadius: theme.palette.shape.borderRadius,
        backgroundColor: theme.palette.dialogBackground,
        padding: '10px 10px 10px 10px',
        borderRadius: 16
    },
    formControl2Css: {
        // backgroundColor: '#ffffff'
        backgroundColor:theme.palette.cimsBackgroundColor
    }
});

class NewAprrovalDialog extends Component {
    render() {
        const {
            classes,
            formControlStyle,
            dialogTitle,
            dialogContentProps,
            children,
            ...rest
        } = this.props;
        return (
            <Dialog
                classes={{
                    paper: classes.paper
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                {...rest}
            >
                <FormControl
                    className={classes.formControlCss}
                    style={formControlStyle}
                >
                    <Typography
                        variant="subtitle2"
                        className={classes.dialogTitle}
                        id={this.props.id + 'Title'}
                    >{dialogTitle}</Typography>
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

export default withStyles(styles)(NewAprrovalDialog);